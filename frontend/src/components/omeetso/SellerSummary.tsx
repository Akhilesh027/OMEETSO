import { ShieldCheck, Star, MapPin, Store as StoreIcon, User, ArrowRight, Zap } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { Seller } from "@/lib/mock";

export function SellerSummary({
  seller,
  otherListings,
}: {
  seller: {
    id: string;
    name?: string;
    businessName?: string;
    ownerName?: string;
    avatar?: string;
    memberSince?: string | number;
    rating?: number;
    reviews?: number;
    responseTime?: string;
    verified?: boolean;
    phoneVerified?: boolean;
    kycVerified?: boolean;
    type?: "individual" | "business";
    area?: string;
    activeListings?: number;
  };
  otherListings?: number;
}) {
  const isBusiness = seller.type === "business" || Boolean(seller.businessName);
  const businessName = seller.businessName || (isBusiness ? seller.name : undefined);

  // Clean seller name
  const rawName = seller.name || "Omeetso Seller";
  const nameParts = rawName.trim().split(/\s+/);
  const uniqueParts = nameParts.filter((word, index) => {
    return nameParts.findIndex((w) => w.toLowerCase() === word.toLowerCase()) === index;
  });
  const displayName = uniqueParts.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  const mainTitle = businessName || displayName;
  const ownerSubtitle = seller.ownerName || (businessName && businessName !== displayName ? displayName : undefined);

  // Parse ISO date strings (e.g. "2026-07-30T05:41:40.763Z") into clean "Jul 2026" format
  const parseMemberSince = (val: any) => {
    if (!val || val === 0 || val === "0") return "N/A";
    try {
      const d = new Date(val);
      if (!isNaN(d.getTime()) && d.getFullYear() > 1990) {
        return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      }
    } catch { /* ignore */ }
    return String(val);
  };

  // Real stats with sensible defaults
  const ratingNum = typeof seller.rating === "number" && seller.rating > 0 ? seller.rating : 0;
  const realRating = ratingNum > 0 ? ratingNum.toFixed(1) : "New";
  const realReviews = typeof seller.reviews === "number" && seller.reviews > 0 ? seller.reviews : 0;
  const realMemberSince = parseMemberSince(seller.memberSince);
  const realListingsCount = typeof otherListings === "number" ? otherListings : (seller.activeListings ?? 0);
  const realResponseTime = seller.responseTime || "Within 15 min";

  return (
    <div className="rounded-3xl border border-border/80 bg-card p-4.5 shadow-sm space-y-3.5">
      <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-3">
        <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">Seller Details</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 border border-border/60 px-2.5 py-0.5 text-[10px] font-black uppercase text-foreground">
          {isBusiness ? (
            <span className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
              <StoreIcon className="h-3 w-3" /> Business Owner
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-primary">
              <User className="h-3 w-3" /> Individual
            </span>
          )}
        </span>
      </div>

      <Link
        to="/seller/$id"
        params={{ id: seller.id }}
        className="flex items-start gap-3.5 group"
      >
        <div className="relative h-13 w-13 shrink-0">
          {seller.avatar ? (
            <img src={seller.avatar} alt={mainTitle} className="h-13 w-13 rounded-full object-cover border border-border shadow-sm group-hover:scale-105 transition-transform" />
          ) : (
            <div className="grid h-13 w-13 place-items-center rounded-full bg-gradient-to-tr from-primary to-indigo-800 text-white font-black text-base shadow-sm group-hover:scale-105 transition-transform">
              {mainTitle ? mainTitle.charAt(0).toUpperCase() : "S"}
            </div>
          )}
          {seller.verified && (
            <span className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-blue-600 text-white border-2 border-card shadow-sm">
              <ShieldCheck className="h-3 w-3" />
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h4 className="truncate text-base font-black text-foreground group-hover:text-primary transition-colors">{mainTitle}</h4>
            {seller.verified && <ShieldCheck className="h-4 w-4 shrink-0 text-blue-600" />}
          </div>
          {ownerSubtitle && (
            <p className="text-[11px] font-semibold text-muted-foreground truncate">
              Owner: {ownerSubtitle}
            </p>
          )}
          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground font-medium truncate">
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" /> {seller.area || "Hyderabad"}
          </p>
        </div>
      </Link>

      {/* 3 Metric Chips */}
      <div className="grid grid-cols-3 gap-2 rounded-2xl bg-surface-2 p-2.5 text-center border border-border/60">
        <div>
          <div className="flex items-center justify-center gap-0.5 text-amber-500 font-black text-xs sm:text-sm">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {realRating}
          </div>
          <div className="text-[10px] font-bold text-muted-foreground mt-0.5">
            {realReviews > 0 ? `${realReviews} reviews` : "Unrated"}
          </div>
        </div>

        <div className="border-x border-border/60">
          <div className="text-xs sm:text-sm font-black text-foreground">{realListingsCount}</div>
          <div className="text-[10px] font-bold text-muted-foreground mt-0.5">Active Ads</div>
        </div>

        <div>
          <div className="text-xs sm:text-sm font-black text-foreground">{realMemberSince}</div>
          <div className="text-[10px] font-bold text-muted-foreground mt-0.5">Member Since</div>
        </div>
      </div>

      {/* Response Speed & Verification Badges */}
      <div className="flex flex-wrap items-center justify-between text-[11px] font-medium text-muted-foreground pt-1 gap-1.5">
        <span className="inline-flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5 text-amber-500 fill-amber-500 shrink-0" />
          Replies: <strong className="text-foreground font-extrabold">{realResponseTime}</strong>
        </span>

        <Link
          to="/seller/$id"
          params={{ id: seller.id }}
          className="group inline-flex items-center gap-1 text-primary font-extrabold text-xs hover:underline"
        >
          <span>View Profile</span>
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
