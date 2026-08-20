import { ArrowRight, Info, Sparkles, X, Zap, Plus, CheckCircle2, Clock, Coins, ShieldCheck } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { dismissAd, isAdDismissed, trackAdClick, trackAdImpression } from "@/lib/ads";
import { trackAdImpressionApi, trackAdClickApi } from "@/api/adCampaigns.api";
import type { Ad } from "@/lib/mock";

function useImpression(adId: string, campaignId?: string, placementId?: string, dismissed?: boolean) {
  useEffect(() => {
    if (!dismissed) {
      trackAdImpression(adId);
      if (campaignId) {
        trackAdImpressionApi(campaignId, placementId || "BANNER_AD");
      }
    }
  }, [adId, campaignId, placementId, dismissed]);
}

function AdLabel({ tone = "light" }: { tone?: "light" | "dark" }) {
  return (
    <span
      className={
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide " +
        (tone === "dark" ? "bg-white/15 text-white" : "bg-navy text-white")
      }
    >
      <Sparkles className="h-3 w-3" /> Sponsored
    </span>
  );
}

function InfoWhySeeing() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        aria-label="Why am I seeing this ad?"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(true); }}
        className="grid h-7 w-7 place-items-center rounded-full bg-white/20 text-white/90 hover:bg-white/30"
      >
        <Info className="h-3.5 w-3.5" />
      </button>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-navy/45 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-sm rounded-2xl bg-card p-4 shadow-xl">
            <h3 className="text-sm font-bold">Why am I seeing this?</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              This ad is shown based on your selected location and browsing category. Omeetso does not sell your personal data.
            </p>
            <button
              onClick={() => setOpen(false)}
              className="mt-3 w-full rounded-xl bg-primary py-2 text-sm font-bold text-primary-foreground"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}

const DEFAULT_HERO_SLOTS = [
  {
    id: "default_hero_slot_1",
    headline: "Boost Your Products & Reach Nearby Buyers on Omeetso!",
    body: "Platform Highlight",
    cta: "Launch Campaign",
    destinationUrl: "/promotions/new",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200",
    advertiser: "Omeetso Promotions"
  },
  {
    id: "default_hero_slot_2",
    headline: "Explore Verified Local Electronics & Mobile Stores Near You",
    body: "Local Merchant Spotlight",
    cta: "Browse Stores",
    destinationUrl: "/stores",
    image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1200",
    advertiser: "Omeetso Stores"
  },
  {
    id: "default_hero_slot_3",
    headline: "Sell Anything in Under 60 Seconds — Fast & Free Listing!",
    body: "Quick Listing",
    cta: "Post Free Ad",
    destinationUrl: "/sell/quick",
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200",
    advertiser: "Omeetso Marketplace"
  },
  {
    id: "default_hero_slot_4",
    headline: "Discover Trending Home, Furniture & Appliance Deals",
    body: "Category Showcase",
    cta: "Explore Deals",
    destinationUrl: "/results",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200",
    advertiser: "Omeetso Home"
  },
  {
    id: "default_hero_slot_5",
    headline: "Upgrade Your Tech: Premium Audio & Accessories",
    body: "Gadget Deals",
    cta: "Shop Gadgets",
    destinationUrl: "/results",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200",
    advertiser: "Omeetso Electronics"
  },
  {
    id: "default_hero_slot_6",
    headline: "Verified Sellers & Secure Negotiated Direct Chat",
    body: "Safety & Trust",
    cta: "Open Chats",
    destinationUrl: "/chats",
    image: "https://images.unsplash.com/photo-1556742049-0a670e4a4591?w=1200",
    advertiser: "Omeetso Trust"
  }
];

export function HeroAd({ ad, ads }: { ad?: any; ads?: any[] }) {
  const adList = useMemo(() => {
    let list: any[] = [];
    if (ads && ads.length > 0) list = [...ads];
    else if (ad) list = [ad];

    let idx = 0;
    while (list.length < 6 && idx < DEFAULT_HERO_SLOTS.length) {
      list.push(DEFAULT_HERO_SLOTS[idx]);
      idx++;
    }
    return list;
  }, [ad, ads]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [gone, setGone] = useState(false);

  // Auto-rotate every 5 seconds (5000ms) if multiple ads exist for this placement
  useEffect(() => {
    if (adList.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % adList.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [adList.length]);

  const currentAd = adList[currentIndex] || adList[0];

  const adId = currentAd?.id || currentAd?.servedAdId || "ad_hero";
  const image = currentAd?.image || currentAd?.imageUrl || currentAd?.creative?.imageUrl;
  const headline = currentAd?.headline || currentAd?.title || currentAd?.creative?.title || "Sponsored Highlight";
  const body = currentAd?.body || currentAd?.subtitle || currentAd?.label || currentAd?.creative?.description || "";
  const cta = currentAd?.cta || currentAd?.ctaText || "Shop Now";
  const destinationUrl = currentAd?.destinationUrl || currentAd?.ctaLink || currentAd?.creative?.destinationUrl || "/";
  const advertiser = currentAd?.advertiser || "Omeetso Partner";

  useEffect(() => {
    if (adId) setGone(isAdDismissed(adId));
  }, [adId]);

  useImpression(adId, currentAd?.campaignId, currentAd?.placement, gone);

  if (!currentAd || gone) return null;

  return (
    <div className="relative group block overflow-hidden rounded-2xl bg-slate-900 text-white shadow-md border border-slate-700/50 aspect-[16/9] max-h-56 w-full">
      <Link
        to={destinationUrl}
        onClick={() => trackAdClick(adId)}
        className="absolute inset-0 z-0 block flex flex-col justify-between"
      >
        {image ? (
          <>
            <img
              key={adId + currentIndex}
              src={image}
              alt={headline}
              onError={(e) => {
                // Fall back if blob: or original URL fails to load
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200";
              }}
              className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700 animate-in fade-in-50"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-slate-950/20" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-[#1E293B] via-[#334155] to-[#0F172A]" />
        )}
      </Link>

      <div className="relative p-4 flex flex-col justify-between h-full z-10 pointer-events-none">
        <div className="flex items-center justify-between gap-2 pointer-events-auto">
          <div className="flex items-center gap-2">
            <AdLabel tone="dark" />
            {adList.length > 1 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/90 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow">
                Ad {currentIndex + 1} of {adList.length} • Rotates 5s
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <InfoWhySeeing />
            <button
              type="button"
              aria-label="Dismiss ad"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); dismissAd(adId); setGone(true); }}
              className="grid h-7 w-7 place-items-center rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-sm"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="pointer-events-auto">
          <Link to={destinationUrl} onClick={() => trackAdClick(adId)}>
            <h3 className="text-base sm:text-lg font-extrabold leading-tight drop-shadow-sm">{headline}</h3>
            {body && <p className="mt-0.5 text-xs text-slate-200 line-clamp-1 drop-shadow-sm">{body}</p>}
          </Link>

          <div className="mt-2 flex items-center justify-between">
            <span className="text-[10px] font-medium text-slate-300">Ad · {advertiser}</span>
            <div className="flex items-center gap-2">
              {adList.length > 1 && (
                <div className="flex items-center gap-1 mr-1">
                  {adList.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      aria-label={`Go to slide ${idx + 1}`}
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentIndex(idx); }}
                      className={`h-1.5 rounded-full transition-all ${
                        idx === currentIndex ? "w-5 bg-amber-400" : "w-1.5 bg-white/40 hover:bg-white/70"
                      }`}
                    />
                  ))}
                </div>
              )}
              <Link
                to={destinationUrl}
                onClick={() => trackAdClick(adId)}
                className="inline-flex items-center gap-1 rounded-full bg-[#FFB800] hover:bg-amber-400 px-3.5 py-1 text-xs font-bold text-slate-950 shadow-sm"
              >
                {cta} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function QuickSellCard() {
  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 text-white p-3.5 sm:p-6 lg:p-7 shadow-xl border border-blue-400/30">
      {/* Glowing Ambient Spheres */}
      <div className="absolute -right-12 -top-12 h-56 w-56 rounded-full bg-amber-400/20 blur-3xl pointer-events-none" />
      <div className="absolute left-1/3 -bottom-10 h-40 w-40 rounded-full bg-blue-500/20 blur-2xl pointer-events-none" />

      <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-6">
        {/* Left Copy & Info Perks */}
        <div className="space-y-1.5 sm:space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 border border-amber-400/30 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-amber-300 backdrop-blur-md">
            <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-400" /> 30-Second Express Listing
          </div>

          <div>
            <h3 className="text-base sm:text-2xl lg:text-3xl font-black leading-snug sm:leading-tight tracking-tight text-white">
              Turn Your Unused Items Into Cash Today!
            </h3>
            <p className="mt-0.5 sm:mt-1 text-[11px] sm:text-sm text-blue-100/90 leading-normal font-normal line-clamp-2 sm:line-clamp-none">
              List mobile phones, cars, furniture, or appliances in seconds. Connect directly with nearby buyers.
            </p>
          </div>

          {/* 3 Key Seller Perks */}
          <div className="flex sm:grid sm:grid-cols-3 gap-2 overflow-x-auto no-scrollbar pt-0.5">
            <div className="flex items-center gap-1.5 shrink-0 rounded-xl bg-white/10 px-2.5 py-1.5 sm:px-3 sm:py-2 border border-white/10 backdrop-blur-xs">
              <Coins className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-400 shrink-0" />
              <div className="text-[10px] sm:text-[11px]">
                <span className="font-bold text-white block leading-tight">0% Commission</span>
                <span className="text-white/70 text-[9px] sm:text-[10px] hidden sm:block">Keep 100% money</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 rounded-xl bg-white/10 px-2.5 py-1.5 sm:px-3 sm:py-2 border border-white/10 backdrop-blur-xs">
              <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-400 shrink-0" />
              <div className="text-[10px] sm:text-[11px]">
                <span className="font-bold text-white block leading-tight">Instant Chat</span>
                <span className="text-white/70 text-[9px] sm:text-[10px] hidden sm:block">No middleman fees</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 rounded-xl bg-white/10 px-2.5 py-1.5 sm:px-3 sm:py-2 border border-white/10 backdrop-blur-xs">
              <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-400 shrink-0" />
              <div className="text-[10px] sm:text-[11px]">
                <span className="font-bold text-white block leading-tight">Verified Buyers</span>
                <span className="text-white/70 text-[9px] sm:text-[10px] hidden sm:block">Local pincode match</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Call To Actions */}
        <div className="grid grid-cols-2 sm:flex sm:flex-row lg:flex-col gap-2 shrink-0 justify-center pt-1 sm:pt-0">
          <Link
            to="/sell"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl sm:rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 px-3 sm:px-6 py-2 sm:py-3.5 text-xs sm:text-sm font-extrabold shadow-lg shadow-amber-500/20 transition-all text-center"
          >
            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 stroke-[3]" /> Post Free Ad <ArrowRight className="h-3.5 w-3.5 hidden sm:inline" />
          </Link>

          <Link
            to="/sell/quick"
            className="inline-flex items-center justify-center gap-1 rounded-xl sm:rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 text-white border border-white/20 px-3 sm:px-5 py-2 sm:py-2.5 text-xs font-bold backdrop-blur-md transition-all text-center"
          >
            <Zap className="h-3.5 w-3.5 text-amber-400 fill-amber-400 shrink-0" /> Quick Sell
          </Link>
        </div>
      </div>
    </div>
  );
}

export function CategoryStripAd({ ad }: { ad: any }) {
  const [gone, setGone] = useState(false);
  const adId = ad.id || ad.servedAdId || "ad_strip";
  const image = ad.image || ad.imageUrl || ad.creative?.imageUrl;
  const headline = ad.headline || ad.title || ad.creative?.title || "Special Deal";
  const cta = ad.cta || ad.ctaText || "View Deal";
  const destinationUrl = ad.destinationUrl || ad.ctaLink || ad.creative?.destinationUrl || "/";
  const advertiser = ad.advertiser || "Verified Seller";

  useEffect(() => setGone(isAdDismissed(adId)), [adId]);
  useImpression(adId, ad.campaignId, ad.placement, gone);
  if (gone) return null;

  return (
    <Link
      to={destinationUrl}
      onClick={() => trackAdClick(adId)}
      className="flex items-center gap-3 rounded-2xl bg-card p-3 card-elev border border-border block"
    >
      {image ? (
        <img src={image} alt={headline} className="h-12 w-16 rounded-xl object-cover shrink-0 border border-border" />
      ) : (
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-orange-brand/10 text-orange-brand">
          <Sparkles className="h-5 w-5" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          Sponsored · {advertiser}
        </p>
        <p className="truncate text-sm font-semibold">{headline}</p>
      </div>
      <span className="rounded-full bg-navy px-3 py-1.5 text-xs font-semibold text-white shrink-0">
        {cta}
      </span>
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); dismissAd(adId); setGone(true); }}
        aria-label="Dismiss ad"
        className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:bg-secondary shrink-0"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </Link>
  );
}

export function NativeAdCard({ ad }: { ad: any }) {
  const [gone, setGone] = useState(false);
  const adId = ad.id || ad.servedAdId || "ad_native";
  const image = ad.image || ad.imageUrl || ad.creative?.imageUrl;
  const headline = ad.headline || ad.title || ad.creative?.title || "Featured Highlight";
  const cta = ad.cta || ad.ctaText || "View Product";
  const destinationUrl = ad.destinationUrl || ad.ctaLink || ad.creative?.destinationUrl || "/";
  const advertiser = ad.advertiser || "Verified Partner";

  useEffect(() => setGone(isAdDismissed(adId)), [adId]);
  useImpression(adId, ad.campaignId, ad.placement, gone);
  if (gone) return null;

  return (
    <a
      href={destinationUrl}
      className="block w-full text-left"
    >
      <div className="relative overflow-hidden rounded-2xl border-2 border-yellow-brand/50 bg-yellow-brand/[0.06] card-elev">
        {image && (
          <img src={image} alt={headline} className="aspect-[4/3] w-full object-cover" />
        )}
        <span className="absolute left-2 top-2"><AdLabel /></span>
      </div>
      <div className="px-1 pt-2">
        <p className="line-clamp-2 text-sm font-bold">{headline}</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">Ad · {advertiser}</p>
        <span className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-electric">
          {cta} <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </a>
  );
}

export function SecondaryBannerAd({ ad }: { ad: any }) {
  const [gone, setGone] = useState(false);
  const adId = ad.id || ad.servedAdId || "ad_sec";
  const image = ad.image || ad.imageUrl || ad.creative?.imageUrl;
  const headline = ad.headline || ad.title || ad.creative?.title || "Exclusive Offer";
  const body = ad.body || ad.subtitle || ad.label || ad.creative?.description || "";
  const cta = ad.cta || ad.ctaText || "Claim Deal";
  const destinationUrl = ad.destinationUrl || ad.ctaLink || ad.creative?.destinationUrl || "/";
  const advertiser = ad.advertiser || "Verified Seller";

  useEffect(() => setGone(isAdDismissed(adId)), [adId]);
  useImpression(adId, ad.campaignId, ad.placement, gone);
  if (gone) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-navy text-white card-elev">
      {image && (
        <img src={image} alt={headline} className="absolute inset-0 h-full w-full object-cover opacity-25" />
      )}
      <div className="relative flex items-center gap-3 p-4">
        <div className="min-w-0 flex-1">
          <AdLabel tone="dark" />
          <h3 className="mt-1.5 text-base font-bold leading-tight">{headline}</h3>
          {body && <p className="mt-0.5 text-xs text-white/80">{body}</p>}
          <p className="mt-1 text-[10px] text-white/60">Ad by {advertiser}</p>
        </div>
        <a
          href={destinationUrl}
          className="shrink-0 rounded-full bg-yellow-brand px-3 py-1.5 text-xs font-bold text-navy"
        >
          {cta}
        </a>
      </div>
    </div>
  );
}

export function ContextualAd({ ad }: { ad: Ad }) {
  const [gone, setGone] = useState(false);
  useEffect(() => setGone(isAdDismissed(ad.id)), [ad.id]);
  useImpression(ad.id, gone);
  if (gone) return null;
  return (
    <div className="rounded-2xl border border-border bg-card p-3">
      <div className="flex items-center justify-between">
        <AdLabel />
        <button
          onClick={() => { dismissAd(ad.id); setGone(true); }}
          aria-label="Dismiss ad"
          className="grid h-6 w-6 place-items-center rounded-full text-muted-foreground hover:bg-secondary"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
      <p className="mt-2 text-sm font-semibold">{ad.headline}</p>
      <div className="mt-1 flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">Ad · {ad.advertiser}</span>
        <button
          onClick={() => trackAdClick(ad.id)}
          className="rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground"
        >
          {ad.cta}
        </button>
      </div>
    </div>
  );
}

export function QuickDealsBanner() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 text-slate-950 p-5 sm:p-6 shadow-xl border border-amber-300">
      <div className="absolute -right-10 -bottom-10 h-48 w-48 rounded-full bg-white/20 blur-2xl pointer-events-none" />
      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-950/15 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-slate-950 backdrop-blur-sm">
            <Zap className="h-3.5 w-3.5 fill-slate-950" /> Instant Negotiation & Quick Deals
          </div>
          <h3 className="text-xl sm:text-2xl font-black leading-tight tracking-tight text-slate-950">
            Grab Hot Flash Deals & Fast-Moving Items Near You!
          </h3>
          <p className="text-xs sm:text-sm font-medium text-slate-900/90 leading-relaxed">
            Sellers offering steep discounts for quick sales. Make instant offers and close direct local deals today!
          </p>
        </div>
        <Link
          to="/results"
          search={{ quickSale: "1" } as any}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 text-white hover:bg-slate-900 px-6 py-3 text-xs sm:text-sm font-extrabold shadow-lg hover:scale-105 active:scale-95 transition-all shrink-0"
        >
          <Zap className="h-4 w-4 fill-amber-400 text-amber-400" /> Explore Quick Deals <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

export function AdErrorFallback() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1B2A66] via-[#2A3B85] to-[#111E4D] text-white p-5 shadow-lg border border-blue-500/20">
      <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-xl pointer-events-none" />
      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-white/15 px-2.5 py-0.5 rounded-full text-[#FFD666]">
            ✨ Omeetso Platform Highlight
          </span>
          <h3 className="text-base font-extrabold leading-tight text-white">Boost Your Products & Reach Nearby Buyers!</h3>
          <p className="text-xs text-blue-100/90 max-w-lg">
            Promote your listings to priority #1 search spots and feature custom banners on the homepage carousel.
          </p>
        </div>
        <a
          href="/promotions/new"
          className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 bg-[#FFB800] hover:bg-amber-300 text-navy font-bold text-xs rounded-full shadow-md transition-colors w-fit"
        >
          Launch Campaign <ArrowRight className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}
