import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, useCallback } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { StoreCard } from "@/components/omeetso/StoreCard";
import { EmptyState } from "@/components/omeetso/EmptyState";
import { LocationModal } from "@/components/omeetso/LocationModal";
import { getPublicStoresApi } from "@/api/stores.api";
import { serveAdsApi } from "@/api/adCampaigns.api";
import {
  Loader2, RefreshCw, Megaphone, Search, MapPin, Store as StoreIcon,
  ShieldCheck, Sparkles, Plus, ChevronRight, SlidersHorizontal
} from "lucide-react";

export const Route = createFileRoute("/stores")({
  head: () => ({
    meta: [
      { title: "Verified Local Stores & Showrooms — Omeetso" },
      { name: "description", content: "Explore verified local stores, showrooms, and local business catalogues nearby in Hyderabad." }
    ]
  }),
  component: Stores,
});

function Stores() {
  const [stores, setStores] = useState<any[]>([]);
  const [storeBannerAds, setStoreBannerAds] = useState<any[]>([]);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [locArea, setLocArea] = useState<string>("");
  const [locPincode, setLocPincode] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showLocationModal, setShowLocationModal] = useState<boolean>(false);

  const fetchStores = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = localStorage.getItem("omeetso_location") || localStorage.getItem("omeetso_selected_location");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.area) setLocArea(parsed.area);
        if (parsed.pincode) setLocPincode(parsed.pincode);
      }
    } catch {}

    serveAdsApi("STORE_BANNER").then((res) => {
      if (res.success && res.data && res.data.length > 0) {
        setStoreBannerAds(res.data);
      }
    });

    const res = await getPublicStoresApi();
    setLoading(false);

    if (res.success && Array.isArray(res.data)) {
      const approved = res.data.filter((item: any) => {
        const st = (item.status || "").toUpperCase();
        return st === "APPROVED" || st === "ACTIVE";
      });
      const mapped = approved.map((item: any) => ({
        id: item.id || item._id,
        name: item.name,
        cover: item.cover || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800",
        logo: item.logo || "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_200,h_200,c_fill/avatar_cxx1sy.png",
        category: item.primaryCategory || "Retail Store",
        area: item.area || "Madhapur",
        pincode: item.pincode || "500081",
        city: item.city || "Hyderabad",
        distanceKm: 1.2,
        rating: item.rating || 0,
        reviews: item.reviewCount || 0,
        open: true,
        verified: true,
        sponsored: false
      }));
      setStores(mapped);
    } else {
      setError(res.error || "Failed to load local stores");
    }
  }, []);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  // Auto-rotate sponsored banner
  useEffect(() => {
    if (storeBannerAds.length <= 1) return;
    const timer = setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % storeBannerAds.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [storeBannerAds.length]);

  const activeStoreAd = storeBannerAds[bannerIndex] || storeBannerAds[0];

  const categories = [
    { id: "all", label: "All Categories", count: stores.length },
    { id: "mobiles", label: "Mobiles & Tech", count: stores.filter((s) => s.category.toLowerCase().includes("mobile") || s.category.toLowerCase().includes("tech")).length },
    { id: "electronics", label: "Electronics", count: stores.filter((s) => s.category.toLowerCase().includes("electronic")).length },
    { id: "automobiles", label: "Cars & Showrooms", count: stores.filter((s) => s.category.toLowerCase().includes("auto") || s.category.toLowerCase().includes("car")).length },
    { id: "furniture", label: "Furniture & Home", count: stores.filter((s) => s.category.toLowerCase().includes("furniture") || s.category.toLowerCase().includes("home")).length },
    { id: "fashion", label: "Fashion & Apparel", count: stores.filter((s) => s.category.toLowerCase().includes("fashion") || s.category.toLowerCase().includes("apparel")).length },
  ];

  const filteredStores = useMemo(() => {
    let result = stores;

    // Filter by location if match exists
    if (locArea || locPincode) {
      const matched = result.filter((s: any) => {
        const areaMatch = locArea && s.area && s.area.toLowerCase().includes(locArea.toLowerCase());
        const pinMatch = locPincode && s.pincode && String(s.pincode) === String(locPincode);
        return areaMatch || pinMatch;
      });
      if (matched.length > 0) {
        const remaining = result.filter((s: any) => !matched.some((m: any) => m.id === s.id));
        result = [...matched, ...remaining];
      }
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((s: any) =>
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.area.toLowerCase().includes(q) ||
        s.pincode.includes(q)
      );
    }

    // Filter by selected category
    if (selectedCategory !== "all") {
      result = result.filter((s: any) =>
        s.category.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    return result;
  }, [stores, locArea, locPincode, searchQuery, selectedCategory]);

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background text-foreground font-sans pb-24 md:pb-16">
        {/* Desktop Hero Header */}
        <div className="border-b border-border bg-gradient-to-r from-navy via-slate-900 to-indigo-950 text-white">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-6 md:py-8">
            <nav className="flex items-center gap-2 text-xs font-semibold text-white/70">
              <Link to="/home" className="hover:text-white transition-colors">Home</Link>
              <span>/</span>
              <span className="text-white font-bold">Stores Directory</span>
            </nav>

            <div className="mt-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 border border-amber-500/30 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-amber-400">
                  <ShieldCheck className="h-3.5 w-3.5" /> 100% Verified Local Businesses
                </div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white leading-tight">
                  Verified Local Showrooms & Stores {locArea ? `in ${locArea}` : "Near You"}
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
                  Connect directly with verified local business owners, authorized showrooms, and local merchants. Zero middleman fees.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <Link
                  to="/store/create"
                  className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 px-5 py-3 text-xs sm:text-sm font-black shadow-lg hover:scale-105 active:scale-95 transition-all"
                >
                  <Plus className="h-4 w-4 stroke-[3]" /> Register Business Store
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area (Dual Column on Desktop) */}
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-6 md:py-10">
          <div className="grid grid-cols-12 gap-6 lg:gap-8 items-start">

            {/* Left Sidebar (Desktop Filters & Merchant Callout) */}
            <aside className="col-span-12 lg:col-span-3 space-y-6">
              {/* Search Widget */}
              <div className="rounded-3xl border border-border bg-card p-5 shadow-xs space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Search className="h-4 w-4 text-primary" /> Search Stores
                </h3>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search store name or area..."
                    className="w-full h-11 rounded-2xl border border-border bg-background pl-10 pr-4 text-xs font-bold text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>

              {/* Active Location Widget */}
              <div className="rounded-3xl border border-border bg-card p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-primary" /> Active Location
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowLocationModal(true)}
                    className="text-[11px] font-extrabold text-primary hover:underline"
                  >
                    Change
                  </button>
                </div>
                <div
                  onClick={() => setShowLocationModal(true)}
                  className="cursor-pointer flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-3 hover:bg-primary/10 transition-colors"
                >
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground font-bold">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-black text-foreground">
                      {locArea || "All Locations"}
                    </p>
                    <p className="text-[11px] font-semibold text-muted-foreground">
                      {locPincode ? `Pincode: ${locPincode}` : "Select area / pincode"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Desktop Categories Filter List */}
              <div className="hidden lg:block rounded-3xl border border-border bg-card p-5 shadow-xs space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <SlidersHorizontal className="h-4 w-4 text-primary" /> Store Categories
                </h3>
                <div className="space-y-1">
                  {categories.map((c) => {
                    const active = selectedCategory === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedCategory(c.id)}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all text-left ${
                          active
                            ? "bg-primary text-primary-foreground font-black shadow-xs"
                            : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                        }`}
                      >
                        <span>{c.label}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${active ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"}`}>
                          {c.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Merchant Register Banner */}
              <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-5 border border-slate-800 shadow-lg space-y-3">
                <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs">
                  <StoreIcon className="h-4 w-4" /> Open Your Store
                </div>
                <h4 className="text-sm font-black leading-snug">Are you a merchant or showroom owner?</h4>
                <p className="text-xs text-slate-300 font-normal leading-relaxed">
                  List your products, upload cover banner, and connect with local buyers directly.
                </p>
                <Link
                  to="/store/create"
                  className="block text-center w-full py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all"
                >
                  Create Store Profile →
                </Link>
              </div>
            </aside>

            {/* Right Main Panel (Stores Grid & Banners) */}
            <main className="col-span-12 lg:col-span-9 space-y-6">

              {/* Mobile Horizontal Category Pills */}
              <div className="lg:hidden flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {categories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCategory(c.id)}
                    className={`rounded-2xl px-4 py-2 text-xs font-extrabold whitespace-nowrap transition-all border ${
                      selectedCategory === c.id
                        ? "border-primary bg-primary text-white shadow-xs"
                        : "border-border bg-card text-foreground hover:bg-surface-2"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              {/* Sponsored Takeover Banner */}
              {activeStoreAd && (
                <Link
                  to={activeStoreAd.creative?.destinationUrl || "/"}
                  className="group relative block h-44 sm:h-52 w-full overflow-hidden rounded-3xl border border-amber-500/40 shadow-md transition-all hover:shadow-xl active:scale-[0.99]"
                >
                  {activeStoreAd.creative?.imageUrl ? (
                    <img
                      key={activeStoreAd.servedAdId || bannerIndex}
                      src={activeStoreAd.creative.imageUrl}
                      alt={activeStoreAd.creative.title}
                      className="h-full w-full object-cover transition-opacity duration-700 animate-in fade-in-50 group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-950" />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 p-5 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-3 py-1 text-[10px] font-black text-slate-950 uppercase tracking-wider shadow">
                          <Megaphone className="h-3.5 w-3.5" /> Sponsored Store Takeover
                        </span>
                        {storeBannerAds.length > 1 && (
                          <span className="rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-black text-amber-300 backdrop-blur-sm border border-amber-500/30">
                            {bannerIndex + 1}/{storeBannerAds.length} • 5s
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-end justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <h3 className="line-clamp-1 text-lg sm:text-xl font-black text-white drop-shadow-sm">
                          {activeStoreAd.creative?.title || "Featured Store Deal"}
                        </h3>
                        <p className="text-xs font-semibold text-amber-200/90 drop-shadow mt-0.5">
                          Tap to explore exclusive products & store offers
                        </p>
                      </div>
                      <span className="rounded-2xl bg-amber-500 px-4 py-2.5 text-xs font-black text-slate-950 shadow group-hover:bg-amber-400 transition-colors shrink-0">
                        View Deal →
                      </span>
                    </div>
                  </div>
                </Link>
              )}

              {/* Directory Bar */}
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-foreground">
                    {locArea ? `Stores in ${locArea}` : "All Verified Stores"}
                  </h2>
                  <p className="text-xs font-semibold text-muted-foreground">
                    Showing {filteredStores.length} verified merchant storefronts
                  </p>
                </div>

                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-xs font-extrabold text-primary hover:underline"
                  >
                    Clear Search
                  </button>
                )}
              </div>

              {/* Stores Responsive Grid (1 col on phone, 2 cols on tablet, 3 cols on desktop) */}
              {loading ? (
                <div className="p-16 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-3 rounded-3xl border border-border bg-card">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="font-extrabold">Loading nearby verified stores...</span>
                </div>
              ) : error ? (
                <div className="p-10 text-center bg-destructive/10 border border-destructive/20 rounded-3xl space-y-3">
                  <p className="text-sm font-bold text-destructive">{error}</p>
                  <button
                    onClick={fetchStores}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-2xl"
                  >
                    <RefreshCw className="h-4 w-4" /> Retry Loading Stores
                  </button>
                </div>
              ) : filteredStores.length === 0 ? (
                <EmptyState
                  title="No local stores found"
                  body="No approved stores matched your search or category filter. Try clearing filters or register a store."
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filteredStores.map((s) => (
                    <StoreCard key={s.id} s={s} />
                  ))}
                </div>
              )}

            </main>
          </div>
        </div>

        <LocationModal
          open={showLocationModal}
          onClose={() => setShowLocationModal(false)}
          onSelect={(loc) => {
            setLocArea(loc.area);
            setLocPincode(loc.pincode);
            setShowLocationModal(false);
          }}
        />
      </div>
    </MobileFrame>
  );
}
