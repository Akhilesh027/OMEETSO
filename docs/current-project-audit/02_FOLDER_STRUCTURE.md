# 02 — Complete Folder Structure

## User Frontend Portal (`frontend/src/`)

```
frontend/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── components.json               (Shadcn UI config)
├── .prettierrc
├── eslint.config.js
├── AGENTS.md
├── bunfig.toml
├── bun.lock
├── package-lock.json
├── public/
│   └── (static assets)
└── src/
    ├── main.tsx                  (App entry point)
    ├── router.tsx                (TanStack Router setup)
    ├── routeTree.gen.ts          (Auto-generated route tree — 82KB, 110 routes)
    ├── server.ts                 (Server entry stub)
    ├── start.ts                  (Start entry stub)
    ├── styles.css                (Global CSS, Tailwind v4 directives)
    │
    ├── components/
    │   ├── omeetso/              (Core app UI components)
    │   │   ├── AdBanner.tsx
    │   │   ├── BottomNav.tsx
    │   │   ├── BottomSheet.tsx
    │   │   ├── CategoryIcon.tsx
    │   │   ├── EmptyState.tsx
    │   │   ├── FilterChip.tsx
    │   │   ├── InfoPage.tsx
    │   │   ├── Logo.tsx
    │   │   ├── MobileFrame.tsx
    │   │   ├── OfferSheet.tsx
    │   │   ├── ProductCard.tsx
    │   │   ├── ReportSheet.tsx
    │   │   ├── SafetyCard.tsx
    │   │   ├── SellerSummary.tsx
    │   │   ├── SortSheet.tsx
    │   │   ├── StoreCard.tsx
    │   │   ├── TopBar.tsx
    │   │   ├── WebsiteFooter.tsx
    │   │   ├── WebsiteHeader.tsx
    │   │   ├── account/          (Account section sub-components)
    │   │   ├── chat/             (Chat sub-components)
    │   │   └── revenue/          (Wallet/promotions sub-components)
    │   ├── sell/                 (Sell form components)
    │   │   ├── ImageUploader.tsx
    │   │   ├── StepIndicator.tsx
    │   │   └── (other sell components)
    │   └── ui/                   (Shadcn UI components — Radix-based)
    │       └── (accordion, button, card, dialog, etc.)
    │
    ├── hooks/
    │   ├── use-mobile.tsx
    │   └── useSaved.ts
    │
    └── lib/                      (Data layer — all localStorage-backed)
        ├── account.ts            (Profile, verification, notifications, reviews, support — 615 lines)
        ├── ads.ts                (Ad impression/click tracking — 37 lines)
        ├── chat.ts               (Chat threads, messages, offers — 681 lines)
        ├── error-capture.ts
        ├── error-page.ts
        ├── faq.ts                (Static FAQ content — 8.7KB)
        ├── listingValidation.ts  (Form validation logic)
        ├── listings.ts           (Listings CRUD + drafts + analytics — 443 lines)
        ├── lovable-error-reporting.ts
        ├── mock.ts               (Master mock data file — 505 lines, all static)
        ├── revenue.ts            (Wallet, promotions, ads, boosts — 764 lines)
        ├── saved.ts              (Saved items, recent searches, reports)
        ├── specConfig.ts         (Category-specific spec fields)
        ├── stores.ts             (Store CRUD + products — 352 lines)
        └── utils.ts              (Minimal utility functions)

    └── routes/                   (110 route files — TanStack file-based routing)
        ├── __root.tsx
        ├── index.tsx             (Splash/loading screen)
        ├── login.tsx
        ├── otp.tsx
        ├── onboarding.tsx
        ├── welcome.tsx
        ├── profile-setup.tsx
        ├── location.tsx
        ├── home.tsx
        ├── search.tsx
        ├── results.tsx
        ├── filters.tsx
        ├── categories.tsx
        ├── category.$id.tsx
        ├── product.$id.tsx
        ├── seller.$id.tsx
        ├── store.$id.tsx
        ├── stores.tsx
        ├── gallery.$id.tsx
        ├── map.tsx
        ├── saved.tsx
        ├── recently-viewed.tsx
        ├── chats.tsx
        ├── chat.$id.tsx
        ├── chat.safety.tsx
        ├── notifications.tsx
        ├── notifications.$id.tsx
        ├── notifications.preferences.tsx
        ├── account.tsx
        ├── account.edit.tsx
        ├── account.public.tsx
        ├── account.verification.index.tsx
        ├── account.verification.$type.tsx
        ├── sell.index.tsx
        ├── sell.quick.tsx
        ├── sell.quick.success.tsx
        ├── sell.detailed.tsx
        ├── sell.detailed.success.tsx
        ├── sell.drafts.tsx
        ├── sell.store.tsx
        ├── listings.tsx
        ├── listing.$id.manage.tsx
        ├── listing.$id.edit.tsx
        ├── listing.$id.analytics.tsx
        ├── listing.$id.rejection.tsx
        ├── listing.$id.renew.tsx
        ├── store.create.tsx
        ├── store.select.tsx
        ├── store.success.tsx
        ├── store.manage.$id.tsx
        ├── store.manage.$id.products.tsx
        ├── store.manage.$id.add-existing.tsx
        ├── store.manage.$id.preview.tsx
        ├── promotions.index.tsx
        ├── promotions.new.tsx
        ├── promotions.listings.tsx
        ├── promotions.stores.tsx
        ├── promotions.store-products.tsx
        ├── promotions.custom.tsx
        ├── promotions.payment.tsx
        ├── promotions.$id.tsx
        ├── promotions.$id.analytics.tsx
        ├── promote.placeholder.tsx
        ├── ads.index.tsx
        ├── ads.new.tsx
        ├── ads.$id.tsx
        ├── ads.$id.analytics.tsx
        ├── wallet.tsx
        ├── wallet.add.tsx
        ├── wallet.credits.tsx
        ├── wallet.transactions.tsx
        ├── wallet.transaction.$id.tsx
        ├── billing.tsx
        ├── invoices.tsx
        ├── invoice.$id.tsx
        ├── offers.tsx
        ├── offer.$id.tsx
        ├── transaction.$offerId.tsx
        ├── reviews.index.tsx
        ├── reviews.new.tsx
        ├── reviews.report.$id.tsx
        ├── safety.index.tsx
        ├── safety.$topic.tsx
        ├── safety.report.tsx
        ├── support.index.tsx
        ├── support.new.tsx
        ├── support.$id.tsx
        ├── help.index.tsx
        ├── help.faq.$id.tsx
        ├── help.search.tsx
        ├── settings.index.tsx
        ├── settings.account.tsx
        ├── settings.privacy.tsx
        ├── settings.appearance.tsx
        ├── settings.locations.tsx
        ├── settings.blocked.tsx
        ├── settings.ad-preferences.tsx
        ├── settings.deactivate.tsx
        ├── settings.delete.tsx
        ├── language.tsx
        ├── register.tsx          (STUB — 184 bytes, empty redirect)
        ├── logout.tsx
        ├── about.tsx
        ├── contact.tsx
        ├── careers.tsx
        ├── terms.tsx
        ├── privacy.tsx
        ├── community-guidelines.tsx
        ├── advertising-policy.tsx
        ├── cookie-preferences.tsx
        └── (other legal/static routes)
```

---

## Admin Portal (`admin/src/`)

```
admin/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── .env.example
├── vercel.json
├── bun.lock
├── package-lock.json
├── public/
│   └── (static assets)
└── src/
    ├── main.tsx                  (Admin app entry)
    ├── App.tsx                   (Root component with providers)
    ├── index.css                 (Global styles)
    │
    ├── routes/
    │   └── AdminRoutes.tsx       (All admin routes — 264 lines, React Router v6)
    │
    ├── layouts/
    │   ├── AdminLayout.tsx       (Main layout with sidebar)
    │   └── AuthLayout.tsx        (Authentication page layout)
    │
    ├── pages/
    │   ├── NotFoundPage.tsx
    │   ├── UnauthorizedPage.tsx
    │   ├── auth/
    │   │   ├── LoginPage.tsx
    │   │   ├── ForgotPasswordPage.tsx
    │   │   ├── ResetPasswordPage.tsx
    │   │   ├── TwoFactorPage.tsx
    │   │   ├── SessionExpiredPage.tsx
    │   │   ├── AccessDeniedPage.tsx
    │   │   └── AccountLockedPage.tsx
    │   ├── dashboard/
    │   │   ├── DashboardPage.tsx
    │   │   ├── LiveActivityPage.tsx
    │   │   ├── PendingActionsPage.tsx
    │   │   └── CriticalAlertsPage.tsx
    │   ├── users/
    │   │   └── UsersListPage.tsx
    │   ├── listings/
    │   │   ├── ListingsListPage.tsx
    │   │   └── ListingDetailPage.tsx
    │   ├── stores/
    │   │   ├── StoresListPage.tsx
    │   │   ├── StoreDetailPage.tsx
    │   │   └── StoreProductDetailPage.tsx
    │   ├── categories/
    │   │   └── CategoriesPage.tsx
    │   ├── ads/
    │   │   ├── AdsOverviewPage.tsx
    │   │   ├── AdCampaignsListPage.tsx
    │   │   ├── AdCampaignReviewPage.tsx
    │   │   ├── AdPlacementsPage.tsx
    │   │   ├── AdvertisersPage.tsx
    │   │   └── CampaignsListPage.tsx
    │   ├── promotions/
    │   │   ├── PromotionsOverviewPage.tsx
    │   │   ├── PromotionsListPage.tsx
    │   │   ├── PromotionsPage.tsx
    │   │   ├── PromotionPackagesPage.tsx
    │   │   ├── PromotionPlacementsPage.tsx
    │   │   └── PromotionReviewPage.tsx
    │   ├── finance/
    │   │   └── RefundsPage.tsx
    │   ├── reviews/
    │   │   └── ReviewsPage.tsx
    │   ├── safety/
    │   │   └── SafetyReportsPage.tsx
    │   ├── support/
    │   │   └── TicketsListPage.tsx
    │   ├── notifications/
    │   │   └── NotificationsPage.tsx
    │   ├── analytics/
    │   │   └── AnalyticsPage.tsx
    │   └── administration/
    │       ├── AuditLogsPage.tsx
    │       └── RolesPage.tsx
    │
    ├── components/
    │   ├── auth/
    │   │   ├── ProtectedAdminRoute.tsx
    │   │   └── PermissionRoute.tsx
    │   ├── common/
    │   │   ├── Button.tsx
    │   │   ├── Can.tsx
    │   │   ├── ConfirmationModal.tsx
    │   │   ├── EmptyState.tsx
    │   │   ├── ErrorBoundary.tsx
    │   │   ├── ErrorState.tsx
    │   │   ├── LoadingSpinner.tsx
    │   │   ├── OfflineState.tsx
    │   │   ├── PagePlaceholder.tsx
    │   │   ├── RequireAdmin.tsx
    │   │   ├── RouteLoader.tsx
    │   │   ├── ScrollToTop.tsx
    │   │   ├── Skeleton.tsx
    │   │   ├── StatCard.tsx
    │   │   └── StatusBadge.tsx
    │   ├── layout/
    │   │   └── (sidebar, header components)
    │   └── tables/
    │       └── (data table components)
    │
    ├── contexts/
    │   ├── AdminAuthContext.tsx  (Auth state — React Context)
    │   ├── AdminProviders.tsx
    │   └── ToastContext.tsx
    │
    ├── hooks/
    │   ├── useAdminAuth.ts
    │   └── usePermission.ts
    │
    ├── services/
    │   ├── adminAuthService.ts   (Mock auth with localStorage)
    │   ├── adsDataService.ts     (Mock ads data)
    │   ├── auditLog.ts
    │   ├── auditLogService.ts    (Audit log writer to localStorage)
    │   ├── mockDataService.ts    (Central mock data CRUD service)
    │   └── promotionsDataService.ts
    │
    ├── data/                     (Static mock data)
    │   ├── adminUsers.ts         (9 mock admin users)
    │   ├── auditLogs.ts          (5 mock audit entries)
    │   ├── categorySchema.ts     (Full category definitions — 26KB)
    │   ├── criticalAlerts.ts
    │   ├── dashboard.ts          (Hardcoded dashboard stats + charts)
    │   ├── globalSearch.ts
    │   ├── liveActivity.ts
    │   ├── mock.ts               (Users, listings, stores, campaigns, tickets, reports, refunds)
    │   └── pendingActions.ts
    │
    ├── permissions/
    │   ├── permissions.ts        (84 permission strings)
    │   └── roles.ts              (9 role definitions with permission sets)
    │
    ├── storage/
    │   ├── localStorageService.ts (localStorage read/write wrapper)
    │   └── storageService.ts
    │
    ├── types/
    │   ├── auth.ts               (AdminUser, AdminSession, AuthStatus types)
    │   ├── index.ts              (PlatformUser, Listing, Store, etc. types)
    │   └── navigation.ts
    │
    └── utils/
        ├── cn.ts
        └── format.ts
```

---

## Mock Data Folders

| Portal | Folder | Files |
|---|---|---|
| Admin | `admin/src/data/` | 9 files — users, listings, stores, campaigns, dashboard stats, audit logs, category schemas, alerts |
| Frontend | `frontend/src/lib/` | `mock.ts` (master), `chat.ts`, `account.ts`, `listings.ts`, `stores.ts`, `revenue.ts`, `saved.ts`, `ads.ts` |

---

## No Shared Packages
There is **no shared package folder**, monorepo setup, or `packages/` directory. Both portals are completely standalone with their own dependencies.
