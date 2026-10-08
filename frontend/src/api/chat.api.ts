import { getUserAccessToken, refreshUserSession } from "./auth.api";
import { API_BASE as ROOT_API } from "@/config/api";

const API_BASE = `${ROOT_API}/chat`;

async function fetchWithChatAuth(endpoint: string, options: RequestInit = {}): Promise<any> {
  const token = getUserAccessToken() || (typeof localStorage !== "undefined" ? localStorage.getItem("omeetso_user_token") || localStorage.getItem("omeetso_auth_token") : "") || "";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  let res = await fetch(endpoint, {
    ...options,
    headers,
    credentials: "include",
  });

  let json: any = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }

  // If token expired (401 or TOKEN_EXPIRED code), attempt session refresh and retry once
  if (
    res.status === 401 ||
    (json && json.error?.code === "TOKEN_EXPIRED") ||
    (json && json.error?.message?.toLowerCase().includes("token expired"))
  ) {
    const refreshRes = await refreshUserSession();
    if (refreshRes.success && refreshRes.data?.accessToken) {
      const newHeaders: Record<string, string> = {
        ...headers,
        Authorization: `Bearer ${refreshRes.data.accessToken}`,
      };
      const retryRes = await fetch(endpoint, {
        ...options,
        headers: newHeaders,
        credentials: "include",
      });
      try {
        return await retryRes.json();
      } catch {
        return { success: false, error: { message: "Invalid server response" } };
      }
    }
  }

  return json || { success: res.ok };
}

// ─── Conversations ───────────────────────────────────────

export interface ConversationItem {
  id: string;
  contextType: "LISTING" | "STORE" | "JOB" | "SERVICE";
  contextId: string;
  listingId?: string;
  listingTitle: string;
  listingPriceInPaise: number;
  salaryText?: string;
  servicePriceText?: string;
  listingImage: string;
  otherParty: { id: string; name: string; avatar?: string };
  lastMessagePreview: string;
  lastMessageType: string;
  lastMessageAt: string;
  unreadCount: number;
}

export async function startConversationApi(
  contextType: "LISTING" | "STORE" | "JOB" | "SERVICE",
  contextId: string,
  recipientId?: string,
  metadata?: { title?: string; image?: string; priceInPaise?: number }
): Promise<{ success: boolean; data?: any; error?: any }> {
  return fetchWithChatAuth(`${API_BASE}/conversations`, {
    method: "POST",
    body: JSON.stringify({
      contextType,
      contextId,
      recipientId,
      title: metadata?.title,
      image: metadata?.image,
      priceInPaise: metadata?.priceInPaise,
      metadata,
    }),
  });
}

export async function getConversationsApi(): Promise<{
  success: boolean;
  data?: ConversationItem[];
  error?: any;
}> {
  return fetchWithChatAuth(`${API_BASE}/conversations`);
}

export async function getConversationByIdApi(conversationId: string): Promise<{
  success: boolean;
  data?: ConversationItem;
  error?: any;
}> {
  return fetchWithChatAuth(`${API_BASE}/conversations/${conversationId}`);
}

export async function markConversationReadApi(conversationId: string): Promise<{
  success: boolean;
  data?: any;
  error?: any;
}> {
  return fetchWithChatAuth(`${API_BASE}/conversations/${conversationId}/read`, {
    method: "POST",
  });
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

  return fetchWithChatAuth(`${API_BASE}/conversations/${conversationId}/messages?${params}`);
}

export async function sendMessageApi(
  conversationId: string,
  clientMessageId: string,
  text: string,
  type: "TEXT" | "IMAGE" = "TEXT",
  imageUrl?: string
): Promise<{ success: boolean; data?: MessageItem }> {
  return fetchWithChatAuth(`${API_BASE}/conversations/${conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify({ clientMessageId, type, text, imageUrl }),
  });
}

// ─── Offers ──────────────────────────────────────────────

export async function createOfferApi(
  conversationId: string,
  amountInPaise: number,
  messageText?: string
): Promise<{ success: boolean; data?: any; error?: any }> {
  return fetchWithChatAuth(`${API_BASE}/conversations/${conversationId}/offers`, {
    method: "POST",
    body: JSON.stringify({ amountInPaise, messageText }),
  });
}

export async function getOfferByIdApi(offerId: string): Promise<{ success: boolean; data?: any; error?: any }> {
  return fetchWithChatAuth(`${API_BASE}/offers/${offerId}`);
}

export async function updateOfferStatusApi(
  offerId: string,
  action: "ACCEPT" | "DECLINE" | "CANCEL"
): Promise<{ success: boolean; data?: any; error?: any }> {
  return fetchWithChatAuth(`${API_BASE}/offers/${offerId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ action }),
  });
}
