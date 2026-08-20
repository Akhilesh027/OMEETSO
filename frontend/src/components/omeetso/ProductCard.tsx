import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, ShieldCheck, MapPin, Sparkles, Ban, Zap, Eye, Star } from "lucide-react";
import { formatINR, type Product } from "@/lib/mock";
import { useSaved } from "@/hooks/useSaved";
import { cn } from "@/lib/utils";

function SaveButton({ id, size = "md" }: { id: string; size?: "sm" | "md" }) {
  const { saved, toggle } = useSaved(id);
  const dim = size === "sm" ? "h-7 w-7" : "h-8 w-8";
  const icon = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  return (
    <button
      type="button"
      aria-label={saved ? "Remove from saved" : "Save product"}
      aria-pressed={saved}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(); }}
      className={cn(
        "grid place-items-center rounded-full bg-white/95 text-navy shadow-sm hover:scale-110 transition-transform active:scale-95 z-10",
        dim
      )}
    >
      <Heart className={cn(icon, saved && "fill-orange-brand text-orange-brand")} />
    </button>
  );
}

function StatusOverlay({ p }: { p: Product }) {
  if (!p.sold && !p.unavailable) return null;
  return (
    <div className="absolute inset-0 grid place-items-center bg-navy/55 backdrop-blur-[1px]">
      <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-navy">
        <Ban className="h-3 w-3" /> {p.sold ? "Sold" : "Unavailable"}
      </span>
    </div>
  );
}

export function ProductCard({
  p,
  variant = "grid",
  onPreview,
}: {
  p: Product;
  variant?: "grid" | "compact" | "list";
  onPreview?: (p: Product) => void;
}) {
  const nav = useNavigate();
  const fallbackImg = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400";
  const imgSrc = p.image || (p as any).coverUrl || (Array.isArray(p.images) && p.images[0]) || fallbackImg;

  const isQuickSale = Boolean(
    (p as any).method === "quick" ||
    (p as any).quickSale ||
    (p as any).isQuickSell ||
    p.id.startsWith("Q-") ||
    p.id.includes("quick")
  );

  const handleQuickSaleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    nav({ to: "/results", search: { quickSale: "1" } as any });
  };

  if (variant === "compact") {
    return (
      <Link to="/product/$id" params={{ id: p.id }} className="block w-40 shrink-0 group">
        <div className="relative overflow-hidden rounded-2xl bg-card border border-border/70 group-hover:border-primary/30 group-hover:shadow-md transition-all">
          <img
            src={imgSrc}
            alt={p.title}
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).src = fallbackImg; }}
            className="h-32 w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute right-2 top-2"><SaveButton id={p.id} size="sm" /></div>
          {isQuickSale && (
            <button
              type="button"
              onClick={handleQuickSaleClick}
              className="absolute left-2 top-2 z-10 inline-flex items-center gap-1 rounded-full bg-amber-500 text-slate-950 px-2 py-0.5 text-[9px] font-black shadow-sm"
            >
              <Zap className="h-2.5 w-2.5 fill-slate-950" /> Quick
            </button>
          )}
          <StatusOverlay p={p} />
        </div>
        <div className="px-1 pt-2">
          <p className="text-[15px] font-black text-primary leading-tight">{formatINR(p.price)}</p>
          <p className="line-clamp-1 text-xs font-semibold text-foreground group-hover:text-primary transition-colors">{p.title}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">{p.area || "Kukatpally"} · {p.distanceKm || 1.5} km</p>
        </div>
      </Link>
    );
  }

  if (variant === "list") {
    return (
      <Link to="/product/$id" params={{ id: p.id }} className="flex gap-3.5 rounded-2xl bg-card p-3.5 border border-border/80 hover:border-primary/40 hover:shadow-lg transition-all group">
        <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-surface">
          <img
            src={imgSrc}
            alt={p.title}
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).src = fallbackImg; }}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {isQuickSale && (
            <button
              type="button"
              onClick={handleQuickSaleClick}
              className="absolute left-1.5 top-1.5 z-10 inline-flex items-center gap-1 rounded-full bg-amber-500 text-slate-950 px-2 py-0.5 text-[9px] font-black shadow-sm"
            >
              <Zap className="h-2.5 w-2.5 fill-slate-950" /> Quick
            </button>
          )}
          <StatusOverlay p={p} />
        </div>
        <div className="min-w-0 flex-1 flex flex-col justify-between py-0.5">
          <div>
            <div className="flex items-start justify-between gap-2">
              <p className="text-lg font-black text-primary">{formatINR(p.price)}</p>
              <SaveButton id={p.id} size="sm" />
            </div>
            <p className="line-clamp-2 text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{p.title}</p>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-primary shrink-0" /> {p.area || "Kukatpally"} · {p.distanceKm || 1.5} km away
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {isQuickSale && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[10px] font-black text-amber-600">
                  <Zap className="h-3 w-3 fill-amber-600" /> Quick Deal
                </span>
              )}
              {p.negotiable && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-primary">
                  Negotiable
                </span>
              )}
              {p.verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-extrabold text-emerald-600">
                  <ShieldCheck className="h-3 w-3" /> Verified Seller
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="group relative block rounded-3xl border border-border/80 bg-card p-3 sm:p-4 hover:border-primary/50 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300">
      <Link to="/product/$id" params={{ id: p.id }} className="block">
        <div className="relative overflow-hidden rounded-2xl bg-surface">
          <img
            src={imgSrc}
            alt={p.title}
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).src = fallbackImg; }}
            className="aspect-[4/3] sm:aspect-[16/11] h-40 sm:h-48 w-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
          />
          <div className="absolute right-2.5 top-2.5 flex items-center gap-1.5 z-10">
            {onPreview && (
              <button
                type="button"
                aria-label="Quick view"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onPreview(p);
                }}
                className="grid h-8.5 w-8.5 place-items-center rounded-full bg-white/95 text-slate-900 shadow-md hover:scale-110 active:scale-95 transition-transform"
              >
                <Eye className="h-4 w-4 text-primary" />
              </button>
            )}
            <SaveButton id={p.id} />
          </div>
          {isQuickSale ? (
            <button
              type="button"
              onClick={handleQuickSaleClick}
              className="absolute left-2.5 top-2.5 z-10 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 px-2.5 py-1 text-[10px] font-black shadow-md hover:scale-105 transition-transform"
            >
              <Zap className="h-3 w-3 fill-slate-950" /> Quick Deal
            </button>
          ) : p.sponsored ? (
            <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-2.5 py-1 text-[10px] font-black shadow-sm">
              <Sparkles className="h-3 w-3 text-amber-300 fill-amber-300" /> Featured
            </span>
          ) : null}
          {p.condition && (
            <span className="absolute left-2.5 bottom-2.5 z-10 rounded-xl bg-slate-950/85 backdrop-blur-md px-2.5 py-1 text-[10px] font-black uppercase text-amber-300 tracking-wider border border-amber-400/30 shadow-lg group-hover:scale-105 transition-all">
              ✨ {p.condition.replace(/_/g, " ")}
            </span>
          )}
          <StatusOverlay p={p} />
        </div>
      </Link>

      <div className="px-1 pt-3">
        <div className="flex items-center justify-between gap-2">
          <Link to="/product/$id" params={{ id: p.id }}>
            <p className={cn("text-xl sm:text-2xl font-black text-primary leading-none hover:text-electric transition-colors")}>
              {formatINR(p.price)}
            </p>
          </Link>
          {p.negotiable ? (
            <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 text-[11px] font-extrabold text-amber-600 shrink-0">
              Negotiable
            </span>
          ) : (
            <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-[11px] font-bold text-muted-foreground shrink-0">
              Fixed Price
            </span>
          )}
        </div>
        <Link to="/product/$id" params={{ id: p.id }}>
          <p className="mt-2 line-clamp-2 min-h-[2.5rem] text-xs sm:text-sm font-extrabold text-foreground group-hover:text-primary transition-colors leading-snug">
            {p.title}
          </p>
        </Link>
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/60">
          <span className="truncate flex items-center gap-1 font-medium">
            <MapPin className="h-3.5 w-3.5 text-primary/80 shrink-0" />
            {p.area || "Nearby"} · {p.distanceKm || 1.2} km
          </span>
          {Boolean(Number((p as any).rating) > 0 && Number((p as any).reviewCount) > 0) ? (
            <div className="flex items-center gap-1 shrink-0 font-extrabold text-xs">
              <span className="text-amber-500 flex items-center gap-0.5">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                {(p as any).rating}
              </span>
              <span className="text-muted-foreground font-normal">({(p as any).reviewCount})</span>
            </div>
          ) : p.verified ? (
            <span className="inline-flex items-center gap-0.5 text-emerald-600 font-extrabold shrink-0 text-xs">
              <ShieldCheck className="h-4 w-4" /> Verified
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
