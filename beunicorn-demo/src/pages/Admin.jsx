import { CheckCircle2, IndianRupee, UserCog } from "lucide-react";
import AnimatedPage from "../components/AnimatedPage";
import PremiumCard from "../components/PremiumCard";

export default function Admin() {
  return (
    <AnimatedPage>
      <div className="mb-6">
        <h1 className="text-3xl font-black text-white">Admin Console</h1>
        <p className="mt-2 text-slate-400">
          Operations view for members, overage, webhooks and wallet approvals.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <PremiumCard>
          <UserCog className="mb-4 h-8 w-8 text-yellow-200" />
          <h2 className="text-xl font-black text-white">Members</h2>
          <p className="mt-2 text-4xl font-black text-white">128</p>
        </PremiumCard>

        <PremiumCard>
          <IndianRupee className="mb-4 h-8 w-8 text-yellow-200" />
          <h2 className="text-xl font-black text-white">Month Overage</h2>
          <p className="mt-2 text-4xl font-black text-white">₹42,800</p>
        </PremiumCard>

        <PremiumCard>
          <CheckCircle2 className="mb-4 h-8 w-8 text-yellow-200" />
          <h2 className="text-xl font-black text-white">Webhook Health</h2>
          <p className="mt-2 text-4xl font-black text-emerald-300">99.9%</p>
        </PremiumCard>
      </div>

      <PremiumCard className="mt-6">
        <h2 className="text-xl font-black text-white">Manual Wallet Adjustment</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-4">
          <input placeholder="Member email" className="rounded-2xl border border-white/10 bg-black/40 px-4 py-4 text-white outline-none" />
          <input placeholder="Amount" className="rounded-2xl border border-white/10 bg-black/40 px-4 py-4 text-white outline-none" />
          <select className="rounded-2xl border border-white/10 bg-black/40 px-4 py-4 text-white outline-none">
            <option>Credit</option>
            <option>Debit</option>
          </select>
          <button className="rounded-2xl bg-yellow-300 px-5 py-4 font-black text-black">
            Submit
          </button>
        </div>

        <textarea
          placeholder="Mandatory reason for audit log"
          className="mt-4 h-28 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-4 text-white outline-none"
        />
      </PremiumCard>
    </AnimatedPage>
  );
}