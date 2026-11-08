import { API_BASE } from "@/config/api";
import { AdminAuthService } from "@/services/adminAuthService";

export interface BoostReminderLogItem {
  id: string;
  listingId: string;
  listingTitle: string;
  listingCity: string;
  sellerPhone?: string;
  viewsCount: number;
  ageDays: number;
  channel: string;
  status: "SENT" | "CLICKED" | "CONVERTED_PAID" | "DISMISSED";
  revenueINR: number;
  sentAt: string;
  convertedAt?: string;
}

export interface BoostMonetizationStats {
  totalRemindersSent: number;
  totalConvertedToPaid: number;
  conversionRatePercent: number;
  totalRevenueGeneratedINR: number;
  eligibleListingsCount: number;
  recentLogs: BoostReminderLogItem[];
}

function getAuthHeaders(): HeadersInit {
  const token = AdminAuthService.getAccessToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export async function fetchBoostRemindersStatsApi(): Promise<{
  success: boolean;
  data?: BoostMonetizationStats;
  error?: string;
}> {
  try {
    const res = await fetch(`${API_BASE}/revenue/admin/boost-reminders/stats`, {
      headers: getAuthHeaders()
    });
    const json = await res.json();
    return json;
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to load monetization stats" };
  }
}

export const getAdminBoostReminderStatsApi = fetchBoostRemindersStatsApi;

export async function triggerBoostRemindersScanApi(options: {
  minAgeDays?: number;
  maxViews?: number;
} = {}): Promise<{
  success: boolean;
  message?: string;
  data?: {
    scannedCount: number;
    remindersDispatchedCount: number;
    skippedActiveCampaignCount: number;
    skippedRecentReminderCount: number;
    dispatchedListings: Array<{
      listingId: string;
      title: string;
      city: string;
      sellerPhone?: string;
    }>;
  };
  error?: string;
}> {
  try {
    const res = await fetch(`${API_BASE}/revenue/admin/boost-reminders/trigger-now`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(options)
    });
    const json = await res.json();
    return json;
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to trigger scan" };
  }
}

