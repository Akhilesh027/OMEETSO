import { AdminAuthService } from "@/services/adminAuthService";

const API_BASE = "http://localhost:3000/api/v1/banners";

function getHeaders(): Record<string, string> {
  const token = AdminAuthService.getAccessToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export interface HomeBannerItem {
  id: string;
  bannerId?: string;
  type: "hero_showcase" | "hero_banner" | "category_strip" | "quick_deal";
  title: string;
  subtitle?: string;
  tag?: string;
  price?: number;
  originalPrice?: number;
  image: string;
  sellerName?: string;
  initials?: string;
  location?: string;
  responseTime?: string;
  targetUrl?: string;
  listingId?: string;
  order?: number;
  isActive?: boolean;
  createdAt?: string;
}

export async function fetchHomeBannersApi(type?: string): Promise<{ success: boolean; data?: HomeBannerItem[]; error?: string }> {
  try {
    const url = type ? `${API_BASE}?all=true&type=${type}` : `${API_BASE}?all=true`;
    const res = await fetch(url, { headers: getHeaders() });
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error?.message || "Failed to fetch banners" };
    }
    return { success: true, data: json.data };
  } catch (error: any) {
    return { success: false, error: error.message || "Network error" };
  }
}

export async function createHomeBannerApi(payload: Partial<HomeBannerItem>): Promise<{ success: boolean; data?: HomeBannerItem; error?: string }> {
  try {
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error?.message || "Failed to create banner item" };
    }
    return { success: true, data: json.data };
  } catch (error: any) {
    return { success: false, error: error.message || "Network error" };
  }
}

export async function updateHomeBannerApi(id: string, payload: Partial<HomeBannerItem>): Promise<{ success: boolean; data?: HomeBannerItem; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error?.message || "Failed to update banner item" };
    }
    return { success: true, data: json.data };
  } catch (error: any) {
    return { success: false, error: error.message || "Network error" };
  }
}

export async function deleteHomeBannerApi(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
      headers: getHeaders()
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error?.message || "Failed to delete banner item" };
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Network error" };
  }
}
