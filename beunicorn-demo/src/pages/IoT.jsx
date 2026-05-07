import { Fan, Lightbulb, Thermometer, Wind } from "lucide-react";
import AnimatedPage from "../components/AnimatedPage";
import PremiumCard from "../components/PremiumCard";

export default function IoT() {
  return (
    <AnimatedPage>
      <div className="mb-6">
        <h1 className="text-3xl font-black text-white">IoT Controls</h1>
        <p className="mt-2 text-slate-400">
          Zoho IoT and MQTT-based cabin control .
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-4">
        <PremiumCard>
          <Thermometer className="mb-4 h-8 w-8 text-yellow-200" />
          <p className="text-sm text-slate-400">AC Setpoint</p>
          <h2 className="mt-2 text-4xl font-black text-white">22°C</h2>
          <input type="range" min="18" max="28" defaultValue="22" className="mt-5 w-full" />
        </PremiumCard>

        <PremiumCard>
          <Lightbulb className="mb-4 h-8 w-8 text-yellow-200" />
          <p className="text-sm text-slate-400">Lighting Scene</p>
          <h2 className="mt-2 text-3xl font-black text-white">Meeting</h2>
        </PremiumCard>

        <PremiumCard>
          <Wind className="mb-4 h-8 w-8 text-yellow-200" />
          <p className="text-sm text-slate-400">CO₂</p>
          <h2 className="mt-2 text-3xl font-black text-white">742 ppm</h2>
        </PremiumCard>

        <PremiumCard>
          <Fan className="mb-4 h-8 w-8 text-yellow-200" />
          <p className="text-sm text-slate-400">Occupancy</p>
          <h2 className="mt-2 text-3xl font-black text-white">Occupied</h2>
        </PremiumCard>
      </div>

      <PremiumCard className="mt-6">
        <h2 className="text-xl font-black text-white">Automation Rules</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {[
            "TTLock unlock → AC ON at 22°C + Meeting preset",
            "Occupancy false for 15 min → HVAC + lights OFF",
            "Booking cancelled/no-show → HVAC OFF",
            "CO₂ > 800 ppm → Increase HRV speed",
            "Lux > 500 → Dim lights to 40%",
          ].map((rule) => (
            <div key={rule} className="rounded-2xl bg-white/5 p-4 text-sm text-slate-300">
              {rule}
            </div>
          ))}
        </div>
      </PremiumCard>
    </AnimatedPage>
  );
}