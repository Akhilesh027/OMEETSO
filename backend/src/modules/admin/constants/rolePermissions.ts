export const ROLE_PERMISSIONS_MAP: Record<string, string[]> = {
  "Super Admin": ["*"],
  "Platform Admin": [
    "dashboard.view",
    "users.view", "users.edit", "users.warn", "users.suspend", "users.ban", "users.verify",
    "listings.view", "listings.approve", "listings.reject", "listings.request_changes", "listings.pause", "listings.remove", "listings.restore",
    "categories.view", "categories.create", "categories.edit", "categories.disable",
    "stores.view", "stores.approve", "stores.reject", "stores.verify", "stores.suspend",
    "safety.view", "safety.investigate", "safety.restrict", "safety.suspend",
    "promotions.view", "promotions.manage", "promotions.refund",
    "ads.view", "ads.approve", "ads.reject", "ads.pause", "ads.manage_placements",
    "wallet.view", "wallet.adjust", "wallet.freeze",
    "payments.view", "refunds.view", "refunds.approve",
    "reviews.view", "reviews.moderate",
    "support.view", "support.reply", "support.assign", "support.close",
    "notifications.view", "notifications.create", "notifications.schedule",
    "content.view", "content.edit", "content.publish",
    "analytics.view", "analytics.export",
    "settings.view", "settings.edit",
    "audit.view"
  ],
  "Listing Moderator": [
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
    "reviews.moderate"
  ],
  "Store Moderator": [
    "dashboard.view",
    "stores.view",
    "stores.approve",
    "stores.reject",
    "stores.verify",
    "stores.suspend",
    "users.view",
    "listings.view",
    "reviews.view"
  ],
  "Advertisement Manager": [
    "dashboard.view",
    "ads.view",
    "ads.approve",
    "ads.reject",
    "ads.pause",
    "ads.manage_placements",
    "promotions.view",
    "promotions.manage",
    "analytics.view"
  ],
  "Finance Manager": [
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
    "audit.view"
  ],
  "Support Agent": [
    "dashboard.view",
    "support.view",
    "support.reply",
    "support.assign",
    "support.close",
    "users.view",
    "listings.view",
    "stores.view",
    "reviews.view"
  ],
  "Safety and Fraud Officer": [
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
    "audit.view"
  ],
  "Analytics Viewer": [
    "dashboard.view",
    "analytics.view",
    "analytics.export",
    "users.view",
    "listings.view",
    "stores.view",
    "ads.view"
  ]
};

/**
 * Computes the unique union of permissions across all assigned roles plus custom permissions.
 * If any role is "Super Admin", automatically yields `["*"]`.
 */
export function computePermissionsForRoles(roles: string[], customPermissions: string[] = []): string[] {
  if (!roles || roles.length === 0) {
    return Array.from(new Set(customPermissions));
  }

  if (roles.includes("Super Admin")) {
    return ["*"];
  }

  const permSet = new Set<string>(customPermissions);
  for (const role of roles) {
    const rolePerms = ROLE_PERMISSIONS_MAP[role] || [];
    for (const p of rolePerms) {
      permSet.add(p);
    }
  }

  return Array.from(permSet);
}

