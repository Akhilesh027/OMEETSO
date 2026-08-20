# 10 — Authentication and Authorization Audit

## Summary
Both portals have well-designed authentication UI flows but all authentication is mock/simulated. No real authentication server, JWT token validation, session verification, or security exists.

---

## User Portal Authentication

### Method
- **Phone number + OTP**
- **Google OAuth** (UI only — sets mock flag in localStorage)
- **Guest mode** (no account required)

### OTP Flow

| Step | File | Behaviour |
|---|---|---|
| 1. Enter phone | `routes/login.tsx` | Validates 10 digits, stores in `omeetso_pending_phone` |
| 2. Simulate SMS send | `routes/login.tsx` | 900ms timeout, checks `navigator.onLine` |
| 3. Navigate to OTP | `routes/login.tsx` | Goes to `/otp` |
| 4. Enter 4-digit code | `routes/otp.tsx` | Compares to hardcoded `CORRECT_OTP = "1234"` |
| 5. OTP success | `routes/otp.tsx` | Stores `{provider: "otp", phone}` in `omeetso_user` |
| 6. Profile check | `routes/otp.tsx` | Checks `omeetso_profile` and `omeetso_location` |
| 7. Navigate to home/profile-setup | `routes/otp.tsx` | Routes based on profile completeness |

### Google OAuth Flow (Mock)

| Step | File | Behaviour |
|---|---|---|
| 1. Click Google button | `routes/login.tsx` | 1000ms fake delay |
| 2. Mock Google auth | `routes/login.tsx` | Sets `{provider: "google"}` in `omeetso_user` |
| 3. Navigate to home | `routes/login.tsx` | Goes to `/home` |
| No OAuth redirect | — | **Never calls Google API** |

### Guest Mode

| Step | File | Behaviour |
|---|---|---|
| 1. Click "Continue as Guest" | `routes/login.tsx` | Shows confirmation sheet |
| 2. Confirm guest | `routes/login.tsx` | Stores `"1"` in `omeetso_guest` and `omeetso_guest_session` |
| 3. Navigate to home | `routes/login.tsx` | Goes to `/home` |

### Session Check (User Portal)

There is **no route guard** and no session validation. The `omeetso_user` key is checked in some places:
- `lib/chat.ts` — `isGuest()` checks `omeetso_guest` flag
- `routes/account.tsx` — reads profile from localStorage
- No route-level `beforeLoad` guards exist in TanStack Router config

**Anyone can navigate to any authenticated route without being logged in.**

### Logout (User Portal)

| File | Behaviour |
|---|---|
| `routes/logout.tsx` | Calls `logoutMock()` from `lib/account.ts` which removes multiple localStorage keys |

---

## Admin Portal Authentication

### Method
- **Email + password** (checked against hardcoded `MOCK_ADMIN_USERS` array)
- **2FA TOTP** (hardcoded code `123456`)
- **Dev bypass** — auto-creates Super Admin session if none exists

### Admin Login Flow

| Step | File | Behaviour |
|---|---|---|
| 1. Enter email + password | `pages/auth/LoginPage.tsx` | Form validation |
| 2. Validate credentials | `adminAuthService.ts` | Finds user in `MOCK_ADMIN_USERS` by email |
| 3. Check password | `adminAuthService.ts` | Compares to hardcoded password in data file |
| 4. Check failed attempts | `adminAuthService.ts` | Reads `omeetso_admin_failed_attempts` from localStorage |
| 5. Check 2FA flag | `adminAuthService.ts` | Returns `credentials_verified` if 2FA required |
| 6. Create session | `adminAuthService.ts` | Creates session object, stores in `omeetso_admin_session` |

### 2FA Flow (Admin)

| Step | File | Behaviour |
|---|---|---|
| 1. Navigate to 2FA page | `AdminRoutes.tsx` | After credentials verified |
| 2. Enter 6-digit code | `pages/auth/TwoFactorPage.tsx` | Form entry |
| 3. Validate code | `adminAuthService.ts` | Compares to hardcoded `"123456"` or backup `"BACKUP-999"` |
| 4. Complete login | `adminAuthService.ts` | Updates session, navigates to dashboard |

### Development Bypass

```typescript
// adminAuthService.ts ~line 220
async checkSession(): Promise<AuthStatus> {
  const stored = LocalStorageService.getItem<AdminSession | null>(
    adminStorageKeys.session, null
  );
  if (!stored) {
    // DEV BYPASS: Create super admin session
    this.createDevSession(); // Returns "authenticated" immediately
    return "authenticated";
  }
  ...
}
```

**This means the admin portal auto-authenticates as Super Admin with no login required.**

### Mock Admin Users

From `admin/src/data/adminUsers.ts`:

| ID | Name | Email | Role | Password |
|---|---|---|---|---|
| ADM-001 | Rajesh Sharma | rajesh.sharma@omeetso.com | Super Admin | `SuperAdmin@123!` |
| ADM-002 | Meera Nair | meera.nair@omeetso.com | Platform Admin | `PlatformAdmin@123` |
| ADM-003 | Priya Patel | priya.patel@omeetso.com | Listing Moderator | `ListingMod@123` |
| ADM-004 | Arjun Kumar | arjun.kumar@omeetso.com | Store Moderator | `StoreMod@123` |
| ADM-005 | Kavya Rao | kavya.rao@omeetso.com | Advertisement Manager | `AdManager@123` |
| ADM-006 | Vikram Reddy | vikram.reddy@omeetso.com | Finance Manager | `Finance@123` |
| ADM-007 | Sneha Iyer | sneha.iyer@omeetso.com | Support Agent | `Support@123` |
| ADM-008 | Ananya Rao | ananya.rao@omeetso.com | Safety and Fraud Officer | `Safety@123` |
| ADM-009 | Rahul Gupta | rahul.gupta@omeetso.com | Analytics Viewer | `Analytics@123` |

> **SECURITY ISSUE:** All passwords are hardcoded in source code and checked in plain text.

---

## Permission System (Admin)

### Permission Definitions
File: `admin/src/permissions/permissions.ts`  
Total permissions: **84** strings

Permission categories:
- `dashboard.view`
- `users.view/edit/warn/suspend/ban/verify`
- `listings.view/approve/reject/request_changes/pause/remove/restore`
- `categories.view/create/edit/disable`
- `stores.view/approve/reject/verify/suspend`
- `safety.view/investigate/restrict/suspend`
- `promotions.view/manage/refund`
- `ads.view/approve/reject/pause/manage_placements`
- `wallet.view/adjust/freeze`
- `payments.view/refunds.view/approve`
- `reviews.view/moderate`
- `support.view/reply/assign/close`
- `notifications.view/create/schedule`
- `content.view/edit/publish`
- `analytics.view/export`
- `admins.view/create/edit/disable`
- `roles.view/edit`
- `settings.view/edit`
- `audit.view`

### Role Definitions
File: `admin/src/permissions/roles.ts`

9 roles with distinct permission sets:
1. `Super Admin` — All permissions
2. `Platform Admin` — All except `admins.*`, `roles.edit`, `settings.edit`
3. `Listing Moderator` — Listings, categories, reviews
4. `Store Moderator` — Stores, users.view
5. `Advertisement Manager` — Ads, promotions, analytics
6. `Finance Manager` — Wallet, payments, refunds, analytics
7. `Support Agent` — Support, users.view, listings.view
8. `Safety and Fraud Officer` — Safety, users.warn/suspend, wallet.freeze
9. `Analytics Viewer` — All `.view` permissions, analytics.export

### Access Enforcement Components

| Component | File | Purpose |
|---|---|---|
| `ProtectedAdminRoute` | `components/auth/ProtectedAdminRoute.tsx` | Checks `isAuthenticated` state |
| `PermissionRoute` | `components/auth/PermissionRoute.tsx` | Checks `hasPermission(permission)` |
| `Can` | `components/common/Can.tsx` | Inline permission check, shows/hides content |
| `usePermission` | `hooks/usePermission.ts` | Hook for permission check |

**All enforcement is CLIENT-SIDE ONLY.** There is no server-side validation.

---

## Authentication Problems Summary

| Problem | User Portal | Admin Portal | Risk |
|---|---|---|---|
| OTP hardcoded | YES (`"1234"`) | N/A | CRITICAL |
| Password in source code | NO | YES (all 9 passwords) | CRITICAL |
| 2FA code hardcoded | NO | YES (`"123456"`) | CRITICAL |
| No JWT / real token | YES | YES | CRITICAL |
| Auto-login bypass | NO | YES (dev mode) | CRITICAL |
| No route guards | YES (no guards) | NO (guards exist, client-side) | HIGH |
| Auth state in localStorage | YES | YES | HIGH |
| No token expiry validation | NO | Checks date in localStorage | HIGH |
| No CSRF protection | YES | YES | HIGH |
| No refresh token | YES | YES | HIGH |
| XSS can steal session | YES | YES | HIGH |
| Wallet balance client-side | YES | YES | CRITICAL |
| No server validation of any action | YES | YES | CRITICAL |
