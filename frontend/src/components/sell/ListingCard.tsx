import { Link } from "@tanstack/react-router";
import { Eye, Heart, MessageCircle, Tag, MoreVertical, ImageOff } from "lucide-react";
import { formatINR, timeAgo, type Listing } from "@/lib/listings";
import { StatusBadge } from "./StatusBadge";

export function ListingCard({
  l, viewsIcon, extra, onMenu,
}: {
  l: Listing;
  viewsIcon?: boolean;
  extra?: { views?: number; saves?: number; chats?: number; offers?: number };
  onMenu?: () => void;
}) {
  const cover = l.images[l.cover] ?? l.images[0];
  return (
    <div className="flex gap-3 rounded-2xl border border-border bg-card p-3">
      <Link to="/listing/$id/manage" params={{ id: l.id }} className="shrink-0" aria-label={`Manage ${l.title}`}>
        {cover ? (
          <img src={cover} alt={l.title} className="h-20 w-20 rounded-xl object-cover" />
        ) : (
          <div className="grid h-20 w-20 place-items-center rounded-xl bg-secondary text-muted-foreground">
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
          <span className="text-[11px] text-muted-foreground">
            {l.status === "under_review" ? `Submitted ${timeAgo(l.updatedAt)}` : `Posted ${timeAgo(l.createdAt)}`}
          </span>
        </div>
        {viewsIcon && (
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
