import { Permission, PERMISSIONS } from "./permissions";
import { AdminRole } from "@/types/auth";

export interface RoleDefinition {
  name: AdminRole;
  description: string;
  permissions: Permission[];
  isSystem?: boolean;
}

export const ROLE_DEFINITIONS: Record<AdminRole, RoleDefinition> = {
  "Super Admin": {
    name: "Super Admin",
    description: "Full platform access and administration authority across all modules.",
    permissions: [...PERMISSIONS],
    isSystem: true,
  },
  "Platform Admin": {
    name: "Platform Admin",
    description: "Full management access for operations, content, users, listings, and support.",
    permissions: PERMISSIONS.filter(p => !p.startsWith("roles.") && !p.startsWith("admins.")),
    isSystem: true,
  },
  "Listing Moderator": {
    name: "Listing Moderator",
    description: "Moderation access for listings, categories, and content quality enforcement.",
    permissions: [
      "dashboard.view",
      "listings.view",
      "listings.approve",
      "listings.reject",
      "listings.request_changes",
      "listings.pause",
      "listings.remove",
      "listings.restore",
      "categories.view",
      "categories.create",
      "categories.edit",
      "reviews.view",
      "reviews.moderate",
    ],
  },
  "Store Moderator": {
    name: "Store Moderator",
    description: "Moderation and verification authority for seller stores and storefront products.",
    permissions: [
      "dashboard.view",
      "stores.view",
      "stores.approve",
      "stores.reject",
      "stores.verify",
      "stores.suspend",
      "users.view",
      "listings.view",
      "reviews.view",
    ],
  },
  "Advertisement Manager": {
    name: "Advertisement Manager",
    description: "Campaign approval, placement management, and promotion package controls.",
    permissions: [
      "dashboard.view",
      "ads.view",
      "ads.approve",
      "ads.reject",
      "ads.pause",
      "ads.manage_placements",
      "promotions.view",
      "promotions.manage",
      "analytics.view",
    ],
  },
  "Finance Manager": {
    name: "Finance Manager",
    description: "Financial ledger management, wallet adjustments, refund approvals, and invoices.",
    permissions: [
      "dashboard.view",
      "wallet.view",
      "wallet.adjust",
      "wallet.freeze",
      "payments.view",
      "refunds.view",
      "refunds.approve",
      "promotions.view",
      "promotions.refund",
      "analytics.view",
      "analytics.export",
      "audit.view",
    ],
  },
  "Support Agent": {
    name: "Support Agent",
    description: "Customer ticket resolution, user communication, and initial escalation.",
    permissions: [
      "dashboard.view",
      "support.view",
      "support.reply",
      "support.assign",
      "support.close",
      "users.view",
      "listings.view",
      "stores.view",
      "reviews.view",
    ],
  },
  "Safety and Fraud Officer": {
    name: "Safety and Fraud Officer",
    description: "Security investigation, account suspension, fraud prevention, and user restrictions.",
    permissions: [
      "dashboard.view",
      "safety.view",
      "safety.investigate",
      "safety.restrict",
      "safety.suspend",
      "users.view",
      "users.warn",
      "users.suspend",
      "users.ban",
      "users.verify",
      "wallet.freeze",
      "audit.view",
    ],
  },
  "Analytics Viewer": {
    name: "Analytics Viewer",
    description: "Read-only access to platform analytics, user trends, and revenue reporting.",
    permissions: [
      "dashboard.view",
      "analytics.view",
      "analytics.export",
      "users.view",
      "listings.view",
      "stores.view",
      "ads.view",
    ],
  },
};

export const hasPermission = (userPermissions: (Permission | string)[], requiredPermissions: Permission[]): boolean => {
  if (!userPermissions || userPermissions.length === 0) return false;
  if (userPermissions.includes("*") || userPermissions.includes("super_admin") || userPermissions.includes("ALL")) return true;
  if (userPermissions.includes("dashboard.view" as Permission) && requiredPermissions.length === 0) return true;
  return requiredPermissions.every(p => userPermissions.includes(p as Permission));
};
