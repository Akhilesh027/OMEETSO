# 07 — Mock Data Inventory

## Summary
The project relies entirely on mock data for all content. No real backend data is used anywhere in either portal.

---

## Frontend Mock Data Files

### `frontend/src/lib/mock.ts` — Master Mock Data (505 lines, 21.9KB)

| Mock Data Name | Type | Records | Used By |
|---|---|---|---|
| CATEGORIES | Category[] | 15 | `routes/home.tsx`, `routes/categories.tsx`, `routes/category.$id.tsx`, `routes/results.tsx`, `routes/sell.quick.tsx` |
| SUBCATEGORIES | Record<string, string[]> | 15 keys, 5 values each | Sell forms, filter pages |
| SELLERS | Seller[] | 4 | `routes/product.$id.tsx`, `routes/seller.$id.tsx`, `lib/chat.ts` |
| STORES | Store[] | 4 | `routes/store.$id.tsx`, `routes/stores.tsx`, `lib/chat.ts` |
| PRODUCTS | Product[] | 15 + 2 sponsored | `routes/home.tsx`, `routes/results.tsx`, `routes/product.$id.tsx`, `lib/chat.ts` |
| CHATS | ChatThread[] | 3 | Deprecated (replaced by lib/chat.ts) |
| MESSAGES | Record<ID, Message[]> | 3 threads, 4 messages each | Deprecated |
| NOTIFICATIONS | Notification[] | 5 | Deprecated (replaced by lib/account.ts) |
| AREAS | string[] | 12 areas | Location selector |
| AREA_PINCODES | Record<string, string> | 12 | Location selector |
| TRENDING_SEARCHES | string[] | 7 | `routes/search.tsx` |
| DEFAULT_RECENT_SEARCHES | string[] | 4 | `routes/search.tsx` |
| ADS | Ad[] | 7 | `components/omeetso/AdBanner.tsx` |
| REPORT_REASONS | string[] | 8 | `components/omeetso/ReportSheet.tsx` |
| SORT_OPTIONS | object[] | 7 | `components/omeetso/SortSheet.tsx` |

### `frontend/src/lib/chat.ts` — Chat Layer (681 lines, 27.3KB)

| Mock Data Name | Type | Records | Used By |
|---|---|---|---|
| Seeded threads | Thread[] | 5 threads | `routes/chats.tsx`, `routes/chat.$id.tsx` |
| Seeded messages | Record<string, Message[]> | 5 threads × multiple msgs | `routes/chat.$id.tsx` |
| Seeded offers | Offer[] | 2 offers | `routes/offer.$id.tsx` |

**Import chain:**
```
routes/chats.tsx → lib/chat.ts → lib/mock.ts (PRODUCTS, SELLERS, STORES)
routes/chat.$id.tsx → lib/chat.ts → localStorage (K_THREADS, K_MESSAGES, K_OFFERS)
```

### `frontend/src/lib/account.ts` — Account Layer (615 lines, 30.4KB)

| Mock Data Name | Type | Source | Used By |
|---|---|---|---|
| DEFAULT_PROFILE | Profile | Hardcoded (name: "Akhil Reddy") | `routes/account.tsx`, `routes/account.edit.tsx` |
| DEFAULT_VERIF | VerificationMap | Hardcoded (mobile+email verified, identity under_review) | `routes/account.verification.*.tsx` |
| Sample notifications | Notification[] | Hardcoded in seedNotifications() | `routes/notifications.tsx` |
| Sample support tickets | SupportTicket[] | Hardcoded in seedSupport() | `routes/support.index.tsx` |
| Sample reviews | Review[] | Hardcoded in seedReviews() | `routes/reviews.index.tsx` |

### `frontend/src/lib/revenue.ts` — Revenue Layer (764 lines, 35.4KB)

| Mock Data Name | Type | Records | Used By |
|---|---|---|---|
| DEFAULT_PACKAGES | BoostPackage[] | 4 packages (₹99, ₹249, ₹499, ₹899) | `routes/promotions.new.tsx` |
| PROMOTION_OBJECTIVES | array | 4 | `routes/promotions.new.tsx` |
| CAMPAIGN_OBJECTIVES | array | 5 | `routes/ads.new.tsx` |
| PLACEMENTS | PlacementConfig[] | 7 placements | Multiple promotion/ad pages |
| Seeded wallet | Wallet | Balance: ₹1500 | `routes/wallet.tsx` |
| Seeded credits | Credit[] | 2 credits | `routes/wallet.tsx` |
| Seeded invoices | Invoice[] | 2 invoices | `routes/invoices.tsx` |
| Seeded promotions | Promotion[] | 3 promotions | `routes/promotions.index.tsx` |
| Seeded campaigns | Campaign[] | 2 campaigns | `routes/ads.index.tsx` |

### `frontend/src/lib/listings.ts` — Listings Layer (443 lines)

| Mock Data Name | Type | Used By |
|---|---|---|
| User-created listings | Listing[] (in localStorage) | `routes/listings.tsx`, `routes/listing.$id.manage.tsx` |
| Listing drafts | ListingDraft[] (in localStorage) | `routes/sell.drafts.tsx` |
| Listing analytics | ListingAnalytics (mock generated) | `routes/listing.$id.analytics.tsx` |
| Seller preferences | SellerPrefs (in localStorage) | Sell forms |

### `frontend/src/lib/stores.ts` — Stores Layer (352 lines)

| Mock Data Name | Type | Used By |
|---|---|---|
| User-created stores | Store[] (in localStorage) | `routes/store.manage.$id.tsx` |
| Store drafts | StoreDraft[] (in localStorage) | `routes/store.create.tsx` |
| Store products | Listing[] (in localStorage) | `routes/store.manage.$id.products.tsx` |

### `frontend/src/lib/saved.ts`

| Mock Data Name | Type | Used By |
|---|---|---|
| Saved product IDs | string[] (localStorage) | `routes/saved.tsx` |
| Recent searches | string[] (localStorage) | `routes/search.tsx` |
| Reports | StoredReport[] (localStorage) | `routes/safety.report.tsx` |
| Recently viewed IDs | string[] (localStorage) | `routes/recently-viewed.tsx` (STUB) |

### `frontend/src/lib/ads.ts`

| Mock Data Name | Type | Used By |
|---|---|---|
| Ad events (impressions/clicks) | Event[] (localStorage) | `components/omeetso/AdBanner.tsx` |
| Dismissed ad IDs | string[] (localStorage) | `components/omeetso/AdBanner.tsx` |

### `frontend/src/lib/faq.ts` — Static FAQ (8.8KB)

| Mock Data Name | Type | Records | Used By |
|---|---|---|---|
| FAQ articles | FAQItem[] | Multiple | `routes/help.faq.$id.tsx`, `routes/help.search.tsx` |

### `frontend/src/lib/specConfig.ts` — Spec Configuration (6.4KB)

| Mock Data Name | Type | Used By |
|---|---|---|
| SPEC_CONFIG | Record<string, SpecField[]> | Sell forms (category-specific specs) |

---

## Admin Mock Data Files

### `admin/src/data/adminUsers.ts` (105 lines)

| Data | Type | Records |
|---|---|---|
| MOCK_ADMIN_USERS | AdminUser[] | 9 admin users with roles, passwords implied by email |

### `admin/src/data/mock.ts` (131 lines)

| Data | Type | Records | Used By |
|---|---|---|---|
| USERS | PlatformUser[] | 4 users | `UsersListPage.tsx` via `MockDataService` |
| LISTINGS | Listing[] | 4 listings | `ListingsListPage.tsx` via `MockDataService` |
| STORES | Store[] | 2 stores | `StoresListPage.tsx` via `MockDataService` |
| CAMPAIGNS | AdCampaign[] | 2 campaigns | `AdCampaignsListPage.tsx` via `MockDataService` |
| TICKETS | SupportTicket[] | 2 tickets | `TicketsListPage.tsx` via `MockDataService` |
| SAFETY_REPORTS | SafetyReport[] | 2 reports | `SafetyReportsPage.tsx` via `MockDataService` |
| REFUNDS | RefundRequest[] | 1 refund | `RefundsPage.tsx` via `MockDataService` |

### `admin/src/data/dashboard.ts` (161 lines)

| Data | Type | Records |
|---|---|---|
| MOCK_DASHBOARD_STATS | DashboardStatCardData[] | 12 hardcoded stat cards |
| MOCK_USER_GROWTH_DATA | array | 7 days hardcoded |
| MOCK_LISTING_MODERATION_DATA | array | 7 months hardcoded |
| MOCK_REVENUE_BREAKDOWN_DATA | array | 4 revenue streams hardcoded |
| MOCK_SAFETY_REPORTS_BY_SEVERITY | array | 4 severity levels hardcoded |

### `admin/src/data/auditLogs.ts` (75 lines)

| Data | Type | Records |
|---|---|---|
| MOCK_AUDIT_LOGS | AuditLogEntry[] | 5 pre-seeded audit log entries |

### `admin/src/data/categorySchema.ts` (947 lines, 26.5KB)

| Data | Type | Content |
|---|---|---|
| CATEGORY_SCHEMAS | CategoryDefinition[] | Full category+subcategory+filter+field definitions for 15 categories |

### `admin/src/data/criticalAlerts.ts`, `liveActivity.ts`, `pendingActions.ts`, `globalSearch.ts`

All contain hardcoded mock arrays for dashboard display.

---

## Import Chains (Frontend)

```
routes/home.tsx
  → components/omeetso/ProductCard.tsx
  → lib/mock.ts (PRODUCTS)

routes/product.$id.tsx
  → lib/mock.ts (getProduct, getSeller, getStore)
  → lib/chat.ts (ensureThreadForProduct)
  → lib/saved.ts (isSaved, toggleSaved, addRecentlyViewed)

routes/sell.quick.tsx
  → lib/listings.ts (upsertListing, saveDraft)
  → lib/mock.ts (CATEGORIES, SUBCATEGORIES)
  → lib/listingValidation.ts

routes/promotions.new.tsx
  → lib/revenue.ts (listPackages, getWallet, upsertPromotion, debitWallet)
  → lib/listings.ts (getListing)
  → lib/stores.ts (getStore)

routes/chat.$id.tsx
  → lib/chat.ts (getThreads, getMessagesFor, sendMessage, createOffer)
  → lib/mock.ts (PRODUCTS, SELLERS, STORES)
```

---

## Complete Mock Data File Summary

| File | Portal | Location | Size | Replacement Needed |
|---|---|---|---|---|
| `mock.ts` | Frontend | `frontend/src/lib/mock.ts` | 21.9KB | YES — all data |
| `chat.ts` (seed data) | Frontend | `frontend/src/lib/chat.ts` | 27.3KB | YES — seeded threads |
| `account.ts` (defaults) | Frontend | `frontend/src/lib/account.ts` | 30.4KB | YES — default profile |
| `revenue.ts` (seed data) | Frontend | `frontend/src/lib/revenue.ts` | 35.4KB | YES — wallet/promo seed |
| `faq.ts` | Frontend | `frontend/src/lib/faq.ts` | 8.8KB | PARTIAL — can remain static |
| `specConfig.ts` | Frontend | `frontend/src/lib/specConfig.ts` | 6.4KB | MOVE TO DB |
| `adminUsers.ts` | Admin | `admin/src/data/adminUsers.ts` | 3.4KB | YES |
| `mock.ts` | Admin | `admin/src/data/mock.ts` | 6.4KB | YES |
| `dashboard.ts` | Admin | `admin/src/data/dashboard.ts` | 4.3KB | YES — all hardcoded |
| `auditLogs.ts` | Admin | `admin/src/data/auditLogs.ts` | 2.2KB | YES (seed only) |
| `categorySchema.ts` | Admin | `admin/src/data/categorySchema.ts` | 26.5KB | MOVE TO DB |
| `criticalAlerts.ts` | Admin | `admin/src/data/criticalAlerts.ts` | 1.8KB | YES |
| `liveActivity.ts` | Admin | `admin/src/data/liveActivity.ts` | 2.5KB | YES |
| `pendingActions.ts` | Admin | `admin/src/data/pendingActions.ts` | 2.4KB | YES |
| `globalSearch.ts` | Admin | `admin/src/data/globalSearch.ts` | 4.3KB | YES |
