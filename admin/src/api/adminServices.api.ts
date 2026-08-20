import { AdminAuthService } from "@/services/adminAuthService";

const API_BASE = "http://localhost:5000/api/v1/admin/services";
const PUBLIC_API_BASE = "http://localhost:5000/api/v1/services";

function getHeaders(): Record<string, string> {
  const token = AdminAuthService.getAccessToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function getAdminServicesQueueApi(params?: Record<string, any>): Promise<{ success: boolean; data?: any[]; pagination?: any; error?: string }> {
  try {
    const query = new URLSearchParams(params || {}).toString();
    const url = query ? `${API_BASE}?${query}` : API_BASE;

    const res = await fetch(url, {
      headers: getHeaders(),
      credentials: "include",
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error?.message || "Failed to fetch admin services queue" };
    }
    return { success: true, data: json.data, pagination: json.pagination };
  } catch (error) {
    // Fallback: try public API or return mock
    try {
      const res2 = await fetch(PUBLIC_API_BASE);
      const json2 = await res2.json();
      if (json2.success) return { success: true, data: json2.data };
    } catch {
      // ignore
    }
    return { success: false, error: "Network error: Unable to fetch services queue" };
  }
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
  try {
    const res = await fetch(`${API_BASE}/categories`, {
      headers: getHeaders(),
      credentials: "include",
    });
    const json = await res.json();
    return json;
  } catch {
    try {
      const res2 = await fetch(`${PUBLIC_API_BASE}/categories`);
      const json2 = await res2.json();
      return json2;
    } catch {
      return { success: false, error: "Failed to load categories" };
    }
  }
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
