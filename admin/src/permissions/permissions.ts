export const PERMISSIONS = [
  "dashboard.view",

  "users.view",
  "users.edit",
  "users.warn",
  "users.suspend",
  "users.ban",
  "users.verify",

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
  "categories.disable",

  "stores.view",
  "stores.approve",
  "stores.reject",
  "stores.verify",
  "stores.suspend",

  "safety.view",
  "safety.investigate",
  "safety.restrict",
  "safety.suspend",

  "promotions.view",
  "promotions.manage",
  "promotions.refund",

  "ads.view",
  "ads.approve",
  "ads.reject",
  "ads.pause",
  "ads.manage_placements",

  "wallet.view",
  "wallet.adjust",
  "wallet.freeze",

  "payments.view",
  "refunds.view",
  "refunds.approve",

  "reviews.view",
  "reviews.moderate",

  "support.view",
  "support.reply",
  "support.assign",
  "support.close",

  "notifications.view",
  "notifications.create",
  "notifications.schedule",

  "content.view",
  "content.edit",
  "content.publish",

  "analytics.view",
  "analytics.export",

  "admins.view",
  "admins.create",
  "admins.edit",
  "admins.disable",

  "roles.view",
  "roles.edit",

  "settings.view",
  "settings.edit",

  "audit.view",
] as const;

export type Permission = (typeof PERMISSIONS)[number] | (string & {});
