import React, { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import * as Lucide from "lucide-react";
import {
  X, Sparkles, ChevronRight, ChevronLeft, ChevronDown, ArrowDown, Search, Tag, Layers, Flame, ShieldCheck,
  ArrowRight, CheckCircle2, Car, Bike, Smartphone, Tv, Sofa, Building2,
  Shirt, Refrigerator, Briefcase, Wrench, PawPrint, Truck, BookOpen, Sprout, Package,
  Laptop, Camera, Headphones, Gamepad2, Bed, Utensils, KeyRound, Home, Map,
  Tablet, Watch, Wind, Clock, GraduationCap, Compass, Zap, Gauge, Droplets,
  Snowflake, Dumbbell, Music, Trophy, Baby, ShoppingBag, Palette, Eye
} from "lucide-react";
import { BRANDS_BY_CATEGORY, MODELS_BY_BRAND, getModelsForBrand } from "@/lib/aiAssistance";
import { CATEGORIES, SUBCATEGORIES } from "@/lib/mock";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS_MAP: Record<string, Lucide.LucideIcon> = {
  cars: Car,
  bikes: Bike,
  mobiles: Smartphone,
  electronics: Tv,
  furniture: Sofa,
  properties: Building2,
  fashion: Shirt,
  appliances: Refrigerator,
  jobs: Briefcase,
  services: Wrench,
  commercial: Truck,
  books: BookOpen,
  agri: Sprout,
  other: Package,
};

const CATEGORY_TINTS_MAP: Record<string, { bg: string; text: string; gradient: string; accent: string }> = {
  cars: { bg: "bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400", text: "text-blue-600", gradient: "from-blue-700 via-indigo-700 to-sky-700", accent: "text-blue-500" },
  bikes: { bg: "bg-orange-100 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400", text: "text-orange-600", gradient: "from-amber-600 via-orange-600 to-red-600", accent: "text-orange-500" },
  mobiles: { bg: "bg-indigo-100 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400", text: "text-indigo-600", gradient: "from-violet-700 via-purple-700 to-indigo-700", accent: "text-indigo-500" },
  electronics: { bg: "bg-sky-100 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400", text: "text-sky-600", gradient: "from-cyan-700 via-teal-700 to-blue-700", accent: "text-sky-500" },
  furniture: { bg: "bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400", text: "text-amber-600", gradient: "from-amber-800 via-orange-800 to-yellow-700", accent: "text-amber-500" },
  properties: { bg: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400", text: "text-emerald-600", gradient: "from-emerald-700 via-teal-700 to-cyan-700", accent: "text-emerald-500" },
  fashion: { bg: "bg-pink-100 text-pink-600 dark:bg-pink-950/50 dark:text-pink-400", text: "text-pink-600", gradient: "from-pink-700 via-rose-700 to-purple-700", accent: "text-pink-500" },
  appliances: { bg: "bg-teal-100 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400", text: "text-teal-600", gradient: "from-sky-700 via-blue-700 to-indigo-700", accent: "text-teal-500" },
  jobs: { bg: "bg-violet-100 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400", text: "text-violet-600", gradient: "from-indigo-700 via-purple-700 to-violet-700", accent: "text-violet-500" },
  services: { bg: "bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400", text: "text-rose-600", gradient: "from-rose-700 via-pink-700 to-orange-700", accent: "text-rose-500" },
  commercial: { bg: "bg-cyan-100 text-cyan-600 dark:bg-cyan-950/50 dark:text-cyan-400", text: "text-cyan-600", gradient: "from-slate-800 via-slate-900 to-zinc-900", accent: "text-cyan-500" },
  books: { bg: "bg-lime-100 text-lime-600 dark:bg-lime-950/50 dark:text-lime-400", text: "text-lime-600", gradient: "from-lime-700 via-emerald-700 to-teal-700", accent: "text-lime-500" },
  agri: { bg: "bg-green-100 text-green-600 dark:bg-green-950/50 dark:text-green-400", text: "text-green-600", gradient: "from-green-700 via-emerald-700 to-lime-700", accent: "text-green-500" },
  other: { bg: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300", text: "text-slate-600", gradient: "from-purple-700 via-pink-700 to-rose-700", accent: "text-purple-500" },
};

// Curated high-res imagery for all subcategories
const SUBCATEGORY_IMAGES: Record<string, string> = {
  // Cars
  "Used Cars": "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&auto=format&fit=crop&q=80",
  "New Cars": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop&q=80",
  "Car Accessories": "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&auto=format&fit=crop&q=80",
  "Spare Parts": "https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600&auto=format&fit=crop&q=80",
  "Car Services": "https://images.unsplash.com/photo-1613214149922-f1809c99b414?w=600&auto=format&fit=crop&q=80",

  // Bikes
  "Motorcycles": "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&auto=format&fit=crop&q=80",
  "Scooters": "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&auto=format&fit=crop&q=80",
  "Bicycles": "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&auto=format&fit=crop&q=80",
  "Bike Services": "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=600&auto=format&fit=crop&q=80",

  // Mobiles
  "Smartphones": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80",
  "Tablets": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80",
  "Accessories": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
  "Smart Watches": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
  "Repair": "https://images.unsplash.com/photo-1588508065123-287b28e013da?w=600&auto=format&fit=crop&q=80",

  // Electronics
  "TVs": "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&auto=format&fit=crop&q=80",
  "Laptops": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=80",
  "Cameras": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80",
  "Audio": "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=80",
  "Gaming": "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=600&auto=format&fit=crop&q=80",

  // Furniture
  "Sofas": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop&q=80",
  "Beds": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&auto=format&fit=crop&q=80",
  "Dining Tables": "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600&auto=format&fit=crop&q=80",
  "Wardrobes": "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=600&auto=format&fit=crop&q=80",
  "Chairs": "https://images.unsplash.com/photo-1580481077197-268673752e5a?w=600&auto=format&fit=crop&q=80",
  "Office Furniture": "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&auto=format&fit=crop&q=80",
  "Other Furniture": "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=600&auto=format&fit=crop&q=80",

  // Properties
  "For Rent": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&auto=format&fit=crop&q=80",
  "For Sale": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80",
  "PG & Hostels": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&auto=format&fit=crop&q=80",
  "Land & Plots": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&auto=format&fit=crop&q=80",
  "Commercial": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80",

  // Fashion
  "Men": "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=600&auto=format&fit=crop&q=80",
  "Women": "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&auto=format&fit=crop&q=80",
  "Kids": "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&auto=format&fit=crop&q=80",
  "Watches": "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&auto=format&fit=crop&q=80",
  "Bags & Luggage": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80",

  // Appliances
  "Refrigerators": "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=600&auto=format&fit=crop&q=80",
  "Washing Machines": "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600&auto=format&fit=crop&q=80",
  "ACs": "https://images.unsplash.com/photo-1614633837786-e91026027a0f?w=600&auto=format&fit=crop&q=80",
  "Kitchen Appliances": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80",
  "Water Purifiers": "https://images.unsplash.com/photo-1585909692484-95493019808a?w=600&auto=format&fit=crop&q=80",

  // Jobs
  "Full time": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80",
  "Part time": "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=600&auto=format&fit=crop&q=80",
  "Work from home": "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop&q=80",
  "Internships": "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80",
  "Freshers": "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&auto=format&fit=crop&q=80",

  // Services
  "Home Repair": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop&q=80",
  "Cleaning": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop&q=80",
  "Tutors": "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80",
  "Movers": "https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=600&auto=format&fit=crop&q=80",
  "Photography": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80",

  // Commercial
  "Auto Rickshaws": "https://images.unsplash.com/photo-1596707323863-7185bb8b6f3c?w=600&auto=format&fit=crop&q=80",
  "Trucks": "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&auto=format&fit=crop&q=80",
  "Tractors": "https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?w=600&auto=format&fit=crop&q=80",
  "Buses": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80",

  // Books
  "Books": "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80",
  "Gym & Fitness": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80",
  "Musical Instruments": "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&auto=format&fit=crop&q=80",
  "Sports Equipment": "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&auto=format&fit=crop&q=80",
  "Games & Toys": "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600&auto=format&fit=crop&q=80",

  // Agri
  "Farm Equipment": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&auto=format&fit=crop&q=80",
  "Seeds & Plants": "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=600&auto=format&fit=crop&q=80",
  "Livestock": "https://images.unsplash.com/photo-1527153857715-3908f2ae5e81?w=600&auto=format&fit=crop&q=80",
  "Land": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&auto=format&fit=crop&q=80",

  // Other
  "Collectibles": "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80",
  "Art": "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80",
  "Household Items": "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&auto=format&fit=crop&q=80",
  "Miscellaneous": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
};

const SUBCATEGORY_ICONS_MAP: Record<string, Lucide.LucideIcon> = {
  // Mobiles & Brands
  "Apple iPhone": Smartphone,
  "Samsung": Smartphone,
  "OnePlus": Smartphone,
  "Xiaomi / Redmi": Smartphone,
  "Realme": Smartphone,
  "Vivo": Smartphone,
  "Oppo": Smartphone,
  "Google Pixel": Smartphone,
  "Motorola": Smartphone,
  "Nothing": Smartphone,
  "Poco": Smartphone,
  "Other Brands": Package,
  "Smartphones": Smartphone,
  "Tablets": Tablet,
  "Accessories": Headphones,
  "Smart Watches": Watch,
  "Repair": Wrench,

  // Cars
  "Used Cars": Car,
  "New Cars": Sparkles,
  "Sedan": Car,
  "SUV": Car,
  "Hatchback": Car,
  "Luxury": Sparkles,
  "MUV": Car,
  "Coupe": Car,
  "Convertible": Car,
  "Car Accessories": ShieldCheck,
  "Spare Parts": Wrench,
  "Car Services": Gauge,

  // Bikes
  "Commuter": Bike,
  "Sports Bike": Zap,
  "Cruiser": Bike,
  "Scooter": Zap,
  "Electric Bike": Zap,
  "Adventure Bike": Compass,
  "Off-Road Bike": Bike,
  "Superbike": Zap,
  "Touring Bike": Compass,
  "Cafe Racer": Bike,
  "Naked Street Bike": Bike,
  "Motorcycles": Bike,
  "Scooters": Zap,
  "Bicycles": Compass,
  "Bike Services": Gauge,

  // Electronics
  "Laptops & Notebooks": Laptop,
  "Desktop Computers": Tv,
  "Gaming Consoles (PS5, Xbox)": Gamepad2,
  "Cameras & DSLRs": Camera,
  "Audio & Headphones": Headphones,
  "Smartwatches & Wearables": Watch,
  "Computer Accessories & Monitors": Tv,
  "TVs": Tv,
  "Laptops": Laptop,
  "Cameras": Camera,
  "Audio": Headphones,
  "Gaming": Gamepad2,

  // Furniture
  "Sofas": Sofa,
  "Beds": Bed,
  "Dining Tables": Utensils,
  "Wardrobes": Layers,
  "Office Furniture": Briefcase,
  "Chairs": Sofa,
  "Tables": Utensils,
  "TV Units": Tv,
  "Shoe Racks": Layers,
  "Mattresses": Bed,
  "Outdoor Furniture": Home,
  "Home Décor": Sparkles,
  "Other Furniture": Home,

  // Properties
  "Apartments": Building2,
  "Villas": Home,
  "Independent Houses": Home,
  "Open Plots": Map,
  "Agricultural Land": Sprout,
  "Commercial Spaces": Building2,
  "Offices": Briefcase,
  "Shops": ShoppingBag,
  "Warehouses": Truck,
  "Rentals": KeyRound,
  "PG and Hostels": Home,
  "For Rent": KeyRound,
  "For Sale": Building2,
  "PG & Hostels": Home,
  "Land & Plots": Map,
  "Commercial": Building2,

  // Home Appliances
  "Refrigerators": Refrigerator,
  "Washing Machines": Wind,
  "Air Conditioners": Snowflake,
  "Televisions": Tv,
  "Water Purifiers": Droplets,
  "Microwave Ovens": Utensils,
  "Induction Stoves": Zap,
  "Gas Stoves": Flame,
  "Mixers and Grinders": Utensils,
  "Vacuum Cleaners": Wind,
  "Geysers": Droplets,
  "Fans and Air Coolers": Wind,
  "Dishwashers": Droplets,
  "Small Kitchen Appliances": Utensils,
  "Other Home Appliances": Tv,

  // Jobs
  "IT & Software Development": Laptop,
  "Sales & Marketing": Trophy,
  "Customer Support & BPO": Headphones,
  "Accounting & Finance": Gauge,
  "Data Entry & Back Office": Layers,
  "Delivery & Logistics": Truck,
  "Teaching & Education": GraduationCap,
  "Healthcare & Nursing": ShieldCheck,
  "Hotel & Restaurant": Utensils,
  "Retail & Store Staff": ShoppingBag,
  "Full time": Briefcase,
  "Part time": Clock,
  "Work from home": Laptop,
  "Internships": GraduationCap,
  "Freshers": CheckCircle2,

  // Services
  "Home Cleaning": Sparkles,
  "Electricians": Zap,
  "Plumbers": Droplets,
  "Carpenters": Wrench,
  "AC and Appliance Repair": Snowflake,
  "Mobile and Laptop Repair": Smartphone,
  "Tutors & Classes": GraduationCap,
  "Beauty and Salon": Sparkles,
  "Photography and Videography": Camera,
  "Event Services": Music,
  "Catering": Utensils,
  "Packers and Movers": Truck,
  "Vehicle Repair": Wrench,
  "Legal Services": ShieldCheck,
  "Digital and IT Services": Laptop,
  "Home Repair": Wrench,
  "Cleaning": Sparkles,
  "Tutors": BookOpen,
  "Movers": Truck,
  "Photography": Camera,

  // Commercial Vehicles
  "Mini Trucks": Truck,
  "Pickup Trucks": Truck,
  "Heavy Trucks": Truck,
  "Tippers": Truck,
  "Trailers": Truck,
  "Buses": Truck,
  "School Buses": Truck,
  "Vans": Truck,
  "Auto Rickshaws": Truck,
  "Taxi Vehicles": Car,
  "Tractors": Truck,
  "Construction Vehicles": Truck,

  // Agriculture
  "Seeds": Sprout,
  "Fertilizers": Sprout,
  "Pesticides": ShieldCheck,
  "Farm Equipment": Truck,
  "Irrigation Equipment": Droplets,
  "Dairy Equipment": Droplets,
  "Animal Feed": Package,
  "Fresh Produce": Sprout,
  "Grains and Pulses": Sprout,
  "Fruits and Vegetables": Sprout,
  "Plants and Saplings": Sprout,
  "Livestock": PawPrint,
  "Poultry": PawPrint,
  "Seeds & Plants": Sprout,

  // Books & Sports
  "School Books": BookOpen,
  "College Books": GraduationCap,
  "Competitive Exam Books (JEE, NEET, UPSC)": Trophy,
  "Novels & Fiction": BookOpen,
  "Children’s Books": BookOpen,
  "Religious & Spiritual Books": BookOpen,
  "Comics & Graphic Novels": BookOpen,
  "Cricket Equipment": Trophy,
  "Football Equipment": Trophy,
  "Badminton Rackets": Trophy,
  "Fitness & Gym Equipment": Dumbbell,
  "Cycling & Bicycles": Bike,
  "Indoor & Outdoor Games": Gamepad2,
  "Sportswear & Shoes": Trophy,
  "Books": BookOpen,
  "Gym & Fitness": Dumbbell,
  "Musical Instruments": Music,
  "Sports Equipment": Trophy,
  "Games & Toys": Gamepad2,

  // Fashion
  "Men’s Clothing": Shirt,
  "Women’s Clothing": Sparkles,
  "Kids’ Clothing": Baby,
  "Footwear": ShoppingBag,
  "Watches": Watch,
  "Bags & Backpacks": ShoppingBag,
  "Jewellery & Accessories": Sparkles,
  "Ethnic Wear": Sparkles,
  "Western Wear": Shirt,
  "Sportswear": Trophy,
  "Bridal Wear": Sparkles,
  "Men": Shirt,
  "Women": Sparkles,
  "Kids": Baby,
  "Bags & Luggage": ShoppingBag,
};

export function CategoryDetailModal({
  open,
  onClose,
  category: initialCategory,
}: {
  open: boolean;
  onClose: () => void;
  category: Category | { id: string; name: string; icon?: string; subcategories?: string[] } | null;
}) {
  const nav = useNavigate();
  const [internalCat, setInternalCat] = useState(initialCategory);
  const [activeTab, setActiveTab] = useState<"subcategories" | "brands">("subcategories");
  const [searchFilter, setSearchFilter] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInternalCat(initialCategory);
    setSelectedBrand(null);
    setSearchFilter("");
  }, [initialCategory]);

  const category = internalCat || initialCategory;
  const catId = category?.id?.toLowerCase() || "";

  // Category cycling
  const allCats = CATEGORIES;
  const currentIdx = allCats.findIndex((c) => c.id.toLowerCase() === catId);
  const nextCategory = currentIdx !== -1 ? allCats[(currentIdx + 1) % allCats.length] : allCats[0];
  const prevCategory = currentIdx !== -1 ? allCats[(currentIdx - 1 + allCats.length) % allCats.length] : allCats[allCats.length - 1];

  const handleNextCategory = () => {
    if (nextCategory) {
      setInternalCat(nextCategory);
      setSelectedBrand(null);
      setSearchFilter("");
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
    }
  };

  const handlePrevCategory = () => {
    if (prevCategory) {
      setInternalCat(prevCategory);
      setSelectedBrand(null);
      setSearchFilter("");
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
    }
  };

  const handleScrollDown = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 30) {
        handleNextCategory();
      } else {
        scrollRef.current.scrollBy({ top: 280, behavior: "smooth" });
      }
    }
  };

  // Subcategories list
  const subcategoriesList: string[] = useMemo(() => {
    if (!category) return [];
    if (Array.isArray((category as any).subcategories) && (category as any).subcategories.length > 0) {
      return (category as any).subcategories.map((s: any) => typeof s === "string" ? s : s?.name || String(s));
    }
    return SUBCATEGORIES[catId] || ["General Listings", "Accessories", "Services", "Deals"];
  }, [category, catId]);

  // Brands list
  const brandsList: string[] = useMemo(() => {
    if (!catId) return [];
    const normalized = catId.toLowerCase().replace(/_/g, "-");
    if (normalized.includes("commercial") || normalized.includes("truck")) {
      return BRANDS_BY_CATEGORY["commercial-vehicles"] || [];
    }
    return BRANDS_BY_CATEGORY[normalized] || BRANDS_BY_CATEGORY[catId] || ["Popular Brand 1", "Popular Brand 2", "Popular Brand 3"];
  }, [catId]);

  if (!open || !category) return null;

  const IconComp = (Lucide as unknown as Record<string, Lucide.LucideIcon>)[(category as any).icon || "Package"] ?? CATEGORY_ICONS_MAP[catId] ?? Package;
  const tint = CATEGORY_TINTS_MAP[catId] || { bg: "bg-primary/10 text-primary", text: "text-primary", gradient: "from-indigo-700 via-purple-700 to-pink-700", accent: "text-primary" };

  // Filtered lists
  const filteredSubs = subcategoriesList.filter((s) =>
    s.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const filteredBrands = brandsList.filter((b) =>
    b.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const currentModels = selectedBrand ? getModelsForBrand(catId, selectedBrand) : [];

  const handleSubSelect = (sub: string) => {
    onClose();
    if (catId === "jobs") {
      nav({ to: "/jobs", search: { sub: catId } as any });
    } else if (catId === "services") {
      nav({ to: "/services", search: { sub } as any });
    } else {
      nav({ to: "/category/$id", params: { id: catId }, search: { sub } as any });
    }
  };

  const handleBrandSelect = (brandName: string) => {
    setSelectedBrand(selectedBrand === brandName ? null : brandName);
  };

  const handleModelSelect = (modelName: string) => {
    onClose();
    nav({ to: "/results", search: { q: `${selectedBrand || ""} ${modelName}`, cat: catId } as any });
  };

  const handleBrowseAll = () => {
    onClose();
    if (catId === "jobs") {
      nav({ to: "/jobs" });
    } else if (catId === "services") {
      nav({ to: "/services" });
    } else {
      nav({ to: "/category/$id", params: { id: catId }, search: { view: "grid" } as any });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[92vh] overflow-hidden rounded-3xl bg-card border border-border/80 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col font-sans"
      >
        {/* Classy Classifieds Hero Header */}
        <div className="relative px-5 sm:px-6 pt-6 pb-5 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 text-white shrink-0 overflow-hidden">
          {/* Subtle Ambient Glow Shapes */}
          <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-black/20 blur-xl pointer-events-none" />

          {/* Top Header Controls Bar */}
          <div className="flex items-center justify-between gap-2 relative z-10">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-black tracking-wide backdrop-blur-md border border-white/20 text-white shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-amber-300 fill-amber-300" /> Category Hub
            </div>
            <button
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-full bg-white/15 hover:bg-white/30 text-white transition-all backdrop-blur-md active:scale-90 border border-white/20 cursor-pointer shadow-sm"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Category Header Profile Card */}
          <div className="mt-4 flex items-center gap-4 relative z-10">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-white/15 border border-white/25 shadow-xl backdrop-blur-md text-white">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-white/20 text-white shadow-inner">
                <IconComp className="h-6.5 w-6.5" />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white truncate">
                  {category.name}
                </h2>
                <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-amber-400/25 border border-amber-300/40 backdrop-blur-md px-2 py-0.5 text-[10px] font-black text-amber-300 shadow-xs">
                  🔥 Verified Deals
                </span>
              </div>
              <p className="mt-1 text-xs font-semibold text-white/80 flex items-center gap-2">
                <span>Browse {subcategoriesList.length} verified subcategories & top brands in your area</span>
              </p>
            </div>
          </div>
        </div>

        {/* Live Search & Filter Tab Switcher */}
        <div className="px-5 sm:px-6 pt-4 pb-3 border-b border-border/70 bg-card space-y-3 shrink-0">
          {/* Quick Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder={`Search ${category.name} subcategories or brands...`}
              className="w-full h-10.5 rounded-2xl border border-border/80 bg-secondary/40 pl-10 pr-9 text-xs font-bold text-foreground outline-none focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/70"
            />
            {searchFilter && (
              <button
                onClick={() => setSearchFilter("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 cursor-pointer"
                title="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Classifieds Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setActiveTab("subcategories"); setSelectedBrand(null); }}
              className={cn(
                "flex-1 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 border cursor-pointer",
                activeTab === "subcategories"
                  ? "bg-primary text-primary-foreground border-primary shadow-sm ring-2 ring-primary/20"
                  : "bg-secondary/50 text-muted-foreground border-border hover:bg-secondary hover:text-foreground"
              )}
            >
              <Layers className="h-4 w-4" />
              <span>Subcategories ({subcategoriesList.length})</span>
            </button>

            {brandsList.length > 0 && (
              <button
                onClick={() => setActiveTab("brands")}
                className={cn(
                  "flex-1 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 border cursor-pointer",
                  activeTab === "brands"
                    ? "bg-primary text-primary-foreground border-primary shadow-sm ring-2 ring-primary/20"
                    : "bg-secondary/50 text-muted-foreground border-border hover:bg-secondary hover:text-foreground"
                )}
              >
                <Tag className="h-4 w-4" />
                <span>Popular Brands ({brandsList.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Content Container: Classy Circular Icon Cards (Circle Icon on Top, Text Below) */}
        <div ref={scrollRef} className="p-4 sm:p-6 overflow-y-auto max-h-[52vh] space-y-4 font-sans bg-muted/15 scroll-smooth">
          {activeTab === "subcategories" && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground font-extrabold uppercase tracking-wider px-1">
                <span className="flex items-center gap-1.5">
                  <Flame className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                  Select a Subcategory
                </span>
                <span className="text-[11px] font-semibold lowercase">Showing {filteredSubs.length} items</span>
              </div>

              {filteredSubs.length === 0 ? (
                <div className="py-12 text-center rounded-2xl border border-dashed border-border bg-card/50">
                  <p className="text-xs font-black text-muted-foreground">
                    No subcategories found matching "{searchFilter}"
                  </p>
                  <button
                    onClick={() => setSearchFilter("")}
                    className="mt-2 text-xs font-bold text-primary hover:underline cursor-pointer"
                  >
                    Clear search filter
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-3.5">
                  {filteredSubs.map((sub) => {
                    const SubIcon = SUBCATEGORY_ICONS_MAP[sub] ?? IconComp;

                    return (
                      <button
                        key={sub}
                        onClick={() => handleSubSelect(sub)}
                        className="group flex flex-col items-center justify-center text-center p-3.5 sm:p-4 rounded-2xl border border-border/80 bg-card hover:border-primary hover:bg-primary/[0.04] hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer active:scale-95"
                      >
                        {/* 1. Circle Icon on Top with Uniform Color */}
                        <div className="grid h-14 w-14 sm:h-16 sm:w-16 place-items-center rounded-full bg-primary/10 text-primary border border-primary/20 group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-108 transition-all duration-300 mb-2.5 shadow-2xs">
                          <SubIcon className="h-6 w-6 sm:h-7 sm:w-7 transition-transform duration-300" />
                        </div>

                        {/* 2. Subcategory Name Below */}
                        <div className="text-xs sm:text-sm font-black text-foreground group-hover:text-primary transition-colors line-clamp-1 leading-snug w-full px-1">
                          {sub}
                        </div>

                        {/* 3. Verified Deals Status Below */}
                        <div className="text-[10px] sm:text-[10.5px] text-muted-foreground font-bold flex items-center justify-center gap-1 mt-1">
                          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                          <span className="truncate">Verified Deals</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "brands" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground font-extrabold uppercase tracking-wider px-1">
                <span>Top {category.name} Brands</span>
                <span className="text-[11px] font-semibold lowercase">Click brand to view models</span>
              </div>

              {filteredBrands.length === 0 ? (
                <div className="py-12 text-center rounded-2xl border border-dashed border-border bg-card/50">
                  <p className="text-xs font-black text-muted-foreground">
                    No brands found matching "{searchFilter}"
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-3.5">
                  {filteredBrands.map((brand) => {
                    const isSelected = selectedBrand === brand;
                    const modelCount = getModelsForBrand(catId, brand).length;

                    return (
                      <button
                        key={brand}
                        onClick={() => handleBrandSelect(brand)}
                        className={cn(
                          "group flex flex-col items-center justify-center text-center p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer active:scale-95",
                          isSelected
                            ? "bg-primary/10 border-primary text-primary shadow-md ring-2 ring-primary/30 font-black"
                            : "bg-card border-border/80 text-foreground hover:border-primary hover:bg-primary/[0.04] hover:shadow-sm font-extrabold hover:-translate-y-1"
                        )}
                      >
                        {/* 1. Circle Brand Icon on Top with Uniform Color */}
                        <div className={cn(
                          "grid h-14 w-14 sm:h-16 sm:w-16 place-items-center rounded-full border transition-all duration-300 group-hover:scale-108 mb-2.5 shadow-2xs",
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary shadow-md"
                            : "bg-primary/10 text-primary border-primary/20 group-hover:bg-primary group-hover:text-primary-foreground"
                        )}>
                          <IconComp className="h-6 w-6 sm:h-7 sm:w-7" />
                        </div>

                        {/* 2. Brand Name Below */}
                        <span className="text-xs sm:text-sm font-black truncate block w-full px-1">{brand}</span>

                        {/* 3. Badge Below */}
                        <span className="mt-1 inline-flex items-center gap-0.5 rounded-full bg-secondary px-2 py-0.5 text-[9.5px] font-bold text-muted-foreground">
                          {modelCount > 0 ? `${modelCount}+ Models` : "Verified Deals"}
                        </span>

                        {isSelected && (
                          <div className="mt-1 text-[10px] text-primary font-black flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Selected
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Interactive Models Drawer when brand is chosen */}
              {selectedBrand && currentModels.length > 0 && (
                <div className="mt-4 p-4 rounded-2xl border border-primary/40 bg-card shadow-lg animate-in fade-in slide-in-from-top-3 duration-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-primary uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                      Popular {selectedBrand} Models
                    </span>
                    <button
                      onClick={() => setSelectedBrand(null)}
                      className="text-[10px] font-bold text-muted-foreground hover:text-foreground underline cursor-pointer"
                    >
                      Hide Models
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {currentModels.map((model) => (
                      <button
                        key={model}
                        onClick={() => handleModelSelect(model)}
                        className="px-3.5 py-1.5 rounded-xl bg-secondary/70 hover:bg-primary hover:text-primary-foreground border border-border/80 hover:border-primary text-xs font-extrabold text-foreground shadow-2xs hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>{model}</span>
                        <ArrowRight className="h-3 w-3 opacity-60" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Next Category & Scroll Arrow Navigation Bar (Above Explore button) */}
        <div className="px-4 sm:px-6 pt-3 pb-2 flex items-center justify-between gap-2 border-t border-border/70 bg-card shrink-0">
          <button
            type="button"
            onClick={handleScrollDown}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/80 hover:bg-secondary text-[11.5px] font-black text-foreground hover:text-primary transition-all shadow-xs hover:scale-105 active:scale-95 cursor-pointer border border-border/60"
            title="Scroll down to view more subcategories & brands"
          >
            <ChevronDown className="h-3.5 w-3.5 text-primary animate-bounce" />
            <span>Scroll for More</span>
          </button>

          <div className="flex items-center gap-1.5">
            {prevCategory && (
              <button
                type="button"
                onClick={handlePrevCategory}
                className="grid h-8 w-8 place-items-center rounded-full border border-border/80 bg-card hover:bg-secondary text-muted-foreground hover:text-foreground text-xs transition-all active:scale-95 shadow-xs"
                title={`Previous Category: ${prevCategory.name}`}
                aria-label="Previous Category"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}

            {nextCategory && (
              <button
                type="button"
                onClick={handleNextCategory}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 text-[11.5px] font-black transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-xs"
                title={`Next Category: ${nextCategory.name}`}
              >
                <span>Next: {nextCategory.name}</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Footer Action Bar */}
        <div className="px-4 sm:px-6 pb-4 pt-1 bg-card shrink-0">
          <button
            onClick={handleBrowseAll}
            className="w-full py-3.5 rounded-2xl bg-primary hover:bg-primary/95 text-primary-foreground font-black text-xs sm:text-sm tracking-wide shadow-md hover:shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <IconComp className="h-4.5 w-4.5" />
            <span>Explore All {category.name} Ads</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
