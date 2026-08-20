import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import { getPromotion, formatINR, formatDate } from "@/lib/revenue";
import { CheckCircle2, Clock, XCircle, ArrowRight, RefreshCw } from "lucide-react";

type S = { state: "success" | "pending" | "failed" | "processing"; id: string };

export const Route = createFileRoute("/promotions/payment")({
  head: ({ loaderData }) => ({ meta: [{ title: "Promotion payment — Omeetso" }] }) as any,
  validateSearch: (s: Record<string, unknown>): S => ({
    state: (s.state as any) ?? "processing", id: (s.id as string) ?? "",
  }),
  component: PaymentState,
});

function PaymentState() {
  const { state, id } = useSearch({ from: "/promotions/payment" });
  const nav = useNavigate();
  const p = id ? getPromotion(id) : undefined;

  if (state === "processing") {
    return (
      <MobileFrame>
        <div className="min-h-dvh grid place-items-center bg-background p-6 text-center">
          <div>
            <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
            <p className="mt-4 text-lg font-bold">Processing your payment</p>
            <p className="mt-1 text-xs text-muted-foreground">Please wait — do not go back or refresh.</p>
          </div>
        </div>
      </MobileFrame>
    );
  }

  if (state === "success") {
    return (
      <MobileFrame>
        <div className="min-h-dvh bg-background pb-24">
          <div className="gradient-brand px-6 pt-10 pb-8 text-center text-white">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-white/15">
              <CheckCircle2 className="h-9 w-9 text-yellow-brand" />
            </div>
            <h1 className="mt-3 text-xl font-extrabold">Promotion activated</h1>
            <p className="mt-1 text-sm text-white/80">Your listing is now being promoted.</p>
          </div>
          <div className="-mt-4 rounded-t-3xl bg-background p-4 space-y-2">
            {p && (
              <div className="rounded-2xl border border-border bg-card p-3 text-xs">
                <Row label="Promotion ID" value={p.id} />
                <Row label="Package" value={p.packageName} />
                <Row label="Start date" value={formatDate(p.startAt)} />
                <Row label="End date" value={formatDate(p.endAt)} />
                <Row label="Amount" value={formatINR(p.totalAmount)} bold />
                <Row label="Payment ID" value={p.paymentId ?? "—"} />
              </div>
            )}
            <Link to="/promotions/$id" params={{ id }} className="flex items-center justify-between rounded-2xl bg-primary p-3 text-sm font-bold text-primary-foreground">
              View Promotion <ArrowRight className="h-4 w-4" />
            </Link>
            {p?.target.kind === "listing" && (
              <Link to="/listing/$id/manage" params={{ id: p.target.refId }} className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card p-3 text-sm font-semibold">
                View Listing
              </Link>
            )}
            <Link to="/promotions" className="block rounded-2xl border border-border bg-card p-3 text-center text-sm font-semibold">
              Return to Promotions
            </Link>
          </div>
        </div>
      </MobileFrame>
    );
  }

  if (state === "pending") {
    return (
      <MobileFrame>
        <div className="min-h-dvh bg-background p-6 text-center pt-16">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-amber-100">
            <Clock className="h-9 w-9 text-amber-700" />
          </div>
          <h1 className="mt-3 text-lg font-extrabold">Payment is pending</h1>
          <p className="mt-1 text-xs text-muted-foreground">We'll activate your promotion once your bank confirms.</p>
          <div className="mt-6 space-y-2 text-left">
            <button onClick={() => nav({ to: "/promotions/payment", search: { state: "success", id } as any })}
              className="w-full rounded-2xl bg-primary p-3 text-sm font-bold text-primary-foreground flex items-center justify-center gap-1">
              <RefreshCw className="h-4 w-4" /> Check Status
            </button>
            <button onClick={() => nav({ to: "/promotions/new", search: {} as any })} className="w-full rounded-2xl border border-border bg-card p-3 text-sm font-semibold">Try Another Method</button>
            <Link to="/promotions" className="block rounded-2xl border border-border bg-card p-3 text-center text-sm font-semibold">Return to Promotions</Link>
          </div>
        </div>
      </MobileFrame>
    );
  }

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background p-6 text-center pt-16">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-rose-100">
          <XCircle className="h-9 w-9 text-rose-600" />
        </div>
        <h1 className="mt-3 text-lg font-extrabold">Payment could not be completed</h1>
        <p className="mt-1 text-xs text-muted-foreground">Your promotion has not been activated. No amount was charged.</p>
        <div className="mt-6 space-y-2 text-left">
          <button onClick={() => nav({ to: "/promotions/new", search: {} as any })} className="w-full rounded-2xl bg-primary p-3 text-sm font-bold text-primary-foreground">Try Again</button>
          <button onClick={() => nav({ to: "/promotions/new", search: {} as any })} className="w-full rounded-2xl border border-border bg-card p-3 text-sm font-semibold">Change Payment Method</button>
          <Link to="/promotions" className="block rounded-2xl border border-border bg-card p-3 text-center text-sm font-semibold">Return to Promotions</Link>
        </div>
      </div>
    </MobileFrame>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-baseline justify-between py-0.5">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className={"text-xs " + (bold ? "font-extrabold text-primary text-sm" : "font-semibold")}>{value}</p>
    </div>
  );
}
