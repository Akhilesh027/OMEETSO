// Omeetso — Phase 5 Revenue / Promotions / Ads / Wallet data layer.
// Frontend + localStorage only. No real payments, no backend.

export const LS = {
  promotions: "omeetso_promotions",
  boostPackages: "omeetso_boost_packages",
  campaigns: "omeetso_ad_campaigns",
  drafts: "omeetso_ad_drafts",
  events: "omeetso_ad_events",
  dismissals: "omeetso_ad_dismissals",
  wallet: "omeetso_wallet",
  txns: "omeetso_wallet_transactions",
  credits: "omeetso_promotional_credits",
  refunds: "omeetso_refunds",
  billing: "omeetso_billing_profile",
  invoices: "omeetso_mock_invoices",
  attempts: "omeetso_payment_attempts",
} as const;

const isB = typeof window !== "undefined";
const subs = new Set<() => void>();
export const subscribe = (cb: () => void) => { subs.add(cb); return () => subs.delete(cb); };
const read = <T,>(k: string, fb: T): T => {
  if (!isB) return fb;
  try { const raw = localStorage.getItem(k); return raw ? (JSON.parse(raw) as T) : fb; } catch { return fb; }
};
const write = (k: string, v: unknown) => {
  if (!isB) return;
  try { localStorage.setItem(k, JSON.stringify(v)); for (const cb of subs) cb(); } catch { /* ignore */ }
};

export const newId = (p = "ID") =>
  `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`.toUpperCase();

export const formatINR = (n: number) =>
  "₹" + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Math.max(0, Math.round(n)));

export const formatDate = (t: number) =>
  new Date(t).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export const formatDateTime = (t: number) =>
  new Date(t).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

// ---------- Boost Packages ----------
export type BoostPackage = {
  id: string;
  name: string;
  duration: number; // days
  price: number;
  benefits: string[];
  visibilityMultiplier: string;
  placements: PlacementId[];
  badge?: "urgent" | "featured";
  popularTag?: string;
  compatibility: PlacementId[];
};

export const DEFAULT_PACKAGES: BoostPackage[] = [
  {
    id: "starter",
    name: "⚡ Quick Boost Plan",
    duration: 3,
    price: 99,
    benefits: ["Featured Badge", "Higher Category Placement", "Estimated 2× Reach & Inquiries"],
    visibilityMultiplier: "2×",
    placements: ["CATEGORY_FEATURED", "HIGHLIGHTED_CARD"],
    compatibility: ["CATEGORY_FEATURED", "HIGHLIGHTED_CARD", "LOCAL_PINCODE_FEED"],
  },
  {
    id: "popular",
    name: "🚀 Popular Growth Boost",
    duration: 7,
    price: 249,
    benefits: ["SPONSORED Badge", "Top Search Priority", "Category Header Placement", "Estimated 5× Reach"],
    visibilityMultiplier: "5×",
    placements: ["SEARCH_TOP", "CATEGORY_FEATURED", "HIGHLIGHTED_CARD"],
    popularTag: "Most Popular",
    compatibility: ["SEARCH_TOP", "CATEGORY_FEATURED", "HIGHLIGHTED_CARD", "LOCAL_PINCODE_FEED"],
  },
  {
    id: "pro",
    name: "👑 Pro Mega Boost",
    duration: 15,
    price: 499,
    benefits: ["Homepage Banner Feature", "Top Search Ranking", "URGENT / Featured Badge", "Estimated 10× Reach"],
    visibilityMultiplier: "10×",
    badge: "urgent",
    placements: ["SEARCH_TOP", "CATEGORY_FEATURED", "HOME_HERO", "URGENT_BADGE", "HIGHLIGHTED_CARD"],
    compatibility: ["SEARCH_TOP", "CATEGORY_FEATURED", "HOME_HERO", "URGENT_BADGE", "HIGHLIGHTED_CARD", "LOCAL_PINCODE_FEED"],
  },
  {
    id: "urgent_sale_3",
    name: "🔴 Urgent Sale Clearance",
    duration: 3,
    price: 49,
    benefits: ["Pulsing Red 'URGENT' Ribbon", "Fast Deal Filter Priority", "Estimated 3,000+ Bargain Hunters"],
    visibilityMultiplier: "3×",
    badge: "urgent",
    placements: ["URGENT_BADGE"],
    compatibility: ["URGENT_BADGE"],
  },
  {
    id: "golden_glow_7",
    name: "✨ Golden Card Highlight",
    duration: 7,
    price: 89,
    benefits: ["Illuminated Golden Glowing Border", "Elevated Visual Hierarchy", "Estimated 6,000+ Category Shoppers"],
    visibilityMultiplier: "3.5×",
    placements: ["HIGHLIGHTED_CARD"],
    compatibility: ["HIGHLIGHTED_CARD"],
  },
  {
    id: "search_top_3",
    name: "🔍 Search Results Spotlight",
    duration: 3,
    price: 149,
    benefits: ["Guaranteed Top 1-3 Search Spots", "SPONSORED Golden Badge", "Estimated 5,000+ Active Searchers"],
    visibilityMultiplier: "5×",
    placements: ["SEARCH_TOP"],
    compatibility: ["SEARCH_TOP"],
  },
];

export const BANNER_PACKAGES: BoostPackage[] = [
  {
    id: "banner_hero_7",
    name: "🎨 Home Page Banner (7 Days)",
    duration: 7,
    price: 499,
    benefits: ["Main Homepage Banner Placement", "Direct Store / Product Link", "Estimated 20,000+ Local Impressions"],
    visibilityMultiplier: "8×",
    placements: ["HOME_HERO"],
    compatibility: ["HOME_HERO"],
  },
  {
    id: "banner_hero_14",
    name: "🌟 Home Page Banner (14 Days)",
    duration: 14,
    price: 899,
    benefits: ["14 Days Prime Banner Rotation on Homepage", "Hyperlocal District Targeting", "Estimated 45,000+ Local Reach"],
    visibilityMultiplier: "14×",
    popularTag: "High ROI",
    placements: ["HOME_HERO"],
    compatibility: ["HOME_HERO"],
  },
  {
    id: "banner_hero_30",
    name: "👑 Home Page Banner (30 Days)",
    duration: 30,
    price: 1499,
    benefits: ["30 Days Continuous Rotation on Homepage", "Direct Store & WhatsApp Inquiry Link", "Estimated 100,000+ Impressions"],
    visibilityMultiplier: "25×",
    badge: "urgent",
    placements: ["HOME_HERO"],
    compatibility: ["HOME_HERO"],
  },
  {
    id: "banner_category_7",
    name: "🏷️ Category Page Banner (7 Days)",
    duration: 7,
    price: 399,
    benefits: ["Category Search Top Banner", "High Buyer Intent Audience", "Estimated 25,000+ Local Impressions"],
    visibilityMultiplier: "8×",
    placements: ["CATEGORY_HERO"],
    compatibility: ["CATEGORY_HERO"],
  },
  {
    id: "banner_category_14",
    name: "🏷️ Category Page Banner (14 Days)",
    duration: 14,
    price: 699,
    benefits: ["Category Search Top Banner", "High Buyer Intent Audience", "Estimated 50,000+ Local Impressions"],
    visibilityMultiplier: "12×",
    popularTag: "Popular Banner",
    placements: ["CATEGORY_HERO"],
    compatibility: ["CATEGORY_HERO"],
  },
  {
    id: "banner_store_14",
    name: "🏬 Store Directory Banner (14 Days)",
    duration: 14,
    price: 499,
    benefits: ["Top billboard on /stores directory", "Verified Merchant Shield", "Estimated 25,000+ Local Shoppers"],
    visibilityMultiplier: "10×",
    placements: ["HOME_SPONSORED_STORE"],
    compatibility: ["HOME_SPONSORED_STORE"],
  },
  {
    id: "banner_jobs_14",
    name: "💼 Jobs Portal Banner (14 Days)",
    duration: 14,
    price: 699,
    benefits: ["Top billboard on Omeetso Local Jobs portal", "Direct Call & WhatsApp Applications", "Estimated 25,000+ Candidates"],
    visibilityMultiplier: "11×",
    placements: ["CATEGORY_HERO"],
    compatibility: ["CATEGORY_HERO"],
  },
];

export function listPackages(): BoostPackage[] {
  const raw = read<BoostPackage[]>(LS.boostPackages, []);
  return raw.length ? raw : DEFAULT_PACKAGES;
}

export function listBannerPackages(): BoostPackage[] {
  return BANNER_PACKAGES;
}

// ---------- Placements ----------
export type PlacementId =
  | "SEARCH_TOP"
  | "CATEGORY_FEATURED"
  | "HOME_NATIVE_FEED"
  | "LOCAL_PINCODE_FEED"
  | "URGENT_BADGE"
  | "HIGHLIGHTED_CARD"
  | "HOME_HERO"
  | "HOME_CATEGORY_STRIP"
  | "HOME_SPONSORED_STORE"
  | "SEARCH_NATIVE_RESULT"
  | "SEARCH_SPONSORED_STORE"
  | "CATEGORY_HERO"
  | "CATEGORY_NATIVE_FEED"
  | "PRODUCT_CONTEXTUAL"
  | "STORE_FEATURED_OFFER"
  | "STORE_SPONSORED_PRODUCT"
  | "NOTIFICATION_PROMOTION";

export const PLACEMENTS: {
  id: PlacementId;
  name: string;
  description: string;
  format: string;
  ratio: string;
  estImpressions: string;
  price: number;
  kind: "promotion" | "ad" | "both";
}[] = [
  { id: "HOME_HERO", name: "Home Page Banners", description: "Wide banner across the main homepage.", format: "Wide banner", ratio: "16:9", estImpressions: "8,000–25,000", price: 350, kind: "ad" },
  { id: "CATEGORY_HERO", name: "Category Page Banners", description: "Banner at the top of category pages.", format: "Category banner", ratio: "3:1", estImpressions: "4,500–12,000", price: 210, kind: "ad" },
  { id: "HOME_SPONSORED_STORE", name: "Store Directory Banners", description: "Spotlight showroom banner on store directory.", format: "Directory banner", ratio: "3:1", estImpressions: "3,500–8,000", price: 220, kind: "ad" },
  { id: "SEARCH_TOP", name: "Search Results Priority", description: "Appear near the top of relevant search results.", format: "Sponsored search card", ratio: "1:1", estImpressions: "3,000–6,000", price: 120, kind: "both" },
  { id: "CATEGORY_FEATURED", name: "Category Featured Placement", description: "Gain visibility within your product category.", format: "Featured card", ratio: "1:1", estImpressions: "2,500–5,000", price: 90, kind: "both" },
  { id: "URGENT_BADGE", name: "Urgent Sale Badge", description: "Add a pulsing urgent visual label to your listing.", format: "Badge overlay", ratio: "n/a", estImpressions: "n/a", price: 40, kind: "promotion" },
  { id: "HIGHLIGHTED_CARD", name: "Golden Highlighted Card", description: "Enhanced glowing card border in product feeds.", format: "Highlighted card", ratio: "1:1", estImpressions: "included", price: 30, kind: "promotion" },
];

export const getPlacement = (id: PlacementId) => PLACEMENTS.find((p) => p.id === id)!;

// ---------- Promotions ----------
export type PromotionObjective =
  | "views" | "chats" | "calls" | "offers" | "sell_faster" | "reach_area";

export const PROMOTION_OBJECTIVES: { id: PromotionObjective; label: string; description: string }[] = [
  { id: "views", label: "Get more views", description: "Increase how many nearby users see your listing." },
  { id: "chats", label: "Get more chats", description: "Bring more interested buyers into chat." },
  { id: "calls", label: "Get more calls", description: "Reach buyers likely to call you." },
  { id: "offers", label: "Receive more offers", description: "Attract more offers from serious buyers." },
  { id: "sell_faster", label: "Sell faster", description: "Push your listing to a wider nearby audience." },
  { id: "reach_area", label: "Reach a specific nearby area", description: "Target buyers around selected pincodes." },
];

export type PromotionStatus =
  | "draft" | "payment_pending" | "under_review" | "scheduled"
  | "active" | "paused" | "completed" | "expired" | "rejected" | "cancelled";

export type PromotionTarget = {
  kind: "listing" | "store" | "store_product";
  refId: string; // listing id, store id, or store-product id
};

export type Promotion = {
  id: string;
  target: PromotionTarget;
  objective: PromotionObjective;
  packageId: string;
  packageName: string;
  duration: number;
  placements: PlacementId[];
  areas: string[];   // pincode / area labels
  radiusKm?: number;
  startAt: number;
  endAt: number;
  baseAmount: number;
  tax: number;
  creditsApplied: number;
  totalAmount: number;
  paymentMethod?: string;
  paymentId?: string;
  status: PromotionStatus;
  createdAt: number;
  updatedAt: number;
  amountSpent: number;
  analytics: PromotionAnalytics;
  customBudget?: { daily?: number; total?: number };
};

export type PromotionAnalytics = {
  impressions: number;
  views: number;
  saves: number;
  chats: number;
  calls: number;
  offers: number;
  shares: number;
  organicViews: number;
  promotedViews: number;
  daily: { d: string; views: number; imp: number }[];
  byArea: { area: string; pct: number }[];
  byPlacement: { id: PlacementId; imp: number }[];
};

const seedPromotionAnalytics = (mult: number): PromotionAnalytics => ({
  impressions: Math.round(8420 * mult), views: Math.round(1640 * mult),
  saves: Math.round(126 * mult), chats: Math.round(48 * mult),
  calls: Math.round(21 * mult), offers: Math.round(14 * mult), shares: Math.round(9 * mult),
  organicViews: Math.round(320 * mult), promotedViews: Math.round(1320 * mult),
  daily: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d, i) => ({
    d, views: Math.round((180 + i * 30) * mult), imp: Math.round((900 + i * 150) * mult),
  })),
  byArea: [
    { area: "Madhapur", pct: 32 }, { area: "Kondapur", pct: 24 },
    { area: "Gachibowli", pct: 18 }, { area: "Kukatpally", pct: 14 }, { area: "Ameerpet", pct: 12 },
  ],
  byPlacement: [
    { id: "SEARCH_TOP", imp: Math.round(3200 * mult) },
    { id: "CATEGORY_FEATURED", imp: Math.round(2800 * mult) },
    { id: "HOME_NATIVE_FEED", imp: Math.round(2100 * mult) },
    { id: "HIGHLIGHTED_CARD", imp: Math.round(320 * mult) },
  ],
});

export function listPromotions(): Promotion[] { return read<Promotion[]>(LS.promotions, []); }
export function getPromotion(id: string) { return listPromotions().find((p) => p.id === id); }
export function upsertPromotion(p: Promotion) {
  const all = listPromotions();
  const i = all.findIndex((x) => x.id === p.id);
  const next = { ...p, updatedAt: Date.now() };
  if (i === -1) all.unshift(next); else all[i] = next;
  write(LS.promotions, all);
  return next;
}
export function setPromotionStatus(id: string, status: PromotionStatus) {
  const p = getPromotion(id); if (!p) return;
  upsertPromotion({ ...p, status });
}
export function extendPromotion(id: string, days: number) {
  const p = getPromotion(id); if (!p) return;
  upsertPromotion({ ...p, endAt: p.endAt + days * 86400000 });
}
export function increasePromotionBudget(id: string, delta: number) {
  const p = getPromotion(id); if (!p) return;
  upsertPromotion({ ...p, totalAmount: p.totalAmount + delta, baseAmount: p.baseAmount + delta });
}

// ---------- Campaigns ----------
export type CampaignObjective =
  | "promote_product" | "promote_listing" | "promote_store"
  | "chats" | "calls" | "store_visits" | "local_offer"
  | "local_awareness" | "store_followers";

export const CAMPAIGN_OBJECTIVES: { id: CampaignObjective; label: string; description: string }[] = [
  { id: "promote_product", label: "Promote product", description: "Feature a product from your store to nearby users." },
  { id: "promote_listing", label: "Promote listing", description: "Boost visibility for a personal listing." },
  { id: "promote_store", label: "Promote store", description: "Bring more visits to your store profile." },
  { id: "chats", label: "Get more chats", description: "Show your advertisement to nearby users likely to contact your business." },
  { id: "calls", label: "Get more calls", description: "Reach nearby users likely to call your business." },
  { id: "store_visits", label: "Increase store visits", description: "Drive footfall and profile views to your store." },
  { id: "local_offer", label: "Promote local offer", description: "Highlight an offer to nearby buyers." },
  { id: "local_awareness", label: "Build local awareness", description: "Introduce your brand to a new area." },
  { id: "store_followers", label: "Gain store followers", description: "Grow your store's follower base." },
];

export type CampaignSource =
  | { kind: "listing"; refId: string }
  | { kind: "store_product"; refId: string; storeId: string }
  | { kind: "store"; refId: string }
  | { kind: "store_offer"; refId: string; storeId: string }
  | { kind: "custom"; advertiserBusiness: { name: string; contact: string; email?: string } };

export type CampaignCreative = {
  name: string;
  headline: string;
  description: string;
  cta: "View Product" | "Visit Store" | "Chat Now" | "Call Now" | "View Offer" | "Learn More" | "Get Directions";
  imageUrl?: string;
  videoUrl?: string;
  advertiserDisplayName: string;
  destination: "product" | "store" | "offer" | "chat" | "external";
  externalUrl?: string;
};

export type CampaignAudience = {
  pincodes: string[];
  areas: string[];
  city?: string;
  radiusKm?: number;
  categories: string[];
  intents: ("recent_views" | "searched" | "saved" | "followed_stores")[];
  languages: ("English" | "Telugu" | "Hindi")[];
};

export type CampaignSchedule = {
  dailyBudget: number;
  totalBudget: number;
  startAt: number;
  endAt: number;
  startNow: boolean;
};

export type CampaignFrequency = {
  maxImpressionsPerUser: number;
  maxClicksPerUser: number;
  dailyFrequency: number;
};

export type CampaignStatus =
  | "draft" | "payment_pending" | "under_review"
  | "approved" | "scheduled" | "active"
  | "paused" | "rejected" | "completed" | "cancelled";

export type Campaign = {
  id: string;
  name: string;
  objective: CampaignObjective;
  source: CampaignSource;
  creative: CampaignCreative;
  audience: CampaignAudience;
  placements: PlacementId[];
  schedule: CampaignSchedule;
  frequency: CampaignFrequency;
  status: CampaignStatus;
  createdAt: number;
  updatedAt: number;
  amountSpent: number;
  paymentId?: string;
  rejection?: { reason: string; affectedField: string; requiredCorrection: string };
  analytics: CampaignAnalytics;
  step?: number; // for drafts
};

export type CampaignAnalytics = {
  impressions: number;
  reach: number;
  clicks: number;
  ctr: number;
  productViews: number;
  storeVisits: number;
  chats: number;
  calls: number;
  saves: number;
  followers: number;
  cpc: number;
  cpChat: number;
  cpCall: number;
  budgetSpent: number;
  remaining: number;
  daily: { d: string; imp: number; clicks: number }[];
  byArea: { area: string; pct: number }[];
  byPlacement: { id: PlacementId; imp: number; clicks: number }[];
};

const seedCampaignAnalytics = (budget: number, spent: number): CampaignAnalytics => ({
  impressions: 24800, reach: 18200, clicks: 1420, ctr: 5.7,
  productViews: 980, storeVisits: 420, chats: 68, calls: 32, saves: 88, followers: 24,
  cpc: 2.5, cpChat: 51.4, cpCall: 109.3, budgetSpent: spent, remaining: Math.max(0, budget - spent),
  daily: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d, i) => ({
    d, imp: 2800 + i * 400, clicks: 160 + i * 30,
  })),
  byArea: [
    { area: "Madhapur", pct: 34 }, { area: "Kondapur", pct: 26 },
    { area: "Gachibowli", pct: 20 }, { area: "Ameerpet", pct: 12 }, { area: "Kukatpally", pct: 8 },
  ],
  byPlacement: [
    { id: "HOME_HERO", imp: 8400, clicks: 480 },
    { id: "HOME_SPONSORED_STORE", imp: 6800, clicks: 380 },
    { id: "CATEGORY_HERO", imp: 5800, clicks: 320 },
    { id: "SEARCH_NATIVE_RESULT", imp: 3800, clicks: 240 },
  ],
});

const emptyCampaignAnalytics = (): CampaignAnalytics => ({
  impressions: 0, reach: 0, clicks: 0, ctr: 0, productViews: 0, storeVisits: 0,
  chats: 0, calls: 0, saves: 0, followers: 0, cpc: 0, cpChat: 0, cpCall: 0,
  budgetSpent: 0, remaining: 0, daily: [], byArea: [], byPlacement: [],
});

export function listCampaigns(): Campaign[] { return read<Campaign[]>(LS.campaigns, []); }
export function getCampaign(id: string) { return listCampaigns().find((c) => c.id === id); }
export function upsertCampaign(c: Campaign) {
  const all = listCampaigns();
  const i = all.findIndex((x) => x.id === c.id);
  const next = { ...c, updatedAt: Date.now() };
  if (i === -1) all.unshift(next); else all[i] = next;
  write(LS.campaigns, all);
  return next;
}
export function setCampaignStatus(id: string, status: CampaignStatus) {
  const c = getCampaign(id); if (!c) return;
  upsertCampaign({ ...c, status });
}
export function duplicateCampaign(id: string): Campaign | undefined {
  const c = getCampaign(id); if (!c) return;
  const clone: Campaign = {
    ...c, id: newId("CMP"), name: `${c.name} (Copy)`, status: "draft",
    createdAt: Date.now(), updatedAt: Date.now(), amountSpent: 0, paymentId: undefined,
    analytics: emptyCampaignAnalytics(),
  };
  return upsertCampaign(clone);
}
export function endCampaign(id: string) {
  const c = getCampaign(id); if (!c) return { refund: 0 };
  const refund = Math.max(0, c.schedule.totalBudget - c.amountSpent);
  upsertCampaign({ ...c, status: "completed" });
  if (refund > 0) {
    addCredit({ id: newId("CR"), amount: refund, source: "Campaign end refund", expiresAt: Date.now() + 90 * 86400000, eligibleFor: ["boost", "ad", "store_promotion"] });
    recordTxn({ id: newId("TXN"), type: "refund", direction: "credit", amount: refund, status: "successful", createdAt: Date.now(), title: `Refund — ${c.name}`, campaignId: c.id, paymentMethod: "Omeetso Wallet" });
  }
  return { refund };
}

// ---------- Drafts ----------
export function listCampaignDrafts(): Campaign[] { return read<Campaign[]>(LS.drafts, []); }
export function saveCampaignDraft(c: Campaign) {
  const all = listCampaignDrafts();
  const i = all.findIndex((x) => x.id === c.id);
  const next = { ...c, status: "draft" as CampaignStatus, updatedAt: Date.now() };
  if (i === -1) all.unshift(next); else all[i] = next;
  write(LS.drafts, all);
  return next;
}
export function getCampaignDraft(id: string) { return listCampaignDrafts().find((d) => d.id === id); }
export function deleteCampaignDraft(id: string) {
  write(LS.drafts, listCampaignDrafts().filter((d) => d.id !== id));
}

// ---------- Wallet ----------
export type Wallet = { balance: number; refundBalance: number };
export function getWallet(): Wallet { return read<Wallet>(LS.wallet, { balance: 0, refundBalance: 0 }); }
export function setWallet(w: Wallet) { write(LS.wallet, w); }
export function addMoney(amount: number, method: string): WalletTxn {
  const w = getWallet();
  setWallet({ ...w, balance: w.balance + amount });
  return recordTxn({
    id: newId("TXN"), type: "recharge", direction: "credit", amount,
    status: "successful", createdAt: Date.now(),
    title: "Wallet recharge", paymentMethod: method, paymentId: newId("PAY"),
  });
}
export function debitWallet(amount: number, meta: { title: string; type: WalletTxn["type"]; campaignId?: string; promotionId?: string; paymentMethod?: string }): WalletTxn | null {
  const w = getWallet();
  if (w.balance < amount) return null;
  setWallet({ ...w, balance: w.balance - amount });
  return recordTxn({
    id: newId("TXN"), type: meta.type, direction: "debit", amount,
    status: "successful", createdAt: Date.now(),
    title: meta.title, campaignId: meta.campaignId, promotionId: meta.promotionId,
    paymentMethod: meta.paymentMethod ?? "Omeetso Wallet", paymentId: newId("PAY"),
  });
}

// ---------- Transactions ----------
export type WalletTxn = {
  id: string;
  type: "recharge" | "promotion" | "advertisement" | "credit" | "refund" | "failed" | "reversal";
  direction: "credit" | "debit";
  amount: number;
  status: "successful" | "pending" | "failed" | "refunded" | "reversed";
  createdAt: number;
  title: string;
  campaignId?: string;
  promotionId?: string;
  paymentMethod?: string;
  paymentId?: string;
  tax?: number;
  discount?: number;
  creditsUsed?: number;
  note?: string;
};

export function listTxns(): WalletTxn[] { return read<WalletTxn[]>(LS.txns, []); }
export function getTxn(id: string) { return listTxns().find((t) => t.id === id); }
export function recordTxn(t: WalletTxn): WalletTxn {
  const all = listTxns();
  all.unshift(t);
  write(LS.txns, all.slice(0, 200));
  return t;
}

// ---------- Promotional credits ----------
export type PromoCredit = {
  id: string;
  amount: number;
  source: string;
  expiresAt: number;
  eligibleFor: ("boost" | "ad" | "store_promotion")[];
};
export function listCredits(): PromoCredit[] { return read<PromoCredit[]>(LS.credits, []); }
export function addCredit(c: PromoCredit) {
  const all = listCredits();
  all.unshift(c);
  write(LS.credits, all);
}
export function totalCredits(): number {
  const now = Date.now();
  return listCredits().filter((c) => c.expiresAt > now).reduce((s, c) => s + c.amount, 0);
}
export function consumeCredits(amount: number): number {
  const now = Date.now();
  const all = listCredits();
  let remaining = amount;
  const next: PromoCredit[] = [];
  for (const c of all) {
    if (c.expiresAt <= now || remaining <= 0) { next.push(c); continue; }
    const take = Math.min(remaining, c.amount);
    remaining -= take;
    if (c.amount - take > 0) next.push({ ...c, amount: c.amount - take });
  }
  write(LS.credits, next);
  return amount - remaining;
}

// ---------- Refunds ----------
export type Refund = {
  id: string;
  amount: number;
  reason: string;
  destination: "wallet" | "original";
  status: "requested" | "processing" | "completed" | "failed";
  requestedAt: number;
  campaignId?: string;
  promotionId?: string;
};
export function listRefunds(): Refund[] { return read<Refund[]>(LS.refunds, []); }
export function addRefund(r: Refund) { write(LS.refunds, [r, ...listRefunds()]); }

// ---------- Billing ----------
export type BillingProfile = {
  legalName?: string;
  gstNumber?: string;
  billingAddress?: string;
  state?: string;
  pincode?: string;
  email?: string;
  phone?: string;
};
export function getBilling(): BillingProfile { return read<BillingProfile>(LS.billing, {}); }
export function setBilling(b: BillingProfile) { write(LS.billing, b); }

// ---------- Invoices ----------
export type Invoice = {
  id: string;
  number: string;
  createdAt: number;
  service: string;
  campaignId?: string;
  promotionId?: string;
  baseAmount: number;
  tax: number;
  discount: number;
  creditsUsed: number;
  total: number;
  paymentMethod: string;
  status: "paid" | "pending" | "failed";
  billing: BillingProfile;
};
export function listInvoices(): Invoice[] { return read<Invoice[]>(LS.invoices, []); }
export function getInvoice(id: string) { return listInvoices().find((i) => i.id === id); }
export function addInvoice(i: Invoice) { write(LS.invoices, [i, ...listInvoices()]); }

// ---------- Ad events (tracking mock) ----------
export type AdEvent = {
  id: string; time: number;
  kind: "impression" | "click" | "dismiss" | "campaign_view" | "promotion_conversion";
  campaignId?: string; promotionId?: string; placementId?: PlacementId;
  refId?: string; sessionId: string; area?: string;
};

const sessionId = (() => {
  if (!isB) return "srv";
  try {
    let s = localStorage.getItem("omeetso_session_id");
    if (!s) { s = newId("S"); localStorage.setItem("omeetso_session_id", s); }
    return s;
  } catch { return "anon"; }
})();

function logEvent(e: Omit<AdEvent, "id" | "time" | "sessionId">) {
  const list = read<AdEvent[]>(LS.events, []);
  list.push({ ...e, id: newId("EV"), time: Date.now(), sessionId });
  write(LS.events, list.slice(-500));
}
export const trackAdImpression = (o: Omit<AdEvent, "id" | "time" | "sessionId" | "kind">) => logEvent({ ...o, kind: "impression" });
export const trackAdClick = (o: Omit<AdEvent, "id" | "time" | "sessionId" | "kind">) => logEvent({ ...o, kind: "click" });
export const trackAdDismiss = (o: Omit<AdEvent, "id" | "time" | "sessionId" | "kind">) => logEvent({ ...o, kind: "dismiss" });
export const trackCampaignView = (o: Omit<AdEvent, "id" | "time" | "sessionId" | "kind">) => logEvent({ ...o, kind: "campaign_view" });
export const trackPromotionConversion = (o: Omit<AdEvent, "id" | "time" | "sessionId" | "kind">) => logEvent({ ...o, kind: "promotion_conversion" });

// ---------- Labels ----------
export const PROMOTION_STATUS_LABEL: Record<PromotionStatus, string> = {
  draft: "Draft", payment_pending: "Payment Pending", under_review: "Under Review",
  scheduled: "Scheduled", active: "Active", paused: "Paused",
  completed: "Completed", expired: "Expired", rejected: "Rejected", cancelled: "Cancelled",
};
export const CAMPAIGN_STATUS_LABEL: Record<CampaignStatus, string> = {
  draft: "Draft", payment_pending: "Payment Pending", under_review: "Under Review",
  approved: "Approved", scheduled: "Scheduled", active: "Active",
  paused: "Paused", rejected: "Rejected", completed: "Completed", cancelled: "Cancelled",
};

// ---------- Tax / totals ----------
export function computeTotals(baseAmount: number, creditsAvailable: number, opts?: { useCredits?: boolean }) {
  const useC = opts?.useCredits ?? true;
  const gst = Math.round(baseAmount * 0.18);
  const subtotal = baseAmount + gst;
  const credits = useC ? Math.min(creditsAvailable, subtotal) : 0;
  const total = Math.max(0, subtotal - credits);
  return { baseAmount, gst, subtotal, credits, total };
}

// ---------- Seeding ----------
export function seedRevenueIfEmpty() {
  if (!isB) return;
  if (!localStorage.getItem(LS.wallet)) setWallet({ balance: 0, refundBalance: 0 });
  if (!localStorage.getItem(LS.credits)) write(LS.credits, [] as PromoCredit[]);
  if (!localStorage.getItem(LS.txns)) write(LS.txns, [] as WalletTxn[]);
  if (!localStorage.getItem(LS.campaigns)) write(LS.campaigns, [] as Campaign[]);
  if (!localStorage.getItem(LS.promotions)) write(LS.promotions, [] as Promotion[]);
  if (!localStorage.getItem(LS.invoices)) write(LS.invoices, [] as Invoice[]);
  clearMockSeedData();
}

export function clearMockSeedData() {
  if (!isB) return;
  try {
    const rawCamps = localStorage.getItem(LS.campaigns);
    if (rawCamps && (rawCamps.includes("CMP_SEED_") || rawCamps.includes("Madhapur Furniture Sale") || rawCamps.includes("Smart TV Local Offer"))) {
      write(LS.campaigns, []);
    }
    const rawDrafts = localStorage.getItem(LS.drafts);
    if (rawDrafts && (rawDrafts.includes("CMP_SEED_") || rawDrafts.includes("Car Service Near Kukatpally"))) {
      write(LS.drafts, []);
    }
    const rawPromos = localStorage.getItem(LS.promotions);
    if (rawPromos && (rawPromos.includes("PR_SEED_") || rawPromos.includes("Popular Boost"))) {
      write(LS.promotions, []);
    }
    const rawInvs = localStorage.getItem(LS.invoices);
    if (rawInvs && (rawInvs.includes("CMP_SEED_") || rawInvs.includes("OMS/2026/000012"))) {
      write(LS.invoices, []);
    }
    const rawCredits = localStorage.getItem(LS.credits);
    if (rawCredits && rawCredits.includes("CR_WELCOME")) {
      write(LS.credits, []);
    }
    const rawRefunds = localStorage.getItem(LS.refunds);
    if (rawRefunds && rawRefunds.includes("RF1")) {
      write(LS.refunds, []);
    }
    const rawTxns = localStorage.getItem(LS.txns);
    if (rawTxns && (rawTxns.includes("PAYA1") || rawTxns.includes("PAYA2") || rawTxns.includes("TXN1"))) {
      write(LS.txns, []);
    }
  } catch {}
}
