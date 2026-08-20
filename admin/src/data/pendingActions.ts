export interface PendingActionItem {
  id: string;
  category: "listing" | "store" | "campaign" | "refund" | "verification" | "support" | "safety";
  title: string;
  subtitle: string;
  submittedBy: string;
  location: string;
  priority: "low" | "medium" | "high" | "critical";
  createdAt: string;
  targetRoute: string;
}

export const MOCK_PENDING_ACTIONS: PendingActionItem[] = [];
