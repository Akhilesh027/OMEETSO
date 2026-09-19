import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import {
  ArrowLeft, MapPin, Star, ShieldCheck, User, Store as StoreIcon,
  MoreVertical, Ban, Flag, Share2, UserCheck, UserPlus,
} from "lucide-react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { ProductCard } from "@/components/omeetso/ProductCard";
import { EmptyState } from "@/components/omeetso/EmptyState";
import { isFollowingSeller, toggleFollowSeller } from "@/lib/saved";
import { toast } from "sonner";
import { API_BASE } from "@/config/api";
import { startConversationApi } from "@/api/chat.api";
import { getUserAccessToken } from "@/api/auth.api";
import { getSeller, productsBySeller } from "@/lib/mock";
import { listListings } from "@/lib/listings";

export const Route = createFileRoute("/seller/$id")({
  loader: async ({ params }) => {
    const cleanId = (params.id || "").trim();
    try {
      if (cleanId) {
        const res = await fetch(`${API_BASE}/users/${cleanId}/public`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            return {
              seller: {
                id: json.data.id || json.data._id || cleanId,
                name: json.data.name || "Omeetso Seller",
                businessName: json.data.businessName,
                avatar: json.data.avatar,
                type: json.data.businessEnabled || json.data.accountType === "business" ? "business" : "individual",
                rating: json.data.rating || 0,
                reviews: json.data.reviewCount || json.data.reviews || 0,
                area: json.data.area || json.data.city || "Hyderabad",
                city: json.data.city || "Hyderabad",
                responseTime: json.data.responseTime || "Within 1 hour",
                responseRate: json.data.responseRate || "98%",
                verified: json.data.verification?.verified ?? json.data.verificationSummary?.identityVerified ?? true,
                memberSince: json.data.memberSince || (json.data.createdAt ? new Date(json.data.createdAt).getFullYear().toString() : "2024"),
                about: json.data.bio || "Trusted Omeetso verified seller."
              }
            };
          }
        }
      }
    } catch { }

    const mock = cleanId ? getSeller(cleanId) : null;
    if (mock) {
      return {
        seller: {
          id: mock.id || cleanId || "u_seller",
          name: mock.name || "Verified Seller",
          businessName: (mock as any).businessName,
          avatar: mock.avatar,
          type: mock.type || "individual",
          rating: mock.rating || 0,
          reviews: mock.reviews || 0,
          area: mock.area || "Hyderabad",
          city: (mock as any).city || "Hyderabad",
          responseTime: mock.responseTime || "Within 1 hour",
          responseRate: mock.responseRate || "98%",
          verified: mock.verified ?? true,
          memberSince: mock.memberSince || "2024",
          about: mock.about || "Trusted Omeetso verified seller."
        }
      };
    }

    return {
      seller: {
        id: cleanId || "u_seller",
        name: "Verified Seller",
        type: "individual",
        rating: 0,
        reviews: 0,
        area: "Hyderabad",
        city: "Hyderabad",
        responseTime: "Within 1 hour",
        responseRate: "98%",
        verified: true,
        memberSince: "2024",
        about: "Trusted Omeetso verified seller."
      }
    };
  },
  head: ({ loaderData }) => {
    const s = loaderData?.seller;
    const name = s?.businessName || s?.name || "Seller";
    const reviews = s?.reviews || 0;
    return {
      meta: [
        { title: `${name} · Omeetso Seller` },
        { name: "description", content: `${name} on Omeetso — ${reviews} reviews.` },
        { property: "og:title", content: `${name} · Omeetso` },
      ],
    };
  },
  component: SellerPage,
  errorComponent: () => <SellerFallback />,
  notFoundComponent: () => (
    <MobileFrame><EmptyState title="Seller not found" body="This seller is unavailable." /></MobileFrame>
  ),
});

function SellerFallback() {
  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background p-6 flex flex-col items-center justify-center text-center">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-secondary text-primary mb-4 font-black text-2xl">
          S
        </div>
        <h2 className="text-base font-extrabold text-foreground">Verified Seller</h2>
        <p className="mt-1 text-xs text-muted-foreground max-w-xs">Active verified seller on Omeetso Marketplace.</p>
        <button
          onClick={() => history.back()}
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" /> Go Back
        </button>
      </div>
    </MobileFrame>
  );
}

function SellerPage() {
  const { id } = Route.useParams();
  const loaderData = Route.useLoaderData();

  const fallbackSeller = useMemo(() => {
    const mock = id ? getSeller(id) : null;
    return {
      id: id || "u_seller",
      name: mock?.name || "Verified Seller",
      businessName: (mock as any)?.businessName,
      avatar: mock?.avatar,
      type: mock?.type || "individual",
      rating: mock?.rating || 0,
      reviews: mock?.reviews || 0,
      area: mock?.area || "Hyderabad",
      city: (mock as any)?.city || "Hyderabad",
      responseTime: mock?.responseTime || "Within 1 hour",
      responseRate: mock?.responseRate || "98%",
      verified: mock?.verified ?? true,
      memberSince: mock?.memberSince || "2024",
      about: mock?.about || "Trusted Omeetso verified seller.",
    };
  }, [id]);

  const [seller, setSeller] = useState<any>(() => loaderData?.seller || fallbackSeller);
  const [sellerListings, setSellerListings] = useState<any[]>([]);
  const nav = useNavigate();
  const [following, setFollowing] = useState(() => isFollowingSeller(seller?.id || id));
  const [blocked, setBlocked] = useState(false);
  const [menu, setMenu] = useState(false);
  const [reported, setReported] = useState(false);

  useEffect(() => {
    if (!id) return;

    fetch(`${API_BASE}/users/${id}/public`)
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((json) => {
        if (json?.success && json?.data) {
          const d = json.data;
          setSeller((prev: any) => {
            const updated = {
              ...prev,
              id: d.id || d._id || id,
              name: d.name || prev?.name || "Omeetso Seller",
              businessName: d.businessName || prev?.businessName,
              avatar: d.avatar || prev?.avatar,
              type: d.accountType || d.type || prev?.type || "individual",
              area: d.area || d.city || prev?.area || "Hyderabad",
              city: d.city || prev?.city || "Hyderabad",
              memberSince: d.memberSince || (d.createdAt ? new Date(d.createdAt).getFullYear().toString() : prev?.memberSince || "2024"),
              rating: d.rating ?? prev?.rating ?? 0,
              reviews: d.reviewCount ?? d.reviews ?? prev?.reviews ?? 0,
              responseTime: d.responseTime || prev?.responseTime || "Within 1 hour",
              responseRate: d.responseRate || prev?.responseRate || "98%",
              verified: d.verification?.verified ?? d.verificationSummary?.identityVerified ?? prev?.verified ?? true,
              about: d.bio || prev?.about || "Trusted Omeetso verified seller.",
            };
            setFollowing(isFollowingSeller(updated.id));
            return updated;
          });
        }
      })
      .catch(() => { });

    fetch(`${API_BASE}/listings?sellerId=${id}`)
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((json) => {
        let items: any[] = [];
        if (json?.success && Array.isArray(json?.data) && json.data.length > 0) {
          const ownListings = json.data.filter((item: any) => {
            const itemSellerId = typeof item.sellerId === "object" ? item.sellerId?._id : item.sellerId;
            return String(itemSellerId) === String(id);
          });
          items = ownListings.map((item: any) => ({
            id: String(item.id || item._id),
            title: item.title || "Product Listing",
            price: item.price || (item.priceInPaise ? item.priceInPaise / 100 : 0),
            originalPrice: Math.round((item.price || (item.priceInPaise ? item.priceInPaise / 100 : 0)) * 1.15),
            image: item.coverUrl || (Array.isArray(item.images) && item.images[0]) || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
            location: item.area ? `${item.area}, ${item.city || "Hyderabad"}` : (item.city || "Hyderabad"),
            area: item.area || item.city || "Hyderabad",
            distanceKm: 1.5,
            time: "Just now",
            category: item.category || "General",
            condition: item.condition || "Like New",
            badge: "Verified"
          }));
        }

        // Fallback to mock / local listings if API returns no listings
        if (items.length === 0) {
          const mockListings = productsBySeller(id);
          if (mockListings.length > 0) {
            items = mockListings;
          } else {
            const allLocal = listListings();
            const matchedLocal = allLocal.filter(
              (l) => l.sellerId === id || (l as any).seller?.id === id || (l as any).sellerId?._id === id
            );
            if (matchedLocal.length > 0) {
              items = matchedLocal.map((l: any) => ({
                id: String(l.id),
                title: l.title || "Product Listing",
                price: l.price || 0,
                originalPrice: Math.round((l.price || 0) * 1.15),
                image: (Array.isArray(l.images) && l.images[0]) || l.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
                location: l.area ? `${l.area}, ${l.city || "Hyderabad"}` : (l.city || "Hyderabad"),
                area: l.area || l.city || "Hyderabad",
                distanceKm: 1.5,
                time: "Recently",
                category: l.category || "General",
                condition: l.condition || "Like New",
                badge: "Verified"
              }));
            }
          }
        }

        setSellerListings(items);
      })
      .catch(() => {
        const mockListings = productsBySeller(id);
        setSellerListings(mockListings);
      });
  }, [id]);

  const active = sellerListings;
  const sold = 0;
  const currentSeller = seller || fallbackSeller;

  const handleShare = async () => {
    const shareData = {
      title: `${currentSeller.name} · Omeetso Seller`,
      text: `Check out ${currentSeller.name}'s active listings on Omeetso Marketplace!`,
      url: window.location.href,
    };
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Seller profile link copied to clipboard!");
    }
  };

  const handleFollowToggle = () => {
    const nextState = toggleFollowSeller({
      id: currentSeller.id,
      name: currentSeller.name,
      avatar: currentSeller.avatar,
      area: currentSeller.area,
      rating: currentSeller.rating,
    });
    setFollowing(nextState);
    if (nextState) {
      toast.success(`You are now following ${currentSeller.name}`);
    } else {
      toast.info(`Unfollowed ${currentSeller.name}`);
    }
  };

  const handleMessageSeller = async () => {
    const token = getUserAccessToken() || (typeof localStorage !== "undefined" ? localStorage.getItem("omeetso_user_token") || localStorage.getItem("omeetso_auth_token") : null);
    if (!token) {
      toast.info("Please sign in to message this seller.");
      nav({ to: "/login" });
      return;
    }
    try {
      const res = await startConversationApi("LISTING", currentSeller.id, currentSeller.id);
      if (res.success && res.data?.id) {
        nav({ to: "/chat/$id", params: { id: res.data.id } });
      } else {
        nav({ to: "/chats" });
      }
    } catch {
      nav({ to: "/chats" });
    }
  };

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-16 font-sans">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card/95 px-3 py-3 backdrop-blur safe-t">
          <button onClick={() => history.back()} className="grid h-10 w-10 place-items-center rounded-full hover:bg-secondary" aria-label="Back">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-base font-bold">Seller Profile</h1>
          <div className="flex items-center gap-1">
            <button
              onClick={handleShare}
              className="grid h-10 w-10 place-items-center rounded-full hover:bg-secondary text-foreground"
              aria-label="Share seller profile"
            >
              <Share2 className="h-5 w-5 text-indigo-brand" />
            </button>
            <div className="relative">
              <button onClick={() => setMenu((v) => !v)} className="grid h-10 w-10 place-items-center rounded-full hover:bg-secondary" aria-label="More">
                <MoreVertical className="h-5 w-5" />
              </button>
              {menu && (
                <div className="absolute right-0 top-11 z-40 w-44 overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
                  <button
                    onClick={handleShare}
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-secondary"
                  >
                    <Share2 className="h-4 w-4" /> Share profile
                  </button>
                  <button
                    onClick={() => { setReported(true); setMenu(false); }}
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-secondary"
                  >
                    <Flag className="h-4 w-4" /> Report seller
                  </button>
                  <button
                    onClick={() => { setBlocked((v) => !v); setMenu(false); }}
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-destructive hover:bg-secondary"
                  >
                    <Ban className="h-4 w-4" /> {blocked ? "Unblock seller" : "Block seller"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Profile */}
        <div className="px-4 pt-4 md:mx-auto md:max-w-[1440px] md:px-6 md:pt-8">
          <div className="flex items-center gap-3">
            <div className="relative">
              {currentSeller.avatar ? (
                <img
                  src={currentSeller.avatar}
                  alt={currentSeller.name}
                  className="h-16 w-16 rounded-full object-cover shadow-sm"
                  onError={(e) => { (e.target as HTMLElement).style.display = "none"; }}
                />
              ) : null}
              {(!currentSeller.avatar) && (
                <div className="grid h-16 w-16 place-items-center rounded-full bg-secondary font-bold text-indigo-brand text-xl">
                  {currentSeller.name?.charAt(0) || "S"}
                </div>
              )}
              {currentSeller.verified && (
                <span className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-emerald-600 text-white shadow">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-lg font-extrabold">{currentSeller.businessName || currentSeller.name}</p>
                {currentSeller.verified && <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />}
              </div>
              {currentSeller.businessName && currentSeller.name && currentSeller.businessName !== currentSeller.name && (
                <p className="text-xs font-semibold text-muted-foreground truncate">
                  Owner: {currentSeller.name}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-0.5">
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 font-semibold">
                  {currentSeller.type === "business" || currentSeller.businessName ? (
                    <span className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                      <StoreIcon className="h-3 w-3" /> Business Owner
                    </span>
                  ) : (
                    <><User className="h-3 w-3" /> Individual</>
                  )}
                </span>
                <span className="inline-flex items-center gap-0.5">
                  <Star className="h-3 w-3 fill-yellow-brand text-yellow-brand" /> {currentSeller.rating || 0} · {currentSeller.reviews || 0} reviews
                </span>
              </div>
              <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                <MapPin className="h-3 w-3 text-indigo-brand" /> {currentSeller.area || "Hyderabad"} · Replies {currentSeller.responseTime || "Within 1 hour"} · {currentSeller.responseRate ?? "98%"}
              </p>
            </div>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{currentSeller.about ?? "Trusted Omeetso seller."}</p>

          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <StatCard label="Active" value={String(active.length)} />
            <StatCard label="Sold" value={String(sold)} />
            <StatCard label="Member" value={currentSeller.memberSince || "2024"} />
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={handleFollowToggle}
              className={`flex-1 rounded-2xl py-3 text-sm font-extrabold transition-all flex items-center justify-center gap-1.5 shadow-sm ${following
                ? "bg-secondary text-foreground border border-border"
                : "bg-indigo-brand text-white hover:opacity-95"
                }`}
            >
              {following ? <><UserCheck className="h-4 w-4 text-emerald-600" /> Following</> : <><UserPlus className="h-4 w-4" /> Follow Seller</>}
            </button>
            <button
              onClick={handleShare}
              className="rounded-2xl border border-border bg-card px-4 py-3 text-sm font-bold text-foreground hover:bg-secondary flex items-center gap-1.5"
            >
              <Share2 className="h-4 w-4 text-indigo-brand" /> Share
            </button>
            <button
              onClick={handleMessageSeller}
              className="rounded-2xl border border-border bg-card px-4 py-3 text-sm font-bold text-foreground hover:bg-secondary"
            >
              Message
            </button>
          </div>

          {reported && (
            <p className="mt-3 rounded-2xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
              Report received. Our team will review shortly.
            </p>
          )}
          {blocked && (
            <p className="mt-3 rounded-2xl bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive">
              You have blocked this seller. You won't see their listings.
            </p>
          )}
        </div>

        <div className="mt-6 px-4 md:mx-auto md:max-w-[1440px] md:px-6 md:pb-16">
          <h3 className="mb-3 text-sm font-extrabold md:text-lg">Listings from {currentSeller.name}</h3>
          {active.length === 0 ? (
            <EmptyState title="No active listings" body="This seller has no active listings right now." />
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4 lg:grid-cols-5">
              {active.map((p) => <ProductCard key={p.id} p={p} />)}
            </div>
          )}
        </div>

      </div>
    </MobileFrame>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card py-2.5 shadow-sm">
      <p className="text-sm font-extrabold">{value}</p>
      <p className="text-[11px] font-semibold text-muted-foreground">{label}</p>
    </div>
  );
}
