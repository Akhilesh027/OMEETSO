import React, { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { getAdminSafetyReportsApi, resolveSafetyReportApi } from "@/api/adminSafety.api";
import {
  ShieldAlert,
  Search,
  Eye,
  MessageSquare,
  RefreshCw,
  Loader2,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import { useNavigate } from "react-router-dom";

export default function SafetyReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "OPEN" | "INVESTIGATING" | "RESOLVED">("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Modals
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const loadReports = useCallback(async () => {
    setLoading(true);
    const params: Record<string, any> = {};
    if (activeTab !== "all") {
      params.status = activeTab;
    }

    const res = await getAdminSafetyReportsApi(params);
    setLoading(false);

    if (res.success && res.data) {
      setReports(res.data);
    } else {
      showError("Failed to Load Reports", res.error || "Could not fetch safety reports");
    }
  }, [activeTab, showError]);

  useEffect(() => {
    loadReports();
  }, [activeTab, loadReports]);

  const filteredReports = reports.filter((r) => {
    const search = searchTerm.toLowerCase();
    return (
      r.id.toLowerCase().includes(search) ||
      r.category?.toLowerCase().includes(search) ||
      r.targetId?.toLowerCase().includes(search) ||
      r.description?.toLowerCase().includes(search) ||
      (r.reporter?.name && r.reporter.name.toLowerCase().includes(search))
    );
  });

  const handleStatusChange = async (reportId: string, action: "resolve" | "dismiss", notes?: string) => {
    const res = await resolveSafetyReportApi(reportId, action, notes || "Report processed by admin.");
    if (res.success) {
      showSuccess("Safety Report Updated", `Report status set to ${action === "resolve" ? "RESOLVED" : "DISMISSED"}.`);
      setIsInspectorOpen(false);
      loadReports();
    } else {
      showError("Failed to Update Report", res.error);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Communication & Safety Investigation Reports"
        description="Investigate counterfeit claims, automated chat filter triggers, and suspicious user reports in real time."
        badge={`${reports.length} Platform Incidents`}
        badgeColor="error"
      />

      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5 space-y-4">
        {/* Navigation Tabs & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {[
              { id: "all", label: `All Incidents (${reports.length})` },
              { id: "OPEN", label: "Open Incident Escalations" },
              { id: "INVESTIGATING", label: "Under Investigation" },
              { id: "RESOLVED", label: "Resolved / Closed" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
                  activeTab === tab.id
                    ? "bg-[#DC3545] text-white shadow-sm"
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
                placeholder="Search report ID, category..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none focus:ring-2 focus:ring-[#DC3545]"
              />
            </div>
            <button
              onClick={loadReports}
              className="p-2 bg-[#F5F7FC] hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F7FC] text-[#64748B] font-bold uppercase text-[10px] border-b border-[#E2E8F0]">
              <tr>
                <th className="p-3">Incident ID & Category</th>
                <th className="p-3">Target Object</th>
                <th className="p-3">Reporter</th>
                <th className="p-3">Priority Level</th>
                <th className="p-3">Report Status</th>
                <th className="p-3 text-right">Investigation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#DC3545]" />
                    Loading live platform safety reports...
                  </td>
                </tr>
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No safety reports found for current filter.
                  </td>
                </tr>
              ) : (
                filteredReports.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-bold text-[#111827]">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-xl bg-red-50 text-[#DC3545] flex items-center justify-center font-bold text-xs shrink-0">
                          <ShieldAlert className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-[#DC3545] capitalize">{r.category || "Safety Alert"}</div>
                          <div className="text-[10px] text-slate-400 font-mono">ID: {r.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 capitalize font-semibold text-[#111827]">
                      {r.targetType} ({r.targetId})
                    </td>
                    <td className="p-3 font-medium text-slate-600">
                      {r.reporter?.name || r.reporter?.phone || "Platform System"}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                          r.priority === "CRITICAL" || r.priority === "critical"
                            ? "bg-red-100 text-[#DC3545]"
                            : r.priority === "HIGH" || r.priority === "high"
                            ? "bg-amber-100 text-amber-900"
                            : "bg-blue-100 text-[#2563EB]"
                        }`}
                      >
                        {r.priority}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full capitalize ${
                          r.status === "RESOLVED"
                            ? "bg-emerald-100 text-[#16A36A]"
                            : r.status === "INVESTIGATING"
                            ? "bg-amber-100 text-amber-900"
                            : "bg-red-100 text-[#DC3545]"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => {
                            setSelectedReport(r);
                            setIsInspectorOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-[#DC3545] hover:bg-red-50 rounded-lg"
                          title="Inspect Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            navigate("/admin/chat-monitoring");
                          }}
                          className="p-1.5 text-slate-500 hover:text-[#3547D4] hover:bg-slate-100 rounded-lg flex items-center gap-1"
                          title="Open Live Chat Monitor"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <ExternalLink className="w-3 h-3" />
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

      {/* INSPECTOR MODAL */}
      {isInspectorOpen && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in-50">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-sm font-bold text-[#111827]">Safety Incident Report ({selectedReport.id})</h3>
              <button onClick={() => setIsInspectorOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-1">
                <div className="font-bold text-[#DC3545] text-sm capitalize">{selectedReport.category}</div>
                <div className="text-[11px] text-red-800">Priority Level: <span className="uppercase font-bold">{selectedReport.priority}</span></div>
              </div>
              <div className="p-3 border border-[#E2E8F0] rounded-xl bg-slate-50 text-slate-700 font-mono text-[11px]">
                "{selectedReport.description}"
              </div>
              <div className="grid grid-cols-2 gap-2 border border-[#E2E8F0] p-3 rounded-xl">
                <div>Target Type: <span className="font-bold text-[#111827] capitalize">{selectedReport.targetType}</span></div>
                <div>Target ID: <span className="font-bold text-[#111827]">{selectedReport.targetId}</span></div>
                <div>Reporter: <span className="font-bold text-[#111827]">{selectedReport.reporter?.name || selectedReport.reporter?.phone || "System"}</span></div>
                <div>Status: <span className="font-bold text-[#111827] capitalize">{selectedReport.status}</span></div>
              </div>
            </div>
            <div className="pt-3 border-t border-[#E2E8F0] space-y-2">
              <div className="text-xs font-bold text-[#111827]">Resolution Actions:</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleStatusChange(selectedReport.id, "dismiss", "Dismissed report after review.")}
                  className="py-2 bg-slate-200 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-300"
                >
                  Dismiss Report
                </button>
                <button
                  onClick={() => handleStatusChange(selectedReport.id, "resolve", "Resolved incident report.")}
                  className="py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-700"
                >
                  ✓ Mark Resolved
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
