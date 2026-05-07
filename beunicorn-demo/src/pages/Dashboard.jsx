import {
  CalendarDays,
  CreditCard,
  KeyRound,
  Printer,
  Sparkles,
  Wallet,
  Zap,
} from "lucide-react";
import AnimatedPage from "../components/AnimatedPage";
import PremiumCard from "../components/PremiumCard";
import { bookings, currentUser, metrics, notifications } from "../data/demoData";

const iconMap = [Wallet, CalendarDays, KeyRound, CreditCard];

export default function Dashboard() {
  return (
    <AnimatedPage>
      <div className="mb-6">
        <h1 className="text-3xl font-black text-white">Dashboard</h1>
        <p className="mt-2 text-slate-400">
          Complete BeUnicorn member state in one premium operating dashboard.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((item, index) => {
          const Icon = iconMap[index];

          return (
            <PremiumCard key={item.label}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-400">{item.label}</p>
                  <h3 className="mt-2 text-2xl font-black text-white">
                    {item.value}
                  </h3>
                  <p className="mt-2 text-xs text-slate-400">{item.sub}</p>
                </div>
                <div className="rounded-2xl bg-yellow-300/10 p-3">
                  <Icon className="h-5 w-5 text-yellow-200" />
                </div>
              </div>
            </PremiumCard>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <PremiumCard className="xl:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="flex items-center gap-2 text-sm text-yellow-200">
                <Sparkles className="h-4 w-4" />
                Runtime source of truth
              </p>
              <h2 className="mt-2 text-2xl font-black text-white">
                {currentUser.company}
              </h2>
              <p className="text-sm text-slate-400">{currentUser.location}</p>
            </div>
            <span className="rounded-full bg-emerald-400/10 px-4 py-2 text-xs font-bold text-emerald-300">
              {currentUser.role}
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl bg-white/5 p-5">
              <p className="text-sm text-slate-400">Subscription</p>
              <h3 className="mt-2 text-xl font-black text-white">
                {currentUser.plan}
              </h3>
              <p className="mt-3 text-xs text-slate-400">
                Zoho Billing async sync
              </p>
            </div>

            <div className="rounded-3xl bg-white/5 p-5">
              <p className="text-sm text-slate-400">Access</p>
              <h3 className="mt-2 text-xl font-black text-white">
                eKey Active
              </h3>
              <p className="mt-3 text-xs text-slate-400">
                TTLock BLE offline unlock
              </p>
            </div>

            <div className="rounded-3xl bg-white/5 p-5">
              <p className="text-sm text-slate-400">Printing</p>
              <h3 className="mt-2 text-xl font-black text-white">
                Enabled
              </h3>
              <p className="mt-3 text-xs text-slate-400">
                PaperCut balance mirrored
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-yellow-300/20 bg-yellow-300/10 p-5">
            <div className="flex gap-4">
              <Zap className="h-7 w-7 text-yellow-200" />
              <div>
                <h3 className="font-black text-white">
                  Automated Booking Chain
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Booking confirmed → wallet credits locked → Google Calendar
                  event created → visitor PIN generated → HVAC pre-cool and
                  lighting scene scheduled.
                </p>
              </div>
            </div>
          </div>
        </PremiumCard>

        <PremiumCard>
          <h2 className="text-xl font-black text-white">Live Alerts</h2>
          <div className="mt-5 space-y-3">
            {notifications.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300"
              >
                {item}
              </div>
            ))}
          </div>
        </PremiumCard>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        {bookings.map((booking) => (
          <PremiumCard key={booking.space}>
            <p className="text-sm text-yellow-200">{booking.status}</p>
            <h3 className="mt-2 text-xl font-black text-white">
              {booking.space}
            </h3>
            <p className="mt-2 text-sm text-slate-400">{booking.time}</p>
            <div className="mt-5 flex items-center justify-between">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs">
                Google Calendar
              </span>
              <span className="font-black text-yellow-200">{booking.cost}</span>
            </div>
          </PremiumCard>
        ))}
      </div>
    </AnimatedPage>
  );
}