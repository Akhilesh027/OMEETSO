import React from "react";
import { Breadcrumbs } from "./Breadcrumbs";

interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: string;
  badgeColor?: "warning" | "error" | "info" | "success" | "indigo" | "amber" | "emerald" | "purple" | "blue";
  primaryAction?: React.ReactNode;
  secondaryActions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  badge,
  badgeColor = "indigo",
  primaryAction,
  secondaryActions,
}) => {
  const badgeClasses: Record<string, string> = {
    warning: "bg-amber-50 text-[#F59E0B] border-amber-200",
    amber: "bg-amber-50 text-[#F59E0B] border-amber-200",
    error: "bg-red-50 text-[#DC3545] border-red-200",
    info: "bg-blue-50 text-[#2563EB] border-blue-200",
    blue: "bg-blue-50 text-[#2563EB] border-blue-200",
    success: "bg-emerald-50 text-[#16A36A] border-emerald-200",
    emerald: "bg-emerald-50 text-[#16A36A] border-emerald-200",
    indigo: "bg-indigo-50 text-[#3547D4] border-indigo-200",
    purple: "bg-purple-50 text-[#7C3AED] border-purple-200",
  };

  return (
    <div className="mb-6 space-y-2">
      <Breadcrumbs />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-1">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#111827]">{title}</h1>
            {badge && (
              <span
                className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${badgeClasses[badgeColor]}`}
              >
                {badge}
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs md:text-sm text-[#64748B] mt-0.5 leading-relaxed max-w-3xl">
              {description}
            </p>
          )}
        </div>

        {(primaryAction || secondaryActions) && (
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {secondaryActions}
            {primaryAction}
          </div>
        )}
      </div>
    </div>
  );
};
