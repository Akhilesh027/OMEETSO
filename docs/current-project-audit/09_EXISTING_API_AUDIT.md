# 09 — Existing API and Service-Layer Audit

## Summary
**There are ZERO real API calls in either portal.** No Axios instance, no Fetch calls to any backend, no environment-based API URLs, no authentication headers, and no real data is sent to or received from any server.

---

## API Call Inventory

| Method | Endpoint | Called From | Purpose | Real or Mock | Authentication | Current Status |
|---|---|---|---|---|---|---|
| — | — | — | — | — | — | **NO API CALLS EXIST** |

---

## Service Files Analysis

### Frontend (`frontend/src/lib/`)

All service/data files are localStorage abstractions — NOT API clients.

| File | Purpose | API Calls | Notes |
|---|---|---|---|
| `lib/account.ts` | Profile, verification, notifications, reviews | NONE | Pure localStorage CRUD |
| `lib/chat.ts` | Chat threads, messages, offers | NONE | Pure localStorage CRUD |
| `lib/listings.ts` | Listing CRUD + drafts | NONE | Pure localStorage CRUD |
| `lib/stores.ts` | Store CRUD + products | NONE | Pure localStorage CRUD |
| `lib/revenue.ts` | Wallet, promotions, ad campaigns | NONE | Pure localStorage CRUD |
| `lib/saved.ts` | Favourites, searches, reports | NONE | Pure localStorage CRUD |
| `lib/ads.ts` | Ad impression/click tracking | NONE | localStorage events only |
| `lib/mock.ts` | Static data arrays | NONE | Imported constants |
| `lib/faq.ts` | Help content | NONE | Static content |

### Admin (`admin/src/services/`)

| File | Purpose | API Calls | Notes |
|---|---|---|---|
| `adminAuthService.ts` | Authentication | NONE | Checks `MOCK_ADMIN_USERS` array, writes to localStorage |
| `mockDataService.ts` | CRUD for users, listings, stores, etc. | NONE | Reads/writes localStorage |
| `adsDataService.ts` | Ad campaign data | NONE | Returns mock data |
| `promotionsDataService.ts` | Promotion data | NONE | Returns mock data |
| `auditLogService.ts` | Audit log writes | NONE | Writes to localStorage |
| `auditLog.ts` | Audit log utilities | NONE | Helper functions |

---

## Axios / Fetch Search Results

### Grep for `axios`:
**ZERO occurrences** in either portal.

### Grep for `fetch(`:
**ZERO occurrences** targeting API endpoints. Only `fetch` API-like patterns for internal browser APIs.

### Grep for `VITE_API_URL`:
Found only in `admin/.env.example`:
```
VITE_API_URL=https://api.omeetso.in/api
```
This variable is **defined in the example file but never used** in any source file.

### Grep for `http://localhost`:
Found only in `admin/.env.example`. Not used in code.

---

## Simulated API Behavior (Fake Delays)

The following patterns simulate network delays without real API calls:

| File | Pattern | Purpose |
|---|---|---|
| `routes/login.tsx` | `setTimeout(() => {...}, 900)` | Fake OTP sending delay |
| `routes/otp.tsx` | `setTimeout(() => {...}, 800)` | Fake OTP verification delay |
| `admin/src/services/adminAuthService.ts` | `await` on non-existent API | Returns immediately from mock |
| `admin/src/contexts/AdminAuthContext.tsx` | `setTimeout(..., 400)` | Fake session restore delay |
| `admin/src/pages/auth/TwoFactorPage.tsx` | `setTimeout` | Fake 2FA verification delay |

---

## Environment Variables

### Admin `.env.example`
```
VITE_API_URL=https://api.omeetso.in/api
```
This is the **only** API-related environment variable in the entire project. It is declared but never imported or used.

### Frontend
No `.env.example` or `.env` file exists. No API URL is configured.

---

## Auth Headers
No authentication headers, Bearer tokens, or API interceptors exist in either portal. All session data is stored in localStorage objects without any server validation.

---

## TanStack Query Usage

Both portals install TanStack Query but:
- **Frontend:** QueryClient is created in `router.tsx` and passed to the router context. No `useQuery`, `useMutation`, or any query hooks are used anywhere.
- **Admin:** TanStack Query is in `package.json` but no `QueryClient` setup or usage was found.

TanStack Query is **installed but completely unused** in both portals.

---

## APIs Defined But Never Used
- `VITE_API_URL` — Defined in env.example, never read
- TanStack Query — Installed, never used for API calls
- The `server.ts` and `start.ts` files in the frontend are stubs (131 bytes each) that export nothing meaningful

---

## Critical Integration Gap

When backend integration begins, every single data operation in both portals will need to be converted from localStorage calls to real API calls. This includes:

- ~50 localStorage read/write operations in the frontend
- ~25 localStorage read/write operations in the admin portal
- All mock data arrays
- All seeded data functions
