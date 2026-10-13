import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import {
  BarChart3,
  TrendingUp,
  Users,
  Package,
  Store,
  DollarSign,
  Download,
  MapPin,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import { getPlatformAnalyticsApi, PlatformAnalyticsData } from "@/api/adminDashboard.api";

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<PlatformAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showSuccess, showError } = useToast();

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await getPlatformAnalyticsApi();
      if (res.success && res.data) {
        setAnalytics(res.data);
      } else if (res.error) {
        showError("Failed to fetch analytics", res.error);
      }
    } catch {
      showError("Error", "Could not fetch platform analytics");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleExportReport = () => {
    if (!analytics) {
      showError("Export Failed", "No analytics data available to export.");
      return;
    }

    const headers = ["City Region", "Active Listings", "Verified Stores", "Monthly GMV (INR)", "Ad Boost Volume (INR)"];
    const rows = (analytics.cities || []).map((c) => [
      `"${c.city.replace(/"/g, '""')}"`,
      c.activeListings,
      `"${c.verifiedStores}"`,
      c.monthlyGMV,
      c.adBoostVolume,
    ]);

    const summaryBlock = [
      ["METRIC", "VALUE"],
      ["Total Monthly Platform Volume", `INR ${analytics.monthlyVolume}`],
      ["Registered Users", analytics.registeredUsers],
      ["Active Listings", analytics.activeListings],
      ["Verified Stores", analytics.verifiedStores],
      ["Verification Rate", analytics.verificationRate],
      [],
      headers,
      ...rows,
    ];

    const csvContent = "data:text/csv;charset=utf-8," + summaryBlock.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `omeetso_executive_analytics_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showSuccess("Analytics Exported", "Downloaded executive performance summary report.");
  };

  return (
    <PageContainer>
      <PageHeader
        title="Platform Analytics & Executive Reports"
        description="Comprehensive live analytics tracking GMV volume, user growth, store verifications, and regional marketplace performance."
        badge="Live Analytics"
        badgeColor="indigo"
        primaryAction={
          <div className="flex items-center space-x-2">
            <button
              onClick={fetchAnalytics}
              disabled={isLoading}
              className="inline-flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-semibold bg-[#F5F7FC] text-[#111827] hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>{isLoading ? "Refreshing..." : "Refresh"}</span>
            </button>
            <button
              onClick={handleExportReport}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#3547D4] text-white hover:bg-[#111E4D] transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Export Executive Summary</span>
            </button>
          </div>
        }
      />

      {/* Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>Monthly Platform Volume</span>
            <DollarSign className="w-4 h-4 text-[#3547D4]" />
          </div>
          <div className="text-xl font-extrabold text-[#111827]">
            {isLoading ? "..." : `₹${(analytics?.monthlyVolume || 0).toLocaleString("en-IN")}`}
          </div>
          <div className="text-[11px] font-bold text-[#16A36A]">Real-time Gross Value</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>Registered Users</span>
            <Users className="w-4 h-4 text-[#2563EB]" />
          </div>
          <div className="text-xl font-extrabold text-[#111827]">
            {isLoading ? "..." : (analytics?.registeredUsers || 0).toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] font-bold text-[#16A36A]">Active Platform Accounts</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>Active Listings Catalog</span>
            <Package className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-extrabold text-[#111827]">
            {isLoading ? "..." : (analytics?.activeListings || 0).toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] font-bold text-[#16A36A]">Published Marketplace Ads</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>Verified Seller Stores</span>
            <Store className="w-4 h-4 text-[#16A36A]" />
          </div>
          <div className="text-xl font-extrabold text-[#111827]">
            {isLoading ? "..." : analytics?.verifiedStores || "0 Stores"}
          </div>
          <div className="text-[11px] font-bold text-[#16A36A]">
            {analytics?.verificationRate || "100%"} verification rate
          </div>
        </div>
      </div>

      {/* Regional City Performance Breakdown */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#111827] flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-[#3547D4]" />
            <span>Regional Market Analytics (City Breakdown)</span>
          </h3>
          <span className="text-xs text-[#64748B]">
            {analytics?.cities?.length || 0} active {analytics?.cities?.length === 1 ? "region" : "regions"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F7FC] text-[#64748B] font-bold uppercase text-[10px] border-b border-[#E2E8F0]">
              <tr>
                <th className="p-3">City Region</th>
                <th className="p-3">Active Listings</th>
                <th className="p-3">Verified Stores</th>
                <th className="p-3">Monthly GMV</th>
                <th className="p-3">Ad Boost Volume</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-400">
                    Loading live analytics...
                  </td>
                </tr>
              ) : !analytics?.cities || analytics.cities.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-400">
                    No regional metrics recorded yet.
                  </td>
                </tr>
              ) : (
                analytics.cities.map((cityRow, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-bold text-[#111827]">{cityRow.city}</td>
                    <td className="p-3 font-bold text-[#3547D4]">{cityRow.activeListings}</td>
                    <td className="p-3">{cityRow.verifiedStores}</td>
                    <td className="p-3 font-bold text-[#16A36A]">₹{cityRow.monthlyGMV.toLocaleString("en-IN")}</td>
                    <td className="p-3 font-bold text-amber-600">₹{cityRow.adBoostVolume.toLocaleString("en-IN")}</td>
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
