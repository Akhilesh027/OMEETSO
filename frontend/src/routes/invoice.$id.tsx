import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import { getInvoice, formatINR, formatDate, getBilling } from "@/lib/revenue";
import { toast } from "sonner";
import { Download, Share2, Mail } from "lucide-react";

export const Route = createFileRoute("/invoice/$id")({
  head: () => ({ meta: [{ title: "Invoice — Omeetso" }] }),
  component: InvoicePage,
});

function InvoicePage() {
  const { id } = useParams({ from: "/invoice/$id" });
  const inv = getInvoice(id);
  const b = getBilling();
  if (!inv) return (
    <MobileFrame>
      <div className="min-h-dvh p-6 text-center pt-16">
        <p className="text-sm text-muted-foreground">Invoice not found or not yet generated.</p>
        <Link to="/invoices" className="mt-3 inline-block rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">All invoices</Link>
      </div>
    </MobileFrame>
  );

  const share = async () => {
    const url = `${location.origin}/invoice/${inv.id}`;
    if ((navigator as any).share) { try { await (navigator as any).share({ title: inv.number, url }); return; } catch {} }
    try { await navigator.clipboard.writeText(url); toast.success("Link copied"); } catch { toast.info(url); }
  };

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-32">
        <BackBar title="Invoice" />

        <div className="mx-4 mt-2 rounded-2xl border-2 border-dashed border-yellow-brand/50 bg-yellow-brand/[0.06] p-2 text-center text-[10px] font-bold uppercase text-navy">
          Sample invoice · Frontend generated
        </div>

        <div className="mx-4 mt-3 rounded-2xl border border-border bg-card p-4">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-lg font-extrabold text-primary">Omeetso</p>
              <p className="text-[10px] text-muted-foreground">Platform service invoice</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold">{inv.number}</p>
              <p className="text-[10px] text-muted-foreground">{formatDate(inv.createdAt)}</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Billed to</p>
              <p className="font-semibold">{b.legalName ?? "Individual seller"}</p>
              {b.gstNumber && <p>GSTIN: {b.gstNumber}</p>}
              {b.billingAddress && <p>{b.billingAddress}</p>}
              {b.state && <p>{b.state} — {b.pincode ?? ""}</p>}
              {b.email && <p>{b.email}</p>}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Service</p>
              <p className="font-semibold">{inv.service}</p>
              {inv.campaignId && <p>Campaign: {inv.campaignId}</p>}
              {inv.promotionId && <p>Promotion: {inv.promotionId}</p>}
              <p>Method: {inv.paymentMethod}</p>
              <p className="capitalize">Status: {inv.status}</p>
            </div>
          </div>

          <table className="mt-4 w-full text-xs">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="py-1">Description</th>
                <th className="py-1 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="py-1">Base amount</td><td className="py-1 text-right">{formatINR(inv.baseAmount)}</td></tr>
              <tr><td className="py-1">Tax (GST 18%)</td><td className="py-1 text-right">{formatINR(inv.tax)}</td></tr>
              {inv.discount > 0 && <tr><td className="py-1">Discount</td><td className="py-1 text-right">− {formatINR(inv.discount)}</td></tr>}
              {inv.creditsUsed > 0 && <tr><td className="py-1">Promotional credits</td><td className="py-1 text-right">− {formatINR(inv.creditsUsed)}</td></tr>}
            </tbody>
            <tfoot>
              <tr className="border-t border-border">
                <td className="pt-2 text-sm font-bold">Total</td>
                <td className="pt-2 text-right text-sm font-extrabold text-primary">{formatINR(inv.total)}</td>
              </tr>
            </tfoot>
          </table>

          <p className="mt-3 text-[10px] text-muted-foreground">
            This is a frontend-generated sample invoice. Real GST invoices will be issued when official billing integration is enabled.
          </p>
        </div>

        <div className="fixed inset-x-0 bottom-0 z-10 mx-auto max-w-[430px] border-t border-border bg-card p-3 safe-b">
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => toast.success("Downloaded (mock)")} className="rounded-full bg-primary py-3 text-xs font-bold text-primary-foreground flex items-center justify-center gap-1">
              <Download className="h-4 w-4" /> Download
            </button>
            <button onClick={share} className="rounded-full border border-border py-3 text-xs font-semibold flex items-center justify-center gap-1">
              <Share2 className="h-4 w-4" /> Share
            </button>
            <button onClick={() => toast.info("Email invoice coming soon")} className="rounded-full border border-border py-3 text-xs font-semibold flex items-center justify-center gap-1">
              <Mail className="h-4 w-4" /> Email
            </button>
          </div>
        </div>
      </div>
    </MobileFrame>
  );
}
