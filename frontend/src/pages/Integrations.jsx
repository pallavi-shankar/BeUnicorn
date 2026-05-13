import { CheckCircle2, Layers } from "lucide-react";
import AnimatedPage from "../components/AnimatedPage";
import PremiumCard from "../components/PremiumCard";
import { integrations } from "../data/demoData";

export default function Integrations() {
  return (
    <AnimatedPage>
      <div className="mb-6">
        <h1 className="text-3xl font-black text-white">Integration Command Center</h1>
        <p className="mt-2 text-slate-400">
          Visual overview of all PRD-required integrations.
        </p>
      </div>

      <PremiumCard>
        <div className="mb-6 flex items-center gap-3">
          <Layers className="h-7 w-7 text-yellow-200" />
          <div>
            <h2 className="text-xl font-black text-white">System Principle</h2>
            <p className="text-sm text-slate-400">
              App DB is runtime source of truth. Zoho CRM is business record source of truth.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {integrations.map((item) => (
            <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
              <CheckCircle2 className="h-5 w-5 text-emerald-300" />
              <span className="font-bold text-white">{item}</span>
            </div>
          ))}
        </div>
      </PremiumCard>
    </AnimatedPage>
  );
}