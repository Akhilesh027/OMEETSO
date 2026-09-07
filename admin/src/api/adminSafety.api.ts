import { AdminAuthService } from "@/services/adminAuthService";
import { API_BASE as ROOT_API_BASE } from "@/config/api";

const API_BASE = `${ROOT_API_BASE}/safety/admin`;

function getHeaders(): Record<string, string> {
  const token = AdminAuthService.getAccessToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export async function getAdminSafetyReportsApi(params?: Record<string, any>): Promise<{
  success: boolean;
  data?: any[];
  pagination?: any;
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
      return { success: false, error: json.error?.message || "Failed to fetch safety reports" };
    }
    return { success: true, data: json.data, pagination: json.pagination };
  } catch (error) {
    clearTimeout(timer);
    return { success: false, error: "Network error: Unable to fetch safety reports" };
  }
}

export async function resolveSafetyReportApi(
  reportId: string,
  action: "resolve" | "dismiss",
  resolutionNotes?: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/${reportId}/resolve`, {
      method: "PATCH",
      headers: getHeaders(),
      credentials: "include",
      body: JSON.stringify({ action, resolutionNotes })
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error?.message || "Failed to resolve safety report" };
    }
    return { success: true, data: json.data };
  } catch (error) {
    return { success: false, error: "Network error: Unable to update safety report" };
  }
}
