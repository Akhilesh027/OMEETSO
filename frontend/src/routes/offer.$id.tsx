import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import {
  seedIfEmpty, subscribe, getOffer, humanExpiry, getMe,
  acceptOffer, rejectOffer, withdrawOffer, type Offer,
} from "@/lib/chat";
import { PRODUCTS, SELLERS, formatINR } from "@/lib/mock";
import { OfferStatusBadge } from "@/components/omeetso/chat/OfferCard";
import { CounterOfferSheet } from "@/components/omeetso/chat/CounterOfferSheet";
import { BottomSheet } from "@/components/omeetso/BottomSheet";
import { HandCoins, MessageCircle, CheckCircle2, XCircle, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/offer/$id")({
  loader: ({ params }) => {
    if (typeof window !== "undefined") { seedIfEmpty(); if (!getOffer(params.id)) throw notFound(); }
    return { id: params.id };
  },
  head: () => ({ meta: [{ title: "Offer details — Omeetso" }] }),
  component: OfferDetails,
  notFoundComponent: () => <MobileFrame><div className="p-8 text-center text-sm">Offer not found.</div></MobileFrame>,
});

const REJECT_REASONS = [
  "Price too low", "Product no longer available", "Already discussing with another buyer", "Other",
];

function OfferDetails() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  const [tick, setTick] = useState(0);
  const [counter, setCounter] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState<string>("");

  useEffect(() => {
    const u = subscribe(() => setTick((x) => x + 1));
    return () => u();
  }, []);

  const o = useMemo(() => getOffer(id), [id, tick]) as Offer | undefined;
  if (!o) return null;
  const p = PRODUCTS.find((x) => x.id === o.productId);
  const seller = SELLERS.find((s) => s.id === o.sellerId);
  const me = getMe();
  const iAmSeller = o.sellerId === me.id;
  const active = o.status === "pending" || o.status === "countered";

  const doAccept = () => { acceptOffer(o.id); toast.success("Offer accepted"); nav({ to: "/transaction/$offerId", params: { offerId: o.id } }); };
  const doReject = () => { rejectOffer(o.id, reason || undefined); toast.success("Offer rejected"); setRejectOpen(false); };
  const doWithdraw = () => { withdrawOffer(o.id); toast.success("Offer withdrawn"); };

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-28">
        <BackBar title="Offer details" />

        {/* Product */}
        {p && (
          <Link to="/product/$id" params={{ id: p.id }} className="mx-3 mt-3 flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
            <img src={p.image} alt="" className="h-16 w-16 rounded-xl object-cover" />
            <div className="min-w-0 flex-1">
              <p className="line-clamp-1 text-sm font-semibold">{p.title}</p>
              <p className="text-[11px] text-muted-foreground">Listed at {formatINR(o.listedPrice)}</p>
              <p className="mt-0.5 text-base font-extrabold">{formatINR(o.amount)}</p>
            </div>
          </Link>
        )}

        {/* Header status */}
        <div className="mx-3 mt-3 flex items-center justify-between rounded-2xl bg-secondary/60 p-3">
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground">Status</p>
            <div className="mt-1"><OfferStatusBadge status={o.status} /></div>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-semibold text-muted-foreground">Expiry</p>
            <p className="mt-1 text-xs font-bold">{humanExpiry(o)}</p>
          </div>
        </div>

        {/* Parties */}
        <div className="mx-3 mt-3 grid grid-cols-2 gap-2">
          <Party label="Buyer" name={iAmSeller ? "Buyer" : me.name} />
          <Party label="Seller" name={seller?.name ?? "Seller"} verified={seller?.verified} />
        </div>

        {/* Timeline */}
        <div className="mx-3 mt-4">
          <p className="text-xs font-bold">Offer history</p>
          <ol className="mt-2 space-y-2 border-l-2 border-border pl-4">
            {o.history.map((h, i) => (
              <li key={i} className="relative">
                <span className="absolute -left-[19px] top-1 grid h-3.5 w-3.5 place-items-center rounded-full bg-primary">
                  <Sparkles className="h-2 w-2 text-primary-foreground" />
                </span>
                <p className="text-[11px] font-bold text-foreground">
                  {h.by === "buyer" ? "Buyer" : "Seller"} {h.action === "offer" ? "offered" : h.action === "counter" ? "countered" : h.action === "accept" ? "accepted" : h.action === "reject" ? "rejected" : h.action === "withdraw" ? "withdrew" : h.action === "expire" ? "expired" : "completed"} {formatINR(h.amount)}
                </p>
                {h.message && <p className="text-[11px] text-muted-foreground">"{h.message}"</p>}
                <p className="text-[10px] text-muted-foreground">{new Date(h.at).toLocaleString("en-IN")}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* Actions */}
        <div className="mx-3 mt-6 space-y-2">
          <Link to="/chat/$id" params={{ id: o.threadId }} className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-border text-sm font-bold">
            <MessageCircle className="h-4 w-4" /> Open conversation
          </Link>
          {active && iAmSeller && (
            <>
              <button onClick={doAccept} className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 text-sm font-bold text-white">
                <CheckCircle2 className="h-4 w-4" /> Accept {formatINR(o.amount)}
              </button>
              <button onClick={() => setCounter(true)} className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-navy text-sm font-bold text-white">
                <RotateCcw className="h-4 w-4" /> Send counteroffer
              </button>
              <button onClick={() => setRejectOpen(true)} className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-border text-sm font-bold text-destructive">
                <XCircle className="h-4 w-4" /> Reject offer
              </button>
            </>
          )}
          {active && !iAmSeller && (
            <>
              <button onClick={() => setCounter(true)} className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-navy text-sm font-bold text-white">
                <HandCoins className="h-4 w-4" /> Update offer
              </button>
              <button onClick={doWithdraw} className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-border text-sm font-bold text-destructive">
                Withdraw offer
              </button>
            </>
          )}
          {o.status === "accepted" && (
            <Link to="/transaction/$offerId" params={{ offerId: o.id }}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-sm font-bold text-primary-foreground">
              <CheckCircle2 className="h-4 w-4" /> Coordinate transaction
            </Link>
          )}
        </div>

        <p className="mx-6 mt-6 text-center text-[11px] text-muted-foreground">
          Omeetso does not hold or transfer payments. Complete the exchange directly and safely.
        </p>

        <CounterOfferSheet open={counter} onClose={() => setCounter(false)} offer={o} by={iAmSeller ? "seller" : "buyer"} />
        <BottomSheet open={rejectOpen} onClose={() => setRejectOpen(false)} title="Reject this offer?"
          footer={
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setRejectOpen(false)} className="h-11 rounded-2xl border border-border text-sm font-bold">Cancel</button>
              <button onClick={doReject} className="h-11 rounded-2xl bg-destructive text-sm font-bold text-destructive-foreground">Reject offer</button>
            </div>
          }>
          <p className="text-xs text-muted-foreground">Choose an optional reason. The buyer may see this.</p>
          <div className="mt-3 space-y-1.5">
            {REJECT_REASONS.map((r) => (
              <button key={r} onClick={() => setReason(r)}
                className={`flex w-full items-center justify-between rounded-2xl border p-3 text-sm ${reason === r ? "border-primary bg-primary/5 font-bold" : "border-border bg-card"}`}
              >
                {r}
                <span className={`h-4 w-4 rounded-full border-2 ${reason === r ? "border-primary bg-primary" : "border-border"}`} />
              </button>
            ))}
          </div>
        </BottomSheet>
      </div>
    </MobileFrame>
  );
}

function Party({ label, name, verified }: { label: string; name: string; verified?: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3">
      <p className="text-[11px] font-semibold text-muted-foreground">{label}</p>
      <p className="mt-1 flex items-center gap-1 text-sm font-bold">
        {name}
        {verified && <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">Verified</span>}
      </p>
    </div>
  );
}
