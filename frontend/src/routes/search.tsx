import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Mic, Camera, Search, X, TrendingUp, Clock, Compass, Store } from "lucide-react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import {
  CATEGORIES, PRODUCTS, STORES, TRENDING_SEARCHES, DEFAULT_RECENT_SEARCHES,
} from "@/lib/mock";
import { getCachedCategories } from "@/lib/categories";
import {
  addRecentSearch, clearRecentSearches, getRecentSearches, removeRecentSearch,
} from "@/lib/saved";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Search · Omeetso" },
      { name: "description", content: "Search products, brands, categories and nearby stores on Omeetso." },
      { property: "og:title", content: "Search · Omeetso" },
      { property: "og:description", content: "Find cars, mobiles, furniture and more near you." },
    ],
  }),
  component: SearchLanding,
});

function SearchLanding() {
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [recents, setRecents] = useState<string[]>([]);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const stored = getRecentSearches();
    setRecents(stored.length ? stored : DEFAULT_RECENT_SEARCHES);
  }, []);

  const submit = (query: string) => {
    const s = query.trim();
    if (!s) return;
    addRecentSearch(s);
    nav({ to: "/results", search: { q: s } as never });
  };

  const suggestions = useMemo(() => {
    if (!q.trim()) return null;
    const allCats = getCachedCategories().length > 0 ? getCachedCategories() : CATEGORIES;
    return {
      products: PRODUCTS.filter((p) => !p.sponsored && p.title.toLowerCase().includes(needle)).slice(0, 5),
      categories: allCats.filter((c) => c.name.toLowerCase().includes(needle)).slice(0, 4),
      stores: STORES.filter((s) => s.name.toLowerCase().includes(needle) || s.category.toLowerCase().includes(needle)).slice(0, 3),
    };
  }, [q]);

  const highlight = (text: string) => {
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx < 0) return text;
    return (
      <>
        {text.slice(0, idx)}
        <span className="bg-yellow-brand/40 font-bold">{text.slice(idx, idx + q.length)}</span>
        {text.slice(idx + q.length)}
      </>
    );
  };

  const clearAll = () => { clearRecentSearches(); setRecents([]); };

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background">
        <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-border bg-card px-3 py-2.5 safe-t">
          <button onClick={() => history.length > 1 ? history.back() : nav({ to: "/home" })} className="grid h-10 w-10 place-items-center rounded-full hover:bg-secondary" aria-label="Back">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <form
            onSubmit={(e) => { e.preventDefault(); submit(q); }}
            className="flex flex-1 items-center gap-2 rounded-2xl bg-secondary px-3"
          >
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search cars, mobiles, furniture…"
              className="min-w-0 flex-1 bg-transparent py-2.5 text-sm outline-none"
              aria-label="Search"
            />
            {q && (
              <button type="button" onClick={() => setQ("")} aria-label="Clear" className="grid h-7 w-7 place-items-center rounded-full hover:bg-background">
                <X className="h-4 w-4" />
              </button>
            )}
            <button type="button" onClick={() => setVoiceOpen(true)} aria-label="Voice search" className="grid h-7 w-7 place-items-center rounded-full hover:bg-background">
              <Mic className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => setImageOpen(true)} aria-label="Image search" className="grid h-7 w-7 place-items-center rounded-full hover:bg-background">
              <Camera className="h-4 w-4" />
            </button>
          </form>
        </header>

        <div className="p-4 md:mx-auto md:max-w-3xl md:px-6 md:py-8">
          {suggestions ? (
            <div className="space-y-5">
              {suggestions.products.length > 0 && (
                <section>
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Products</p>
                  <div className="rounded-2xl border border-border bg-card">
                    {suggestions.products.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => submit(p.title)}
                        className="flex w-full items-center gap-3 border-b border-border p-3 text-left last:border-b-0 hover:bg-secondary"
                      >
                        <img src={p.image} alt="" className="h-10 w-10 rounded-lg object-cover" />
                        <div className="min-w-0 flex-1 text-sm">{highlight(p.title)}</div>
                        <Search className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                </section>
              )}
              {suggestions.categories.length > 0 && (
                <section>
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Categories</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.categories.map((c) => (
                      <Link
                        key={c.id}
                        to="/category/$id"
                        params={{ id: c.id }}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm"
                      >
                        {highlight(c.name)}
                      </Link>
                    ))}
                  </div>
                </section>
              )}
              {suggestions.stores.length > 0 && (
                <section>
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Stores near you</p>
                  <div className="space-y-2">
                    {suggestions.stores.map((s) => (
                      <Link
                        key={s.id}
                        to="/store/$id"
                        params={{ id: s.id }}
                        className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3"
                      >
                        <img src={s.logo} alt="" className="h-10 w-10 rounded-xl object-cover" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">{highlight(s.name)}</p>
                          <p className="text-[11px] text-muted-foreground">{s.category} · {s.area}</p>
                        </div>
                        <Store className="h-4 w-4 text-muted-foreground" />
                      </Link>
                    ))}
                  </div>
                </section>
              )}
              {suggestions.products.length === 0 && suggestions.categories.length === 0 && suggestions.stores.length === 0 && (
                <button
                  onClick={() => submit(q)}
                  className="w-full rounded-2xl border border-border bg-card p-4 text-left text-sm"
                >
                  Search for <span className="font-bold">“{q}”</span> across Omeetso
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Recents */}
              <section>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                    <Clock className="mr-1 inline h-3 w-3" /> Recent
                  </p>
                  {recents.length > 0 && (
                    <button onClick={clearAll} className="text-[11px] font-semibold text-destructive">
                      Clear all
                    </button>
                  )}
                </div>
                {recents.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No recent searches yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {recents.map((r) => (
                      <span key={r} className="inline-flex items-center gap-1 rounded-full border border-border bg-card pl-3 pr-1 py-1 text-sm">
                        <button onClick={() => submit(r)} className="font-medium">{r}</button>
                        <button
                          aria-label={`Remove ${r}`}
                          onClick={() => { removeRecentSearch(r); setRecents(getRecentSearches()); }}
                          className="grid h-6 w-6 place-items-center rounded-full text-muted-foreground hover:bg-secondary"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </section>

              {/* Trending */}
              <section>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                  <TrendingUp className="mr-1 inline h-3 w-3" /> Trending near you
                </p>
                <div className="flex flex-wrap gap-2">
                  {TRENDING_SEARCHES.map((t) => (
                    <button
                      key={t}
                      onClick={() => submit(t)}
                      className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-sm hover:bg-secondary"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </section>

              {/* Popular categories */}
              <section>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Popular categories</p>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.slice(0, 6).map((c) => (
                    <Link
                      key={c.id}
                      to="/category/$id"
                      params={{ id: c.id }}
                      className="rounded-2xl border border-border bg-card p-3 text-center text-xs font-semibold"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </section>

              {/* Nearby suggested */}
              <section>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                  <Compass className="mr-1 inline h-3 w-3" /> Suggested nearby
                </p>
                <div className="flex flex-wrap gap-2">
                  {["Sofas in Madhapur", "Used bikes Kukatpally", "Flats in Gachibowli", "Laptops Ameerpet"].map((s) => (
                    <button
                      key={s}
                      onClick={() => submit(s)}
                      className="rounded-full bg-secondary px-3 py-1.5 text-sm hover:bg-muted"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>

        {/* Voice placeholder */}
        {voiceOpen && (
          <FeatureSheet
            title="Voice search"
            body="Voice search is coming soon. Please type your query for now."
            onClose={() => setVoiceOpen(false)}
          />
        )}
        {imageOpen && (
          <FeatureSheet
            title="Image search"
            body="Image search is coming soon. Please type or use categories to find products."
            onClose={() => setImageOpen(false)}
          />
        )}
      </div>
    </MobileFrame>
  );
}

function FeatureSheet({ title, body, onClose }: { title: string; body: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end" role="dialog" aria-modal="true">
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 bg-navy/45 backdrop-blur-sm" />
      <div className="relative w-full rounded-t-3xl bg-card p-5 safe-b" style={{ animation: "ob-slide-up 220ms ease-out both" }}>
        <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-border" />
        <h3 className="text-base font-bold">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{body}</p>
        <button onClick={onClose} className="mt-4 w-full rounded-2xl bg-primary py-3 text-sm font-bold text-primary-foreground">
          Got it
        </button>
      </div>
    </div>
  );
}
