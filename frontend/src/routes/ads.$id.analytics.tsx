import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import { StatCell, MiniBars, SectionTitle } from "@/components/omeetso/revenue";
import { getCampaign, formatINR } from "@/lib/revenue";

export const Route = createFileRoute("/ads/$id/analytics")({
  head: () => ({ meta: [{ title: "Campaign analytics — Omeetso" }] }),
  component: Analytics,
});

function Analytics() {
  const { id } = useParams({ from: "/ads/$id/analytics" });
  const c = getCampaign(id);
  if (!c) return (
    <MobileFrame>
      <div className="min-h-dvh p-6 text-center pt-16">
        <p className="text-sm text-muted-foreground">Campaign not found.</p>
        <Link to="/ads" className="mt-3 inline-block rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">Back</Link>
      </div>
    </MobileFrame>
  );
  const a = c.analytics;
  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-16">
        <BackBar title="Analytics" />
        <div className="mx-4 mt-2">
          <SectionTitle>Performance</SectionTitle>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <StatCell label="Impressions" value={a.impressions.toLocaleString()} />
            <StatCell label="Reach" value={a.reach.toLocaleString()} />
            <StatCell label="Clicks" value={a.clicks.toLocaleString()} />
            <StatCell label="CTR" value={`${a.ctr}%`} />
            <StatCell label="Product views" value={a.productViews.toLocaleString()} />
            <StatCell label="Store visits" value={a.storeVisits.toLocaleString()} />
            <StatCell label="Chats" value={a.chats.toLocaleString()} />
            <StatCell label="Calls" value={a.calls.toLocaleString()} />
            <StatCell label="Saves" value={a.saves.toLocaleString()} />
            <StatCell label="Followers" value={a.followers.toLocaleString()} />
            <StatCell label="CPC" value={formatINR(a.cpc)} />
            <StatCell label="Cost per chat" value={formatINR(a.cpChat)} />
          </div>
        </div>
        <div className="mx-4 mt-4">
          <SectionTitle>Budget</SectionTitle>
          <div className="mt-2 rounded-2xl border border-border bg-card p-3 text-xs">
            <Row label="Spent" value={formatINR(a.budgetSpent)} />
            <Row label="Remaining" value={formatINR(a.remaining)} />
            <div className="mt-2 h-2 rounded-full bg-secondary overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${Math.min(100, (a.budgetSpent / (a.budgetSpent + a.remaining || 1)) * 100)}%` }} />
            </div>
          </div>
        </div>
        <div className="mx-4 mt-4 space-y-3">
          <SectionTitle>Daily impressions</SectionTitle>
          <MiniBars data={a.daily.map((d) => ({ d: d.d, v: d.imp }))} ariaLabel="Impressions by day" />

          <SectionTitle>By area</SectionTitle>
          <div className="rounded-2xl border border-border bg-card p-3 text-xs space-y-2">
            {a.byArea.map((x) => (
              <div key={x.area}>
                <div className="flex justify-between"><span>{x.area}</span><span>{x.pct}%</span></div>
                <div className="mt-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${x.pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          <SectionTitle>By placement</SectionTitle>
          <div className="rounded-2xl border border-border bg-card p-3 text-xs space-y-1">
            {a.byPlacement.map((x) => (
              <Row key={x.id} label={x.id.replaceAll("_", " ")} value={`${x.imp.toLocaleString()} imp • ${x.clicks} clicks`} />
            ))}
          </div>
        </div>
        <p className="mt-4 px-4 text-[10px] text-muted-foreground">Campaign analytics use sample frontend data.</p>
      </div>
    </MobileFrame>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-0.5"><p className="text-[11px] text-muted-foreground">{label}</p><p className="text-xs font-semibold text-right">{value}</p></div>
  );
}
