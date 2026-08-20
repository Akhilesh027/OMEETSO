# 11 — Testing & Quality Assurance Plan

## Overview
This document specifies unit testing, API integration testing, cross-browser real-time testing, and Playwright end-to-end (E2E) testing requirements to ensure production stability.

---

## 1. Unit & Integration Testing (`backend/tests/`)

- **Framework**: Jest + Supertest + `mongodb-memory-server`.
- **Target Coverage**: Minimum 80% coverage on core business modules (Auth, Listings, Stores, Chat, Security Middleware).

### Key Test Suites

1. **Auth & Security (`tests/auth.test.ts`)**:
   - Verify invalid OTP returns `401 Unauthorized`.
   - Verify 5 failed login attempts locks admin account for 15 minutes.
   - Verify expired access token returns `401` and refresh endpoint issues a new token.
   - Verify user with `status: TEMPORARILY_SUSPENDED` receives `403 Forbidden` on mutation APIs.

2. **Listings & Identity (`tests/listings.test.ts`)**:
   - Verify `sellerId` is populated strictly from verified JWT token, ignoring any payload `sellerId`.
   - Verify updating a listing owned by User A using User B's token returns `403 Forbidden`.
   - Verify pagination parameters (`page=1`, `limit=20`) return correct slice and pagination metadata.

3. **Store Moderation (`tests/stores.test.ts`)**:
   - Verify store creation sets status to `SUBMITTED`.
   - Verify store is hidden from public `GET /api/v1/stores` until status is updated to `APPROVED` by admin.

---

## 2. Playwright End-to-End (E2E) Scenarios

All E2E tests execute against live `frontend/`, `admin/`, and `backend/` instances using distinct browser contexts.

### E2E Test 1: Complete Listing Moderation Cycle
```typescript
test("Seller submits listing -> Admin approves -> Public views listing", async ({ browser }) => {
  // Context 1: Seller (User Portal)
  const sellerContext = await browser.newContext();
  const sellerPage = await sellerContext.newPage();
  await sellerPage.goto("http://localhost:5173/sell/quick");
  // Fill title, price, photos, submit -> receives confirmation page
  
  // Context 2: Admin (Admin Portal)
  const adminContext = await browser.newContext();
  const adminPage = await adminContext.newPage();
  await adminPage.goto("http://localhost:5174/admin/listings/pending");
  await adminPage.click("text=Approve");
  
  // Verify Seller sees status update to ACTIVE
  await sellerPage.goto("http://localhost:5173/listings");
  await expect(sellerPage.locator(".badge-status")).toHaveText("Active");
  
  // Context 3: Guest Visitor
  const guestContext = await browser.newContext();
  const guestPage = await guestContext.newPage();
  await guestPage.goto("http://localhost:5173/home");
  await expect(guestPage.locator("text=iPhone 14 Pro")).toBeVisible();
});
```

### E2E Test 2: Cross-Browser Real-Time Chat
```typescript
test("Buyer sends message in Chrome -> Seller receives in Firefox", async ({ browser }) => {
  const buyerContext = await browser.newContext(); // Chrome context
  const sellerContext = await browser.newContext(); // Firefox context
  
  const buyerPage = await buyerContext.newPage();
  const sellerPage = await sellerContext.newPage();
  
  // Buyer starts chat
  await buyerPage.goto("http://localhost:5173/product/product-123");
  await buyerPage.click("text=Chat with seller");
  await buyerPage.fill("input[name='message']", "Is this available in Madhapur?");
  await buyerPage.click("button[type='submit']");
  
  // Seller receives message instantly via Socket.IO
  await sellerPage.goto("http://localhost:5173/chats");
  await expect(sellerPage.locator("text=Is this available in Madhapur?")).toBeVisible();
});
```

---

## 3. High-Volume Performance Benchmark

Using `k6` or `autocannon` to verify backend SLAs under load:
- **Load Target**: 1,000 concurrent virtual users.
- **Criteria**:
  - `GET /api/v1/listings`: Response time p95 < 300ms.
  - `GET /api/v1/categories`: Response time p95 < 50ms (cached).
  - Socket message delivery latency < 100ms.
