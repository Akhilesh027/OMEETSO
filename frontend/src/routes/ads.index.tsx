import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import { BottomNav } from "@/components/omeetso/BottomNav";
import { CampaignCard, SectionTitle, RevenueEmpty } from "@/components/omeetso/revenue";
import { getMyWalletApi, getMyAdCampaignsApi } from "@/api/adCampaigns.api";
import { listCampaigns, listCampaignDrafts, seedRevenueIfEmpty, subscribe, formatINR, getWallet } from "@/lib/revenue";
import { Megaphone, Plus, TrendingUp, MousePointerClick, MessageCircle, Wallet, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/ads/")({
  head: () => ({
    meta: [
      { title: "Advertisement Dashboard — Omeetso" },
      { name: "description", content: "Manage your Omeetso advertisement campaigns, targeting and budgets." },
    ],
  }),
  component: AdsDashboard,
});

const TABS = [
  { id: "active", label: "Active" },
  { id: "under_review", label: "Under Review" },
  { id: "draft", label: "Drafts" },
  { id: "completed", label: "Completed" },
  { id: "rejected", label: "Rejected" },
];

function AdsDashboard() {
  const [tab, setTab] = useState("active");
  const [, setTick] = useState(0);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [liveCampaigns, setLiveCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load real API data
  const loadRealData = useCallback(async () => {
    setLoading(true);
    try {
      const [wRes, cRes] = await Promise.all([
        getMyWalletApi(),
        getMyAdCampaignsApi()
      ]);

      if (wRes.success && wRes.data) {
        setWalletBalance(wRes.data.balanceInPaise / 100);
      } else {
        setWalletBalance(getWallet().balance);
      }

      if (cRes.success && Array.isArray(cRes.data)) {
        setLiveCampaigns(cRes.data);
      }
    } catch {
      // Fallback to local state if offline
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    seedRevenueIfEmpty();
    loadRealData();
    const unsub = subscribe(() => {
      setTick((n) => n + 1);
      loadRealData();
    });
    return () => { unsub(); };
  }, [loadRealData]);

  const localCamps = listCampaigns();
  const localDrafts = listCampaignDrafts();

  // Combine real MongoDB campaigns with local storage objects
  const combined = liveCampaigns.length > 0 ? liveCampaigns : [...localCamps, ...localDrafts];

  const mapStatus = (stRaw?: string): string => {
    const st = (stRaw || "").toLowerCase();
    if (st === "approved" || st === "active") return "active";
    if (st === "pending_review" || st === "under_review") return "under_review";
    if (st === "draft") return "draft";
    if (st === "completed") return "completed";
    if (st === "rejected") return "rejected";
    return "active";
  };

  const counts = {
    active: combined.filter((c) => mapStatus(c.status) === "active").length,
    under_review: combined.filter((c) => mapStatus(c.status) === "under_review").length,
    draft: combined.filter((c) => mapStatus(c.status) === "draft").length,
    completed: combined.filter((c) => mapStatus(c.status) === "completed").length,
    rejected: combined.filter((c) => mapStatus(c.status) === "rejected").length,
  };

  const visible = combined.filter((c) => mapStatus(c.status) === tab);

  const totalImp = combined.reduce((s, c) => s + (c.impressionsCount || c.analytics?.impressions || 0), 0);
  const totalClicks = combined.reduce((s, c) => s + (c.clicksCount || c.analytics?.clicks || 0), 0);
  const totalChats = combined.reduce((s, c) => s + (c.chatsCount || c.analytics?.chats || 0), 0);
  const totalSpendInPaise = combined.reduce((s, c) => s + (c.pricing?.totalInPaise || (c.amountSpent ? c.amountSpent * 100 : 0)), 0);

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-28 md:mx-auto md:max-w-[960px] md:px-6 md:pb-12 font-sans">
        <BackBar title="Advertisements & Boosts" />

        {/* Counts summary bar */}
        <div className="mx-4 mt-3 grid grid-cols-4 gap-2 text-center">
          <SumBox label="Active" value={counts.active} />
          <SumBox label="Review" value={counts.under_review} />
          <SumBox label="Drafts" value={counts.draft} />
          <SumBox label="Completed" value={counts.completed} />
        </div>

        {/* Big performance stats */}
        <div className="mx-4 mt-3 grid grid-cols-2 gap-2">
          <StatBig icon={TrendingUp} label="Impressions" value={totalImp.toLocaleString()} />
          <StatBig icon={MousePointerClick} label="Clicks" value={totalClicks.toLocaleString()} />
          <StatBig icon={MessageCircle} label="Buyer Chats" value={totalChats.toLocaleString()} />
          <StatBig icon={Wallet} label="Total Spend" value={formatINR(totalSpendInPaise / 100)} />
        </div>

        {/* Wallet Banner */}
        <Link to="/wallet" className="mx-4 mt-3 flex items-center justify-between rounded-2xl bg-gradient-to-r from-navy via-indigo-900 to-electric px-4 py-3 text-white shadow-md">
          <div>
            <p className="text-[10px] uppercase font-bold text-white/70">Wallet Balance</p>
            <p className="text-xl font-extrabold">{formatINR(walletBalance)}</p>
          </div>
          <span className="rounded-full bg-amber-500 px-3.5 py-1.5 text-xs font-black text-slate-950 shadow-sm">
            + Recharge
          </span>
        </Link>

        {/* Create Ad CTA */}
        <Link to="/ads/new" search={{ id: "", step: 1 } as any}
          className="mx-4 mt-4 flex items-center justify-center gap-2 rounded-2xl bg-indigo-brand py-3.5 text-sm font-extrabold text-white shadow-lg hover:opacity-95 transition-all">
          <Plus className="h-4 w-4" /> Create New Advertisement
        </Link>

        {/* Status Filter Tabs */}
        <div className="mt-5 flex gap-2 overflow-x-auto px-4 pb-1 no-scrollbar">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} aria-pressed={tab === t.id}
              className={cn("shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all",
                tab === t.id ? "border-indigo-brand bg-indigo-brand text-white shadow-sm" : "border-border bg-card text-foreground")}>
              {t.label} {counts[t.id as keyof typeof counts] > 0 && `(${counts[t.id as keyof typeof counts]})`}
            </button>
          ))}
        </div>

        {/* Visible Campaigns */}
        <div className="mt-3 space-y-2.5 px-4">
          {loading ? (
            <div className="p-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-brand" /> Loading campaigns...
            </div>
          ) : visible.length === 0 ? (
            <RevenueEmpty
              icon={Megaphone}
              title={`No ${tab.replace("_", " ")} campaigns`}
              body="Create a targeted advertisement to reach nearby buyers."
              cta="Create Advertisement"
              to="/ads/new"
            />
          ) : visible.map((c) => (
            <Link key={c.id || c._id} to={mapStatus(c.status) === "draft" ? "/ads/new" : "/promotions"}>
              <CampaignCard c={{
                id: c.id || c._id,
                name: c.productName || c.name || c.listingId?.title || c.campaignType || "Listing Boost",
                objective: c.campaignType || "promote_product",
                status: mapStatus(c.status),
                createdAt: new Date(c.createdAt || Date.now()).getTime(),
                updatedAt: new Date(c.updatedAt || Date.now()).getTime(),
                amountSpent: c.pricing?.totalInPaise ? c.pricing.totalInPaise / 100 : c.amountSpent || 0,
                analytics: {
                  impressions: c.impressionsCount || c.analytics?.impressions || 0,
                  clicks: c.clicksCount || c.analytics?.clicks || 0,
                  chats: c.chatsCount || c.analytics?.chats || 0
                }
              }} />
            </Link>
          ))}
        </div>

        <BottomNav />
      </div>
    </MobileFrame>
  );
}

function SumBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-2 shadow-sm">
      <p className="text-base font-extrabold text-foreground">{value}</p>
      <p className="text-[10px] font-bold text-muted-foreground">{label}</p>
    </div>
  );
}

function StatBig({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-brand/10 text-indigo-brand shrink-0">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase text-muted-foreground">{label}</p>
        <p className="text-sm font-extrabold text-foreground truncate">{value}</p>
      </div>
    </div>
  );
}
