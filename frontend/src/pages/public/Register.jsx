import { motion } from "framer-motion";
import { ArrowRight, Sparkles, UserPlus } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { saveAuthSession } from "../utils/auth";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    companyName: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
        role: "member",
      });

      saveAuthSession(response.data.user, response.data.token);

      navigate("/member");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

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
            Register as a member to browse rooms and submit booking requests.
          </p>
        </div>

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
            className="rounded-2xl border border-white/10 bg-black/40 px-4 py-4 text-white outline-none placeholder:text-slate-500"
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
            className="rounded-2xl border border-white/10 bg-black/40 px-4 py-4 text-white outline-none placeholder:text-slate-500"
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