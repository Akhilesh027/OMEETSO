# 04 — Admin Portal Routes

**Router:** React Router v6
**Route Definition File:** `admin/src/routes/AdminRoutes.tsx`
**Total Admin Routes:** ~80 defined routes

## Admin Route Table

| Route | Page Name | File Path | Purpose | Required Permission | Data Source | Status |
|---|---|---|---|---|---|---|
| `/admin/login` | Login | `pages/auth/LoginPage.tsx` | Email + password login | None (public) | `data/adminUsers.ts` (mock) | Mock auth |
| `/admin/forgot-password` | Forgot Password | `pages/auth/ForgotPasswordPage.tsx` | Password reset request | None | None | UI only, no email |
| `/admin/reset-password` | Reset Password | `pages/auth/ResetPasswordPage.tsx` | New password form | None | None | UI only, no real reset |
| `/admin/two-factor` | 2FA Verify | `pages/auth/TwoFactorPage.tsx` | TOTP code entry (hardcoded: `123456`) | None | localStorage | Mock — any `123456` works |
| `/admin/session-expired` | Session Expired | `pages/auth/SessionExpiredPage.tsx` | Session timeout notice | None | None | Informational |
| `/admin/account-locked` | Account Locked | `pages/auth/AccountLockedPage.tsx` | Locked account notice | None | localStorage | Functional |
| `/admin/access-denied` | Access Denied | `pages/auth/AccessDeniedPage.tsx` | Insufficient permissions | None | None | Informational |
| `/admin/dashboard` | Dashboard | `pages/dashboard/DashboardPage.tsx` | Main stats + charts | `dashboard.view` | `data/dashboard.ts` (hardcoded) | Mock data |
| `/admin/dashboard/live-activity` | Live Activity | `pages/dashboard/LiveActivityPage.tsx` | Real-time activity feed | `dashboard.view` | `data/liveActivity.ts` | Hardcoded |
| `/admin/dashboard/pending-actions` | Pending Actions | `pages/dashboard/PendingActionsPage.tsx` | Items requiring attention | `dashboard.view` | `data/pendingActions.ts` | Hardcoded |
| `/admin/dashboard/critical-alerts` | Critical Alerts | `pages/dashboard/CriticalAlertsPage.tsx` | Critical issue alerts | `dashboard.view` | `data/criticalAlerts.ts` | Hardcoded |
| `/admin/users` | Users List | `pages/users/UsersListPage.tsx` | All users | `users.view` | `services/mockDataService.ts` | Mock CRUD |
| `/admin/users/buyers` | Buyers | `pages/users/UsersListPage.tsx` | Buyer-type users | `users.view` | Mock service | Filtered mock |
| `/admin/users/sellers` | Sellers | `pages/users/UsersListPage.tsx` | Seller-type users | `users.view` | Mock service | Filtered mock |
| `/admin/users/business-sellers` | Business Sellers | `pages/users/UsersListPage.tsx` | Business account users | `users.view` | Mock service | Filtered mock |
| `/admin/users/suspended` | Suspended Users | `pages/users/UsersListPage.tsx` | Suspended accounts | `users.view` | Mock service | Filtered mock |
| `/admin/users/blocked` | Blocked Users | `pages/users/UsersListPage.tsx` | Blocked accounts | `users.view` | Mock service | Filtered mock |
| `/admin/users/:userId` | User Detail | `pages/users/UsersListPage.tsx` | Single user profile | `users.view` | Mock service | Same page component |
| `/admin/users/:userId/activity` | User Activity | `pages/users/UsersListPage.tsx` | User activity log | `users.view` | Mock service | Same page component |
| `/admin/users/:userId/verification` | User Verification | `pages/users/UsersListPage.tsx` | User verification status | `users.view` | Mock service | Same page component |
| `/admin/listings` | Listings List | `pages/listings/ListingsListPage.tsx` | All listings | `listings.view` | Mock service | Mock CRUD |
| `/admin/listings/pending` | Pending Listings | `pages/listings/ListingsListPage.tsx` | Awaiting review | `listings.view` | Mock service | Filtered mock |
| `/admin/listings/assigned` | Assigned Listings | `pages/listings/ListingsListPage.tsx` | Assigned to moderator | `listings.view` | Mock service | Filtered mock |
| `/admin/listings/reported` | Reported Listings | `pages/listings/ListingsListPage.tsx` | Reported listings | `listings.view` | Mock service | Filtered mock |
| `/admin/listings/requires-changes` | Needs Changes | `pages/listings/ListingsListPage.tsx` | Change requested | `listings.view` | Mock service | Filtered mock |
| `/admin/listings/rejected` | Rejected Listings | `pages/listings/ListingsListPage.tsx` | Rejected listings | `listings.view` | Mock service | Filtered mock |
| `/admin/listings/removed` | Removed Listings | `pages/listings/ListingsListPage.tsx` | Removed listings | `listings.view` | Mock service | Filtered mock |
| `/admin/listings/expired` | Expired Listings | `pages/listings/ListingsListPage.tsx` | Expired listings | `listings.view` | Mock service | Filtered mock |
| `/admin/listings/:listingId` | Listing Detail | `pages/listings/ListingDetailPage.tsx` | Full listing review | `listings.view` | Mock service | Mock CRUD |
| `/admin/categories` | Categories | `pages/categories/CategoriesPage.tsx` | Category management | `categories.view` | `data/categorySchema.ts` | Mock CRUD |
| `/admin/attributes` | Attributes | `pages/categories/CategoriesPage.tsx` | Attribute management | `categories.view` | `data/categorySchema.ts` | Same page |
| `/admin/filters` | Filters | `pages/categories/CategoriesPage.tsx` | Filter management | `categories.view` | `data/categorySchema.ts` | Same page |
| `/admin/prohibited-keywords` | Keywords | `pages/categories/CategoriesPage.tsx` | Prohibited keywords | `categories.view` | None | Same page, no data |
| `/admin/stores` | Stores List | `pages/stores/StoresListPage.tsx` | All stores | `stores.view` | Mock service | Mock CRUD |
| `/admin/stores/applications` | Store Applications | `pages/stores/StoresListPage.tsx` | New store requests | `stores.view` | Mock service | Filtered mock |
| `/admin/stores/verified` | Verified Stores | `pages/stores/StoresListPage.tsx` | Verified stores | `stores.view` | Mock service | Filtered mock |
| `/admin/stores/rejected` | Rejected Stores | `pages/stores/StoresListPage.tsx` | Rejected stores | `stores.view` | Mock service | Filtered mock |
| `/admin/stores/reported` | Reported Stores | `pages/stores/StoresListPage.tsx` | Reported stores | `stores.view` | Mock service | Filtered mock |
| `/admin/stores/:storeId` | Store Detail | `pages/stores/StoreDetailPage.tsx` | Full store review | `stores.view` | Mock service | Mock CRUD |
| `/admin/stores/:storeId/products` | Store Products | `pages/stores/StoreDetailPage.tsx` | Store product list | `stores.view` | Mock service | Same page |
| `/admin/store-products/:productId` | Product Detail | `pages/stores/StoreProductDetailPage.tsx` | Store product detail | `stores.view` | Mock service | Mock CRUD |
| `/admin/safety-reports` | Safety Reports | `pages/safety/SafetyReportsPage.tsx` | Reports list | `safety.view` | Mock service | Mock CRUD |
| `/admin/safety-reports/:reportId` | Report Detail | `pages/safety/SafetyReportsPage.tsx` | Single report | `safety.view` | Mock service | Same page |
| `/admin/chat-reports` | Chat Reports | `pages/safety/SafetyReportsPage.tsx` | Chat-related reports | `safety.view` | Mock service | Same page |
| `/admin/message-reports` | Message Reports | `pages/safety/SafetyReportsPage.tsx` | Message reports | `safety.view` | Mock service | Same page |
| `/admin/offer-disputes` | Offer Disputes | `pages/safety/SafetyReportsPage.tsx` | Offer disputes | `safety.view` | Mock service | Same page |
| `/admin/investigations` | Investigations | `pages/safety/SafetyReportsPage.tsx` | Active investigations | `safety.view` | Mock service | Same page |
| `/admin/promotions` | Promotions Overview | `pages/promotions/PromotionsOverviewPage.tsx` | Promotion stats | `promotions.view` | `services/promotionsDataService.ts` | Mock data |
| `/admin/promotions/active` | Active Promotions | `pages/promotions/PromotionsListPage.tsx` | Active list | `promotions.view` | Mock service | Mock CRUD |
| `/admin/promotions/pending` | Pending Promotions | `pages/promotions/PromotionsListPage.tsx` | Pending approval | `promotions.view` | Mock service | Mock CRUD |
| `/admin/promotions/listings` | Listing Promotions | `pages/promotions/PromotionsListPage.tsx` | Listing-type promos | `promotions.view` | Mock service | Mock |
| `/admin/promotions/stores` | Store Promotions | `pages/promotions/PromotionsListPage.tsx` | Store-type promos | `promotions.view` | Mock service | Mock |
| `/admin/promotions/packages` | Promo Packages | `pages/promotions/PromotionPackagesPage.tsx` | Package configuration | `promotions.view` | Mock data | Mock |
| `/admin/promotions/placements` | Promo Placements | `pages/promotions/PromotionPlacementsPage.tsx` | Placement management | `promotions.view` | Mock data | Mock |
| `/admin/promotions/:promotionId` | Promotion Review | `pages/promotions/PromotionReviewPage.tsx` | Review/approve/reject | `promotions.view` | Mock service | Mock CRUD |
| `/admin/ads` | Ads Overview | `pages/ads/AdsOverviewPage.tsx` | Campaign stats | `ads.view` | `services/adsDataService.ts` | Mock data |
| `/admin/ads/campaigns` | Campaigns | `pages/ads/AdCampaignsListPage.tsx` | All campaigns | `ads.view` | Mock service | Mock |
| `/admin/ads/review` | Under Review | `pages/ads/AdCampaignsListPage.tsx` | Awaiting review | `ads.view` | Mock service | Mock |
| `/admin/ads/active` | Active Campaigns | `pages/ads/AdCampaignsListPage.tsx` | Active campaigns | `ads.view` | Mock service | Mock |
| `/admin/ads/placements/website` | Web Placements | `pages/ads/AdPlacementsPage.tsx` | Website ad placements | `ads.view` | Mock service | Mock |
| `/admin/ads/placements/app` | App Placements | `pages/ads/AdPlacementsPage.tsx` | Mobile app placements | `ads.view` | Mock service | Mock |
| `/admin/advertisers` | Advertisers | `pages/ads/AdvertisersPage.tsx` | Advertiser accounts | `ads.view` | Mock service | **STUB** |
| `/admin/ads/:campaignId` | Campaign Review | `pages/ads/AdCampaignReviewPage.tsx` | Review campaign | `ads.view` | Mock service | Mock CRUD |
| `/admin/wallets` | Wallets | `pages/finance/RefundsPage.tsx` | Wallet management | `wallet.view` | Mock service | Mock |
| `/admin/transactions` | Transactions | `pages/finance/RefundsPage.tsx` | Transaction list | `payments.view` | Mock service | Same page |
| `/admin/payments` | Payments | `pages/finance/RefundsPage.tsx` | Payment list | `payments.view` | Mock service | Same page |
| `/admin/refunds` | Refunds | `pages/finance/RefundsPage.tsx` | Refund requests | `refunds.view` | Mock service | Mock CRUD |
| `/admin/reviews` | Reviews | `pages/reviews/ReviewsPage.tsx` | Review moderation | `reviews.view` | Mock service | Mock CRUD |
| `/admin/support` | Support Tickets | `pages/support/TicketsListPage.tsx` | All tickets | `support.view` | Mock service | Mock CRUD |
| `/admin/support/:ticketId` | Ticket Detail | `pages/support/TicketsListPage.tsx` | Single ticket | `support.view` | Mock service | Same page |
| `/admin/notifications` | Notifications | `pages/notifications/NotificationsPage.tsx` | Send notifications | `notifications.view` | Mock | Mock |
| `/admin/content` | Content | `pages/notifications/NotificationsPage.tsx` | Content management | `content.view` | None | **REUSES wrong page** |
| `/admin/analytics` | Analytics | `pages/analytics/AnalyticsPage.tsx` | Platform analytics | `analytics.view` | Hardcoded + mock | Mock charts |
| `/admin/roles` | Roles | `pages/administration/RolesPage.tsx` | Role management | `roles.view` | `permissions/roles.ts` | Mock CRUD |
| `/admin/settings` | Settings | `pages/administration/RolesPage.tsx` | Platform settings | `settings.view` | None | **REUSES wrong page** |
| `/admin/audit-logs` | Audit Logs | `pages/administration/AuditLogsPage.tsx` | Audit trail | `audit.view` | localStorage | Real logs (written during session) |
| `/admin/admin-users` | Admin Users | `pages/users/UsersListPage.tsx` | Admin user accounts | `admins.view` | Mock service | **REUSES wrong page** |
| `*` | 404 | `pages/NotFoundPage.tsx` | Catch-all | None | None | Functional |

---

## Multiple Routes Sharing Same Page Component (Problem)

Several routes map to the wrong/reused page components:

| Routes | Incorrectly Using |
|---|---|
| `/admin/content/*` | `NotificationsPage.tsx` (wrong) |
| `/admin/settings/*` | `RolesPage.tsx` (wrong) |
| `/admin/feature-flags` | `RolesPage.tsx` (wrong) |
| `/admin/maintenance` | `RolesPage.tsx` (wrong) |
| `/admin/admin-users` | `UsersListPage.tsx` (partially correct) |
| `/admin/login-activity` | `AuditLogsPage.tsx` (correct) |

---

## Admin Authentication

- **Dev bypass:** `adminAuthService.ts` line 220 — if no session exists, auto-creates Super Admin session and returns `authenticated`
- **Effect:** Anyone who opens the admin URL while in development gets full Super Admin access without logging in
- **2FA code:** Hardcoded `123456` or backup `BACKUP-999`
- **Permission checks:** Done client-side only — no server validation

---

## Routes Without Dedicated Pages (Placeholder)

- `/admin/prohibited-keywords` — no real data
- `/admin/ads/creatives`, `/admin/ads/targeting`, `/admin/ads/pricing` — all mapped to `AdvertisersPage.tsx` stub
- `/admin/promotions/discounts`, `/admin/promotions/refunds`, `/admin/promotions/settings` — all mapped to `PromotionPlacementsPage.tsx`
