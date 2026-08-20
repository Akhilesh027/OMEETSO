import React from "react";
import { Link } from "react-router-dom";
import { ShieldX, Home, ArrowLeft } from "lucide-react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

export default function AccessDeniedPage() {
  const { admin } = useAdminAuth();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#E2E8F0] shadow-xl p-8 space-y-6">
        <div className="inline-flex p-4 rounded-2xl bg-red-50 text-[#DC3545]">
          <ShieldX className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold text-[#111827]">Access Denied</h1>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Your current role (<span className="font-bold text-[#111827]">{admin?.role || "Guest"}</span>) does not have sufficient permissions to view this resource.
          </p>
        </div>

        <div className="bg-[#F5F7FC] p-3.5 rounded-2xl border border-[#E2E8F0] text-xs text-left space-y-1">
          <p className="font-semibold text-[#111827]">Logged in as:</p>
          <p className="text-[#64748B]">{admin?.email}</p>
          <p className="text-[10px] text-[#3547D4] font-medium pt-1">
            If you need access to this section, contact your Super Admin.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold border border-[#E2E8F0] bg-white text-[#111827] hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
          <Link
            to="/admin/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#3547D4] text-white hover:bg-[#111E4D] transition-colors shadow-sm"
          >
            <Home className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
