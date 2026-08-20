import { AdminAuthService } from "@/services/adminAuthService";

const API_BASE = "https://api.omeetso.in/api/v1/admin/ad-campaigns";

function getHeaders(): Record<string, string> {
  const token = AdminAuthService.getAccessToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export async function getAdminAdCampaignsApi(params?: Record<string, any>): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  try {
    const query = new URLSearchParams(params || {}).toString();
    const url = query ? `${API_BASE}?${query}` : API_BASE;

    const res = await fetch(url, {
      headers: getHeaders(),
      credentials: "include"
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error?.message || "Failed to fetch ad campaigns" };
    }
    return { success: true, data: json.data };
  } catch (error) {
    return { success: false, error: "Network error: Unable to fetch ad campaigns" };
  }
}

export async function approveAdminAdCampaignApi(campaignId: string): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    const res = await fetch(`${API_BASE}/${campaignId}/approve`, {
      method: "PATCH",
      headers: getHeaders(),
      credentials: "include"
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error?.message || "Failed to approve ad campaign" };
    }
    return { success: true, data: json.data };
  } catch (error) {
    return { success: false, error: "Network error: Unable to approve ad campaign" };
  }
}

export async function rejectAdminAdCampaignApi(
  campaignId: string,
  rejectionReason: string
): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    const res = await fetch(`${API_BASE}/${campaignId}/reject`, {
      method: "PATCH",
      headers: getHeaders(),
      credentials: "include",
      body: JSON.stringify({ rejectionReason })
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error?.message || "Failed to reject ad campaign" };
    }
    return { success: true, data: json.data };
  } catch (error) {
    return { success: false, error: "Network error: Unable to reject ad campaign" };
  }
}

export async function getAdminAdPlacementsApi(): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  try {
    const res = await fetch("https://api.omeetso.in/api/v1/ad-placements", {
      headers: getHeaders(),
      credentials: "include"
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error?.message || "Failed to fetch ad placements" };
    }
    return { success: true, data: json.data };
  } catch (error) {
    return { success: false, error: "Network error: Unable to fetch ad placements" };
  }
}

export async function createAdminAdPlacementApi(placementData: Record<string, any>): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    const res = await fetch("https://api.omeetso.in/api/v1/admin/ad-placements", {
      method: "POST",
      headers: getHeaders(),
      credentials: "include",
      body: JSON.stringify(placementData)
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error?.message || "Failed to create ad placement" };
    }
    return { success: true, data: json.data };
  } catch (error) {
    return { success: false, error: "Network error: Unable to create ad placement" };
  }
}

export async function deleteAdminAdPlacementApi(placementId: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const res = await fetch(`https://api.omeetso.in/api/v1/admin/ad-placements/${placementId}`, {
      method: "DELETE",
      headers: getHeaders(),
      credentials: "include"
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error?.message || "Failed to delete ad placement" };
    }
    return { success: true, message: json.message };
  } catch (error) {
    return { success: false, error: "Network error: Unable to delete ad placement" };
  }
}

export async function getAdminAdProductsApi(): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  try {
    const res = await fetch("https://api.omeetso.in/api/v1/ad-products", {
      headers: getHeaders(),
      credentials: "include"
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error?.message || "Failed to fetch ad products" };
    }
    return { success: true, data: json.data };
  } catch (error) {
    return { success: false, error: "Network error: Unable to fetch ad products" };
  }
}
