import { BadgeCheck, CreditCard, Landmark, Shield } from "lucide-react";
import AnimatedPage from "../components/AnimatedPage";
import PremiumCard from "../components/PremiumCard";

export default function Payments() {
  return (
    <AnimatedPage>
      <div className="mb-6">
        <h1 className="text-3xl font-black text-white">Payments & KYC</h1>
        <p className="mt-2 text-slate-400">
          Cashfree orders, KYC verification, mandates and webhook safety.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-4">
        {[
          { icon: CreditCard, title: "Wallet Top-up", text: "Cashfree Order API for UPI, card and netbanking." },
          { icon: Landmark, title: "UPI AutoPay / eNACH", text: "Rent mandate based on subscription amount." },
          { icon: BadgeCheck, title: "PAN Verified", text: "Raw PAN and Aadhaar are never stored." },
          { icon: Shield, title: "Webhook Safe", text: "Signature verification, idempotency and DLQ." },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <PremiumCard key={item.title}>
              <Icon className="mb-4 h-8 w-8 text-yellow-200" />
              <h2 className="text-lg font-black text-white">{item.title}</h2>
              <p className="mt-2 text-sm text-slate-400">{item.text}</p>
            </PremiumCard>
          );
        })}
      </div>

      <PremiumCard className="mt-6">
        <h2 className="text-xl font-black text-white">Mock Cashfree Payment</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <input defaultValue="5000" className="rounded-2xl border border-white/10 bg-black/40 px-4 py-4 text-white outline-none" />
          <select className="rounded-2xl border border-white/10 bg-black/40 px-4 py-4 text-white outline-none">
            <option>Wallet Top-up</option>
            <option>Day Pass</option>
            <option>Meeting Room</option>
          </select>
          <button className="rounded-2xl bg-yellow-300 px-5 py-4 font-black text-black">
            Create Cashfree Order
          </button>
        </div>
      </PremiumCard>
    </AnimatedPage>
  );
}