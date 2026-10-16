import { AdminAuthService } from "@/services/adminAuthService";
import { API_BASE as ROOT_API_BASE } from "@/config/api";

const API_BASE = `${ROOT_API_BASE}/support`;

function getHeaders(): Record<string, string> {
  const token = AdminAuthService.getAccessToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export interface AdminSupportTicketItem {
  id: string;
  ticketNumber: string;
  subject: string;
  category: string;
  subcategory?: string;
  description: string;
  priority: string;
  status: "open" | "in_progress" | "resolved" | "closed" | "waiting_on_user";
  contactMethod?: string;
  resolutionNotes?: string;
  updatedAt: string;
  createdAt: string;
  user?: {
    id: string;
    name?: string;
    email?: string;
    phone?: string;
  };
}

export async function getAdminSupportTicketsApi(params?: Record<string, any>): Promise<{
  success: boolean;
  data?: AdminSupportTicketItem[];
  pagination?: any;
  error?: string;
}> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);

  try {
    const query = new URLSearchParams(params || {}).toString();
    const url = query ? `${API_BASE}/admin/tickets?${query}` : `${API_BASE}/admin/tickets`;

    const res = await fetch(url, {
      headers: getHeaders(),
      credentials: "include",
      signal: controller.signal
    });
    clearTimeout(timer);

    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error?.message || "Failed to fetch support tickets" };
    }
    return { success: true, data: json.data, pagination: json.pagination };
  } catch (error) {
    clearTimeout(timer);
    return { success: false, error: "Network error: Unable to fetch support tickets" };
  }
}

export async function adminReplyTicketApi(
  ticketId: string,
  payload: { text: string; status?: string; resolutionNotes?: string }
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/admin/tickets/${ticketId}/reply`, {
      method: "POST",
      headers: getHeaders(),
      credentials: "include",
      body: JSON.stringify(payload)
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error?.message || "Failed to post support ticket reply" };
    }
    return { success: true, data: json.data };
  } catch (error) {
    return { success: false, error: "Network error: Unable to post support ticket reply" };
  }
}

export async function adminGetTicketMessagesApi(
  ticketId: string
): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/admin/tickets/${ticketId}/messages`, {
      headers: getHeaders(),
      credentials: "include"
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error?.message || "Failed to fetch ticket messages" };
    }
    return { success: true, data: json.data };
  } catch (error) {
    return { success: false, error: "Network error: Unable to fetch ticket messages" };
  }
}
