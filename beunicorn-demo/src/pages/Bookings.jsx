import { CalendarDays, DoorOpen, Snowflake, Wallet } from "lucide-react";
import AnimatedPage from "../components/AnimatedPage";
import PremiumCard from "../components/PremiumCard";
import { bookings } from "../data/demoData";

export default function Bookings() {
  return (
    <AnimatedPage>
      <div className="mb-6">
        <h1 className="text-3xl font-black text-white">Bookings</h1>
        <p className="mt-2 text-slate-400">
          Wallet check, Google Calendar availability, access generation and IoT automation.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <PremiumCard className="xl:col-span-2">
          <h2 className="text-xl font-black text-white">Create Booking</h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <select className="rounded-2xl border border-white/10 bg-black/40 px-4 py-4 text-white outline-none">
              <option>Meeting Room</option>
              <option>Conference Room</option>
              <option>Creator Studio</option>
              <option>Event Space</option>
              <option>Day Pass</option>
            </select>

            <input type="date" className="rounded-2xl border border-white/10 bg-black/40 px-4 py-4 text-white outline-none" />
            <input type="time" className="rounded-2xl border border-white/10 bg-black/40 px-4 py-4 text-white outline-none" />
            <input type="time" className="rounded-2xl border border-white/10 bg-black/40 px-4 py-4 text-white outline-none" />
          </div>

          <button className="mt-6 rounded-2xl bg-yellow-300 px-6 py-4 font-black text-black">
            Check Availability & Lock Credits
          </button>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {[
              { icon: Wallet, title: "Wallet Check" },
              { icon: CalendarDays, title: "freeBusy API" },
              { icon: DoorOpen, title: "TTLock PIN" },
              { icon: Snowflake, title: "IoT Trigger" },
            ].map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="rounded-3xl bg-white/5 p-4">
                  <Icon className="mb-3 h-6 w-6 text-yellow-200" />
                  <p className="font-bold text-white">{step.title}</p>
                </div>
              );
            })}
          </div>
        </PremiumCard>

        <PremiumCard>
          <h2 className="text-xl font-black text-white">Rules</h2>
          <div className="mt-5 space-y-3">
            {[
              "Meeting/Conference max 4 hrs",
              "Creator Studio min 30 min",
              "Event Space max 8 hrs",
              "Cancel ≥ 2 hrs: full refund",
              "Cancel < 2 hrs: 50% refund",
              "No unlock in 15 min: no-show",
            ].map((rule) => (
              <div key={rule} className="rounded-2xl bg-white/5 p-3 text-sm text-slate-300">
                {rule}
              </div>
            ))}
          </div>
        </PremiumCard>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        {bookings.map((booking) => (
          <PremiumCard key={booking.space}>
            <p className="text-sm text-yellow-200">{booking.status}</p>
            <h3 className="mt-2 text-xl font-black text-white">{booking.space}</h3>
            <p className="mt-2 text-sm text-slate-400">{booking.time}</p>
            <p className="mt-4 text-lg font-black text-yellow-200">{booking.cost}</p>
          </PremiumCard>
        ))}
      </div>
    </AnimatedPage>
  );
}