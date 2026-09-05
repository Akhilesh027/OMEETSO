export type AdReviewStatus = "submitted" | "under_review" | "requires_changes" | "approved" | "rejected";
export type AdDeliveryStatus = "scheduled" | "active" | "paused_by_advertiser" | "paused_by_admin" | "completed" | "cancelled";

export interface AdPlacement {
  placementId: string;
  name: string;
  platform: "website" | "app";
  page: "home" | "search" | "category" | "product" | "store" | "notification";
  device: "desktop" | "tablet" | "mobile" | "android" | "ios" | "all";
  creativeType: "banner" | "native_card" | "video" | "carousel" | "notification";
  ratio: string;
  baseCPM: number;
  baseCPC: number;
  minDailyBudget: number;
  activeCampaignsCount: number;
  activeStatus: boolean;
}

export interface AdCampaign {
  id: string;
  campaignTitle: string;
  advertiserName: string;
  advertiserId: string;
  objective: "Product Views" | "Store Visits" | "Chats" | "Calls" | "Website Visits" | "App Engagement";
  sourceType: "listing" | "store" | "external_url" | "custom_landing";
  headline: string;
  description: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  ctaLabel: string;
  destinationUrl: string;
  websitePlacements: string[];
  appPlacements: string[];
  targetCities: string[];
  targetCategories: string[];
  dailyBudget: number;
  totalBudget: number;
  spentBudget: number;
  startDate: string;
  endDate: string;
  reviewStatus: AdReviewStatus;
  deliveryStatus: AdDeliveryStatus;
  paymentStatus: "paid" | "pending" | "refunded";
  impressions: number;
  clicks: number;
  ctr: number; // percentage
  rejectionReason?: string;
}

export const WEBSITE_AD_PLACEMENTS: AdPlacement[] = [
  {
    placementId: "HOMEPAGE_HERO",
    name: "Home Page Banners",
    platform: "website",
    page: "home",
    device: "all",
    creativeType: "banner",
    ratio: "16:9",
    baseCPM: 120,
    baseCPC: 8,
    minDailyBudget: 500,
    activeCampaignsCount: 4,
    activeStatus: true,
  },
  {
    placementId: "CATEGORY_HEADER",
    name: "Category Page Banners",
    platform: "website",
    page: "category",
    device: "all",
    creativeType: "banner",
    ratio: "3:1",
    baseCPM: 90,
    baseCPC: 6,
    minDailyBudget: 250,
    activeCampaignsCount: 3,
    activeStatus: true,
  },
  {
    placementId: "STORE_BANNER",
    name: "Store Directory Banners",
    platform: "website",
    page: "store",
    device: "all",
    creativeType: "banner",
    ratio: "3:1",
    baseCPM: 100,
    baseCPC: 7,
    minDailyBudget: 300,
    activeCampaignsCount: 4,
    activeStatus: true,
  },
  {
    placementId: "JOBS_HEADER",
    name: "Jobs Portal Banners",
    platform: "website",
    page: "home",
    device: "all",
    creativeType: "banner",
    ratio: "3:1",
    baseCPM: 110,
    baseCPC: 8,
    minDailyBudget: 400,
    activeCampaignsCount: 2,
    activeStatus: true,
  },
  {
    placementId: "SEARCH_TOP",
    name: "Search Results Priority Spots",
    platform: "website",
    page: "search",
    device: "all",
    creativeType: "native_card",
    ratio: "4:3",
    baseCPM: 180,
    baseCPC: 12,
    minDailyBudget: 300,
    activeCampaignsCount: 8,
    activeStatus: true,
  },
  {
    placementId: "CATEGORY_FEATURED",
    name: "Category Featured Listing",
    platform: "website",
    page: "category",
    device: "all",
    creativeType: "native_card",
    ratio: "4:3",
    baseCPM: 110,
    baseCPC: 7,
    minDailyBudget: 250,
    activeCampaignsCount: 5,
    activeStatus: true,
  },
];

export const APP_AD_PLACEMENTS: AdPlacement[] = [
  {
    placementId: "APP_HOME_HERO",
    name: "App Home Top Hero Card",
    platform: "app",
    page: "home",
    device: "android",
    creativeType: "native_card",
    ratio: "16:9",
    baseCPM: 200,
    baseCPC: 15,
    minDailyBudget: 500,
    activeCampaignsCount: 5,
    activeStatus: true,
  },
  {
    placementId: "APP_SECTION_INTERLEAVED",
    name: "App In-Feed Rotating Deal Banner",
    platform: "app",
    page: "home",
    device: "all",
    creativeType: "banner",
    ratio: "3:1",
    baseCPM: 160,
    baseCPC: 11,
    minDailyBudget: 350,
    activeCampaignsCount: 4,
    activeStatus: true,
  },
  {
    placementId: "APP_SEARCH_NATIVE_RESULT",
    name: "App Search Feed Native Result",
    platform: "app",
    page: "search",
    device: "all",
    creativeType: "native_card",
    ratio: "1:1",
    baseCPM: 150,
    baseCPC: 10,
    minDailyBudget: 300,
    activeCampaignsCount: 8,
    activeStatus: true,
  },
  {
    placementId: "APP_NOTIFICATION_PROMOTION",
    name: "App Sponsored Push Inbox Card",
    platform: "app",
    page: "notification",
    device: "all",
    creativeType: "notification",
    ratio: "1:1",
    baseCPM: 250,
    baseCPC: 20,
    minDailyBudget: 1000,
    activeCampaignsCount: 1,
    activeStatus: true,
  },
];

export const MOCK_AD_CAMPAIGNS: AdCampaign[] = [];
