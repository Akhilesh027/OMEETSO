import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import { EmptyState } from "@/components/omeetso/EmptyState";
import {
  listListings, seedIfEmpty, formatINR, timeAgo, type Listing,
} from "@/lib/listings";
import { getAnalytics } from "@/lib/listings";
import { Search, Filter, Package, ChevronRight, Zap, CheckCircle2, AlertCircle, Eye, MousePointerClick } from "lucide-react";
import { cn } from "@/lib/utils";
import { getUserAccessToken } from "@/api/auth.api";

export const Route = createFileRoute("/promotions/listings")({
  head: () => ({ meta: [{ title: "Select a Listing to Boost — Omeetso" }] }),
  component: SelectListing,
});

const FILTERS = [
  { id: "all", label: "All Items" },
  { id: "most_viewed", label: "Most Viewed" },
  { id: "not_promoted", label: "Not Promoted" },
  { id: "previously", label: "Currently Boosted" },
];

function SelectListing() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [f, setF] = useState("all");
  const nav = useNavigate();

  useEffect(() => {
    seedIfEmpty();
    const local = listListings();

    // Fetch live backend listings
    const token = getUserAccessToken();
    fetch("https://api.omeetso.in/api/v1/listings", {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const mapped = json.data.map((item: any) => ({
            id: item.id || item._id,
            title: item.title,
            price: item.price || (item.priceInPaise ? item.priceInPaise / 100 : 0),
            images: item.images || [item.coverUrl || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400"],
            cover: 0,
            area: item.area || "Madhapur",
            city: item.city || "Hyderabad",
            category: item.category || "General",
            status: (item.status || "active").toLowerCase(),
            boost: item.boost || { active: false },
            views: item.viewsCount || Math.floor(12 + Math.random() * 88),
            chats: item.chatsCount || Math.floor(2 + Math.random() * 15)
          }));
          setItems(mapped);
        } else {
          setItems(local);
        }
      })
      .catch(() => {
        setItems(local);
      })
      .finally(() => setLoading(false));
  }, []);

  const eligible = useMemo(() => items.filter((l) => l.status === "active" || l.status === "approved"), [items]);
  const filtered = useMemo(() => {
    let list = eligible.filter((l) => (l.title || "").toLowerCase().includes(q.toLowerCase()));
    if (f === "most_viewed") list = list.slice().sort((x, y) => (y.views || 0) - (x.views || 0));
    if (f === "not_promoted") list = list.filter((l) => !l.boost?.active);
    if (f === "previously") list = list.filter((l) => !!l.boost?.active);
    return list;
  }, [eligible, q, f]);

  const ineligible = useMemo(() => items.filter((l) => l.status !== "active" && l.status !== "approved"), [items]);

  const handleSelect = (listingId: string) => {
    nav({
      to: "/ads/new",
      search: { id: "", listingId, step: 1 } as any
    });
  };

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-28 md:mx-auto md:max-w-[720px] md:px-6 md:pb-12 font-sans">
        <BackBar title="Select Item to Boost" />

        <div className="px-4 pt-2 pb-3">
          <p className="text-xs text-muted-foreground">
            Choose an active item from your catalog to rank #1 in search results and boost buyer leads.
          </p>
        </div>

        <div className="px-4">
          <div className="flex items-center gap-2.5 rounded-2xl border border-border bg-card px-3.5 py-2.5 shadow-sm">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search your listings by title..."
              className="w-full bg-transparent text-xs font-semibold outline-none text-foreground placeholder:text-muted-foreground"
              aria-label="Search listings"
            />
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            <Filter className="mt-1.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            {FILTERS.map((x) => (
              <button
                key={x.id}
                onClick={() => setF(x.id)}
                aria-pressed={f === x.id}
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1 text-xs font-bold transition-all",
                  f === x.id ? "border-indigo-brand bg-indigo-brand text-white shadow-sm" : "border-border bg-card text-foreground",
                )}
              >
                {x.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 space-y-3 px-4">
          {loading ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              Loading your items...
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<Package className="h-6 w-6" />}
              title="No eligible listings found"
              body="Only active listings can be boosted. Create or activate a listing first."
              ctaLabel="Create New Listing"
              onCta={() => nav({ to: "/sell/quick" })}
            />
          ) : (
            filtered.map((l) => {
              const img = l.images?.[l.cover || 0] || l.images?.[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400";
              const isBoosted = l.boost?.active;

              return (
                <div
                  key={l.id}
                  onClick={() => handleSelect(l.id)}
                  className="flex items-center gap-3.5 rounded-2xl border border-border bg-card p-3.5 text-left cursor-pointer hover:border-indigo-brand/50 transition-all shadow-sm group"
                >
                  <div className="h-16 w-16 rounded-xl bg-secondary overflow-hidden shrink-0 border border-border">
                    <img src={img} alt={l.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-xs font-extrabold text-foreground">{l.title}</p>
                    <p className="text-xs font-black text-indigo-brand mt-0.5">{formatINR(l.price)}</p>
                    <p className="text-[11px] text-muted-foreground font-medium mt-0.5 truncate">
                      {l.area}, {l.city} • <Eye className="inline h-3 w-3 text-muted-foreground" /> {l.views || 0} views
                    </p>

                    <div className="mt-1 flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${isBoosted
                        ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                        : "bg-indigo-500/10 text-indigo-600 border border-indigo-500/20"
                        }`}>
                        <Zap className="h-3 w-3" />
                        {isBoosted ? "Currently Boosted" : "Ready for Boost"}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <button className="rounded-xl bg-indigo-brand text-white px-3 py-2 text-xs font-extrabold shadow-sm flex items-center gap-1 group-hover:bg-indigo-700 transition-colors">
                      Boost <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {ineligible.length > 0 && (
          <div className="mt-6 px-4">
            <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Ineligible Listings ({ineligible.length})</p>
            <div className="mt-2 space-y-2">
              {ineligible.map((l) => (
                <div key={l.id} className="rounded-2xl border border-dashed border-border bg-card/60 p-3 text-xs text-muted-foreground flex items-center justify-between">
                  <div>
                    <p className="font-bold text-foreground line-clamp-1">{l.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Must be approved & active before boosting ({l.status.replace("_", " ")})</p>
                  </div>
                  <Link to="/listings" className="shrink-0 text-xs font-extrabold text-indigo-brand hover:underline">
                    Manage →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </MobileFrame>
  );
}
