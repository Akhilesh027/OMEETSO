import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import { getListing, getAnalytics, type Listing, type ListingAnalytics, subscribe } from "@/lib/listings";
import { Eye, Heart, MessageCircle, Phone, Tag, Share2, Sparkles, ChevronRight, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/listing/$id/analytics")({
  head: () => ({ meta: [{ title: "Listing analytics — Omeetso" }] }),
  component: Analytics,
});

function Analytics() {
  const { id } = Route.useParams();
  const [l, setL] = useState<Listing | undefined>();
  const [a, setA] = useState<ListingAnalytics | undefined>();
  useEffect(() => {
    const refresh = () => { setL(getListing(id)); setA(getAnalytics(id)); };
    refresh();
    const unsub = subscribe(refresh);
    return () => { unsub; };
  }, [id]);

  if (!l || !a) return (
    <MobileFrame><div className="min-h-dvh bg-background"><BackBar title="Analytics" /><p className="p-6 text-center text-sm text-muted-foreground">Listing not found.</p></div></MobileFrame>
  );

  const maxDaily = Math.max(1, ...a.daily.map((d) => d.views));
  const viewToChat = a.views > 0 ? Math.round((a.chats / a.views) * 100) : 0;

  const stat = (label: string, value: number | string, Icon: typeof Eye) => (
    <div className="rounded-2xl border border-border bg-card p-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <p className="mt-1 text-lg font-extrabold">{typeof value === "number" ? value.toLocaleString("en-IN") : value}</p>
    </div>
  );

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-16">
        <BackBar title="Listing analytics" />
        <div className="space-y-4 p-4">
          <div className="rounded-2xl border border-border bg-card p-3">
            <p className="text-xs text-muted-foreground">Listing</p>
            <p className="line-clamp-1 text-sm font-bold">{l.title}</p>
          </div>

          {a.impressions === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
              <TrendingUp className="mx-auto h-6 w-6 text-primary" />
              <p className="mt-2 font-semibold text-foreground">No performance data yet</p>
              <p className="mt-1 text-xs">Once your listing goes live, impressions and buyer interactions will appear here.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2">
                {stat("Impressions", a.impressions, Eye)}
                {stat("Views", a.views, Eye)}
                {stat("Saves", a.saves, Heart)}
                {stat("Chats", a.chats, MessageCircle)}
                {stat("Calls", a.calls, Phone)}
                {stat("Offers", a.offers, Tag)}
                {stat("Shares", a.shares, Share2)}
                {stat("View → Chat", `${viewToChat}%`, TrendingUp)}
              </div>

              <div className="rounded-2xl border border-border bg-card p-4">
                <p className="text-xs font-semibold text-muted-foreground">Views over last 7 days</p>
                <div className="mt-3 flex h-24 items-end gap-1.5">
                  {a.daily.map((d) => (
                    <div key={d.d} className="flex flex-1 flex-col items-center gap-1">
                      <div className="w-full rounded-t-md bg-primary/80" style={{ height: `${(d.views / maxDaily) * 100}%` }} />
                      <span className="text-[10px] text-muted-foreground">{d.d}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4">
                <p className="text-xs font-semibold text-muted-foreground">Top viewer areas</p>
                <ul className="mt-2 space-y-2">
                  {a.topAreas.map((t) => (
                    <li key={t.area} className="flex items-center gap-2">
                      <span className="w-24 text-xs font-semibold">{t.area}</span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                        <div className="h-full bg-primary" style={{ width: `${t.pct}%` }} />
                      </div>
                      <span className="w-8 text-right text-[11px] font-semibold text-muted-foreground">{t.pct}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          <Link to="/promote/placeholder"
            className="flex items-center justify-between rounded-2xl border border-yellow-brand/40 bg-yellow-brand/10 px-4 py-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-brand" />
              <div>
                <p className="text-sm font-bold">Boost this listing</p>
                <p className="text-[11px] text-muted-foreground">Reach more nearby buyers</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </MobileFrame>
  );
}
