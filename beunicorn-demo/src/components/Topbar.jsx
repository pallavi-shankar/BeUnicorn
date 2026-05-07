import { Bell, Menu, Sparkles } from "lucide-react";
import { currentUser } from "../data/demoData";

export default function Topbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#07060a]/70 px-4 py-4 backdrop-blur-2xl lg:ml-72 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-sm text-yellow-200">
            <Sparkles className="h-4 w-4" />
            Premium coworking control center
          </p>
          <h2 className="mt-1 text-xl font-black text-white md:text-2xl">
            Welcome, {currentUser.name}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button className="rounded-2xl border border-white/10 bg-white/5 p-3 lg:hidden">
            <Menu className="h-5 w-5 text-white" />
          </button>

          <button className="relative rounded-2xl border border-white/10 bg-white/5 p-3">
            <Bell className="h-5 w-5 text-white" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-yellow-300" />
          </button>

          <div className="hidden items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 md:flex">
            <div className="gold-gradient flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold text-black">
              AM
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                {currentUser.role}
              </p>
              <p className="text-xs text-slate-400">{currentUser.company}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}