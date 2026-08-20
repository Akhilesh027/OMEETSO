import { getUserAccessToken } from "./auth.api";

const API_BASE = "http://localhost:3000/api/v1";

function getAuthHeaders(): Record<string, string> {
  const token = getUserAccessToken() || "";
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export interface AdProductItem {
  id: string;
  name: string;
  description: string;
  campaignType: "LISTING_BOOST" | "BANNER_AD";
  durationDays: number;
  priceInPaise: number;
  permittedPlacements: string[];
}

export interface AdPlacementItem {
  id: string;
  placementId: string;
  name: string;
  campaignTypes: ("LISTING_BOOST" | "BANNER_AD")[];
  aspectRatio: string;
  minimumWidth: number;
  minimumHeight: number;
  maximumFileSizeBytes: number;
  maximumActiveSlots: number;
}

export interface ServedAdItem {
  servedAdId: string;
  campaignId: string;
  campaignType: "LISTING_BOOST" | "BANNER_AD";
  placement: string;
  creative: {
    imageUrl: string;
    title: string;
    priceInPaise?: number;
    destinationUrl: string;
  };
  label: string;
}

export async function getAdProductsApi(): Promise<{
  success: boolean;
  data?: AdProductItem[];
  error?: string;
}> {
  try {
    const res = await fetch(`${API_BASE}/ad-products`);
    return await res.json();
  } catch {
    return { success: false, error: "Failed to fetch ad products" };
  }
}

export async function getAdPlacementsApi(): Promise<{
  success: boolean;
  data?: AdPlacementItem[];
  error?: string;
}> {
  try {
    const res = await fetch(`${API_BASE}/ad-placements`);
    return await res.json();
  } catch {
    return { success: false, error: "Failed to fetch ad placements" };
  }
}

export async function createAdCampaignApi(payload: {
  listingId: string;
  adProductId: string;
  placementIds?: string[];
  bannerUrl?: string;
}): Promise<{
  success: boolean;
  data?: { id: string; status: string; pricing: { amountInPaise: number; totalInPaise: number } };
  error?: string;
}> {
  try {
    const res = await fetch(`${API_BASE}/ad-campaigns`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch {
    return { success: false, error: "Network error creating campaign" };
  }
}

export async function submitAdCampaignApi(campaignId: string): Promise<{
  success: boolean;
  data?: { id: string; status: string; reviewDeadlineAt: string };
  error?: string;
}> {
  try {
    const res = await fetch(`${API_BASE}/ad-campaigns/${campaignId}/submit`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return await res.json();
  } catch {
    return { success: false, error: "Network error submitting campaign" };
  }
}

export async function serveAdsApi(placement?: string, pincode?: string, area?: string): Promise<{
  success: boolean;
  data?: ServedAdItem[];
  error?: string;
}> {
  try {
    const params = new URLSearchParams();
    if (placement) params.set("placement", placement);
    if (pincode) params.set("pincode", pincode);
    if (area) params.set("area", area);
    const query = params.toString() ? `?${params.toString()}` : "";
    const res = await fetch(`${API_BASE}/ads/serve${query}`);
    return await res.json();
  } catch {
    return { success: false, error: "Failed to load served ads" };
  }
}

export async function getMyWalletApi(): Promise<{
  success: boolean;
  data?: {
    id: string;
    balanceInPaise: number;
    availableBalanceInPaise: number;
    heldBalanceInPaise: number;
    refundBalanceInPaise: number;
    transactions: {
      id: string;
      type: string;
      amountInPaise: number;
      description: string;
      referenceType: string;
      status: string;
      createdAt: string;
    }[];
  };
  error?: string;
}> {
  try {
    const res = await fetch(`${API_BASE}/wallet`, {
      headers: getAuthHeaders(),
    });
    return await res.json();
  } catch {
    return { success: false, error: "Network error loading wallet balance" };
  }
}

export async function getMyAdCampaignsApi(): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  try {
    const res = await fetch(`${API_BASE}/users/me/ad-campaigns`, {
      headers: getAuthHeaders(),
    });
    return await res.json();
  } catch {
    return { success: false, error: "Network error loading campaigns" };
  }
}

export async function trackAdImpressionApi(campaignId: string, placementId: string): Promise<void> {
  try {
    await fetch(`${API_BASE}/ads/track-impression`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campaignId, placementId })
    });
  } catch {
    // Silent analytics tracking
  }
}

export async function trackAdClickApi(campaignId: string, placementId: string): Promise<void> {
  try {
    await fetch(`${API_BASE}/ads/track-click`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campaignId, placementId })
    });
  } catch {
    // Silent analytics tracking
  }
}

export async function getCampaignAnalyticsApi(campaignId: string): Promise<{
  success: boolean;
  data?: {
    campaignId: string;
    status: string;
    totalImpressions: number;
    totalClicks: number;
    ctr: number;
    dailySeries: Array<{ date: string; impressions: number; clicks: number; ctr: number }>;
  };
  error?: string;
}> {
  try {
    const res = await fetch(`${API_BASE}/ad-campaigns/${campaignId}/analytics`, {
      headers: getAuthHeaders()
    });
    return await res.json();
  } catch {
    return { success: false, error: "Failed to load campaign analytics" };
  }
}

export async function rechargeWalletApi(amountInRupees: number, paymentMethod = "upi", paymentId?: string): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    const res = await fetch(`${API_BASE}/wallet/recharge`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ amountInRupees, paymentMethod, paymentId })
    });
    return await res.json();
  } catch {
    return { success: false, error: "Failed to process wallet recharge" };
  }
}
