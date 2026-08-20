import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { MOCK_AD_CAMPAIGNS, type AdCampaign } from "@/services/adsDataService";
import { Search, Eye, PauseCircle, PlayCircle } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

interface AdCampaignsListPageProps {
  filterType?: "campaigns" | "review" | "active" | "scheduled" | "paused" | "rejected" | "completed";
}

export default function AdCampaignsListPage({ filterType }: AdCampaignsListPageProps) {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<AdCampaign[]>(MOCK_AD_CAMPAIGNS);
  const [searchTerm, setSearchTerm] = useState("");
  const { showSuccess } = useToast();

  const filtered = campaigns.filter((c) => {
    const matchesSearch =
      c.campaignTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.advertiserName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.headline.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === "review") return c.reviewStatus === "under_review" || c.reviewStatus === "submitted";
    if (filterType === "active") return c.deliveryStatus === "active";
    if (filterType === "scheduled") return c.deliveryStatus === "scheduled";
    if (filterType === "paused") return c.deliveryStatus.includes("paused");
    if (filterType === "rejected") return c.reviewStatus === "rejected";
    if (filterType === "completed") return c.deliveryStatus === "completed";

    return true;
  });

  const handleStatusChange = (id: string, deliveryStatus: AdCampaign["deliveryStatus"]) => {
    setCampaigns((prev) => prev.map((item) => (item.id === id ? { ...item, deliveryStatus } : item)));
    showSuccess("Campaign Delivery Updated", `Delivery status changed to ${deliveryStatus}.`);
  };

  const titleMap: Record<string, string> = {
    review: "Campaign Review Moderation Queue",
    active: "Active Live Display Campaigns",
    scheduled: "Scheduled Display Campaigns",
    paused: "Paused Campaigns Directory",
    rejected: "Rejected Ad Campaigns",
    completed: "Completed Campaigns Ledger",
  };

  return (
    <PageContainer>
      <PageHeader
        title={titleMap[filterType || "campaigns"] || "All Ad Campaigns Directory"}
        description="Inspect advertising campaigns, creative approvals, placement slots, and campaign budgets."
        badge={`${filtered.length} Display Campaigns`}
        badgeColor="indigo"
      />

      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search campaign title, advertiser, headline..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F7FC] text-[#64748B] font-bold uppercase text-[10px] border-b border-[#E2E8F0]">
              <tr>
                <th className="p-3">Campaign ID</th>
                <th className="p-3">Campaign Title</th>
                <th className="p-3">Advertiser</th>
                <th className="p-3">Objective</th>
                <th className="p-3">Daily Budget</th>
                <th className="p-3">Review Status</th>
                <th className="p-3">Delivery Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No ad campaigns match the selected view.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-[#3547D4]">{c.id}</td>
                    <td className="p-3 font-bold text-[#111827]">{c.campaignTitle}</td>
                    <td className="p-3 text-[#64748B]">{c.advertiserName}</td>
                    <td className="p-3 font-semibold text-[#3547D4]">{c.objective}</td>
                    <td className="p-3 font-bold text-[#16A36A]">₹{c.dailyBudget} / day</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-full capitalize ${
                          c.reviewStatus === "approved"
                            ? "bg-emerald-100 text-[#16A36A]"
                            : "bg-amber-100 text-amber-900"
                        }`}
                      >
                        {c.reviewStatus}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-full capitalize ${
                          c.deliveryStatus === "active"
                            ? "bg-emerald-100 text-[#16A36A]"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {c.deliveryStatus.replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => navigate(`/admin/ads/${c.id}`)}
                          className="p-1.5 text-[#3547D4] hover:bg-indigo-50 rounded-lg"
                          title="Inspect Campaign & Live Previews"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {c.deliveryStatus === "active" ? (
                          <button
                            onClick={() => handleStatusChange(c.id, "paused_by_admin")}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg"
                            title="Pause Campaign Delivery"
                          >
                            <PauseCircle className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusChange(c.id, "active")}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                            title="Activate Campaign Delivery"
                          >
                            <PlayCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  );
}
