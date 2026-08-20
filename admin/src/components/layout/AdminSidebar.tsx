import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { ADMIN_NAVIGATION } from "@/constants/adminNavigation";
import { NavItem } from "@/types/navigation";
import type { Permission } from "@/permissions/permissions";
import {
  Shield,
  LayoutDashboard,
  Users,
  Package,
  FolderTree,
  Store,
  ShieldAlert,
  TrendingUp,
  Megaphone,
  Wallet,
  Star,
  HelpCircle,
  Bell,
  FileText,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Menu,
  X,
  Home,
  Activity,
  Clock,
  AlertTriangle,
  UserCheck,
  ShoppingBag,
  Building2,
  UserX,
  Ban,
  Boxes,
  AlertCircle,
  Edit3,
  XCircle,
  Trash2,
  CalendarOff,
  List,
  Sliders,
  Filter,
  Building,
  FileCheck,
  BadgeCheck,
  XSquare,
  FileWarning,
  MessageSquareWarning,
  MailWarning,
  Scale,
  Search,
  Zap,
  Award,
  PackagePlus,
  Tv,
  CheckSquare,
  Layout,
  Briefcase,
  Receipt,
  CreditCard,
  RefreshCw,
  DollarSign,
  MessageCircle,
  Flag,
  Inbox,
  AlertOctagon,
  CheckCircle,
  Send,
  PlusCircle,
  Copy,
  Image,
  BookOpen,
  MapPin,
  UserCog,
  Lock,
  History,
  Wrench,
  Key,
} from "lucide-react";

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  LayoutDashboard,
  Users,
  Package,
  FolderTree,
  Store,
  ShieldAlert,
  TrendingUp,
  Megaphone,
  Wallet,
  Star,
  HelpCircle,
  Bell,
  FileText,
  BarChart3,
  Settings,
  Home,
  Activity,
  Clock,
  AlertTriangle,
  UserCheck,
  ShoppingBag,
  Building2,
  UserX,
  Ban,
  Boxes,
  AlertCircle,
  Edit3,
  XCircle,
  Trash2,
  CalendarOff,
  List,
  Sliders,
  Filter,
  Building,
  FileCheck,
  BadgeCheck,
  CheckBadge: BadgeCheck,
  XSquare,
  FileWarning,
  MessageSquareWarning,
  MailWarning,
  Scale,
  Search,
  Zap,
  Award,
  PackagePlus,
  Tv,
  CheckSquare,
  Layout,
  Briefcase,
  Receipt,
  CreditCard,
  RefreshCw,
  DollarSign,
  MessageCircle,
  Flag,
  Inbox,
  AlertOctagon,
  CheckCircle,
  Send,
  PlusCircle,
  Copy,
  Image,
  BookOpen,
  MapPin,
  UserCog,
  Lock,
  History,
  Wrench,
  Tool: Wrench,
  Key,
};

interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { hasPermission, admin } = useAdminAuth();
  const location = useLocation();

  const renderIcon = (iconName: string, className = "w-4 h-4") => {
    const IconComponent = ICON_MAP[iconName] || LayoutDashboard;
    return <IconComponent className={className} />;
  };

  const filterNavItems = (items: NavItem[]): NavItem[] => {
    return items.filter((item) => {
      if (!admin) return true;
      if (item.permission && !hasPermission([item.permission as Permission])) return false;
      if (item.permissions && !hasPermission(item.permissions as Permission[])) return false;
      return true;
    });
  };

  const badgeColorClasses = {
    warning: "bg-[#FFB800] text-slate-900 font-bold",
    error: "bg-[#DC3545] text-white font-bold",
    info: "bg-[#4D6BFF] text-white font-bold",
    success: "bg-[#16A36A] text-white font-bold",
    indigo: "bg-[#3547D4] text-white font-bold",
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0D173D] text-white select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-white/10 shrink-0">
        <Link to="/admin/dashboard" className="flex items-center space-x-3 overflow-hidden">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-[#3547D4] to-[#4D6BFF] text-[#FFB800] shadow-md shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-extrabold tracking-tight text-white truncate">
                Omeetso Admin
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
                Console
              </span>
            </div>
          )}
        </Link>
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex items-center justify-center p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
        <button
          onClick={onCloseMobile}
          className="md:hidden flex items-center justify-center p-1.5 text-slate-400 hover:text-white rounded-lg"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Role Badge Banner */}
      {!isCollapsed && admin && (
        <div className="px-4 py-2.5 bg-white/5 border-b border-white/5 flex items-center justify-between text-xs">
          <span className="text-slate-400 truncate">Role:</span>
          <span className="font-semibold text-[#FFB800] bg-[#FFB800]/10 px-2 py-0.5 rounded border border-[#FFB800]/20 truncate">
            {admin.role}
          </span>
        </div>
      )}

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar">
        {ADMIN_NAVIGATION.map((group) => {
          const visibleItems = filterNavItems(group.items);
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.groupTitle} className="space-y-1">
              {!isCollapsed && (
                <h3 className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {group.groupTitle}
                </h3>
              )}
              <div className="space-y-1">
                {visibleItems.map((item) => {
                  const isActive =
                    location.pathname === item.route ||
                    (item.route !== "/admin/dashboard" && location.pathname.startsWith(item.route));

                  return (
                    <Link
                      key={item.id}
                      to={item.route}
                      onClick={onCloseMobile}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                        isActive
                          ? "bg-[#3547D4] text-white font-semibold shadow-md shadow-indigo-950/50"
                          : "text-slate-300 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        {renderIcon(item.iconName, "w-4 h-4 shrink-0")}
                        {!isCollapsed && <span className="truncate">{item.label}</span>}
                      </div>
                      {!isCollapsed && item.badge && (
                        <span
                          className={`px-1.5 py-0.2 text-[10px] rounded-full shrink-0 ${
                            badgeColorClasses[item.badgeColor || "info"]
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:block fixed top-0 left-0 bottom-0 z-30 transition-all duration-300 ${
          isCollapsed ? "w-16" : "w-64"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="md:hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm"
        />
      )}

      {/* Mobile Drawer Sidebar */}
      <aside
        className={`md:hidden fixed top-0 left-0 bottom-0 z-50 w-64 transform transition-transform duration-300 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};
