import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import { createTicket } from "@/lib/account";
import { toast } from "sonner";
import { Upload } from "lucide-react";

const CATEGORIES = [
  { id: "Buying", sub: ["Payment", "Delivery", "Fraud", "Other"] },
  { id: "Selling", sub: ["Rejected listing", "Fake buyer", "Sold flow", "Other"] },
  { id: "Stores", sub: ["Verification", "Working hours", "Products", "Other"] },
  { id: "Payments", sub: ["Wallet", "Refund", "Duplicate charge", "Other"] },
  { id: "Promotions", sub: ["Campaign", "Ads", "Analytics", "Other"] },
  { id: "Account", sub: ["Profile", "Verification", "Language", "Other"] },
  { id: "Other", sub: [] },
];

export const Route = createFileRoute("/support/new")({
  head: () => ({ meta: [{ title: "Create support ticket — Omeetso" }] }),
  validateSearch: (s: Record<string, unknown>) => ({ category: (s.category as string) ?? "" }),
  component: NewTicket,
});

function NewTicket() {
  const { category: cat0 } = useSearch({ from: "/support/new" });
  const nav = useNavigate();
  const [category, setCategory] = useState(cat0 || CATEGORIES[0].id);
  const [subcategory, setSubcategory] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [related, setRelated] = useState({ listing: "", store: "", campaign: "", payment: "" });
  const [attachments, setAttachments] = useState<string[]>([]);
  const [contact, setContact] = useState<"in_app" | "email" | "call">("in_app");
  const [busy, setBusy] = useState(false);

  const pick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (attachments.length + files.length > 5) { toast.error("Maximum 5 attachments"); return; }
    const over = files.find((f) => f.size > 5 * 1024 * 1024);
    if (over) { toast.error("Each attachment must be under 5MB"); return; }
    setAttachments((cur) => [...cur, ...files.map((f) => `ref://${f.name}`)]);
  };

  const submit = () => {
    if (busy) return;
    if (!subject.trim()) { toast.error("Subject is required"); return; }
    if (description.trim().length < 20) { toast.error("Description must be at least 20 characters"); return; }
    setBusy(true);
    const t = createTicket({
      category, subcategory, subject: subject.trim(), description: description.trim(),
      attachments, contactMethod: contact,
      relatedListing: related.listing || undefined,
      relatedStore: related.store || undefined,
      relatedCampaign: related.campaign || undefined,
      relatedPayment: related.payment || undefined,
    });
    toast.success(`Ticket ${t.number} created`);
    nav({ to: "/support/$id", params: { id: t.id } });
  };

  const subs = CATEGORIES.find((c) => c.id === category)?.sub ?? [];

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-28">
        <BackBar title="Contact support" />
        <div className="px-4 pt-2 space-y-3">
          <label className="block">
            <span className="text-[11px] font-semibold">Category</span>
            <select value={category} onChange={(e) => { setCategory(e.target.value); setSubcategory(""); }}
              className="mt-1 w-full rounded-2xl border border-border bg-card px-3 py-2.5 text-sm outline-none">
              {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.id}</option>)}
            </select>
          </label>
          {subs.length > 0 && (
            <label className="block">
              <span className="text-[11px] font-semibold">Subcategory</span>
              <select value={subcategory} onChange={(e) => setSubcategory(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-border bg-card px-3 py-2.5 text-sm outline-none">
                <option value="">Select</option>
                {subs.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
          )}

          <div className="grid grid-cols-2 gap-2">
            <Field label="Related listing" value={related.listing} onChange={(v) => setRelated({ ...related, listing: v })} />
            <Field label="Related store" value={related.store} onChange={(v) => setRelated({ ...related, store: v })} />
            <Field label="Related campaign" value={related.campaign} onChange={(v) => setRelated({ ...related, campaign: v })} />
            <Field label="Related payment" value={related.payment} onChange={(v) => setRelated({ ...related, payment: v })} />
          </div>

          <Field label="Subject *" value={subject} onChange={setSubject} placeholder="Short summary of the issue" />

          <label className="block">
            <span className="text-[11px] font-semibold">Description *</span>
            <textarea rows={5} value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Please describe what happened (minimum 20 characters)"
              className="mt-1 w-full rounded-2xl border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary" />
            <p className="mt-0.5 text-right text-[10px] text-muted-foreground">{description.length} chars</p>
          </label>

          <label className="flex items-center gap-2 rounded-2xl border-2 border-dashed border-border p-3 text-xs">
            <Upload className="h-4 w-4" />
            <span>Attach screenshots (max 5, 5MB each — placeholders)</span>
            <input type="file" multiple className="hidden" onChange={pick} aria-label="Attach files" />
          </label>
          {attachments.length > 0 && <p className="text-[11px] text-muted-foreground">{attachments.length} attachment(s) added</p>}

          <div>
            <span className="text-[11px] font-semibold">Preferred contact</span>
            <div className="mt-1 flex gap-2">
              {(["in_app", "email", "call"] as const).map((c) => (
                <button key={c} onClick={() => setContact(c)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${contact === c ? "border-primary bg-primary/10 text-primary" : "border-border"}`}>
                  {c === "in_app" ? "In-app" : c === "email" ? "Email" : "Call"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="fixed inset-x-0 bottom-0 z-10 mx-auto max-w-[430px] border-t border-border bg-card p-3 safe-b">
          <button onClick={submit} disabled={busy}
            className="w-full rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-70">
            {busy ? "Submitting…" : "Submit Request"}
          </button>
        </div>
      </div>
    </MobileFrame>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="mt-1 w-full rounded-2xl border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary" />
    </label>
  );
}
