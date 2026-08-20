import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { GlobalSearchModal } from "@/components/layout/GlobalSearchModal";
import { OfflineState } from "@/components/common/OfflineState";
import { LocalStorageService } from "@/storage/localStorageService";

export const AdminLayout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() =>
    LocalStorageService.getItem<boolean>("omeetso_admin_sidebar_collapsed", false)
  );
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState<boolean>(false);

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
          <Outlet />
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
