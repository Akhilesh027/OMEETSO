import { API_BASE } from "@/config/api";
import { AdminAuthService } from "@/services/adminAuthService";

export interface LiveTelemetryStats {
  activeOnlineNow: number;
  uniqueVisitorsToday: number;
  registeredUsersToday: number;
  guestVisitorsToday: number;
  totalPageViewsToday: number;
  todayLeadsCount: number;
  allTimeUniqueVisitors: number;
  topCities: Array<{ city: string; count: number }>;
  availableCities: string[];
  topSearches: Array<{ query: string; count: number }>;
  serverTime: string;
}

export interface ActivityFeedItem {
  id: string;
  visitorId: string;
  sessionId: string;
  userId?: string;
  userContact?: {
    name?: string;
    phone?: string;
    email?: string;
    city?: string;
    accountType?: string;
  };
  type: string;
  title: string;
  description: string;
  pageUrl: string;
  pagePath: string;
  location: {
    ip: string;
    city: string;
    area?: string;
    pincode?: string;
    state?: string;
    country: string;
    coordinates?: [number, number];
    source: string;
  };
  device: {
    platform: "android_app" | "ios_app" | "mobile_web" | "desktop_web";
    browser: string;
    os: string;
    screenResolution?: string;
    networkType?: string;
    userAgent: string;
  };
  metadata?: Record<string, any>;
  isLead: boolean;
  timestamp: string;
}

function getAuthHeaders(): HeadersInit {
  const token = AdminAuthService.getAccessToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export async function fetchLiveTelemetryStatsApi(): Promise<{ success: boolean; data?: LiveTelemetryStats; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/telemetry/live-stats`, {
      headers: getAuthHeaders()
    });
    const json = await res.json();
    return json;
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to fetch live stats" };
  }
}

export async function fetchLiveTelemetryFeedApi(params: {
  page?: number;
  limit?: number;
  type?: string;
  city?: string;
  visitorType?: "all" | "registered" | "guest" | "leads";
  platform?: string;
  timeRange?: "all" | "today" | "yesterday" | "7d" | "30d";
  search?: string;
}): Promise<{
  success: boolean;
  data?: {
    activities: ActivityFeedItem[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  };
  error?: string;
}> {
  try {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set("page", params.page.toString());
    if (params.limit) searchParams.set("limit", params.limit.toString());
    if (params.type && params.type !== "all") searchParams.set("type", params.type);
    if (params.city && params.city !== "all") searchParams.set("city", params.city);
    if (params.visitorType && params.visitorType !== "all") searchParams.set("visitorType", params.visitorType);
    if (params.platform && params.platform !== "all") searchParams.set("platform", params.platform);
    if (params.timeRange && params.timeRange !== "all") searchParams.set("timeRange", params.timeRange);
    if (params.search) searchParams.set("search", params.search);

    const res = await fetch(`${API_BASE}/telemetry/feed?${searchParams.toString()}`, {
      headers: getAuthHeaders()
    });
    const json = await res.json();
    return json;
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to load telemetry feed" };
  }
}

export async function fetchVisitorJourneyApi(visitorId: string): Promise<{
  success: boolean;
  data?: {
    visitorId: string;
    totalEvents: number;
    events: Array<{
      id: string;
      type: string;
      title: string;
      description: string;
      pagePath: string;
      location: any;
      isLead: boolean;
      metadata: any;
      timestamp: string;
    }>;
  };
  error?: string;
}> {
  try {
    const res = await fetch(`${API_BASE}/telemetry/visitor/${visitorId}`, {
      headers: getAuthHeaders()
    });
    const json = await res.json();
    return json;
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to load visitor journey" };
  }
}

export async function downloadTelemetryReportApi(params: {
  timeRange?: string;
  type?: string;
  city?: string;
  visitorType?: string;
  platform?: string;
  search?: string;
}): Promise<boolean> {
  try {
    const searchParams = new URLSearchParams();
    if (params.timeRange && params.timeRange !== "all") searchParams.set("timeRange", params.timeRange);
    if (params.type && params.type !== "all") searchParams.set("type", params.type);
    if (params.city && params.city !== "all") searchParams.set("city", params.city);
    if (params.visitorType && params.visitorType !== "all") searchParams.set("visitorType", params.visitorType);
    if (params.platform && params.platform !== "all") searchParams.set("platform", params.platform);
    if (params.search) searchParams.set("search", params.search);

    const token = AdminAuthService.getAccessToken();
    const res = await fetch(`${API_BASE}/telemetry/export-report?${searchParams.toString()}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });

    if (!res.ok) throw new Error("Export failed");

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Omeetso_Visitor_Lead_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    console.error("Download report error:", err);
    return false;
  }
}
