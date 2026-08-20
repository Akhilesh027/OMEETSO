// Omeetso — Phase 3B Stores data layer (frontend + localStorage only).

export type StoreStatus =
  | "draft"
  | "under_review"
  | "active"
  | "requires_changes"
  | "rejected"
  | "paused"
  | "suspended";

export type StoreVerification = {
  mobile: boolean;
  email: boolean;
  identity: boolean;
  address: boolean;
  gst: boolean;
};

export type WorkingHour = {
  day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  closed: boolean;
  open: string; // "10:00"
  close: string; // "21:00"
};

export type Store = {
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
  contactActions: { chat: boolean; call: boolean; whatsapp: boolean; directions: boolean };
  workingHours: WorkingHour[];
  is24x7: boolean;
  lunchBreak?: { start: string; end: string };
  delivery: {
    pickup: boolean;
    localDelivery: boolean;
    buyerPickup: boolean;
    radiusKm: number;
    charge: number;
    freeAbove: number;
    sameDay: boolean;
    etaHours: number;
  };
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

export type StoreDraft = Partial<Store> & {
  id: string;
  step?: number;
  createdAt: number;
  updatedAt: number;
};

export type BusinessProfile = {
  ownerName: string;
  mobile: string;
  email: string;
  businessType: string;
  businessCategory: string;
  gst?: string;
  registrationNumber?: string;
  primaryLocation: string;
};

export const LS = {
  stores: "omeetso_user_stores",
  drafts: "omeetso_store_drafts",
  selected: "omeetso_selected_store",
  storeProducts: "omeetso_store_products",
  storePrefs: "omeetso_store_preferences",
  businessProfile: "omeetso_business_profile",
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
const subs = new Set<() => void>();
const write = (k: string, v: unknown) => {
  if (!isB) return;
  try {
    localStorage.setItem(k, JSON.stringify(v));
    for (const cb of subs) cb();
  } catch { /* ignore */ }
};
export const subscribe = (cb: () => void) => { subs.add(cb); return () => subs.delete(cb); };

export const newStoreId = () =>
  `ST${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`.toUpperCase();

import { getUserAccessToken } from "@/api/auth.api";

// ---- Stores ----
export function listStores(): Store[] { return read<Store[]>(LS.stores, []); }

export async function fetchLiveUserStores(): Promise<Store[]> {
  const token = typeof window !== "undefined" ? (getUserAccessToken() || localStorage.getItem("omeetso_user_token")) : null;
  if (!token) return listStores();

  try {
    const res = await fetch("http://localhost:3000/api/v1/stores/user/me", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      const mapped: Store[] = json.data.map((item: any) => ({
        ...emptyStore(),
        id: item.id || item._id,
        name: item.name,
        tagline: item.tagline || "",
        description: item.description || "",
        businessType: item.businessType || "Retailer",
        primaryCategory: item.primaryCategory || "general",
        supportingCategories: item.supportingCategories || [],
        pincode: item.pincode || "500081",
        area: item.area || "Madhapur",
        city: item.city || "Hyderabad",
        address: item.address || "",
        businessMobile: item.businessMobile || "",
        email: item.email || "",
        logo: item.logo,
        cover: item.cover,
        status: (item.status?.toLowerCase() || "under_review") as StoreStatus,
        createdAt: new Date(item.createdAt || Date.now()).getTime(),
        updatedAt: new Date(item.updatedAt || Date.now()).getTime()
      }));
      write(LS.stores, mapped);
      return mapped;
    }
  } catch (err) {
    console.warn("Failed to fetch stores from backend:", err);
  }
  return listStores();
}

export function getStore(id: string): Store | undefined {
  return listStores().find((s) => s.id === id);
}
export function upsertStore(s: Store) {
  const all = listStores();
  const i = all.findIndex((x) => x.id === s.id);
  const now = Date.now();
  const next: Store = { ...s, updatedAt: now };
  if (i === -1) all.unshift(next);
  else all[i] = next;
  write(LS.stores, all);
  return next;
}
export function deleteStore(id: string) {
  write(LS.stores, listStores().filter((s) => s.id !== id));
}
export function setStoreStatus(id: string, status: StoreStatus) {
  const s = getStore(id); if (!s) return;
  upsertStore({ ...s, status });
}

// ---- Drafts ----
export function listStoreDrafts(): StoreDraft[] { return read<StoreDraft[]>(LS.drafts, []); }
export function getStoreDraft(id: string) { return listStoreDrafts().find((d) => d.id === id); }
export function saveStoreDraft(d: StoreDraft) {
  const all = listStoreDrafts();
  const i = all.findIndex((x) => x.id === d.id);
  const next = { ...d, updatedAt: Date.now() };
  if (i === -1) all.unshift(next); else all[i] = next;
  write(LS.drafts, all);
  return next;
}
export function deleteStoreDraft(id: string) {
  write(LS.drafts, listStoreDrafts().filter((d) => d.id !== id));
}

// ---- Selected store ----
export function getSelectedStoreId(): string | undefined {
  return read<string | undefined>(LS.selected, undefined);
}
export function setSelectedStoreId(id: string | undefined) { write(LS.selected, id); }

// ---- Business profile ----
export function getBusinessProfile(): BusinessProfile | undefined {
  return read<BusinessProfile | undefined>(LS.businessProfile, undefined);
}
export function setBusinessProfile(p: BusinessProfile) { write(LS.businessProfile, p); }

// ---- Labels + constants ----
export const STORE_STATUS_LABEL: Record<StoreStatus, string> = {
  draft: "Draft",
  under_review: "Under Review",
  active: "Active",
  requires_changes: "Requires Changes",
  rejected: "Rejected",
  paused: "Paused",
  suspended: "Suspended",
};

export const BUSINESS_TYPES = [
  "Retail store",
  "Wholesale store",
  "Service business",
  "Home-based business",
  "Dealer",
  "Manufacturer",
  "Other",
];

export const EXPERIENCE_OPTIONS = [
  "Less than 1 year",
  "1–3 years",
  "3–5 years",
  "5–10 years",
  "More than 10 years",
];

export const PRIMARY_CATEGORIES = [
  { id: "cars", label: "Cars" },
  { id: "bikes", label: "Bikes" },
  { id: "mobiles", label: "Mobiles" },
  { id: "electronics", label: "Electronics" },
  { id: "furniture", label: "Furniture" },
  { id: "properties", label: "Properties" },
  { id: "fashion", label: "Fashion" },
  { id: "home_appliances", label: "Home Appliances" },
  { id: "services", label: "Services" },
  { id: "agriculture", label: "Agriculture" },
  { id: "books_sports", label: "Books and Sports" },
  { id: "other", label: "Other Products" },
];

export const SUPPORTING_CATEGORIES: Record<string, string[]> = {
  electronics: ["Televisions", "Refrigerators", "Washing Machines", "Air Conditioners", "Kitchen Appliances", "Speakers", "Laptops"],
  mobiles: ["Smartphones", "Accessories", "Tablets", "Feature Phones"],
  furniture: ["Sofas", "Beds", "Tables", "Office Furniture", "Wardrobes"],
  home_appliances: ["Mixers", "Microwaves", "Fans", "Water Purifiers", "Chimneys"],
  cars: ["Sedan", "SUV", "Hatchback", "Used Cars"],
  bikes: ["Scooters", "Motorcycles", "Spare Parts"],
  fashion: ["Men", "Women", "Kids", "Accessories"],
  properties: ["For Sale", "For Rent", "PG"],
  services: ["Repair", "Cleaning", "Tutoring", "Photography"],
  agriculture: ["Seeds", "Tools", "Machinery"],
  books_sports: ["Books", "Sports Gear", "Fitness"],
  other: ["Miscellaneous"],
};

export const DAYS: WorkingHour["day"][] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const defaultWorkingHours = (): WorkingHour[] =>
  DAYS.map((day) => ({
    day,
    closed: false,
    open: "10:00",
    close: day === "Sun" ? "18:00" : "21:00",
  }));

export const emptyStore = (): Store => ({
  id: "",
  name: "",
  description: "",
  businessType: "",
  experience: "",
  brandColor: "#111E4D",
  tagline: "",
  primaryCategory: "",
  supportingCategories: [],
  pincode: "",
  area: "",
  city: "Hyderabad",
  state: "Telangana",
  address: "",
  landmark: "",
  showAddressPublicly: true,
  businessMobile: "",
  altMobile: "",
  whatsapp: "",
  email: "",
  website: "",
  contactActions: { chat: true, call: true, whatsapp: true, directions: true },
  workingHours: defaultWorkingHours(),
  is24x7: false,
  delivery: {
    pickup: true,
    localDelivery: true,
    buyerPickup: false,
    radiusKm: 10,
    charge: 100,
    freeAbove: 5000,
    sameDay: false,
    etaHours: 24,
  },
  verification: { mobile: false, email: false, identity: false, address: false, gst: false },
  status: "draft",
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

// ---- Store open/closed helper ----
export function storeOpenState(s: Store): { open: boolean; label: string } {
  if (s.is24x7) return { open: true, label: "Open 24×7" };
  const now = new Date();
  const dayMap: Record<number, WorkingHour["day"]> = { 0: "Sun", 1: "Mon", 2: "Tue", 3: "Wed", 4: "Thu", 5: "Fri", 6: "Sat" };
  const wh = s.workingHours.find((w) => w.day === dayMap[now.getDay()]);
  if (!wh || wh.closed) return { open: false, label: "Closed today" };
  const cur = now.getHours() * 60 + now.getMinutes();
  const toMin = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
  const o = toMin(wh.open); const c = toMin(wh.close);
  if (cur < o) return { open: false, label: `Opens at ${wh.open}` };
  if (cur >= c) return { open: false, label: "Closed" };
  if (c - cur <= 30) return { open: true, label: "Closing soon" };
  return { open: true, label: "Open now" };
}

// ---- Seeding ----
export function seedStoresIfEmpty() {
  if (!isB) return;
  if (!localStorage.getItem(LS.stores)) {
    write(LS.stores, []);
  }
}
