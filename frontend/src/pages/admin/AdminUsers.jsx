import {
  CheckCircle2,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCheck,
  UserCog,
  UserX,
  Users,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import AnimatedPage from "../../components/AnimatedPage";
import PremiumCard from "../../components/PremiumCard";
import api from "../../utils/api";

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
  if (status === "active" || status === "approved")
    return "bg-emerald-400/10 text-emerald-300";
  if (status === "blocked" || status === "rejected")
    return "bg-red-500/10 text-red-300";
  return "bg-yellow-300/10 text-yellow-200";
};

const roleClass = (role) => {
  if (role === "admin" || role === "cabin_admin") {
    return "bg-purple-400/10 text-purple-300";
  }

  return "bg-yellow-300/10 text-yellow-200";
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await api.get("/admin/users");
      setUsers(response.data.users || []);
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const stats = {
    total: users.length,
    members: users.filter((user) => user.role === "member").length,
    admins: users.filter((user) =>
      ["admin", "cabin_admin"].includes(user.role)
    ).length,
    active: users.filter((user) => user.status === "active").length,
    blocked: users.filter((user) => user.status === "blocked").length,
    approvedMembers: users.filter(
      (user) => user.membershipStatus === "approved"
    ).length,
  };

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesStatus =
        statusFilter === "all" ||
        user.status === statusFilter ||
        user.membershipStatus === statusFilter;

      const text = [
        user.name,
        user.email,
        user.phone,
        user.companyName,
        user.role,
        user.status,
        user.membershipStatus,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = !term || text.includes(term);

      return matchesRole && matchesStatus && matchesSearch;
    });
  }, [users, search, roleFilter, statusFilter]);

  const updateUser = async (userId, payload) => {
    try {
      setActionLoadingId(userId);
      setMessage("");
      setSuccess("");

      const response = await api.patch(`/admin/users/${userId}`, payload);

      setSuccess(response.data.message || "User updated successfully.");
      await fetchUsers();
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to update user.");
    } finally {
      setActionLoadingId("");
    }
  };

  const approveMember = async (userId) => {
    try {
      setActionLoadingId(userId);
      setMessage("");
      setSuccess("");

      const response = await api.post("/companies/members/approve", {
        userId,
      });

      setSuccess(response.data.message || "Company member approved.");
      await fetchUsers();
    } catch (error) {
      setMessage(
        error?.response?.data?.message || "Failed to approve company member."
      );
    } finally {
      setActionLoadingId("");
    }
  };

  const rejectMember = async (userId) => {
    const confirmed = window.confirm("Reject this company member?");
    if (!confirmed) return;

    try {
      setActionLoadingId(userId);
      setMessage("");
      setSuccess("");

      const response = await api.post("/companies/members/reject", {
        userId,
      });

      setSuccess(response.data.message || "Company member rejected.");
      await fetchUsers();
    } catch (error) {
      setMessage(
        error?.response?.data?.message || "Failed to reject company member."
      );
    } finally {
      setActionLoadingId("");
    }
  };

  if (loading) {
    return (
      <AnimatedPage>
        <div className="flex min-h-[60vh] items-center justify-center text-slate-300">
          <Loader2 className="mr-3 h-6 w-6 animate-spin text-yellow-200" />
          Loading users...
        </div>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage>
      <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-3xl font-black text-white">User Management</h1>
          <p className="mt-2 text-slate-400">
            View registered users, update role/status, and approve company
            members.
          </p>
        </div>

        <button
          onClick={fetchUsers}
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

      <div className="grid gap-5 md:grid-cols-6">
        <PremiumCard>
          <Users className="mb-4 h-7 w-7 text-yellow-200" />
          <p className="text-xs text-slate-400">Total</p>
          <h2 className="mt-2 text-2xl font-black text-white">
            {stats.total}
          </h2>
        </PremiumCard>

        <PremiumCard>
          <UserCheck className="mb-4 h-7 w-7 text-emerald-300" />
          <p className="text-xs text-slate-400">Members</p>
          <h2 className="mt-2 text-2xl font-black text-white">
            {stats.members}
          </h2>
        </PremiumCard>

        <PremiumCard>
          <ShieldCheck className="mb-4 h-7 w-7 text-purple-300" />
          <p className="text-xs text-slate-400">Admins</p>
          <h2 className="mt-2 text-2xl font-black text-white">
            {stats.admins}
          </h2>
        </PremiumCard>

        <PremiumCard>
          <UserCog className="mb-4 h-7 w-7 text-yellow-200" />
          <p className="text-xs text-slate-400">Active</p>
          <h2 className="mt-2 text-2xl font-black text-white">
            {stats.active}
          </h2>
        </PremiumCard>

        <PremiumCard>
          <CheckCircle2 className="mb-4 h-7 w-7 text-emerald-300" />
          <p className="text-xs text-slate-400">Approved</p>
          <h2 className="mt-2 text-2xl font-black text-white">
            {stats.approvedMembers}
          </h2>
        </PremiumCard>

        <PremiumCard>
          <UserX className="mb-4 h-7 w-7 text-red-300" />
          <p className="text-xs text-slate-400">Blocked</p>
          <h2 className="mt-2 text-2xl font-black text-white">
            {stats.blocked}
          </h2>
        </PremiumCard>
      </div>

      <PremiumCard className="mt-6">
        <div className="mb-5 grid gap-4 lg:grid-cols-[1fr_auto_auto]">
          <div className="relative">
            <Search className="absolute left-4 top-4 h-5 w-5 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users by name, email, phone, company..."
              className="w-full rounded-2xl border border-white/10 bg-black/50 py-4 pl-12 pr-4 text-white outline-none placeholder:text-slate-500"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-2xl border border-white/10 bg-black/60 px-5 py-4 text-white outline-none"
          >
            <option value="all">All Roles</option>
            <option value="member">Member</option>
            <option value="guest">Guest</option>
            <option value="cabin_admin">Cabin Admin</option>
            <option value="admin">Admin</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-2xl border border-white/10 bg-black/60 px-5 py-4 text-white outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-slate-400">
            No users found.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div
                key={user.id || user._id}
                className="rounded-3xl border border-white/10 bg-white/5 p-5"
              >
                <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${roleClass(
                          user.role
                        )}`}
                      >
                        {user.role}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(
                          user.status
                        )}`}
                      >
                        Account: {user.status}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(
                          user.membershipStatus
                        )}`}
                      >
                        Membership: {user.membershipStatus || "none"}
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-white">
                      {user.name}
                    </h3>

                    <p className="mt-1 text-sm text-slate-400">
                      {user.email} • {user.phone || "No phone"}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Company: {user.companyName || "Not added"} • Joined:{" "}
                      {formatDateTime(user.createdAt)}
                    </p>

                    <p className="mt-2 text-xs text-slate-500">
                      Email Verified: {user.isEmailVerified ? "Yes" : "No"} •
                      Phone Verified: {user.isPhoneVerified ? "Yes" : "No"} •
                      KYC: {user.kycStatus || "pending"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {user.companyName &&
                      user.membershipStatus !== "approved" && (
                        <button
                          disabled={actionLoadingId === (user.id || user._id)}
                          onClick={() => approveMember(user.id || user._id)}
                          className="rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-50"
                        >
                          Approve
                        </button>
                      )}

                    {user.companyName &&
                      user.membershipStatus !== "rejected" && (
                        <button
                          disabled={actionLoadingId === (user.id || user._id)}
                          onClick={() => rejectMember(user.id || user._id)}
                          className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300 hover:bg-red-500/20 disabled:opacity-50"
                        >
                          <XCircle className="mr-1 inline h-4 w-4" />
                          Reject
                        </button>
                      )}

                    <select
                      disabled={actionLoadingId === (user.id || user._id)}
                      value={user.status}
                      onChange={(e) =>
                        updateUser(user.id || user._id, {
                          status: e.target.value,
                        })
                      }
                      className="rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white outline-none"
                    >
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="blocked">Blocked</option>
                    </select>

                    <select
                      disabled={actionLoadingId === (user.id || user._id)}
                      value={user.role}
                      onChange={(e) =>
                        updateUser(user.id || user._id, {
                          role: e.target.value,
                        })
                      }
                      className="rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white outline-none"
                    >
                      <option value="member">Member</option>
                      <option value="guest">Guest</option>
                      <option value="cabin_admin">Cabin Admin</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </PremiumCard>
    </AnimatedPage>
  );
}