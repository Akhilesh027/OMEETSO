import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import {
  Menu,
  Search,
  Clock,
  AlertTriangle,
  Bell,
  User,
  Shield,
  Key,
  LogOut,
  ChevronDown,
  Lock,
} from "lucide-react";

interface AdminHeaderProps {
  onToggleMobileSidebar: () => void;
  onOpenGlobalSearch: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  onToggleMobileSidebar,
  onOpenGlobalSearch,
}) => {
  const { admin, logout, switchRoleForTesting } = useAdminAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-20 h-16 bg-white border-b border-[#E2E8F0] shadow-sm flex items-center justify-between px-4 md:px-6">
      {/* Left side: Mobile menu toggle + Global Search trigger */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleMobileSidebar}
          className="md:hidden p-2 text-[#64748B] hover:text-[#111827] rounded-xl hover:bg-slate-100 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar Button */}
        <button
          onClick={onOpenGlobalSearch}
          className="flex items-center space-x-3 px-3.5 py-2 w-48 sm:w-72 bg-[#F5F7FC] hover:bg-slate-100 text-[#64748B] rounded-xl border border-[#E2E8F0] transition-colors text-xs font-medium"
        >
          <Search className="w-4 h-4 text-[#3547D4] shrink-0" />
          <span className="truncate">Search users, listings, stores...</span>
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-[#64748B] bg-white rounded border border-slate-200 ml-auto">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right side: Quick Shortcuts, Notifications, Admin Profile */}
      <div className="flex items-center space-x-2 md:space-x-3">
        {/* Pending Actions Shortcut */}
        <Link
          to="/admin/dashboard/pending-actions"
          className="relative p-2 text-[#64748B] hover:text-[#3547D4] rounded-xl hover:bg-slate-100 transition-colors"
          title="Pending Actions"
        >
          <Clock className="w-5 h-5" />
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#FFB800] text-[9px] font-bold text-slate-900">
            184
          </span>
        </Link>

        {/* Critical Alerts Shortcut */}
        <Link
          to="/admin/dashboard/critical-alerts"
          className="relative p-2 text-[#64748B] hover:text-[#DC3545] rounded-xl hover:bg-slate-100 transition-colors"
          title="Critical Alerts"
        >
          <AlertTriangle className="w-5 h-5" />
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#DC3545] text-[9px] font-bold text-white">
            8
          </span>
        </Link>

        {/* Notification Menu Toggle */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 text-[#64748B] hover:text-[#3547D4] rounded-xl hover:bg-slate-100 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#3547D4]" />
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] p-4 space-y-3 z-30 animate-in fade-in-50">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
                <h4 className="text-xs font-bold text-[#111827]">System Notifications</h4>
                <span className="text-[10px] text-[#3547D4] font-semibold">3 New</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-[#F5F7FC] space-y-0.5">
                  <p className="font-semibold text-[#111827]">Safety Report Escalated</p>
                  <p className="text-[11px] text-[#64748B]">Report #REP-7701 marked critical</p>
                  <span className="text-[9px] text-slate-400">5 mins ago</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 space-y-0.5">
                  <p className="font-semibold text-[#111827]">Store Verification Ready</p>
                  <p className="text-[11px] text-[#64748B]">Kukatpally Hardware submitted docs</p>
                  <span className="text-[9px] text-slate-400">20 mins ago</span>
                </div>
              </div>
              <Link
                to="/admin/notifications"
                onClick={() => setIsNotifOpen(false)}
                className="block text-center text-xs font-semibold text-[#3547D4] hover:underline pt-1"
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>

        <div className="h-6 w-[1px] bg-[#E2E8F0] hidden sm:block" />

        {/* Admin Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-xl bg-[#111E4D] text-[#FFB800] flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
              {admin?.avatar ? (
                <img src={admin.avatar} alt={admin.name} className="w-full h-full object-cover" />
              ) : (
                admin?.name.charAt(0) || "A"
              )}
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-bold text-[#111827] truncate max-w-[120px]">
                {admin?.name || "Admin"}
              </span>
              <span className="text-[10px] text-[#64748B] font-medium truncate max-w-[120px]">
                {admin?.role || "Super Admin"}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-[#64748B] hidden sm:block" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] p-2 space-y-1 z-30 animate-in fade-in-50">
              <div className="p-3 border-b border-[#E2E8F0] space-y-1">
                <p className="text-xs font-bold text-[#111827]">{admin?.name}</p>
                <p className="text-[11px] text-[#64748B]">{admin?.email}</p>
                <div className="pt-1">
                  <span className="inline-block px-2 py-0.5 text-[10px] font-semibold bg-indigo-50 text-[#3547D4] rounded-md">
                    Role: {admin?.role}
                  </span>
                </div>
              </div>

              {/* Dev Testing Role Switcher */}
              <div className="p-2 border-b border-[#E2E8F0]">
                <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">
                  Dev Role Switcher:
                </label>
                <select
                  value={admin?.role}
                  onChange={(e) => switchRoleForTesting?.(e.target.value as any)}
                  className="w-full text-xs p-1.5 rounded-lg border border-[#E2E8F0] bg-[#F5F7FC] focus:outline-none"
                >
                  <option value="Super Admin">Super Admin</option>
                  <option value="Platform Admin">Platform Admin</option>
                  <option value="Listing Moderator">Listing Moderator</option>
                  <option value="Store Moderator">Store Moderator</option>
                  <option value="Advertisement Manager">Advertisement Manager</option>
                  <option value="Finance Manager">Finance Manager</option>
                  <option value="Support Agent">Support Agent</option>
                  <option value="Safety and Fraud Officer">Safety Officer</option>
                  <option value="Analytics Viewer">Analytics Viewer</option>
                </select>
              </div>

              <Link
                to="/admin/admin-users"
                onClick={() => setIsProfileOpen(false)}
                className="flex items-center space-x-2.5 px-3 py-2 text-xs font-medium text-[#111827] hover:bg-slate-50 rounded-xl transition-colors"
              >
                <User className="w-4 h-4 text-[#3547D4]" />
                <span>My Admin Profile</span>
              </Link>
              <Link
                to="/admin/login-activity"
                onClick={() => setIsProfileOpen(false)}
                className="flex items-center space-x-2.5 px-3 py-2 text-xs font-medium text-[#111827] hover:bg-slate-50 rounded-xl transition-colors"
              >
                <Key className="w-4 h-4 text-[#3547D4]" />
                <span>Login Activity</span>
              </Link>
              <Link
                to="/admin/settings"
                onClick={() => setIsProfileOpen(false)}
                className="flex items-center space-x-2.5 px-3 py-2 text-xs font-medium text-[#111827] hover:bg-slate-50 rounded-xl transition-colors"
              >
                <Lock className="w-4 h-4 text-[#3547D4]" />
                <span>Security Settings</span>
              </Link>

              <div className="border-t border-[#E2E8F0] pt-1">
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    logout();
                    navigate("/admin/login");
                  }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-semibold text-[#DC3545] hover:bg-red-50 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout Console</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
