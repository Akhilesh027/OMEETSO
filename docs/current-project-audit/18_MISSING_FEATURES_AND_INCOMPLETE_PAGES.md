# 18 — Missing Features and Incomplete Pages

## Summary
This document catalogs all features with stubs, empty pages, incomplete implementations, or features that exist in the UI but have no functional backing.

---

## STUB Pages (Empty or Near-Empty)

| Route | Portal | File | Size | What's Missing |
|---|---|---|---|---|
| `/register` | Frontend | `routes/register.tsx` | 184 bytes | Entire registration form (redirects to login) |
| `/recently-viewed` | Frontend | `routes/recently-viewed.tsx` | 191 bytes | Product list showing recently viewed items |
| `/stores` | Frontend | `routes/stores.tsx` | 998 bytes | Full stores browsing page (minimal content only) |
| `/admin/advertisers` | Admin | `pages/ads/AdvertisersPage.tsx` | Unknown | Advertiser account management (placeholder only) |
| `/admin/analytics` | Admin | `pages/analytics/AnalyticsPage.tsx` | Unknown | Full analytics dashboard (placeholder) |
| `server.ts` | Frontend | `src/server.ts` | 131 bytes | Server entry file (empty export) |
| `start.ts` | Frontend | `src/start.ts` | 131 bytes | Start entry file (empty export) |

---

## Pages Mapped to Wrong Components

| Route | Currently Uses | Should Use |
|---|---|---|
| `/admin/content` | `NotificationsPage.tsx` | Dedicated `ContentPage.tsx` |
| `/admin/settings` | `RolesPage.tsx` | Dedicated `SettingsPage.tsx` |
| `/admin/feature-flags` | `RolesPage.tsx` | Dedicated `FeatureFlagsPage.tsx` |
| `/admin/maintenance` | `RolesPage.tsx` | Dedicated `MaintenancePage.tsx` |
| `/admin/admin-users` | `UsersListPage.tsx` | Dedicated `AdminUsersPage.tsx` |
| `/admin/ads/creatives` | `AdvertisersPage.tsx` | Dedicated `CreativesPage.tsx` |
| `/admin/ads/targeting` | `AdvertisersPage.tsx` | Dedicated `TargetingPage.tsx` |
| `/admin/ads/pricing` | `AdvertisersPage.tsx` | Dedicated `PricingPage.tsx` |
| `/admin/promotions/discounts` | `PromotionPlacementsPage.tsx` | Dedicated `DiscountsPage.tsx` |
| `/admin/promotions/refunds` | `PromotionPlacementsPage.tsx` | Dedicated `RefundsPage.tsx` |
| `/admin/promotions/settings` | `PromotionPlacementsPage.tsx` | Dedicated `PromoSettingsPage.tsx` |

---

## Features in UI But Not Functional

### User Portal

| Feature | Location | What Exists | What Doesn't |
|---|---|---|---|
| Map view | `/map` | Map page loads, shows listings | No real map API (Google Maps, Leaflet, etc.) |
| Google OAuth | `/login` | Button, loading state, mock flow | No Google OAuth token, no OAuth redirect |
| Image upload | Sell forms | File picker UI, preview | Object URLs only — images not persisted |
| Video upload | Sell form (detailed) | UI for video field | No video upload, no player |
| Export analytics | Admin analytics pages | "Export" button | Shows toast "Export started", no file download |
| Send notification | `/admin/notifications` | Compose form, send button | Shows success toast, no real push notification |
| Document upload (KYC) | Verification flow | Document type picker, camera button | No real file handling, no backend |
| GST verification | Store creation | GST number field | Field exists, no real GSTIN validation API |
| Auto GST verification | Admin feature flags | `autoGstinVerification` flag | No API integration |
| Meeting places | Chat safety | List of local safe places | Hardcoded list, not user-configurable |
| Address autocomplete | Store creation, location | Pincode + area text field | No Maps API for autocomplete |
| Phone OTP resend | OTP page | Resend timer (28s) | Simulates resend — no real SMS |
| Report export | Admin safety, support | Export buttons | UI only, no data export |
| Chat image attachment | `/chat/$id` | Camera/gallery icons | Opens picker but upload not implemented |
| Bulk actions | Admin listing/user lists | Checkbox column may exist | No bulk action functionality |
| Global search (admin) | Admin header | Search bar | Returns hardcoded suggestions only |
| Story/reel listing | Homepage | None | Not built |
| Seller response time | Listing detail | "Usually within 20 minutes" | Hardcoded in default profile |
| Follow store | Store page | Follow button | May exist in UI, never persists correctly |
| Share listing | Listing detail | Share button | Copies URL (works), no native share API used |
| QR code | Listing detail | No | Not implemented |
| Price alert | Product page | No | Not implemented |

---

## Features Completely Missing (No UI Exists)

| Feature | Category | Priority |
|---|---|---|
| Password-based login | Auth | DEFERRED (OTP-first design) |
| Forgot password flow | Auth | HIGH |
| Email verification | Auth | HIGH |
| Registration form | Auth | CRITICAL |
| Real-time notifications | Core | HIGH |
| Push notifications | Core | HIGH |
| SMS notifications | Core | HIGH |
| Email notifications | Core | HIGH |
| Nearby listing (GPS-based) | Core | HIGH |
| Rating a seller | Reviews | HIGH |
| Transaction history (real) | Finance | HIGH |
| GST invoice generation | Finance | MEDIUM |
| UPI payment integration | Finance | CRITICAL |
| COD option | Commerce | MEDIUM |
| Listing boost via payment | Revenue | CRITICAL |
| Subscription plans for stores | Revenue | HIGH |
| Referral system | Growth | LOW |
| Store analytics dashboard | Analytics | MEDIUM |
| Platform analytics (real) | Analytics | HIGH |
| Report download (PDF/CSV) | Admin | MEDIUM |
| Admin email/SMS notifications | Admin | HIGH |
| Moderation assignment system | Admin | HIGH |
| Bulk moderation | Admin | MEDIUM |
| Admin audit export | Admin | MEDIUM |
| Legal/compliance tools | Admin | MEDIUM |
| Fraud detection system | Safety | HIGH |
| Content moderation (AI) | Safety | MEDIUM |
| Two-factor auth (real TOTP) | Auth | HIGH |
| Session management (multi-device) | Auth | HIGH |
| API rate limiting | Backend | HIGH |
| Image CDN | Media | CRITICAL |
| File storage service | Media | CRITICAL |
| Search engine | Core | CRITICAL |
| Recommendation engine | Core | MEDIUM |
| Sitemap generation | SEO | LOW |
| Deep links (mobile) | Mobile | MEDIUM |

---

## Incomplete Admin Functionality

| Module | What Exists | What's Missing |
|---|---|---|
| User Management | View, suspend, ban, verify | No user message, no appeal process |
| Listing Moderation | Approve, reject, change request | No SLA tracking, no auto-assignment |
| Store Verification | Approve, verify, reject | No GST/address verification API |
| Finance | Refunds, wallet adjust | No real payment processing |
| Support | View tickets, reply, close | No email integration, no SLA |
| Analytics | Hardcoded stats page | No real analytics |
| Content | Wrong page mapped | No CMS functionality |
| Settings | Wrong page mapped | No settings persist to any real config |
| Notifications | Compose, send (mock) | No real push/email/SMS system |
| Roles | View, edit (in-memory) | Changes don't persist after refresh |
| Feature flags | Stored in localStorage | No real feature flag system |

---

## Known Bugs and Issues

| Bug | Location | Description |
|---|---|---|
| Dev auto-login | Admin auth | Super Admin session auto-created without login |
| Hardcoded OTP | Frontend OTP page | Any user who knows `1234` can log in |
| Hardcoded 2FA | Admin TwoFactorPage | Any admin 2FA succeeds with `123456` |
| Object URL images | Sell forms | Images lost on refresh (blob: URLs) |
| Profile default user | Frontend profile | "Akhil Reddy" shows as default for all users |
| Category duplication | Multiple files | Category data duplicated in 5+ locations |
| Admin data isolation | Admin actions | Admin changes don't affect user portal |
| No route guards (user) | Frontend routes | Authenticated pages accessible without login |
| Wallet balance editable | Frontend | Users can modify wallet balance in DevTools |
| No input sanitization | Forms | HTML/script injection possible in text fields |
| Duplicate AdminUser types | Admin types | Two incompatible definitions |
| Date format inconsistency | Models | Frontend uses ms, admin uses ISO strings |
| No pagination | Lists | All data loaded at once |
| Unsplash images | Mock data | All images from Unsplash (not owned content) |
