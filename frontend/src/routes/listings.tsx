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
  { key: "sold", label: "Sold", match: (l) => l.status === "sold" || l.status === "SOLD" },
  { key: "expired", label: "Expired", match: (l) => l.status === "expired" || l.status === "EXPIRED" },
  { key: "rejected", label: "Rejected", match: (l) => l.status === "rejected" || l.status === "REJECTED" },
];

function MyListings() {
  const [tab, setTab] = useState("active");
  const [listings, setListings] = useState<Listing[]>([]);
  const [drafts, setDrafts] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      const myItems = await fetchLiveUserListings();
      setListings(myItems);
      setDrafts(listDrafts().length);
    };
    loadData();
    const unsub = subscribe(async () => {
      const myItems = await fetchLiveUserListings();
      setListings(myItems);
    });
    return () => {
      unsub();
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
        <div className="sticky top-0 z-10 border-b border-border bg-card md:top-16">
          <div className="mx-auto md:max-w-[1240px] md:px-6">
            <div className="flex items-center justify-between px-3 pt-3 md:px-0 md:pt-6">
              <h1 className="text-lg font-extrabold md:text-2xl">My Listings</h1>
              <Link to="/sell" className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground md:px-4 md:py-2 md:text-sm">
                <Plus className="h-3.5 w-3.5 md:h-4 md:w-4" /> New listing
              </Link>
            </div>
            <div className="mt-2 flex gap-1 overflow-x-auto px-2 md:mt-4 md:px-0">
              {TABS.map((t) => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={`shrink-0 border-b-2 px-3 py-2.5 text-xs font-semibold md:text-sm ${tab === t.key ? "border-navy text-navy" : "border-transparent text-muted-foreground"}`}>
                  {t.label} <span className="ml-1 rounded-full bg-secondary px-1.5 py-0.5 text-[10px]">{counts[t.key] ?? 0}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 space-y-3 md:mx-auto md:max-w-[1240px] md:space-y-0 md:px-6 md:py-6 md:grid md:grid-cols-2 md:gap-4 lg:grid-cols-3">
          {tab === "drafts" ? (
            <DraftPreview />
          ) : visible.length === 0 ? (
            <div className="md:col-span-full"><EmptyForTab tab={tab} /></div>
          ) : (
            visible.map((l) => {
              const a = getAnalytics(l.id);
              return (
                <ListingCard key={l.id} l={l} viewsIcon extra={{
                  views: a.views, saves: a.saves, chats: a.chats, offers: a.offers,
                }} />
              );
            })
          )}
        </div>


        <BottomNav />
      </div>
    </MobileFrame>
  );
}

function DraftPreview() {
  const drafts = listDrafts();
  if (drafts.length === 0)
    return <EmptyState icon={<Package className="h-6 w-6 text-primary" />} title="No drafts" body="Save unfinished listings as drafts and pick up later." ctaLabel="Start Selling" onCta={() => (window.location.href = "/sell")} />;
  return (
    <>
      {drafts.map((d) => (
        <Link key={d.id} to="/sell/drafts"
          className="block rounded-2xl border border-border bg-card p-3">
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
