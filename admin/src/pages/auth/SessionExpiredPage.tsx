import React from "react";
import { Link } from "react-router-dom";
import { Clock, LogIn } from "lucide-react";

export default function SessionExpiredPage() {
  return (
    <div className="text-center space-y-5">
      <div className="inline-flex p-3.5 rounded-2xl bg-amber-50 text-[#F59E0B] mx-auto">
        <Clock className="w-8 h-8" />
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-[#111827]">Session Expired</h2>
        <p className="text-xs text-[#64748B] leading-relaxed max-w-xs mx-auto">
          Your security token has expired after 24 hours of inactivity. Please re-authenticate to continue.
        </p>
      </div>

      <Link
        to="/admin/login"
        className="inline-flex items-center justify-center space-x-2 w-full py-3 rounded-xl font-bold text-xs bg-[#3547D4] text-white hover:bg-[#111E4D] transition-colors shadow-lg shadow-indigo-950/20"
      >
        <LogIn className="w-4 h-4" />
        <span>Re-Login to Console</span>
      </Link>
    </div>
  );
}
