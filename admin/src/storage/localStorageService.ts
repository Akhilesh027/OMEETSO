export const adminStorageKeys = {
  session: "omeetso_admin_session",
  adminUsers: "omeetso_admin_users",
  roles: "omeetso_admin_roles",
  users: "omeetso_admin_managed_users",
  listings: "omeetso_admin_listings",
  categories: "omeetso_admin_categories",
  stores: "omeetso_admin_stores",
  safetyReports: "omeetso_admin_safety_reports",
  promotions: "omeetso_admin_promotions",
  campaigns: "omeetso_admin_campaigns",
  placements: "omeetso_admin_placements",
  wallets: "omeetso_admin_wallets",
  payments: "omeetso_admin_payments",
  refunds: "omeetso_admin_refunds",
  reviews: "omeetso_admin_reviews",
  supportTickets: "omeetso_admin_support_tickets",
  notifications: "omeetso_admin_notifications",
  content: "omeetso_admin_content",
  auditLogs: "omeetso_admin_audit_logs",
  settings: "omeetso_admin_settings",
  featureFlags: "omeetso_admin_feature_flags",
  intendedRoute: "omeetso_admin_intended_route",
  failedAttempts: "omeetso_admin_failed_attempts",
} as const;

export class LocalStorageService {
  static getItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue;
      return JSON.parse(item) as T;
    } catch (error) {
      console.warn(`[LocalStorage] Failed to parse key "${key}":`, error);
      return defaultValue;
    }
  }

  static setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`[LocalStorage] Failed to set key "${key}":`, error);
    }
  }

  static removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`[LocalStorage] Failed to remove key "${key}":`, error);
    }
  }

  static clearAllAdminData(): void {
    Object.values(adminStorageKeys).forEach((key) => {
      this.removeItem(key);
    });
  }
}
