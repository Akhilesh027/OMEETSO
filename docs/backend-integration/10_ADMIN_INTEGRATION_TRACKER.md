# 10 — Admin Portal Integration Tracker

## Summary
This document tracks the refactoring of `admin/` pages, services, and route definitions to consume REST APIs instead of `MockDataService` and local browser storage.

---

## Route & Page Refactoring Matrix

| Admin Page | File | Current Service | Target REST API | Status |
|---|---|---|---|---|
| **Login** | `pages/auth/LoginPage.tsx` | `adminAuthService.login()` | `POST /api/v1/admin/auth/login` | PENDING |
| **2FA Verification** | `pages/auth/TwoFactorPage.tsx` | `adminAuthService.verify2FA()` | `POST /api/v1/admin/auth/two-factor/verify` | PENDING |
| **Dashboard** | `pages/dashboard/DashboardPage.tsx` | Hardcoded `data/dashboard.ts` | `GET /api/v1/admin/dashboard/summary` | PENDING |
| **Users List** | `pages/users/UsersListPage.tsx` | `MockDataService.getUsers()` | `GET /api/v1/admin/users` | PENDING |
| **User Action (Suspend/Ban)** | `pages/users/UsersListPage.tsx` | `MockDataService.updateUserStatus()` | `PATCH /api/v1/admin/users/:id/status` | PENDING |
| **Listings Moderation Queue** | `pages/listings/ListingsListPage.tsx` | `MockDataService.getListings()` | `GET /api/v1/admin/listings?status=PENDING_REVIEW` | PENDING |
| **Listing Moderation Action** | `pages/listings/ListingDetailPage.tsx` | `MockDataService.updateListingStatus()` | `PATCH /api/v1/admin/listings/:id/approve` | PENDING |
| **Store Applications Queue** | `pages/stores/StoresListPage.tsx` | `MockDataService.getStores()` | `GET /api/v1/admin/stores?status=SUBMITTED` | PENDING |
| **Store Verification Action** | `pages/stores/StoreDetailPage.tsx` | `MockDataService.updateStoreStatus()` | `PATCH /api/v1/admin/stores/:id/approve` | PENDING |
| **Safety Reports Queue** | `pages/safety/SafetyReportsPage.tsx` | `MockDataService.getSafetyReports()` | `GET /api/v1/admin/reports` | PENDING |
| **Ad Campaign Review** | `pages/promotions/PromotionsOverviewPage.tsx`, `pages/ads/AdsOverviewPage.tsx` | `adminAds.api.ts` | `PATCH /api/v1/admin/ad-campaigns/:id/approve` | COMPLETED |
| **Refunds Queue** | `pages/finance/RefundsPage.tsx` | `MockDataService.getRefunds()` | `GET /api/v1/admin/refunds` | PENDING |
| **Support Tickets Queue** | `pages/support/TicketsListPage.tsx` | `MockDataService.getTickets()` | `GET /api/v1/admin/support/tickets` | PENDING |
| **Audit Logs Page** | `pages/administration/AuditLogsPage.tsx` | `AuditLogService.getLogs()` | `GET /api/v1/admin/audit-logs` | PENDING |
| **Roles & Permissions** | `pages/administration/RolesPage.tsx` | In-memory `roles.ts` | `GET /api/v1/admin/roles` | PENDING |

---

## Mismatched Component Route Fixes (`AdminRoutes.tsx`)

The following route mappings in `admin/src/routes/AdminRoutes.tsx` must be corrected to point to dedicated page components instead of reusing unrelated page components:

| Route Path | Currently Points To | Correct Target Component | Status |
|---|---|---|---|
| `/admin/content` | `NotificationsPage.tsx` (wrong) | `ContentPage.tsx` | PENDING |
| `/admin/settings` | `RolesPage.tsx` (wrong) | `SettingsPage.tsx` | PENDING |
| `/admin/feature-flags` | `RolesPage.tsx` (wrong) | `FeatureFlagsPage.tsx` | PENDING |
| `/admin/maintenance` | `RolesPage.tsx` (wrong) | `MaintenancePage.tsx` | PENDING |
| `/admin/admin-users` | `UsersListPage.tsx` (wrong) | `AdminUsersPage.tsx` | PENDING |
