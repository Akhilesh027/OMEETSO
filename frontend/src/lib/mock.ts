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
  city?: string;
  pincode?: string;
  distanceKm: number;
  postedAgo: string;
  image: string;
  images?: string[];
  verified?: boolean;
  sponsored?: boolean;
  sellerId: ID;
  sellerName?: string;
  sellerOwnerName?: string;
  businessName?: string;
  storeName?: string;
  sellerType?: "individual" | "business";
  storeId?: ID;
  description: string;
  specs?: Record<string, string>;
  sold?: boolean;
  unavailable?: boolean;
};

export type Seller = {
  id: ID;
  name: string;
  businessName?: string;
  ownerName?: string;
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
  { id: "commercial-vehicles", name: "Commercial Vehicles", icon: "Truck", count: 0, tint: "bg-cyan-100" },
  { id: "mobiles", name: "Mobiles", icon: "Smartphone", count: 0, tint: "bg-indigo-100" },
  { id: "electronics", name: "Electronics", icon: "Laptop", count: 0, tint: "bg-sky-100" },
  { id: "home-appliances", name: "Home Appliances", icon: "Tv", count: 0, tint: "bg-teal-100" },
  { id: "furniture", name: "Furniture", icon: "Sofa", count: 0, tint: "bg-amber-100" },
  { id: "properties", name: "Properties", icon: "Building2", count: 0, tint: "bg-emerald-100" },
  { id: "jobs", name: "Jobs", icon: "Briefcase", count: 0, tint: "bg-violet-100" },
  { id: "services", name: "Services", icon: "Wrench", count: 0, tint: "bg-rose-100" },
  { id: "fashion", name: "Fashion", icon: "Shirt", count: 0, tint: "bg-pink-100" },
  { id: "books-sports", name: "Books & Sports", icon: "BookOpen", count: 0, tint: "bg-lime-100" },
  { id: "agriculture", name: "Agriculture", icon: "Sprout", count: 0, tint: "bg-green-100" }
];

export const SUBCATEGORIES: Record<string, string[]> = {
  cars: ["Sedan", "SUV", "Hatchback", "Luxury", "MUV", "Coupe", "Convertible"],
  bikes: [
    "Commuter",
    "Sports Bike",
    "Cruiser",
    "Scooter",
    "Electric Bike",
    "Adventure Bike",
    "Off-Road Bike",
    "Superbike",
    "Touring Bike",
    "Cafe Racer",
    "Naked Street Bike"
  ],
  "commercial-vehicles": [
    "Mini Trucks",
    "Pickup Trucks",
    "Heavy Trucks",
    "Tippers",
    "Trailers",
    "Buses",
    "School Buses",
    "Vans",
    "Auto Rickshaws",
    "Taxi Vehicles",
    "Tractors",
    "Construction Vehicles",
    "Refrigerated Vehicles",
    "Other Commercial Vehicles"
  ],
  commercial: [
    "Mini Trucks",
    "Pickup Trucks",
    "Heavy Trucks",
    "Tippers",
    "Trailers",
    "Buses",
    "Auto Rickshaws",
    "Tractors",
    "Other Commercial Vehicles"
  ],
  mobiles: [
    "Apple iPhone",
    "Samsung",
    "OnePlus",
    "Xiaomi / Redmi",
    "Realme",
    "Vivo",
    "Oppo",
    "Google Pixel",
    "Motorola",
    "Nothing",
    "Poco",
    "Other Brands"
  ],
  electronics: [
    "Laptops & Notebooks",
    "Desktop Computers",
    "Gaming Consoles (PS5, Xbox)",
    "Cameras & DSLRs",
    "Audio & Headphones",
    "Smartwatches & Wearables",
    "Computer Accessories & Monitors"
  ],
  "home-appliances": [
    "Refrigerators",
    "Washing Machines",
    "Air Conditioners",
    "Televisions",
    "Water Purifiers",
    "Microwave Ovens",
    "Induction Stoves",
    "Gas Stoves",
    "Mixers and Grinders",
    "Vacuum Cleaners",
    "Geysers",
    "Fans and Air Coolers",
    "Dishwashers",
    "Small Kitchen Appliances",
    "Other Home Appliances"
  ],
  appliances: [
    "Refrigerators",
    "Washing Machines",
    "Air Conditioners",
    "Televisions",
    "Water Purifiers",
    "Microwave Ovens",
    "Geysers",
    "Other Home Appliances"
  ],
  furniture: [
    "Sofas",
    "Beds",
    "Dining Tables",
    "Wardrobes",
    "Office Furniture",
    "Chairs",
    "Tables",
    "TV Units",
    "Shoe Racks",
    "Mattresses",
    "Outdoor Furniture",
    "Home Décor",
    "Other Furniture"
  ],
  properties: [
    "Apartments",
    "Villas",
    "Independent Houses",
    "Open Plots",
    "Agricultural Land",
    "Commercial Spaces",
    "Offices",
    "Shops",
    "Warehouses",
    "Rentals",
    "PG and Hostels"
  ],
  jobs: [
    "IT & Software Development",
    "Sales & Marketing",
    "Customer Support & BPO",
    "Accounting & Finance",
    "Data Entry & Back Office",
    "Delivery & Logistics",
    "Teaching & Education",
    "Healthcare & Nursing",
    "Hotel & Restaurant",
    "Retail & Store Staff"
  ],
  services: [
    "Home Cleaning",
    "Electricians",
    "Plumbers",
    "Carpenters",
    "AC and Appliance Repair",
    "Mobile and Laptop Repair",
    "Tutors & Classes",
    "Beauty and Salon",
    "Photography and Videography",
    "Event Services",
    "Catering",
    "Packers and Movers",
    "Vehicle Repair",
    "Legal Services",
    "Digital and IT Services",
    "Other Services"
  ],
  fashion: [
    "Men’s Clothing",
    "Women’s Clothing",
    "Kids’ Clothing",
    "Footwear",
    "Watches",
    "Bags & Backpacks",
    "Jewellery & Accessories",
    "Ethnic Wear",
    "Western Wear",
    "Sportswear",
    "Bridal Wear"
  ],
  "books-sports": [
    "School Books",
    "College Books",
    "Competitive Exam Books (JEE, NEET, UPSC)",
    "Novels & Fiction",
    "Children’s Books",
    "Religious & Spiritual Books",
    "Comics & Graphic Novels",
    "Cricket Equipment",
    "Football Equipment",
    "Badminton Rackets",
    "Fitness & Gym Equipment",
    "Cycling & Bicycles",
    "Indoor & Outdoor Games",
    "Sportswear & Shoes"
  ],
  books: [
    "School Books",
    "College Books",
    "Competitive Exam Books",
    "Novels & Fiction",
    "Fitness & Gym Equipment",
    "Cricket & Sports Equipment",
    "Cycling & Bicycles"
  ],
  agriculture: [
    "Seeds",
    "Fertilizers",
    "Pesticides",
    "Farm Equipment",
    "Tractors",
    "Irrigation Equipment",
    "Dairy Equipment",
    "Animal Feed",
    "Fresh Produce",
    "Grains and Pulses",
    "Fruits and Vegetables",
    "Plants and Saplings",
    "Livestock",
    "Poultry",
    "Agricultural Land",
    "Other Farm Supplies"
  ],
  agri: [
    "Seeds",
    "Fertilizers",
    "Farm Equipment",
    "Tractors",
    "Irrigation Equipment",
    "Fresh Produce",
    "Plants and Saplings",
    "Livestock",
    "Agricultural Land"
  ]
};

export function getSubcategoriesForCategory(catId: string): { id: string; name: string }[] {
  const key = (catId || "mobiles").toLowerCase();
  const raw = SUBCATEGORIES[key] || SUBCATEGORIES[key.replace(/-/g, "")] || ["General"];
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
      area: live.area || "Nearby",
      city: live.city || "",
      location: `${live.area || "Nearby"}${live.city ? `, ${live.city}` : ""}`,
      pincode: live.pincode || "",
      description: live.description || live.title,
      category: live.category || "general",
      condition: live.condition || "good",
      sellerId: (live as any).seller?.id || live.sellerId || "u_priya",
      sellerName: (live as any).seller?.name || live.sellerName || "Omeetso Seller",
      seller: (live as any).seller,
      badge: "Verified",
      specs: live.specs || {},
      sold: live.status === "sold",
      unavailable: live.status === "removed" || live.status === "rejected",
      negotiable: live.negotiable,
      verified: true,
      video: live.video,
      videoUrl: live.videoUrl,
      whatsappPhone: live.whatsappPhone,
      enableWhatsapp: live.enableWhatsapp,
      sellerPhone: live.sellerPhone,
      method: live.method,
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
