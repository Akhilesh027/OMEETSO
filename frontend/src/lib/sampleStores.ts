export interface PublicStore {
  id: string;
  name: string;
  slug: string;
  tagline?: string;
  description?: string;
  logo?: string;
  cover?: string;
  category: string;
  primaryCategory?: string;
  pincode?: string;
  area: string;
  city: string;
  address?: string;
  rating: number;
  reviews: number;
  open: boolean;
  verified: boolean;
  sponsored?: boolean;
  distanceKm?: number;
}

export const DEFAULT_SAMPLE_STORES: PublicStore[] = [];

/**
 * Match a store against a target location (city, area, pincode).
 * Strict hyperlocal precision: does not spoof other cities' stores as local.
 */
export function matchStoreLocation(
  store: any,
  loc: { city?: string; area?: string; pincode?: string } | null | undefined
): boolean {
  if (!loc || (!loc.city && !loc.area && !loc.pincode)) {
    return true; // No filter requested -> show store
  }

  const targetCity = (loc.city || "").toLowerCase().trim();
  const targetArea = (loc.area || "").toLowerCase().trim();
  const targetPin = String(loc.pincode || "").replace(/\D/g, "").trim();

  const storeCity = (store.city || "").toLowerCase().trim();
  const storeArea = (store.area || "").toLowerCase().trim();
  const storePin = String(store.pincode || "").replace(/\D/g, "").trim();

  // 1. Pincode match
  if (targetPin && storePin && targetPin === storePin) {
    return true;
  }

  // 2. City match
  if (targetCity && storeCity) {
    if (storeCity === targetCity || storeCity.includes(targetCity) || targetCity.includes(storeCity)) {
      return true;
    }
  }

  // 3. Area match
  if (targetArea) {
    // If targetArea mentions the city (e.g. "Adilabad, Telangana")
    const areaTokens = targetArea.split(/[,\s]+/).filter((t) => t.length >= 3);
    for (const token of areaTokens) {
      if (storeCity.includes(token) || storeArea.includes(token)) {
        return true;
      }
    }
    if (storeArea && (storeArea.includes(targetArea) || targetArea.includes(storeArea))) {
      return true;
    }
  }

  return false;
}
