import { Link, useRouterState } from "@tanstack/react-router";
import { Home, LayoutGrid, MessageCircle, User, Plus, Package, Zap, Store } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/categories", label: "Categories", icon: LayoutGrid },
  { to: "/chats", label: "Chats", icon: MessageCircle },
  { to: "/account", label: "Account", icon: User },
] as const;

export function BottomNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [fabOpen, setFabOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close fab menu if clicked outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFabOpen(false);
      }
    }
    if (fabOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [fabOpen]);

  // Close fab on route change
  useEffect(() => {
    setFabOpen(false);
  }, [path]);

  const fabActions = [
    {
      to: "/sell/store",
      label: "Store Update",
      sublabel: "Business Shop",
      icon: Store,
      color: "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30 border border-white/20",
    },
    {
      to: "/sell/quick",
      label: "Quick Sell",
      sublabel: "⚡ Urgent Deal",
      icon: Zap,
      color: "bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/35 border border-white/30 font-black",
    },
    {
      to: "/sell",
      label: "Regular Sell",
      sublabel: "Post Item",
      icon: Package,
      color: "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30 border border-white/20",
    },
  ];

  return (
    <>
      {/* Soft Backdrop Blur Overlay (Clicking anywhere on screen closes FAB menu) */}
      {fabOpen && (
        <div
          onClick={() => setFabOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-200"
        />
      )}

      <div ref={containerRef} className="fixed bottom-0 left-1/2 z-40 w-full max-w-[430px] -translate-x-1/2 md:hidden">
        
        {/* 3-Point Radial Arc Fan-Out Round Action Buttons (Left, Top Middle, Right - Curved Arch) */}
        <div className="relative w-full">
          
          {/* Left FAB: Regular Sell */}
          <Link
            to="/sell"
            onClick={() => setFabOpen(false)}
            className={cn(
              "absolute left-[24%] bottom-14 -translate-x-1/2 flex flex-col items-center gap-1 transition-all duration-300 transform active:scale-95 hover:scale-110",
              fabOpen
                ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                : "opacity-0 scale-50 translate-y-8 pointer-events-none"
            )}
          >
            <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-blue-500 via-indigo-600 to-indigo-700 text-white shadow-xl shadow-indigo-500/40 border-2 border-white/30">
              <Package className="h-5.5 w-5.5 stroke-[2.5]" />
            </div>
            <span className="rounded-full bg-slate-950/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-black text-white shadow-md border border-white/20">
              Regular
            </span>
          </Link>

          {/* Middle FAB: Quick Sell (Elevated center top) */}
          <Link
            to="/sell/quick"
            onClick={() => setFabOpen(false)}
            className={cn(
              "absolute left-1/2 bottom-24 -translate-x-1/2 flex flex-col items-center gap-1 transition-all duration-300 transform active:scale-95 hover:scale-110",
              fabOpen
                ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                : "opacity-0 scale-50 translate-y-8 pointer-events-none"
            )}
            style={{ transitionDelay: "40ms" }}
          >
            <div className="grid h-13.5 w-13.5 place-items-center rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-slate-950 shadow-2xl shadow-amber-500/50 ring-2 ring-amber-300 border-2 border-white/40">
              <Zap className="h-6 w-6 fill-slate-950 stroke-[2.5]" />
            </div>
            <span className="rounded-full bg-amber-400 text-slate-950 px-2.5 py-0.5 text-[10px] font-black shadow-md border border-amber-300">
              ⚡ Quick Sell
            </span>
          </Link>

          {/* Right FAB: Store Update */}
          <Link
            to="/sell/store"
            onClick={() => setFabOpen(false)}
            className={cn(
              "absolute right-[24%] bottom-14 translate-x-1/2 flex flex-col items-center gap-1 transition-all duration-300 transform active:scale-95 hover:scale-110",
              fabOpen
                ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                : "opacity-0 scale-50 translate-y-8 pointer-events-none"
            )}
            style={{ transitionDelay: "80ms" }}
          >
            <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-emerald-500 via-teal-600 to-teal-700 text-white shadow-xl shadow-teal-500/40 border-2 border-white/30">
              <Store className="h-5.5 w-5.5 stroke-[2.5]" />
            </div>
            <span className="rounded-full bg-slate-950/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-black text-white shadow-md border border-white/20">
              Store
            </span>
          </Link>

        </div>

      {/* Main Bottom Nav Bar */}
      <nav className="border-t border-border/80 bg-card/95 backdrop-blur-xl safe-b shadow-2xl">
        <div className="grid grid-cols-5 items-center px-2 py-1">
          {items.slice(0, 2).map(({ to, label, icon: Icon }) => {
            const active = path === to;
            return (
              <Link key={to} to={to} className="flex flex-col items-center gap-0.5 py-1.5 transition-all">
                <div className={cn("grid h-7 w-7 place-items-center rounded-xl transition-all", active ? "bg-primary/10 text-primary scale-110" : "text-muted-foreground")}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className={cn("text-[10px] font-bold tracking-tight transition-colors", active ? "text-primary font-black" : "text-muted-foreground")}>
                  {label}
                </span>
              </Link>
            );
          })}
          
          {/* Crisp Center Sell (+) FAB Toggle Button */}
          <button
            type="button"
            onClick={() => setFabOpen((prev) => !prev)}
            aria-label="Sell options on Omeetso"
            className="relative flex flex-col items-center -mt-5 active:scale-95 transition-transform group"
          >
            <div
              className={cn(
                "relative grid h-13 w-13 place-items-center rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-slate-950 shadow-xl shadow-amber-500/35 ring-4 ring-card hover:brightness-110 transition-all duration-300",
                fabOpen && "rotate-45 bg-slate-900 text-white ring-amber-400"
              )}
            >
              <Plus className="h-6.5 w-6.5 stroke-[3] transition-transform duration-300" />
            </div>
            <span className={cn("mt-0.5 text-[10px] font-black uppercase tracking-wider transition-colors", fabOpen ? "text-amber-400 font-extrabold" : "text-foreground")}>
              {fabOpen ? "Close" : "Sell"}
            </span>
          </button>

          {items.slice(2).map(({ to, label, icon: Icon }) => {
            const active = path === to;
            return (
              <Link key={to} to={to} className="flex flex-col items-center gap-0.5 py-1.5 transition-all">
                <div className={cn("grid h-7 w-7 place-items-center rounded-xl transition-all", active ? "bg-primary/10 text-primary scale-110" : "text-muted-foreground")}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className={cn("text-[10px] font-bold tracking-tight transition-colors", active ? "text-primary font-black" : "text-muted-foreground")}>
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  </>
);
}
