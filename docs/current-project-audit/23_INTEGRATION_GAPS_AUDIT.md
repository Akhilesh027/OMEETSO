# 23 — Integration Gaps and Synchronization Audit

## Summary
This document analyzes the isolation between the User Frontend Portal and the Admin Portal, mapping all data sync failures, broken linkages, and integration gaps.

---

## 1. Portal Isolation Matrix

The repository contains two distinct web applications (`frontend/` and `admin/`). They operate as completely disjointed islands:

```
[ User Portal (Port A) ]                           [ Admin Portal (Port B) ]
        │                                                     │
   Reads / Writes                                        Reads / Writes
        │                                                     │
        ▼                                                     ▼
( User LocalStorage )                             ( Admin LocalStorage )
  - omeetso_user_listings                           - omeetso_admin_data_listings_v2
  - omeetso_user_stores                             - omeetso_admin_data_stores_v2
  - omeetso_ad_campaigns                            - omeetso_admin_data_campaigns_v2
  - omeetso_chat_threads                            - omeetso_admin_data_tickets_v2
  - omeetso_wallet                                  - omeetso_admin_data_safety_v2
```

---

## 2. Synchronization Breakdowns by Domain

### A. Listing Moderation Sync Gap
- **User Action**: User submits a new listing on `/sell/quick` or `/sell/detailed`.
- **User State**: Saved to `omeetso_user_listings` with status `"active"` or `"under_review"`.
- **Admin Reality**: Admin portal reads `omeetso_admin_data_listings_v2`. The user's new listing **never appears** in `/admin/listings/pending`.
- **Admin Action**: Admin approves or rejects a listing on `/admin/listings/:id`.
- **Admin State**: Status updated in `omeetso_admin_data_listings_v2`.
- **User Reality**: User portal never reads admin storage. The user is unaware of approval/rejection; their listing status remains unchanged.

### B. Store Verification Sync Gap
- **User Action**: Business user creates a store on `/store/create`.
- **User State**: Saved to `omeetso_user_stores` with status `"under_review"`.
- **Admin Reality**: Does not appear in `/admin/stores/applications`.
- **Admin Action**: Admin verifies store GST/Identity on `/admin/stores/:id`.
- **User Reality**: Store verification status on `/account/verification` never updates.

### C. Advertisement & Promotion Sync Gap
- **User Action**: User creates an ad campaign on `/ads/new` or boosts a listing on `/promotions/new`.
- **User State**: Wallet debited locally (`omeetso_wallet`); campaign saved to `omeetso_ad_campaigns`.
- **Admin Reality**: Admin ads overview (`/admin/ads`) displays static hardcoded metrics. The new campaign does not appear in `/admin/ads/review`.
- **Ad Display Engine**: Banner components (`AdBanner.tsx`) display items from static `lib/mock.ts`. Newly created ads are never injected into the live feed.

### D. Safety Reports & Moderation Sync Gap
- **User Action**: User reports an item/seller via `/safety/report` or `/chat/safety`.
- **User State**: Report appended to `omeetso_safety_reports` in user storage.
- **Admin Reality**: Does not appear in `/admin/safety-reports`. Admin safety officer cannot investigate or act on user reports.

### E. User Suspension & Account Enforcement Sync Gap
- **Admin Action**: Admin bans or suspends a user in `/admin/users`.
- **Admin State**: User status set to `suspended` in `omeetso_admin_data_users_v2`.
- **User Reality**: The targeted user can continue browsing, posting listings, and sending messages unimpeded.

### F. Support Ticket Sync Gap
- **User Action**: User submits a support ticket on `/support/new`.
- **User State**: Stored in `omeetso_support_tickets`.
- **Admin Reality**: Does not appear in `/admin/support`. Admin support agents see only hardcoded mock tickets.

---

## 3. Data Model Divergence Summary

Beyond storage isolation, the data schemas themselves have diverged between the two codebase folders:

| Entity | User Portal Field | Admin Portal Field | Divergence Issue |
|---|---|---|---|
| **Listing Price** | `price: number` (INR) | `priceInPaise: number` | Unit mismatch (Rupees vs. Paise) |
| **Listing Status** | `ListingStatus` (9 values) | `ListingModerationStatus` (16 values) | State machine mismatch |
| **User Verification** | `VerificationMap` object | `verifiedIdentity: boolean`, etc. | Data structure mismatch |
| **Timestamps** | `number` (Epoch ms) | `string` (ISO 8601) | Type mismatch |

---

## 4. Required Unified API Integration Strategy

To bridge these gaps, a single unified backend API must be built:

```
                          [ Node.js / Express Backend API ]
                                       │
                         ┌─────────────┴─────────────┐
                         ▼                           ▼
              [ User Web / Mobile App ]      [ Admin Portal App ]
```

Both applications must throw away local storage state handlers and consume identical REST API endpoints.
