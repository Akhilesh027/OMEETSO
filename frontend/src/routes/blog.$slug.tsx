import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Clock,
  Heart,
  Share2,
  Tag,
  BookOpen,
  ChevronRight,
  MessageCircle,
  Sparkles
} from "lucide-react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import { fetchBlogBySlug, likeBlog, BlogArticle } from "@/api/blogs.api";
import { ShareBlogModal } from "@/components/omeetso/ShareBlogModal";
import { toast } from "sonner";

export const Route = createFileRoute("/blog/$slug")({
  component: BlogDetailPage,
});

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

function BlogDetailPage() {
  const { slug } = useParams({ from: "/blog/$slug" });
  const [blog, setBlog] = useState<BlogArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [likesCount, setLikesCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchBlogBySlug(slug)
      .then((data) => {
        if (!isMounted) return;
        setBlog(data);
        if (data) {
          setLikesCount(data.likesCount || 0);
          document.title = `${data.title} — Omeetso Blogs`;

          // Check if previously liked in localStorage
          const likedIds = getLikedArticleIds();
          if (likedIds.includes(data.id) || (data._id && likedIds.includes(data._id)) || likedIds.includes(data.slug)) {
            setHasLiked(true);
          }
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  // Track reading scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const current = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, current)));
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLike = async () => {
    if (!blog) return;
    if (hasLiked) {
      toast.info("You have already liked this guide!");
      return;
    }

    setHasLiked(true);
    setLikesCount((prev) => prev + 1);
    saveLikedArticleId(blog.id || blog.slug);

    toast.success("Thank you for liking this guide!");

    const updatedLikes = await likeBlog(blog.slug || blog.id);
    if (updatedLikes !== null) {
      setLikesCount(updatedLikes);
    }
  };

  const handleWhatsAppShare = () => {
    if (!blog) return;
    const url = typeof window !== "undefined" ? window.location.href : "";
    const text = encodeURIComponent(`${blog.title}\n\nRead more on Omeetso Marketplace Guides:\n${url}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  if (loading) {
    return (
      <MobileFrame className="max-w-full overflow-x-clip">
        <div className="min-h-dvh bg-background text-foreground font-sans pb-20 w-full">
          <BackBar title="Reading Article" />
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-24 text-center text-xs font-bold text-muted-foreground animate-pulse">
            Loading article from Omeetso Knowledge Base...
          </div>
        </div>
      </MobileFrame>
    );
  }

  if (!blog) {
    return (
      <MobileFrame className="max-w-full overflow-x-clip">
        <div className="min-h-dvh bg-background text-foreground font-sans pb-20 w-full">
          <BackBar title="Article Not Found" />
          <div className="mx-auto max-w-md px-4 py-20 text-center rounded-3xl border border-dashed border-border bg-card space-y-3 mt-8">
            <BookOpen className="h-10 w-10 text-muted-foreground mx-auto" />
            <h2 className="text-base font-black text-foreground">Article not found</h2>
            <p className="text-xs text-muted-foreground font-semibold">
              This article may have been moved or removed by the editorial team.
            </p>
            <Link
              to="/blogs"
              className="inline-block px-4 py-2 rounded-2xl bg-indigo-brand text-white text-xs font-bold shadow-md"
            >
              Back to All Guides
            </Link>
          </div>
        </div>
      </MobileFrame>
    );
  }

  return (
    <MobileFrame className="max-w-full overflow-x-clip">
      <div className="min-h-dvh bg-background text-foreground font-sans pb-28 md:pb-20 w-full relative">
        
        {/* Top Reading Progress Bar */}
        <div
          className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 z-50 transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />

        {/* Mobile Header Bar */}
        <div className="md:hidden">
          <BackBar title={blog.category || "Article"} />
        </div>

        {/* Desktop Breadcrumb Navigation Bar */}
        <div className="hidden md:block border-b border-border/80 bg-card/60 backdrop-blur-md w-full">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-3.5">
            <nav className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
              <Link to="/home" className="hover:text-foreground transition">Home</Link>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
              <Link to="/blogs" className="hover:text-foreground transition">Blogs & Guides</Link>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
              <span className="text-foreground truncate max-w-md">{blog.title}</span>
            </nav>
          </div>
        </div>

        {/* Main Article Container */}
        <article className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
          
          {/* Header Metadata */}
          <header className="space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="px-3.5 py-1 rounded-full bg-indigo-brand/10 text-indigo-brand text-xs font-black uppercase tracking-wider">
                {blog.category}
              </span>
              <span className="text-xs text-muted-foreground font-bold flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                {blog.readTime || "3 min read"}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-foreground leading-tight tracking-tight">
              {blog.title}
            </h1>

            <p className="text-sm sm:text-base font-semibold text-muted-foreground leading-relaxed">
              {blog.excerpt}
            </p>

            {/* Author Card & Social Share Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-y border-border py-4 my-2">
              <div className="flex items-center gap-3">
                <img
                  src={blog.author?.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200"}
                  alt={blog.author?.name}
                  className="h-11 w-11 rounded-full object-cover border border-border shadow-xs"
                />
                <div>
                  <h3 className="text-xs font-black text-foreground">{blog.author?.name || "Omeetso Editorial Team"}</h3>
                  <p className="text-[11px] text-muted-foreground font-semibold">
                    {blog.author?.role || "Marketplace Specialist"} • {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" })}
                  </p>
                </div>
              </div>

              {/* Header Share & Like Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                    hasLiked
                      ? "bg-rose-500 text-white"
                      : "border border-rose-500/30 bg-rose-500/10 text-rose-600 hover:bg-rose-500/20"
                  }`}
                  title="Like this article"
                >
                  <Heart className={`h-4 w-4 ${hasLiked ? "fill-white" : ""}`} />
                  <span>{likesCount}</span>
                </button>

                <button
                  onClick={handleWhatsAppShare}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition shadow-xs cursor-pointer"
                  title="Share on WhatsApp"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">WhatsApp</span>
                </button>

                <button
                  onClick={() => setShareModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border bg-card text-foreground text-xs font-bold hover:bg-secondary transition shadow-xs cursor-pointer"
                  title="More sharing options"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </header>

          {/* Featured Cover Banner */}
          {blog.coverImage && (
            <div className="relative overflow-hidden rounded-3xl border border-border shadow-md bg-secondary">
              <img
                src={blog.coverImage}
                alt={blog.title}
                className="w-full h-64 sm:h-[420px] object-cover"
              />
            </div>
          )}

          {/* Article Reading Content */}
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-xs space-y-5">
            <div className="text-foreground text-sm sm:text-base leading-relaxed space-y-4 whitespace-pre-wrap font-sans">
              {blog.content}
            </div>

            {/* Tags Strip */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="pt-6 border-t border-border flex flex-wrap gap-2">
                {blog.tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-secondary text-xs font-bold text-muted-foreground"
                  >
                    <Tag className="h-3 w-3" /> #{t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Helpful / Like Action Box */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl border border-border bg-card shadow-xs">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="text-base font-black text-foreground flex items-center justify-center sm:justify-start gap-2">
                <span>Did you find this guide helpful?</span>
                <Sparkles className="h-4 w-4 text-amber-500" />
              </h4>
              <p className="text-xs text-muted-foreground font-semibold">
                Your feedback helps our team publish better buyer protection tips and local marketplace guides.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black transition-all shadow-md cursor-pointer ${
                  hasLiked
                    ? "bg-rose-500 text-white hover:bg-rose-600 scale-102"
                    : "border border-rose-500/30 bg-rose-500/10 text-rose-600 hover:bg-rose-500/20"
                }`}
              >
                <Heart className={`h-4 w-4 ${hasLiked ? "fill-white animate-pulse" : ""}`} />
                <span>{hasLiked ? "Liked! Thank You" : "Helpful Guide"}</span>
                <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] font-black">
                  {likesCount}
                </span>
              </button>

              <button
                onClick={() => setShareModalOpen(true)}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-border bg-secondary/50 hover:bg-secondary text-foreground text-xs font-black transition-all shadow-xs cursor-pointer"
              >
                <Share2 className="h-4 w-4" />
                <span>Share Guide</span>
              </button>
            </div>
          </div>

          {/* Author Bio Card */}
          {blog.author && (
            <div className="flex items-start gap-4 p-6 sm:p-8 rounded-3xl border border-border bg-secondary/30">
              <img
                src={blog.author.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200"}
                alt={blog.author.name}
                className="h-14 w-14 rounded-full object-cover border border-border shrink-0 shadow-xs"
              />
              <div className="space-y-1">
                <h4 className="text-sm font-black text-foreground">Written by {blog.author.name}</h4>
                <p className="text-xs font-bold text-indigo-brand">{blog.author.role || "Marketplace Specialist"}</p>
                <p className="text-xs text-muted-foreground font-medium leading-relaxed mt-1">
                  {blog.author.bio || "Dedicated to creating actionable guides and market insights for honest neighborhood transactions across India."}
                </p>
              </div>
            </div>
          )}

          {/* Related Articles Section */}
          {blog.related && blog.related.length > 0 && (
            <section className="space-y-4 pt-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                Related Articles in {blog.category}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {blog.related.map((rel) => (
                  <Link
                    key={rel.id}
                    to="/blog/$slug"
                    params={{ slug: rel.slug }}
                    className="group block rounded-3xl border border-border bg-card p-3.5 shadow-xs hover:shadow-md transition hover:border-indigo-brand/30"
                  >
                    <img
                      src={rel.coverImage || "https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?w=400"}
                      alt={rel.title}
                      className="h-32 w-full rounded-2xl object-cover mb-2.5"
                    />
                    <h4 className="text-xs font-black text-foreground group-hover:text-indigo-brand transition line-clamp-2 leading-snug">
                      {rel.title}
                    </h4>
                    <span className="text-[11px] font-bold text-muted-foreground mt-1.5 block">
                      ⏱️ {rel.readTime || "3 min read"}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

        </article>

        {/* Floating Quick Action Pill (Bottom of Screen) */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 rounded-full border border-border bg-card/90 backdrop-blur-md px-4 py-2.5 shadow-2xl">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black transition cursor-pointer ${
              hasLiked
                ? "bg-rose-500 text-white shadow-xs"
                : "text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10"
            }`}
          >
            <Heart className={`h-4 w-4 ${hasLiked ? "fill-white" : ""}`} />
            <span>{likesCount}</span>
          </button>

          <div className="h-4 w-px bg-border" />

          <button
            onClick={handleWhatsAppShare}
            className="p-1.5 rounded-full text-muted-foreground hover:text-emerald-600 hover:bg-emerald-500/10 transition cursor-pointer"
            title="Share via WhatsApp"
          >
            <MessageCircle className="h-4 w-4" />
          </button>

          <button
            onClick={() => setShareModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-brand text-white text-xs font-black hover:bg-indigo-brand/90 transition shadow-xs cursor-pointer"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>Share</span>
          </button>
        </div>

        {/* Rich Share Modal */}
        <ShareBlogModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          title={blog.title}
          excerpt={blog.excerpt}
          slug={blog.slug}
          coverImage={blog.coverImage}
          category={blog.category}
        />

      </div>
    </MobileFrame>
  );
}
