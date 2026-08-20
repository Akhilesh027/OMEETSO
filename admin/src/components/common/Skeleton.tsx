import React from "react";

export const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`animate-pulse bg-slate-200/80 rounded ${className}`} />
);

export const DashboardCardSkeleton: React.FC = () => (
  <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-3">
    <div className="flex items-center justify-between">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
    <Skeleton className="h-8 w-24" />
    <Skeleton className="h-3 w-36" />
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden p-4 space-y-3">
    <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-8 w-24 rounded-lg" />
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center space-x-4 py-2">
        <Skeleton className="h-10 w-10 rounded-full shrink-0" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-6 w-16 rounded-md" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
    ))}
  </div>
);

export const ChartSkeleton: React.FC = () => (
  <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-8 w-28 rounded-lg" />
    </div>
    <Skeleton className="h-56 w-full rounded-xl" />
  </div>
);
