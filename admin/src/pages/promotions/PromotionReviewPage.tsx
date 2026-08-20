import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { MOCK_PROMOTIONS, type PromotionItem } from "@/services/promotionsDataService";
import {
  CheckCircle,
  XCircle,
  PauseCircle,
  PlayCircle,
  Shield,
  Zap,
  BarChart3,
  ArrowLeft,
  DollarSign,
} from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

export default function PromotionReviewPage() {
  const { promotionId } = useParams();
  const navigate = useNavigate();
  const { showSuccess } = useToast();

  const promotion = MOCK_PROMOTIONS.find((p) => p.id === promotionId) || MOCK_PROMOTIONS[0];
  const [status, setStatus] = useState<PromotionItem["status"]>(promotion.status);
  const [activeTab, setActiveTab] = useState<"overview" | "analytics">("overview");

  const handleUpdateStatus = (newStatus: PromotionItem["status"]) => {
    setStatus(newStatus);
    showSuccess("Promotion Updated", `Promotion ${promotion.id} status changed to ${newStatus}.`);
  };

  return (
    <PageContainer>
      <PageHeader
        title={`Promotion Inspector: ${promotion.targetTitle}`}
        description={`Reviewing promotion requested by ${promotion.promoterName} (${promotion.promoterEmail}).`}
        badge={`ID: ${promotion.id}`}
        badgeColor="indigo"
        secondaryActions={
          <button
            onClick={() => navigate("/admin/promotions")}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-[#E2E8F0] text-[#111827] hover:bg-slate-50"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Promotions</span>
          </button>
        }
      />

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-[#E2E8F0] pb-2 text-xs">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-3 py-1.5 rounded-xl font-bold ${
            activeTab === "overview" ? "bg-[#3547D4] text-white" : "bg-[#F5F7FC] text-[#64748B]"
          }`}
        >
          Inspection Overview
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`px-3 py-1.5 rounded-xl font-bold ${
            activeTab === "analytics" ? "bg-[#3547D4] text-white" : "bg-[#F5F7FC] text-[#64748B]"
          }`}
        >
          Organic vs Promoted Analytics
        </button>
      </div>

      {activeTab === "overview" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main Inspection Card */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <span className="text-xs font-bold text-[#3547D4] uppercase">Target Details</span>
              <span className="px-2.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-900 rounded">
                ⚡ {promotion.packageName}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>Target Item ID: <span className="font-mono font-bold text-[#111827]">{promotion.targetId}</span></div>
              <div>Category: <span className="font-bold text-[#111827]">{promotion.targetCategory}</span></div>
              <div>City Location: <span className="font-bold text-[#111827]">{promotion.targetCity}</span></div>
              <div>Amount Paid: <span className="font-bold text-[#16A36A]">₹{promotion.amountPaid}</span></div>
            </div>

            <div className="p-4 bg-[#F5F7FC] rounded-xl space-y-2 text-xs border border-[#E2E8F0]">
              <h4 className="font-bold text-[#111827]">Assigned Placements:</h4>
              <div className="flex flex-wrap gap-1.5">
                {promotion.placements.map((plc) => (
                  <span key={plc} className="px-2.5 py-1 font-mono text-[10px] font-bold bg-white text-[#3547D4] border border-[#E2E8F0] rounded-lg">
                    {plc}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1 text-xs text-slate-700">
              <p className="font-bold text-[#16A36A]">Moderation Verification Checklist:</p>
              <p>✓ Item belongs to promoter ({promotion.promoterName}).</p>
              <p>✓ Item is active and approved in category.</p>
              <p>✓ Payment verified via wallet ledger.</p>
            </div>
          </div>

          {/* Action Control Panel */}
          <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#111827]">Admin Moderation Action</h3>
              <div className="p-3 bg-[#F5F7FC] rounded-xl text-xs flex items-center justify-between">
                <span>Current Status:</span>
                <span className="font-extrabold text-[#3547D4] uppercase">{status.replace("_", " ")}</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => handleUpdateStatus("approved")}
                className="w-full py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition-colors"
              >
                ✓ Approve & Activate Boost
              </button>
              <button
                onClick={() => handleUpdateStatus("paused")}
                className="w-full py-2.5 bg-amber-500 text-white font-bold text-xs rounded-xl hover:bg-amber-600 transition-colors"
              >
                👁 Pause Boost
              </button>
              <button
                onClick={() => handleUpdateStatus("rejected")}
                className="w-full py-2.5 bg-[#DC3545] text-white font-bold text-xs rounded-xl hover:bg-red-700 transition-colors"
              >
                ✕ Reject & Send to Refund Queue
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Analytics View */
        <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[#111827]">Organic vs Promoted Performance Metrics</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-4 bg-[#F5F7FC] rounded-xl space-y-1">
              <span className="text-[#64748B]">Total Impressions</span>
              <div className="text-lg font-extrabold text-[#3547D4]">{promotion.impressions}</div>
            </div>
            <div className="p-4 bg-[#F5F7FC] rounded-xl space-y-1">
              <span className="text-[#64748B]">Product Views</span>
              <div className="text-lg font-extrabold text-[#111827]">{promotion.views}</div>
            </div>
            <div className="p-4 bg-[#F5F7FC] rounded-xl space-y-1">
              <span className="text-[#64748B]">Buyer Chats Initiated</span>
              <div className="text-lg font-extrabold text-[#16A36A]">{promotion.chats}</div>
            </div>
            <div className="p-4 bg-[#F5F7FC] rounded-xl space-y-1">
              <span className="text-[#64748B]">Cost Per Chat</span>
              <div className="text-lg font-extrabold text-amber-900">₹{Math.round(promotion.amountPaid / (promotion.chats || 1))}</div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
