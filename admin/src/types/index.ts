export type ID = string;

export type AdminRoleName =
  | "super_admin" | "platform_admin" | "listing_moderator" | "store_moderator"
  | "ad_manager" | "finance_manager" | "support_agent" | "safety_officer" | "analytics_viewer";

export interface AdminUser {
  id: ID;
  name: string;
  email: string;
  role: AdminRoleName;
  status: "active" | "disabled";
  twoFAEnabled: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export interface AdminSession {
  admin: AdminUser;
  issuedAt: string;
  expiresAt: string;
}

export type UserAccountStatus =
  | "active" | "pending_verification" | "limited" | "under_investigation"
  | "temporarily_suspended" | "permanently_suspended" | "deactivated" | "deleted";

export interface PlatformUser {
  id: ID;
  name: string;
  mobile: string;
  email?: string;
  accountType: "individual" | "business";
  city: string;
  pincode: string;
  verifiedMobile: boolean;
  verifiedEmail: boolean;
  verifiedIdentity: boolean;
  listingsCount: number;
  storesCount: number;
  reportsReceived: number;
  riskScore: number;
  status: UserAccountStatus;
  createdAt: string;
  lastActiveAt: string;
}

export type ListingModerationStatus =
  | "draft" | "submitted" | "pending_review" | "assigned" | "under_review"
  | "requires_changes" | "changes_required" | "approved" | "active" | "rejected" | "paused"
  | "reported" | "under_investigation" | "removed" | "expired" | "sold" | "archived" | (string & {});

export interface Listing {
  id: ID;
  title: string;
  description?: string;
  price?: number;
  priceInPaise?: number;
  currency?: string;
  categoryId?: string;
  subcategoryId?: string;
  condition?: string;
  images?: string[];
  coverIndex?: number;
  sellerId?: ID;
  sellerName?: string;
  sellerRiskScore?: number;
  storeId?: string;
  location?: { city: string; pincode: string; area?: string };
  area?: string;
  city?: string;
  pincode?: string;
  fulfilment?: string;
  status: ListingModerationStatus;
  reportCount?: number;
  analytics?: { views?: number; saves?: number; chats?: number };
  submittedAt?: string;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  assignedModerator?: string;
  category?: string;
  subcategory?: string;
  negotiable?: boolean;
  expiresAt?: string;
  specs?: Record<string, any>;
  aiAudit?: { resolution?: string; noPhoneText?: boolean; watermarkPassed?: boolean };
}

export type StoreVerificationStatus =
  | "not_started" | "submitted" | "under_review" | "requires_changes"
  | "verified" | "rejected" | "expired" | "revoked";

export interface Store {
  id: ID;
  name: string;
  storeName?: string;
  ownerId: ID;
  ownerName: string;
  category?: string;
  primaryCategory?: string;
  businessType?: string;
  area?: string;
  city?: string;
  pincode?: string;
  location?: { city: string; pincode: string } | any;
  productsCount?: number;
  followers?: number;
  rating?: number;
  reviewCount?: number;
  reportCount?: number;
  verificationStatus?: StoreVerificationStatus;
  verification?: StoreVerificationStatus;
  status: any;
  createdAt: string;
}

export type CampaignStatus =
  | "draft" | "payment_pending" | "submitted" | "under_review" | "requires_changes"
  | "approved" | "scheduled" | "active" | "paused" | "rejected" | "completed" | "cancelled";

export interface AdCampaign {
  id: ID;
  name: string;
  advertiserId: ID;
  advertiserName: string;
  objective: string;
  placement: string;
  budgetInPaise: number;
  spentInPaise: number;
  startAt: string;
  endAt: string;
  status: CampaignStatus;
  createdAt: string;
}

export interface RefundRequest {
  id: ID;
  userId: ID;
  userName: string;
  service: "campaign" | "boost" | "promotion" | "adjustment";
  amountInPaise: number;
  reason: string;
  status: "requested" | "approved" | "rejected" | "processing" | "completed" | "failed";
  requestedAt: string;
}

export interface SupportTicket {
  id: ID;
  subject: string;
  userId: ID;
  userName: string;
  category: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "assigned" | "in_progress" | "waiting_user" | "escalated" | "resolved" | "closed" | "reopened";
  assignedTo?: string;
  createdAt: string;
  lastReplyAt: string;
}

export type SafetyPriority = "low" | "medium" | "high" | "critical";
export interface SafetyReport {
  id: ID;
  reporterId: ID;
  targetType: "user" | "listing" | "store" | "message";
  targetId: ID;
  category: string;
  priority: SafetyPriority;
  status: "new" | "investigating" | "actioned" | "dismissed" | "escalated";
  createdAt: string;
}

export interface AuditLogEntry {
  id: ID;
  adminId: ID;
  adminName: string;
  role: AdminRoleName;
  action: string;
  targetType: string;
  targetId?: string;
  reason?: string;
  previousValue?: unknown;
  newValue?: unknown;
  ip?: string;
  createdAt: string;
}
