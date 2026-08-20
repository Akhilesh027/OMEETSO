import React, { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import {
  getAdminAdPlacementsApi,
  createAdminAdPlacementApi,
  deleteAdminAdPlacementApi
} from "@/api/adminAds.api";
import {
  Layers,
  PlusCircle,
  Trash2,
  CheckCircle,
  Loader2,
  RefreshCw,
  Maximize2,
  Users,
  Calendar,
  XCircle,
  Sparkles
} from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

export default function AdPlacementsPage() {
  const [placements, setPlacements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

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
      placementId: placementId.trim().toUpperCase(),
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

  const handleDeletePlacement = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete placement slot "${name}"?`)) return;

    setActionLoading(true);
    const res = await deleteAdminAdPlacementApi(id);
    setActionLoading(false);

    if (res.success) {
      showSuccess("Slot Deleted", `Placement ${name} deleted successfully.`);
      loadPlacements();
    } else {
      showError("Delete Failed", res.error);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Physical Placement Slots & Booking Directory"
        description="Configure dynamic placement resolution specs, slot capacity limits, and inspect active seller bookings."
        badge={`${placements.length} Total Configured Slots`}
        badgeColor="indigo"
        primaryAction={
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#3547D4] text-white hover:bg-blue-700 transition-colors shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Placement Slot</span>
          </button>
        }
        secondaryActions={
          <button
            onClick={loadPlacements}
            className="p-2 bg-white border border-[#E2E8F0] hover:bg-slate-50 text-slate-700 rounded-xl transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {loading ? (
          <div className="col-span-full p-12 text-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#3547D4]" />
            Loading live MongoDB placement slots and booking records...
          </div>
        ) : placements.length === 0 ? (
          <div className="col-span-full p-12 text-center text-slate-400 bg-white rounded-2xl border border-[#E2E8F0]">
            No placement slots found in database.
          </div>
        ) : (
          placements.map((p) => (
            <div key={p.id || p.placementId} className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#3547D4] flex items-center justify-center font-bold text-xs shrink-0">
                    <Maximize2 className="w-5 h-5 text-[#3547D4]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#111827]">{p.name}</h4>
                    <span className="text-[10px] font-mono text-slate-400">ID: {p.placementId}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> ACTIVE SLOT
                  </span>
                  <button
                    onClick={() => handleDeletePlacement(p.id, p.name)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Placement Slot"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Technical Specifications Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs p-3.5 bg-[#F5F7FC] rounded-xl border border-[#E2E8F0]">
                <div>Aspect Ratio: <span className="font-bold text-[#111827]">{p.aspectRatio}</span></div>
                <div>Min Resolution: <span className="font-bold text-[#3547D4]">{p.minimumWidth}x{p.minimumHeight}px</span></div>
                <div>Max Active Slots: <span className="font-bold text-[#111827]">{p.maximumActiveSlots}</span></div>
                <div>Max File Size: <span className="font-bold text-[#111827]">{Math.round((p.maximumFileSizeBytes || 0) / (1024 * 1024))} MB</span></div>
              </div>

              {/* Who Booked Slots (Active Advertisers & Campaigns) */}
              <div className="space-y-2 pt-1 border-t border-[#E2E8F0]">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#111827] flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-[#3547D4]" /> Who Booked Slots ({p.bookedSlotsCount || 0}/{p.maximumActiveSlots}):
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    (p.bookedSlotsCount || 0) > 0 ? "bg-blue-100 text-[#3547D4]" : "bg-slate-100 text-slate-500"
                  }`}>
                    {(p.bookedSlotsCount || 0) > 0 ? `${p.bookedSlotsCount} Active Advertiser` : "0 Booked"}
                  </span>
                </div>

                {!p.bookedCampaigns || p.bookedCampaigns.length === 0 ? (
                  <div className="p-3 text-center text-[11px] text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    No active seller bookings for this slot.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {p.bookedCampaigns.map((b: any) => (
                      <div key={b.campaignId} className="flex items-center justify-between p-2.5 bg-blue-50/50 border border-blue-100 rounded-xl text-xs">
                        <div className="flex items-center space-x-2 min-w-0">
                          {b.listingImage ? (
                            <img src={b.listingImage} alt="" className="w-7 h-7 rounded-lg object-cover border border-slate-200 shrink-0" />
                          ) : (
                            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                          )}
                          <div className="min-w-0">
                            <div className="font-bold text-[#111827] truncate">{b.listingTitle}</div>
                            <div className="text-[10px] text-slate-500">Seller: {b.advertiserName}</div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10px] font-mono text-[#3547D4] block">Active</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE PLACEMENT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <form onSubmit={handleCreatePlacement} className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in-50">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-sm font-bold text-[#111827] flex items-center gap-1.5">
                <PlusCircle className="w-4 h-4 text-[#3547D4]" /> Create New Placement Slot
              </h3>
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#111827] block mb-1">Placement ID (e.g. HOMEPAGE_HERO, STORE_BANNER):</label>
                <input
                  type="text"
                  required
                  value={placementId}
                  onChange={(e) => setPlacementId(e.target.value)}
                  placeholder="e.g. HOMEPAGE_HERO"
                  className="w-full p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none focus:ring-2 focus:ring-[#3547D4] uppercase font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-[#111827] block mb-1">Display Name:</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Main Homepage Hero Carousel"
                  className="w-full p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none focus:ring-2 focus:ring-[#3547D4]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-[#111827] block mb-1">Campaign Type:</label>
                  <select
                    value={campaignType}
                    onChange={(e) => setCampaignType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F5F7FC]"
                  >
                    <option value="BANNER_AD">BANNER_AD</option>
                    <option value="LISTING_BOOST">LISTING_BOOST</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-[#111827] block mb-1">Aspect Ratio:</label>
                  <input
                    type="text"
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F5F7FC]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-[#111827] block mb-1">Min Width (px):</label>
                  <input
                    type="number"
                    value={minimumWidth}
                    onChange={(e) => setMinimumWidth(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F5F7FC]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#111827] block mb-1">Min Height (px):</label>
                  <input
                    type="number"
                    value={minimumHeight}
                    onChange={(e) => setMinimumHeight(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F5F7FC]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-[#111827] block mb-1">Max Slots:</label>
                  <input
                    type="number"
                    value={maximumActiveSlots}
                    onChange={(e) => setMaximumActiveSlots(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F5F7FC]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#111827] block mb-1">Max File Size (Bytes):</label>
                  <input
                    type="number"
                    value={maximumFileSizeBytes}
                    onChange={(e) => setMaximumFileSizeBytes(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F5F7FC]"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold bg-[#F5F7FC] rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-bold bg-[#3547D4] text-white rounded-xl hover:bg-blue-700 flex items-center gap-1"
              >
                {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                Save Placement Slot
              </button>
            </div>
          </form>
        </div>
      )}
    </PageContainer>
  );
}
