import { createFileRoute, notFound, Link, useNavigate } from "@tanstack/react-router";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { emptyStore, type Store } from "@/lib/stores";
import { listListings, formatINR } from "@/lib/listings";
import {
  ShieldCheck, Star, Phone, MessageCircle, Navigation, Store as StoreIcon,
  Package, Sparkles, Share2, Heart, Zap, ExternalLink, Clock, MapPin, CheckCircle2, Copy
} from "lucide-react";
import { ProductCard } from "@/components/omeetso/ProductCard";
import { useEffect, useState } from "react";
import { startConversationApi } from "@/api/chat.api";
import { serveAdsApi } from "@/api/adCampaigns.api";
import { toast } from "sonner";

import { ReviewModal } from "@/components/omeetso/chat/ReviewModal";

export const Route = createFileRoute("/store/$id")({
  loader: async ({ params }) => {
    let s: Store | undefined = undefined;
    try {
      const res = await fetch(`https://api.omeetso.in/api/v1/stores/${params.id}`);
      const json = await res.json();
      if (json.success && json.data) {
        const item = json.data;
        s = {
          ...emptyStore(),
          id: item.id || item._id,
          name: item.name,
          tagline: item.tagline || "",
          description: item.description || "",
          businessType: item.businessType || "Retailer",
          primaryCategory: item.primaryCategory || "general",
          supportingCategories: item.supportingCategories || [],
          pincode: item.pincode || "500081",
          area: item.area || "Madhapur",
          city: item.city || "Hyderabad",
          address: item.address || "",
          businessMobile: item.businessMobile || "",
          email: item.email || "",
          logo: item.logo,
          cover: item.cover,
          rating: item.rating || 0,
          reviewCount: item.reviewCount || 0,
          followersCount: item.followersCount || 340,
          status: (item.status?.toLowerCase() || "approved") as any,
          createdAt: new Date(item.createdAt || Date.now()).getTime(),
          updatedAt: new Date(item.updatedAt || Date.now()).getTime()
        };
      } else {
        // Fallback search listing seller
        const lRes = await fetch(`https://api.omeetso.in/api/v1/listings/${params.id}`);
        const lJson = await lRes.json();
        if (lJson.success && lJson.data) {
          const lItem = lJson.data;
          s = {
            ...emptyStore(),
            id: params.id,
            name: `${lItem.sellerName || "Store"} Showroom`,
            primaryCategory: lItem.categoryId || "Retail",
            area: lItem.area || "Madhapur",
            city: lItem.city || "Hyderabad",
            cover: lItem.images?.[0],
            rating: 0,
            reviewCount: 0,
            followersCount: 280,
            status: "approved" as any
          };
        }
      }
    } catch { }

    if (!s) throw notFound();
    return { store: s };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
        { title: `${loaderData.store.name} — Verified Omeetso Store` },
        { name: "description", content: `${loaderData.store.primaryCategory || "Retail"} store in ${loaderData.store.area}, ${loaderData.store.city}.` },
        { property: "og:title", content: loaderData.store.name },
        { property: "og:image", content: loaderData.store.cover },
      ]
      : [{ title: "Store — Omeetso" }],
  }),
  component: StorePage,
  notFoundComponent: () => <div className="p-8 text-center text-sm font-semibold">Store not found</div>,
});

const tabs = ["Catalog", "Sponsored Deals", "About Store", "Reviews"] as const;

function StorePage() {
  const { store } = Route.useLoaderData();
  const nav = useNavigate();
  const [tab, setTab] = useState<(typeof tabs)[number]>("Catalog");
  const [apiListings, setApiListings] = useState<any[]>([]);
  const [loadingListings, setLoadingListings] = useState<boolean>(true);
  const [following, setFollowing] = useState<boolean>(false);
  const [followers, setFollowers] = useState<number>(store.followersCount || 340);
  const [sponsoredAd, setSponsoredAd] = useState<any | null>(null);
  const [realReviews, setRealReviews] = useState<any[]>([]);
  const [reviewOpen, setReviewOpen] = useState<boolean>(false);

  // Cover image fallback handler
  const [coverSrc, setCoverSrc] = useState<string>(
    store.cover && !store.cover.startsWith("blob:")
      ? store.cover
      : "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600"
  );

  // Logo image fallback handler
  const [logoSrc, setLogoSrc] = useState<string | null>(
    store.logo && !store.logo.startsWith("blob:") ? store.logo : null
  );

  useEffect(() => {
    setLoadingListings(true);
    // Fetch listings specifically for this store
    Promise.all([
      fetch(`https://api.omeetso.in/api/v1/stores/${store.id}/listings`).then((r) => r.json()).catch(() => null),
      fetch(`https://api.omeetso.in/api/v1/listings?storeId=${store.id}`).then((r) => r.json()).catch(() => null),
      fetch(`https://api.omeetso.in/api/v1/listings?category=${store.primaryCategory}&city=${store.city}`).then((r) => r.json()).catch(() => null),
      fetch(`https://api.omeetso.in/api/v1/reviews/target/${store.id}`).then((r) => r.json()).catch(() => null),
      serveAdsApi("STORE_BANNER").catch(() => null)
    ]).then(([sRes, storeListingsRes, catRes, revRes, adRes]) => {
      setLoadingListings(false);
      if (revRes?.success && Array.isArray(revRes.data)) {
        setRealReviews(revRes.data);
      }
      let rawListings: any[] = [];
      if (sRes?.success && Array.isArray(sRes.data) && sRes.data.length > 0) {
        rawListings = sRes.data;
      } else if (storeListingsRes?.success && Array.isArray(storeListingsRes.data) && storeListingsRes.data.length > 0) {
        rawListings = storeListingsRes.data;
      } else if (catRes?.success && Array.isArray(catRes.data) && catRes.data.length > 0) {
        // Strictly filter catalog for matching category AND area/city of this store
        rawListings = catRes.data.filter((item: any) =>
          (item.categoryId?.toLowerCase() === store.primaryCategory?.toLowerCase() || item.category?.toLowerCase() === store.primaryCategory?.toLowerCase()) &&
          (item.area?.toLowerCase() === store.area?.toLowerCase() || item.city?.toLowerCase() === store.city?.toLowerCase())
        );
      }

      if (rawListings.length > 0) {
        const mapped = rawListings.map((item: any) => ({
          id: item.id || item._id,
          title: item.title,
          price: item.price || (item.priceInPaise ? item.priceInPaise / 100 : 0),
          originalPrice: Math.round((item.price || (item.priceInPaise ? item.priceInPaise / 100 : 0)) * 1.15),
          image: item.coverUrl || (Array.isArray(item.images) && item.images[0]) || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
          location: `${item.area || store.area || "Madhapur"}, ${item.city || store.city || "Hyderabad"}`,
          time: "Just now",
          category: item.category || store.primaryCategory || "General",
          condition: item.condition || "Like New",
          isBoosted: item.boost?.active || Math.random() > 0.6
        }));
        setApiListings(mapped);
      } else {
        setApiListings([]);
      }

      if (adRes?.success && adRes.data && adRes.data.length > 0) {
        setSponsoredAd(adRes.data[0]);
      }
    });
  }, [store.id, store.area, store.city, store.primaryCategory]);

  const toggleFollow = () => {
    if (following) {
      setFollowing(false);
      setFollowers((prev) => prev - 1);
      toast.info(`Unfollowed ${store.name}`);
    } else {
      setFollowing(true);
      setFollowers((prev) => prev + 1);
      toast.success(`You are now following ${store.name}!`);
    }
  };

  const handleShareStore = async () => {
    const shareUrl = window.location.href;
    const shareData = {
      title: `${store.name} on Omeetso`,
      text: `Check out ${store.name} (${store.primaryCategory}) in ${store.area}, ${store.city} on Omeetso!`,
      url: shareUrl
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch { }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Store link copied to clipboard!");
    }
  };

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background text-foreground font-sans pb-24 md:pb-16">
        {/* Panoramic Store Cover Hero Banner */}
        <div className="relative h-56 sm:h-72 lg:h-80 w-full overflow-hidden bg-slate-950">
          <img
            src={coverSrc}
            alt={store.name}
            onError={() => setCoverSrc("https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600")}
            className="h-full w-full object-cover transition-opacity duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Desktop Breadcrumbs & Share Overlay */}
          <div className="absolute inset-0 p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 flex flex-col justify-between max-w-[1440px] mx-auto w-full pointer-events-none">
            <nav className="hidden md:flex items-center gap-2 text-xs font-semibold text-white/80 pointer-events-auto">
              <Link to="/home" className="hover:text-white transition-colors">Home</Link>
              <span>/</span>
              <Link to="/stores" className="hover:text-white transition-colors">Stores</Link>
              <span>/</span>
              <span className="text-white font-bold">{store.name}</span>
            </nav>

            <div className="flex items-center justify-between gap-3 pointer-events-auto ml-auto">
              <button
                onClick={handleShareStore}
                className="h-10 w-10 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/20 grid place-items-center text-white hover:bg-white hover:text-slate-900 transition-all shadow-md"
                title="Share Store Profile"
              >
                <Share2 className="h-4 w-4" />
              </button>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/90 backdrop-blur-md px-3.5 py-1.5 text-xs font-black text-white uppercase tracking-wider shadow">
                <ShieldCheck className="h-4 w-4" /> Verified Store
              </span>
            </div>
          </div>
        </div>

        {/* Main Store Content (Dual-Column Desktop Layout) */}
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-6">
          <div className="grid grid-cols-12 gap-6 lg:gap-8 items-start">

            {/* Left Column (Desktop Sticky Sidebar Profile Card - 4 cols out of 12) */}
            <aside className="col-span-12 lg:col-span-4 space-y-6 -mt-16 sm:-mt-20 lg:-mt-24 relative z-10">

              {/* Store Identity & Stats Card */}
              <div className="rounded-3xl bg-card p-6 card-elev border border-border/80 shadow-lg space-y-5">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="h-28 w-28 overflow-hidden rounded-3xl border-4 border-card bg-slate-900 shadow-xl shrink-0 grid place-items-center">
                    {logoSrc ? (
                      <img
                        src={logoSrc}
                        alt={store.name}
                        onError={() => setLogoSrc(null)}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-primary to-indigo-800 grid place-items-center text-white font-black text-4xl uppercase">
                        {store.name?.charAt(0) || "S"}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-1.5 flex-wrap">
                      <h1 className="text-xl font-black tracking-tight text-foreground">{store.name}</h1>
                      <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                    </div>
                    <p className="text-xs font-bold text-primary">
                      {store.primaryCategory || "Retail Store"} • {store.area}, {store.city}
                    </p>
                    <p className="text-xs font-semibold text-emerald-600 flex items-center justify-center gap-1 mt-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Open Now</span> • 10:00 AM – 9:30 PM
                    </p>
                  </div>
                </div>

                {store.tagline && (
                  <p className="text-xs italic text-amber-600 dark:text-amber-400 font-semibold bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20 text-center">
                    "{store.tagline}"
                  </p>
                )}

                {/* Key Metrics Bar */}
                <div className="grid grid-cols-4 divide-x divide-border rounded-2xl bg-surface-2 py-3 border border-border text-center shadow-xs">
                  <Stat k="Products" v={String(apiListings.length)} />
                  <Stat k="Rating" v={store.rating ? `★ ${store.rating}` : "No Ratings"} />
                  <Stat k="Reviews" v={String(store.reviewCount || 0)} />
                  <Stat k="Followers" v={String(followers)} />
                </div>

                {/* Follow Button */}
                <button
                  onClick={toggleFollow}
                  className={`w-full py-3 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-xs ${following
                    ? "bg-secondary text-foreground border border-border hover:bg-red-500/10 hover:text-red-600"
                    : "bg-primary text-primary-foreground hover:bg-electric"
                    }`}
                >
                  <Heart className={`h-4 w-4 ${following ? "fill-red-500 text-red-500" : ""}`} />
                  {following ? "Following Store" : "Follow Store"}
                </button>

                {/* Quick Action Palette */}
                <div className="grid grid-cols-4 gap-2 pt-1 border-t border-border/60">
                  <ActionBtn
                    icon={MessageCircle}
                    variant="primary"
                    onClick={async () => {
                      try {
                        const res = await startConversationApi("STORE", store.id);
                        if (res.success && res.data?.id) {
                          window.location.href = `/chat/${res.data.id}`;
                        } else {
                          toast.error(res.error?.message || "Could not start chat");
                        }
                      } catch { toast.error("Connection error. Please try again."); }
                    }}
                  >
                    Chat
                  </ActionBtn>
                  <ActionBtn icon={Phone} variant="secondary" onClick={() => window.open(`tel:${store.businessMobile || "9876543210"}`)}>
                    Call
                  </ActionBtn>
                  <ActionBtn icon={Navigation} variant="secondary" onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(store.address || `${store.name} ${store.area} ${store.city}`)}`)}>
                    Map
                  </ActionBtn>
                  <ActionBtn icon={Share2} variant="secondary" onClick={handleShareStore}>
                    Share
                  </ActionBtn>
                </div>
              </div>

              {/* Store Details Card */}
              <div className="rounded-3xl bg-card p-5 border border-border shadow-xs space-y-3 text-xs">
                <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground border-b border-border pb-2">
                  Store Info & Business Details
                </h3>
                <div className="space-y-2">
                  <p className="flex justify-between py-0.5"><span className="text-muted-foreground font-semibold">Category:</span> <span className="font-extrabold text-foreground">{store.primaryCategory}</span></p>
                  <p className="flex justify-between py-0.5"><span className="text-muted-foreground font-semibold">Business Type:</span> <span className="font-extrabold text-foreground">{store.businessType || "Authorized Showroom"}</span></p>
                  <p className="flex justify-between py-0.5"><span className="text-muted-foreground font-semibold">Area:</span> <span className="font-extrabold text-foreground">{store.area}, {store.city}</span></p>
                  <p className="flex justify-between py-0.5"><span className="text-muted-foreground font-semibold">Pincode:</span> <span className="font-extrabold text-foreground">{store.pincode}</span></p>
                  <p className="flex justify-between py-0.5"><span className="text-muted-foreground font-semibold">Business Contact:</span> <span className="font-extrabold text-primary">{store.businessMobile || "+91 98765 43210"}</span></p>
                  <p className="flex justify-between py-0.5"><span className="text-muted-foreground font-semibold">Store Hours:</span> <span className="font-extrabold text-emerald-600">Mon–Sat 10:00 AM – 9:30 PM</span></p>
                </div>

                {store.description && (
                  <div className="pt-3 border-t border-border/60">
                    <p className="text-muted-foreground font-bold mb-1">About Business:</p>
                    <p className="text-foreground leading-relaxed font-medium">{store.description}</p>
                  </div>
                )}
              </div>

              {/* Store Owner Boost Announcement Banner */}
              <div className="rounded-3xl bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-950 text-white p-5 border border-blue-500/30 shadow-lg space-y-3">
                <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs">
                  <Zap className="h-4 w-4 fill-amber-400" /> Merchant Tools
                </div>
                <h4 className="text-sm font-black leading-snug">Own this store? Boost your items to #1!</h4>
                <p className="text-xs text-blue-100/90 leading-relaxed font-normal">
                  Feature your products on the homepage carousel and top category search spots.
                </p>
                <Link
                  to="/ads/new"
                  search={{ id: "", kind: "store", step: 1 }}
                  className="block text-center w-full py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all"
                >
                  Boost Storefront ⚡
                </Link>
              </div>

            </aside>

            {/* Right Main Content Area (Tabs & Product Grid - 8 cols out of 12) */}
            <main className="col-span-12 lg:col-span-8 space-y-6">

              {/* Sponsored Banner / Highlight Card */}
              {sponsoredAd && (
                <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-4 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-500/20 px-3 py-1 rounded-full flex items-center gap-1">
                      <Sparkles className="h-3 w-3" /> Sponsored Store Promotion
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground">Featured Spotlight</span>
                  </div>
                  <div className="flex gap-4 items-center">
                    <img src={sponsoredAd.creative?.imageUrl} alt="Sponsored" className="h-16 w-16 rounded-2xl object-cover border border-border shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold line-clamp-1">{sponsoredAd.creative?.title || "Special Store Deal"}</p>
                      <p className="text-xs font-black text-primary mt-0.5">{formatINR(sponsoredAd.creative?.priceInPaise ? sponsoredAd.creative?.priceInPaise / 100 : 4999)}</p>
                    </div>
                    <button
                      onClick={() => nav({ to: `/listing/${sponsoredAd.listingId || store.id}` as any })}
                      className="shrink-0 rounded-2xl bg-amber-500 text-slate-950 font-black text-xs px-4 py-2 shadow-xs hover:bg-amber-400 transition-colors"
                    >
                      View Deal →
                    </button>
                  </div>
                </div>
              )}

              {/* Catalog Navigation Tabs */}
              <div className="flex border-b border-border bg-card rounded-2xl p-1.5 gap-1.5 shadow-xs">
                {tabs.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`flex-1 py-3 text-xs font-black rounded-xl transition-all ${tab === t
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-surface-2"
                      }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Tab Content Panels */}
              <div>
                {tab === "Catalog" && (
                  loadingListings ? (
                    <div className="py-16 text-center text-xs font-extrabold text-muted-foreground rounded-3xl border border-border bg-card">
                      Loading store products...
                    </div>
                  ) : apiListings.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {apiListings.map((p: any) => (
                        <div key={p.id} className="relative group flex flex-col justify-between">
                          <ProductCard p={p} />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              nav({ to: "/ads/new", search: { id: "", listingId: p.id, step: 1 } as any });
                            }}
                            className="mt-2 w-full bg-primary/10 hover:bg-primary hover:text-white text-primary border border-primary/20 rounded-2xl py-2 text-[11px] font-black transition-colors flex items-center justify-center gap-1 shadow-xs"
                          >
                            <Zap className="h-3.5 w-3.5" /> Boost This Item
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-3xl bg-card p-12 border border-border text-center space-y-2">
                      <Package className="h-10 w-10 text-muted-foreground/50 mx-auto" />
                      <h3 className="text-sm font-bold text-foreground">No Products Listed Yet</h3>
                      <p className="text-xs text-muted-foreground">This store hasn't added products to their catalog yet.</p>
                    </div>
                  )
                )}

                {tab === "Sponsored Deals" && (
                  <div className="space-y-4">
                    <div className="rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 p-6 text-white shadow-md border border-indigo-500/30">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-3 py-1 rounded-full">
                        ⚡ Store Offer
                      </span>
                      <h3 className="text-base font-black mt-3">Special In-Store Buyer Discounts</h3>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        Visit store directly in {store.area} or send a buyer quote request on Omeetso for custom discounts.
                      </p>
                      <button
                        onClick={handleShareStore}
                        className="mt-4 bg-amber-400 text-slate-950 font-black text-xs px-5 py-2.5 rounded-2xl flex items-center gap-1.5 hover:bg-amber-300 transition-colors shadow-xs"
                      >
                        <Share2 className="h-4 w-4" /> Share Offer with Friends
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {apiListings.slice(0, 4).map((p: any) => (
                        <div key={p.id} className="rounded-3xl border border-border bg-card p-4 flex items-center gap-3.5 shadow-xs">
                          <img src={p.image} alt={p.title} className="h-16 w-16 rounded-2xl object-cover shrink-0 border border-border" />
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                              FEATURED
                            </span>
                            <p className="text-xs font-bold line-clamp-1 mt-1">{p.title}</p>
                            <p className="text-xs font-black text-primary">{formatINR(p.price)}</p>
                          </div>
                          <Link
                            to="/ads/new"
                            search={{ id: "", listingId: p.id, step: 1 }}
                            className="shrink-0 bg-primary text-white font-black text-xs px-3 py-2 rounded-2xl shadow-xs"
                          >
                            Boost ⚡
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {tab === "About Store" && (
                  <div className="space-y-4 rounded-3xl bg-card p-6 border border-border text-xs shadow-xs">
                    <h3 className="text-sm font-black border-b border-border pb-3 text-foreground uppercase tracking-wider">
                      Store Overview & Contact Information
                    </h3>
                    <div className="space-y-2.5 text-xs">
                      <p className="flex justify-between py-1 border-b border-border/40"><span className="text-muted-foreground font-semibold">Category:</span> <span className="font-extrabold text-foreground">{store.primaryCategory}</span></p>
                      <p className="flex justify-between py-1 border-b border-border/40"><span className="text-muted-foreground font-semibold">Business Type:</span> <span className="font-extrabold text-foreground">{store.businessType || "Authorized Showroom"}</span></p>
                      <p className="flex justify-between py-1 border-b border-border/40"><span className="text-muted-foreground font-semibold">Area:</span> <span className="font-extrabold text-foreground">{store.area}, {store.city}</span></p>
                      <p className="flex justify-between py-1 border-b border-border/40"><span className="text-muted-foreground font-semibold">Pincode:</span> <span className="font-extrabold text-foreground">{store.pincode}</span></p>
                      <p className="flex justify-between py-1 border-b border-border/40"><span className="text-muted-foreground font-semibold">Mobile:</span> <span className="font-extrabold text-primary">{store.businessMobile || "+91 98765 43210"}</span></p>
                      <p className="flex justify-between py-1"><span className="text-muted-foreground font-semibold">Operating Hours:</span> <span className="font-extrabold text-emerald-600">Mon–Sat 10:00 AM – 9:30 PM</span></p>
                    </div>

                    {store.description && (
                      <div className="pt-4 border-t border-border mt-3">
                        <p className="text-muted-foreground font-bold mb-1.5 uppercase text-[11px] tracking-wider">About the Business:</p>
                        <p className="text-foreground leading-relaxed font-medium text-xs sm:text-sm">{store.description}</p>
                      </div>
                    )}

                    <div className="pt-4 border-t border-border flex gap-3">
                      <button
                        onClick={handleShareStore}
                        className="flex-1 bg-surface-2 text-foreground py-3 rounded-2xl text-xs font-black border border-border flex items-center justify-center gap-2 hover:bg-surface-3 transition-colors"
                      >
                        <Share2 className="h-4 w-4" /> Share Store Profile
                      </button>
                    </div>
                  </div>
                )}

                {tab === "Reviews" && (
                  <div className="space-y-4">
                    <div className="rounded-3xl bg-card p-6 border border-border text-center space-y-3 shadow-xs">
                      <Star className="h-10 w-10 text-amber-500 mx-auto fill-amber-500" />
                      <h3 className="text-lg font-black">{store.rating ? `${store.rating} out of 5 Stars` : "No Ratings Yet"}</h3>
                      <p className="text-xs text-muted-foreground">Based on {store.reviewCount || 0} verified buyer ratings on Omeetso.</p>
                      <button
                        onClick={() => setReviewOpen(true)}
                        className="mt-2 inline-flex items-center gap-1.5 rounded-2xl bg-amber-500 text-slate-950 px-5 py-2.5 text-xs font-black hover:bg-amber-400 transition-all shadow-md"
                      >
                        <Star className="h-4 w-4 fill-slate-950" /> Write a Review
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {realReviews.map((rev: any) => (
                        <div key={rev._id || rev.id} className="rounded-3xl border border-border bg-card p-5 space-y-2 shadow-xs">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <img src={rev.buyerAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"} alt="" className="h-7 w-7 rounded-full object-cover" />
                              <span className="font-black text-foreground">{rev.buyerName}</span>
                            </div>
                            <span className="text-amber-500 font-bold">{"★".repeat(rev.rating || 5)}</span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">"{rev.comment}"</p>
                          {Array.isArray(rev.tags) && rev.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {rev.tags.map((t: string) => (
                                <span key={t} className="text-[10px] font-bold bg-surface-2 border border-border px-2 py-0.5 rounded-full text-muted-foreground">
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </main>
          </div>
        </div>
      </div>
      <ReviewModal
        isOpen={reviewOpen}
        onClose={() => setReviewOpen(false)}
        targetId={store.id}
        targetType="STORE"
        targetName={store.name}
      />
    </MobileFrame>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="text-center px-1">
      <p className="text-xs font-black text-foreground">{v}</p>
      <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mt-0.5">{k}</p>
    </div>
  );
}

function ActionBtn({
  icon: Icon,
  children,
  onClick,
  variant = "secondary"
}: {
  icon: any;
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-1.5 rounded-2xl py-2.5 text-xs font-black transition-all shadow-xs active:scale-95 ${variant === "primary"
        ? "bg-primary text-primary-foreground hover:bg-electric"
        : "bg-surface-2 text-foreground border border-border hover:bg-surface-3"
        }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {children}
    </button>
  );
}
