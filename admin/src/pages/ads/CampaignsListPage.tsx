import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { MockDataService } from "@/services/mockDataService";
import type { AdCampaign } from "@/types";
import {
  Megaphone,
  Tv,
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  Zap,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

export default function CampaignsListPage() {
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "under_review" | "active" | "paused" | "completed">("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Modals state
  const [selectedCampaign, setSelectedCampaign] = useState<AdCampaign | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState<Partial<AdCampaign>>({});

  const { showSuccess, showError } = useToast();

  const loadCampaigns = () => {
    setCampaigns(MockDataService.getCampaigns());
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.advertiserName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.placement.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.objective.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === "under_review") return c.status === "under_review";
    if (activeTab === "active") return c.status === "active";
    if (activeTab === "paused") return c.status === "paused";
    if (activeTab === "completed") return c.status === "completed";

    return true;
  });

  const handleStatusChange = (campaignId: string, status: AdCampaign["status"], reason?: string) => {
    const updated = MockDataService.updateCampaignStatus(campaignId, status, reason);
    setCampaigns(updated);
    setIsInspectorOpen(false);
    showSuccess("Campaign Updated", `Ad campaign status changed to ${status}.`);
  };

  const handleSaveCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAddOpen) {
      const updated = MockDataService.addCampaign(formData);
      setCampaigns(updated);
      setIsAddOpen(false);
      showSuccess("Campaign Created", "New promotional campaign registered successfully.");
    } else if (isEditOpen && selectedCampaign) {
      const updated = MockDataService.addCampaign({ ...selectedCampaign, ...formData });
      setCampaigns(updated);
      setIsEditOpen(false);
      showSuccess("Campaign Updated", "Ad campaign details saved successfully.");
    }
    setFormData({});
  };

  const handleDeleteCampaign = (campaignId: string) => {
    if (window.confirm("Are you sure you want to delete this ad campaign permanently?")) {
      const updated = MockDataService.deleteCampaign(campaignId);
      setCampaigns(updated);
      showSuccess("Campaign Deleted", "Ad campaign permanently removed.");
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Advertisements & Banner Campaign Platform"
        description="Review advertiser ad creatives, placement slot IDs, promotional budgets, and ad boosting."
        badge={`${campaigns.length} Active Campaigns`}
        badgeColor="info"
        primaryAction={
          <button
            onClick={() => {
              setFormData({ placement: "HOME_HERO", budgetInPaise: 500000, objective: "Store Visits" });
              setIsAddOpen(true);
            }}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#3547D4] text-white hover:bg-[#111E4D] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Ad Campaign</span>
          </button>
        }
      />

      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5 space-y-4">
        {/* Navigation Tabs & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {[
              { id: "all", label: `All Campaigns (${campaigns.length})` },
              { id: "under_review", label: "Review Queue" },
              { id: "active", label: "Active Live Ads" },
              { id: "paused", label: "Paused" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
                  activeTab === tab.id
                    ? "bg-[#3547D4] text-white shadow-sm"
                    : "bg-[#F5F7FC] text-[#64748B] hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search campaign, placement, advertiser..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none focus:ring-2 focus:ring-[#3547D4]"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F7FC] text-[#64748B] font-bold uppercase text-[10px] border-b border-[#E2E8F0]">
              <tr>
                <th className="p-3">Campaign Name & ID</th>
                <th className="p-3">Placement Slot</th>
                <th className="p-3">Advertiser</th>
                <th className="p-3">Budget / Spent</th>
                <th className="p-3">Objective</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filteredCampaigns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No matching ad campaigns found.
                  </td>
                </tr>
              ) : (
                filteredCampaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-bold text-[#111827]">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0">
                          <Megaphone className="w-4 h-4" />
                        </div>
                        <div>
                          <div>{c.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">ID: {c.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 font-mono text-[11px] font-bold text-[#3547D4]">{c.placement}</td>
                    <td className="p-3 font-medium text-[#111827]">{c.advertiserName}</td>
                    <td className="p-3">
                      <div className="font-bold text-[#111827]">₹{(c.budgetInPaise / 100).toLocaleString("en-IN")}</div>
                      <div className="text-[10px] text-slate-400">Spent: ₹{(c.spentInPaise / 100).toLocaleString("en-IN")}</div>
                    </td>
                    <td className="p-3 font-medium text-slate-600">{c.objective}</td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full capitalize ${
                          c.status === "active"
                            ? "bg-emerald-100 text-[#16A36A]"
                            : c.status === "under_review"
                            ? "bg-amber-100 text-amber-900"
                            : c.status === "paused"
                            ? "bg-slate-100 text-slate-600"
                            : "bg-red-100 text-[#DC3545]"
                        }`}
                      >
                        {c.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => {
                            setSelectedCampaign(c);
                            setIsInspectorOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-[#3547D4] hover:bg-slate-100 rounded-lg"
                          title="Inspect Campaign"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCampaign(c);
                            setFormData(c);
                            setIsEditOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-[#3547D4] hover:bg-slate-100 rounded-lg"
                          title="Edit Campaign"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCampaign(c.id)}
                          className="p-1.5 text-slate-400 hover:text-[#DC3545] hover:bg-red-50 rounded-lg"
                          title="Delete Campaign"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* INSPECTOR & MODERATION REVIEW MODAL */}
      {isInspectorOpen && selectedCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in-50">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-sm font-bold text-[#111827]">Ad Campaign Inspection ({selectedCampaign.id})</h3>
              <button onClick={() => setIsInspectorOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl space-y-1">
                <div className="font-bold text-[#3547D4] text-sm">{selectedCampaign.name}</div>
                <div className="text-[11px] text-slate-600">Advertiser: {selectedCampaign.advertiserName}</div>
              </div>
              <div className="grid grid-cols-2 gap-2 border border-[#E2E8F0] p-3 rounded-xl">
                <div>Placement ID: <span className="font-mono font-bold text-[#3547D4]">{selectedCampaign.placement}</span></div>
                <div>Objective: <span className="font-bold text-[#111827]">{selectedCampaign.objective}</span></div>
                <div>Total Budget: <span className="font-bold text-[#111827]">₹{(selectedCampaign.budgetInPaise / 100).toLocaleString("en-IN")}</span></div>
                <div>Amount Spent: <span className="font-bold text-[#16A36A]">₹{(selectedCampaign.spentInPaise / 100).toLocaleString("en-IN")}</span></div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E2E8F0] space-y-2">
              <div className="text-xs font-bold text-[#111827]">Moderation Action Controls:</div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleStatusChange(selectedCampaign.id, "active", "Approved live ad placement")}
                  className="py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-700"
                >
                  ✓ Approve Live
                </button>
                <button
                  onClick={() => handleStatusChange(selectedCampaign.id, "paused", "Paused campaign by admin")}
                  className="py-2 bg-amber-500 text-white font-bold rounded-xl text-xs hover:bg-amber-600"
                >
                  ⏸ Pause Ad
                </button>
                <button
                  onClick={() => handleStatusChange(selectedCampaign.id, "rejected", "Rejected ad creative")}
                  className="py-2 bg-[#DC3545] text-white font-bold rounded-xl text-xs hover:bg-red-700"
                >
                  ✕ Reject Creative
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT CAMPAIGN MODAL */}
      {(isAddOpen || isEditOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <form onSubmit={handleSaveCampaign} className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in-50">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-sm font-bold text-[#111827]">{isAddOpen ? "Create New Ad Campaign" : "Edit Campaign Details"}</h3>
              <button type="button" onClick={() => { setIsAddOpen(false); setIsEditOpen(false); }} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#111827] mb-1">Campaign Name</label>
                <input
                  type="text"
                  required
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Festival Mega Store Promotion"
                  className="w-full p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-[#111827] mb-1">Placement Slot</label>
                  <select
                    value={formData.placement || "HOME_HERO"}
                    onChange={(e) => setFormData({ ...formData, placement: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none"
                  >
                    <option value="HOME_HERO">HOME_HERO Banner</option>
                    <option value="SEARCH_NATIVE_RESULT">SEARCH_NATIVE Sponsored</option>
                    <option value="CATEGORY_BANNER">CATEGORY Top Banner</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#111827] mb-1">Budget (₹)</label>
                  <input
                    type="number"
                    required
                    value={formData.budgetInPaise ? formData.budgetInPaise / 100 : ""}
                    onChange={(e) => setFormData({ ...formData, budgetInPaise: Number(e.target.value) * 100 })}
                    placeholder="5000"
                    className="w-full p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none"
                  />
                </div>
              </div>
            </div>
            <div className="pt-2 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => { setIsAddOpen(false); setIsEditOpen(false); }}
                className="px-4 py-2 text-xs font-semibold bg-[#F5F7FC] rounded-xl text-[#111827]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold bg-[#3547D4] text-white rounded-xl hover:bg-[#111E4D]"
              >
                Save Campaign
              </button>
            </div>
          </form>
        </div>
      )}
    </PageContainer>
  );
}
