import React from "react";
import { Link } from "react-router-dom";
import { Lock, AlertOctagon, HelpCircle } from "lucide-react";

export default function AccountLockedPage() {
  return (
    <div className="text-center space-y-5">
      <div className="inline-flex p-3.5 rounded-2xl bg-red-50 text-[#DC3545] mx-auto">
        <Lock className="w-8 h-8" />
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-[#111827]">Account Temporarily Locked</h2>
        <p className="text-xs text-[#64748B] leading-relaxed max-w-xs mx-auto">
          Due to 5 consecutive failed login attempts, this admin account has been locked for 15 minutes to protect platform security.
        </p>
      </div>

      <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-left text-xs space-y-1 text-red-900">
        <div className="flex items-center space-x-2 font-bold">
          <AlertOctagon className="w-4 h-4 text-[#DC3545]" />
          <span>Security Protocol Triggered</span>
        </div>
        <p className="text-[11px] text-red-800 leading-relaxed">
          An audit notification has been dispatched to the Safety & Fraud Officer.
        </p>
      </div>

      <div className="space-y-2 pt-2">
        <Link
          to="/admin/login"
          className="inline-flex items-center justify-center space-x-2 w-full py-3 rounded-xl font-bold text-xs bg-[#3547D4] text-white hover:bg-[#111E4D] transition-colors shadow-lg shadow-indigo-950/20"
        >
          <span>Try Again Later</span>
        </Link>
        <Link
          to="/admin/support"
          className="inline-flex items-center justify-center space-x-1.5 text-xs text-[#64748B] hover:text-[#111827] font-semibold"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Contact Security Operations</span>
        </Link>
      </div>
    </div>
  );
}
