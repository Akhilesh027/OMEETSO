# 06 — Admin Feature Audit

## Summary
The admin portal is a well-structured multi-module admin dashboard. All data is powered by `MockDataService` which reads from and writes to localStorage. No backend integration exists. Permission-based access is enforced client-side only.

---

## Admin Module Table

| Admin Module | Route | File Path | Data Displayed | Available Actions | Data Source | Status | Missing Behaviour |
|---|---|---|---|---|---|---|---|
| Login | `/admin/login` | `pages/auth/LoginPage.tsx` | Email/password form | Login | `data/adminUsers.ts` | Mock auth | Real backend auth |
| 2FA | `/admin/two-factor` | `pages/auth/TwoFactorPage.tsx` | TOTP code form | Verify | Hardcoded `123456` | Mock | Real TOTP |
| Forgot Password | `/admin/forgot-password` | `pages/auth/ForgotPasswordPage.tsx` | Email form | Send reset link | None | UI only | Email service |
| Reset Password | `/admin/reset-password` | `pages/auth/ResetPasswordPage.tsx` | New password form | Submit | None | UI only | Password update API |
| Dashboard | `/admin/dashboard` | `pages/dashboard/DashboardPage.tsx` | 12 stat cards, user growth chart, listing moderation chart, revenue breakdown, safety report chart | View | `data/dashboard.ts` hardcoded | Mock data | Real analytics API |
| Live Activity | `/admin/dashboard/live-activity` | `pages/dashboard/LiveActivityPage.tsx` | Recent actions feed | View | `data/liveActivity.ts` | Hardcoded | Real-time events |
| Pending Actions | `/admin/dashboard/pending-actions` | `pages/dashboard/PendingActionsPage.tsx` | Items needing action | View, Navigate | `data/pendingActions.ts` | Hardcoded | Real pending queue |
| Critical Alerts | `/admin/dashboard/critical-alerts` | `pages/dashboard/CriticalAlertsPage.tsx` | Critical issues | View | `data/criticalAlerts.ts` | Hardcoded | Real alert system |
| User Management | `/admin/users` | `pages/users/UsersListPage.tsx` | User table with filters, search | View, Suspend, Ban, Verify, Warn | `MockDataService.getUsers()` | Mock CRUD (localStorage) | Real user API |
| Listing Management | `/admin/listings` | `pages/listings/ListingsListPage.tsx` | Listing table with status filters | View, Approve, Reject, Request Changes, Pause, Remove | `MockDataService.getListings()` | Mock CRUD (localStorage) | Real listing API |
| Listing Detail | `/admin/listings/:id` | `pages/listings/ListingDetailPage.tsx` | Full listing view with images | Approve, Reject, Request Changes, Assign | `MockDataService.getListings()` | Mock CRUD | Real listing + moderation API |
| Category Management | `/admin/categories` | `pages/categories/CategoriesPage.tsx` | Categories, subcategories, attributes | Add, Edit, Disable category | `data/categorySchema.ts` | Mock (no persistence tested) | Category CRUD API |
| Store Management | `/admin/stores` | `pages/stores/StoresListPage.tsx` | Store table | View, Approve, Reject, Suspend | `MockDataService.getStores()` | Mock CRUD | Real store API |
| Store Detail | `/admin/stores/:id` | `pages/stores/StoreDetailPage.tsx` | Full store review | Verify, Approve, Reject, Suspend | `MockDataService.getStores()` | Mock CRUD | Real store moderation API |
| Store Products | `/admin/store-products/:id` | `pages/stores/StoreProductDetailPage.tsx` | Product detail | Review, Approve, Remove | Mock service | Mock | Product moderation API |
| Safety Reports | `/admin/safety-reports` | `pages/safety/SafetyReportsPage.tsx` | Reports table with filters | View, Investigate, Take Action, Dismiss | `MockDataService.getSafetyReports()` | Mock CRUD | Real reports API |
| Promotions Overview | `/admin/promotions` | `pages/promotions/PromotionsOverviewPage.tsx` | Promotion stats cards | View | `services/promotionsDataService.ts` | Mock data | Real promotions API |
| Promotions List | `/admin/promotions/*` | `pages/promotions/PromotionsListPage.tsx` | Promotion table with filter | View, Approve, Reject, Pause | Mock service | Mock CRUD | Real promotion management API |
| Promotion Review | `/admin/promotions/:id` | `pages/promotions/PromotionReviewPage.tsx` | Promotion detail | Approve, Reject, Comment | Mock service | Mock CRUD | Real promotion review API |
| Promotion Packages | `/admin/promotions/packages` | `pages/promotions/PromotionPackagesPage.tsx` | Package list and editor | Create, Edit, Delete | Mock data (hardcoded packages) | Mock | Real package CRUD API |
| Promotion Placements | `/admin/promotions/placements` | `pages/promotions/PromotionPlacementsPage.tsx` | Placement configuration | Edit placements | Mock data | Mock | Real placement API |
| Ads Overview | `/admin/ads` | `pages/ads/AdsOverviewPage.tsx` | Campaign stats | View | `services/adsDataService.ts` | Mock data | Real ads API |
| Ad Campaigns | `/admin/ads/campaigns` | `pages/ads/AdCampaignsListPage.tsx` | Campaign table | View, Approve, Reject, Pause | Mock service | Mock CRUD | Real campaign API |
| Ad Campaign Review | `/admin/ads/:id` | `pages/ads/AdCampaignReviewPage.tsx` | Campaign detail | Approve, Reject, Comment | Mock service | Mock CRUD | Real campaign review API |
| Ad Placements | `/admin/ads/placements/*` | `pages/ads/AdPlacementsPage.tsx` | Placement list and editor | Create, Edit, Delete, Toggle | Mock service | Mock | Real placement API |
| Advertisers | `/admin/advertisers` | `pages/ads/AdvertisersPage.tsx` | Advertiser accounts | View | None | **STUB** | Real advertisers API |
| Finance / Wallets | `/admin/wallets` | `pages/finance/RefundsPage.tsx` | Wallet list | View, Adjust, Freeze | Mock service | Mock | Real wallet API |
| Refunds | `/admin/refunds` | `pages/finance/RefundsPage.tsx` | Refund requests | Approve, Reject, Process | `MockDataService.getRefunds()` | Mock CRUD | Real refunds API |
| Reviews | `/admin/reviews` | `pages/reviews/ReviewsPage.tsx` | Review list | Moderate, Remove, Respond | Mock service | Mock CRUD | Real reviews API |
| Support Tickets | `/admin/support` | `pages/support/TicketsListPage.tsx` | Ticket table | Reply, Assign, Close, Escalate | Mock service | Mock CRUD | Real support API |
| Notifications | `/admin/notifications` | `pages/notifications/NotificationsPage.tsx` | Notification list + composer | Send, Schedule | Mock service | Mock | Real push notification API |
| Analytics | `/admin/analytics` | `pages/analytics/AnalyticsPage.tsx` | Analytics placeholder | View | None | **STUB** | Real analytics API |
| Audit Logs | `/admin/audit-logs` | `pages/administration/AuditLogsPage.tsx` | Action logs table | View, Filter, Export | `AuditLogService` (localStorage) | Real during session | Persistent audit log API |
| Roles | `/admin/roles` | `pages/administration/RolesPage.tsx` | Role and permission editor | View, Edit permissions | `permissions/roles.ts` | Mock CRUD | Real RBAC API |
| Settings | `/admin/settings` | `pages/administration/RolesPage.tsx` | Platform settings | — | None | **WRONG PAGE** | Settings API |
| Content | `/admin/content` | `pages/notifications/NotificationsPage.tsx` | Content management | — | None | **WRONG PAGE** | Content management API |

---

## Admin Action Button Audit

| Action | Where | Behaviour | Verdict |
|---|---|---|---|
| Approve Listing | `ListingDetailPage.tsx` | Updates localStorage via `MockDataService.updateListingStatus()`, logs to audit | LOCAL MOCK — does not reach user portal |
| Reject Listing | `ListingDetailPage.tsx` | Updates localStorage, shows reason form | LOCAL MOCK |
| Suspend User | `UsersListPage.tsx` | Updates localStorage via `MockDataService.updateUserStatus()`, logs to audit | LOCAL MOCK |
| Ban User | `UsersListPage.tsx` | Same as suspend | LOCAL MOCK |
| Verify User | `UsersListPage.tsx` | Toggles verification field in localStorage | LOCAL MOCK |
| Approve Store | `StoreDetailPage.tsx` | Updates store status in localStorage | LOCAL MOCK |
| Approve Campaign | `AdCampaignReviewPage.tsx` | Updates campaign status in localStorage | LOCAL MOCK |
| Reject Promotion | `PromotionReviewPage.tsx` | Updates promotion status in localStorage | LOCAL MOCK |
| Send Notification | `NotificationsPage.tsx` | Shows success toast, does not actually send | UI ONLY |
| Adjust Wallet | `RefundsPage.tsx` | Updates wallet amount in localStorage | LOCAL MOCK |
| Approve Refund | `RefundsPage.tsx` | Updates refund status in localStorage | LOCAL MOCK |
| Moderate Review | `ReviewsPage.tsx` | Updates review status in localStorage | LOCAL MOCK |
| Close Ticket | `TicketsListPage.tsx` | Updates ticket status in localStorage | LOCAL MOCK |
| Create Category | `CategoriesPage.tsx` | Updates in-memory state | LOCAL ONLY — no localStorage write confirmed |
| Edit Role | `RolesPage.tsx` | Updates in-memory state | LOCAL ONLY |
| Export | Multiple pages | Shows toast "Export started" | UI ONLY |

---

## Dashboard Statistics

| Metric | Source | Value | Real or Mock |
|---|---|---|---|
| Total Users | `data/dashboard.ts` | "148,290" | **HARDCODED** |
| Active Users (DAU) | `data/dashboard.ts` | "32,450" | **HARDCODED** |
| New Users Today | `data/dashboard.ts` | "1,240" | **HARDCODED** |
| Active Listings | `data/dashboard.ts` | "45,820" | **HARDCODED** |
| Pending Listings | `data/dashboard.ts` | "184" | **HARDCODED** |
| Verified Stores | `data/dashboard.ts` | "2,410" | **HARDCODED** |
| Store Applications | `data/dashboard.ts` | "42" | **HARDCODED** |
| Active Campaigns | `data/dashboard.ts` | "318" | **HARDCODED** |
| Monthly Revenue | `data/dashboard.ts` | "₹24,85,400" | **HARDCODED** |
| Open Support Tickets | `data/dashboard.ts` | "67" | **HARDCODED** |
| Critical Safety Reports | `data/dashboard.ts` | "8" | **HARDCODED** |
| User Growth Chart | `data/dashboard.ts` | 7 days hardcoded data | **HARDCODED** |
| Listing Moderation Chart | `data/dashboard.ts` | 7 months hardcoded | **HARDCODED** |
| Revenue Breakdown Chart | `data/dashboard.ts` | 4 categories hardcoded | **HARDCODED** |

---

## Permission System

The admin portal has a well-designed **9-role RBAC system** with 84 granular permissions:

| Role | Key Permissions | Access |
|---|---|---|
| Super Admin | All 84 permissions | Full platform |
| Platform Admin | All except roles/admins management | Almost full |
| Listing Moderator | listings.*, categories.*, reviews.view | Listing moderation |
| Store Moderator | stores.*, users.view, reviews.view | Store moderation |
| Advertisement Manager | ads.*, promotions.*, analytics.view | Ad management |
| Finance Manager | wallet.*, payments.*, refunds.*, analytics.* | Finance |
| Support Agent | support.*, users.view, listings.view | Customer support |
| Safety and Fraud Officer | safety.*, users.(warn/suspend/ban/verify), wallet.freeze | Safety |
| Analytics Viewer | analytics.*, users/listings/stores/ads.view | Read-only analytics |

**Critical issue:** These permissions are enforced **client-side only** via `PermissionRoute` component. Any user who knows the URL can bypass them by direct navigation.
