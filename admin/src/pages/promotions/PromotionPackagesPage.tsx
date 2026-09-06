import React, { useState, useEffect, useCallback, useMemo } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import {
  getAdminAdProductsApi,
  createAdminAdProductApi,
  updateAdminAdProductApi,
  deleteAdminAdProductApi,
  toggleAdminAdProductStatusApi
} from "@/api/adminAds.api";
import {
  PackagePlus,
  CheckCircle,
  Zap,
  Loader2,
  RefreshCw,
  Edit2,
  Trash2,
  Eye,
  Sparkles,
  Layers,
  Image as ImageIcon,
  Check,
  X,
  TrendingUp,
  Tag,
  AlertCircle,
  Clock,
  ShieldCheck,
  ExternalLink,
  Plus,
  DollarSign,
  Percent,
  CheckCircle2,
  Copy,
  Info,
  SlidersHorizontal,
  Layout,
  Globe,
  Smartphone
} from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

export const ALL_AD_PLACEMENTS = [
  {
    id: "HOMEPAGE_HERO",
    label: "Home Page Banners",
    page: "Homepage",
    route: "/",
    desc: "16:9 billboard banner across the main homepage",
    format: "BANNER_AD"
  },
  {
    id: "CATEGORY_HEADER",
    label: "Category Page Banners",
    page: "Category Browse",
    route: "/category/all",
    desc: "3:1 header billboard banner above category listings",
    format: "BANNER_AD"
  },
  {
    id: "STORE_BANNER",
    label: "Store Directory Banners",
    page: "Stores Directory",
    route: "/stores",
    desc: "3:1 showroom billboard at top of stores directory",
    format: "BANNER_AD"
  },
  {
    id: "JOBS_HEADER",
    label: "Jobs Portal Banners",
    page: "Jobs Portal",
    route: "/jobs",
    desc: "3:1 recruitment header on local jobs portal",
    format: "BANNER_AD"
  },
  {
    id: "SEARCH_TOP",
    label: "Search Results Priority Spots",
    page: "Search Results",
    route: "/results",
    desc: "Guaranteed top 1-3 ranking in keyword search results",
    format: "LISTING_BOOST"
  },
  {
    id: "CATEGORY_FEATURED",
    label: "Category Featured Listing",
    page: "Category Browse",
    route: "/category/all",
    desc: "Top row spotlight card in category product grids",
    format: "LISTING_BOOST"
  },
  {
    id: "URGENT_BADGE",
    label: "Urgent Sale Badge",
    page: "All Feeds & Search",
    route: "/results",
    desc: "Pulsing red 'URGENT' ribbon badge on listing cards",
    format: "LISTING_BOOST"
  },
  {
    id: "HIGHLIGHTED_CARD",
    label: "Golden Highlighted Card",
    page: "All Feeds & Search",
    route: "/results",
    desc: "Golden illuminated card border and warm glow in feeds",
    format: "LISTING_BOOST"
  }
];

type FilterTab =
  | "ALL"
  | "LISTING_BOOST"
  | "BANNER_AD"
  | "HOMEPAGE"
  | "SEARCH_TOP"
  | "CATEGORY"
  | "STORES_JOBS"
  | "BADGES"
  | "ACTIVE"
  | "INACTIVE";

export default function PromotionPackagesPage() {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    campaignType: "LISTING_BOOST" as "LISTING_BOOST" | "BANNER_AD",
    durationDays: 7,
    priceRupees: 249,
    originalPriceRupees: 399,
    badge: "🔥 Most Popular",
    estimatedReach: "5,000 - 12,000 Local Buyers",
    features: [
      "#1 Top Rank on Search Results",
      "SPONSORED Golden Badge",
      "Pinned Category Header Spot",
      "5× More Buyer Messages & Calls"
    ],
    newFeatureText: "",
    permittedPlacements: ["SEARCH_TOP", "CATEGORY_FEATURED", "HIGHLIGHTED_CARD"],
    priority: 1,
    active: true
  });

  const { showSuccess, showError } = useToast();

  const loadPackages = useCallback(async () => {
    setLoading(true);
    const res = await getAdminAdProductsApi();
    setLoading(false);
    if (res.success && res.data) {
      setPackages(res.data);
    } else {
      showError("Failed to Load Packages", res.error);
    }
  }, [showError]);

  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  const handleSyncDefaults = async () => {
    setSyncing(true);
    try {
      const res = await fetch("https://api.omeetso.in/api/v1/ad-products?reset=true");
      const json = await res.json();
      setSyncing(false);
      if (json.success && json.data) {
        setPackages(json.data);
        showSuccess("Plans Synchronized", `Synced ${json.data.length} verified monetization packages with MongoDB.`);
      } else {
        showError("Sync Failed", "Could not sync plans from backend.");
      }
    } catch (err: any) {
      setSyncing(false);
      showError("Sync Failed", err?.message || "Network error");
    }
  };

  const openCreateModal = () => {
    setEditingPkg(null);
    setFormData({
      name: "",
      description: "",
      campaignType: "LISTING_BOOST",
      durationDays: 7,
      priceRupees: 199,
      originalPriceRupees: 349,
      badge: "⚡ New Plan",
      estimatedReach: "4,000 - 10,000 Local Buyers",
      features: [
        "Priority Search Indexing",
        "SPONSORED Golden Badge",
        "Direct WhatsApp & Call Leads"
      ],
      newFeatureText: "",
      permittedPlacements: ["SEARCH_TOP", "CATEGORY_FEATURED"],
      priority: packages.length + 1,
      active: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (pkg: any) => {
    setEditingPkg(pkg);
    setFormData({
      name: pkg.name || "",
      description: pkg.description || "",
      campaignType: pkg.campaignType || "LISTING_BOOST",
      durationDays: pkg.durationDays || 7,
      priceRupees: Math.round((pkg.priceInPaise || 0) / 100),
      originalPriceRupees: pkg.originalPriceInPaise ? Math.round(pkg.originalPriceInPaise / 100) : 0,
      badge: pkg.badge || "",
      estimatedReach: pkg.estimatedReach || "",
      features: Array.isArray(pkg.features) && pkg.features.length > 0 ? [...pkg.features] : [],
      newFeatureText: "",
      permittedPlacements: Array.isArray(pkg.permittedPlacements) ? [...pkg.permittedPlacements] : [],
      priority: pkg.priority || 0,
      active: pkg.active !== false
    });
    setIsModalOpen(true);
  };

  const openDuplicateModal = (pkg: any) => {
    setEditingPkg(null);
    setFormData({
      name: `${pkg.name} (Copy)`,
      description: pkg.description || "",
      campaignType: pkg.campaignType || "LISTING_BOOST",
      durationDays: pkg.durationDays || 7,
      priceRupees: Math.round((pkg.priceInPaise || 0) / 100),
      originalPriceRupees: pkg.originalPriceInPaise ? Math.round(pkg.originalPriceInPaise / 100) : 0,
      badge: pkg.badge || "⚡ Special Offer",
      estimatedReach: pkg.estimatedReach || "",
      features: Array.isArray(pkg.features) ? [...pkg.features] : [],
      newFeatureText: "",
      permittedPlacements: Array.isArray(pkg.permittedPlacements) ? [...pkg.permittedPlacements] : [],
      priority: packages.length + 1,
      active: true
    });
    setIsModalOpen(true);
  };

  const handleAddFeature = () => {
    if (!formData.newFeatureText.trim()) return;
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, prev.newFeatureText.trim()],
      newFeatureText: ""
    }));
  };

  const handleRemoveFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.description.trim()) {
      showError("Validation Error", "Please provide a plan name and description.");
      return;
    }
    if (formData.priceRupees <= 0) {
      showError("Validation Error", "Plan price must be greater than 0.");
      return;
    }
    if (formData.permittedPlacements.length === 0) {
      showError("Validation Error", "Please select at least one ad placement slot.");
      return;
    }

    setSubmitting(true);
    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      campaignType: formData.campaignType,
      durationDays: Number(formData.durationDays),
      priceInPaise: Math.round(formData.priceRupees * 100),
      originalPriceInPaise: formData.originalPriceRupees > 0 ? Math.round(formData.originalPriceRupees * 100) : undefined,
      badge: formData.badge.trim() || undefined,
      estimatedReach: formData.estimatedReach.trim() || undefined,
      features: formData.features.filter((f) => f.trim().length > 0),
      permittedPlacements: formData.permittedPlacements,
      priority: Number(formData.priority) || 0,
      active: formData.active
    };

    if (editingPkg) {
      const res = await updateAdminAdProductApi(editingPkg.id || editingPkg._id, payload);
      setSubmitting(false);
      if (res.success) {
        showSuccess("Pricing Plan Updated", `Successfully updated "${payload.name}"`);
        setIsModalOpen(false);
        loadPackages();
      } else {
        showError("Update Failed", res.error);
      }
    } else {
      const res = await createAdminAdProductApi(payload);
      setSubmitting(false);
      if (res.success) {
        showSuccess("Pricing Plan Created", `Successfully created "${payload.name}"`);
        setIsModalOpen(false);
        loadPackages();
      } else {
        showError("Creation Failed", res.error);
      }
    }
  };

  const handleDeletePlan = async (id: string, name: string) => {
    const res = await deleteAdminAdProductApi(id);
    setDeleteConfirmId(null);
    if (res.success) {
      showSuccess("Plan Deleted", `Successfully removed "${name}"`);
      loadPackages();
    } else {
      showError("Delete Failed", res.error);
    }
  };

  const handleToggleStatus = async (id: string, name: string) => {
    const res = await toggleAdminAdProductStatusApi(id);
    if (res.success) {
      const statusText = res.data?.active ? "activated" : "deactivated";
      showSuccess("Status Updated", `Plan "${name}" is now ${statusText}.`);
      loadPackages();
    } else {
      showError("Toggle Failed", res.error);
    }
  };

  const handlePlacementToggle = (placementId: string) => {
    setFormData((prev) => {
      const current = prev.permittedPlacements;
      if (current.includes(placementId)) {
        return { ...prev, permittedPlacements: current.filter((p) => p !== placementId) };
      } else {
        return { ...prev, permittedPlacements: [...current, placementId] };
      }
    });
  };

  // Filter logic
  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (pkg.name || "").toLowerCase().includes(q);
        const matchDesc = (pkg.description || "").toLowerCase().includes(q);
        const matchPlc = Array.isArray(pkg.permittedPlacements) && pkg.permittedPlacements.some((p: string) => p.toLowerCase().includes(q));
        if (!matchName && !matchDesc && !matchPlc) return false;
      }

      // Tab filter
      if (activeFilter === "LISTING_BOOST") return pkg.campaignType === "LISTING_BOOST";
      if (activeFilter === "BANNER_AD") return pkg.campaignType === "BANNER_AD";
      if (activeFilter === "ACTIVE") return pkg.active !== false;
      if (activeFilter === "INACTIVE") return pkg.active === false;
      if (activeFilter === "HOMEPAGE") {
        return pkg.permittedPlacements?.includes("HOMEPAGE_HERO");
      }
      if (activeFilter === "SEARCH_TOP") {
        return pkg.permittedPlacements?.includes("SEARCH_TOP");
      }
      if (activeFilter === "CATEGORY") {
        return pkg.permittedPlacements?.some((p: string) =>
          ["CATEGORY_HEADER", "CATEGORY_FEATURED"].includes(p)
        );
      }
      if (activeFilter === "STORES_JOBS") {
        return pkg.permittedPlacements?.some((p: string) =>
          ["STORE_BANNER", "JOBS_HEADER"].includes(p)
        );
      }
      if (activeFilter === "BADGES") {
        return pkg.permittedPlacements?.some((p: string) =>
          ["URGENT_BADGE", "HIGHLIGHTED_CARD"].includes(p)
        );
      }
      return true;
    });
  }, [packages, activeFilter, searchQuery]);

  // Aggregate stats
  const boostCount = packages.filter((p) => p.campaignType === "LISTING_BOOST").length;
  const bannerCount = packages.filter((p) => p.campaignType === "BANNER_AD").length;
  const activeCount = packages.filter((p) => p.active !== false).length;

  const avgPriceRupees = useMemo(() => {
    if (packages.length === 0) return 0;
    const sum = packages.reduce((acc, p) => acc + (p.priceInPaise || 0), 0);
    return Math.round(sum / packages.length / 100);
  }, [packages]);

  // Covered placements
  const coveredPlacementCount = useMemo(() => {
    const coveredSet = new Set<string>();
    packages.forEach((pkg) => {
      if (Array.isArray(pkg.permittedPlacements)) {
        pkg.permittedPlacements.forEach((p: string) => coveredSet.add(p));
      }
    });
    return coveredSet.size;
  }, [packages]);

  return (
    <PageContainer>
      <PageHeader
        title="Pricing Plans & Monetization Packages"
        description="Configure, price, and manage high-converting seller Boost Plans and Advertiser Banner Packages covering all marketplace surfaces."
        badge={`${packages.length} Configured Plans`}
        badgeColor="indigo"
        primaryAction={
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <PackagePlus className="w-4 h-4" /> Create Pricing Plan
          </button>
        }
        secondaryActions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncDefaults}
              disabled={syncing}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#E2E8F0] hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors shadow-2xs disabled:opacity-50"
              title="Sync verified default pricing packages"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin text-indigo-600" : "text-slate-500"}`} />
              <span>{syncing ? "Syncing..." : "Sync Defaults"}</span>
            </button>
            <a
              href="/admin/promotions/placements"
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Ad Placements (12 Slots)</span>
            </a>
          </div>
        }
      />

      {/* Top Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-white rounded-2xl border border-[#E2E8F0] shadow-xs flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 grid place-items-center shrink-0">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Plans</div>
            <div className="text-xl font-black text-slate-900">{packages.length} Packages</div>
            <div className="text-[10px] text-emerald-600 font-semibold">{activeCount} Active Live</div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#E2E8F0] shadow-xs flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 grid place-items-center shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Average Price</div>
            <div className="text-xl font-black text-slate-900">₹{avgPriceRupees}</div>
            <div className="text-[10px] text-slate-500 font-semibold">Min: ₹49 · Max: ₹1,999</div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#E2E8F0] shadow-xs flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 grid place-items-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Placement Coverage</div>
            <div className="text-xl font-black text-slate-900">{coveredPlacementCount} / {ALL_AD_PLACEMENTS.length} Slots</div>
            <div className="text-[10px] text-emerald-600 font-bold">100% Surfaces Covered</div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#E2E8F0] shadow-xs flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 grid place-items-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Package Mix</div>
            <div className="text-sm font-black text-slate-900">{bannerCount} Banners · {boostCount} Boosts</div>
            <div className="text-[10px] text-slate-500 font-semibold">Flexible 3d to 30d Durations</div>
          </div>
        </div>
      </div>

      {/* Surface & Format Filter Tabs */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            {[
              { id: "ALL", label: `All Plans (${packages.length})` },
              { id: "LISTING_BOOST", label: `⚡ Listing Boosts (${boostCount})` },
              { id: "BANNER_AD", label: `🎨 Banner Packages (${bannerCount})` },
              { id: "HOMEPAGE", label: "🏠 Homepage Banners" },
              { id: "SEARCH_TOP", label: "🔍 Search Priority (#1-3)" },
              { id: "CATEGORY", label: "📁 Category Browse & Header" },
              { id: "STORES_JOBS", label: "🏬 Stores & Jobs Billboard" },
              { id: "BADGES", label: "✨ Listing Badges & Highlights" },
              { id: "ACTIVE", label: `Active (${activeCount})` },
              { id: "INACTIVE", label: `Inactive (${packages.length - activeCount})` }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as FilterTab)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${activeFilter === tab.id
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white border border-[#E2E8F0] text-slate-600 hover:bg-slate-50"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search plans by name, placement..."
              className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E2E8F0] text-xs font-semibold placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-600 shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* Packages Grid */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 bg-white rounded-2xl border border-[#E2E8F0]">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-indigo-600" />
          <p className="text-sm font-semibold text-slate-600">Loading monetization pricing plans from MongoDB...</p>
        </div>
      ) : filteredPackages.length === 0 ? (
        <div className="p-16 text-center text-slate-400 bg-white rounded-2xl border border-[#E2E8F0] space-y-3">
          <Tag className="w-10 h-10 mx-auto text-slate-300" />
          <div className="text-base font-bold text-slate-700">No Plans Match Current Filters</div>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {searchQuery
              ? `No packages match "${searchQuery}". Try clearing the search query.`
              : "There are no pricing plans in this category. Click below to create one or sync defaults."}
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleSyncDefaults}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              Sync Default Packages
            </button>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
            >
              Create New Plan
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPackages.map((pkg) => {
            const price = Math.round((pkg.priceInPaise || 0) / 100);
            const originalPrice = pkg.originalPriceInPaise ? Math.round(pkg.originalPriceInPaise / 100) : 0;
            const discount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
            const perDay = pkg.durationDays > 0 ? Math.round(price / pkg.durationDays) : price;
            const isBoost = pkg.campaignType === "LISTING_BOOST";
            const placements = Array.isArray(pkg.permittedPlacements) ? pkg.permittedPlacements : [];

            return (
              <div
                key={pkg.id || pkg._id}
                className={`relative rounded-3xl border transition-all bg-white shadow-xs hover:shadow-md flex flex-col justify-between overflow-hidden ${pkg.active === false
                  ? "border-slate-200 opacity-75 bg-slate-50/50"
                  : isBoost
                    ? "border-indigo-100 hover:border-indigo-300"
                    : "border-amber-100 hover:border-amber-300"
                  }`}
              >
                {/* Top Accent Ribbon */}
                <div
                  className={`h-1.5 w-full ${isBoost ? "bg-gradient-to-r from-indigo-500 to-purple-600" : "bg-gradient-to-r from-amber-500 to-orange-500"
                    }`}
                />

                {/* Card Header Top */}
                <div className="p-5 pb-4 space-y-3.5 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-full tracking-wider flex items-center gap-1 ${isBoost
                          ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                          : "bg-amber-50 text-amber-800 border border-amber-200"
                          }`}
                      >
                        {isBoost ? <Zap className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                        {isBoost ? "Listing Boost" : "Banner Ad Package"}
                      </span>

                      {pkg.badge && (
                        <span className="px-2.5 py-0.5 text-[10px] font-extrabold rounded-full bg-rose-50 text-rose-600 border border-rose-200 shadow-2xs">
                          {pkg.badge}
                        </span>
                      )}
                    </div>

                    {/* Status Toggle */}
                    <button
                      onClick={() => handleToggleStatus(pkg.id || pkg._id, pkg.name)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 transition-all ${pkg.active !== false
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                        : "bg-slate-200 text-slate-600 border border-slate-300 hover:bg-slate-300"
                        }`}
                      title={pkg.active !== false ? "Click to deactivate" : "Click to activate"}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${pkg.active !== false ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                          }`}
                      />
                      {pkg.active !== false ? "Active" : "Inactive"}
                    </button>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base font-black text-slate-900 leading-snug">{pkg.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">{pkg.description}</p>
                  </div>

                  {/* Price Block */}
                  <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-slate-900 font-mono">
                          ₹{price.toLocaleString("en-IN")}
                        </span>
                        {originalPrice > price && (
                          <span className="text-xs font-semibold text-slate-400 line-through font-mono">
                            ₹{originalPrice.toLocaleString("en-IN")}
                          </span>
                        )}
                        {discount > 0 && (
                          <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">
                            {discount}% OFF
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-medium">
                        ≈ ₹{perDay}/day · {pkg.durationDays} Days Duration
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-xl">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {pkg.durationDays} Days
                      </span>
                    </div>
                  </div>

                  {/* Estimated Reach Metric */}
                  {pkg.estimatedReach && (
                    <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/80 flex items-center justify-between text-xs">
                      <span className="text-slate-500 flex items-center gap-1.5 font-medium text-[11px]">
                        <Eye className="w-3.5 h-3.5 text-indigo-500" /> Estimated Reach
                      </span>
                      <span className="font-bold text-slate-800 text-[11px]">{pkg.estimatedReach}</span>
                    </div>
                  )}

                  {/* Feature Highlights */}
                  {Array.isArray(pkg.features) && pkg.features.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                        Included Advertiser Benefits
                      </div>
                      <div className="space-y-1">
                        {pkg.features.map((feat: string, idx: number) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                            <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span className="leading-tight text-[11px]">{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Permitted Placements */}
                  {placements.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center justify-between">
                        <span>Targeted Placement Slots ({placements.length})</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {placements.map((plc: string) => {
                          const info = ALL_AD_PLACEMENTS.find((ap) => ap.id === plc);
                          return (
                            <span
                              key={plc}
                              className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-md border border-indigo-100 flex items-center gap-1"
                              title={info?.desc || plc}
                            >
                              <span>{plc}</span>
                              {info?.page && <span className="text-[9px] text-indigo-400">({info.page})</span>}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="p-3.5 bg-slate-50/80 border-t border-slate-100 rounded-b-3xl flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(pkg)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-colors shadow-2xs"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-slate-500" /> Edit
                    </button>

                    <button
                      onClick={() => openDuplicateModal(pkg)}
                      className="p-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs transition-colors shadow-2xs"
                      title="Duplicate this plan"
                    >
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                    </button>

                    {deleteConfirmId === (pkg.id || pkg._id) ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDeletePlan(pkg.id || pkg._id, pkg.name)}
                          className="px-2.5 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition-colors shadow-2xs"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="p-1.5 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(pkg.id || pkg._id)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:text-rose-300 dark:hover:bg-rose-950/40 rounded-xl transition-colors inline-flex items-center justify-center"
                        title="Delete pricing plan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <span className="text-[10px] text-slate-400 font-mono">
                    Priority #{pkg.priority || 0}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#E2E8F0] flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  {editingPkg ? "Edit Pricing Plan" : "Create New Pricing Plan"}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Set plan rates, duration, target placement slots, and marketing features.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSavePlan} className="p-6 space-y-5 flex-1">
              {/* Type Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Plan Category & Creative Format *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, campaignType: "LISTING_BOOST" })}
                    className={`p-3.5 rounded-2xl border-2 text-left flex items-center gap-3 transition-all ${formData.campaignType === "LISTING_BOOST"
                      ? "border-indigo-600 bg-indigo-50/50 text-indigo-900 ring-1 ring-indigo-600"
                      : "border-slate-200 hover:border-slate-300"
                      }`}
                  >
                    <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">Listing Search Boost</div>
                      <div className="text-[10px] text-slate-500">Sponsored search spots & badges</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, campaignType: "BANNER_AD" })}
                    className={`p-3.5 rounded-2xl border-2 text-left flex items-center gap-3 transition-all ${formData.campaignType === "BANNER_AD"
                      ? "border-amber-600 bg-amber-50/50 text-amber-900 ring-1 ring-amber-600"
                      : "border-slate-200 hover:border-slate-300"
                      }`}
                  >
                    <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">Custom Banner Ad</div>
                      <div className="text-[10px] text-slate-500">Hero billboards & dividers</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Plan Name & Badge */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Plan Display Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. 🚀 7-Day Popular Growth Boost"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-hidden focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Marketing Badge
                  </label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="e.g. 🔥 Most Popular"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-hidden focus:border-indigo-600"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Plan Description *
                </label>
                <textarea
                  required
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Explain why advertisers should choose this plan and what visibility it provides..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-indigo-600"
                />
              </div>

              {/* Pricing & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Duration (Days) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={365}
                    required
                    value={formData.durationDays}
                    onChange={(e) => setFormData({ ...formData, durationDays: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold focus:outline-hidden focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Final Price (₹) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formData.priceRupees}
                    onChange={(e) => setFormData({ ...formData, priceRupees: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-black text-indigo-600 focus:outline-hidden focus:border-indigo-600"
                  />
                  <span className="text-[10px] text-slate-400">
                    ≈ ₹{formData.durationDays > 0 ? Math.round(formData.priceRupees / formData.durationDays) : 0}/day
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Original Price (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.originalPriceRupees}
                    onChange={(e) => setFormData({ ...formData, originalPriceRupees: Number(e.target.value) })}
                    placeholder="e.g. 399"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-indigo-600"
                  />
                  {formData.originalPriceRupees > formData.priceRupees && (
                    <span className="text-[10px] font-bold text-emerald-600">
                      {Math.round(((formData.originalPriceRupees - formData.priceRupees) / formData.originalPriceRupees) * 100)}% Discount Tag
                    </span>
                  )}
                </div>
              </div>

              {/* Estimated Reach & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Estimated Buyer Reach
                  </label>
                  <input
                    type="text"
                    value={formData.estimatedReach}
                    onChange={(e) => setFormData({ ...formData, estimatedReach: e.target.value })}
                    placeholder="e.g. 5,000 - 12,000 Local Buyers"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sort Priority (Lower = Appears First)
                  </label>
                  <input
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-indigo-600"
                  />
                </div>
              </div>

              {/* Features List */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Included Features & Benefits
                </label>
                <div className="space-y-2 mb-3">
                  {formData.features.map((feat, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="p-1 rounded-lg bg-emerald-50 text-emerald-600">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="text"
                        value={feat}
                        onChange={(e) => {
                          const updated = [...formData.features];
                          updated[index] = e.target.value;
                          setFormData({ ...formData, features: updated });
                        }}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:border-indigo-600"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(index)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Feature Input */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={formData.newFeatureText}
                    onChange={(e) => setFormData({ ...formData, newFeatureText: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddFeature();
                      }
                    }}
                    placeholder="Add a new feature (press enter or click Add)..."
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-indigo-600"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                  >
                    Add Feature
                  </button>
                </div>
              </div>

              {/* Permitted Ad Placements Multi-Select */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Targeted Ad Placements ({formData.permittedPlacements.length} Selected) *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  {ALL_AD_PLACEMENTS.map((placement) => {
                    const isSelected = formData.permittedPlacements.includes(placement.id);
                    return (
                      <div
                        key={placement.id}
                        onClick={() => handlePlacementToggle(placement.id)}
                        className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${isSelected
                          ? "bg-indigo-50/80 border-indigo-300 text-indigo-900 shadow-2xs"
                          : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
                          }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => { }}
                          className="mt-0.5 rounded text-indigo-600"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono text-[10px] font-black text-slate-900">
                              {placement.id}
                            </span>
                            <span className="text-[9px] font-semibold text-slate-500 bg-white/80 px-1 rounded">
                              {placement.page}
                            </span>
                          </div>
                          <div className="text-[11px] font-bold mt-0.5 leading-tight">{placement.label}</div>
                          <div className="text-[10px] text-slate-400 truncate mt-0.5">{placement.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <div className="text-xs font-bold text-slate-800">Plan Live Status</div>
                  <div className="text-[11px] text-slate-500">
                    When active, this plan is immediately visible in advertiser checkout flows.
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
                </label>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-end gap-3 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingPkg ? "Save Plan Changes" : "Create Pricing Plan"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
