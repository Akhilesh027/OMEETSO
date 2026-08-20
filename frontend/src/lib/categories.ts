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

export async function fetchLiveCategories(): Promise<LiveCategory[]> {
  try {
    const res = await fetch("https://api.omeetso.in/api/v1/categories");
    const json = await res.json();

    if (json.success && Array.isArray(json.data) && json.data.length > 0) {
      const mapped: LiveCategory[] = json.data.map((item: any) => {
        const catId = item.id || item.categoryId || item._id;
        const mockFallback = MOCK_CATEGORIES.find((c) => c.id.toLowerCase() === catId.toLowerCase());

        return {
          id: catId,
          name: item.name || mockFallback?.name || catId,
          icon: item.iconName || item.icon || mockFallback?.icon || "Package",
          count: item.count ?? 0,
          tint: mockFallback?.tint || "bg-indigo-100",
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
