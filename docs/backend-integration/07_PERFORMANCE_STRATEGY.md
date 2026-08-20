# 07 — Performance Strategy & Optimization Guide

## Overview
Performance and fast loading speeds are P0 requirements for Omeetso. Every backend endpoint and database query is designed to adhere to explicit payload budgets, indexing rules, lean query patterns, and rendering benchmarks.

---

## 1. Explicit API Payload Budgets

No endpoint may exceed its target payload budget:

| Endpoint Type / Scenario | Target Maximum Payload Size |
|---|---|
| **Home Feed Response** | Below **200 KB** |
| **Listing Search Page (20 records)** | Below **150 KB** |
| **Admin Table Page (25 records)** | Below **200 KB** |
| **Conversation List (20 threads)** | Below **150 KB** |
| **Chat Message History (30 msgs)** | Below **100 KB** |
| **Listing Card Thumbnail Image** | Below **100 KB** |

---

## 2. Canonical Mongoose Query Pattern

All read-only queries MUST strictly follow this pattern:

```typescript
Model.find(query)
  .select(requiredFieldsOnly)
  .sort(sortOptions)
  .limit(limit)
  .lean();
```

### Mandatory Query Rules
- **NEVER** call `.find()` without explicit `.limit()`.
- **NEVER** return complete documents for grid/card views.
- **NEVER** use deep nested `.populate()` for card feeds.
- **ALWAYS** append `.lean()` to bypass Mongoose document hydration overhead.
- **ALWAYS** specify `.select("field1 field2")` to exclude heavy fields (full descriptions, specs, audit logs).

---

## 3. Strict Module Completion Criteria

A module is NOT considered complete until all performance checks pass:

- [ ] API Pagination implemented and tested
- [ ] Database indexes verified using `.explain("executionStats")`
- [ ] Field projection verified (no unneeded fields returned)
- [ ] Lean query usage confirmed
- [ ] Request deduplication active
- [ ] TanStack Query caching configured with appropriate `staleTime`
- [ ] Route code splitting active (lazy loading heavy components)
- [ ] Image size limits enforced (< 100 KB per card thumbnail)
- [ ] API payload budget check passes (< budget limit)
- [ ] Slow 3G network simulation test passes cleanly

---

## 4. TanStack Query Caching Matrix

| Data Domain | Stale Time | Cache Time | Refetch Strategy |
|---|---|---|---|
| Category Schema | 60 minutes | 120 minutes | Static |
| Public Listing Feed | 30 seconds | 5 minutes | On window focus |
| Listing Detail | 30 seconds | 5 minutes | On mount |
| User Profile | 2 minutes | 10 minutes | On mount |
| Conversations List | 10 seconds | 2 minutes | Socket event invalidated |
| Chat Messages | Infinity | 10 minutes | Socket `message:new` prepended |
| Admin Dashboard Stats | 15 seconds | 1 minute | Manual / Poll |
