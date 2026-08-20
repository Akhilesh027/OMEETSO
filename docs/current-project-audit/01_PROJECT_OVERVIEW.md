# 01 — Project Overview

## Project Name
**Omeetso** — A local classifieds / marketplace platform (Hyderabad-based) for buying and selling products locally, with store profiles, chat, promotions, advertisements and admin management.

---

## Repository Root
`c:\Users\akhil\OneDrive\Desktop\omeetso_new\`

## Number of Applications
**3** applications in the repository:

| Application | Path | Type |
|---|---|---|
| User Frontend Portal | `omeetso_new/frontend/` | Web App (React + TanStack Router + Vite) |
| Admin Portal | `omeetso_new/admin/` | Web App (React + React Router + Vite) |
| Mobile App | `omeetso_new/omeetso app/omeetso-mobile-expo/` | Mobile (Expo / React Native) — not fully audited in this report |

---

## Application Paths

| Item | Path |
|---|---|
| **User Portal** | `omeetso_new/frontend/` |
| **Admin Portal** | `omeetso_new/admin/` |
| **Mobile App** | `omeetso_new/omeetso app/omeetso-mobile-expo/` |
| **Shared Packages** | None — no shared/monorepo package exists |
| **User Portal Public Assets** | `frontend/public/` |
| **Admin Portal Public Assets** | `admin/public/` |

---

## Configuration Files

### Frontend (User Portal)
| File | Purpose |
|---|---|
| `frontend/package.json` | Dependencies and scripts |
| `frontend/vite.config.ts` | Vite bundler configuration |
| `frontend/tsconfig.json` | TypeScript configuration |
| `frontend/components.json` | Shadcn UI component configuration |
| `frontend/.prettierrc` | Code formatting |
| `frontend/eslint.config.js` | Linting configuration |
| `frontend/index.html` | Entry HTML |
| `frontend/AGENTS.md` | Agent configuration (Lovable/AI build notes) |
| `frontend/bunfig.toml` | Bun package manager config |

### Admin Portal
| File | Purpose |
|---|---|
| `admin/package.json` | Dependencies and scripts |
| `admin/vite.config.ts` | Vite bundler configuration |
| `admin/tsconfig.json` | TypeScript configuration |
| `admin/tailwind.config.ts` | Tailwind CSS configuration |
| `admin/postcss.config.js` | PostCSS configuration |
| `admin/.env.example` | Environment variable template |
| `admin/index.html` | Entry HTML |
| `admin/vercel.json` | Deployment configuration (Vercel) |

---

## Build and Deployment Configuration

| Application | Build Command | Dev Command | Deploy Target |
|---|---|---|---|
| Frontend | `vite build` | `vite` | Not configured |
| Admin | `tsc -b && vite build` | `vite` | Vercel (`vercel.json` present) |

---

## Package Manager
- **Both applications** use `npm` (package-lock.json present)
- Bun lock files also present — indicating dual usage

---

## Technology Stack Table

### User Frontend Portal

| Technology | Present | Version | Used In | Notes |
|---|---|---|---|---|
| React | YES | 19.2.0 | All components | React 19 |
| Vite | YES | 8.0.16 | Build tool | |
| TanStack Router | YES | 1.170.16 | All routing | File-based routing |
| TanStack Query | YES | 5.101.1 | Query context | Available, no real queries |
| TypeScript | YES | 5.8.3 | Whole project | |
| Tailwind CSS | YES | 4.2.1 | All styling | Tailwind v4 |
| Shadcn UI | YES | — | UI components | Via Radix UI |
| React Hook Form | YES | 7.71.2 | Forms | With Zod resolvers |
| Zod | YES | 3.24.2 | Validation | |
| Recharts | YES | 2.15.4 | Charts | Revenue pages |
| Sonner | YES | 2.0.7 | Toast notifications | |
| LocalStorage | YES | — | ALL data persistence | Primary "database" |
| React Context | NO | — | — | Not used |
| Redux / Zustand | NO | — | — | Not used |
| Axios / Fetch API | NO | — | — | No real API calls |
| Socket.IO | NO | — | — | Not present |
| Firebase / Supabase | NO | — | — | Not present |
| Express / MongoDB | NO | — | — | No backend |

### Admin Portal

| Technology | Present | Version | Used In | Notes |
|---|---|---|---|---|
| React | YES | 18.3.1 | All components | React 18 |
| Vite | YES | 5.4.11 | Build tool | |
| React Router | YES | 6.28.0 | All routing | React Router v6 |
| TanStack Query | YES | 5.59.20 | Query setup | Available, no real queries |
| TypeScript | YES | 5.6.3 | Whole project | |
| Tailwind CSS | YES | 3.4.14 | All styling | Tailwind v3 |
| React Hook Form | YES | 7.53.2 | Login, forms | |
| Zod | YES | 3.23.8 | Validation | |
| Recharts | YES | 2.13.3 | Dashboard charts | |
| Lucide React | YES | 0.454.0 | Icons | |
| React Context | YES | — | Auth, Toast | AdminAuthContext, ToastContext |
| LocalStorage | YES | — | ALL data persistence | Primary "database" |
| Redux / Zustand | NO | — | — | Not used |
| Axios / Fetch API | NO | — | — | No real API calls |
| Socket.IO | NO | — | — | Not present |
| Firebase / Supabase | NO | — | — | Not present |
| Express / MongoDB | NO | — | — | No backend |

---

## Key Observations

1. **No backend exists** — all data is stored in browser localStorage
2. **No real API calls** exist in either application
3. **The two portals are completely isolated** — they do not share data
4. **Authentication is 100% mocked** — OTP is hardcoded as `1234`, admin 2FA code is `123456`
5. The admin portal auto-logs in as Super Admin when no session exists (development bypass)
6. The frontend portal has a default hardcoded user profile "Akhil Reddy" from Madhapur
7. Both portals use different React versions and different router libraries
8. The frontend uses Tailwind v4 while admin uses Tailwind v3 — incompatible config formats
