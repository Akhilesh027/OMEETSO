import { API_BASE } from "@/config/api";
import { AdminAuthService } from "@/services/adminAuthService";

export interface AdminStaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  roles: string[];
  permissions: string[];
  permissionsCount: string | number;
  status: "active" | "suspended" | "locked";
  twoFAEnabled: boolean;
  lastLoginAt?: string;
  createdAt: string;
  isRootAdmin?: boolean;
}

export interface CreateAdminStaffPayload {
  name: string;
  email: string;
  password: string;
  roles: string[];
  customPermissions?: string[];
}

export interface UpdateAdminStaffPayload {
  name?: string;
  roles?: string[];
  status?: "active" | "suspended";
  password?: string;
}

function getAuthHeaders(): HeadersInit {
  const token = AdminAuthService.getAccessToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export async function fetchAdminStaffListApi(): Promise<{
  success: boolean;
  data?: AdminStaffMember[];
  error?: string;
}> {
  try {
    const res = await fetch(`${API_BASE}/admin/staff`, {
      headers: getAuthHeaders()
    });
    const json = await res.json();
    return json;
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to load staff list" };
  }
}

export async function createAdminStaffApi(payload: CreateAdminStaffPayload): Promise<{
  success: boolean;
  message?: string;
  data?: AdminStaffMember;
  error?: string;
}> {
  try {
    const res = await fetch(`${API_BASE}/admin/staff`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok && !json.error) {
      return { success: false, error: `HTTP ${res.status}: Failed to create staff` };
    }
    if (json.error?.message) {
      return { success: false, error: json.error.message };
    }
    return json;
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to create staff member" };
  }
}

export async function updateAdminStaffApi(id: string, payload: UpdateAdminStaffPayload): Promise<{
  success: boolean;
  message?: string;
  data?: AdminStaffMember;
  error?: string;
}> {
  try {
    const res = await fetch(`${API_BASE}/admin/staff/${id}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (json.error?.message) {
      return { success: false, error: json.error.message };
    }
    return json;
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to update staff member" };
  }
}

export async function deleteAdminStaffApi(id: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const res = await fetch(`${API_BASE}/admin/staff/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders()
    });
    const json = await res.json();
    if (json.error?.message) {
      return { success: false, error: json.error.message };
    }
    return json;
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to delete staff member" };
  }
}

