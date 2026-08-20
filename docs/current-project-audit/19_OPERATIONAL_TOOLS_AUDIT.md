# 19 — Operational and Administrative Tools Audit

## Summary
This document audits the operational, administrative, background processing, reporting, and audit logging tools present in the current codebase.

---

## 1. Audit Logging System

### Operational Status
- **Implementation**: Fully implemented on frontend client-side (`admin/src/services/auditLogService.ts`).
- **Storage**: `localStorage` key `omeetso_admin_audit_logs`.
- **Pre-seeded Logs**: 5 mock entries in `admin/src/data/auditLogs.ts`.
- **Triggers**: Actions like suspending users, approving/rejecting listings, freezing wallets, and admin logons automatically trigger `AuditLogService.logAction()`.

### Limitations
- Logs are strictly local to the individual admin's browser session.
- No central aggregation or log rotation.
- Clearing browser storage wipes all audit history.
- No export or filtering by IP / date range backend API.

---

## 2. Analytics and Reporting Tools

### Dashboard Charts (`admin/src/pages/dashboard/DashboardPage.tsx`)
- **User Growth Chart**: Uses Recharts to display 7-day user trends (Buyers vs. Sellers). Hardcoded in `admin/src/data/dashboard.ts`.
- **Listing Moderation Chart**: Visualizes approved vs. rejected vs. changes-requested listings over 7 months. Hardcoded.
- **Revenue Breakdown Chart**: Pie/Bar chart showing revenue distribution across Boosts, Store Subscriptions, Banners, and Featured Placements. Hardcoded.
- **Safety Severity Distribution**: Visualizes safety reports by severity level. Hardcoded.

### Reports & Export Tools
- **CSV / PDF Export Buttons**: Present on pages like `AuditLogsPage.tsx`, `AnalyticsPage.tsx`, and `RefundsPage.tsx`.
- **Execution**: Mock function — triggers a Sonner toast message `"Export started..."`, but does not generate or download any file.

---

## 3. Background Jobs and Automated Tasks

### Automated Task Capabilities
- **Notification Scheduling**: UI in `admin/src/pages/notifications/NotificationsPage.tsx` allows setting scheduled timestamps for push notifications.
- **Listing Expiry & Auto-Renewal**: Logic exists in `frontend/src/lib/listings.ts` to calculate 30-day listing expiry.
- **Ad Impression Tracking**: Event tracking functions in `frontend/src/lib/ads.ts` write to `localStorage`.

### Real Execution
- **Cron Jobs / Workers**: ZERO background workers, Redis queues, or cron scripts exist.
- **Scheduler**: Scheduled notifications and automated listing expirations do not execute unless a client manually loads the page and triggers a client-side check.

---

## 4. Moderation & Operations Queues

### Moderation Workflow Tools
- **Listing Moderation Queue**: Dedicated queue interfaces under `/admin/listings/pending` and `/admin/listings/assigned`.
- **Store Application Queue**: Dedicated interface under `/admin/stores/applications`.
- **Ad Review Queue**: Interface under `/admin/ads/review`.
- **Safety Investigation Queue**: Managed under `/admin/safety-reports`.

### Limitations
- Queue items are static or read from `localStorage`.
- No lock mechanism (two moderators could theoretically work on the same item).
- No SLA timers or escalation automation.

---

## 5. System Configuration & Feature Flags

### Feature Flag Manager (`admin/src/services/mockDataService.ts`)
- **Flags Defined**:
  - `maintenanceMode`: boolean
  - `adBoostingEnabled`: boolean
  - `autoGstinVerification`: boolean
  - `platformFeePercent`: number
- **Storage**: `localStorage` key `omeetso_admin_data_feature_flags_v2`.
- **Usage**: Managed via UI, but changes do not affect real user behavior on the frontend due to portal isolation.
