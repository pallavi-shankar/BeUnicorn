import { Download, Plus, ShieldCheck } from "lucide-react";
import AnimatedPage from "../components/AnimatedPage";
import PremiumCard from "../components/PremiumCard";
import { currentUser, ledger } from "../data/demoData";

export default function WalletPage() {
  return (
    <AnimatedPage>
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-black text-white">Unified Wallet</h1>
          <p className="mt-2 text-slate-400">
            Every charge and refund is an immutable ledger event.
          </p>
        </div>

        <div className="flex gap-3">
          <button className="rounded-2xl bg-yellow-300 px-5 py-3 font-bold text-black">
            <Plus className="mr-2 inline h-4 w-4" />
            Top Up
          </button>
          <button className="rounded-2xl border border-white/10 px-5 py-3 text-white">
            <Download className="mr-2 inline h-4 w-4" />
            Statement
          </button>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-4">
        <PremiumCard>
          <p className="text-sm text-slate-400">Total Balance</p>
          <h2 className="mt-2 text-3xl font-black text-white">
            ₹{currentUser.wallet.total.toLocaleString()}
          </h2>
        </PremiumCard>
        <PremiumCard>
          <p className="text-sm text-slate-400">Grant Credits</p>
          <h2 className="mt-2 text-3xl font-black text-emerald-300">
            ₹{currentUser.wallet.grant.toLocaleString()}
          </h2>
        </PremiumCard>
        <PremiumCard>
          <p className="text-sm text-slate-400">Top-up Credits</p>
          <h2 className="mt-2 text-3xl font-black text-yellow-200">
            ₹{currentUser.wallet.topup.toLocaleString()}
          </h2>
        </PremiumCard>
        <PremiumCard>
          <p className="text-sm text-slate-400">Overage</p>
          <h2 className="mt-2 text-3xl font-black text-purple-300">
            ₹{currentUser.wallet.overage}
          </h2>
        </PremiumCard>
      </div>

      <PremiumCard className="mt-6">
        <div className="mb-5 flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-yellow-200" />
          <h2 className="text-xl font-black text-white">Ledger Entries</h2>
        </div>

        <div className="space-y-3">
          {ledger.map((item) => (
            <div
              key={item.type}
              className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-5 md:items-center"
            >
              <div className="md:col-span-2">
                <h3 className="font-black text-white">{item.type}</h3>
                <p className="text-xs text-slate-400">{item.note}</p>
              </div>
              <p className="text-sm text-slate-400">{item.time}</p>
              <span
                className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${
                  item.status === "Credit"
                    ? "bg-emerald-400/10 text-emerald-300"
                    : "bg-red-400/10 text-red-300"
                }`}
              >
                {item.status}
              </span>
              <p className="text-right text-lg font-black text-white">
                {item.amount}
              </p>
            </div>
          ))}
        </div>
      </PremiumCard>
    </AnimatedPage>
  );
}