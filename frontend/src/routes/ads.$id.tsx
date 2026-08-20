import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import { CampaignStatusBadge, SectionTitle, ConfirmModal, PreviewSponsoredCard } from "@/components/omeetso/revenue";
import {
  getCampaign, setCampaignStatus, duplicateCampaign, endCampaign, subscribe,
  formatINR, formatDate,
} from "@/lib/revenue";
import { toast } from "sonner";
import {
  PauseCircle, PlayCircle, Copy, XCircle, TrendingUp, Edit3, FileText, AlertCircle,
} from "lucide-react";

export const Route = createFileRoute("/ads/$id")({
  head: () => ({ meta: [{ title: "Campaign details — Omeetso" }] }),
  component: CampaignDetails,
});

function CampaignDetails() {
  const { id } = useParams({ from: "/ads/$id" });
  const nav = useNavigate();
  const [, setTick] = useState(0);
  const [confirm, setConfirm] = useState(false);
  useEffect(() => { const u = subscribe(() => setTick((n) => n + 1)); return () => { u(); }; }, []);

  const c = getCampaign(id);
  if (!c) return (
    <MobileFrame>
      <div className="min-h-dvh p-6 text-center pt-16">
        <p className="text-sm text-muted-foreground">Campaign not found.</p>
        <Link to="/ads" className="mt-3 inline-block rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">Back</Link>
      </div>
    </MobileFrame>
  );

  const toggle = () => {
    if (c.status === "active") { setCampaignStatus(id, "paused"); toast.success("Campaign paused"); }
    else if (c.status === "paused") { setCampaignStatus(id, "active"); toast.success("Campaign resumed"); }
  };

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-24">
        <BackBar title={c.creative.name || "Campaign"} />

        <div className="mx-4 mt-2 rounded-2xl bg-card p-3 card-elev">
          <div className="flex items-center justify-between">
            <p className="text-sm font-extrabold">{c.creative.name || "Untitled"}</p>
            <CampaignStatusBadge status={c.status} />
          </div>
          <p className="text-[11px] text-muted-foreground">ID: {c.id}</p>
        </div>

        {c.status === "under_review" && (
          <div className="mx-4 mt-3 rounded-2xl border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800">
            Your campaign is being reviewed. This usually takes a few hours.
          </div>
        )}
        {c.status === "rejected" && c.rejection && (
          <div className="mx-4 mt-3 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
            <p className="font-bold flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" /> Campaign rejected</p>
            <p className="mt-1"><b>Reason:</b> {c.rejection.reason}</p>
            <p><b>Affected field:</b> {c.rejection.affectedField}</p>
            <p><b>Required correction:</b> {c.rejection.requiredCorrection}</p>
            <div className="mt-2 flex gap-2">
              <Link to="/ads/new" search={{ id: c.id, step: 3 } as any} className="rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground">Edit and Resubmit</Link>
              <button onClick={() => toast.info("Support form coming soon")} className="rounded-full border border-rose-300 px-3 py-1.5 text-xs font-semibold">Contact Support</button>
            </div>
          </div>
        )}

        <div className="mx-4 mt-3">
          <SectionTitle>Creative</SectionTitle>
          <div className="mt-2">
            <PreviewSponsoredCard title={c.creative.headline} subtitle={c.creative.description}
              imageUrl={c.creative.imageUrl} cta={c.creative.cta} advertiser={c.creative.advertiserDisplayName} />
          </div>
        </div>

        <div className="mx-4 mt-3 grid grid-cols-3 gap-2 text-center">
          <Stat label="Impressions" value={c.analytics.impressions.toLocaleString()} />
          <Stat label="Clicks" value={c.analytics.clicks.toLocaleString()} />
          <Stat label="CTR" value={`${c.analytics.ctr}%`} />
          <Stat label="Chats" value={c.analytics.chats.toLocaleString()} />
          <Stat label="Calls" value={c.analytics.calls.toLocaleString()} />
          <Stat label="Spent" value={formatINR(c.amountSpent)} />
        </div>

        <div className="mx-4 mt-4 rounded-2xl border border-border bg-card p-3 text-xs space-y-1">
          <Row label="Objective" value={c.objective.replaceAll("_", " ")} />
          <Row label="Placements" value={c.placements.length + " selected"} />
          <Row label="Areas" value={c.audience.areas.join(", ") || "—"} />
          <Row label="Categories" value={c.audience.categories.join(", ") || "—"} />
          <Row label="Budget" value={`${formatINR(c.schedule.totalBudget)} (${formatINR(c.schedule.dailyBudget)}/day)`} />
          <Row label="Schedule" value={`${formatDate(c.schedule.startAt)} → ${formatDate(c.schedule.endAt)}`} />
        </div>

        <div className="mx-4 mt-3 grid grid-cols-2 gap-2">
          {(c.status === "active" || c.status === "paused") && (
            <button onClick={toggle} className="flex items-center justify-center gap-1.5 rounded-2xl border border-border bg-card p-3 text-xs font-semibold">
              {c.status === "active" ? <><PauseCircle className="h-4 w-4" /> Pause</> : <><PlayCircle className="h-4 w-4" /> Resume</>}
            </button>
          )}
          <Link to="/ads/new" search={{ id: c.id, step: 3 } as any}
            className="flex items-center justify-center gap-1.5 rounded-2xl border border-border bg-card p-3 text-xs font-semibold">
            <Edit3 className="h-4 w-4" /> Edit
          </Link>
          <button onClick={() => { const d = duplicateCampaign(c.id); if (d) { toast.success("Duplicated as draft"); nav({ to: "/ads/new", search: { id: d.id, step: 1 } as any }); } }}
            className="flex items-center justify-center gap-1.5 rounded-2xl border border-border bg-card p-3 text-xs font-semibold">
            <Copy className="h-4 w-4" /> Duplicate
          </button>
          <Link to="/ads/$id/analytics" params={{ id }}
            className="flex items-center justify-center gap-1.5 rounded-2xl border border-border bg-card p-3 text-xs font-semibold">
            <TrendingUp className="h-4 w-4" /> Analytics
          </Link>
          <Link to="/invoice/$id" params={{ id }}
            className="flex items-center justify-center gap-1.5 rounded-2xl border border-border bg-card p-3 text-xs font-semibold">
            <FileText className="h-4 w-4" /> Invoice
          </Link>
          <button onClick={() => setConfirm(true)}
            className="col-span-2 mt-1 flex items-center justify-center gap-1.5 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-700">
            <XCircle className="h-4 w-4" /> End Campaign
          </button>
        </div>

        <ConfirmModal open={confirm} title="End this campaign?"
          body="Unused mock budget will be returned to the Omeetso Wallet."
          confirmLabel="End Campaign" danger
          onCancel={() => setConfirm(false)}
          onConfirm={() => { const r = endCampaign(id); setConfirm(false); toast.success(r?.refund ? `Ended. ${formatINR(r.refund)} refunded to wallet` : "Ended."); nav({ to: "/ads" }); }} />
      </div>
    </MobileFrame>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-secondary/50 p-2">
      <p className="text-lg font-extrabold">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-0.5"><p className="text-[11px] text-muted-foreground">{label}</p><p className="text-xs font-semibold text-right">{value}</p></div>
  );
}
