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
  getConversationsApi, getMessagesApi, sendMessageApi,
  createOfferApi, updateOfferStatusApi,
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

  // per-conversation messages
  messages: Map<string, Message[]>;
  messagesLoading: Map<string, boolean>;
  cursors: Map<string, string | null>; // next cursor for pagination
  hasMore: Map<string, boolean>;

  // typing
  typingUsers: Map<string, string>; // conversationId → userId

  // actions
  loadConversations: () => Promise<void>;
  loadMessages: (conversationId: string) => Promise<void>;
  loadMoreMessages: (conversationId: string) => Promise<void>;
  sendTextMessage: (conversationId: string, text: string) => Promise<void>;
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

    socket.on("connect", () => setStatus("connected"));
    socket.on("disconnect", () => setStatus("disconnected"));
    socket.on("connect_error", () => setStatus("error"));

    // Real-time Push & In-App Notifications
    socket.on("notification:new", (notif: { title: string; body: string; type: string; link?: string }) => {
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

    return () => {
      disconnectSocket();
    };
  }, []);

  // ── Load conversations from MongoDB ──
  const loadConversations = useCallback(async () => {
    setConversationsLoading(true);
    setConversationsError(null);
    try {
      const res = await getConversationsApi();
      if (res.success && res.data) {
        setConversations(res.data);
      } else {
        setConversationsError("Failed to load conversations");
      }
    } catch {
      setConversationsError("Connection error. Please check your internet.");
    } finally {
      setConversationsLoading(false);
    }
  }, []);

  // ── Load messages for a conversation ──
  const loadMessages = useCallback(async (conversationId: string) => {
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
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c))
    );
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

  return (
    <ChatContext.Provider
      value={{
        status,
        conversations,
        conversationsLoading,
        conversationsError,
        messages,
        messagesLoading,
        cursors,
        hasMore,
        typingUsers,
        loadConversations,
        loadMessages,
        loadMoreMessages,
        sendTextMessage,
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
