import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { MOCK_LIVE_ACTIVITIES, LiveActivityItem } from "@/data/liveActivity";
import { Activity, ShieldAlert, Store, Package, Megaphone, CreditCard, UserPlus, Filter, RefreshCw, ChevronRight } from "lucide-react";

export default function LiveActivityPage() {
  const [filterType, setFilterType] = useState<string>("all");
  const [activities, setActivities] = useState<LiveActivityItem[]>(MOCK_LIVE_ACTIVITIES);
  const navigate = useNavigate();

  const filtered = filterType === "all"
    ? activities
    : activities.filter((a) => a.type === filterType);

  const getBadgeClass = (color: LiveActivityItem["badgeColor"]) => {
    switch (color) {
      case "error": return "bg-red-50 text-[#DC3545] border-red-200";
      case "warning": return "bg-amber-50 text-[#F59E0B] border-amber-200";
      case "success": return "bg-emerald-50 text-[#16A36A] border-emerald-200";
      case "info": return "bg-blue-50 text-[#2563EB] border-blue-200";
      default: return "bg-indigo-50 text-[#3547D4] border-indigo-200";
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Live Platform Activity Feed"
        description="Real-time feed simulator of user registrations, listing submissions, safety reports, and promotional payments across Hyderabad regions."
        badge="Live Stream"
        badgeColor="indigo"
        secondaryActions={
          <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-xl border border-[#E2E8F0] shadow-sm text-xs">
            <Filter className="w-3.5 h-3.5 text-[#3547D4]" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-transparent font-semibold text-[#111827] focus:outline-none cursor-pointer"
            >
              <option value="all">All Activity Types</option>
              <option value="report_filed">Safety Reports</option>
              <option value="store_applied">Store Verification</option>
              <option value="listing_created">New Listings</option>
              <option value="ad_submitted">Ad Submissions</option>
              <option value="payment_completed">Payments</option>
              <option value="user_registered">User Onboarding</option>
            </select>
          </div>
        }
      />

      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden divide-y divide-[#E2E8F0]">
        {filtered.map((item) => (
          <div
            key={item.id}
            onClick={() => navigate(item.targetRoute)}
            className="p-4 md:p-5 hover:bg-[#F5F7FC] transition-colors cursor-pointer flex items-center justify-between group"
          >
            <div className="flex items-start space-x-4 min-w-0">
              <div className={`p-3 rounded-2xl border ${getBadgeClass(item.badgeColor)} shrink-0 mt-0.5`}>
                <Activity className="w-5 h-5" />
              </div>
              <div className="space-y-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h4 className="text-xs font-bold text-[#111827] group-hover:text-[#3547D4] transition-colors truncate">
                    {item.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">({item.id})</span>
                </div>
                <p className="text-xs text-[#64748B] leading-relaxed">{item.description}</p>
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-0.5">
                  <span className="font-semibold text-[#111827]">User: {item.user}</span>
                  <span>•</span>
                  <span>Location: {item.location}</span>
                  <span>•</span>
                  <span className="text-[#3547D4] font-medium">{item.timestamp}</span>
                </div>
              </div>
            </div>

            <div className="shrink-0 pl-4 text-slate-300 group-hover:text-[#3547D4] transition-colors">
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
