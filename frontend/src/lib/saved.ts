// Saved products & recent searches — localStorage-backed with subscribe pattern
const SAVED_KEY = "omeetso_saved_products";
const RECENT_KEY = "omeetso_recent_searches";
const OFFERS_KEY = "omeetso_offers";
const REPORTS_KEY = "omeetso_reports";
const VIEWED_KEY = "omeetso_recently_viewed";
const FOLLOWED_SELLERS_KEY = "omeetso_followed_sellers";

type Listener = () => void;
const listeners = new Set<Listener>();
export function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}
function emit() { listeners.forEach((l) => l()); }

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}
function write<T>(key: string, val: T) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* ignore */ }
  emit();
}

// Saved products
export function getSaved(): string[] { return read<string[]>(SAVED_KEY, []); }
export function isSaved(id: string) { return getSaved().includes(id); }
export function toggleSaved(id: string) {
  const cur = getSaved();
  const next = cur.includes(id) ? cur.filter((x) => x !== id) : [id, ...cur];
  write(SAVED_KEY, next);
  return next.includes(id);
}
export function removeSaved(id: string) {
  write(SAVED_KEY, getSaved().filter((x) => x !== id));
}

// Followed Sellers
export type FollowedSeller = {
  id: string;
  name: string;
  avatar?: string;
  area?: string;
  rating?: number;
  followedAt: number;
};

export function getFollowedSellers(): FollowedSeller[] {
  return read<FollowedSeller[]>(FOLLOWED_SELLERS_KEY, []);
}

export function isFollowingSeller(id: string): boolean {
  return getFollowedSellers().some((s) => s.id === id);
}

export function toggleFollowSeller(s: { id: string; name: string; avatar?: string; area?: string; rating?: number }): boolean {
  const current = getFollowedSellers();
  const exists = current.some((x) => x.id === s.id);
  let next: FollowedSeller[];
  if (exists) {
    next = current.filter((x) => x.id !== s.id);
  } else {
    next = [{ id: s.id, name: s.name, avatar: s.avatar, area: s.area, rating: s.rating || 0, followedAt: Date.now() }, ...current];
  }
  write(FOLLOWED_SELLERS_KEY, next);
  return !exists;
}

// Recent searches
export function getRecentSearches(): string[] { return read<string[]>(RECENT_KEY, []); }
export function addRecentSearch(q: string) {
  const norm = q.trim();
  if (!norm) return;
  const cur = getRecentSearches().filter((x) => x.toLowerCase() !== norm.toLowerCase());
  write(RECENT_KEY, [norm, ...cur].slice(0, 10));
}
export function removeRecentSearch(q: string) {
  write(RECENT_KEY, getRecentSearches().filter((x) => x !== q));
}
export function clearRecentSearches() { write(RECENT_KEY, []); }

// Offers
export type StoredOffer = { productId: string; amount: number; message?: string; time: number };
export function getOffers(): StoredOffer[] { return read<StoredOffer[]>(OFFERS_KEY, []); }
export function addOffer(o: StoredOffer) { write(OFFERS_KEY, [o, ...getOffers()]); }
export function hasActiveOffer(productId: string) {
  return getOffers().some((o) => o.productId === productId);
}

// Reports
export type StoredReport = { id: string; productId: string; reason: string; description?: string; time: number };
export function getReports(): StoredReport[] { return read<StoredReport[]>(REPORTS_KEY, []); }
export function addReport(r: Omit<StoredReport, "id" | "time">) {
  const rec: StoredReport = { ...r, id: "RPT-" + Math.random().toString(36).slice(2, 8).toUpperCase(), time: Date.now() };
  write(REPORTS_KEY, [rec, ...getReports()]);
  return rec;
}

// Recently viewed
export function getRecentlyViewed(): string[] { return read<string[]>(VIEWED_KEY, []); }
export function addRecentlyViewed(id: string) {
  const cur = getRecentlyViewed().filter((x) => x !== id);
  write(VIEWED_KEY, [id, ...cur].slice(0, 12));
}
