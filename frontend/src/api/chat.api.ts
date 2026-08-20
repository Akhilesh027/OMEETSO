import { getUserAccessToken } from "./auth.api";

const API_BASE = "http://localhost:3000/api/v1/chat";

function getAuthHeaders(): Record<string, string> {
  const token = getUserAccessToken() || "";
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

// ─── Conversations ───────────────────────────────────────

export interface ConversationItem {
  id: string;
  contextType: "LISTING" | "STORE";
  contextId: string;
  listingId?: string;
  listingTitle: string;
  listingPriceInPaise: number;
  listingImage: string;
  otherParty: { id: string; name: string; avatar?: string };
  lastMessagePreview: string;
  lastMessageType: string;
  lastMessageAt: string;
  unreadCount: number;
}

export async function startConversationApi(
  contextType: "LISTING" | "STORE",
  contextId: string
): Promise<{ success: boolean; data?: any; error?: any }> {
  const res = await fetch(`${API_BASE}/conversations`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ contextType, contextId }),
  });
  return res.json();
}

export async function getConversationsApi(): Promise<{
  success: boolean;
  data?: ConversationItem[];
}> {
  const res = await fetch(`${API_BASE}/conversations`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

// ─── Messages ────────────────────────────────────────────

export interface MessageItem {
  id: string;
  clientMessageId: string;
  conversationId: string;
  senderId: string;
  type: "TEXT" | "IMAGE" | "OFFER" | "SYSTEM";
  text?: string;
  imageUrl?: string;
  offer?: {
    id: string;
    amountInPaise: number;
    originalPriceInPaise: number;
    status: string;
    createdByUserId: string;
    expiresAt: string;
  };
  status: "SENT" | "DELIVERED" | "READ" | "FAILED";
  sentAt: string;
  createdAt: string;
}

export async function getMessagesApi(
  conversationId: string,
  before?: string,
  limit = 30
): Promise<{
  success: boolean;
  data?: MessageItem[];
  pagination?: { nextCursor: string | null; hasMore: boolean };
}> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (before) params.set("before", before);

  const res = await fetch(
    `${API_BASE}/conversations/${conversationId}/messages?${params}`,
    { headers: getAuthHeaders() }
  );
  return res.json();
}

export async function sendMessageApi(
  conversationId: string,
  clientMessageId: string,
  text: string,
  type: "TEXT" | "IMAGE" = "TEXT",
  imageUrl?: string
): Promise<{ success: boolean; data?: MessageItem }> {
  const res = await fetch(
    `${API_BASE}/conversations/${conversationId}/messages`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ clientMessageId, type, text, imageUrl }),
    }
  );
  return res.json();
}

// ─── Offers ──────────────────────────────────────────────

export async function createOfferApi(
  conversationId: string,
  amountInPaise: number,
  messageText?: string
): Promise<{ success: boolean; data?: any }> {
  const res = await fetch(
    `${API_BASE}/conversations/${conversationId}/offers`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ amountInPaise, messageText }),
    }
  );
  return res.json();
}

export async function getOfferByIdApi(offerId: string): Promise<{ success: boolean; data?: any; error?: any }> {
  const res = await fetch(`${API_BASE}/offers/${offerId}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function updateOfferStatusApi(
  offerId: string,
  action: "ACCEPT" | "DECLINE" | "CANCEL"
): Promise<{ success: boolean; data?: any }> {
  const res = await fetch(`${API_BASE}/offers/${offerId}/status`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ action }),
  });
  return res.json();
}
