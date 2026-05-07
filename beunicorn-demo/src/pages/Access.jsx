import { KeyRound, Lock, QrCode, ShieldCheck } from "lucide-react";
import AnimatedPage from "../components/AnimatedPage";
import PremiumCard from "../components/PremiumCard";

export default function Access() {
  return (
    <AnimatedPage>
      <div className="mb-6">
        <h1 className="text-3xl font-black text-white">Access Control</h1>
        <p className="mt-2 text-slate-400">
          TTLock eKey, visitor PIN/QR and ghost meeting detection.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <PremiumCard>
          <KeyRound className="mb-4 h-8 w-8 text-yellow-200" />
          <h2 className="text-xl font-black text-white">Member eKey</h2>
          <p className="mt-2 text-sm text-slate-400">Long-term BLE eKey for floor and cabin doors.</p>
          <span className="mt-5 inline-block rounded-full bg-emerald-400/10 px-4 py-2 text-xs font-bold text-emerald-300">
            Active
          </span>
        </PremiumCard>

        <PremiumCard>
          <QrCode className="mb-4 h-8 w-8 text-yellow-200" />
          <h2 className="text-xl font-black text-white">Visitor PIN / QR</h2>
          <p className="mt-2 text-sm text-slate-400">Valid only during booking window.</p>
          <span className="mt-5 inline-block rounded-full bg-yellow-300/10 px-4 py-2 text-xs font-bold text-yellow-200">
            11:00 AM - 12:00 PM
          </span>
        </PremiumCard>

        <PremiumCard>
          <Lock className="mb-4 h-8 w-8 text-yellow-200" />
          <h2 className="text-xl font-black text-white">Ghost Meeting Guard</h2>
          <p className="mt-2 text-sm text-slate-400">No TTLock unlock in 15 min = auto-cancel and full charge.</p>
        </PremiumCard>
      </div>

      <PremiumCard className="mt-6">
        <div className="mb-5 flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-yellow-200" />
          <h2 className="text-xl font-black text-white">Unlock Audit Log</h2>
        </div>

        {[
          "Private Office Floor — BLE eKey Unlock — Success",
          "Conference Room — Visitor PIN — Success",
          "Meeting Room — No unlock detected — Auto-cancelled",
        ].map((log) => (
          <div key={log} className="mb-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            {log}
          </div>
        ))}
      </PremiumCard>
    </AnimatedPage>
  );
}