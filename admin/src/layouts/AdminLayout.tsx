import React, { useState, useEffect, Suspense } from "react";
import { Outlet } from "react-router-dom";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { GlobalSearchModal } from "@/components/layout/GlobalSearchModal";
import { OfflineState } from "@/components/common/OfflineState";
import { LocalStorageService } from "@/storage/localStorageService";
import { prefetchAllAdminRoutes } from "@/routes/routePrefetch";

const PageSkeletonFallback: React.FC = () => (
  <div className="p-4 md:p-6 space-y-4 animate-pulse max-w-7xl mx-auto">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-lg w-48" />
        <div className="h-3.5 bg-slate-100 dark:bg-slate-800 rounded w-72" />
      </div>
      <div className="h-9 bg-slate-200 dark:bg-slate-700 rounded-xl w-28" />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
      <div className="h-32 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700" />
      <div className="h-32 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700" />
      <div className="h-32 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700" />
    </div>
    <div className="h-64 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 mt-4" />
  </div>
);

export const AdminLayout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() =>
    LocalStorageService.getItem<boolean>("omeetso_admin_sidebar_collapsed", false)
  );
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState<boolean>(false);

  useEffect(() => {
    prefetchAllAdminRoutes();
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      LocalStorageService.setItem("omeetso_admin_sidebar_collapsed", next);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[#F5F7FC] text-[#111827] flex flex-col antialiased">
      <OfflineState />

      {/* Global Sidebar Navigation */}
      <AdminSidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Workspace Column */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isCollapsed ? "md:ml-16" : "md:ml-64"
        }`}
      >
        {/* Top Header */}
        <AdminHeader
          onToggleMobileSidebar={() => setIsMobileOpen(true)}
          onOpenGlobalSearch={() => setIsGlobalSearchOpen(true)}
        />

        {/* Dynamic Route Content */}
        <main className="flex-1 pb-12">
          <Suspense fallback={<PageSkeletonFallback />}>
            <Outlet />
          </Suspense>
        </main>
      </div>

      {/* Global Search Dialog Modal */}
      <GlobalSearchModal
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
      />
    </div>
  );
};
