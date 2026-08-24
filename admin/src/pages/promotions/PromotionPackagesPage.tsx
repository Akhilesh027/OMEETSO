import React, { useState, useEffect, useCallback } from "react";
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
  ShieldCheck
} from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

const ALL_PLACEMENTS = [
  { id: "HOMEPAGE_HERO", label: "Homepage Hero Carousel", desc: "Top billboard spot on mobile & desktop homepage" },
  { id: "SEARCH_TOP", label: "Search Top Results", desc: "Guaranteed #1-3 priority in user search results" },
  { id: "CATEGORY_FEATURED", label: "Category Featured Grid", desc: "Top row spotlight in category browsing" },
  { id: "CATEGORY_HEADER", label: "Category Header Banner", desc: "Billboard header banner above category listings" },
  { id: "HIGHLIGHTED_CARD", label: "Highlighted Card Border", desc: "Golden glow and enlarged image card format" },
  { id: "URGENT_BADGE", label: "Urgent Sale Red Badge", desc: "Eye-catching pulsing red badge for fast selling" },
  { id: "STORE_BANNER", label: "Store Spotlight Banner", desc: "Dedicated merchant showcase banner slot" }
];

export default function PromotionPackagesPage() {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"ALL" | "LISTING_BOOST" | "BANNER_AD" | "ACTIVE" | "INACTIVE">("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

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

  const openCreateModal = () => {
    setEditingPkg(null);
    setFormData({
      name: "",
      description: "",
      campaignType: "LISTING_BOOST",
      durationDays: 7,
      priceRupees: 199,
      originalPriceRupees: 299,
      badge: "⚡ New Plan",
      estimatedReach: "3,000 - 8,000 Local Buyers",
      features: ["Featured Card Placement", "Priority Buyer Inquiries"],
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
      features: Array.isArray(pkg.features) && pkg.features.length > 0 ? pkg.features : [],
      permittedPlacements: Array.isArray(pkg.permittedPlacements) ? pkg.permittedPlacements : [],
      priority: pkg.priority || 0,
      active: pkg.active !== false
    });
    setIsModalOpen(true);
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

  const filteredPackages = packages.filter((pkg) => {
    if (activeFilter === "LISTING_BOOST") return pkg.campaignType === "LISTING_BOOST";
    if (activeFilter === "BANNER_AD") return pkg.campaignType === "BANNER_AD";
    if (activeFilter === "ACTIVE") return pkg.active !== false;
    if (activeFilter === "INACTIVE") return pkg.active === false;
    return true;
  });

  const boostCount = packages.filter((p) => p.campaignType === "LISTING_BOOST").length;
  const bannerCount = packages.filter((p) => p.campaignType === "BANNER_AD").length;
  const activeCount = packages.filter((p) => p.active !== false).length;

  return (
    <PageContainer>
      <PageHeader
        title="Promotions & Monetization Plans"
        description="Configure, price, and manage high-converting Boost Plans and Custom Banner Packages for sellers and local merchants."
        badge={`${packages.length} Pricing Plans`}
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
          <button
            onClick={loadPackages}
            className="p-2.5 bg-white border border-[#E2E8F0] hover:bg-slate-50 text-slate-700 rounded-xl transition-colors shadow-xs"
            title="Refresh packages"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        }
      />

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4.5 shadow-xs flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-indigo-50 text-indigo-600 grid place-items-center shrink-0">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{packages.length}</div>
            <div className="text-xs font-semibold text-slate-500">Total Plans</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4.5 shadow-xs flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-blue-50 text-blue-600 grid place-items-center shrink-0">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{boostCount}</div>
            <div className="text-xs font-semibold text-slate-500">Listing Boosts</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4.5 shadow-xs flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-amber-50 text-amber-600 grid place-items-center shrink-0">
            <ImageIcon className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{bannerCount}</div>
            <div className="text-xs font-semibold text-slate-500">Banner Packages</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4.5 shadow-xs flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-600 grid place-items-center shrink-0">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{activeCount}</div>
            <div className="text-xs font-semibold text-slate-500">Live Active</div>
          </div>
        </div>
      </div>

      {/* Navigation Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-6 pb-2 border-b border-[#E2E8F0]">
        {[
          { id: "ALL", label: `All Plans (${packages.length})` },
          { id: "LISTING_BOOST", label: `⚡ Listing Boosts (${boostCount})` },
          { id: "BANNER_AD", label: `🎨 Banner Packages (${bannerCount})` },
          { id: "ACTIVE", label: `Active Live (${activeCount})` },
          { id: "INACTIVE", label: `Inactive (${packages.length - activeCount})` }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeFilter === tab.id
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white border border-[#E2E8F0] text-slate-600 hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Packages Grid */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 bg-white rounded-2xl border border-[#E2E8F0]">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-indigo-600" />
          <p className="text-sm font-semibold text-slate-600">Loading pricing plans from MongoDB...</p>
        </div>
      ) : filteredPackages.length === 0 ? (
        <div className="p-16 text-center text-slate-400 bg-white rounded-2xl border border-[#E2E8F0] space-y-3">
          <Tag className="w-10 h-10 mx-auto text-slate-300" />
          <div className="text-base font-bold text-slate-700">No Plans in this Category</div>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            There are currently no pricing plans matching this filter. Click the button below to create one.
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors shadow-xs"
          >
            <PackagePlus className="w-4 h-4" /> Create New Plan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPackages.map((pkg) => {
            const price = Math.round((pkg.priceInPaise || 0) / 100);
            const originalPrice = pkg.originalPriceInPaise ? Math.round(pkg.originalPriceInPaise / 100) : 0;
            const discount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
            const perDay = pkg.durationDays > 0 ? Math.round(price / pkg.durationDays) : price;
            const isBoost = pkg.campaignType === "LISTING_BOOST";

            return (
              <div
                key={pkg.id || pkg._id}
                className={`relative rounded-2xl border transition-all bg-white shadow-xs hover:shadow-md flex flex-col justify-between ${
                  pkg.active === false
                    ? "border-slate-200 opacity-70 bg-slate-50/50"
                    : isBoost
                    ? "border-indigo-100 hover:border-indigo-300"
                    : "border-amber-100 hover:border-amber-300"
                }`}
              >
                {/* Card Header Top */}
                <div className="p-5 pb-4 space-y-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-full tracking-wider flex items-center gap-1 ${
                          isBoost
                            ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                            : "bg-amber-100 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {isBoost ? <Zap className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                        {isBoost ? "Listing Boost" : "Banner Package"}
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
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 transition-all ${
                        pkg.active !== false
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                          : "bg-slate-200 text-slate-600 border border-slate-300 hover:bg-slate-300"
                      }`}
                      title={pkg.active !== false ? "Click to deactivate" : "Click to activate"}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          pkg.active !== false ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
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
                        <span className="text-2xl font-black text-slate-900">
                          ₹{price.toLocaleString("en-IN")}
                        </span>
                        {originalPrice > price && (
                          <span className="text-xs font-semibold text-slate-400 line-through">
                            ₹{originalPrice.toLocaleString("en-IN")}
                          </span>
                        )}
                        {discount > 0 && (
                          <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            {discount}% OFF
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-medium">
                        ≈ ₹{perDay}/day · {pkg.durationDays} Days Duration
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
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
                        Included Features
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
                  {Array.isArray(pkg.permittedPlacements) && pkg.permittedPlacements.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                        Active Placements ({pkg.permittedPlacements.length})
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {pkg.permittedPlacements.map((plc: string) => (
                          <span
                            key={plc}
                            className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-semibold rounded-md border border-indigo-100"
                          >
                            {plc}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="p-3.5 bg-slate-50/80 border-t border-slate-100 rounded-b-2xl flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(pkg)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-colors shadow-2xs"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-slate-500" /> Edit
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
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                        title="Delete pricing plan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <span className="text-[10px] text-slate-400 font-mono">
                    Priority: {pkg.priority || 0}
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
                  Set plan pricing, duration, placement rules, and marketing badges.
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
                  Plan Category & Type *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, campaignType: "LISTING_BOOST" })}
                    className={`p-3.5 rounded-2xl border-2 text-left flex items-center gap-3 transition-all ${
                      formData.campaignType === "LISTING_BOOST"
                        ? "border-indigo-600 bg-indigo-50/50 text-indigo-900 ring-1 ring-indigo-600"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">Listing Search Boost</div>
                      <div className="text-[10px] text-slate-500">Sponsored badges & top ranks</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, campaignType: "BANNER_AD" })}
                    className={`p-3.5 rounded-2xl border-2 text-left flex items-center gap-3 transition-all ${
                      formData.campaignType === "BANNER_AD"
                        ? "border-amber-600 bg-amber-50/50 text-amber-900 ring-1 ring-amber-600"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">Custom Banner Ad</div>
                      <div className="text-[10px] text-slate-500">Hero carousels & billboards</div>
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
                  placeholder="Summarize the core benefits and who this plan is ideal for..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-indigo-600"
                />
              </div>

              {/* Pricing & Duration */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.priceRupees}
                    onChange={(e) => setFormData({ ...formData, priceRupees: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-black text-slate-900 focus:outline-hidden focus:border-indigo-600"
                  />
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
                    placeholder="For strikethrough"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-hidden focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Duration (Days) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.durationDays}
                    onChange={(e) => setFormData({ ...formData, durationDays: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-hidden focus:border-indigo-600"
                  />
                </div>
              </div>

              {/* Estimated Reach & Sort Priority */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Estimated Buyer Reach
                  </label>
                  <input
                    type="text"
                    value={formData.estimatedReach}
                    onChange={(e) => setFormData({ ...formData, estimatedReach: e.target.value })}
                    placeholder="e.g. 5,000 - 12,000 Local Shoppers"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sort Priority (0 = Default)
                  </label>
                  <input
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-indigo-600"
                  />
                </div>
              </div>

              {/* Features List */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Bullet Features (One per line)
                </label>
                <textarea
                  rows={4}
                  value={formData.features.join("\n")}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value.split("\n") })}
                  placeholder="#1 Top Rank on Search Results&#10;SPONSORED Golden Badge&#10;5× More Buyer Calls & Offers"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-hidden focus:border-indigo-600"
                />
                <p className="text-[10px] text-slate-400 mt-1">Each line will appear as a verified checkmark benefit on the card.</p>
              </div>

              {/* Permitted Placements Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Permitted Ad Placement Slots *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border border-slate-200 rounded-2xl bg-slate-50/50">
                  {ALL_PLACEMENTS.map((plc) => {
                    const checked = formData.permittedPlacements.includes(plc.id);
                    return (
                      <div
                        key={plc.id}
                        onClick={() => handlePlacementToggle(plc.id)}
                        className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                          checked
                            ? "bg-indigo-50/80 border-indigo-300 text-indigo-950"
                            : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-md mt-0.5 flex items-center justify-center text-white text-[10px] font-bold ${
                            checked ? "bg-indigo-600" : "border border-slate-300"
                          }`}
                        >
                          {checked && <Check className="w-3 h-3" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold">{plc.label}</div>
                          <div className="text-[10px] text-slate-400 truncate">{plc.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <div className="text-xs font-bold text-slate-800">Plan Status</div>
                  <div className="text-[11px] text-slate-500">When enabled, sellers can purchase this package.</div>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, active: !formData.active })}
                  className={`px-4 py-1.5 rounded-full text-xs font-extrabold transition-colors ${
                    formData.active
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-300 text-slate-700"
                  }`}
                >
                  {formData.active ? "Enabled" : "Disabled"}
                </button>
              </div>

              {/* Modal Actions Footer */}
              <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-end gap-3 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editingPkg ? "Save Changes" : "Create Pricing Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
