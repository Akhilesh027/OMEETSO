import React, { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import {
  getAdminAdPlacementsApi,
  createAdminAdPlacementApi,
  updateAdminAdPlacementApi,
  deleteAdminAdPlacementApi
} from "@/api/adminAds.api";
import { getFrontendBaseUrl } from "@/config/api";
import {
  Layers,
  PlusCircle,
  Edit2,
  Trash2,
  CheckCircle,
  Loader2,
  RefreshCw,
  Maximize2,
  Users,
  Sparkles,
  Image as ImageIcon,
  Zap,
  MapPin,
  Clock,
  ShieldCheck,
  ExternalLink,
  Globe,
  Smartphone,
  Layout,
  Tag,
  DollarSign,
  PackageCheck,
  ArrowRight,
  TrendingUp,
  Check,
  X,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

type SurfaceFilter = "ALL" | "HOMEPAGE" | "CATEGORY" | "SEARCH" | "STORES_JOBS" | "PRODUCT_DETAILS";
type FormatFilter = "ALL" | "BANNER_AD" | "LISTING_BOOST" | "HAS_PLANS" | "OCCUPIED" | "AVAILABLE";

const PRESET_PLACEMENTS = [
  {
    placementId: "HOMEPAGE_HERO",
    name: "Home Page Banners",
    campaignTypes: ["BANNER_AD"],
    aspectRatio: "16:9",
    pageLocation: "Homepage",
    routePath: "/",
    positionDesc: "Main Hero Showcase Slider",
    maximumActiveSlots: 10,
    deviceTarget: "Web & Mobile App",
    active: true,
  },
  {
    placementId: "CATEGORY_HEADER",
    name: "Category Page Header Banners",
    campaignTypes: ["BANNER_AD"],
    aspectRatio: "3:1",
    pageLocation: "Category Browse",
    routePath: "/category/all",
    positionDesc: "Header Billboard Banner above listings",
    maximumActiveSlots: 8,
    deviceTarget: "Web & Mobile App",
    active: true,
  },
  {
    placementId: "SEARCH_TOP",
    name: "Search Results Priority Spots",
    campaignTypes: ["LISTING_BOOST"],
    aspectRatio: "1:1",
    pageLocation: "Search Results",
    routePath: "/results",
    positionDesc: "Guaranteed top 1-3 ranking spots in search",
    maximumActiveSlots: 15,
    deviceTarget: "Web & Mobile App",
    active: true,
  },
  {
    placementId: "STORE_BANNER",
    name: "Store Directory Billboard",
    campaignTypes: ["BANNER_AD"],
    aspectRatio: "3:1",
    pageLocation: "Stores Directory",
    routePath: "/stores",
    positionDesc: "Showroom billboard header",
    maximumActiveSlots: 6,
    deviceTarget: "Web & Mobile App",
    active: true,
  }
];

export default function AdPlacementsPage() {
  const [placements, setPlacements] = useState<any[]>(PRESET_PLACEMENTS);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [surfaceFilter, setSurfaceFilter] = useState<SurfaceFilter>("ALL");
  const [formatFilter, setFormatFilter] = useState<FormatFilter>("ALL");

  // Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [placementId, setPlacementId] = useState("");
  const [name, setName] = useState("");
  const [campaignType, setCampaignType] = useState<"BANNER_AD" | "LISTING_BOOST">("BANNER_AD");
  const [aspectRatio, setAspectRatio] = useState("3:1");
  const [minimumWidth, setMinimumWidth] = useState("1200");
  const [minimumHeight, setMinimumHeight] = useState("400");
  const [maximumFileSizeBytes, setMaximumFileSizeBytes] = useState("2097152");
  const [maximumActiveSlots, setMaximumActiveSlots] = useState("10");
  const [pageLocation, setPageLocation] = useState("Homepage");
  const [routePath, setRoutePath] = useState("/");
  const [positionDesc, setPositionDesc] = useState("Section Divider");
  const [description, setDescription] = useState("");
  const [deviceTarget, setDeviceTarget] = useState("Web & Mobile App");
  const [baseCPM, setBaseCPM] = useState("100");
  const [baseDailyRate, setBaseDailyRate] = useState("299");

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editId, setEditId] = useState("");
  const [editPlacementId, setEditPlacementId] = useState("");
  const [editName, setEditName] = useState("");
  const [editCampaignType, setEditCampaignType] = useState<"BANNER_AD" | "LISTING_BOOST">("BANNER_AD");
  const [editAspectRatio, setEditAspectRatio] = useState("16:9");
  const [editMinimumWidth, setEditMinimumWidth] = useState("1600");
  const [editMinimumHeight, setEditMinimumHeight] = useState("900");
  const [editMaximumFileSizeBytes, setEditMaximumFileSizeBytes] = useState("3145728");
  const [editMaximumActiveSlots, setEditMaximumActiveSlots] = useState("5");
  const [editPageLocation, setEditPageLocation] = useState("Homepage");
  const [editRoutePath, setEditRoutePath] = useState("/");
  const [editPositionDesc, setEditPositionDesc] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDeviceTarget, setEditDeviceTarget] = useState("Web & Mobile App");
  const [editBaseCPM, setEditBaseCPM] = useState("100");
  const [editBaseDailyRate, setEditBaseDailyRate] = useState("299");
  const [editActive, setEditActive] = useState(true);

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const { showSuccess, showError } = useToast();

  const loadPlacements = useCallback(async () => {
    const res = await getAdminAdPlacementsApi();
    if (res.success && Array.isArray(res.data) && res.data.length > 0) {
      setPlacements(res.data);
    }
  }, []);

  useEffect(() => {
    loadPlacements();
  }, [loadPlacements]);

  const handleCreatePlacement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!placementId.trim() || !name.trim()) return;

    setActionLoading(true);
    const res = await createAdminAdPlacementApi({
      placementId: placementId.trim().toUpperCase().replace(/\s+/g, "_"),
      name: name.trim(),
      campaignTypes: [campaignType],
      aspectRatio,
      minimumWidth: Number(minimumWidth),
      minimumHeight: Number(minimumHeight),
      maximumFileSizeBytes: Number(maximumFileSizeBytes),
      maximumActiveSlots: Number(maximumActiveSlots),
      page: pageLocation,
      route: routePath,
      position: positionDesc,
      description,
      device: deviceTarget,
      baseCPM: Number(baseCPM),
      baseDailyRate: Number(baseDailyRate)
    });
    setActionLoading(false);

    if (res.success) {
      showSuccess("Placement Slot Created", `Created slot ${name} (${placementId.toUpperCase()}).`);
      setIsAddModalOpen(false);
      setPlacementId("");
      setName("");
      setDescription("");
      loadPlacements();
    } else {
      showError("Creation Failed", res.error);
    }
  };

  const openEditModal = (p: any) => {
    setEditId(p.id || p._id);
    setEditPlacementId(p.placementId);
    setEditName(p.name);
    setEditCampaignType(p.campaignTypes?.includes("BANNER_AD") ? "BANNER_AD" : "LISTING_BOOST");
    setEditAspectRatio(p.aspectRatio || "16:9");
    setEditMinimumWidth(String(p.minimumWidth || 1600));
    setEditMinimumHeight(String(p.minimumHeight || 900));
    setEditMaximumFileSizeBytes(String(p.maximumFileSizeBytes || 3145728));
    setEditMaximumActiveSlots(String(p.maximumActiveSlots || 5));
    setEditPageLocation(p.page || "Homepage");
    setEditRoutePath(p.route || "/");
    setEditPositionDesc(p.position || "Standard Placement");
    setEditDescription(p.description || "");
    setEditDeviceTarget(p.device || "Web & Mobile App");
    setEditBaseCPM(String(p.baseCPM || 100));
    setEditBaseDailyRate(String(p.baseDailyRate || 299));
    setEditActive(p.active !== false);
    setIsEditModalOpen(true);
  };

  const handleUpdatePlacement = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    const res = await updateAdminAdPlacementApi(editId, {
      name: editName.trim(),
      aspectRatio: editAspectRatio,
      campaignTypes: [editCampaignType],
      minimumWidth: Number(editMinimumWidth),
      minimumHeight: Number(editMinimumHeight),
      maximumFileSizeBytes: Number(editMaximumFileSizeBytes),
      maximumActiveSlots: Number(editMaximumActiveSlots),
      page: editPageLocation,
      route: editRoutePath,
      position: editPositionDesc,
      description: editDescription,
      device: editDeviceTarget,
      baseCPM: Number(editBaseCPM),
      baseDailyRate: Number(editBaseDailyRate),
      active: editActive
    });
    setActionLoading(false);

    if (res.success) {
      showSuccess("Placement Updated", `Successfully updated ${editName}.`);
      setIsEditModalOpen(false);
      loadPlacements();
    } else {
      showError("Update Failed", res.error);
    }
  };

  const handleDeletePlacement = async (id: string, name: string) => {
    setActionLoading(true);
    const res = await deleteAdminAdPlacementApi(id);
    setActionLoading(false);
    setDeleteConfirmId(null);
    if (res.success) {
      showSuccess("Placement Deleted", `Removed slot spec ${name}.`);
      loadPlacements();
    } else {
      showError("Delete Failed", res.error);
    }
  };

  const filteredPlacements = placements.filter((p) => {
    // 1. Surface filter
    if (surfaceFilter === "HOMEPAGE") {
      if (!p.placementId.includes("HOME")) return false;
    } else if (surfaceFilter === "CATEGORY") {
      if (!p.placementId.includes("CATEGORY")) return false;
    } else if (surfaceFilter === "SEARCH") {
      if (!p.placementId.includes("SEARCH")) return false;
    } else if (surfaceFilter === "STORES_JOBS") {
      if (!p.placementId.includes("STORE") && !p.placementId.includes("JOB")) return false;
    } else if (surfaceFilter === "PRODUCT_DETAILS") {
      if (!p.placementId.includes("BADGE") && !p.placementId.includes("HIGHLIGHTED")) return false;
    }

    // 2. Format filter
    if (formatFilter === "BANNER_AD") return p.campaignTypes?.includes("BANNER_AD");
    if (formatFilter === "LISTING_BOOST") return p.campaignTypes?.includes("LISTING_BOOST");
    if (formatFilter === "HAS_PLANS") return (p.pricingPlans || []).length > 0;
    if (formatFilter === "OCCUPIED") return (p.bookedSlotsCount || 0) > 0;
    if (formatFilter === "AVAILABLE") return (p.bookedSlotsCount || 0) < (p.maximumActiveSlots || 5);

    return true;
  });

  const totalSlotsCapacity = placements.reduce((acc, p) => acc + (p.maximumActiveSlots || 0), 0);
  const totalBookedAds = placements.reduce((acc, p) => acc + (p.bookedSlotsCount || 0), 0);
  const totalPendingAds = placements.reduce((acc, p) => acc + (p.pendingReviewSlotsCount || 0), 0);

  // Helper to get site URL for a route
  const getLiveUrl = (route?: string) => {
    const base = getFrontendBaseUrl();
    if (!route || route === "/") return base;
    if (route.includes(":id") || route.includes("/all")) return `${base}/category/electronics`;
    if (route.includes("detail")) return `${base}/results`;
    return `${base}${route}`;
  };

  return (
    <PageContainer>
      <PageHeader
        title="Ad Placements & Pricing Plans"
        description="Monitor all ad billboard slots, section divider banners, native feed cards, and search boost surfaces with real-time advertiser pricing packages, CPM rates, and rotation capacity."
        badge={`${placements.length} Live Surfaces Configured`}
        badgeColor="indigo"
        primaryAction={
          <div className="flex items-center gap-2">
            <a
              href="/admin/promotions/packages"
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#E2E8F0] hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <Tag className="w-3.5 h-3.5 text-indigo-600" />
              <span>Pricing Packages</span>
            </a>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <PlusCircle className="w-4 h-4" /> Add Placement Slot
            </button>
          </div>
        }
        secondaryActions={
          <button
            onClick={loadPlacements}
            className="p-2.5 bg-white border border-[#E2E8F0] hover:bg-slate-50 text-slate-700 rounded-xl transition-colors shadow-xs"
            title="Refresh placements"
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
            <div className="text-2xl font-black text-slate-900">{placements.length}</div>
            <div className="text-xs font-semibold text-slate-500">Total Placement Surfaces</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4.5 shadow-xs flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-600 grid place-items-center shrink-0">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{totalBookedAds}</div>
            <div className="text-xs font-semibold text-slate-500">Paid Active Campaigns</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4.5 shadow-xs flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-amber-50 text-amber-600 grid place-items-center shrink-0">
            <Tag className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">15 Plans</div>
            <div className="text-xs font-semibold text-slate-500">Active Pricing Plans</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4.5 shadow-xs flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-blue-50 text-blue-600 grid place-items-center shrink-0">
            <Maximize2 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{totalSlotsCapacity}</div>
            <div className="text-xs font-semibold text-slate-500">Max Rotation Capacity</div>
          </div>
        </div>
      </div>

      {/* Platform Zero Blank Banner Guarantee Banner */}
      <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 grid place-items-center shrink-0 text-indigo-300">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <span>Platform Fallback Shield: 100% Active</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500 text-white">
                Zero Empty Spaces
              </span>
            </div>
            <p className="text-xs text-slate-300">
              When an advertiser slot is open or unbooked, the platform automatically serves from rotating high-converting default banners. Ads run seamlessly across home page banners, category headers, and directories.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <a
            href="/admin/promotions/packages"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs"
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Pricing Plans</span>
          </a>
          <a
            href={getFrontendBaseUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/10 transition-all"
          >
            <span>Live Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Surface Category Filter Tabs */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[#E2E8F0]">
          {[
            { id: "ALL", label: `All Surfaces (${placements.length})` },
            { id: "HOMEPAGE", label: `🏠 Homepage Banners` },
            { id: "CATEGORY", label: `📁 Category Browse & Header` },
            { id: "SEARCH", label: `🔍 Search Results (#1-3 Spots)` },
            { id: "STORES_JOBS", label: `🏬 Stores & Jobs Portal` },
            { id: "PRODUCT_DETAILS", label: `✨ Badges & Highlights` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSurfaceFilter(tab.id as SurfaceFilter)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                surfaceFilter === tab.id
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white border border-[#E2E8F0] text-slate-600 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Format Filter Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Filter By:</span>
          {[
            { id: "ALL", label: "All Formats" },
            { id: "BANNER_AD", label: "🎨 Banners (16:9 / 3:1)" },
            { id: "LISTING_BOOST", label: "⚡ Sponsored Cards & Badges" },
            { id: "HAS_PLANS", label: "🏷️ Has Pricing Plans" },
            { id: "OCCUPIED", label: `Active Campaigns (${placements.filter((p) => (p.bookedSlotsCount || 0) > 0).length})` },
            { id: "AVAILABLE", label: "Has Available Rotations" }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFormatFilter(f.id as FormatFilter)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                formatFilter === f.id
                  ? "bg-indigo-600 text-white shadow-2xs font-bold"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Placements Grid */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 bg-white rounded-2xl border border-[#E2E8F0]">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-indigo-600" />
          <p className="text-sm font-semibold text-slate-600">Loading placement specifications and active ads...</p>
        </div>
      ) : filteredPlacements.length === 0 ? (
        <div className="p-16 text-center text-slate-400 bg-white rounded-2xl border border-[#E2E8F0] space-y-3">
          <Layers className="w-10 h-10 mx-auto text-slate-300" />
          <div className="text-base font-bold text-slate-700">No Placements Found</div>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            There are no placement specifications matching the selected filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPlacements.map((p) => {
            const booked = p.bookedSlotsCount || 0;
            const maxSlots = p.maximumActiveSlots || 5;
            const occupancyPct = Math.min(100, Math.round((booked / maxSlots) * 100));
            const isBanner = p.campaignTypes?.includes("BANNER_AD");
            const bookedCampaigns = Array.isArray(p.bookedCampaigns) ? p.bookedCampaigns : [];
            const pricingPlans = Array.isArray(p.pricingPlans) ? p.pricingPlans : [];
            const liveUrl = getLiveUrl(p.route);

            return (
              <div
                key={p.id || p._id}
                className="bg-white rounded-3xl border border-[#E2E8F0] shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
              >
                {/* Placement Header */}
                <div className="p-5 pb-4 space-y-3.5 border-b border-slate-100 bg-slate-50/40">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-slate-900 text-white shadow-2xs">
                        {p.placementId}
                      </span>
                      <span
                        className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                          isBanner
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : "bg-indigo-100 text-indigo-700 border border-indigo-200"
                        }`}
                      >
                        {isBanner ? "🎨 Banner Ad Slot" : "⚡ Sponsored Card / Boost"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <a
                        href={liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-100 text-indigo-600 rounded-xl text-xs font-bold transition-colors shadow-2xs"
                        title={`View live on ${p.route || "/"}`}
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Live View</span>
                      </a>

                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs transition-colors shadow-2xs"
                        title="Edit slot specs"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {deleteConfirmId === (p.id || p._id) ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDeletePlacement(p.id || p._id, p.name)}
                            className="px-2.5 py-1 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="p-1 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(p.id || p._id)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:text-rose-300 dark:hover:bg-rose-950/40 rounded-xl transition-colors inline-flex items-center justify-center"
                          title="Delete slot spec"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Surface Location Tag & Page */}
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className="flex items-center gap-1 font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100">
                      <Layout className="w-3 h-3" /> Page: {p.page || "Homepage"}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">
                      <Globe className="w-3 h-3 text-slate-400" /> {p.route || "/"}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg text-[11px]">
                      <Smartphone className="w-3 h-3 text-slate-400" /> {p.device || "Web & Mobile App"}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-black text-slate-900">{p.name}</h3>
                    <div className="text-xs font-semibold text-indigo-600 mt-0.5">
                      📌 Position: {p.position || "Standard Surface Placement"}
                    </div>
                    {p.description && (
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {p.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-2 flex-wrap">
                      <span className="flex items-center gap-1 font-semibold">
                        <Maximize2 className="w-3.5 h-3.5 text-indigo-500" /> Ratio: <strong>{p.aspectRatio}</strong>
                      </span>
                      <span>·</span>
                      <span>Min: <strong>{p.minimumWidth}×{p.minimumHeight}px</strong></span>
                      <span>·</span>
                      <span>Max File: <strong>{Math.round((p.maximumFileSizeBytes || 2097152) / (1024 * 1024))} MB</strong></span>
                    </div>
                  </div>

                  {/* Pricing Rates Bar */}
                  <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-2xl flex items-center justify-between flex-wrap gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-emerald-500 text-white grid place-items-center shrink-0">
                        <DollarSign className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-black text-slate-900">
                          Starting From <span className="text-emerald-700">₹{p.startingPrice || 199}</span>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Base CPM: ₹{p.baseCPM || 100} / 1k views · Base Daily: ₹{p.baseDailyRate || 299}/day
                        </div>
                      </div>
                    </div>

                    <a
                      href="/admin/promotions/packages"
                      className="px-2.5 py-1 rounded-xl bg-white border border-emerald-200 text-emerald-800 text-[11px] font-bold hover:bg-emerald-100/60 transition-colors flex items-center gap-1 shadow-2xs"
                    >
                      <Tag className="w-3 h-3 text-emerald-600" />
                      <span>{pricingPlans.length} Plans Available</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </a>
                  </div>

                  {/* Available Pricing Plans for this Placement */}
                  {pricingPlans.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                        <PackageCheck className="w-3 h-3 text-indigo-600" />
                        <span>Advertiser Pricing Packages for this Slot:</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {pricingPlans.map((plan: any) => (
                          <div
                            key={plan.id}
                            className="p-2 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between gap-1 text-[11px]"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-slate-800 truncate">{plan.name}</div>
                              <div className="text-[10px] text-slate-400">{plan.durationDays} Days · {plan.estimatedReach || "Verified Reach"}</div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="font-bold text-indigo-600 font-mono">₹{plan.priceInRupees}</div>
                              {plan.originalPriceInRupees && (
                                <div className="text-[9px] text-slate-400 line-through font-mono">₹{plan.originalPriceInRupees}</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Occupancy Utilization Bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-500" /> Paid Advertiser Capacity:
                      </span>
                      <span className="font-mono text-xs font-black">
                        <span className={booked > 0 ? "text-emerald-600" : "text-slate-400"}>{booked}</span> / {maxSlots} Rotations ({occupancyPct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          occupancyPct >= 100
                            ? "bg-rose-500"
                            : occupancyPct >= 60
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                        style={{ width: `${occupancyPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Live / Booked Ads Running in this Slot */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Live Advertiser Campaigns ({bookedCampaigns.length})
                    </span>
                    {p.pendingReviewSlotsCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200">
                        {p.pendingReviewSlotsCount} In Review
                      </span>
                    )}
                  </div>

                  {bookedCampaigns.length === 0 ? (
                    <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Platform Rotating Banner Active</span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          AUTO-ROTATING
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        0 paid advertiser campaigns currently booked. The platform is serving high-converting default banners from the rotating creative suite. 100% capacity open for new advertisers.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                      {bookedCampaigns.map((ad: any) => (
                        <div
                          key={ad.campaignId}
                          className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-indigo-300 transition-all flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Ad Thumbnail */}
                            <div className="relative h-12 w-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                              {ad.bannerUrl || ad.listingImage ? (
                                <img
                                  src={ad.bannerUrl || ad.listingImage}
                                  alt={ad.listingTitle}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full grid place-items-center text-slate-400">
                                  <ImageIcon className="w-4 h-4" />
                                </div>
                              )}
                            </div>

                            <div className="min-w-0 flex-1 space-y-0.5">
                              <h5 className="text-xs font-bold text-slate-900 truncate leading-snug">
                                {ad.listingTitle}
                              </h5>
                              <div className="text-[11px] text-slate-500 truncate flex items-center gap-1.5">
                                <span>{ad.advertiserName}</span>
                                <span>·</span>
                                <span className="flex items-center gap-0.5 text-slate-400">
                                  <MapPin className="w-2.5 h-2.5" /> {ad.city}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                👁️ {ad.impressionsCount} views · 🖱️ {ad.clicksCount} clicks
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0 space-y-1">
                            <span
                              className={`inline-block px-2 py-0.5 text-[9px] font-black uppercase rounded-full ${
                                ad.status === "ACTIVE"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}
                            >
                              {ad.status}
                            </span>
                            <div className="text-[11px] font-bold text-slate-800">
                              ₹{((ad.totalInPaise || 0) / 100).toLocaleString("en-IN")}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE PLACEMENT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-2xl max-w-lg w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Add New Placement Slot</h3>
                <p className="text-xs text-slate-500">Define a new banner billboard, section divider, or boost surface with pricing.</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlacement} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Placement Code ID *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HOMEPAGE_BANNER"
                  value={placementId}
                  onChange={(e) => setPlacementId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono font-bold focus:outline-hidden focus:border-indigo-600 uppercase"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Display Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Home Page Banners"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold focus:outline-hidden focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Page Surface</label>
                  <select
                    value={pageLocation}
                    onChange={(e) => setPageLocation(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-bold focus:outline-hidden"
                  >
                    <option value="Homepage">Homepage</option>
                    <option value="Category Browse">Category Browse</option>
                    <option value="Search Results">Search Results</option>
                    <option value="Stores Directory & Showrooms">Stores Directory</option>
                    <option value="Jobs Portal">Jobs Portal</option>
                    <option value="Product Details">Product Details</option>
                    <option value="All Feeds & Search Results">All Feeds & Global</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Route Path</label>
                  <input
                    type="text"
                    value={routePath}
                    onChange={(e) => setRoutePath(e.target.value)}
                    placeholder="e.g. /, /category/all, /results"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-mono font-bold focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Position on Page</label>
                <input
                  type="text"
                  value={positionDesc}
                  onChange={(e) => setPositionDesc(e.target.value)}
                  placeholder="e.g. Section Dividers (Between 10 Sections)"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-semibold focus:outline-hidden"
                />
              </div>

              {/* Pricing Rates */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Base CPM (₹/1k views)</label>
                  <input
                    type="number"
                    value={baseCPM}
                    onChange={(e) => setBaseCPM(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Base Daily Rate (₹/day)</label>
                  <input
                    type="number"
                    value={baseDailyRate}
                    onChange={(e) => setBaseDailyRate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Placement Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Where and how does this ad run on the user-facing app?"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-normal focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Campaign Type</label>
                  <select
                    value={campaignType}
                    onChange={(e) => setCampaignType(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-bold focus:outline-hidden"
                  >
                    <option value="BANNER_AD">🎨 Custom Banner Ad</option>
                    <option value="LISTING_BOOST">⚡ Listing Search Boost</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Aspect Ratio</label>
                  <input
                    type="text"
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value)}
                    placeholder="16:9, 3:1, CARD, BADGE"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-bold focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Min Width (px)</label>
                  <input
                    type="number"
                    value={minimumWidth}
                    onChange={(e) => setMinimumWidth(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Min Height (px)</label>
                  <input
                    type="number"
                    value={minimumHeight}
                    onChange={(e) => setMinimumHeight(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Max Active Slots</label>
                  <input
                    type="number"
                    value={maximumActiveSlots}
                    onChange={(e) => setMaximumActiveSlots(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all"
                >
                  {actionLoading ? "Creating..." : "Save Placement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PLACEMENT MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-2xl max-w-lg w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Edit Placement Slot Specs & Pricing</h3>
                <p className="text-xs text-slate-500 font-mono">{editPlacementId}</p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdatePlacement} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Display Name *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold focus:outline-hidden focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Page Surface</label>
                  <select
                    value={editPageLocation}
                    onChange={(e) => setEditPageLocation(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-bold focus:outline-hidden"
                  >
                    <option value="Homepage">Homepage</option>
                    <option value="Category Browse">Category Browse</option>
                    <option value="Search Results">Search Results</option>
                    <option value="Stores Directory & Showrooms">Stores Directory</option>
                    <option value="Jobs Portal">Jobs Portal</option>
                    <option value="Product Details">Product Details</option>
                    <option value="All Feeds & Search Results">All Feeds & Global</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Route Path</label>
                  <input
                    type="text"
                    value={editRoutePath}
                    onChange={(e) => setEditRoutePath(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Position on Page</label>
                <input
                  type="text"
                  value={editPositionDesc}
                  onChange={(e) => setEditPositionDesc(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-semibold"
                />
              </div>

              {/* Pricing Rates */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Base CPM (₹/1k views)</label>
                  <input
                    type="number"
                    value={editBaseCPM}
                    onChange={(e) => setEditBaseCPM(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Base Daily Rate (₹/day)</label>
                  <input
                    type="number"
                    value={editBaseDailyRate}
                    onChange={(e) => setEditBaseDailyRate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Placement Description</label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-normal"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Aspect Ratio</label>
                  <input
                    type="text"
                    value={editAspectRatio}
                    onChange={(e) => setEditAspectRatio(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Max Active Slots</label>
                  <input
                    type="number"
                    value={editMaximumActiveSlots}
                    onChange={(e) => setEditMaximumActiveSlots(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Min Width (px)</label>
                  <input
                    type="number"
                    value={editMinimumWidth}
                    onChange={(e) => setEditMinimumWidth(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Min Height (px)</label>
                  <input
                    type="number"
                    value={editMinimumHeight}
                    onChange={(e) => setEditMinimumHeight(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="font-bold text-slate-800">Placement Slot Active</span>
                <button
                  type="button"
                  onClick={() => setEditActive(!editActive)}
                  className={`px-3.5 py-1 rounded-full text-xs font-black ${
                    editActive ? "bg-emerald-600 text-white" : "bg-slate-300 text-slate-700"
                  }`}
                >
                  {editActive ? "Active" : "Disabled"}
                </button>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all"
                >
                  {actionLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
