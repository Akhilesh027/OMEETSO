import { getUserAccessToken } from "./auth.api";
import { API_BASE as ROOT_API } from "@/config/api";

const API_BASE = `${ROOT_API}/support`;

function getAuthHeaders(): Record<string, string> {
  const token = getUserAccessToken() || (typeof localStorage !== "undefined" ? localStorage.getItem("omeetso_user_token") : "") || "";
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export interface SupportTicketPayload {
  subject: string;
  category: string;
  subcategory?: string;
  description: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  contactMethod?: "in_app" | "email" | "call";
  relatedListing?: string;
  relatedStore?: string;
  relatedCampaign?: string;
  relatedPayment?: string;
  attachments?: string[];
}

export interface SupportTicketItem {
  id: string;
  ticketNumber: string;
  subject: string;
  category: string;
  subcategory?: string;
  description: string;
  priority: string;
  status: "OPEN" | "IN_PROGRESS" | "WAITING_USER" | "RESOLVED" | "CLOSED" | "REOPENED";
  contactMethod?: string;
  relatedListing?: string;
  relatedStore?: string;
  relatedCampaign?: string;
  relatedPayment?: string;
  resolutionNotes?: string;
  assignedAdminName?: string;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
  messages?: SupportMessageItem[];
}

export interface SupportMessageItem {
  id: string;
  senderType: "user" | "admin";
  senderName: string;
  text: string;
  attachments?: string[];
  createdAt: string;
}

export async function createSupportTicketApi(
  payload: SupportTicketPayload
): Promise<{ success: boolean; data?: SupportTicketItem; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/tickets`, {
      method: "POST",
      headers: getAuthHeaders(),
      credentials: "include",
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error?.message || "Failed to create support ticket" };
    }
    return { success: true, data: json.data };
  } catch (error: any) {
    return { success: false, error: error?.message || "Network error connecting to support service" };
  }
}

export async function getMySupportTicketsApi(): Promise<{
  success: boolean;
  data?: SupportTicketItem[];
  error?: string;
}> {
  try {
    const res = await fetch(`${API_BASE}/tickets`, {
      method: "GET",
      headers: getAuthHeaders(),
      credentials: "include",
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error?.message || "Failed to fetch support tickets" };
    }
    return { success: true, data: json.data || [] };
  } catch (error: any) {
    return { success: false, error: error?.message || "Network error loading tickets" };
  }
}

export async function getSupportTicketByIdApi(
  ticketId: string
): Promise<{ success: boolean; data?: SupportTicketItem; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/tickets/${ticketId}`, {
      method: "GET",
      headers: getAuthHeaders(),
      credentials: "include",
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error?.message || "Ticket not found" };
    }
    return { success: true, data: json.data };
  } catch (error: any) {
    return { success: false, error: error?.message || "Network error loading ticket details" };
  }
}

export async function getSupportTicketMessagesApi(
  ticketId: string
): Promise<{ success: boolean; data?: SupportMessageItem[]; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/tickets/${ticketId}/messages`, {
      method: "GET",
      headers: getAuthHeaders(),
      credentials: "include",
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error?.message || "Failed to load messages" };
    }
    return { success: true, data: json.data || [] };
  } catch (error: any) {
    return { success: false, error: error?.message || "Network error loading messages" };
  }
}

export async function sendSupportTicketMessageApi(
  ticketId: string,
  payload: { text: string; attachments?: string[] }
): Promise<{ success: boolean; data?: SupportMessageItem; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/tickets/${ticketId}/messages`, {
      method: "POST",
      headers: getAuthHeaders(),
      credentials: "include",
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error?.message || "Failed to send message" };
    }
    return { success: true, data: json.data };
  } catch (error: any) {
    return { success: false, error: error?.message || "Network error sending message" };
  }
}

export async function updateSupportTicketStatusApi(
  ticketId: string,
  payload: { status: string; resolutionNotes?: string }
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/tickets/${ticketId}/status`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      credentials: "include",
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error?.message || "Failed to update status" };
    }
    return { success: true, data: json.data };
  } catch (error: any) {
    return { success: false, error: error?.message || "Network error updating ticket status" };
  }
}
