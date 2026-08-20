import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import { getMyAdCampaignsApi } from "@/api/adCampaigns.api";
import { FileText, Loader2, CheckCircle2 } from "lucide-react";
import { formatINR, formatDate } from "@/lib/revenue";

export const Route = createFileRoute("/invoices/wallet")({
  head: () => ({ meta: [{ title: "Invoices — Omeetso" }] }),
  component: Invoices,
});

export default function Invoices() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadInvoices = useCallback(async () => {
    setLoading(true);
    const res = await getMyAdCampaignsApi();
    setLoading(false);
    if (res.success && res.data) {
      setCampaigns(res.data);
    }
  }, []);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  const invoices = campaigns.map((c, idx) => ({
    id: c.id,
    number: `INV-${new Date(c.createdAt).getFullYear()}-${(idx + 1).toString().padStart(4, "0")}`,
    service: c.productName || c.campaignType || "Listing Boost",
    total: c.pricing?.totalInPaise ? c.pricing.totalInPaise / 100 : 0,
    status: c.paymentStatus === "PAID" ? "PAID" : c.paymentStatus === "FUNDS_HELD" ? "FUNDS RESERVED" : c.paymentStatus,
    createdAt: c.createdAt
  }));

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-16 font-sans">
        <BackBar title="Invoices" />
        <div className="px-4 space-y-2">
          {loading ? (
            <div className="p-8 text-center text-xs text-muted-foreground flex justify-center items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" /> Loading tax invoices...
            </div>
          ) : invoices.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center space-y-2">
              <FileText className="mx-auto h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm font-bold text-foreground">No invoices generated yet</p>
              <p className="text-xs text-muted-foreground">Boost a listing or launch a campaign to generate a tax invoice.</p>
            </div>
          ) : (
            invoices.map((i) => (
              <div
                key={i.id}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm"
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-foreground">{i.number}</p>
                    <span className="text-[9px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-0.5">
                      <CheckCircle2 className="h-2.5 w-2.5" /> GST Tax Invoice
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{i.service} • {formatDate(new Date(i.createdAt).getTime())}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-primary">{formatINR(i.total)}</p>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">{i.status}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </MobileFrame>
  );
}
