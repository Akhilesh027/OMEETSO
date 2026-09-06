import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { LocationTopBar } from "@/components/omeetso/TopBar";
import { BottomNav } from "@/components/omeetso/BottomNav";
import { EmptyState } from "@/components/omeetso/EmptyState";
import { ListingCard } from "@/components/sell/ListingCard";
import { listListings, listDrafts, getAnalytics, fetchLiveUserListings, subscribe, type ListingStatus, type Listing, timeAgo } from "@/lib/listings";
import { Package, Plus } from "lucide-react";

export const Route = createFileRoute("/listings")({
  head: () => ({ meta: [{ title: "My Listings — Omeetso" }] }),
  component: MyListings,
});

const TABS: { key: string; label: string; match: (l: Listing) => boolean }[] = [
  {
    key: "active",
    label: "Active",
    match: (l) =>
      l.status === "active" ||
      l.status === "approved" ||
      l.status === "APPROVED" ||
      l.status === "paused" ||
      l.status === "requires_changes",
  },
  {
    key: "review",
    label: "Under Review",
    match: (l) =>
      l.status === "under_review" ||
      l.status === "submitted" ||
      l.status === "pending_review" ||
      l.status === "SUBMITTED" ||
      l.status === "PENDING_REVIEW",
  },
  { key: "drafts", label: "Drafts", match: () => false },
  { key: "sold", label: "Sold", match: (l) => l.status === "sold" || l.status === "SOLD" || (l as any).sold === true || (l as any).isSold === true },
  { key: "expired", label: "Expired", match: (l) => l.status === "expired" || l.status === "EXPIRED" },
  { key: "rejected", label: "Rejected", match: (l) => l.status === "rejected" || l.status === "REJECTED" },
];

function MyListings() {
  const [tab, setTab] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("tab");
      if (q && TABS.some((t) => t.key === q)) return q;
    }
    return "active";
  });
  const [listings, setListings] = useState<Listing[]>([]);
  const [drafts, setDrafts] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      try {
        const myItems = await fetchLiveUserListings();
        if (active) {
          setListings(myItems);
          setDrafts(listDrafts().length);
        }
      } catch (err) {
        console.error("Failed to load listings:", err);
      } finally {
        if (active) {
          // Subtle pause ensures skeleton feels intentional and avoids flicker
          setTimeout(() => setLoading(false), 200);
        }
      }
    };
    loadData();

    const unsub = subscribe(async () => {
      const myItems = await fetchLiveUserListings();
      if (active) setListings(myItems);
    });

    const onListingUpdated = async () => {
      const myItems = await fetchLiveUserListings();
      if (active) setListings(myItems);
    };

    window.addEventListener("omeetso_listing_updated", onListingUpdated);
    window.addEventListener("storage", onListingUpdated);

    return () => {
      active = false;
      unsub();
      window.removeEventListener("omeetso_listing_updated", onListingUpdated);
      window.removeEventListener("storage", onListingUpdated);
    };
  }, []);

  const counts = useMemo(() => {
    const c: Record<string, number> = { drafts };
    for (const t of TABS) if (t.key !== "drafts") c[t.key] = listings.filter(t.match).length;
    return c;
  }, [listings, drafts]);

  const visible = tab === "drafts" ? [] : listings.filter(TABS.find((t) => t.key === tab)!.match);

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-28">
        <LocationTopBar />
        <div className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur-md md:top-16">
          <div className="mx-auto md:max-w-[1240px] md:px-6">
            <div className="flex items-center justify-between px-3 pt-3 md:px-0 md:pt-6">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-extrabold md:text-2xl">My Listings</h1>
                {!loading && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary animate-in fade-in">
                    {listings.length} total
                  </span>
                )}
              </div>
              <Link
                to="/sell"
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-xs font-bold text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] md:px-4 md:py-2 md:text-sm"
              >
                <Plus className="h-3.5 w-3.5 md:h-4 md:w-4" /> New listing
              </Link>
            </div>
            <div className="mt-2 flex gap-1 overflow-x-auto px-2 md:mt-4 md:px-0 scrollbar-none">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`shrink-0 border-b-2 px-3 py-2.5 text-xs font-semibold transition-colors duration-200 md:text-sm ${
                    tab === t.key
                      ? "border-navy text-navy font-bold"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t.label}{" "}
                  <span
                    className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] transition-colors ${
                      tab === t.key ? "bg-navy/10 text-navy font-bold" : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {counts[t.key] ?? 0}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 space-y-3 md:mx-auto md:max-w-[1240px] md:space-y-0 md:px-6 md:py-6 md:grid md:grid-cols-2 md:gap-4 lg:grid-cols-3">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <ListingSkeletonCard key={`skeleton-${i}`} index={i} />
            ))
          ) : tab === "drafts" ? (
            <DraftPreview />
          ) : visible.length === 0 ? (
            <div className="md:col-span-full animate-in fade-in zoom-in-98 duration-300">
              <EmptyForTab tab={tab} />
            </div>
          ) : (
            visible.map((l, idx) => {
              const a = getAnalytics(l.id);
              return (
                <div
                  key={`${tab}-${l.id}`}
                  className="animate-listing-entrance"
                  style={{
                    animationDelay: `${Math.min(idx * 50, 400)}ms`,
                    animationFillMode: "both",
                  }}
                >
                  <ListingCard
                    l={l}
                    viewsIcon
                    extra={{
                      views: a.views,
                      saves: a.saves,
                      chats: a.chats,
                      offers: a.offers,
                    }}
                  />
                </div>
              );
            })
          )}
        </div>

        <BottomNav />
      </div>
    </MobileFrame>
  );
}

function ListingSkeletonCard({ index = 0 }: { index?: number }) {
  return (
    <div
      className="flex gap-3 rounded-2xl border border-border/70 bg-card p-3 shadow-xs animate-in fade-in duration-300"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Thumbnail skeleton with shimmer */}
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted animate-shimmer" />

      {/* Content skeleton with shimmer */}
      <div className="min-w-0 flex-1 space-y-2.5 py-0.5">
        <div className="space-y-1.5">
          <div className="h-4 w-4/5 rounded-md bg-muted animate-shimmer" />
          <div className="h-3.5 w-1/3 rounded-md bg-muted animate-shimmer" />
        </div>

        {/* Status badge & timestamp */}
        <div className="flex items-center gap-2 pt-0.5">
          <div className="h-4 w-20 rounded-full bg-muted animate-shimmer" />
          <div className="h-3 w-16 rounded-md bg-muted animate-shimmer" />
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 pt-1">
          <div className="h-2.5 w-8 rounded bg-muted animate-shimmer" />
          <div className="h-2.5 w-8 rounded bg-muted animate-shimmer" />
          <div className="h-2.5 w-8 rounded bg-muted animate-shimmer" />
          <div className="h-2.5 w-8 rounded bg-muted animate-shimmer" />
        </div>
      </div>
    </div>
  );
}

function DraftPreview() {
  const drafts = listDrafts();
  if (drafts.length === 0)
    return (
      <div className="animate-in fade-in zoom-in-98 duration-300 md:col-span-full">
        <EmptyState
          icon={<Package className="h-6 w-6 text-primary" />}
          title="No drafts"
          body="Save unfinished listings as drafts and pick up later."
          ctaLabel="Start Selling"
          onCta={() => (window.location.href = "/sell")}
        />
      </div>
    );
  return (
    <>
      {drafts.map((d, idx) => (
        <Link
          key={d.id}
          to="/sell/drafts"
          className="animate-listing-entrance block rounded-2xl border border-border bg-card p-3 transition-all duration-200 hover:border-primary/40 hover:shadow-sm"
          style={{ animationDelay: `${idx * 50}ms` }}
        >
          <p className="text-sm font-bold">{d.title ?? "Untitled draft"}</p>
          <p className="text-[11px] text-muted-foreground">
            {d.method === "detailed" ? "Detailed" : "Quick"} · edited {timeAgo(d.updatedAt)}
          </p>
        </Link>
      ))}
    </>
  );
}

function EmptyForTab({ tab }: { tab: string }) {
  const map: Record<string, { title: string; body: string }> = {
    active: { title: "No active listings", body: "Publish a listing to start receiving enquiries." },
    review: { title: "Nothing under review", body: "Submitted listings appear here while we review them." },
    sold: { title: "No sold items yet", body: "When you mark listings as sold, they show up here." },
    expired: { title: "No expired listings", body: "Renew expired listings to bring them back." },
    rejected: { title: "No rejected listings", body: "Rejected listings with resolution steps will appear here." },
  };
  const info = map[tab] ?? { title: "Nothing here yet", body: "" };
  return (
    <EmptyState
      icon={<Package className="h-6 w-6 text-primary" />}
      title={info.title}
      body={info.body}
      ctaLabel={tab === "active" ? "Start Selling" : undefined}
      onCta={tab === "active" ? () => (window.location.href = "/sell") : undefined}
    />
  );
}
