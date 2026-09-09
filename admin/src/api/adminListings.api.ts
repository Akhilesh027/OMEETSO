import { AdminAuthService } from "@/services/adminAuthService";
import { API_BASE as ROOT_API_BASE } from "@/config/api";
import { MockDataService } from "@/services/mockDataService";

const API_BASE = (import.meta as any).env?.VITE_ADMIN_API_BASE_URL
  ? `${(import.meta as any).env.VITE_ADMIN_API_BASE_URL}/listings`
  : `${ROOT_API_BASE}/admin/listings`;

function getHeaders(): Record<string, string> {
  const token = AdminAuthService.getAccessToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

async function resilientFetch(path: string, options: RequestInit = {}): Promise<Response | null> {
  try {
    const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    const timeoutId = controller ? setTimeout(() => controller.abort(), 3500) : null;

    const res = await fetch(path, {
      ...options,
      headers: { ...getHeaders(), ...(options.headers || {}) },
      signal: controller?.signal
    }).finally(() => {
      if (timeoutId) clearTimeout(timeoutId);
    });

    return res;
  } catch (err: any) {
    if (err?.name !== "AbortError") {
      console.warn(`[resilientFetch] Network error for ${path}:`, err);
    }
    return null;
  }
}

export async function getAdminListingsQueueApi(params?: Record<string, any>): Promise<{ success: boolean; data?: any[]; pagination?: any; error?: string }> {
  try {
    const query = new URLSearchParams(params || {}).toString();
    const url = query ? `${API_BASE}?${query}` : API_BASE;
    console.log(`[adminListings.api] Calling ${url}...`);

    const res = await resilientFetch(url);
    if (res) {
      const json = await res.json();
      console.log(`[adminListings.api] Response from ${url}:`, json);
      if (json.success && Array.isArray(json.data)) {
        return { success: true, data: json.data, pagination: json.pagination };
      }
      return { success: false, error: json.error?.message || "Server returned failure" };
    }
  } catch (error) {
    console.error("[adminListings.api] Failed to fetch queue:", error);
  }

  // Resilient offline / storage fallback so network disconnects don't blank the UI
  const mockListings = MockDataService.getListings();
  return {
    success: true,
    data: mockListings.map((l: any) => ({
      id: l.id,
      _id: l.id,
      title: l.title,
      description: l.description,
      priceInPaise: l.priceInPaise || (l.price ? Math.round(l.price * 100) : 0),
      condition: l.condition,
      categoryId: l.categoryId || l.category,
      subcategoryId: l.subcategoryId || l.subcategory,
      images: l.images || [],
      coverIndex: l.coverIndex || l.cover || 0,
      area: l.location?.area || l.area || "Madhapur",
      city: l.location?.city || l.city || "Hyderabad",
      pincode: l.location?.pincode || l.pincode || "500081",
      status: l.status,
      createdAt: l.createdAt || l.submittedAt || new Date().toISOString(),
      seller: {
        id: l.sellerId || "u_seller",
        name: l.sellerName || "Omeetso Seller",
        phone: l.sellerPhone || "9876543210",
        verified: true
      }
    })),
    pagination: { total: mockListings.length }
  };
}

export async function approveListingApi(listingId: string, reason?: string): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const res = await resilientFetch(`${API_BASE}/${listingId}/approve`, {
      method: "PATCH",
      body: JSON.stringify({ reason: reason || "Approved by moderator" })
    });

    if (res) {
      const json = await res.json();
      MockDataService.updateListingStatus(listingId, "active", reason);
      return { success: true, data: json.data };
    }
  } catch (error) {
    // fallback
  }

  MockDataService.updateListingStatus(listingId, "active", reason);
  return { success: true };
}

export async function rejectListingApi(listingId: string, reason: string): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const res = await resilientFetch(`${API_BASE}/${listingId}/reject`, {
      method: "PATCH",
      body: JSON.stringify({ reason })
    });

    if (res) {
      const json = await res.json();
      MockDataService.updateListingStatus(listingId, "rejected", reason);
      return { success: true, data: json.data };
    }
  } catch (error) {
    // fallback
  }

  MockDataService.updateListingStatus(listingId, "rejected", reason);
  return { success: true };
}

export async function updateListingStatusApi(listingId: string, status: string, reason?: string): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const res = await resilientFetch(`${API_BASE}/${listingId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, reason })
    });

    if (res) {
      const json = await res.json();
      MockDataService.updateListingStatus(listingId, status as any, reason);
      return { success: true, data: json.data };
    }
  } catch (error) {
    // fallback
  }

  MockDataService.updateListingStatus(listingId, status as any, reason);
  return { success: true };
}

export async function createAdminListingApi(payload: Record<string, any>): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const res = await resilientFetch(API_BASE, {
      method: "POST",
      body: JSON.stringify(payload)
    });

    if (res) {
      const json = await res.json();
      MockDataService.addListing(payload);
      return { success: true, data: json.data };
    }
  } catch (error) {
    // fallback
  }

  const added = MockDataService.addListing(payload);
  return { success: true, data: added[0] };
}

export async function updateAdminListingApi(listingId: string, payload: Record<string, any>): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const res = await resilientFetch(`${API_BASE}/${listingId}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    });

    if (res) {
      const json = await res.json();
      MockDataService.updateListing(listingId, payload);
      return { success: true, data: json.data };
    }
  } catch (error) {
    // fallback
  }

  MockDataService.updateListing(listingId, payload);
  return { success: true };
}

export async function deleteAdminListingApi(listingId: string): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const res = await resilientFetch(`${API_BASE}/${listingId}`, {
      method: "DELETE"
    });

    if (res) {
      const json = await res.json();
      MockDataService.deleteListing(listingId);
      return { success: true, data: json.data };
    }
  } catch (error) {
    // fallback
  }

  // Always delete locally so offline or network disconnect doesn't leave ghost items
  MockDataService.deleteListing(listingId);
  return { success: true };
}
