import { motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  KeyRound,
  Printer,
  ShieldCheck,
  Sparkles,
  UserPlus,
  Wallet,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import PremiumCard from "../../components/PremiumCard";

const features = [
  {
    icon: Wallet,
    title: "Unified Wallet",
    text: "Grant, top-up and admin overage credits in one immutable ledger.",
  },
  {
    icon: CalendarDays,
    title: "Smart Bookings",
    text: "Members can browse spaces, select slots and book rooms.",
  },
  {
    icon: KeyRound,
    title: "TTLock Access",
    text: "BLE eKey, visitor PINs and ghost meeting detection planned.",
  },
  {
    icon: Printer,
    title: "PaperCut Printing",
    text: "Print account, mirrored balance and post-print charges planned.",
  },
  {
    icon: ShieldCheck,
    title: "Admin Operations",
    text: "Admin can manage users, rooms, bookings and workspace operations.",
  },
  {
    icon: Zap,
    title: "IoT Automation",
    text: "AC, lights, occupancy, CO₂ and lux-based workspace control planned.",
  },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen overflow-hidden bg-[#07060a] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-10 top-10 h-96 w-96 rounded-full bg-yellow-500/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-purple-700/20 blur-3xl" />
      </div>

      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-6">
        <div className="flex items-center gap-3">
          <div className="gold-gradient flex h-12 w-12 items-center justify-center rounded-2xl text-xl font-black text-black">
            B
          </div>

          <div>
            <h1 className="text-xl font-black">BeUnicorn</h1>
            <p className="text-xs text-slate-400">Jayanagar, Bengaluru</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate("/login")}
            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-bold text-white transition hover:bg-white/10"
          >
            Login
          </button>

          <button
            onClick={() => navigate("/register")}
            className="rounded-2xl bg-yellow-300 px-5 py-3 font-bold text-black transition hover:scale-105"
          >
            Register
          </button>
        </div>
      </nav>

      <section className="relative z-10 mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-2 lg:items-center lg:py-24">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 flex items-center gap-2 text-sm font-semibold text-yellow-200"
          >
            <Sparkles className="h-4 w-4" />
            Premium coworking member experience platform
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl font-black leading-tight md:text-7xl"
          >
            One platform for{" "}
            <span className="text-gold">members, bookings, admin</span> and
            workspace operations.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 max-w-2xl text-lg leading-8 text-slate-300"
          >
            Members can register, browse bookable spaces, create bookings and
            view their booking history. Admins can manage rooms, users and all
            workspace operations from one dashboard.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex flex-wrap gap-4"
          >
            <button
              onClick={() => navigate("/register")}
              className="flex items-center gap-3 rounded-2xl bg-yellow-300 px-7 py-4 font-black text-black shadow-xl shadow-yellow-300/20 transition hover:scale-105"
            >
              <UserPlus className="h-5 w-5" />
              Register as Member
              <ArrowRight className="h-5 w-5" />
            </button>

            <button
              onClick={() => navigate("/login")}
              className="rounded-2xl border border-white/10 bg-white/5 px-7 py-4 font-bold text-white hover:bg-white/10"
            >
              Admin / Member Login
            </button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92, rotate: -2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="glass premium-shadow rounded-[2rem] p-6"
        >
          <div className="rounded-[1.6rem] bg-black/40 p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Current MVP</p>
                <h3 className="text-3xl font-black">Backend Connected</h3>
              </div>

              <div className="rounded-2xl bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-300">
                Active
              </div>
            </div>

            <div className="grid gap-4">
              {[
                "Member registration and login",
                "Admin room and user management",
                "Real MongoDB workspace rooms",
                "Room booking and cancellation",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-5 pb-20">
        <div className="mb-8 text-center">
          <p className="text-sm font-bold text-yellow-200">MVP Modules</p>
          <h2 className="mt-2 text-4xl font-black">User side + Admin side</h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <PremiumCard key={feature.title}>
                <Icon className="mb-4 h-8 w-8 text-yellow-200" />
                <h3 className="text-xl font-black">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {feature.text}
                </p>
              </PremiumCard>
            );
          })}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-5 pb-20">
        <div className="glass rounded-[2rem] p-8 text-center">
          <Building2 className="mx-auto mb-4 h-10 w-10 text-yellow-200" />
          <h2 className="text-3xl font-black">Current Working Flow</h2>
          <p className="mx-auto mt-4 max-w-3xl text-slate-300">
            Admin adds and manages spaces. Members register, browse those
            spaces, select date and time, create bookings, and view/cancel their
            own bookings.
          </p>
        </div>
      </section>
    </div>
  );
}