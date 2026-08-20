import type { AuditLogEntry } from "@/types";
import { getStoredValue, setStoredValue, storageKeys } from "@/storage/storageService";

export function readAuditLog(): AuditLogEntry[] {
  return getStoredValue<AuditLogEntry[]>(storageKeys.auditLogs, []);
}

export function appendAuditLog(entry: Omit<AuditLogEntry, "id" | "createdAt">): AuditLogEntry {
  const full: AuditLogEntry = {
    ...entry,
    id: "log_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8),
    createdAt: new Date().toISOString(),
  };
  const list = readAuditLog();
  const next = [full, ...list].slice(0, 500);
  setStoredValue(storageKeys.auditLogs, next);
  return full;
}
