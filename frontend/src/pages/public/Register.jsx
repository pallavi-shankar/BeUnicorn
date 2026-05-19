import { motion } from "framer-motion";
import { ArrowRight, Building2, MailCheck, Sparkles, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../../utils/api";
import { saveMemberSession } from "../../utils/auth";

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get("invite") || "";

  const [inviteData, setInviteData] = useState(null);
  const [inviteLoading, setInviteLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    companyName: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [verificationUrl, setVerificationUrl] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [error, setError] = useState("");

  const fetchInvite = async () => {
    if (!inviteToken) return;

    try {
      setInviteLoading(true);
      setError("");

      const response = await api.get(`/companies/invite/${inviteToken}`);
      const invite = response.data.invite;

      setInviteData(invite);

      setForm((prev) => ({
        ...prev,
        name: invite.invitedName || prev.name,
        email: invite.invitedEmail || prev.email,
        phone: invite.invitedPhone || prev.phone,
        companyName: invite.companyId?.name || prev.companyName,
      }));
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Invite link is invalid or expired. You can still register normally."
      );
    } finally {
      setInviteLoading(false);
    }
  };

  useEffect(() => {
    fetchInvite();
  }, [inviteToken]);

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      if (
        !form.name ||
        !form.email ||
        !form.phone ||
        !form.password ||
        !form.confirmPassword
      ) {
        setError("Please fill all required fields.");
        return;
      }

      if (form.password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }

      if (form.password !== form.confirmPassword) {
        setError("Password and confirm password do not match.");
        return;
      }

      const response = await api.post("/auth/register", {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        companyName: form.companyName,
        role: inviteData?.role || "member",
        inviteToken: inviteToken || undefined,
      });

      saveMemberSession(response.data.user, response.data.token);

      setRegistered(true);
      setVerificationUrl(
        response.data?.emailVerification?.verificationUrl || ""
      );
      setDevOtp(response.data?.phoneVerification?.devOtp || "");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (registered) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#07060a] p-5">
        <div className="absolute left-10 top-10 h-96 w-96 rounded-full bg-yellow-500/20 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-purple-700/20 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="glass premium-shadow relative w-full max-w-xl rounded-[2rem] p-8 text-center"
        >
          <div className="gold-gradient mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl text-black">
            <MailCheck className="h-8 w-8" />
          </div>

          <h1 className="text-3xl font-black text-white">
            Account Created Successfully
          </h1>

          <p className="mt-3 text-slate-400">
            Your account has been created. Please complete email and phone
            verification before booking.
          </p>

          {inviteData && (
            <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-left">
              <p className="text-sm font-bold text-emerald-300">
                Company invite accepted
              </p>
              <p className="mt-1 text-sm text-slate-300">
                You are linked to {inviteData.companyId?.name} as{" "}
                {inviteData.role}.
              </p>
            </div>
          )}

          {verificationUrl && (
            <div className="mt-5 rounded-2xl border border-yellow-300/20 bg-yellow-300/10 p-4 text-left">
              <p className="text-sm font-bold text-yellow-200">
                Development email verification link:
              </p>
              <a
                href={verificationUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 block break-all text-sm text-white underline"
              >
                {verificationUrl}
              </a>
            </div>
          )}

          {devOtp && (
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-left">
              <p className="text-sm font-bold text-yellow-200">
                Development phone OTP:
              </p>
              <p className="mt-1 text-2xl font-black text-white">{devOtp}</p>
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => navigate("/member/verification")}
              className="flex-1 rounded-2xl bg-yellow-300 px-6 py-4 font-black text-black"
            >
              Complete Verification
            </button>

            <button
              onClick={() => navigate("/member")}
              className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 font-bold text-white"
            >
              Go to Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#07060a] p-5">
      <div className="absolute left-10 top-10 h-96 w-96 rounded-full bg-yellow-500/20 blur-3xl" />
      <div className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-purple-700/20 blur-3xl" />

      <motion.form
        onSubmit={handleRegister}
        initial={{ opacity: 0, y: 28, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="glass premium-shadow relative w-full max-w-xl rounded-[2rem] p-8"
      >
        <div className="mb-8 text-center">
          <div className="gold-gradient mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl text-2xl font-black text-black">
            B
          </div>

          <p className="mb-2 flex items-center justify-center gap-2 text-sm text-yellow-200">
            <Sparkles className="h-4 w-4" />
            BeUnicorn Member Portal
          </p>

          <h1 className="text-3xl font-black text-white">
            Create Member Account
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Register to browse rooms and submit booking requests.
          </p>
        </div>

        {inviteLoading && (
          <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            Loading invite details...
          </div>
        )}

        {inviteData && (
          <div className="mb-5 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4">
            <div className="flex gap-3">
              <Building2 className="mt-1 h-5 w-5 text-emerald-300" />
              <div>
                <p className="font-black text-emerald-300">
                  Company Invite Detected
                </p>
                <p className="mt-1 text-sm text-slate-300">
                  You are invited to join {inviteData.companyId?.name} as{" "}
                  {inviteData.role}.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <input
            value={form.name}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, name: e.target.value }))
            }
            className="rounded-2xl border border-white/10 bg-black/40 px-4 py-4 text-white outline-none placeholder:text-slate-500"
            placeholder="Full name"
          />

          <input
            value={form.email}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, email: e.target.value }))
            }
            disabled={Boolean(inviteData?.invitedEmail)}
            className="rounded-2xl border border-white/10 bg-black/40 px-4 py-4 text-white outline-none placeholder:text-slate-500 disabled:opacity-60"
            placeholder="Email address"
          />

          <input
            value={form.phone}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, phone: e.target.value }))
            }
            className="rounded-2xl border border-white/10 bg-black/40 px-4 py-4 text-white outline-none placeholder:text-slate-500"
            placeholder="Phone number"
          />

          <input
            value={form.companyName}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, companyName: e.target.value }))
            }
            disabled={Boolean(inviteData?.companyId?.name)}
            className="rounded-2xl border border-white/10 bg-black/40 px-4 py-4 text-white outline-none placeholder:text-slate-500 disabled:opacity-60"
            placeholder="Company name optional"
          />

          <input
            value={form.password}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, password: e.target.value }))
            }
            type="password"
            className="rounded-2xl border border-white/10 bg-black/40 px-4 py-4 text-white outline-none placeholder:text-slate-500"
            placeholder="Password"
          />

          <input
            value={form.confirmPassword}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                confirmPassword: e.target.value,
              }))
            }
            type="password"
            className="rounded-2xl border border-white/10 bg-black/40 px-4 py-4 text-white outline-none placeholder:text-slate-500"
            placeholder="Confirm password"
          />
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-5 flex w-full items-center justify-center gap-3 rounded-2xl bg-yellow-300 px-6 py-4 font-black text-black transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <UserPlus className="h-5 w-5" />
          {loading ? "Creating Account..." : "Create Member Account"}
          {!loading && <ArrowRight className="h-5 w-5" />}
        </button>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link to="/login" className="font-bold text-yellow-200">
            Login
          </Link>
        </p>
      </motion.form>
    </div>
  );
}