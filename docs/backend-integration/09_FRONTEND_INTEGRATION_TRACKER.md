# 09 — User Frontend Integration Tracker

## Summary
This document tracks the refactoring of `frontend/` routes and data layers to consume REST APIs and Socket.IO real-time channels instead of `localStorage`.

---

## Route Integration Status

| Route / Module | Key Files | Target API Endpoints | Query / Mutation Hooks | Status |
|---|---|---|---|---|
| **Splash / Home** | `routes/index.tsx`, `routes/home.tsx` | `GET /api/v1/listings`<br>`GET /api/v1/categories` | `useListingsQuery`<br>`useCategoriesQuery` | COMPLETED |
| **Auth / Login / OTP** | `routes/login.tsx`, `routes/otp.tsx` | `POST /api/v1/auth/otp/request`<br>`POST /api/v1/auth/otp/verify` | `useRequestOtpMutation`<br>`useVerifyOtpMutation` | COMPLETED |
| **Search / Results** | `routes/search.tsx`, `routes/results.tsx` | `GET /api/v1/listings?q=...` | `useListingSearchQuery` | COMPLETED |
| **Listing Detail** | `routes/product.$id.tsx` | `GET /api/v1/listings/:id` | `useListingDetailQuery` | COMPLETED |
| **Quick Sell** | `routes/sell.quick.tsx` | `POST /api/v1/listings` | `useCreateListingMutation` | COMPLETED |
| **Detailed Sell** | `routes/sell.detailed.tsx` | `POST /api/v1/listings` | `useCreateListingMutation` | COMPLETED |
| **My Listings** | `routes/listings.tsx`, `listing.$id.manage.tsx` | `GET /api/v1/users/me/listings`<br>`PATCH /api/v1/listings/:id` | `useMyListingsQuery`<br>`useUpdateListingMutation` | COMPLETED |
| **Store Create / Manage** | `routes/store.create.tsx`, `store.manage.$id.tsx` | `POST /api/v1/stores`<br>`GET /api/v1/users/me/stores` | `useCreateStoreMutation`<br>`useMyStoresQuery` | COMPLETED |
| **Chat Threads** | `routes/chats.tsx` | `GET /api/v1/conversations` | `useConversationsQuery` | COMPLETED |
| **Chat Room** | `routes/chat.$id.tsx` | `GET /api/v1/conversations/:id/messages`<br>`POST /api/v1/conversations/:id/messages` | `useMessagesQuery`<br>`useSendMessageMutation`<br>`useSocketEvents` | COMPLETED |
| **Offers** | `routes/offer.$id.tsx` | `POST /api/v1/offers/:id/accept` | `useRespondOfferMutation` | COMPLETED |
| **Account / Profile** | `routes/account.tsx`, `account.edit.tsx` | `GET /api/v1/users/me`<br>`PATCH /api/v1/users/me` | `useCurrentUserQuery`<br>`useUpdateProfileMutation` | COMPLETED |
| **Notifications** | `routes/notifications.tsx` | `GET /api/v1/notifications` | `useNotificationsQuery` | COMPLETED |
| **Promotions** | `routes/promotions.new.tsx` | `POST /api/v1/ad-campaigns` | `createAdCampaignApi`<br>`submitAdCampaignApi` | COMPLETED |
| **Ad Campaigns** | `routes/ads.new.tsx` | `POST /api/v1/ad-campaigns` | `createAdCampaignApi`<br>`submitAdCampaignApi` | COMPLETED |
| **Wallet** | `routes/wallet.tsx` | `GET /api/v1/users/me/wallet` | `useWalletQuery` | COMPLETED |

---

## Data Layer Refactoring Guidelines

1. Do NOT delete existing UI components or layout wrappers (`MobileFrame`, `TopBar`, `BottomNav`).
2. Replace local state storage functions in `lib/listings.ts`, `lib/chat.ts`, and `lib/account.ts` with API calls defined in `src/api/*.api.ts`.
3. Wrap API calls in TanStack Query hooks inside `src/queries/*.queries.ts`.
4. Replace direct `localStorage.getItem("omeetso_user")` checks with `useCurrentUserQuery()`.
