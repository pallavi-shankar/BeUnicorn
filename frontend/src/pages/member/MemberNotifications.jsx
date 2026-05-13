import { Bell } from "lucide-react";
import AnimatedPage from "../components/AnimatedPage";
import PremiumCard from "../components/PremiumCard";
import { notifications } from "../data/demoData";

export default function Notifications() {
  return (
    <AnimatedPage>
      <div className="mb-6">
        <h1 className="text-3xl font-black text-white">Notifications</h1>
        <p className="mt-2 text-slate-400">
          In-app and push notification center.
        </p>
      </div>

      <PremiumCard>
        <div className="mb-5 flex items-center gap-3">
          <Bell className="h-6 w-6 text-yellow-200" />
          <h2 className="text-xl font-black text-white">Notification Center</h2>
        </div>

        {notifications.map((item, index) => (
          <div key={item} className="mb-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <p className="font-bold text-white">{item}</p>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${index < 2 ? "bg-yellow-300 text-black" : "bg-white/10 text-slate-300"}`}>
                {index < 2 ? "Unread" : "Read"}
              </span>
            </div>
          </div>
        ))}
      </PremiumCard>
    </AnimatedPage>
  );
}