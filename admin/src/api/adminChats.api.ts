import { AdminAuthService } from "@/services/adminAuthService";
import { API_BASE as ROOT_API_BASE } from "@/config/api";

const API_BASE = `${ROOT_API_BASE}/admin/chats`;

function getHeaders(): Record<string, string> {
  const token = AdminAuthService.getAccessToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export async function getAdminConversationsApi(params?: Record<string, any>): Promise<{
  success: boolean;
  data?: any[];
  pagination?: any;
  error?: string;
}> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3500);

  try {
    const query = new URLSearchParams(params || {}).toString();
    const url = query ? `${API_BASE}/conversations?${query}` : `${API_BASE}/conversations`;

    const res = await fetch(url, {
      headers: getHeaders(),
      credentials: "include",
      signal: controller.signal
    });
    clearTimeout(timer);

    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error?.message || "Failed to fetch platform conversations" };
    }
    return { success: true, data: json.data, pagination: json.pagination };
  } catch (error) {
    clearTimeout(timer);
    return { success: false, error: "Network error: Unable to fetch conversations" };
  }
}

export async function getAdminConversationMessagesApi(conversationId: string): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3500);

  try {
    const res = await fetch(`${API_BASE}/conversations/${conversationId}/messages`, {
      headers: getHeaders(),
      credentials: "include",
      signal: controller.signal
    });
    clearTimeout(timer);

    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error?.message || "Failed to fetch transcript" };
    }
    return { success: true, data: json.data };
  } catch (error) {
    clearTimeout(timer);
    return { success: false, error: "Network error: Unable to fetch message transcript" };
  }
}

export async function flagAdminConversationApi(
  conversationId: string,
  isFlagged: boolean,
  flagReason?: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/conversations/${conversationId}/flag`, {
      method: "PATCH",
      headers: getHeaders(),
      credentials: "include",
      body: JSON.stringify({ isFlagged, flagReason })
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error?.message || "Failed to update flag status" };
    }
    return { success: true, data: json.data };
  } catch (error) {
    return { success: false, error: "Network error: Unable to update flag status" };
  }
}

export async function sendAdminWarningMessageApi(
  conversationId: string,
  warningText: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/conversations/${conversationId}/warning`, {
      method: "POST",
      headers: getHeaders(),
      credentials: "include",
      body: JSON.stringify({ warningText })
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error?.message || "Failed to send warning message" };
    }
    return { success: true, data: json.data };
  } catch (error) {
    return { success: false, error: "Network error: Unable to send warning message" };
  }
}
