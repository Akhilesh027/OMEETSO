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

  if (!isTestMode) {
    return (
      <div className={`overflow-hidden rounded-2xl bg-card border border-border/80 shadow-xs hover:border-primary/40 transition-all ${className}`}>
        <div className="flex items-center justify-between px-3 pt-2.5 pb-1">
          <span className="inline-flex items-center gap-1 rounded-full bg-navy text-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
            <Sparkles className="h-2.5 w-2.5" /> Ad · Sponsored
          </span>
          <span className="text-[10px] text-muted-foreground font-medium">Google Partner</span>
        </div>
        <div className="p-2">
          <GoogleAdSlot slotId={slotId} format="in-feed" responsive={true} />
        </div>
      </div>
    );
  }

  // Polished Native In-Feed Preview matching Omeetso ProductCard style
  return (
    <div className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-b from-card to-card/60 border border-primary/25 hover:border-primary/50 shadow-sm hover:shadow-md transition-all ${className}`}>
      {/* Top Banner Ribbon */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-indigo-950/20 via-primary/10 to-amber-500/10 flex flex-col items-center justify-center p-4 text-center border-b border-border/60">
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
      <div className="p-3.5 flex flex-col justify-between flex-1 space-y-2.5">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground">Google In-Feed Unit</span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              Safe & Relevant
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground/90 line-clamp-2">
            Automated Google contextual ad rendered in the middle of listings.
          </p>
        </div>

        <div className="pt-1 border-t border-border/40 flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground font-semibold">Ad · Google</span>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-primary group-hover:translate-x-0.5 transition-transform">
            {ctaText} <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
}
