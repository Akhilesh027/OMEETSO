# 05 — Complete REST API Specifications

## Overview
All REST APIs use versioned path prefix `/api/v1/`. Data payloads and query parameters are validated against Zod schemas from `@omeetso/contracts`.

---

## 1. Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/v1/auth/otp/request` | Send OTP to mobile | Public |
| `POST` | `/api/v1/auth/otp/verify` | Verify OTP & issue session | Public |
| `POST` | `/api/v1/auth/refresh` | Refresh access token using cookie | Public (Cookie) |
| `POST` | `/api/v1/auth/logout` | Revoke session & clear cookie | Authenticated User |
| `GET` | `/api/v1/auth/session` | Get current authenticated user | Authenticated User |
| `POST` | `/api/v1/admin/auth/login` | Admin email/password login | Public |
| `POST` | `/api/v1/admin/auth/two-factor/verify` | Admin TOTP verification | Public |
| `POST` | `/api/v1/admin/auth/refresh` | Refresh admin token | Public (Cookie) |
| `POST` | `/api/v1/admin/auth/logout` | Admin logout | Authenticated Admin |
| `GET` | `/api/v1/admin/auth/session` | Get current admin user | Authenticated Admin |

---

## 2. Listing Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/v1/listings` | Search/filter public active listings | Public |
| `GET` | `/api/v1/listings/:id` | Get listing detail | Public |
| `POST` | `/api/v1/listings` | Create new listing | Authenticated User |
| `GET` | `/api/v1/users/me/listings` | Get seller's own listings | Authenticated User |
| `PATCH` | `/api/v1/listings/:id` | Edit listing | Seller Only |
| `POST` | `/api/v1/listings/:id/pause` | Pause listing | Seller Only |
| `POST` | `/api/v1/listings/:id/resume` | Resume listing | Seller Only |
| `POST` | `/api/v1/listings/:id/renew` | Renew 30-day listing expiry | Seller Only |
| `POST` | `/api/v1/listings/:id/mark-sold` | Mark listing as sold | Seller Only |
| `DELETE` | `/api/v1/listings/:id` | Soft-delete listing | Seller Only |

### Admin Listing Endpoints
| Method | Endpoint | Required Permission |
|---|---|---|
| `GET` | `/api/v1/admin/listings` | `listings.view` |
| `GET` | `/api/v1/admin/listings/:id` | `listings.view` |
| `PATCH` | `/api/v1/admin/listings/:id/approve` | `listings.approve` |
| `PATCH` | `/api/v1/admin/listings/:id/reject` | `listings.reject` |
| `PATCH` | `/api/v1/admin/listings/:id/request-changes` | `listings.request_changes` |
| `PATCH` | `/api/v1/admin/listings/:id/remove` | `listings.remove` |

---

## 3. Store Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/v1/stores` | Public store directory | Public |
| `GET` | `/api/v1/stores/:id` | Public store profile | Public |
| `POST` | `/api/v1/stores` | Create store application | Authenticated User |
| `GET` | `/api/v1/users/me/stores` | Get owner's stores | Authenticated User |
| `PATCH` | `/api/v1/stores/:id` | Update store profile | Store Owner Only |
| `GET` | `/api/v1/stores/:id/listings` | Get store products | Public |

### Admin Store Endpoints
| Method | Endpoint | Required Permission |
|---|---|---|
| `GET` | `/api/v1/admin/stores` | `stores.view` |
| `PATCH` | `/api/v1/admin/stores/:id/approve` | `stores.approve` |
| `PATCH` | `/api/v1/admin/stores/:id/reject` | `stores.reject` |
| `PATCH` | `/api/v1/admin/stores/:id/suspend` | `stores.suspend` |

---

## 4. Chat & Offer Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/v1/conversations` | Start or get thread for listing | Authenticated User |
| `GET` | `/api/v1/conversations` | List user threads | Authenticated User |
| `GET` | `/api/v1/conversations/:id/messages` | Get messages (paginated) | Participant Only |
| `POST` | `/api/v1/conversations/:id/messages` | Send message | Participant Only |
| `PATCH` | `/api/v1/conversations/:id/read` | Mark read | Participant Only |
| `POST` | `/api/v1/conversations/:id/offers` | Create price offer | Participant Only |
| `POST` | `/api/v1/offers/:id/accept` | Accept offer | Participant Only |
| `POST` | `/api/v1/offers/:id/decline` | Decline offer | Participant Only |
| `POST` | `/api/v1/offers/:id/counter` | Counter offer | Participant Only |

---

## 5. Media Upload Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/v1/uploads/sign` | Get presigned upload URL | Authenticated User/Admin |
| `POST` | `/api/v1/uploads/complete` | Confirm cloud upload | Authenticated User/Admin |

---

## 6. Admin Management & Audit Endpoints

| Method | Endpoint | Required Permission |
|---|---|---|
| `GET` | `/api/v1/admin/dashboard/summary` | `dashboard.view` |
| `GET` | `/api/v1/admin/users` | `users.view` |
| `PATCH` | `/api/v1/admin/users/:id/status` | `users.suspend` / `users.ban` |
| `GET` | `/api/v1/admin/audit-logs` | `audit.view` |
| `GET` | `/api/v1/admin/roles` | `roles.view` |
| `PATCH` | `/api/v1/admin/roles/:id` | `roles.edit` |
