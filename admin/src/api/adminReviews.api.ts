import { AdminAuthService } from "@/services/adminAuthService";
import { API_BASE as ROOT_API_BASE } from "@/config/api";

const API_BASE = `${ROOT_API_BASE}/admin/reviews`;

function getHeaders(): Record<string, string> {
  const token = AdminAuthService.getAccessToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export interface AdminReviewItem {
  id: string;
  reviewerName: string;
  reviewerId: string;
  targetName: string;
  targetType: "store" | "seller" | "product";
  rating: number;
  comment: string;
  tags?: string[];
  isReported: boolean;
  status: "published" | "hidden" | "under_review";
  createdAt: string;
}

export async function getAdminReviewsApi(params?: Record<string, any>): Promise<{
  success: boolean;
  data?: AdminReviewItem[];
  error?: string;
}> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);

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
      return { success: false, error: json.error?.message || "Failed to fetch reviews" };
    }
    return { success: true, data: json.data };
  } catch {
    clearTimeout(timer);
    return { success: false, error: "Network error: Unable to load reviews" };
  }
}

export async function updateAdminReviewStatusApi(
  reviewId: string,
  status: "published" | "hidden" | "under_review",
  isReported?: boolean
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/${reviewId}/status`, {
      method: "PATCH",
      headers: getHeaders(),
      credentials: "include",
      body: JSON.stringify({ status, isReported })
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error?.message || "Failed to update review status" };
    }
    return { success: true, data: json.data };
  } catch {
    return { success: false, error: "Network error: Unable to update review" };
  }
}

export async function deleteAdminReviewApi(reviewId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/${reviewId}`, {
      method: "DELETE",
      headers: getHeaders(),
      credentials: "include"
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error?.message || "Failed to delete review" };
    }
    return { success: true };
  } catch {
    return { success: false, error: "Network error: Unable to delete review" };
  }
}
