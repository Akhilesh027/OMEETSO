import { getUserAccessToken } from "./auth.api";

const API_BASE = "http://localhost:3000/api/v1/listings";

export async function createListingApi(payload: Record<string, any>): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const token = getUserAccessToken();
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      credentials: "include",
      body: JSON.stringify(payload)
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error?.message || "Failed to create listing" };
    }
    return { success: true, data: json.data };
  } catch (error) {
    return { success: false, error: "Network error: Unable to connect to backend" };
  }
}

export async function getPublicListingsApi(params?: Record<string, any>): Promise<{ success: boolean; data?: any[]; pagination?: any; error?: string }> {
  try {
    const query = new URLSearchParams(params || {}).toString();
    const url = query ? `${API_BASE}?${query}` : API_BASE;
    const res = await fetch(url);
    const json = await res.json();

    if (!res.ok || !json.success) {
      return { success: false, error: json.error?.message || "Failed to fetch listings" };
    }
    return { success: true, data: json.data, pagination: json.pagination };
  } catch (error) {
    return { success: false, error: "Network error: Unable to fetch listings" };
  }
}

export async function getListingByIdApi(id: string): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/${id}`);
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error?.message || "Listing not found" };
    }
    return { success: true, data: json.data };
  } catch (error) {
    return { success: false, error: "Network error: Unable to fetch listing detail" };
  }
}

export async function getMyListingsApi(): Promise<{ success: boolean; data?: any[]; pagination?: any; error?: string }> {
  try {
    const token = getUserAccessToken();
    const res = await fetch(`${API_BASE}/user/me`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      credentials: "include"
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error?.message || "Failed to fetch your listings" };
    }
    return { success: true, data: json.data, pagination: json.pagination };
  } catch (error) {
    return { success: false, error: "Network error" };
  }
}
