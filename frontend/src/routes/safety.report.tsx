import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import { addSafetyReport, blockUser, SAFETY_CATEGORIES, type SafetyCategory } from "@/lib/account";
import { toast } from "sonner";
import { Flag, Upload, ArrowRight, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/safety/report")({
  head: () => ({ meta: [{ title: "Report suspicious activity — Omeetso" }] }),
  component: ReportPage,
});

function ReportPage() {
  const nav = useNavigate();
  const [category, setCategory] = useState<SafetyCategory>("scam");
  const [description, setDescription] = useState("");
  const [relatedUser, setRelatedUser] = useState("");
  const [relatedListing, setRelatedListing] = useState("");
  const [relatedChat, setRelatedChat] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [contactPref, setContactPref] = useState("in_app");
  const [submitted, setSubmitted] = useState<{ id: string } | null>(null);

  const pick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setAttachments((cur) => [...cur, ...files.map((f) => `ref://${f.name}`)]);
  };

  const submit = () => {
    if (description.trim().length < 20) { toast.error("Description must be at least 20 characters"); return; }
    const rec = addSafetyReport({ category, description, relatedUser, relatedListing, relatedChat, attachments, contactPref });
    setSubmitted({ id: rec.id });
  };

  if (submitted) {
    return (
      <MobileFrame>
        <div className="min-h-dvh bg-background pb-16">
          <BackBar title="Report submitted" />
          <div className="mx-4 mt-2 rounded-2xl gradient-brand p-5 text-white">
            <CheckCircle2 className="h-9 w-9 text-yellow-brand" />
            <p className="mt-2 text-lg font-extrabold">Thanks for helping keep Omeetso safe</p>
            <p className="mt-1 text-sm text-white/80">Reference: {submitted.id}</p>
            <p className="mt-1 text-[11px] text-white/70">Reviews in this preview are simulated — no real moderation happens.</p>
          </div>
          <div className="mx-4 mt-3 space-y-2">
            {relatedUser && (
              <button onClick={() => { blockUser({ id: relatedUser, name: relatedUser }); toast.success("User blocked"); }}
                className="w-full rounded-full border border-border bg-card py-3 text-sm font-semibold">Block the reported user</button>
            )}
            <Link to="/support/new"
              className="flex items-center justify-between rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground">
              <span>Open a support ticket</span><ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/safety" className="block w-full rounded-full border border-border py-3 text-center text-sm font-semibold">Back to Safety Centre</Link>
          </div>
        </div>
      </MobileFrame>
    );
  }

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-24">
        <BackBar title="Report suspicious activity" />
        <div className="px-4 pt-2 space-y-3">
          <div className="rounded-2xl bg-card p-3 card-elev">
            <p className="flex items-center gap-1 text-[11px] font-bold uppercase text-muted-foreground"><Flag className="h-3 w-3" /> Category</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {SAFETY_CATEGORIES.map((c) => (
                <button key={c.id} onClick={() => setCategory(c.id)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${category === c.id ? "border-primary bg-primary/10 text-primary" : "border-border"}`}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-card p-3 card-elev space-y-2 text-sm">
            <input value={relatedUser} onChange={(e) => setRelatedUser(e.target.value)} placeholder="Related user (name or ID, optional)" className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none" />
            <input value={relatedListing} onChange={(e) => setRelatedListing(e.target.value)} placeholder="Related listing or store (optional)" className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none" />
            <input value={relatedChat} onChange={(e) => setRelatedChat(e.target.value)} placeholder="Related chat ID (optional)" className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none" />
            <textarea rows={5} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe what happened (minimum 20 characters)…" className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none" />
            <label className="flex items-center gap-2 rounded-xl border-2 border-dashed border-border p-3 text-xs">
              <Upload className="h-4 w-4" />
              <span>Add screenshots or messages (placeholders)</span>
              <input type="file" multiple className="hidden" onChange={pick} aria-label="Attach screenshots" />
            </label>
            {attachments.length > 0 && <p className="text-[11px] text-muted-foreground">{attachments.length} attachment(s) added</p>}
          </div>

          <div className="rounded-2xl bg-card p-3 card-elev">
            <p className="text-[11px] font-bold uppercase text-muted-foreground">Contact preference</p>
            <div className="mt-2 flex gap-2">
              {[["in_app", "In-app"], ["email", "Email"], ["call", "Call"]].map(([k, l]) => (
                <button key={k} onClick={() => setContactPref(k)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${contactPref === k ? "border-primary bg-primary/10 text-primary" : "border-border"}`}>{l}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="fixed inset-x-0 bottom-0 z-10 mx-auto max-w-[430px] border-t border-border bg-card p-3 safe-b">
          <button onClick={submit} className="w-full rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground">Submit report</button>
        </div>
      </div>
    </MobileFrame>
  );
}
