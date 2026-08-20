import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import { listCredits, seedRevenueIfEmpty, subscribe, formatINR, formatDate } from "@/lib/revenue";
import { Gift } from "lucide-react";

export const Route = createFileRoute("/credits/wallet")({
  head: () => ({ meta: [{ title: "Promotional credits — Omeetso" }] }),
  component: Credits,
});

export default function Credits() {
  const [, setTick] = useState(0);
  useEffect(() => {
    seedRevenueIfEmpty();
    const u = subscribe(() => setTick((n) => n + 1));
    return () => { u(); };
  }, []);
  const list = listCredits();
  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-16 font-sans">
        <BackBar title="Promotional credits" />
        <div className="px-4">
          {list.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
              <Gift className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm font-bold">No promotional credits</p>
              <p className="text-xs text-muted-foreground">Credits appear here when Omeetso awards them.</p>
            </div>
          ) : list.map((c) => (
            <div key={c.id} className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-900/40 p-4 shadow-sm">
              <div className="flex items-baseline justify-between">
                <p className="text-base font-extrabold text-emerald-800 dark:text-emerald-300">{formatINR(c.amount)}</p>
                <Gift className="h-5 w-5 text-emerald-600" />
              </div>
              <p className="mt-0.5 text-xs font-bold text-foreground">{c.source}</p>
              <p className="mt-1 text-[11px] text-emerald-800 dark:text-emerald-400">Eligible services: {c.eligibleFor.join(", ").replaceAll("_", " ")}</p>
              <p className="text-[11px] text-emerald-800 dark:text-emerald-400">Expires: {formatDate(c.expiresAt)}</p>
              <p className="mt-1 text-[10px] text-emerald-700 dark:text-emerald-500">Non-refundable • Cannot be withdrawn.</p>
            </div>
          ))}
        </div>
      </div>
    </MobileFrame>
  );
}
