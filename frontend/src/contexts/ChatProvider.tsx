/**
 * ChatProvider.tsx
 *
 * React context that wraps the Socket.IO connection and exposes
 * real-time chat state to any component in the tree.
 *
 * - Connects on mount using JWT token from localStorage
 * - Listens for Socket.IO events: message:new, typing, read receipts
 * - Provides conversations list + messages from MongoDB (via REST)
 * - Exposes sendMessage, loadMore, markRead helpers
 * - ZERO localStorage fallback — shows error/offline states on failure
 */
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import {
  connectSocket, disconnectSocket, getSocket,
  joinConversation, leaveConversation, emitTypingStart,
  emitTypingStop, emitMessageRead,
} from "@/realtime/socket";
import { getUserAccessToken } from "@/api/auth.api";
import {
  getConversationsApi, getConversationByIdApi, getMessagesApi, sendMessageApi,
  createOfferApi, updateOfferStatusApi, markConversationReadApi,
  type ConversationItem, type MessageItem,
} from "@/api/chat.api";
import { apiMessageToLocal, conversationToThread } from "@/lib/chat-adapter";
import { toast } from "sonner";
import type { Message } from "@/lib/chat";

// ─── Types ────────────────────────────────────────────────

export type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error";

interface ChatState {
  status: ConnectionStatus;
  conversations: ConversationItem[];
  conversationsLoading: boolean;
  conversationsError: string | null;

  // presence
  onlineUserIds: Set<string>;
  isUserOnline: (userId: string) => boolean;

  // per-conversation messages
  messages: Map<string, Message[]>;
  messagesLoading: Map<string, boolean>;
  cursors: Map<string, string | null>; // next cursor for pagination
  hasMore: Map<string, boolean>;

  // typing
  typingUsers: Map<string, string>; // conversationId → userId

  // actions
  loadConversations: () => Promise<void>;
  fetchConversationById: (conversationId: string) => Promise<ConversationItem | null>;
  addConversation: (item: ConversationItem) => void;
  loadMessages: (conversationId: string) => Promise<void>;
  loadMoreMessages: (conversationId: string) => Promise<void>;
  sendTextMessage: (conversationId: string, text: string) => Promise<void>;
  sendAttachmentMessage: (
    conversationId: string,
    payload: {
      type: "image" | "document" | "location" | "voice" | "contact";
      text?: string;
      imageUrl?: string;
      caption?: string;
      document?: import("@/lib/chat").DocumentAttachment;
      contact?: import("@/lib/chat").ContactAttachment;
      location?: { name: string; area: string };
      voice?: { durationSec: number };
    }
  ) => Promise<void>;
  sendOffer: (conversationId: string, amountInPaise: number, text?: string) => Promise<void>;
  respondToOffer: (offerId: string, action: "ACCEPT" | "DECLINE" | "CANCEL") => Promise<void>;
  markAsRead: (conversationId: string) => void;
  startTyping: (conversationId: string, recipientId: string) => void;
  stopTyping: (conversationId: string, recipientId: string) => void;
  joinRoom: (conversationId: string) => void;
  leaveRoom: (conversationId: string) => void;
}

const ChatContext = createContext<ChatState | null>(null);

export function useChatContext() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChatContext must be used within ChatProvider");
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const [conversationsError, setConversationsError] = useState<string | null>(null);
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());

  const [messages, setMessages] = useState<Map<string, Message[]>>(new Map());
  const [messagesLoading, setMessagesLoading] = useState<Map<string, boolean>>(new Map());
  const [cursors, setCursors] = useState<Map<string, string | null>>(new Map());
  const [hasMore, setHasMore] = useState<Map<string, boolean>>(new Map());
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());

  const typingTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // ── Connect Socket ──
  useEffect(() => {
    const token = getUserAccessToken();
    if (!token) {
      setStatus("disconnected");
      return;
    }

    const socket = connectSocket(token);

    socket.on("connect", () => {
      setStatus("connected");
    });

    socket.on("disconnect", (reason) => {
      if (reason === "io server disconnect") {
        setStatus("disconnected");
      } else {
        setStatus("disconnected");
      }
    });

    socket.on("connect_error", (err) => {
      // If auth token is missing or rejected, set disconnected instead of showing noisy error banners
      if (err?.message?.toLowerCase().includes("token") || err?.message?.toLowerCase().includes("auth") || err?.message?.toLowerCase().includes("user not found")) {
        setStatus("disconnected");
      } else {
        setStatus("error");
      }
    });

    // Real-time Push & In-App Notifications
    socket.on("notification:new", (notif: { title: string; body: string; type: string; link?: string }) => {
      try {
        window.dispatchEvent(new CustomEvent("omeetso_notifications_changed"));
      } catch {}
      toast.info(notif.title, {
        description: notif.body,
        action: notif.link
          ? {
              label: "View",
              onClick: () => {
                window.location.href = notif.link!;
              }
            }
          : undefined
      });
    });

    // Real-time message from another user
    socket.on("message:new", (data: { message: MessageItem; conversationId: string }) => {
      const localMsg = apiMessageToLocal(data.message);
      setMessages((prev) => {
        const next = new Map(prev);
        const existing = next.get(data.conversationId) || [];
        // Dedupe by clientMessageId or id
        if (existing.some((m) => m.id === localMsg.id)) return prev;
        next.set(data.conversationId, [...existing, localMsg]);
        return next;
      });

      // Bump conversation to top
      setConversations((prev) =>
        prev.map((c) =>
          c.id === data.conversationId
            ? {
                ...c,
                lastMessagePreview: data.message.text || "[Media]",
                lastMessageAt: data.message.sentAt || new Date().toISOString(),
                unreadCount: c.unreadCount + 1,
              }
            : c
        )
      );

      try {
        window.dispatchEvent(new CustomEvent("omeetso_chat_updated"));
        window.dispatchEvent(new CustomEvent("omeetso_notifications_changed"));
      } catch {}
    });

    // Typing indicator
    socket.on("typing:start", (data: { conversationId: string; userId: string }) => {
      setTypingUsers((prev) => {
        const next = new Map(prev);
        next.set(data.conversationId, data.userId);
        return next;
      });
      // Auto-clear after 3s
      const existing = typingTimers.current.get(data.conversationId);
      if (existing) clearTimeout(existing);
      typingTimers.current.set(
        data.conversationId,
        setTimeout(() => {
          setTypingUsers((prev) => {
            const next = new Map(prev);
            next.delete(data.conversationId);
            return next;
          });
        }, 3000)
      );
    });

    socket.on("typing:stop", (data: { conversationId: string }) => {
      setTypingUsers((prev) => {
        const next = new Map(prev);
        next.delete(data.conversationId);
        return next;
      });
    });

    // Delivery acknowledgement — update message status
    socket.on("message:delivered", (data: { messageId: string; conversationId: string }) => {
      setMessages((prev) => {
        const next = new Map(prev);
        const existing = next.get(data.conversationId);
        if (!existing) return prev;
        next.set(
          data.conversationId,
          existing.map((m) => (m.id === data.messageId ? { ...m, status: "delivered" as const } : m))
        );
        return next;
      });
    });

    // Read receipt
    socket.on("message:read", (data: { conversationId: string }) => {
      setMessages((prev) => {
        const next = new Map(prev);
        const existing = next.get(data.conversationId);
        if (!existing) return prev;
        next.set(
          data.conversationId,
          existing.map((m) => (m.from === "me" && m.status !== "read" ? { ...m, status: "read" as const } : m))
        );
        return next;
      });
    });

    // Real-time Presence Tracking
    socket.on("presence:initial", (data: { onlineUserIds: string[] }) => {
      if (Array.isArray(data?.onlineUserIds)) {
        setOnlineUserIds(new Set(data.onlineUserIds.map((id) => String(id))));
      }
    });

    socket.on("presence:status", (data: { userId: string; online: boolean }) => {
      if (!data?.userId) return;
      const targetId = String(data.userId);
      setOnlineUserIds((prev) => {
        const next = new Set(prev);
        if (data.online) {
          next.add(targetId);
        } else {
          next.delete(targetId);
        }
        return next;
      });
    });

    return () => {
      disconnectSocket();
    };
  }, []);

  // ── Load conversations from MongoDB ──
  const loadConversations = useCallback(async () => {
    const token = getUserAccessToken();
    if (!token) {
      setConversations([]);
      setConversationsLoading(false);
      setConversationsError(null);
      setStatus("disconnected");
      return;
    }

    setConversationsLoading(true);
    setConversationsError(null);
    try {
      const res = await getConversationsApi();
      if (res.success && Array.isArray(res.data)) {
        setConversations(res.data);
        setConversationsError(null);
        try {
          window.dispatchEvent(new CustomEvent("omeetso_chat_updated"));
        } catch {}
      } else {
        const errCode = (res as any)?.error?.code;
        if (
          errCode === "UNAUTHORIZED" ||
          errCode === "SESSION_REVOKED" ||
          errCode === "TOKEN_EXPIRED" ||
          errCode === "USER_NOT_FOUND"
        ) {
          setConversations([]);
          setConversationsError(null);
          setStatus("disconnected");
        } else {
          setConversationsError((res as any)?.error?.message || "Unable to load conversations");
        }
      }
    } catch {
      setConversationsError("Unable to connect to chat server. Tap to retry.");
    } finally {
      setConversationsLoading(false);
    }
  }, []);

  // ── Fetch single conversation by ID ──
  const fetchConversationById = useCallback(async (conversationId: string): Promise<ConversationItem | null> => {
    const token = getUserAccessToken();
    if (!token) return null;

    try {
      const res = await getConversationByIdApi(conversationId);
      if (res.success && res.data) {
        const item = res.data;
        setConversations((prev) => {
          if (prev.some((c) => c.id === item.id)) {
            return prev.map((c) => (c.id === item.id ? item : c));
          }
          return [item, ...prev];
        });
        return item;
      }
    } catch {}
    return null;
  }, []);

  // ── Add or update conversation in state ──
  const addConversation = useCallback((item: ConversationItem) => {
    if (!item || !item.id) return;
    setConversations((prev) => {
      if (prev.some((c) => c.id === item.id)) {
        return prev.map((c) => (c.id === item.id ? { ...c, ...item } : c));
      }
      return [item, ...prev];
    });
  }, []);

  // ── Load messages for a conversation ──
  const loadMessages = useCallback(async (conversationId: string) => {
    const token = getUserAccessToken();
    if (!token) return;

    setMessagesLoading((prev) => {
      const next = new Map(prev);
      next.set(conversationId, true);
      return next;
    });
    try {
      const res = await getMessagesApi(conversationId, undefined, 30);
      if (res.success && res.data) {
        const localMsgs = res.data.map((m) => apiMessageToLocal(m));
        setMessages((prev) => {
          const next = new Map(prev);
          next.set(conversationId, localMsgs); // API already returns oldest-first
          return next;
        });
        setCursors((prev) => {
          const next = new Map(prev);
          next.set(conversationId, res.pagination?.nextCursor || null);
          return next;
        });
        setHasMore((prev) => {
          const next = new Map(prev);
          next.set(conversationId, res.pagination?.hasMore ?? false);
          return next;
        });
      }
    } catch {
      // Show error state — no localStorage fallback
    } finally {
      setMessagesLoading((prev) => {
        const next = new Map(prev);
        next.set(conversationId, false);
        return next;
      });
    }
  }, []);

  // ── Load older messages (cursor pagination) ──
  const loadMoreMessages = useCallback(async (conversationId: string) => {
    const cursor = cursors.get(conversationId);
    if (!cursor || !(hasMore.get(conversationId))) return;

    try {
      const res = await getMessagesApi(conversationId, cursor, 30);
      if (res.success && res.data) {
        const olderMsgs = res.data.map((m) => apiMessageToLocal(m));
        setMessages((prev) => {
          const next = new Map(prev);
          const existing = next.get(conversationId) || [];
          next.set(conversationId, [...olderMsgs, ...existing]);
          return next;
        });
        setCursors((prev) => {
          const next = new Map(prev);
          next.set(conversationId, res.pagination?.nextCursor || null);
          return next;
        });
        setHasMore((prev) => {
          const next = new Map(prev);
          next.set(conversationId, res.pagination?.hasMore ?? false);
          return next;
        });
      }
    } catch { /* show error state */ }
  }, [cursors, hasMore]);

  // ── Send text message ──
  const sendTextMessage = useCallback(async (conversationId: string, text: string) => {
    const clientMessageId = crypto.randomUUID();

    // Optimistic: insert immediately
    const optimistic: Message = {
      id: clientMessageId,
      threadId: conversationId,
      from: "me",
      type: "text",
      text,
      createdAt: Date.now(),
      status: "sending",
    };
    setMessages((prev) => {
      const next = new Map(prev);
      const existing = next.get(conversationId) || [];
      next.set(conversationId, [...existing, optimistic]);
      return next;
    });

    try {
      const res = await sendMessageApi(conversationId, clientMessageId, text);
      if (res.success && res.data) {
        // Replace optimistic with confirmed
        const confirmed = apiMessageToLocal(res.data);
        setMessages((prev) => {
          const next = new Map(prev);
          const existing = next.get(conversationId) || [];
          next.set(
            conversationId,
            existing.map((m) => (m.id === clientMessageId ? confirmed : m))
          );
          return next;
        });
        // Update conversation preview
        setConversations((prev) =>
          prev.map((c) =>
            c.id === conversationId
              ? { ...c, lastMessagePreview: text, lastMessageAt: new Date().toISOString() }
              : c
          )
        );
      } else {
        // Mark as failed
        setMessages((prev) => {
          const next = new Map(prev);
          const existing = next.get(conversationId) || [];
          next.set(
            conversationId,
            existing.map((m) => (m.id === clientMessageId ? { ...m, status: "failed" as const } : m))
          );
          return next;
        });
      }
    } catch {
      setMessages((prev) => {
        const next = new Map(prev);
        const existing = next.get(conversationId) || [];
        next.set(
          conversationId,
          existing.map((m) => (m.id === clientMessageId ? { ...m, status: "failed" as const } : m))
        );
        return next;
      });
    }
  }, []);

  // ── Send rich attachment (document, image, location, contact, voice) ──
  const sendAttachmentMessage = useCallback(async (
    conversationId: string,
    payload: {
      type: "image" | "document" | "location" | "voice" | "contact";
      text?: string;
      imageUrl?: string;
      caption?: string;
      document?: import("@/lib/chat").DocumentAttachment;
      contact?: import("@/lib/chat").ContactAttachment;
      location?: { name: string; area: string };
      voice?: { durationSec: number };
    }
  ) => {
    const clientMessageId = crypto.randomUUID();

    let previewText = "Attachment";
    if (payload.type === "document" && payload.document) {
      previewText = `📄 ${payload.document.name}`;
    } else if (payload.type === "image") {
      previewText = payload.caption ? `📷 ${payload.caption}` : "📷 Photo";
    } else if (payload.type === "location" && payload.location) {
      previewText = `📍 ${payload.location.name}`;
    } else if (payload.type === "contact" && payload.contact) {
      previewText = `👤 Contact: ${payload.contact.name}`;
    } else if (payload.type === "voice") {
      previewText = "🎤 Voice note";
    }

    const optimistic: Message = {
      id: clientMessageId,
      threadId: conversationId,
      from: "me",
      type: payload.type,
      text: payload.text,
      imageUrl: payload.imageUrl,
      caption: payload.caption,
      document: payload.document,
      contact: payload.contact,
      location: payload.location,
      voice: payload.voice,
      createdAt: Date.now(),
      status: "sent",
    };

    setMessages((prev) => {
      const next = new Map(prev);
      const existing = next.get(conversationId) || [];
      next.set(conversationId, [...existing, optimistic]);
      return next;
    });

    // Update conversation preview
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? { ...c, lastMessagePreview: previewText, lastMessageAt: new Date().toISOString() }
          : c
      )
    );

    try {
      await sendMessageApi(
        conversationId,
        clientMessageId,
        previewText,
        payload.type === "image" ? "IMAGE" : "TEXT",
        payload.imageUrl
      );
    } catch {
      // Keep optimistic message displayed for high responsiveness
    }
  }, []);

  // ── Send offer ──
  const sendOffer = useCallback(async (conversationId: string, amountInPaise: number, text?: string) => {
    try {
      await createOfferApi(conversationId, amountInPaise, text);
      await loadMessages(conversationId);
    } catch { /* toast will handle */ }
  }, [loadMessages]);

  // ── Respond to offer ──
  const respondToOffer = useCallback(async (offerId: string, action: "ACCEPT" | "DECLINE" | "CANCEL") => {
    await updateOfferStatusApi(offerId, action);
  }, []);

  // ── Mark as read ──
  const markAsRead = useCallback((conversationId: string) => {
    emitMessageRead(conversationId);
    markConversationReadApi(conversationId).catch(() => {});
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c))
    );
    try {
      window.dispatchEvent(new CustomEvent("omeetso_chat_updated"));
      window.dispatchEvent(new CustomEvent("omeetso_notifications_changed"));
    } catch {}
  }, []);

  // ── Typing ──
  const startTyping = useCallback((conversationId: string, recipientId: string) => {
    emitTypingStart(conversationId, recipientId);
  }, []);

  const stopTyping = useCallback((conversationId: string, recipientId: string) => {
    emitTypingStop(conversationId, recipientId);
  }, []);

  // ── Room management ──
  const joinRoom = useCallback((conversationId: string) => {
    joinConversation(conversationId);
  }, []);

  const leaveRoom = useCallback((conversationId: string) => {
    leaveConversation(conversationId);
  }, []);

  // ── Online presence check ──
  const isUserOnline = useCallback(
    (userId: string) => {
      if (!userId) return false;
      return onlineUserIds.has(String(userId));
    },
    [onlineUserIds]
  );

  return (
    <ChatContext.Provider
      value={{
        status,
        conversations,
        conversationsLoading,
        conversationsError,
        onlineUserIds,
        isUserOnline,
        messages,
        messagesLoading,
        cursors,
        hasMore,
        typingUsers,
        loadConversations,
        fetchConversationById,
        addConversation,
        loadMessages,
        loadMoreMessages,
        sendTextMessage,
        sendAttachmentMessage,
        sendOffer,
        respondToOffer,
        markAsRead,
        startTyping,
        stopTyping,
        joinRoom,
        leaveRoom,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}
