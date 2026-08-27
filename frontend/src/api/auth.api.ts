import { API_BASE as ROOT_API } from "@/config/api";
const API_BASE = `${ROOT_API}/auth`;

let inMemoryUserAccessToken: string | null = null;

export function getUserAccessToken(): string | null {
  if (inMemoryUserAccessToken) return inMemoryUserAccessToken;
  if (typeof window !== "undefined" && window.localStorage) {
    const stored = localStorage.getItem("omeetso_user_token");
    if (stored) {
      inMemoryUserAccessToken = stored;
      return stored;
    }
  }
  return null;
}

export function setUserAccessToken(token: string | null): void {
  inMemoryUserAccessToken = token;
  if (typeof window !== "undefined" && window.localStorage) {
    if (token) {
      localStorage.setItem("omeetso_user_token", token);
    } else {
      localStorage.removeItem("omeetso_user_token");
    }
  }
}

export interface UserAuthResponse {
  accessToken: string;
  isNewUser?: boolean;
  user: {
    id: string;
    phone: string;
    email?: string;
    accountType: "individual" | "business";
    status: string;
    profile: {
      name: string;
      avatar?: string;
      city: string;
      pincode: string;
      area?: string;
    };
    verificationSummary: {
      mobileVerified: boolean;
      emailVerified: boolean;
      identityVerified: boolean;
      businessVerified: boolean;
    };
  };
}

export interface CheckPhoneResponse {
  exists: boolean;
  phone: string;
  cleanPhone: string;
  name?: string;
  hasPin?: boolean;
  avatar?: string;
}

export async function checkPhoneStatusApi(phone: string): Promise<{ success: boolean; data?: CheckPhoneResponse; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/check-phone`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone })
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error?.message || "Failed to check phone number" };
    }
    return { success: true, data: json.data };
  } catch (error) {
    return { success: false, error: "Network error: Unable to connect to server" };
  }
}

export async function loginUserApi(phone: string, pin?: string): Promise<{ success: boolean; data?: UserAuthResponse; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ phone, pin, password: pin })
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error?.message || "Failed to sign in" };
    }

    setUserAccessToken(json.data.accessToken);
    if (typeof localStorage !== "undefined" && json.data.user) {
      localStorage.setItem("omeetso_user", JSON.stringify(json.data.user));
      localStorage.setItem("omeetso_profile", "1");
      localStorage.removeItem("omeetso_guest");
      localStorage.removeItem("omeetso_guest_session");
    }
    return { success: true, data: json.data };
  } catch (error) {
    return { success: false, error: "Network error: Unable to connect to backend server" };
  }
}

export interface RegisterPayload {
  name: string;
  phone: string;
  pin?: string;
  email?: string;
  password?: string;
  city: string;
  pincode: string;
  area?: string;
  accountType?: "individual" | "business";
  avatar?: string;
  language?: string;
  gender?: "male" | "female" | "other";
}

export async function registerUserApi(payload: RegisterPayload): Promise<{ success: boolean; data?: UserAuthResponse; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error?.message || "Failed to create account" };
    }

    setUserAccessToken(json.data.accessToken);
    if (typeof localStorage !== "undefined" && json.data.user) {
      localStorage.setItem("omeetso_user", JSON.stringify(json.data.user));
      localStorage.setItem("omeetso_profile", "1");
      if (payload.language) localStorage.setItem("omeetso_language", payload.language);
      if (payload.city || payload.pincode) {
        localStorage.setItem("omeetso_location", JSON.stringify({ area: payload.city, pincode: payload.pincode, savedAt: Date.now() }));
      }
      localStorage.removeItem("omeetso_guest");
      localStorage.removeItem("omeetso_guest_session");
    }
    return { success: true, data: json.data };
  } catch (error) {
    return { success: false, error: "Network error: Unable to connect to backend server" };
  }
}

export async function requestUserOtp(phone: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/otp/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone })
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error?.message || "Failed to request OTP" };
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: "Network error: Unable to connect to backend server" };
  }
}

export async function verifyUserOtp(phone: string, code: string): Promise<{ success: boolean; data?: UserAuthResponse; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/otp/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ phone, code })
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error?.message || "Invalid OTP code" };
    }

    setUserAccessToken(json.data.accessToken);
    if (typeof localStorage !== "undefined" && json.data.user) {
      localStorage.setItem("omeetso_user", JSON.stringify(json.data.user));
    }
    return { success: true, data: json.data };
  } catch (error) {
    return { success: false, error: "Network error: Unable to verify OTP" };
  }
}

export async function refreshUserSession(): Promise<{ success: boolean; data?: UserAuthResponse }> {
  try {
    const res = await fetch(`${API_BASE}/refresh`, {
      method: "POST",
      credentials: "include"
    });
    if (!res.ok) {
      return { success: false };
    }
    const json = await res.json();
    if (json.success && json.data) {
      setUserAccessToken(json.data.accessToken);
      if (typeof localStorage !== "undefined" && json.data.user) {
        localStorage.setItem("omeetso_user", JSON.stringify(json.data.user));
      }
      return { success: true, data: json.data };
    }
    return { success: false };
  } catch {
    return { success: false };
  }
}

export async function logoutUserApi(): Promise<void> {
  try {
    await fetch(`${API_BASE}/logout`, {
      method: "POST",
      credentials: "include"
    });
  } catch {
    // Ignore
  } finally {
    setUserAccessToken(null);
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem("omeetso_user");
      localStorage.removeItem("omeetso_user_token");
    }
  }
}
