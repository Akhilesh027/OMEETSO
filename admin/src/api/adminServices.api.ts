import { AdminAuthService } from "@/services/adminAuthService";

const API_BASE = "https://api.omeetso.in/api/v1/admin/services";
const PUBLIC_API_BASE = "https://api.omeetso.in/api/v1/services";

function getHeaders(): Record<string, string> {
  const token = AdminAuthService.getAccessToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function getAdminServicesQueueApi(params?: Record<string, any>): Promise<{ success: boolean; data?: any[]; pagination?: any; error?: string }> {
  const query = new URLSearchParams(params || {}).toString();
  const endpoints = [
    query ? `${API_BASE}?${query}` : API_BASE,
    query ? `https://api.omeetso.in/api/v1/admin/services?${query}` : "https://api.omeetso.in/api/v1/admin/services",
    query ? `${PUBLIC_API_BASE}?${query}` : PUBLIC_API_BASE,
    query ? `https://api.omeetso.in/api/v1/services?${query}` : "https://api.omeetso.in/api/v1/services",
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        headers: getHeaders(),
        credentials: "include",
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          return { success: true, data: json.data, pagination: json.pagination };
        }
      }
    } catch {
      // try next endpoint
    }
  }

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
  const endpoints = [
    `${API_BASE}/categories`,
    "https://api.omeetso.in/api/v1/admin/services/categories",
    `${PUBLIC_API_BASE}/categories`,
    "https://api.omeetso.in/api/v1/services/categories",
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        headers: getHeaders(),
        credentials: "include",
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          return json;
        }
      }
    } catch {
      // try next
    }
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
  const endpoints = [
    "https://api.omeetso.in/api/v1/services/seed",
    "https://api.omeetso.in/api/v1/services/seed",
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: getHeaders(),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch { }
  }
  return { success: false, error: "Failed to trigger service seed" };
}
