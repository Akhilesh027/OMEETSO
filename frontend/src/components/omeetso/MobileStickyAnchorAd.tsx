import React, { useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { X, Sparkles } from "lucide-react";
import { GoogleAdSlot } from "./GoogleAdSlot";

export function MobileStickyAnchorAd() {
  const [dismissed, setDismissed] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  // Do not show sticky anchor ads on immersive screens (chat, verification, login, full screen camera)
  const isExcluded =
    path.startsWith("/chat") ||
    path.startsWith("/login") ||
    path.startsWith("/register") ||
    path.startsWith("/otp") ||
    path.startsWith("/verification") ||
    path.startsWith("/sell/quick") ||
    path.startsWith("/sell/detailed");

  if (dismissed || isExcluded) return null;

  return (
    <aside
      aria-label="Sponsored advertisement"
      className="fixed bottom-16 left-0 right-0 z-30 mx-auto w-full max-w-[430px] px-2 md:hidden animate-in slide-in-from-bottom-2 duration-300"
    >
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card/95 backdrop-blur-md shadow-lg p-2">
        <div className="flex items-center justify-between pb-1 px-1 border-b border-border/40 text-[10px] text-muted-foreground font-semibold">
          <span className="inline-flex items-center gap-1 text-primary font-bold">
            <Sparkles className="h-2.5 w-2.5" /> Ad · Sponsored
          </span>
          <button
            type="button"
            aria-label="Close advertisement"
            onClick={() => setDismissed(true)}
            className="grid h-5 w-5 place-items-center rounded-full hover:bg-secondary text-muted-foreground transition-colors cursor-pointer"
          >
            <X className="h-3 w-3" />
          </button>
        </div>

        <div className="pt-1">
          <GoogleAdSlot
            slotId="1122334455"
            format="horizontal"
            title="Special Offers Near You"
            fallbackLabel="Explore curated deals from verified partners."
            className="!min-h-[50px] !py-1"
          />
        </div>
      </div>
    </aside>
  );
}
