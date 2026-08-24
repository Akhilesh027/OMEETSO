import React, { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import {
  getAdminAdPlacementsApi,
  createAdminAdPlacementApi,
  updateAdminAdPlacementApi,
  deleteAdminAdPlacementApi
} from "@/api/adminAds.api";
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
  Calendar,
  XCircle,
  Sparkles,
  Sliders,
  Image as ImageIcon,
  Zap,
  Eye,
  MousePointerClick,
  Check,
  X,
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

export default function AdPlacementsPage() {
  const [placements, setPlacements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"ALL" | "BANNER_AD" | "LISTING_BOOST" | "OCCUPIED" | "AVAILABLE">("ALL");

  // Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [placementId, setPlacementId] = useState("");
  const [name, setName] = useState("");
  const [campaignType, setCampaignType] = useState<"BANNER_AD" | "LISTING_BOOST">("BANNER_AD");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [minimumWidth, setMinimumWidth] = useState("1600");
  const [minimumHeight, setMinimumHeight] = useState("900");
  const [maximumFileSizeBytes, setMaximumFileSizeBytes] = useState("3145728");
  const [maximumActiveSlots, setMaximumActiveSlots] = useState("5");

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editId, setEditId] = useState("");
  const [editPlacementId, setEditPlacementId] = useState("");
  const [editName, setEditName] = useState("");
  const [editAspectRatio, setEditAspectRatio] = useState("16:9");
  const [editMinimumWidth, setEditMinimumWidth] = useState("1600");
  const [editMinimumHeight, setEditMinimumHeight] = useState("900");
  const [editMaximumFileSizeBytes, setEditMaximumFileSizeBytes] = useState("3145728");
  const [editMaximumActiveSlots, setEditMaximumActiveSlots] = useState("5");
  const [editActive, setEditActive] = useState(true);

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const { showSuccess, showError } = useToast();

  const loadPlacements = useCallback(async () => {
    setLoading(true);
    const res = await getAdminAdPlacementsApi();
    setLoading(false);
    if (res.success && res.data) {
      setPlacements(res.data);
    } else {
      showError("Failed to Load Placements", res.error);
    }
  }, [showError]);

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
      maximumActiveSlots: Number(maximumActiveSlots)
    });
    setActionLoading(false);

    if (res.success) {
      showSuccess("Placement Slot Created", `Created slot ${name} (${placementId.toUpperCase()}).`);
      setIsAddModalOpen(false);
      setPlacementId("");
      setName("");
      loadPlacements();
    } else {
      showError("Creation Failed", res.error);
    }
  };

  const openEditModal = (p: any) => {
    setEditId(p.id || p._id);
    setEditPlacementId(p.placementId);
    setEditName(p.name);
    setEditAspectRatio(p.aspectRatio || "16:9");
    setEditMinimumWidth(String(p.minimumWidth || 1600));
    setEditMinimumHeight(String(p.minimumHeight || 900));
    setEditMaximumFileSizeBytes(String(p.maximumFileSizeBytes || 3145728));
    setEditMaximumActiveSlots(String(p.maximumActiveSlots || 5));
    setEditActive(p.active !== false);
    setIsEditModalOpen(true);
  };

  const handleUpdatePlacement = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    const res = await updateAdminAdPlacementApi(editId, {
      name: editName.trim(),
      aspectRatio: editAspectRatio,
      minimumWidth: Number(editMinimumWidth),
      minimumHeight: Number(editMinimumHeight),
      maximumFileSizeBytes: Number(editMaximumFileSizeBytes),
      maximumActiveSlots: Number(editMaximumActiveSlots),
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
    if (activeFilter === "BANNER_AD") return p.campaignTypes?.includes("BANNER_AD");
    if (activeFilter === "LISTING_BOOST") return p.campaignTypes?.includes("LISTING_BOOST");
    if (activeFilter === "OCCUPIED") return (p.bookedSlotsCount || 0) > 0;
    if (activeFilter === "AVAILABLE") return (p.bookedSlotsCount || 0) < (p.maximumActiveSlots || 5);
    return true;
  });

  const totalSlotsCapacity = placements.reduce((acc, p) => acc + (p.maximumActiveSlots || 0), 0);
  const totalBookedAds = placements.reduce((acc, p) => acc + (p.bookedSlotsCount || 0), 0);
  const totalPendingAds = placements.reduce((acc, p) => acc + (p.pendingReviewSlotsCount || 0), 0);

  return (
    <PageContainer>
      <PageHeader
        title="Ad Placement Slots & Live Campaigns"
        description="Monitor display billboard specs, capacity utilization, and inspect live advertiser campaigns running across all Omeetso slots."
        badge={`${placements.length} Placements Configured`}
        badgeColor="indigo"
        primaryAction={
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <PlusCircle className="w-4 h-4" /> Add Placement Slot
          </button>
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
            <div className="text-xs font-semibold text-slate-500">Placement Slots</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4.5 shadow-xs flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-600 grid place-items-center shrink-0">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{totalBookedAds}</div>
            <div className="text-xs font-semibold text-slate-500">Active Live Ads</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4.5 shadow-xs flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-amber-50 text-amber-600 grid place-items-center shrink-0">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{totalPendingAds}</div>
            <div className="text-xs font-semibold text-slate-500">Pending Review</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4.5 shadow-xs flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-blue-50 text-blue-600 grid place-items-center shrink-0">
            <Maximize2 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{totalSlotsCapacity}</div>
            <div className="text-xs font-semibold text-slate-500">Total Rotations Cap</div>
          </div>
        </div>
      </div>

      {/* Navigation Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-6 pb-2 border-b border-[#E2E8F0]">
        {[
          { id: "ALL", label: `All Placements (${placements.length})` },
          { id: "BANNER_AD", label: `🎨 Banner Billboards (${placements.filter((p) => p.campaignTypes?.includes("BANNER_AD")).length})` },
          { id: "LISTING_BOOST", label: `⚡ Boost & Badge Slots (${placements.filter((p) => p.campaignTypes?.includes("LISTING_BOOST")).length})` },
          { id: "OCCUPIED", label: `Occupied (${placements.filter((p) => (p.bookedSlotsCount || 0) > 0).length})` },
          { id: "AVAILABLE", label: `Available Slots` }
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

      {/* Placements Cards Grid */}
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
            There are no placement specifications matching this filter.
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
                        {isBanner ? "🎨 Banner Ad Slot" : "⚡ Search Boost Card"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
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
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                          title="Delete slot spec"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-black text-slate-900">{p.name}</h3>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1 font-semibold">
                        <Maximize2 className="w-3.5 h-3.5 text-indigo-500" /> Ratio: <strong>{p.aspectRatio}</strong>
                      </span>
                      <span>·</span>
                      <span>Min: <strong>{p.minimumWidth}×{p.minimumHeight}px</strong></span>
                      <span>·</span>
                      <span>Max File: <strong>{Math.round((p.maximumFileSizeBytes || 2097152) / (1024 * 1024))} MB</strong></span>
                    </div>
                  </div>

                  {/* Occupancy Utilization Bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-500" /> Slot Capacity:
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
                      Live & Booked Ads in this Slot ({bookedCampaigns.length})
                    </span>
                    {p.pendingReviewSlotsCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200">
                        {p.pendingReviewSlotsCount} In Review
                      </span>
                    )}
                  </div>

                  {bookedCampaigns.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-1">
                      <div className="font-bold text-slate-600">0 Active Ads Running</div>
                      <p className="text-[11px]">This placement slot currently has 100% open capacity for new advertiser campaigns.</p>
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
          <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-2xl max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Add New Placement Slot</h3>
                <p className="text-xs text-slate-500">Define a new banner billboard or boost card spec.</p>
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
                  placeholder="e.g. HOMEPAGE_MIDDLE_STRIP"
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
                  placeholder="e.g. Homepage Middle Billboard Carousel"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold focus:outline-hidden focus:border-indigo-600"
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
                    placeholder="16:9, 3:1, CARD"
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
          <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-2xl max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Edit Placement Slot Specs</h3>
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
