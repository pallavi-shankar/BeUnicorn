import {
  Bell,
  CalendarDays,
  CreditCard,
  Home,
  KeyRound,
  Layers,
  LogOut,
  Printer,
  Route,
  ShieldCheck,
  SlidersHorizontal,
  Wallet,
  Zap,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

const links = [
  { label: "Dashboard", path: "/app", icon: Home },
  { label: "Onboarding", path: "/app/onboarding", icon: Route },
  { label: "Wallet", path: "/app/wallet", icon: Wallet },
  { label: "Bookings", path: "/app/bookings", icon: CalendarDays },
  { label: "Access", path: "/app/access", icon: KeyRound },
  { label: "Printing", path: "/app/printing", icon: Printer },
  { label: "Payments & KYC", path: "/app/payments", icon: CreditCard },
  { label: "IoT Controls", path: "/app/iot", icon: SlidersHorizontal },
  { label: "Notifications", path: "/app/notifications", icon: Bell },
  { label: "Admin Console", path: "/app/admin", icon: ShieldCheck },
  { label: "Integrations", path: "/app/integrations", icon: Layers },
  { label: "Roadmap", path: "/app/roadmap", icon: Zap },
];

export default function Sidebar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("beunicorn_auth");
    navigate("/");
  };

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-72 border-r border-white/10 bg-black/50 p-5 backdrop-blur-2xl lg:block">
      <div className="mb-8 flex items-center gap-3">
        <div className="gold-gradient flex h-12 w-12 items-center justify-center rounded-2xl text-xl font-black text-black">
          B
        </div>
        <div>
          <h1 className="text-xl font-black text-white">BeUnicorn</h1>
          <p className="text-xs text-slate-400">Member Experience OS</p>
        </div>
      </div>

      <nav className="space-y-2">
        {links.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/app"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${
                  isActive
                    ? "bg-yellow-300 text-black"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <button
        onClick={logout}
        className="absolute bottom-5 left-5 right-5 flex items-center justify-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-sm text-slate-300 hover:bg-red-500/10 hover:text-red-300"
      >
        <LogOut className="h-4 w-4" />
        Exit 
      </button>
    </aside>
  );
}