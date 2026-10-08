import { Link } from "@tanstack/react-router";
import { Eye, Heart, MessageCircle, Tag, MoreVertical, ImageOff, Zap } from "lucide-react";
import { formatINR, timeAgo, type Listing } from "@/lib/listings";
import { cn } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";

export function ListingCard({
  l, viewsIcon, extra, onMenu, className,
}: {
  l: Listing;
  viewsIcon?: boolean;
  extra?: { views?: number; saves?: number; chats?: number; offers?: number };
  onMenu?: () => void;
  className?: string;
}) {
  const cover = l.images[l.cover] ?? l.images[0];
  const isQuickSale = Boolean(
    l.method === "quick" ||
    (l as any).quickSale ||
    (l as any).isQuickSell ||
    l.id?.startsWith("Q-") ||
    l.id?.includes("quick")
  );

  return (
    <div
      className={cn(
        "group flex gap-3 rounded-2xl border border-border/80 bg-card p-3 shadow-xs transition-all duration-300 hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5",
        className
      )}
    >
      <Link
        to="/listing/$id/manage"
        params={{ id: l.id }}
        className="shrink-0 overflow-hidden rounded-xl bg-secondary relative"
        aria-label={`Manage ${l.title}`}
      >
        {cover ? (
          <div className="relative h-20 w-20">
            <img
              src={cover}
              alt={l.title}
              className="h-20 w-20 rounded-xl object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            {isQuickSale && (
              <span className="absolute left-1 top-1 z-10 grid h-5 w-5 place-items-center rounded-full bg-amber-500 text-slate-950 shadow-sm" title="Quick Sale Deal">
                <Zap className="h-3 w-3 fill-slate-950" />
              </span>
            )}
          </div>
        ) : (
          <div className="grid h-20 w-20 place-items-center rounded-xl bg-secondary text-muted-foreground transition-transform duration-300 group-hover:scale-105">
            <ImageOff className="h-5 w-5" />
          </div>
        )}
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <Link to="/listing/$id/manage" params={{ id: l.id }} className="min-w-0 flex-1">
            <p className="line-clamp-1 text-sm font-bold">{l.title}</p>
            <p className="text-sm font-extrabold text-navy">₹{formatINR(l.finalSalePrice ?? l.price)}</p>
          </Link>
          {onMenu && (
            <button onClick={onMenu} aria-label="More actions" className="grid h-8 w-8 place-items-center rounded-full hover:bg-secondary">
              <MoreVertical className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <StatusBadge status={l.status} />
          {isQuickSale && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/35 px-2 py-0.5 text-[10px] font-black text-amber-700 dark:text-amber-300">
              <Zap className="h-2.5 w-2.5 fill-amber-500 text-amber-500" /> Quick Sale
            </span>
          )}
          <span className="text-[11px] text-muted-foreground">
            {l.status === "under_review" ? `Submitted ${timeAgo(l.updatedAt)}` : `Posted ${timeAgo(l.createdAt)}`}
          </span>
        </div>
        {viewsIcon && l.status !== "rejected" && l.status !== "REJECTED" && (
          <div className="mt-1.5 flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3" /> {extra?.views ?? 0}</span>
            <span className="inline-flex items-center gap-1"><Heart className="h-3 w-3" /> {extra?.saves ?? 0}</span>
            <span className="inline-flex items-center gap-1"><MessageCircle className="h-3 w-3" /> {extra?.chats ?? 0}</span>
            <span className="inline-flex items-center gap-1"><Tag className="h-3 w-3" /> {extra?.offers ?? 0}</span>
          </div>
        )}
      </div>
    </div>
  );
}
