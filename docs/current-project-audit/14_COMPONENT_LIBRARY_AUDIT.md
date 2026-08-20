# 14 — Component Library Audit

## User Portal Components

### Core Application Components (`frontend/src/components/omeetso/`)

| Component | File | Purpose | Data Source | Reusability |
|---|---|---|---|---|
| `AdBanner` | `AdBanner.tsx` | Displays mock ads with dismiss | `lib/mock.ts` (ADS array) + `lib/ads.ts` | HIGH |
| `BottomNav` | `BottomNav.tsx` | Mobile bottom navigation bar | Static routes | HIGH |
| `BottomSheet` | `BottomSheet.tsx` | Slide-up modal sheet | Props | HIGH |
| `CategoryIcon` | `CategoryIcon.tsx` | Category icon renderer | Lucide icon map | HIGH |
| `EmptyState` | `EmptyState.tsx` | Empty state placeholder | Props | HIGH |
| `FilterChip` | `FilterChip.tsx` | Filter toggle chip | Props | HIGH |
| `InfoPage` | `InfoPage.tsx` | Generic info/error page | Props | HIGH |
| `Logo` | `Logo.tsx` | Omeetso text/mark logo | Static SVG | HIGH |
| `MobileFrame` | `MobileFrame.tsx` | Mobile viewport frame wrapper | — | HIGH — wrapper for all pages |
| `OfferSheet` | `OfferSheet.tsx` | Price offer form sheet | Props + localStorage | MEDIUM |
| `ProductCard` | `ProductCard.tsx` | Listing card in grid/list view | Product props | HIGH |
| `ReportSheet` | `ReportSheet.tsx` | Report reason form sheet | `lib/saved.ts` | MEDIUM |
| `SafetyCard` | `SafetyCard.tsx` | Safety tip card | Props | MEDIUM |
| `SellerSummary` | `SellerSummary.tsx` | Seller profile summary | Props | HIGH |
| `SortSheet` | `SortSheet.tsx` | Sort options sheet | Props + mock options | MEDIUM |
| `StoreCard` | `StoreCard.tsx` | Store card in list view | Props | HIGH |
| `TopBar` | `TopBar.tsx` | Exports: `BackBar`, `LocationTopBar`, `SearchTopBar` | localStorage (location) | HIGH |
| `WebsiteHeader` | `WebsiteHeader.tsx` | Desktop website header with nav | Static routes | MEDIUM |
| `WebsiteFooter` | `WebsiteFooter.tsx` | Desktop website footer | Static links | MEDIUM |

### Account Sub-components (`components/omeetso/account/`)

| Component | Purpose |
|---|---|
| `SectionTitle` | Section heading with optional hint |
| `MenuGroup` | Grouped list section |
| `MenuRow` | Single menu item row |
| `Stat` | Stat display (number + label) |
| `VerifBadge` | Verification status badge |
| `ConfirmModal` | Confirmation dialog |

### Chat Sub-components (`components/omeetso/chat/`)

| Component | Purpose |
|---|---|
| `MessageBubble` | Text/image/system message bubble |
| `OfferCard` | Offer/counter-offer card |
| `TransactionCard` | Transaction confirmation card |
| `SafetyBanner` | In-chat safety tips |
| `AttachmentSheet` | Camera/gallery picker |

### Revenue Sub-components (`components/omeetso/revenue/`)

| Component | Purpose |
|---|---|
| `BoostPackageCard` | Boost package selection card |
| `PlacementRow` | Ad placement toggle row |
| `SectionTitle` | Section title |
| `ObjectiveCard` | Campaign objective selection card |
| `BillingSummary` | Payment summary |
| `PreviewSponsoredCard` | Preview of ad appearance |
| `StepIndicator` | Multi-step form indicator |
| `WalletBalanceCard` | Wallet balance display card |
| `ConfirmModal` | Confirmation modal |

### Sell Form Components (`components/sell/`)

| Component | Purpose | Used In |
|---|---|---|
| `ImageUploader` | Photo capture/upload UI | Quick sell, detailed sell |
| `StepIndicator` | Multi-step form progress | Quick sell, detailed sell |
| `ConditionSelector` | Condition radio buttons | Quick sell |
| `PriceInput` | Price with negotiable toggle | Quick sell |
| `ContactPreferenceSelector` | Contact pref radio | Quick sell |
| `LocationSelector` | Pincode + area selector | Quick sell |
| `ValidationSummary` | Error list display | Quick sell |
| `AutoSaveIndicator` | "Auto-saved X ago" indicator | Quick sell |
| `ConfirmModal` | Exit confirmation | Quick sell, store create |
| `LoadingOverlay` | Publishing overlay | Quick sell |

### Shadcn UI Components (`components/ui/`)

Standard Radix-based components installed via Shadcn CLI:
- `accordion`, `alert`, `alert-dialog`, `avatar`, `badge`, `button`, `calendar`
- `card`, `checkbox`, `dialog`, `drawer`, `dropdown-menu`, `form`
- `input`, `label`, `navigation-menu`, `popover`, `progress`, `radio-group`
- `scroll-area`, `select`, `separator`, `sheet`, `skeleton`, `slider`
- `sonner`, `switch`, `table`, `tabs`, `textarea`, `toast`, `toggle`
- `tooltip`

All Shadcn components are stock — no custom modifications found.

---

## Admin Portal Components

### Layout Components (`admin/src/layouts/`)

| Component | File | Purpose |
|---|---|---|
| `AdminLayout` | `AdminLayout.tsx` | Main layout with sidebar + header |
| `AuthLayout` | `AuthLayout.tsx` | Auth pages layout |

### Common Components (`admin/src/components/common/`)

| Component | File | Purpose |
|---|---|---|
| `Button` | `Button.tsx` | Custom button with variants |
| `Can` | `Can.tsx` | Conditional render by permission |
| `ConfirmationModal` | `ConfirmationModal.tsx` | Action confirmation dialog |
| `EmptyState` | `EmptyState.tsx` | Empty data placeholder |
| `ErrorBoundary` | `ErrorBoundary.tsx` | React error boundary |
| `ErrorState` | `ErrorState.tsx` | Error display |
| `LoadingSpinner` | `LoadingSpinner.tsx` | Loading indicator |
| `OfflineState` | `OfflineState.tsx` | Offline detection UI |
| `PagePlaceholder` | `PagePlaceholder.tsx` | "Coming soon" placeholder |
| `RequireAdmin` | `RequireAdmin.tsx` | Auth check wrapper |
| `RouteLoader` | `RouteLoader.tsx` | Lazy-load route wrapper |
| `ScrollToTop` | `ScrollToTop.tsx` | Scroll to top on route change |
| `Skeleton` | `Skeleton.tsx` | Content skeleton loader |
| `StatCard` | `StatCard.tsx` | Dashboard stat card |
| `StatusBadge` | `StatusBadge.tsx` | Colored status badge |

### Auth Guard Components (`admin/src/components/auth/`)

| Component | File | Purpose |
|---|---|---|
| `ProtectedAdminRoute` | `ProtectedAdminRoute.tsx` | Auth guard wrapper |
| `PermissionRoute` | `PermissionRoute.tsx` | Permission guard wrapper |

---

## Component Quality Observations

| Observation | Details |
|---|---|
| **Good:** MobileFrame pattern | Every page wrapped in `<MobileFrame>` ensures consistent mobile viewport |
| **Good:** TopBar variants | `BackBar`, `LocationTopBar`, `SearchTopBar` cover all nav patterns |
| **Good:** BottomNav active state | Correctly highlights active route |
| **Good:** Pub/sub pattern | localStorage changes broadcast to all subscribers via custom pub/sub |
| **Issue:** No shared components between portals | Both portals implement their own versions of buttons, badges, modals |
| **Issue:** No design tokens shared | Tailwind config differs between portals |
| **Issue:** `MobileFrame` on website pages | Desktop layout works, but the mobile wrapper creates max-width constraints |
| **Issue:** `WebsiteHeader` conditionally hidden | Shows on `/` and public pages; hidden on app pages — logic in CSS |
| **Issue:** Static images from Unsplash | All product/seller/store images are Unsplash URLs — will break in production without a CDN |
| **Issue:** Image upload uses blob: URLs | Object URLs not serializable to string for database storage |
| **Good:** Recharts usage | Both portals use Recharts for data visualization consistently |
| **Issue:** No virtualized lists | Long lists (products, chats) render all items at once — performance risk |
| **Issue:** No infinite scroll | All list pages load everything from mock data at once |
| **Issue:** No skeleton loading | Many pages show blank state during "loading" period |
