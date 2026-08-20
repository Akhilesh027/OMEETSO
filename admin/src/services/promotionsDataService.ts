export type PromotionLifecycleStatus =
  | "draft"
  | "payment_pending"
  | "payment_failed"
  | "submitted"
  | "under_review"
  | "requires_changes"
  | "approved"
  | "scheduled"
  | "active"
  | "paused"
  | "expired"
  | "completed"
  | "cancelled"
  | "rejected"
  | "refund_requested"
  | "refunded"
  | "removed";

export interface PromotionPlacementConfig {
  placementId: string;
  displayName: string;
  promotionType: "listing" | "store" | "product" | "offer";
  supportedItemType: string;
  websiteEnabled: boolean;
  mobileAppEnabled: boolean;
  desktopEnabled: boolean;
  tabletEnabled: boolean;
  androidEnabled: boolean;
  iOSEnabled: boolean;
  maxActivePromotions: number;
  rotationBehaviour: "fair_share" | "weighted_random" | "time_slot";
  rankingWeight: number;
  basePrice: number;
  activeStatus: boolean;
}

export interface PromotionPackage {
  id: string;
  packageName: string;
  internalCode: string;
  description: string;
  eligibleItemType: "listing" | "store" | "product" | "offer";
  durationDays: number;
  price: number;
  tax: number;
  discount: number;
  includedPlacements: string[];
  impressionEstimateText: string;
  categoryRestrictions: string[];
  cityRestrictions: string[];
  activeStatus: boolean;
}

export interface PromotionItem {
  id: string;
  promoterName: string;
  promoterEmail: string;
  targetId: string;
  targetTitle: string;
  targetCategory: string;
  targetCity: string;
  itemType: "listing" | "store" | "product" | "offer";
  packageId: string;
  packageName: string;
  placements: string[];
  amountPaid: number;
  status: PromotionLifecycleStatus;
  startDate: string;
  endDate: string;
  impressions: number;
  views: number;
  chats: number;
  calls: number;
  moderationNotes?: string;
}

export const PROMOTION_PLACEMENTS: PromotionPlacementConfig[] = [
  {
    placementId: "PROMO_SEARCH_TOP",
    displayName: "Top of Search Results",
    promotionType: "listing",
    supportedItemType: "Individual Listing / Vehicle",
    websiteEnabled: true,
    mobileAppEnabled: true,
    desktopEnabled: true,
    tabletEnabled: true,
    androidEnabled: true,
    iOSEnabled: true,
    maxActivePromotions: 5,
    rotationBehaviour: "weighted_random",
    rankingWeight: 90,
    basePrice: 249,
    activeStatus: true,
  },
  {
    placementId: "PROMO_CATEGORY_FEATURED",
    displayName: "Category Featured Banner",
    promotionType: "listing",
    supportedItemType: "Category Item",
    websiteEnabled: true,
    mobileAppEnabled: true,
    desktopEnabled: true,
    tabletEnabled: true,
    androidEnabled: true,
    iOSEnabled: true,
    maxActivePromotions: 3,
    rotationBehaviour: "fair_share",
    rankingWeight: 85,
    basePrice: 199,
    activeStatus: true,
  },
  {
    placementId: "PROMO_HOME_NATIVE",
    displayName: "Home Native Feed Highlight",
    promotionType: "listing",
    supportedItemType: "Home Feed Listing",
    websiteEnabled: true,
    mobileAppEnabled: true,
    desktopEnabled: true,
    tabletEnabled: true,
    androidEnabled: true,
    iOSEnabled: true,
    maxActivePromotions: 8,
    rotationBehaviour: "fair_share",
    rankingWeight: 80,
    basePrice: 499,
    activeStatus: true,
  },
  {
    placementId: "PROMO_HOME_STORE",
    displayName: "Home Sponsored Store Spotlight",
    promotionType: "store",
    supportedItemType: "Verified Store Profile",
    websiteEnabled: true,
    mobileAppEnabled: true,
    desktopEnabled: true,
    tabletEnabled: true,
    androidEnabled: true,
    iOSEnabled: true,
    maxActivePromotions: 4,
    rotationBehaviour: "fair_share",
    rankingWeight: 95,
    basePrice: 899,
    activeStatus: true,
  },
];

export const PROMOTION_PACKAGES: PromotionPackage[] = [
  {
    id: "pkg_starter",
    packageName: "Starter Boost",
    internalCode: "STARTER_3D",
    description: "3 days highlighted card placement for individual seller listings.",
    eligibleItemType: "listing",
    durationDays: 3,
    price: 99,
    tax: 18,
    discount: 0,
    includedPlacements: ["PROMO_HIGHLIGHTED_CARD"],
    impressionEstimateText: "Estimated visibility may vary depending on location, category and demand.",
    categoryRestrictions: [],
    cityRestrictions: [],
    activeStatus: true,
  },
  {
    id: "pkg_popular",
    packageName: "Popular Boost",
    internalCode: "POPULAR_7D",
    description: "7 days Top Search & Category Featured boost for products and cars.",
    eligibleItemType: "listing",
    durationDays: 7,
    price: 249,
    tax: 45,
    discount: 20,
    includedPlacements: ["PROMO_SEARCH_TOP", "PROMO_CATEGORY_FEATURED"],
    impressionEstimateText: "Estimated visibility may vary depending on location, category and demand.",
    categoryRestrictions: [],
    cityRestrictions: [],
    activeStatus: true,
  },
  {
    id: "pkg_pro",
    packageName: "Pro Boost",
    internalCode: "PRO_15D",
    description: "15 days Top Search, Category Featured & Home Native Feed boost.",
    eligibleItemType: "listing",
    durationDays: 15,
    price: 499,
    tax: 90,
    discount: 50,
    includedPlacements: ["PROMO_SEARCH_TOP", "PROMO_CATEGORY_FEATURED", "PROMO_HOME_NATIVE"],
    impressionEstimateText: "Estimated visibility may vary depending on location, category and demand.",
    categoryRestrictions: [],
    cityRestrictions: [],
    activeStatus: true,
  },
  {
    id: "pkg_maximum",
    packageName: "Maximum Boost",
    internalCode: "MAX_30D",
    description: "30 days priority ranking across Search, Home, Category & Local Pincode feeds.",
    eligibleItemType: "listing",
    durationDays: 30,
    price: 899,
    tax: 162,
    discount: 100,
    includedPlacements: ["PROMO_SEARCH_TOP", "PROMO_CATEGORY_FEATURED", "PROMO_HOME_NATIVE", "PROMO_PINCODE_FEED"],
    impressionEstimateText: "Estimated visibility may vary depending on location, category and demand.",
    categoryRestrictions: [],
    cityRestrictions: [],
    activeStatus: true,
  },
  {
    id: "pkg_store_spotlight",
    packageName: "Store Spotlight",
    internalCode: "STORE_30D",
    description: "30 days complete store profile promotion with Home Sponsored Store badge.",
    eligibleItemType: "store",
    durationDays: 30,
    price: 1999,
    tax: 360,
    discount: 200,
    includedPlacements: ["PROMO_HOME_STORE", "PROMO_SEARCH_STORE", "PROMO_CATEGORY_STORE"],
    impressionEstimateText: "Estimated visibility may vary depending on location, category and demand.",
    categoryRestrictions: [],
    cityRestrictions: [],
    activeStatus: true,
  },
];

export const MOCK_PROMOTIONS: PromotionItem[] = [];
