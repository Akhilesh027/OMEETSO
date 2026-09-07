const routeLoaders: Record<string, () => Promise<any>> = {
  "/admin/dashboard": () => import("@/pages/dashboard/DashboardPage"),
  "/admin/users": () => import("@/pages/users/UsersListPage"),
  "/admin/listings": () => import("@/pages/listings/ListingsListPage"),
  "/admin/stores": () => import("@/pages/stores/StoresListPage"),
  "/admin/categories": () => import("@/pages/categories/CategoriesPage"),
  "/admin/safety-reports": () => import("@/pages/safety/SafetyReportsPage"),
  "/admin/chat-monitoring": () => import("@/pages/chat/AdminChatMonitoringPage"),
  "/admin/promotions": () => import("@/pages/promotions/PromotionsOverviewPage"),
  "/admin/ads": () => import("@/pages/ads/AdsOverviewPage"),
  "/admin/support": () => import("@/pages/support/TicketsListPage"),
  "/admin/analytics": () => import("@/pages/analytics/AnalyticsPage"),
  "/admin/settings": () => import("@/pages/settings/SettingsPage"),
  "/admin/audit-logs": () => import("@/pages/administration/AuditLogsPage"),
  "/admin/roles": () => import("@/pages/administration/RolesPage"),
  "/admin/jobs": () => import("@/pages/jobs/JobsPage"),
  "/admin/services": () => import("@/pages/services/ServicesPage"),
  "/admin/blogs": () => import("@/pages/blogs/BlogsPage"),
  "/admin/banners": () => import("@/pages/banners/BannersPage"),
  "/admin/wallets": () => import("@/pages/finance/RefundsPage"),
  "/admin/refunds": () => import("@/pages/finance/RefundsPage"),
  "/admin/reviews": () => import("@/pages/reviews/ReviewsPage"),
  "/admin/notifications": () => import("@/pages/notifications/NotificationsPage"),
  "/admin/promotions/packages": () => import("@/pages/promotions/PromotionPackagesPage"),
  "/admin/promotions/pricing-plans": () => import("@/pages/promotions/PromotionPackagesPage"),
  "/admin/ads/placements": () => import("@/pages/ads/AdPlacementsPage"),
  "/admin/advertisers": () => import("@/pages/ads/AdvertisersPage"),
  "/admin/feature-flags": () => import("@/pages/feature-flags/FeatureFlagsPage"),
  "/admin/maintenance": () => import("@/pages/maintenance/MaintenancePage"),
};

export function prefetchRoute(route: string): void {
  const loader = routeLoaders[route] || Object.entries(routeLoaders).find(([key]) => route.startsWith(key))?.[1];
  if (loader) {
    loader().catch(() => {});
  }
}

export function prefetchAllAdminRoutes(): void {
  if (typeof window === "undefined") return;
  const idleCallback = (window as any).requestIdleCallback || ((cb: Function) => setTimeout(cb, 1000));
  idleCallback(() => {
    Object.values(routeLoaders).forEach((loader) => {
      loader().catch(() => {});
    });
  });
}
