import React, { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import {
  Bell,
  Send,
  PlusCircle,
  Copy,
  Users,
  Search,
  CheckCircle,
  Clock,
  Trash2,
  Eye,
  Megaphone,
} from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

interface NotificationBroadcast {
  id: string;
  title: string;
  message: string;
  targetAudience: string;
  sentAt: string;
  recipientsCount: number;
  status: "sent" | "scheduled" | "draft";
}

const INITIAL_NOTIFS: NotificationBroadcast[] = [
  {
    id: "NOTIF-901",
    title: "Diwali Seller Promotion Registration Open",
    message: "Boost your store listings with up to 50% discount on ad placement slots before Diwali festival!",
    targetAudience: "Verified Sellers",
    sentAt: new Date(Date.now() - 3600_000).toISOString(),
    recipientsCount: 320,
    status: "sent",
  },
  {
    id: "NOTIF-902",
    title: "Safety Reminder: Keep Payments On-Platform",
    message: "Never pay advance money off-platform. Omeetso Escrow protects your payments.",
    targetAudience: "All Registered Users",
    sentAt: new Date(Date.now() - 86400_000).toISOString(),
    recipientsCount: 4200,
    status: "sent",
  },
  {
    id: "NOTIF-903",
    title: "GSTIN Auto-Verification Maintenance Schedule",
    message: "Store verification APIs will undergo maintenance tonight from 2:00 AM to 4:00 AM.",
    targetAudience: "Business Sellers Only",
    sentAt: new Date(Date.now() + 86400_000).toISOString(),
    recipientsCount: 148,
    status: "scheduled",
  },
];

export default function NotificationsPage() {
  const [broadcasts, setBroadcasts] = useState<NotificationBroadcast[]>(INITIAL_NOTIFS);
  const [activeTab, setActiveTab] = useState<"all" | "sent" | "scheduled">("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetAudience, setTargetAudience] = useState("All Registered Users");

  const { showSuccess } = useToast();

  const filtered = broadcasts.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.targetAudience.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (activeTab === "sent") return b.status === "sent";
    if (activeTab === "scheduled") return b.status === "scheduled";
    return true;
  });

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;

    const newBroadcast: NotificationBroadcast = {
      id: `NOTIF-${Date.now()}`,
      title,
      message,
      targetAudience,
      sentAt: new Date().toISOString(),
      recipientsCount: targetAudience.includes("All") ? 4200 : 320,
      status: "sent",
    };

    setBroadcasts([newBroadcast, ...broadcasts]);
    setIsComposeOpen(false);
    setTitle("");
    setMessage("");
    showSuccess("Push Broadcast Triggered", `Sent broadcast notification to ${newBroadcast.recipientsCount} recipients.`);
  };

  const handleDelete = (id: string) => {
    setBroadcasts(broadcasts.filter((b) => b.id !== id));
    showSuccess("Broadcast Removed", "Notification record deleted.");
  };

  return (
    <PageContainer>
      <PageHeader
        title="Push Notifications & Broadcast Manager"
        description="Compose system announcements, promotional push alerts, and targeted buyer-seller notifications."
        badge={`${broadcasts.length} Active Broadcasts`}
        badgeColor="indigo"
        primaryAction={
          <button
            onClick={() => setIsComposeOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#3547D4] text-white hover:bg-[#111E4D] transition-colors shadow-sm"
          >
            <Send className="w-4 h-4" />
            <span>Compose Push Broadcast</span>
          </button>
        }
      />

      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5 space-y-4">
        {/* Navigation Tabs & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
          <div className="flex items-center space-x-1.5 text-xs">
            {[
              { id: "all", label: `All Broadcasts (${broadcasts.length})` },
              { id: "sent", label: "Sent Notifications" },
              { id: "scheduled", label: "Scheduled Alerts" },
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
              placeholder="Search title, target audience..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none focus:ring-2 focus:ring-[#3547D4]"
            />
          </div>
        </div>

        {/* Broadcast Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F7FC] text-[#64748B] font-bold uppercase text-[10px] border-b border-[#E2E8F0]">
              <tr>
                <th className="p-3">Title & ID</th>
                <th className="p-3">Message Snippet</th>
                <th className="p-3">Target Audience</th>
                <th className="p-3">Recipients</th>
                <th className="p-3">Sent Timestamp</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No notification broadcasts found.
                  </td>
                </tr>
              ) : (
                filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-bold text-[#111827]">
                      <div>{b.title}</div>
                      <div className="text-[10px] text-slate-400 font-mono">ID: {b.id}</div>
                    </td>
                    <td className="p-3 text-slate-600 max-w-xs truncate">{b.message}</td>
                    <td className="p-3 font-semibold text-[#3547D4]">{b.targetAudience}</td>
                    <td className="p-3 font-bold text-[#111827]">{b.recipientsCount} Users</td>
                    <td className="p-3 text-slate-400 font-mono text-[11px]">
                      {new Date(b.sentAt).toLocaleString()}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDelete(b.id)}
                        className="p-1.5 text-slate-400 hover:text-[#DC3545] hover:bg-red-50 rounded-lg"
                        title="Delete Broadcast Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* COMPOSE BROADCAST MODAL */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <form onSubmit={handleSendBroadcast} className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in-50">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-sm font-bold text-[#111827]">Compose Push Broadcast Alert</h3>
              <button type="button" onClick={() => setIsComposeOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#111827] mb-1">Notification Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Special Festival Deals Announced!"
                  className="w-full p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-[#111827] mb-1">Target Audience</label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none"
                >
                  <option value="All Registered Users">All Registered Users (4,200)</option>
                  <option value="Verified Sellers">Verified Sellers Only (320)</option>
                  <option value="Business Sellers Only">Business Sellers Only (148)</option>
                  <option value="Hyderabad Users">Hyderabad Region Users</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-[#111827] mb-1">Notification Body Text</label>
                <textarea
                  required
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter message body..."
                  className="w-full p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none"
                />
              </div>
            </div>
            <div className="pt-2 flex justify-end space-x-2">
              <button type="button" onClick={() => setIsComposeOpen(false)} className="px-4 py-2 text-xs font-semibold bg-[#F5F7FC] rounded-xl text-[#111827]">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 text-xs font-bold bg-[#3547D4] text-white rounded-xl hover:bg-[#111E4D]">
                Launch Push Notification
              </button>
            </div>
          </form>
        </div>
      )}
    </PageContainer>
  );
}
