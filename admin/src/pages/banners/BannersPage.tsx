import React, { useState, useEffect, useRef } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import {
  fetchHomeBannersApi,
  createHomeBannerApi,
  updateHomeBannerApi,
  deleteHomeBannerApi,
  HomeBannerItem
} from "@/api/adminBanners.api";
import { uploadCategoryImageApi } from "@/api/adminCategories.api";
import {
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Eye,
  Check,
  AlertCircle,
  Upload,
  Image as ImageIcon,
  Power,
  Layers,
  MapPin,
  Clock,
  ShieldCheck,
  Tag,
  ExternalLink,
  Flame,
  ArrowRight,
  Sliders,
  DollarSign
} from "lucide-react";

export default function BannersPage() {
  const [banners, setBanners] = useState<HomeBannerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"hero_showcase" | "hero_banner" | "category_strip" | "quick_deal">("hero_showcase");
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<HomeBannerItem | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<HomeBannerItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<HomeBannerItem>>({
    type: "hero_showcase",
    title: "",
    subtitle: "",
    tag: "Hot Quick Deal",
    price: 49999,
    originalPrice: 64999,
    image: "",
    sellerName: "Verified Local Seller",
    initials: "VS",
    location: "Madhapur, Hyderabad",
    responseTime: "Responds in < 5 mins",
    targetUrl: "",
    order: 0,
    isActive: true
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadBanners = async (showSpin = false) => {
    if (showSpin) setIsRefreshing(true);
    else setLoading(true);

    const res = await fetchHomeBannersApi();
    if (res.success && res.data) {
      setBanners(res.data);
    } else {
      setBanners([]);
    }
    setLoading(false);
    setIsRefreshing(false);
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const openCreateModal = () => {
    setFormData({
      type: activeTab,
      title: "",
      subtitle: "",
      tag: activeTab === "hero_showcase" ? "Hot Quick Deal" : "Featured Promotion",
      price: activeTab === "hero_showcase" ? 49999 : undefined,
      originalPrice: activeTab === "hero_showcase" ? 64999 : undefined,
      image: "",
      sellerName: "Verified Local Seller",
      initials: "VS",
      location: "Madhapur, Hyderabad",
      responseTime: "Responds in < 5 mins",
      targetUrl: "",
      order: banners.filter((b) => b.type === activeTab).length,
      isActive: true
    });
    setIsCreateOpen(true);
  };

  const openEditModal = (banner: HomeBannerItem) => {
    setSelectedBanner(banner);
    setFormData({
      type: banner.type,
      title: banner.title,
      subtitle: banner.subtitle || "",
      tag: banner.tag || "Hot Quick Deal",
      price: banner.price,
      originalPrice: banner.originalPrice,
      image: banner.image,
      sellerName: banner.sellerName || "Verified Local Seller",
      initials: banner.initials || "VS",
      location: banner.location || "Madhapur, Hyderabad",
      responseTime: banner.responseTime || "Responds in < 5 mins",
      targetUrl: banner.targetUrl || "",
      order: banner.order || 0,
      isActive: banner.isActive !== false
    });
    setIsEditOpen(true);
  };

  const openDeleteModal = (banner: HomeBannerItem) => {
    setBannerToDelete(banner);
    setIsDeleteOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const res = await uploadCategoryImageApi(file);
    if (res.success && res.url) {
      setFormData((prev) => ({ ...prev, image: res.url }));
      showToast("success", "Banner image uploaded");
    } else {
      showToast("error", res.error || "Failed to upload image");
    }
  };

  const handleSave = async (isEditing: boolean) => {
    if (!formData.title?.trim() || !formData.image?.trim()) {
      showToast("error", "Title and Image are required");
      return;
    }

    setIsSaving(true);
    if (isEditing && selectedBanner) {
      const res = await updateHomeBannerApi(selectedBanner.id, formData);
      if (res.success) {
        showToast("success", "Banner item updated successfully");
        setIsEditOpen(false);
        await loadBanners();
      } else {
        showToast("error", res.error || "Failed to update banner");
      }
    } else {
      const res = await createHomeBannerApi(formData);
      if (res.success) {
        showToast("success", "Banner item created successfully");
        setIsCreateOpen(false);
        await loadBanners();
      } else {
        showToast("error", res.error || "Failed to create banner");
      }
    }
    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!bannerToDelete) return;
    setIsSaving(true);
    const res = await deleteHomeBannerApi(bannerToDelete.id);
    if (res.success) {
      showToast("success", "Banner item deleted");
      setIsDeleteOpen(false);
      setBannerToDelete(null);
      await loadBanners();
    } else {
      showToast("error", res.error || "Failed to delete banner");
    }
    setIsSaving(false);
  };

  const filteredItems = banners.filter((b) => b.type === activeTab);

  return (
    <PageContainer>
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center space-x-2 text-xs font-bold animate-in fade-in slide-in-from-top-4 ${
            notification.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800"
              : "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-200 dark:border-rose-800"
          }`}
        >
          {notification.type === "success" ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{notification.message}</span>
        </div>
      )}

      <PageHeader
        title="Homepage Banners & Hero Showcase Manager"
        description="Curate and control rotating deals in the Desktop Home Hero Showcase, top promotional banners, and quick deal strips in real-time."
        badge={`${banners.length} Active Banners & Showcase Items`}
        badgeColor={banners.length > 0 ? "emerald" : "indigo"}
        primaryAction={
          <div className="flex items-center space-x-2">
            <button
              onClick={() => loadBanners(true)}
              disabled={isRefreshing}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#3547D4]" : ""}`} />
              <span>{isRefreshing ? "Syncing..." : "Sync DB"}</span>
            </button>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#3547D4] text-white hover:bg-[#111E4D] transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>
                Add {activeTab === "hero_showcase" ? "Hero Deal" : activeTab === "hero_banner" ? "Hero Banner" : "Banner"}
              </span>
            </button>
          </div>
        }
      />

      {/* TABS NAVIGATION */}
      <div className="bg-white dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab("hero_showcase")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            activeTab === "hero_showcase"
              ? "bg-[#3547D4] text-white shadow-sm"
              : "bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Desktop Hero Showcase Deals ({banners.filter((b) => b.type === "hero_showcase").length})</span>
        </button>

        <button
          onClick={() => setActiveTab("hero_banner")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            activeTab === "hero_banner"
              ? "bg-[#3547D4] text-white shadow-sm"
              : "bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Top Hero Banners (HOME_HERO) ({banners.filter((b) => b.type === "hero_banner").length})</span>
        </button>

        <button
          onClick={() => setActiveTab("quick_deal")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            activeTab === "quick_deal"
              ? "bg-[#3547D4] text-white shadow-sm"
              : "bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Quick Deals Banner Strips ({banners.filter((b) => b.type === "quick_deal").length})</span>
        </button>

        <button
          onClick={() => setActiveTab("category_strip")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            activeTab === "category_strip"
              ? "bg-[#3547D4] text-white shadow-sm"
              : "bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>Category Strip Promos ({banners.filter((b) => b.type === "category_strip").length})</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="w-8 h-8 border-3 border-[#3547D4] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-semibold">Loading banners from database...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* ITEMS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item, idx) => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all"
              >
                {/* Media Image with Overlay Tags */}
                <div className="relative h-44 bg-slate-900 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  <div className="absolute top-3 left-3 flex items-center space-x-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 uppercase tracking-wide shadow-sm">
                      {item.tag || "Featured"}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-black/60 text-white backdrop-blur-md">
                      #{idx + 1}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3 flex items-center space-x-1">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 rounded-lg bg-white/80 hover:bg-white text-slate-800 transition-colors shadow-sm"
                      title="Edit Item"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(item)}
                      className="p-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white transition-colors shadow-sm"
                      title="Delete Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <div className="text-sm font-black truncate">{item.title}</div>
                    {item.price !== undefined && (
                      <div className="flex items-center space-x-2 mt-0.5">
                        <span className="text-base font-black text-amber-300">
                          ₹{item.price.toLocaleString("en-IN")}
                        </span>
                        {item.originalPrice && (
                          <span className="text-xs text-slate-300 line-through">
                            ₹{item.originalPrice.toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Details Body */}
                <div className="p-4 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <div className="flex items-center space-x-1.5 truncate">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-[#3547D4] font-black flex items-center justify-center text-[10px]">
                        {item.initials || "VS"}
                      </div>
                      <span className="truncate font-semibold">{item.sellerName || "Verified Seller"}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">{item.responseTime}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-500 text-[11px] pt-2 border-t border-slate-100 dark:border-slate-700">
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.location || "Hyderabad"}</span>
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.isActive !== false
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {item.isActive !== false ? "Live on Portal" : "Hidden / Inactive"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
              <Sparkles className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                No items in {activeTab.replace(/_/g, " ").toUpperCase()}
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Add curated products and promotional banners to display on the live marketplace homepage.
              </p>
              <button
                onClick={openCreateModal}
                className="px-4 py-2 bg-[#3547D4] text-white text-xs font-bold rounded-xl shadow hover:bg-[#111E4D]"
              >
                + Add First Item
              </button>
            </div>
          )}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {(isCreateOpen || isEditOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in-50">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-900/40 text-[#3547D4] dark:text-indigo-400 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {isEditOpen ? "Edit Banner Item" : "Create New Banner / Showcase Item"}
                  </h3>
                  <span className="text-[10px] text-slate-400">Configure visual media, pricing, tags, and placement</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsCreateOpen(false);
                  setIsEditOpen(false);
                }}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Placement Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                >
                  <option value="hero_showcase">Desktop Hero Showcase 3D Rotator</option>
                  <option value="hero_banner">Top Hero Ad Banner (HOME_HERO)</option>
                  <option value="quick_deal">Quick Deals Promo Strip</option>
                  <option value="category_strip">Category Strip Banner</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Title / Product Name *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. iPhone 15 Pro Max (256GB)"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Badge Tag (e.g. Hot Quick Deal)
                  </label>
                  <input
                    type="text"
                    value={formData.tag}
                    onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                    placeholder="Hot Quick Deal / 50% Off"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                  />
                </div>
              </div>

              {/* PRICING */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Deal Price (₹ INR)
                  </label>
                  <input
                    type="number"
                    value={formData.price ?? ""}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="49999"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Original Strike Price (₹ INR)
                  </label>
                  <input
                    type="number"
                    value={formData.originalPrice ?? ""}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="64999"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                  />
                </div>
              </div>

              {/* IMAGE UPLOAD & PREVIEW */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2.5">
                <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200">
                  Banner / Product Image *
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                    className="py-2 px-3 border border-dashed border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-300 flex items-center justify-center space-x-2 text-xs font-semibold"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#3547D4]" />
                    <span>Upload Image File</span>
                  </button>

                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="Or Image URL..."
                    className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-xs"
                  />
                </div>

                {formData.image && (
                  <div className="relative h-28 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* SELLER & LOCATION DETAILS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Seller Name
                  </label>
                  <input
                    type="text"
                    value={formData.sellerName}
                    onChange={(e) => setFormData({ ...formData, sellerName: e.target.value })}
                    placeholder="Akhil R. (Verified Seller)"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Location String
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Madhapur, Hyderabad"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                  />
                </div>
              </div>

              {/* STATUS & TARGET LINK */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Target URL / Route Link (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.targetUrl}
                    onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
                    placeholder="/results?q=iphone"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                  />
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div>
                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block">Active Status</span>
                    <span className="text-[9px] text-slate-400">Show on live portal</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                    className={`px-3 py-1 rounded-xl text-xs font-bold ${
                      formData.isActive
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : "bg-slate-200 text-slate-700 dark:bg-slate-700"
                    }`}
                  >
                    {formData.isActive ? "Active" : "Inactive"}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setIsCreateOpen(false);
                  setIsEditOpen(false);
                }}
                className="px-4 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={() => handleSave(isEditOpen)}
                className="px-5 py-2 text-xs font-bold bg-[#3547D4] text-white rounded-xl hover:bg-[#111E4D] disabled:opacity-60 shadow-sm flex items-center space-x-1.5"
              >
                {isSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{isSaving ? "Saving..." : isEditOpen ? "Save Changes" : "Create Item"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteOpen && bannerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in-50">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center font-bold">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Delete Banner Item?</h3>
                <span className="text-[11px] text-slate-400">{bannerToDelete.title}</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              This will permanently remove this showcase/banner item from the database.
            </p>

            <div className="pt-2 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleDelete}
                className="px-3 py-1.5 text-xs font-bold bg-rose-600 text-white rounded-xl hover:bg-rose-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
