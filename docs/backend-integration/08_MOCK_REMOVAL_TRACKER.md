# 08 — Mock Removal & Purge Tracker

## Overview
This document tracks the systematic removal of all runtime mock files, hardcoded data arrays, fake network delays, and `localStorage` business keys across `frontend/` and `admin/`.

---

## 1. Zero-Mock Repository Scanner Terms

The final repository audit scan must verify ZERO occurrences of the following terms in active runtime code:

```text
mock
MOCK_
dummy
sample
seedIfEmpty
seedRevenueIfEmpty
setTimeout (for fake network delays)
CORRECT_OTP
1234
123456
BACKUP-999
Akhil Reddy
localStorage (for business entities)
```

*(Note: Appearance and temporary UI preferences like theme or draft text inputs may remain in `localStorage`, but no business records).*

---

## 2. Expanded Mock Removal Tracker

| File | Export | Imported By | Replacement API | API Connected | Mock Removed | Tested |
|---|---|---|---|:---:|:---:|:---:|
| `frontend/src/lib/mock.ts` | `CATEGORIES` | `home.tsx`, `categories.tsx` | `GET /api/v1/categories` | [ ] | [ ] | [ ] |
| `frontend/src/lib/mock.ts` | `PRODUCTS` | `home.tsx`, `product.$id.tsx` | `GET /api/v1/listings` | [ ] | [ ] | [ ] |
| `frontend/src/lib/mock.ts` | `SELLERS` | `product.$id.tsx`, `seller.$id.tsx` | `GET /api/v1/users/:id/public` | [ ] | [ ] | [ ] |
| `frontend/src/lib/mock.ts` | `STORES` | `store.$id.tsx`, `stores.tsx` | `GET /api/v1/stores` | [ ] | [ ] | [ ] |
| `frontend/src/lib/chat.ts` | `seedIfEmpty()` | `chats.tsx`, `chat.$id.tsx` | `GET /api/v1/conversations` | [ ] | [ ] | [ ] |
| `frontend/src/lib/account.ts` | `DEFAULT_PROFILE` | `account.tsx`, `account.edit.tsx` | `GET /api/v1/users/me` | [ ] | [ ] | [ ] |
| `frontend/src/lib/listings.ts` | `upsertListing()` | `sell.quick.tsx`, `sell.detailed.tsx` | `POST /api/v1/listings` | [ ] | [ ] | [ ] |
| `frontend/src/lib/stores.ts` | `upsertStore()` | `store.create.tsx` | `POST /api/v1/stores` | [ ] | [ ] | [ ] |
| `frontend/src/lib/revenue.ts` | `seedRevenueIfEmpty()` | `wallet.tsx`, `promotions.new.tsx` | `GET /api/v1/users/me/wallet` | [ ] | [ ] | [ ] |
| `frontend/src/routes/otp.tsx` | `CORRECT_OTP = "1234"` | Route component | `POST /api/v1/auth/otp/verify` | [ ] | [ ] | [ ] |
| `admin/src/data/adminUsers.ts` | `MOCK_ADMIN_USERS` | `adminAuthService.ts` | `POST /api/v1/admin/auth/login` | [ ] | [ ] | [ ] |
| `admin/src/data/mock.ts` | `USERS`, `LISTINGS` | `mockDataService.ts` | `GET /api/v1/admin/listings` | [ ] | [ ] | [ ] |
| `admin/src/data/dashboard.ts` | `MOCK_DASHBOARD_STATS` | `DashboardPage.tsx` | `GET /api/v1/admin/dashboard/summary` | [ ] | [ ] | [ ] |
| `admin/src/data/categorySchema.ts` | `CATEGORY_SCHEMAS` | `CategoriesPage.tsx` | Seeded to MongoDB `categories` | [ ] | [ ] | [ ] |
| `admin/src/services/adminAuthService.ts` | `createDevSession()` | `AdminAuthContext.tsx` | `GET /api/v1/admin/auth/session` | [ ] | [ ] | [ ] |
