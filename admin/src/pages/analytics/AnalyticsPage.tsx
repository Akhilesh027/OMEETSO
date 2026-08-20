import React from "react";
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
} from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

export default function AnalyticsPage() {
  const { showSuccess } = useToast();

  const handleExportReport = () => {
    showSuccess("Analytics Exported", "Downloaded monthly platform performance PDF summary.");
  };

  return (
    <PageContainer>
      <PageHeader
        title="Platform Analytics & Executive Reports"
        description="Comprehensive analytics tracking GMV volume, user growth, store verifications, and regional marketplace performance."
        badge="Live Analytics"
        badgeColor="indigo"
        primaryAction={
          <button
            onClick={handleExportReport}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#3547D4] text-white hover:bg-[#111E4D] transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export Executive Summary (PDF)</span>
          </button>
        }
      />

      {/* Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>Monthly Platform Volume</span>
            <DollarSign className="w-4 h-4 text-[#3547D4]" />
          </div>
          <div className="text-xl font-extrabold text-[#111827]">₹42,50,000</div>
          <div className="text-[11px] font-bold text-[#16A36A]">↑ +18.4% vs last month</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>Registered Users</span>
            <Users className="w-4 h-4 text-[#2563EB]" />
          </div>
          <div className="text-xl font-extrabold text-[#111827]">4,250</div>
          <div className="text-[11px] font-bold text-[#16A36A]">↑ +12.1% growth</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>Active Listings Catalog</span>
            <Package className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-extrabold text-[#111827]">1,840</div>
          <div className="text-[11px] font-bold text-[#16A36A]">↑ +8.5% active ads</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>Verified Seller Stores</span>
            <Store className="w-4 h-4 text-[#16A36A]" />
          </div>
          <div className="text-xl font-extrabold text-[#111827]">148 Stores</div>
          <div className="text-[11px] font-bold text-[#16A36A]">98.2% verification rate</div>
        </div>
      </div>

      {/* Regional City Performance Breakdown */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5 space-y-4">
        <h3 className="text-sm font-bold text-[#111827] flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-[#3547D4]" />
          <span>Regional Market Analytics (City Breakdown)</span>
        </h3>

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
              <tr>
                <td className="p-3 font-bold text-[#111827]">Hyderabad (Gachibowli, Kondapur, HITEC City)</td>
                <td className="p-3 font-bold text-[#3547D4]">820</td>
                <td className="p-3">68 Stores</td>
                <td className="p-3 font-bold text-[#16A36A]">₹21,40,000</td>
                <td className="p-3 font-bold text-amber-600">₹1,20,000</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-[#111827]">Secunderabad & Jubilee Hills</td>
                <td className="p-3 font-bold text-[#3547D4]">510</td>
                <td className="p-3">42 Stores</td>
                <td className="p-3 font-bold text-[#16A36A]">₹13,10,000</td>
                <td className="p-3 font-bold text-amber-600">₹75,000</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-[#111827]">Kukatpally & Miyapur</td>
                <td className="p-3 font-bold text-[#3547D4]">360</td>
                <td className="p-3">28 Stores</td>
                <td className="p-3 font-bold text-[#16A36A]">₹8,00,000</td>
                <td className="p-3 font-bold text-amber-600">₹45,000</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  );
}
