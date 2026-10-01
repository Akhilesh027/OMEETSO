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
  X,
  ShieldAlert,
  Ban,
  Filter,
  CheckCheck,
  CheckSquare,
  Square,
  AlertTriangle,
  Sparkles
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
    blocked: 0,
    totalViews: 0
  });

  // Date Filtering state
  const [startDateFilter, setStartDateFilter] = useState<string>("");
  const [endDateFilter, setEndDateFilter] = useState<string>("");

  // Multi-selection state
  const [selectedBlogIds, setSelectedBlogIds] = useState<string[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  // Date-wise Block Modal state
  const [isDateBlockModalOpen, setIsDateBlockModalOpen] = useState(false);
  const [dateBlockStart, setDateBlockStart] = useState<string>("");
  const [dateBlockEnd, setDateBlockEnd] = useState<string>("");
  const [dateBlockCategory, setDateBlockCategory] = useState<string>("ALL");
  const [dateBlockStatus, setDateBlockStatus] = useState<string>("ALL");
  const [dateBlockReason, setDateBlockReason] = useState<string>("Suspended via date-wise content moderation");
  const [isSubmittingDateBlock, setIsSubmittingDateBlock] = useState(false);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Quick Schedule Modal state
  const [quickScheduleBlog, setQuickScheduleBlog] = useState<BlogItem | null>(null);
  const [quickScheduledDate, setQuickScheduledDate] = useState<string>("");
  const [isScheduling, setIsScheduling] = useState(false);
  const [isSyncingCloudinary, setIsSyncingCloudinary] = useState(false);

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
      if (startDateFilter) params.append("startDate", startDateFilter);
      if (endDateFilter) params.append("endDate", endDateFilter);

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
  }, [selectedStatus, selectedCategory, startDateFilter, endDateFilter]);

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

  const handleToggleBlock = async (blog: BlogItem) => {
    const blogId = blog.id || blog._id;
    if (!blogId) return;
    const isCurrentlyBlocked = blog.status === "BLOCKED" || blog.isBlocked;
    const nextStatus = isCurrentlyBlocked ? "DRAFT" : "BLOCKED";
    const reason = !isCurrentlyBlocked
      ? window.prompt("Enter reason for blocking this article:", "Suspended by platform administrator")
      : undefined;

    if (!isCurrentlyBlocked && reason === null) return; // cancelled

    try {
      const token = typeof localStorage !== "undefined" ? localStorage.getItem("omeetso_admin_token") : null;
      const res = await fetch(`${API_BASE}/admin/blogs/${blogId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ status: nextStatus, reason })
      });
      if (res.ok) {
        showToast(isCurrentlyBlocked ? "Article unblocked (moved to Drafts)" : "Article blocked successfully");
        fetchBlogs();
      }
    } catch (err) {
      showToast("Failed to update article block status");
    }
  };

  const toggleSelectAll = () => {
    if (selectedBlogIds.length === blogs.length && blogs.length > 0) {
      setSelectedBlogIds([]);
    } else {
      setSelectedBlogIds(blogs.map((b) => (b.id || b._id || "")).filter(Boolean));
    }
  };

  const toggleSelectBlog = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedBlogIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkBlock = async (action: "BLOCK" | "UNBLOCK" = "BLOCK") => {
    if (selectedBlogIds.length === 0) return;
    const count = selectedBlogIds.length;
    const isUnblocking = action === "UNBLOCK";
    const reason = window.prompt(
      `Enter reason for ${isUnblocking ? "unblocking" : "blocking"} ${count} selected article${count > 1 ? "s" : ""}:`,
      isUnblocking ? "Restored by administrator" : "Content policy violation / date-wise suspension"
    );
    if (reason === null) return;

    setIsBulkProcessing(true);
    try {
      const token = typeof localStorage !== "undefined" ? localStorage.getItem("omeetso_admin_token") : null;
      const res = await fetch(`${API_BASE}/admin/blogs/bulk-block`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          blogIds: selectedBlogIds,
          reason,
          action
        })
      });

      const json = await res.json();
      if (json.success) {
        showToast(json.message || `Articles ${isUnblocking ? "unblocked" : "blocked"} successfully!`);
        setSelectedBlogIds([]);
        fetchBlogs();
      } else {
        showToast(json.error?.message || "Bulk operation failed.");
      }
    } catch (err: any) {
      showToast(err.message || "Bulk operation failed.");
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleExecuteDateWiseBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateBlockStart) {
      alert("Please select a start date.");
      return;
    }

    setIsSubmittingDateBlock(true);
    try {
      const token = typeof localStorage !== "undefined" ? localStorage.getItem("omeetso_admin_token") : null;
      const res = await fetch(`${API_BASE}/admin/blogs/date-wise-block`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          startDate: dateBlockStart,
          endDate: dateBlockEnd || dateBlockStart,
          reason: dateBlockReason,
          category: dateBlockCategory !== "ALL" ? dateBlockCategory : undefined,
          status: dateBlockStatus !== "ALL" ? dateBlockStatus : undefined
        })
      });

      const json = await res.json();
      if (json.success) {
        showToast(json.message || "Date-wise block executed successfully!");
        setIsDateBlockModalOpen(false);
        fetchBlogs();
      } else {
        showToast(json.error?.message || "Date-wise block failed.");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to execute date-wise block.");
    } finally {
      setIsSubmittingDateBlock(false);
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

  const handleSyncCloudinary = async () => {
    setIsSyncingCloudinary(true);
    try {
      const token = typeof localStorage !== "undefined" ? localStorage.getItem("omeetso_admin_token") : null;
      const res = await fetch(`${API_BASE}/admin/blogs/sync-cloudinary`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      const json = await res.json();
      if (json.success) {
        showToast(json.message || `Successfully synced blog images to Cloudinary!`);
        fetchBlogs();
      } else {
        showToast(json.error?.message || "Cloudinary sync failed");
      }
    } catch (err: any) {
      showToast(err.message || "Cloudinary sync failed");
    } finally {
      setIsSyncingCloudinary(false);
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
          <button
            onClick={handleSyncCloudinary}
            disabled={isSyncingCloudinary}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-sky-200 bg-sky-50 text-xs font-bold text-sky-700 hover:bg-sky-100 transition shadow-xs cursor-pointer disabled:opacity-50"
            title="Convert and upload all blog images to Cloudinary"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSyncingCloudinary ? "animate-spin" : ""}`} />
            <span>{isSyncingCloudinary ? "Syncing Cloudinary..." : "Sync Cloudinary Images"}</span>
          </button>

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
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-admin-indigo text-white text-xs font-black hover:bg-admin-indigo/90 transition shadow-md cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Write New Article
          </button>
        </div>
      </div>

      {/* Metric Counters (6 Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl border border-admin-border bg-white shadow-xs space-y-1.5">
          <span className="text-[10px] font-black uppercase text-admin-muted tracking-wider">Total Articles</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-admin-text">{stats.total}</span>
            <FileText className="h-4 w-4 text-admin-indigo/60" />
          </div>
          <span className="text-[10px] text-admin-muted font-semibold block truncate">All categories</span>
        </div>

        <div className="p-4 rounded-2xl border border-admin-border bg-white shadow-xs space-y-1.5">
          <span className="text-[10px] font-black uppercase text-admin-muted tracking-wider">Published</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-emerald-600">{stats.published}</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500/60" />
          </div>
          <span className="text-[10px] text-admin-muted font-semibold block truncate">Live on website</span>
        </div>

        <div className="p-4 rounded-2xl border border-purple-200 bg-purple-50/50 shadow-xs space-y-1.5">
          <span className="text-[10px] font-black uppercase text-purple-700 tracking-wider">Scheduled</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-purple-700">{stats.scheduled || 0}</span>
            <Calendar className="h-4 w-4 text-purple-600" />
          </div>
          <span className="text-[10px] text-purple-600 font-semibold block truncate">Future release</span>
        </div>

        <div className="p-4 rounded-2xl border border-admin-border bg-white shadow-xs space-y-1.5">
          <span className="text-[10px] font-black uppercase text-admin-muted tracking-wider">Drafts</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-amber-600">{stats.draft}</span>
            <Clock className="h-4 w-4 text-amber-500/60" />
          </div>
          <span className="text-[10px] text-admin-muted font-semibold block truncate">Unpublished</span>
        </div>

        <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50/60 shadow-xs space-y-1.5">
          <span className="text-[10px] font-black uppercase text-rose-700 tracking-wider">Blocked</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-rose-600">{stats.blocked || 0}</span>
            <ShieldAlert className="h-4 w-4 text-rose-600" />
          </div>
          <span className="text-[10px] text-rose-600 font-semibold block truncate">Moderated & hidden</span>
        </div>

        <div className="p-4 rounded-2xl border border-admin-border bg-white shadow-xs space-y-1.5">
          <span className="text-[10px] font-black uppercase text-admin-muted tracking-wider">Reads</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-admin-text">{stats.totalViews.toLocaleString("en-IN")}</span>
            <TrendingUp className="h-4 w-4 text-blue-500/60" />
          </div>
          <span className="text-[10px] text-admin-muted font-semibold block truncate">Total views</span>
        </div>
      </div>

      {/* Filter, Search & Date-Wise Toolbar */}
      <div className="p-4 rounded-2xl border border-admin-border bg-white shadow-xs space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {["ALL", "PUBLISHED", "SCHEDULED", "DRAFT", "BLOCKED", "ARCHIVED"].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                  selectedStatus === st
                    ? st === "BLOCKED"
                      ? "bg-rose-600 text-white shadow-xs"
                      : st === "SCHEDULED"
                      ? "bg-purple-600 text-white shadow-xs"
                      : "bg-admin-indigo text-white shadow-xs"
                    : "text-admin-muted hover:bg-slate-100 hover:text-admin-text"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Quick Date-Wise Block Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setDateBlockStart(startDateFilter || new Date().toISOString().slice(0, 10));
                setDateBlockEnd(endDateFilter || new Date().toISOString().slice(0, 10));
                setIsDateBlockModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-bold transition shadow-xs cursor-pointer"
              title="Block articles in specific date ranges"
            >
              <ShieldAlert className="h-4 w-4 text-rose-600" />
              <span>Date-Wise Block</span>
            </button>

            <button
              type="button"
              onClick={toggleSelectAll}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-admin-border bg-slate-50 text-slate-700 hover:bg-slate-100 text-xs font-bold transition cursor-pointer"
            >
              {selectedBlogIds.length === blogs.length && blogs.length > 0 ? (
                <>
                  <CheckSquare className="h-4 w-4 text-admin-indigo" />
                  <span>Deselect All</span>
                </>
              ) : (
                <>
                  <Square className="h-4 w-4 text-slate-400" />
                  <span>Select All ({blogs.length})</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Date Filter & Search Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Date Range Picker */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl border border-admin-border bg-slate-50 text-xs">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-[11px] font-bold text-slate-500">From:</span>
              <input
                type="date"
                value={startDateFilter}
                onChange={(e) => setStartDateFilter(e.target.value)}
                className="bg-transparent font-bold text-slate-800 outline-none text-xs"
              />
            </div>

            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl border border-admin-border bg-slate-50 text-xs">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-[11px] font-bold text-slate-500">To:</span>
              <input
                type="date"
                value={endDateFilter}
                onChange={(e) => setEndDateFilter(e.target.value)}
                className="bg-transparent font-bold text-slate-800 outline-none text-xs"
              />
            </div>

            {/* Quick date pills */}
            <div className="flex items-center gap-1 text-[11px]">
              <button
                type="button"
                onClick={() => {
                  const today = new Date().toISOString().slice(0, 10);
                  setStartDateFilter(today);
                  setEndDateFilter(today);
                }}
                className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold transition cursor-pointer"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => {
                  const end = new Date();
                  const start = new Date();
                  start.setDate(start.getDate() - 7);
                  setStartDateFilter(start.toISOString().slice(0, 10));
                  setEndDateFilter(end.toISOString().slice(0, 10));
                }}
                className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold transition cursor-pointer"
              >
                Last 7d
              </button>
              <button
                type="button"
                onClick={() => {
                  const end = new Date();
                  const start = new Date();
                  start.setDate(start.getDate() - 30);
                  setStartDateFilter(start.toISOString().slice(0, 10));
                  setEndDateFilter(end.toISOString().slice(0, 10));
                }}
                className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold transition cursor-pointer"
              >
                Last 30d
              </button>
              {(startDateFilter || endDateFilter) && (
                <button
                  type="button"
                  onClick={() => {
                    setStartDateFilter("");
                    setEndDateFilter("");
                  }}
                  className="px-2 py-1 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold transition cursor-pointer flex items-center gap-1"
                >
                  <X className="h-3 w-3" /> Clear
                </button>
              )}
            </div>
          </div>

          {/* Category & Search inputs */}
          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-9 rounded-xl border border-admin-border bg-white px-2.5 text-xs font-bold text-admin-text outline-none focus:border-admin-indigo shadow-xs"
            >
              <option value="ALL">All Categories</option>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <form onSubmit={handleSearchSubmit} className="relative w-48 sm:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-admin-muted" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 rounded-xl border border-admin-border bg-white pl-8 pr-3 text-xs font-bold text-admin-text outline-none focus:border-admin-indigo shadow-xs"
              />
            </form>

            <button
              onClick={fetchBlogs}
              className="grid h-9 w-9 place-items-center rounded-xl border border-admin-border bg-white hover:bg-slate-100 text-admin-muted transition shadow-xs"
              title="Refresh"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* BULK ACTION BAR (when items are checked) */}
        {selectedBlogIds.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-gradient-to-r from-rose-50 via-amber-50 to-indigo-50 border border-rose-200/80 rounded-xl shadow-xs animate-in fade-in-50">
            <div className="flex items-center gap-2.5">
              <span className="grid h-6 w-6 place-items-center rounded-lg bg-rose-600 text-white text-xs font-black">
                {selectedBlogIds.length}
              </span>
              <div>
                <p className="text-xs font-black text-slate-900">
                  {selectedBlogIds.length} article{selectedBlogIds.length > 1 ? "s" : ""} selected
                </p>
                <p className="text-[11px] text-slate-500">Apply action across selected articles</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedBlogIds([])}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white/80 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleBulkBlock("UNBLOCK")}
                disabled={isBulkProcessing}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-xs cursor-pointer"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                <span>Unblock Selected</span>
              </button>
              <button
                type="button"
                onClick={() => handleBulkBlock("BLOCK")}
                disabled={isBulkProcessing}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-xl shadow-xs cursor-pointer"
              >
                <Ban className="h-3.5 w-3.5" />
                <span>Block Selected ({selectedBlogIds.length})</span>
              </button>
            </div>
          </div>
        )}
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
            const isBlocked = b.status === "BLOCKED" || Boolean(b.isBlocked);
            const isSelected = selectedBlogIds.includes(blogId);

            return (
              <div
                key={blogId}
                className={`flex flex-col justify-between rounded-2xl border overflow-hidden shadow-xs hover:shadow-md transition-all group ${
                  isBlocked
                    ? "border-rose-300 ring-2 ring-rose-200/60 bg-rose-50/10"
                    : isSelected
                    ? "border-indigo-400 ring-2 ring-indigo-200/60 bg-white"
                    : "border-admin-border bg-white"
                }`}
              >
                <div>
                  {/* Card Cover Banner */}
                  <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={b.coverImage || "https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?w=600"}
                      alt={b.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Top-left: Selection Checkbox & Category */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
                      <button
                        type="button"
                        onClick={(e) => toggleSelectBlog(blogId, e)}
                        className={`grid h-6 w-6 place-items-center rounded-lg border transition shadow-xs cursor-pointer ${
                          isSelected
                            ? "bg-admin-indigo border-admin-indigo text-white"
                            : "bg-white/90 border-slate-300 text-transparent hover:text-slate-400 hover:bg-white"
                        }`}
                        title={isSelected ? "Deselect article" : "Select article"}
                      >
                        <CheckCheck className="h-3.5 w-3.5" />
                      </button>

                      <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-black uppercase">
                        {b.category}
                      </span>

                      {b.isFeatured && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black uppercase shadow-xs">
                          <Star className="h-2.5 w-2.5 fill-current" /> Featured
                        </span>
                      )}
                    </div>

                    {/* Top-right: Status Badge */}
                    <div className="absolute top-3 right-3 z-10">
                      {isBlocked ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase shadow-xs flex items-center gap-1 bg-rose-600 text-white">
                          <Ban className="h-2.5 w-2.5" /> BLOCKED
                        </span>
                      ) : (
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
                      )}
                    </div>

                    {/* Bottom-left: Cloudinary Badge */}
                    {b.coverImage && (b.coverImage.includes("res.cloudinary.com") || b.coverImage.includes("cloudinary.com")) && (
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-sky-600/90 text-white text-[9px] font-black backdrop-blur-xs flex items-center gap-1 shadow-xs z-10">
                        <Sparkles className="h-2.5 w-2.5" />
                        <span>Cloudinary</span>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-2">
                    <h3 className="text-sm font-black text-admin-text leading-snug line-clamp-2">
                      {b.title}
                    </h3>
                    <p className="text-xs text-admin-muted line-clamp-2 font-medium leading-relaxed">
                      {b.excerpt}
                    </p>

                    {/* Blocked Reason Callout */}
                    {isBlocked && (
                      <div className="flex items-center gap-1.5 p-2 rounded-xl bg-rose-50 text-rose-800 text-[11px] font-bold border border-rose-200">
                        <ShieldAlert className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                        <span className="truncate">Blocked: {b.blockReason || "Hidden by administrator"}</span>
                      </div>
                    )}

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
                        className="grid h-8 w-8 place-items-center rounded-lg border border-admin-border bg-white text-admin-muted hover:text-admin-indigo hover:bg-slate-100 transition cursor-pointer"
                        title="View Live Article"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}

                    {/* Date / Quick Schedule Button */}
                    <button
                      onClick={() => openQuickScheduleModal(b)}
                      className={`grid h-8 w-8 place-items-center rounded-lg border transition cursor-pointer ${
                        isScheduled
                          ? "border-purple-300 bg-purple-100 text-purple-800 hover:bg-purple-200"
                          : "border-admin-border bg-white text-admin-muted hover:text-purple-600 hover:bg-purple-50"
                      }`}
                      title={isScheduled ? "Reschedule Release Date" : "Schedule Publication Date"}
                    >
                      <Calendar className="h-3.5 w-3.5" />
                    </button>

                    {/* Block / Unblock Toggle Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleBlock(b)}
                      className={`grid h-8 w-8 place-items-center rounded-lg border transition cursor-pointer ${
                        isBlocked
                          ? "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          : "border-rose-200 bg-white text-rose-600 hover:bg-rose-50"
                      }`}
                      title={isBlocked ? "Unblock this article (move to Draft)" : "Block this article immediately"}
                    >
                      {isBlocked ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
                    </button>

                    {/* Publish / Unpublish Toggle */}
                    <button
                      onClick={() => handleToggleStatus(blogId, b.status)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition border cursor-pointer ${
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
                      className="grid h-8 w-8 place-items-center rounded-lg border border-admin-border bg-white text-admin-muted hover:text-admin-text hover:bg-slate-100 transition cursor-pointer"
                      title="Edit Article"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>

                    {/* Delete Article */}
                    <button
                      onClick={() => handleDeleteBlog(blogId, b.title)}
                      className="grid h-8 w-8 place-items-center rounded-lg border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 transition shadow-2xs cursor-pointer"
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

      {/* Date-Wise Blog Blocking Modal */}
      {isDateBlockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-admin-border bg-white p-6 shadow-2xl space-y-4 animate-in fade-in-50">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-rose-50 text-rose-600">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Date-Wise Blog Blocking</h3>
                  <p className="text-[11px] text-slate-500">Suspend/block articles published in a date window</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDateBlockModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleExecuteDateWiseBlock} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">From Date *</label>
                  <input
                    type="date"
                    required
                    value={dateBlockStart}
                    onChange={(e) => setDateBlockStart(e.target.value)}
                    className="w-full h-10 rounded-xl border border-admin-border bg-slate-50 px-3 text-xs font-bold text-slate-900 outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">To Date *</label>
                  <input
                    type="date"
                    required
                    value={dateBlockEnd}
                    onChange={(e) => setDateBlockEnd(e.target.value)}
                    className="w-full h-10 rounded-xl border border-admin-border bg-slate-50 px-3 text-xs font-bold text-slate-900 outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Target Category (Optional)</label>
                <select
                  value={dateBlockCategory}
                  onChange={(e) => setDateBlockCategory(e.target.value)}
                  className="w-full h-10 rounded-xl border border-admin-border bg-slate-50 px-3 text-xs font-bold text-slate-900 outline-none focus:border-rose-500"
                >
                  <option value="ALL">All Categories</option>
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Target Status</label>
                <select
                  value={dateBlockStatus}
                  onChange={(e) => setDateBlockStatus(e.target.value)}
                  className="w-full h-10 rounded-xl border border-admin-border bg-slate-50 px-3 text-xs font-bold text-slate-900 outline-none focus:border-rose-500"
                >
                  <option value="ALL">All Active Statuses (Published, Draft, Scheduled)</option>
                  <option value="PUBLISHED">Only Live Published Articles</option>
                  <option value="SCHEDULED">Only Scheduled Articles</option>
                  <option value="DRAFT">Only Drafts</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Reason for Blocking</label>
                <textarea
                  rows={2}
                  required
                  value={dateBlockReason}
                  onChange={(e) => setDateBlockReason(e.target.value)}
                  placeholder="e.g. Content policy violation, spam wave, editorial review..."
                  className="w-full rounded-xl border border-admin-border bg-slate-50 p-2.5 text-xs font-medium text-slate-900 outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDateBlockModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-admin-border text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingDateBlock}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
                >
                  <Ban className="h-3.5 w-3.5" />
                  <span>{isSubmittingDateBlock ? "Blocking..." : "Confirm Date-Wise Block"}</span>
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
