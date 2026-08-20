import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import {
  getAdminAdCampaignsApi,
  approveAdminAdCampaignApi,
  rejectAdminAdCampaignApi
} from "@/api/adminAds.api";
import {
  ShieldAlert,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Loader2,
  RefreshCw,
  Search,
  Zap,
  Image as ImageIcon
} from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

export default function AdCampaignReviewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const initialTab = location.pathname.includes("active")
    ? "ACTIVE"
    : location.pathname.includes("rejected")
    ? "REJECTED"
    : "PENDING_REVIEW";

  const [activeTab, setActiveTab] = useState<"PENDING_REVIEW" | "ACTIVE" | "REJECTED" | "ALL">(initialTab);
  const [searchTerm, setSearchTerm] = useState("");

  // Modals & Selected Campaign
  const [selectedCampaign, setSelectedCampaign] = useState<any | null>(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const { showSuccess, showError } = useToast();

  const loadCampaigns = useCallback(async () => {
    setLoading(true);
    const params: Record<string, any> = {};
    if (activeTab !== "ALL") {
      params.status = activeTab;
    }

    const res = await getAdminAdCampaignsApi(params);
    setLoading(false);

    if (res.success && res.data) {
      setCampaigns(res.data);
    } else {
      showError("Failed to Load Ad Queue", res.error || "Could not fetch ad campaigns");
    }
  }, [activeTab, showError]);

  useEffect(() => {
    loadCampaigns();
  }, [activeTab, loadCampaigns]);

  const handleApprove = async (campaignId: string) => {
    setActionLoading(true);
    const res = await approveAdminAdCampaignApi(campaignId);
    setActionLoading(false);

    if (res.success) {
      showSuccess("Campaign Approved & Activated", "Ad inventory captured and banner is now live!");
      setSelectedCampaign(null);
      loadCampaigns();
    } else {
      showError("Approval Failed", res.error);
    }
  };

  const handleReject = async () => {
    if (!selectedCampaign || !rejectionReason.trim()) return;
    setActionLoading(true);
    const res = await rejectAdminAdCampaignApi(selectedCampaign.id, rejectionReason.trim());
    setActionLoading(false);

    if (res.success) {
      showSuccess("Campaign Rejected", "Wallet hold released and balance restored to seller.");
      setIsRejectModalOpen(false);
      setSelectedCampaign(null);
      loadCampaigns();
    } else {
      showError("Rejection Failed", res.error);
    }
  };

  const filteredCampaigns = campaigns.filter((c) => {
    const search = searchTerm.toLowerCase();
    return (
      c.id.toLowerCase().includes(search) ||
      c.productName?.toLowerCase().includes(search) ||
      c.listing?.title?.toLowerCase().includes(search) ||
      c.advertiser?.name?.toLowerCase().includes(search)
    );
  });

  return (
    <PageContainer>
      <PageHeader
        title="Seller Boost & Ad Campaign Moderation"
        description="Review seller product boost requests, custom banner creative assets, and SLA deadlines."
        badge={`${campaigns.filter((c) => c.status === "PENDING_REVIEW").length} Pending SLA Approvals`}
        badgeColor="amber"
      />

      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5 space-y-4">
        {/* Navigation Tabs & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {[
              { id: "PENDING_REVIEW", label: "Pending 24h Review Queue" },
              { id: "ACTIVE", label: "Active Live Ads" },
              { id: "REJECTED", label: "Rejected Campaigns" },
              { id: "ALL", label: `All Campaigns (${campaigns.length})` },
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

          <div className="flex items-center gap-2">
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search listing, seller, campaign..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none focus:ring-2 focus:ring-[#3547D4]"
              />
            </div>
            <button
              onClick={loadCampaigns}
              className="p-2 bg-[#F5F7FC] hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Campaign Queue Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F7FC] text-[#64748B] font-bold uppercase text-[10px] border-b border-[#E2E8F0]">
              <tr>
                <th className="p-3">Campaign & Type</th>
                <th className="p-3">Advertiser / Seller</th>
                <th className="p-3">Target Product / Placement</th>
                <th className="p-3">Wallet Hold</th>
                <th className="p-3">24-Hour SLA Timer</th>
                <th className="p-3 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#3547D4]" />
                    Loading seller ad campaign queue...
                  </td>
                </tr>
              ) : filteredCampaigns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    <div className="space-y-1">
                      <div className="text-sm font-bold text-slate-700">0 Campaigns Found</div>
                      <p className="text-xs text-slate-400">There are currently 0 seller campaigns matching this category or status filter.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCampaigns.map((c) => {
                  const isSlaBreached = c.reviewDeadlineAt && new Date(c.reviewDeadlineAt).getTime() < Date.now();
                  return (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-bold text-[#111827]">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#3547D4] flex items-center justify-center font-bold text-xs shrink-0">
                            {c.campaignType === "BANNER_AD" ? <ImageIcon className="w-4 h-4 text-amber-600" /> : <Zap className="w-4 h-4 text-blue-600" />}
                          </div>
                          <div>
                            <div className="text-[#3547D4]">{c.productName || c.campaignType}</div>
                            <div className="text-[10px] text-slate-400 font-mono">ID: {c.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 font-medium text-slate-700">
                        {c.advertiser?.name || c.advertiser?.email || "Seller Account"}
                      </td>
                      <td className="p-3 font-semibold text-[#111827]">
                        <div>{c.listing?.title || "Product Listing"}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Placements: {c.placementIds?.join(", ")}
                        </div>
                      </td>
                      <td className="p-3 font-bold text-[#111827]">
                        ₹{((c.pricing?.totalInPaise || 0) / 100).toLocaleString("en-IN")}
                      </td>
                      <td className="p-3">
                        {c.status === "PENDING_REVIEW" ? (
                          <span
                            className={`px-2.5 py-1 text-[10px] font-bold rounded-full flex items-center gap-1 w-fit ${
                              isSlaBreached
                                ? "bg-red-100 text-red-700 border border-red-200 animate-pulse"
                                : "bg-amber-100 text-amber-900 border border-amber-200"
                            }`}
                          >
                            <Clock className="w-3 h-3" />
                            {isSlaBreached ? "SLA Breached" : "Due within 24h"}
                          </span>
                        ) : (
                          <span
                            className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                              c.status === "ACTIVE"
                                ? "bg-emerald-100 text-emerald-800"
                                : c.status === "REJECTED"
                                ? "bg-red-100 text-red-700"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {c.status}
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => setSelectedCampaign(c)}
                            className="px-3 py-1.5 bg-[#3547D4] text-white rounded-xl font-bold text-xs hover:bg-blue-700 flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Inspect & Review
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* INSPECTOR MODAL */}
      {selectedCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl animate-in fade-in-50">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-sm font-bold text-[#111827]">Ad Campaign Inspector ({selectedCampaign.id})</h3>
              <button onClick={() => setSelectedCampaign(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Creative Asset Preview */}
              <div className="space-y-1">
                <span className="font-bold text-[#111827] uppercase text-[10px]">Creative Asset Preview:</span>
                <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl">
                  {selectedCampaign.bannerUrl ? (
                    <img
                      src={selectedCampaign.bannerUrl}
                      alt="Banner Preview"
                      className="max-h-48 w-full object-cover rounded-lg border border-slate-300 shadow-sm"
                    />
                  ) : (
                    <div className="p-6 text-center text-slate-400">No custom creative banner uploaded. Uses listing card image.</div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 border border-[#E2E8F0] p-3 rounded-xl bg-slate-50">
                <div>Campaign Type: <span className="font-bold text-[#111827]">{selectedCampaign.campaignType}</span></div>
                <div>Package: <span className="font-bold text-[#111827]">{selectedCampaign.productName || "Boost Plan"}</span></div>
                <div>Seller Account: <span className="font-bold text-[#111827]">{selectedCampaign.advertiser?.name || "Seller"}</span></div>
                <div>Reserved Hold: <span className="font-bold text-[#3547D4]">₹{((selectedCampaign.pricing?.totalInPaise || 0) / 100).toLocaleString("en-IN")}</span></div>
                <div>Listing Title: <span className="font-bold text-[#111827] truncate block">{selectedCampaign.listing?.title}</span></div>
                <div>Placements: <span className="font-bold text-[#111827]">{selectedCampaign.placementIds?.join(", ")}</span></div>
              </div>
            </div>

            {selectedCampaign.status === "PENDING_REVIEW" && (
              <div className="pt-3 border-t border-[#E2E8F0] flex justify-end gap-2">
                <button
                  onClick={() => setIsRejectModalOpen(true)}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-red-100 text-red-700 font-bold rounded-xl text-xs hover:bg-red-200"
                >
                  <XCircle className="w-3.5 h-3.5 inline mr-1" />
                  Reject Campaign
                </button>
                <button
                  onClick={() => handleApprove(selectedCampaign.id)}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-700 flex items-center gap-1"
                >
                  {actionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                  Approve & Activate Ad
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {isRejectModalOpen && selectedCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in-50">
            <h3 className="text-sm font-bold text-red-600 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" /> Reject Ad Campaign ({selectedCampaign.id})
            </h3>
            <p className="text-xs text-slate-600">
              Rejecting will release the reserved wallet hold amount back to the seller's available balance.
            </p>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#111827]">Mandatory Rejection Reason:</label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Creative banner resolution too low, violates promotional guidelines..."
                className="w-full p-3 text-xs rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none focus:ring-2 focus:ring-red-500 font-sans"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
              <button onClick={() => setIsRejectModalOpen(false)} className="px-4 py-2 text-xs font-semibold bg-[#F5F7FC] rounded-xl">
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading || !rejectionReason.trim()}
                className="px-4 py-2 text-xs font-bold bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50"
              >
                Confirm Rejection & Release Funds
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
