import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useEffect, useCallback } from "react";
import {
  ArrowLeft, Search, Loader2, RefreshCw, SlidersHorizontal,
  ArrowDownUp, LayoutGrid, List as ListIcon, MapPin, BookmarkPlus, X
} from "lucide-react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { ProductCard } from "@/components/omeetso/ProductCard";
import { StoreCard } from "@/components/omeetso/StoreCard";
import { SortSheet } from "@/components/omeetso/SortSheet";
import { FilterChip } from "@/components/omeetso/FilterChip";
import { HeroAd } from "@/components/omeetso/AdBanner";
import { SafetyCard } from "@/components/omeetso/SafetyCard";
import { EmptyState } from "@/components/omeetso/EmptyState";
import { serveAdsApi } from "@/api/adCampaigns.api";
import { getPublicListingsApi } from "@/api/listings.api";
import { getPublicStoresApi } from "@/api/stores.api";
import { listListings } from "@/lib/listings";
import {
  CATEGORIES, SUBCATEGORIES, SORT_OPTIONS, getCategory, type Product
} from "@/lib/mock";

type S = {
  q?: string;
  sub?: string;
  cond?: string;
  sort?: string;
  view?: "grid" | "list";
  verified?: string;
  minP?: string;
  maxP?: string;
  quickSale?: string;
  hasVideo?: string;
};

export const Route = createFileRoute("/category/$id")({
  validateSearch: (s: Record<string, unknown>): S => ({
    q: typeof s.q === "string" ? s.q : undefined,
    sub: typeof s.sub === "string" ? s.sub : undefined,
    cond: typeof s.cond === "string" ? s.cond : undefined,
    sort: typeof s.sort === "string" ? s.sort : undefined,
    view: s.view === "list" ? "list" : "grid",
    verified: typeof s.verified === "string" ? s.verified : undefined,
    minP: typeof s.minP === "string" ? s.minP : undefined,
    maxP: typeof s.maxP === "string" ? s.maxP : undefined,
    quickSale: typeof s.quickSale === "string" ? s.quickSale : undefined,
    hasVideo: typeof s.hasVideo === "string" ? s.hasVideo : undefined,
  }),
  loader: ({ params }) => {
    const c = getCategory(params.id);
    if (!c) throw notFound();
    return { category: c };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.category.name} near you · Omeetso` },
          { name: "description", content: `Browse ${loaderData.category.name.toLowerCase()} listings from verified local sellers on Omeetso.` },
          { property: "og:title", content: `${loaderData.category.name} · Omeetso` },
          { property: "og:description", content: `Discover ${loaderData.category.name.toLowerCase()} near you.` },
        ]
      : [{ title: "Category · Omeetso" }],
  }),
  component: CategoryPage,
  notFoundComponent: NotFound,
});

const CONDITIONS = [
  { id: "new", label: "New / Sealed" },
  { id: "like_new", label: "Like New" },
  { id: "excellent", label: "Excellent" },
  { id: "good", label: "Good" },
  { id: "fair", label: "Fair" },
];

function CategoryPage() {
  const { category } = Route.useLoaderData();
  const nav = useNavigate({ from: "/category/$id" });
  const search = Route.useSearch();
  const [sortOpen, setSortOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [liveCatAd, setLiveCatAd] = useState<any | null>(null);
  const [liveSponsoredAd, setLiveSponsoredAd] = useState<any | null>(null);
  const [liveProducts, setLiveProducts] = useState<any[]>([]);
  const [liveStores, setLiveStores] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(search.q ?? "");

  const [minPInput, setMinPInput] = useState(search.minP ?? "");
  const [maxPInput, setMaxPInput] = useState(search.maxP ?? "");

  useEffect(() => {
    if (category.id.toLowerCase() === "jobs") {
      nav({ to: "/jobs", replace: true } as never);
    }
  }, [category.id, nav]);

  useEffect(() => {
    setSearchInput(search.q ?? "");
    setMinPInput(search.minP ?? "");
    setMaxPInput(search.maxP ?? "");
  }, [search.q, search.minP, search.maxP]);

  const subs = SUBCATEGORIES[category.id.toLowerCase()] ?? [];

  const activeLoc = useMemo(() => {
    try {
      const raw = typeof window !== "undefined" ? (localStorage.getItem("omeetso_location") || localStorage.getItem("omeetso_selected_location")) : null;
      if (raw) return JSON.parse(raw);
    } catch { /* ignore */ }
    return null;
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    serveAdsApi("CATEGORY_HEADER").then((res) => {
      if (res.success && res.data && res.data.length > 0) {
        const topAd = res.data[0];
        setLiveCatAd({
          id: topAd.servedAdId,
          campaignId: topAd.campaignId,
          placement: topAd.placement,
          headline: topAd.creative?.title || category.name,
          title: topAd.creative?.title || category.name,
          body: topAd.label || "Sponsored Category Partner",
          subtitle: topAd.label || "Sponsored Category Partner",
          cta: "Shop Now",
          ctaText: "Shop Now",
          destinationUrl: topAd.creative?.destinationUrl || "/results",
          ctaLink: topAd.creative?.destinationUrl || "/results",
          image: topAd.creative?.imageUrl,
          imageUrl: topAd.creative?.imageUrl,
          advertiser: "Omeetso Partner"
        });
      }
    });

    serveAdsApi("SEARCH_TOP").then((res) => {
      if (res.success && res.data && res.data.length > 0) {
        const topAd = res.data[0];
        setLiveSponsoredAd({
          id: topAd.listingId || topAd.campaignId,
          title: topAd.creative.title,
          price: (topAd.creative.priceInPaise || 0) / 100,
          images: [topAd.creative.imageUrl],
          area: "Kukatpally",
          city: "Hyderabad",
          sponsored: true,
          verified: true,
          condition: "Like New",
          postedTime: "Sponsored",
          sellerName: "Omeetso Verified Partner"
        });
      }
    });

    const [lRes, sRes] = await Promise.all([
      getPublicListingsApi({ search: category.name }),
      getPublicStoresApi()
    ]);

    setLoading(false);

    if (lRes.success && Array.isArray(lRes.data)) {
      const targetCat = category.id.toLowerCase();
      const targetName = category.name.toLowerCase();

      const matchingListings = lRes.data.filter((item: any) => {
        const cId = (item.categoryId || item.category || "").toLowerCase();
        return cId === targetCat || cId.includes(targetCat) || targetName.includes(cId);
      });

      const mappedP = matchingListings.map((item: any) => ({
        id: item.id || item._id,
        title: item.title,
        price: item.priceInPaise ? Math.round(item.priceInPaise / 100) : item.price || 0,
        priceInPaise: item.priceInPaise,
        image: item.images?.[0] || item.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
        images: item.images,
        category: (item.categoryId || item.category || category.id).toLowerCase(),
        subcategory: item.subcategoryId || item.subcategory || "General",
        condition: item.condition || "good",
        area: item.area || item.city || "Madhapur",
        distanceKm: 1.5,
        postedAgo: "Recently",
        verified: true,
        sellerId: item.sellerId?._id || item.sellerId || "seller_1",
        method: item.method,
        sponsored: false
      }));
      setLiveProducts(mappedP);
    }

    if (sRes.success && Array.isArray(sRes.data)) {
      const targetCat = category.id.toLowerCase();
      const targetName = category.name.toLowerCase();

      const matchingStores = sRes.data.filter((item: any) => {
        const c = (item.primaryCategory || item.category || "").toLowerCase();
        return c === targetCat || c.includes(targetCat) || targetName.includes(c);
      });

      const mappedS = matchingStores.map((item: any) => ({
        id: item.id || item._id,
        name: item.name,
        cover: item.cover || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800",
        logo: item.logo || "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_200,h_200,c_fill/avatar_cxx1sy.png",
        category: item.primaryCategory || category.name,
        area: item.area || "Madhapur",
        pincode: item.pincode || "500081",
        distanceKm: 1.2,
        rating: item.rating || 0,
        reviews: item.reviewCount || 0,
        open: true,
        verified: true,
        sponsored: false
      }));
      setLiveStores(mappedS);
    }
  }, [category.name, category.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const productList = useMemo(() => {
    const localItems = listListings().filter(
      (l) => (l.category || "").toLowerCase() === category.id.toLowerCase() ||
             (l.category || "").toLowerCase().includes(category.name.toLowerCase())
    ).map((item) => ({
      id: item.id,
      title: item.title,
      price: item.price,
      negotiable: item.negotiable,
      category: item.category,
      subcategory: item.subcategory,
      condition: item.condition || "good",
      area: item.area || "Hitec City",
      distanceKm: 2,
      postedAgo: "Recently",
      image: item.images?.[item.cover || 0] || item.images?.[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
      images: item.images,
      verified: true,
      sellerId: "u_me",
      method: item.method,
      sponsored: false
    }));

    const source = [...liveProducts, ...localItems];
    const uniqueMap = new Map<string, any>();
    source.forEach((item) => {
      if (!uniqueMap.has(item.id)) uniqueMap.set(item.id, item);
    });
    let list: Product[] = Array.from(uniqueMap.values());

    const q = search.q?.toLowerCase() ?? "";
    if (search.sub) list = list.filter((p) => (p.subcategory || "").toLowerCase() === search.sub?.toLowerCase());
    if (search.cond) list = list.filter((p) => (p.condition || "").toLowerCase() === search.cond?.toLowerCase());

    if (q) {
      const qTokens = q.split(/\s+/).filter(Boolean);
      list = list.filter((p) => {
        const titleLower = p.title.toLowerCase();
        const subLower = (p.subcategory || "").toLowerCase();
        const descLower = (p.description || "").toLowerCase();
        const areaLower = (p.area || "").toLowerCase();
        const text = `${titleLower} ${subLower} ${descLower} ${areaLower}`;

        if (text.includes(q)) return true;
        if (qTokens.length > 0 && qTokens.every((t) => text.includes(t))) return true;
        return false;
      });
    }

    if (search.quickSale === "1") {
      list = list.filter((p) =>
        (p as any).method === "quick" ||
        (p as any).quickSale ||
        (p as any).isQuickSell ||
        p.id.startsWith("Q-") ||
        p.id.includes("quick")
      );
    }
    if (search.verified === "1") list = list.filter((p) => p.verified);
    if (search.hasVideo === "1") {
      list = list.filter((p) => Boolean((p as any).video || (p as any).videoUrl));
    }

    const min = search.minP ? Number(search.minP) : undefined;
    const max = search.maxP ? Number(search.maxP) : undefined;
    if (min !== undefined) list = list.filter((p) => p.price >= min);
    if (max !== undefined) list = list.filter((p) => p.price <= max);

    if (activeLoc?.area || activeLoc?.pincode) {
      const targetArea = (activeLoc.area || "").toLowerCase();
      const targetPin = (activeLoc.pincode || "").toLowerCase();
      const areaTerms = targetArea.split(/[,\s]+/).filter(Boolean);

      const isLocal = (p: any) => {
        const pText = `${p.location || ""} ${p.area || ""} ${p.city || ""} ${p.pincode || ""}`.toLowerCase();
        const pinMatch = targetPin && (pText.includes(targetPin) || (p.pincode && p.pincode.toString() === targetPin));
        const areaMatch = areaTerms.some((term: string) => term.length >= 3 && pText.includes(term));
        return pinMatch || areaMatch;
      };

      const localList = list.filter(isLocal);
      if (localList.length > 0) {
        list = localList;
      } else {
        const areaName = activeLoc.area.split(",")[0].trim();
        const pinVal = activeLoc.pincode || "500081";
        list = list.map((p, idx) => ({
          ...p,
          area: areaName,
          city: areaName,
          pincode: pinVal,
          location: `${areaName}, ${pinVal}`,
          distanceKm: Number((0.8 + idx * 0.5).toFixed(1)),
        }));
      }
    }

    switch (search.sort) {
      case "price-low": list = [...list].sort((a, b) => a.price - b.price); break;
      case "price-high": list = [...list].sort((a, b) => b.price - a.price); break;
      case "distance": list = [...list].sort((a, b) => a.distanceKm - b.distanceKm); break;
      case "newest":
      case "updated": list = [...list].reverse(); break;
    }

    return list;
  }, [liveProducts, category.id, category.name, search.q, search.sub, search.cond, search.quickSale, search.verified, search.hasVideo, search.minP, search.maxP, search.sort, activeLoc]);

  const view = search.view ?? "grid";
  const sortLabel = SORT_OPTIONS.find((o) => o.id === (search.sort ?? "relevance"))?.label ?? "Relevance";

  const chips: Array<{ key: keyof S; label: string }> = [];
  if (search.sub) chips.push({ key: "sub", label: `Subcategory: ${search.sub}` });
  if (search.quickSale === "1") chips.push({ key: "quickSale", label: "⚡ Quick Sale Only" });
  if (search.cond) chips.push({ key: "cond", label: `Condition: ${search.cond}` });
  if (search.verified) chips.push({ key: "verified", label: "Verified only" });
  if (search.minP || search.maxP) chips.push({ key: "minP", label: `₹${search.minP ?? 0}–₹${search.maxP ?? "∞"}` });

  const resetAllFilters = () => {
    setSearchInput("");
    setMinPInput("");
    setMaxPInput("");
    nav({ search: { view: search.view } });
  };

  const clearChip = (key: keyof S) => {
    if (key === "minP") {
      setMinPInput("");
      setMaxPInput("");
      nav({ search: (p: S) => ({ ...p, minP: undefined, maxP: undefined }) });
    } else {
      nav({ search: (p: S) => ({ ...p, [key]: undefined }) });
    }
  };

  const applyPricePreset = (min?: number, max?: number) => {
    setMinPInput(min ? String(min) : "");
    setMaxPInput(max ? String(max) : "");
    nav({ search: (p: S) => ({ ...p, minP: min ? String(min) : undefined, maxP: max ? String(max) : undefined }) });
  };

  const handleSearchSubmit = () => {
    nav({ search: (p: S) => ({ ...p, q: searchInput || undefined }) });
  };

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-20 md:pb-16 font-sans">
        {/* Mobile Header */}
        <header className="sticky top-0 z-30 border-b border-border bg-card safe-t md:hidden">
          <div className="flex items-center gap-2 px-3 pt-2 pb-2">
            <button onClick={() => history.back()} className="grid h-10 w-10 place-items-center rounded-full hover:bg-secondary" aria-label="Back">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex-1 flex items-center rounded-2xl bg-secondary px-3 py-1.5 text-sm gap-2">
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSearchSubmit(); }}
                placeholder={`Search in ${category.name}...`}
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              {searchInput && (
                <button onClick={() => { setSearchInput(""); nav({ search: (p: S) => ({ ...p, q: undefined }) }); }}>
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>
            <button
              onClick={() => setSaved((v) => !v)}
              className="grid h-10 w-10 place-items-center rounded-full hover:bg-secondary"
              aria-label={saved ? "Search saved" : "Save search"}
            >
              <BookmarkPlus className={"h-5 w-5 " + (saved ? "fill-yellow-brand text-yellow-brand" : "")} />
            </button>
          </div>
          <div className="flex items-center justify-between px-3 pb-2 text-xs text-muted-foreground">
            <span>
              <span className="font-bold text-foreground">{productList.length}</span> listings in <span className="font-extrabold text-foreground">{category.name}</span>
            </span>
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-indigo-brand" /> {activeLoc?.area || "Madhapur"}</span>
          </div>
          {chips.length > 0 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar px-3 pb-2">
              {chips.map((c) => (
                <FilterChip key={String(c.key)} label={c.label} active onClear={() => clearChip(c.key)} />
              ))}
            </div>
          )}
          {/* Controls Bar */}
          <div className="flex items-center justify-between border-t border-border px-3 py-2">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              <button
                onClick={() => nav({ search: (p: S) => ({ ...p, quickSale: p.quickSale === "1" ? undefined : "1" }) })}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-extrabold transition-all border shrink-0 ${
                  search.quickSale === "1"
                    ? "bg-amber-500 text-slate-950 border-amber-500 shadow-sm"
                    : "bg-card text-foreground border-border"
                }`}
              >
                ⚡ Quick Sale
              </button>
              <button
                onClick={() => nav({ search: (p: S) => ({ ...p, hasVideo: p.hasVideo === "1" ? undefined : "1" }) })}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-extrabold transition-all border shrink-0 ${
                  search.hasVideo === "1"
                    ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                    : "bg-card text-foreground border-border"
                }`}
              >
                🎬 With Video
              </button>
              <button
                onClick={() => nav({ to: "/filters", search: search as never })}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-bold shrink-0"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
              </button>
              <button
                onClick={() => setSortOpen(true)}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-bold shrink-0"
              >
                <ArrowDownUp className="h-3.5 w-3.5" /> {sortLabel}
              </button>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => nav({ search: (p: S) => ({ ...p, view: "grid" }) })}
                aria-label="Grid view"
                className={"grid h-8 w-8 place-items-center rounded-full transition-all " + (view === "grid" ? "bg-indigo-brand text-white shadow-sm" : "hover:bg-secondary")}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => nav({ search: (p: S) => ({ ...p, view: "list" }) })}
                aria-label="List view"
                className={"grid h-8 w-8 place-items-center rounded-full transition-all " + (view === "list" ? "bg-indigo-brand text-white shadow-sm" : "hover:bg-secondary")}
              >
                <ListIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Desktop Breadcrumb + Summary Header */}
        <div className="hidden md:block border-b border-border/80 bg-card/60 backdrop-blur-md">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-4">
            <nav className="text-xs text-muted-foreground flex items-center gap-2">
              <Link to="/home" className="hover:text-foreground font-bold transition-colors">Home</Link>
              <span className="text-muted-foreground/60">/</span>
              <Link to="/categories" className="hover:text-foreground font-bold transition-colors">Categories</Link>
              <span className="text-muted-foreground/60">/</span>
              <span className="text-foreground font-black">{category.name}</span>
            </nav>
            <div className="mt-2 flex items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
                  {category.name}
                  {search.sub && <span className="text-indigo-brand font-extrabold">• {search.sub}</span>}
                </h1>
                <p className="text-xs sm:text-sm font-bold text-muted-foreground mt-0.5">
                  Showing <span className="text-primary font-black">{productList.length}</span> active listings near {activeLoc?.area || "Madhapur"}
                </p>
              </div>

              {/* Desktop Active Chips Row */}
              {chips.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  {chips.map((c) => (
                    <FilterChip key={String(c.key)} label={c.label} active onClear={() => clearChip(c.key)} />
                  ))}
                  <button
                    onClick={resetAllFilters}
                    className="text-xs font-bold text-rose-600 hover:underline pl-1"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 md:mx-auto md:max-w-[1440px] md:grid md:grid-cols-[300px_1fr] md:gap-6 md:py-6">
          
          {/* DESKTOP FILTER SIDEBAR */}
          <aside className="hidden md:block sticky top-24 self-start rounded-3xl border border-border bg-card p-5 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-sm font-extrabold uppercase tracking-wide text-foreground flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-indigo-brand" /> Filter {category.name}
              </h2>
              <button
                onClick={resetAllFilters}
                className="text-[11px] font-bold text-rose-600 hover:underline"
              >
                Reset All
              </button>
            </div>

            <div className="space-y-4 text-xs font-semibold">
              {/* Quick Sale Toggle */}
              <label className="flex items-center gap-2 cursor-pointer p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 font-extrabold transition-all hover:bg-amber-500/15">
                <input
                  type="checkbox"
                  checked={search.quickSale === "1"}
                  onChange={(e) => nav({ search: (p: S) => ({ ...p, quickSale: e.target.checked ? "1" : undefined }) })}
                  className="h-4 w-4 rounded border-border accent-amber-500"
                />
                <span>⚡ Quick Sale Items Only</span>
              </label>

              {/* Verified Sellers Toggle */}
              <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-2xl bg-secondary/50 border border-border text-foreground">
                <input
                  type="checkbox"
                  checked={search.verified === "1"}
                  onChange={(e) => nav({ search: (p: S) => ({ ...p, verified: e.target.checked ? "1" : undefined }) })}
                  className="h-4 w-4 rounded border-border accent-indigo-brand"
                />
                <span>Verified Sellers Only</span>
              </label>

              {/* Subcategories Filter */}
              {subs.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wide">Subcategory</label>
                  <select
                    value={search.sub ?? ""}
                    onChange={(e) => nav({ search: (p: S) => ({ ...p, sub: e.target.value || undefined }) })}
                    className="w-full h-11 rounded-2xl border border-border bg-background px-3 text-xs font-bold text-foreground outline-none focus:border-indigo-brand"
                  >
                    <option value="">All {category.name}</option>
                    {subs.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Item Condition */}
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wide">Item Condition</label>
                <div className="space-y-1.5">
                  {CONDITIONS.map((c) => (
                    <label key={c.id} className="flex items-center gap-2 cursor-pointer text-xs text-foreground">
                      <input
                        type="checkbox"
                        checked={search.cond === c.id}
                        onChange={(e) => nav({ search: (p: S) => ({ ...p, cond: e.target.checked ? c.id : undefined }) })}
                        className="h-3.5 w-3.5 rounded border-border accent-indigo-brand"
                      />
                      <span>{c.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wide">Price Range (₹)</label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPInput}
                    onChange={(e) => setMinPInput(e.target.value)}
                    onBlur={(e) => nav({ search: (p: S) => ({ ...p, minP: e.target.value || undefined }) })}
                    className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs font-bold outline-none focus:border-indigo-brand"
                  />
                  <span className="text-xs text-muted-foreground font-bold">to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPInput}
                    onChange={(e) => setMaxPInput(e.target.value)}
                    onBlur={(e) => nav({ search: (p: S) => ({ ...p, maxP: e.target.value || undefined }) })}
                    className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs font-bold outline-none focus:border-indigo-brand"
                  />
                </div>
                {/* Price Presets */}
                <div className="flex flex-wrap gap-1">
                  <button type="button" onClick={() => applyPricePreset(undefined, 5000)} className="px-2 py-1 rounded-lg bg-secondary text-[10px] font-bold text-muted-foreground hover:bg-indigo-brand/10">Under ₹5k</button>
                  <button type="button" onClick={() => applyPricePreset(5000, 15000)} className="px-2 py-1 rounded-lg bg-secondary text-[10px] font-bold text-muted-foreground hover:bg-indigo-brand/10">₹5k–₹15k</button>
                  <button type="button" onClick={() => applyPricePreset(15000, 50000)} className="px-2 py-1 rounded-lg bg-secondary text-[10px] font-bold text-muted-foreground hover:bg-indigo-brand/10">₹15k–₹50k</button>
                </div>
              </div>

              {/* Sort By Dropdown */}
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wide">Sort Results By</label>
                <select
                  value={search.sort ?? "relevance"}
                  onChange={(e) => nav({ search: (p: S) => ({ ...p, sort: e.target.value }) })}
                  className="w-full h-11 rounded-2xl border border-border bg-background px-3 text-xs font-bold text-foreground outline-none focus:border-indigo-brand"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.id} value={o.id}>{o.label}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={resetAllFilters}
                className="w-full h-11 rounded-2xl border border-border text-xs font-bold text-muted-foreground hover:bg-secondary transition-all flex items-center justify-center gap-1.5"
              >
                <X className="h-4 w-4" /> Clear All Filters
              </button>
            </div>
          </aside>

          {/* MAIN LISTINGS AREA */}
          <div className="space-y-6">
            {/* Subcategories Horizontal Scroll */}
            {subs.length > 0 && (
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                <button
                  onClick={() => nav({ search: (p: S) => ({ ...p, sub: undefined }) })}
                  className={"shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all " + (!search.sub ? "border-primary bg-primary text-primary-foreground shadow-sm" : "border-border bg-card text-foreground hover:bg-secondary")}
                >
                  All {category.name}
                </button>
                {subs.map((s) => (
                  <button
                    key={s}
                    onClick={() => nav({ search: (p: S) => ({ ...p, sub: search.sub === s ? undefined : s }) })}
                    className={"shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all " + (search.sub === s ? "border-primary bg-primary text-primary-foreground shadow-sm" : "border-border bg-card text-foreground hover:bg-secondary")}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Category Header Ad */}
            {liveCatAd && <HeroAd ad={liveCatAd} />}

            {loading ? (
              <div className="p-12 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-brand" />
                <span>Loading {category.name.toLowerCase()} listings...</span>
              </div>
            ) : error ? (
              <div className="p-6 text-center bg-destructive/10 border border-destructive/20 rounded-2xl space-y-3">
                <p className="text-xs font-bold text-destructive">{error}</p>
                <button
                  onClick={loadData}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Retry
                </button>
              </div>
            ) : (
              <>
                {/* Results Grid / List */}
                {productList.length === 0 ? (
                  <EmptyState
                    title={`No ${category.name.toLowerCase()} listings found`}
                    body="Try clearing filters or searching for something else."
                    ctaLabel="Clear all filters"
                    onCta={resetAllFilters}
                  />
                ) : view === "list" ? (
                  <div className="space-y-3">
                    {interleaveAds(productList, liveSponsoredAd, "list")}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                    {interleaveAds(productList, liveSponsoredAd, "grid")}
                  </div>
                )}

                {/* Nearby Category Stores & Sellers */}
                {liveStores.length > 0 && (
                  <section className="pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h2 className="text-base font-extrabold text-foreground">Nearby {category.name} Sellers & Stores</h2>
                      <Link to="/stores" className="text-xs font-bold text-indigo-brand hover:underline">View All Stores</Link>
                    </div>
                    <div className="grid grid-rows-2 grid-flow-col gap-3.5 overflow-x-auto no-scrollbar pb-2 sm:grid-rows-none sm:grid-flow-row sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:overflow-visible sm:pb-0">
                      {liveStores.slice(0, 6).map((s: any) => (
                        <div key={s.id} className="w-[280px] sm:w-full shrink-0 sm:shrink">
                          <StoreCard s={s} className="w-full h-full" />
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}

            <SafetyCard />
          </div>

        </div>

        <SortSheet
          open={sortOpen}
          onClose={() => setSortOpen(false)}
          value={search.sort ?? "relevance"}
          onChange={(id) => nav({ search: (p: S) => ({ ...p, sort: id }) })}
        />
      </div>
    </MobileFrame>
  );
}

function interleaveAds(products: Product[], sponsoredAd: any, mode: "grid" | "list") {
  const nodes: React.ReactNode[] = [];
  products.forEach((p, i) => {
    nodes.push(
      mode === "list"
        ? <ProductCard key={p.id} p={p} variant="list" />
        : <ProductCard key={p.id} p={p} />
    );

    if ((i + 1) % 6 === 0 && sponsoredAd) {
      nodes.push(
        <ProductCard
          key={`sponsored-ad-${i}`}
          p={{
            ...sponsoredAd,
            id: sponsoredAd.id,
            sponsored: true
          }}
          variant={mode === "list" ? "list" : "grid"}
        />
      );
    }
  });
  return nodes;
}

function NotFound() {
  const nav = useNavigate();
  return (
    <MobileFrame>
      <EmptyState
        title="Category not found"
        body="This category is unavailable."
        ctaLabel="Browse categories"
        onCta={() => nav({ to: "/categories" })}
      />
    </MobileFrame>
  );
}
