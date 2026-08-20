import React from "react";
import { Shield } from "lucide-react";

export const RouteLoader: React.FC<{ message?: string }> = ({
  message = "Loading Omeetso Admin Console...",
}) => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#F5F7FC] text-[#111827] p-6">
      <div className="flex flex-col items-center space-y-4 max-w-sm text-center">
        <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-[#111E4D] text-[#FFB800] shadow-lg shadow-indigo-950/20">
          <Shield className="w-8 h-8 animate-pulse" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4D6BFF] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-[#3547D4]"></span>
          </span>
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold tracking-tight text-[#111E4D]">Omeetso Admin Console</h2>
          <p className="text-xs text-[#64748B] font-medium">{message}</p>
        </div>
        <div className="w-48 h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
          <div className="w-full h-full bg-gradient-to-r from-[#3547D4] to-[#4D6BFF] animate-pulse rounded-full" />
        </div>
      </div>
    </div>
  );
};
