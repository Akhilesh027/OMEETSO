import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import { PromotionStatusBadge, SectionTitle, ConfirmModal } from "@/components/omeetso/revenue";
import { getPromotion, setPromotionStatus, extendPromotion, increasePromotionBudget, formatINR, formatDate, subscribe } from "@/lib/revenue";
import { getListing } from "@/lib/listings";
import { getStore } from "@/lib/stores";
import { useEffect } from "react";
import { PauseCircle, PlayCircle, TrendingUp, Plus, Wallet, FileText, XCircle, ArrowRight, MapPin } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/promotions/$id")({
  head: () => ({ meta: [{ title: "Promotion details — Omeetso" }] }),
  component: PromotionDetails,
});

function PromotionDetails() {
  const { id } = useParams({ from: "/promotions/$id" });
  const nav = useNavigate();
  const [, setTick] = useState(0);
  useEffect(() => { const u = subscribe(() => setTick((n) => n + 1)); return () => { u(); }; }, []);
  const [confirmEnd, setConfirmEnd] = useState(false);

  const p = getPromotion(id);
  if (!p) return (
    <MobileFrame>
      <div className="min-h-dvh p-6 text-center">
        <p className="mt-16 text-sm text-muted-foreground">Promotion not found.</p>
        <Link to="/promotions" className="mt-3 inline-block rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">Back to Promotions</Link>
      </div>
    </MobileFrame>
  );

  const target = p.target.kind === "listing" ? getListing(p.target.refId)
    : p.target.kind === "store" ? getStore(p.target.refId)
    : undefined;

  const remainingDays = Math.max(0, Math.ceil((p.endAt - Date.now()) / 86400000));

  const togglePause = () => {
    if (p.status === "active") { setPromotionStatus(id, "paused"); toast.success("Promotion paused"); }
    else if (p.status === "paused") { setPromotionStatus(id, "active"); toast.success("Promotion resumed"); }
  };

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-24">
        <BackBar title="Promotion details" />

        <div className="mx-4 mt-2 rounded-2xl bg-card p-3 card-elev">
          <div className="flex items-center justify-between">
            <p className="text-sm font-extrabold">{p.packageName}</p>
            <PromotionStatusBadge status={p.status} />
          </div>
          <p className="text-[11px] text-muted-foreground">ID: {p.id}</p>
          {target && "title" in target && (
            <div className="mt-2 flex gap-2 rounded-xl bg-secondary/40 p-2">
              {(target as any).images?.[0] && <img src={(target as any).images[0]} alt="" className="h-10 w-10 rounded-lg object-cover" />}
              <p className="line-clamp-2 text-xs font-semibold">{(target as any).title}</p>
            </div>
          )}
        </div>

        <div className="mx-4 mt-3 grid grid-cols-3 gap-2 text-center">
          <Stat label="Impressions" value={p.analytics.impressions.toLocaleString()} />
          <Stat label="Views" value={p.analytics.views.toLocaleString()} />
          <Stat label="Chats" value={p.analytics.chats.toLocaleString()} />
          <Stat label="Saves" value={p.analytics.saves.toLocaleString()} />
          <Stat label="Calls" value={p.analytics.calls.toLocaleString()} />
          <Stat label="Offers" value={p.analytics.offers.toLocaleString()} />
        </div>

        <div className="mx-4 mt-4 space-y-2">
          <SectionTitle>Details</SectionTitle>
          <div className="rounded-2xl border border-border bg-card p-3 text-xs space-y-1">
            <Row label="Placements" value={p.placements.length + " selected"} />
            <Row label="Target areas" value={p.areas.join(", ")} icon={MapPin} />
            <Row label="Start date" value={formatDate(p.startAt)} />
            <Row label="End date" value={formatDate(p.endAt)} />
            <Row label="Remaining" value={`${remainingDays} day${remainingDays === 1 ? "" : "s"}`} />
            <Row label="Budget" value={formatINR(p.totalAmount)} />
            <Row label="Amount spent" value={formatINR(p.amountSpent)} />
          </div>
        </div>

        <div className="mx-4 mt-4 grid grid-cols-2 gap-2">
          {(p.status === "active" || p.status === "paused") && (
            <button onClick={togglePause} className="flex items-center justify-center gap-1.5 rounded-2xl border border-border bg-card p-3 text-xs font-semibold">
              {p.status === "active" ? <><PauseCircle className="h-4 w-4" /> Pause</> : <><PlayCircle className="h-4 w-4" /> Resume</>}
            </button>
          )}
          <button onClick={() => { extendPromotion(id, 7); toast.success("Extended by 7 days"); }}
            className="flex items-center justify-center gap-1.5 rounded-2xl border border-border bg-card p-3 text-xs font-semibold">
            <Plus className="h-4 w-4" /> Extend 7 days
          </button>
          <button onClick={() => { increasePromotionBudget(id, 100); toast.success("Added ₹100 to budget"); }}
            className="flex items-center justify-center gap-1.5 rounded-2xl border border-border bg-card p-3 text-xs font-semibold">
            <Wallet className="h-4 w-4" /> Add ₹100
          </button>
          <Link to="/promotions/$id/analytics" params={{ id }}
            className="flex items-center justify-center gap-1.5 rounded-2xl border border-border bg-card p-3 text-xs font-semibold">
            <TrendingUp className="h-4 w-4" /> View Analytics
          </Link>
          <Link to="/invoice/$id" params={{ id: p.id }}
            className="flex items-center justify-center gap-1.5 rounded-2xl border border-border bg-card p-3 text-xs font-semibold">
            <FileText className="h-4 w-4" /> Invoice
          </Link>
          {p.target.kind === "listing" && (
            <Link to="/listing/$id/manage" params={{ id: p.target.refId }}
              className="flex items-center justify-center gap-1.5 rounded-2xl border border-border bg-card p-3 text-xs font-semibold">
              View Listing <ArrowRight className="h-4 w-4" />
            </Link>
          )}
          <button onClick={() => setConfirmEnd(true)}
            className="col-span-2 mt-2 flex items-center justify-center gap-1.5 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-700">
            <XCircle className="h-4 w-4" /> End Promotion
          </button>
        </div>

        {p.status === "expired" && (
          <div className="mx-4 mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            This promotion has expired. <Link to="/promotions/new" search={{ listingId: p.target.refId, kind: "listing" } as any} className="font-bold underline">Renew Promotion</Link>
          </div>
        )}

        <ConfirmModal
          open={confirmEnd}
          title="End this promotion?"
          body="Unused mock budget will be returned to the Omeetso Wallet."
          confirmLabel="End Promotion"
          danger
          onCancel={() => setConfirmEnd(false)}
          onConfirm={() => { setPromotionStatus(id, "cancelled"); toast.success("Promotion ended"); setConfirmEnd(false); nav({ to: "/promotions" }); }}
        />
      </div>
    </MobileFrame>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-secondary/50 p-2">
      <p className="text-lg font-extrabold">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}
function Row({ label, value, icon: Ico }: { label: string; value: string; icon?: any }) {
  return (
    <div className="flex items-baseline justify-between py-0.5">
      <p className="flex items-center gap-1 text-[11px] text-muted-foreground">{Ico && <Ico className="h-3 w-3" />}{label}</p>
      <p className="text-xs font-semibold">{value}</p>
    </div>
  );
}
