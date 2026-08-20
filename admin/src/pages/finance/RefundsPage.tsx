import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { MockDataService } from "@/services/mockDataService";
import type { RefundRequest } from "@/types";
import {
  Wallet,
  RefreshCw,
  CreditCard,
  Search,
  CheckCircle,
  XCircle,
  Plus,
  DollarSign,
  Gift,
} from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

export default function RefundsPage() {
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "requested" | "approved" | "rejected">("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Modals state
  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isPromoOpen, setIsPromoOpen] = useState(false);

  const [promoUserId, setPromoUserId] = useState("u_ravi");
  const [promoAmount, setPromoAmount] = useState(500);

  const { showSuccess, showError } = useToast();

  const loadRefunds = () => {
    setRefunds(MockDataService.getRefunds());
  };

  useEffect(() => {
    loadRefunds();
  }, []);

  const filteredRefunds = refunds.filter((r) => {
    const matchesSearch =
      r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.service.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === "requested") return r.status === "requested";
    if (activeTab === "approved") return r.status === "approved";
    if (activeTab === "rejected") return r.status === "rejected";

    return true;
  });

  const handleProcessRefund = (refundId: string, status: RefundRequest["status"], reason?: string) => {
    const updated = MockDataService.processRefund(refundId, status, reason);
    setRefunds(updated);
    setIsInspectorOpen(false);
    showSuccess("Refund Processed", `Refund request status set to ${status}.`);
  };

  const handleIssuePromo = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPromoOpen(false);
    showSuccess("Promotional Credit Issued", `Issued ₹${promoAmount} promotional credit to user ${promoUserId}.`);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Finance Ledger & Refunds Management"
        description="Inspect platform service wallet transactions, ledger adjustments, and refund requests."
        badge={`${refunds.length} Refund Requests`}
        badgeColor="indigo"
        primaryAction={
          <button
            onClick={() => setIsPromoOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#16A36A] text-white hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <Gift className="w-4 h-4" />
            <span>Issue Promotional Credits</span>
          </button>
        }
      />

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-sm flex items-center space-x-3">
          <div className="p-3 bg-emerald-50 text-[#16A36A] rounded-xl font-bold">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-[#64748B] font-semibold">Total Escrow Volume</div>
            <div className="text-sm font-extrabold text-[#111827]">₹4,25,000</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-sm flex items-center space-x-3">
          <div className="p-3 bg-indigo-50 text-[#3547D4] rounded-xl font-bold">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-[#64748B] font-semibold">Active Seller Wallets</div>
            <div className="text-sm font-extrabold text-[#111827]">148 Verified</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-sm flex items-center space-x-3">
          <div className="p-3 bg-amber-50 text-amber-900 rounded-xl font-bold">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-[#64748B] font-semibold">Pending Refunds</div>
            <div className="text-sm font-extrabold text-amber-900">{refunds.filter(r => r.status === "requested").length} Requests</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5 space-y-4">
        {/* Navigation Tabs & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {[
              { id: "all", label: `All Requests (${refunds.length})` },
              { id: "requested", label: "Pending Refund Queue" },
              { id: "approved", label: "Approved Refunds" },
              { id: "rejected", label: "Rejected" },
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
              placeholder="Search user, reason, service..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none focus:ring-2 focus:ring-[#3547D4]"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F7FC] text-[#64748B] font-bold uppercase text-[10px] border-b border-[#E2E8F0]">
              <tr>
                <th className="p-3">Refund ID & Service</th>
                <th className="p-3">User Account</th>
                <th className="p-3">Requested Amount</th>
                <th className="p-3">Reason</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filteredRefunds.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No refund requests found.
                  </td>
                </tr>
              ) : (
                filteredRefunds.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-bold text-[#111827]">
                      <div>{r.service}</div>
                      <div className="text-[10px] text-slate-400 font-mono">ID: {r.id}</div>
                    </td>
                    <td className="p-3 font-medium text-[#111827]">
                      <div>{r.userName}</div>
                      <div className="text-[10px] text-slate-400">ID: {r.userId}</div>
                    </td>
                    <td className="p-3 font-extrabold text-[#3547D4] text-xs">
                      ₹{(r.amountInPaise / 100).toLocaleString("en-IN")}
                    </td>
                    <td className="p-3 text-slate-600 max-w-xs truncate">{r.reason}</td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full capitalize ${
                          r.status === "approved"
                            ? "bg-emerald-100 text-[#16A36A]"
                            : r.status === "requested"
                            ? "bg-amber-100 text-amber-900"
                            : "bg-red-100 text-[#DC3545]"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedRefund(r);
                          setIsInspectorOpen(true);
                        }}
                        className="px-3 py-1.5 bg-[#3547D4] text-white font-bold rounded-lg hover:bg-[#111E4D]"
                      >
                        Inspect Request
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* INSPECTION MODAL */}
      {isInspectorOpen && selectedRefund && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in-50">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-sm font-bold text-[#111827]">Refund Request Inspection ({selectedRefund.id})</h3>
              <button onClick={() => setIsInspectorOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl space-y-1">
                <div className="font-bold text-[#3547D4] text-sm">₹{(selectedRefund.amountInPaise / 100).toLocaleString("en-IN")}</div>
                <div className="text-[11px] text-slate-600">Service: {selectedRefund.service}</div>
              </div>
              <div className="grid grid-cols-2 gap-2 border border-[#E2E8F0] p-3 rounded-xl">
                <div>User Name: <span className="font-bold text-[#111827]">{selectedRefund.userName}</span></div>
                <div>User ID: <span className="font-bold text-[#111827]">{selectedRefund.userId}</span></div>
                <div>Current Status: <span className="font-bold text-[#111827] capitalize">{selectedRefund.status}</span></div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <p className="font-bold text-[#111827]">Refund Reason:</p>
                <p className="text-slate-700 pt-1">{selectedRefund.reason}</p>
              </div>
            </div>
            <div className="pt-3 border-t border-[#E2E8F0] space-y-2">
              <div className="text-xs font-bold text-[#111827]">Process Refund Actions:</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleProcessRefund(selectedRefund.id, "approved", "Approved by finance manager")}
                  className="py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-700"
                >
                  ✓ Approve Refund
                </button>
                <button
                  onClick={() => handleProcessRefund(selectedRefund.id, "rejected", "Rejected refund claim")}
                  className="py-2.5 bg-[#DC3545] text-white font-bold rounded-xl text-xs hover:bg-red-700"
                >
                  ✕ Reject Claim
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PROMO CREDITS MODAL */}
      {isPromoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <form onSubmit={handleIssuePromo} className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in-50">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-sm font-bold text-[#111827]">Issue Promotional Wallet Credits</h3>
              <button type="button" onClick={() => setIsPromoOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#111827] mb-1">Target User ID</label>
                <input
                  type="text"
                  required
                  value={promoUserId}
                  onChange={(e) => setPromoUserId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-[#111827] mb-1">Credit Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={promoAmount}
                  onChange={(e) => setPromoAmount(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none"
                />
              </div>
            </div>
            <div className="pt-2 flex justify-end space-x-2">
              <button type="button" onClick={() => setIsPromoOpen(false)} className="px-4 py-2 text-xs font-semibold bg-[#F5F7FC] rounded-xl text-[#111827]">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 text-xs font-bold bg-[#16A36A] text-white rounded-xl hover:bg-emerald-700">
                Grant Credit
              </button>
            </div>
          </form>
        </div>
      )}
    </PageContainer>
  );
}
