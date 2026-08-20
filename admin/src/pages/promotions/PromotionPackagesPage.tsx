import React, { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { getAdminAdProductsApi } from "@/api/adminAds.api";
import { PackagePlus, CheckCircle, Zap, Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

export default function PromotionPackagesPage() {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showError } = useToast();

  const loadPackages = useCallback(async () => {
    setLoading(true);
    const res = await getAdminAdProductsApi();
    setLoading(false);
    if (res.success && res.data) {
      setPackages(res.data);
    } else {
      showError("Failed to Load Packages", res.error);
    }
  }, [showError]);

  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  return (
    <PageContainer>
      <PageHeader
        title="Promotions & Monetization Packages"
        description="Dynamic pricing plans for Listing Search Priority Boosts and Custom Banner Campaigns."
        badge={`${packages.length} Active Pricing Packages`}
        badgeColor="indigo"
        secondaryActions={
          <button
            onClick={loadPackages}
            className="p-2 bg-white border border-[#E2E8F0] hover:bg-slate-50 text-slate-700 rounded-xl transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full p-12 text-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#3547D4]" />
            Loading live MongoDB pricing packages...
          </div>
        ) : packages.length === 0 ? (
          <div className="col-span-full p-12 text-center text-slate-400">
            No pricing packages found.
          </div>
        ) : (
          packages.map((pkg) => (
            <div key={pkg.id || pkg._id} className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-full bg-blue-100 text-[#3547D4]">
                  {pkg.campaignType}
                </span>
                <span className="text-xs font-extrabold text-emerald-600">
                  ₹{((pkg.priceInPaise || 0) / 100).toLocaleString("en-IN")}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-[#111827]">{pkg.name}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{pkg.description}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <div>Duration: <span className="font-bold text-[#111827]">{pkg.durationDays} Days</span></div>
                <div>Permitted Placements: <span className="font-bold text-[#3547D4]">{pkg.permittedPlacements?.join(", ")}</span></div>
              </div>
            </div>
          ))
        )}
      </div>
    </PageContainer>
  );
}
