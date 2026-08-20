import { Link, useNavigate } from "@tanstack/react-router";
import { X, Package, Zap, Store, ArrowRight, Sparkles, Wrench, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

interface SellTypeModalProps {
  open: boolean;
  onClose: () => void;
}

export function SellTypeModal({ open, onClose }: SellTypeModalProps) {
  const navigate = useNavigate();

  if (!open) return null;

  const handleSelect = (to: string) => {
    onClose();
    navigate({ to: to as any });
  };

  const sellOptions = [
    {
      id: "regular",
      title: "Regular Sell",
      subtitle: "List electronics, cars, fashion, properties & items with custom details.",
      badge: "Standard 0% Fee",
      badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      icon: Package,
      iconBg: "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20",
      to: "/sell",
    },
    {
      id: "services",
      title: "Offer a Service",
      subtitle: "List AC repair, deep cleaning, electricians, tutors, salon & professional services.",
      badge: "🛠️ Services Pro",
      badgeColor: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
      icon: Wrench,
      iconBg: "bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-md shadow-rose-500/20",
      to: "/services/new",
    },
    {
      id: "jobs",
      title: "Post a Job",
      subtitle: "Hire local & remote staff with salary packages & walk-in drive options.",
      badge: "💼 Careers",
      badgeColor: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
      icon: Briefcase,
      iconBg: "bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md shadow-violet-500/20",
      to: "/jobs/new",
    },
    {
      id: "quick",
      title: "Quick Sell",
      subtitle: "Fast 1-click clearance deal with instant urgent discount tag for quick cash.",
      badge: "🔥 Fast Clearance",
      badgeColor: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
      icon: Zap,
      iconBg: "bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/30",
      to: "/sell/quick",
    },
    {
      id: "store",
      title: "Store Update",
      subtitle: "Setup local business profile, manage shop catalog & publish store deals.",
      badge: "🏪 Business",
      badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      icon: Store,
      iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20",
      to: "/sell/store",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4">
      {/* Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Action Sheet Container */}
      <div className="relative w-full max-w-[440px] rounded-t-[32px] sm:rounded-[32px] bg-card border border-border/80 p-5 sm:p-6 shadow-2xl z-50 animate-in slide-in-from-bottom-8 duration-300">
        
        {/* Handle bar */}
        <div className="w-12 h-1.5 rounded-full bg-muted-foreground/20 mx-auto mb-4" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-black text-amber-500 uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5 fill-amber-500" /> Start Selling
            </div>
            <h3 className="text-xl font-black text-foreground">Choose Sell Option</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full bg-surface-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 3 Round Shape Tabs Options */}
        <div className="mt-3 space-y-3.5">
          {sellOptions.map((opt) => {
            const Icon = opt.icon;
            return (
              <div
                key={opt.id}
                onClick={() => handleSelect(opt.to)}
                className="group relative flex items-center gap-4 rounded-[24px] border border-border/80 bg-surface-1/80 hover:bg-amber-500/5 dark:hover:bg-amber-500/10 hover:border-amber-400/50 p-4 transition-all duration-200 cursor-pointer shadow-xs active:scale-[0.98]"
              >
                {/* Round Shape Icon Container */}
                <div className={cn("grid h-14 w-14 shrink-0 place-items-center rounded-full transition-transform group-hover:scale-110", opt.iconBg)}>
                  <Icon className="h-6 w-6 stroke-[2.5]" />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-black text-foreground group-hover:text-amber-500 transition-colors">
                      {opt.title}
                    </h4>
                    <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-black", opt.badgeColor)}>
                      {opt.badge}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-snug line-clamp-2">
                    {opt.subtitle}
                  </p>
                </div>

                {/* Round Shape Arrow Button */}
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary text-muted-foreground group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors shadow-2xs">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="mt-4 pt-3 border-t border-border/50 text-center">
          <p className="text-[11px] text-muted-foreground font-medium">
            ⚡ 100% Free posting · Reach 10,000+ local buyers nearby
          </p>
        </div>

      </div>
    </div>
  );
}
