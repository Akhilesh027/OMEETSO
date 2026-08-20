import { AuditLogEntry, AdminUser } from "@/types/auth";
import { LocalStorageService, adminStorageKeys } from "@/storage/localStorageService";
import { MOCK_AUDIT_LOGS } from "@/data/auditLogs";

export class AuditLogService {
  static getLogs(): AuditLogEntry[] {
    const stored = LocalStorageService.getItem<AuditLogEntry[]>(
      adminStorageKeys.auditLogs,
      MOCK_AUDIT_LOGS
    );
    return stored;
  }

  static logAction(params: {
    admin?: AdminUser | null;
    action: string;
    targetType: string;
    targetId: string;
    previousValue?: string | object;
    newValue?: string | object;
    reason?: string;
  }): AuditLogEntry {
    const currentLogs = this.getLogs();
    const newEntry: AuditLogEntry = {
      id: `AUD-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      adminId: params.admin?.id || "SYS-000",
      adminName: params.admin?.name || "System Automated",
      role: params.admin?.role || "Super Admin",
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId,
      previousValue: params.previousValue,
      newValue: params.newValue,
      reason: params.reason || "System/Admin action recorded",
      timestamp: new Date().toISOString(),
      sessionId: `SESS-${Date.now()}`,
    };

    const updated = [newEntry, ...currentLogs];
    LocalStorageService.setItem(adminStorageKeys.auditLogs, updated);
    return newEntry;
  }
}
