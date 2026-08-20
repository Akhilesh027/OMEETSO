# 03 — User Portal Routes

**Router:** TanStack Router (file-based, auto-generated routeTree.gen.ts)
**Total Routes:** 110 route files

## Route Table

| Route | Page Name | File Path | Purpose | User Role | Data Source | Current Status |
|---|---|---|---|---|---|---|
| `/` | Splash | `routes/index.tsx` | Loading / splash screen with animated logo | Public | None | Functional UI |
| `/login` | Login | `routes/login.tsx` | Phone number entry for OTP auth | Public | localStorage | Mock — saves phone, navigates to /otp |
| `/otp` | OTP Verify | `routes/otp.tsx` | 4-digit OTP verification (hardcoded: `1234`) | Public | localStorage | Mock — any `1234` succeeds |
| `/onboarding` | Onboarding | `routes/onboarding.tsx` | New user onboarding flow | Public | localStorage | Functional UI |
| `/welcome` | Welcome | `routes/welcome.tsx` | Welcome screen post-login | Public | localStorage | Functional UI |
| `/profile-setup` | Profile Setup | `routes/profile-setup.tsx` | Initial profile creation form | Authenticated | localStorage | Saves to localStorage only |
| `/location` | Location | `routes/location.tsx` | Location selection / pincode entry | Public | localStorage | Saves location to localStorage |
| `/register` | Register | `routes/register.tsx` | Registration page | Public | None | **STUB — 184 bytes, nearly empty** |
| `/home` | Home | `routes/home.tsx` | Main home feed with listings, ads, categories | Public/Guest | `lib/mock.ts` | Mock data |
| `/search` | Search | `routes/search.tsx` | Search with suggestions + history | Public | localStorage + mock | Client-side mock filter |
| `/results` | Results | `routes/results.tsx` | Search results list | Public | `lib/mock.ts` | Client-side mock filter |
| `/filters` | Filters | `routes/filters.tsx` | Advanced filter page | Public | `lib/mock.ts` | Client-side mock |
| `/categories` | Categories | `routes/categories.tsx` | All categories grid | Public | `lib/mock.ts` | Static mock data |
| `/category/$id` | Category Detail | `routes/category.$id.tsx` | Category listings with filters | Public | `lib/mock.ts` | Client-side mock filter |
| `/product/$id` | Product Detail | `routes/product.$id.tsx` | Listing detail page | Public | `lib/mock.ts` + localStorage | Mixed mock + user listings |
| `/gallery/$id` | Gallery | `routes/gallery.$id.tsx` | Image gallery viewer | Public | `lib/mock.ts` | Functional UI |
| `/seller/$id` | Seller Profile | `routes/seller.$id.tsx` | Public seller profile | Public | `lib/mock.ts` | Mock data |
| `/store/$id` | Store Profile | `routes/store.$id.tsx` | Public store page | Public | `lib/mock.ts` | Mock data |
| `/stores` | Stores | `routes/stores.tsx` | Stores listing | Public | `lib/mock.ts` | **STUB — 998 bytes** |
| `/map` | Map View | `routes/map.tsx` | Map-based listings view | Public | `lib/mock.ts` | UI only, no real map API |
| `/saved` | Saved / Favourites | `routes/saved.tsx` | Saved product IDs list | Authenticated | localStorage | IDs only, products from mock |
| `/recently-viewed` | Recently Viewed | `routes/recently-viewed.tsx` | Recently viewed items | Public | localStorage | **STUB — 191 bytes** |
| `/chats` | Chat List | `routes/chats.tsx` | All conversations list | Authenticated | `lib/chat.ts` + localStorage | Local only, no real-time |
| `/chat/$id` | Chat Thread | `routes/chat.$id.tsx` | Individual conversation + offers | Authenticated | `lib/chat.ts` + localStorage | Local only, no real-time |
| `/chat/safety` | Chat Safety | `routes/chat.safety.tsx` | Safety information page | Authenticated | Static | Static content |
| `/notifications` | Notifications | `routes/notifications.tsx` | Notification list | Authenticated | `lib/account.ts` + localStorage | Local only |
| `/notifications/$id` | Notification Detail | `routes/notifications.$id.tsx` | Single notification | Authenticated | localStorage | Local |
| `/notifications/preferences` | Notification Prefs | `routes/notifications.preferences.tsx` | Notification settings | Authenticated | localStorage | Local settings |
| `/account` | Account | `routes/account.tsx` | Account dashboard / menu | Authenticated | `lib/account.ts` + localStorage | Comprehensive local state |
| `/account/edit` | Edit Profile | `routes/account.edit.tsx` | Edit name, bio, avatar, etc. | Authenticated | localStorage | Saves locally only |
| `/account/public` | Public Profile | `routes/account.public.tsx` | Preview public profile | Authenticated | localStorage | Preview only |
| `/account/verification` | Verification Hub | `routes/account.verification.index.tsx` | Verification status overview | Authenticated | localStorage | Mock verification status |
| `/account/verification/$type` | Verification Flow | `routes/account.verification.$type.tsx` | Mobile/email/identity/business verification | Authenticated | localStorage | Mock flow, no real verification |
| `/sell` | Sell Hub | `routes/sell.index.tsx` | Choose quick/detailed sell | Authenticated | None | Navigation only |
| `/sell/quick` | Quick Sell | `routes/sell.quick.tsx` | Multi-step quick listing form | Authenticated | localStorage | Saves to localStorage only |
| `/sell/quick/success` | Quick Success | `routes/sell.quick.success.tsx` | Listing submitted confirmation | Authenticated | localStorage | UI confirmation |
| `/sell/detailed` | Detailed Sell | `routes/sell.detailed.tsx` | Full listing form with specs | Authenticated | localStorage | Saves to localStorage only |
| `/sell/detailed/success` | Detailed Success | `routes/sell.detailed.success.tsx` | Detailed listing confirmation | Authenticated | localStorage | UI confirmation |
| `/sell/drafts` | Drafts | `routes/sell.drafts.tsx` | Saved listing drafts | Authenticated | localStorage | Local drafts only |
| `/sell/store` | Sell from Store | `routes/sell.store.tsx` | Store-linked listing creation | Authenticated | localStorage | Store product creation |
| `/listings` | My Listings | `routes/listings.tsx` | User's own listings | Authenticated | localStorage | Local listings only |
| `/listing/$id/manage` | Manage Listing | `routes/listing.$id.manage.tsx` | Pause/activate/delete listing | Authenticated | localStorage | Local state changes |
| `/listing/$id/edit` | Edit Listing | `routes/listing.$id.edit.tsx` | Edit existing listing | Authenticated | localStorage | Local only |
| `/listing/$id/analytics` | Listing Analytics | `routes/listing.$id.analytics.tsx` | Views/saves/chats stats | Authenticated | localStorage (mock analytics) | Mock stats |
| `/listing/$id/rejection` | Rejection Details | `routes/listing.$id.rejection.tsx` | Admin rejection reason view | Authenticated | localStorage | Mock rejection data |
| `/listing/$id/renew` | Renew Listing | `routes/listing.$id.renew.tsx` | Extend listing expiry | Authenticated | localStorage | Local state update |
| `/store/create` | Create Store | `routes/store.create.tsx` | 8-step store creation form | Authenticated | localStorage | Saves to localStorage only |
| `/store/select` | Select Store | `routes/store.select.tsx` | Choose which store to manage | Authenticated | localStorage | Local stores list |
| `/store/success` | Store Success | `routes/store.success.tsx` | Store created confirmation | Authenticated | localStorage | UI confirmation |
| `/store/manage/$id` | Manage Store | `routes/store.manage.$id.tsx` | Store management dashboard | Authenticated | localStorage | Local state |
| `/store/manage/$id/products` | Store Products | `routes/store.manage.$id.products.tsx` | Store product management | Authenticated | localStorage | Local state |
| `/store/manage/$id/add-existing` | Add Product | `routes/store.manage.$id.add-existing.tsx` | Add existing listing to store | Authenticated | localStorage | Local state |
| `/store/manage/$id/preview` | Store Preview | `routes/store.manage.$id.preview.tsx` | Preview store profile | Authenticated | localStorage | Preview only |
| `/promotions` | Promotions Hub | `routes/promotions.index.tsx` | Promotions overview | Authenticated | localStorage | Local state |
| `/promotions/new` | New Promotion | `routes/promotions.new.tsx` | 5-step promotion creation | Authenticated | localStorage | Mock payment, saves locally |
| `/promotions/listings` | Promote Listings | `routes/promotions.listings.tsx` | Select listing to promote | Authenticated | localStorage | Local listings |
| `/promotions/stores` | Promote Stores | `routes/promotions.stores.tsx` | Select store to promote | Authenticated | localStorage | Local stores |
| `/promotions/store-products` | Promote Products | `routes/promotions.store-products.tsx` | Select store product to promote | Authenticated | localStorage | Local products |
| `/promotions/custom` | Custom Promotion | `routes/promotions.custom.tsx` | Custom promotion setup | Authenticated | localStorage | Local |
| `/promotions/payment` | Promotion Payment | `routes/promotions.payment.tsx` | Payment confirmation | Authenticated | localStorage | Mock payment |
| `/promotions/$id` | Promotion Detail | `routes/promotions.$id.tsx` | View promotion details | Authenticated | localStorage | Local |
| `/promotions/$id/analytics` | Promotion Analytics | `routes/promotions.$id.analytics.tsx` | Promotion performance | Authenticated | localStorage (mock) | Mock analytics |
| `/promote/placeholder` | Promote Placeholder | `routes/promote.placeholder.tsx` | Placeholder promotion page | Authenticated | None | Placeholder UI |
| `/ads` | Ads Overview | `routes/ads.index.tsx` | Ad campaigns list | Authenticated | localStorage | Local campaigns |
| `/ads/new` | New Ad | `routes/ads.new.tsx` | 8-step ad campaign creation | Authenticated | localStorage | Mock payment, saves locally |
| `/ads/$id` | Ad Detail | `routes/ads.$id.tsx` | Campaign detail | Authenticated | localStorage | Local |
| `/ads/$id/analytics` | Ad Analytics | `routes/ads.$id.analytics.tsx` | Campaign analytics | Authenticated | localStorage (mock) | Mock analytics |
| `/wallet` | Wallet | `routes/wallet.tsx` | Wallet balance, credits | Authenticated | localStorage | Local mock wallet |
| `/wallet/add` | Add Money | `routes/wallet.add.tsx` | Add funds to wallet | Authenticated | localStorage | Mock payment |
| `/wallet/credits` | Credits | `routes/wallet.credits.tsx` | Promotional credits | Authenticated | localStorage | Local mock |
| `/wallet/transactions` | Transactions | `routes/wallet.transactions.tsx` | Transaction history | Authenticated | localStorage | Local mock |
| `/wallet/transaction/$id` | Transaction Detail | `routes/wallet.transaction.$id.tsx` | Transaction details | Authenticated | localStorage | Local |
| `/billing` | Billing | `routes/billing.tsx` | Billing profile | Authenticated | localStorage | Local |
| `/invoices` | Invoices | `routes/invoices.tsx` | Invoice list | Authenticated | localStorage | Local mock |
| `/invoice/$id` | Invoice Detail | `routes/invoice.$id.tsx` | Single invoice | Authenticated | localStorage | Local mock |
| `/offers` | Offers | `routes/offers.tsx` | Active offers list | Authenticated | localStorage | Local via chat.ts |
| `/offer/$id` | Offer Detail | `routes/offer.$id.tsx` | Offer negotiation | Authenticated | localStorage | Local via chat.ts |
| `/transaction/$offerId` | Transaction | `routes/transaction.$offerId.tsx` | Transaction confirm/complete | Authenticated | localStorage | Local |
| `/reviews` | Reviews | `routes/reviews.index.tsx` | Reviews received/given | Authenticated | localStorage | Local |
| `/reviews/new` | Write Review | `routes/reviews.new.tsx` | Write review form | Authenticated | localStorage | Saves locally only |
| `/reviews/report/$id` | Report Review | `routes/reviews.report.$id.tsx` | Report a review | Authenticated | localStorage | Local |
| `/safety` | Safety Hub | `routes/safety.index.tsx` | Safety tips overview | Public | Static | Static content |
| `/safety/$topic` | Safety Topic | `routes/safety.$topic.tsx` | Safety tip detail | Public | Static | Static content |
| `/safety/report` | Report | `routes/safety.report.tsx` | Report a user/listing | Authenticated | localStorage | Saves locally only |
| `/support` | Support Hub | `routes/support.index.tsx` | Support tickets overview | Authenticated | localStorage | Local mock |
| `/support/new` | New Ticket | `routes/support.new.tsx` | Create support ticket | Authenticated | localStorage | Saves locally |
| `/support/$id` | Ticket Detail | `routes/support.$id.tsx` | Support ticket thread | Authenticated | localStorage | Local mock |
| `/help` | Help Center | `routes/help.index.tsx` | Help articles | Public | `lib/faq.ts` | Static FAQ content |
| `/help/faq/$id` | FAQ Detail | `routes/help.faq.$id.tsx` | Single FAQ article | Public | `lib/faq.ts` | Static |
| `/help/search` | Help Search | `routes/help.search.tsx` | Search help articles | Public | `lib/faq.ts` | Client-side filter |
| `/settings` | Settings | `routes/settings.index.tsx` | Settings menu | Authenticated | localStorage | Navigation |
| `/settings/account` | Account Settings | `routes/settings.account.tsx` | Phone, email, password | Authenticated | localStorage | Mock — no real change |
| `/settings/privacy` | Privacy Settings | `routes/settings.privacy.tsx` | Privacy toggles | Authenticated | localStorage | Saves locally |
| `/settings/appearance` | Appearance | `routes/settings.appearance.tsx` | Dark/light/system mode | Authenticated | localStorage | Functional (CSS) |
| `/settings/locations` | Saved Locations | `routes/settings.locations.tsx` | Saved addresses/locations | Authenticated | localStorage | Saves locally |
| `/settings/blocked` | Blocked Users | `routes/settings.blocked.tsx` | Blocked user list | Authenticated | localStorage | Local list |
| `/settings/ad-preferences` | Ad Preferences | `routes/settings.ad-preferences.tsx` | Ad interest settings | Authenticated | localStorage | Saves locally |
| `/settings/deactivate` | Deactivate | `routes/settings.deactivate.tsx` | Account deactivation | Authenticated | localStorage | Mock — clears localStorage |
| `/settings/delete` | Delete Account | `routes/settings.delete.tsx` | Permanent account deletion | Authenticated | localStorage | Mock — clears localStorage |
| `/language` | Language | `routes/language.tsx` | Language selection | Public | localStorage | Saves to localStorage |
| `/logout` | Logout | `routes/logout.tsx` | Logout action | Authenticated | localStorage | Clears localStorage |
| `/about` | About | `routes/about.tsx` | About Omeetso | Public | Static | Static content |
| `/contact` | Contact | `routes/contact.tsx` | Contact page | Public | Static | Static content |
| `/careers` | Careers | `routes/careers.tsx` | Careers page | Public | Static | Static content |
| `/terms` | Terms | `routes/terms.tsx` | Terms of service | Public | Static | Static content |
| `/privacy` | Privacy Policy | `routes/privacy.tsx` | Privacy policy | Public | Static | Static content |
| `/community-guidelines` | Guidelines | `routes/community-guidelines.tsx` | Community rules | Public | Static | Static content |
| `/advertising-policy` | Ad Policy | `routes/advertising-policy.tsx` | Advertising policy | Public | Static | Static content |
| `/cookie-preferences` | Cookie Prefs | `routes/cookie-preferences.tsx` | Cookie settings | Public | Static | Static content |

---

## Problem Routes

| Route | Problem |
|---|---|
| `/register` | STUB — nearly empty (184 bytes), no implementation |
| `/recently-viewed` | STUB — 191 bytes, no implementation |
| `/stores` | STUB — 998 bytes, minimal |
| All `/wallet/` routes | Mock payment — no real payment gateway |
| All `/ads/` routes | Mock campaigns — data never submitted to backend |
| All `/promotions/` routes | Mock promotions — data never submitted to backend |
| All `/account/verification/` routes | Mock verification — no real OTP/KYC |
| `/map` | No real map API integrated |

---

## Route Access Control
There is **no route guard** in the user portal. All routes are accessible to any visitor regardless of authentication status. The `omeetso_user` localStorage key is checked in some components, but routes are not protected at the router level.

**SECURITY RISK:** Any user can navigate directly to `/account`, `/sell`, `/chats`, `/listings`, `/wallet` etc. without authentication.
