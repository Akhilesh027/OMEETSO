# 01 — Backend Architecture

## Overview
The Omeetso backend is designed as a **modular monolith** Node.js + Express application written in TypeScript. It uses MongoDB (via Mongoose) as the single authoritative database, Redis for session caching/rate limiting, and Socket.IO for real-time bi-directional communications.

The repository uses **npm workspaces** (`frontend`, `admin`, `backend`, `packages/*`) to share contracts and schemas between the client portals and backend server.

---

## Workspace Layout

```json
{
  "private": true,
  "workspaces": [
    "frontend",
    "admin",
    "backend",
    "packages/*"
  ]
}
```

---

## High-Level System Architecture

```
                          ┌───────────────────────────┐
                          │   Client Layer (Web)      │
                          ├─────────────┬─────────────┤
                          │ User Portal │ Admin Portal│
                          │ (React 19)  │ (React 18)  │
                          └──────┬──────┴──────┬──────┘
                                 │             │
                    HTTP / HTTPS │             │ WebSockets (Socket.IO)
                    (CSRF Protected)           (Authenticated Rooms)
                                 ▼             ▼
                          ┌───────────────────────────┐
                          │  Express Modular Monolith │
                          │ (CORS, Helmet, RateLimit) │
                          └─────────────┬─────────────┘
                                        │
             ┌──────────────────────────┼──────────────────────────┐
             ▼                          ▼                          ▼
   ┌───────────────────┐      ┌───────────────────┐      ┌───────────────────┐
   │ Auth & Security   │      │ Business Modules  │      │ Real-Time Engine  │
   │ (JWT, OTP, RBAC)  │      │ (Listings, Stores)│      │ (Socket.IO Rooms) │
   └─────────┬─────────┘      └─────────┬─────────┘      └─────────┬─────────┘
             │                          │                          │
             └──────────────────────────┼──────────────────────────┘
                                        │
                                        ▼
                          ┌───────────────────────────┐
                          │  MongoDB Database (Atlas) │
                          │  (Mongoose ORM + Indexes) │
                          └───────────────────────────┘
```

---

## Directory Structure (`backend/`)

```
backend/
├── src/
│   ├── app.ts                  # Express application setup
│   ├── server.ts               # HTTP & Socket.IO server listener
│   ├── config/
│   │   ├── env.ts              # Zod validated environment variables
│   │   ├── cloudinary.ts       # Cloudinary media client configuration
│   │   ├── cors.ts             # Allowed origins for user & admin portals
│   │   └── constants.ts        # Service constants
│   ├── database/
│   │   ├── connect.ts          # Mongoose connection logic
│   │   ├── indexes.ts          # Automated index verification script
│   │   └── seeders/            # Categories & Admin User seed scripts
│   ├── middleware/
│   │   ├── authenticateUser.ts  # User JWT authentication (Audience: omeetso-user)
│   │   ├── authenticateAdmin.ts # Admin JWT authentication (Audience: omeetso-admin)
│   │   ├── requirePermission.ts # Admin RBAC permission guard
│   │   ├── validateRequest.ts   # Zod request body/params validation
│   │   ├── csrfProtection.ts    # Anti-CSRF protection middleware
│   │   ├── errorHandler.ts      # Global centralized error handler
│   │   └── rateLimiter.ts       # Express rate-limiting middleware
│   ├── modules/
│   │   ├── auth/               # User & Admin authentication & sessions
│   │   ├── users/              # Profiles, addresses, preferences
│   │   ├── categories/         # Schema, subcategories, spec fields
│   │   ├── listings/           # Listings CRUD, revisions, drafts, search
│   │   ├── stores/             # Stores CRUD, members, store listings
│   │   ├── chat/               # Conversations & messages (idempotent)
│   │   ├── offers/             # Offer state machine & negotiation
│   │   ├── notifications/      # User notifications
│   │   ├── safety/             # Reports & user blocks
│   │   ├── support/            # Support tickets & support messages
│   │   ├── verification/       # Identity & business verification
│   │   ├── reviews/            # User & store reviews
│   │   ├── revenue/            # Ledger-backed wallet, promotions, ad campaigns
│   │   ├── admin/              # Dashboard, queues, audit logs
│   │   └── uploads/            # Cloudinary signed upload URLs & asset tracking
│   ├── sockets/
│   │   ├── socketServer.ts     # Socket.IO initialization
│   │   ├── socketAuth.ts       # JWT handshake auth & room access validation
│   │   └── handlers/           # Chat, notification, presence handlers
│   ├── jobs/
│   │   ├── queue.ts            # Agenda / BullMQ background queue setup
│   │   └── workers/            # Expiry, unattached media cleanup & workers
│   └── shared/
│       ├── errors/             # Custom Error classes (AppError, NotFound, Forbidden)
│       ├── utils/              # Logger, pagination, id helpers
│       └── types/              # Internal backend types
├── tests/                      # Jest / Supertest integration test suite
├── package.json
├── tsconfig.json
└── .env.example
```

---

## Core Operational Policies

1. **Modular Monolith Backend**: All domain modules reside within a single Express app to simplify deployment while maintaining clean module boundaries.
2. **Session Separation**:
   - User tokens: `audience: "omeetso-user"`
   - Admin tokens: `audience: "omeetso-admin"`
   - User tokens cannot authenticate against admin endpoints.
3. **Database Single Source of Truth**: All business logic relies strictly on MongoDB collections. No in-memory state or local browser storage is trusted for authority.
4. **Cloudinary Media Pipeline**: Public marketplace images use Cloudinary with automated WebP/AVIF transformation and responsive variants. Private KYC documents use signed, authenticated storage URLs with restricted access.
5. **CSRF & Cookie Protection**: Refresh tokens are stored in `HttpOnly`, `Secure`, `SameSite=Strict` cookies with automated token rotation and revocation. State-changing endpoints are protected against cross-site request forgery.
