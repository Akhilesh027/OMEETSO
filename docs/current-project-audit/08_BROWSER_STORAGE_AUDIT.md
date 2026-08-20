# 08 — Browser Storage Audit

## Summary
Both portals rely entirely on `localStorage` for all data persistence. No `sessionStorage`, `IndexedDB`, cookies, or third-party persistence is used.

---

## Frontend (User Portal) localStorage Keys

| Storage Key | Written In | Read In | Data Stored | Business Critical | Backend Replacement |
|---|---|---|---|---|---|
| `omeetso_user` | `routes/login.tsx`, `routes/otp.tsx` | `routes/account.tsx`, `lib/chat.ts` | `{provider, phone}` or `{provider: "google"}` | YES — auth token proxy | YES — JWT/session |
| `omeetso_guest` | `routes/login.tsx` | `lib/chat.ts` (isGuest) | `"1"` string | YES | YES |
| `omeetso_guest_session` | `routes/login.tsx` | Various | `"1"` string | YES | YES |
| `omeetso_pending_phone` | `routes/login.tsx` | `routes/otp.tsx` | Phone number string | YES — temp | YES |
| `omeetso_profile` | (legacy key) | `routes/otp.tsx` | Profile object | YES | YES |
| `omeetso_profile_data` | `lib/account.ts` | `lib/account.ts` | Full Profile object | YES | YES |
| `omeetso_user` (legacy) | `lib/account.ts` | `lib/account.ts` | Partial user object | YES | YES |
| `omeetso_business_profile` | `lib/account.ts` | `lib/account.ts` | BusinessProfile object | YES | YES |
| `omeetso_verification_status` | `lib/account.ts` | `lib/account.ts` | VerificationMap | YES | YES |
| `omeetso_notifications` | `lib/account.ts` | `lib/account.ts` | Notification[] | YES | YES |
| `omeetso_notification_preferences` | `lib/account.ts` | `lib/account.ts` | Prefs object | YES | YES |
| `omeetso_privacy_settings` | `lib/account.ts` | `lib/account.ts` | Privacy settings object | YES | YES |
| `omeetso_ad_preferences` | `lib/account.ts` | `lib/account.ts` | Ad preferences object | NO | OPTIONAL |
| `omeetso_language` | `lib/account.ts`, `routes/language.tsx` | `lib/account.ts` | Language code string | NO | OPTIONAL |
| `omeetso_appearance` | `lib/account.ts` | `routes/__root.tsx`, `lib/account.ts` | `"dark"/"light"/"system"` | NO | OPTIONAL |
| `omeetso_saved_locations` | `lib/account.ts` | `lib/account.ts` | SavedLocation[] | YES | YES |
| `omeetso_blocked_users` | `lib/account.ts`, `lib/chat.ts` | Both | string[] (user IDs) | YES | YES |
| `omeetso_safety_reports` | `lib/account.ts` | `lib/account.ts` | SafetyReport[] | YES | YES |
| `omeetso_support_tickets` | `lib/account.ts` | `lib/account.ts` | SupportTicket[] | YES | YES |
| `omeetso_reviews` | `lib/account.ts` | `lib/account.ts` | Review[] | YES | YES |
| `omeetso_account_status` | `lib/account.ts` | `lib/account.ts` | Account status object | YES | YES |
| `omeetso_saved_meet_places` | `lib/account.ts` | `lib/account.ts` | MeetPlace[] | NO | OPTIONAL |
| `omeetso_help_recent` | `lib/account.ts` | `lib/account.ts` | Recent help searches | NO | NO |
| `omeetso_user_listings` | `lib/listings.ts` | `lib/listings.ts` | Listing[] | YES | YES |
| `omeetso_listing_drafts` | `lib/listings.ts` | `lib/listings.ts` | ListingDraft[] | YES | YES |
| `omeetso_quick_sell_draft` | `lib/listings.ts`, `routes/sell.quick.tsx` | Same | QuickDraft object | YES | YES |
| `omeetso_detailed_sell_draft` | `lib/listings.ts`, `routes/sell.detailed.tsx` | Same | DetailedDraft object | YES | YES |
| `omeetso_listing_analytics` | `lib/listings.ts` | `lib/listings.ts` | Record<id, Analytics> | YES | YES |
| `omeetso_recent_categories` | `lib/listings.ts` | Sell forms | string[] category IDs | NO | NO |
| `omeetso_seller_preferences` | `lib/listings.ts` | Sell forms | SellerPrefs | YES | YES |
| `omeetso_user_stores` | `lib/stores.ts` | `lib/stores.ts` | Store[] | YES | YES |
| `omeetso_store_drafts` | `lib/stores.ts` | `lib/stores.ts` | StoreDraft[] | YES | YES |
| `omeetso_selected_store` | `lib/stores.ts` | `lib/stores.ts` | Store ID string | YES | YES |
| `omeetso_store_products` | `lib/stores.ts` | `lib/stores.ts` | Listing[] | YES | YES |
| `omeetso_store_preferences` | `lib/stores.ts` | `lib/stores.ts` | StorePrefs | NO | OPTIONAL |
| `omeetso_chat_threads` | `lib/chat.ts` | `lib/chat.ts` | Thread[] | YES | YES |
| `omeetso_chat_messages` | `lib/chat.ts` | `lib/chat.ts` | Record<threadId, Message[]> | YES | YES |
| `omeetso_offers` | `lib/chat.ts`, `lib/saved.ts` | Both | Offer[] | YES | YES |
| `omeetso_archived_chats` | `lib/chat.ts` | `lib/chat.ts` | string[] thread IDs | NO | YES |
| `omeetso_muted_chats` | `lib/chat.ts` | `lib/chat.ts` | Record<id, Mute> | NO | YES |
| `omeetso_chat_safety_dismissed` | `lib/chat.ts` | `lib/chat.ts` | Record<id, boolean> | NO | NO |
| `omeetso_chat_drafts` | `lib/chat.ts` | `lib/chat.ts` | Record<threadId, string> | NO | NO |
| `omeetso_report_tickets` | `lib/chat.ts` | `lib/chat.ts` | ReportTicket[] | YES | YES |
| `omeetso_transaction_confirmations` | `lib/chat.ts` | `lib/chat.ts` | TransactionConfirmation[] | YES | YES |
| `omeetso_chat_seeded_v2` | `lib/chat.ts` | `lib/chat.ts` | `"1"` flag | NO | NO |
| `omeetso_promotions` | `lib/revenue.ts` | `lib/revenue.ts` | Promotion[] | YES | YES |
| `omeetso_boost_packages` | `lib/revenue.ts` | `lib/revenue.ts` | BoostPackage[] | YES | MOVE TO DB |
| `omeetso_ad_campaigns` | `lib/revenue.ts` | `lib/revenue.ts` | Campaign[] | YES | YES |
| `omeetso_ad_drafts` | `lib/revenue.ts` | `lib/revenue.ts` | CampaignDraft[] | YES | YES |
| `omeetso_ad_events` | `lib/revenue.ts`, `lib/ads.ts` | Both | AdEvent[] (impressions/clicks) | NO | YES |
| `omeetso_ad_dismissals` | `lib/revenue.ts` | `lib/revenue.ts` | string[] ad IDs | NO | NO |
| `omeetso_wallet` | `lib/revenue.ts` | `lib/revenue.ts` | Wallet {balance, refundBalance} | YES | YES |
| `omeetso_wallet_transactions` | `lib/revenue.ts` | `lib/revenue.ts` | Transaction[] | YES | YES |
| `omeetso_promotional_credits` | `lib/revenue.ts` | `lib/revenue.ts` | Credit[] | YES | YES |
| `omeetso_refunds` | `lib/revenue.ts` | `lib/revenue.ts` | Refund[] | YES | YES |
| `omeetso_billing_profile` | `lib/revenue.ts` | `lib/revenue.ts` | BillingProfile | YES | YES |
| `omeetso_mock_invoices` | `lib/revenue.ts` | `lib/revenue.ts` | Invoice[] | YES | YES |
| `omeetso_payment_attempts` | `lib/revenue.ts` | `lib/revenue.ts` | PaymentAttempt[] | YES | YES |
| `omeetso_saved_products` | `lib/saved.ts` | `lib/saved.ts` | string[] product IDs | YES | YES |
| `omeetso_recent_searches` | `lib/saved.ts` | `lib/saved.ts` | string[] search terms | NO | OPTIONAL |
| `omeetso_reports` | `lib/saved.ts` | `lib/saved.ts` | StoredReport[] | YES | YES |
| `omeetso_recently_viewed` | `lib/saved.ts` | `lib/saved.ts` | string[] product IDs | NO | OPTIONAL |
| `omeetso_ads_dismissed` | `lib/ads.ts` | `lib/ads.ts` | string[] ad IDs | NO | NO |
| `omeetso_ad_events` | `lib/ads.ts` | `lib/ads.ts` | AdEvent[] | NO | YES |
| `omeetso_location` | `routes/location.tsx` | Various | Location object | YES | YES |

---

## Admin Portal localStorage Keys

| Storage Key | Written In | Read In | Data Stored | Business Critical | Backend Replacement |
|---|---|---|---|---|---|
| `omeetso_admin_session` | `adminAuthService.ts` | `adminAuthService.ts`, `AdminAuthContext.tsx` | AdminSession object (with token, admin, expiry) | YES — auth | YES — JWT |
| `omeetso_admin_failed_attempts` | `adminAuthService.ts` | `adminAuthService.ts` | Record<email, {count, lockedUntil}> | YES | YES |
| `omeetso_admin_intended_route` | `AdminAuthContext.tsx` | `AdminAuthContext.tsx` | Route path string | NO | OPTIONAL |
| `omeetso_admin_audit_logs` | `auditLogService.ts` | `auditLogService.ts` | AuditLogEntry[] | YES | YES — DB |
| `omeetso_admin_data_users_v2` | `mockDataService.ts` | `mockDataService.ts` | PlatformUser[] | YES | YES |
| `omeetso_admin_data_listings_v2` | `mockDataService.ts` | `mockDataService.ts` | Listing[] | YES | YES |
| `omeetso_admin_data_stores_v2` | `mockDataService.ts` | `mockDataService.ts` | Store[] | YES | YES |
| `omeetso_admin_data_campaigns_v2` | `mockDataService.ts` | `mockDataService.ts` | AdCampaign[] | YES | YES |
| `omeetso_admin_data_tickets_v2` | `mockDataService.ts` | `mockDataService.ts` | SupportTicket[] | YES | YES |
| `omeetso_admin_data_safety_v2` | `mockDataService.ts` | `mockDataService.ts` | SafetyReport[] | YES | YES |
| `omeetso_admin_data_refunds_v2` | `mockDataService.ts` | `mockDataService.ts` | RefundRequest[] | YES | YES |
| `omeetso_admin_data_feature_flags_v2` | `mockDataService.ts` | `mockDataService.ts` | FeatureFlags object | YES | YES |

---

## Security Concerns

| Issue | Key | Risk Level |
|---|---|---|
| Auth token stored in localStorage | `omeetso_admin_session` | HIGH — XSS can steal token |
| User identity stored in localStorage | `omeetso_user` | HIGH — trivially forgeable |
| Phone number stored unencrypted | `omeetso_pending_phone` | MEDIUM |
| Email address stored | `omeetso_profile_data` | MEDIUM |
| Wallet balance stored client-side | `omeetso_wallet` | CRITICAL — trivially manipulable |
| Admin session auto-created without login | `omeetso_admin_session` | CRITICAL — development bypass |
| All user data (listings, stores, chats) | Multiple keys | HIGH — no server validation |

---

## Data Not Shared Between Portals

The frontend and admin portals use **completely different** localStorage keys. An action in admin (e.g., approve listing) updates `omeetso_admin_data_listings_v2` in the admin tab's localStorage. The user portal reads `omeetso_user_listings` in its own localStorage. These two datasets are **never synchronized**.
