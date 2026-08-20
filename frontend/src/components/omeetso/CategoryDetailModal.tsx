import React, { useState, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import * as Lucide from "lucide-react";
import {
  X, Sparkles, ChevronRight, Search, Tag, Layers, Flame, ShieldCheck,
  ArrowRight, CheckCircle2, Car, Bike, Smartphone, Tv, Sofa, Building2,
  Shirt, Refrigerator, Briefcase, Wrench, PawPrint, Truck, BookOpen, Sprout, Package,
  Laptop, Camera, Headphones, Gamepad2, Bed, Utensils, KeyRound, Home, Map,
  Tablet, Watch, Wind, Clock, GraduationCap, Compass, Zap, Gauge, Droplets,
  Snowflake, Dumbbell, Music, Trophy, Baby, ShoppingBag, Palette, Eye
} from "lucide-react";
import { SUBCATEGORIES, type Category } from "@/lib/mock";
import { BRANDS_BY_CATEGORY, MODELS_BY_BRAND } from "@/lib/aiAssistance";
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
  pets: PawPrint,
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
  pets: { bg: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-400", text: "text-yellow-700", gradient: "from-amber-700 via-yellow-700 to-orange-700", accent: "text-yellow-500" },
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

  // Pets
  "Dogs": "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&auto=format&fit=crop&q=80",
  "Cats": "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&auto=format&fit=crop&q=80",
  "Birds": "https://images.unsplash.com/photo-1444464666168-49d633b86797?w=600&auto=format&fit=crop&q=80",
  "Fish": "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=600&auto=format&fit=crop&q=80",
  "Pet Food & Accessories": "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=600&auto=format&fit=crop&q=80",

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
  "Used Cars": Car,
  "New Cars": Sparkles,
  "Car Accessories": ShieldCheck,
  "Spare Parts": Wrench,
  "Car Services": Gauge,
  "Motorcycles": Bike,
  "Scooters": Zap,
  "Bicycles": Compass,
  "Bike Services": Gauge,
  "Smartphones": Smartphone,
  "Tablets": Tablet,
  "Accessories": Headphones,
  "Smart Watches": Watch,
  "Repair": Wrench,
  "TVs": Tv,
  "Laptops": Laptop,
  "Cameras": Camera,
  "Audio": Headphones,
  "Gaming": Gamepad2,
  "Sofas": Sofa,
  "Beds": Bed,
  "Dining Tables": Utensils,
  "Wardrobes": Layers,
  "Chairs": Sofa,
  "Office Furniture": Briefcase,
  "Other Furniture": Home,
  "For Rent": KeyRound,
  "For Sale": Building2,
  "PG & Hostels": Home,
  "Land & Plots": Map,
  "Commercial": Building2,
  "Men": Shirt,
  "Women": Sparkles,
  "Kids": Baby,
  "Watches": Watch,
  "Bags & Luggage": ShoppingBag,
  "Refrigerators": Refrigerator,
  "Washing Machines": Wind,
  "ACs": Snowflake,
  "Kitchen Appliances": Utensils,
  "Water Purifiers": Droplets,
  "Full time": Briefcase,
  "Part time": Clock,
  "Work from home": Laptop,
  "Internships": GraduationCap,
  "Freshers": CheckCircle2,
  "Home Repair": Wrench,
  "Cleaning": Sparkles,
  "Tutors": BookOpen,
  "Movers": Truck,
  "Photography": Camera,
  "Dogs": PawPrint,
  "Cats": PawPrint,
  "Birds": Sparkles,
  "Fish": Droplets,
  "Pet Food & Accessories": Package,
  "Auto Rickshaws": Truck,
  "Trucks": Truck,
  "Tractors": Truck,
  "Buses": Truck,
  "Books": BookOpen,
  "Gym & Fitness": Dumbbell,
  "Musical Instruments": Music,
  "Sports Equipment": Trophy,
  "Games & Toys": Gamepad2,
  "Seeds & Plants": Sprout,
  "Livestock": PawPrint,
  "Collectibles": Sparkles,
  "Art": Palette,
  "Household Items": Home,
  "Miscellaneous": Package,
};

export function CategoryDetailModal({
  open,
  onClose,
  category,
}: {
  open: boolean;
  onClose: () => void;
  category: Category | { id: string; name: string; icon?: string; subcategories?: string[] } | null;
}) {
  const nav = useNavigate();
  const [activeTab, setActiveTab] = useState<"subcategories" | "brands">("subcategories");
  const [searchFilter, setSearchFilter] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);

  const catId = category?.id?.toLowerCase() || "";

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
    return BRANDS_BY_CATEGORY[catId] || ["Popular Brand 1", "Popular Brand 2", "Popular Brand 3"];
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

  const currentModels = selectedBrand ? (MODELS_BY_BRAND[selectedBrand] || []) : [];

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
        <div className={`relative px-5 sm:px-6 pt-6 pb-5 bg-gradient-to-r ${tint.gradient} text-white shrink-0 overflow-hidden`}>
          {/* Subtle Ambient Glow Shapes */}
          <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-white/15 blur-2xl pointer-events-none" />
          <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-black/20 blur-xl pointer-events-none" />

          {/* Top Header Controls Bar */}
          <div className="flex items-center justify-between gap-2 relative z-10">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[11px] font-black tracking-wide backdrop-blur-md border border-white/30 text-white shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-amber-300 fill-amber-300" /> Category Hub
            </div>
            <button
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-full bg-white/20 hover:bg-white/35 text-white transition-all backdrop-blur-md active:scale-90 border border-white/30 cursor-pointer shadow-sm"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Category Header Profile Card */}
          <div className="mt-4 flex items-center gap-4 relative z-10">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-white/20 border border-white/30 shadow-xl backdrop-blur-md text-white">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/25 text-white shadow-inner">
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

        {/* Content Container: Classy Visual Cards (Image on Top, Name Below) */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[52vh] space-y-4 font-sans bg-muted/15">
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
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-3.5">
                  {filteredSubs.map((sub) => {
                    const SubIcon = SUBCATEGORY_ICONS_MAP[sub] ?? IconComp;
                    const imageUrl = SUBCATEGORY_IMAGES[sub] || `https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&auto=format&fit=crop&q=80`;

                    return (
                      <button
                        key={sub}
                        onClick={() => handleSubSelect(sub)}
                        className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card hover:border-primary/60 hover:shadow-lg hover:-translate-y-0.5 transition-all text-left cursor-pointer active:scale-[0.98]"
                      >
                        {/* 1. Visual Card Image on Top with Icon Overlay & Badge */}
                        <div className="relative h-24 sm:h-28 w-full overflow-hidden bg-slate-900 shrink-0">
                          <img
                            src={imageUrl}
                            alt={sub}
                            className="h-full w-full object-cover group-hover:scale-108 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                            loading="lazy"
                          />
                          {/* Rich Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                          {/* Floating Top Category Icon Badge */}
                          <div className="absolute top-2 left-2 grid h-7 w-7 place-items-center rounded-lg bg-slate-950/70 border border-white/20 text-white backdrop-blur-md shadow-sm">
                            <SubIcon className="h-3.5 w-3.5" />
                          </div>

                          {/* Active Deals / Hot Pill */}
                          <div className="absolute top-2 right-2 flex items-center gap-1 rounded-md bg-amber-500/90 backdrop-blur-md px-1.5 py-0.5 text-[9px] font-black text-slate-950 shadow-xs">
                            <Flame className="h-2.5 w-2.5 fill-slate-950" />
                            <span>Hot Deals</span>
                          </div>

                          {/* Subtle arrow in bottom right of image */}
                          <div className="absolute bottom-2 right-2 grid h-6 w-6 place-items-center rounded-full bg-white/20 text-white backdrop-blur-md group-hover:bg-primary group-hover:text-white transition-colors">
                            <ChevronRight className="h-3.5 w-3.5" />
                          </div>
                        </div>

                        {/* 2. Subcategory Details Name Below */}
                        <div className="p-3 sm:p-3.5 flex flex-col justify-between flex-1 bg-card">
                          <div className="space-y-1">
                            <div className="text-xs sm:text-sm font-black text-foreground group-hover:text-primary transition-colors line-clamp-1 leading-snug">
                              {sub}
                            </div>
                            <div className="text-[10px] text-muted-foreground font-bold flex items-center gap-1">
                              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span>Active Listings</span>
                            </div>
                          </div>
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
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3">
                  {filteredBrands.map((brand) => {
                    const isSelected = selectedBrand === brand;
                    const modelCount = (MODELS_BY_BRAND[brand] || []).length;

                    return (
                      <button
                        key={brand}
                        onClick={() => handleBrandSelect(brand)}
                        className={cn(
                          "group relative flex flex-col items-center justify-between p-3.5 rounded-2xl border text-center transition-all cursor-pointer active:scale-98 overflow-hidden",
                          isSelected
                            ? "bg-primary/10 border-primary text-primary shadow-md ring-2 ring-primary/30 font-black"
                            : "bg-card border-border/80 text-foreground hover:border-primary/50 hover:bg-secondary/40 hover:shadow-sm font-extrabold"
                        )}
                      >
                        {/* 1. Brand Logo / Emblem Visual on Top */}
                        <div className={cn(
                          "grid h-12 w-12 place-items-center rounded-2xl transition-transform group-hover:scale-108 shadow-xs mb-2 border",
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary"
                            : cn(tint.bg, "border-border/60")
                        )}>
                          <IconComp className="h-6 w-6" />
                        </div>

                        {/* 2. Brand Name Below */}
                        <div className="w-full space-y-1">
                          <span className="text-xs font-black truncate block">{brand}</span>
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-secondary px-2 py-0.5 text-[9px] font-bold text-muted-foreground">
                            {modelCount > 0 ? `${modelCount}+ Models` : "Popular Brand"}
                          </span>
                        </div>

                        {isSelected && (
                          <div className="mt-2 text-[10px] text-primary font-black flex items-center gap-1">
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

        {/* Footer Action Bar */}
        <div className="p-4 sm:px-6 border-t border-border/80 bg-card shrink-0">
          <button
            onClick={handleBrowseAll}
            className="w-full py-3.5 rounded-2xl bg-primary hover:bg-primary/95 text-primary-foreground font-black text-xs sm:text-sm tracking-wide shadow-md hover:shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Explore All {category.name} Ads</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
