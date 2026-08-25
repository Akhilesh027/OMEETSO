import { AdminAuthService } from "@/services/adminAuthService";

const API_BASE = "https://api.omeetso.in/api/v1/admin/listings";

function getHeaders(): Record<string, string> {
  const token = AdminAuthService.getAccessToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export async function getAdminListingsQueueApi(params?: Record<string, any>): Promise<{ success: boolean; data?: any[]; pagination?: any; error?: string }> {
  try {
    const query = new URLSearchParams(params || {}).toString();
    const url = query ? `${API_BASE}?${query}` : API_BASE;

    const res = await fetch(url, {
      headers: getHeaders(),
      credentials: "include"
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error?.message || "Failed to fetch admin moderation queue" };
    }
    return { success: true, data: json.data, pagination: json.pagination };
  } catch (error) {
    return { success: false, error: "Network error: Unable to fetch moderation queue" };
  }
}

export async function approveListingApi(listingId: string, reason?: string): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/${listingId}/approve`, {
      method: "PATCH",
      headers: getHeaders(),
      credentials: "include",
      body: JSON.stringify({ reason: reason || "Approved by moderator" })
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error?.message || "Failed to approve listing" };
    }
    return { success: true, data: json.data };
  } catch (error) {
    return { success: false, error: "Network error: Unable to approve listing" };
  }
}

export async function rejectListingApi(listingId: string, reason: string): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/${listingId}/reject`, {
      method: "PATCH",
      headers: getHeaders(),
      credentials: "include",
      body: JSON.stringify({ reason })
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error?.message || "Failed to reject listing" };
    }
    return { success: true, data: json.data };
  } catch (error) {
    return { success: false, error: "Network error: Unable to reject listing" };
  }
}
