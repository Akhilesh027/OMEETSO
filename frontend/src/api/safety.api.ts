import { getUserAccessToken } from "./auth.api";
import { API_BASE as ROOT_API } from "@/config/api";

const API_BASE = `${ROOT_API}/safety`;

function getAuthHeaders(): Record<string, string> {
  const token = getUserAccessToken() || "";
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export interface CreateSafetyReportPayload {
  category: string;
  description: string;
  relatedUser?: string;
  relatedListing?: string;
  relatedChat?: string;
  attachments?: string[];
  evidenceImages?: string[];
  contactPref?: "in_app" | "email" | "call" | string;
  contactTimeSlot?: string;
  isAnonymous?: boolean;
  reporterName?: string;
  reporterEmail?: string;
  reporterPhone?: string;
  priority?: "low" | "medium" | "high" | "critical";
  targetType?: string;
  targetId?: string;
}

export interface SafetyReportItem {
  id: string;
  category: string;
  description: string;
  status: "OPEN" | "INVESTIGATING" | "RESOLVED" | "DISMISSED";
  priority: string;
  targetType?: string;
  targetId?: string;
  relatedUser?: string;
  relatedListing?: string;
  isAnonymous?: boolean;
  contactPref?: string;
  resolutionNotes?: string;
  createdAt: string;
}

export async function createSafetyReportApi(payload: CreateSafetyReportPayload): Promise<{
  success: boolean;
  data?: {
    id: string;
    status: string;
    createdAt: string;
    category?: string;
    isAnonymous?: boolean;
    contactPref?: string;
  };
  error?: string;
}> {
  try {
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error?.message || "Failed to submit safety report" };
    }
    return json;
  } catch {
    return { success: false, error: "Network error submitting safety report" };
  }
}

export async function getMySafetyReportsApi(params?: { email?: string; phone?: string }): Promise<{
  success: boolean;
  data?: SafetyReportItem[];
  error?: string;
}> {
  try {
    const query = new URLSearchParams();
    if (params?.email) query.set("email", params.email);
    if (params?.phone) query.set("phone", params.phone);
    const qs = query.toString() ? `?${query.toString()}` : "";

    const res = await fetch(`${API_BASE}/my${qs}`, {
      headers: getAuthHeaders(),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error?.message || "Failed to load safety reports" };
    }
    return json;
  } catch {
    return { success: false, error: "Network error loading safety reports" };
  }
}
