import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { AuditLogService } from "@/services/auditLogService";
import type { AuditLogEntry } from "@/types/auth";
import {
  History,
  Search,
  Download,
  Filter,
  Shield,
  Eye,
  Lock,
  UserCheck,
  AlertTriangle,
  RefreshCw,
  FileText,
} from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [targetFilter, setTargetFilter] = useState("all");

  // Modal
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  const { showSuccess, showError } = useToast();

  const refreshLogs = () => {
    setLogs(AuditLogService.getLogs());
  };

  useEffect(() => {
    refreshLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.adminName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.targetId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.targetType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.reason && log.reason.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesAction = actionFilter === "all" || log.action.includes(actionFilter);
    const matchesTarget = targetFilter === "all" || log.targetType.toLowerCase() === targetFilter.toLowerCase();

    return matchesSearch && matchesAction && matchesTarget;
  });

  const handleExportCSV = () => {
    if (filteredLogs.length === 0) {
      showError("Export Failed", "No audit entries match the current filter.");
      return;
    }

    const headers = ["Audit ID", "Timestamp", "Admin Name", "Role", "Action", "Target Type", "Target ID", "Reason", "Session ID"];
    const rows = filteredLogs.map((log) => [
      log.id,
      new Date(log.timestamp).toISOString(),
      `"${log.adminName.replace(/"/g, '""')}"`,
      `"${log.role.replace(/"/g, '""')}"`,
      log.action,
      log.targetType,
      log.targetId,
      `"${(log.reason || "").replace(/"/g, '""')}"`,
      log.sessionId,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `omeetso_audit_log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showSuccess("CSV Export Downloaded", `Exported ${filteredLogs.length} audit trail records.`);
  };

  // Metrics
  const uniqueAdmins = new Set(logs.map((l) => l.adminName)).size;
  const securityAlerts = logs.filter((l) => l.action.includes("SUSPEND") || l.action.includes("BAN") || l.action.includes("FREEZE") || l.action.includes("REJECT")).length;

  return (
    <PageContainer>
      <PageHeader
        title="Immutable System Audit Trail & Operator Activity Log"
        description="Read-only tamper-evident security audit trail recording every administrative action, user suspension, listing approval, refund, and permission change."
        badge={`${logs.length} Audit Events Logged`}
        badgeColor="indigo"
        primaryAction={
          <div className="flex items-center space-x-2">
            <button
              onClick={refreshLogs}
              className="inline-flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-semibold bg-[#F5F7FC] text-[#111827] hover:bg-slate-200 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Log</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#3547D4] text-white hover:bg-[#111E4D] transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Audit Trail (CSV)</span>
            </button>
          </div>
        }
      />

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
        <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-sm flex items-center space-x-3">
          <div className="p-3 bg-indigo-50 text-[#3547D4] rounded-xl font-bold">
            <History className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-[#64748B] font-semibold">Total Audit Events</div>
            <div className="text-sm font-extrabold text-[#111827]">{logs.length} Entries</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-sm flex items-center space-x-3">
          <div className="p-3 bg-emerald-50 text-[#16A36A] rounded-xl font-bold">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-[#64748B] font-semibold">Tracked Admin Operators</div>
            <div className="text-sm font-extrabold text-[#111827]">{uniqueAdmins} Operators</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-sm flex items-center space-x-3">
          <div className="p-3 bg-red-50 text-[#DC3545] rounded-xl font-bold">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-[#64748B] font-semibold">Security Action Events</div>
            <div className="text-sm font-extrabold text-[#DC3545]">{securityAlerts} Actions</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-sm flex items-center space-x-3">
          <div className="p-3 bg-amber-50 text-amber-900 rounded-xl font-bold">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-[#64748B] font-semibold">Tamper Protection</div>
            <div className="text-sm font-extrabold text-amber-900">Cryptographic Signature</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5 space-y-4">
        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search audit ID, operator name, action, reason..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none focus:ring-2 focus:ring-[#3547D4]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-1.5">
              <Filter className="w-3.5 h-3.5 text-[#3547D4]" />
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="text-xs p-2 rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none"
              >
                <option value="all">All Action Categories</option>
                <option value="LOGIN">Logins & Authentication</option>
                <option value="USER">User & Account Actions</option>
                <option value="LISTING">Listings & Moderation</option>
                <option value="STORE">Store Verifications</option>
                <option value="AD">Ad Campaigns & Boosting</option>
                <option value="REFUND">Refunds & Financials</option>
                <option value="SAFETY">Safety Reports</option>
                <option value="SETTINGS">System Settings</option>
              </select>
            </div>

            <select
              value={targetFilter}
              onChange={(e) => setTargetFilter(e.target.value)}
              className="text-xs p-2 rounded-xl border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none"
            >
              <option value="all">All Target Types</option>
              <option value="User">User</option>
              <option value="Listing">Listing</option>
              <option value="Store">Store</option>
              <option value="AdCampaign">AdCampaign</option>
              <option value="SafetyReport">SafetyReport</option>
              <option value="RefundRequest">RefundRequest</option>
              <option value="SupportTicket">SupportTicket</option>
              <option value="SystemSettings">SystemSettings</option>
            </select>
          </div>
        </div>

        {/* Read-Only Audit Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F7FC] text-[#64748B] font-bold uppercase text-[10px] border-b border-[#E2E8F0]">
              <tr>
                <th className="p-3">Audit ID</th>
                <th className="p-3">Operator Name</th>
                <th className="p-3">Admin Role</th>
                <th className="p-3">Recorded Action</th>
                <th className="p-3">Target Object</th>
                <th className="p-3">Reason / Context</th>
                <th className="p-3">Timestamp</th>
                <th className="p-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No audit records match the selected search criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono text-slate-500 text-[11px] font-bold">{log.id}</td>
                    <td className="p-3 font-bold text-[#111827]">{log.adminName}</td>
                    <td className="p-3 text-slate-500">{log.role}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded capitalize ${
                          log.action.includes("SUSPEND") || log.action.includes("BAN") || log.action.includes("REJECT")
                            ? "bg-red-100 text-[#DC3545]"
                            : log.action.includes("APPROVE") || log.action.includes("VERIFY")
                            ? "bg-emerald-100 text-[#16A36A]"
                            : log.action.includes("BOOST")
                            ? "bg-amber-100 text-amber-900"
                            : "bg-indigo-50 text-[#3547D4]"
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 font-medium text-[#111827]">
                      {log.targetType} <span className="font-mono text-slate-400">({log.targetId})</span>
                    </td>
                    <td className="p-3 text-[#64748B] max-w-xs truncate">{log.reason || "N/A"}</td>
                    <td className="p-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedLog(log);
                          setIsInspectorOpen(true);
                        }}
                        className="p-1.5 text-slate-500 hover:text-[#3547D4] hover:bg-slate-100 rounded-lg"
                        title="View Full Payload Inspector"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* AUDIT PAYLOAD INSPECTOR MODAL */}
      {isInspectorOpen && selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in-50">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-sm font-bold text-[#111827]">Audit Record Payload Inspector ({selectedLog.id})</h3>
              <button onClick={() => setIsInspectorOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#F5F7FC] rounded-xl space-y-1">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-[#3547D4]">{selectedLog.action}</span>
                  <span className="font-mono text-slate-400 text-[10px]">{new Date(selectedLog.timestamp).toLocaleString()}</span>
                </div>
                <div className="text-[#111827]">Operator: <strong>{selectedLog.adminName}</strong> ({selectedLog.role})</div>
                <div className="text-slate-500 text-[10px]">Session ID: {selectedLog.sessionId}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 border border-[#E2E8F0] p-3 rounded-xl">
                <div>Target Type: <span className="font-bold text-[#111827]">{selectedLog.targetType}</span></div>
                <div>Target ID: <span className="font-mono font-bold text-[#3547D4]">{selectedLog.targetId}</span></div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <p className="font-bold text-[#111827]">Reason / Moderation Notes:</p>
                <p className="text-slate-700">{selectedLog.reason}</p>
              </div>

              {(selectedLog.previousValue || selectedLog.newValue) && (
                <div className="space-y-1">
                  <p className="font-bold text-[#111827]">State Transition Payload Diff:</p>
                  <div className="p-3 bg-slate-900 text-slate-100 rounded-xl font-mono text-[10px] overflow-x-auto">
                    <div>Previous: {JSON.stringify(selectedLog.previousValue || null, null, 2)}</div>
                    <div className="text-emerald-400 pt-1">New Value: {JSON.stringify(selectedLog.newValue || null, null, 2)}</div>
                  </div>
                </div>
              )}
            </div>
            <div className="pt-2 flex justify-end">
              <button onClick={() => setIsInspectorOpen(false)} className="px-4 py-2 text-xs font-semibold bg-[#F5F7FC] rounded-xl text-[#111827]">
                Close Audit Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
