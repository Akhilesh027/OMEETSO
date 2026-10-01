import { AdminAuthService } from "@/services/adminAuthService";
import { API_BASE as ROOT_API_BASE } from "@/config/api";

const API_BASE = (import.meta as any).env?.VITE_ADMIN_API_BASE_URL
  ? `${(import.meta as any).env.VITE_ADMIN_API_BASE_URL}/jobs`
  : `${ROOT_API_BASE}/admin/jobs`;

function getHeaders(): Record<string, string> {
  const token =
    AdminAuthService.getAccessToken() ||
    (typeof localStorage !== "undefined"
      ? localStorage.getItem("omeetso_admin_token") || localStorage.getItem("adminToken")
      : null);
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

async function resilientFetch(path: string, options: RequestInit = {}): Promise<Response | null> {
  try {
    const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    const timeoutId = controller ? setTimeout(() => controller.abort(), 4000) : null;

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
      console.warn(`[adminJobs.api] Network error for ${path}:`, err);
    }
    return null;
  }
}

export async function bulkApproveJobsApi(
  jobIds: string[],
  reason?: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const res = await resilientFetch(`${API_BASE}/bulk-approve`, {
      method: "POST",
      body: JSON.stringify({ jobIds, reason: reason || "Bulk approved by moderator in Admin Panel" })
    });

    if (res) {
      const json = await res.json();
      if (json.success) {
        return { success: true, data: json.data };
      }
    }
  } catch {
    // fallback
  }

  // Fallback: approve sequentially if bulk endpoint fails
  try {
    await Promise.all(
      jobIds.map((id) =>
        resilientFetch(`${API_BASE}/${id}/status`, {
          method: "PATCH",
          body: JSON.stringify({ status: "APPROVED", rejectionReason: undefined })
        })
      )
    );
    return { success: true, data: { approvedCount: jobIds.length } };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to bulk approve jobs" };
  }
}
