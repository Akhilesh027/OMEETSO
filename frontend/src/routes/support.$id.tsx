import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import { getTicket, replyTicket, setTicketStatus, subscribeAccount, TICKET_STATUS_LABEL, timeAgo } from "@/lib/account";
import { StatusTimeline, ConfirmModal } from "@/components/omeetso/account";
import { Paperclip, Send, CheckCircle2, RotateCcw, XCircle, Upload } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/support/$id")({
  head: () => ({ meta: [{ title: "Support ticket — Omeetso" }] }),
  component: TicketDetail,
});

function TicketDetail() {
  const { id } = useParams({ from: "/support/$id" });
  const nav = useNavigate();
  const [, setTick] = useState(0);
  useEffect(() => { const u = subscribeAccount(() => setTick((n) => n + 1)); return () => { u(); }; }, []);
  const [body, setBody] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);

  const t = getTicket(id);
  if (!t) return <MobileFrame><div className="p-6 pt-16 text-center"><p className="text-sm text-muted-foreground">Ticket not found.</p><Link to="/support" className="mt-3 inline-block rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">Back</Link></div></MobileFrame>;

  const pick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setAttachments((cur) => [...cur, ...files.map((f) => `ref://${f.name}`)]);
  };

  const send = async () => {
    if (sending) return;
    if (!body.trim()) { toast.error("Type a reply"); return; }
    setSending(true);
    // simulate failure ~10% but keep deterministic here
    await new Promise((r) => setTimeout(r, 400));
    replyTicket(id, body, attachments);
    setBody(""); setAttachments([]); setSending(false);
    toast.success("Reply sent");
  };

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-32">
        <BackBar title={t.number} />
        <div className="px-4 pt-2">
          <div className="rounded-2xl bg-card p-3 card-elev">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase text-muted-foreground">{t.category}{t.subcategory ? ` · ${t.subcategory}` : ""}</p>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase">{TICKET_STATUS_LABEL[t.status]}</span>
            </div>
            <h1 className="mt-1 text-base font-extrabold">{t.subject}</h1>
            <p className="mt-1 text-[11px] text-muted-foreground">Created {new Date(t.createdAt).toLocaleString("en-IN")} · Updated {timeAgo(t.updatedAt)}</p>
            {(t.relatedListing || t.relatedStore || t.relatedCampaign || t.relatedPayment) && (
              <div className="mt-2 flex flex-wrap gap-2 text-[10px]">
                {t.relatedListing && <span className="rounded-full bg-secondary px-2 py-0.5">Listing: {t.relatedListing}</span>}
                {t.relatedStore && <span className="rounded-full bg-secondary px-2 py-0.5">Store: {t.relatedStore}</span>}
                {t.relatedCampaign && <span className="rounded-full bg-secondary px-2 py-0.5">Campaign: {t.relatedCampaign}</span>}
                {t.relatedPayment && <span className="rounded-full bg-secondary px-2 py-0.5">Payment: {t.relatedPayment}</span>}
              </div>
            )}
          </div>

          <div className="mt-3 rounded-2xl bg-card p-3 card-elev">
            <p className="text-[11px] font-bold uppercase text-muted-foreground">Timeline</p>
            <div className="mt-2">
              <StatusTimeline items={t.timeline.map((e, i) => ({
                title: TICKET_STATUS_LABEL[e.status], time: e.time, note: e.note, done: i < t.timeline.length,
              }))} />
            </div>
          </div>

          {t.resolution && (
            <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
              <p className="font-bold">Resolution</p>
              <p className="mt-1">{t.resolution}</p>
            </div>
          )}

          <p className="mt-3 mb-1.5 text-[11px] font-bold uppercase text-muted-foreground">Conversation</p>
          <div className="space-y-2">
            {t.messages.map((m) => (
              <div key={m.id} className={m.author === "user" ? "flex justify-end" : "flex justify-start"}>
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${m.author === "user" ? "bg-primary text-primary-foreground" : "bg-card card-elev"}`}>
                  <p className="text-[10px] font-bold uppercase opacity-70">{m.author === "user" ? "You" : "Omeetso Support"}</p>
                  <p className="mt-0.5 whitespace-pre-wrap">{m.body}</p>
                  {m.attachments.length > 0 && <p className="mt-1 text-[10px] opacity-70">{m.attachments.length} attachment(s)</p>}
                  <p className="mt-1 text-[10px] opacity-60">{new Date(m.time).toLocaleString("en-IN")}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[10px] text-muted-foreground">Support response times shown here are sample data. Real support integration is not enabled in this preview.</p>
        </div>

        {/* Actions */}
        <div className="mx-4 mt-3 grid grid-cols-3 gap-2">
          {t.status !== "resolved" && t.status !== "closed" && (
            <button onClick={() => { setTicketStatus(id, "resolved", "Marked resolved by user"); toast.success("Marked as resolved"); }}
              className="flex items-center justify-center gap-1 rounded-2xl border border-emerald-200 bg-emerald-50 py-2 text-[11px] font-bold text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" /> Resolved
            </button>
          )}
          {t.status === "resolved" && (
            <button onClick={() => { setTicketStatus(id, "in_progress", "Reopened by user"); toast.success("Ticket reopened"); }}
              className="flex items-center justify-center gap-1 rounded-2xl border border-border py-2 text-[11px] font-bold">
              <RotateCcw className="h-3.5 w-3.5" /> Reopen
            </button>
          )}
          <button onClick={() => setConfirmClose(true)}
            className="flex items-center justify-center gap-1 rounded-2xl border border-rose-200 bg-rose-50 py-2 text-[11px] font-bold text-rose-700">
            <XCircle className="h-3.5 w-3.5" /> Close
          </button>
        </div>

        {/* Reply composer */}
        {t.status !== "closed" && (
          <div className="fixed inset-x-0 bottom-0 z-10 mx-auto max-w-[430px] border-t border-border bg-card p-2 safe-b">
            {attachments.length > 0 && <p className="mb-1 text-[10px] text-muted-foreground">{attachments.length} attachment(s)</p>}
            <div className="flex items-end gap-2">
              <label className="grid h-10 w-10 place-items-center rounded-full border border-border" aria-label="Attach">
                <Paperclip className="h-4 w-4" />
                <input type="file" multiple className="hidden" onChange={pick} />
              </label>
              <textarea rows={1} value={body} onChange={(e) => setBody(e.target.value)}
                placeholder="Write a reply…"
                className="flex-1 resize-none rounded-2xl border border-border bg-background px-3 py-2 text-sm outline-none" />
              <button onClick={send} disabled={sending} aria-label="Send"
                className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground disabled:opacity-70">
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        <ConfirmModal open={confirmClose} title="Close this ticket?" body="You can create a new ticket anytime."
          confirmLabel="Close ticket" cancelLabel="Cancel" danger
          onCancel={() => setConfirmClose(false)}
          onConfirm={() => { setTicketStatus(id, "closed", "Closed by user"); setConfirmClose(false); toast.success("Ticket closed"); nav({ to: "/support" }); }} />
      </div>
    </MobileFrame>
  );
}
