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

export const DEFAULT_ROTATING_BANNERS = [
  {
    id: "default_banner_market",
    servedAdId: "default_banner_market",
    campaignId: "default_omeetso_partner",
    placement: "HOMEPAGE_HERO",
    headline: "Buy & Sell Nearby with 0% Middleman Commission",
    title: "Buy & Sell Nearby with 0% Middleman Commission",
    body: "Connect directly with verified local buyers & neighborhood stores. Post free listings or discover exclusive local deals today.",
    subtitle: "Connect directly with verified local buyers & neighborhood stores. Post free listings or discover exclusive local deals today.",
    cta: "Explore Marketplace",
    ctaText: "Explore Marketplace",
    destinationUrl: "/results",
    ctaLink: "/results",
    image: "https://images.unsplash.com/photo-1556742049-0a67e557b683?w=1600",
    imageUrl: "https://images.unsplash.com/photo-1556742049-0a67e557b683?w=1600",
    creative: {
      imageUrl: "https://images.unsplash.com/photo-1556742049-0a67e557b683?w=1600",
      title: "Buy & Sell Nearby with 0% Middleman Commission",
      description: "Connect directly with verified local buyers & neighborhood stores. Post free listings or discover exclusive local deals today.",
      destinationUrl: "/results"
    },
    advertiser: "Omeetso Community",
    label: "Sponsored"
  },
  {
    id: "default_banner_gadgets",
    servedAdId: "default_banner_gadgets",
    campaignId: "default_omeetso_tech",
    placement: "HOMEPAGE_HERO",
    headline: "Upgrade Your Tech — Verified Mobiles & Laptops Nearby",
    title: "Upgrade Your Tech — Verified Mobiles & Laptops Nearby",
    body: "Explore authentic smartphones, MacBooks, tablets and accessories tested and sold by trusted local owners.",
    subtitle: "Explore authentic smartphones, MacBooks, tablets and accessories tested and sold by trusted local owners.",
    cta: "Shop Electronics",
    ctaText: "Shop Electronics",
    destinationUrl: "/results?cat=electronics",
    ctaLink: "/results?cat=electronics",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1600",
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1600",
    creative: {
      imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1600",
      title: "Upgrade Your Tech — Verified Mobiles & Laptops Nearby",
      description: "Explore authentic smartphones, MacBooks, tablets and accessories tested and sold by trusted local owners.",
      destinationUrl: "/results?cat=electronics"
    },
    advertiser: "Verified Tech Partners",
    label: "Sponsored"
  },
  {
    id: "default_banner_vehicles",
    servedAdId: "default_banner_vehicles",
    campaignId: "default_omeetso_auto",
    placement: "HOMEPAGE_HERO",
    headline: "Certified Cars & Bikes with Direct Owner Test Drives",
    title: "Certified Cars & Bikes with Direct Owner Test Drives",
    body: "Find quality checked cars, scooters and motorcycles directly from local owners. Zero middleman fees.",
    subtitle: "Find quality checked cars, scooters and motorcycles directly from local owners. Zero middleman fees.",
    cta: "Find Vehicles",
    ctaText: "Find Vehicles",
    destinationUrl: "/results?cat=cars",
    ctaLink: "/results?cat=cars",
    image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1600",
    imageUrl: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1600",
    creative: {
      imageUrl: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1600",
      title: "Certified Cars & Bikes with Direct Owner Test Drives",
      description: "Find quality checked cars, scooters and motorcycles directly from local owners. Zero middleman fees.",
      destinationUrl: "/results?cat=cars"
    },
    advertiser: "Omeetso Auto Network",
    label: "Sponsored"
  },
  {
    id: "default_banner_stores",
    servedAdId: "default_banner_stores",
    campaignId: "default_omeetso_stores",
    placement: "HOMEPAGE_HERO",
    headline: "Explore 500+ Verified Local Stores & Showrooms",
    title: "Explore 500+ Verified Local Stores & Showrooms",
    body: "Shop from neighborhood retailers with instant WhatsApp chat, real-time catalogs and exclusive in-store discounts.",
    subtitle: "Shop from neighborhood retailers with instant WhatsApp chat, real-time catalogs and exclusive in-store discounts.",
    cta: "Explore Stores",
    ctaText: "Explore Stores",
    destinationUrl: "/stores",
    ctaLink: "/stores",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600",
    imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600",
    creative: {
      imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600",
      title: "Explore 500+ Verified Local Stores & Showrooms",
      description: "Shop from neighborhood retailers with instant WhatsApp chat, real-time catalogs and exclusive in-store discounts.",
      destinationUrl: "/stores"
    },
    advertiser: "Omeetso Store Network",
    label: "Sponsored"
  },
  {
    id: "default_banner_express",
    servedAdId: "default_banner_express",
    campaignId: "default_omeetso_sell",
    placement: "HOMEPAGE_HERO",
    headline: "Sell Any Item in 30 Seconds — 100% Free Buyer Leads",
    title: "Sell Any Item in 30 Seconds — 100% Free Buyer Leads",
    body: "Snap a photo, enter price, and receive instant WhatsApp inquiries from genuine verified buyers in your pincode.",
    subtitle: "Snap a photo, enter price, and receive instant WhatsApp inquiries from genuine verified buyers in your pincode.",
    cta: "Post Free Ad Now",
    ctaText: "Post Free Ad Now",
    destinationUrl: "/sell",
    ctaLink: "/sell",
    image: "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=1600",
    imageUrl: "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=1600",
    creative: {
      imageUrl: "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=1600",
      title: "Sell Any Item in 30 Seconds — 100% Free Buyer Leads",
      description: "Snap a photo, enter price, and receive instant WhatsApp inquiries from genuine verified buyers in your pincode.",
      destinationUrl: "/sell"
    },
    advertiser: "Omeetso Express",
    label: "Sponsored"
  }
];

export const UNIFIED_DEFAULT_BANNER = DEFAULT_ROTATING_BANNERS[0];

export const DEFAULT_SPONSORED_LISTING = {
  id: "sponsored_default_iphone15",
  title: "Apple iPhone 15 Pro (128 GB) - Natural Titanium (Sealed Box)",
  price: 78999,
  originalPrice: 134900,
  images: ["https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600"],
  image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600",
  area: "Madhapur",
  city: "Hyderabad",
  location: "Madhapur, Hyderabad",
  sponsored: true,
  verified: true,
  condition: "Brand New",
  postedTime: "Sponsored",
  sellerName: "Omeetso Verified Partner",
  category: "mobiles"
};

export const DEFAULT_NATIVE_AD = {
  id: "default_native_gadgets",
  headline: "Direct Owner Electronics & Gadgets with 0% Fee",
  title: "Direct Owner Electronics & Gadgets with 0% Fee",
  body: "Verified mobiles, laptops & appliances inspected and sold by trusted local neighbors.",
  cta: "Browse Deals",
  ctaText: "Browse Deals",
  destinationUrl: "/results?cat=electronics",
  image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
  imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
  advertiser: "Omeetso Partner",
  label: "Sponsored"
};

export const DEFAULT_CONTEXTUAL_AD = {
  id: "default_contextual_trust",
  headline: "Looking for similar verified items nearby?",
  body: "Compare verified listings with 100% price protection and instant direct chat.",
  cta: "View Deals",
  ctaText: "View Deals",
  destinationUrl: "/results",
  advertiser: "Omeetso Buyer Protection"
};

export function getCategoryDefaultBanner(categoryId: string, categoryName?: string) {
  const cId = (categoryId || "").toLowerCase().trim();
  const name = categoryName || (cId.charAt(0).toUpperCase() + cId.slice(1));

  if (cId === "furniture") {
    return {
      id: "cat_banner_furniture",
      headline: "Explore Quality Furniture & Home Decor Direct from Owners",
      title: "Explore Quality Furniture & Home Decor Direct from Owners",
      body: "Solid wood beds, sofa sets, dining tables and study desks inspected and sold by verified local sellers.",
      subtitle: "Solid wood beds, sofa sets, dining tables and study desks inspected and sold by verified local sellers.",
      cta: "Explore Furniture Deals",
      ctaText: "Explore Furniture Deals",
      destinationUrl: "/results?cat=furniture",
      ctaLink: "/results?cat=furniture",
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1600",
      imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1600",
      creative: {
        imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1600",
        title: "Explore Quality Furniture & Home Decor Direct from Owners",
        description: "Solid wood beds, sofa sets, dining tables and study desks inspected and sold by verified local sellers.",
        destinationUrl: "/results?cat=furniture",
      },
      advertiser: "Verified Furniture Network",
      label: "Sponsored",
    };
  }

  if (cId === "cars" || cId.includes("car")) {
    return {
      id: "cat_banner_cars",
      headline: "Certified Cars with Direct Owner Test Drives & 0% Fee",
      title: "Certified Cars with Direct Owner Test Drives & 0% Fee",
      body: "Inspected sedans, hatchbacks & SUVs verified with service history directly from genuine local owners.",
      subtitle: "Inspected sedans, hatchbacks & SUVs verified with service history directly from genuine local owners.",
      cta: "Explore Cars",
      ctaText: "Explore Cars",
      destinationUrl: "/results?cat=cars",
      ctaLink: "/results?cat=cars",
      image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1600",
      imageUrl: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1600",
      creative: {
        imageUrl: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1600",
        title: "Certified Cars with Direct Owner Test Drives & 0% Fee",
        description: "Inspected sedans, hatchbacks & SUVs verified with service history directly from genuine local owners.",
        destinationUrl: "/results?cat=cars",
      },
      advertiser: "Omeetso Auto Network",
      label: "Sponsored",
    };
  }

  if (cId === "bikes" || cId.includes("bike") || cId.includes("motorcycle") || cId.includes("scooter")) {
    return {
      id: "cat_banner_bikes",
      headline: "Top Condition Bikes, Scooters & Two-Wheelers Nearby",
      title: "Top Condition Bikes, Scooters & Two-Wheelers Nearby",
      body: "Connect directly with local owners for test drives on commuter motorcycles, sports bikes and electric scooters.",
      subtitle: "Connect directly with local owners for test drives on commuter motorcycles, sports bikes and electric scooters.",
      cta: "Find Two-Wheelers",
      ctaText: "Find Two-Wheelers",
      destinationUrl: "/results?cat=bikes",
      ctaLink: "/results?cat=bikes",
      image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=1600",
      imageUrl: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=1600",
      creative: {
        imageUrl: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=1600",
        title: "Top Condition Bikes, Scooters & Two-Wheelers Nearby",
        description: "Connect directly with local owners for test drives on commuter motorcycles, sports bikes and electric scooters.",
        destinationUrl: "/results?cat=bikes",
      },
      advertiser: "Omeetso Two-Wheelers",
      label: "Sponsored",
    };
  }

  if (cId === "mobiles" || cId.includes("mobile") || cId.includes("phone")) {
    return {
      id: "cat_banner_mobiles",
      headline: "Authentic Mobiles & Smartphones Tested by Local Owners",
      title: "Authentic Mobiles & Smartphones Tested by Local Owners",
      body: "Discover iPhones, Samsung Galaxy, OnePlus and accessories with sealed boxes and verified bill checks.",
      subtitle: "Discover iPhones, Samsung Galaxy, OnePlus and accessories with sealed boxes and verified bill checks.",
      cta: "Shop Mobiles",
      ctaText: "Shop Mobiles",
      destinationUrl: "/results?cat=mobiles",
      ctaLink: "/results?cat=mobiles",
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1600",
      imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1600",
      creative: {
        imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1600",
        title: "Authentic Mobiles & Smartphones Tested by Local Owners",
        description: "Discover iPhones, Samsung Galaxy, OnePlus and accessories with sealed boxes and verified bill checks.",
        destinationUrl: "/results?cat=mobiles",
      },
      advertiser: "Verified Mobile Network",
      label: "Sponsored",
    };
  }

  if (cId === "electronics" || cId.includes("electronic") || cId.includes("laptop")) {
    return {
      id: "cat_banner_electronics",
      headline: "Upgrade Your Tech — Verified Laptops, Tablets & Audio",
      title: "Upgrade Your Tech — Verified Laptops, Tablets & Audio",
      body: "Explore authentic MacBooks, Windows ultrabooks, monitors and consoles tested by trusted local neighbors.",
      subtitle: "Explore authentic MacBooks, Windows ultrabooks, monitors and consoles tested by trusted local neighbors.",
      cta: "Shop Electronics",
      ctaText: "Shop Electronics",
      destinationUrl: "/results?cat=electronics",
      ctaLink: "/results?cat=electronics",
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1600",
      imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1600",
      creative: {
        imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1600",
        title: "Upgrade Your Tech — Verified Laptops, Tablets & Audio",
        description: "Explore authentic MacBooks, Windows ultrabooks, monitors and consoles tested by trusted local neighbors.",
        destinationUrl: "/results?cat=electronics",
      },
      advertiser: "Verified Tech Partners",
      label: "Sponsored",
    };
  }

  if (cId === "home-appliances" || cId.includes("appliance")) {
    return {
      id: "cat_banner_appliances",
      headline: "Reliable Home & Kitchen Appliances with Local Pickup",
      title: "Reliable Home & Kitchen Appliances with Local Pickup",
      body: "Save on verified refrigerators, washing machines, microwaves, air conditioners and water purifiers.",
      subtitle: "Save on verified refrigerators, washing machines, microwaves, air conditioners and water purifiers.",
      cta: "Browse Appliances",
      ctaText: "Browse Appliances",
      destinationUrl: "/results?cat=home-appliances",
      ctaLink: "/results?cat=home-appliances",
      image: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=1600",
      imageUrl: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=1600",
      creative: {
        imageUrl: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=1600",
        title: "Reliable Home & Kitchen Appliances with Local Pickup",
        description: "Save on verified refrigerators, washing machines, microwaves, air conditioners and water purifiers.",
        destinationUrl: "/results?cat=home-appliances",
      },
      advertiser: "Omeetso Appliance Network",
      label: "Sponsored",
    };
  }

  if (cId === "properties" || cId.includes("propert") || cId.includes("real-estate")) {
    return {
      id: "cat_banner_properties",
      headline: "Zero Brokerage Direct Owner Houses, Flats & Plots",
      title: "Zero Brokerage Direct Owner Houses, Flats & Plots",
      body: "Connect directly with genuine property owners & builders with instant phone calls and map directions.",
      subtitle: "Connect directly with genuine property owners & builders with instant phone calls and map directions.",
      cta: "Explore Properties",
      ctaText: "Explore Properties",
      destinationUrl: "/results?cat=properties",
      ctaLink: "/results?cat=properties",
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1600",
      imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1600",
      creative: {
        imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1600",
        title: "Zero Brokerage Direct Owner Houses, Flats & Plots",
        description: "Connect directly with genuine property owners & builders with instant phone calls and map directions.",
        destinationUrl: "/results?cat=properties",
      },
      advertiser: "Omeetso Property Network",
      label: "Sponsored",
    };
  }

  // Generic fallback for other categories (Fashion, Jobs, Services, etc.)
  return {
    id: `cat_banner_${cId}`,
    headline: `Verified Deals in ${name} with 0% Middleman Commission`,
    title: `Verified Deals in ${name} with 0% Middleman Commission`,
    body: `Connect directly with verified local buyers & neighborhood sellers for ${name.toLowerCase()} items.`,
    subtitle: `Connect directly with verified local buyers & neighborhood sellers for ${name.toLowerCase()} items.`,
    cta: `Explore ${name}`,
    ctaText: `Explore ${name}`,
    destinationUrl: `/results?cat=${encodeURIComponent(cId)}`,
    ctaLink: `/results?cat=${encodeURIComponent(cId)}`,
    image: "https://images.unsplash.com/photo-1556742049-0a67e557b683?w=1600",
    imageUrl: "https://images.unsplash.com/photo-1556742049-0a67e557b683?w=1600",
    creative: {
      imageUrl: "https://images.unsplash.com/photo-1556742049-0a67e557b683?w=1600",
      title: `Verified Deals in ${name} with 0% Middleman Commission`,
      description: `Connect directly with verified local buyers & neighborhood sellers for ${name.toLowerCase()} items.`,
      destinationUrl: `/results?cat=${encodeURIComponent(cId)}`,
    },
    advertiser: `Omeetso ${name} Network`,
    label: "Sponsored",
  };
}

const DEFAULT_HERO_SLOTS = DEFAULT_ROTATING_BANNERS;

export function HeroAd({ ad, ads, maxAds = 5 }: { ad?: any; ads?: any[]; maxAds?: number }) {
  const adList = useMemo(() => {
    let list: any[] = [];
    if (ads && ads.length > 0) list = [...ads];
    else if (ad) list = [ad];
    // If no active/placed ads exist, fall back to default rotating banners
    if (list.length === 0) {
      list = [...DEFAULT_ROTATING_BANNERS];
    }
    // Note: When placed ads are running (1 or more), NEVER mix with default or mock banners!
    return list.slice(0, maxAds);
  }, [ad, ads, maxAds]);

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

export function NativeAdCard({ ad }: { ad?: any }) {
  const activeAd = ad || DEFAULT_NATIVE_AD;
  const [gone, setGone] = useState(false);
  const adId = activeAd.id || activeAd.servedAdId || "ad_native";
  const image = activeAd.image || activeAd.imageUrl || activeAd.creative?.imageUrl;
  const headline = activeAd.headline || activeAd.title || activeAd.creative?.title || "Featured Highlight";
  const cta = activeAd.cta || activeAd.ctaText || "Browse Deals";
  const destinationUrl = activeAd.destinationUrl || activeAd.ctaLink || activeAd.creative?.destinationUrl || "/results?cat=electronics";
  const advertiser = activeAd.advertiser || "Omeetso Partner";

  useEffect(() => setGone(isAdDismissed(adId)), [adId]);
  useImpression(adId, activeAd.campaignId, activeAd.placement, gone);
  if (gone) return null;

  return (
    <Link
      to={destinationUrl}
      onClick={() => trackAdClick(adId)}
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
    </Link>
  );
}

export function SecondaryBannerAd({
  ad,
  ads,
  maxAds = 5,
}: {
  ad?: any;
  ads?: any[];
  maxAds?: number;
}) {
  const adList = useMemo(() => {
    let list: any[] = [];
    if (ads && ads.length > 0) list = [...ads];
    else if (ad) list = [ad];

    // If no active ads exist, show rotating default banners
    if (list.length === 0) {
      list = [...DEFAULT_ROTATING_BANNERS];
    }
    // When placed ads are running (1 or more), NEVER mix in default or mock ads
    return list.slice(0, maxAds);
  }, [ad, ads, maxAds]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [gone, setGone] = useState(false);

  // Auto-rotate every 5 seconds (5000ms)
  useEffect(() => {
    if (adList.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % adList.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [adList.length]);

  const currentAd = adList[currentIndex] || adList[0];

  const adId = currentAd?.id || currentAd?.servedAdId || "ad_sec";
  const image = currentAd?.image || currentAd?.imageUrl || currentAd?.creative?.imageUrl;
  const headline = currentAd?.headline || currentAd?.title || currentAd?.creative?.title || "Exclusive Offer";
  const body = currentAd?.body || currentAd?.subtitle || currentAd?.label || currentAd?.creative?.description || "";
  const cta = currentAd?.cta || currentAd?.ctaText || "Claim Deal";
  const destinationUrl = currentAd?.destinationUrl || currentAd?.ctaLink || currentAd?.creative?.destinationUrl || "/";
  const advertiser = currentAd?.advertiser || "Verified Partner";

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
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200";
              }}
              className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700 animate-in fade-in-50"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/45 to-slate-950/20" />
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

export function ContextualAd({ ad }: { ad?: any }) {
  const activeAd = ad || DEFAULT_CONTEXTUAL_AD;
  const [gone, setGone] = useState(false);
  const adId = activeAd.id || activeAd.servedAdId || "ad_contextual";
  useEffect(() => setGone(isAdDismissed(adId)), [adId]);
  useImpression(adId, activeAd.campaignId, activeAd.placement, gone);
  if (gone) return null;
  return (
    <div className="rounded-2xl border border-border bg-card p-3.5 shadow-xs">
      <div className="flex items-center justify-between">
        <AdLabel />
        <button
          onClick={() => { dismissAd(adId); setGone(true); }}
          aria-label="Dismiss ad"
          className="grid h-6 w-6 place-items-center rounded-full text-muted-foreground hover:bg-secondary"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
      <p className="mt-2 text-sm font-bold text-foreground">{activeAd.headline || activeAd.title}</p>
      {activeAd.body && <p className="mt-0.5 text-xs text-muted-foreground font-medium">{activeAd.body}</p>}
      <div className="mt-2.5 flex items-center justify-between">
        <span className="text-[11px] font-semibold text-muted-foreground">Ad · {activeAd.advertiser || "Omeetso Partner"}</span>
        <Link
          to={activeAd.destinationUrl || "/results"}
          onClick={() => trackAdClick(adId)}
          className="rounded-full bg-primary px-3.5 py-1.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs"
        >
          {activeAd.cta || activeAd.ctaText || "View Deals"}
        </Link>
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
