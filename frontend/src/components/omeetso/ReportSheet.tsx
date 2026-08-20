import { useState } from "react";
import { BottomSheet } from "./BottomSheet";
import { REPORT_REASONS } from "@/lib/mock";
import { addReport } from "@/lib/saved";
import { CheckCircle2, Flag, Upload } from "lucide-react";

export function ReportSheet({
  open, onClose, productId,
}: { open: boolean; onClose: () => void; productId: string }) {
  const [reason, setReason] = useState<string>("");
  const [desc, setDesc] = useState("");
  const [attached, setAttached] = useState(false);
  const [ticket, setTicket] = useState<string | null>(null);

  const submit = () => {
    if (!reason) return;
    const r = addReport({ productId, reason, description: desc.trim() || undefined });
    setTicket(r.id);
    setTimeout(() => {
      onClose();
      setReason(""); setDesc(""); setAttached(false); setTicket(null);
    }, 1800);
  };

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Report Listing"
      footer={
        !ticket ? (
          <button
            onClick={submit}
            disabled={!reason}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-destructive text-sm font-bold text-destructive-foreground disabled:opacity-60"
          >
            <Flag className="h-4 w-4" /> Submit report
          </button>
        ) : (
          <div className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-50 py-3 text-sm font-bold text-emerald-800">
            <CheckCircle2 className="h-4 w-4" /> Report received · {ticket}
          </div>
        )
      }
    >
      <p className="text-xs text-muted-foreground">
        Help keep Omeetso safe. Reports are reviewed by our moderation team.
      </p>
      <div className="mt-3 space-y-2">
        {REPORT_REASONS.map((r) => (
          <label key={r} className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border bg-card px-3 py-2.5">
            <input
              type="radio"
              name="report-reason"
              value={r}
              checked={reason === r}
              onChange={() => setReason(r)}
              className="accent-primary"
            />
            <span className="text-sm">{r}</span>
          </label>
        ))}
      </div>
      <label className="mt-4 block text-xs font-semibold">Description (optional)</label>
      <textarea
        value={desc}
        onChange={(e) => setDesc(e.target.value.slice(0, 300))}
        rows={3}
        placeholder="Add any details that help us investigate"
        className="mt-1 w-full resize-none rounded-2xl border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
      />
      <button
        type="button"
        onClick={() => setAttached((v) => !v)}
        className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-dashed border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground"
      >
        <Upload className="h-3.5 w-3.5" /> {attached ? "Screenshot attached" : "Attach screenshot"}
      </button>
    </BottomSheet>
  );
}
