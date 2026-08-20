import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { MockDataService } from "@/services/mockDataService";
import type { SupportTicket } from "@/types";
import {
  Search,
  Send,
} from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

export default function TicketsListPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "open" | "assigned" | "resolved">("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Modals state
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [assignedAgent, setAssignedAgent] = useState("Support Agent A");

  const { showSuccess } = useToast();

  const loadTickets = () => {
    setTickets(MockDataService.getTickets());
  };

  useEffect(() => {
    loadTickets();
  }, []);

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

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;

    const updated = MockDataService.updateTicketStatus(selectedTicket.id, "resolved", assignedAgent);
    setTickets(updated);
    setReplyText("");
    setIsInspectorOpen(false);
    showSuccess("Reply Posted & Ticket Resolved", `Responded to ${selectedTicket.userName} and resolved ticket.`);
  };

  const handleStatusChange = (ticketId: string, status: SupportTicket["status"]) => {
    const updated = MockDataService.updateTicketStatus(ticketId, status, assignedAgent);
    setTickets(updated);
    setIsInspectorOpen(false);
    showSuccess("Ticket Status Updated", `Ticket status changed to ${status}.`);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Support Desk & Customer Inquiry Tickets"
        description="Manage customer inquiries, seller payout queries, dispute escalations, and operator responses."
        badge={`${tickets.length} Support Tickets`}
        badgeColor="warning"
      />

      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5 space-y-4">
        {/* Navigation Tabs & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {[
              { id: "all", label: `All Tickets (${tickets.length})` },
              { id: "open", label: "Open Queue" },
              { id: "assigned", label: "Assigned" },
              { id: "resolved", label: "Resolved / Closed" },
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

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search subject, user, category..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none focus:ring-2 focus:ring-[#3547D4]"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F7FC] text-[#64748B] font-bold uppercase text-[10px] border-b border-[#E2E8F0]">
              <tr>
                <th className="p-3">Ticket Subject & ID</th>
                <th className="p-3">User</th>
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
                      <div>{t.subject}</div>
                      <div className="text-[10px] text-slate-400 font-mono">ID: {t.id}</div>
                    </td>
                    <td className="p-3 font-medium text-[#111827]">
                      <div>{t.userName}</div>
                      <div className="text-[10px] text-slate-400">ID: {t.userId}</div>
                    </td>
                    <td className="p-3 font-medium text-slate-600 capitalize">{t.category}</td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                          (t.priority as string) === "high" || (t.priority as string) === "critical"
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
                        {t.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedTicket(t);
                          setAssignedAgent(t.assignedTo || "Support Agent A");
                          setIsInspectorOpen(true);
                        }}
                        className="px-3 py-1.5 bg-[#3547D4] text-white font-bold rounded-lg hover:bg-[#111E4D]"
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
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in-50">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-sm font-bold text-[#111827]">Support Desk ({selectedTicket.id})</h3>
              <button onClick={() => setIsInspectorOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#F5F7FC] rounded-xl space-y-1">
                <div className="font-bold text-sm text-[#111827]">{selectedTicket.subject}</div>
                <div className="text-[11px] text-[#64748B]">From: {selectedTicket.userName} ({selectedTicket.userId}) — Category: {selectedTicket.category}</div>
              </div>

              <div>
                <label className="block font-bold text-[#111827] mb-1">Assign Operator</label>
                <select
                  value={assignedAgent}
                  onChange={(e) => setAssignedAgent(e.target.value)}
                  className="w-full p-2 rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none"
                >
                  <option value="Support Agent A">Support Agent A (Tier 1)</option>
                  <option value="Support Agent B">Support Agent B (Tier 2 Escalations)</option>
                  <option value="Finance Support Desk">Finance Support Desk</option>
                </select>
              </div>

              <form onSubmit={handleSendReply} className="space-y-2">
                <label className="block font-bold text-[#111827]">Operator Reply Message</label>
                <textarea
                  required
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type official support response to customer..."
                  className="w-full p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none"
                />
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedTicket.id, "resolved")}
                    className="px-3 py-1.5 text-xs font-bold bg-emerald-100 text-[#16A36A] rounded-xl hover:bg-emerald-200"
                  >
                    ✓ Resolve Without Reply
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold bg-[#3547D4] text-white rounded-xl hover:bg-[#111E4D]"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Reply & Resolve</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
