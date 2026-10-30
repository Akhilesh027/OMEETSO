import React, { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { MockDataService } from "@/services/mockDataService";
import type { SupportTicket } from "@/types";
import {
  Search,
  Send,
  RefreshCw,
  MessageSquare,
  Clock,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import {
  getAdminSupportTicketsApi,
  adminReplyTicketApi,
  adminGetTicketMessagesApi,
  AdminSupportTicketItem
} from "@/api/adminSupport.api";

interface MessageItem {
  id: string;
  senderType: "user" | "admin" | "system";
  senderName: string;
  text: string;
  attachments?: string[];
  createdAt: string;
}

export default function TicketsListPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>(() => {
    try {
      const cached = localStorage.getItem("omeetso_admin_support_live");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return MockDataService.getTickets();
  });
  const [activeTab, setActiveTab] = useState<"all" | "open" | "assigned" | "resolved">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Modals & Inspection state
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [assignedAgent, setAssignedAgent] = useState("Support Agent A");
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const { showSuccess, showError } = useToast();

  const fetchLiveTickets = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getAdminSupportTicketsApi();
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        const mappedTickets: SupportTicket[] = res.data.map((t: AdminSupportTicketItem) => {
          const rawStatus = (t.status || "").toLowerCase();
          const mappedStatus: SupportTicket["status"] =
            rawStatus === "resolved" || rawStatus === "closed"
              ? "resolved"
              : rawStatus === "in_progress" || rawStatus === "assigned"
              ? "assigned"
              : "open";

          return {
            id: t.ticketNumber || t.id,
            subject: t.subject || "Support Inquiry",
            userId: t.user?.id || "usr-anon",
            userName: t.user?.name || (t.user?.phone ? `User (${t.user.phone})` : "Omeetso Member"),
            category: t.category || "General",
            priority: (t.priority?.toLowerCase() as any) || "medium",
            status: mappedStatus,
            createdAt: t.createdAt,
            assignedTo: t.resolutionNotes ? "Support Agent" : undefined,
            lastUpdated: t.updatedAt || t.createdAt,
            // Extra fields
            _rawId: t.id,
            description: t.description,
            contactMethod: t.contactMethod
          } as any;
        });

        setTickets(mappedTickets);
        try {
          localStorage.setItem("omeetso_admin_support_live", JSON.stringify(mappedTickets));
        } catch {}
      } else {
        // Fall back to MockDataService if no live tickets yet
        setTickets(MockDataService.getTickets());
      }
    } catch {
      setTickets(MockDataService.getTickets());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveTickets();
  }, [fetchLiveTickets]);

  const loadTicketMessages = async (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setIsInspectorOpen(true);
    setLoadingMessages(true);
    setMessages([]);

    const ticketKey = (ticket as any)._rawId || ticket.id;
    try {
      const res = await adminGetTicketMessagesApi(ticketKey);
      if (res.success && res.data) {
        setMessages(res.data);
      }
    } catch {
      // ignore
    } finally {
      setLoadingMessages(false);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === "open") return t.status === "open";
    if (activeTab === "assigned") return t.status === "assigned";
    if (activeTab === "resolved") return t.status === "resolved";

    return true;
  });

  const handleSendReply = async (e?: React.FormEvent, shouldResolve = false) => {
    if (e) e.preventDefault();
    if (!selectedTicket || !replyText.trim() || isSubmittingReply) return;

    setIsSubmittingReply(true);
    const ticketKey = (selectedTicket as any)._rawId || selectedTicket.id;
    const targetStatus = shouldResolve ? "resolved" : (selectedTicket.status === "open" ? "in_progress" : selectedTicket.status);

    try {
      const res = await adminReplyTicketApi(ticketKey, {
        text: replyText.trim(),
        status: targetStatus,
        resolutionNotes: shouldResolve ? replyText.trim() : undefined
      });

      if (res.success) {
        showSuccess(
          shouldResolve ? "Reply Sent & Marked Resolved" : "Reply Sent",
          `Responded to ${selectedTicket.userName}.`
        );

        // Immediately reflect the new message in the open conversation history
        const newMsg: MessageItem = {
          id: res.data?.id || `msg-${Date.now()}`,
          senderType: "admin",
          senderName: assignedAgent || "Support Operator",
          text: replyText.trim(),
          createdAt: res.data?.createdAt || new Date().toISOString()
        };
        setMessages((prev) => [...prev, newMsg]);

        // Update status of currently inspected ticket
        setSelectedTicket((prev) =>
          prev
            ? {
                ...prev,
                status: shouldResolve ? "resolved" : prev.status === "open" ? "assigned" : prev.status
              }
            : null
        );

        setReplyText("");
        fetchLiveTickets();
      } else {
        // Fallback for mock tickets if live server ID doesn't exist
        const updated = MockDataService.updateTicketStatus(selectedTicket.id, shouldResolve ? "resolved" : "assigned", assignedAgent);
        setTickets(updated);
        const newMsg: MessageItem = {
          id: `msg-${Date.now()}`,
          senderType: "admin",
          senderName: assignedAgent || "Support Operator",
          text: replyText.trim(),
          createdAt: new Date().toISOString()
        };
        setMessages((prev) => [...prev, newMsg]);
        setSelectedTicket((prev) =>
          prev
            ? {
                ...prev,
                status: shouldResolve ? "resolved" : "assigned"
              }
            : null
        );
        setReplyText("");
        showSuccess("Reply Sent (Local Demo)", `Updated demo ticket.`);
      }
    } catch {
      const updated = MockDataService.updateTicketStatus(selectedTicket.id, shouldResolve ? "resolved" : "assigned", assignedAgent);
      setTickets(updated);
      setReplyText("");
      showSuccess("Reply Saved", `Updated ticket.`);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleStatusChange = async (ticketId: string, status: SupportTicket["status"]) => {
    const ticket = tickets.find((t) => t.id === ticketId);
    const ticketKey = (ticket as any)?._rawId || ticketId;

    try {
      const res = await adminReplyTicketApi(ticketKey, {
        text: `Status updated to ${status} by ${assignedAgent}.`,
        status: status === "resolved" ? "resolved" : "in_progress"
      });
      if (res.success && selectedTicket) {
        setSelectedTicket((prev) => prev ? { ...prev, status } : null);
      }
      fetchLiveTickets();
    } catch {
      const updated = MockDataService.updateTicketStatus(ticketId, status, assignedAgent);
      setTickets(updated);
    }

    showSuccess("Ticket Status Updated", `Ticket status changed to ${status}.`);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Support Desk & Customer Inquiries"
        description="Review customer complaints, merchant payouts, account help tickets, and dispatch operator replies in real-time."
        badge={`${tickets.length} Active Tickets`}
        badgeColor="warning"
      />

      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5 space-y-4">
        {/* Navigation Tabs, Search & Refresh */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {[
              { id: "all", label: `All Tickets (${tickets.length})` },
              { id: "open", label: `Open Queue (${tickets.filter(t => t.status === "open").length})` },
              { id: "assigned", label: `In Progress (${tickets.filter(t => t.status === "assigned").length})` },
              { id: "resolved", label: `Resolved (${tickets.filter(t => t.status === "resolved").length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
                  activeTab === tab.id
                    ? "bg-[#3547D4] text-white shadow-sm"
                    : "bg-[#F5F7FC] text-[#64748B] hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search subject, user, ticket #..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none focus:ring-2 focus:ring-[#3547D4]"
              />
            </div>

            <button
              onClick={fetchLiveTickets}
              disabled={isLoading}
              title="Refresh tickets from server"
              className="p-2 border border-[#E2E8F0] bg-[#F5F7FC] hover:bg-slate-200 text-[#64748B] rounded-xl transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-[#3547D4]" : ""}`} />
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F7FC] text-[#64748B] font-bold uppercase text-[10px] border-b border-[#E2E8F0]">
              <tr>
                <th className="p-3">Ticket Subject & Number</th>
                <th className="p-3">User & Contact</th>
                <th className="p-3">Category</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Assigned Operator</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No support tickets found.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-bold text-[#111827]">
                      <div className="line-clamp-1">{t.subject}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">#{t.id}</div>
                    </td>
                    <td className="p-3 font-medium text-[#111827]">
                      <div>{t.userName}</div>
                      <div className="text-[10px] text-slate-400">ID: {t.userId}</div>
                    </td>
                    <td className="p-3 font-medium text-slate-600 capitalize">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px] font-semibold text-slate-700">
                        {t.category}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                          (t.priority as string) === "urgent" || (t.priority as string) === "high" || (t.priority as string) === "critical"
                            ? "bg-red-100 text-[#DC3545]"
                            : t.priority === "medium"
                            ? "bg-amber-100 text-amber-900"
                            : "bg-blue-100 text-[#2563EB]"
                        }`}
                      >
                        {t.priority}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600">{t.assignedTo || "Unassigned"}</td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full capitalize ${
                          t.status === "resolved"
                            ? "bg-emerald-100 text-[#16A36A]"
                            : t.status === "assigned"
                            ? "bg-amber-100 text-amber-900"
                            : "bg-blue-100 text-[#2563EB]"
                        }`}
                      >
                        {t.status === "assigned" ? "In Progress" : t.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => {
                          setAssignedAgent(t.assignedTo || "Support Agent A");
                          loadTicketMessages(t);
                        }}
                        className="px-3 py-1.5 bg-[#3547D4] text-white font-bold rounded-lg hover:bg-[#111E4D] transition-colors"
                      >
                        Open Ticket Desk
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* TICKET THREAD & REPLY DESK MODAL */}
      {isInspectorOpen && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl animate-in fade-in-50 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 shrink-0">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-[#3547D4]" />
                <h3 className="text-sm font-bold text-[#111827]">Support Desk — #{selectedTicket.id}</h3>
              </div>
              <button
                onClick={() => setIsInspectorOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs overflow-y-auto pr-1 flex-1">
              <div className="p-3 bg-[#F5F7FC] rounded-xl space-y-1.5 border border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-sm text-[#111827]">{selectedTicket.subject}</div>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-100 text-[#3547D4] uppercase">
                    {selectedTicket.category}
                  </span>
                </div>
                <div className="text-[11px] text-[#64748B]">
                  From: <span className="font-semibold text-slate-800">{selectedTicket.userName}</span> (ID: {selectedTicket.userId})
                </div>
                {(selectedTicket as any).description && (
                  <p className="text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 mt-2 text-xs">
                    {(selectedTicket as any).description}
                  </p>
                )}
              </div>

              {/* Message Thread History */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                  <span>Conversation History</span>
                  {loadingMessages && <span className="text-blue-500 font-normal">Loading messages...</span>}
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2.5 max-h-48 overflow-y-auto">
                  {messages.length === 0 && !loadingMessages ? (
                    <div className="text-center text-slate-400 py-4 text-xs">
                      No additional replies yet.
                    </div>
                  ) : (
                    messages.map((m) => (
                      <div
                        key={m.id}
                        className={`flex flex-col ${m.senderType === "admin" ? "items-end" : "items-start"}`}
                      >
                        <div className="text-[10px] text-slate-400 mb-0.5">
                          {m.senderName} ({m.senderType === "admin" ? "Staff" : "User"})
                        </div>
                        <div
                          className={`max-w-[85%] rounded-xl px-3 py-2 text-xs ${
                            m.senderType === "admin"
                              ? "bg-[#3547D4] text-white"
                              : "bg-white border border-slate-200 text-slate-800"
                          }`}
                        >
                          {m.text}
                          {!!m.attachments?.length && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {m.attachments.filter(url => /^(https?:\/\/|data:(image\/(png|jpeg)|application\/pdf);base64,)/i.test(url)).map((url, index) => (
                                <a key={index} href={url} target="_blank" rel="noopener noreferrer" download={url.startsWith("data:") ? "attachment-" + (index + 1) + (url.startsWith("data:application/pdf") ? ".pdf" : ".jpg") : undefined} className="block rounded-lg border border-slate-200 p-1 underline">
                                  {/^(data:image\/|https?:\/\/.*\.(png|jpe?g|webp)(\?|$))/i.test(url) ? <img src={url} alt={"Support attachment " + (index + 1)} className="max-h-48 max-w-full rounded object-contain" /> : "Download attachment " + (index + 1)}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#111827] mb-1">Assign Operator</label>
                <select
                  value={assignedAgent}
                  onChange={(e) => setAssignedAgent(e.target.value)}
                  className="w-full p-2 rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none text-xs"
                >
                  <option value="Support Agent A">Support Agent A (Tier 1 Support)</option>
                  <option value="Support Agent B">Support Agent B (Tier 2 Escalations)</option>
                  <option value="Finance Support Desk">Finance Support Desk</option>
                  <option value="Safety & Trust Officer">Safety & Trust Officer</option>
                </select>
              </div>

              <form onSubmit={(e) => handleSendReply(e, false)} className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-[#111827]">Operator Reply Message</label>
                  <span className="text-[10px] text-slate-400">Press Enter ↵ to send</span>
                </div>
                <textarea
                  required
                  rows={3}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendReply(undefined, false);
                    }
                  }}
                  placeholder="Type official support response to customer (Press Enter to send)..."
                  className="w-full p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none focus:ring-2 focus:ring-[#3547D4] text-xs transition"
                />
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleStatusChange(selectedTicket.id, selectedTicket.status === "resolved" ? "assigned" : "resolved")}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors ${
                        selectedTicket.status === "resolved"
                          ? "bg-blue-100 text-[#3547D4] hover:bg-blue-200"
                          : "bg-emerald-100 text-[#16A36A] hover:bg-emerald-200"
                      }`}
                    >
                      {selectedTicket.status === "resolved" ? "↺ Reopen Ticket" : "✓ Mark Resolved"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsInspectorOpen(false)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
                    >
                      Close Desk
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSendReply(undefined, true)}
                      disabled={isSubmittingReply || !replyText.trim()}
                      className="px-3 py-1.5 text-xs font-bold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50"
                    >
                      {isSubmittingReply ? "Saving..." : "Reply & Resolve"}
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmittingReply || !replyText.trim()}
                      className="inline-flex items-center space-x-1.5 px-4 py-1.5 text-xs font-bold bg-[#3547D4] text-white rounded-xl hover:bg-[#111E4D] transition-colors disabled:opacity-50 shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSubmittingReply ? "Sending..." : "Send Reply"}</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
