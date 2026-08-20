import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import { fetchLiveCategories, getCachedCategories, type LiveCategory } from "@/lib/categories";
import { CategoryDetailModal } from "@/components/omeetso/CategoryDetailModal";
import { BRANDS_BY_CATEGORY } from "@/lib/aiAssistance";
import * as Icons from "lucide-react";
import { Search, ChevronRight, Sparkles, Package, ArrowRight, Flame, ShieldCheck, Tag, Layers, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "All Categories & Subcategories · Omeetso" },
      { name: "description", content: "Explore every category, subcategory, and top brand on Omeetso — cars, bikes, mobiles, electronics, furniture, jobs, services and more." },
      { property: "og:title", content: "All Categories · Omeetso" },
      { property: "og:description", content: "Browse all product categories, subcategories, and brands nearby." },
    ],
  }),
  component: CategoriesPage,
});

const CATEGORY_TINTS: Record<string, { bg: string; text: string; border: string; badgeBg: string }> = {
  cars: { bg: "bg-blue-500/10 dark:bg-blue-500/15", text: "text-blue-600 dark:text-blue-400", border: "hover:border-blue-500/50", badgeBg: "bg-blue-500/15 text-blue-700 dark:text-blue-300" },
  bikes: { bg: "bg-amber-500/10 dark:bg-amber-500/15", text: "text-amber-600 dark:text-amber-400", border: "hover:border-amber-500/50", badgeBg: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
  mobiles: { bg: "bg-violet-500/10 dark:bg-violet-500/15", text: "text-violet-600 dark:text-violet-400", border: "hover:border-violet-500/50", badgeBg: "bg-violet-500/15 text-violet-700 dark:text-violet-300" },
  electronics: { bg: "bg-cyan-500/10 dark:bg-cyan-500/15", text: "text-cyan-600 dark:text-cyan-400", border: "hover:border-cyan-500/50", badgeBg: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300" },
  furniture: { bg: "bg-orange-500/10 dark:bg-orange-500/15", text: "text-orange-600 dark:text-orange-400", border: "hover:border-orange-500/50", badgeBg: "bg-orange-500/15 text-orange-700 dark:text-orange-300" },
  properties: { bg: "bg-emerald-500/10 dark:bg-emerald-500/15", text: "text-emerald-600 dark:text-emerald-400", border: "hover:border-emerald-500/50", badgeBg: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  fashion: { bg: "bg-pink-500/10 dark:bg-pink-500/15", text: "text-pink-600 dark:text-pink-400", border: "hover:border-pink-500/50", badgeBg: "bg-pink-500/15 text-pink-700 dark:text-pink-300" },
  appliances: { bg: "bg-sky-500/10 dark:bg-sky-500/15", text: "text-sky-600 dark:text-sky-400", border: "hover:border-sky-500/50", badgeBg: "bg-sky-500/15 text-sky-700 dark:text-sky-300" },
  jobs: { bg: "bg-indigo-500/10 dark:bg-indigo-500/15", text: "text-indigo-600 dark:text-indigo-400", border: "hover:border-indigo-500/50", badgeBg: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300" },
  services: { bg: "bg-rose-500/10 dark:bg-rose-500/15", text: "text-rose-600 dark:text-rose-400", border: "hover:border-rose-500/50", badgeBg: "bg-rose-500/15 text-rose-700 dark:text-rose-300" },
};

const DEFAULT_TINT = { bg: "bg-primary/10", text: "text-primary", border: "hover:border-primary/50", badgeBg: "bg-primary/15 text-primary" };

const QUICK_FILTER_TAGS = [
  { id: "all", label: "All Categories" },
  { id: "mobiles", label: "📱 Mobiles" },
  { id: "cars", label: "🚗 Cars" },
  { id: "bikes", label: "🏍️ Bikes" },
  { id: "electronics", label: "💻 Electronics" },
  { id: "furniture", label: "🛋️ Furniture" },
  { id: "jobs", label: "💼 Jobs" },
];

function CategoriesPage() {
  const nav = useNavigate();
  const [categories, setCategories] = useState<LiveCategory[]>(() => getCachedCategories());
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [modalCategory, setModalCategory] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchLiveCategories()
      .then((data) => {
        setCategories(data);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredCategories = useMemo(() => {
    let list = categories;

    if (activeFilter !== "all") {
      list = list.filter((c) => c.id.toLowerCase() === activeFilter.toLowerCase());
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((c) => {
        const matchName = c.name.toLowerCase().includes(q);
        const matchSub = Array.isArray(c.subcategories) && c.subcategories.some((sub: any) =>
          (typeof sub === "string" ? sub : sub?.name || "").toLowerCase().includes(q)
        );
        const matchBrands = (BRANDS_BY_CATEGORY[c.id.toLowerCase()] || []).some((b) => b.toLowerCase().includes(q));
        return matchName || matchSub || matchBrands;
      });
    }

    return list;
  }, [categories, activeFilter, search]);

  const totalListings = useMemo(() => {
    return categories.reduce((sum, c) => sum + (c.count || 0), 0);
  }, [categories]);

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-28 md:pb-16 font-sans">
        <BackBar title="All Categories" />

        {/* Dynamic Desktop Hero Header Banner */}
        <div className="hidden md:block border-b border-border/80 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 text-white relative overflow-hidden">
          <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 h-96 w-96 rounded-full bg-indigo-500/25 blur-3xl pointer-events-none" />

          <div className="mx-auto max-w-[1440px] px-6 lg:px-10 py-10 relative z-10">
            <nav className="text-xs font-semibold text-slate-400 flex items-center gap-2">
              <Link to="/home" className="hover:text-amber-400 transition-colors">Home</Link>
              <span>/</span>
              <span className="text-white font-bold">Browse Categories</span>
            </nav>

            <div className="mt-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-1 text-xs font-black text-amber-300">
                  <Sparkles className="h-3.5 w-3.5 fill-amber-300" /> Dedicated Marketplace Hub
                </div>
                <h1 className="text-3xl lg:text-4xl xl:text-5xl font-black tracking-tight leading-tight">
                  Explore All Categories & <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500">Top Brands</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-xl">
                  Discover verified listings, subcategories, top brands, and direct local sellers across Hyderabad with 0% middleman fees.
                </p>
              </div>

              {/* Stats Badge Pill */}
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 shrink-0">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-amber-500 text-slate-950 font-black text-lg shadow-md">
                  🏷️
                </div>
                <div>
                  <div className="text-lg font-black text-white">{totalListings.toLocaleString("en-IN")} Ads</div>
                  <div className="text-xs text-amber-300 font-bold">100% Live & Verified</div>
                </div>
              </div>
            </div>

            {/* Live Search Box inside Desktop Hero Header */}
            <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 max-w-2xl">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter by category, subcategory (e.g. Smartphones), or brand (e.g. Apple)..."
                  className="w-full h-12 rounded-2xl border border-white/20 bg-slate-900/80 backdrop-blur-md pl-11 pr-4 text-xs sm:text-sm font-bold text-white placeholder:text-slate-400 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all shadow-xl"
                />
              </div>

              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="px-4 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-xs font-black text-white border border-white/20 transition-all"
                >
                  Clear Search
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Header & Search Bar */}
        <div className="p-4 md:hidden border-b border-border/60 bg-card space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search category, subcategory or brand..."
              className="w-full h-11 rounded-2xl border border-border bg-background pl-10 pr-4 text-xs font-bold text-foreground outline-none focus:border-primary transition-all"
            />
          </div>

          {/* Quick Filter Horizontal Scroll */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {QUICK_FILTER_TAGS.map((tag) => (
              <button
                key={tag.id}
                onClick={() => setActiveFilter(tag.id)}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition-all border",
                  activeFilter === tag.id
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-card text-foreground border-border hover:bg-secondary"
                )}
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-6 md:py-8 space-y-8">

          {/* Desktop Filter Pills */}
          <div className="hidden md:flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 border-b border-border/60">
            {QUICK_FILTER_TAGS.map((tag) => (
              <button
                key={tag.id}
                onClick={() => setActiveFilter(tag.id)}
                className={cn(
                  "shrink-0 rounded-2xl px-4 py-2 text-xs font-extrabold transition-all border cursor-pointer",
                  activeFilter === tag.id
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-card text-foreground border-border hover:bg-secondary hover:border-primary/40"
                )}
              >
                {tag.label}
              </button>
            ))}
          </div>

          {loading && categories.length === 0 && (
            <div className="py-16 text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
              <p className="mt-3 text-xs font-bold text-muted-foreground">Loading categories from MongoDB database…</p>
            </div>
          )}

          {/* Master Categories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredCategories.map((c) => {
              const catId = c.id.toLowerCase();
              const tint = CATEGORY_TINTS[catId] || DEFAULT_TINT;
              const IconComp = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[c.icon] ?? Icons.Package;
              const subList = Array.isArray(c.subcategories) ? c.subcategories : [];
              const brands = BRANDS_BY_CATEGORY[catId] || [];

              return (
                <div
                  key={c.id}
                  className={cn(
                    "group relative rounded-3xl border border-border/80 bg-card p-5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4",
                    tint.border
                  )}
                >
                  <div className="space-y-4">
                    {/* Header: Icon, Name & Live Count */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={cn("grid h-13 w-13 shrink-0 place-items-center rounded-2xl transition-transform group-hover:scale-105 shadow-xs font-black", tint.bg, tint.text)}>
                          <IconComp className="h-6.5 w-6.5" />
                        </div>
                        <div>
                          <Link
                            to={c.id === "jobs" ? ("/jobs" as any) : c.id === "services" ? ("/services" as any) : "/category/$id"}
                            params={c.id !== "jobs" && c.id !== "services" ? { id: c.id } : undefined}
                            className="text-base font-black text-foreground group-hover:text-primary transition-colors leading-tight block"
                          >
                            {c.name}
                          </Link>
                          <span className={cn("mt-1 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10.5px] font-black", tint.badgeBg)}>
                            <Flame className="h-3 w-3 fill-current" />
                            {(c.count || 0).toLocaleString("en-IN")} Live Ads
                          </span>
                        </div>
                      </div>

                      {/* Modal Preview Quick Button */}
                      <button
                        type="button"
                        onClick={() => setModalCategory(c)}
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary hover:bg-primary hover:text-white transition-all text-muted-foreground shadow-xs active:scale-90 cursor-pointer"
                        title={`View ${c.name} Brands & Subcategories Modal`}
                      >
                        <Sparkles className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Subcategories Chips Section */}
                    {subList.length > 0 && (
                      <div className="pt-3 border-t border-border/60 space-y-2">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                          <span>Popular Subcategories</span>
                          <span>{subList.length} total</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {subList.slice(0, 5).map((sub: any, idx: number) => {
                            const subName = typeof sub === "string" ? sub : sub?.name || "General";
                            const subId = typeof sub === "object" ? sub?.id || subName : subName;
                            return (
                              <Link
                                key={idx}
                                to="/category/$id"
                                params={{ id: c.id }}
                                search={{ sub: subId.toLowerCase() } as never}
                                className="rounded-xl border border-border/60 bg-secondary/50 hover:bg-primary/10 hover:border-primary/40 hover:text-primary px-2.5 py-1 text-[11px] font-extrabold text-foreground transition-all"
                              >
                                {subName}
                              </Link>
                            );
                          })}

                          <button
                            type="button"
                            onClick={() => setModalCategory(c)}
                            className="rounded-xl border border-primary/30 bg-primary/10 hover:bg-primary hover:text-white px-2.5 py-1 text-[11px] font-black text-primary transition-all cursor-pointer shadow-2xs"
                          >
                            +{subList.length > 5 ? subList.length - 5 : 0} More & Brands →
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Featured Brands Row */}
                    {brands.length > 0 && (
                      <div className="pt-2 border-t border-border/40 flex items-center gap-1.5 text-[11px] text-muted-foreground font-semibold truncate">
                        <Tag className="h-3 w-3 text-indigo-brand shrink-0" />
                        <span className="truncate">Top Brands: <strong className="text-foreground font-bold">{brands.slice(0, 4).join(", ")}</strong></span>
                      </div>
                    )}
                  </div>

                  {/* Footer Actions */}
                  <div className="pt-2 flex items-center gap-2">
                    <Link
                      to={c.id === "jobs" ? ("/jobs" as any) : c.id === "services" ? ("/services" as any) : "/category/$id"}
                      params={c.id !== "jobs" && c.id !== "services" ? { id: c.id } : undefined}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-2xl bg-secondary hover:bg-primary hover:text-white text-xs font-black text-foreground transition-all shadow-xs"
                    >
                      <span>Explore {c.id === "jobs" ? "Jobs" : c.id === "services" ? "Services" : "Category"}</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => setModalCategory(c)}
                      className="px-3.5 py-2.5 rounded-2xl border border-border bg-card hover:bg-secondary text-xs font-black text-foreground transition-all flex items-center gap-1 shrink-0"
                      title="Open Brands & Subcategories Modal"
                    >
                      <span>Brands</span>
                      <Layers className="h-3.5 w-3.5 text-primary" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredCategories.length === 0 && (
            <div className="rounded-3xl border border-border bg-card p-12 text-center space-y-3">
              <Package className="h-10 w-10 text-muted-foreground mx-auto" />
              <h3 className="text-base font-extrabold">No categories found matching "{search}"</h3>
              <p className="text-xs text-muted-foreground">Try searching for different terms like Cars, Mobiles, Electronics, Furniture, or Brands like Apple or Sony.</p>
              <button
                onClick={() => { setSearch(""); setActiveFilter("all"); }}
                className="mt-2 inline-flex px-5 py-2.5 rounded-xl bg-primary text-xs font-bold text-white shadow-sm"
              >
                Clear Filters & Search
              </button>
            </div>
          )}

          {/* Hyperlocal Guarantee Advisory Card */}
          <div className="rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 text-white p-6 shadow-xl border border-indigo-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-500 text-slate-950 shrink-0 font-black text-xl shadow-lg">
                🛡️
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-white">0% Commission & Verified Local Sellers</h3>
                <p className="text-xs text-slate-300 font-medium">Deal directly with sellers near you. Instant chat, phone calls, and 100% free posting across all categories.</p>
              </div>
            </div>

            <Link
              to="/sell"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 text-slate-950 font-black text-xs shadow-md shrink-0 hover:scale-105 active:scale-95 transition-all"
            >
              Post Free Ad Now <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

        </div>

        {/* Cute Subcategories & Brands Modal */}
        <CategoryDetailModal
          open={Boolean(modalCategory)}
          onClose={() => setModalCategory(null)}
          category={modalCategory}
        />
      </div>
    </MobileFrame>
  );
}
