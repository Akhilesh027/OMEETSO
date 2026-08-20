import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import { StatCell, MiniBars, SectionTitle } from "@/components/omeetso/revenue";
import { getPromotion } from "@/lib/revenue";

export const Route = createFileRoute("/promotions/$id/analytics")({
  head: () => ({ meta: [{ title: "Promotion analytics — Omeetso" }] }),
  component: PromotionAnalytics,
});

function PromotionAnalytics() {
  const { id } = useParams({ from: "/promotions/$id/analytics" });
  const p = getPromotion(id);
  if (!p) return (
    <MobileFrame>
      <div className="min-h-dvh p-6 text-center">
        <p className="mt-16 text-sm text-muted-foreground">Promotion not found.</p>
        <Link to="/promotions" className="mt-3 inline-block rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">Back</Link>
      </div>
    </MobileFrame>
  );
  const a = p.analytics;
  const rate = a.views > 0 ? Math.round((a.chats / a.views) * 100) : 0;

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-16">
        <BackBar title="Analytics" />
        <div className="mx-4 mt-2">
          <SectionTitle>Performance overview</SectionTitle>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <StatCell label="Impressions" value={a.impressions.toLocaleString()} />
            <StatCell label="Product views" value={a.views.toLocaleString()} />
            <StatCell label="Saves" value={a.saves.toLocaleString()} />
            <StatCell label="Chats" value={a.chats.toLocaleString()} />
            <StatCell label="Calls" value={a.calls.toLocaleString()} />
            <StatCell label="Offers" value={a.offers.toLocaleString()} />
            <StatCell label="Shares" value={a.shares.toLocaleString()} />
            <StatCell label="View → chat" value={`${rate}%`} />
          </div>
        </div>

        <div className="mx-4 mt-4 space-y-3">
          <SectionTitle>Views by day</SectionTitle>
          <MiniBars data={a.daily.map((d) => ({ d: d.d, v: d.views }))} ariaLabel="Views by day" />

          <SectionTitle>Organic vs promoted</SectionTitle>
          <div className="rounded-2xl border border-border bg-card p-3 text-xs">
            <Row label="Organic views" value={a.organicViews.toLocaleString()} />
            <Row label="Promoted views" value={a.promotedViews.toLocaleString()} />
          </div>

          <SectionTitle>Top areas</SectionTitle>
          <div className="rounded-2xl border border-border bg-card p-3 text-xs space-y-2">
            {a.byArea.map((x) => (
              <div key={x.area}>
                <div className="flex justify-between text-[11px]"><span>{x.area}</span><span>{x.pct}%</span></div>
                <div className="mt-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${x.pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          <SectionTitle>By placement</SectionTitle>
          <div className="rounded-2xl border border-border bg-card p-3 text-xs">
            {a.byPlacement.map((x) => (
              <Row key={x.id} label={x.id.replaceAll("_", " ")} value={x.imp.toLocaleString()} />
            ))}
          </div>
        </div>

        <p className="mt-4 px-4 text-[10px] text-muted-foreground">
          Promotion analytics are based on sample frontend data.
        </p>
      </div>
    </MobileFrame>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-0.5"><p className="text-[11px] text-muted-foreground">{label}</p><p className="text-xs font-semibold">{value}</p></div>
  );
}
