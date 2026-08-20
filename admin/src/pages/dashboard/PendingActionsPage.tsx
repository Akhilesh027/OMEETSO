import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { MOCK_PENDING_ACTIONS, PendingActionItem } from "@/data/pendingActions";
import { Clock, Filter, ChevronRight, AlertTriangle, ArrowRight } from "lucide-react";

export default function PendingActionsPage() {
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const navigate = useNavigate();

  const filtered = filterCategory === "all"
    ? MOCK_PENDING_ACTIONS
    : MOCK_PENDING_ACTIONS.filter((a) => a.category === filterCategory);

  return (
    <PageContainer>
      <PageHeader
        title="Pending Actions Queue"
        description="Unified task list of items awaiting operator moderation, GST review, refund approval, or escalation resolution."
        badge={`${filtered.length} Items Pending`}
        badgeColor="warning"
        secondaryActions={
          <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-xl border border-[#E2E8F0] shadow-sm text-xs">
            <Filter className="w-3.5 h-3.5 text-[#3547D4]" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-transparent font-semibold text-[#111827] focus:outline-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="listing">Listings Pending</option>
              <option value="store">Store Applications</option>
              <option value="campaign">Ad Campaigns</option>
              <option value="refund">Refund Requests</option>
              <option value="safety">Safety Reports</option>
              <option value="support">Escalated Tickets</option>
            </select>
          </div>
        }
      />

      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden divide-y divide-[#E2E8F0]">
        {filtered.map((item) => (
          <div
            key={item.id}
            onClick={() => navigate(item.targetRoute)}
            className="p-5 hover:bg-[#F5F7FC] transition-colors cursor-pointer flex items-center justify-between group"
          >
            <div className="space-y-1.5 min-w-0 pr-4">
              <div className="flex items-center space-x-2.5">
                <span
                  className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full uppercase tracking-wider ${
                    item.priority === "critical"
                      ? "bg-red-100 text-[#DC3545]"
                      : item.priority === "high"
                      ? "bg-amber-100 text-amber-900"
                      : "bg-blue-100 text-[#2563EB]"
                  }`}
                >
                  {item.priority} Priority
                </span>
                <span className="text-xs font-mono text-slate-400">#{item.id}</span>
                <h4 className="text-sm font-bold text-[#111827] group-hover:text-[#3547D4] transition-colors truncate">
                  {item.title}
                </h4>
              </div>

              <p className="text-xs text-[#64748B] leading-relaxed">{item.subtitle}</p>

              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1">
                <span>Submitted by: <strong className="text-[#111827]">{item.submittedBy}</strong></span>
                <span>•</span>
                <span>Location: {item.location}</span>
                <span>•</span>
                <span>Received: {item.createdAt}</span>
              </div>
            </div>

            <div className="shrink-0 flex items-center space-x-2 text-xs font-bold text-[#3547D4]">
              <span className="hidden sm:inline">Resolve Action</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
