import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import { getBilling, setBilling, type BillingProfile } from "@/lib/revenue";
import { toast } from "sonner";

export const Route = createFileRoute("/billing")({
  head: () => ({ meta: [{ title: "GST & Billing — Omeetso" }] }),
  component: BillingPage,
});

function BillingPage() {
  const nav = useNavigate();
  const [b, setB] = useState<BillingProfile>({});
  useEffect(() => { setB(getBilling()); }, []);
  const set = (k: keyof BillingProfile, v: string) => setB((x) => ({ ...x, [k]: v }));
  const gstOk = !b.gstNumber || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9]{1}[A-Z]{1}[0-9A-Z]{1}$/.test(b.gstNumber);
  const save = () => {
    if (!gstOk) { toast.error("GST number format looks invalid"); return; }
    setBilling(b);
    toast.success("Billing details saved");
    nav({ to: "/wallet" });
  };
  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-32 md:mx-auto md:max-w-[960px] md:px-6 md:pb-12">
        <BackBar title="GST & Billing" />
        <div className="px-4 pt-2 space-y-3">
          <p className="text-xs text-muted-foreground">Optional details used on your invoices. GST is optional at this stage.</p>
          <Field label="Legal business name" value={b.legalName ?? ""} onChange={(v) => set("legalName", v)} />
          <Field label="GST number (optional)" value={b.gstNumber ?? ""} onChange={(v) => set("gstNumber", v.toUpperCase())}
            error={!gstOk ? "Invalid GST format" : undefined} />
          <Field label="Billing address" value={b.billingAddress ?? ""} onChange={(v) => set("billingAddress", v)} multiline />
          <div className="grid grid-cols-2 gap-2">
            <Field label="State" value={b.state ?? ""} onChange={(v) => set("state", v)} />
            <Field label="Pincode" value={b.pincode ?? ""} onChange={(v) => set("pincode", v)} />
          </div>
          <Field label="Billing email" value={b.email ?? ""} onChange={(v) => set("email", v)} />
          <Field label="Contact number" value={b.phone ?? ""} onChange={(v) => set("phone", v)} />
          <p className="text-[10px] text-muted-foreground">Omeetso does not officially verify GST numbers at this stage.</p>
        </div>
        <div className="fixed inset-x-0 bottom-0 z-10 mx-auto max-w-[430px] border-t border-border bg-card p-3 safe-b">
          <button onClick={save} className="w-full rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground">Save details</button>
        </div>
      </div>
    </MobileFrame>
  );
}

function Field({ label, value, onChange, multiline, error }: {
  label: string; value: string; onChange: (v: string) => void; multiline?: boolean; error?: string;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold">{label}</span>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={2}
          className="mt-1 w-full rounded-2xl border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary" />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)}
          className="mt-1 w-full rounded-2xl border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary" />
      )}
      {error && <span className="mt-1 block text-[10px] text-rose-600">{error}</span>}
    </label>
  );
}
