import { AdminAuthService } from "@/services/adminAuthService";
import { API_BASE as ROOT_API_BASE } from "@/config/api";

const API_BASE = `${ROOT_API_BASE}/admin/dashboard`;

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

export interface RegionalListing {
  id: string;
  title: string;
  priceInPaise: number;
  categoryId: string;
  city: string;
  area: string;
  status: string;
  sellerName: string;
  sellerPhone: string;
  image: string;
  createdAt: string;
}

export interface RegionalUser {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  area: string;
  accountType: string;
  createdAt: string;
}

export interface RegionalSeller {
  id: string;
  name: string;
  ownerName: string;
  city: string;
  area: string;
  primaryCategory: string;
  businessMobile: string;
  status: string;
  isStore: boolean;
  rating: number;
  createdAt: string;
}

export interface RegionalCityStat {
  city: string;
  area: string;
  activeListings: number;
  verifiedStores: number;
  registeredUsers: number;
}

export interface PlatformAnalyticsData {
  totalListingsInArea: number;
  totalUsersInArea: number;
  totalSellersInArea: number;
  selectedCity: string;
  selectedArea: string;
  cities: RegionalCityStat[];
  listings: RegionalListing[];
  users: RegionalUser[];
  sellers: RegionalSeller[];
}

export async function getPlatformAnalyticsApi(params?: { city?: string; area?: string }): Promise<{
  success: boolean;
  data?: PlatformAnalyticsData;
  error?: string;
}> {
  try {
    const query = new URLSearchParams();
    if (params?.city) query.set("city", params.city);
    if (params?.area) query.set("area", params.area);

    const url = query.toString() ? `${API_BASE}/analytics?${query.toString()}` : `${API_BASE}/analytics`;
    const res = await fetch(url, {
      headers: getHeaders(),
      credentials: "include"
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error?.message || "Failed to fetch platform analytics" };
    }
    return { success: true, data: json.data };
  } catch (error) {
    return { success: false, error: "Network error: Unable to fetch platform analytics" };
  }
}
