import {
  Building2,
  Copy,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Send,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import AnimatedPage from "../../components/AnimatedPage";
import PremiumCard from "../../components/PremiumCard";
import api from "../../utils/api";

const emptyCompanyForm = {
  name: "",
  email: "",
  phone: "",
  address: "",
  gstNumber: "",
};

const emptyInviteForm = {
  companyId: "",
  invitedName: "",
  invitedEmail: "",
  invitedPhone: "",
  role: "member",
};

const formatDateTime = (value) => {
  if (!value) return "-";

  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const statusClass = (status) => {
  if (status === "active" || status === "accepted") {
    return "bg-emerald-400/10 text-emerald-300";
  }

  if (status === "pending") {
    return "bg-yellow-300/10 text-yellow-200";
  }

  if (status === "blocked" || status === "expired" || status === "cancelled") {
    return "bg-red-500/10 text-red-300";
  }

  return "bg-white/10 text-white";
};

export default function AdminCompanies() {
  const [companies, setCompanies] = useState([]);
  const [invites, setInvites] = useState([]);

  const [companyForm, setCompanyForm] = useState(emptyCompanyForm);
  const [inviteForm, setInviteForm] = useState(emptyInviteForm);

  const [loading, setLoading] = useState(true);
  const [savingCompany, setSavingCompany] = useState(false);
  const [savingInvite, setSavingInvite] = useState(false);

  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");
  const [lastInviteLink, setLastInviteLink] = useState("");

  const fetchCompaniesData = async () => {
    try {
      setLoading(true);
      setMessage("");

      const [companiesRes, invitesRes] = await Promise.all([
        api.get("/companies"),
        api.get("/companies/invites/all"),
      ]);

      const companiesData = companiesRes.data.companies || [];
      const invitesData = invitesRes.data.invites || [];

      setCompanies(companiesData);
      setInvites(invitesData);

      setInviteForm((prev) => ({
        ...prev,
        companyId: prev.companyId || companiesData[0]?._id || "",
      }));
    } catch (error) {
      setMessage(
        error?.response?.data?.message || "Failed to load companies."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompaniesData();
  }, []);

  const handleCreateCompany = async (e) => {
    e.preventDefault();

    try {
      setSavingCompany(true);
      setMessage("");
      setSuccess("");
      setLastInviteLink("");

      if (!companyForm.name) {
        setMessage("Company name is required.");
        return;
      }

      const response = await api.post("/companies", companyForm);

      setSuccess(response.data.message || "Company created successfully.");
      setCompanyForm(emptyCompanyForm);

      await fetchCompaniesData();
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to create company.");
    } finally {
      setSavingCompany(false);
    }
  };

  const handleCreateInvite = async (e) => {
    e.preventDefault();

    try {
      setSavingInvite(true);
      setMessage("");
      setSuccess("");
      setLastInviteLink("");

      if (!inviteForm.companyId || !inviteForm.invitedEmail) {
        setMessage("Company and invited email are required.");
        return;
      }

      const response = await api.post("/companies/invites", inviteForm);

      setSuccess(response.data.message || "Invite created successfully.");
      setLastInviteLink(response.data.inviteLink || "");

      setInviteForm((prev) => ({
        ...emptyInviteForm,
        companyId: prev.companyId,
      }));

      await fetchCompaniesData();
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to create invite.");
    } finally {
      setSavingInvite(false);
    }
  };

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setSuccess("Invite link copied.");
    } catch {
      setMessage("Could not copy link. Please copy manually.");
    }
  };

  if (loading) {
    return (
      <AnimatedPage>
        <div className="flex min-h-[60vh] items-center justify-center text-slate-300">
          <Loader2 className="mr-3 h-6 w-6 animate-spin text-yellow-200" />
          Loading companies...
        </div>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage>
      <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-3xl font-black text-white">
            Company & Member Invites
          </h1>
          <p className="mt-2 text-slate-400">
            Create companies, invite members, and track invitation status.
          </p>
        </div>

        <button
          onClick={fetchCompaniesData}
          className="flex w-fit items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white hover:bg-white/10"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {message && (
        <div className="mb-5 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-300">
          {message}
        </div>
      )}

      {success && (
        <div className="mb-5 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">
          {success}
        </div>
      )}

      {lastInviteLink && (
        <div className="mb-5 rounded-2xl border border-yellow-300/20 bg-yellow-300/10 p-4">
          <p className="text-sm font-bold text-yellow-200">
            New invite link:
          </p>
          <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-center">
            <a
              href={lastInviteLink}
              target="_blank"
              rel="noreferrer"
              className="flex-1 break-all text-sm text-white underline"
            >
              {lastInviteLink}
            </a>

            <button
              onClick={() => copyText(lastInviteLink)}
              className="flex w-fit items-center gap-2 rounded-2xl bg-yellow-300 px-4 py-3 text-sm font-black text-black"
            >
              <Copy className="h-4 w-4" />
              Copy
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-3">
        <PremiumCard>
          <Building2 className="mb-4 h-8 w-8 text-yellow-200" />
          <p className="text-sm text-slate-400">Companies</p>
          <h2 className="mt-2 text-3xl font-black text-white">
            {companies.length}
          </h2>
        </PremiumCard>

        <PremiumCard>
          <Send className="mb-4 h-8 w-8 text-yellow-200" />
          <p className="text-sm text-slate-400">Invites</p>
          <h2 className="mt-2 text-3xl font-black text-white">
            {invites.length}
          </h2>
        </PremiumCard>

        <PremiumCard>
          <Users className="mb-4 h-8 w-8 text-emerald-300" />
          <p className="text-sm text-slate-400">Accepted Invites</p>
          <h2 className="mt-2 text-3xl font-black text-white">
            {invites.filter((invite) => invite.status === "accepted").length}
          </h2>
        </PremiumCard>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <PremiumCard>
          <div className="mb-5 flex items-center gap-3">
            <Plus className="h-6 w-6 text-yellow-200" />
            <h2 className="text-xl font-black text-white">Create Company</h2>
          </div>

          <form onSubmit={handleCreateCompany} className="space-y-4">
            <input
              value={companyForm.name}
              onChange={(e) =>
                setCompanyForm((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Company name"
              className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-4 text-white outline-none placeholder:text-slate-500"
            />

            <input
              value={companyForm.email}
              onChange={(e) =>
                setCompanyForm((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder="Company email"
              className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-4 text-white outline-none placeholder:text-slate-500"
            />

            <input
              value={companyForm.phone}
              onChange={(e) =>
                setCompanyForm((prev) => ({ ...prev, phone: e.target.value }))
              }
              placeholder="Company phone"
              className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-4 text-white outline-none placeholder:text-slate-500"
            />

            <input
              value={companyForm.gstNumber}
              onChange={(e) =>
                setCompanyForm((prev) => ({
                  ...prev,
                  gstNumber: e.target.value,
                }))
              }
              placeholder="GST number optional"
              className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-4 text-white outline-none placeholder:text-slate-500"
            />

            <textarea
              value={companyForm.address}
              onChange={(e) =>
                setCompanyForm((prev) => ({
                  ...prev,
                  address: e.target.value,
                }))
              }
              placeholder="Company address"
              className="h-24 w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-4 text-white outline-none placeholder:text-slate-500"
            />

            <button
              type="submit"
              disabled={savingCompany}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-yellow-300 px-5 py-4 font-black text-black disabled:opacity-60"
            >
              {savingCompany ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Save className="h-5 w-5" />
              )}
              {savingCompany ? "Saving..." : "Create Company"}
            </button>
          </form>
        </PremiumCard>

        <PremiumCard>
          <div className="mb-5 flex items-center gap-3">
            <Send className="h-6 w-6 text-yellow-200" />
            <h2 className="text-xl font-black text-white">Invite Member</h2>
          </div>

          <form onSubmit={handleCreateInvite} className="space-y-4">
            <select
              value={inviteForm.companyId}
              onChange={(e) =>
                setInviteForm((prev) => ({
                  ...prev,
                  companyId: e.target.value,
                }))
              }
              className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-4 text-white outline-none"
            >
              <option value="">Select company</option>
              {companies.map((company) => (
                <option key={company._id} value={company._id}>
                  {company.name}
                </option>
              ))}
            </select>

            <input
              value={inviteForm.invitedName}
              onChange={(e) =>
                setInviteForm((prev) => ({
                  ...prev,
                  invitedName: e.target.value,
                }))
              }
              placeholder="Invited member name optional"
              className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-4 text-white outline-none placeholder:text-slate-500"
            />

            <input
              value={inviteForm.invitedEmail}
              onChange={(e) =>
                setInviteForm((prev) => ({
                  ...prev,
                  invitedEmail: e.target.value,
                }))
              }
              placeholder="Invited member email"
              className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-4 text-white outline-none placeholder:text-slate-500"
            />

            <input
              value={inviteForm.invitedPhone}
              onChange={(e) =>
                setInviteForm((prev) => ({
                  ...prev,
                  invitedPhone: e.target.value,
                }))
              }
              placeholder="Invited member phone optional"
              className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-4 text-white outline-none placeholder:text-slate-500"
            />

            <select
              value={inviteForm.role}
              onChange={(e) =>
                setInviteForm((prev) => ({ ...prev, role: e.target.value }))
              }
              className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-4 text-white outline-none"
            >
              <option value="member">Standard Member</option>
              <option value="cabin_admin">Cabin Admin</option>
            </select>

            <button
              type="submit"
              disabled={savingInvite}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-yellow-300 px-5 py-4 font-black text-black disabled:opacity-60"
            >
              {savingInvite ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
              {savingInvite ? "Creating Invite..." : "Create Invite Link"}
            </button>
          </form>
        </PremiumCard>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <PremiumCard>
          <h2 className="mb-5 text-xl font-black text-white">
            Companies List
          </h2>

          {companies.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-slate-400">
              No companies found.
            </div>
          ) : (
            <div className="space-y-4">
              {companies.map((company) => (
                <div
                  key={company._id}
                  className="rounded-3xl border border-white/10 bg-white/5 p-5"
                >
                  <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                    <div>
                      <h3 className="text-lg font-black text-white">
                        {company.name}
                      </h3>
                      <p className="mt-1 text-sm text-slate-400">
                        {company.email || "No email"} •{" "}
                        {company.phone || "No phone"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        GST: {company.gstNumber || "-"} • Created{" "}
                        {formatDateTime(company.createdAt)}
                      </p>
                    </div>

                    <span
                      className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${statusClass(
                        company.status
                      )}`}
                    >
                      {company.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </PremiumCard>

        <PremiumCard>
          <h2 className="mb-5 text-xl font-black text-white">
            Invite History
          </h2>

          {invites.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-slate-400">
              No invites found.
            </div>
          ) : (
            <div className="space-y-4">
              {invites.map((invite) => {
                const inviteLink = `${window.location.origin}/register?invite=${invite.token}`;

                return (
                  <div
                    key={invite._id}
                    className="rounded-3xl border border-white/10 bg-white/5 p-5"
                  >
                    <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                      <div>
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(
                              invite.status
                            )}`}
                          >
                            {invite.status}
                          </span>

                          <span className="rounded-full bg-yellow-300/10 px-3 py-1 text-xs font-bold text-yellow-200">
                            {invite.role}
                          </span>
                        </div>

                        <h3 className="text-lg font-black text-white">
                          {invite.invitedEmail}
                        </h3>

                        <p className="mt-1 text-sm text-slate-400">
                          Company: {invite.companyId?.name || "-"}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Expires: {formatDateTime(invite.expiresAt)}
                        </p>

                        {invite.status === "pending" && (
                          <button
                            onClick={() => copyText(inviteLink)}
                            className="mt-3 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white hover:bg-white/10"
                          >
                            <Copy className="h-4 w-4" />
                            Copy Invite Link
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </PremiumCard>
      </div>
    </AnimatedPage>
  );
}