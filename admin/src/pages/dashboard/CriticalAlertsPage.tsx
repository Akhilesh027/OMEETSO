import React from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { MOCK_CRITICAL_ALERTS } from "@/data/criticalAlerts";
import { AlertTriangle, ShieldAlert, ArrowRight, CheckCircle2 } from "lucide-react";

export default function CriticalAlertsPage() {
  const navigate = useNavigate();

  return (
    <PageContainer>
      <PageHeader
        title="Critical Security & Operations Alerts"
        description="Immediate attention flags for fraud spikes, system errors, high-value payout holds, and security threats."
        badge={`${MOCK_CRITICAL_ALERTS.length} Critical Flags`}
        badgeColor="error"
      />

      <div className="space-y-4">
        {MOCK_CRITICAL_ALERTS.map((alert) => (
          <div
            key={alert.id}
            className="bg-white p-5 rounded-2xl border border-red-200 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-[#DC3545]" />

            <div className="flex items-start space-x-4 min-w-0 pl-2">
              <div className="p-3 rounded-2xl bg-red-50 text-[#DC3545] shrink-0 mt-0.5">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 text-[10px] font-extrabold bg-red-100 text-[#DC3545] rounded-full uppercase">
                    {alert.severity}
                  </span>
                  <span className="text-xs font-mono text-slate-400">({alert.id})</span>
                  <h3 className="text-sm font-bold text-[#111827]">{alert.title}</h3>
                </div>
                <p className="text-xs text-[#64748B] leading-relaxed max-w-3xl">
                  {alert.description}
                </p>
                <div className="flex items-center space-x-3 text-[11px] text-slate-500 pt-1">
                  <span>Affected Records: <strong className="text-[#111827]">{alert.affectedCount}</strong></span>
                  <span>•</span>
                  <span>Detected: {alert.timestamp}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate(alert.targetRoute)}
              className="px-4 py-2.5 bg-[#DC3545] text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-colors shrink-0 shadow-sm flex items-center space-x-1.5"
            >
              <span>{alert.actionText}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
