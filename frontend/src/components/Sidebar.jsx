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
import {
  getActivePortal,
  getActiveUser,
  isAdminRole,
  logoutActivePortal,
} from "../utils/auth";

const memberLinks = [
  { label: "Dashboard", path: "/member", icon: Home },
  { label: "Book Spaces", path: "/member/bookings", icon: CalendarDays },
  { label: "Wallet", path: "/member/wallet", icon: Wallet },
  { label: "Notifications", path: "/member/notifications", icon: Bell },
];

const adminLinks = [
  { label: "Admin Console", path: "/admin", icon: ShieldCheck },
  { label: "Analytics Dashboard", path: "/admin/dashboard", icon: Home },
  { label: "Bookings", path: "/admin/bookings", icon: CalendarDays },
  { label: "Onboarding", path: "/admin/onboarding", icon: Route },
  { label: "Wallet", path: "/admin/wallet", icon: Wallet },
  { label: "Access", path: "/admin/access", icon: KeyRound },
  { label: "Printing", path: "/admin/printing", icon: Printer },
  { label: "Payments & KYC", path: "/admin/payments", icon: CreditCard },
  { label: "IoT Controls", path: "/admin/iot", icon: SlidersHorizontal },
  { label: "Notifications", path: "/admin/notifications", icon: Bell },
  { label: "Integrations", path: "/admin/integrations", icon: Layers },
  { label: "Roadmap", path: "/admin/roadmap", icon: Zap },
];

export default function Sidebar() {
  const navigate = useNavigate();

  const user = getActiveUser();
  const portal = getActivePortal();
  const isAdmin = portal === "admin" || isAdminRole(user?.role);

  const links = isAdmin ? adminLinks : memberLinks;

  const logout = () => {
    logoutActivePortal();
    navigate("/login");
  };

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-72 border-r border-white/10 bg-black/50 p-5 backdrop-blur-2xl lg:block">
      <div className="mb-8 flex items-center gap-3">
        <div className="gold-gradient flex h-12 w-12 items-center justify-center rounded-2xl text-xl font-black text-black">
          B
        </div>

        <div>
          <h1 className="text-xl font-black text-white">BeUnicorn</h1>
          <p className="text-xs text-slate-400">
            {isAdmin ? "Operations Console" : "Member Portal"}
          </p>
        </div>
      </div>

      <div className="mb-5 rounded-3xl border border-white/10 bg-white/5 p-4">
        <p className="text-sm font-bold text-white">
          {user?.name || "BeUnicorn User"}
        </p>
        <p className="mt-1 break-all text-xs text-slate-400">{user?.email}</p>
        <span className="mt-3 inline-block rounded-full bg-yellow-300/10 px-3 py-1 text-xs font-bold text-yellow-200">
          {user?.role || "member"}
        </span>
      </div>

      <nav className="space-y-2">
        {links.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/admin" || item.path === "/member"}
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
        Logout {isAdmin ? "Admin" : "Member"}
      </button>
    </aside>
  );
}