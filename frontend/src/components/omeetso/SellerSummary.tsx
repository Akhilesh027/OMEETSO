import { ShieldCheck, Star, MapPin, Store as StoreIcon, User } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { Seller } from "@/lib/mock";

export function SellerSummary({
  seller,
  otherListings,
}: {
  seller: {
    id: string;
    name?: string;
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
  // Clean seller name
  const rawName = seller.name || "Omeetso Seller";
  const nameParts = rawName.trim().split(/\s+/);
  const uniqueParts = nameParts.filter((word, index) => {
    return nameParts.findIndex((w) => w.toLowerCase() === word.toLowerCase()) === index;
  });
  const displayName = uniqueParts.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

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
  const realRating = typeof seller.rating === "number" && seller.rating > 0 ? seller.rating.toFixed(1) : "0";
  const realReviews = typeof seller.reviews === "number" && seller.reviews > 0 ? seller.reviews : 0;
  const realMemberSince = parseMemberSince(seller.memberSince);
  const realListingsCount = typeof otherListings === "number" ? otherListings : (seller.activeListings ?? 0);
  const realResponseTime = seller.responseTime || "< 15 mins";

  return (
    <div className="rounded-3xl border border-border/80 bg-card p-4.5 shadow-sm space-y-3.5">
      <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-3">
        <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">Seller Details</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 border border-border/60 px-2.5 py-0.5 text-[10px] font-black uppercase text-foreground">
          {seller.type === "business" ? <><StoreIcon className="h-3 w-3 text-primary" /> Business</> : <><User className="h-3 w-3 text-primary" /> Individual</>}
        </span>
      </div>

      <Link
        to="/seller/$id"
        params={{ id: seller.id }}
        className="flex items-start gap-3.5 group"
      >
        <div className="relative h-13 w-13 shrink-0">
          {seller.avatar ? (
            <img src={seller.avatar} alt={displayName} className="h-13 w-13 rounded-full object-cover border border-border shadow-sm group-hover:scale-105 transition-transform" />
          ) : (
            <div className="grid h-13 w-13 place-items-center rounded-full bg-gradient-to-tr from-primary to-indigo-800 text-white font-black text-base shadow-sm group-hover:scale-105 transition-transform">
              {displayName ? displayName.charAt(0).toUpperCase() : "S"}
            </div>
          )}
          {seller.verified && (
            <span className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-emerald-600 text-white border-2 border-card shadow-sm">
              <ShieldCheck className="h-3 w-3" />
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h4 className="truncate text-base font-black text-foreground group-hover:text-primary transition-colors">{displayName}</h4>
            {seller.verified && <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />}
          </div>
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
          <div className="text-[10px] font-bold text-muted-foreground mt-0.5">{realReviews} reviews</div>
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
        <span>⚡ Replies: <strong className="text-foreground font-extrabold">{realResponseTime}</strong></span>

        <Link
          to="/seller/$id"
          params={{ id: seller.id }}
          className="text-primary font-extrabold text-xs hover:underline"
        >
          View Profile →
        </Link>
      </div>
    </div>
  );
}
