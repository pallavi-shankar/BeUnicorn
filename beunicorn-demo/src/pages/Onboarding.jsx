import { ArrowRight, Building2, UserPlus, Users, Wallet } from "lucide-react";
import AnimatedPage from "../components/AnimatedPage";
import PremiumCard from "../components/PremiumCard";

const scenarios = [
  {
    title: "Sales-Led Admin",
    icon: Building2,
    text: "Subscription created in Zoho Billing. User signs up and backend sets role as Admin.",
  },
  {
    title: "Self-Serve Individual",
    icon: UserPlus,
    text: "User signs up as Non-Member. CRM record is created asynchronously.",
  },
  {
    title: "First Purchase",
    icon: Wallet,
    text: "User pays for day pass or booking and becomes Guest automatically.",
  },
  {
    title: "Admin Invites Team",
    icon: Users,
    text: "Admin invite creates Standard Member linked to the company account.",
  },
];

export default function Onboarding() {
  return (
    <AnimatedPage>
      <div className="mb-6">
        <h1 className="text-3xl font-black text-white">Onboarding Flow</h1>
        <p className="mt-2 text-slate-400">
          Role lifecycle from non-member to guest, admin and standard member.
        </p>
      </div>

      <PremiumCard>
        <div className="grid gap-4 md:grid-cols-4 md:items-center">
          {["Non-Member", "Guest", "Admin", "Standard Member"].map((role, index) => (
            <div key={role} className="flex items-center gap-3">
              <div className="rounded-2xl bg-yellow-300 px-4 py-3 font-black text-black">
                {role}
              </div>
              {index < 3 && <ArrowRight className="hidden h-5 w-5 text-yellow-200 md:block" />}
            </div>
          ))}
        </div>
      </PremiumCard>

      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {scenarios.map((item) => {
          const Icon = item.icon;

          return (
            <PremiumCard key={item.title}>
              <Icon className="mb-4 h-8 w-8 text-yellow-200" />
              <h3 className="text-xl font-black text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                {item.text}
              </p>
            </PremiumCard>
          );
        })}
      </div>

      <PremiumCard className="mt-6">
        <h2 className="text-xl font-black text-white">Architecture Principle</h2>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          The app database is the runtime source of truth. Zoho CRM remains the
          business record source of truth. All Zoho syncs run asynchronously in
          the background, so the app never waits on Zoho during signup, booking
          or payment actions.
        </p>
      </PremiumCard>
    </AnimatedPage>
  );
}