import React, { useEffect, useState, useRef, useCallback } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import {
  getAdminConversationsApi,
  getAdminConversationMessagesApi,
  flagAdminConversationApi,
  sendAdminWarningMessageApi
} from "@/api/adminChats.api";
import { AdminAuthService } from "@/services/adminAuthService";
import {
  MessageSquare,
  Search,
  ShieldAlert,
  Wifi,
  WifiOff,
  User,
  Store,
  Package,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Eye,
  Filter,
  Flag,
  Shield,
  Send
} from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import { io, Socket } from "socket.io-client";

export default function AdminChatMonitoringPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContext, setSelectedContext] = useState<"ALL" | "LISTING" | "STORE" | "FLAGGED">("ALL");

  // Selected conversation for transcript inspection
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [activeMessages, setActiveMessages] = useState<any[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);

  // Warning Modal State
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const [warningText, setWarningText] = useState("");
  const [sendingWarning, setSendingWarning] = useState(false);

  // Real-time socket state
  const [socketConnected, setSocketConnected] = useState(false);
  const [liveEventsCount, setLiveEventsCount] = useState(0);
  const socketRef = useRef<Socket | null>(null);

  const { showSuccess, showError } = useToast();

  // Load conversations list
  const loadConversations = useCallback(async () => {
    setLoading(true);
    const params: Record<string, any> = {};
    if (selectedContext !== "ALL" && selectedContext !== "FLAGGED") {
      params.contextType = selectedContext;
    }
    if (selectedContext === "FLAGGED") {
      params.flaggedOnly = "true";
    }

    const res = await getAdminConversationsApi(params);
    setLoading(false);
    if (res.success && res.data) {
      setConversations(res.data);
      if (res.data.length > 0 && !activeConvId) {
        setActiveConvId(res.data[0].id);
      }
    } else {
      showError("Failed to Load Chats", res.error || "Could not fetch conversations");
    }
  }, [selectedContext, activeConvId, showError]);

  // Load messages for selected conversation
  const loadMessages = useCallback(async (convId: string) => {
    setMessagesLoading(true);
    const res = await getAdminConversationMessagesApi(convId);
    setMessagesLoading(false);
    if (res.success && res.data) {
      setActiveMessages(res.data);
    }
  }, []);
  const handleSendWarning = async () => {
    if (!activeConvId || !warningText.trim()) return;
    setSendingWarning(true);
    const res = await sendAdminWarningMessageApi(activeConvId, warningText.trim());
    setSendingWarning(false);
    if (res.success) {
      showSuccess("Warning Sent", "Moderator warning injected into buyer-seller chat.");
      setIsWarningModalOpen(false);
      loadMessages(activeConvId);
    } else {
      showError("Failed to Send Warning", res.error);
    }
  };
  useEffect(() => {
    loadConversations();
  }, [selectedContext]);

  useEffect(() => {
    if (activeConvId) {
      loadMessages(activeConvId);
    }
  }, [activeConvId, loadMessages]);

  // ── Socket.IO Real-Time Connection ──
  useEffect(() => {
    const token = AdminAuthService.getAccessToken();
    if (!token) return;

    const socket = io("http://localhost:3000", {
      auth: { token },
      transports: ["websocket", "polling"]
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setSocketConnected(true);
      socket.emit("admin:join_monitoring");
    });

    socket.on("disconnect", () => {
      setSocketConnected(false);
    });

    // Real-time message streaming across the whole platform!
    socket.on("admin:message:new", (data: any) => {
      setLiveEventsCount((c) => c + 1);

      if (activeConvId && data.conversationId === activeConvId) {
        setActiveMessages((prev) => [
          ...prev,
          {
            id: data.id,
            conversationId: data.conversationId,
            sender: { name: data.senderName || "User" },
            type: data.type,
            text: data.text,
            imageUrl: data.imageUrl,
            status: data.status,
            createdAt: data.createdAt || new Date().toISOString(),
            isFlagged: data.isFlagged,
            reasons: data.reasons
          }
        ]);
      }

      setConversations((prev) => {
        const found = prev.find((c) => c.id === data.conversationId);
        if (!found) {
          loadConversations();
          return prev;
        }

        const updated = {
          ...found,
          lastMessagePreview: data.text || "[Attachment]",
          lastMessageAt: data.createdAt || new Date().toISOString(),
          isFlagged: found.isFlagged || Boolean(data.isFlagged),
          flagReason: data.reasons?.join(", ") || found.flagReason
        };

        return [updated, ...prev.filter((c) => c.id !== data.conversationId)];
      });
    });

    // Real-time High-Priority Safety Incident Socket Listener
    socket.on("admin:flagged_message", (data: { conversationId: string; senderName: string; reasons: string[]; severity: string; text: string }) => {
      showError(
        "🚨 Safety Rule Violation Detected!",
        `${data.senderName}: ${data.reasons.join(" • ")}`
      );

      // Auto-open flagged conversation for inspection
      setActiveConvId(data.conversationId);
    });

    return () => {
      socket.disconnect();
    };
  }, [activeConvId, loadConversations]);

  // Toggle flag status
  const handleToggleFlag = async (conv: any) => {
    const nextFlag = !conv.isFlagged;
    const res = await flagAdminConversationApi(conv.id, nextFlag, nextFlag ? "Flagged by Admin Auditor" : undefined);
    if (res.success) {
      showSuccess(
        nextFlag ? "Conversation Flagged" : "Flag Removed",
        nextFlag ? "Marked for safety investigation." : "Flag cleared."
      );
      setConversations((prev) =>
        prev.map((c) => (c.id === conv.id ? { ...c, isFlagged: nextFlag } : c))
      );
    } else {
      showError("Error Updating Flag", res.error);
    }
  };

  const filteredConversations = conversations.filter((c) => {
    if (!searchTerm.trim()) return true;
    const search = searchTerm.toLowerCase();
    const listingTitle = c.listing?.title?.toLowerCase() || "";
    const storeName = c.store?.name?.toLowerCase() || "";
    const participantNames = c.participants.map((p: any) => p.name?.toLowerCase() || "").join(" ");
    const preview = c.lastMessagePreview?.toLowerCase() || "";

    return (
      c.id.toLowerCase().includes(search) ||
      listingTitle.includes(search) ||
      storeName.includes(search) ||
      participantNames.includes(search) ||
      preview.includes(search)
    );
  });

  const activeConv = conversations.find((c) => c.id === activeConvId);

  return (
    <PageContainer>
      <PageHeader
        title="Real-Time Buyer-Seller & Store Chat Monitor"
        description="Audit live buyer-seller conversations, inspect real-time message streams, and enforce platform communication rules."
        badge={socketConnected ? `Live Gateway Active (${liveEventsCount} events)` : "Connecting Sockets..."}
        badgeColor={socketConnected ? "success" : "warning"}
      />

      <div className="space-y-4">
        {/* Top Controls & Search Bar */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="font-bold text-[#64748B] flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5" /> Scope:
            </span>
            {[
              { id: "ALL", label: `All Chats (${conversations.length})` },
              { id: "LISTING", label: "Buyer-Seller Listings" },
              { id: "STORE", label: "Store Messages" },
              { id: "FLAGGED", label: "Flagged / Escalated" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedContext(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${selectedContext === tab.id
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
                placeholder="Search user, title, text..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none focus:ring-2 focus:ring-[#3547D4]"
              />
            </div>
            <button
              onClick={loadConversations}
              className="p-2 bg-[#F5F7FC] hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
              title="Refresh List"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Grid: Split View (Conversations List + Live Transcript Inspector) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Left Column: Conversations Feed (5 Cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col h-[650px]">
            <div className="p-3 border-b border-[#E2E8F0] bg-[#F5F7FC] flex items-center justify-between">
              <div className="text-xs font-bold text-[#111827] flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-[#3547D4]" />
                Conversations Stream
              </div>
              <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {socketConnected ? <Wifi className="w-3 h-3 text-emerald-600 animate-pulse" /> : <WifiOff className="w-3 h-3 text-amber-500" />}
                {socketConnected ? "Realtime Active" : "Offline"}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-[#E2E8F0]">
              {loading ? (
                <div className="p-8 text-center text-xs text-slate-400">Loading platform conversations...</div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">No conversations found.</div>
              ) : (
                filteredConversations.map((c) => {
                  const isActive = c.id === activeConvId;
                  const isStore = c.contextType === "STORE";

                  return (
                    <div
                      key={c.id}
                      onClick={() => setActiveConvId(c.id)}
                      className={`p-3 cursor-pointer transition-colors border-l-4 ${isActive
                        ? "bg-blue-50/60 border-l-[#3547D4]"
                        : c.isFlagged
                          ? "border-l-[#DC3545] hover:bg-slate-50"
                          : "border-l-transparent hover:bg-slate-50"
                        }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center space-x-2 min-w-0">
                          {c.listing?.image || c.store?.logo ? (
                            <img
                              src={c.listing?.image || c.store?.logo}
                              alt=""
                              className="w-9 h-9 rounded-xl object-cover border border-[#E2E8F0] shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold shrink-0">
                              {isStore ? <Store className="w-4 h-4" /> : <Package className="w-4 h-4" />}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs text-[#111827] truncate">
                                {c.listing?.title || c.store?.name || "Marketplace Subject"}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 truncate">
                              {c.participants.map((p: any) => p.name).join(" ↔ ")}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(c.lastMessageAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          {c.isFlagged && (
                            <div className="mt-0.5">
                              <span className="px-1.5 py-0.2 bg-red-100 text-[#DC3545] font-extrabold text-[9px] rounded-full">
                                Flagged
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <p className="mt-2 text-xs text-slate-600 line-clamp-1 bg-slate-100/70 p-1.5 rounded-lg border border-slate-200/50 font-sans">
                        "{c.lastMessagePreview}"
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Live Transcript Inspector (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm flex flex-col h-[650px] overflow-hidden">
            {activeConv ? (
              <>
                {/* Header info */}
                <div className="p-4 border-b border-[#E2E8F0] bg-[#F5F7FC] flex items-center justify-between">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#3547D4] flex items-center justify-center font-bold shrink-0">
                      {activeConv.contextType === "STORE" ? <Store className="w-5 h-5" /> : <Package className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs font-bold text-[#111827] truncate">
                        {activeConv.listing?.title || activeConv.store?.name || "Conversation Details"}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-mono">
                        ID: {activeConv.id} • Context: {activeConv.contextType}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setWarningText("⚠️ System Warning: Sharing direct phone numbers or off-platform payment details (GPay/UPI) is strictly against Omeetso Safety Rules.");
                        setIsWarningModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-100 text-amber-900 hover:bg-amber-200 transition-colors flex items-center gap-1"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-800" />
                      Send Warning
                    </button>
                    <button
                      onClick={() => handleToggleFlag(activeConv)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 ${activeConv.isFlagged
                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                        : "bg-red-100 text-[#DC3545] hover:bg-red-200"
                        }`}
                    >
                      <Flag className="w-3.5 h-3.5" />
                      {activeConv.isFlagged ? "Clear Flag" : "Flag Escalation"}
                    </button>
                  </div>
                </div>

                {/* Participant Metadata Strip */}
                <div className="px-4 py-2 bg-slate-50 border-b border-[#E2E8F0] flex items-center justify-between text-xs text-slate-600">
                  <div className="flex items-center space-x-4">
                    {activeConv.participants.map((p: any, idx: number) => (
                      <div key={p.id || idx} className="flex items-center space-x-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-bold text-[#111827]">{p.name}</span>
                        {p.email && <span className="text-[10px] text-slate-400">({p.email})</span>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Message Log Feed */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                  {messagesLoading ? (
                    <div className="p-8 text-center text-xs text-slate-400">Fetching transcript history...</div>
                  ) : activeMessages.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400">No messages in this chat thread.</div>
                  ) : (
                    activeMessages.map((msg) => {
                      return (
                        <div
                          key={msg.id}
                          className={`p-3 rounded-xl border shadow-sm space-y-1 transition-all ${msg.isFlagged
                            ? "bg-red-50/80 border-red-300 ring-1 ring-red-400"
                            : "bg-white border-[#E2E8F0]"
                            }`}
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-[#3547D4]">
                              {msg.sender?.name || "Participant"}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                            </span>
                          </div>

                          <p className="text-xs text-slate-800 whitespace-pre-wrap font-sans">
                            {msg.text || (msg.imageUrl ? "[Attached Image]" : "[No Content]")}
                          </p>

                          {msg.isFlagged && (
                            <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-[#DC3545] bg-red-100 p-1.5 rounded-lg border border-red-200">
                              <ShieldAlert className="w-3 h-3 shrink-0" />
                              <span>Auto-Flagged: {msg.reasons?.join(", ") || "Policy violation rule trigger"}</span>
                            </div>
                          )}

                          {msg.offer && (
                            <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs font-bold text-amber-900 flex items-center justify-between mt-1">
                              <span>Offer Sent: ₹{(msg.offer.amountInPaise / 100).toLocaleString("en-IN")}</span>
                              <span className="uppercase text-[10px] px-2 py-0.5 bg-amber-200 rounded-full">{msg.offer.status}</span>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Footer Auditor Info */}
                <div className="p-3 border-t border-[#E2E8F0] bg-white flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-emerald-600" />
                    Encrypted Admin Audit Mode — All updates stream in real time.
                  </div>
                </div>
              </>
            ) : (
              <div className="p-12 text-center text-slate-400 text-xs my-auto">
                Select a conversation on the left to view the real-time message stream.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODERATOR WARNING MODAL */}
      {isWarningModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in-50">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-sm font-bold text-[#111827] flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" /> Send Moderator Warning to Chat
              </h3>
              <button onClick={() => setIsWarningModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <p className="text-xs text-slate-600">
              This message will be injected directly into the live buyer-seller conversation as an official Omeetso Safety Warning.
            </p>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[#111827] uppercase">Preset Warning Templates:</label>
              <div className="flex flex-col gap-1.5">
                {[
                  "⚠️ System Warning: Sharing direct phone numbers or off-platform contact details is strictly against Omeetso Safety Policy.",
                  "⚠️ System Warning: Off-platform payment requests (GPay, UPI, direct wire transfer) violate safety rules. Pay only through the official app.",
                  "⚠️ System Warning: Abusive or harassing language is prohibited. Continued violations will lead to permanent account suspension."
                ].map((template, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setWarningText(template)}
                    className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs hover:bg-amber-50 hover:border-amber-300 transition-colors line-clamp-2"
                  >
                    {template}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#111827]">Warning Message Text:</label>
              <textarea
                rows={4}
                value={warningText}
                onChange={(e) => setWarningText(e.target.value)}
                className="w-full p-3 text-xs rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none focus:ring-2 focus:ring-amber-500 font-sans"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-[#E2E8F0]">
              <button
                onClick={() => setIsWarningModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold bg-[#F5F7FC] rounded-xl text-[#111827] hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSendWarning}
                disabled={sendingWarning || !warningText.trim()}
                className="px-4 py-2 text-xs font-bold bg-amber-600 text-white rounded-xl hover:bg-amber-700 disabled:opacity-50"
              >
                {sendingWarning ? "Sending..." : "Send Warning to Chat"}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
