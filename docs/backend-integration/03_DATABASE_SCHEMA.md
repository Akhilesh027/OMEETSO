# 03 — Database Schema & MongoDB Collections

## Overview
This document specifies all **28 MongoDB collections**, field types, validation constraints, and database indexes required for the Omeetso platform.

---

## 1. Complete Collection Inventory (28 Collections)

| # | Collection Name | Purpose | Primary Indexes |
|---|---|---|---|
| 1 | `users` | Platform user accounts & profiles | `phone` (unique), `email` (sparse unique) |
| 2 | `user_sessions` | Active user refresh sessions | `userId`, `refreshTokenHash`, `expiresAt` |
| 3 | `admin_users` | Admin accounts & credentials | `email` (unique) |
| 4 | `admin_sessions` | Active admin refresh sessions | `adminId`, `refreshTokenHash`, `expiresAt` |
| 5 | `otp_challenges` | Hashed OTPs & rate limit counters | `phone + createdAt`, `expiresAt` |
| 6 | `roles` | Admin role definitions | `name` (unique) |
| 7 | `permissions` | Granular permission keys | `key` (unique) |
| 8 | `categories` | Product & service categories | `slug` (unique), `row` |
| 9 | `listings` | Public classified listings | `status + createdAt`, `categoryId + priceInPaise`, `sellerId`, `location (2dsphere)` |
| 10 | `listing_revisions` | Pending edits for active listings | `listingId + status`, `sellerId` |
| 11 | `listing_moderations` | Moderation assignment & locks | `listingId`, `assignedAdminId + status` |
| 12 | `stores` | Seller storefront profiles | `ownerId`, `status`, `slug` (unique), `location (2dsphere)` |
| 13 | `store_members` | Store ownership and team roles | `storeId + userId` (unique) |
| 14 | `conversations` | Chat thread instances | `participantIds`, `buyerId + sellerId + listingId` |
| 15 | `messages` | Chat messages | `conversationId + createdAt`, `senderId`, `clientMessageId` |
| 16 | `offers` | Negotiation offers & status | `conversationId`, `listingId`, `status` |
| 17 | `support_tickets` | Customer support cases | `userId`, `assignedAdminId`, `status` |
| 18 | `support_messages` | Messages inside support tickets | `ticketId + createdAt`, `senderId` |
| 19 | `safety_reports` | Content & user violation reports | `reporterId`, `targetType + targetId`, `priority` |
| 20 | `verification_requests` | KYC & business verification | `userId`, `status`, `assignedAdminId` |
| 21 | `media_assets` | Uploaded media files & status | `ownerUserId`, `status + createdAt`, `storageKey` |
| 22 | `notifications` | User in-app notifications | `userId + isRead + createdAt` |
| 23 | `favourites` | User saved product/store IDs | `userId + targetType + targetId` (unique) |
| 24 | `recent_views` | User view history | `userId + listingId` |
| 25 | `blocked_users` | User block relationships | `userId + blockedUserId` (unique) |
| 26 | `promotions` | Listing boosts & homepage promos | `ownerUserId`, `status + endAt` |
| 27 | `ad_campaigns` | Advertiser banner campaigns | `advertiserUserId`, `status` |
| 28 | `audit_logs` | Server-generated admin audit trail | `actorAdminId`, `createdAt`, `action` |

---

## 2. Key Collection Schemas & Models

### Support Messages Schema (`support_messages`)
> *Note: Support messages are stored in a separate collection for scalability instead of an inline array.*
```typescript
const SupportMessageSchema = new Schema({
  ticketId: { type: Schema.Types.ObjectId, ref: "SupportTicket", required: true, index: true },
  senderType: { type: String, enum: ["user", "admin"], required: true },
  senderUserId: { type: Schema.Types.ObjectId, ref: "User" },
  senderAdminId: { type: Schema.Types.ObjectId, ref: "AdminUser" },
  text: { type: String, required: true },
  attachments: [{ type: String }]
}, { timestamps: true });
SupportMessageSchema.index({ ticketId: 1, createdAt: 1 });
```

### Media Assets Schema (`media_assets`)
```typescript
const MediaAssetSchema = new Schema({
  ownerUserId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  uploadedByAdminId: { type: Schema.Types.ObjectId, ref: "AdminUser" },
  purpose: { type: String, enum: ["listing_photo", "store_logo", "store_cover", "chat_attachment", "kyc_document"], required: true },
  storageKey: { type: String, required: true, unique: true },
  secureUrl: { type: String, required: true },
  isPrivate: { type: Boolean, default: false },
  status: { type: String, enum: ["unattached", "attached", "deleted"], default: "unattached", index: true },
  linkedEntityType: { type: String, enum: ["Listing", "Store", "Message", "VerificationRequest"] },
  linkedEntityId: { type: Schema.Types.ObjectId }
}, { timestamps: true });
MediaAssetSchema.index({ status: 1, createdAt: 1 }); // For unattached media background cleanup
```

### Listing Revision Schema (`listing_revisions`)
```typescript
const ListingRevisionSchema = new Schema({
  listingId: { type: Schema.Types.ObjectId, ref: "Listing", required: true, index: true },
  sellerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  priceInPaise: { type: Number, required: true },
  images: [{ type: String }],
  specs: { type: Map, of: String },
  status: { type: String, enum: ["pending_review", "approved", "rejected"], default: "pending_review", index: true }
}, { timestamps: true });
```

---

## 3. High-Frequency Query Indexes

1. **Listings Feed**: `status: 1 + createdAt: -1`
2. **Listings Category Search**: `status: 1 + categoryId: 1 + priceInPaise: 1`
3. **Listings Geo Search**: `location: "2dsphere"`
4. **My Listings**: `sellerId: 1 + status: 1`
5. **Chat Messages**: `conversationId: 1 + createdAt: 1`
6. **Chat Message Idempotency**: `senderId: 1 + clientMessageId: 1` (unique)
7. **Unattached Media Cleanup**: `status: "unattached" + createdAt: < 24 hours`
8. **Admin Audit Logs**: `actorAdminId: 1 + createdAt: -1`
