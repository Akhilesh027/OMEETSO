import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import { BillingSummary, SectionTitle, PlacementRow } from "@/components/omeetso/revenue";
import {
  computeTotals, totalCredits, getWallet, upsertPromotion, newId, formatINR,
  seedRevenueIfEmpty, debitWallet, consumeCredits, addInvoice, getBilling,
  PLACEMENTS, type PlacementId,
} from "@/lib/revenue";
import { getListing } from "@/lib/listings";
import { getStore } from "@/lib/stores";
import { toast } from "sonner";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

type SearchParams = { listingId?: string; storeId?: string; productId?: string; kind?: "listing" | "store" | "store_product" };

export const Route = createFileRoute("/promotions/custom")({
  head: () => ({ meta: [{ title: "Custom promotion — Omeetso" }] }),
  validateSearch: (s: Record<string, unknown>): SearchParams => ({
    listingId: s.listingId as string | undefined,
    storeId: s.storeId as string | undefined,
    productId: s.productId as string | undefined,
    kind: (s.kind as any) ?? "listing",
  }),
  component: CustomPromotion,
});

function CustomPromotion() {
  const s = useSearch({ from: "/promotions/custom" });
  const nav = useNavigate();
  useEffect(() => { seedRevenueIfEmpty(); }, []);

  const [duration, setDuration] = useState(7);
  const [dailyBudget, setDailyBudget] = useState(100);
  const [totalBudget, setTotalBudget] = useState(700);
  const [area, setArea] = useState("Madhapur");
  const [radius, setRadius] = useState(5);
  const [placements, setPlacements] = useState<PlacementId[]>(["SEARCH_TOP", "HIGHLIGHTED_CARD"]);
  const [badge, setBadge] = useState<"featured" | "urgent">("featured");
  const [busy, setBusy] = useState(false);

  const credits = totalCredits();
  const totals = useMemo(() => computeTotals(totalBudget, credits), [totalBudget, credits]);
  const wallet = getWallet();

  const submit = () => {
    if (busy) return;
    if (dailyBudget < 20) { toast.error("Minimum daily budget ₹20"); return; }
    if (totalBudget < dailyBudget) { toast.error("Total budget must be ≥ daily budget"); return; }
    setBusy(true);
    const promoId = newId("PR");
    const ok = debitWallet(totals.total, { title: `Custom promotion`, type: "promotion", promotionId: promoId, paymentMethod: "Omeetso Wallet" });
    if (!ok) { setBusy(false); toast.error("Insufficient wallet balance. Add money to continue."); return; }
    if (totals.credits > 0) consumeCredits(totals.credits);

    const target = s.kind === "store" ? { kind: "store" as const, refId: s.storeId! }
      : s.kind === "store_product" ? { kind: "store_product" as const, refId: s.productId! }
      : { kind: "listing" as const, refId: s.listingId! };

    upsertPromotion({
      id: promoId, target, objective: "views",
      packageId: "custom", packageName: "Custom Promotion", duration,
      placements, areas: [area], radiusKm: radius,
      startAt: Date.now(), endAt: Date.now() + duration * 86400000,
      baseAmount: totals.baseAmount, tax: totals.gst, creditsApplied: totals.credits, totalAmount: totals.total,
      paymentMethod: "Omeetso Wallet", paymentId: newId("PAY"),
      status: "active", createdAt: Date.now(), updatedAt: Date.now(), amountSpent: 0,
      customBudget: { daily: dailyBudget, total: totalBudget },
      analytics: {
        impressions: 0, views: 0, saves: 0, chats: 0, calls: 0, offers: 0, shares: 0,
        organicViews: 0, promotedViews: 0, daily: [], byArea: [], byPlacement: [],
      },
    });

    addInvoice({
      id: newId("INV"), number: `OMS/2026/${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: Date.now(), service: "Custom Promotion", promotionId: promoId,
      baseAmount: totals.baseAmount, tax: totals.gst, discount: 0, creditsUsed: totals.credits, total: totals.total,
      paymentMethod: "Omeetso Wallet", status: "paid", billing: getBilling(),
    });

    toast.success("Custom promotion activated");
    nav({ to: "/promotions/$id", params: { id: promoId } });
  };

  const estMin = Math.round(dailyBudget * duration * 25);
  const estMax = Math.round(dailyBudget * duration * 40);

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-32">
        <BackBar title="Custom promotion" />
        <div className="px-4 pt-2 space-y-3">
          <SectionTitle>Duration & budget</SectionTitle>
          <div className="rounded-2xl border border-border bg-card p-3 space-y-2 text-xs">
            <NumberField label="Duration (days)" value={duration} onChange={setDuration} min={1} />
            <NumberField label="Daily budget (₹)" value={dailyBudget} onChange={setDailyBudget} min={20} />
            <NumberField label="Total budget (₹)" value={totalBudget} onChange={setTotalBudget} min={20} />
          </div>

          <SectionTitle>Target</SectionTitle>
          <div className="rounded-2xl border border-border bg-card p-3 space-y-2 text-xs">
            <label className="block">
              <span className="text-[11px] font-semibold">Area</span>
              <input value={area} onChange={(e) => setArea(e.target.value)} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 outline-none" />
            </label>
            <p className="text-[11px] font-semibold">Radius</p>
            <div className="flex gap-2">
              {[2, 5, 10, 20].map((r) => (
                <button key={r} onClick={() => setRadius(r)} className={cn("rounded-full border px-3 py-1 text-xs font-semibold",
                  radius === r ? "border-primary bg-primary/10 text-primary" : "border-border")}>{r} km</button>
              ))}
            </div>
          </div>

          <SectionTitle>Placement</SectionTitle>
          {PLACEMENTS.filter((p) => p.kind !== "ad").map((p) => (
            <PlacementRow key={p.id} id={p.id} selected={placements.includes(p.id)}
              onToggle={() => setPlacements((cur) => cur.includes(p.id) ? cur.filter((x) => x !== p.id) : [...cur, p.id])} />
          ))}

          <p className="text-[11px] font-semibold">Badge</p>
          <div className="flex gap-2">
            {(["featured", "urgent"] as const).map((b) => (
              <button key={b} onClick={() => setBadge(b)} className={cn("rounded-full border px-3 py-1 text-xs font-semibold capitalize",
                badge === b ? "border-primary bg-primary/10 text-primary" : "border-border")}>{b}</button>
            ))}
          </div>

          <div className="rounded-2xl bg-secondary/40 p-3 text-xs">
            <p className="text-[10px] font-bold uppercase text-muted-foreground">Estimated using sample frontend data</p>
            <p>Estimated visibility: <b>{estMin.toLocaleString()}–{estMax.toLocaleString()} impressions</b></p>
          </div>

          <BillingSummary base={totals.baseAmount} tax={totals.gst} credits={totals.credits} total={totals.total} />
          <p className="text-[10px] text-muted-foreground">Wallet balance: {formatINR(wallet.balance)}</p>
        </div>

        <div className="fixed inset-x-0 bottom-0 z-10 mx-auto max-w-[430px] border-t border-border bg-card p-3 safe-b">
          <button onClick={submit} disabled={busy} className="w-full rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-70">
            {busy ? "Processing…" : `Activate — ${formatINR(totals.total)}`}
          </button>
        </div>
      </div>
    </MobileFrame>
  );
}

function NumberField({ label, value, onChange, min }: { label: string; value: number; onChange: (n: number) => void; min: number }) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold">{label}</span>
      <input type="number" min={min} value={value} onChange={(e) => onChange(Number(e.target.value || 0))}
        className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none" />
    </label>
  );
}
