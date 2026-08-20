# 04 — Identity Relationships & Ownership Rules

## Overview
This document specifies the authority, relationship model, and strict ownership rules for all entities across the Omeetso backend.

---

## 1. Core Authority Rule

> [!CAUTION]
> **NEVER TRUST CLIENT-PROVIDED IDENTITIES**  
> Under no circumstances will the backend accept `userId`, `sellerId`, `buyerId`, `ownerId`, or `adminId` from an incoming request body or query string to determine ownership or record assignment.

The authenticated identity MUST be extracted by server middleware from:
1. `req.user._id` (derived from validated User JWT)
2. `req.admin._id` (derived from validated Admin JWT)

---

## 2. Entity Identity Matrix

| Entity | Primary Authority | Foreign Key Fields | Derivation Logic |
|---|---|---|---|
| **Listing** | User Access Token | `sellerId` -> `users._id`<br>`storeId` -> `stores._id` (optional) | `sellerId = req.user._id` |
| **Store** | User Access Token | `ownerId` -> `users._id` | `ownerId = req.user._id` |
| **Conversation** | User Access Token | `buyerId` -> `users._id`<br>`sellerId` -> `listing.sellerId`<br>`participantIds` -> `[buyerId, sellerId]` | `buyerId = req.user._id`<br>`sellerId = listing.sellerId` |
| **Message** | User Access Token | `conversationId` -> `conversations._id`<br>`senderId` -> `users._id`<br>`recipientIds` -> derived from participants | `senderId = req.user._id` |
| **Offer** | User Access Token | `conversationId` -> `conversations._id`<br>`listingId` -> `listings._id`<br>`buyerId` -> `users._id`<br>`sellerId` -> `listings.sellerId` | `buyerId = req.user._id`<br>`sellerId = listing.sellerId` |
| **Support Ticket** | User Access Token | `userId` -> `users._id`<br>`assignedAdminId` -> `admin_users._id` (optional) | `userId = req.user._id` |
| **Safety Report** | User Access Token | `reporterId` -> `users._id`<br>`targetId` -> target ObjectId | `reporterId = req.user._id` |
| **Review** | User Access Token | `reviewerId` -> `users._id`<br>`targetUserId` -> target ObjectId | `reviewerId = req.user._id` |
| **Wallet** | User Access Token | `userId` -> `users._id` | `userId = req.user._id` |
| **Audit Log** | Admin Access Token | `actorAdminId` -> `admin_users._id` | `actorAdminId = req.admin._id` |

---

## 3. Ownership Enforcement Middleware Patterns

### A. Listing Ownership Guard
```typescript
export async function requireListingOwnership(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const { listingId } = req.params;
  const listing = await Listing.findById(listingId);
  if (!listing) return next(new NotFoundError("Listing not found"));
  
  if (listing.sellerId.toString() !== req.user._id.toString()) {
    return next(new ForbiddenError("You do not have permission to modify this listing"));
  }
  req.listing = listing;
  next();
}
```

### B. Conversation Participant Guard
```typescript
export async function requireConversationParticipant(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const { conversationId } = req.params;
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) return next(new NotFoundError("Conversation not found"));
  
  const isParticipant = conversation.participantIds.some(
    id => id.toString() === req.user._id.toString()
  );
  if (!isParticipant) {
    return next(new ForbiddenError("Access denied to conversation"));
  }
  req.conversation = conversation;
  next();
}
```

---

## 4. Admin Action Attribution

When an admin approves a listing, bans a user, or resolves a report:
- `actorAdminId` is recorded directly from `req.admin._id`.
- `actorRoleId` is recorded from `req.admin.role`.
- `ipAddress` is captured from `req.ip`.
- These audit fields are immutable snapshots.
