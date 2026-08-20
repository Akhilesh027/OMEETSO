import { Link } from "@tanstack/react-router";
import { HandCoins, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { type Offer, humanExpiry } from "@/lib/chat";

const inr = (n: number) => "₹" + n.toLocaleString("en-IN");

const STATUS_STYLE: Record<Offer["status"], string> = {
  pending: "bg-amber-100 text-amber-800",
  countered: "bg-sky-100 text-sky-800",
  accepted: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
  withdrawn: "bg-secondary text-muted-foreground",
  expired: "bg-secondary text-muted-foreground",
  completed: "bg-emerald-100 text-emerald-800",
};
const STATUS_LABEL: Record<Offer["status"], string> = {
  pending: "Pending", countered: "Countered", accepted: "Accepted",
  rejected: "Rejected", withdrawn: "Withdrawn", expired: "Expired", completed: "Completed",
};

export function OfferMessageCard({
  offer, mine, role, onAccept, onReject, onCounter, onWithdraw, onUpdate,
}: {
  offer: Offer;
  mine: boolean; // sent by me
  role: "buyer" | "seller";
  onAccept?: () => void;
  onReject?: () => void;
  onCounter?: () => void;
  onWithdraw?: () => void;
  onUpdate?: () => void;
}) {
  const active = offer.status === "pending" || offer.status === "countered";
  const senderLabel =
    offer.history[offer.history.length - 1]?.by === "buyer" ? "Buyer offered" : "Seller countered";

  return (
    <div className={cn(
      "max-w-[90%] rounded-2xl border p-3 shadow-sm",
      mine ? "ml-auto border-navy/40 bg-navy/5" : "border-border bg-card",
    )}>
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-yellow-brand/20 text-navy">
          <HandCoins className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold text-muted-foreground">{senderLabel}</p>
          <p className="truncate text-lg font-extrabold">{inr(offer.amount)}</p>
        </div>
        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", STATUS_STYLE[offer.status])}>
          {STATUS_LABEL[offer.status]}
        </span>
      </div>
      <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>Listed at {inr(offer.listedPrice)}</span>
        <span>{humanExpiry(offer)}</span>
      </div>
      {offer.message && (
        <p className="mt-2 rounded-xl bg-secondary/60 px-3 py-2 text-xs">"{offer.message}"</p>
      )}
      {active && (
        <div className="mt-2 grid grid-cols-3 gap-1.5">
          {role === "seller" ? (
            <>
              <button onClick={onAccept} className="rounded-xl bg-emerald-600 py-2 text-[11px] font-bold text-white">Accept</button>
              <button onClick={onCounter} className="rounded-xl bg-navy py-2 text-[11px] font-bold text-white">Counter</button>
              <button onClick={onReject} className="rounded-xl border border-border py-2 text-[11px] font-bold">Reject</button>
            </>
          ) : (
            <>
              <button onClick={onUpdate} className="rounded-xl bg-navy py-2 text-[11px] font-bold text-white">Update</button>
              <button onClick={onWithdraw} className="col-span-2 rounded-xl border border-border py-2 text-[11px] font-bold">Withdraw</button>
            </>
          )}
        </div>
      )}
      <Link
        to="/offer/$id" params={{ id: offer.id }}
        className="mt-2 flex items-center justify-between rounded-xl bg-secondary/70 px-3 py-2 text-[11px] font-semibold"
      >
        View offer details <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}

export function OfferStatusBadge({ status }: { status: Offer["status"] }) {
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", STATUS_STYLE[status])}>
      {STATUS_LABEL[status]}
    </span>
  );
}
