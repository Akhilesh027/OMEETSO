import { getUserAccessToken } from "./auth.api";

const API_BASE = "http://localhost:3000/api/v1/notifications";

function getAuthHeaders(): Record<string, string> {
  const token = getUserAccessToken() || "";
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export async function getNotificationsApi(page = 1, limit = 20): Promise<{
  success: boolean;
  data?: NotificationItem[];
  unreadCount?: number;
  error?: string;
}> {
  try {
    const res = await fetch(`${API_BASE}?page=${page}&limit=${limit}`, {
      headers: getAuthHeaders(),
    });
    const json = await res.json();
    return json;
  } catch {
    return { success: false, error: "Network error loading notifications" };
  }
}

export async function markNotificationReadApi(notificationId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const res = await fetch(`${API_BASE}/${notificationId}/read`, {
      method: "PATCH",
      headers: getAuthHeaders(),
    });
    return res.json();
  } catch {
    return { success: false, error: "Network error" };
  }
}

export async function markAllNotificationsReadApi(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const res = await fetch(`${API_BASE}/read-all`, {
      method: "PATCH",
      headers: getAuthHeaders(),
    });
    return res.json();
  } catch {
    return { success: false, error: "Network error" };
  }
}
