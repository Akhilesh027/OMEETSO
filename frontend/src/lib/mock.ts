// Omeetso core types & dynamic data helpers
import { listListings, isListingDeletedLocally, isListingActiveAndPublic } from "./listings";
import { MALE_AVATAR_DATA_URI } from "./avatarSvgs";

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
const MOCK_PRODUCTS_OLD: Product[] = [
  // --- BIKES ---
  {
    id: "BIKE-101",
    title: "Royal Enfield Meteor 350 Supernova Custom",
    price: 185000,
    negotiable: true,
    category: "bikes",
    subcategory: "Cruiser",
    condition: "excellent",
    area: "Bandra West",
    city: "Mumbai",
    pincode: "400050",
    distanceKm: 1.5,
    postedAgo: "3 hours ago",
    image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800",
    images: [
      "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800",
      "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800"
    ],
    verified: true,
    sellerId: "u_sneha",
    sellerName: "Sneha Kulkarni",
    sellerType: "individual",
    description: "Custom blue dual-tone with tripper navigation pod, touring windshield, backrest, alloy wheels with tubeless tires. Recently serviced with new battery.",
    specs: { "Year": "2022", "Kms Driven": "8,200", "Engine": "350cc", "Ownership": "1st Owner" }
  },
  {
    id: "BIKE-102",
    title: "Yamaha YZF R15 V4 Dual ABS Racing Blue",
    price: 145000,
    negotiable: true,
    category: "bikes",
    subcategory: "Sports Bike",
    condition: "like_new",
    area: "Gachibowli",
    city: "Hyderabad",
    pincode: "500032",
    distanceKm: 3.2,
    postedAgo: "6 hours ago",
    image: "https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?w=800",
    images: [
      "https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?w=800",
      "https://images.unsplash.com/photo-1558981420-87aa9dad1c89?w=800"
    ],
    verified: true,
    sellerId: "u_kavita",
    sellerName: "Kavita Reddy",
    sellerType: "individual",
    description: "Track-inspired design with quickshifter, traction control, Bluetooth Y-Connect cluster. Always parked in covered garage, excellent mileage 45 kmpl.",
    specs: { "Year": "2023", "Kms Driven": "6,400", "Engine": "155cc", "Ownership": "1st Owner" }
  },
  {
    id: "BIKE-103",
    title: "Honda Activa 6G Premium Edition",
    price: 68000,
    negotiable: false,
    category: "bikes",
    subcategory: "Scooter",
    condition: "like_new",
    area: "Madhapur",
    city: "Hyderabad",
    pincode: "500081",
    distanceKm: 0.9,
    postedAgo: "Just now",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
    images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"],
    verified: true,
    sellerId: "u_aditya",
    sellerName: "Aditya Varma",
    sellerType: "individual",
    description: "Matte Sangria Red metallic, golden emblem, alloy wheels with front telescopic suspension, single owner, zero insurance claims.",
    specs: { "Year": "2023", "Kms Driven": "4,200", "Engine": "110cc", "Ownership": "1st Owner" }
  },

  // --- MOBILES ---
  {
    id: "MOB-101",
    title: "Apple iPhone 15 Pro Max 256GB Natural Titanium",
    price: 98500,
    negotiable: true,
    category: "mobiles",
    subcategory: "Apple iPhone",
    condition: "like_new",
    area: "Madhapur",
    city: "Hyderabad",
    pincode: "500081",
    distanceKm: 1.1,
    postedAgo: "40 min ago",
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800",
    images: [
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800",
      "https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=800"
    ],
    verified: true,
    sellerId: "u_aditya",
    sellerName: "Aditya Varma",
    sellerType: "individual",
    description: "Indian billing unit with Apple Care+ warranty valid for 8 months. 98% battery health, screen protector applied on day 1. Bill, box & original cable included.",
    specs: { "Brand": "Apple", "Model": "iPhone 15 Pro Max", "Storage": "256GB", "Color": "Natural Titanium", "Warranty": "Active AppleCare" }
  },
  {
    id: "MOB-102",
    title: "Samsung Galaxy S24 Ultra 512GB Titanium Black",
    price: 94000,
    negotiable: true,
    category: "mobiles",
    subcategory: "Samsung",
    condition: "like_new",
    area: "Andheri West",
    city: "Mumbai",
    pincode: "400053",
    distanceKm: 2.8,
    postedAgo: "2 hours ago",
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800",
    images: [
      "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800",
      "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800"
    ],
    verified: true,
    sellerId: "u_vikram",
    sellerName: "Vikram Malhotra",
    sellerType: "individual",
    description: "Flagship Galaxy AI phone with Snapdragon 8 Gen 3, integrated S-Pen, 200MP camera with 100x zoom. No scratches or dents. Original box with 45W charger.",
    specs: { "Brand": "Samsung", "Model": "Galaxy S24 Ultra", "Storage": "512GB", "RAM": "12GB", "Color": "Titanium Black" }
  },
  {
    id: "MOB-103",
    title: "OnePlus 12 5G (16GB RAM, 512GB Storage) Silky Black",
    price: 52000,
    negotiable: true,
    category: "mobiles",
    subcategory: "OnePlus",
    condition: "like_new",
    area: "Koramangala",
    city: "Bangalore",
    pincode: "560034",
    distanceKm: 1.7,
    postedAgo: "4 hours ago",
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800",
    images: ["https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800"],
    verified: true,
    sellerId: "u_rohan",
    sellerName: "Rohan Nambiar",
    sellerType: "business",
    description: "Snapdragon 8 Gen 3 with 4th Gen Hasselblad camera, 5400 mAh battery with 100W SuperVOOC charger in box. Under brand warranty.",
    specs: { "Brand": "OnePlus", "Model": "OnePlus 12", "Storage": "512GB", "RAM": "16GB", "Color": "Silky Black" }
  },

  // --- ELECTRONICS ---
  {
    id: "ELEC-101",
    title: "Sony PlayStation 5 Disc Edition + 2 Controllers",
    price: 39999,
    negotiable: false,
    category: "electronics",
    subcategory: "Gaming Consoles (PS5, Xbox)",
    condition: "excellent",
    area: "Kukatpally",
    city: "Hyderabad",
    pincode: "500072",
    distanceKm: 2.5,
    postedAgo: "1 hour ago",
    image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800",
    images: [
      "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800",
      "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800"
    ],
    verified: true,
    sellerId: "u_rajesh",
    sellerName: "Rajesh Agarwal",
    sellerType: "individual",
    description: "Indian edition PS5 console with 2 DualSense wireless controllers, charging station, and two game discs (Spider-Man 2 and God of War Ragnarok).",
    specs: { "Type": "Disc Edition", "Storage": "825GB SSD", "Controllers": "2 Included", "Condition": "Flawless" }
  },
  {
    id: "ELEC-102",
    title: "Apple MacBook Pro 14 M3 Pro (18GB / 512GB) Space Black",
    price: 148000,
    negotiable: true,
    category: "electronics",
    subcategory: "Laptops & Notebooks",
    condition: "like_new",
    area: "Koramangala",
    city: "Bangalore",
    pincode: "560034",
    distanceKm: 3.1,
    postedAgo: "3 hours ago",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800",
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800",
      "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800"
    ],
    verified: true,
    sellerId: "u_rohan",
    sellerName: "Rohan Nambiar",
    sellerType: "business",
    description: "Space Black M3 Pro with 11-core CPU, 14-core GPU, Liquid Retina XDR display. Battery cycle count only 32. Original MagSafe 3 charger and box.",
    specs: { "Chip": "M3 Pro", "RAM": "18GB Unified", "SSD": "512GB", "Screen": "14.2 inch XDR", "Color": "Space Black" }
  },
  {
    id: "ELEC-103",
    title: "Sony Alpha A7 III Full-Frame Mirrorless Camera + 28-70mm Lens",
    price: 105000,
    negotiable: true,
    category: "electronics",
    subcategory: "Cameras & DSLRs",
    condition: "excellent",
    area: "Andheri West",
    city: "Mumbai",
    pincode: "400053",
    distanceKm: 2.2,
    postedAgo: "5 hours ago",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800",
    images: ["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800"],
    verified: true,
    sellerId: "u_vikram",
    sellerName: "Vikram Malhotra",
    sellerType: "individual",
    description: "24.2MP full-frame sensor, 4K HDR recording, 5-axis in-body image stabilization. Low shutter count of 9,800. Comes with 2 Sony NP-FZ100 batteries.",
    specs: { "Sensor": "24.2MP Full Frame", "Lens": "28-70mm OSS Kit", "Video": "4K 30fps HDR", "Shutter Count": "9,800" }
  },
  {
    id: "ELEC-104",
    title: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
    price: 21500,
    negotiable: false,
    category: "electronics",
    subcategory: "Audio & Headphones",
    condition: "like_new",
    area: "Madhapur",
    city: "Hyderabad",
    pincode: "500081",
    distanceKm: 1.0,
    postedAgo: "Just now",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"],
    verified: true,
    sellerId: "u_aditya",
    sellerName: "Aditya Varma",
    sellerType: "individual",
    description: "Industry-leading noise cancellation with Auto NC Optimizer, 30-hour battery life with quick charging, crystal clear hands-free calling. Hard case included.",
    specs: { "Brand": "Sony", "Battery": "30 Hours", "ANC": "Integrated Processor V1", "Color": "Silver" }
  },

  // --- HOME APPLIANCES ---
  {
    id: "APP-101",
    title: "LG 1.5 Ton 5-Star AI Dual Inverter Split AC",
    price: 29500,
    negotiable: true,
    category: "home-appliances",
    subcategory: "Air Conditioners",
    condition: "like_new",
    area: "Indiranagar",
    city: "Bangalore",
    pincode: "560038",
    distanceKm: 2.8,
    postedAgo: "2 hours ago",
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800",
    images: [
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800",
      "https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=800"
    ],
    verified: true,
    sellerId: "u_ananya",
    sellerName: "Ananya Hegde",
    sellerType: "individual",
    description: "Super efficient 5-star AC with copper condenser, anti-virus filter, WiFi ThinQ smart control. 10-year compressor warranty included.",
    specs: { "Brand": "LG", "Capacity": "1.5 Ton", "Energy Rating": "5 Star", "Condenser": "100% Copper" }
  },
  {
    id: "APP-102",
    title: "Samsung 415L Double Door Convertible Refrigerator",
    price: 27000,
    negotiable: true,
    category: "home-appliances",
    subcategory: "Refrigerators",
    condition: "excellent",
    area: "Andheri West",
    city: "Mumbai",
    pincode: "400053",
    distanceKm: 3.5,
    postedAgo: "4 hours ago",
    image: "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800",
    images: [
      "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800",
      "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800"
    ],
    verified: true,
    sellerId: "u_vikram",
    sellerName: "Vikram Malhotra",
    sellerType: "individual",
    description: "Frost-free double door with 5-in-1 convertible modes, twin cooling plus, digital inverter compressor with stabilizer-free operation.",
    specs: { "Brand": "Samsung", "Capacity": "415 Litres", "Rating": "3 Star Inverter", "Door Style": "Double Door" }
  },

  // --- FURNITURE ---
  {
    id: "FURN-101",
    title: "Solid Sheesham Wood 6-Seater Dining Table Set",
    price: 28500,
    negotiable: true,
    category: "furniture",
    subcategory: "Dining Tables",
    condition: "like_new",
    area: "Powai",
    city: "Mumbai",
    pincode: "400076",
    distanceKm: 2.4,
    postedAgo: "3 hours ago",
    image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800",
    images: [
      "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800",
      "https://images.unsplash.com/photo-1577140917170-285929fb55b7?w=800"
    ],
    verified: true,
    sellerId: "u_pooja",
    sellerName: "Pooja Deshmukh",
    sellerType: "business",
    description: "Handcrafted pure rosewood dining table with 6 cushioned ergonomic high-back chairs. Warm honey finish with anti-termite treatment.",
    specs: { "Material": "Sheesham Wood", "Seating": "6 Seater", "Finish": "Honey Oak", "Dimensions": "6ft x 3ft" }
  },
  {
    id: "FURN-102",
    title: "L-Shape 6-Seater Modern Fabric Sectional Sofa Grey",
    price: 32000,
    negotiable: true,
    category: "furniture",
    subcategory: "Sofas",
    condition: "excellent",
    area: "Koramangala",
    city: "Bangalore",
    pincode: "560034",
    distanceKm: 1.9,
    postedAgo: "5 hours ago",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800",
    images: [
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800",
      "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800"
    ],
    verified: true,
    sellerId: "u_rohan",
    sellerName: "Rohan Nambiar",
    sellerType: "business",
    description: "Premium velvet fabric sectional sofa with adjustable headrests, solid wood internal frame, and pocket spring high-density foam cushions.",
    specs: { "Configuration": "L-Shape Right Hand", "Seating": "6 Persons", "Fabric": "Stain Resistant Velvet", "Color": "Slate Grey" }
  },

  // --- PROPERTIES ---
  {
    id: "PROP-101",
    title: "Luxury 3BHK Gated Community Apartment (2150 Sq.Ft)",
    price: 14500000,
    negotiable: true,
    category: "properties",
    subcategory: "Apartments",
    condition: "new",
    area: "Gachibowli",
    city: "Hyderabad",
    pincode: "500032",
    distanceKm: 3.6,
    postedAgo: "1 day ago",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800",
    images: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"
    ],
    verified: true,
    sellerId: "u_kavita",
    sellerName: "Kavita Reddy",
    sellerType: "business",
    description: "East facing 3BHK in high-rise tower at Gachibowli Financial District. 100% Vastu compliant with 2 covered car parkings, clubhouse, pool and gym.",
    specs: { "Bedrooms": "3 BHK", "Super Area": "2150 Sq.Ft", "Facing": "East", "Furnishing": "Semi-Furnished", "Floor": "14th of 28" }
  },

  // --- COMMERCIAL VEHICLES ---
  {
    id: "COMM-101",
    title: "Tata Ace Gold Petrol Mini Truck (Chhota Hathi)",
    price: 345000,
    negotiable: true,
    category: "commercial-vehicles",
    subcategory: "Mini Trucks",
    condition: "like_new",
    area: "Kukatpally",
    city: "Hyderabad",
    pincode: "500072",
    distanceKm: 2.7,
    postedAgo: "1 day ago",
    image: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800",
    images: ["https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800"],
    verified: true,
    sellerId: "u_rajesh",
    sellerName: "Rajesh Agarwal",
    sellerType: "business",
    description: "2022 Tata Ace Gold BS6 Petrol with reinforced cargo bed, single owner, zero breakdown record. Commercial fitness certificate valid till 2026.",
    specs: { "Year": "2022", "Fuel": "Petrol", "Payload": "750 kg", "Kms Driven": "28,000" }
  },

  // --- FASHION ---
  {
    id: "FASH-101",
    title: "Designer Bridal Heavy Embroidered Silk Lehenga",
    price: 35000,
    negotiable: true,
    category: "fashion",
    subcategory: "Ethnic Wear",
    condition: "like_new",
    area: "Madhapur",
    city: "Hyderabad",
    pincode: "500081",
    distanceKm: 1.2,
    postedAgo: "6 hours ago",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800",
    images: [
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800",
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800"
    ],
    verified: true,
    sellerId: "u_aditya",
    sellerName: "Aditya Varma",
    sellerType: "individual",
    description: "Custom royal crimson bridal lehenga set crafted with zardozi, sequins, and pearl hand embroidery. Worn once for 3 hours, dry cleaned and preserved.",
    specs: { "Fabric": "Raw Silk", "Work": "Zardozi & Pearl", "Size": "Adjustable (M/L)", "Color": "Royal Crimson Red" }
  },

  // --- BOOKS & SPORTS ---
  {
    id: "BOOK-101",
    title: "Complete JEE Advanced Physics, Chemistry & Maths Set",
    price: 4500,
    negotiable: false,
    category: "books-sports",
    subcategory: "Competitive Exam Books (JEE, NEET, UPSC)",
    condition: "excellent",
    area: "Ameerpet",
    city: "Hyderabad",
    pincode: "500016",
    distanceKm: 3.8,
    postedAgo: "8 hours ago",
    image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800",
    images: ["https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800"],
    verified: true,
    sellerId: "u_kavita",
    sellerName: "Kavita Reddy",
    sellerType: "individual",
    description: "Latest Cengage complete set (15 books) with H.C. Verma Vol 1 & 2 and previous 43 years chapterwise solved papers. No markings, clean pages.",
    specs: { "Books Count": "17 Volumes", "Publisher": "Cengage & Bharati Bhawan", "Edition": "2024" }
  },

  // --- AGRICULTURE ---
  {
    id: "AGRI-101",
    title: "Mahindra 575 DI 45HP Tractor with Rotary Tiller",
    price: 485000,
    negotiable: true,
    category: "agriculture",
    subcategory: "Tractors",
    condition: "excellent",
    area: "Medchal",
    city: "Hyderabad",
    pincode: "501401",
    distanceKm: 8.5,
    postedAgo: "1 day ago",
    image: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800",
    images: ["https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800"],
    verified: true,
    sellerId: "u_rajesh",
    sellerName: "Rajesh Agarwal",
    sellerType: "business",
    description: "45 HP 4-cylinder high torque engine, power steering, oil immersed brakes, dual clutch with heavy duty 6-foot rotavator attachment. All papers clear.",
    specs: { "HP": "45 HP", "Cylinders": "4", "Hours Run": "1,450 hrs", "Attachments": "6ft Rotavator" }
  }
];

export const SELLERS: Seller[] = [
  {
    id: "u_aditya",
    name: "Aditya Varma",
    avatar: MALE_AVATAR_DATA_URI,
    memberSince: "2023",
    rating: 4.9,
    reviews: 28,
    responseTime: "Within 10 min",
    responseRate: "99%",
    verified: true,
    type: "individual",
    area: "Madhapur, Hyderabad",
    about: "Top-rated local gadget, car and lifestyle enthusiast in Cyberabad. Fast delivery & instant response."
  },
  {
    id: "u_sneha",
    name: "Sneha Kulkarni",
    avatar: MALE_AVATAR_DATA_URI,
    memberSince: "2023",
    rating: 4.8,
    reviews: 19,
    responseTime: "Within 15 min",
    responseRate: "97%",
    verified: true,
    type: "individual",
    area: "Bandra West, Mumbai",
    about: "Fashion stylist & interior curator. Selling verified authentic luxury items."
  },
  {
    id: "u_rohan",
    name: "Rohan Nambiar",
    avatar: MALE_AVATAR_DATA_URI,
    memberSince: "2022",
    rating: 4.9,
    reviews: 42,
    responseTime: "Within 5 min",
    responseRate: "100%",
    verified: true,
    type: "business",
    area: "Koramangala, Bangalore",
    about: "Certified electronics dealer & tech entrepreneur. Warranty on all tested products."
  },
  {
    id: "u_kavita",
    name: "Kavita Reddy",
    avatar: MALE_AVATAR_DATA_URI,
    memberSince: "2023",
    rating: 4.9,
    reviews: 31,
    responseTime: "Within 15 min",
    responseRate: "98%",
    verified: true,
    type: "business",
    area: "Gachibowli, Hyderabad",
    about: "Authorized property & vehicle manager in Financial District."
  },
  {
    id: "u_rajesh",
    name: "Rajesh Agarwal",
    avatar: MALE_AVATAR_DATA_URI,
    memberSince: "2023",
    rating: 4.8,
    reviews: 24,
    responseTime: "Within 20 min",
    responseRate: "96%",
    verified: true,
    type: "individual",
    area: "Kukatpally, Hyderabad",
    about: "Heavy machinery, gaming equipment and electronics supplier."
  },
  {
    id: "u_vikram",
    name: "Vikram Malhotra",
    avatar: MALE_AVATAR_DATA_URI,
    memberSince: "2023",
    rating: 4.9,
    reviews: 16,
    responseTime: "Within 10 min",
    responseRate: "98%",
    verified: true,
    type: "individual",
    area: "Andheri West, Mumbai",
    about: "Audiophile, photographer & flagship smartphone collector."
  },
  {
    id: "u_ananya",
    name: "Ananya Hegde",
    avatar: MALE_AVATAR_DATA_URI,
    memberSince: "2024",
    rating: 4.7,
    reviews: 12,
    responseTime: "Within 15 min",
    responseRate: "95%",
    verified: true,
    type: "individual",
    area: "Indiranagar, Bangalore",
    about: "Home appliance and designer decor curator."
  },
  {
    id: "u_pooja",
    name: "Pooja Deshmukh",
    avatar: MALE_AVATAR_DATA_URI,
    memberSince: "2023",
    rating: 4.8,
    reviews: 35,
    responseTime: "Within 15 min",
    responseRate: "97%",
    verified: true,
    type: "business",
    area: "Powai, Mumbai",
    about: "Solid wood furniture & interior decor supplier."
  }
];

export const STORES: Store[] = [
  {
    id: "store_1",
    name: "Apex Electronics & Gadgets Hub",
    category: "Electronics & Mobiles",
    area: "Madhapur, Hyderabad",
    distanceKm: 1.2,
    rating: 4.9,
    reviews: 142,
    products: 48,
    yearsInBusiness: "4 Years",
    responseRate: "99%",
    verified: true,
    logo: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=200",
    cover: "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800",
    open: true,
    sponsored: true
  },
  {
    id: "store_2",
    name: "Heritage Teak & Solid Furniture",
    category: "Home & Furniture",
    area: "Koramangala, Bangalore",
    distanceKm: 2.4,
    rating: 4.8,
    reviews: 98,
    products: 34,
    yearsInBusiness: "6 Years",
    responseRate: "96%",
    verified: true,
    logo: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200",
    cover: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800",
    open: true,
    sponsored: false
  }
];
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
  "iPhone 15",
  "Used Cars",
  "Bikes",
  "MacBook Pro",
  "Sofa Set",
  "RE Bullet 350",
  "Gaming PC",
  "2 BHK Flat",
  "Air Conditioner",
  "Jobs near me",
];

export const DEFAULT_RECENT_SEARCHES: string[] = [];

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
  if (!id) return undefined;
  const cleanId = id.trim();
  const allListings = listListings();
  const live = allListings.find((l) => l.id === cleanId || (l as any)._id === cleanId || l.id === id);
  if (live) {
    if (live.status === "deleted" || live.status === "removed" || (live as any).isDeleted || live.unavailable) {
      return undefined;
    }
    const mainImg = Array.isArray(live.images) && live.images.length > 0 && !live.images[0].startsWith("blob:")
      ? live.images[0]
      : "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400";

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
      sellerName: (live as any).seller?.name || live.sellerName || "omeetso Seller",
      seller: (live as any).seller,
      badge: "Verified",
      specs: live.specs || {},
      sold: live.status === "sold",
      unavailable: live.status === "removed" || live.status === "rejected" || live.status === "deleted" || Boolean((live as any).isDeleted),
      status: live.status,
      isDeleted: live.status === "deleted" || Boolean((live as any).isDeleted),
      negotiable: live.negotiable,
      verified: true,
      video: live.video,
      videoUrl: live.videoUrl,
      whatsappPhone: live.whatsappPhone,
      enableWhatsapp: live.enableWhatsapp,
      sellerPhone: live.sellerPhone,
      method: live.method,
      contactPref: live.contactPref || "call_and_chat",
      bestContactTime: live.bestContactTime || "anytime",
    };
  }
  if (isListingDeletedLocally(cleanId) || isListingDeletedLocally(id)) {
    return undefined;
  }
  return PRODUCTS.find((p) => p.id === cleanId || p.id === id);
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
          const areaDisplay = u.profile?.area && u.profile.area !== "Madhapur"
            ? `${u.profile.area}, ${u.profile.city || "Hyderabad"}`
            : (u.profile?.city || "Hyderabad");
          return {
            id,
            name: u.profile?.name || u.name || "omeetso Seller",
            createdAt: u.createdAt,
            memberSince: u.createdAt || "2024",
            rating: 0,
            reviews: 0,
            responseTime: "Within 15 min",
            responseRate: "98%",
            verified: true,
            type: u.accountType === "business" ? "business" : "individual",
            area: areaDisplay,
            about: u.profile?.bio || "Active seller on omeetso Marketplace."
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
    const name = liveSeller?.name || liveListing.sellerName || "omeetso Seller";
    const locArea = liveListing.area || (liveSeller?.area && liveSeller.area !== "Madhapur" ? liveSeller.area : null);
    const locCity = liveListing.city || liveSeller?.city || "Hyderabad";
    const areaDisplay = locArea ? `${locArea}, ${locCity}` : locCity;
    return {
      id,
      name,
      avatar: liveSeller?.avatar,
      createdAt: liveSeller?.createdAt || liveSeller?.memberSince,
      memberSince: liveSeller?.createdAt || liveSeller?.memberSince || "2024",
      rating: 0,
      reviews: 0,
      responseTime: "Within 15 min",
      responseRate: "98%",
      verified: true,
      type: "individual",
      area: areaDisplay,
      about: `${name} is an active seller on omeetso Marketplace.`
    };
  }

  return {
    id: id || "u_seller",
    name: "omeetso Seller",
    avatar: MALE_AVATAR_DATA_URI,
    memberSince: "2024",
    rating: 0,
    reviews: 0,
    responseTime: "Within 15 min",
    responseRate: "98%",
    verified: false,
    type: "individual",
    area: "Hyderabad",
    about: "Verified seller on omeetso Marketplace."
  };
};
export const getStore = (id: string) => STORES.find((s) => s.id === id);
export const getChat = (id: string) => CHATS.find((c) => c.id === id);
export const getCategory = (id: string) => {
  const norm = (id || "").toLowerCase();
  const staticFound = CATEGORIES.find((c) => c.id.toLowerCase() === norm);
  if (staticFound) return staticFound;

  if (norm === "appliances" || norm === "home_appliances") {
    const applianceFound = CATEGORIES.find((c) => c.id === "home-appliances");
    if (applianceFound) return applianceFound;
  }

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
  listListings().filter((p) => p.category === id && isListingActiveAndPublic(p));
export const productsBySeller = (id: string) =>
  listListings().filter(
    (p) =>
      isListingActiveAndPublic(p) &&
      (p.sellerId === id ||
      (p as any).seller?.id === id ||
      (p as any).sellerId?._id === id ||
      (p as any).sellerId?.toString() === id ||
      (p as any).sellerId === id)
  );
