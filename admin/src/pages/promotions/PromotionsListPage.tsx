import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { MOCK_PROMOTIONS, type PromotionItem } from "@/services/promotionsDataService";
import { Search, Filter, Eye, CheckCircle, PauseCircle, PlayCircle, XCircle } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

interface PromotionsListPageProps {
  filterType?: "active" | "pending" | "listings" | "stores" | "products" | "offers";
}

export default function PromotionsListPage({ filterType }: PromotionsListPageProps) {
  const navigate = useNavigate();
  const [promotions, setPromotions] = useState<PromotionItem[]>(MOCK_PROMOTIONS);
  const [searchTerm, setSearchTerm] = useState("");
  const { showSuccess } = useToast();

  const filtered = promotions.filter((p) => {
    const matchesSearch =
      p.targetTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.promoterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.packageName.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === "active") return p.status === "active";
    if (filterType === "pending") return p.status === "submitted" || p.status === "under_review";
    if (filterType === "listings") return p.itemType === "listing";
    if (filterType === "stores") return p.itemType === "store";
    if (filterType === "products") return p.itemType === "product";
    if (filterType === "offers") return p.itemType === "offer";

    return true;
  });

  const handleStatusChange = (id: string, status: PromotionItem["status"]) => {
    setPromotions((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
    showSuccess("Promotion Updated", `Promotion status changed to ${status}.`);
  };

  const titleMap: Record<string, string> = {
    active: "Active Promotions Queue",
    pending: "Pending Review Promotions Queue",
    listings: "Listing Organic Boosts",
    stores: "Store Spotlight Promotions",
    products: "Store Product Promotions",
    offers: "Store Offer Promotions",
  };

  return (
    <PageContainer>
      <PageHeader
        title={titleMap[filterType || "active"] || "Promotions Directory"}
        description="Inspect seller promotion requests, active boosts, and review status across Omeetso."
        badge={`${filtered.length} Promotions`}
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
              placeholder="Search promotion title, seller name, package..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F7FC] text-[#64748B] font-bold uppercase text-[10px] border-b border-[#E2E8F0]">
              <tr>
                <th className="p-3">Promotion ID</th>
                <th className="p-3">Target Title</th>
                <th className="p-3">Item Type</th>
                <th className="p-3">Owner / Seller</th>
                <th className="p-3">Package Name</th>
                <th className="p-3">Paid Fee</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No promotions found matching the criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-[#3547D4]">{p.id}</td>
                    <td className="p-3 font-bold text-[#111827]">{p.targetTitle}</td>
                    <td className="p-3 capitalize font-semibold text-slate-500">{p.itemType}</td>
                    <td className="p-3 text-[#111827]">{p.promoterName}</td>
                    <td className="p-3 font-bold text-amber-900">{p.packageName}</td>
                    <td className="p-3 font-bold text-[#16A36A]">₹{p.amountPaid}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-full capitalize ${
                          p.status === "active"
                            ? "bg-emerald-100 text-[#16A36A]"
                            : p.status === "paused"
                            ? "bg-amber-100 text-amber-900"
                            : "bg-indigo-50 text-[#3547D4]"
                        }`}
                      >
                        {p.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => navigate(`/admin/promotions/${p.id}`)}
                          className="p-1.5 text-[#3547D4] hover:bg-indigo-50 rounded-lg"
                          title="Inspect Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {p.status === "active" ? (
                          <button
                            onClick={() => handleStatusChange(p.id, "paused")}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg"
                            title="Pause Boost"
                          >
                            <PauseCircle className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusChange(p.id, "active")}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                            title="Activate Boost"
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
