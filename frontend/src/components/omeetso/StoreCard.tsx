import { Link } from "@tanstack/react-router";
import { Star, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";
import type { Store } from "@/lib/mock";

import { cn } from "@/lib/utils";

export function StoreCard({ s, className }: { s: Store; className?: string }) {
  const [coverUrl, setCoverUrl] = useState<string>(
    s.cover && !s.cover.startsWith("blob:")
      ? s.cover
      : "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800"
  );
  const [logoUrl, setLogoUrl] = useState<string | null>(
    s.logo && !s.logo.startsWith("blob:") ? s.logo : null
  );

  return (
    <Link
      to="/store/$id"
      params={{ id: s.id }}
      className={cn(
        "group block w-full overflow-hidden rounded-3xl bg-card border border-border/80 hover:border-primary/40 hover:shadow-2xl transition-all duration-300",
        className
      )}
    >
      {/* Cover Image Container */}
      <div className="relative h-28 w-full bg-slate-900 overflow-hidden">
        <img
          src={coverUrl}
          alt={s.name}
          onError={() => setCoverUrl("https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800")}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {s.sponsored && (
          <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-amber-500 text-slate-950 px-2.5 py-0.5 text-[10px] font-black shadow-md">
            <Sparkles className="h-3 w-3 fill-slate-950" /> Sponsored
          </span>
        )}
        <span className={`absolute right-2.5 top-2.5 rounded-full px-2 py-0.5 text-[10px] font-extrabold shadow-sm ${s.open ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"}`}>
          {s.open ? "Open Now" : "Closed"}
        </span>
      </div>

      {/* Content Container — Clean spacing with zero overlap */}
      <div className="p-3.5 pt-3">
        <div className="flex items-center gap-3">
          {/* Logo Avatar Container */}
          <div className="h-11 w-11 rounded-xl border-2 border-background bg-surface-2 shadow-sm shrink-0 overflow-hidden grid place-items-center">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={s.name}
                onError={() => setLogoUrl(null)}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-primary to-indigo-800 flex items-center justify-center text-center text-white font-black text-sm uppercase">
                {s.name?.charAt(0) || "S"}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <h4 className="truncate text-sm font-extrabold text-foreground group-hover:text-primary transition-colors">
                {s.name}
              </h4>
              {s.verified && <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-600" />}
            </div>
            <p className="text-[11px] font-medium text-muted-foreground truncate">
              {s.category || "Retail Store"} • {s.area || "Nearby"} ({s.distanceKm || 1.2} km)
            </p>
          </div>
        </div>

        {/* Footer Metrics */}
        <div className="mt-3 flex items-center justify-between pt-2 border-t border-border/50 text-[11px]">
          {Boolean(s.rating && s.reviews) ? (
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="font-extrabold text-foreground">{s.rating}</span>
              <span className="text-muted-foreground">({s.reviews} reviews)</span>
            </div>
          ) : (
            <span className="text-emerald-600 font-extrabold flex items-center gap-1 text-[11px]">
              <ShieldCheck className="h-3.5 w-3.5" /> Verified Store
            </span>
          )}

          <span className="font-bold text-primary hover:underline">
            Visit Store →
          </span>
        </div>
      </div>
    </Link>
  );
}
