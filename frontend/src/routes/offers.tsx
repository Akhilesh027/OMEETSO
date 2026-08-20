import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import { BottomNav } from "@/components/omeetso/BottomNav";
import { EmptyState } from "@/components/omeetso/EmptyState";
import { HandCoins, MessageCircle } from "lucide-react";
import {
  seedIfEmpty, subscribe, getOffers, refreshExpiries, humanExpiry, getMe,
  type Offer,
} from "@/lib/chat";
import { PRODUCTS, formatINR } from "@/lib/mock";
import { OfferStatusBadge } from "@/components/omeetso/chat/OfferCard";

export const Route = createFileRoute("/offers")({
  head: () => ({ meta: [
    { title: "Offers — Omeetso" },
    { name: "description", content: "Offers you have sent and received on Omeetso listings." },
  ]}),
  component: OffersPage,
});

type Direction = "Received" | "Sent";
type Status = "Pending" | "Countered" | "Accepted" | "Rejected" | "Withdrawn" | "Expired";

const RECEIVED: Status[] = ["Pending", "Countered", "Accepted", "Rejected", "Expired"];
const SENT: Status[] = ["Pending", "Countered", "Accepted", "Rejected", "Withdrawn", "Expired"];

function OffersPage() {
  const [dir, setDir] = useState<Direction>("Received");
  const [status, setStatus] = useState<Status>("Pending");
  const [tick, setTick] = useState(0);
  useEffect(() => {
    seedIfEmpty(); refreshExpiries();
    const u = subscribe(() => setTick((x) => x + 1));
    return () => u();
  }, []);

  const offers = useMemo(() => getOffers(), [tick]);
  const me = getMe();

  const list = useMemo(() => {
    const scoped = offers.filter((o) => dir === "Received" ? o.sellerId === me.id : o.buyerId === me.id);
    return scoped.filter((o) => o.status.toLowerCase() === status.toLowerCase());
  }, [offers, dir, status, me.id]);

  const statuses = dir === "Received" ? RECEIVED : SENT;
  if (!statuses.includes(status)) setStatus(statuses[0]);

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-28">
        <BackBar title="Offers" />
        <div className="mx-3 mt-3 grid grid-cols-2 rounded-full bg-secondary p-1 text-xs font-bold">
          {(["Received", "Sent"] as Direction[]).map((d) => (
            <button
              key={d}
              onClick={() => setDir(d)}
              className={`rounded-full py-2 ${dir === d ? "bg-navy text-white" : "text-muted-foreground"}`}
            >{d}</button>
          ))}
        </div>

        <div className="mt-3 flex gap-1 overflow-x-auto border-b border-border px-2 no-scrollbar">
          {statuses.map((s) => (
            <button
              key={s} onClick={() => setStatus(s)}
              className={`shrink-0 border-b-2 px-3 py-2.5 text-xs font-semibold ${status === s ? "border-navy text-navy" : "border-transparent text-muted-foreground"}`}
            >
              {s}
            </button>
          ))}
        </div>

        {list.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={<HandCoins className="h-6 w-6 text-primary" />}
              title={dir === "Received" ? "No offers received yet" : "No offers sent yet"}
              body={dir === "Received" ? "When buyers offer prices, they'll appear here." : "Make an offer on a product to negotiate with the seller."}
            />
          </div>
        ) : (
          <div className="mt-2 space-y-2 px-3">
            {list.map((o) => <OfferRow key={o.id} o={o} dir={dir} />)}
          </div>
        )}

        <BottomNav />
      </div>
    </MobileFrame>
  );
}

function OfferRow({ o, dir }: { o: Offer; dir: Direction }) {
  const p = PRODUCTS.find((x) => x.id === o.productId);
  return (
    <Link
      to="/offer/$id" params={{ id: o.id }}
      className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3"
    >
      {p?.image && <img src={p.image} alt="" className="h-14 w-14 rounded-xl object-cover" />}
      <div className="min-w-0 flex-1">
        <p className="line-clamp-1 text-sm font-semibold">{p?.title ?? "Product"}</p>
        <p className="text-[11px] text-muted-foreground">
          {dir === "Received" ? "From buyer" : "To seller"} · Listed {formatINR(o.listedPrice)}
        </p>
        <div className="mt-1 flex items-center justify-between">
          <p className="text-base font-extrabold">{formatINR(o.amount)}</p>
          <OfferStatusBadge status={o.status} />
        </div>
        <p className="mt-0.5 text-[11px] text-muted-foreground">{humanExpiry(o)}</p>
      </div>
      <MessageCircle className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}
