import { AdminAuthService } from "@/services/adminAuthService";
import { API_BASE as ROOT_API_BASE } from "@/config/api";

const API_BASE = `${ROOT_API_BASE}/admin/services`;
const PUBLIC_API_BASE = `${ROOT_API_BASE}/services`;

function getHeaders(): Record<string, string> {
  const token = AdminAuthService.getAccessToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function getAdminServicesQueueApi(params?: Record<string, any>): Promise<{ success: boolean; data?: any[]; pagination?: any; error?: string }> {
  const query = new URLSearchParams(params || {}).toString();
  const url = query ? `${API_BASE}?${query}` : API_BASE;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);

  try {
    const res = await fetch(url, {
      headers: getHeaders(),
      credentials: "include",
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        return { success: true, data: json.data, pagination: json.pagination };
      }
    }
  } catch {
    clearTimeout(timer);
  }

  // Fallback to public endpoint quickly if admin endpoint isn't mounted
  try {
    const pubUrl = query ? `${PUBLIC_API_BASE}?${query}` : PUBLIC_API_BASE;
    const res = await fetch(pubUrl, { headers: getHeaders(), credentials: "include" });
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        return { success: true, data: json.data, pagination: json.pagination };
      }
    }
  } catch {}

  return { success: false, error: "Unable to reach services API" };
}

export async function updateServiceStatusApi(
  serviceId: string,
  payload: { status: string; rejectionReason?: string; isFeatured?: boolean }
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/${serviceId}/status`, {
      method: "PATCH",
      headers: getHeaders(),
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error?.message || "Failed to update service status" };
    }
    return { success: true, data: json.data };
  } catch (error) {
    return { success: false, error: "Network error: Unable to update service status" };
  }
}

export async function getAdminServiceCategoriesApi(): Promise<{ success: boolean; data?: any[]; error?: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3500);

  try {
    const res = await fetch(`${API_BASE}/categories`, {
      headers: getHeaders(),
      credentials: "include",
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        return json;
      }
    }
  } catch {
    clearTimeout(timer);
  }

  return { success: false, error: "Failed to load service categories" };
}

export async function upsertAdminServiceCategoryApi(categoryData: any): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/categories`, {
      method: "POST",
      headers: getHeaders(),
      credentials: "include",
      body: JSON.stringify(categoryData),
    });
    const json = await res.json();
    return json;
  } catch {
    return { success: false, error: "Failed to save service category" };
  }
}

export async function seedServicesApi(): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const res = await fetch(`${PUBLIC_API_BASE}/seed`, {
      method: "POST",
      headers: getHeaders(),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {}
  return { success: false, error: "Failed to trigger service seed" };
}

