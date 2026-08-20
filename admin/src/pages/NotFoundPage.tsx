import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Home, ArrowLeft, FileQuestion } from "lucide-react";

export default function NotFoundPage() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F5F7FC] flex flex-col items-center justify-center p-6 text-center text-[#111827]">
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#E2E8F0] shadow-xl p-8 space-y-6">
        <div className="inline-flex p-4 rounded-2xl bg-amber-50 text-[#FFB800]">
          <FileQuestion className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-[#111827]">Page Not Found</h1>
          <p className="text-xs text-[#64748B] leading-relaxed">
            The admin route you requested does not exist or has been relocated.
          </p>
        </div>

        <div className="bg-[#F5F7FC] p-3 rounded-xl border border-[#E2E8F0] text-left">
          <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-0.5">
            Requested Path:
          </span>
          <code className="text-xs font-mono text-[#3547D4] break-all">{location.pathname}</code>
        </div>

        <div className="flex flex-col space-y-2.5 pt-2">
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center justify-center space-x-2 py-2.5 rounded-xl font-bold text-xs bg-[#3547D4] text-white hover:bg-[#111E4D] transition-colors shadow-sm"
          >
            <Home className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center space-x-2 py-2.5 rounded-xl font-semibold text-xs border border-[#E2E8F0] text-[#111827] hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    </div>
  );
}
