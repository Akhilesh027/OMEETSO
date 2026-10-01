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
  Image as ImageIcon,
  Link as LinkIcon,
  Layers,
  Star,
  Plus,
  Check,
  ExternalLink,
  ArrowUpRight,
  Maximize2,
} from "lucide-react";
import { uploadCategoryImageApi, uploadBlogImageApi } from "@/api/adminCategories.api";

export interface BlogItem {
  id?: string;
  _id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  galleryImages?: string[];
  category: string;
  tags: string[];
  author: {
    name: string;
    avatar?: string;
    role?: string;
    bio?: string;
  };
  readTime?: string;
  status: "DRAFT" | "PUBLISHED" | "SCHEDULED" | "ARCHIVED" | "BLOCKED";
  isFeatured: boolean;
  isBlocked?: boolean;
  blockedAt?: string;
  blockReason?: string;
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

export const MARKETPLACE_STOCK_PRESETS = [
  {
    category: "Buying & Selling",
    items: [
      { label: "Marketplace Shoppers", url: "https://images.unsplash.com/photo-1555421689-491a97ff2040?w=1200" },
      { label: "Handshake & Verified Deal", url: "https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=1200" },
      { label: "Local Pickup & Courier", url: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200" },
      { label: "Instant Digital Payments", url: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200" }
    ]
  },
  {
    category: "Tech & Mobiles",
    items: [
      { label: "Smartphones & Gadgets", url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200" },
      { label: "Laptops & Workspace", url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1200" },
      { label: "Wireless Audio & Gear", url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200" },
      { label: "Camera & Tech Review", url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200" }
    ]
  },
  {
    category: "Vehicles & Bikes",
    items: [
      { label: "Pre-Owned Cars Check", url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200" },
      { label: "Two-Wheeler & Scooters", url: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=1200" },
      { label: "Electric Vehicle (EV)", url: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=1200" },
      { label: "Mechanical Inspection", url: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=1200" }
    ]
  },
  {
    category: "Home & Furniture",
    items: [
      { label: "Modern Living Furniture", url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200" },
      { label: "Rental House & Apartments", url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200" },
      { label: "Home Office Setup", url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200" },
      { label: "Home Appliances", url: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1200" }
    ]
  },
  {
    category: "Safety & Scams",
    items: [
      { label: "Verified Buyer Shield", url: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200" },
      { label: "Cyber & Payment Protection", url: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=1200" },
      { label: "OTP & Mobile Safety", url: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1200" },
      { label: "Safe In-Person Meetup", url: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1200" }
    ]
  }
];

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
    galleryImages: [],
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

  // Multiple Image Upload Options state
  const [imageUploadTab, setImageUploadTab] = useState<"file" | "url" | "stock">("file");
  const [urlInput, setUrlInput] = useState("");
  const [selectedStockCategory, setSelectedStockCategory] = useState<string>("Buying & Selling");
  const [previewImageModal, setPreviewImageModal] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Handle multi-file image upload directly to Cloudinary
  const handleMultipleFilesUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (fileArray.length === 0) return;

    setIsUploadingImage(true);
    setErrorMsg("");

    try {
      const uploadedUrls: string[] = [];
      for (const file of fileArray) {
        const res = await uploadBlogImageApi(file, "blogs");
        if (res.success && res.url) {
          uploadedUrls.push(res.url);
        }
      }

      if (uploadedUrls.length > 0) {
        setFormData((prev) => {
          const currentGallery = Array.isArray(prev.galleryImages) ? prev.galleryImages : [];
          const updatedGallery = Array.from(new Set([...currentGallery, ...uploadedUrls]));
          const updatedCover = prev.coverImage || uploadedUrls[0];
          return {
            ...prev,
            coverImage: updatedCover,
            galleryImages: updatedGallery
          };
        });
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to process images");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleMultipleFilesUpload(e.target.files);
    }
  };

  const handleAddUrlImage = async () => {
    if (!urlInput.trim()) return;
    const urls = urlInput
      .split(/[\n,]+/)
      .map((u) => u.trim())
      .filter((u) => u.startsWith("http://") || u.startsWith("https://") || u.startsWith("data:image"));

    if (urls.length === 0) {
      setErrorMsg("Please enter valid image URL(s) starting with http:// or https://");
      return;
    }

    setIsUploadingImage(true);
    setErrorMsg("");

    try {
      // Upload / convert external URLs to Cloudinary (mirroring listing upload pipeline)
      const convertedUrls = await Promise.all(
        urls.map(async (u) => {
          const res = await uploadBlogImageApi(u, "blogs");
          return res.success && res.url ? res.url : u;
        })
      );

      setFormData((prev) => {
        const currentGallery = Array.isArray(prev.galleryImages) ? prev.galleryImages : [];
        const updatedGallery = Array.from(new Set([...currentGallery, ...convertedUrls]));
        return {
          ...prev,
          coverImage: prev.coverImage || convertedUrls[0],
          galleryImages: updatedGallery
        };
      });

      setUrlInput("");
      setErrorMsg("");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to convert URL image to Cloudinary");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSelectStockImage = async (url: string) => {
    setIsUploadingImage(true);
    let finalUrl = url;
    try {
      const res = await uploadBlogImageApi(url, "blogs");
      if (res.success && res.url) {
        finalUrl = res.url;
      }
    } catch {
      // Fallback to stock preset URL
    } finally {
      setIsUploadingImage(false);
    }

    setFormData((prev) => {
      const currentGallery = Array.isArray(prev.galleryImages) ? prev.galleryImages : [];
      const updatedGallery = Array.from(new Set([...currentGallery, finalUrl]));
      return {
        ...prev,
        coverImage: prev.coverImage || finalUrl,
        galleryImages: updatedGallery
      };
    });
  };

  const handleSetCoverImage = (url: string) => {
    setFormData((prev) => ({ ...prev, coverImage: url }));
  };

  const handleRemoveGalleryImage = (urlToRemove: string) => {
    setFormData((prev) => {
      const currentGallery = Array.isArray(prev.galleryImages) ? prev.galleryImages : [];
      const updatedGallery = currentGallery.filter((u) => u !== urlToRemove);
      let updatedCover = prev.coverImage;
      if (updatedCover === urlToRemove) {
        updatedCover = updatedGallery[0] || "";
      }
      return {
        ...prev,
        coverImage: updatedCover,
        galleryImages: updatedGallery
      };
    });
  };

  const handleInsertImageIntoContent = (imageUrl: string, altText: string = "Article Image") => {
    const mdSnippet = `\n\n![${altText}](${imageUrl})\n\n`;
    setFormData((prev) => ({
      ...prev,
      content: (prev.content || "") + mdSnippet
    }));
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
      // Ensure all images are converted to Cloudinary before saving (mirroring listing upload pipeline)
      let finalCover = formData.coverImage;
      if (finalCover && (finalCover.startsWith("data:") || !finalCover.includes("res.cloudinary.com"))) {
        const up = await uploadBlogImageApi(finalCover, "blogs");
        if (up.success && up.url) {
          finalCover = up.url;
        }
      }

      let finalGallery: string[] = [];
      if (Array.isArray(formData.galleryImages) && formData.galleryImages.length > 0) {
        finalGallery = await Promise.all(
          formData.galleryImages.map(async (img) => {
            if (img.startsWith("data:") || !img.includes("res.cloudinary.com")) {
              const up = await uploadBlogImageApi(img, "blogs");
              return up.success && up.url ? up.url : img;
            }
            return img;
          })
        );
      }

      const payload: Partial<BlogItem> = {
        ...formData,
        coverImage: finalCover,
        galleryImages: finalGallery,
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

              {/* Multiple Image Upload Options & Media Gallery */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    Article Images & Cover Banner *
                  </label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-500">
                      {Array.isArray(formData.galleryImages) ? formData.galleryImages.length : 0} Images Attached
                    </span>
                    {formData.coverImage && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 text-[10px] font-black">
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> Cover Set
                      </span>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-admin-border bg-slate-50/90 p-4 space-y-4 shadow-xs">
                  {/* Upload Method Switcher Tabs */}
                  <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white rounded-xl border border-admin-border shadow-xs">
                    <button
                      type="button"
                      onClick={() => setImageUploadTab("file")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        imageUploadTab === "file"
                          ? "bg-admin-indigo text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span>Option 1: Device Upload (Multiple Files)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setImageUploadTab("url")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        imageUploadTab === "url"
                          ? "bg-admin-indigo text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                    >
                      <LinkIcon className="h-3.5 w-3.5" />
                      <span>Option 2: Image URL(s)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setImageUploadTab("stock")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        imageUploadTab === "stock"
                          ? "bg-admin-indigo text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                    >
                      <Layers className="h-3.5 w-3.5" />
                      <span>Option 3: Marketplace Presets</span>
                    </button>
                  </div>

                  {/* TAB 1: DEVICE MULTI-FILE UPLOAD & DRAG DROP */}
                  {imageUploadTab === "file" && (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragOver(true);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        setIsDragOver(false);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragOver(false);
                        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                          handleMultipleFilesUpload(e.dataTransfer.files);
                        }
                      }}
                      className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                        isDragOver
                          ? "border-admin-indigo bg-indigo-50/50 scale-[1.01]"
                          : "border-slate-300 hover:border-slate-400 bg-white"
                      }`}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileInputChange}
                        accept="image/*"
                        multiple
                        className="hidden"
                      />

                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-50 text-admin-indigo mb-1">
                          <Upload className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            Drag & drop multiple image files here, or{" "}
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={isUploadingImage}
                              className="text-admin-indigo underline hover:text-indigo-700 cursor-pointer font-extrabold"
                            >
                              browse computer
                            </button>
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Supports multi-select JPG, PNG, WEBP, and GIF files simultaneously
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingImage}
                          className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-admin-indigo text-white text-xs font-bold shadow-sm hover:bg-indigo-700 transition cursor-pointer"
                        >
                          <Plus className="h-4 w-4" />
                          <span>{isUploadingImage ? "Processing Images..." : "Choose Multiple Images"}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: DIRECT IMAGE URL */}
                  {imageUploadTab === "url" && (
                    <div className="rounded-2xl border border-admin-border bg-white p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">Paste Image URLs</span>
                        <span className="text-[11px] text-slate-400">Separate multiple URLs by newline or comma</span>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <textarea
                          rows={2}
                          placeholder="https://images.unsplash.com/...&#10;https://example.com/photo2.jpg"
                          value={urlInput}
                          onChange={(e) => setUrlInput(e.target.value)}
                          className="flex-1 rounded-xl border border-admin-border bg-slate-50 p-2.5 text-xs font-medium text-admin-text outline-none focus:border-admin-indigo focus:ring-2 focus:ring-admin-indigo/15"
                        />
                        <button
                          type="button"
                          onClick={handleAddUrlImage}
                          className="self-stretch sm:self-auto px-5 py-2.5 rounded-xl bg-admin-indigo text-white text-xs font-bold hover:bg-indigo-700 transition cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Add to Gallery</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: MARKETPLACE STOCK PRESETS */}
                  {imageUploadTab === "stock" && (
                    <div className="rounded-2xl border border-admin-border bg-white p-4 space-y-3">
                      <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-slate-100">
                        {MARKETPLACE_STOCK_PRESETS.map((p) => (
                          <button
                            key={p.category}
                            type="button"
                            onClick={() => setSelectedStockCategory(p.category)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              selectedStockCategory === p.category
                                ? "bg-slate-900 text-white shadow-xs"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                          >
                            {p.category}
                          </button>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {MARKETPLACE_STOCK_PRESETS.find((p) => p.category === selectedStockCategory)?.items.map((stock) => {
                          const isAlreadyAdded = Array.isArray(formData.galleryImages) && formData.galleryImages.includes(stock.url);
                          return (
                            <div
                              key={stock.url}
                              className="group relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-video flex flex-col justify-end shadow-xs hover:shadow-md transition"
                            >
                              <img
                                src={stock.url}
                                alt={stock.label}
                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-300"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                              <div className="relative p-2 flex items-center justify-between text-white">
                                <span className="text-[10px] font-bold truncate max-w-[70%]">{stock.label}</span>
                                <button
                                  type="button"
                                  onClick={() => handleSelectStockImage(stock.url)}
                                  className={`p-1 rounded-md text-[10px] font-black transition cursor-pointer flex items-center gap-1 ${
                                    isAlreadyAdded
                                      ? "bg-emerald-600 text-white"
                                      : "bg-white/90 hover:bg-white text-slate-900"
                                  }`}
                                  title="Add to Blog Media"
                                >
                                  {isAlreadyAdded ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* GALLERY & MEDIA ASSETS MANAGER */}
                  <div className="space-y-2 pt-2 border-t border-slate-200/80">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <span>Attached Blog Images & Media</span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-extrabold">
                          {Array.isArray(formData.galleryImages) ? formData.galleryImages.length : 0}
                        </span>
                      </span>

                      {Array.isArray(formData.galleryImages) && formData.galleryImages.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, coverImage: "", galleryImages: [] }))}
                          className="text-[11px] font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
                        >
                          Clear All Images
                        </button>
                      )}
                    </div>

                    {Array.isArray(formData.galleryImages) && formData.galleryImages.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {formData.galleryImages.map((imgUrl, idx) => {
                          const isCover = formData.coverImage === imgUrl;
                          return (
                            <div
                              key={`${imgUrl}-${idx}`}
                              className={`group relative rounded-xl overflow-hidden border transition shadow-xs ${
                                isCover
                                  ? "border-amber-400 ring-2 ring-amber-300/60 bg-amber-50/20"
                                  : "border-slate-200 bg-white"
                              }`}
                            >
                              <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                                <img
                                  src={imgUrl}
                                  alt={`Attachment ${idx + 1}`}
                                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                />

                                {isCover && (
                                  <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs">
                                    <Star className="h-3 w-3 fill-white" />
                                    <span>Cover</span>
                                  </div>
                                )}

                                {(imgUrl.includes("res.cloudinary.com") || imgUrl.includes("cloudinary.com")) && (
                                  <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-sky-600/90 text-white text-[9px] font-black backdrop-blur-xs flex items-center gap-1 shadow-xs">
                                    <Sparkles className="h-2.5 w-2.5" />
                                    <span>Cloudinary</span>
                                  </div>
                                )}

                                <button
                                  type="button"
                                  onClick={() => setPreviewImageModal(imgUrl)}
                                  className="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/60 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition cursor-pointer"
                                  title="Enlarge Preview"
                                >
                                  <Maximize2 className="h-3 w-3" />
                                </button>
                              </div>

                              <div className="p-2 space-y-1.5 bg-white">
                                <div className="flex items-center justify-between gap-1">
                                  {!isCover ? (
                                    <button
                                      type="button"
                                      onClick={() => handleSetCoverImage(imgUrl)}
                                      className="flex-1 py-1 px-1.5 rounded-lg bg-slate-100 hover:bg-amber-50 hover:text-amber-700 text-slate-700 text-[10px] font-bold flex items-center justify-center gap-1 transition cursor-pointer"
                                      title="Set this image as the main banner"
                                    >
                                      <Star className="h-3 w-3" />
                                      <span>Make Cover</span>
                                    </button>
                                  ) : (
                                    <span className="flex-1 py-1 px-1.5 text-center text-[10px] font-bold text-amber-700 bg-amber-50 rounded-lg">
                                      Active Cover
                                    </span>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => handleInsertImageIntoContent(imgUrl, `Illustration ${idx + 1}`)}
                                    className="py-1 px-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-admin-indigo text-[10px] font-bold flex items-center justify-center gap-1 transition cursor-pointer"
                                    title="Insert this image into article markdown"
                                  >
                                    <Plus className="h-3 w-3" />
                                    <span>Insert</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleRemoveGalleryImage(imgUrl)}
                                    className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                                    title="Remove Image"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="border border-dashed border-slate-300 rounded-xl p-5 text-center bg-white">
                        <ImageIcon className="h-6 w-6 text-slate-400 mx-auto mb-1" />
                        <p className="text-xs font-bold text-slate-700">No images added to this article yet</p>
                        <p className="text-[11px] text-slate-400">
                          Use the tabs above to upload files, paste URLs, or pick marketplace stock photos
                        </p>
                      </div>
                    )}
                  </div>
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

      {/* Enlarged Image Preview Modal */}
      {previewImageModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative max-w-3xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl animate-in fade-in-50">
            <div className="flex items-center justify-between p-3.5 border-b border-slate-100 bg-slate-50">
              <span className="text-xs font-bold text-slate-700">Full Image Preview</span>
              <button
                type="button"
                onClick={() => setPreviewImageModal(null)}
                className="p-1 rounded-lg text-slate-500 hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-3 bg-slate-950 flex items-center justify-center max-h-[75vh]">
              <img
                src={previewImageModal}
                alt="Enlarged Preview"
                className="max-h-[70vh] w-auto max-w-full object-contain rounded-lg"
              />
            </div>
            <div className="p-3 bg-white flex justify-between items-center text-xs gap-3">
              <span className="text-slate-500 truncate text-[11px] font-mono">{previewImageModal}</span>
              <button
                type="button"
                onClick={() => {
                  handleSetCoverImage(previewImageModal);
                  setPreviewImageModal(null);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Star className="h-3.5 w-3.5 fill-white" />
                <span>Set as Cover Banner</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
