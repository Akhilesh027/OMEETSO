import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import {
  getAdminAdCampaignsApi,
  getAdminAdPlacementsApi,
  approveAdminAdCampaignApi,
  rejectAdminAdCampaignApi
} from "@/api/adminAds.api";
import {
  Megaphone,
  CheckSquare,
  DollarSign,
  Eye,
  Loader2,
  RefreshCw,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  ShieldAlert,
  ImageIcon,
  Zap
} from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

export default function AdsOverviewPage() {
  const location = useLocation();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [placements, setPlacements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const getInitialTab = () => {
    const path = location.pathname;
    if (path.includes("active")) return "ACTIVE";
    if (path.includes("review")) return "PENDING_REVIEW";
    if (path.includes("rejected")) return "REJECTED";
    if (path.includes("placements")) return "PLACEMENTS";
    return "ALL";
  };

  const [activeTab, setActiveTab] = useState<string>(getInitialTab());

  // Moderation states
  const [selectedCampaign, setSelectedCampaign] = useState<any | null>(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const { showSuccess, showError } = useToast();

  const loadData = useCallback(async () => {
    setLoading(true);
    const [campRes, placeRes] = await Promise.all([
      getAdminAdCampaignsApi(),
      getAdminAdPlacementsApi()
    ]);
    setLoading(false);

    if (campRes.success && campRes.data) setCampaigns(campRes.data);
    if (placeRes.success && placeRes.data) setPlacements(placeRes.data);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleApprove = async (campaignId: string) => {
    setActionLoading(true);
    const res = await approveAdminAdCampaignApi(campaignId);
    setActionLoading(false);

    if (res.success) {
      showSuccess("Campaign Approved & Activated", "Ad inventory captured and banner is now live!");
      setSelectedCampaign(null);
      loadData();
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
      loadData();
    } else {
      showError("Rejection Failed", res.error);
    }
  };

  const activeCount = campaigns.filter((c) => c.status === "ACTIVE").length;
  const pendingCount = campaigns.filter((c) => c.status === "PENDING_REVIEW").length;
  const rejectedCount = campaigns.filter((c) => c.status === "REJECTED").length;
  const totalRevenuePaise = campaigns
    .filter((c) => c.status === "ACTIVE" || c.paymentStatus === "PAID")
    .reduce((acc, c) => acc + (c.pricing?.totalInPaise || 0), 0);

  const filteredCampaigns = campaigns.filter((c) => {
    if (activeTab === "PENDING_REVIEW" && c.status !== "PENDING_REVIEW") return false;
    if (activeTab === "ACTIVE" && c.status !== "ACTIVE") return false;
    if (activeTab === "REJECTED" && c.status !== "REJECTED") return false;
    if (activeTab === "LISTING_BOOST" && c.campaignType !== "LISTING_BOOST") return false;
    if (activeTab === "BANNER_AD" && c.campaignType !== "BANNER_AD") return false;

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        c.id.toLowerCase().includes(search) ||
        c.productName?.toLowerCase().includes(search) ||
        c.listing?.title?.toLowerCase().includes(search) ||
        c.advertiser?.name?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  return (
    <PageContainer>
      <PageHeader
        title="Advertisements & Media Master Workspace"
        description="Unified control of seller display ad campaigns, custom creative approvals, SLA timers, and physical placement slots."
        badge={`${activeCount} Active Live Ads`}
        badgeColor="indigo"
        secondaryActions={
          <button
            onClick={loadData}
            className="p-2 bg-white border border-[#E2E8F0] hover:bg-slate-50 text-slate-700 rounded-xl transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        }
      />

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>Active Live Ads</span>
            <Megaphone className="w-4 h-4 text-[#3547D4]" />
          </div>
          <div className="text-2xl font-extrabold text-[#111827]">{activeCount}</div>
          <div className="text-[10px] text-[#16A36A] font-bold">Serving on Homepage & Search</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>Pending 24h Review</span>
            <CheckSquare className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-[#111827]">{pendingCount}</div>
          <div className="text-[10px] text-amber-600 font-bold">Funds Reserved in Wallet</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>Total Ad Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-[#111827]">₹{(totalRevenuePaise / 100).toLocaleString("en-IN")}</div>
          <div className="text-[10px] text-emerald-600 font-bold">Captured from Wallet Holds</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>Rejected Campaigns</span>
            <Eye className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-extrabold text-[#111827]">{rejectedCount}</div>
          <div className="text-[10px] text-red-500 font-bold">Holds Released Back to Sellers</div>
        </div>
      </div>

      {/* Main Consolidated Table Container */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5 space-y-4">
        {/* Navigation Tabs & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {[
              { id: "ALL", label: `All Ads (${campaigns.length})` },
              { id: "PENDING_REVIEW", label: `24h Review Queue (${pendingCount})` },
              { id: "ACTIVE", label: `Active Live (${activeCount})` },
              { id: "REJECTED", label: `Rejected (${rejectedCount})` },
              { id: "BANNER_AD", label: "Custom Banner Ads" },
              { id: "LISTING_BOOST", label: "Listing Boosts" },
              { id: "PLACEMENTS", label: `Slot Specs (${placements.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
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
              placeholder="Search ad, seller, listing..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none focus:ring-2 focus:ring-[#3547D4]"
            />
          </div>
        </div>

        {/* View: Placement Slot Specs Tab */}
        {activeTab === "PLACEMENTS" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {placements.map((p) => (
              <div key={p.id || p.placementId} className="bg-[#F5F7FC] p-4 rounded-xl border border-[#E2E8F0] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#111827]">{p.name}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold">
                    ACTIVE
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  Aspect: {p.aspectRatio} | Resolution: {p.minimumWidth}x{p.minimumHeight} | Max Slots: {p.maximumActiveSlots}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* View: Campaign Queue Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F7FC] text-[#64748B] font-bold uppercase text-[10px] border-b border-[#E2E8F0]">
                <tr>
                  <th className="p-3">Ad Campaign & Type</th>
                  <th className="p-3">Seller / Advertiser</th>
                  <th className="p-3">Target Product / Placement</th>
                  <th className="p-3">Wallet Hold</th>
                  <th className="p-3">24-Hour SLA Timer</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#3547D4]" />
                      Loading ad campaign queue...
                    </td>
                  </tr>
                ) : filteredCampaigns.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      <div className="space-y-1">
                        <div className="text-sm font-bold text-slate-700">0 Ads Found</div>
                        <p className="text-xs text-slate-400">There are currently 0 ad campaigns matching this filter.</p>
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
                          <button
                            onClick={() => setSelectedCampaign(c)}
                            className="px-3 py-1.5 bg-[#3547D4] text-white rounded-xl font-bold text-xs hover:bg-blue-700 flex items-center gap-1 ml-auto"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Inspect & Review
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
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
