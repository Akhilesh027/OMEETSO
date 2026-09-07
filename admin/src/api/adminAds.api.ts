import { AdminAuthService } from "@/services/adminAuthService";
import { API_BASE as ROOT_API_BASE } from "@/config/api";

const API_BASE = `${ROOT_API_BASE}/admin/ad-campaigns`;
const PLACEMENTS_API = `${ROOT_API_BASE}/admin/ad-placements`;
const PUBLIC_PLACEMENTS_API = `${ROOT_API_BASE}/ad-placements`;
const PRODUCTS_API = `${ROOT_API_BASE}/admin/ad-products`;

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
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3500);

  try {
    const query = new URLSearchParams(params || {}).toString();
    const url = query ? `${API_BASE}?${query}` : API_BASE;

    const res = await fetch(url, {
      headers: getHeaders(),
      credentials: "include",
      signal: controller.signal
    });
    clearTimeout(timer);

    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error?.message || "Failed to fetch ad campaigns" };
    }
    return { success: true, data: json.data };
  } catch (error) {
    clearTimeout(timer);
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
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3500);

  try {
    const res = await fetch(PUBLIC_PLACEMENTS_API, {
      headers: getHeaders(),
      credentials: "include",
      signal: controller.signal
    });
    clearTimeout(timer);
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error?.message || "Failed to fetch ad placements" };
    }
    return { success: true, data: json.data };
  } catch (error) {
    clearTimeout(timer);
    return { success: false, error: "Network error: Unable to fetch ad placements" };
  }
}

export async function createAdminAdPlacementApi(placementData: Record<string, any>): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    const res = await fetch(PLACEMENTS_API, {
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

export async function updateAdminAdPlacementApi(
  placementId: string,
  placementData: Record<string, any>
): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    const res = await fetch(`${PLACEMENTS_API}/${placementId}`, {
      method: "PUT",
      headers: getHeaders(),
      credentials: "include",
      body: JSON.stringify(placementData)
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error?.message || "Failed to update ad placement" };
    }
    return { success: true, data: json.data };
  } catch (error) {
    return { success: false, error: "Network error: Unable to update ad placement" };
  }
}

export async function deleteAdminAdPlacementApi(placementId: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const res = await fetch(`${PLACEMENTS_API}/${placementId}`, {
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
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3500);

  try {
    const res = await fetch(PRODUCTS_API, {
      headers: getHeaders(),
      credentials: "include",
      signal: controller.signal
    });
    clearTimeout(timer);
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error?.message || "Failed to fetch ad products" };
    }
    return { success: true, data: json.data };
  } catch (error) {
    clearTimeout(timer);
    return { success: false, error: "Network error: Unable to fetch ad products" };
  }
}

export async function createAdminAdProductApi(productData: Record<string, any>): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    const res = await fetch(PRODUCTS_API, {
      method: "POST",
      headers: getHeaders(),
      credentials: "include",
      body: JSON.stringify(productData)
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error?.message || "Failed to create pricing plan" };
    }
    return { success: true, data: json.data };
  } catch (error) {
    return { success: false, error: "Network error: Unable to create pricing plan" };
  }
}

export async function updateAdminAdProductApi(
  productId: string,
  productData: Record<string, any>
): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    const res = await fetch(`${PRODUCTS_API}/${productId}`, {
      method: "PUT",
      headers: getHeaders(),
      credentials: "include",
      body: JSON.stringify(productData)
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error?.message || "Failed to update pricing plan" };
    }
    return { success: true, data: json.data };
  } catch (error) {
    return { success: false, error: "Network error: Unable to update pricing plan" };
  }
}

export async function deleteAdminAdProductApi(productId: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const res = await fetch(`${PRODUCTS_API}/${productId}`, {
      method: "DELETE",
      headers: getHeaders(),
      credentials: "include"
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error?.message || "Failed to delete pricing plan" };
    }
    return { success: true, message: json.message };
  } catch (error) {
    return { success: false, error: "Network error: Unable to delete pricing plan" };
  }
}

export async function toggleAdminAdProductStatusApi(productId: string): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    const res = await fetch(`${PRODUCTS_API}/${productId}/toggle-status`, {
      method: "PATCH",
      headers: getHeaders(),
      credentials: "include"
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error?.message || "Failed to toggle pricing plan status" };
    }
    return { success: true, data: json.data };
  } catch (error) {
    return { success: false, error: "Network error: Unable to toggle pricing plan status" };
  }
}

