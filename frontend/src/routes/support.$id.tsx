import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import {
  getTicket,
  replyTicket,
  setTicketStatus as setLocalTicketStatus,
  subscribeAccount,
  timeAgo,
} from "@/lib/account";
import {
  getSupportTicketByIdApi,
  sendSupportTicketMessageApi,
  updateSupportTicketStatusApi,
  type SupportTicketItem,
  type SupportMessageItem,
} from "@/api/support.api";
import { StatusTimeline, ConfirmModal } from "@/components/omeetso/account";
import { Paperclip, Send, CheckCircle2, RotateCcw, XCircle, RefreshCw, ShieldCheck, Clock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/support/$id")({
  head: () => ({ meta: [{ title: "Support ticket — Omeetso" }] }),
  component: TicketDetail,
});

const STATUS_LABELS: Record<string, string> = {
  open: "Open",
  OPEN: "Open",
  assigned: "Assigned",
  ASSIGNED: "Assigned",
  in_progress: "In Progress",
  IN_PROGRESS: "In Progress",
  waiting_user: "Waiting on You",
  WAITING_USER: "Waiting on You",
  resolved: "Resolved",
  RESOLVED: "Resolved",
  closed: "Closed",
  CLOSED: "Closed",
  reopened: "Reopened",
  REOPENED: "Reopened",
};

const STATUS_BADGES: Record<string, string> = {
  open: "bg-blue-500/10 text-blue-600 border border-blue-500/20",
  OPEN: "bg-blue-500/10 text-blue-600 border border-blue-500/20",
  assigned: "bg-indigo-500/10 text-indigo-600 border border-indigo-500/20",
  ASSIGNED: "bg-indigo-500/10 text-indigo-600 border border-indigo-500/20",
  in_progress: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20",
  IN_PROGRESS: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20",
  waiting_user: "bg-orange-500/10 text-orange-700 dark:text-orange-300 border border-orange-500/20",
  WAITING_USER: "bg-orange-500/10 text-orange-700 dark:text-orange-300 border border-orange-500/20",
  resolved: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20",
  RESOLVED: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20",
  closed: "bg-muted text-muted-foreground border border-border",
  CLOSED: "bg-muted text-muted-foreground border border-border",
  reopened: "bg-rose-500/10 text-rose-600 border border-rose-500/20",
  REOPENED: "bg-rose-500/10 text-rose-600 border border-rose-500/20",
};

function TicketDetail() {
  const { id } = useParams({ from: "/support/$id" });
  const nav = useNavigate();
  const [ticket, setTicket] = useState<SupportTicketItem | null>(null);
  const [messages, setMessages] = useState<SupportMessageItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [body, setBody] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [confirmResolve, setConfirmResolve] = useState(false);

  const loadTicket = useCallback(async () => {
    try {
      // 1. Fetch live from MongoDB backend API
      const serverRes = await getSupportTicketByIdApi(id);
      if (serverRes.success && serverRes.data) {
        setTicket(serverRes.data);
        if (serverRes.data.messages) {
          setMessages(serverRes.data.messages);
        }
        setIsLoading(false);
        return;
      }
    } catch {
      // ignore
    }

    // 2. Fallback to local ticket store
    const local = getTicket(id);
    if (local) {
      setTicket({
        id: local.id,
        ticketNumber: local.number,
        subject: local.subject,
        category: local.category,
        subcategory: local.subcategory,
        description: local.description,
        priority: "MEDIUM",
        status: local.status.toUpperCase() as any,
        contactMethod: local.contactMethod,
        relatedListing: local.relatedListing,
        relatedStore: local.relatedStore,
        relatedCampaign: local.relatedCampaign,
        relatedPayment: local.relatedPayment,
        resolutionNotes: local.resolution,
        createdAt: new Date(local.createdAt).toISOString(),
        updatedAt: new Date(local.updatedAt).toISOString(),
      });
      setMessages(
        local.messages.map((m) => ({
          id: m.id,
          senderType: m.author === "user" ? "user" : "admin",
          senderName: m.author === "user" ? "You" : "Omeetso Support",
          text: m.body,
          attachments: m.attachments,
          createdAt: new Date(m.time).toISOString(),
        }))
      );
    }
    setIsLoading(false);
  }, [id]);

  useEffect(() => {
    loadTicket();
    const unsub = subscribeAccount(() => loadTicket());
    return () => unsub();
  }, [loadTicket]);

  const pick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setAttachments((cur) => [...cur, ...files.map((f) => `ref://${f.name}`)]);
  };

  const send = async () => {
    if (sending) return;
    if (!body.trim()) {
      toast.error("Type a reply");
      return;
    }

    setSending(true);
    const textToSend = body.trim();
    const currentAttachments = [...attachments];

    try {
      // 1. Send live to backend
      const serverRes = await sendSupportTicketMessageApi(id, {
        text: textToSend,
        attachments: currentAttachments,
      });

      if (serverRes.success && serverRes.data) {
        setMessages((prev) => [...prev, serverRes.data!]);
      } else {
        // Fallback optimistic message
        setMessages((prev) => [
          ...prev,
          {
            id: `temp_${Date.now()}`,
            senderType: "user",
            senderName: "You",
            text: textToSend,
            attachments: currentAttachments,
            createdAt: new Date().toISOString(),
          },
        ]);
      }

      // 2. Also sync to local account store
      try {
        replyTicket(id, textToSend, currentAttachments);
      } catch {}

      setBody("");
      setAttachments([]);
      toast.success("Reply sent to support desk!");
    } catch {
      toast.error("Failed to send reply. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (newStatus: "RESOLVED" | "CLOSED" | "OPEN") => {
    try {
      await updateSupportTicketStatusApi(id, {
        status: newStatus,
        resolutionNotes: newStatus === "RESOLVED" ? "Marked resolved by user" : undefined,
      });

      try {
        setLocalTicketStatus(
          id,
          newStatus.toLowerCase() as any,
          newStatus === "RESOLVED" ? "Marked resolved by user" : "Status updated by user"
        );
      } catch {}

      setTicket((prev) => (prev ? { ...prev, status: newStatus } : null));
      toast.success(`Ticket marked as ${newStatus.toLowerCase()}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  if (isLoading) {
    return (
      <MobileFrame>
        <div className="p-8 pt-24 text-center text-xs text-muted-foreground space-y-2">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto text-primary" />
          <p>Loading ticket from database...</p>
        </div>
      </MobileFrame>
    );
  }

  if (!ticket) {
    return (
      <MobileFrame>
        <div className="p-6 pt-20 text-center space-y-3 font-sans">
          <p className="text-sm font-bold text-foreground">Ticket not found</p>
          <p className="text-xs text-muted-foreground">The ticket ID does not match any active support requests.</p>
          <Link
            to="/support"
            className="inline-block rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-sm"
          >
            Back to Support Desk
          </Link>
        </div>
      </MobileFrame>
    );
  }

  const isClosed = ticket.status === "CLOSED" || ticket.status === "closed";
  const isResolved = ticket.status === "RESOLVED" || ticket.status === "resolved";
  const badgeClass = STATUS_BADGES[ticket.status] || "bg-secondary text-muted-foreground";

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-36 font-sans">
        <BackBar title={ticket.ticketNumber || `Ticket #${ticket.id.slice(-6).toUpperCase()}`} onBack={() => nav({ to: "/support" })} />

        <div className="px-4 pt-2 space-y-3 max-w-2xl mx-auto">
          {/* Ticket Header Card */}
          <div className="rounded-3xl bg-card p-4 border border-border shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                {ticket.category}{ticket.subcategory ? ` · ${ticket.subcategory}` : ""}
              </span>
              <span className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider", badgeClass)}>
                {STATUS_LABELS[ticket.status] || ticket.status}
              </span>
            </div>

            <h1 className="text-base font-extrabold text-foreground tracking-tight leading-snug">
              {ticket.subject}
            </h1>

            <div className="flex items-center gap-2 text-[11px] text-muted-foreground pt-1 border-t border-border/40">
              <Clock className="h-3 w-3" />
              <span>Created {new Date(ticket.createdAt).toLocaleString("en-IN")}</span>
              <span>•</span>
              <span>Updated {timeAgo(ticket.updatedAt || ticket.createdAt)}</span>
            </div>

            {(ticket.relatedListing || ticket.relatedStore || ticket.relatedCampaign || ticket.relatedPayment) && (
              <div className="mt-2 flex flex-wrap gap-1.5 text-[10px]">
                {ticket.relatedListing && (
                  <span className="rounded-lg bg-secondary px-2 py-0.5 font-bold text-foreground">
                    Listing: {ticket.relatedListing}
                  </span>
                )}
                {ticket.relatedStore && (
                  <span className="rounded-lg bg-secondary px-2 py-0.5 font-bold text-foreground">
                    Store: {ticket.relatedStore}
                  </span>
                )}
                {ticket.relatedCampaign && (
                  <span className="rounded-lg bg-secondary px-2 py-0.5 font-bold text-foreground">
                    Campaign: {ticket.relatedCampaign}
                  </span>
                )}
                {ticket.relatedPayment && (
                  <span className="rounded-lg bg-secondary px-2 py-0.5 font-bold text-foreground">
                    Payment Ref: {ticket.relatedPayment}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Resolution Banner */}
          {ticket.resolutionNotes && (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
              <p className="font-extrabold flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Ticket Resolution</span>
              </p>
              <p className="leading-relaxed">{ticket.resolutionNotes}</p>
            </div>
          )}

          {/* Conversation Thread */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                Live Support Thread ({messages.length})
              </span>
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Connected
              </span>
            </div>

            <div className="space-y-2.5">
              {messages.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground rounded-2xl bg-secondary/30 border border-dashed border-border">
                  <p>No messages in this ticket yet. Write a message below to start.</p>
                </div>
              ) : (
                messages.map((m) => {
                  const isUser = m.senderType === "user";
                  return (
                    <div key={m.id} className={cn("flex", isUser ? "justify-end" : "justify-start")}>
                      <div
                        className={cn(
                          "max-w-[85%] rounded-3xl px-4 py-3 text-xs leading-relaxed shadow-2xs space-y-1",
                          isUser
                            ? "bg-primary text-primary-foreground rounded-br-xs"
                            : "bg-card border border-border/80 text-foreground rounded-bl-xs"
                        )}
                      >
                        <div className="flex items-center justify-between gap-2 text-[10px] font-extrabold opacity-75">
                          <span>{isUser ? "You" : m.senderName || "Omeetso Support Desk"}</span>
                          <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                        <p className="whitespace-pre-wrap font-medium">{m.text}</p>
                        {m.attachments && m.attachments.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {m.attachments.map((att, idx) => (
                              <span
                                key={idx}
                                className={cn(
                                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold",
                                  isUser ? "bg-white/20 text-white" : "bg-secondary text-primary"
                                )}
                              >
                                📎 {att.replace("ref://", "")}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Actions (Resolve / Reopen / Close) */}
          <div className="pt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
            {!isResolved && !isClosed && (
              <button
                type="button"
                onClick={() => setConfirmResolve(true)}
                className="flex items-center justify-center gap-1.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 py-2.5 px-3 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 transition active:scale-95 cursor-pointer"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Mark Resolved</span>
              </button>
            )}

            {isResolved && (
              <button
                type="button"
                onClick={() => handleStatusChange("OPEN")}
                className="flex items-center justify-center gap-1.5 rounded-2xl border border-border bg-card py-2.5 px-3 text-xs font-bold text-foreground hover:bg-secondary transition active:scale-95 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5 text-primary" />
                <span>Reopen Ticket</span>
              </button>
            )}

            {!isClosed && (
              <button
                type="button"
                onClick={() => setConfirmClose(true)}
                className="flex items-center justify-center gap-1.5 rounded-2xl border border-rose-500/30 bg-rose-500/10 py-2.5 px-3 text-xs font-bold text-rose-700 dark:text-rose-400 hover:bg-rose-500/20 transition active:scale-95 cursor-pointer"
              >
                <XCircle className="h-3.5 w-3.5" />
                <span>Close Ticket</span>
              </button>
            )}
          </div>
        </div>

        {/* Reply Composer Bottom Bar */}
        {!isClosed && (
          <div className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-[430px] md:max-w-2xl border-t border-border/80 bg-background/95 backdrop-blur-md p-3 space-y-1.5 shadow-lg">
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-1 px-1">
                {attachments.map((file, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 rounded-lg bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary"
                  >
                    📎 {file.replace("ref://", "")}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-end gap-2">
              <label
                className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-border bg-card text-muted-foreground hover:text-foreground transition cursor-pointer active:scale-95"
                aria-label="Attach screenshot or file"
              >
                <Paperclip className="h-4 w-4" />
                <input type="file" multiple className="hidden" onChange={pick} />
              </label>

              <textarea
                id="ticket-reply-textarea"
                rows={1}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Reply to support officer..."
                className="flex-1 resize-none rounded-2xl border border-border/80 bg-card px-3.5 py-2.5 text-xs font-medium outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition max-h-24"
              />

              <button
                id="ticket-reply-send-btn"
                type="button"
                onClick={send}
                disabled={sending || !body.trim()}
                aria-label="Send reply"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 transition active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Confirm Close Modal */}
        <ConfirmModal
          open={confirmClose}
          title="Close this support ticket?"
          body="Closing indicates this issue has concluded. You can create a new ticket anytime."
          confirmLabel="Close Ticket"
          cancelLabel="Keep Open"
          danger
          onCancel={() => setConfirmClose(false)}
          onConfirm={() => {
            setConfirmClose(false);
            handleStatusChange("CLOSED");
          }}
        />

        {/* Confirm Resolve Modal */}
        <ConfirmModal
          open={confirmResolve}
          title="Mark ticket as resolved?"
          body="Let our support team know that your request or enquiry has been satisfied."
          confirmLabel="Yes, Resolved"
          cancelLabel="Not Yet"
          onCancel={() => setConfirmResolve(false)}
          onConfirm={() => {
            setConfirmResolve(false);
            handleStatusChange("RESOLVED");
          }}
        />
      </div>
    </MobileFrame>
  );
}

export default TicketDetail;
