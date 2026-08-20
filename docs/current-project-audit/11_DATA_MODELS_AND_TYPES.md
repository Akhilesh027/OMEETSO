# 11 — Data Models and TypeScript Types

## Summary
Both portals are fully typed with TypeScript. All data models are defined in `.ts` type files. No runtime schema validation (e.g., Zod) is used for API responses because there are no API responses.

---

## User Portal Types

### Profile and Account Types (`lib/account.ts`)

```typescript
type AccountType = "individual" | "business";

type Profile = {
  name: string;
  email?: string;
  emailVerified?: boolean;
  mobile: string;
  mobileVerified?: boolean;
  city: string;
  pincode: string;
  area?: string;
  language: string;
  bio?: string;
  avatar?: string;
  accountType: AccountType;
  businessEnabled?: boolean;
  memberSince: number;
  responseTime?: string;
};

type BusinessProfile = {
  legalName: string;
  businessType: string;
  address: string;
  gstNumber?: string;
  registrationNumber?: string;
  email: string;
  mobile: string;
  documentRef?: string;
};

type VerifStatus = "not_started" | "in_progress" | "submitted" | "under_review"
  | "verified" | "requires_changes" | "rejected" | "expired";

type VerifKind = "mobile" | "email" | "identity" | "business" | "store";

type Verification = {
  status: VerifStatus;
  submittedAt?: number;
  updatedAt?: number;
  reference?: string;
  reasonForChange?: string;
  details?: Record<string, string>;
};

type VerificationMap = Record<VerifKind, Verification>;

type Notification = { id, type, title, body, isRead, createdAt, link? };
type NotifPrefs = { ... };
type PrivacySettings = { ... };
type AccountStatus = { ... };
type SavedLocation = { ... };
type SafetyReport = { ... };
type SupportTicket = { ... };
type Review = { ... };
```

### Listing Types (`lib/listings.ts`)

```typescript
type ListingStatus = "draft" | "under_review" | "active" | "requires_changes"
  | "rejected" | "paused" | "sold" | "expired" | "removed";

type ContactPref = "chat_only" | "call_and_chat" | "hide_number";
type BestContactTime = "anytime" | "morning" | "afternoon" | "evening";
type Fulfilment = "pickup" | "delivery" | "both" | "buyer";
type Condition = "new" | "like_new" | "excellent" | "good" | "fair" | "needs_repair";

type Listing = {
  id: string;
  title: string;
  price: number;
  negotiable: boolean;
  free?: boolean;
  condition: Condition;
  description: string;
  category: string;
  subcategory: string;
  images: string[];
  cover: number;
  video?: string;
  pincode: string;
  area: string;
  city: string;
  state?: string;
  fulfilment: Fulfilment;
  specs: Record<string, string>;
  contactPref: ContactPref;
  bestContactTime: BestContactTime;
  sellerName: string;
  sellerPhone?: string;
  sellerType?: "individual" | "business";
  status: ListingStatus;
  createdAt: number;
  updatedAt: number;
  publishedAt?: number;
  expiresAt?: number;
  rejection?: { reason, section, correction, policyRef?, date };
  finalSalePrice?: number;
  soldChannel?: "omeetso" | "outside";
  editHistory?: { at: number; note: string }[];
  boost?: { active: boolean; expiresAt?: number };
  method?: "quick" | "detailed";
  storeId?: string;
  storeMeta?: {
    sku?, stockStatus?, stockQty?, originalPrice?, minEnquiryQty?,
    featured?, priority?, pickup?, delivery?
  };
};

type ListingDraft = Partial<Listing> & { id, createdAt, updatedAt, method, step? };
type ListingAnalytics = { impressions, views, saves, chats, calls, offers, shares, daily[], topAreas[] };
```

### Store Types (`lib/stores.ts`)

```typescript
type StoreStatus = "draft" | "under_review" | "active" | "requires_changes"
  | "rejected" | "paused" | "suspended";

type Store = {
  id: string;
  name: string;
  description: string;
  businessType: string;
  experience: string;
  logo?: string;
  cover?: string;
  brandColor?: string;
  tagline?: string;
  primaryCategory: string;
  supportingCategories: string[];
  pincode: string;
  area: string;
  city: string;
  state?: string;
  address: string;
  landmark?: string;
  showAddressPublicly: boolean;
  businessMobile: string;
  altMobile?: string;
  whatsapp?: string;
  email: string;
  website?: string;
  contactActions: { chat, call, whatsapp, directions };
  workingHours: WorkingHour[];
  is24x7: boolean;
  lunchBreak?: { start, end };
  delivery: { pickup, localDelivery, buyerPickup, radiusKm, charge, freeAbove, sameDay, etaHours };
  verification: StoreVerification;
  status: StoreStatus;
  createdAt: number;
  updatedAt: number;
  publishedAt?: number;
  rating?: number;
  reviewCount?: number;
  followers?: number;
  responseRate?: number;
  responseTimeMins?: number;
};

type WorkingHour = {
  day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  closed: boolean;
  open: string;  // "10:00"
  close: string; // "21:00"
};
```

### Chat Types (`lib/chat.ts`)

```typescript
type ThreadStatus = "active" | "archived" | "blocked";
type MessageKind = "text" | "image" | "offer" | "transaction" | "system" | "safety";

type Thread = {
  id: string;
  productId: string;
  productTitle: string;
  productPrice: number;
  productImage?: string;
  productStatus: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar?: string;
  sellerRating?: number;
  sellerVerified?: boolean;
  buyerId: string;
  buyerName: string;
  buyerAvatar?: string;
  isUserBuyer: boolean;
  lastMessage?: string;
  lastMessageAt?: number;
  lastMessageKind?: MessageKind;
  unreadCount: number;
  status: ThreadStatus;
  isMuted?: boolean;
  isArchived?: boolean;
  isPinned?: boolean;
  activeOffer?: Offer;
  storeId?: string;
  storeName?: string;
  location?: string;
};

type Message = {
  id: string;
  threadId: string;
  senderId: string;
  kind: MessageKind;
  text?: string;
  imageUrl?: string;
  offer?: Offer;
  transaction?: TransactionConfirmation;
  system?: { event: string };
  sentAt: number;
  readAt?: number;
  status: "sent" | "delivered" | "read" | "failed";
};

type Offer = {
  id: string;
  threadId: string;
  productId: string;
  amount: number;
  originalPrice: number;
  message?: string;
  fromBuyer: boolean;
  status: "pending" | "accepted" | "declined" | "countered" | "expired" | "cancelled";
  counterAmount?: number;
  counterMessage?: string;
  expiresAt: number;
  createdAt: number;
  acceptedAt?: number;
};
```

### Revenue Types (`lib/revenue.ts`)

```typescript
type PlacementId = "HOME_NATIVE_FEED" | "SEARCH_TOP" | "CATEGORY_FEATURED"
  | "HIGHLIGHTED_CARD" | "LOCAL_PINCODE_FEED" | "URGENT_BADGE" | "STORE_FEATURED";

type PromotionObjective = "views" | "chats" | "offers" | "calls";
type CampaignObjective = "promote_product" | "promote_store" | "brand_awareness" | "promote_service" | "custom";

type BoostPackage = {
  id: string; name: string; duration: number; price: number;
  benefits: string[]; visibilityMultiplier: string;
  placements: PlacementId[]; badge?: "urgent" | "featured";
  popularTag?: string; compatibility: PlacementId[];
};

type Promotion = {
  id: string; targetId: string; targetTitle: string; targetImage?: string;
  targetAreas: string[]; objective: PromotionObjective;
  packageId: string; packageName: string; packageDuration: number;
  placements: PlacementId[]; totalPaid: number; creditsUsed: number;
  startAt: number; endAt: number;
  status: "active" | "paused" | "expired" | "cancelled";
  createdAt: number;
  analytics: PromotionAnalytics;
};

type Campaign = {
  id: string; name: string; objective: CampaignObjective;
  source: CampaignSource; creative: CampaignCreative;
  audience: CampaignAudience; placements: PlacementId[];
  schedule: CampaignSchedule; frequency: CampaignFrequency;
  status: "draft" | "submitted" | "under_review" | "active" | "paused" | "completed" | "rejected";
  createdAt: number; updatedAt: number; amountSpent: number;
  analytics: CampaignAnalytics; step: number;
};

type Wallet = {
  balance: number;
  refundBalance: number;
};

type Transaction = {
  id: string; kind: "credit" | "debit"; amount: number;
  label: string; ref: string; method?: string;
  status: "completed" | "pending" | "failed";
  createdAt: number;
};
```

---

## Admin Portal Types

### Admin Auth Types (`admin/src/types/auth.ts`)

```typescript
type AdminRole = "Super Admin" | "Platform Admin" | "Listing Moderator" | "Store Moderator"
  | "Advertisement Manager" | "Finance Manager" | "Support Agent"
  | "Safety and Fraud Officer" | "Analytics Viewer";

type AdminUser = {
  id: string; name: string; email: string; role: AdminRole;
  permissions: Permission[];
  avatar?: string;
  status: "active" | "suspended" | "locked";
  lastLoginAt: string;
  twoFactorEnabled: boolean;
  failedLoginAttempts?: number;
  lockedUntil?: string | null;
};

type AdminSession = {
  token: string; adminId: string; admin: AdminUser;
  expiresAt: string; device: string; createdAt: string;
  requiresTwoFactor?: boolean;
};

type AuthStatus = "initializing" | "unauthenticated" | "credentials_verified"
  | "two_factor_required" | "authenticated" | "session_expired"
  | "account_locked" | "access_denied";
```

### Platform Data Types (`admin/src/types/index.ts`)

```typescript
type UserAccountStatus = "active" | "pending_verification" | "limited" | "under_investigation"
  | "temporarily_suspended" | "permanently_suspended" | "deactivated" | "deleted";

type PlatformUser = {
  id, name, mobile, email?, accountType, city, pincode,
  verifiedMobile, verifiedEmail, verifiedIdentity,
  listingsCount, storesCount, reportsReceived, riskScore,
  status: UserAccountStatus, createdAt, lastActiveAt
};

type ListingModerationStatus = "draft" | "submitted" | "pending_review" | "assigned" | "under_review"
  | "requires_changes" | "approved" | "active" | "rejected" | "paused"
  | "reported" | "under_investigation" | "removed" | "expired" | "sold" | "archived";

type StoreVerificationStatus = "not_started" | "submitted" | "under_review" | "requires_changes"
  | "verified" | "rejected" | "expired" | "revoked";

type CampaignStatus = "draft" | "payment_pending" | "submitted" | "under_review"
  | "requires_changes" | "approved" | "scheduled" | "active" | "paused"
  | "rejected" | "completed" | "cancelled";

type SafetyPriority = "low" | "medium" | "high" | "critical";
type SafetyReport = { id, reporterId, targetType, targetId, category, priority, status, createdAt };
type SupportTicket = { id, subject, userId, userName, category, priority, status, assignedTo?, createdAt, lastReplyAt };
type RefundRequest = { id, userId, userName, service, amountInPaise, reason, status, requestedAt };
type AuditLogEntry = { id, adminId, adminName, role, action, targetType, targetId?, reason?, previousValue?, newValue?, ip?, createdAt };
```

---

## Type Consistency Issues

| Problem | Location | Impact |
|---|---|---|
| `AdminUser` defined twice | `types/auth.ts` AND `types/index.ts` | Two incompatible interfaces in same project |
| `AdminRole` as string literals vs enum | Dual definitions | May cause type mismatches |
| Money stored as raw number (INR) in frontend | `lib/revenue.ts` | Floating point issues |
| Money stored in paise (integer) in admin | `types/index.ts` (`priceInPaise`, `budgetInPaise`) | Inconsistent with frontend |
| `Listing` type in frontend vs admin | Different field sets | No shared type |
| `Store` type in frontend vs admin | Different field sets | No shared type |
| `status` as union strings (not enums) | All models | No runtime exhaustiveness checking |
| Dates as `number` (timestamp) in frontend | All models | Inconsistent with admin using ISO string |
| Dates as ISO string in admin | All models | Inconsistent with frontend using number |
| No Zod schemas | Both portals | Can't validate API responses at runtime |

---

## Fields That Will Need to Change for Backend Integration

| Field | Current | Backend Should Use |
|---|---|---|
| `id` | Generated locally with `Date.now()` + random | Server-generated UUID or MongoDB ObjectId |
| `createdAt` | `Date.now()` (number) | ISO 8601 string from server |
| `updatedAt` | `Date.now()` (number) | ISO 8601 string from server |
| `images` | Object URLs (blob:) or Unsplash URLs | CDN URLs after upload |
| `price` | Raw INR number | Could keep as INR but validate on server |
| `status` | Client-assigned | Server-controlled state machine |
| `sellerName` | Hardcoded from profile | FK reference to User |
| `publishedAt` | Client timestamp | Server-assigned after approval |
