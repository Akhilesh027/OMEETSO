import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, MapPin, Locate, List as ListIcon, Search, Navigation } from "lucide-react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { PRODUCTS, formatINR, type Product } from "@/lib/mock";

type S = { q?: string; cat?: string; radius?: string };

export const Route = createFileRoute("/map")({
  validateSearch: (s: Record<string, unknown>): S => ({
    q: typeof s.q === "string" ? s.q : undefined,
    cat: typeof s.cat === "string" ? s.cat : undefined,
    radius: typeof s.radius === "string" ? s.radius : undefined,
  }),
  head: () => ({ meta: [{ title: "Map view · Omeetso" }, { name: "description", content: "View nearby listings on the map." }] }),
  component: MapPage,
});

// Deterministic pseudo positions per product id inside a 300x360 canvas
function pos(id: string): { x: number; y: number } {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return { x: 30 + (h % 250), y: 40 + ((h >> 8) % 260) };
}

function MapPage() {
  const nav = useNavigate({ from: "/map" });
  const search = Route.useSearch();
  const [selected, setSelected] = useState<Product | null>(null);
  const [radius, setRadius] = useState<number>(Number(search.radius ?? "10"));

  const q = search.q?.toLowerCase() ?? "";
  const list = useMemo(() => {
    return PRODUCTS.filter((p) => !p.sponsored)
      .filter((p) => p.distanceKm <= radius)
      .filter((p) => !search.cat || p.category === search.cat)
      .filter((p) => !q || p.title.toLowerCase().includes(q));
  }, [q, search.cat, radius]);

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background">
        <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-border bg-card px-3 py-2.5 safe-t">
          <button onClick={() => history.back()} className="grid h-10 w-10 place-items-center rounded-full hover:bg-secondary" aria-label="Back">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <Link to="/search" className="flex flex-1 items-center gap-2 rounded-2xl bg-secondary px-3 py-2 text-sm">
            <Search className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">{search.q || "Near Madhapur Metro, Hyderabad"}</span>
          </Link>
          <Link to="/results" search={search as never} className="grid h-10 w-10 place-items-center rounded-full hover:bg-secondary" aria-label="List view">
            <ListIcon className="h-5 w-5" />
          </Link>
        </header>

        {/* Map canvas */}
        <div className="relative mx-4 mt-3 h-[420px] overflow-hidden rounded-2xl border border-border bg-secondary/50">
          {/* pseudo streets */}
          <svg viewBox="0 0 320 420" className="absolute inset-0 h-full w-full">
            <defs>
              <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
                <path d="M 24 0 L 0 0 0 24" fill="none" stroke="var(--border)" strokeWidth="0.6" />
              </pattern>
            </defs>
            <rect width="320" height="420" fill="url(#grid)" />
            <path d="M 0 200 C 80 220, 200 160, 320 210" fill="none" stroke="var(--border)" strokeWidth="4" />
            <path d="M 160 0 C 140 120, 180 240, 150 420" fill="none" stroke="var(--border)" strokeWidth="4" />
            <circle cx="160" cy="210" r={radius * 8} fill="var(--primary)" fillOpacity="0.08" stroke="var(--primary)" strokeOpacity="0.4" strokeDasharray="4 4" />
          </svg>

          {/* Current location */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <span className="absolute inset-0 h-6 w-6 animate-ping rounded-full bg-primary/40" />
            <span className="relative grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground shadow">
              <Navigation className="h-3 w-3" />
            </span>
          </div>

          {/* Pins */}
          {list.slice(0, 14).map((p) => {
            const { x, y } = pos(p.id);
            const isSel = selected?.id === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelected(p)}
                aria-label={p.title}
                className={
                  "absolute -translate-x-1/2 -translate-y-full rounded-full border-2 px-2 py-0.5 text-[11px] font-bold shadow-lg transition " +
                  (isSel
                    ? "z-10 scale-110 border-yellow-brand bg-navy text-white"
                    : "border-white bg-primary text-primary-foreground")
                }
                style={{ left: x, top: y }}
              >
                {formatINR(p.price)}
              </button>
            );
          })}

          {/* Search this area */}
          <button
            onClick={() => setSelected(null)}
            className="absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-card px-3 py-1.5 text-xs font-semibold shadow-md border border-border"
          >
            Search this area
          </button>

          {/* Recenter */}
          <button
            className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-card text-primary shadow-md border border-border"
            aria-label="Recenter"
          >
            <Locate className="h-4 w-4" />
          </button>

          {/* Radius */}
          <div className="absolute inset-x-3 bottom-3 rounded-2xl bg-card/95 p-3 shadow-md border border-border">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold">Radius</span>
              <span className="text-primary font-bold">{radius} km</span>
            </div>
            <input
              type="range"
              min={2}
              max={30}
              value={radius}
              onChange={(e) => { setRadius(Number(e.target.value)); nav({ search: (p: S) => ({ ...p, radius: e.target.value }) }); }}
              className="mt-1 w-full accent-primary"
              aria-label="Search radius"
            />
          </div>
        </div>

        {/* Selected preview */}
        {selected ? (
          <div className="mx-4 mt-3">
            <Link to="/product/$id" params={{ id: selected.id }} className="flex gap-3 rounded-2xl border border-border bg-card p-3 card-elev">
              <img src={selected.image} alt="" className="h-20 w-20 shrink-0 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <p className="text-base font-bold">{formatINR(selected.price)}</p>
                <p className="line-clamp-1 text-sm">{selected.title}</p>
                <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                  <MapPin className="h-3 w-3" /> Near {selected.area} · {selected.distanceKm} km
                </p>
                <p className="mt-0.5 text-[10px] italic text-muted-foreground">Approximate area shown for privacy</p>
              </div>
            </Link>
          </div>
        ) : (
          <p className="mt-3 text-center text-xs text-muted-foreground">
            {list.length} listings within {radius} km · Approximate areas only
          </p>
        )}
      </div>
    </MobileFrame>
  );
}
