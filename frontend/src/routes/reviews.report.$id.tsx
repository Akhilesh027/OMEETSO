import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import { getReview, reportReview } from "@/lib/account";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

const REASONS = [
  "Fake review", "Offensive content", "Personal information",
  "Unrelated review", "Conflict of interest", "Spam", "Other",
];

export const Route = createFileRoute("/reviews/report/$id")({
  head: () => ({ meta: [{ title: "Report review — Omeetso" }] }),
  component: ReportReview,
});

function ReportReview() {
  const { id } = useParams({ from: "/reviews/report/$id" });
  const nav = useNavigate();
  const r = getReview(id);
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [done, setDone] = useState(false);

  if (!r) return <MobileFrame><div className="p-6 pt-16 text-center"><p className="text-sm text-muted-foreground">Review not found.</p><Link to="/reviews" className="mt-3 inline-block rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">Back</Link></div></MobileFrame>;

  if (done) return (
    <MobileFrame>
      <div className="min-h-dvh bg-background p-6 pt-16 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl gradient-brand text-yellow-brand">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <p className="mt-3 text-lg font-extrabold">Report received</p>
        <p className="mt-1 text-xs text-muted-foreground">The review will stay visible until moderation is complete. Moderation in this preview is simulated.</p>
        <button onClick={() => nav({ to: "/reviews" })} className="mt-4 w-full rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground">Back to reviews</button>
      </div>
    </MobileFrame>
  );

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-24">
        <BackBar title="Report review" />
        <div className="px-4 pt-2 space-y-3">
          <div className="rounded-2xl bg-card p-3 card-elev">
            <p className="text-[11px] font-bold uppercase text-muted-foreground">Review by {r.reviewerName}</p>
            <p className="mt-1 text-sm">{r.comment}</p>
          </div>

          <p className="text-[11px] font-bold uppercase text-muted-foreground">Reason</p>
          <div className="flex flex-wrap gap-2">
            {REASONS.map((r) => (
              <button key={r} onClick={() => setReason(r)}
                className={cn("rounded-full border px-3 py-1 text-xs font-semibold",
                  reason === r ? "border-primary bg-primary/10 text-primary" : "border-border")}>{r}</button>
            ))}
          </div>

          <textarea rows={4} value={note} onChange={(e) => setNote(e.target.value)}
            placeholder="Additional details (optional)"
            className="w-full rounded-2xl border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary" />
        </div>

        <div className="fixed inset-x-0 bottom-0 z-10 mx-auto max-w-[430px] border-t border-border bg-card p-3 safe-b">
          <button onClick={() => { if (!reason) { toast.error("Choose a reason"); return; } reportReview(id, `${reason}${note ? " · " + note : ""}`); setDone(true); toast.success("Report submitted"); }}
            className="w-full rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground">Submit report</button>
        </div>
      </div>
    </MobileFrame>
  );
}
