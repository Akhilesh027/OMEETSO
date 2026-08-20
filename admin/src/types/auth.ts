import { Permission } from "@/permissions/permissions";

export type AdminRole =
  | "Super Admin"
  | "Platform Admin"
  | "Listing Moderator"
  | "Store Moderator"
  | "Advertisement Manager"
  | "Finance Manager"
  | "Support Agent"
  | "Safety and Fraud Officer"
  | "Analytics Viewer";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  permissions: Permission[];
  avatar?: string;
  status: "active" | "suspended" | "locked";
  lastLoginAt: string;
  twoFactorEnabled: boolean;
  failedLoginAttempts?: number;
  lockedUntil?: string | null;
}

export interface AdminSession {
  token: string;
  adminId: string;
  admin: AdminUser;
  expiresAt: string;
  device: string;
  createdAt: string;
  requiresTwoFactor?: boolean;
}

export type AuthStatus =
  | "initializing"
  | "unauthenticated"
  | "credentials_verified"
  | "two_factor_required"
  | "authenticated"
  | "session_expired"
  | "account_locked"
  | "access_denied";

export interface LoginCredentials {
  email: string;
  password?: string;
  rememberDevice?: boolean;
}

export interface TwoFactorVerification {
  code: string;
  backupCode?: string;
}

export interface AuditLogEntry {
  id: string;
  adminId: string;
  adminName: string;
  role: AdminRole;
  action: string;
  targetType: string;
  targetId: string;
  previousValue?: string | object;
  newValue?: string | object;
  reason?: string;
  timestamp: string;
  sessionId?: string;
}
