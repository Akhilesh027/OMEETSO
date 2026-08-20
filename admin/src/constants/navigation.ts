import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard, Activity, ClipboardList, Users, UserCheck, ShoppingBag,
  ListChecks, FolderTree, Store, MessageSquareWarning, Megaphone, BadgePercent,
  Wallet, ReceiptText, Star, LifeBuoy, ShieldAlert, Bell, FileText, BarChart3,
  UserCog, ScrollText, Settings, ToggleRight, Wrench,
} from "lucide-react";
import type { Permission } from "@/permissions/permissions";

export interface NavItem {
  label: string;
  to: string;
  perms?: Permission[];
  icon?: LucideIcon;
}
export interface NavGroup {
  label: string;
  icon: LucideIcon;
  items: NavItem[];
}

export const NAV: NavGroup[] = [
  {
    label: "Overview",
    icon: LayoutDashboard,
    items: [
      { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
      { label: "Live Activity", to: "/admin/activity", icon: Activity },
      { label: "Pending Actions", to: "/admin/pending", icon: ClipboardList },
    ],
  },
  {
    label: "Users",
    icon: Users,
    items: [
      { label: "All Users", to: "/admin/users", perms: ["users.view"] },
      { label: "Buyers", to: "/admin/users/buyers", perms: ["users.view"] },
      { label: "Individual Sellers", to: "/admin/users/individual", perms: ["users.view"] },
      { label: "Business Sellers", to: "/admin/users/business", perms: ["users.view"] },
      { label: "Suspended", to: "/admin/users/suspended", perms: ["users.view"] },
      { label: "Blocked", to: "/admin/users/blocked", perms: ["users.view"] },
      { label: "Verification Requests", to: "/admin/users/verification", perms: ["users.view"], icon: UserCheck },
    ],
  },
  {
    label: "Listings",
    icon: ShoppingBag,
    items: [
      { label: "All Listings", to: "/admin/listings", perms: ["listings.view"] },
      { label: "Pending Review", to: "/admin/listings/review", perms: ["listings.view"], icon: ListChecks },
      { label: "Active", to: "/admin/listings/active", perms: ["listings.view"] },
      { label: "Requires Changes", to: "/admin/listings/requires-changes", perms: ["listings.view"] },
      { label: "Rejected", to: "/admin/listings/rejected", perms: ["listings.view"] },
      { label: "Reported", to: "/admin/listings/reported", perms: ["listings.view"] },
      { label: "Removed", to: "/admin/listings/removed", perms: ["listings.view"] },
      { label: "Expired", to: "/admin/listings/expired", perms: ["listings.view"] },
      { label: "Draft Statistics", to: "/admin/listings/drafts", perms: ["listings.view"] },
    ],
  },
  {
    label: "Categories",
    icon: FolderTree,
    items: [
      { label: "Categories", to: "/admin/categories", perms: ["categories.view"] },
      { label: "Subcategories", to: "/admin/categories/subcategories", perms: ["categories.view"] },
      { label: "Attributes", to: "/admin/attributes", perms: ["categories.view"] },
      { label: "Specification Templates", to: "/admin/categories/templates", perms: ["categories.view"] },
      { label: "Filters", to: "/admin/categories/filters", perms: ["categories.view"] },
      { label: "Restricted Products", to: "/admin/categories/restricted", perms: ["categories.view"] },
    ],
  },
  {
    label: "Stores",
    icon: Store,
    items: [
      { label: "All Stores", to: "/admin/stores", perms: ["stores.view"] },
      { label: "Applications", to: "/admin/stores/applications", perms: ["stores.view"] },
      { label: "Verified", to: "/admin/stores/verified", perms: ["stores.view"] },
      { label: "Rejected", to: "/admin/stores/rejected", perms: ["stores.view"] },
      { label: "Reported", to: "/admin/stores/reported", perms: ["stores.view"] },
      { label: "Store Products", to: "/admin/store-products", perms: ["stores.view"] },
      { label: "Store Categories", to: "/admin/stores/categories", perms: ["stores.view"] },
    ],
  },
  {
    label: "Communication",
    icon: MessageSquareWarning,
    items: [
      { label: "Live Chat Monitor", to: "/admin/chat-monitoring", perms: ["communication.view"] },
      { label: "Chat Reports", to: "/admin/chat-reports", perms: ["communication.view"] },
      { label: "Reported Messages", to: "/admin/message-reports", perms: ["communication.view"] },
      { label: "Offer Disputes", to: "/admin/offer-disputes", perms: ["offers.view"] },
      { label: "Blocked Conversations", to: "/admin/blocked-conversations", perms: ["communication.view"] },
      { label: "Safety Alerts", to: "/admin/safety-alerts", perms: ["safety.view"] },
    ],
  },
  {
    label: "Promotions & Boosts",
    icon: BadgePercent,
    items: [
      { label: "Promotions & Boosts Workspace", to: "/admin/promotions", perms: ["promotions.view"] },
      { label: "Slot Specs (6)", to: "/admin/promotions/placements", perms: ["promotions.view"] },
    ],
  },
  {
    label: "Advertisements",
    icon: Megaphone,
    items: [
      { label: "Advertisements & Media Workspace", to: "/admin/ads", perms: ["ads.view"] },
    ],
  },
  {
    label: "Finance",
    icon: Wallet,
    items: [
      { label: "Wallets", to: "/admin/wallets", perms: ["wallet.view"] },
      { label: "Transactions", to: "/admin/transactions", perms: ["wallet.view"] },
      { label: "Payments", to: "/admin/payments", perms: ["payments.view"] },
      { label: "Refunds", to: "/admin/refunds", perms: ["payments.view", "refunds.approve"] },
      { label: "Promotional Credits", to: "/admin/credits", perms: ["wallet.view"] },
      { label: "Invoices", to: "/admin/invoices", perms: ["payments.view"], icon: ReceiptText },
      { label: "Tax & Billing", to: "/admin/tax-billing", perms: ["payments.view"] },
    ],
  },
  {
    label: "Reviews",
    icon: Star,
    items: [
      { label: "All Reviews", to: "/admin/reviews", perms: ["reviews.view"] },
      { label: "Reported", to: "/admin/reviews/reported", perms: ["reviews.view"] },
      { label: "Store Reviews", to: "/admin/reviews/stores", perms: ["reviews.view"] },
      { label: "Seller Reviews", to: "/admin/reviews/sellers", perms: ["reviews.view"] },
      { label: "Buyer Reviews", to: "/admin/reviews/buyers", perms: ["reviews.view"] },
    ],
  },
  {
    label: "Support",
    icon: LifeBuoy,
    items: [
      { label: "Support Tickets", to: "/admin/support", perms: ["support.view"] },
      { label: "Safety Reports", to: "/admin/safety-reports", perms: ["safety.view"], icon: ShieldAlert },
      { label: "Complaints", to: "/admin/complaints", perms: ["support.view"] },
      { label: "Escalations", to: "/admin/escalations", perms: ["support.view"] },
      { label: "FAQ Management", to: "/admin/faq", perms: ["content.view"] },
    ],
  },
  {
    label: "Notifications",
    icon: Bell,
    items: [
      { label: "Centre", to: "/admin/notifications", perms: ["notifications.view"] },
      { label: "Broadcasts", to: "/admin/notifications/broadcasts", perms: ["notifications.send"] },
      { label: "Templates", to: "/admin/notification-templates", perms: ["notifications.view"] },
      { label: "Scheduled", to: "/admin/notifications/scheduled", perms: ["notifications.view"] },
      { label: "Promotional", to: "/admin/notifications/promotional", perms: ["notifications.send"] },
    ],
  },
  {
    label: "Content",
    icon: FileText,
    items: [
      { label: "Home Banners", to: "/admin/content/home", perms: ["content.view"] },
      { label: "Help Articles", to: "/admin/content/help", perms: ["content.view"] },
      { label: "Safety Content", to: "/admin/content/safety", perms: ["content.view"] },
      { label: "Legal Pages", to: "/admin/content/legal", perms: ["content.view"] },
      { label: "App Announcements", to: "/admin/content/announcements", perms: ["content.view"] },
      { label: "Featured Categories", to: "/admin/content/featured-categories", perms: ["content.view"] },
    ],
  },
  {
    label: "Analytics",
    icon: BarChart3,
    items: [
      { label: "Users", to: "/admin/analytics/users", perms: ["analytics.view"] },
      { label: "Listings", to: "/admin/analytics/listings", perms: ["analytics.view"] },
      { label: "Stores", to: "/admin/analytics/stores", perms: ["analytics.view"] },
      { label: "Advertisements", to: "/admin/analytics/ads", perms: ["analytics.view"] },
      { label: "Revenue", to: "/admin/analytics/revenue", perms: ["analytics.view"] },
      { label: "Location", to: "/admin/analytics/location", perms: ["analytics.view"] },
      { label: "Search", to: "/admin/analytics/search", perms: ["analytics.view"] },
    ],
  },
  {
    label: "Administration",
    icon: UserCog,
    items: [
      { label: "Admin Users", to: "/admin/admin-users", perms: ["admins.view"] },
      { label: "Roles & Permissions", to: "/admin/roles", perms: ["roles.view"] },
      { label: "Audit Logs", to: "/admin/audit-logs", perms: ["audit.view"], icon: ScrollText },
      { label: "System Settings", to: "/admin/settings", perms: ["settings.view"], icon: Settings },
      { label: "Feature Flags", to: "/admin/feature-flags", perms: ["featureflags.view"], icon: ToggleRight },
      { label: "API Configuration", to: "/admin/api-config", perms: ["settings.view"] },
      { label: "Maintenance Mode", to: "/admin/maintenance", perms: ["maintenance.toggle"], icon: Wrench },
    ],
  },
];
