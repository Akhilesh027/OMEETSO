import type { PlatformUser, Listing, Store, AdCampaign, SupportTicket, SafetyReport, RefundRequest } from "@/types";
import { USERS, LISTINGS, STORES, CAMPAIGNS, TICKETS, SAFETY_REPORTS, REFUNDS } from "@/data/mock";
import { LocalStorageService } from "@/storage/localStorageService";
import { AuditLogService } from "./auditLogService";

const STORAGE_KEYS = {
  USERS: "omeetso_admin_data_users_v3",
  LISTINGS: "omeetso_admin_data_listings_v3",
  STORES: "omeetso_admin_data_stores_v3",
  CAMPAIGNS: "omeetso_admin_data_campaigns_v3",
  TICKETS: "omeetso_admin_data_tickets_v3",
  SAFETY_REPORTS: "omeetso_admin_data_safety_v3",
  REFUNDS: "omeetso_admin_data_refunds_v3",
  FEATURE_FLAGS: "omeetso_admin_data_feature_flags_v3",
};

// Automatically clear legacy mock data from browser localStorage on load
if (typeof window !== "undefined") {
  try {
    const legacyKeys = [
      "omeetso_admin_data_users", "omeetso_admin_data_users_v2",
      "omeetso_admin_data_listings", "omeetso_admin_data_listings_v2",
      "omeetso_admin_data_stores", "omeetso_admin_data_stores_v2",
      "omeetso_admin_data_campaigns", "omeetso_admin_data_campaigns_v2",
      "omeetso_admin_data_tickets", "omeetso_admin_data_tickets_v2",
      "omeetso_admin_data_safety", "omeetso_admin_data_safety_v2",
      "omeetso_admin_data_refunds", "omeetso_admin_data_refunds_v2"
    ];
    legacyKeys.forEach(k => localStorage.removeItem(k));
  } catch (e) {
    // Ignore storage access errors
  }
}

export interface FeatureFlags {
  maintenanceMode: boolean;
  adBoostingEnabled: boolean;
  autoGstinVerification: boolean;
  platformFeePercent: number;
}

export class MockDataService {
  // --- USERS ---
  static getUsers(): PlatformUser[] {
    return LocalStorageService.getItem<PlatformUser[]>(STORAGE_KEYS.USERS, USERS);
  }

  static saveUsers(users: PlatformUser[]): void {
    LocalStorageService.setItem(STORAGE_KEYS.USERS, users);
  }

  static updateUserStatus(userId: string, status: PlatformUser["status"], reason?: string): PlatformUser[] {
    const users = this.getUsers().map((u) => (u.id === userId ? { ...u, status } : u));
    this.saveUsers(users);
    AuditLogService.logAction({
      action: (status as string) === "suspended" || status === "temporarily_suspended" ? "USER_SUSPEND" : (status as string) === "banned" || status === "permanently_suspended" ? "USER_BAN" : "USER_UPDATE",
      targetType: "User",
      targetId: userId,
      reason: reason || `Updated user status to ${status}`,
    });
    return users;
  }

  static toggleUserVerification(userId: string, field: "verifiedIdentity" | "verifiedMobile" | "verifiedEmail"): PlatformUser[] {
    const users = this.getUsers().map((u) => {
      if (u.id === userId) {
        const updated = { ...u, [field]: !u[field] };
        AuditLogService.logAction({
          action: "USER_VERIFICATION_TOGGLE",
          targetType: "User",
          targetId: userId,
          reason: `Toggled ${field} to ${updated[field]}`,
        });
        return updated;
      }
      return u;
    });
    this.saveUsers(users);
    return users;
  }

  static addUser(user: Partial<PlatformUser>): PlatformUser[] {
    const users = this.getUsers();
    const newUser: PlatformUser = {
      id: `u_${Date.now()}`,
      name: user.name || "New Admin User",
      mobile: user.mobile || "+91 99000 00000",
      email: user.email || "user@example.com",
      accountType: user.accountType || "individual",
      city: user.city || "Hyderabad",
      pincode: user.pincode || "500081",
      verifiedMobile: true,
      verifiedEmail: true,
      verifiedIdentity: false,
      listingsCount: 0,
      storesCount: 0,
      reportsReceived: 0,
      riskScore: 0,
      status: "active",
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    };
    const updated = [newUser, ...users];
    this.saveUsers(updated);
    AuditLogService.logAction({
      action: "USER_CREATE",
      targetType: "User",
      targetId: newUser.id,
      reason: `Created user ${newUser.name}`,
    });
    return updated;
  }

  static updateUser(userId: string, data: Partial<PlatformUser>): PlatformUser[] {
    const users = this.getUsers().map((u) => (u.id === userId ? { ...u, ...data } : u));
    this.saveUsers(users);
    AuditLogService.logAction({
      action: "USER_UPDATE",
      targetType: "User",
      targetId: userId,
      reason: `Updated profile details for ${data.name || userId}`,
    });
    return users;
  }

  static deleteUser(userId: string): PlatformUser[] {
    const users = this.getUsers().filter((u) => u.id !== userId);
    this.saveUsers(users);
    AuditLogService.logAction({
      action: "USER_DELETE",
      targetType: "User",
      targetId: userId,
      reason: `Deleted user account ${userId}`,
    });
    return users;
  }

  // --- LISTINGS ---
  static getListings(): Listing[] {
    return LocalStorageService.getItem<Listing[]>(STORAGE_KEYS.LISTINGS, []);
  }

  static saveListings(listings: Listing[]): void {
    LocalStorageService.setItem(STORAGE_KEYS.LISTINGS, listings);
  }

  static updateListingStatus(listingId: string, status: Listing["status"], reason?: string): Listing[] {
    const listings = this.getListings().map((l) => (l.id === listingId ? { ...l, status } : l));
    this.saveListings(listings);
    AuditLogService.logAction({
      action: status === "active" ? "LISTING_APPROVE" : status === "rejected" ? "LISTING_REJECT" : "LISTING_STATUS_CHANGE",
      targetType: "Listing",
      targetId: listingId,
      reason: reason || `Listing status set to ${status}`,
    });
    return listings;
  }

  static updateListing(listingId: string, data: Partial<Listing>): Listing[] {
    const listings = this.getListings().map((l) => (l.id === listingId ? { ...l, ...data } : l));
    this.saveListings(listings);
    AuditLogService.logAction({
      action: "LISTING_UPDATE",
      targetType: "Listing",
      targetId: listingId,
      reason: `Updated listing ${data.title || listingId}`,
    });
    return listings;
  }

  static addListing(listing: Partial<Listing>): Listing[] {
    const listings = this.getListings();
    const newListing: Listing = {
      id: `l_${Date.now()}`,
      title: listing.title || "Untitled Product Listing",
      priceInPaise: listing.priceInPaise || 100000,
      categoryId: listing.categoryId || "mobiles",
      images: listing.images && listing.images.length > 0 ? listing.images : ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400"],
      sellerId: listing.sellerId || "u_ravi",
      sellerName: listing.sellerName || "Ravi Kumar",
      location: listing.location || { city: "Hyderabad", pincode: "500081", area: "Kondapur" },
      status: listing.status || "pending_review",
      reportCount: 0,
      submittedAt: new Date().toISOString(),
    };
    const updated = [newListing, ...listings];
    this.saveListings(updated);
    AuditLogService.logAction({
      action: "LISTING_CREATE",
      targetType: "Listing",
      targetId: newListing.id,
      reason: `Created listing ${newListing.title}`,
    });
    return updated;
  }

  static deleteListing(listingId: string): Listing[] {
    const listings = this.getListings().filter((l) => l.id !== listingId);
    this.saveListings(listings);
    AuditLogService.logAction({
      action: "LISTING_DELETE",
      targetType: "Listing",
      targetId: listingId,
      reason: `Deleted listing ${listingId}`,
    });
    return listings;
  }

  // --- STORES ---
  static getStores(): Store[] {
    return LocalStorageService.getItem<Store[]>(STORAGE_KEYS.STORES, []);
  }

  static saveStores(stores: Store[]): void {
    LocalStorageService.setItem(STORAGE_KEYS.STORES, stores);
  }

  static updateStoreVerification(storeId: string, verification: Store["verification"], reason?: string): Store[] {
    const stores = this.getStores().map((s) => (s.id === storeId ? { ...s, verification } : s));
    this.saveStores(stores);
    AuditLogService.logAction({
      action: verification === "verified" ? "STORE_VERIFY_APPROVE" : "STORE_VERIFY_REJECT",
      targetType: "Store",
      targetId: storeId,
      reason: reason || `Updated store verification to ${verification}`,
    });
    return stores;
  }

  static updateStore(storeId: string, data: Partial<Store>): Store[] {
    const stores = this.getStores().map((s) => (s.id === storeId ? { ...s, ...data } : s));
    this.saveStores(stores);
    AuditLogService.logAction({
      action: "STORE_UPDATE",
      targetType: "Store",
      targetId: storeId,
      reason: `Updated store details for ${data.name || storeId}`,
    });
    return stores;
  }

  static addStore(store: Partial<Store>): Store[] {
    const stores = this.getStores();
    const newStore: Store = {
      id: `s_${Date.now()}`,
      name: store.name || "New Local Store",
      ownerId: store.ownerId || "u_priya",
      ownerName: store.ownerName || "Priya B.",
      category: store.category || "Electronics",
      location: store.location || { city: "Hyderabad", pincode: "500084" },
      productsCount: 1,
      followers: 12,
      rating: 4.8,
      reportCount: 0,
      verification: store.verification || "under_review",
      status: "active",
      createdAt: new Date().toISOString(),
    };
    const updated = [newStore, ...stores];
    this.saveStores(updated);
    AuditLogService.logAction({
      action: "STORE_CREATE",
      targetType: "Store",
      targetId: newStore.id,
      reason: `Registered new store ${newStore.name}`,
    });
    return updated;
  }

  static deleteStore(storeId: string): Store[] {
    const stores = this.getStores().filter((s) => s.id !== storeId);
    this.saveStores(stores);
    AuditLogService.logAction({
      action: "STORE_DELETE",
      targetType: "Store",
      targetId: storeId,
      reason: `Deleted store ${storeId}`,
    });
    return stores;
  }

  // --- AD CAMPAIGNS & BOOSTING ---
  static getCampaigns(): AdCampaign[] {
    return LocalStorageService.getItem<AdCampaign[]>(STORAGE_KEYS.CAMPAIGNS, CAMPAIGNS);
  }

  static saveCampaigns(campaigns: AdCampaign[]): void {
    LocalStorageService.setItem(STORAGE_KEYS.CAMPAIGNS, campaigns);
  }

  static updateCampaignStatus(campaignId: string, status: AdCampaign["status"], reason?: string): AdCampaign[] {
    const campaigns = this.getCampaigns().map((c) => (c.id === campaignId ? { ...c, status } : c));
    this.saveCampaigns(campaigns);
    AuditLogService.logAction({
      action: status === "active" ? "AD_CAMPAIGN_APPROVE" : "AD_CAMPAIGN_STATUS_CHANGE",
      targetType: "AdCampaign",
      targetId: campaignId,
      reason: reason || `Ad campaign status set to ${status}`,
    });
    return campaigns;
  }

  static boostListing(listing: Listing, placement: AdCampaign["placement"], budgetRupees: number, durationDays: number): AdCampaign[] {
    const campaigns = this.getCampaigns();
    const newCampaign: AdCampaign = {
      id: `c_boost_${Date.now()}`,
      name: `Boost: ${listing.title}`,
      advertiserId: listing.sellerId || "default_seller",
      advertiserName: listing.sellerName || "Seller",
      objective: "Chats & Leads",
      placement,
      budgetInPaise: budgetRupees * 100,
      spentInPaise: 0,
      startAt: new Date().toISOString(),
      endAt: new Date(Date.now() + durationDays * 86400_000).toISOString(),
      status: "active",
      createdAt: new Date().toISOString(),
    };
    const updated = [newCampaign, ...campaigns];
    this.saveCampaigns(updated);

    this.updateListing(listing.id, { isBoosted: true } as any);

    AuditLogService.logAction({
      action: "AD_BOOST_LISTING",
      targetType: "Listing",
      targetId: listing.id,
      reason: `Boosted listing '${listing.title}' with ₹${budgetRupees} budget on placement ${placement}`,
    });
    return updated;
  }

  static addCampaign(campaign: Partial<AdCampaign>): AdCampaign[] {
    const campaigns = this.getCampaigns();
    const newCampaign: AdCampaign = {
      id: `c_${Date.now()}`,
      name: campaign.name || "New Promo Campaign",
      advertiserId: campaign.advertiserId || "u_priya",
      advertiserName: campaign.advertiserName || "Priya B.",
      objective: campaign.objective || "Store Visits",
      placement: campaign.placement || "HOME_HERO",
      budgetInPaise: campaign.budgetInPaise || 500000,
      spentInPaise: 0,
      startAt: campaign.startAt || new Date().toISOString(),
      endAt: campaign.endAt || new Date(Date.now() + 7 * 86400_000).toISOString(),
      status: campaign.status || "under_review",
      createdAt: new Date().toISOString(),
    };
    const updated = [newCampaign, ...campaigns];
    this.saveCampaigns(updated);
    AuditLogService.logAction({
      action: "AD_CAMPAIGN_CREATE",
      targetType: "AdCampaign",
      targetId: newCampaign.id,
      reason: `Created ad campaign ${newCampaign.name}`,
    });
    return updated;
  }

  static deleteCampaign(campaignId: string): AdCampaign[] {
    const campaigns = this.getCampaigns().filter((c) => c.id !== campaignId);
    this.saveCampaigns(campaigns);
    AuditLogService.logAction({
      action: "AD_CAMPAIGN_DELETE",
      targetType: "AdCampaign",
      targetId: campaignId,
      reason: `Deleted ad campaign ${campaignId}`,
    });
    return campaigns;
  }

  // --- SAFETY REPORTS ---
  static getSafetyReports(): SafetyReport[] {
    return LocalStorageService.getItem<SafetyReport[]>(STORAGE_KEYS.SAFETY_REPORTS, SAFETY_REPORTS);
  }

  static saveSafetyReports(reports: SafetyReport[]): void {
    LocalStorageService.setItem(STORAGE_KEYS.SAFETY_REPORTS, reports);
  }

  static updateReportStatus(reportId: string, status: SafetyReport["status"], notes?: string): SafetyReport[] {
    const reports = this.getSafetyReports().map((r) => (r.id === reportId ? { ...r, status } : r));
    this.saveSafetyReports(reports);
    AuditLogService.logAction({
      action: "SAFETY_REPORT_UPDATE",
      targetType: "SafetyReport",
      targetId: reportId,
      reason: notes || `Updated safety report status to ${status}`,
    });
    return reports;
  }

  // --- REFUNDS & TRANSACTIONS ---
  static getRefunds(): RefundRequest[] {
    return LocalStorageService.getItem<RefundRequest[]>(STORAGE_KEYS.REFUNDS, REFUNDS);
  }

  static saveRefunds(refunds: RefundRequest[]): void {
    LocalStorageService.setItem(STORAGE_KEYS.REFUNDS, refunds);
  }

  static processRefund(refundId: string, status: RefundRequest["status"], reason?: string): RefundRequest[] {
    const refunds = this.getRefunds().map((r) => (r.id === refundId ? { ...r, status } : r));
    this.saveRefunds(refunds);
    AuditLogService.logAction({
      action: status === "approved" ? "REFUND_APPROVE" : "REFUND_REJECT",
      targetType: "RefundRequest",
      targetId: refundId,
      reason: reason || `Refund status set to ${status}`,
    });
    return refunds;
  }

  // --- TICKETS ---
  static getTickets(): SupportTicket[] {
    return LocalStorageService.getItem<SupportTicket[]>(STORAGE_KEYS.TICKETS, TICKETS);
  }

  static saveTickets(tickets: SupportTicket[]): void {
    LocalStorageService.setItem(STORAGE_KEYS.TICKETS, tickets);
  }

  static updateTicketStatus(ticketId: string, status: SupportTicket["status"], assignedTo?: string): SupportTicket[] {
    const tickets = this.getTickets().map((t) =>
      t.id === ticketId
        ? {
            ...t,
            status,
            ...(assignedTo !== undefined ? { assignedTo } : {}),
            lastReplyAt: new Date().toISOString(),
          }
        : t
    );
    this.saveTickets(tickets);
    AuditLogService.logAction({
      action: "SUPPORT_TICKET_UPDATE",
      targetType: "SupportTicket",
      targetId: ticketId,
      reason: `Updated support ticket status to ${status}${assignedTo ? ` assigned to ${assignedTo}` : ""}`,
    });
    return tickets;
  }

  // --- FEATURE FLAGS ---
  static getFeatureFlags(): FeatureFlags {
    return LocalStorageService.getItem<FeatureFlags>(STORAGE_KEYS.FEATURE_FLAGS, {
      maintenanceMode: false,
      adBoostingEnabled: true,
      autoGstinVerification: false,
      platformFeePercent: 2.5,
    });
  }

  static updateFeatureFlags(flags: Partial<FeatureFlags>): FeatureFlags {
    const current = this.getFeatureFlags();
    const updated = { ...current, ...flags };
    LocalStorageService.setItem(STORAGE_KEYS.FEATURE_FLAGS, updated);
    AuditLogService.logAction({
      action: "SETTINGS_FEATURE_FLAGS_UPDATE",
      targetType: "SystemSettings",
      targetId: "global_flags",
      reason: `Updated feature flags: ${JSON.stringify(flags)}`,
    });
    return updated;
  }
}

export const MOCK_USERS = USERS;
export const MOCK_LISTINGS = LISTINGS;
export const MOCK_STORES = STORES;
export const MOCK_CAMPAIGNS = CAMPAIGNS;
export const MOCK_SAFETY_REPORTS = SAFETY_REPORTS;
export const MOCK_REFUNDS = REFUNDS;
export const MOCK_TICKETS = TICKETS;

