import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import { BottomNav } from "@/components/omeetso/BottomNav";
import { ProductCard } from "@/components/omeetso/ProductCard";
import { EmptyState } from "@/components/omeetso/EmptyState";
import { useSavedIds } from "@/hooks/useSaved";
import { getPublicListingsApi } from "@/api/listings.api";
import { TrendingDown, Bookmark, Loader2 } from "lucide-react";

export const Route = createFileRoute("/saved")({
  head: () => ({
    meta: [
      { title: "Saved · Omeetso" },
      { name: "description", content: "Your saved products and price-drop alerts on Omeetso." },
      { property: "og:title", content: "Saved · Omeetso" },
      { property: "og:description", content: "Everything you've saved for later." },
    ],
  }),
  component: SavedPage,
});

function SavedPage() {
  const ids = useSavedIds();
  const [tab, setTab] = useState<"products" | "stores" | "alerts">("products");
  const [savedListings, setSavedListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    if (ids.length === 0) {
      setSavedListings([]);
      return;
    }
    setLoading(true);
    getPublicListingsApi().then((res) => {
      setLoading(false);
      if (res.success && res.data) {
        const matched = res.data.filter((p: any) => ids.includes(p.id || p._id));
        setSavedListings(matched.map((item: any) => ({
          id: item.id || item._id,
          title: item.title,
          price: item.price || (item.priceInPaise ? item.priceInPaise / 100 : 0),
          originalPrice: Math.round((item.price || (item.priceInPaise ? item.priceInPaise / 100 : 0)) * 1.15),
          image: item.coverUrl || (Array.isArray(item.images) && item.images[0]) || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
          location: `${item.area || "Madhapur"}, ${item.city || "Hyderabad"}`,
          time: "Saved",
          category: item.category || "General",
          condition: item.condition || "Like New",
          badge: "Saved"
        })));
      }
    });
  }, [ids]);

  const saved = savedListings;

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-24">
        <BackBar title="Saved" />
        <div className="flex gap-1 border-b border-border bg-card px-3">
          {(["products", "stores", "alerts"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={
                "relative flex-1 px-2 py-3 text-xs font-semibold capitalize " +
                (tab === t ? "text-primary" : "text-muted-foreground")
              }
            >
              {t === "alerts" ? "Price drops" : t}
              {tab === t && <span className="absolute inset-x-4 -bottom-px h-0.5 rounded-full bg-primary" />}
            </button>
          ))}
        </div>

        <div className="p-4 md:mx-auto md:max-w-[1440px] md:px-6 md:py-8">
          {tab === "products" && (
            saved.length === 0 ? (
              <EmptyState
                icon={<Bookmark className="h-6 w-6 text-primary" />}
                title="No saved products yet"
                body="Tap the heart on any listing to save it here."
                ctaLabel="Browse products"
                onCta={() => nav({ to: "/home" })}
              />
            ) : (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4 lg:grid-cols-5">
                {saved.map((p) => <ProductCard key={p.id} p={p} />)}
              </div>
            )
          )}

          {tab === "stores" && (
            <EmptyState
              title="No saved stores"
              body="Save your favourite local stores to revisit them anytime."
              ctaLabel="Explore stores"
              onCta={() => nav({ to: "/stores" })}
            />
          )}
          {tab === "alerts" && (
            saved.length === 0 ? (
              <EmptyState
                title="No price-drop alerts"
                body="Save products first to receive alerts when their price drops."
              />
            ) : (
              <div className="space-y-3">
                {saved.slice(0, 3).map((p) => (
                  <Link
                    key={p.id}
                    to="/product/$id"
                    params={{ id: p.id }}
                    className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-3"
                  >
                    <img src={p.image} alt="" className="h-14 w-14 rounded-xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-bold">{p.title}</p>
                      <p className="text-xs text-emerald-800">Price dropped by ₹500 · now nearby</p>
                    </div>
                    <TrendingDown className="h-5 w-5 text-emerald-700" />
                  </Link>
                ))}
              </div>
            )
          )}
        </div>
        <BottomNav />
      </div>
    </MobileFrame>
  );
}
