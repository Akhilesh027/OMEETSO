// Frontend API service to fetch live Categories & Subcategories from MongoDB backend
import { CATEGORIES as MOCK_CATEGORIES, SUBCATEGORIES as MOCK_SUBCATEGORIES, Category } from "./mock";

export type LiveCategory = Category & {
  subcategories: string[];
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
    const res = await fetch("https://api.omeetso.in/api/v1/categories");
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
            id: item.id || item.categoryId || item._id,
            name: item.name || mockFallback?.name || catId,
            icon: item.iconName || item.icon || CATEGORY_ICON_NAME_MAP[catId] || mockFallback?.icon || "Package",
            count: item.count ?? 0,
            tint: CATEGORY_TINT_MAP[catId] || mockFallback?.tint || "bg-primary/10 text-primary",
            subcategories: Array.isArray(item.subcategories) && item.subcategories.length > 0
              ? item.subcategories
              : (MOCK_SUBCATEGORIES[catId] || ["General"])
          };
        });

      cachedCategories = mapped;
      notify();
      return mapped;
    }
  } catch (err) {
    console.warn("Categories API offline, using fallback master data:", err);
  }

  // Fallback if API fails or backend is unreachable
  const fallback = MOCK_CATEGORIES.map((c) => ({
    ...c,
    subcategories: MOCK_SUBCATEGORIES[c.id] || ["General"]
  }));

  cachedCategories = fallback;
  return fallback;
}

export function getCachedCategories(): LiveCategory[] {
  if (cachedCategories && cachedCategories.length > 0) {
    return cachedCategories;
  }
  return MOCK_CATEGORIES.map((c) => ({
    ...c,
    subcategories: MOCK_SUBCATEGORIES[c.id] || ["General"]
  }));
}
