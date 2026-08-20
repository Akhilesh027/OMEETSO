export interface CriticalAlertItem {
  id: string;
  type: "fraud_spike" | "system_error" | "payout_hold" | "security_threat";
  title: string;
  description: string;
  affectedCount: number;
  severity: "critical" | "high";
  timestamp: string;
  targetRoute: string;
  actionText: string;
}

export const MOCK_CRITICAL_ALERTS: CriticalAlertItem[] = [];
