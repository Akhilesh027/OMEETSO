import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import { EmptyBlock, RatingStars } from "@/components/omeetso/account";
import { computeBreakdown, listReviews, markReviewHelpful, subscribeAccount, timeAgo, type ReviewKind } from "@/lib/account";
import { Star, ThumbsUp, Flag, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/reviews/")({
  head: () => ({ meta: [
    { title: "Reviews and ratings — Omeetso" },
    { name: "description", content: "See reviews and ratings from Omeetso buyers, sellers and stores." },
  ]}),
  component: ReviewsList,
});

const TABS: { id: ReviewKind | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "buyer", label: "Buyer" },
  { id: "seller", label: "Seller" },
  { id: "store", label: "Store" },
];

function ReviewsList() {
  const [, setTick] = useState(0);
  const [tab, setTab] = useState<ReviewKind | "all">("all");
  useEffect(() => { const u = subscribeAccount(() => setTick((n) => n + 1)); return () => { u(); }; }, []);
  const list = useMemo(() => {
    const l = listReviews().filter((r) => r.moderation === "published");
    return tab === "all" ? l : l.filter((r) => r.kind === tab);
  }, [tab]);

  const breakdown = useMemo(() => computeBreakdown(tab === "all" ? undefined : tab), [tab]);

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-16 md:mx-auto md:max-w-[960px] md:px-6 md:pb-12">
        <BackBar title="Reviews & ratings" right={<Link to="/reviews/new" className="text-xs font-semibold text-primary">Write review</Link>} />
        <div className="flex gap-2 overflow-x-auto px-4 pb-1">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} aria-pressed={tab === t.id}
              className={cn("shrink-0 rounded-full border px-3 py-1 text-xs font-semibold",
                tab === t.id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card")}>
              {t.label}
            </button>
          ))}
        </div>

        {breakdown.total > 0 && (
          <div className="mx-4 mt-2 rounded-2xl bg-card p-3 card-elev">
            <div className="flex items-center gap-3">
              <div className="text-center">
                <p className="text-3xl font-extrabold">{breakdown.avg}</p>
                <div className="mt-0.5"><RatingStars value={Math.round(breakdown.avg)} size={14} /></div>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{breakdown.total} reviews</p>
              </div>
              <div className="flex-1">
                {breakdown.dist.map((d) => (
                  <div key={d.star} className="flex items-center gap-2 text-[11px]">
                    <span className="w-3 text-right">{d.star}</span>
                    <Star className="h-3 w-3 fill-yellow-brand text-yellow-brand" />
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                      <div className="h-full bg-yellow-brand" style={{ width: `${d.pct}%` }} aria-label={`${d.pct}% ${d.star} stars`} />
                    </div>
                    <span className="w-8 text-right text-muted-foreground">{d.pct}%</span>
                  </div>
                ))}
                <p className="sr-only">Rating breakdown: {breakdown.dist.map((d) => `${d.star} stars ${d.pct}%`).join(", ")}</p>
              </div>
            </div>
            {Object.keys(breakdown.catAvg).length > 0 && (
              <div className="mt-3 border-t border-border pt-2 text-[11px]">
                <p className="mb-1 font-bold text-muted-foreground uppercase">Category scores</p>
                <div className="grid grid-cols-2 gap-1">
                  {Object.entries(breakdown.catAvg).map(([k, v]) => (
                    <div key={k} className="flex justify-between capitalize">
                      <span>{k.replaceAll("_", " ")}</span>
                      <span className="font-bold">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-3 space-y-2 px-4">
          {list.length === 0 ? (
            <EmptyBlock icon={Star} title="No reviews yet"
              body="Reviews appear after eligible interactions such as accepted offers."
              cta="Write a review" to="/reviews/new" />
          ) : list.map((r) => (
            <div key={r.id} className="rounded-2xl bg-card p-3 card-elev">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold">{r.reviewerName}</p>
                <p className="text-[11px] text-muted-foreground">{timeAgo(r.createdAt)}</p>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <RatingStars value={r.overall} size={14} />
                {r.verified && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700"><ShieldCheck className="h-3 w-3" /> Verified interaction</span>}
                <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase">{r.kind}</span>
              </div>
              <p className="mt-1 text-sm">{r.comment}</p>
              {r.productRef && <p className="mt-1 text-[11px] text-muted-foreground">About: {r.productRef}</p>}
              <div className="mt-2 flex items-center justify-between text-[11px]">
                <button onClick={() => markReviewHelpful(r.id)} className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 font-semibold">
                  <ThumbsUp className="h-3 w-3" /> Helpful ({r.helpful})
                </button>
                <Link to="/reviews/report/$id" params={{ id: r.id }} className="inline-flex items-center gap-1 font-semibold text-rose-700">
                  <Flag className="h-3 w-3" /> Report
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MobileFrame>
  );
}
