import { Printer, ToggleRight, Wallet } from "lucide-react";
import AnimatedPage from "../components/AnimatedPage";
import PremiumCard from "../components/PremiumCard";

export default function Printing() {
  return (
    <AnimatedPage>
      <div className="mb-6">
        <h1 className="text-3xl font-black text-white">Printing</h1>
        <p className="mt-2 text-slate-400">
          PaperCut NG balance mirroring and post-print wallet deduction.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <PremiumCard>
          <Printer className="mb-4 h-8 w-8 text-yellow-200" />
          <h2 className="text-xl font-black text-white">Printing Enabled</h2>
          <p className="mt-2 text-sm text-slate-400">PaperCut user created through XML-RPC API.</p>
          <ToggleRight className="mt-5 h-9 w-9 text-emerald-300" />
        </PremiumCard>

        <PremiumCard>
          <Wallet className="mb-4 h-8 w-8 text-yellow-200" />
          <h2 className="text-xl font-black text-white">Mirrored Balance</h2>
          <p className="mt-2 text-3xl font-black text-white">₹18,450</p>
        </PremiumCard>

        <PremiumCard>
          <h2 className="text-xl font-black text-white">Admin Overage</h2>
          <p className="mt-2 text-sm text-slate-400">
            If balance hits ₹0, backend pushes artificial ₹10,000 PaperCut balance.
          </p>
        </PremiumCard>
      </div>

      <PremiumCard className="mt-6">
        <h2 className="text-xl font-black text-white">Print History</h2>
        {[
          "Investor Deck.pdf — 18 pages — Color — ₹72",
          "Agreement Copy.pdf — 7 pages — B/W — ₹14",
        ].map((job) => (
          <div key={job} className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            {job}
          </div>
        ))}
      </PremiumCard>
    </AnimatedPage>
  );
}