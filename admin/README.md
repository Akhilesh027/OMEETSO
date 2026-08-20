# Omeetso Admin Console (`/omeetso-admin-react/`)

The **Omeetso Admin Console** is a desktop-first, highly responsive enterprise management platform built for operational control, content moderation, safety investigations, advertisement campaign reviews, and financial ledger oversight across the Omeetso local marketplace platform.

---

## 1. Local Development Setup

To run the admin console locally:

```bash
cd omeetso-admin-react
npm install
npm run dev
```

The application runs by default on `http://localhost:5174`.

### Available Scripts

* `npm run dev`: Launch Vite development server with HMR.
* `npm run typecheck`: Run TypeScript type checking across all files (`tsc --noEmit`).
* `npm run build`: Compile TypeScript and build production bundle into `/dist`.
* `npm run preview`: Serve the built production bundle locally.

---

## 2. Local Development Mock Credentials

> [!IMPORTANT]
> **DEVELOPMENT ONLY:** The credentials below are provided for local offline testing of different role permissions and authentication states. **Do not use or expose real authentication secrets in production configuration.**

| Role | Mock Email | Default Password | Features & Permissions |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@omeetso.com` | `password123` | Full platform authority, user management, audit logs, system settings |
| **Platform Admin** | `admin@omeetso.com` | `password123` | Full operational management excluding core system role editing |
| **Listing Moderator** | `listingmod@omeetso.com` | `password123` | Listing approval/rejection, categories, product quality control |
| **Store Moderator** | `storemod@omeetso.com` | `password123` | Store verification applications, GST checks, business seller storefronts |
| **Advertisement Manager** | `adsmanager@omeetso.com` | `password123` | Ad campaign reviews, 13 placement IDs, banner approvals |
| **Finance Manager** | `financemanager@omeetso.com` | `password123` | Platform wallet ledgers, refund approvals, transaction histories |
| **Support Agent** | `supportagent@omeetso.com` | `password123` | Ticket management, customer messaging, initial escalation |
| **Safety & Fraud Officer** | `safetyofficer@omeetso.com` | `password123` | Security investigations, chat report reviews, account bans, wallet freezes |
| **Analytics Viewer** | `analytics@omeetso.com` | `password123` | Read-only analytics, user growth trends, revenue reports |

### 2FA Verification Test Credentials

* **6-Digit Authenticator Code:** `123456`
* **Emergency Backup Code:** `BACKUP-999`

---

## 3. Technology Stack

* **Core Framework:** React 18 + TypeScript + Vite
* **Routing:** React Router DOM v6 (gated via `ProtectedAdminRoute` & `PermissionRoute`)
* **Styling:** Vanilla CSS + Tailwind CSS (Custom palette `adminColors`)
* **Icons:** Lucide React
* **Charts:** Recharts
* **State & Persistence:** React Context + Typed `LocalStorageService`
* **Audit Logging:** Typed `AuditLogService` (Read-only UI)

---

## 4. Production Backend Security Requirements

> [!WARNING]
> This repository currently provides a frontend-only SPA with typed local mock data and local storage simulation. Before deploying to production environments, the following backend security controls **MUST** be implemented on the API server:

1. **Server-Side Authorization Enforcement:**
   * Every API endpoint must independently verify admin JWT signatures and check user permissions on the server. Never rely on frontend route guards or hidden UI components alone.
2. **Secure Session Cookie Handling:**
   * Session tokens must be stored in `HttpOnly`, `Secure`, `SameSite=Strict` cookies to prevent XSS token theft.
3. **CSRF & Origin Validation:**
   * Implement strict anti-CSRF tokens and enforce server CORS allowlists restricted to authorized admin domains.
4. **Password Hashing & Key Secret Protection:**
   * Hash all passwords using Argon2id or bcrypt with appropriate work factors. Store 2FA TOTP secrets encrypted at rest.
5. **Rate Limiting & Account Lockout:**
   * Enforce server-side rate limits on `/api/admin/login` (e.g. 5 failed attempts locks the IP/account for 15 minutes).
6. **Immutable Server Audit Trail:**
   * Persist all administrative actions into an append-only database table with cryptographic checksums to prevent log tampering.
7. **Idempotent Refund & Wallet Execution:**
   * Ensure financial adjustments and refund calls pass server-side idempotency keys to prevent double-debiting.
