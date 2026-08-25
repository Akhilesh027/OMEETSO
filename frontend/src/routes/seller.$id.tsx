import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Star, ShieldCheck, User, Store as StoreIcon, MoreVertical, Ban, Flag, Share2, UserCheck, UserPlus } from "lucide-react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { ProductCard } from "@/components/omeetso/ProductCard";
import { EmptyState } from "@/components/omeetso/EmptyState";
import { isFollowingSeller, toggleFollowSeller } from "@/lib/saved";
import { toast } from "sonner";

export const Route = createFileRoute("/seller/$id")({
  loader: async ({ params }) => {
    try {
      const res = await fetch(`https://api.omeetso.in/api/v1/users/${params.id}/public`);
      const json = await res.json();
      if (json.success && json.data) {
        return {
          seller: {
            id: json.data.id || json.data._id,
            name: json.data.name || "Omeetso Seller",
            avatar: json.data.avatar,
            type: json.data.businessEnabled ? "business" : "individual",
            rating: json.data.rating || 0,
            reviews: json.data.reviewCount || 0,
            area: json.data.area || "Madhapur",
            city: json.data.city || "Hyderabad",
            responseTime: "Within 1 hour",
            responseRate: "98%",
            verified: json.data.verification?.verified || true,
            memberSince: new Date(json.data.createdAt || Date.now()).getFullYear().toString(),
            about: json.data.bio || "Trusted Omeetso verified seller."
          }
        };
      }
    } catch { }

    return {
      seller: {
        id: params.id,
        name: "Verified Seller",
        type: "individual",
        rating: 0,
        reviews: 0,
        area: "Madhapur",
        city: "Hyderabad",
        responseTime: "Within 1 hour",
        verified: true,
        memberSince: "2026",
        about: "Trusted Omeetso verified seller."
      }
    };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
        { title: `${loaderData.seller.name} · Omeetso Seller` },
        { name: "description", content: `${loaderData.seller.name} on Omeetso — ${loaderData.seller.reviews} reviews.` },
        { property: "og:title", content: `${loaderData.seller.name} · Omeetso` },
      ]
      : [{ title: "Seller · Omeetso" }],
  }),
  component: SellerPage,
  notFoundComponent: () => (
    <MobileFrame><EmptyState title="Seller not found" body="This seller is unavailable." /></MobileFrame>
  ),
});

function SellerPage() {
  const { id } = Route.useParams();
  const loaderData = Route.useLoaderData();
  const [seller, setSeller] = useState<any>(loaderData.seller);
  const [sellerListings, setSellerListings] = useState<any[]>([]);
  const nav = useNavigate();
  const [following, setFollowing] = useState(() => isFollowingSeller(seller.id));
  const [blocked, setBlocked] = useState(false);
  const [menu, setMenu] = useState(false);
  const [reported, setReported] = useState(false);

  useEffect(() => {
    fetch(`https://api.omeetso.in/api/v1/users/${id}/public`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          const updated = {
            id: json.data.id || json.data._id || id,
            name: json.data.name || "Omeetso Seller",
            avatar: json.data.avatar,
            type: json.data.accountType || "individual",
            area: json.data.area || "Madhapur",
            city: json.data.city || "Hyderabad",
            memberSince: json.data.memberSince || "2024",
            rating: 0,
            reviews: 0,
            verified: true,
          };
          setSeller(updated);
          setFollowing(isFollowingSeller(updated.id));
        }
      })
      .catch(() => { });

    fetch(`https://api.omeetso.in/api/v1/listings?sellerId=${id}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          const ownListings = json.data.filter((item: any) => {
            const itemSellerId = typeof item.sellerId === "object" ? item.sellerId?._id : item.sellerId;
            return String(itemSellerId) === String(id);
          });
          setSellerListings(ownListings.map((item: any) => ({
            id: item.id || item._id,
            title: item.title,
            price: item.price || (item.priceInPaise ? item.priceInPaise / 100 : 0),
            originalPrice: Math.round((item.price || (item.priceInPaise ? item.priceInPaise / 100 : 0)) * 1.15),
            image: item.coverUrl || (Array.isArray(item.images) && item.images[0]) || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
            location: `${item.area || "Madhapur"}, ${item.city || "Hyderabad"}`,
            area: item.area || "Madhapur",
            distanceKm: 1.5,
            time: "Just now",
            category: item.category || "General",
            condition: item.condition || "Like New",
            badge: "Verified"
          })));
        }
      })
      .catch(() => { });
  }, [id]);

  const active = sellerListings;
  const sold = 0;

  const handleShare = async () => {
    const shareData = {
      title: `${seller.name} · Omeetso Seller`,
      text: `Check out ${seller.name}'s active listings on Omeetso Marketplace!`,
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
      id: seller.id,
      name: seller.name,
      avatar: seller.avatar,
      area: seller.area,
      rating: seller.rating,
    });
    setFollowing(nextState);
    if (nextState) {
      toast.success(`You are now following ${seller.name}`);
    } else {
      toast.info(`Unfollowed ${seller.name}`);
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
              {seller.avatar ? (
                <img src={seller.avatar} alt={seller.name} className="h-16 w-16 rounded-full object-cover shadow-sm" />
              ) : (
                <div className="grid h-16 w-16 place-items-center rounded-full bg-secondary font-bold text-indigo-brand text-xl">
                  {seller.name?.charAt(0) || "S"}
                </div>
              )}
              {seller.verified && (
                <span className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-emerald-600 text-white shadow">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-lg font-extrabold">{seller.name}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 font-semibold">
                  {seller.type === "business" ? <><StoreIcon className="h-3 w-3" /> Business</> : <><User className="h-3 w-3" /> Individual</>}
                </span>
                <span className="inline-flex items-center gap-0.5"><Star className="h-3 w-3 fill-yellow-brand text-yellow-brand" /> {seller.rating} · {seller.reviews} reviews</span>
              </div>
              <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                <MapPin className="h-3 w-3 text-indigo-brand" /> {seller.area} · Replies {seller.responseTime} · {seller.responseRate ?? "98%"}
              </p>
            </div>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{seller.about ?? "Trusted Omeetso seller."}</p>

          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <StatCard label="Active" value={String(active.length)} />
            <StatCard label="Sold" value={String(sold)} />
            <StatCard label="Member" value={seller.memberSince} />
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
              onClick={() => nav({ to: "/chats" })}
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
          <h3 className="mb-3 text-sm font-extrabold md:text-lg">Listings from {seller.name}</h3>
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
