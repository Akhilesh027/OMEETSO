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
    name: "⚡ Starter Boost Plan",
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
    name: "👑 Pro Mega Takeover",
    duration: 15,
    price: 499,
    benefits: ["Homepage Hero Carousel", "Top Search Ranking", "URGENT / Featured Badge", "Estimated 10× Reach"],
    visibilityMultiplier: "10×",
    badge: "urgent",
    placements: ["SEARCH_TOP", "CATEGORY_FEATURED", "HOME_NATIVE_FEED", "URGENT_BADGE", "HIGHLIGHTED_CARD"],
    compatibility: ["SEARCH_TOP", "CATEGORY_FEATURED", "HOME_NATIVE_FEED", "URGENT_BADGE", "HIGHLIGHTED_CARD", "LOCAL_PINCODE_FEED"],
  },
];

export const BANNER_PACKAGES: BoostPackage[] = [
  {
    id: "banner_hero_7",
    name: "🎨 7-Day Homepage Hero Banner Package",
    duration: 7,
    price: 499,
    benefits: ["Main Homepage Hero Carousel Slot", "Direct Store / Product Link", "Estimated 15,000+ Local Impressions"],
    visibilityMultiplier: "8×",
    placements: ["HOME_HERO"],
    compatibility: ["HOME_HERO"],
  },
  {
    id: "banner_category_14",
    name: "🏷️ 14-Day Category Top Header Banner Package",
    duration: 14,
    price: 899,
    benefits: ["Category Search Top Banner", "High Buyer Intent Audience", "Estimated 35,000+ Local Impressions"],
    visibilityMultiplier: "12×",
    popularTag: "Popular Banner",
    placements: ["CATEGORY_HERO"],
    compatibility: ["CATEGORY_HERO"],
  },
  {
    id: "banner_takeover_30",
    name: "👑 30-Day Store Mega Takeover Banner Package",
    duration: 30,
    price: 1999,
    benefits: ["Full Brand Takeover (Hero + Category + Store Spotlight)", "Priority Banner Rotation", "Estimated 100,000+ Local Reach"],
    visibilityMultiplier: "25×",
    badge: "urgent",
    placements: ["HOME_HERO", "CATEGORY_HERO", "HOME_SPONSORED_STORE"],
    compatibility: ["HOME_HERO", "CATEGORY_HERO", "HOME_SPONSORED_STORE"],
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
  { id: "SEARCH_TOP", name: "Search Top Placement", description: "Appear near the top of relevant search results.", format: "Sponsored search card", ratio: "1:1", estImpressions: "3,000–4,500", price: 120, kind: "both" },
  { id: "CATEGORY_FEATURED", name: "Category Featured Placement", description: "Gain visibility within your product category.", format: "Featured card", ratio: "1:1", estImpressions: "2,500–3,800", price: 90, kind: "both" },
  { id: "HOME_NATIVE_FEED", name: "Home Sponsored Feed", description: "Appear as a clearly labelled sponsored listing on Home.", format: "Native product card", ratio: "1:1", estImpressions: "5,000–8,000", price: 180, kind: "both" },
  { id: "LOCAL_PINCODE_FEED", name: "Location-Based Placement", description: "Reach users near selected pincodes or areas.", format: "Local sponsored card", ratio: "1:1", estImpressions: "1,500–3,000", price: 80, kind: "both" },
  { id: "URGENT_BADGE", name: "Urgent Badge", description: "Add an urgent visual label to your listing.", format: "Badge overlay", ratio: "n/a", estImpressions: "n/a", price: 40, kind: "promotion" },
  { id: "HIGHLIGHTED_CARD", name: "Highlighted Product Card", description: "Enhanced card treatment in eligible product feeds.", format: "Highlighted card", ratio: "1:1", estImpressions: "included", price: 30, kind: "promotion" },
  { id: "HOME_HERO", name: "Home Hero", description: "Wide banner at the top of Home.", format: "Wide banner", ratio: "16:7", estImpressions: "8,000–12,000", price: 350, kind: "ad" },
  { id: "HOME_CATEGORY_STRIP", name: "Home Category Strip", description: "Compact banner between category rows.", format: "Compact banner", ratio: "16:9", estImpressions: "4,000–6,000", price: 200, kind: "ad" },
  { id: "HOME_SPONSORED_STORE", name: "Home Sponsored Store", description: "Featured store card on Home.", format: "Store card", ratio: "1:1", estImpressions: "3,500–5,000", price: 220, kind: "ad" },
  { id: "SEARCH_NATIVE_RESULT", name: "Search Native Result", description: "Sponsored listing card in search results.", format: "Native card", ratio: "1:1", estImpressions: "3,000–5,000", price: 150, kind: "ad" },
  { id: "SEARCH_SPONSORED_STORE", name: "Search Sponsored Store", description: "Sponsored store card in search.", format: "Store card", ratio: "1:1", estImpressions: "2,000–3,500", price: 140, kind: "ad" },
  { id: "CATEGORY_HERO", name: "Category Hero", description: "Banner at the top of a category page.", format: "Category banner", ratio: "16:9", estImpressions: "4,500–6,500", price: 210, kind: "ad" },
  { id: "CATEGORY_NATIVE_FEED", name: "Category Native Feed", description: "Sponsored product card inside category feed.", format: "Native card", ratio: "1:1", estImpressions: "3,000–4,500", price: 150, kind: "ad" },
  { id: "PRODUCT_CONTEXTUAL", name: "Product Contextual", description: "Relevant service or product card on product page.", format: "Contextual card", ratio: "1:1", estImpressions: "1,500–3,000", price: 90, kind: "ad" },
  { id: "STORE_FEATURED_OFFER", name: "Store Featured Offer", description: "Store offer banner shown to nearby users.", format: "Offer banner", ratio: "16:9", estImpressions: "2,000–3,000", price: 130, kind: "ad" },
  { id: "STORE_SPONSORED_PRODUCT", name: "Store Sponsored Product", description: "Featured store product across feeds.", format: "Product card", ratio: "1:1", estImpressions: "2,500–4,000", price: 140, kind: "ad" },
  { id: "NOTIFICATION_PROMOTION", name: "Promotional Notification", description: "Clearly labelled promotional notification.", format: "Notification", ratio: "n/a", estImpressions: "1,000–2,000", price: 100, kind: "ad" },
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
  if (!localStorage.getItem(LS.wallet)) setWallet({ balance: 1250, refundBalance: 99 });
  if (!localStorage.getItem(LS.credits)) {
    write(LS.credits, [
      { id: "CR_WELCOME", amount: 300, source: "Welcome Promotion Credit",
        expiresAt: Date.now() + 90 * 86400000, eligibleFor: ["boost", "store_promotion"] },
    ] as PromoCredit[]);
  }
  if (!localStorage.getItem(LS.txns)) {
    const now = Date.now();
    write(LS.txns, [
      { id: "TXN1", type: "recharge", direction: "credit", amount: 1000, status: "successful", createdAt: now - 5 * 86400000, title: "Wallet recharge", paymentMethod: "UPI", paymentId: "PAYA1" },
      { id: "TXN2", type: "advertisement", direction: "debit", amount: 350, status: "successful", createdAt: now - 3 * 86400000, title: "Madhapur Furniture Sale", paymentMethod: "Omeetso Wallet", paymentId: "PAYA2", campaignId: "CMP_SEED_FUR" },
      { id: "TXN3", type: "credit", direction: "credit", amount: 300, status: "successful", createdAt: now - 30 * 86400000, title: "Welcome Promotion Credit", paymentMethod: "Promo" },
      { id: "TXN4", type: "refund", direction: "credit", amount: 99, status: "successful", createdAt: now - 2 * 86400000, title: "Refund — cancelled promotion", paymentMethod: "Omeetso Wallet" },
    ] as WalletTxn[]);
  }
  if (!localStorage.getItem(LS.campaigns)) {
    const now = Date.now();
    const seed: Campaign[] = [
      {
        id: "CMP_SEED_FUR", name: "Madhapur Furniture Sale", objective: "store_visits",
        source: { kind: "store", refId: "satish-furniture" },
        creative: {
          name: "Madhapur Furniture Sale",
          headline: "Premium Furniture Sale Near You",
          description: "Explore sofas, beds and dining sets from a verified local store.",
          cta: "Visit Store", advertiserDisplayName: "Sri Sai Furniture Hub",
          destination: "store", imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&h=600&q=80",
        },
        audience: { pincodes: ["500081", "500084", "500032"], areas: ["Madhapur", "Kondapur", "Gachibowli"], radiusKm: 5, categories: ["furniture"], intents: ["searched", "recent_views"], languages: ["English", "Telugu"] },
        placements: ["HOME_HERO", "HOME_SPONSORED_STORE", "CATEGORY_HERO"],
        schedule: { dailyBudget: 700, totalBudget: 5000, startAt: now - 3 * 86400000, endAt: now + 4 * 86400000, startNow: true },
        frequency: { maxImpressionsPerUser: 3, maxClicksPerUser: 2, dailyFrequency: 1 },
        status: "active", createdAt: now - 3 * 86400000, updatedAt: now,
        amountSpent: 2140, paymentId: "PAYA2", analytics: seedCampaignAnalytics(5000, 2140),
      },
      {
        id: "CMP_SEED_TV", name: "Smart TV Local Offer", objective: "promote_product",
        source: { kind: "store_product", refId: "LSEEDTV43", storeId: "satish-electronics" },
        creative: {
          name: "Smart TV Local Offer",
          headline: "Smart TVs and Appliances on Offer",
          description: "Shop electronics from a verified store near Ameerpet.",
          cta: "View Product", advertiserDisplayName: "Satish Electronics",
          destination: "product", imageUrl: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&h=600&q=80",
        },
        audience: { pincodes: ["500016", "500018"], areas: ["Ameerpet", "SR Nagar"], radiusKm: 10, categories: ["electronics"], intents: ["saved", "searched"], languages: ["English", "Hindi"] },
        placements: ["SEARCH_NATIVE_RESULT", "CATEGORY_NATIVE_FEED", "STORE_FEATURED_OFFER"],
        schedule: { dailyBudget: 400, totalBudget: 3500, startAt: now - 86400000, endAt: now + 6 * 86400000, startNow: true },
        frequency: { maxImpressionsPerUser: 3, maxClicksPerUser: 2, dailyFrequency: 1 },
        status: "under_review", createdAt: now - 86400000, updatedAt: now,
        amountSpent: 0, analytics: emptyCampaignAnalytics(),
      },
      {
        id: "CMP_SEED_CAR", name: "Car Service Near Kukatpally", objective: "calls",
        source: { kind: "custom", advertiserBusiness: { name: "AutoCare Kukatpally", contact: "+91 98765 43200" } },
        creative: {
          name: "Car Service Near Kukatpally",
          headline: "Trusted Car Service Near You",
          description: "Book inspection and maintenance from local professionals.",
          cta: "Call Now", advertiserDisplayName: "AutoCare Kukatpally",
          destination: "chat",
        },
        audience: { pincodes: ["500072"], areas: ["Kukatpally"], radiusKm: 5, categories: ["services"], intents: [], languages: ["English", "Telugu"] },
        placements: ["HOME_NATIVE_FEED", "SEARCH_NATIVE_RESULT"],
        schedule: { dailyBudget: 200, totalBudget: 1500, startAt: now, endAt: now + 7 * 86400000, startNow: true },
        frequency: { maxImpressionsPerUser: 3, maxClicksPerUser: 2, dailyFrequency: 1 },
        status: "draft", createdAt: now - 86400000, updatedAt: now,
        amountSpent: 0, analytics: emptyCampaignAnalytics(), step: 4,
      },
      {
        id: "CMP_SEED_RENT", name: "Rental Homes in Kondapur", objective: "chats",
        source: { kind: "custom", advertiserBusiness: { name: "Kondapur Rentals", contact: "+91 98765 43299" } },
        creative: {
          name: "Rental Homes in Kondapur",
          headline: "Rental Homes in Your Area",
          description: "Discover rental properties near your preferred location.",
          cta: "Chat Now", advertiserDisplayName: "Kondapur Rentals",
          destination: "chat", imageUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&h=600&q=80",
        },
        audience: { pincodes: ["500084"], areas: ["Kondapur"], radiusKm: 5, categories: ["properties"], intents: ["searched"], languages: ["English"] },
        placements: ["HOME_NATIVE_FEED", "CATEGORY_HERO"],
        schedule: { dailyBudget: 300, totalBudget: 2500, startAt: now - 20 * 86400000, endAt: now - 10 * 86400000, startNow: true },
        frequency: { maxImpressionsPerUser: 3, maxClicksPerUser: 2, dailyFrequency: 1 },
        status: "completed", createdAt: now - 20 * 86400000, updatedAt: now - 10 * 86400000,
        amountSpent: 2450, analytics: seedCampaignAnalytics(2500, 2450),
      },
    ];
    write(LS.campaigns, seed);
  }
  if (!localStorage.getItem(LS.promotions)) {
    const now = Date.now();
    const seed: Promotion[] = [
      {
        id: "PR_SEED_SOFA", target: { kind: "listing", refId: "LSEEDSOFA1" },
        objective: "views", packageId: "popular", packageName: "Popular Boost",
        duration: 7, placements: ["SEARCH_TOP", "CATEGORY_FEATURED", "HIGHLIGHTED_CARD"],
        areas: ["Miyapur", "Kukatpally"], radiusKm: 5,
        startAt: now - 2 * 86400000, endAt: now + 5 * 86400000,
        baseAmount: 249, tax: 45, creditsApplied: 100, totalAmount: 194,
        paymentMethod: "Omeetso Wallet", paymentId: "PAYPR1",
        status: "active", createdAt: now - 2 * 86400000, updatedAt: now, amountSpent: 96,
        analytics: seedPromotionAnalytics(0.6),
      },
    ];
    write(LS.promotions, seed);
  }
  if (!localStorage.getItem(LS.invoices)) {
    const now = Date.now();
    write(LS.invoices, [
      {
        id: "INV1", number: "OMS/2026/000012", createdAt: now - 3 * 86400000,
        service: "Advertisement Campaign", campaignId: "CMP_SEED_FUR",
        baseAmount: 5000, tax: 900, discount: 0, creditsUsed: 0, total: 5900,
        paymentMethod: "Omeetso Wallet", status: "paid", billing: {},
      },
      {
        id: "INV2", number: "OMS/2026/000018", createdAt: now - 2 * 86400000,
        service: "Listing Boost", promotionId: "PR_SEED_SOFA",
        baseAmount: 249, tax: 45, discount: 0, creditsUsed: 100, total: 194,
        paymentMethod: "Omeetso Wallet", status: "paid", billing: {},
      },
    ] as Invoice[]);
  }
  if (!localStorage.getItem(LS.refunds)) {
    write(LS.refunds, [
      { id: "RF1", amount: 99, reason: "Duplicate payment reversed", destination: "wallet",
        status: "completed", requestedAt: Date.now() - 2 * 86400000 },
    ] as Refund[]);
  }
}
