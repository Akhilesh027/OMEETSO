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

export const DEFAULT_SAMPLE_STORES: PublicStore[] = [
  {
    id: "store-adilabad-1",
    name: "Adilabad Super Mobiles & Electronics",
    slug: "adilabad-super-mobiles-electronics",
    tagline: "Authorized Smartphones, Laptops & Home Appliances",
    description: "Adilabad's premier local electronics showroom on Collectorate Road. Verified genuine brand warranties, fast local doorstep delivery, and trade-in exchange deals.",
    cover: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1000",
    logo: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=200",
    category: "mobiles",
    primaryCategory: "mobiles",
    area: "Collectorate Road",
    city: "Adilabad",
    pincode: "504001",
    address: "Main Road, Near Collectorate Complex, Adilabad, Telangana",
    distanceKm: 0.8,
    rating: 4.9,
    reviews: 38,
    open: true,
    verified: true,
    sponsored: false
  },
  {
    id: "store-hyd-1",
    name: "Apex Digital & Mobile Store",
    slug: "apex-digital-mobiles-hyderabad",
    tagline: "Certified Flagship Gadgets & Apple Authorized Deals",
    description: "Premier local electronics store in Madhapur with genuine warranty, express 2-hour delivery, and trade-in exchange options.",
    cover: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1000",
    logo: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=200",
    category: "mobiles",
    primaryCategory: "mobiles",
    area: "Madhapur",
    city: "Hyderabad",
    pincode: "500081",
    address: "Plot 42, Silicon Valley Layout, Madhapur, Hyderabad",
    distanceKm: 1.2,
    rating: 4.9,
    reviews: 42,
    open: true,
    verified: true,
    sponsored: false
  },
  {
    id: "store-blr-1",
    name: "Greenwood Living & Furniture Studio",
    slug: "greenwood-living-furniture-bangalore",
    tagline: "Solid Teak & Sheesham Handcrafted Home Decor",
    description: "Direct factory pricing on handcrafted living room, bedroom, and executive office furniture with lifetime termite warranty and doorstep assembly.",
    cover: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1000",
    logo: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200",
    category: "furniture",
    primaryCategory: "furniture",
    area: "Koramangala",
    city: "Bangalore",
    pincode: "560034",
    address: "100 Feet Road, 4th Block, Koramangala, Bangalore",
    distanceKm: 1.5,
    rating: 4.8,
    reviews: 38,
    open: true,
    verified: true,
    sponsored: false
  },
  {
    id: "store-mum-1",
    name: "Velocity Motors & Pre-Owned Wheels",
    slug: "velocity-motors-wheels-mumbai",
    tagline: "Certified Inspected Cars & Superbikes with 1-Year Engine Warranty",
    description: "Mumbai's trusted pre-owned vehicle showroom in Bandra. Every car and bike undergoes 180-point inspection with zero accident history.",
    cover: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1000",
    logo: "https://images.unsplash.com/photo-1563720223185-11003d516935?w=200",
    category: "cars",
    primaryCategory: "cars",
    area: "Bandra West",
    city: "Mumbai",
    pincode: "400050",
    address: "Hill Road, Near Bandra Station, Bandra West, Mumbai",
    distanceKm: 2.1,
    rating: 4.9,
    reviews: 65,
    open: true,
    verified: true,
    sponsored: false
  }
];

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
