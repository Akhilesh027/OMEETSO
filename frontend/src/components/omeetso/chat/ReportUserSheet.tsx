import { useState } from "react";
import { BottomSheet } from "@/components/omeetso/BottomSheet";
import { addReport, blockUser } from "@/lib/chat";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

const REASONS = [
  "Suspected scam", "Harassment", "Offensive messages",
  "Spam", "Fake identity", "Unsafe payment request", "Other",
];

export function ReportUserSheet({
  open, onClose, peerId, peerName, threadId, kind = "user", messageId,
}: {
  open: boolean; onClose: () => void;
  peerId: string; peerName: string; threadId: string;
  kind?: "user" | "message"; messageId?: string;
}) {
  const [reason, setReason] = useState<string>("");
  const [desc, setDesc] = useState("");
  const [ticket, setTicket] = useState<string | null>(null);

  const submit = () => {
    if (!reason) return toast.error("Select a reason");
    const rec = addReport({
      kind, targetId: peerId, threadId,
      messageIds: messageId ? [messageId] : undefined,
      reason, description: desc.trim() || undefined,
    });
    setTicket(rec.id);
  };

  const blockAndClose = () => {
    blockUser(peerId);
    toast.success(`${peerName} blocked`);
    reset(); onClose();
  };
  const reset = () => { setReason(""); setDesc(""); setTicket(null); };

  return (
    <BottomSheet
      open={open} onClose={() => { reset(); onClose(); }}
      title={ticket ? "Report submitted" : kind === "message" ? "Report message" : `Report ${peerName}`}
      footer={
        ticket ? (
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => { reset(); onClose(); }} className="h-11 rounded-2xl border border-border text-sm font-bold">Done</button>
            <button onClick={blockAndClose} className="h-11 rounded-2xl bg-destructive text-sm font-bold text-destructive-foreground">Block user</button>
          </div>
        ) : (
          <button onClick={submit} className="h-11 w-full rounded-2xl bg-primary text-sm font-bold text-primary-foreground">Submit report</button>
        )
      }
    >
      {ticket ? (
        <div className="pt-2 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="h-7 w-7" />
          </span>
          <p className="mt-3 text-base font-bold">Thanks for helping keep Omeetso safe</p>
          <p className="mt-1 text-xs text-muted-foreground">Ticket ID: <span className="font-mono">{ticket}</span></p>
          <p className="mt-2 text-xs text-muted-foreground">Our safety team will review this report.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Select the reason that best describes the issue.
          </p>
          <div className="space-y-1.5">
            {REASONS.map((r) => (
              <button
                key={r}
                onClick={() => setReason(r)}
                className={`flex w-full items-center justify-between rounded-2xl border p-3 text-sm ${reason === r ? "border-primary bg-primary/5 font-bold" : "border-border bg-card"}`}
              >
                <span>{r}</span>
                <span className={`h-4 w-4 rounded-full border-2 ${reason === r ? "border-primary bg-primary" : "border-border"}`} />
              </button>
            ))}
          </div>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value.slice(0, 500))}
            rows={3}
            placeholder="Add any details (optional)"
            className="w-full resize-none rounded-2xl border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <p className="text-[11px] text-muted-foreground">
            Reports are private. We may reach out for more information.
          </p>
        </div>
      )}
    </BottomSheet>
  );
}
