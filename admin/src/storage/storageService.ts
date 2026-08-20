export const storageKeys = {
  adminSession: "omeetso_admin_session",
  adminPrefs: "omeetso_admin_prefs",
  auditLogs: "omeetso_admin_audit_logs",
  internalNotes: "omeetso_admin_internal_notes",
  featureFlags: "omeetso_admin_feature_flags",
  systemSettings: "omeetso_admin_system_settings",
  maintenance: "omeetso_admin_maintenance",
  savedFilters: "omeetso_admin_saved_filters",
} as const;

export type StorageKey = (typeof storageKeys)[keyof typeof storageKeys];

function safe(): Storage | null {
  try { return typeof window !== "undefined" ? window.localStorage : null; } catch { return null; }
}
export function getStoredValue<T>(k: StorageKey, fallback: T): T {
  const s = safe(); if (!s) return fallback;
  try { const r = s.getItem(k); return r == null ? fallback : (JSON.parse(r) as T); } catch { return fallback; }
}
export function setStoredValue<T>(k: StorageKey, v: T): void {
  const s = safe(); if (!s) return; try { s.setItem(k, JSON.stringify(v)); } catch { /* ignore */ }
}
export function removeStoredValue(k: StorageKey): void {
  const s = safe(); if (!s) return; try { s.removeItem(k); } catch { /* ignore */ }
}
