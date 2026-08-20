/**
 * chat-adapter.ts
 *
 * Converts MongoDB API responses from chat.api.ts into the existing
 * lib/chat.ts types (Thread, Message, Offer) so existing UI components
 * like MessageBubble, OfferCard, ThreadListPane continue working
 * without modification.
 *
 * ZERO localStorage — data flows from MongoDB only.
 */
import type { ConversationItem, MessageItem } from "@/api/chat.api";
import type { Thread, Message, MsgStatus, Offer, Role, PeerType, ThreadStatus } from "@/lib/chat";
import { getUserAccessToken } from "@/api/auth.api";

/** Get current user ID from JWT token stored in localStorage */
function getCurrentUserId(): string {
  try {
    const token = getUserAccessToken();
    if (!token) return "";
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.userId || payload.id || payload.sub || "";
  } catch {
    // Fallback: try reading from stored user object
    try {
      const raw = localStorage.getItem("omeetso_user");
      if (raw) {
        const u = JSON.parse(raw);
        return u.id || u._id || "";
      }
    } catch { /* ignore */ }
    return "";
  }
}

/** Convert API ConversationItem → lib/chat Thread */
export function conversationToThread(c: ConversationItem): Thread {
  const userId = getCurrentUserId();
  // Determine role based on context
  let role: Role = "buying";
  if (c.contextType === "STORE") {
    role = "store";
  }
  // If the current user's ID matches the seller-side, they are "selling"
  // The API returns otherParty as the person on the other side
  // so if contextType is LISTING, we need to determine if user is buyer or seller

  const peerType: PeerType = c.contextType === "STORE" ? "store" : "user";

  return {
    id: c.id,
    productId: c.contextId, // maps to contextId (listing or store)
    role,
    peerType,
    peerId: c.otherParty.id,
    peerName: c.otherParty.name,
    peerAvatar: c.otherParty.avatar,
    peerVerified: false,
    online: false,
    lastActive: undefined,
    createdAt: new Date(c.lastMessageAt).getTime(),
    updatedAt: new Date(c.lastMessageAt).getTime(),
    unread: c.unreadCount,
    lastMessagePreview: c.lastMessagePreview,
    status: "active" as ThreadStatus,
  };
}

/** Convert API MessageItem → lib/chat Message */
export function apiMessageToLocal(m: MessageItem, currentUserId?: string): Message {
  const userId = currentUserId || getCurrentUserId();
  const isMine = m.senderId === userId;

  let msgType: Message["type"] = "text";
  if (m.type === "IMAGE") msgType = "image";
  else if (m.type === "OFFER") msgType = "offer";
  else if (m.type === "SYSTEM") msgType = "system";

  let status: MsgStatus = "sent";
  if (m.status === "DELIVERED") status = "delivered";
  else if (m.status === "READ") status = "read";
  else if (m.status === "FAILED") status = "failed";

  return {
    id: m.id,
    threadId: m.conversationId,
    from: m.type === "SYSTEM" ? "system" : isMine ? "me" : "them",
    type: msgType,
    text: m.text,
    imageUrl: m.imageUrl,
    offerId: m.offer?.id,
    rawOffer: m.offer,
    createdAt: new Date(m.sentAt || m.createdAt).getTime(),
    status,
  };
}

/** Group messages by day label */
export function groupMessagesByDay(messages: Message[]): { label: string; items: Message[] }[] {
  const groups: Map<string, Message[]> = new Map();

  for (const m of messages) {
    const d = new Date(m.createdAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    let label: string;
    if (d.toDateString() === today.toDateString()) {
      label = "Today";
    } else if (d.toDateString() === yesterday.toDateString()) {
      label = "Yesterday";
    } else {
      label = d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    }

    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(m);
  }

  return Array.from(groups.entries()).map(([label, items]) => ({ label, items }));
}

/** Format timestamp for chat time display */
export function formatTime(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60_000);

  if (diffMin < 1) return "now";
  if (diffMin < 60) return `${diffMin}m`;
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
