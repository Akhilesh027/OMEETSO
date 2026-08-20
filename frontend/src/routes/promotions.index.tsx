import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import { BottomNav } from "@/components/omeetso/BottomNav";
import { WalletBalanceCard, SectionTitle } from "@/components/omeetso/revenue";
import { getMyWalletApi, getMyAdCampaignsApi } from "@/api/adCampaigns.api";
import {
  seedRevenueIfEmpty, getWallet, totalCredits, subscribe,
  listPromotions, listCampaigns, formatINR,
} from "@/lib/revenue";
import { Package, Store, Sparkles, Megaphone, ChevronRight, Wallet as WalletIcon, Eye, MousePointerClick, TrendingUp, Clock, CheckCircle2, MessageSquare, PhoneCall, ExternalLink, RefreshCw, Zap, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/promotions/")({
  head: () => ({
    meta: [
      { title: "Promotions & Lead Analytics Dashboard — Omeetso" },
      { name: "description", content: "Track live product impressions, buyer clicks, chat leads, and boost campaign status." },
    ],
  }),
  component: PromotionsHub,
});

function PromotionsHub() {
  const [, setTick] = useState(0);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [refundBalance, setRefundBalance] = useState<number>(0);
  const [heldBalance, setHeldBalance] = useState<number>(0);
  const [liveCampaigns, setLiveCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load real API data
  const loadRealData = useCallback(async () => {
    setLoading(true);
    try {
      const [walletRes, campRes] = await Promise.all([
        getMyWalletApi(),
        getMyAdCampaignsApi()
      ]);

      if (walletRes.success && walletRes.data) {
        setWalletBalance(walletRes.data.balanceInPaise / 100);
        setRefundBalance(walletRes.data.refundBalanceInPaise / 100);
        setHeldBalance(walletRes.data.heldBalanceInPaise / 100);
      } else {
        const localW = getWallet();
        setWalletBalance(localW.balance);
        setRefundBalance(localW.refundBalance);
      }

      if (campRes.success && Array.isArray(campRes.data)) {
        setLiveCampaigns(campRes.data);
      }
    } catch {
      // Fallback
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

  const credits = totalCredits();
  const localPromos = listPromotions();
  const localCamps = listCampaigns();

  // Combine real backend campaigns with local state if no backend campaigns exist yet
  const allCampaigns = liveCampaigns.length > 0 ? liveCampaigns : [...localCamps, ...localPromos];

  const activeBoosts = allCampaigns.filter((c) => {
    const st = (c.status || "").toUpperCase();
    return st === "APPROVED" || st === "ACTIVE" || st === "active";
  });
  const underReview = allCampaigns.filter((c) => {
    const st = (c.status || "").toUpperCase();
    return st === "PENDING_REVIEW" || st === "UNDER_REVIEW" || st === "under_review";
  });

  const totalImpressions = allCampaigns.reduce((sum, c) => sum + (c.impressionsCount || c.analytics?.impressions || 0), 0);
  const totalClicks = allCampaigns.reduce((sum, c) => sum + (c.clicksCount || c.analytics?.clicks || 0), 0);
  const totalChats = allCampaigns.reduce((sum, c) => sum + (c.chatsCount || c.analytics?.chats || 0), 0);
  const totalSpendInPaise = allCampaigns.reduce((sum, c) => sum + (c.pricing?.totalInPaise || (c.amountSpent ? c.amountSpent * 100 : 0)), 0);

  const options: { icon: any; title: string; body: string; cta: string; to: string }[] = [
    { icon: Package, title: "Promote an Active Item", body: "Boost product to #1 search spot & category header.", cta: "Select Item", to: "/promotions/listings" },
    { icon: Store, title: "Promote Store Product", body: "Feature a product from your verified business store.", cta: "Select Product", to: "/promotions/store-products" },
    { icon: Sparkles, title: "Promote Entire Store", body: "Gain store page visits from nearby buyers.", cta: "Promote Store", to: "/promotions/stores" },
    { icon: Megaphone, title: "Create Hero Banner Ad", body: "Promote custom banner on Homepage Carousel.", cta: "Create Banner", to: "/ads/new" },
  ];

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-28 md:mx-auto md:max-w-[960px] md:px-6 md:pb-12 font-sans">
        <BackBar title="Promotions & Lead Analytics" />

        <div className="px-4 pt-2 pb-3 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Live impressions, buyer clicks, lead conversion & campaign status.
          </p>
          <button onClick={loadRealData} className="grid h-7 w-7 place-items-center rounded-lg bg-secondary text-foreground hover:bg-border transition-colors" title="Refresh">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Real Wallet Balance Card */}
        <div className="px-4">
          <Link to="/wallet">
            <WalletBalanceCard balance={walletBalance} credits={credits} refunds={refundBalance} />
          </Link>
        </div>

        {/* Aggregate Performance Overview */}
        <div className="mt-5 px-4 space-y-3">
          <SectionTitle hint="All Time">Real-time Lead Summary</SectionTitle>
          <div className="grid grid-cols-4 gap-2 text-center">
            <StatBox label="Total Views" value={totalImpressions.toLocaleString()} icon={Eye} color="text-indigo-600" />
            <StatBox label="Total Clicks" value={totalClicks.toLocaleString()} icon={MousePointerClick} color="text-emerald-600" />
            <StatBox label="Buyer Chats" value={totalChats.toLocaleString()} icon={MessageSquare} color="text-sky-600" />
            <StatBox label="Total Spend" value={formatINR(totalSpendInPaise / 100)} icon={Zap} color="text-amber-600" />
          </div>
        </div>

        {/* Boost & Campaign List */}
        <div className="mt-6 px-4 space-y-3">
          <div className="flex items-center justify-between">
            <SectionTitle hint={`${activeBoosts.length} active`}>Boosted Products & Banners</SectionTitle>
            <Link to="/ads" className="text-xs font-bold text-indigo-brand flex items-center gap-0.5">
              View All <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {allCampaigns.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center text-xs text-muted-foreground space-y-2">
                <Megaphone className="h-8 w-8 text-muted-foreground mx-auto" />
                <p className="font-bold text-foreground">No active boost campaigns yet</p>
                <p className="text-[11px]">Boost your items to rank #1 in local search results and get 5× more buyer inquiries!</p>
              </div>
            ) : (
              allCampaigns.map((c: any) => {
                const listingId = c.listingId?.id || c.listingId?._id || c.listingId || c.source?.listingId || "";
                const title = c.productName || c.listingId?.title || c.creative?.name || c.campaignType || "Boosted Product";
                const img = c.listingId?.images?.[0] || c.creative?.imageUrl || c.bannerUrl || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400";
                const status = (c.status || "active").toUpperCase();
                const imps = c.impressionsCount || c.analytics?.impressions || 0;
                const clicks = c.clicksCount || c.analytics?.clicks || 0;
                const chats = c.chatsCount || c.analytics?.chats || 0;
                const calls = c.callsCount || c.analytics?.calls || 0;
                const cost = c.pricing?.totalInPaise ? c.pricing.totalInPaise / 100 : c.amountSpent || 0;
                const ctr = imps > 0 ? ((clicks / imps) * 100).toFixed(1) : "0.0";
                const planName = c.adProductId?.name || c.name || "Boost Package";

                return (
                  <div key={c.id || c._id} className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-3 transition-all hover:border-indigo-brand/30">
                    {/* Item Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="h-14 w-14 rounded-xl bg-secondary overflow-hidden shrink-0 border border-border">
                          <img src={img} alt="" className="h-full w-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-extrabold text-foreground truncate">{title}</p>
                          <p className="text-[11px] text-muted-foreground font-medium truncate">{planName}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                              status === "APPROVED" || status === "ACTIVE"
                                ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                : status === "PENDING_REVIEW" || status === "UNDER_REVIEW"
                                ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                                : "bg-muted text-muted-foreground"
                            }`}>
                              {status === "APPROVED" || status === "ACTIVE" ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                              {status === "APPROVED" || status === "ACTIVE" ? "ACTIVE BOOST" : status === "PENDING_REVIEW" ? "UNDER ADMIN REVIEW" : status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className="text-sm font-black text-foreground shrink-0">{formatINR(cost)}</span>
                    </div>

                    {/* Detailed Metrics Breakdown Grid */}
                    <div className="grid grid-cols-4 gap-2 bg-secondary/50 rounded-xl p-2.5 text-center border border-border/50">
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground flex items-center justify-center gap-1">
                          <Eye className="h-3 w-3 text-indigo-brand" /> Views
                        </p>
                        <p className="text-xs font-black text-foreground mt-0.5">{imps.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground flex items-center justify-center gap-1">
                          <MousePointerClick className="h-3 w-3 text-emerald-600" /> Clicks
                        </p>
                        <p className="text-xs font-black text-foreground mt-0.5">{clicks.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground flex items-center justify-center gap-1">
                          <MessageSquare className="h-3 w-3 text-sky-600" /> Leads
                        </p>
                        <p className="text-xs font-black text-foreground mt-0.5">{chats.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground flex items-center justify-center gap-1">
                          <TrendingUp className="h-3 w-3 text-amber-500" /> CTR
                        </p>
                        <p className="text-xs font-black text-emerald-600 mt-0.5">{ctr}%</p>
                      </div>
                    </div>

                    {/* Action Links */}
                    <div className="flex items-center justify-between pt-1 text-xs">
                      {listingId ? (
                        <Link to="/listing/$id/manage" params={{ id: String(listingId) }} className="inline-flex items-center gap-1 font-bold text-indigo-brand hover:underline">
                          <Zap className="h-3.5 w-3.5" /> Manage Item Leads & Stats →
                        </Link>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">Banner Campaign Active</span>
                      )}
                      <span className="text-[10px] font-bold text-muted-foreground">
                        {status === "APPROVED" || status === "ACTIVE" ? "⚡ Live in Search" : "⏳ Review SLA: 24 Hours"}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Launch Options */}
        <div className="mt-6 space-y-3 px-4">
          <SectionTitle>Promote Another Item</SectionTitle>
          {options.map((o) => (
            <Link key={o.title} to={o.to} className="flex items-start gap-3.5 rounded-2xl border border-border bg-card p-3.5 hover:border-indigo-brand/40 transition-all shadow-sm">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-indigo-brand/10 text-indigo-brand">
                <o.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-extrabold text-foreground">{o.title}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{o.body}</p>
                <span className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-extrabold text-indigo-brand">
                  {o.cta} <ChevronRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Link to Wallet */}
        <div className="mt-6 px-4">
          <Link to="/wallet" className="flex items-center gap-3.5 rounded-2xl border border-border bg-card p-4 shadow-sm hover:border-indigo-brand/40 transition-all">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <WalletIcon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-extrabold text-foreground">Omeetso Wallet & Razorpay Recharge</p>
              <p className="text-[11px] text-muted-foreground">Manage balance, add money, and view tax invoices</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        </div>

        <BottomNav />
      </div>
    </MobileFrame>
  );
}

function StatBox({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: any; color: string }) {
  return (
    <div className="rounded-2xl p-2.5 bg-card border border-border text-foreground shadow-sm">
      <Icon className={`h-4 w-4 mx-auto mb-1 ${color}`} />
      <p className="text-sm font-black tracking-tight">{value}</p>
      <p className="text-[9px] font-bold text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}
