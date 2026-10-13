import { AdminAuthService } from "@/services/adminAuthService";
import { API_BASE as ROOT_API_BASE } from "@/config/api";

const API_BASE = `${ROOT_API_BASE}/admin/notifications/broadcasts`;

function getHeaders(): Record<string, string> {
  const token = AdminAuthService.getAccessToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export interface NotificationBroadcast {
  id: string;
  title: string;
  message: string;
  targetAudience: string;
  sentAt: string;
  recipientsCount: number;
  status: "sent" | "scheduled" | "draft";
}

export async function getAdminBroadcastsApi(): Promise<{
  success: boolean;
  data?: NotificationBroadcast[];
  error?: string;
}> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);

  try {
    const res = await fetch(API_BASE, {
      headers: getHeaders(),
      credentials: "include",
      signal: controller.signal
    });
    clearTimeout(timer);

    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error?.message || "Failed to fetch broadcasts" };
    }
    return { success: true, data: json.data };
  } catch {
    clearTimeout(timer);
    return { success: false, error: "Network error: Unable to load broadcasts" };
  }
}

export async function createAdminBroadcastApi(payload: {
  title: string;
  message: string;
  targetAudience: string;
  status?: string;
}): Promise<{
  success: boolean;
  data?: NotificationBroadcast;
  error?: string;
}> {
  try {
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: getHeaders(),
      credentials: "include",
      body: JSON.stringify(payload)
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error?.message || "Failed to send broadcast" };
    }
    return { success: true, data: json.data };
  } catch {
    return { success: false, error: "Network error: Unable to trigger broadcast" };
  }
}

export async function deleteAdminBroadcastApi(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
      credentials: "include"
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error?.message || "Failed to delete broadcast" };
    }
    return { success: true };
  } catch {
    return { success: false, error: "Network error: Unable to delete broadcast" };
  }
}
