import { Rocket } from "lucide-react";
import AnimatedPage from "../components/AnimatedPage";
import PremiumCard from "../components/PremiumCard";

const phases = [
  {
    title: "Phase 1 — UI ",
    items: ["Landing page", "Hardcoded login", "Dashboard", "Mock PRD flows"],
  },
  {
    title: "Phase 2 — Backend MVP",
    items: ["Auth", "Roles", "Wallet ledger", "Bookings", "Admin approvals"],
  },
  {
    title: "Phase 3 — Integrations",
    items: ["Cashfree", "Zoho", "Google Calendar", "TTLock", "PaperCut", "Zoho IoT"],
  },
  {
    title: "Phase 4 — Production",
    items: ["Mobile app", "Push notifications", "Audit logs", "Security hardening"],
  },
];

export default function Roadmap() {
  return (
    <AnimatedPage>
      <div className="mb-6">
        <h1 className="text-3xl font-black text-white">Roadmap</h1>
        <p className="mt-2 text-slate-400">
          Use this page to explain how the demo becomes production.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-4">
        {phases.map((phase) => (
          <PremiumCard key={phase.title}>
            <Rocket className="mb-4 h-8 w-8 text-yellow-200" />
            <h2 className="text-xl font-black text-white">{phase.title}</h2>
            <div className="mt-5 space-y-3">
              {phase.items.map((item) => (
                <div key={item} className="rounded-2xl bg-white/5 p-3 text-sm text-slate-300">
                  {item}
                </div>
              ))}
            </div>
          </PremiumCard>
        ))}
      </div>
    </AnimatedPage>
  );
}