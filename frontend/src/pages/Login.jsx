import { motion } from "framer-motion";
import { ArrowRight, LockKeyhole, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { isAdminRole, saveAuthSession } from "../utils/auth";

export default function Login() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("admin");

  const [form, setForm] = useState({
    email: "admin@beunicorn.com",
    password: "BeUnicorn123!",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      if (!form.email || !form.password) {
        setError("Email and password are required.");
        return;
      }

      const response = await api.post("/auth/login", form);

      const user = response.data.user;
      const token = response.data.token;

      saveAuthSession(user, token);

      if (isAdminRole(user?.role)) {
        navigate("/admin");
      } else {
        navigate("/member");
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  const useAdminLogin = () => {
    setMode("admin");
    setForm({
      email: "admin@beunicorn.com",
      password: "BeUnicorn123!",
    });
  };

  const useMemberLogin = () => {
    setMode("member");
    setForm({
      email: "",
      password: "",
    });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#07060a] p-5">
      <div className="absolute left-10 top-10 h-96 w-96 rounded-full bg-yellow-500/20 blur-3xl" />
      <div className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-purple-700/20 blur-3xl" />

      <motion.form
        onSubmit={login}
        initial={{ opacity: 0, y: 28, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="glass premium-shadow relative w-full max-w-md rounded-[2rem] p-8"
      >
        <div className="mb-8 text-center">
          <div className="gold-gradient mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl text-2xl font-black text-black">
            B
          </div>

          <p className="mb-2 flex items-center justify-center gap-2 text-sm text-yellow-200">
            <Sparkles className="h-4 w-4" />
            BeUnicorn Member Web App
          </p>

          <h1 className="text-3xl font-black text-white">
            {mode === "admin" ? "Admin Login" : "Member Login"}
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Admin manages operations. Member books rooms and views own bookings.
          </p>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={useAdminLogin}
            className={`rounded-2xl px-4 py-3 text-sm font-bold ${
              mode === "admin"
                ? "bg-yellow-300 text-black"
                : "border border-white/10 bg-white/5 text-white"
            }`}
          >
            Admin
          </button>

          <button
            type="button"
            onClick={useMemberLogin}
            className={`rounded-2xl px-4 py-3 text-sm font-bold ${
              mode === "member"
                ? "bg-yellow-300 text-black"
                : "border border-white/10 bg-white/5 text-white"
            }`}
          >
            Member
          </button>
        </div>

        <div className="space-y-4">
          <input
            value={form.email}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, email: e.target.value }))
            }
            className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-4 text-white outline-none placeholder:text-slate-500"
            placeholder="Email address"
          />

          <input
            value={form.password}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, password: e.target.value }))
            }
            type="password"
            className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-4 text-white outline-none placeholder:text-slate-500"
            placeholder="Password"
          />

          {error && (
            <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-yellow-300 px-6 py-4 font-black text-black transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LockKeyhole className="h-5 w-5" />
            {loading ? "Logging in..." : "Login"}
            {!loading && <ArrowRight className="h-5 w-5" />}
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-slate-400">
          New member?{" "}
          <Link to="/register" className="font-bold text-yellow-200">
            Create account
          </Link>
        </p>

        <div className="mt-6 rounded-2xl bg-white/5 p-4 text-center text-xs text-slate-400">
          Admin: admin@beunicorn.com
        </div>
      </motion.form>
    </div>
  );
}