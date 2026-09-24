import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  Star,
  Clock,
  CheckCircle2,
  TrendingUp,
  FileText,
  ExternalLink,
  RefreshCw,
  Calendar,
  X
} from "lucide-react";
import { BACKEND_URL, getFrontendBaseUrl } from "@/config/api";
import { BlogEditorModal, BlogItem, CATEGORY_OPTIONS } from "@/components/blogs/BlogEditorModal";

const API_BASE = `${BACKEND_URL}/api/v1`;

export const BlogsPage: React.FC = () => {
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    scheduled: 0,
    draft: 0,
    archived: 0,
    totalViews: 0
  });

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Quick Schedule Modal state
  const [quickScheduleBlog, setQuickScheduleBlog] = useState<BlogItem | null>(null);
  const [quickScheduledDate, setQuickScheduledDate] = useState<string>("");
  const [isScheduling, setIsScheduling] = useState(false);

  const liveBlogHubUrl = `${getFrontendBaseUrl()}/blogs`;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const token = typeof localStorage !== "undefined" ? localStorage.getItem("omeetso_admin_token") : null;
      const params = new URLSearchParams();
      if (selectedStatus !== "ALL") params.append("status", selectedStatus);
      if (selectedCategory !== "ALL") params.append("category", selectedCategory);
      if (searchQuery.trim()) params.append("q", searchQuery.trim());

      const res = await fetch(`${API_BASE}/admin/blogs?${params.toString()}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setBlogs(json.data);
        if (json.stats) setStats(json.stats);
      }
    } catch (err) {
      console.warn("Failed to load admin blogs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [selectedStatus, selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBlogs();
  };

  const handleSaveBlog = async (payload: Partial<BlogItem>) => {
    const token = typeof localStorage !== "undefined" ? localStorage.getItem("omeetso_admin_token") : null;
    const isEdit = Boolean(editingBlog && (editingBlog.id || editingBlog._id));
    const url = isEdit
      ? `${API_BASE}/admin/blogs/${editingBlog?.id || editingBlog?._id}`
      : `${API_BASE}/admin/blogs`;

    const res = await fetch(url, {
      method: isEdit ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(payload)
    });

    const json = await res.json();
    if (json.success) {
      showToast(
        payload.status === "SCHEDULED"
          ? "Article scheduled for future release!"
          : isEdit
          ? "Article updated successfully!"
          : "Article created successfully!"
      );
      fetchBlogs();
    } else {
      throw new Error(json.error?.message || "Failed to save article");
    }
  };

  const handleToggleStatus = async (blogId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      const token = typeof localStorage !== "undefined" ? localStorage.getItem("omeetso_admin_token") : null;
      const res = await fetch(`${API_BASE}/admin/blogs/${blogId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        showToast(`Article status updated to ${nextStatus}!`);
        setBlogs((prev) =>
          prev.map((b) => (b.id === blogId || b._id === blogId ? { ...b, status: nextStatus as any } : b))
        );
      }
    } catch (err) {
      console.warn("Status toggle error:", err);
    }
  };

  const handleQuickScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickScheduleBlog) return;

    if (!quickScheduledDate) {
      alert("Please select a date and time to schedule");
      return;
    }

    const selected = new Date(quickScheduledDate);
    if (selected <= new Date()) {
      alert("Scheduled time must be in the future");
      return;
    }

    const blogId = quickScheduleBlog.id || quickScheduleBlog._id || "";
    setIsScheduling(true);
    try {
      const token = typeof localStorage !== "undefined" ? localStorage.getItem("omeetso_admin_token") : null;
      const res = await fetch(`${API_BASE}/admin/blogs/${blogId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          status: "SCHEDULED",
          scheduledAt: selected.toISOString()
        })
      });
      if (res.ok) {
        showToast(`Article scheduled for ${selected.toLocaleString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}!`);
        setQuickScheduleBlog(null);
        fetchBlogs();
      }
    } catch (err) {
      console.warn("Quick schedule error:", err);
    } finally {
      setIsScheduling(false);
    }
  };

  const openQuickScheduleModal = (blog: BlogItem) => {
    let initDate = "";
    if (blog.scheduledAt) {
      try {
        initDate = new Date(blog.scheduledAt).toISOString().slice(0, 16);
      } catch {}
    }
    if (!initDate) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      initDate = tomorrow.toISOString().slice(0, 16);
    }
    setQuickScheduledDate(initDate);
    setQuickScheduleBlog(blog);
  };

  const handleDeleteBlog = async (blogId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"?`)) return;
    try {
      const token = typeof localStorage !== "undefined" ? localStorage.getItem("omeetso_admin_token") : null;
      const res = await fetch(`${API_BASE}/admin/blogs/${blogId}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        showToast("Article deleted successfully");
        setBlogs((prev) => prev.filter((b) => b.id !== blogId && b._id !== blogId));
      }
    } catch (err) {
      console.warn("Delete error:", err);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-slate-900 text-white px-4 py-3 text-xs font-black shadow-2xl animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-admin-text tracking-tight">Blogs & Guides Management</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-admin-indigo text-[10px] font-black uppercase">
              Content Hub
            </span>
          </div>
          <p className="text-xs text-admin-muted font-semibold mt-1">
            Author, schedule, and publish marketplace guides, safety advisories, and buying checklists
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={liveBlogHubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-admin-border bg-white text-xs font-bold text-admin-text hover:bg-slate-50 transition shadow-xs cursor-pointer"
            title="Open Live Blog Hub"
          >
            <ExternalLink className="h-3.5 w-3.5" /> View Live Blog Hub
          </a>

          <button
            onClick={() => {
              setEditingBlog(null);
              setEditorOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-admin-indigo text-white text-xs font-black hover:bg-admin-indigo/90 transition shadow-md"
          >
            <Plus className="h-4 w-4" /> Write New Article
          </button>
        </div>
      </div>

      {/* Metric Counters (5 Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-5 rounded-2xl border border-admin-border bg-white shadow-xs space-y-2">
          <span className="text-[10px] font-black uppercase text-admin-muted tracking-wider">Total Articles</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-admin-text">{stats.total}</span>
            <FileText className="h-5 w-5 text-admin-indigo/60" />
          </div>
          <span className="text-[11px] text-admin-muted font-semibold">Across all categories</span>
        </div>

        <div className="p-5 rounded-2xl border border-admin-border bg-white shadow-xs space-y-2">
          <span className="text-[10px] font-black uppercase text-admin-muted tracking-wider">Published Live</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-600">{stats.published}</span>
            <CheckCircle2 className="h-5 w-5 text-emerald-500/60" />
          </div>
          <span className="text-[11px] text-admin-muted font-semibold">Publicly accessible</span>
        </div>

        {/* Scheduled Metric */}
        <div className="p-5 rounded-2xl border border-purple-200 bg-purple-50/50 shadow-xs space-y-2">
          <span className="text-[10px] font-black uppercase text-purple-700 tracking-wider">Scheduled</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-purple-700">{stats.scheduled || 0}</span>
            <Calendar className="h-5 w-5 text-purple-600" />
          </div>
          <span className="text-[11px] text-purple-600 font-semibold">Future publishing queue</span>
        </div>

        <div className="p-5 rounded-2xl border border-admin-border bg-white shadow-xs space-y-2">
          <span className="text-[10px] font-black uppercase text-admin-muted tracking-wider">Drafts</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-amber-600">{stats.draft}</span>
            <Clock className="h-5 w-5 text-amber-500/60" />
          </div>
          <span className="text-[11px] text-admin-muted font-semibold">Unpublished drafts</span>
        </div>

        <div className="p-5 rounded-2xl border border-admin-border bg-white shadow-xs space-y-2 col-span-2 lg:col-span-1">
          <span className="text-[10px] font-black uppercase text-admin-muted tracking-wider">Lifetime Reads</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-admin-text">{stats.totalViews.toLocaleString("en-IN")}</span>
            <TrendingUp className="h-5 w-5 text-blue-500/60" />
          </div>
          <span className="text-[11px] text-admin-muted font-semibold">Reader views registered</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-4 rounded-2xl border border-admin-border bg-white shadow-xs">
        {/* Status Tabs */}
        <div className="flex gap-1 overflow-x-auto no-scrollbar w-full md:w-auto">
          {["ALL", "PUBLISHED", "SCHEDULED", "DRAFT", "ARCHIVED"].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition ${
                selectedStatus === st
                  ? st === "SCHEDULED"
                    ? "bg-purple-600 text-white shadow-xs"
                    : "bg-admin-indigo text-white shadow-xs"
                  : "text-admin-muted hover:bg-slate-100 hover:text-admin-text"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search & Category Filter */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-10 rounded-xl border border-admin-border bg-white px-3 text-xs font-bold text-admin-text outline-none focus:border-admin-indigo shadow-xs"
          >
            <option value="ALL">All Categories</option>
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <form onSubmit={handleSearchSubmit} className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-admin-muted" />
            <input
              type="text"
              placeholder="Search title, tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 rounded-xl border border-admin-border bg-white pl-9 pr-3 text-xs font-bold text-admin-text outline-none focus:border-admin-indigo shadow-xs"
            />
          </form>

          <button
            onClick={fetchBlogs}
            className="grid h-10 w-10 place-items-center rounded-xl border border-admin-border bg-white hover:bg-slate-100 text-admin-muted transition shadow-xs"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Articles Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs font-bold text-admin-muted">
          Loading articles from server...
        </div>
      ) : blogs.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-admin-border bg-white space-y-3 shadow-xs">
          <BookOpen className="h-8 w-8 text-admin-muted mx-auto" />
          <h3 className="text-sm font-black text-admin-text">No articles found</h3>
          <p className="text-xs text-admin-muted font-semibold max-w-sm mx-auto">
            There are no blog posts matching your selected filters. Start by composing or scheduling an article!
          </p>
          <button
            onClick={() => {
              setEditingBlog(null);
              setEditorOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-admin-indigo text-white text-xs font-black shadow-md"
          >
            <Plus className="h-4 w-4" /> Write New Article
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {blogs.map((b) => {
            const blogId = b.id || b._id || "";
            const isScheduled = b.status === "SCHEDULED";

            return (
              <div
                key={blogId}
                className="flex flex-col justify-between rounded-2xl border border-admin-border bg-white overflow-hidden shadow-xs hover:shadow-md transition-all group"
              >
                <div>
                  {/* Card Cover Banner */}
                  <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={b.coverImage || "https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?w=600"}
                      alt={b.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-black uppercase">
                        {b.category}
                      </span>
                      {b.isFeatured && (
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500 text-white text-[10px] font-black uppercase shadow-xs">
                          <Star className="h-3 w-3 fill-current" /> Featured
                        </span>
                      )}
                    </div>

                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase shadow-xs flex items-center gap-1 ${
                          b.status === "PUBLISHED"
                            ? "bg-emerald-600 text-white"
                            : b.status === "SCHEDULED"
                            ? "bg-purple-600 text-white"
                            : "bg-amber-600 text-white"
                        }`}
                      >
                        {isScheduled && <Clock className="h-2.5 w-2.5" />}
                        {b.status}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-2">
                    <h3 className="text-sm font-black text-admin-text leading-snug line-clamp-2">
                      {b.title}
                    </h3>
                    <p className="text-xs text-admin-muted line-clamp-2 font-medium leading-relaxed">
                      {b.excerpt}
                    </p>

                    {/* Scheduled Banner inside card */}
                    {isScheduled && b.scheduledAt && (
                      <div className="flex items-center gap-1.5 p-2 rounded-xl bg-purple-50 text-purple-800 text-[11px] font-bold border border-purple-200">
                        <Calendar className="h-3.5 w-3.5 text-purple-600 shrink-0" />
                        <span>
                          Goes live: {new Date(b.scheduledAt).toLocaleString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-2 text-[11px] font-bold text-admin-muted">
                      <span>✍️ {b.author?.name || "Editorial Team"}</span>
                      <span>•</span>
                      <span>⏱️ {b.readTime || "3 min read"}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="border-t border-admin-border px-5 py-3.5 bg-slate-50 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3 text-admin-muted font-bold text-[11px]">
                    <span>👁️ {b.viewsCount || 0}</span>
                    <span>❤️ {b.likesCount || 0}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {b.status === "PUBLISHED" && b.slug && (
                      <a
                        href={`${getFrontendBaseUrl()}/blog/${b.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="grid h-8 w-8 place-items-center rounded-lg border border-admin-border bg-white text-admin-muted hover:text-admin-indigo hover:bg-slate-100 transition"
                        title="View Live Article"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}

                    {/* Quick Schedule Button */}
                    <button
                      onClick={() => openQuickScheduleModal(b)}
                      className={`grid h-8 w-8 place-items-center rounded-lg border transition ${
                        isScheduled
                          ? "border-purple-300 bg-purple-100 text-purple-800 hover:bg-purple-200"
                          : "border-admin-border bg-white text-admin-muted hover:text-purple-600 hover:bg-purple-50"
                      }`}
                      title={isScheduled ? "Reschedule Release Date" : "Schedule Publication Date"}
                    >
                      <Calendar className="h-3.5 w-3.5" />
                    </button>

                    {/* Publish / Unpublish Toggle */}
                    <button
                      onClick={() => handleToggleStatus(blogId, b.status)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition border ${
                        b.status === "PUBLISHED"
                          ? "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
                          : "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                      }`}
                      title={b.status === "PUBLISHED" ? "Unpublish to Draft" : "Publish Live Now"}
                    >
                      {b.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                    </button>

                    {/* Edit Article */}
                    <button
                      onClick={() => {
                        setEditingBlog(b);
                        setEditorOpen(true);
                      }}
                      className="grid h-8 w-8 place-items-center rounded-lg border border-admin-border bg-white text-admin-muted hover:text-admin-text hover:bg-slate-100 transition"
                      title="Edit Article"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>

                    {/* Delete Article */}
                    <button
                      onClick={() => handleDeleteBlog(blogId, b.title)}
                      className="grid h-8 w-8 place-items-center rounded-lg border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 transition shadow-2xs"
                      title="Delete Article"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Schedule Date Modal */}
      {quickScheduleBlog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-admin-border bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-purple-100 text-purple-700">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-admin-text">Schedule Blog Release</h3>
                  <p className="text-[11px] text-admin-muted">Set automatic publication date & time</p>
                </div>
              </div>
              <button
                onClick={() => setQuickScheduleBlog(null)}
                className="grid h-8 w-8 place-items-center rounded-lg text-admin-muted hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-admin-text line-clamp-2">
              "{quickScheduleBlog.title}"
            </div>

            <form onSubmit={handleQuickScheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Publishing Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={quickScheduledDate}
                  onChange={(e) => setQuickScheduledDate(e.target.value)}
                  className="w-full h-11 rounded-xl border border-purple-300 bg-white px-3.5 text-xs font-bold text-admin-text outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 shadow-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setQuickScheduleBlog(null)}
                  disabled={isScheduling}
                  className="px-4 py-2 rounded-xl border border-admin-border text-xs font-bold text-admin-text hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isScheduling}
                  className="px-5 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-500 shadow-md flex items-center gap-1.5"
                >
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{isScheduling ? "Scheduling..." : "Confirm Schedule"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Editor Modal */}
      <BlogEditorModal
        isOpen={editorOpen}
        blog={editingBlog}
        onClose={() => {
          setEditorOpen(false);
          setEditingBlog(null);
        }}
        onSave={handleSaveBlog}
      />
    </div>
  );
};
export default BlogsPage;
