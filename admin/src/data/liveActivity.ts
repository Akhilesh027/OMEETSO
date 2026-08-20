export interface LiveActivityItem {
  id: string;
  type: "user_registered" | "listing_created" | "store_applied" | "report_filed" | "ad_submitted" | "payment_completed";
  title: string;
  description: string;
  user: string;
  location: string;
  timestamp: string;
  badgeColor: "success" | "warning" | "error" | "info" | "indigo";
  targetRoute: string;
}

export const MOCK_LIVE_ACTIVITIES: LiveActivityItem[] = [];
