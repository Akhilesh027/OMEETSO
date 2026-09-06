// Frontend API service to fetch live Categories & Subcategories from MongoDB backend
import { CATEGORIES as MOCK_CATEGORIES, SUBCATEGORIES as MOCK_SUBCATEGORIES, Category, getSubcategoriesForCategory } from "./mock";
import { API_BASE } from "@/config/api";

export type LiveCategory = Category & {
  subcategories: (string | { id: string; name: string })[];
};

let cachedCategories: LiveCategory[] | null = null;
const listeners = new Set<() => void>();

export function subscribeCategories(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notify() {
  listeners.forEach((l) => l());
}

export function getLocalCustomCategories(): LiveCategory[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("omeetso_custom_categories");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch { }
  return [];
}

const CATEGORY_TINT_MAP: Record<string, string> = {
  cars: "bg-blue-500/10 text-blue-600",
  bikes: "bg-orange-500/10 text-orange-600",
  mobiles: "bg-violet-500/10 text-violet-600",
  electronics: "bg-sky-500/10 text-sky-600",
  furniture: "bg-amber-500/10 text-amber-600",
  properties: "bg-emerald-500/10 text-emerald-600",
  fashion: "bg-pink-500/10 text-pink-600",
  "home-appliances": "bg-teal-500/10 text-teal-600",
  appliances: "bg-teal-500/10 text-teal-600",
  jobs: "bg-indigo-500/10 text-indigo-600",
  services: "bg-rose-500/10 text-rose-600",
  "commercial-vehicles": "bg-cyan-500/10 text-cyan-600",
  commercial: "bg-cyan-500/10 text-cyan-600",
  "books-sports": "bg-lime-500/10 text-lime-600",
  books: "bg-lime-500/10 text-lime-600",
  agriculture: "bg-green-500/10 text-green-600",
  agri: "bg-green-500/10 text-green-600",
};

const CATEGORY_ICON_NAME_MAP: Record<string, string> = {
  cars: "Car",
  bikes: "Bike",
  mobiles: "Smartphone",
  electronics: "Laptop",
  furniture: "Sofa",
  properties: "Building2",
  fashion: "Shirt",
  "home-appliances": "Tv",
  appliances: "Tv",
  jobs: "Briefcase",
  services: "Wrench",
  "commercial-vehicles": "Truck",
  commercial: "Truck",
  "books-sports": "BookOpen",
  books: "BookOpen",
  agriculture: "Sprout",
  agri: "Sprout",
};

export async function fetchLiveCategories(): Promise<LiveCategory[]> {
  try {
    let res = await fetch(`${API_BASE}/categories`).catch(() => null);

    // Fallback to local server if production URL fails
    if (!res || !res.ok) {
      const localRes = await fetch("https://api.omeetso.in/api/v1/categories").catch(() => null);
      if (localRes && localRes.ok) {
        res = localRes;
      }
    }

    if (res && res.ok) {
      const json = await res.json();

      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        const mapped: LiveCategory[] = json.data
          .filter((item: any) => {
            const catId = (item.id || item.categoryId || item._id || "").toString().toLowerCase();
            return catId !== "pets" && item.name?.toLowerCase() !== "pets";
          })
          .map((item: any) => {
            const catId = (item.id || item.categoryId || item._id || "").toString().toLowerCase();
            const mockFallback = MOCK_CATEGORIES.find((c) => c.id.toLowerCase() === catId);

            return {
              id: item.categoryId || item.id || item._id,
              name: item.name || mockFallback?.name || catId,
              icon: item.iconName || item.icon || CATEGORY_ICON_NAME_MAP[catId] || mockFallback?.icon || "Package",
              count: item.count ?? 0,
              tint: CATEGORY_TINT_MAP[catId] || mockFallback?.tint || "bg-primary/10 text-primary",
              subcategories: Array.isArray(item.subcategories) && item.subcategories.length > 0
                ? item.subcategories
                : (MOCK_SUBCATEGORIES[catId] || ["General"])
            };
          });

        // Merge locally added custom categories that might not have reached DB yet
        const localCustom = getLocalCustomCategories();
        const existingIds = new Set(mapped.map((c) => c.id.toLowerCase()));
        localCustom.forEach((c) => {
          if (!existingIds.has(c.id.toLowerCase())) {
            mapped.push(c);
            existingIds.add(c.id.toLowerCase());
          }
        });

        cachedCategories = mapped;
        try {
          localStorage.setItem("omeetso_cached_categories", JSON.stringify(mapped));
        } catch { }
        notify();
        return mapped;
      }
    }
  } catch (err) {
    console.warn("Categories API offline, using cached or fallback master data:", err);
  }

  // Fallback: check localStorage cache, then mock master data merged with custom categories
  const localCustom = getLocalCustomCategories();
  const fallback = MOCK_CATEGORIES.map((c) => ({
    ...c,
    subcategories: MOCK_SUBCATEGORIES[c.id] || ["General"]
  }));

  const existingIds = new Set(fallback.map((c) => c.id.toLowerCase()));
  localCustom.forEach((c) => {
    if (!existingIds.has(c.id.toLowerCase())) {
      fallback.push(c);
      existingIds.add(c.id.toLowerCase());
    }
  });

  cachedCategories = fallback;
  return fallback;
}

export function getCachedCategories(): LiveCategory[] {
  if (cachedCategories && cachedCategories.length > 0) {
    return cachedCategories;
  }

  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("omeetso_cached_categories");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const localCustom = getLocalCustomCategories();
          const existingIds = new Set(parsed.map((c: any) => (c.id || "").toLowerCase()));
          localCustom.forEach((c) => {
            if (!existingIds.has(c.id.toLowerCase())) {
              parsed.push(c);
            }
          });
          cachedCategories = parsed;
          return parsed;
        }
      }
    } catch { }
  }

  const localCustom = getLocalCustomCategories();
  const fallback = MOCK_CATEGORIES.map((c) => ({
    ...c,
    subcategories: MOCK_SUBCATEGORIES[c.id] || ["General"]
  }));

  const existingIds = new Set(fallback.map((c) => c.id.toLowerCase()));
  localCustom.forEach((c) => {
    if (!existingIds.has(c.id.toLowerCase())) {
      fallback.push(c);
      existingIds.add(c.id.toLowerCase());
    }
  });

  return fallback;
}

export function getLiveSubcategories(catId: string): { id: string; name: string }[] {
  const cats = getCachedCategories();
  const found = cats.find((c) => c.id.toLowerCase() === (catId || "").toLowerCase());
  if (found && Array.isArray(found.subcategories) && found.subcategories.length > 0) {
    return found.subcategories.map((item: any) => {
      if (typeof item === "string") {
        return { id: item.toLowerCase().replace(/\s+/g, "_"), name: item };
      }
      return { id: item.id || (item.name || "").toLowerCase().replace(/\s+/g, "_"), name: item.name || String(item) };
    });
  }
  return getSubcategoriesForCategory(catId);
}

export async function addNewCategory(newCat: {
  name: string;
  id?: string;
  subcategories?: string[];
  iconName?: string;
}): Promise<LiveCategory> {
  const generatedId = (newCat.id || newCat.name)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const cleanSubs = (newCat.subcategories && newCat.subcategories.length > 0)
    ? newCat.subcategories.map((s) => s.trim()).filter(Boolean)
    : ["General", "Other"];

  const liveCat: LiveCategory = {
    id: generatedId,
    name: newCat.name.trim(),
    icon: newCat.iconName || "Layers",
    count: 0,
    tint: "bg-indigo-500/10 text-indigo-600",
    subcategories: cleanSubs
  };

  // 1. Immediately store in localStorage so it's instantly available without any network lag
  if (typeof window !== "undefined") {
    try {
      const current = getLocalCustomCategories();
      const filtered = current.filter((c) => c.id.toLowerCase() !== generatedId.toLowerCase());
      filtered.unshift(liveCat);
      localStorage.setItem("omeetso_custom_categories", JSON.stringify(filtered));

      // Update cachedCategories
      const existingCached = getCachedCategories();
      const updatedCache = [liveCat, ...existingCached.filter((c) => c.id.toLowerCase() !== generatedId.toLowerCase())];
      cachedCategories = updatedCache;
      localStorage.setItem("omeetso_cached_categories", JSON.stringify(updatedCache));
    } catch { }

    // Dispatch custom event for real-time live component re-rendering
    window.dispatchEvent(new CustomEvent("omeetso_categories_changed", { detail: liveCat }));
  }

  notify();

  // 2. Persist to MongoDB backend in background
  try {
    const payload = {
      name: liveCat.name,
      categoryId: liveCat.id,
      row: 1,
      iconName: liveCat.icon,
      subcategories: cleanSubs
    };

    let res = await fetch(`${API_BASE}/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).catch(() => null);

    if (!res || !res.ok) {
      await fetch("https://api.omeetso.in/api/v1/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).catch(() => null);
    }
  } catch (err) {
    console.warn("Backend category sync deferred:", err);
  }

  return liveCat;
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === "omeetso_custom_categories" || e.key === "omeetso_cached_categories") {
      cachedCategories = null;
      notify();
    }
  });
  window.addEventListener("omeetso_categories_changed", () => {
    cachedCategories = null;
    notify();
  });
}
