# 16 — User Flows and Journeys

## Complete User Journeys

### Journey 1: New User Registration

```
/ (Splash) 
  → /login (Phone entry)
    → /otp (OTP verify — code: 1234)
      → /profile-setup (Name, city, language)
        → /location (Pincode + area)
          → /welcome
            → /home
```

**Blockers for real implementation:**
- No real SMS gateway for OTP
- No account creation API
- No phone number uniqueness check
- OTP is hardcoded (`1234`)

---

### Journey 2: Guest Browse

```
/ (Splash)
  → /login (Click "Continue as Guest")
    → /home (Full browse access)
      → /search → /results → /product/$id
```

**Notes:** Guest can browse all public content but cannot chat, save items (not enforced — localStorage is still used), or sell.

---

### Journey 3: Post a Listing (Quick Sell)

```
/home or /account
  → /sell (Choose Quick or Detailed)
    → /sell/quick (Step 1: Photos)
      → (Step 2: Details — title, price, condition, description)
        → (Step 3: Category & Location)
          → (Step 4: Preview)
            → /sell/quick/success
              → /listings (View all listings)
```

**Blockers:**
- Listing is saved to localStorage only
- Image upload uses object URLs (no real CDN)
- Status set to `"active"` immediately (no admin review in user flow)
- Admin portal never sees these listings

---

### Journey 4: Post a Listing (Detailed Sell)

Same as Quick Sell but with additional step for specs:

```
/sell/detailed
  → Steps: Photos → Details → Specs → Category → Location → Contact → Preview
    → /sell/detailed/success
```

---

### Journey 5: Create a Store

```
/account or /sell
  → /store/create (Step 1: Store Info — name, description, business type)
    → (Step 2: Branding — logo, cover, tagline)
      → (Step 3: Category)
        → (Step 4: Location — pincode, area, address)
          → (Step 5: Contact & Hours — mobile, email, working hours)
            → (Step 6: Delivery settings)
              → (Step 7: Verification — mobile verification mock)
                → (Step 8: Preview)
                  → (Submit → status: "under_review")
                    → /store/success
```

**Blockers:**
- Store saved to localStorage with status `"under_review"`
- Admin portal never receives the store application
- No real document upload for business verification

---

### Journey 6: Buy — Contact Seller via Chat

```
/product/$id (View listing)
  → Click "Chat" button
    → /chats (Opens or creates thread)
      → /chat/$id (Send message)
        → (Optionally make an offer)
```

**Blockers:**
- Seller never receives the message (localStorage-isolated)
- Thread only exists in buyer's browser

---

### Journey 7: Offer Negotiation

```
/chat/$id
  → Click "Make Offer"
    → Enter amount + message
      → Offer created (localStorage)
        → Seller "accepts" (only visible to buyer)
          → /transaction/$offerId (Confirm transaction)
            → /listing/$id/manage → Mark as sold
```

---

### Journey 8: Promote a Listing

```
/listings or /listing/$id/manage
  → Click "Promote"
    → /promotions/listings (Select listing)
      → /promotions/new?listingId=... (Step 1: Objective)
        → (Step 2: Package selection)
          → (Step 3: Placements)
            → (Step 4: Preview)
              → (Step 5: Checkout — pay via wallet/UPI/card)
                → Promotion saved to localStorage
                  → Wallet debited locally
```

**Blockers:**
- No real payment gateway
- Promotion never reaches ad-serving system
- Listing ranking not actually changed

---

### Journey 9: Create an Ad Campaign

```
/ads → /ads/new (Step 1: Objective)
  → (Step 2: Source — product/store/custom)
    → (Step 3: Creative — headline, image, CTA)
      → (Step 4: Audience — pincodes, categories, intents)
        → (Step 5: Placements)
          → (Step 6: Budget & Schedule)
            → (Step 7: Preview)
              → (Step 8: Pay & Submit)
                → Campaign saved to localStorage
```

---

### Journey 10: Admin Review Listing

```
/admin/dashboard (See "184 pending listings")
  → /admin/listings/pending (Filter by status)
    → /admin/listings/:id (View listing detail)
      → Click "Approve" / "Reject" / "Request Changes"
        → Status updated in localStorage
          → Audit log written to localStorage
```

**Critical gap:** This approval updates `omeetso_admin_data_listings_v2` in the admin localStorage. The user portal reads `omeetso_user_listings`. These are completely separate. The user's listing status is never updated by admin action.

---

### Journey 11: Admin Suspend User

```
/admin/users (Search user)
  → /admin/users/:id (User detail)
    → Click "Suspend"
      → Enter reason
        → `MockDataService.updateUserStatus(id, "suspended", reason)`
          → Updated in `omeetso_admin_data_users_v2` localStorage
            → AuditLogService.logAction("USER_SUSPEND") → localStorage
```

**Critical gap:** The user can still browse the site. The suspension only exists in admin's localStorage.

---

## Feature Gaps Visible in User Flows

| Flow | Gap | Impact |
|---|---|---|
| Login | No real SMS/OTP | Cannot onboard real users |
| Listing creation | No backend submission | Listings invisible to others |
| Store creation | No admin notification | Store applications lost |
| Chat | No message delivery | Users cannot communicate |
| Promotion | No real payment | Revenue not collected |
| Admin approval | No user notification | Users don't know their listing status |
| Admin suspension | No enforcement | Suspended users can still browse |
| Safety reports | No admin alert | Reports go unreviewed |
| Support tickets | No admin visibility | Tickets go unresponded |

---

## State Persistence Summary

| Data Type | Survives Refresh | Survives Tab Close | Survives Device Change | Shared Between Users |
|---|---|---|---|---|
| User listings | YES | YES | NO | NO |
| Chat messages | YES | YES | NO | NO |
| Wallet balance | YES | YES | NO | NO |
| Promotions | YES | YES | NO | NO |
| Profile | YES | YES | NO | NO |
| Saved items | YES | YES | NO | NO |
| Store data | YES | YES | NO | NO |
| Admin session | YES | YES | NO | NO |
| Admin mock data | YES | YES | NO | NO |
| Audit logs | YES | YES | NO | NO |
