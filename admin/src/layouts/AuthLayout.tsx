import React from "react";
import { Outlet } from "react-router-dom";
import { Shield } from "lucide-react";
import { OfflineState } from "@/components/common/OfflineState";

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0D173D] via-[#111E4D] to-[#0D173D] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <OfflineState />

      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-[#4D6BFF]_1px,transparent_1px] [background-size:24px_24px] pointer-events-none" />

      {/* Main Container Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-white/10 text-[#111827] overflow-hidden relative z-10 my-8">
        {/* Brand Bar Header */}
        <div className="bg-[#111E4D] p-6 text-white text-center space-y-2 relative">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#3547D4] to-[#4D6BFF] text-[#FFB800] shadow-lg shadow-indigo-950/50">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white">Omeetso Admin Console</h1>
            <p className="text-xs text-indigo-200 font-medium">Enterprise Management Platform</p>
          </div>
        </div>

        {/* Dynamic Auth Page */}
        <div className="p-6 md:p-8">
          <Outlet />
        </div>
      </div>

      <footer className="text-center text-xs text-slate-400 font-medium relative z-10">
        &copy; {new Date().getFullYear()} Omeetso Technologies. Internal Operator Access Only.
      </footer>
    </div>
  );
};
