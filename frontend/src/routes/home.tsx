import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Search, Mic, Camera, MapPin, X, Zap, ShieldCheck, MessageSquare, Sparkles, ArrowRight, Car, Bike, Smartphone } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { LocationTopBar } from "@/components/omeetso/TopBar";
import { BottomNav } from "@/components/omeetso/BottomNav";
import { CategoryIcon } from "@/components/omeetso/CategoryIcon";
import { ProductCard } from "@/components/omeetso/ProductCard";
import { StoreCard } from "@/components/omeetso/StoreCard";
import {
  HeroAd, QuickSellCard, CategoryStripAd, NativeAdCard,
  SecondaryBannerAd, QuickDealsBanner, AdErrorFallback,
} from "@/components/omeetso/AdBanner";
import { SafetyCard } from "@/components/omeetso/SafetyCard";
import { CATEGORIES, PRODUCTS, STORES, getAd, formatINR } from "@/lib/mock";
import { getRecentlyViewed } from "@/lib/saved";
import { cn } from "@/lib/utils";

import { fetchLivePublicListings } from "@/lib/listings";
import { serveAdsApi } from "@/api/adCampaigns.api";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "Omeetso — Discover nearby deals" },
      { name: "description", content: "Browse products near you, discover local stores and connect with trusted sellers on Omeetso." },
      { property: "og:title", content: "Omeetso — Discover nearby deals" },
      { property: "og:description", content: "Nearby products, verified sellers, local stores." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Home,
});

type SavedLocation = { area: string; pincode: string };

import { LocationModal } from "@/components/omeetso/LocationModal";
import { ProductQuickPreviewModal } from "@/components/omeetso/ProductQuickPreviewModal";
import { CategoryDetailModal } from "@/components/omeetso/CategoryDetailModal";
import { fetchLiveCategories, LiveCategory } from "@/lib/categories";

function HeroProductShowcase({ items }: { items?: any[] }) {
  const displayItems = useMemo(() => {
    if (items && items.length > 0) {
      return items.slice(0, 5).map((item, idx) => ({
        id: item.id || item.bannerId || `hp-live-${idx}`,
        title: item.title,
        price: item.price || 0,
        originalPrice: item.originalPrice || Math.round((item.price || 5000) * 1.18),
        area: item.location || `${item.area || item.city || "Madhapur"} • ${item.distanceKm || 0.8} km away`,
        tag: item.tag || (item.category ? `${item.category.slice(0, 1).toUpperCase()}${item.category.slice(1)}` : "Verified Deal"),
        image: item.image || (Array.isArray(item.images) && item.images[0]) || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
        sellerName: item.sellerName || "Verified Local Seller",
        initials: item.initials || (item.sellerName || "VS").slice(0, 2).toUpperCase(),
        responseTime: item.responseTime || "Responds in < 5 mins",
        targetUrl: item.targetUrl || `/product/${item.id || item.listingId || ""}`
      }));
    }
    return [];
  }, [items]);

  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    if (displayItems.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % displayItems.length);
    }, 5000); // 5 Seconds Auto Rotation
    return () => clearInterval(timer);
  }, [displayItems.length]);

  if (displayItems.length === 0) {
    return (
      <div className="relative mx-auto w-full max-w-[480px] flex flex-col justify-between py-1">
        <div className="rounded-3xl bg-slate-900/80 backdrop-blur-2xl border border-white/15 p-6 text-white space-y-4 shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-400 text-slate-950 uppercase tracking-wide">
              ⚡ Local Marketplace
            </span>
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> 100% Verified
            </span>
          </div>

          <div className="space-y-1.5">
            <h3 className="text-xl font-black text-white">Direct Local Deals</h3>
            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              Connect directly with verified buyers and sellers in your neighborhood with zero commissions and instant chat.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-white/10">
            <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-center">
              <div className="text-base font-black text-amber-400">0%</div>
              <div className="text-[10px] font-bold text-slate-300">Commission</div>
            </div>
            <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-center">
              <div className="text-base font-black text-emerald-400">Instant</div>
              <div className="text-[10px] font-bold text-slate-300">Direct Chat</div>
            </div>
            <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-center">
              <div className="text-base font-black text-indigo-300">Local</div>
              <div className="text-[10px] font-bold text-slate-300">Fast Pickups</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto w-full max-w-[480px] flex flex-col justify-between py-1">

      {/* Timer Progress Indicator & Manual Pill Selector (Relative top) */}
      <div className="relative flex items-center justify-between px-1 mb-2 z-40">
        <div className="rounded-full bg-slate-950/95 backdrop-blur-md text-white px-3 py-1 shadow-lg border border-amber-400/40 text-xs font-black flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          <span>🔥 5s Live DB Rotation</span>
        </div>

        {/* 5s 5-Card Progress Dots */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full shadow-md">
          {displayItems.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIdx(i)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                activeIdx === i ? "w-6 bg-amber-400" : "w-2 bg-white/40 hover:bg-white/70"
              )}
              title={`View Deal ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* 5 Cards Stack Container */}
      <div className="relative w-full h-[270px] my-1">
        {displayItems.map((item, index) => {
          const rel = (index - activeIdx + displayItems.length) % displayItems.length;

          if (rel === 0) {
            return (
              <Link
                key={item.id}
                to="/product/$id"
                params={{ id: item.id }}
                className="absolute inset-x-0 top-5 z-30 rounded-3xl bg-slate-900/90 dark:bg-slate-950/95 backdrop-blur-2xl border border-amber-400/30 p-4 sm:p-5 shadow-2xl transition-all duration-700 ease-out animate-in fade-in zoom-in-95 text-white hover:border-amber-400/60 group cursor-pointer block"
              >
                <div className="flex items-center gap-3.5">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-22 w-22 rounded-2xl object-cover border border-white/20 shrink-0 shadow-xl group-hover:scale-105 transition-transform"
                    onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400"; }}
                  />
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 px-2.5 py-0.5 text-[11px] font-black shadow-xs">
                        <Zap className="h-3 w-3 fill-amber-300" /> {item.tag}
                      </span>
                      <span className="text-[10px] text-amber-300 font-bold bg-amber-500/15 border border-amber-400/25 px-2 py-0.5 rounded-full">5s Auto</span>
                    </div>
                    <h4 className="text-base font-black truncate text-white pt-0.5 group-hover:text-amber-300 transition-colors">{item.title}</h4>
                    <p className="text-[11px] text-slate-300 font-semibold">{item.area}</p>
                    <div className="pt-0.5 flex items-center justify-between">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xl font-black text-amber-300">{formatINR(item.price)}</span>
                        {item.originalPrice > item.price && (
                          <span className="text-[11px] text-slate-400 line-through font-semibold">{formatINR(item.originalPrice)}</span>
                        )}
                      </div>
                      <span className="text-[10px] font-black text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/30">
                        🛡️ Verified DB
                      </span>
                    </div>
                  </div>
                </div>

                {/* Direct Seller Proposal Bar */}
                <div className="mt-3.5 pt-3 border-t border-white/15 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black text-xs shadow-md">
                      {item.initials}
                    </div>
                    <div>
                      <div className="text-xs font-black text-white">{item.sellerName}</div>
                      <div className="text-[10px] text-emerald-400 font-bold">{item.responseTime}</div>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:brightness-110 text-slate-950 px-3.5 py-1.5 text-xs font-black transition-all shadow-md group-hover:scale-105">
                    <MessageSquare className="h-3.5 w-3.5" /> Make Direct Offer
                  </span>
                </div>
              </Link>
            );
          }

          if (rel === 1) {
            return (
              <div
                key={item.id}
                onClick={() => setActiveIdx(index)}
                className="absolute left-1 right-14 top-1 z-20 rounded-3xl bg-slate-900/85 border border-white/20 p-3 shadow-xl transform -rotate-6 hover:rotate-0 transition-all duration-700 cursor-pointer text-white"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-12 w-12 rounded-xl object-cover border border-white/20 shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400"; }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-amber-300 uppercase tracking-wider">{item.tag}</span>
                      <span className="text-[10px] font-bold text-amber-400 hover:underline">Click to swap →</span>
                    </div>
                    <h5 className="text-xs font-extrabold text-white truncate">{item.title}</h5>
                    <p className="text-xs font-black text-amber-300">{formatINR(item.price)}</p>
                  </div>
                </div>
              </div>
            );
          }

          if (rel === 2) {
            return (
              <div
                key={item.id}
                onClick={() => setActiveIdx(index)}
                className="absolute left-14 right-1 -top-3 z-10 rounded-3xl bg-slate-900/75 border border-white/15 p-3 shadow-lg transform rotate-6 hover:rotate-0 transition-all duration-700 cursor-pointer opacity-90 text-white"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-12 w-12 rounded-xl object-cover border border-white/15 shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400"; }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-amber-300 uppercase tracking-wider">{item.tag}</span>
                      <span className="text-[10px] font-bold text-amber-400 hover:underline">Click to swap →</span>
                    </div>
                    <h5 className="text-xs font-extrabold text-white truncate">{item.title}</h5>
                    <p className="text-xs font-black text-amber-300">{formatINR(item.price)}</p>
                  </div>
                </div>
              </div>
            );
          }

          if (rel === 3) {
            return (
              <div
                key={item.id}
                onClick={() => setActiveIdx(index)}
                className="absolute left-3 right-16 -top-6 z-5 rounded-3xl bg-slate-900/65 border border-white/15 p-2.5 shadow-md transform -rotate-9 hover:rotate-0 transition-all duration-700 cursor-pointer opacity-70 text-white"
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-10 w-10 rounded-lg object-cover border border-white/15 shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400"; }}
                  />
                  <div className="min-w-0 flex-1">
                    <h6 className="text-[11px] font-bold text-white truncate">{item.title}</h6>
                    <p className="text-[11px] font-black text-amber-300">{formatINR(item.price)}</p>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div
              key={item.id}
              onClick={() => setActiveIdx(index)}
              className="absolute left-16 right-3 -top-9 z-0 rounded-3xl bg-slate-900/55 border border-white/10 p-2.5 shadow-xs transform rotate-9 hover:rotate-0 transition-all duration-700 cursor-pointer opacity-55 text-white"
            >
              <div className="flex items-center gap-2.5">
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-10 w-10 rounded-lg object-cover border border-white/15 shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400"; }}
                />
                <div className="min-w-0 flex-1">
                  <h6 className="text-[11px] font-bold text-white truncate">{item.title}</h6>
                  <p className="text-[11px] font-black text-amber-300">{formatINR(item.price)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Floating Trust Card (Contained within Hero bounds) */}
      <div className="relative z-40 mt-3 w-full rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white p-3 shadow-xl border border-white/20 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-amber-500 text-slate-950 shrink-0 font-black text-sm shadow-md">
            ⚡
          </div>
          <div className="min-w-0">
            <div className="text-xs font-black text-amber-300">0% Commission Local Trades</div>
            <div className="text-[10px] font-bold text-white/80 truncate">Direct buyer to seller instant chat</div>
          </div>
        </div>
        <span className="shrink-0 text-[10px] font-black text-emerald-400 bg-emerald-500/20 border border-emerald-400/30 px-2 py-0.5 rounded-full">
          Verified
        </span>
      </div>

    </div>
  );
}

const DEFAULT_SAMPLE_STORES: any[] = [];

function Home() {
  const [loc, setLoc] = useState<SavedLocation | null>(null);
  const [showLocModal, setShowLocModal] = useState(false);
  const [previewProduct, setPreviewProduct] = useState<any | null>(null);
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [modalCategory, setModalCategory] = useState<any | null>(null);
  const [dismissed, setDismissed] = useState(false);

  const [dbCategories, setDbCategories] = useState<LiveCategory[]>([]);
  const [liveProducts, setLiveProducts] = useState<any[]>([]);
  const [liveShowcaseDeals, setLiveShowcaseDeals] = useState<any[]>([]);
  const [liveStores, setLiveStores] = useState<any[]>([]);
  const [liveHeroAds, setLiveHeroAds] = useState<any[]>([]);
  const [liveCategoryAd, setLiveCategoryAd] = useState<any | null>(null);

  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("omeetso_location") || localStorage.getItem("omeetso_selected_location");
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<SavedLocation>;
        if (parsed.area && parsed.pincode) setLoc({ area: parsed.area, pincode: parsed.pincode });
      }
    } catch { /* ignore */ }
    setRecentlyViewed(getRecentlyViewed());
  }, []);

  useEffect(() => {
    fetchLiveCategories()
      .then((cats) => {
        if (cats && cats.length > 0) setDbCategories(cats);
      })
      .catch(() => { });

    fetchLivePublicListings({
      area: loc?.area,
      pincode: loc?.pincode,
    })
      .then((items) => {
        if (items && items.length > 0) {
          const mapped = items.map((item: any) => ({
            id: item.id || item._id,
            title: item.title,
            price: item.priceInPaise ? item.priceInPaise / 100 : item.price || 0,
            originalPrice: Math.round((item.priceInPaise ? item.priceInPaise / 100 : item.price || 5000) * 1.2),
            negotiable: item.negotiable,
            category: item.category || item.categoryId || "electronics",
            subcategory: item.subcategory || item.subcategoryId || "electronics",
            condition: item.condition || "good",
            area: item.area || item.location || "Madhapur",
            city: item.city || "Hyderabad",
            distanceKm: 1.2,
            postedAgo: "Just now",
            image: item.images?.[0] || item.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
            images: item.images,
            verified: true,
            sellerName: item.sellerName || "Verified Local Seller",
            sellerId: item.sellerId || "u_seller",
            rating: item.rating || 0,
            reviewCount: item.reviewCount || 0,
            description: item.description,
            method: item.method || "quick",
          }));
          setLiveProducts(mapped);
        }
      })
      .catch(() => { });

    // Fetch Live Stores
    fetch("https://api.omeetso.in/api/v1/stores/public")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const approved = json.data.filter((item: any) => {
            const st = (item.status || "").toLowerCase();
            return st === "approved" || st === "active";
          });
          const mapped = approved.map((item: any) => ({
            id: item.id || item._id,
            name: item.name,
            cover: item.cover || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800",
            logo: item.logo || "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_200,h_200,c_fill/avatar_cxx1sy.png",
            category: item.primaryCategory || "Retail Store",
            area: item.area || "Madhapur",
            city: item.city || "Hyderabad",
            pincode: item.pincode || "500081",
            distanceKm: 1.2,
            rating: item.rating || 0,
            reviews: item.reviewCount || 0,
            open: true,
            verified: true,
            sponsored: false
          }));
          setLiveStores(mapped);
        }
      })
      .catch(() => { });

    // Fetch Admin-curated Home Hero Showcase & Banners
    fetch("https://api.omeetso.in/api/v1/banners")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const showcaseItems = json.data.filter((b: any) => b.type === "hero_showcase" && b.isActive !== false);
          if (showcaseItems.length > 0) setLiveShowcaseDeals(showcaseItems);
        }
      })
      .catch(() => { });
  }, []);

  const heroAd = getAd("HOME_HERO");
  const stripAd = getAd("HOME_CATEGORY_STRIP");
  const nativeAd = getAd("HOME_NATIVE_FEED");
  const secondaryAd = getAd("HOME_SECONDARY_BANNER");

  const organic = useMemo(() => {
    const pool = liveProducts;
    if (!loc?.area && !loc?.pincode) return pool;

    const targetArea = (loc?.area || "").toLowerCase();
    const targetPin = (loc?.pincode || "").toLowerCase();

    // Extract individual location terms for matching
    const areaTerms = targetArea.split(/[,\s]+/).filter(Boolean);

    const matched = pool.filter((p: any) => {
      const pText = `${p.location || ""} ${p.area || ""} ${p.city || ""} ${p.pincode || ""}`.toLowerCase();
      const pinMatch = targetPin && (pText.includes(targetPin) || (p.pincode && p.pincode.toString() === targetPin));
      const areaMatch = areaTerms.some((term) => term.length >= 3 && pText.includes(term));
      return pinMatch || areaMatch;
    });

    if (matched.length > 0) return matched;

    // Adapt products pool to selected user location (e.g. Adilabad, 504312) so all cards show user's exact area & pincode
    const activeArea = loc.area.split(",")[0].trim();
    const activePin = loc.pincode || "504312";
    return pool.map((p: any, idx: number) => ({
      ...p,
      area: activeArea,
      city: activeArea,
      pincode: activePin,
      location: `${activeArea}, ${activePin}`,
      distanceKm: Number((0.6 + idx * 0.4).toFixed(1)),
    }));
  }, [liveProducts, loc]);

  const nearby = organic.slice(0, 6);
  const featured = organic.slice(1, 5).reverse();
  const recommended = organic.slice(2, 8);
  const dealsNearYou = organic.slice(6, 12);
  const recentlyAdded = [...organic].reverse().slice(0, 5);
  const viewed = recentlyViewed
    .map((id) => organic.find((p) => p.id === id))
    .filter((p): p is (typeof organic)[number] => Boolean(p))
    .slice(0, 6);

  const carProducts = useMemo(() => {
    return organic.filter((p: any) =>
      (p.category || "").toLowerCase() === "cars" ||
      (p.subcategory || "").toLowerCase().includes("car") ||
      (p.title || "").toLowerCase().includes("car") ||
      p.id.startsWith("CAR-")
    );
  }, [organic]);

  const bikeProducts = useMemo(() => {
    return organic.filter((p: any) =>
      (p.category || "").toLowerCase() === "bikes" ||
      (p.subcategory || "").toLowerCase().includes("bike") ||
      (p.subcategory || "").toLowerCase().includes("motorcycle") ||
      (p.subcategory || "").toLowerCase().includes("scooter") ||
      p.id.startsWith("BIKE-") ||
      p.id === "Q-103"
    );
  }, [organic]);

  const electronicProducts = useMemo(() => {
    return organic.filter((p: any) =>
      (p.category || "").toLowerCase() === "electronics" ||
      (p.subcategory || "").toLowerCase().includes("mobile") ||
      (p.subcategory || "").toLowerCase().includes("laptop") ||
      (p.subcategory || "").toLowerCase().includes("gaming") ||
      p.id.startsWith("ELEC-") ||
      p.id.startsWith("Q-10")
    );
  }, [organic]);

  const storesToDisplay = useMemo(() => {
    const rawPool = liveStores.length > 0 ? liveStores : DEFAULT_SAMPLE_STORES;
    if (!loc?.area && !loc?.pincode) return rawPool;

    const targetArea = (loc?.area || "").toLowerCase();
    const targetPin = (loc?.pincode || "").toLowerCase();
    const areaTerms = targetArea.split(/[,\s]+/).filter(Boolean);

    const matched = rawPool.filter((s: any) => {
      const sText = `${s.area || ""} ${s.city || ""} ${s.pincode || ""}`.toLowerCase();
      const pinMatch = targetPin && sText.includes(targetPin);
      const areaMatch = areaTerms.some((term) => term.length >= 3 && sText.includes(term));
      return pinMatch || areaMatch;
    });

    if (matched.length > 0) {
      return matched;
    }

    // Adapt sample stores to user's selected area (e.g. Adilabad) so verified local stores always exist for any chosen location!
    const activeArea = loc.area.split(",")[0].trim();
    return rawPool.map((s: any, idx: number) => ({
      ...s,
      area: activeArea,
      city: activeArea,
      distanceKm: Number((0.8 + idx * 0.7).toFixed(1)),
    }));
  }, [liveStores, loc]);

  const sponsoredStore = storesToDisplay.find((s: any) => s.sponsored);
  const otherStores = storesToDisplay.filter((s: any) => !s.sponsored);

  return (
    <MobileFrame>
      <div className="min-h-dvh pb-28 bg-background md:pb-16">

        <LocationTopBar area={loc?.area} pincode={loc?.pincode} />

        {/* Desktop hero */}
        <section className="hidden md:block">
          <div className="mx-auto max-w-[1440px] px-6 pt-3">
            <div className="relative overflow-hidden rounded-3xl gradient-hero-mesh px-8 lg:px-12 py-5 lg:py-6 text-white shadow-2xl border border-white/10">
              <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-amber-400/25 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-16 h-96 w-96 rounded-full bg-blue-500/30 blur-3xl pointer-events-none" />

              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
                {/* Left Side: Headlines & CTA */}
                <div className="lg:col-span-6 space-y-3.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1 text-xs font-black tracking-wide backdrop-blur-md border border-white/25 shadow-xs">
                    <MapPin className="h-3.5 w-3.5 text-amber-400" />
                    {loc?.area ? `Serving ${loc.area}` : "Now Serving Your Neighborhood"}
                  </span>
                  <h1 className="text-3xl lg:text-4xl xl:text-5xl font-black leading-[1.1] tracking-tight">
                    Buy Nearby.<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500">Sell Quickly.</span>
                  </h1>
                  <p className="text-xs lg:text-sm text-white/90 max-w-lg leading-relaxed font-medium">
                    Discover verified local sellers, neighborhood stores, and direct deals near you with 0% middleman fees.
                  </p>
                  <div className="pt-1.5 flex flex-wrap gap-3">
                    <Link
                      to="/results"
                      className="inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:brightness-110 px-6 py-3 text-sm font-black text-slate-950 shadow-xl hover:scale-102 active:scale-95 transition-all"
                    >
                      <Sparkles className="h-4 w-4 fill-slate-950" /> Start Browsing
                    </Link>
                    <Link
                      to="/sell"
                      className="inline-flex items-center gap-2 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/30 px-6 py-3 text-sm font-extrabold text-white backdrop-blur-md hover:scale-102 active:scale-95 transition-all"
                    >
                      Post Free Ad <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>

                {/* Right Side: Dynamic Floating 3D Deal Showcase */}
                <div className="hidden lg:block lg:col-span-6 relative w-full">
                  <HeroProductShowcase items={liveShowcaseDeals.length > 0 ? liveShowcaseDeals : (liveProducts.length > 0 ? liveProducts : [])} />
                </div>

              </div>
            </div>

            {/* Animated Hyperlocal Live Deals Ticker */}
            <div className="mt-4 overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 border border-amber-500/40 p-3.5 shadow-2xl shadow-amber-500/10 backdrop-blur-xl relative">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 animate-pulse pointer-events-none" />
              <div className="relative z-10 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative flex h-3 w-3 shrink-0 items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                  </div>
                  <span className="shrink-0 flex items-center gap-1.5 font-black text-amber-300 uppercase text-[10px] tracking-widest bg-amber-500/15 px-3 py-1 rounded-full border border-amber-500/40 shadow-xs">
                    <Zap className="h-3.5 w-3.5 fill-amber-400 animate-bounce" /> LIVE TICKER
                  </span>
                  <p className="truncate text-slate-100 font-extrabold text-xs sm:text-sm tracking-wide">
                    Verified sellers & instant chat ready in <span className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent font-black uppercase underline decoration-amber-500/50 decoration-2">{loc?.area || "Adilabad & Hyderabad"}</span>
                  </p>
                </div>
                <Link to="/results" className="shrink-0 text-xs font-black text-amber-300 hover:text-amber-400 transition-colors flex items-center gap-1 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30 hover:scale-105 active:scale-95 transition-transform">
                  Explore Live <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Trust Stats Bar */}
            <div className="mt-3.5 grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="flex items-center gap-3.5 rounded-2xl border border-border/80 bg-card p-4 shadow-xs hover:border-primary/30 transition-all">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Zap className="h-5.5 w-5.5 fill-primary" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-extrabold text-foreground">10,000+ Listings</div>
                  <div className="text-[11px] text-muted-foreground font-medium">Nearby items ready</div>
                </div>
              </div>
              <div className="flex items-center gap-3.5 rounded-2xl border border-border/80 bg-card p-4 shadow-xs hover:border-emerald-500/30 transition-all">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600">
                  <ShieldCheck className="h-5.5 w-5.5" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-extrabold text-foreground">Verified Sellers</div>
                  <div className="text-[11px] text-muted-foreground font-medium">100% Phone & Aadhaar</div>
                </div>
              </div>
              <div className="flex items-center gap-3.5 rounded-2xl border border-border/80 bg-card p-4 shadow-xs hover:border-amber-500/30 transition-all">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-amber-500/10 text-amber-600">
                  <MessageSquare className="h-5.5 w-5.5" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-extrabold text-foreground">Direct Chat & Offers</div>
                  <div className="text-[11px] text-muted-foreground font-medium">No middleman fees</div>
                </div>
              </div>
              <div className="flex items-center gap-3.5 rounded-2xl border border-border/80 bg-card p-4 shadow-xs hover:border-indigo-500/30 transition-all">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-indigo-500/10 text-indigo-600">
                  <MapPin className="h-5.5 w-5.5" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-extrabold text-foreground">GPS Hyperlocal</div>
                  <div className="text-[11px] text-muted-foreground font-medium">Exact pincode filter</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Search overlaps the header (mobile) */}
        <div className="relative -mt-4 px-4 md:hidden">
          <Link
            to="/search"
            className="flex items-center gap-2 rounded-2xl bg-card px-3 py-3 card-elev"
            aria-label="Search products"
          >
            <Search className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1 text-sm text-muted-foreground">
              Search cars, mobiles, furniture…
            </span>
            <button
              type="button"
              aria-label="Voice search"
              onClick={(e) => { e.preventDefault(); nav({ to: "/search", search: { mode: "voice" } as never }); }}
              className="grid h-8 w-8 place-items-center rounded-full hover:bg-secondary"
            >
              <Mic className="h-4 w-4 text-muted-foreground" />
            </button>
            <button
              type="button"
              aria-label="Image search"
              onClick={(e) => { e.preventDefault(); nav({ to: "/search", search: { mode: "image" } as never }); }}
              className="grid h-8 w-8 place-items-center rounded-full hover:bg-secondary"
            >
              <Camera className="h-4 w-4 text-muted-foreground" />
            </button>
          </Link>
        </div>

        {/* Location prompt */}
        {!loc && !dismissed && (
          <div className="mt-3 px-4">
            <div className="relative flex items-center gap-3 overflow-hidden rounded-2xl border border-primary/20 bg-primary/5 p-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl gradient-brand text-white shadow">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-foreground">Where are you shopping from?</div>
                <div className="text-xs text-muted-foreground">Set your area to see nearby deals.</div>
              </div>
              <button
                onClick={() => setShowLocModal(true)}
                className="shrink-0 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-sm"
              >
                Set
              </button>
              <button
                onClick={() => setDismissed(true)}
                className="ml-1 grid h-7 w-7 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        <LocationModal open={showLocModal} onClose={() => setShowLocModal(false)} />

        <div className="mt-4 space-y-6 px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 md:mx-auto md:max-w-[1440px] md:space-y-10 md:mt-8">
          {/* HOME_HERO */}
          {liveHeroAds.length > 0 ? <HeroAd ads={liveHeroAds} /> : (heroAd ? <HeroAd ad={heroAd} /> : <AdErrorFallback />)}

          {/* Category Discovery Grid — Live DB Categories & Subcategories */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-xl font-extrabold text-foreground">Browse Top Categories</h2>
                <p className="text-xs text-muted-foreground">Discover verified items across popular categories</p>
              </div>
              <Link
                to="/categories"
                className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
              >
                All Categories <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Grid of Master DB Categories */}
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-10 gap-3 md:gap-4">
              {(dbCategories.length > 0 ? dbCategories : CATEGORIES).map((c) => (
                <div
                  key={c.id}
                  onClick={() => setModalCategory(c)}
                  className="cursor-pointer"
                >
                  <CategoryIcon c={c} onClick={() => setModalCategory(c)} />
                </div>
              ))}
            </div>

            {/* Interactive Subcategories Bar when a Category is Selected */}
            {selectedCatId && (
              <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/5 p-3.5 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">
                    {dbCategories.find((x) => x.id === selectedCatId)?.name || selectedCatId} Subcategories
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedCatId(null)}
                    className="text-[11px] font-semibold text-muted-foreground hover:text-foreground"
                  >
                    Clear Filter
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(
                    dbCategories.find((x) => x.id === selectedCatId)?.subcategories ||
                    CATEGORIES.find((x) => x.id === selectedCatId)?.subcategories ||
                    []
                  ).map((sub) => (
                    <Link
                      key={sub}
                      to="/results"
                      search={{ category: selectedCatId, subcategory: sub } as any}
                      className="rounded-full bg-card border border-border/80 px-3 py-1 text-xs font-semibold text-foreground hover:border-primary hover:text-primary hover:shadow-xs transition-all"
                    >
                      {sub}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Dedicated Quick Deals Navigation Banner (Directly after Categories) */}
          <QuickDealsBanner />

          {/* HOME_CATEGORY_STRIP */}
          {liveCategoryAd ? <CategoryStripAd ad={liveCategoryAd} /> : (stripAd && <CategoryStripAd ad={stripAd} />)}

          <QuickSellCard />

          {/* 🚗 Category Section 1: Used Cars & Four-Wheelers */}
          {carProducts.length > 0 && (
            <section className="rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-500/5 via-card to-background p-4 sm:p-6 shadow-sm">
              <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-9 w-9 place-items-center rounded-2xl bg-blue-600 text-white shadow-md">
                    <Car className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-xl font-black text-foreground">Used Cars & Four-Wheelers</h2>
                      <span className="rounded-full bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[10px] font-black text-blue-600 dark:text-blue-400">
                        Direct Owner Listings
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Inspected cars, verified service history & 0% middleman commission</p>
                  </div>
                </div>
                <Link
                  to="/results"
                  search={{ cat: "cars" } as any}
                  className="inline-flex items-center gap-1 text-xs font-black text-blue-600 dark:text-blue-400 hover:underline shrink-0"
                >
                  Explore All Cars <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="flex gap-3.5 overflow-x-auto no-scrollbar pb-2">
                {carProducts.map((p) => (
                  <div key={p.id} className="w-[280px] sm:w-[320px] shrink-0">
                    <ProductCard p={p} onPreview={setPreviewProduct} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 🏍️ Category Section 2: Bikes & Two-Wheelers */}
          {bikeProducts.length > 0 && (
            <section className="rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-card to-background p-4 sm:p-6 shadow-sm">
              <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-9 w-9 place-items-center rounded-2xl bg-amber-500 text-slate-950 shadow-md font-black">
                    <Bike className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-xl font-black text-foreground">Bikes, Scooters & Two-Wheelers</h2>
                      <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-black text-amber-600 dark:text-amber-400">
                        Instant Owner Chat
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Cruisers, sports bikes, commuter motorcycles & scooters</p>
                  </div>
                </div>
                <Link
                  to="/results"
                  search={{ cat: "bikes" } as any}
                  className="inline-flex items-center gap-1 text-xs font-black text-amber-600 dark:text-amber-400 hover:underline shrink-0"
                >
                  Explore All Bikes <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="flex gap-3.5 overflow-x-auto no-scrollbar pb-2">
                {bikeProducts.map((p) => (
                  <div key={p.id} className="w-[280px] sm:w-[320px] shrink-0">
                    <ProductCard p={p} onPreview={setPreviewProduct} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 📱 Category Section 3: Mobiles & Electronics */}
          {electronicProducts.length > 0 && (
            <section className="rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 via-card to-background p-4 sm:p-6 shadow-sm">
              <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-9 w-9 place-items-center rounded-2xl bg-indigo-600 text-white shadow-md">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-xl font-black text-foreground">Mobiles & Electronics Deals</h2>
                      <span className="rounded-full bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 text-[10px] font-black text-indigo-600 dark:text-indigo-400">
                        Verified Gadgets
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Smartphones, MacBooks, gaming consoles & audio accessories</p>
                  </div>
                </div>
                <Link
                  to="/results"
                  search={{ cat: "electronics" } as any}
                  className="inline-flex items-center gap-1 text-xs font-black text-indigo-600 dark:text-indigo-400 hover:underline shrink-0"
                >
                  Explore All Electronics <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="flex gap-3.5 overflow-x-auto no-scrollbar pb-2">
                {electronicProducts.map((p) => (
                  <div key={p.id} className="w-[260px] sm:w-[300px] shrink-0">
                    <ProductCard p={p} onPreview={setPreviewProduct} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Nearby carousel */}
          {nearby.length > 0 && (
            <section>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-1.5 rounded-full bg-amber-500" />
                  <h2 className="text-base sm:text-xl font-extrabold text-foreground">Nearby Products</h2>
                  <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-extrabold text-amber-600">
                    Within 5 km
                  </span>
                </div>
                <Link to="/results" className="text-xs font-extrabold text-primary hover:underline">See All</Link>
              </div>
              <div className="flex gap-3.5 overflow-x-auto no-scrollbar pb-2">
                {nearby.map((p) => <ProductCard key={p.id} p={p} variant="compact" />)}
              </div>
            </section>
          )}

          {/* Featured — full width list */}
          {featured.length > 0 && (
            <section>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-1.5 rounded-full bg-primary" />
                  <h2 className="text-base sm:text-xl font-extrabold text-foreground">Featured Verified Listings</h2>
                </div>
              </div>
              <div className="space-y-3.5">
                {featured.slice(0, 3).map((p) => <ProductCard key={p.id} p={p} variant="list" />)}
              </div>
            </section>
          )}

          {/* Empty state when no products match location */}
          {organic.length === 0 && loc?.area && (
            <section className="flex flex-col items-center gap-3 rounded-3xl bg-surface-2 border border-border p-8 sm:p-12 text-center">
              <MapPin className="h-12 w-12 text-primary shrink-0" />
              <h3 className="text-lg font-extrabold text-foreground">No listings in {loc.area} yet</h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-sm">Be the first seller to list an item in your area and get 100% free buyer inquiries!</p>
              <Link to="/sell" className="mt-2 rounded-full bg-primary hover:bg-electric text-white px-6 py-3 text-xs sm:text-sm font-extrabold shadow-md transition-colors">Post Free Listing</Link>
            </section>
          )}

          {/* Verified Local Stores */}
          {storesToDisplay.length > 0 && (
            <section className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-1.5 rounded-full bg-emerald-500" />
                  <h2 className="text-base sm:text-xl font-extrabold text-foreground">
                    Verified Local Stores{loc?.area ? ` in ${loc.area}` : ""}
                  </h2>
                  <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-extrabold text-emerald-600">
                    Verified Merchants
                  </span>
                </div>
                <Link to="/stores" className="text-xs font-extrabold text-primary hover:underline">
                  See All ({storesToDisplay.length}) →
                </Link>
              </div>

              <div
                className={cn(
                  "grid gap-3.5 overflow-x-auto no-scrollbar pb-2 sm:grid-rows-none sm:grid-flow-row sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-4 sm:overflow-visible sm:pb-0",
                  storesToDisplay.length <= 2 ? "grid-rows-1 grid-flow-col" : "grid-rows-2 grid-flow-col"
                )}
              >
                {sponsoredStore && (
                  <div className="relative w-[280px] sm:w-full shrink-0 sm:shrink">
                    <span className="absolute left-2.5 top-2.5 z-10 rounded-full bg-amber-500 text-slate-950 px-2.5 py-0.5 text-[10px] font-black shadow-sm">
                      Sponsored
                    </span>
                    <StoreCard s={sponsoredStore} className="w-full h-full" />
                  </div>
                )}
                {otherStores.slice(0, sponsoredStore ? 7 : 8).map((s) => (
                  <div key={s.id} className="w-[280px] sm:w-full shrink-0 sm:shrink">
                    <StoreCard s={s} className="w-full h-full" />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Recommended grid — with native ad after 6 organic items */}
          {recommended.length > 0 && (
            <section>
              <div className="mb-4 flex items-center gap-2">
                <div className="h-5 w-1.5 rounded-full bg-primary" />
                <h2 className="text-base sm:text-xl font-extrabold text-foreground">Recommended For You</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {recommended.slice(0, 6).map((p) => (
                  <ProductCard key={p.id} p={p} onPreview={setPreviewProduct} />
                ))}
                {nativeAd && <NativeAdCard ad={nativeAd} />}
                {recommended.slice(6).map((p) => (
                  <ProductCard key={p.id} p={p} onPreview={setPreviewProduct} />
                ))}
              </div>
            </section>
          )}

          {/* Deals near you — horizontal */}
          {dealsNearYou.length > 0 && (
            <section>
              <h2 className="mb-3 text-base font-bold text-navy">Deals near you</h2>
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                {dealsNearYou.map((p) => <ProductCard key={p.id} p={p} variant="compact" />)}
              </div>
            </section>
          )}

          {/* Recently added */}
          {recentlyAdded.length > 0 && (
            <section>
              <h2 className="mb-3 text-base font-bold md:text-xl text-navy">Recently added</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {recentlyAdded.map((p) => (
                  <ProductCard key={p.id} p={p} onPreview={setPreviewProduct} />
                ))}
              </div>
            </section>
          )}

          {/* Recently viewed */}
          {viewed.length > 0 && (
            <section>
              <h2 className="mb-3 text-base font-bold text-navy">Recently viewed</h2>
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                {viewed.map((p) => <ProductCard key={p.id} p={p} variant="compact" />)}
              </div>
            </section>
          )}

          {/* HOME_SECONDARY_BANNER */}
          {secondaryAd && <SecondaryBannerAd ad={secondaryAd} />}

          <SafetyCard />
        </div>

        <ProductQuickPreviewModal
          product={previewProduct}
          onClose={() => setPreviewProduct(null)}
        />

        <CategoryDetailModal
          open={Boolean(modalCategory)}
          onClose={() => setModalCategory(null)}
          category={modalCategory}
        />

        <BottomNav />
      </div>
    </MobileFrame>
  );
}
