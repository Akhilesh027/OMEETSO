import React from "react";
import { Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { GoogleAdSlot } from "./GoogleAdSlot";

interface InFeedGoogleAdProps {
  slotId?: string;
  className?: string;
  title?: string;
  description?: string;
  ctaText?: string;
}

export function InFeedGoogleAd({
  slotId = "8899001122",
  className = "",
  title = "Discover Nearby Brands & Top Deals",
  description = "Sponsored partner recommendations matching your current shopping preferences.",
  ctaText = "Learn More"
}: InFeedGoogleAdProps) {
  const isTestMode = import.meta.env.VITE_GOOGLE_ADSENSE_TEST_MODE === "true" ||
    (import.meta.env.VITE_GOOGLE_ADSENSE_CLIENT_ID || "").includes("00000000");

  return (
    <div className={`group relative flex flex-col h-full rounded-3xl border border-border/80 bg-card p-3 sm:p-4 hover:border-primary/50 hover:shadow-xl transition-all duration-300 ${className}`}>
      {/* Top Banner Ribbon matching ProductCard image area */}
      <div className="relative aspect-[4/3] sm:aspect-[16/11] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950/20 via-primary/10 to-amber-500/10 flex flex-col items-center justify-center p-4 text-center border border-border/40 shrink-0">
        <div className="absolute top-2.5 left-2.5 z-10">
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/90 text-amber-300 border border-amber-400/30 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider shadow-xs backdrop-blur-sm">
            <Sparkles className="h-2.5 w-2.5 fill-amber-300" /> Ad · Sponsored
          </span>
        </div>

        <div className="space-y-1.5 z-10 max-w-[220px]">
          <span className="inline-flex items-center gap-1 text-[11px] font-black text-primary uppercase tracking-widest">
            <ShieldCheck className="h-3.5 w-3.5" /> Verified Ad
          </span>
          <h4 className="text-sm font-black text-foreground line-clamp-2 leading-tight">
            {title}
          </h4>
          <p className="text-[11px] text-muted-foreground line-clamp-2 font-medium">
            {description}
          </p>
        </div>

        {/* Ambient subtle glow */}
        <div className="absolute -bottom-8 -right-8 h-28 w-28 rounded-full bg-primary/15 blur-xl pointer-events-none" />
      </div>

      {/* Card Content & CTA matching ProductCard footer */}
      <div className="px-1 pt-3 flex-1 flex flex-col justify-between min-h-0">
        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-none">
              Special Offer
            </span>
            <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-600 shrink-0">
              Verified
            </span>
          </div>

          <p className="mt-2 line-clamp-2 h-9 sm:h-10 text-xs sm:text-sm font-extrabold text-foreground leading-snug">
            {description}
          </p>

          <div className="h-5 mt-1">
            <p className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 truncate">
              <Sparkles className="h-3 w-3 shrink-0" /> Google Verified Partner
            </p>
          </div>
        </div>

        <div className="mt-auto pt-2.5 flex items-center justify-between text-xs text-muted-foreground border-t border-border/60">
          <span className="text-[10px] text-muted-foreground font-semibold">Ad · Google</span>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-primary group-hover:translate-x-0.5 transition-transform">
            {ctaText} <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
}
