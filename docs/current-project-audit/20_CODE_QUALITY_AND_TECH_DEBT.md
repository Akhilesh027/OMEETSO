# 20 — Code Quality, Architecture and Technical Debt Audit

## Summary
This document analyzes the overall architectural health, technical debt, code quality, dependency health, and performance risks across both application portals.

---

## 1. Architectural Patterns & State Management

### User Frontend Portal
- **Routing Framework**: TanStack Router (v1.170.16) using file-based routing. Route tree is auto-generated into `src/routeTree.gen.ts` (82KB).
- **State Management**:
  - Direct read/write calls to `localStorage`.
  - Custom Pub/Sub event listeners (`subscribe`, `emit`) per domain file (e.g., `lib/account.ts`, `lib/listings.ts`, `lib/chat.ts`).
  - No global state manager (Redux, Zustand) or React Context used for core data.
- **Architectural Strengths**: High responsiveness for local interactions; modular `lib/` directory separating storage domains.
- **Architectural Weaknesses**: Data logic is tightly coupled to client-side storage keys. No abstraction layer (repository pattern) isolating data fetchers from components.

### Admin Portal
- **Routing Framework**: React Router v6 using centralized route declarations (`AdminRoutes.tsx`).
- **State Management**:
  - React Context API (`AdminAuthContext.tsx`, `ToastContext.tsx`).
  - `LocalStorageService` class wrapping `localStorage`.
- **Architectural Strengths**: Clear component hierarchy (Layouts -> Pages -> Components -> Services). Proper higher-order components for auth/permission guards.
- **Architectural Weaknesses**: Massive duplication of route paths mapping to identical component files.

---

## 2. Framework & Dependency Inconsistencies

A major source of technical debt is the total divergence between the two portals in tech stack versions:

| Metric / Dependency | User Portal (`frontend/`) | Admin Portal (`admin/`) | Impact |
|---|---|---|---|
| **React Version** | 19.2.0 | 18.3.1 | Potential hook behavior discrepancies, separate build pipelines |
| **Vite Version** | 8.0.16 | 5.4.11 | Divergent bundler configs and plugin compatibility |
| **TypeScript Version** | 5.8.3 | 5.6.3 | Different type checker strictness |
| **Tailwind CSS** | v4.2.1 | v3.4.14 | Incompatible syntax (`@theme` vs `tailwind.config.ts`) |
| **Router** | TanStack Router | React Router v6 | Developer cognitive load when switching portals |
| **Toast Library** | Sonner (v2.0.7) | Custom ToastContext | Inconsistent toast UI & API |

---

## 3. Code Duplication & Reusability Issues

1. **Category Schema Duplication**:
   - `admin/src/data/categorySchema.ts` (947 lines) contains comprehensive category definitions.
   - `frontend/src/lib/mock.ts` contains a completely separate static list of categories.
   - `frontend/src/lib/specConfig.ts` contains category spec fields.
   - *Debt*: Updating a category requires manual synchronization across multiple files in different applications.

2. **Types Duplication & Mismatches**:
   - `admin/src/types/auth.ts` vs `admin/src/types/index.ts` both define `AdminUser` differently.
   - Frontend and Admin define `Listing`, `Store`, and `SafetyReport` interfaces with different field names and types (e.g., `price` as INR number vs `priceInPaise` as integer).

3. **UI Components**:
   - Buttons, Badges, Modals, and Cards are built independently in both projects without a shared component library.

---

## 4. Code Quality & Security Risks

### High Severity Technical Debt
- **Development Auth Bypass**: `adminAuthService.ts` automatically creates a Super Admin session if none is found.
- **Hardcoded Secrets & Passwords**: Admin user passwords (`SuperAdmin@123!`, etc.) and hardcoded OTPs (`1234`, `123456`) are committed directly in source code.
- **Object URL Image Memory Leaks**: Sell forms create `URL.createObjectURL()` strings for uploaded images. These blob URLs are saved directly to `localStorage`, causing broken image links on page refresh and memory retention.
- **Direct LocalStorage Manipulation**: Components directly invoke `localStorage.setItem()` instead of going through dedicated service methods, making future API refactoring prone to missed call sites.

### Maintenance & Performance Risks
- **Lack of Pagination**: Lists (`listings.tsx`, `chats.tsx`, `UsersListPage.tsx`) render all records in memory simultaneously.
- **Unused Heavy Dependencies**: `@tanstack/react-query` is installed in both projects and configured in root contexts, but zero queries or mutations are implemented.
- **Stub File Pollution**: Several route files in frontend (`register.tsx`, `recently-viewed.tsx`, `stores.tsx`) are stubs with < 1KB of code that render blank or incomplete UI.
