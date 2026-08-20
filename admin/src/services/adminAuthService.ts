import { AdminUser, AdminSession, AuthStatus, LoginCredentials, TwoFactorVerification } from "@/types/auth";
import { Permission, PERMISSIONS } from "@/permissions/permissions";

const resolvePermissions = (role: string, rawPermissions: string[] = []): Permission[] => {
  if (role === "Super Admin" || rawPermissions?.includes("*")) {
    return ["*" as Permission, ...PERMISSIONS];
  }
  return (rawPermissions || []) as Permission[];
};

const API_BASE = "http://localhost:3000/api/v1/admin/auth";

let memoryAccessToken: string | null = null;
let currentAdmin: AdminUser | null = null;

export class AdminAuthService {
  static getAccessToken(): string | null {
    return memoryAccessToken || localStorage.getItem("omeetso_admin_token");
  }

  static setAccessToken(token: string | null): void {
    memoryAccessToken = token;
    if (token) {
      localStorage.setItem("omeetso_admin_token", token);
    } else {
      localStorage.removeItem("omeetso_admin_token");
    }
  }

  static getAdmin(): AdminUser | null {
    return currentAdmin;
  }

  static async login(credentials: LoginCredentials): Promise<{
    status: AuthStatus;
    session?: AdminSession;
    admin?: AdminUser;
    error?: string;
  }> {
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: credentials.email, password: credentials.password })
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        const code = json.error?.code;
        const msg = json.error?.message || "Login failed";
        if (code === "ACCOUNT_LOCKED") {
          return { status: "account_locked", error: msg };
        }
        return { status: "unauthenticated", error: msg };
      }

      if (json.data?.requiresTwoFactor) {
        const partialAdmin: AdminUser = {
          id: "temp",
          name: credentials.email,
          email: credentials.email,
          role: "Super Admin",
          permissions: [],
          status: "active",
          lastLoginAt: new Date().toISOString(),
          twoFactorEnabled: true
        };
        return {
          status: "two_factor_required",
          admin: partialAdmin
        };
      }

      const { accessToken, admin } = json.data;
      memoryAccessToken = accessToken;
      currentAdmin = {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: resolvePermissions(admin.role, admin.permissions),
        avatar: admin.avatar,
        status: admin.status,
        lastLoginAt: admin.lastLoginAt || new Date().toISOString(),
        twoFactorEnabled: false
      };

      const session: AdminSession = {
        token: accessToken,
        adminId: admin.id,
        admin: currentAdmin,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        device: navigator.userAgent || "Desktop Browser",
        createdAt: new Date().toISOString()
      };

      return {
        status: "authenticated",
        admin: currentAdmin,
        session
      };
    } catch (error) {
      return {
        status: "unauthenticated",
        error: "Unable to connect to authentication server. Please ensure backend is running."
      };
    }
  }

  static async verifyTwoFactor(verification: TwoFactorVerification, email: string): Promise<{
    status: AuthStatus;
    session?: AdminSession;
    admin?: AdminUser;
    error?: string;
  }> {
    try {
      const res = await fetch(`${API_BASE}/two-factor/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, code: verification.code })
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        return {
          status: "two_factor_required",
          error: json.error?.message || "Invalid 2FA code"
        };
      }

      const { accessToken, admin } = json.data;
      memoryAccessToken = accessToken;
      currentAdmin = {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: resolvePermissions(admin.role, admin.permissions),
        avatar: admin.avatar,
        status: admin.status,
        lastLoginAt: admin.lastLoginAt || new Date().toISOString(),
        twoFactorEnabled: true
      };

      const session: AdminSession = {
        token: accessToken,
        adminId: admin.id,
        admin: currentAdmin,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        device: navigator.userAgent || "Desktop Browser",
        createdAt: new Date().toISOString()
      };

      return {
        status: "authenticated",
        admin: currentAdmin,
        session
      };
    } catch (error) {
      return {
        status: "two_factor_required",
        error: "Failed to verify 2FA code"
      };
    }
  }

  static async restoreSession(): Promise<{ status: AuthStatus; session: AdminSession | null; admin: AdminUser | null }> {
    try {
      const res = await fetch(`${API_BASE}/refresh`, {
        method: "POST",
        credentials: "include"
      });

      if (!res.ok) {
        memoryAccessToken = null;
        currentAdmin = null;
        return { status: "unauthenticated", session: null, admin: null };
      }

      const json = await res.json();
      if (!json.success || !json.data) {
        memoryAccessToken = null;
        currentAdmin = null;
        return { status: "unauthenticated", session: null, admin: null };
      }

      const { accessToken, admin } = json.data;
      memoryAccessToken = accessToken;
      currentAdmin = {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: resolvePermissions(admin.role, admin.permissions),
        avatar: admin.avatar,
        status: admin.status,
        lastLoginAt: new Date().toISOString(),
        twoFactorEnabled: false
      };

      const session: AdminSession = {
        token: accessToken,
        adminId: admin.id,
        admin: currentAdmin,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        device: navigator.userAgent || "Desktop Browser",
        createdAt: new Date().toISOString()
      };

      return { status: "authenticated", session, admin: currentAdmin };
    } catch (error) {
      memoryAccessToken = null;
      currentAdmin = null;
      return { status: "unauthenticated", session: null, admin: null };
    }
  }

  static async logout(_admin?: AdminUser | null): Promise<void> {
    try {
      await fetch(`${API_BASE}/logout`, {
        method: "POST",
        credentials: "include"
      });
    } catch {
      // Ignore errors on logout
    } finally {
      memoryAccessToken = null;
      currentAdmin = null;
    }
  }
}
