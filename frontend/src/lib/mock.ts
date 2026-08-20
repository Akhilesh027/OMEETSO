// Omeetso core types & dynamic data helpers
import { listListings } from "./listings";

export type ID = string;

export type Category = {
  id: string;
  name: string;
  icon: string;
  count: number;
  tint: string;
};

export type Product = {
  id: ID;
  title: string;
  price: number;
  negotiable?: boolean;
  category: string;
  subcategory?: string;
  condition: string;
  area: string;
  distanceKm: number;
  postedAgo: string;
  image: string;
  images?: string[];
  verified?: boolean;
  sponsored?: boolean;
  sellerId: ID;
  storeId?: ID;
  description: string;
  specs?: Record<string, string>;
  sold?: boolean;
  unavailable?: boolean;
};

export type Seller = {
  id: ID;
  name: string;
  avatar?: string;
  memberSince: string;
  rating: number;
  reviews: number;
  responseTime: string;
  responseRate?: string;
  verified?: boolean;
  type?: "individual" | "business";
  about?: string;
  area?: string;
};

export type Store = {
  id: ID;
  name: string;
  category: string;
  area: string;
  distanceKm: number;
  rating: number;
  reviews: number;
  products: number;
  yearsInBusiness: string;
  responseRate: string;
  verified: boolean;
  logo: string;
  cover: string;
  open: boolean;
  sponsored?: boolean;
};

export type ChatThread = {
  id: ID;
  productId: ID;
  peerName: string;
  peerAvatar?: string;
  lastMessage: string;
  time: string;
  unread: number;
  online?: boolean;
};

export type Message = {
  id: ID;
  from: "me" | "them" | "system";
  text: string;
  time: string;
};

export type Notification = {
  id: ID;
  kind: "message" | "offer" | "listing" | "system" | "boost" | "pricedrop";
  title: string;
  body: string;
  time: string;
  read?: boolean;
};

export type Ad = {
  id: ID;
  placement:
    | "HOME_HERO"
    | "HOME_CATEGORY_STRIP"
    | "HOME_NATIVE_FEED"
    | "HOME_SECONDARY_BANNER"
    | "CATEGORY_HERO"
    | "PRODUCT_CONTEXTUAL"
    | "STORE_LISTING_NATIVE";
  advertiser: string;
  headline: string;
  body?: string;
  cta: string;
  image?: string;
  targetArea?: string;
  category?: string;
};

export const CATEGORIES: Category[] = [
  { id: "cars", name: "Cars", icon: "Car", count: 0, tint: "bg-blue-100" },
  { id: "bikes", name: "Bikes", icon: "Bike", count: 0, tint: "bg-orange-100" },
  { id: "mobiles", name: "Mobiles", icon: "Smartphone", count: 0, tint: "bg-indigo-100" },
  { id: "electronics", name: "Electronics", icon: "Tv", count: 0, tint: "bg-sky-100" },
  { id: "furniture", name: "Furniture", icon: "Sofa", count: 0, tint: "bg-amber-100" },
  { id: "properties", name: "Properties", icon: "Building2", count: 0, tint: "bg-emerald-100" },
  { id: "fashion", name: "Fashion", icon: "Shirt", count: 0, tint: "bg-pink-100" },
  { id: "appliances", name: "Home Appliances", icon: "Refrigerator", count: 0, tint: "bg-teal-100" },
  { id: "jobs", name: "Jobs", icon: "Briefcase", count: 0, tint: "bg-violet-100" },
  { id: "services", name: "Services", icon: "Wrench", count: 0, tint: "bg-rose-100" },
  { id: "pets", name: "Pets", icon: "PawPrint", count: 0, tint: "bg-yellow-100" },
  { id: "commercial", name: "Commercial Vehicles", icon: "Truck", count: 0, tint: "bg-cyan-100" },
  { id: "books", name: "Books & Sports", icon: "BookOpen", count: 0, tint: "bg-lime-100" },
  { id: "agri", name: "Agriculture", icon: "Sprout", count: 0, tint: "bg-green-100" },
  { id: "other", name: "Other Products", icon: "Package", count: 0, tint: "bg-slate-100" },
];

export const SUBCATEGORIES: Record<string, string[]> = {
  cars: ["Used Cars", "New Cars", "Car Accessories", "Spare Parts", "Car Services"],
  bikes: ["Motorcycles", "Scooters", "Bicycles", "Spare Parts", "Bike Services"],
  mobiles: ["Smartphones", "Tablets", "Accessories", "Smart Watches", "Repair"],
  electronics: ["TVs", "Laptops", "Cameras", "Audio", "Gaming"],
  furniture: ["Sofas", "Beds", "Dining Tables", "Wardrobes", "Chairs", "Office Furniture", "Other Furniture"],
  properties: ["For Rent", "For Sale", "PG & Hostels", "Land & Plots", "Commercial"],
  fashion: ["Men", "Women", "Kids", "Watches", "Bags & Luggage"],
  appliances: ["Refrigerators", "Washing Machines", "ACs", "Kitchen Appliances", "Water Purifiers"],
  jobs: ["Full time", "Part time", "Work from home", "Internships", "Freshers"],
  services: ["Home Repair", "Cleaning", "Tutors", "Movers", "Photography"],
  pets: ["Dogs", "Cats", "Birds", "Fish", "Pet Food & Accessories"],
  commercial: ["Auto Rickshaws", "Trucks", "Tractors", "Buses", "Spare Parts"],
  books: ["Books", "Gym & Fitness", "Musical Instruments", "Sports Equipment", "Games & Toys"],
  agri: ["Tractors", "Farm Equipment", "Seeds & Plants", "Livestock", "Land"],
  other: ["Collectibles", "Art", "Household Items", "Miscellaneous"],
};

export function getSubcategoriesForCategory(catId: string): { id: string; name: string }[] {
  const key = (catId || "mobiles").toLowerCase();
  const raw = SUBCATEGORIES[key] || ["General"];
  return raw.map((item: any) => {
    if (typeof item === "string") {
      return { id: item.toLowerCase().replace(/\s+/g, "_"), name: item };
    }
    return { id: item.id || item.name.toLowerCase().replace(/\s+/g, "_"), name: item.name };
  });
}

export const PRODUCTS: Product[] = [];
export const SELLERS: Seller[] = [];
export const STORES: Store[] = [];
export const CHATS: ChatThread[] = [];
export const MESSAGES: Record<ID, Message[]> = {};
export const NOTIFICATIONS: Notification[] = [];
export const ADS: Ad[] = [];

export const AREAS = [
  "Madhapur", "Gachibowli", "Kondapur", "Kukatpally", "Banjara Hills",
  "Uppal", "Nagole", "LB Nagar", "Secunderabad", "Miyapur",
  "Hitech City", "Ameerpet",
];

export const AREA_PINCODES: Record<string, string> = {
  Madhapur: "500081", Gachibowli: "500032", Kondapur: "500084",
  Kukatpally: "500072", "Banjara Hills": "500034", Uppal: "500039",
  Nagole: "500068", "LB Nagar": "500074", Secunderabad: "500003",
  Miyapur: "500049", "Hitech City": "500081", Ameerpet: "500016",
};

export const TRENDING_SEARCHES = [
  "Bikes under ₹50,000", "Dining tables", "AC for sale",
  "Rental flats", "Jobs near me", "iPhone 15", "Study table",
];

export const DEFAULT_RECENT_SEARCHES = [
  "Used cars", "iPhone 13", "Wooden sofa", "2 BHK rent",
];

export const SORT_OPTIONS = [
  { id: "relevance", label: "Relevance" },
  { id: "newest", label: "Newest first" },
  { id: "price-low", label: "Price: Low to High" },
  { id: "price-high", label: "Price: High to Low" },
  { id: "distance", label: "Distance" },
  { id: "views", label: "Most viewed" },
  { id: "updated", label: "Recently updated" },
];

export const REPORT_REASONS = [
  "Fraudulent or scam listing",
  "Prohibited or illegal item",
  "Incorrect item details or price",
  "Counterfeit or fake product",
  "Offensive content or images",
  "Duplicate or spam listing",
  "Seller unresponsive or suspicious",
  "Other safety concern"
];

export const formatINR = (n: number) => {
  if (!n) return "Free";
  return "₹" + n.toLocaleString("en-IN");
};

export const getProduct = (id: string) => {
  const live = listListings().find((l) => l.id === id);
  if (live) {
    const mainImg = Array.isArray(live.images) && live.images.length > 0 && !live.images[0].startsWith("blob:")
      ? live.images[0]
      : "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400";

    return {
      id: live.id,
      title: live.title,
      price: live.price,
      originalPrice: Math.round(live.price * 1.15),
      image: mainImg,
      images: live.images && live.images.length > 0 && !live.images[0].startsWith("blob:")
        ? live.images
        : [mainImg],
      location: `${live.area || "Kukatpally"}, ${live.city || "Hyderabad"}`,
      pincode: live.pincode || "500072",
      description: live.description || live.title,
      category: live.category || "general",
      condition: live.condition || "good",
      sellerId: (live as any).seller?.id || live.sellerId || "u_priya",
      sellerName: (live as any).seller?.name || live.sellerName || "Omeetso Seller",
      seller: (live as any).seller,
      badge: "Verified",
      specs: live.specs || {},
      sold: live.status === "sold",
      unavailable: live.status === "removed" || live.status === "rejected"
    };
  }
  return PRODUCTS.find((p) => p.id === id);
};

export const getSeller = (id: string): Seller => {
  const foundInMock = SELLERS.find((s) => s.id === id);
  if (foundInMock) return foundInMock;

  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("omeetso_user");
      if (stored) {
        const u = JSON.parse(stored);
        if (u && (u.id === id || u._id === id)) {
          return {
            id,
            name: u.profile?.name || u.name || "Omeetso Seller",
            avatar: u.profile?.avatar || u.avatar,
            memberSince: u.createdAt ? new Date(u.createdAt).getFullYear().toString() : "2024",
            rating: 4.8,
            reviews: 12,
            responseTime: "within 15 min",
            responseRate: "98%",
            verified: true,
            type: u.accountType === "business" ? "business" : "individual",
            area: `${u.profile?.area || "Madhapur"}, ${u.profile?.city || "Hyderabad"}`,
            about: u.profile?.bio || "Active seller on Omeetso Marketplace."
          };
        }
      }
    } catch {}
  }

  const liveListing = listListings().find(
    (l) => l.sellerId === id || (l as any).seller?.id === id || (l as any).sellerId?._id === id || (l as any).sellerId === id
  );
  if (liveListing) {
    const liveSeller = (liveListing as any).seller;
    const name = liveSeller?.name || liveListing.sellerName || "Omeetso Seller";
    return {
      id,
      name,
      avatar: liveSeller?.avatar,
      memberSince: liveSeller?.memberSince ? new Date(liveSeller.memberSince).getFullYear().toString() : "2024",
      rating: 4.8,
      reviews: 12,
      responseTime: "within 15 min",
      responseRate: "98%",
      verified: true,
      type: "individual",
      area: liveSeller?.area || `${liveListing.area || "Madhapur"}, ${liveListing.city || "Hyderabad"}`,
      about: `${name} is an active seller on Omeetso Marketplace.`
    };
  }

  return {
    id: id || "u_seller",
    name: "Omeetso Seller",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=80",
    memberSince: "2024",
    rating: 4.8,
    reviews: 12,
    responseTime: "within 15 min",
    responseRate: "98%",
    verified: true,
    type: "individual",
    area: "Madhapur, Hyderabad",
    about: "Verified seller on Omeetso Marketplace."
  };
};
export const getStore = (id: string) => STORES.find((s) => s.id === id);
export const getChat = (id: string) => CHATS.find((c) => c.id === id);
export const getCategory = (id: string) => {
  const norm = (id || "").toLowerCase();
  const staticFound = CATEGORIES.find((c) => c.id.toLowerCase() === norm);
  if (staticFound) return staticFound;

  return {
    id: norm,
    name: id.replace(/[-_]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    icon: "Package",
    count: 0,
    tint: "bg-indigo-100"
  };
};
export const getAd = (placement: Ad["placement"], category?: string) =>
  ADS.find((a) => a.placement === placement && (!category || !a.category || a.category === category));
export const productsByCategory = (id: string) =>
  listListings().filter((p) => p.category === id);
export const productsBySeller = (id: string) =>
  listListings().filter(
    (p) =>
      p.sellerId === id ||
      (p as any).seller?.id === id ||
      (p as any).sellerId?._id === id ||
      (p as any).sellerId?.toString() === id ||
      (p as any).sellerId === id
  );
