# 05 — User Feature Audit

## Summary
The user portal has extensive UI for a full marketplace application. All features are powered entirely by localStorage and mock data. No real backend integration exists.

---

## Feature Audit Table

| Feature | UI Exists | Functionality Exists | Current Data Source | Main Files | Problems | Backend Needed |
|---|---|---|---|---|---|---|
| Splash screen | YES | YES | None | `routes/index.tsx` | None | NO |
| Onboarding | YES | YES (local flow) | localStorage | `routes/onboarding.tsx` | No account creation | YES |
| Registration | NO | NO | — | `routes/register.tsx` | **STUB — empty** | YES |
| Login (phone) | YES | MOCK | localStorage | `routes/login.tsx` | No real SMS | YES |
| OTP verification | YES | MOCK (code: `1234`) | localStorage | `routes/otp.tsx` | Hardcoded OTP | YES |
| Forgot password | NO | NO | — | — | Not implemented | YES |
| Reset password | NO | NO | — | — | Not implemented | YES |
| Google social login | YES (button) | MOCK | localStorage | `routes/login.tsx` | Sets mock provider, no OAuth | YES |
| User profile | YES | LOCAL | localStorage | `routes/account.tsx` | Default "Akhil Reddy" hardcoded | YES |
| Edit profile | YES | LOCAL | localStorage | `routes/account.edit.tsx` | Saves to localStorage only | YES |
| Address management | YES | LOCAL | localStorage | `routes/settings.locations.tsx` | Saves locally only | YES |
| Location selection | YES | LOCAL | localStorage | `routes/location.tsx` | Pincode/area stored locally | YES |
| Home page | YES | MOCK | `lib/mock.ts` | `routes/home.tsx` | All data static mock | YES |
| Search | YES | CLIENT-SIDE | `lib/mock.ts` + localStorage | `routes/search.tsx` | Filters mock array only | YES |
| Search suggestions | YES | LOCAL | localStorage | `routes/search.tsx` | Recent searches stored locally | YES |
| Search history | YES | LOCAL | localStorage | `lib/saved.ts` | Persists per browser | YES |
| Categories | YES | MOCK | `lib/mock.ts` | `routes/categories.tsx` | Static category list | YES |
| Subcategories | YES | MOCK | `lib/mock.ts` | `routes/category.$id.tsx` | Static | YES |
| Filters | YES | CLIENT-SIDE | `lib/mock.ts` | `routes/filters.tsx` | Filters mock array only | YES |
| Sorting | YES | CLIENT-SIDE | `lib/mock.ts` | `routes/results.tsx` | Sorts mock array only | YES |
| Listing cards | YES | MOCK | `lib/mock.ts` | `components/omeetso/ProductCard.tsx` | Static mock products | YES |
| Listing details | YES | MOCK + LOCAL | `lib/mock.ts` + localStorage | `routes/product.$id.tsx` | Mix of mock and user listings | YES |
| Create listing (quick) | YES | LOCAL | localStorage | `routes/sell.quick.tsx` | Saves to localStorage, no backend | YES |
| Create listing (detailed) | YES | LOCAL | localStorage | `routes/sell.detailed.tsx` | Saves to localStorage, no backend | YES |
| Edit listing | YES | LOCAL | localStorage | `routes/listing.$id.edit.tsx` | Local only | YES |
| Delete listing | YES | LOCAL | localStorage | `routes/listing.$id.manage.tsx` | Local only, deletions not synced | YES |
| Draft listings | YES | LOCAL | localStorage | `routes/sell.drafts.tsx` | Auto-save to localStorage | YES |
| Listing approval status | YES | MOCK | localStorage | `routes/listing.$id.manage.tsx` | Status changes don't reach admin | YES |
| Listing expiry | YES | LOCAL | localStorage | `routes/listing.$id.renew.tsx` | Local date calculation only | YES |
| Listing analytics | YES | MOCK | localStorage (mock analytics) | `routes/listing.$id.analytics.tsx` | Randomly generated fake stats | YES |
| Seller profile | YES | MOCK | `lib/mock.ts` | `routes/seller.$id.tsx` | Static mock seller | YES |
| Store creation | YES | LOCAL | localStorage | `routes/store.create.tsx` | Saves to localStorage, no backend | YES |
| Store profile (public) | YES | MOCK | `lib/mock.ts` | `routes/store.$id.tsx` | Static mock store | YES |
| Store management | YES | LOCAL | localStorage | `routes/store.manage.$id.tsx` | Local state management | YES |
| Store editing | YES | LOCAL | localStorage | `routes/store.manage.$id.tsx` | Local only | YES |
| Store products | YES | LOCAL | localStorage | `routes/store.manage.$id.products.tsx` | Local listings linked to store | YES |
| Store timings | YES | LOCAL | localStorage | `routes/store.create.tsx` | Saved locally in store object | YES |
| Store followers | YES | MOCK | `lib/mock.ts` | `routes/store.$id.tsx` | Hardcoded follower count | YES |
| Store reviews | YES | MOCK | `lib/mock.ts` | `routes/store.$id.tsx` | Hardcoded mock reviews | YES |
| Favourites / Saved | YES | LOCAL | localStorage | `routes/saved.tsx`, `lib/saved.ts` | Product IDs stored, lookup from mock | YES |
| Recently viewed | NO | NO | — | `routes/recently-viewed.tsx` | **STUB — empty** | YES |
| Saved searches | YES | LOCAL | localStorage | `lib/saved.ts` | Recent searches stored locally | YES |
| Compare feature | NO | NO | — | — | Not implemented | NO (low priority) |
| Chat (threads) | YES | LOCAL | localStorage | `routes/chats.tsx`, `lib/chat.ts` | Local only, no real-time | YES |
| Chat messages | YES | LOCAL | localStorage | `routes/chat.$id.tsx`, `lib/chat.ts` | Not shared between users | YES |
| Offers system | YES | LOCAL | localStorage | `routes/offer.$id.tsx`, `lib/chat.ts` | Local only, other user can't see | YES |
| Message attachments (images) | YES (UI) | PARTIAL | Object URLs | `routes/chat.$id.tsx` | Creates object URL, not persisted properly | YES |
| Typing indicators | NO | NO | — | — | Not implemented | YES |
| Read receipts | YES (UI) | MOCK | localStorage | `lib/chat.ts` | Simulated with setTimeout, not real | YES |
| Online status | YES (UI) | MOCK | `lib/mock.ts` | `routes/chat.$id.tsx` | Hardcoded in seed data | YES |
| Notifications | YES | LOCAL | localStorage | `routes/notifications.tsx`, `lib/account.ts` | Local mock notifications | YES |
| Reviews (write) | YES | LOCAL | localStorage | `routes/reviews.new.tsx` | Saved to localStorage only | YES |
| Reviews (received) | YES | LOCAL | localStorage | `routes/reviews.index.tsx` | Local only | YES |
| Ratings | YES | MOCK | `lib/mock.ts` | Multiple pages | Static mock ratings | YES |
| Reports (user/listing) | YES | LOCAL | localStorage | `routes/safety.report.tsx` | Saves to localStorage, no admin notification | YES |
| User verification | YES | MOCK | localStorage | `routes/account.verification.$type.tsx` | Mock flow, no real verification | YES |
| Seller verification | YES | MOCK | localStorage | `routes/account.verification.$type.tsx` | Mock KYC flow | YES |
| KYC | YES | MOCK | localStorage | `routes/account.verification.$type.tsx` | Mock document upload (object URLs) | YES |
| Promotions | YES | LOCAL | localStorage, `lib/revenue.ts` | `routes/promotions.new.tsx` | Mock wallet deduction, no real payment | YES |
| Boosts | YES | LOCAL | localStorage, `lib/revenue.ts` | `routes/promotions.new.tsx` | Mock boost, no real ranking effect | YES |
| Advertisements (create) | YES | LOCAL | localStorage, `lib/revenue.ts` | `routes/ads.new.tsx` | Mock payment, saves to localStorage | YES |
| Advertisements (display) | YES | MOCK | `lib/mock.ts`, `lib/ads.ts` | `components/omeetso/AdBanner.tsx` | Static mock ads with fake tracking | YES |
| Support tickets | YES | LOCAL | localStorage | `routes/support.new.tsx` | Saves locally, admin can't see | YES |
| Terms and policies | YES | NO | Static | Multiple routes | Static content only | NO |
| Privacy settings | YES | LOCAL | localStorage | `routes/settings.privacy.tsx` | Local toggle only | YES |
| Account deletion | YES | MOCK | localStorage | `routes/settings.delete.tsx` | Clears localStorage only | YES |
| Logout | YES | LOCAL | localStorage | `routes/logout.tsx` | Clears localStorage, navigates to / | YES |
| Wallet | YES | LOCAL | localStorage, `lib/revenue.ts` | `routes/wallet.tsx` | Mock balance, no real money | YES |
| Language setting | YES | LOCAL | localStorage | `routes/language.tsx` | Saves preference, no real i18n | NO |
| Dark/light mode | YES | FUNCTIONAL | localStorage | `routes/settings.appearance.tsx` | Works via CSS class | NO |

---

## Form Inventory

| Form | Route | File Path | Fields | Validation | Submit Handler | Storage | Works? | Survives Refresh? |
|---|---|---|---|---|---|---|---|---|
| Phone Login | `/login` | `routes/login.tsx` | phone (10 digits) | Length check | Navigate to OTP | localStorage (`omeetso_pending_phone`) | MOCK | YES (phone stored) |
| OTP Verify | `/otp` | `routes/otp.tsx` | 4-digit code | Code === "1234" | Navigate to home | localStorage (`omeetso_user`) | MOCK | YES |
| Profile Setup | `/profile-setup` | `routes/profile-setup.tsx` | name, city, pincode | Minimal | Save to localStorage | localStorage | LOCAL | YES |
| Edit Profile | `/account/edit` | `routes/account.edit.tsx` | name, bio, email, mobile, avatar | Basic | Save to localStorage | localStorage | LOCAL | YES |
| Quick Sell | `/sell/quick` | `routes/sell.quick.tsx` | photos, title, desc, price, condition, category, location | Multi-step via `lib/listingValidation.ts` | `upsertListing()` | localStorage | LOCAL | YES |
| Detailed Sell | `/sell/detailed` | `routes/sell.detailed.tsx` | All quick fields + specs + fulfilment | Comprehensive | `upsertListing()` | localStorage | LOCAL | YES |
| Create Store | `/store/create` | `routes/store.create.tsx` | name, description, category, location, contact, hours, delivery | Per-step required checks | `upsertStore()` | localStorage | LOCAL | YES |
| New Promotion | `/promotions/new` | `routes/promotions.new.tsx` | package, placements, payment method | Step checks | `upsertPromotion()` + `debitWallet()` | localStorage | LOCAL MOCK | YES |
| New Ad Campaign | `/ads/new` | `routes/ads.new.tsx` | objective, creative, audience, placement, budget | Step checks | `upsertCampaign()` | localStorage | LOCAL MOCK | YES |
| Add Money (Wallet) | `/wallet/add` | `routes/wallet.add.tsx` | amount, payment method | Amount > 0 | `addWalletFunds()` | localStorage | MOCK | YES |
| Write Review | `/reviews/new` | `routes/reviews.new.tsx` | rating, text, target | Rating required | `addReview()` | localStorage | LOCAL | YES |
| Report Content | `/safety/report` | `routes/safety.report.tsx` | target type, reason, description | Reason required | `addReport()` | localStorage | LOCAL | YES |
| New Support Ticket | `/support/new` | `routes/support.new.tsx` | subject, category, description | Subject required | `addTicket()` | localStorage | LOCAL | YES |
| Identity Verification | `/account/verification/identity` | `routes/account.verification.$type.tsx` | govt ID type, document photo | Type required | Mock submission | localStorage | MOCK | YES |
| Mobile Verify | `/account/verification/mobile` | `routes/account.verification.$type.tsx` | OTP code | None | Mock | localStorage | MOCK | YES |
| Location Select | `/location` | `routes/location.tsx` | pincode, area | Pincode 6 digits | Save to localStorage | localStorage | LOCAL | YES |
| Edit Listing | `/listing/$id/edit` | `routes/listing.$id.edit.tsx` | Same as sell form | Validation | `upsertListing()` | localStorage | LOCAL | YES |
| Offer (make) | `/offer/$id` | `routes/offer.$id.tsx` | amount, message | Amount > 0 | `createOffer()` | localStorage | LOCAL | YES |
| Language Select | `/language` | `routes/language.tsx` | language selection | — | Save to localStorage | localStorage | LOCAL | YES |
| Privacy Settings | `/settings/privacy` | `routes/settings.privacy.tsx` | toggle switches | — | `setPrivacySettings()` | localStorage | LOCAL | YES |
| Deactivate Account | `/settings/deactivate` | `routes/settings.deactivate.tsx` | reason, confirm | Confirm match | Clears localStorage | localStorage | MOCK | NO (cleared) |
| Delete Account | `/settings/delete` | `routes/settings.delete.tsx` | reason, password | Confirm required | Clears localStorage | localStorage | MOCK | NO (cleared) |
