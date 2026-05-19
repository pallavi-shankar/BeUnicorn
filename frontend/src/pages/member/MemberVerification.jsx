import {
  CheckCircle2,
  Loader2,
  MailCheck,
  Phone,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import AnimatedPage from "../../components/AnimatedPage";
import PremiumCard from "../../components/PremiumCard";
import api from "../../utils/api";
import { saveMemberSession } from "../../utils/auth";

export default function MemberVerification() {
  const [profile, setProfile] = useState(null);
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState("");

  const [loading, setLoading] = useState(true);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);

  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await api.get("/auth/me");
      setProfile(response.data.user);
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const resendEmail = async () => {
    try {
      setResendingEmail(true);
      setMessage("");
      setSuccess("");

      const response = await api.post("/auth/resend-verification-email");

      let msg = response.data.message || "Verification email sent.";

      if (response.data?.emailVerification?.verificationUrl) {
        msg += ` Dev link: ${response.data.emailVerification.verificationUrl}`;
      }

      setSuccess(msg);
      await fetchProfile();
    } catch (error) {
      setMessage(
        error?.response?.data?.message || "Failed to resend verification email."
      );
    } finally {
      setResendingEmail(false);
    }
  };

  const sendOtp = async () => {
    try {
      setSendingOtp(true);
      setMessage("");
      setSuccess("");
      setDevOtp("");

      const response = await api.post("/auth/send-phone-otp");

      setSuccess(response.data.message || "OTP sent successfully.");

      if (response.data?.phoneVerification?.devOtp) {
        setDevOtp(response.data.phoneVerification.devOtp);
      }

      await fetchProfile();
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to send OTP.");
    } finally {
      setSendingOtp(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();

    try {
      setVerifyingOtp(true);
      setMessage("");
      setSuccess("");

      if (!otp) {
        setMessage("Please enter OTP.");
        return;
      }

      const response = await api.post("/auth/verify-phone-otp", { otp });

      setSuccess(response.data.message || "Phone verified successfully.");

      const token = localStorage.getItem("beunicorn_member_token");
      if (response.data.user && token) {
        saveMemberSession(response.data.user, token);
      }

      setOtp("");
      setDevOtp("");
      await fetchProfile();
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to verify OTP.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  if (loading) {
    return (
      <AnimatedPage>
        <div className="flex min-h-[60vh] items-center justify-center text-slate-300">
          <Loader2 className="mr-3 h-6 w-6 animate-spin text-yellow-200" />
          Loading verification...
        </div>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage>
      <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-3xl font-black text-white">
            Account Verification
          </h1>
          <p className="mt-2 text-slate-400">
            Verify your email and phone number before booking or payments.
          </p>
        </div>

        <button
          onClick={fetchProfile}
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
        <div className="mb-5 break-all rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">
          {success}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <PremiumCard>
          <div className="mb-5 flex items-center gap-3">
            <MailCheck className="h-8 w-8 text-yellow-200" />
            <div>
              <h2 className="text-xl font-black text-white">
                Email Verification
              </h2>
              <p className="text-sm text-slate-400">{profile?.email}</p>
            </div>
          </div>

          {profile?.isEmailVerified ? (
            <div className="rounded-3xl border border-emerald-400/20 bg-emerald-500/10 p-5">
              <div className="flex items-center gap-3 text-emerald-300">
                <CheckCircle2 className="h-6 w-6" />
                <p className="font-black">Email verified</p>
              </div>
              <p className="mt-2 text-sm text-slate-400">
                Your email address has been verified.
              </p>
            </div>
          ) : (
            <div className="rounded-3xl border border-yellow-300/20 bg-yellow-300/10 p-5">
              <p className="font-black text-yellow-200">Email not verified</p>
              <p className="mt-2 text-sm text-slate-300">
                Please verify your email using the verification link sent to
                your inbox.
              </p>

              <button
                onClick={resendEmail}
                disabled={resendingEmail}
                className="mt-5 rounded-2xl bg-yellow-300 px-5 py-3 text-sm font-black text-black disabled:opacity-60"
              >
                {resendingEmail ? "Sending..." : "Resend Verification Email"}
              </button>
            </div>
          )}
        </PremiumCard>

        <PremiumCard>
          <div className="mb-5 flex items-center gap-3">
            <Phone className="h-8 w-8 text-yellow-200" />
            <div>
              <h2 className="text-xl font-black text-white">
                Phone Verification
              </h2>
              <p className="text-sm text-slate-400">{profile?.phone}</p>
            </div>
          </div>

          {profile?.isPhoneVerified ? (
            <div className="rounded-3xl border border-emerald-400/20 bg-emerald-500/10 p-5">
              <div className="flex items-center gap-3 text-emerald-300">
                <CheckCircle2 className="h-6 w-6" />
                <p className="font-black">Phone verified</p>
              </div>
              <p className="mt-2 text-sm text-slate-400">
                Your phone number has been verified.
              </p>
            </div>
          ) : (
            <div className="rounded-3xl border border-yellow-300/20 bg-yellow-300/10 p-5">
              <p className="font-black text-yellow-200">Phone not verified</p>
              <p className="mt-2 text-sm text-slate-300">
                Send OTP to your phone number and verify it.
              </p>

              <button
                onClick={sendOtp}
                disabled={sendingOtp}
                className="mt-5 rounded-2xl bg-yellow-300 px-5 py-3 text-sm font-black text-black disabled:opacity-60"
              >
                {sendingOtp ? "Sending OTP..." : "Send OTP"}
              </button>

              {devOtp && (
                <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-4">
                  <p className="text-xs font-bold text-yellow-200">
                    Development OTP:
                  </p>
                  <p className="mt-1 text-2xl font-black text-white">
                    {devOtp}
                  </p>
                </div>
              )}

              <form onSubmit={verifyOtp} className="mt-5 space-y-4">
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-4 text-white outline-none placeholder:text-slate-500"
                />

                <button
                  type="submit"
                  disabled={verifyingOtp}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-5 py-4 font-black text-black disabled:opacity-60"
                >
                  <ShieldCheck className="h-5 w-5" />
                  {verifyingOtp ? "Verifying..." : "Verify Phone"}
                </button>
              </form>
            </div>
          )}
        </PremiumCard>
      </div>
    </AnimatedPage>
  );
}