# 17 — Admin Workflows Audit

## Summary
The admin portal has 9 distinct role types with comprehensive moderation workflows. All workflows update localStorage and log to an in-memory audit trail. No workflow has real backend connectivity.

---

## Core Admin Workflows

### Workflow 1: Listing Moderation

**Who:** Listing Moderator, Platform Admin, Super Admin

```
1. Moderator opens /admin/listings/pending
2. Reviews listing card (title, images, price, category, seller)
3. Opens /admin/listings/:id for full review
4. Makes decision:
   a. APPROVE → status: "active", audit: "LISTING_APPROVE"
   b. REJECT → enter reason → status: "rejected", audit: "LISTING_REJECT"  
   c. REQUEST CHANGES → enter reason → status: "requires_changes", audit: "LISTING_CHANGES_REQUESTED"
   d. PAUSE → status: "paused", audit: "LISTING_PAUSE"
   e. REMOVE → status: "removed", audit: "LISTING_REMOVE"
   f. ASSIGN → assign to specific moderator → status: "assigned"
```

**Current state:** Action updates `omeetso_admin_data_listings_v2` in localStorage and logs to `omeetso_admin_audit_logs`.

**What's missing:**
- User receives no notification of decision
- User's listing status in their own portal is not updated
- No email/SMS notification sent

---

### Workflow 2: Store Verification

**Who:** Store Moderator, Platform Admin, Super Admin

```
1. Store Moderator opens /admin/stores/applications
2. Reviews store application:
   - Business name, type, GST number
   - Address, location
   - Contact info
   - Working hours
3. Opens /admin/stores/:id
4. Makes decision:
   a. VERIFY → toggles verification fields → status: "verified"
   b. APPROVE → status: "active"
   c. REJECT → enter reason → status: "rejected"
   d. REQUEST CHANGES → status: "requires_changes"
   e. SUSPEND → status: "suspended"
```

---

### Workflow 3: User Management

**Who:** Multiple roles (see permissions)

```
1. Admin opens /admin/users
2. Searches/filters users
3. Opens user profile
4. Takes action:
   a. WARN → creates warning record
   b. LIMIT → limits listing creation
   c. SUSPEND (temporary) → status: "temporarily_suspended"
   d. BAN → status: "permanently_suspended"
   e. VERIFY IDENTITY → sets verifiedIdentity: true
   f. VERIFY MOBILE → sets verifiedMobile: true
   g. VERIFY EMAIL → sets verifiedEmail: true
```

---

### Workflow 4: Ad Campaign Review

**Who:** Advertisement Manager, Platform Admin, Super Admin

```
1. Ad Manager opens /admin/ads/review
2. Reviews campaign:
   - Objective, creative (headline, image, CTA)
   - Audience (pincodes, categories, intents)
   - Placements selected
   - Budget and schedule
3. Makes decision:
   a. APPROVE → status: "approved" → auto-schedules
   b. REJECT → enter reason → status: "rejected"
   c. REQUEST CHANGES → status: "requires_changes"
   d. PAUSE active campaign → status: "paused"
```

---

### Workflow 5: Safety Report Investigation

**Who:** Safety and Fraud Officer, Platform Admin, Super Admin

```
1. Officer opens /admin/safety-reports
2. Filters by priority (Critical, High, Medium, Low)
3. Opens report detail
4. Investigation:
   a. Assign to self
   b. Review reported content
   c. View reporter history
4. Takes action:
   a. RESTRICT USER → limits account
   b. SUSPEND USER → temporary suspension
   c. REMOVE CONTENT → removes listing/store
   d. FREEZE WALLET → prevents financial transactions
   e. ESCALATE → escalates to senior officer
   f. DISMISS → marks as false report
```

---

### Workflow 6: Refund Processing

**Who:** Finance Manager, Platform Admin, Super Admin

```
1. Finance opens /admin/refunds
2. Reviews refund request:
   - User, service, amount, reason
3. Makes decision:
   a. APPROVE → triggers wallet credit
   b. REJECT → sends rejection reason
   c. SET PROCESSING → marks as in-progress
4. Refund records updated in localStorage
```

---

### Workflow 7: Support Ticket Handling

**Who:** Support Agent, all admin roles (view only)

```
1. Agent opens /admin/support
2. Filters by priority or status
3. Opens ticket
4. Actions:
   a. REPLY → adds response
   b. ASSIGN → assigns to self or colleague
   c. ESCALATE → escalates priority
   d. CLOSE → marks as closed
   e. REOPEN → if user reports issue again
```

---

### Workflow 8: Admin User Management

**Who:** Super Admin only (requires `admins.*` permissions)

```
/admin/admin-users
  → Create new admin → set role, email, permissions
  → Edit existing admin → change role or permissions
  → Disable admin → prevent login
```

**Current state:** Mapped to `UsersListPage.tsx` (wrong page). Functionality not fully implemented.

---

### Workflow 9: Promotion Review

**Who:** Advertisement Manager, Platform Admin, Super Admin

```
1. Ad Manager opens /admin/promotions/pending
2. Reviews promotion request:
   - Target listing/store
   - Package selected
   - Placements chosen
   - Amount paid
3. Makes decision:
   a. APPROVE → activate promotion
   b. REJECT → refund amount
   c. COMMENT → request more info
```

---

### Workflow 10: Platform Settings & Feature Flags

**Who:** Super Admin, Platform Admin

```
/admin/settings
  → Edit platform settings:
    - maintenanceMode: true/false
    - adBoostingEnabled: true/false
    - autoGstinVerification: true/false
    - platformFeePercent: number
```

Feature flags are stored in `omeetso_admin_data_feature_flags_v2`.
**Current state:** The settings page is mapped to the wrong component (`RolesPage.tsx`).

---

## Admin Audit Log System

### How It Works (Current)

1. Admin takes any action (approve, reject, suspend, etc.)
2. `AuditLogService.logAction(...)` is called
3. New `AuditLogEntry` is created and prepended to existing logs
4. Stored in `omeetso_admin_audit_logs` (localStorage)
5. Viewable on `/admin/audit-logs`

### Audit Log Fields

| Field | Description |
|---|---|
| `id` | Auto-generated `AUD-timestamp-random` |
| `adminId` | ID of acting admin (from session) |
| `adminName` | Name of acting admin |
| `role` | Admin role at time of action |
| `action` | Action string (e.g., `USER_SUSPEND`, `LISTING_APPROVE`) |
| `targetType` | Type being acted on (`User`, `Listing`, `Store`, etc.) |
| `targetId` | ID of the target |
| `reason` | Admin-entered reason |
| `previousValue` | State before action |
| `newValue` | State after action |
| `timestamp` | ISO datetime of action |
| `sessionId` | Session identifier |

### Audit Actions Tracked

| Action String | Trigger |
|---|---|
| `USER_SUSPEND` | User suspension |
| `USER_BAN` | User ban |
| `USER_UPDATE` | User update |
| `USER_CREATE` | User creation |
| `USER_VERIFICATION_TOGGLE` | Verification toggle |
| `LISTING_APPROVE` | Listing approved |
| `LISTING_REJECT` | Listing rejected |
| `LISTING_CHANGES_REQUESTED` | Changes requested |
| `LISTING_REMOVE` | Listing removed |
| `LISTING_PAUSE` | Listing paused |
| `STORE_APPROVE` | Store approved |
| `STORE_REJECT` | Store rejected |
| `STORE_SUSPEND` | Store suspended |
| `REFUND_APPROVE` | Refund approved |
| `WALLET_FREEZE` | Wallet frozen |
| `LOGIN_SUCCESS` | Admin login |
| `LOGOUT` | Admin logout |

**Problem:** Audit logs exist only in localStorage. On page refresh after clearing cache, or across devices, all audit history is lost.

---

## Admin Notification System

There is **no admin notification system**. Admins have no way to be:
- Notified when a new listing is submitted
- Alerted when a safety report comes in
- Notified when a support ticket is raised
- Alerted on high-priority events

The dashboard shows hardcoded alert counts that never change in real-time.
