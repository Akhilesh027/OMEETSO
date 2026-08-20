// Omeetso — Phase 3 listings persistence layer (frontend + localStorage only).

export type ListingStatus =
  | "draft"
  | "under_review"
  | "active"
  | "requires_changes"
  | "rejected"
  | "paused"
  | "sold"
  | "expired"
  | "removed";

export type ContactPref = "chat_only" | "call_and_chat" | "hide_number";
export type BestContactTime = "anytime" | "morning" | "afternoon" | "evening";
export type Fulfilment = "pickup" | "delivery" | "both" | "buyer";
export type Condition =
  | "new"
  | "like_new"
  | "excellent"
  | "good"
  | "fair"
  | "needs_repair";

export type Listing = {
  id: string;
  title: string;
  price: number;
  negotiable: boolean;
  free?: boolean;
  condition: Condition;
  description: string;
  category: string;
  subcategory: string;
  images: string[]; // urls or object URLs
  cover: number;
  video?: string;
  videoUrl?: string;
  whatsappPhone?: string;
  enableWhatsapp?: boolean;
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
  rating?: number;
  reviewCount?: number;
  status: ListingStatus;
  createdAt: number;
  updatedAt: number;
  publishedAt?: number;
  expiresAt?: number;
  rejection?: {
    reason: string;
    section: string;
    correction: string;
    policyRef?: string;
    date: number;
  };
  finalSalePrice?: number;
  soldChannel?: "omeetso" | "outside";
  editHistory?: { at: number; note: string }[];
  boost?: { active: boolean; expiresAt?: number };
  method?: "quick" | "detailed";
  storeId?: string;
  storeMeta?: {
    sku?: string;
    stockStatus?: "in_stock" | "low_stock" | "out_of_stock" | "made_to_order" | "on_enquiry";
    stockQty?: number;
    originalPrice?: number;
    minEnquiryQty?: number;
    featured?: boolean;
    priority?: number;
    pickup?: boolean;
    delivery?: boolean;
  };
};

export type ListingDraft = Partial<Listing> & {
  id: string;
  createdAt: number;
  updatedAt: number;
  method: "quick" | "detailed";
  step?: number;
};

export type ListingAnalytics = {
  impressions: number;
  views: number;
  saves: number;
  chats: number;
  calls: number;
  offers: number;
  shares: number;
  daily: { d: string; views: number }[];
  topAreas: { area: string; pct: number }[];
};

export const LS = {
  listings: "omeetso_user_listings",
  drafts: "omeetso_listing_drafts",
  quickDraft: "omeetso_quick_sell_draft",
  detailedDraft: "omeetso_detailed_sell_draft",
  analytics: "omeetso_listing_analytics",
  recentCats: "omeetso_recent_categories",
  sellerPrefs: "omeetso_seller_preferences",
} as const;

const isB = typeof window !== "undefined";
const read = <T,>(k: string, fb: T): T => {
  if (!isB) return fb;
  try {
    const raw = localStorage.getItem(k);
    return raw ? (JSON.parse(raw) as T) : fb;
  } catch {
    return fb;
  }
};
const write = (k: string, v: unknown) => {
  if (!isB) return;
  try {
    localStorage.setItem(k, JSON.stringify(v));
    for (const cb of subs) cb();
  } catch { /* ignore quota */ }
};

const subs = new Set<() => void>();
export const subscribe = (cb: () => void) => {
  subs.add(cb);
  return () => subs.delete(cb);
};

// ---- Listings ----
export function listListings(): Listing[] {
  return read<Listing[]>(LS.listings, []);
}

export async function fetchLivePublicListings(params?: {
  area?: string;
  city?: string;
  pincode?: string;
  location?: string;
  category?: string;
  q?: string;
}): Promise<Listing[]> {
  try {
    const search = new URLSearchParams({ limit: "100", status: "approved" });
    if (params?.area) search.set("area", params.area);
    if (params?.city) search.set("city", params.city);
    if (params?.pincode) search.set("pincode", params.pincode);
    if (params?.location) search.set("location", params.location);
    if (params?.category) search.set("category", params.category);
    if (params?.q) search.set("q", params.q);

    const res = await fetch(`http://localhost:3000/api/v1/listings?${search.toString()}`);
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      const mapped: Listing[] = json.data.map((item: any) => {
        const validImages = Array.isArray(item.images) && item.images.length > 0 && !item.images[0].startsWith("blob:")
          ? item.images
          : ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400"];

        return {
          id: item.id || item._id,
          title: item.title,
          price: item.priceInPaise ? item.priceInPaise / 100 : item.price || 0,
          negotiable: item.pricingType === "NEGOTIABLE" || Boolean(item.negotiable),
          condition: (item.condition?.toLowerCase() || "good") as Condition,
          description: item.description || item.title,
          category: item.categoryId || "general",
          subcategory: item.subcategoryId || item.categoryId || "general",
          images: validImages,
          cover: item.coverIndex || 0,
          video: item.videoUrl || item.video,
          videoUrl: item.videoUrl || item.video,
          whatsappPhone: item.whatsappPhone,
          enableWhatsapp: item.enableWhatsapp ?? true,
          pincode: item.pincode || "500072",
          area: item.area || "Kukatpally",
          city: item.city || "Hyderabad",
          fulfilment: "pickup" as Fulfilment,
          specs: item.specs || {},
          contactPref: "call_and_chat" as ContactPref,
          bestContactTime: "anytime" as BestContactTime,
          sellerName: item.sellerName || "Omeetso Seller",
          rating: item.rating || 0,
          reviewCount: item.reviewCount || 0,
          status: (item.status?.toLowerCase() || "active") as ListingStatus,
          createdAt: new Date(item.createdAt || item.publishedAt || Date.now()).getTime(),
          updatedAt: new Date(item.createdAt || item.publishedAt || Date.now()).getTime()
        };
      });
      write(LS.listings, mapped);
      return mapped;
    }
  } catch (err) {
    console.warn("Backend feed offline, using cached listings");
  }
  return listListings();
}

export async function fetchLiveUserListings(): Promise<Listing[]> {
  const token = typeof window !== "undefined" ? localStorage.getItem("omeetso_user_token") : null;
  if (!token) return [];

  try {
    const res = await fetch("http://localhost:3000/api/v1/listings/user/me", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      const mapped: Listing[] = json.data.map((item: any) => {
        const validImages = Array.isArray(item.images) && item.images.length > 0 && !item.images[0].startsWith("blob:")
          ? item.images
          : ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400"];

        return {
          id: item.id || item._id,
          title: item.title,
          price: item.priceInPaise ? item.priceInPaise / 100 : item.price || 0,
          negotiable: item.pricingType === "NEGOTIABLE" || Boolean(item.negotiable),
          condition: (item.condition?.toLowerCase() || "good") as Condition,
          description: item.description || item.title,
          category: item.categoryId || "general",
          subcategory: item.subcategoryId || item.categoryId || "general",
          images: validImages,
          cover: item.coverIndex || 0,
          pincode: item.pincode || "500072",
          area: item.area || "Kukatpally",
          city: item.city || "Hyderabad",
          fulfilment: "pickup" as Fulfilment,
          specs: item.specs || {},
          contactPref: "call_and_chat" as ContactPref,
          bestContactTime: "anytime" as BestContactTime,
          sellerName: item.sellerName || "Omeetso Seller",
          sellerId: item.sellerId?._id?.toString() || item.sellerId?.toString() || item.sellerId || "",
          status: (item.status?.toLowerCase() || "active") as ListingStatus,
          createdAt: new Date(item.createdAt || item.publishedAt || Date.now()).getTime(),
          updatedAt: new Date(item.createdAt || item.publishedAt || Date.now()).getTime()
        };
      });
      return mapped;
    }
  } catch (err) {
    console.warn("Failed to fetch user listings from backend:", err);
  }
  return [];
}

export async function fetchLiveListingById(id: string): Promise<Listing | null> {
  try {
    const res = await fetch(`http://localhost:3000/api/v1/listings/${id}`);
    const json = await res.json();
    if (json.success && json.data) {
      const item = json.data;
      const validImages = Array.isArray(item.images) && item.images.length > 0 && !item.images[0].startsWith("blob:")
        ? item.images
        : ["https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800"];

      const listing: Listing = {
        id: item.id || item._id,
        title: item.title,
        price: item.priceInPaise ? item.priceInPaise / 100 : item.price || 0,
        negotiable: item.pricingType === "NEGOTIABLE" || Boolean(item.negotiable),
        condition: (item.condition?.toLowerCase() || "good") as Condition,
        description: item.description || item.title,
        category: item.categoryId || item.category || "general",
        subcategory: item.subcategoryId || item.subcategory || item.categoryId || "General",
        images: validImages,
        cover: item.coverIndex || 0,
        video: item.videoUrl || item.video,
        videoUrl: item.videoUrl || item.video,
        whatsappPhone: item.whatsappPhone,
        enableWhatsapp: item.enableWhatsapp ?? true,
        pincode: item.pincode || "500072",
        area: item.area || item.city || "Madhapur",
        city: item.city || "Hyderabad",
        fulfilment: (item.fulfilment || "pickup") as Fulfilment,
        specs: item.specs || {},
        contactPref: (item.contactPref || "call_and_chat") as ContactPref,
        bestContactTime: "anytime" as BestContactTime,
        sellerName: item.sellerName || item.seller?.name || "Omeetso Seller",
        seller: item.seller,
        status: (item.status?.toLowerCase() || "active") as ListingStatus,
        method: item.method || "quick",
        createdAt: new Date(item.createdAt || item.publishedAt || Date.now()).getTime(),
        updatedAt: new Date(item.createdAt || item.publishedAt || Date.now()).getTime()
      } as any;
      if (item.analytics) {
        setAnalytics(listing.id, {
          impressions: (item.analytics.views || 0) * 5 + 10,
          views: item.analytics.views || 0,
          saves: item.analytics.saves || 0,
          chats: item.analytics.chats || 0,
          calls: 0,
          offers: 0,
          shares: 0,
          daily: [],
          topAreas: [],
        });
      }
      upsertListing(listing);
      return listing;
    }
  } catch (err) {
    console.warn("Failed to fetch live listing by id:", err);
  }
  return null;
}
export function getListing(id: string): Listing | undefined {
  return listListings().find((l) => l.id === id);
}
export function upsertListing(l: Listing) {
  const all = listListings();
  const i = all.findIndex((x) => x.id === l.id);
  const now = Date.now();
  const next: Listing = { ...l, updatedAt: now };
  if (i === -1) all.unshift(next);
  else all[i] = next;
  write(LS.listings, all);
  return next;
}
export function deleteListing(id: string) {
  write(LS.listings, listListings().filter((l) => l.id !== id));
}
export function setStatus(id: string, status: ListingStatus, extra: Partial<Listing> = {}) {
  const l = getListing(id);
  if (!l) return;
  upsertListing({ ...l, ...extra, status });
}
export function renewListing(id: string) {
  const l = getListing(id);
  if (!l) return;
  const days30 = 30 * 24 * 3600 * 1000;
  upsertListing({ ...l, status: "active", expiresAt: Date.now() + days30 });
}
export function markSold(
  id: string,
  info: { channel: "omeetso" | "outside"; finalPrice?: number; note?: string },
) {
  const l = getListing(id);
  if (!l) return;
  const hist = [...(l.editHistory ?? []), { at: Date.now(), note: `Marked sold (${info.channel})` }];
  upsertListing({
    ...l,
    status: "sold",
    finalSalePrice: info.finalPrice,
    soldChannel: info.channel,
    editHistory: hist,
  });
}

// ---- Drafts ----
export function listDrafts(): ListingDraft[] {
  return read<ListingDraft[]>(LS.drafts, []);
}
export function saveDraft(d: ListingDraft) {
  const all = listDrafts();
  const i = all.findIndex((x) => x.id === d.id);
  const now = Date.now();
  const next: ListingDraft = { ...d, updatedAt: now };
  if (i === -1) all.unshift(next);
  else all[i] = next;
  write(LS.drafts, all);
  return next;
}
export function deleteDraft(id: string) {
  write(LS.drafts, listDrafts().filter((d) => d.id !== id));
}
export function getDraft(id: string) {
  return listDrafts().find((d) => d.id === id);
}

// ---- Analytics ----
const defaultAnalytics = (): ListingAnalytics => ({
  impressions: 0,
  views: 0,
  saves: 0,
  chats: 0,
  calls: 0,
  offers: 0,
  shares: 0,
  daily: [],
  topAreas: [],
});

export function getAnalytics(listingId: string): ListingAnalytics {
  const map = read<Record<string, ListingAnalytics>>(LS.analytics, {});
  return map[listingId] ?? defaultAnalytics();
}

export function recordListingView(listingId: string) {
  const current = getAnalytics(listingId);
  current.views += 1;
  current.impressions += 3;
  setAnalytics(listingId, current);

  if (/^[0-9a-fA-F]{24}$/.test(listingId)) {
    fetch(`http://localhost:3000/api/v1/listings/${listingId}/view`, { method: "POST" }).catch(() => { });
  }
}

export function recordListingSave(listingId: string) {
  const current = getAnalytics(listingId);
  current.saves += 1;
  setAnalytics(listingId, current);

  if (/^[0-9a-fA-F]{24}$/.test(listingId)) {
    fetch(`http://localhost:3000/api/v1/listings/${listingId}/save`, { method: "POST" }).catch(() => { });
  }
}

export function setAnalytics(listingId: string, a: ListingAnalytics) {
  const map = read<Record<string, ListingAnalytics>>(LS.analytics, {});
  map[listingId] = a;
  write(LS.analytics, map);
}

// ---- Completion ----
export function computeCompletion(l: Partial<Listing>): { pct: number; missing: string[] } {
  const req: [keyof Listing, string][] = [
    ["images", "Photos"],
    ["title", "Title"],
    ["price", "Price"],
    ["condition", "Condition"],
    ["description", "Description"],
    ["category", "Category"],
    ["subcategory", "Subcategory"],
    ["pincode", "Location"],
    ["contactPref", "Contact preference"],
  ];
  const missing: string[] = [];
  let filled = 0;
  for (const [k, label] of req) {
    const v = (l as any)[k];
    const ok = k === "images" ? Array.isArray(v) && v.length > 0 : v !== undefined && v !== "" && v !== 0;
    if (ok) filled++;
    else missing.push(label);
  }
  return { pct: Math.round((filled / req.length) * 100), missing };
}

// ---- Recent categories ----
export function recentCategories(): string[] {
  return read<string[]>(LS.recentCats, []);
}
export function pushRecentCategory(id: string) {
  const cur = recentCategories().filter((x) => x !== id);
  write(LS.recentCats, [id, ...cur].slice(0, 8));
}

// ---- Seller prefs ----
export type SellerPrefs = {
  name?: string;
  phone?: string;
  type?: "individual" | "business";
};
export function getSellerPrefs(): SellerPrefs {
  let user: any = null;
  if (typeof localStorage !== "undefined") {
    try {
      const raw = localStorage.getItem("omeetso_user");
      if (raw) user = JSON.parse(raw);
    } catch { /* ignore */ }
  }
  const pref = read<SellerPrefs>(LS.sellerPrefs, {});
  return {
    name: pref.name || user?.profile?.name || (user?.phone ? `User (${user.phone})` : "Omeetso Seller"),
    phone: pref.phone || user?.phone || "",
    type: pref.type || user?.accountType || "individual"
  };
}
export function setSellerPrefs(p: SellerPrefs) {
  write(LS.sellerPrefs, { ...getSellerPrefs(), ...p });
}

// ---- ID + seeding ----
export const newId = (prefix = "L") =>
  `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`.toUpperCase();

const day = 24 * 3600 * 1000;
const now = Date.now();

const seedListings = (): Listing[] => [
  {
    id: "LSEEDSOFA1", title: "Premium Wooden Sofa Set", price: 12500, negotiable: true,
    condition: "excellent",
    description: "Solid teak wood 3+2 sofa set in excellent condition. Cushions recently replaced. Reason for selling: relocating.",
    category: "furniture", subcategory: "Sofas",
    images: ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&h=600&q=80"],
    cover: 0, pincode: "500049", area: "Miyapur", city: "Hyderabad", state: "Telangana",
    fulfilment: "pickup", specs: { "Furniture type": "Sofa", Material: "Teak wood", "Number of seats": "5" },
    contactPref: "call_and_chat", bestContactTime: "evening",
    sellerName: "You", sellerType: "individual",
    status: "active", createdAt: now - 2 * day, updatedAt: now - 2 * day,
    publishedAt: now - 2 * day, expiresAt: now + 28 * day, method: "detailed",
  },
  {
    id: "LSEEDIP13", title: "iPhone 13 128GB", price: 42000, negotiable: true,
    condition: "like_new",
    description: "iPhone 13, 128GB, midnight black. Battery health 92%. Original box, charger, invoice available.",
    category: "mobiles", subcategory: "Smartphones",
    images: ["https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&w=800&h=600&q=80"],
    cover: 0, pincode: "500081", area: "Madhapur", city: "Hyderabad",
    fulfilment: "both", specs: { Brand: "Apple", Model: "iPhone 13", Storage: "128GB", RAM: "4GB" },
    contactPref: "chat_only", bestContactTime: "anytime",
    sellerName: "You", sellerType: "individual",
    status: "under_review", createdAt: now - 20 * 60 * 1000, updatedAt: now - 20 * 60 * 1000,
    method: "quick",
  },
  {
    id: "LSEEDACTIVA", title: "Honda Activa 5G", price: 52000, negotiable: false,
    condition: "good",
    description: "2019 Honda Activa 5G, single owner, 18,000 km, all documents clear, recently serviced.",
    category: "bikes", subcategory: "Scooters",
    images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&h=600&q=80"],
    cover: 0, pincode: "500084", area: "Kondapur", city: "Hyderabad",
    fulfilment: "pickup", specs: { Brand: "Honda", Model: "Activa 5G", Year: "2019", "Kilometres driven": "18000" },
    contactPref: "call_and_chat", bestContactTime: "morning",
    sellerName: "You", sellerType: "individual",
    status: "sold", createdAt: now - 40 * day, updatedAt: now - 5 * day,
    publishedAt: now - 40 * day, finalSalePrice: 49000, soldChannel: "omeetso", method: "detailed",
  },
  {
    id: "LSEEDTV43", title: "Samsung 43-inch Smart TV", price: 25000, negotiable: true,
    condition: "good",
    description: "Samsung 43-inch full HD smart TV, 3 years old, in working condition.",
    category: "electronics", subcategory: "TVs",
    images: ["https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&h=600&q=80"],
    cover: 0, pincode: "500016", area: "Ameerpet", city: "Hyderabad",
    fulfilment: "pickup", specs: { Brand: "Samsung", "Product type": "Television", "Purchase year": "2022" },
    contactPref: "call_and_chat", bestContactTime: "evening",
    sellerName: "You", sellerType: "individual",
    status: "rejected", createdAt: now - 3 * day, updatedAt: now - 2 * day,
    rejection: {
      reason: "The listing image contains a visible phone number.",
      section: "Photos",
      correction: "Remove contact information from the image and upload a clean product photograph.",
      policyRef: "Omeetso Listing Policy §4.2 — No contact info in media",
      date: now - 2 * day,
    },
    method: "detailed",
  },
  {
    id: "LSEEDDESK1", title: "Study Table with Storage", price: 4500, negotiable: true,
    condition: "excellent",
    description: "Wooden study table with drawers and open shelves. Barely used.",
    category: "furniture", subcategory: "Office Furniture",
    images: [],
    cover: 0, pincode: "500072", area: "Kukatpally", city: "Hyderabad",
    fulfilment: "pickup", specs: {}, contactPref: "chat_only", bestContactTime: "anytime",
    sellerName: "You", sellerType: "individual",
    status: "expired", createdAt: now - 60 * day, updatedAt: now - 3 * day,
    publishedAt: now - 60 * day, expiresAt: now - 3 * day, method: "quick",
  },
];

const seedDrafts = (): ListingDraft[] => [
  {
    id: "DSTUDY1", method: "detailed", step: 4,
    title: "Study Table with Storage", price: 4500, negotiable: true,
    condition: "excellent", category: "furniture", subcategory: "Office Furniture",
    description: "Wooden study table with drawers. Barely used.",
    images: [], area: "Kukatpally", pincode: "500072", city: "Hyderabad",
    createdAt: now - day, updatedAt: now - 4 * 3600 * 1000,
  },
  {
    id: "DBIKEHELM", method: "quick", step: 2,
    title: "Riding helmet, ISI certified",
    condition: "like_new", category: "bikes", subcategory: "Spare Parts",
    images: [], area: "Madhapur", pincode: "500081", city: "Hyderabad",
    createdAt: now - 6 * 3600 * 1000, updatedAt: now - 6 * 3600 * 1000,
  },
];

const seedAnalytics = (): Record<string, ListingAnalytics> => ({
  LSEEDSOFA1: {
    impressions: 2450, views: 486, saves: 38, chats: 17, calls: 9, offers: 6, shares: 4,
    daily: [
      { d: "Mon", views: 42 }, { d: "Tue", views: 58 }, { d: "Wed", views: 66 },
      { d: "Thu", views: 71 }, { d: "Fri", views: 92 }, { d: "Sat", views: 78 }, { d: "Sun", views: 79 },
    ],
    topAreas: [
      { area: "Miyapur", pct: 32 }, { area: "Kukatpally", pct: 24 },
      { area: "Madhapur", pct: 18 }, { area: "Kondapur", pct: 14 },
    ],
  },
});

export function seedIfEmpty() {
  if (!isB) return;
  if (!localStorage.getItem(LS.listings)) write(LS.listings, []);
  if (!localStorage.getItem(LS.drafts)) write(LS.drafts, []);
  if (!localStorage.getItem(LS.analytics)) write(LS.analytics, {});
}

// ---- Labels ----
export const STATUS_LABEL: Record<ListingStatus, string> = {
  draft: "Draft",
  under_review: "Under Review",
  active: "Active",
  requires_changes: "Requires Changes",
  rejected: "Rejected",
  paused: "Paused",
  sold: "Sold",
  expired: "Expired",
  removed: "Removed",
};

export const CONDITION_LABEL: Record<Condition, string> = {
  new: "New",
  like_new: "Like New",
  excellent: "Excellent",
  good: "Good",
  fair: "Fair",
  needs_repair: "Needs Repair",
};

export const CONTACT_LABEL: Record<ContactPref, string> = {
  chat_only: "Chat only",
  call_and_chat: "Call and chat",
  hide_number: "Hide mobile number",
};

export const TIME_LABEL: Record<BestContactTime, string> = {
  anytime: "Anytime",
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
};

export const FULFILMENT_LABEL: Record<Fulfilment, string> = {
  pickup: "Pickup available",
  delivery: "Delivery available",
  both: "Pickup and delivery",
  buyer: "Buyer-arranged transport",
};

export const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);

export const timeAgo = (t: number) => {
  const diff = Date.now() - t;
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} day${d === 1 ? "" : "s"} ago`;
  return new Date(t).toLocaleDateString("en-IN");
};

export const formatDate = (t: number) =>
  new Date(t).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
