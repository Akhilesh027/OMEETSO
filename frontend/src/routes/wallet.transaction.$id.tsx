import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import { getTxn, formatINR, formatDateTime } from "@/lib/revenue";
import { FileText, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/wallet/transaction/$id")({
  head: () => ({ meta: [{ title: "Transaction details — Omeetso" }] }),
  component: TxnDetail,
});

function TxnDetail() {
  const { id } = useParams({ from: "/wallet/transaction/$id" });
  const t = getTxn(id);
  if (!t) return (
    <MobileFrame>
      <div className="min-h-dvh p-6 text-center pt-16">
        <p className="text-sm text-muted-foreground">Transaction not found.</p>
        <Link to="/wallet/transactions" className="mt-3 inline-block rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">Back</Link>
      </div>
    </MobileFrame>
  );

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-16">
        <BackBar title="Transaction" />
        <div className="mx-4 mt-2 rounded-2xl bg-card p-4 card-elev text-center">
          <p className="text-xs uppercase text-muted-foreground">{t.type.replace("_", " ")}</p>
          <p className={"mt-1 text-3xl font-extrabold " + (t.direction === "credit" ? "text-emerald-700" : "")}>
            {t.direction === "credit" ? "+" : "−"} {formatINR(t.amount)}
          </p>
          <p className="text-[11px] capitalize text-muted-foreground">{t.status}</p>
        </div>

        <div className="mx-4 mt-3 rounded-2xl border border-border bg-card p-3 text-xs space-y-1">
          <Row label="Title" value={t.title} />
          <Row label="Date" value={formatDateTime(t.createdAt)} />
          <Row label="Transaction ID" value={t.id} />
          {t.paymentId && <Row label="Payment ID" value={t.paymentId} />}
          <Row label="Payment method" value={t.paymentMethod ?? "—"} />
          {t.tax !== undefined && <Row label="Tax" value={formatINR(t.tax)} />}
          {t.discount !== undefined && <Row label="Discount" value={formatINR(t.discount)} />}
          {t.creditsUsed !== undefined && <Row label="Credits used" value={formatINR(t.creditsUsed)} />}
          {t.campaignId && <Row label="Campaign" value={t.campaignId} />}
          {t.promotionId && <Row label="Promotion" value={t.promotionId} />}
        </div>

        <div className="mx-4 mt-3 grid grid-cols-2 gap-2">
          {(t.campaignId) && (
            <Link to="/ads/$id" params={{ id: t.campaignId }} className="rounded-2xl border border-border bg-card p-3 text-center text-xs font-semibold">
              View Campaign
            </Link>
          )}
          {(t.promotionId) && (
            <Link to="/promotions/$id" params={{ id: t.promotionId }} className="rounded-2xl border border-border bg-card p-3 text-center text-xs font-semibold">
              View Promotion
            </Link>
          )}
          <Link to="/invoice/$id" params={{ id: t.campaignId ?? t.promotionId ?? t.id }}
            className="col-span-2 flex items-center justify-center gap-1 rounded-2xl bg-primary p-3 text-sm font-bold text-primary-foreground">
            <FileText className="h-4 w-4" /> Download Invoice
          </Link>
        </div>
      </div>
    </MobileFrame>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-0.5">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="text-xs font-semibold text-right">{value}</p>
    </div>
  );
}
