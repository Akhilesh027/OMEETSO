# 06 — Authentication & Security Architecture

## Overview
This document specifies the dual user/admin authentication architecture, session management, token handling, CORS configuration, and security hardening rules.

---

## 1. Dual Authentication Pipeline

```
                               ┌─────────────────────────┐
                               │   Incoming HTTP Req     │
                               └────────────┬────────────┘
                                            │
                             ┌──────────────┴──────────────┐
                             ▼                             ▼
                 [ authenticateUser ]             [ authenticateAdmin ]
                 (Authorization Header)           (Authorization Header)
                             │                             │
                     Verify User JWT               Verify Admin JWT
                             │                             │
                  Check user.status != BANNED    Check admin.status == active
                             │                             │
                  Attach req.user = user         Attach req.admin = admin
                             │                             │
                             │                  [ requirePermission ]
                             │                  (Check admin.permissions)
                             │                             │
                             ▼                             ▼
                      Execute Handler              Execute Handler
```

---

## 2. Token & Cookie Architecture

- **Access Token**:
  - Signed using JWT (`HS256` or `RS256`).
  - Short lifetime: **15 minutes**.
  - Passed in HTTP Header: `Authorization: Bearer <access_token>`.
  - Maintained strictly in application memory on client (never in `localStorage`).

- **Refresh Token**:
  - Cryptographically secure random UUID string stored in MongoDB (`sessions` collection).
  - Long lifetime: **7 days**.
  - Delivered via **HTTP-Only, Secure, SameSite=Strict Cookie** named `omeetso_refresh`.
  - Supports automatic token rotation and session revocation (`logout-all`).

---

## 3. Immediate Removal of Insecure Artifacts

> [!CAUTION]
> The following mock and bypass routines MUST BE PERMANENTLY REMOVED during Phase 1:

1. **Development Auto-Login Bypass**: `adminAuthService.ts` line 220 `createDevSession()` auto-authenticating Super Admin.
2. **Hardcoded User OTP**: `CORRECT_OTP = "1234"` in `frontend/src/routes/otp.tsx`.
3. **Hardcoded Admin 2FA Code**: `123456` in `admin/src/pages/auth/TwoFactorPage.tsx`.
4. **Plaintext Admin Passwords**: All passwords hardcoded in `admin/src/data/adminUsers.ts`.

---

## 4. Admin Rate Limiting & Throttling

To prevent brute force attacks:
- **Login Rate Limiter**: 5 failed login attempts per email within 15 minutes triggers automatic account locking (`lockedUntil = Date.now() + 15 mins`).
- **OTP Rate Limiter**: Maximum 3 OTP requests per phone number per hour. Resend allowed only after 60 seconds.
- **Global API Rate Limiter**: 100 requests per minute per IP using `express-rate-limit`.

---

## 5. Security Hardening Middleware

```typescript
// app.ts setup
import helmet from "helmet";
import cors from "cors";

app.use(helmet());

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174", process.env.CLIENT_URL!],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
}));
```
