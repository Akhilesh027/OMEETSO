import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { ROLE_DEFINITIONS } from "@/permissions/roles";
import { MockDataService, type FeatureFlags } from "@/services/mockDataService";
import { Lock, Shield, CheckCircle2, Sliders, ToggleLeft, ToggleRight, Eye, Save } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

export default function RolesPage() {
  const [activeTab, setActiveTab] = useState<"roles" | "flags">("roles");
  const [flags, setFlags] = useState<FeatureFlags>({
    maintenanceMode: false,
    adBoostingEnabled: true,
    autoGstinVerification: false,
    platformFeePercent: 2.5,
  });

  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  const { showSuccess } = useToast();

  useEffect(() => {
    setFlags(MockDataService.getFeatureFlags());
  }, []);

  const roles = Object.values(ROLE_DEFINITIONS);

  const handleToggleFlag = (key: keyof FeatureFlags) => {
    const updated = MockDataService.updateFeatureFlags({ [key]: !flags[key] });
    setFlags(updated);
    showSuccess("Platform Settings Updated", `Toggled ${key} to ${updated[key]}.`);
  };

  const handleUpdateFee = (fee: number) => {
    const updated = MockDataService.updateFeatureFlags({ platformFeePercent: fee });
    setFlags(updated);
    showSuccess("Platform Fee Updated", `Set platform commission fee to ${fee}%.`);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Admin Roles & Platform System Controls"
        description="Configuration definitions for the 9 platform operator roles, permission matrix, and feature flags."
        badge="Platform Administration"
        badgeColor="indigo"
      />

      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5 space-y-4">
        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 pb-3 border-b border-[#E2E8F0] text-xs">
          <button
            onClick={() => setActiveTab("roles")}
            className={`px-4 py-2 rounded-xl font-bold transition-colors ${
              activeTab === "roles"
                ? "bg-[#3547D4] text-white shadow-sm"
                : "bg-[#F5F7FC] text-[#64748B] hover:bg-slate-200"
            }`}
          >
            Admin Roles & Permission Matrix (9 Roles)
          </button>
          <button
            onClick={() => setActiveTab("flags")}
            className={`px-4 py-2 rounded-xl font-bold transition-colors ${
              activeTab === "flags"
                ? "bg-[#3547D4] text-white shadow-sm"
                : "bg-[#F5F7FC] text-[#64748B] hover:bg-slate-200"
            }`}
          >
            Feature Flags & Maintenance Settings
          </button>
        </div>

        {activeTab === "roles" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map((role) => (
              <div
                key={role.name}
                className="bg-slate-50 p-5 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#111827]">{role.name}</h3>
                    {role.isSystem && (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-100 text-[#3547D4] rounded-md">
                        System Core
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#64748B] leading-relaxed">{role.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-200 text-xs flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Granted Permissions: <strong className="text-[#3547D4]">{role.permissions.length}</strong></span>
                  <button
                    onClick={() => {
                      setSelectedRole(role);
                      setIsRoleModalOpen(true);
                    }}
                    className="px-3 py-1 bg-white border border-[#E2E8F0] font-bold text-[#3547D4] rounded-lg hover:bg-indigo-50"
                  >
                    Inspect Matrix
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="max-w-2xl space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-[#E2E8F0] space-y-4">
              <h4 className="text-sm font-bold text-[#111827]">Global Platform Feature Controls</h4>

              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-[#E2E8F0]">
                <div>
                  <div className="font-bold text-[#111827]">Platform Maintenance Mode</div>
                  <div className="text-[11px] text-[#64748B]">Displays system maintenance banner to users when enabled.</div>
                </div>
                <button
                  onClick={() => handleToggleFlag("maintenanceMode")}
                  className={`px-3 py-1.5 rounded-xl font-bold ${
                    flags.maintenanceMode ? "bg-[#DC3545] text-white" : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {flags.maintenanceMode ? "ENABLED (Active Maintenance)" : "Disabled (Normal Operations)"}
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-[#E2E8F0]">
                <div>
                  <div className="font-bold text-[#111827]">Ad Boosting Engine</div>
                  <div className="text-[11px] text-[#64748B]">Allows sellers to boost product listings to sponsored placements.</div>
                </div>
                <button
                  onClick={() => handleToggleFlag("adBoostingEnabled")}
                  className={`px-3 py-1.5 rounded-xl font-bold ${
                    flags.adBoostingEnabled ? "bg-[#16A36A] text-white" : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {flags.adBoostingEnabled ? "Enabled ✓" : "Disabled ✕"}
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-[#E2E8F0]">
                <div>
                  <div className="font-bold text-[#111827]">Automated GSTIN Document Verification</div>
                  <div className="text-[11px] text-[#64748B]">Auto-verifies store GSTIN API payloads against tax portal.</div>
                </div>
                <button
                  onClick={() => handleToggleFlag("autoGstinVerification")}
                  className={`px-3 py-1.5 rounded-xl font-bold ${
                    flags.autoGstinVerification ? "bg-[#16A36A] text-white" : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {flags.autoGstinVerification ? "Enabled ✓" : "Disabled ✕"}
                </button>
              </div>

              <div className="p-3 bg-white rounded-xl border border-[#E2E8F0] space-y-2">
                <div className="font-bold text-[#111827]">Platform Marketplace Fee Commission (%)</div>
                <div className="flex items-center space-x-3">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.5"
                    value={flags.platformFeePercent}
                    onChange={(e) => handleUpdateFee(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#3547D4]"
                  />
                  <span className="font-extrabold text-sm text-[#3547D4] shrink-0">{flags.platformFeePercent}%</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ROLE PERMISSION MATRIX INSPECTOR MODAL */}
      {isRoleModalOpen && selectedRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in-50">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-sm font-bold text-[#111827]">Permission Matrix — {selectedRole.name}</h3>
              <button onClick={() => setIsRoleModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="space-y-3 text-xs">
              <p className="text-[#64748B]">{selectedRole.description}</p>
              <div className="max-h-60 overflow-y-auto border border-[#E2E8F0] p-3 rounded-xl space-y-1">
                <div className="font-bold text-[#111827] mb-2">Granted Permissions List ({selectedRole.permissions.length}):</div>
                {selectedRole.permissions.map((p: string) => (
                  <div key={p} className="flex items-center space-x-2 text-[11px] font-mono text-slate-700 bg-slate-50 p-1.5 rounded">
                    <span className="text-[#16A36A]">✓</span>
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-2 flex justify-end">
              <button onClick={() => setIsRoleModalOpen(false)} className="px-4 py-2 text-xs font-semibold bg-[#F5F7FC] rounded-xl text-[#111827]">
                Close Matrix
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
