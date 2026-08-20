export interface DashboardStatCardData {
  id: string;
  title: string;
  value: string | number;
  change: string;
  trend: "up" | "down" | "neutral";
  subtitle: string;
  badge?: string;
  link: string;
}

export const MOCK_DASHBOARD_STATS: DashboardStatCardData[] = [
  {
    id: "total_users",
    title: "Total Users",
    value: "0",
    change: "0%",
    trend: "neutral",
    subtitle: "Total registered users",
    link: "/admin/users",
  },
  {
    id: "active_users",
    title: "Active Users (DAU)",
    value: "0",
    change: "0%",
    trend: "neutral",
    subtitle: "Active platform users",
    link: "/admin/users?status=active",
  },
  {
    id: "new_users_today",
    title: "New Users Today",
    value: "0",
    change: "0%",
    trend: "neutral",
    subtitle: "Today's registrations",
    link: "/admin/users",
  },
  {
    id: "active_listings",
    title: "Active Listings",
    value: "0",
    change: "0%",
    trend: "neutral",
    subtitle: "Approved marketplace listings",
    link: "/admin/listings",
  },
  {
    id: "pending_listings",
    title: "Listings Pending Review",
    value: "0",
    change: "0%",
    trend: "neutral",
    subtitle: "Moderation queue",
    link: "/admin/listings/pending",
  },
  {
    id: "active_stores",
    title: "Verified Stores",
    value: "0",
    change: "0%",
    trend: "neutral",
    subtitle: "Approved storefronts",
    link: "/admin/stores/verified",
  },
  {
    id: "store_applications",
    title: "Store Applications",
    value: "0",
    change: "0%",
    trend: "neutral",
    subtitle: "Pending verification",
    link: "/admin/stores/applications",
  },
  {
    id: "active_ads",
    title: "Active Campaigns",
    value: "0",
    change: "0%",
    trend: "neutral",
    subtitle: "Live promotion campaigns",
    link: "/admin/ads",
  },
  {
    id: "pending_ads",
    title: "Ad Reviews Pending",
    value: "0",
    change: "0%",
    trend: "neutral",
    subtitle: "Campaigns awaiting review",
    link: "/admin/ads/review",
  },
  {
    id: "platform_revenue",
    title: "Monthly Revenue (INR)",
    value: "₹0",
    change: "0%",
    trend: "neutral",
    subtitle: "Platform earnings",
    link: "/admin/wallets",
  },
  {
    id: "open_support",
    title: "Open Support Tickets",
    value: "0",
    change: "0%",
    trend: "neutral",
    subtitle: "Active tickets",
    link: "/admin/support/open",
  },
  {
    id: "critical_safety",
    title: "Critical Safety Reports",
    value: "0",
    change: "0%",
    trend: "neutral",
    subtitle: "Flagged issues",
    link: "/admin/safety-reports",
  },
];

export const MOCK_USER_GROWTH_DATA: { date: string; buyers: number; sellers: number; total: number }[] = [];

export const MOCK_LISTING_MODERATION_DATA: { month: string; approved: number; rejected: number; changesRequested: number }[] = [];

export const MOCK_REVENUE_BREAKDOWN_DATA: { name: string; value: number }[] = [];

export const MOCK_SAFETY_REPORTS_BY_SEVERITY: { severity: string; count: number }[] = [];
