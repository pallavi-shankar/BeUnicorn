import { motion } from "framer-motion";
import { ArrowRight, LockKeyhole, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const login = () => {
    localStorage.setItem("beunicorn_auth", "true");
    navigate("/app");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#07060a] p-5">
      <div className="absolute left-10 top-10 h-96 w-96 rounded-full bg-yellow-500/20 blur-3xl" />
      <div className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-purple-700/20 blur-3xl" />

      <motion.div
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
          <h1 className="text-3xl font-black text-white">Welcome Back</h1>
          <p className="mt-2 text-sm text-slate-400">
            Login for quick presentation.
          </p>
        </div>

        <div className="space-y-4">
          <input
            defaultValue="aarav@novalabs.ai"
            className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-4 text-white outline-none"
          />
          <input
            defaultValue="password"
            type="password"
            className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-4 text-white outline-none"
          />

          <button
            onClick={login}
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-yellow-300 px-6 py-4 font-black text-black transition hover:scale-105"
          >
            <LockKeyhole className="h-5 w-5" />
            Login 
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 rounded-2xl bg-white/5 p-4 text-center text-xs text-slate-400">
          Role: Admin • Private Office • Wallet + Access + Booking enabled
        </div>
      </motion.div>
    </div>
  );
}