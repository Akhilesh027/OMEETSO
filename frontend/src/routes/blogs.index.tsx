import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import {
  Search,
  BookOpen,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Star,
  ChevronRight,
  Heart,
  Share2
} from "lucide-react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import { fetchBlogs, fetchFeaturedBlogs, likeBlog, BlogArticle } from "@/api/blogs.api";
import { ShareBlogModal } from "@/components/omeetso/ShareBlogModal";
import { toast } from "sonner";

export const Route = createFileRoute("/blogs/")({
  head: () => ({
    meta: [
      { title: "Blogs & Guides — Omeetso Marketplace Insights" },
      { name: "description", content: "Expert buying checklists, selling tips, fraud prevention advisories, and Hyderabad local real estate guides." },
    ],
  }),
  component: BlogsIndexPage,
});

const CATEGORIES = [
  "ALL",
  "Buying Guides",
  "Selling Tips",
  "Safety & Scams",
  "Market Insights",
  "Tech Updates",
  "Community Stories"
];

function getLikedArticleIds(): string[] {
  try {
    const raw = localStorage.getItem("omeetso_liked_articles");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLikedArticleId(id: string) {
  try {
    const existing = getLikedArticleIds();
    if (!existing.includes(id)) {
      localStorage.setItem("omeetso_liked_articles", JSON.stringify([...existing, id]));
    }
  } catch {}
}

function BlogsIndexPage() {
  const [blogs, setBlogs] = useState<BlogArticle[]>([]);
  const [featuredBlogs, setFeaturedBlogs] = useState<BlogArticle[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [activeShareArticle, setActiveShareArticle] = useState<BlogArticle | null>(null);

  useEffect(() => {
    setLikedIds(getLikedArticleIds());
  }, []);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      fetchBlogs({ category: selectedCategory !== "ALL" ? selectedCategory : undefined }),
      fetchFeaturedBlogs()
    ])
      .then(([blogsRes, feat]) => {
        if (!isMounted) return;
        setBlogs(blogsRes.data || []);
        setFeaturedBlogs(feat || []);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCategory]);

  const spotlight = useMemo(() => {
    if (featuredBlogs.length > 0) return featuredBlogs[0];
    return blogs.find((b) => b.isFeatured) || blogs[0];
  }, [featuredBlogs, blogs]);

  const filteredBlogs = useMemo(() => {
    return blogs.filter((b) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = b.title.toLowerCase().includes(q);
        const matchExcerpt = b.excerpt.toLowerCase().includes(q);
        const matchTag = b.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchTitle && !matchExcerpt && !matchTag) return false;
      }
      return true;
    });
  }, [blogs, searchQuery]);

  const handleLike = async (e: React.MouseEvent, article: BlogArticle) => {
    e.preventDefault();
    e.stopPropagation();

    const id = article.id || article.slug;
    if (likedIds.includes(id)) {
      toast.info("You've already liked this guide!");
      return;
    }

    saveLikedArticleId(id);
    setLikedIds((prev) => [...prev, id]);

    // Optimistically update counts
    setBlogs((prev) =>
      prev.map((b) => (b.id === article.id ? { ...b, likesCount: (b.likesCount || 0) + 1 } : b))
    );
    setFeaturedBlogs((prev) =>
      prev.map((b) => (b.id === article.id ? { ...b, likesCount: (b.likesCount || 0) + 1 } : b))
    );

    toast.success("Thank you for liking this guide!");
    await likeBlog(article.slug || article.id);
  };

  const handleShare = (e: React.MouseEvent, article: BlogArticle) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveShareArticle(article);
  };

  return (
    <MobileFrame className="max-w-full overflow-x-clip">
      <div className="min-h-dvh bg-background text-foreground font-sans pb-24 md:pb-16 w-full">
        
        {/* Mobile Header Bar */}
        <div className="md:hidden">
          <BackBar title="Blogs & Guides" />
        </div>

        {/* Desktop Breadcrumb Header */}
        <div className="hidden md:block border-b border-border/80 bg-card/60 backdrop-blur-md w-full">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3.5">
            <nav className="text-xs text-muted-foreground flex items-center gap-2">
              <Link to="/home" className="hover:text-foreground font-bold transition-colors">Home</Link>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
              <span className="text-foreground font-black">Blogs & Marketplace Guides</span>
            </nav>
          </div>
        </div>

        {/* Main Responsive Container */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-8">
          
          {/* HERO BANNER */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-950 p-6 sm:p-10 text-white shadow-xl">
            <div className="relative z-10 max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-black backdrop-blur-md border border-white/15">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                <span>Omeetso Knowledge & Safety Hub</span>
              </div>
              
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                Marketplace Guides, Safety Tips & Local Resale Insights
              </h1>
              
              <p className="text-xs sm:text-sm text-indigo-100/90 font-medium leading-relaxed max-w-xl">
                Actionable advice, inspection checklists, and fraud prevention strategies written by local marketplace specialists across Hyderabad.
              </p>

              {/* Quick Search */}
              <div className="pt-2 max-w-lg">
                <div className="flex items-center gap-2 rounded-2xl bg-white/15 p-2 backdrop-blur-md border border-white/25 shadow-lg">
                  <Search className="h-4 w-4 text-indigo-200 ml-2 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search buying guides, car inspection, safety..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent px-2 text-xs sm:text-sm font-bold text-white placeholder:text-indigo-200/70 outline-none"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="px-2.5 py-1 rounded-xl bg-white/20 text-xs font-bold text-white hover:bg-white/30 transition"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="absolute -right-16 -bottom-16 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
          </section>

          {/* TOPIC PILLS */}
          <section className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 border-b border-border/60">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 rounded-2xl px-4 py-2 text-xs font-extrabold transition-all border cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-indigo-brand text-white border-indigo-brand shadow-sm"
                    : "bg-card text-foreground border-border hover:bg-secondary hover:border-indigo-brand/40"
                }`}
              >
                {cat === "ALL" ? "All Topics" : cat}
              </button>
            ))}
          </section>

          {/* SPOTLIGHT ARTICLE (HERO CARD) */}
          {!searchQuery && spotlight && selectedCategory === "ALL" && (
            <section className="space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-muted-foreground">
                <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                <span>Featured Spotlight</span>
              </div>

              <Link
                to="/blog/$slug"
                params={{ slug: spotlight.slug }}
                className="group block overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition hover:shadow-xl hover:border-indigo-brand/30"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
                  <div className="relative md:col-span-7 h-60 sm:h-80 overflow-hidden bg-secondary">
                    <img
                      src={spotlight.coverImage || "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1000"}
                      alt={spotlight.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute top-4 left-4 rounded-full bg-black/60 px-3 py-1 text-[10px] font-black uppercase text-white backdrop-blur-md">
                      {spotlight.category}
                    </span>
                  </div>

                  <div className="flex flex-col justify-between p-6 sm:p-8 md:col-span-5 space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground">
                        <span>⏱️ {spotlight.readTime || "4 min read"}</span>
                        <span>•</span>
                        <span>{new Date(spotlight.publishedAt || spotlight.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</span>
                      </div>

                      <h2 className="text-xl sm:text-2xl font-black text-foreground group-hover:text-indigo-brand transition leading-snug">
                        {spotlight.title}
                      </h2>

                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3 font-medium leading-relaxed">
                        {spotlight.excerpt}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-border pt-4">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                          <BookOpen className="h-4 w-4" />
                        </span>
                        <div>
                          <div className="text-xs font-black text-foreground">{spotlight.author?.name || "Omeetso Editorial"}</div>
                          <div className="text-[10px] text-muted-foreground font-semibold">{spotlight.author?.role || "Marketplace Specialist"}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => handleLike(e, spotlight)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
                            likedIds.includes(spotlight.id || spotlight.slug)
                              ? "bg-rose-500 text-white"
                              : "border border-rose-500/30 bg-rose-500/10 text-rose-600 hover:bg-rose-500/20"
                          }`}
                          title="Like guide"
                        >
                          <Heart className={`h-3.5 w-3.5 ${likedIds.includes(spotlight.id || spotlight.slug) ? "fill-white" : ""}`} />
                          <span>{spotlight.likesCount || 0}</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleShare(e, spotlight)}
                          className="p-2 rounded-xl border border-border bg-secondary/60 hover:bg-secondary text-foreground transition shadow-xs cursor-pointer"
                          title="Share guide"
                        >
                          <Share2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </section>
          )}

          {/* ARTICLES GRID */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                {searchQuery ? `Search Results (${filteredBlogs.length})` : `Latest Articles & Guides (${filteredBlogs.length})`}
              </h2>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="animate-pulse space-y-3 rounded-3xl border border-border bg-card p-4">
                    <div className="h-44 rounded-2xl bg-secondary" />
                    <div className="h-4 w-3/4 rounded bg-secondary" />
                    <div className="h-3 w-full rounded bg-secondary" />
                  </div>
                ))}
              </div>
            ) : filteredBlogs.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center space-y-3">
                <BookOpen className="h-10 w-10 text-muted-foreground mx-auto" />
                <h3 className="text-base font-black text-foreground">No articles match your search</h3>
                <p className="text-xs text-muted-foreground font-semibold max-w-xs mx-auto">
                  Try searching for different keywords such as "cars", "smartphones", or "safety".
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("ALL");
                  }}
                  className="px-4 py-2 rounded-2xl bg-indigo-brand text-white text-xs font-bold"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBlogs.map((article) => {
                  const isSpotlightMatch = !searchQuery && spotlight && article.id === spotlight.id && selectedCategory === "ALL";
                  if (isSpotlightMatch) return null;

                  const isLiked = likedIds.includes(article.id) || likedIds.includes(article.slug);

                  return (
                    <Link
                      key={article.id}
                      to="/blog/$slug"
                      params={{ slug: article.slug }}
                      className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-border bg-card shadow-xs hover:shadow-md transition-all hover:-translate-y-1 hover:border-indigo-brand/30"
                    >
                      <div>
                        {/* Thumbnail */}
                        <div className="relative h-48 w-full bg-secondary overflow-hidden">
                          <img
                            src={article.coverImage || "https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?w=600"}
                            alt={article.title}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <span className="absolute top-3 left-3 rounded-full bg-black/60 px-2.5 py-0.5 text-[10px] font-black uppercase text-white backdrop-blur-md">
                            {article.category}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="p-5 space-y-2.5">
                          <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                            <span>⏱️ {article.readTime || "3 min read"}</span>
                            <span>•</span>
                            <span>{new Date(article.publishedAt || article.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</span>
                          </div>

                          <h3 className="text-base font-black text-foreground group-hover:text-indigo-brand transition line-clamp-2 leading-snug">
                            {article.title}
                          </h3>

                          <p className="text-xs text-muted-foreground line-clamp-2 font-medium leading-relaxed">
                            {article.excerpt}
                          </p>
                        </div>
                      </div>

                      {/* Author & Footer with Like & Share */}
                      <div className="border-t border-border/70 p-4 bg-secondary/20 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px]">
                            <BookOpen className="h-3 w-3" />
                          </span>
                          <span className="text-[11px] font-bold text-foreground truncate max-w-[130px]">
                            {article.author?.name || "Omeetso Team"}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => handleLike(e, article)}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
                              isLiked
                                ? "bg-rose-500 text-white"
                                : "text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 border border-border bg-card"
                            }`}
                            title="Like this article"
                          >
                            <Heart className={`h-3.5 w-3.5 ${isLiked ? "fill-white" : ""}`} />
                            <span>{article.likesCount || 0}</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleShare(e, article)}
                            className="p-1.5 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary transition shadow-xs cursor-pointer"
                            title="Share article"
                          >
                            <Share2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          {/* SAFETY PROMISE CTA */}
          <section className="rounded-3xl border border-indigo-brand/20 bg-indigo-brand/5 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-indigo-brand text-white shadow-md">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-foreground">Have a Story or Scam Trap to Report?</h3>
                <p className="text-xs text-muted-foreground font-semibold mt-1 max-w-xl">
                  Help keep our Hyderabad neighborhood marketplace secure. Share feedback or report suspicious activities directly with our safety team.
                </p>
              </div>
            </div>
            <Link
              to="/safety"
              className="shrink-0 px-5 py-2.5 rounded-2xl bg-indigo-brand text-white text-xs font-black hover:bg-indigo-brand/90 transition shadow-sm"
            >
              Visit Safety Center
            </Link>
          </section>

        </div>

        {/* Global Share Modal */}
        {activeShareArticle && (
          <ShareBlogModal
            isOpen={Boolean(activeShareArticle)}
            onClose={() => setActiveShareArticle(null)}
            title={activeShareArticle.title}
            excerpt={activeShareArticle.excerpt}
            slug={activeShareArticle.slug}
            coverImage={activeShareArticle.coverImage}
            category={activeShareArticle.category}
          />
        )}

      </div>
    </MobileFrame>
  );
}
