import { Routes, Route, Navigate } from "react-router-dom";
import { AdminLayout } from "@/layouts/AdminLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { ProtectedAdminRoute } from "@/components/auth/ProtectedAdminRoute";
import { PermissionRoute } from "@/components/auth/PermissionRoute";

// Auth Pages
import LoginPage from "@/pages/auth/LoginPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import TwoFactorPage from "@/pages/auth/TwoFactorPage";
import SessionExpiredPage from "@/pages/auth/SessionExpiredPage";
import AccessDeniedPage from "@/pages/auth/AccessDeniedPage";
import AccountLockedPage from "@/pages/auth/AccountLockedPage";
import NotFoundPage from "@/pages/NotFoundPage";

// Dashboard Pages
import DashboardPage from "@/pages/dashboard/DashboardPage";
import LiveActivityPage from "@/pages/dashboard/LiveActivityPage";
import PendingActionsPage from "@/pages/dashboard/PendingActionsPage";
import CriticalAlertsPage from "@/pages/dashboard/CriticalAlertsPage";

// Module Pages
import UsersListPage from "@/pages/users/UsersListPage";
import ListingsListPage from "@/pages/listings/ListingsListPage";
import StoresListPage from "@/pages/stores/StoresListPage";
import SafetyReportsPage from "@/pages/safety/SafetyReportsPage";
import AdminChatMonitoringPage from "@/pages/chat/AdminChatMonitoringPage";
import RefundsPage from "@/pages/finance/RefundsPage";
import TicketsListPage from "@/pages/support/TicketsListPage";
import AuditLogsPage from "@/pages/administration/AuditLogsPage";
import RolesPage from "@/pages/administration/RolesPage";
import CategoriesPage from "@/pages/categories/CategoriesPage";
import ReviewsPage from "@/pages/reviews/ReviewsPage";
import NotificationsPage from "@/pages/notifications/NotificationsPage";
import AnalyticsPage from "@/pages/analytics/AnalyticsPage";
import ListingDetailPage from "@/pages/listings/ListingDetailPage";
import StoreDetailPage from "@/pages/stores/StoreDetailPage";
import StoreProductDetailPage from "@/pages/stores/StoreProductDetailPage";

import PromotionsOverviewPage from "@/pages/promotions/PromotionsOverviewPage";

import AdsOverviewPage from "@/pages/ads/AdsOverviewPage";
import AdPlacementsPage from "@/pages/ads/AdPlacementsPage";
import AdvertisersPage from "@/pages/ads/AdvertisersPage";
import AdCampaignReviewPage from "@/pages/ads/AdCampaignReviewPage";

import SettingsPage from "@/pages/settings/SettingsPage";
import FeatureFlagsPage from "@/pages/feature-flags/FeatureFlagsPage";
import MaintenancePage from "@/pages/maintenance/MaintenancePage";

import { JobsPage } from "@/pages/jobs/JobsPage";
import { ServicesPage } from "@/pages/services/ServicesPage";
import BannersPage from "@/pages/banners/BannersPage";

export default function AdminRoutes() {
  return (
    <Routes>
      {/* Root redirects */}
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

      {/* Public / Auth Layout Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/admin/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/admin/reset-password" element={<ResetPasswordPage />} />
        <Route path="/admin/two-factor" element={<TwoFactorPage />} />
        <Route path="/admin/session-expired" element={<SessionExpiredPage />} />
        <Route path="/admin/account-locked" element={<AccountLockedPage />} />
      </Route>

      {/* Standalone Access Denied */}
      <Route path="/admin/access-denied" element={<AccessDeniedPage />} />

      {/* Authenticated Protected Admin Layout */}
      <Route element={<ProtectedAdminRoute />}>
        <Route element={<AdminLayout />}>
          {/* Dashboard Group */}
          <Route path="/admin/dashboard" element={<DashboardPage />} />
          <Route path="/admin/dashboard/live-activity" element={<LiveActivityPage />} />
          <Route path="/admin/dashboard/pending-actions" element={<PendingActionsPage />} />
          <Route path="/admin/dashboard/critical-alerts" element={<CriticalAlertsPage />} />

          {/* Users Module */}
          <Route element={<PermissionRoute permissions={["users.view"]} />}>
            <Route path="/admin/users" element={<UsersListPage />} />
            <Route path="/admin/users/buyers" element={<UsersListPage />} />
            <Route path="/admin/users/sellers" element={<UsersListPage />} />
            <Route path="/admin/users/business-sellers" element={<UsersListPage />} />
            <Route path="/admin/users/suspended" element={<UsersListPage />} />
            <Route path="/admin/users/blocked" element={<UsersListPage />} />
            <Route path="/admin/users/:userId" element={<UsersListPage />} />
            <Route path="/admin/users/:userId/activity" element={<UsersListPage />} />
            <Route path="/admin/users/:userId/verification" element={<UsersListPage />} />
          </Route>

          {/* Listings Module */}
          <Route element={<PermissionRoute permissions={["listings.view"]} />}>
            <Route path="/admin/listings" element={<ListingsListPage />} />
            <Route path="/admin/listings/pending" element={<ListingsListPage />} />
            <Route path="/admin/listings/assigned" element={<ListingsListPage />} />
            <Route path="/admin/listings/reported" element={<ListingsListPage />} />
            <Route path="/admin/listings/requires-changes" element={<ListingsListPage />} />
            <Route path="/admin/listings/rejected" element={<ListingsListPage />} />
            <Route path="/admin/listings/removed" element={<ListingsListPage />} />
            <Route path="/admin/listings/expired" element={<ListingsListPage />} />
            <Route path="/admin/listings/:listingId" element={<ListingDetailPage />} />
            <Route path="/admin/jobs" element={<JobsPage />} />
            <Route path="/admin/services" element={<ServicesPage />} />
          </Route>

          {/* Categories Module */}
          <Route element={<PermissionRoute permissions={["categories.view"]} />}>
            <Route path="/admin/categories" element={<CategoriesPage />} />
            <Route path="/admin/attributes" element={<CategoriesPage />} />
            <Route path="/admin/filters" element={<CategoriesPage />} />
            <Route path="/admin/prohibited-keywords" element={<CategoriesPage />} />
          </Route>

          {/* Stores Module */}
          <Route element={<PermissionRoute permissions={["stores.view"]} />}>
            <Route path="/admin/stores" element={<StoresListPage />} />
            <Route path="/admin/stores/applications" element={<StoresListPage />} />
            <Route path="/admin/stores/verified" element={<StoresListPage />} />
            <Route path="/admin/stores/rejected" element={<StoresListPage />} />
            <Route path="/admin/stores/reported" element={<StoresListPage />} />
            <Route path="/admin/stores/:storeId" element={<StoreDetailPage />} />
            <Route path="/admin/stores/:storeId/products" element={<StoreDetailPage />} />
            <Route path="/admin/store-products/:productId" element={<StoreProductDetailPage />} />
          </Route>

          {/* Safety & Communication */}
          <Route element={<PermissionRoute permissions={["safety.view"]} />}>
            <Route path="/admin/safety-reports" element={<SafetyReportsPage />} />
            <Route path="/admin/safety-reports/:reportId" element={<SafetyReportsPage />} />
            <Route path="/admin/chat-monitoring" element={<AdminChatMonitoringPage />} />
            <Route path="/admin/chat-reports" element={<SafetyReportsPage />} />
            <Route path="/admin/message-reports" element={<SafetyReportsPage />} />
            <Route path="/admin/offer-disputes" element={<SafetyReportsPage />} />
            <Route path="/admin/investigations" element={<SafetyReportsPage />} />
          </Route>

          {/* Promotions & Boosts Module */}
          <Route element={<PermissionRoute permissions={["promotions.view"]} />}>
            <Route path="/admin/promotions" element={<PromotionsOverviewPage />} />
            <Route path="/admin/promotions/active" element={<PromotionsOverviewPage />} />
            <Route path="/admin/promotions/pending" element={<PromotionsOverviewPage />} />
            <Route path="/admin/promotions/listings" element={<PromotionsOverviewPage />} />
            <Route path="/admin/promotions/stores" element={<PromotionsOverviewPage />} />
            <Route path="/admin/promotions/products" element={<PromotionsOverviewPage />} />
            <Route path="/admin/promotions/offers" element={<PromotionsOverviewPage />} />
            <Route path="/admin/promotions/packages" element={<PromotionsOverviewPage />} />
            <Route path="/admin/promotions/packages/create" element={<PromotionsOverviewPage />} />
            <Route path="/admin/promotions/packages/:packageId/edit" element={<PromotionsOverviewPage />} />
            <Route path="/admin/promotions/placements" element={<AdPlacementsPage />} />
            <Route path="/admin/promotions/discounts" element={<PromotionsOverviewPage />} />
            <Route path="/admin/promotions/refunds" element={<PromotionsOverviewPage />} />
            <Route path="/admin/promotions/settings" element={<PromotionsOverviewPage />} />
            <Route path="/admin/promotions/:promotionId" element={<PromotionsOverviewPage />} />
            <Route path="/admin/promotions/:promotionId/analytics" element={<PromotionsOverviewPage />} />
          </Route>

          {/* Advertisements & Display Media Module */}
          <Route element={<PermissionRoute permissions={["ads.view"]} />}>
            <Route path="/admin/ads" element={<AdsOverviewPage />} />
            <Route path="/admin/ads/campaigns" element={<AdsOverviewPage />} />
            <Route path="/admin/ads/review" element={<AdsOverviewPage />} />
            <Route path="/admin/ads/active" element={<AdsOverviewPage />} />
            <Route path="/admin/ads/scheduled" element={<AdsOverviewPage />} />
            <Route path="/admin/ads/paused" element={<AdsOverviewPage />} />
            <Route path="/admin/ads/rejected" element={<AdsOverviewPage />} />
            <Route path="/admin/ads/completed" element={<AdsOverviewPage />} />
            <Route path="/admin/ads/placements/website" element={<AdPlacementsPage />} />
            <Route path="/admin/ads/placements/app" element={<AdPlacementsPage />} />
            <Route path="/admin/ads/placements/create" element={<AdPlacementsPage />} />
            <Route path="/admin/ads/placements/:placementId/edit" element={<AdPlacementsPage />} />
            <Route path="/admin/advertisers" element={<AdvertisersPage />} />
            <Route path="/admin/advertisers/:advertiserId" element={<AdvertisersPage />} />
            <Route path="/admin/ads/creatives" element={<AdvertisersPage />} />
            <Route path="/admin/ads/targeting" element={<AdvertisersPage />} />
            <Route path="/admin/ads/pricing" element={<AdvertisersPage />} />
            <Route path="/admin/ads/refunds" element={<AdvertisersPage />} />
            <Route path="/admin/ads/policy" element={<AdvertisersPage />} />
            <Route path="/admin/ads/:campaignId" element={<AdCampaignReviewPage />} />
            <Route path="/admin/ads/:campaignId/creative" element={<AdCampaignReviewPage />} />
            <Route path="/admin/ads/:campaignId/audience" element={<AdCampaignReviewPage />} />
            <Route path="/admin/ads/:campaignId/placements" element={<AdCampaignReviewPage />} />
            <Route path="/admin/ads/:campaignId/budget" element={<AdCampaignReviewPage />} />
            <Route path="/admin/banners" element={<BannersPage />} />
          </Route>

          {/* Finance Module */}
          <Route element={<PermissionRoute permissions={["wallet.view", "payments.view", "refunds.view"]} />}>
            <Route path="/admin/wallets" element={<RefundsPage />} />
            <Route path="/admin/transactions" element={<RefundsPage />} />
            <Route path="/admin/payments" element={<RefundsPage />} />
            <Route path="/admin/refunds" element={<RefundsPage />} />
            <Route path="/admin/invoices" element={<RefundsPage />} />
            <Route path="/admin/billing" element={<RefundsPage />} />
          </Route>

          {/* Reviews Module */}
          <Route element={<PermissionRoute permissions={["reviews.view"]} />}>
            <Route path="/admin/reviews" element={<ReviewsPage />} />
            <Route path="/admin/reviews/reported" element={<ReviewsPage />} />
            <Route path="/admin/reviews/stores" element={<ReviewsPage />} />
          </Route>

          {/* Support Module */}
          <Route element={<PermissionRoute permissions={["support.view"]} />}>
            <Route path="/admin/support" element={<TicketsListPage />} />
            <Route path="/admin/support/open" element={<TicketsListPage />} />
            <Route path="/admin/support/assigned" element={<TicketsListPage />} />
            <Route path="/admin/support/escalated" element={<TicketsListPage />} />
            <Route path="/admin/support/resolved" element={<TicketsListPage />} />
            <Route path="/admin/support/:ticketId" element={<TicketsListPage />} />
          </Route>

          {/* Notifications Module */}
          <Route element={<PermissionRoute permissions={["notifications.view"]} />}>
            <Route path="/admin/notifications" element={<NotificationsPage />} />
            <Route path="/admin/notifications/create" element={<NotificationsPage />} />
            <Route path="/admin/notification-templates" element={<NotificationsPage />} />
          </Route>

          {/* Content & Analytics Module */}
          <Route element={<PermissionRoute permissions={["content.view"]} />}>
            <Route path="/admin/content" element={<NotificationsPage />} />
            <Route path="/admin/content/home/banners" element={<NotificationsPage />} />
            <Route path="/admin/content/help" element={<NotificationsPage />} />
            <Route path="/admin/content/safety" element={<NotificationsPage />} />
            <Route path="/admin/content/legal" element={<NotificationsPage />} />
          </Route>
          <Route element={<PermissionRoute permissions={["analytics.view"]} />}>
            <Route path="/admin/analytics" element={<AnalyticsPage />} />
            <Route path="/admin/analytics/users" element={<AnalyticsPage />} />
            <Route path="/admin/analytics/listings" element={<AnalyticsPage />} />
            <Route path="/admin/analytics/stores" element={<AnalyticsPage />} />
            <Route path="/admin/analytics/revenue" element={<AnalyticsPage />} />
            <Route path="/admin/analytics/locations" element={<AnalyticsPage />} />
          </Route>

          {/* Administration Group */}
          <Route element={<PermissionRoute permissions={["admins.view"]} />}>
            <Route path="/admin/admin-users" element={<UsersListPage />} />
            <Route path="/admin/login-activity" element={<AuditLogsPage />} />
          </Route>
          <Route element={<PermissionRoute permissions={["roles.view"]} />}>
            <Route path="/admin/roles" element={<RolesPage />} />
          </Route>
          <Route element={<PermissionRoute permissions={["audit.view"]} />}>
            <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
          </Route>
          <Route element={<PermissionRoute permissions={["settings.view"]} />}>
            <Route path="/admin/settings" element={<SettingsPage />} />
            <Route path="/admin/settings/marketplace" element={<SettingsPage />} />
            <Route path="/admin/feature-flags" element={<FeatureFlagsPage />} />
            <Route path="/admin/maintenance" element={<MaintenancePage />} />
          </Route>
        </Route>
      </Route>

      {/* Catch-all 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
