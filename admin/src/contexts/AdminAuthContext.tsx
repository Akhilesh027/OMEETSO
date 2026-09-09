import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { AdminUser, AdminSession, AuthStatus, LoginCredentials, TwoFactorVerification } from "@/types/auth";
import { Permission } from "@/permissions/permissions";
import { hasPermission as checkHasPermission } from "@/permissions/roles";
import { AdminAuthService } from "@/services/adminAuthService";
import { LocalStorageService, adminStorageKeys } from "@/storage/localStorageService";

interface AdminAuthContextType {
  status: AuthStatus;
  admin: AdminUser | null;
  session: AdminSession | null;
  error: string | null;
  intendedRoute: string | null;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; requires2FA?: boolean; error?: string }>;
  verify2FA: (verification: TwoFactorVerification) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  logoutAllSessions: () => Promise<void>;
  clearError: () => void;
  setIntendedRoute: (route: string | null) => void;
  hasPermission: (requiredPermissions: Permission[]) => boolean;
  can: (permission: Permission) => boolean;
  canAny: (permissions: Permission[]) => boolean;
  canAll: (permissions: Permission[]) => boolean;
  switchRoleForTesting?: (role: AdminUser["role"]) => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const DEFAULT_SUPER_ADMIN: AdminUser = {
  id: "adm_super_1",
  name: "Super Administrator",
  email: "admin@digitalness.co.in",
  role: "Super Admin",
  permissions: ["*" as Permission],
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
  status: "active",
  lastLoginAt: new Date().toISOString(),
  twoFactorEnabled: false
};

const DEFAULT_SESSION: AdminSession = {
  token: "admin_super_token",
  adminId: "adm_super_1",
  admin: DEFAULT_SUPER_ADMIN,
  expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
  device: "Desktop",
  createdAt: new Date().toISOString()
};

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<AuthStatus>("authenticated");
  const [admin, setAdmin] = useState<AdminUser | null>(DEFAULT_SUPER_ADMIN);
  const [session, setSession] = useState<AdminSession | null>(DEFAULT_SESSION);
  const [error, setError] = useState<string | null>(null);
  const [intendedRoute, setIntendedRouteState] = useState<string | null>(() =>
    LocalStorageService.getItem<string | null>(adminStorageKeys.intendedRoute, null)
  );

  useEffect(() => {
    // Keep admin permanently authenticated without expiring sessions or 401 refresh calls
    AdminAuthService.setAccessToken("admin_super_token");
  }, []);

  const setIntendedRoute = useCallback((route: string | null) => {
    setIntendedRouteState(route);
    if (route) {
      LocalStorageService.setItem(adminStorageKeys.intendedRoute, route);
    } else {
      LocalStorageService.removeItem(adminStorageKeys.intendedRoute);
    }
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setError(null);
    const result = await AdminAuthService.login(credentials);
    setStatus(result.status);

    if (result.error) {
      setError(result.error);
    }

    if (result.status === "authenticated" && result.session) {
      setSession(result.session);
      setAdmin(result.session.admin);
      return { success: true };
    }

    if (result.status === "two_factor_required" && result.admin) {
      setAdmin(result.admin);
      return { success: true, requires2FA: true };
    }

    return { success: false, error: result.error };
  };

  const verify2FA = async (verification: TwoFactorVerification) => {
    setError(null);
    const targetEmail = admin?.email || "";
    const result = await AdminAuthService.verifyTwoFactor(verification, targetEmail);

    if (result.error) {
      setError(result.error);
    }

    if (result.status === "authenticated" && result.session) {
      setStatus("authenticated");
      setSession(result.session);
      setAdmin(result.session.admin);
      return { success: true };
    }

    return { success: false, error: result.error };
  };

  const logout = async () => {
    await AdminAuthService.logout(admin);
    setStatus("unauthenticated");
    setAdmin(null);
    setSession(null);
    setError(null);
  };

  const logoutAllSessions = async () => {
    await AdminAuthService.logout(admin);
    LocalStorageService.clearAllAdminData();
    setStatus("unauthenticated");
    setAdmin(null);
    setSession(null);
    setError(null);
  };

  const clearError = () => setError(null);

  const hasPermission = useCallback(
    (_requiredPermissions?: Permission[]): boolean => true,
    []
  );

  const switchRoleForTesting = (role: AdminUser["role"]) => {
    if (!admin) return;
    const { ROLE_DEFINITIONS } = require("@/permissions/roles");
    const updatedAdmin: AdminUser = {
      ...admin,
      role,
      permissions: ROLE_DEFINITIONS[role]?.permissions || ["*" as Permission],
    };
    setAdmin(updatedAdmin);
    if (session) {
      setSession({ ...session, admin: updatedAdmin });
    }
  };

  const can = useCallback((_permission: Permission): boolean => true, []);
  const canAny = useCallback((_permissions: Permission[]): boolean => true, []);
  const canAll = useCallback((_permissions: Permission[]): boolean => true, []);

  return (
    <AdminAuthContext.Provider
      value={{
        status,
        admin,
        session,
        error,
        intendedRoute,
        login,
        verify2FA,
        logout,
        logoutAllSessions,
        clearError,
        setIntendedRoute,
        hasPermission,
        can,
        canAny,
        canAll,
        switchRoleForTesting,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
};
