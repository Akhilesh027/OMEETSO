import React, { useState, useEffect, useCallback, useRef } from "react";
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
  RefreshCw,
  Loader2,
  Wifi,
  WifiOff
} from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import {
  getAdminBroadcastsApi,
  createAdminBroadcastApi,
  deleteAdminBroadcastApi,
  NotificationBroadcast
} from "@/api/adminNotifications.api";
import { io, Socket } from "socket.io-client";
import { BACKEND_URL } from "@/config/api";
import { AdminAuthService } from "@/services/adminAuthService";

export default function NotificationsPage() {
  const [broadcasts, setBroadcasts] = useState<NotificationBroadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "sent" | "scheduled">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);

  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetAudience, setTargetAudience] = useState("All Registered Users");

  const socketRef = useRef<Socket | null>(null);
  const { showSuccess, showError } = useToast();

  const loadBroadcasts = useCallback(async () => {
    setLoading(true);
    const res = await getAdminBroadcastsApi();
    setLoading(false);
    if (res.success && res.data) {
      setBroadcasts(res.data);
    } else {
      showError("Failed to Load Broadcasts", res.error || "Could not fetch notifications");
    }
  }, [showError]);

  useEffect(() => {
    loadBroadcasts();
  }, [loadBroadcasts]);

  // ── Real-Time Socket Connection ──
  useEffect(() => {
    const token = AdminAuthService.getAccessToken();
    if (!token) return;

    const socket = io(BACKEND_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      timeout: 5000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setSocketConnected(true);
      socket.emit("admin:join_monitoring");
    });

    socket.on("disconnect", () => {
      setSocketConnected(false);
    });

    socket.on("admin:broadcast:new", (newBroadcast: NotificationBroadcast) => {
      setBroadcasts((prev) => {
        if (prev.some((b) => b.id === newBroadcast.id)) return prev;
        return [newBroadcast, ...prev];
      });
      showSuccess("📢 Real-Time Broadcast Sent", newBroadcast.title);
    });

    socket.on("admin:broadcast:deleted", (data: { id: string }) => {
      setBroadcasts((prev) => prev.filter((b) => b.id !== data.id));
    });

    return () => {
      socket.disconnect();
    };
  }, [showSuccess]);

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

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setIsSubmitting(true);
    const res = await createAdminBroadcastApi({
      title: title.trim(),
      message: message.trim(),
      targetAudience,
      status: "sent"
    });
    setIsSubmitting(false);

    if (res.success && res.data) {
      setBroadcasts((prev) => [res.data!, ...prev.filter((b) => b.id !== res.data!.id)]);
      setIsComposeOpen(false);
      setTitle("");
      setMessage("");
      showSuccess("Push Broadcast Triggered", `Sent broadcast notification to ${res.data.recipientsCount} recipients.`);
    } else {
      showError("Broadcast Failed", res.error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this broadcast notification?")) return;

    const res = await deleteAdminBroadcastApi(id);
    if (res.success) {
      setBroadcasts((prev) => prev.filter((b) => b.id !== id));
      showSuccess("Broadcast Removed", "Notification record deleted from database.");
    } else {
      showError("Delete Failed", res.error);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Push Notifications & Broadcast Manager"
        description="Compose system announcements, promotional push alerts, and targeted buyer-seller notifications."
        badge={socketConnected ? `Realtime Active (${broadcasts.length} Broadcasts)` : `${broadcasts.length} Active Broadcasts`}
        badgeColor={socketConnected ? "success" : "indigo"}
        primaryAction={
          <button
            onClick={() => setIsComposeOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#3547D4] text-white hover:bg-[#111E4D] transition-colors shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Compose Broadcast</span>
          </button>
        }
      />

      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5 space-y-4">
        {/* Navigation Tabs, Search & Realtime Badge */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {[
              { id: "all", label: `All Broadcasts (${broadcasts.length})` },
              { id: "sent", label: `Sent & Delivered (${broadcasts.filter((b) => b.status === "sent").length})` },
              { id: "scheduled", label: `Scheduled (${broadcasts.filter((b) => b.status === "scheduled").length})` },
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
            <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-200 shrink-0">
              {socketConnected ? <Wifi className="w-3.5 h-3.5 text-emerald-600 animate-pulse" /> : <WifiOff className="w-3.5 h-3.5 text-amber-500" />}
              {socketConnected ? "Live Gateway Active" : "Connecting..."}
            </div>

            <button
              onClick={() => loadBroadcasts()}
              className="p-2 rounded-xl border border-[#E2E8F0] hover:bg-slate-100 text-slate-500 transition-colors"
              title="Refresh broadcasts"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>

            <div className="relative w-full md:w-60">
              <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search announcements..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none focus:ring-2 focus:ring-[#3547D4]"
              />
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F7FC] text-[#64748B] font-bold uppercase text-[10px] border-b border-[#E2E8F0]">
              <tr>
                <th className="p-3">Broadcast Title & ID</th>
                <th className="p-3">Target Segment</th>
                <th className="p-3">Recipients Reach</th>
                <th className="p-3">Status</th>
                <th className="p-3">Sent / Scheduled Date</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#3547D4]" />
                    Fetching notifications from database...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No broadcast notifications found. Click "Compose Broadcast" to send a system notification.
                  </td>
                </tr>
              ) : (
                filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-[#111827]">{b.title}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1 max-w-sm">{b.message}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {b.id.slice(-8)}</div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#3547D4] font-medium text-[10px] border border-blue-200">
                        {b.targetAudience}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-slate-700">
                      {b.recipientsCount.toLocaleString("en-IN")} Users
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-full capitalize ${
                          b.status === "sent"
                            ? "bg-emerald-100 text-[#16A36A]"
                            : b.status === "scheduled"
                            ? "bg-amber-100 text-amber-900"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500 font-mono text-[11px]">
                      {new Date(b.sentAt).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDelete(b.id)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors inline-flex items-center justify-center"
                        title="Delete Broadcast"
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
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in-50">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-sm font-bold text-[#111827] flex items-center space-x-2">
                <Megaphone className="w-4 h-4 text-[#3547D4]" />
                <span>Create System Push Broadcast</span>
              </h3>
              <button onClick={() => setIsComposeOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#111827] mb-1">Notification Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Platform Security Update or Festival Sale"
                  className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#3547D4] outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#111827] mb-1">Target Audience</label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#3547D4] outline-none"
                >
                  <option value="All Registered Users">All Registered Users</option>
                  <option value="Verified Sellers">Verified Sellers</option>
                  <option value="Business Sellers Only">Business Sellers Only</option>
                  <option value="Active Buyers">Active Buyers</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#111827] mb-1">Announcement Body / Push Message</label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Compose your broadcast message to platform participants..."
                  className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#3547D4] outline-none resize-none"
                />
              </div>

              <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsComposeOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E2E8F0] text-slate-600 hover:bg-slate-50 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-[#3547D4] text-white hover:bg-[#111E4D] font-bold flex items-center space-x-1 shadow-sm"
                >
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Send className="w-3.5 h-3.5 mr-1" />}
                  <span>{isSubmitting ? "Broadcasting..." : "Send Live Broadcast"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
