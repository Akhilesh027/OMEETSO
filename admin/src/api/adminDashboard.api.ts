import { AdminAuthService } from "@/services/adminAuthService";

const API_BASE = "http://localhost:3000/api/v1/admin/dashboard";

function getHeaders(): Record<string, string> {
  const token = AdminAuthService.getAccessToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export async function getDashboardSummaryApi(): Promise<{
  success: boolean;
  data?: {
    totalUsers: number;
    activeListings: number;
    pendingListings: number;
    pendingStores: number;
    openSafetyReports: number;
    openSupportTickets: number;
  };
  error?: string;
}> {
  try {
    const res = await fetch(`${API_BASE}/summary`, {
      headers: getHeaders(),
      credentials: "include"
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error?.message || "Failed to fetch dashboard summary" };
    }
    return { success: true, data: json.data };
  } catch (error) {
    return { success: false, error: "Network error: Unable to connect to backend" };
  }
}

export async function getLiveActivityApi(): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  try {
    const res = await fetch(`${API_BASE}/live-activity`, {
      headers: getHeaders(),
      credentials: "include"
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error?.message || "Failed to fetch live activity" };
    }
    return { success: true, data: json.data };
  } catch (error) {
    return { success: false, error: "Network error" };
  }
}

export async function getAuditLogsApi(params?: Record<string, any>): Promise<{
  success: boolean;
  data?: any[];
  pagination?: any;
  error?: string;
}> {
  try {
    const query = new URLSearchParams(params || {}).toString();
    const url = query ? `${API_BASE}/audit-logs?${query}` : `${API_BASE}/audit-logs`;
    const res = await fetch(url, {
      headers: getHeaders(),
      credentials: "include"
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error?.message || "Failed to fetch audit logs" };
    }
    return { success: true, data: json.data, pagination: json.pagination };
  } catch (error) {
    return { success: false, error: "Network error" };
  }
}
