# 13 — Revenue, Promotions and Ads Audit

## Summary
The revenue system is the most complex part of the user portal. It includes a full wallet, promotions (boosts), ad campaigns, invoices, and refund tracking — all stored in localStorage with mock payment processing.

---

## Revenue Data Layer
**File:** `frontend/src/lib/revenue.ts` (764 lines, 35.4KB)

### localStorage Keys

| Key | Content |
|---|---|
| `omeetso_promotions` | Active/past promotions |
| `omeetso_boost_packages` | Boost package definitions |
| `omeetso_ad_campaigns` | Ad campaigns |
| `omeetso_ad_drafts` | Campaign drafts |
| `omeetso_ad_events` | Impression/click events |
| `omeetso_ad_dismissals` | Dismissed ad IDs |
| `omeetso_wallet` | Wallet balance + refund balance |
| `omeetso_wallet_transactions` | Transaction history |
| `omeetso_promotional_credits` | Promotional credit records |
| `omeetso_refunds` | Refund requests |
| `omeetso_billing_profile` | GST/billing details |
| `omeetso_mock_invoices` | Invoice records |
| `omeetso_payment_attempts` | Payment attempt records |

---

## Routes

| Route | File | Purpose | Status |
|---|---|---|---|
| `/promotions` | `routes/promotions.index.tsx` | Promotions dashboard | Functional (local) |
| `/promotions/new` | `routes/promotions.new.tsx` | Create new promotion (5-step) | Mock payment |
| `/promotions/listings` | `routes/promotions.listings.tsx` | Select listing to promote | Functional |
| `/promotions/stores` | `routes/promotions.stores.tsx` | Select store to promote | Functional |
| `/promotions/store-products` | `routes/promotions.store-products.tsx` | Select product to promote | Functional |
| `/promotions/custom` | `routes/promotions.custom.tsx` | Custom promotion setup | Functional |
| `/promotions/payment` | `routes/promotions.payment.tsx` | Payment confirmation | Mock |
| `/promotions/$id` | `routes/promotions.$id.tsx` | Promotion detail | Functional |
| `/promotions/$id/analytics` | `routes/promotions.$id.analytics.tsx` | Promotion performance | Mock data |
| `/ads` | `routes/ads.index.tsx` | Ad campaigns dashboard | Functional (local) |
| `/ads/new` | `routes/ads.new.tsx` | Create ad campaign (8-step) | Mock payment |
| `/ads/$id` | `routes/ads.$id.tsx` | Campaign detail | Functional |
| `/ads/$id/analytics` | `routes/ads.$id.analytics.tsx` | Campaign analytics | Mock data |
| `/wallet` | `routes/wallet.tsx` | Wallet overview | Functional (local) |
| `/wallet/add` | `routes/wallet.add.tsx` | Add funds | Mock payment |
| `/wallet/credits` | `routes/wallet.credits.tsx` | Promotional credits | Functional (local) |
| `/wallet/transactions` | `routes/wallet.transactions.tsx` | Transaction history | Functional (local) |
| `/billing` | `routes/billing.tsx` | Billing profile | Functional (local) |
| `/invoices` | `routes/invoices.tsx` | Invoice list | Functional (local) |
| `/invoice/$id` | `routes/invoice.$id.tsx` | Invoice detail | Functional (local) |

---

## Boost Packages (Hardcoded in `revenue.ts`)

| Package | Duration | Price | Visibility |
|---|---|---|---|
| Starter Boost | 3 days | ₹99 | 2× |
| Popular Boost | 7 days | ₹249 | 4× |
| Pro Boost | 15 days | ₹499 | 7× |
| Maximum Boost | 30 days | ₹899 | 10× |

---

## Ad Placements (7 placement slots)

| Placement ID | Name | Description |
|---|---|---|
| `HOME_NATIVE_FEED` | Home Feed | Native ad in home feed |
| `SEARCH_TOP` | Search Top | Above search results |
| `CATEGORY_FEATURED` | Category Featured | Top of category page |
| `HIGHLIGHTED_CARD` | Highlighted Card | Highlighted listing card |
| `LOCAL_PINCODE_FEED` | Local Pincode | Pincode-area feed |
| `URGENT_BADGE` | Urgent Badge | "Urgent" badge on listing |
| `STORE_FEATURED` | Store Featured | Featured store slot |

---

## Promotion Objectives

| ID | Label | Description |
|---|---|---|
| `views` | More Views | Get more listing views |
| `chats` | More Enquiries | Get more chat enquiries |
| `offers` | More Offers | Receive more price offers |
| `calls` | More Calls | Get more phone calls |

---

## Campaign Objectives

| ID | Label |
|---|---|
| `promote_product` | Promote a Product |
| `promote_store` | Promote a Store |
| `brand_awareness` | Brand Awareness |
| `promote_service` | Promote a Service |
| `custom` | Custom Goal |

---

## Payment Flow (Mock)

### "Pay with Wallet"
1. `computeTotals(price, credits, {useCredits})` — calculates totals
2. `debitWallet(amount)` — subtracts from `omeetso_wallet.balance`
3. `consumeCredits(creditId, amount)` — marks credits as used
4. `addWalletTxn(...)` — records transaction in history
5. `addInvoice(...)` — creates invoice record
6. `upsertPromotion(...)` / `upsertCampaign(...)` — saves to localStorage

### "Pay with UPI / Card / Netbanking"
1. Shows payment form
2. Clicks submit
3. `addPaymentAttempt({status: "completed", ...})` — records attempt
4. Same wallet/promo upsert as above

**No actual payment gateway is called. No Razorpay, Stripe, PayU, or any payment SDK is integrated.**

---

## Seeded Revenue Data (from `seedRevenueIfEmpty()`)

Called at first page load of any revenue page:

| Seeded Item | Value |
|---|---|
| Wallet balance | ₹1,500 |
| Promotional credits | 2 credits (₹200 each) |
| Existing promotions | 3 promotions (2 active, 1 expired) |
| Existing campaigns | 2 campaigns (1 active, 1 completed) |
| Invoices | 2 invoices |

---

## Admin Revenue Management

| Admin Section | Route | Data Source | Real Actions |
|---|---|---|---|
| Wallets | `/admin/wallets` | `MockDataService` | Adjust balance (localStorage only) |
| Transactions | `/admin/transactions` | `MockDataService` | View only |
| Refunds | `/admin/refunds` | `MockDataService` | Approve/reject (localStorage only) |
| Promotions overview | `/admin/promotions` | `promotionsDataService.ts` | View only (hardcoded) |
| Promotions list | `/admin/promotions/*` | `MockDataService` | Approve/reject (localStorage only) |
| Ad campaigns | `/admin/ads/*` | `MockDataService` | Approve/reject (localStorage only) |

---

## Critical Gaps

| Gap | Description | Priority |
|---|---|---|
| Payment gateway | No Razorpay/Stripe/PayU integration | CRITICAL |
| Server-side wallet | Wallet balance is client-editable | CRITICAL |
| Promotion ranking | "Boost" has no real effect on search results | HIGH |
| Ad serving | Ads shown are from mock.ts, not submitted campaigns | HIGH |
| Revenue reconciliation | No server records of any transaction | CRITICAL |
| Invoice generation | Invoices are local objects, no PDF/GST compliance | HIGH |
| Tax calculation | No GST on ad spend calculated | MEDIUM |
| Refund processing | Refunds only update local state | CRITICAL |
| Credit validation | Credits are created and used client-side | CRITICAL |

---

## Admin Ad Data Service (`admin/src/services/adsDataService.ts`)

Returns hardcoded mock stats:
- Total campaigns: 318
- Active campaigns: 284
- Monthly revenue: ₹18,45,000
- CTR: 3.8%
- ROAS: 4.2×

These are **static numbers** with no relation to actual campaign data.
