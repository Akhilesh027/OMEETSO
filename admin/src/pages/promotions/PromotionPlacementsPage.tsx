import React, { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { PROMOTION_PLACEMENTS, type PromotionPlacementConfig } from "@/services/promotionsDataService";
import { Sliders, PlusCircle, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

export default function PromotionPlacementsPage() {
  const [placements, setPlacements] = useState<PromotionPlacementConfig[]>(PROMOTION_PLACEMENTS);
  const [organicRatio, setOrganicRatio] = useState(6);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [placementId, setPlacementId] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [itemType, setItemType] = useState<PromotionPlacementConfig["promotionType"]>("listing");
  const [weight, setWeight] = useState(80);
  const [price, setPrice] = useState(249);

  const { showSuccess } = useToast();

  const handleCreatePlacement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName) return;

    const newCode = placementId || `PROMO_${displayName.toUpperCase().replace(/\s+/g, "_")}`;
    const newPlacement: PromotionPlacementConfig = {
      placementId: newCode,
      displayName,
      promotionType: itemType,
      supportedItemType: `${itemType.toUpperCase()} Item`,
      websiteEnabled: true,
      mobileAppEnabled: true,
      desktopEnabled: true,
      tabletEnabled: true,
      androidEnabled: true,
      iOSEnabled: true,
      maxActivePromotions: 5,
      rotationBehaviour: "fair_share",
      rankingWeight: weight,
      basePrice: price,
      activeStatus: true,
    };

    setPlacements([newPlacement, ...placements]);
    setIsCreateOpen(false);
    setPlacementId("");
    setDisplayName("");
    showSuccess("Promotion Placement Created", `Created promotion placement ${newCode}.`);
  };

  const handleTogglePlacement = (placementId: string) => {
    setPlacements((prev) =>
      prev.map((p) => (p.placementId === placementId ? { ...p, activeStatus: !p.activeStatus } : p))
    );
    showSuccess("Placement Updated", "Promotion placement status toggled.");
  };

  return (
    <PageContainer>
      <PageHeader
        title="Promotions Placement & Feed Ranking Rules"
        description="Configure placement IDs (PROMO_SEARCH_TOP, PROMO_CATEGORY_FEATURED), ranking weights, and feed insertion ratio."
        badge={`${placements.length} Placements`}
        badgeColor="indigo"
        primaryAction={
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#3547D4] text-white hover:bg-[#111E4D] transition-colors shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Placement Code</span>
          </button>
        }
      />

      {/* Feed Organic-to-Promoted Ratio Settings */}
      <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-[#111827] flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-[#3547D4]" />
          <span>Organic-to-Promoted Feed Insertion Control</span>
        </h3>
        <p className="text-xs text-[#64748B]">
          Enforces maximum consecutive promoted items and prevents same-advertiser repetition in search & category feeds.
        </p>

        <div className="flex items-center space-x-4 pt-2">
          <div className="text-xs font-bold text-[#111827]">
            Feed Rule: <span className="text-[#3547D4] font-extrabold">{organicRatio} Organic Items → 1 Promoted Item</span>
          </div>
          <input
            type="range"
            min={4}
            max={12}
            value={organicRatio}
            onChange={(e) => {
              setOrganicRatio(Number(e.target.value));
              showSuccess("Ranking Rule Updated", `Set feed ratio to ${e.target.value} organic items per 1 promoted item.`);
            }}
            className="w-48 accent-[#3547D4]"
          />
        </div>
      </div>

      {/* Placements Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5 space-y-4">
        <h3 className="text-sm font-bold text-[#111827]">Promotion Placement Code Registry</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F7FC] text-[#64748B] font-bold uppercase text-[10px] border-b border-[#E2E8F0]">
              <tr>
                <th className="p-3">Placement ID</th>
                <th className="p-3">Display Name</th>
                <th className="p-3">Supported Type</th>
                <th className="p-3">Device Target</th>
                <th className="p-3">Ranking Weight</th>
                <th className="p-3">Base Price</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Toggle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {placements.map((p) => (
                <tr key={p.placementId} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-mono font-bold text-[#3547D4]">{p.placementId}</td>
                  <td className="p-3 font-bold text-[#111827]">{p.displayName}</td>
                  <td className="p-3 text-[#64748B]">{p.supportedItemType}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-700 rounded">
                      Web & Mobile App
                    </span>
                  </td>
                  <td className="p-3 font-bold text-[#111827]">{p.rankingWeight} / 100</td>
                  <td className="p-3 font-bold text-[#16A36A]">₹{p.basePrice}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        p.activeStatus ? "bg-emerald-100 text-[#16A36A]" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {p.activeStatus ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleTogglePlacement(p.placementId)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg ${
                        p.activeStatus ? "bg-slate-100 text-slate-700 hover:bg-slate-200" : "bg-[#3547D4] text-white"
                      }`}
                    >
                      {p.activeStatus ? "Disable" : "Enable"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE NEW PROMOTION PLACEMENT MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <form onSubmit={handleCreatePlacement} className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in-50">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-sm font-bold text-[#111827]">Create New Promotion Placement Code</h3>
              <button type="button" onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#111827] mb-1">Placement Code ID (e.g. PROMO_PINCODE_FEED)</label>
                <input
                  type="text"
                  value={placementId}
                  onChange={(e) => setPlacementId(e.target.value)}
                  placeholder="e.g. PROMO_PINCODE_FEED"
                  className="w-full p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] font-mono focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-[#111827] mb-1">Placement Display Name</label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Local Pincode Top Feed"
                  className="w-full p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-[#111827] mb-1">Supported Item Type</label>
                  <select
                    value={itemType}
                    onChange={(e) => setItemType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none"
                  >
                    <option value="listing">Listing</option>
                    <option value="store">Store Profile</option>
                    <option value="product">Store Product</option>
                    <option value="offer">Limited Deal Offer</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#111827] mb-1">Ranking Weight (0-100)</label>
                  <input
                    type="number"
                    required
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-[#111827] mb-1">Base Price Rate (₹)</label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none"
                />
              </div>
            </div>
            <div className="pt-2 flex justify-end space-x-2">
              <button type="button" onClick={() => setIsCreateOpen(false)} className="px-4 py-2 text-xs font-semibold bg-[#F5F7FC] rounded-xl text-[#111827]">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 text-xs font-bold bg-[#3547D4] text-white rounded-xl hover:bg-[#111E4D]">
                Create Placement Code
              </button>
            </div>
          </form>
        </div>
      )}
    </PageContainer>
  );
}
