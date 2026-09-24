import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Save,
  Send,
  Eye,
  Edit3,
  BookOpen,
  AlertCircle,
  Upload,
  Trash2,
  Calendar,
  Clock,
  CheckCircle2,
  Sparkles,
  Image as ImageIcon
} from "lucide-react";
import { uploadCategoryImageApi } from "@/api/adminCategories.api";

export interface BlogItem {
  id?: string;
  _id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  category: string;
  tags: string[];
  author: {
    name: string;
    avatar?: string;
    role?: string;
    bio?: string;
  };
  readTime?: string;
  status: "DRAFT" | "PUBLISHED" | "SCHEDULED" | "ARCHIVED";
  isFeatured: boolean;
  viewsCount?: number;
  likesCount?: number;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
  scheduledAt?: string;
  publishedAt?: string;
  createdAt?: string;
}

interface BlogEditorModalProps {
  isOpen: boolean;
  blog: BlogItem | null;
  onClose: () => void;
  onSave: (payload: Partial<BlogItem>) => Promise<void>;
}

export const CATEGORY_OPTIONS = [
  "Buying Guides",
  "Selling Tips",
  "Safety & Scams",
  "Market Insights",
  "Tech Updates",
  "Community Stories",
  "General"
];

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getDefaultScheduledDate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);
  return tomorrow.toISOString().slice(0, 16);
}

export const BlogEditorModal: React.FC<BlogEditorModalProps> = ({
  isOpen,
  blog,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<Partial<BlogItem>>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    coverImage: "",
    category: "Buying Guides",
    tags: [],
    author: {
      name: "Omeetso Editorial Team",
      role: "Marketplace Specialist",
      bio: "Insights and guidance for safe, fast local buying and selling."
    },
    status: "DRAFT",
    isFeatured: false,
    scheduledAt: getDefaultScheduledDate(),
    seo: {
      metaTitle: "",
      metaDescription: "",
      keywords: []
    }
  });

  const [tagsInput, setTagsInput] = useState("");
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [showSchedulePicker, setShowSchedulePicker] = useState(false);
  const [scheduledDateTime, setScheduledDateTime] = useState<string>(getDefaultScheduledDate());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingImage(true);
    setErrorMsg("");
    try {
      const res = await uploadCategoryImageApi(file);
      if (res.success && res.url) {
        setFormData((prev) => ({ ...prev, coverImage: res.url }));
      } else {
        setErrorMsg(res.error || "Failed to upload image");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to upload image");
    } finally {
      setIsUploadingImage(false);
    }
  };

  useEffect(() => {
    if (blog) {
      let initScheduled = getDefaultScheduledDate();
      if (blog.scheduledAt) {
        try {
          initScheduled = new Date(blog.scheduledAt).toISOString().slice(0, 16);
        } catch {}
      }

      setFormData({
        ...blog,
        author: {
          name: blog.author?.name || "Omeetso Editorial Team",
          role: blog.author?.role || "Marketplace Specialist",
          bio: blog.author?.bio || ""
        },
        scheduledAt: initScheduled,
        seo: {
          metaTitle: blog.seo?.metaTitle || blog.title || "",
          metaDescription: blog.seo?.metaDescription || blog.excerpt || "",
          keywords: blog.seo?.keywords || blog.tags || []
        }
      });
      setScheduledDateTime(initScheduled);
      setShowSchedulePicker(blog.status === "SCHEDULED");
      setTagsInput(Array.isArray(blog.tags) ? blog.tags.join(", ") : "");
    } else {
      const defaultDate = getDefaultScheduledDate();
      setFormData({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        coverImage: "https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?w=1200",
        category: "Buying Guides",
        tags: ["hyderabad", "marketplace"],
        author: {
          name: "Omeetso Editorial Team",
          role: "Marketplace Specialist",
          bio: "Insights and guidance for safe, fast local buying and selling."
        },
        status: "DRAFT",
        isFeatured: false,
        scheduledAt: defaultDate,
        seo: {
          metaTitle: "",
          metaDescription: "",
          keywords: []
        }
      });
      setScheduledDateTime(defaultDate);
      setShowSchedulePicker(false);
      setTagsInput("hyderabad, marketplace");
    }
    setErrorMsg("");
  }, [blog, isOpen]);

  if (!isOpen) return null;

  const handleTitleChange = (val: string) => {
    setFormData((prev) => {
      const autoSlug = !blog ? slugify(val) : prev.slug;
      return {
        ...prev,
        title: val,
        slug: autoSlug,
        seo: {
          ...prev.seo,
          metaTitle: prev.seo?.metaTitle || val
        }
      };
    });
  };

  const handleTagsChange = (val: string) => {
    setTagsInput(val);
    const parsed = val
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    setFormData((prev) => ({
      ...prev,
      tags: parsed,
      seo: {
        ...prev.seo,
        keywords: parsed
      }
    }));
  };

  const applyPreset = (daysAhead: number, hour: number = 9) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    d.setHours(hour, 0, 0, 0);
    const val = d.toISOString().slice(0, 16);
    setScheduledDateTime(val);
    setFormData((prev) => ({ ...prev, scheduledAt: val }));
  };

  const handleSubmit = async (targetStatus?: "DRAFT" | "PUBLISHED" | "SCHEDULED") => {
    if (!formData.title?.trim()) {
      setErrorMsg("Please enter an article title");
      return;
    }
    if (!formData.content?.trim()) {
      setErrorMsg("Article content cannot be empty");
      return;
    }
    if (!formData.excerpt?.trim()) {
      setErrorMsg("Please provide a short summary/excerpt");
      return;
    }

    const finalStatus = targetStatus || formData.status || "DRAFT";

    if (finalStatus === "SCHEDULED") {
      if (!scheduledDateTime) {
        setErrorMsg("Please select a date and time to schedule publication");
        return;
      }
      const selected = new Date(scheduledDateTime);
      if (selected <= new Date()) {
        setErrorMsg("Scheduled time must be in the future");
        return;
      }
    }

    setIsSubmitting(true);
    setErrorMsg("");
    try {
      const payload: Partial<BlogItem> = {
        ...formData,
        status: finalStatus,
        scheduledAt: finalStatus === "SCHEDULED" ? new Date(scheduledDateTime).toISOString() : undefined,
        tags: tagsInput.split(",").map((t) => t.trim()).filter(Boolean)
      };
      await onSave(payload);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save article");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
      <div className="flex h-[92vh] w-full max-w-4xl flex-col rounded-3xl border border-admin-border bg-white shadow-2xl overflow-hidden font-sans">

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-admin-border px-6 py-4 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-admin-indigo/10 text-admin-indigo">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-admin-text">
                {blog ? "Edit Article" : "Compose New Article"}
              </h2>
              <p className="text-xs text-admin-muted font-medium">
                Publish marketplace guides, buying checklists, and schedule releases
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex items-center rounded-xl border border-admin-border bg-white p-1 shadow-xs">
              <button
                type="button"
                onClick={() => setActiveTab("edit")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                  activeTab === "edit"
                    ? "bg-admin-indigo text-white shadow-xs"
                    : "text-admin-muted hover:text-admin-text"
                }`}
              >
                <Edit3 className="h-3.5 w-3.5" /> Editor
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                  activeTab === "preview"
                    ? "bg-admin-indigo text-white shadow-xs"
                    : "text-admin-muted hover:text-admin-text"
                }`}
              >
                <Eye className="h-3.5 w-3.5" /> Preview
              </button>
            </div>

            <button
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-xl text-admin-muted hover:bg-slate-200 hover:text-admin-text transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#F8FAFC]">
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-bold text-rose-700 shadow-xs">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {activeTab === "edit" ? (
            <div className="space-y-4 bg-white p-6 rounded-2xl border border-admin-border shadow-xs">
              
              {/* Row 1: Title & Category */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Article Title *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. How to Safely Buy Pre-Owned Cars in Hyderabad"
                    value={formData.title || ""}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full h-11 rounded-xl border border-admin-border bg-white px-3.5 text-xs font-bold text-admin-text outline-none focus:border-admin-indigo focus:ring-2 focus:ring-admin-indigo/15 transition shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Category *
                  </label>
                  <select
                    value={formData.category || "Buying Guides"}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full h-11 rounded-xl border border-admin-border bg-white px-3 text-xs font-bold text-admin-text outline-none focus:border-admin-indigo focus:ring-2 focus:ring-admin-indigo/15 transition shadow-xs"
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Slug */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  URL Slug (Kebab-Case)
                </label>
                <div className="flex items-center rounded-xl border border-admin-border bg-slate-50 px-3 h-11 text-xs shadow-xs">
                  <span className="text-admin-muted font-bold">/blog/</span>
                  <input
                    type="text"
                    value={formData.slug || ""}
                    onChange={(e) => setFormData({ ...formData, slug: slugify(e.target.value) })}
                    className="w-full bg-transparent font-bold text-admin-text outline-none pl-1"
                  />
                </div>
              </div>

              {/* Cover Banner Image Upload Section */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Cover Banner Image *
                </label>
                <div className="rounded-2xl border border-admin-border bg-slate-50/80 p-4 space-y-3 shadow-xs">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingImage}
                      className="h-11 px-4 rounded-xl bg-white border border-dashed border-admin-indigo hover:border-admin-indigo/80 text-admin-indigo hover:bg-indigo-50/40 flex items-center justify-center gap-2 text-xs font-bold transition shadow-xs cursor-pointer shrink-0"
                    >
                      <Upload className="h-4 w-4 text-admin-indigo" />
                      <span>{isUploadingImage ? "Uploading..." : "Upload Image File"}</span>
                    </button>

                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Or paste external image URL (https://...)"
                        value={formData.coverImage || ""}
                        onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                        className="w-full h-11 rounded-xl border border-admin-border bg-white px-3.5 text-xs font-medium text-admin-text outline-none focus:border-admin-indigo focus:ring-2 focus:ring-admin-indigo/15 transition shadow-xs"
                      />
                    </div>

                    {formData.coverImage && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, coverImage: "" })}
                        className="h-11 px-3.5 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 text-xs font-bold flex items-center gap-1.5 transition shrink-0 cursor-pointer shadow-xs"
                        title="Remove Cover Image"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Clear</span>
                      </button>
                    )}
                  </div>

                  {formData.coverImage ? (
                    <div className="relative h-44 w-full rounded-xl overflow-hidden border border-admin-border bg-white shadow-xs">
                      <img
                        src={formData.coverImage}
                        alt="Cover Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-black uppercase tracking-wider text-white">
                        Cover Banner Preview
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-2.5 right-2.5 px-3 py-1.5 rounded-lg bg-white/95 hover:bg-white text-admin-indigo text-xs font-bold shadow-md transition cursor-pointer"
                      >
                        Change Image
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border border-dashed border-slate-300 rounded-xl p-5 text-center bg-white/60 hover:bg-white transition cursor-pointer"
                    >
                      <ImageIcon className="h-6 w-6 text-slate-400 mx-auto mb-1" />
                      <p className="text-xs font-bold text-slate-600">No banner selected</p>
                      <p className="text-[11px] text-slate-400">Click to upload JPG, PNG, or WEBP cover image</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Excerpt / Search Snippet * (1-2 sentences)
                </label>
                <textarea
                  rows={2}
                  placeholder="A short, catchy summary that appears on cards and search engines..."
                  value={formData.excerpt || ""}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full rounded-xl border border-admin-border bg-white p-3.5 text-xs font-semibold text-admin-text outline-none focus:border-admin-indigo focus:ring-2 focus:ring-admin-indigo/15 transition shadow-xs"
                />
              </div>

              {/* Rich Content Editor */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Article Content * (Supports Markdown: ### Headings, - Lists, **Bold**)
                  </label>
                  <span className="text-[11px] text-admin-muted font-bold">
                    Estimated: {Math.max(1, Math.ceil((formData.content?.trim().split(/\s+/).length || 0) / 200))} min read
                  </span>
                </div>
                <textarea
                  rows={13}
                  placeholder="Write your article in detail here...&#10;&#10;### 1. Section Title&#10;Detailed explanations, advice, and tips for buyers and sellers...&#10;&#10;### 2. Best Practices&#10;- Tip one&#10;- Tip two"
                  value={formData.content || ""}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full rounded-xl border border-admin-border bg-white p-4 text-xs font-mono font-medium text-admin-text outline-none focus:border-admin-indigo focus:ring-2 focus:ring-admin-indigo/15 transition shadow-xs leading-relaxed"
                />
              </div>

              {/* Tags & Author */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Tags (Comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. hyderabad, used-cars, rto-verification"
                    value={tagsInput}
                    onChange={(e) => handleTagsChange(e.target.value)}
                    className="w-full h-11 rounded-xl border border-admin-border bg-white px-3.5 text-xs font-bold text-admin-text outline-none focus:border-admin-indigo focus:ring-2 focus:ring-admin-indigo/15 transition shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Author Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Omeetso Editorial Team"
                    value={formData.author?.name || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        author: { ...(formData.author as any), name: e.target.value }
                      })
                    }
                    className="w-full h-11 rounded-xl border border-admin-border bg-white px-3.5 text-xs font-bold text-admin-text outline-none focus:border-admin-indigo focus:ring-2 focus:ring-admin-indigo/15 transition shadow-xs"
                  />
                </div>
              </div>

              {/* Featured Flag */}
              <div className="flex items-center gap-3 p-3.5 rounded-xl border border-admin-border bg-slate-50">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={Boolean(formData.isFeatured)}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="h-4 w-4 rounded accent-admin-indigo cursor-pointer"
                />
                <label htmlFor="isFeatured" className="text-xs font-bold text-admin-text cursor-pointer">
                  Feature this article prominently in Spotlight / Hero banner
                </label>
              </div>

              {/* Inline Schedule Date Picker Card if schedule picker is open */}
              {showSchedulePicker && (
                <div className="p-5 rounded-2xl border border-purple-200 bg-purple-50/70 space-y-3.5 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600 text-white shadow-xs">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-purple-950">Publishing Schedule</h4>
                        <p className="text-[11px] text-purple-700">Choose when this guide will automatically go live</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowSchedulePicker(false)}
                      className="text-xs font-bold text-purple-600 hover:text-purple-900"
                    >
                      Hide
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                    <div>
                      <label className="block text-[11px] font-bold text-purple-900 mb-1">
                        Release Date & Time *
                      </label>
                      <input
                        type="datetime-local"
                        value={scheduledDateTime}
                        onChange={(e) => {
                          setScheduledDateTime(e.target.value);
                          setFormData((prev) => ({ ...prev, scheduledAt: e.target.value }));
                        }}
                        className="w-full h-10 rounded-xl border border-purple-300 bg-white px-3 text-xs font-bold text-purple-950 outline-none focus:border-purple-600 shadow-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <span className="block text-[11px] font-bold text-purple-900">Quick Presets:</span>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => applyPreset(1, 9)}
                          className="px-2.5 py-1 rounded-lg bg-white border border-purple-200 text-[11px] font-bold text-purple-800 hover:bg-purple-100 transition shadow-2xs cursor-pointer"
                        >
                          Tomorrow 9 AM
                        </button>
                        <button
                          type="button"
                          onClick={() => applyPreset(2, 10)}
                          className="px-2.5 py-1 rounded-lg bg-white border border-purple-200 text-[11px] font-bold text-purple-800 hover:bg-purple-100 transition shadow-2xs cursor-pointer"
                        >
                          In 2 Days
                        </button>
                        <button
                          type="button"
                          onClick={() => applyPreset(7, 9)}
                          className="px-2.5 py-1 rounded-lg bg-white border border-purple-200 text-[11px] font-bold text-purple-800 hover:bg-purple-100 transition shadow-2xs cursor-pointer"
                        >
                          In 1 Week
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          ) : (
            /* PREVIEW TAB */
            <div className="max-w-2xl mx-auto space-y-6 py-4 bg-white p-8 rounded-2xl border border-admin-border shadow-sm">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="inline-block px-3 py-1 rounded-full bg-indigo-50 text-admin-indigo text-xs font-black uppercase tracking-wider">
                    {formData.category}
                  </span>
                  {showSchedulePicker && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 text-[10px] font-black uppercase">
                      <Clock className="h-3 w-3" /> Scheduled for {new Date(scheduledDateTime).toLocaleString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl font-black text-admin-text leading-tight">
                  {formData.title || "Untitled Article"}
                </h1>
                <p className="text-sm font-semibold text-admin-muted leading-relaxed">
                  {formData.excerpt}
                </p>

                <div className="flex items-center gap-3 pt-3 border-t border-admin-border">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-admin-indigo border border-indigo-100">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-admin-text">{formData.author?.name}</h4>
                    <p className="text-[11px] text-admin-muted font-semibold">
                      {formData.author?.role || "Marketplace Specialist"} • {showSchedulePicker ? "Scheduled" : "Draft Preview"}
                    </p>
                  </div>
                </div>
              </div>

              {formData.coverImage && (
                <img
                  src={formData.coverImage}
                  alt="Cover"
                  className="w-full h-64 rounded-2xl object-cover border border-admin-border shadow-xs"
                />
              )}

              <div className="text-xs leading-relaxed text-admin-text whitespace-pre-wrap font-sans">
                {formData.content || "No content written yet."}
              </div>

              {formData.tags && formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-4 border-t border-admin-border">
                  {formData.tags.map((t) => (
                    <span key={t} className="px-2.5 py-1 rounded-lg bg-slate-100 text-[11px] font-bold text-slate-600">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer with Schedule Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-admin-border px-6 py-4 bg-slate-50">
          <div className="flex items-center gap-2 text-xs font-bold text-admin-muted">
            <span>Status:</span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                showSchedulePicker
                  ? "bg-purple-100 text-purple-800"
                  : formData.status === "PUBLISHED"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {showSchedulePicker ? "SCHEDULED" : formData.status}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3.5 py-2 rounded-xl border border-admin-border bg-white text-xs font-bold text-admin-text hover:bg-slate-100 transition shadow-xs"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => handleSubmit("DRAFT")}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-admin-border bg-white text-admin-indigo text-xs font-bold hover:bg-slate-100 transition shadow-xs"
            >
              <Save className="h-3.5 w-3.5" /> Save as Draft
            </button>

            {/* SCHEDULE BUTTON */}
            <button
              type="button"
              onClick={() => {
                if (!showSchedulePicker) {
                  setShowSchedulePicker(true);
                } else {
                  handleSubmit("SCHEDULED");
                }
              }}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>{showSchedulePicker ? "Confirm Schedule" : "Schedule"}</span>
            </button>

            <button
              type="button"
              onClick={() => handleSubmit("PUBLISHED")}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-admin-indigo text-white text-xs font-extrabold hover:bg-admin-indigo/90 transition shadow-md"
            >
              <Send className="h-3.5 w-3.5" /> Publish Now
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
