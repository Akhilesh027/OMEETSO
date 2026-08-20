# 25 — Performance, Bundle Size and UX Audit

## Summary
This document audits performance bottlenecks, bundle sizes, rendering risks, asset management, and user experience patterns across both web applications.

---

## 1. Bundle Size & Load Performance

### User Portal (`frontend/`)
- **Router Output**: TanStack Router generates a single monolithic route tree file `src/routeTree.gen.ts` (82KB).
- **Icon Library**: `lucide-react` is imported extensively across components. Without tree-shaking optimizations in Vite, the full icon bundle can add substantial JS overhead.
- **Data File Sizes**: Heavy static data files bundled into the client JS bundle:
  - `lib/revenue.ts` (35.4KB)
  - `lib/account.ts` (30.4KB)
  - `lib/chat.ts` (27.3KB)
  - `lib/mock.ts` (21.9KB)
  - `lib/faq.ts` (8.8KB)
  - `lib/specConfig.ts` (6.4KB)
- **Impact**: Initial JavaScript bundle size includes hundreds of kilobytes of hardcoded mock data and static configuration that should ideally be fetched asynchronously.

### Admin Portal (`admin/`)
- **Category Schema Overhead**: `admin/src/data/categorySchema.ts` is 26.5KB of static JSON-like JavaScript bundled directly into the main chunk.
- **Recharts Library**: Recharts is a heavy charting dependency (>400KB minified). It is imported directly into the main dashboard bundle rather than lazily loaded.

---

## 2. Rendering Bottlenecks & UX Issues

1. **Lack of List Virtualization**:
   - Long product feeds (`/home`, `/results`), chat message threads (`/chat/$id`), and admin data tables (`/admin/users`, `/admin/listings`) render all DOM nodes simultaneously.
   - On mobile devices or low-end hardware, scrolling through 100+ listings or chat messages will cause severe layout thrashing and frame drops.

2. **Full Page Layout Re-renders**:
   - The pub/sub subscription mechanism (`subscribeAccount`, `subscribe`) triggers component re-renders across entire page subtrees whenever any storage key changes, rather than granular selector-based updates (like Redux/Zustand).

3. **Asset Loading Delays**:
   - Product and user avatar images use raw Unsplash image URLs without width/height formatting parameters or responsive `srcset` definitions, resulting in downloading full-resolution images for small thumbnail slots.

4. **Missing Loading States & Skeletons**:
   - While Shadcn `Skeleton` components exist in the UI library, many routes render blank screens or instant empty states during simulated `setTimeout` delays.

---

## 3. Accessibility (a11y) & Mobile UX Health

### Strengths
- **Mobile Viewport Shell**: The `MobileFrame` component enforces a consistent mobile aspect ratio and touch targets on desktop browsers.
- **Touch-Friendly Controls**: Bottom sheets, filter chips, and fixed bottom navigation bars follow modern iOS/Android mobile web standards.

### Weaknesses
- **Form Controls**: Several custom selectors (e.g., custom condition pills or price toggles) lack proper ARIA attributes (`aria-expanded`, `aria-checked`, `role="radiogroup"`).
- **Color Contrast**: Dark mode color tokens in `styles.css` should be audited for WCAG AA compliance on subtle muted text elements.
