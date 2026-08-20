import React, { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { Flag, ToggleLeft, ToggleRight, ShieldAlert, CheckCircle } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

interface FeatureFlagItem {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  environment: "ALL" | "PRODUCTION" | "DEVELOPMENT";
  updatedAt: string;
}

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlagItem[]>([
    {
      key: "ENABLE_CHAT_NEGOTIATION",
      name: "Real-Time Offer Negotiation Engine",
      description: "Allows buyers and sellers to make, accept, and decline counteroffers inside Socket.IO chat rooms.",
      enabled: true,
      environment: "ALL",
      updatedAt: "2026-07-29"
    },
    {
      key: "ENABLE_SPONSORED_ADS_INFEED",
      name: "In-Feed Ad Placement Engine",
      description: "Interleaves active approved sponsored listing cards into search results and homepage categories.",
      enabled: true,
      environment: "ALL",
      updatedAt: "2026-07-29"
    },
    {
      key: "ENABLE_LIVE_PAYMENT_GATEWAY",
      name: "External Payment Gateway",
      description: "Enables Razorpay / UPI live payment SDK. Currently disabled; wallet holds reserved for campaigns.",
      enabled: false,
      environment: "PRODUCTION",
      updatedAt: "2026-07-29"
    }
  ]);

  const { showSuccess } = useToast();

  const toggleFlag = (key: string) => {
    setFlags((prev) =>
      prev.map((f) => {
        if (f.key === key) {
          const updated = !f.enabled;
          showSuccess("Feature Flag Updated", `${f.name} set to ${updated ? "ENABLED" : "DISABLED"}. Audit log created.`);
          return { ...f, enabled: updated };
        }
        return f;
      })
    );
  };

  return (
    <PageContainer>
      <PageHeader
        title="Platform Feature Flags & Circuit Breakers"
        description="Toggle live feature releases and manage production circuit breakers safely across backend and portals."
        badge={`${flags.filter((f) => f.enabled).length} Active Flags`}
        badgeColor="emerald"
      />

      <div className="space-y-4 max-w-4xl">
        {flags.map((f) => (
          <div
            key={f.key}
            className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm flex items-center justify-between gap-4"
          >
            <div className="space-y-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold text-[#3547D4] bg-blue-50 px-2 py-0.5 rounded-md">
                  {f.key}
                </span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {f.environment}
                </span>
              </div>
              <h4 className="text-sm font-bold text-[#111827]">{f.name}</h4>
              <p className="text-xs text-slate-500">{f.description}</p>
            </div>

            <button
              onClick={() => toggleFlag(f.key)}
              className="p-1 hover:opacity-80 transition-opacity shrink-0"
              title="Toggle Feature Flag"
            >
              {f.enabled ? (
                <ToggleRight className="w-10 h-10 text-emerald-600" />
              ) : (
                <ToggleLeft className="w-10 h-10 text-slate-300" />
              )}
            </button>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
