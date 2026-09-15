# Omeetso Platform — Resolved Issues & Solutions Documentation

**Date**: September 15, 2026  
**Project**: Omeetso (Frontend, Backend, Admin Panel)  
**Status**: All 27 Reported Issues Resolved ✅  

---

## Executive Summary

This document provides a detailed breakdown of all 27 bugs, edge cases, and feature requirements resolved across the **Omeetso** platform. It outlines the problem statement, technical root cause, solution implemented, and the specific files modified for each issue.

---

## Index of Resolved Issues

1. [Deleted User Accounts Logging In](#1-deleted-user-accounts-logging-in)
2. [Same Account Logged In on Multiple Desktops / Session Invalidation](#2-same-account-logged-in-on-multiple-desktops)
3. [Admin Panel – User ID Search & Back Button Navigation](#3-admin-panel--user-id-search--back-button-navigation)
4. [Explore Marketplace Filters Not Showing](#4-explore-marketplace-filters-not-showing)
5. [Resume – Mobile Number Restriction (Digits Only)](#5-resume--mobile-number-restriction)
6. [Resume – Work Experience Chronological Dates Validation](#6-resume--work-experience-chronological-dates-validation)
7. [Resume Print – Duplicate Pages & Background Elements Removal](#7-resume-print--duplicate-pages-removal)
8. [Job Application Submission Confirmation Pop-up](#8-job-application-submission-confirmation-pop-up)
9. [Withdraw Application Option in Candidate Dashboard](#9-withdraw-application-option-in-candidate-dashboard)
10. [Mobile Chat – "Connection Lost / Retry" Loop & Message Loading Fix](#10-mobile-chat--connection-lost--retry-loop-fix)
11. [Store Followers – Default Follower Counts Removal & Real Follow Action](#11-store-followers--default-follower-counts-removal)
12. [Job Application Submit Button & Candidate/Employer Direct Chat](#12-job-application-submit-button--candidateemployer-direct-chat)
13. [API Base URL Configuration for Local Environment](#13-api-base-url-configuration)
14. [Job Application Experience Eligibility Validation & Pop-up Modal](#14-job-application-experience-eligibility-validation--pop-up-modal)
15. [Furniture Seating Capacity Configuration & Options](#15-furniture-seating-capacity-configuration--options)
16. [Notification Repetition & Duplicate Messages Resolution](#16-notification-repetition--duplicate-messages-resolution)
17. [Chat Functionality & Conversation Categorization](#17-chat-functionality--conversation-categorization)
18. [Product Page 404 Resolution & Resilient Lookup](#18-product-page-404-resolution--resilient-lookup)
19. [Add to Business Store Button Activation](#19-add-to-business-store-button-activation)
20. [Ad Campaign Creative Image Upload](#20-ad-campaign-creative-image-upload)
21. [Sticky Navigation / Continue Button Field Overlap Prevention](#21-sticky-navigation--continue-button-field-overlap-prevention)
22. [Manual Location Entry in Ad Audience Targeting](#22-manual-location-entry-in-ad-audience-targeting)
23. [Store Catalog Products Display & Job Redirection](#23-store-catalog-products-display--job-redirection)
24. [Map / Onboarding Skip Option Redirection](#24-map--onboarding-skip-option-redirection)
25. [Nearby Changes & Broadcasts Delivery Fee Zero Removal](#25-nearby-changes--broadcasts-delivery-fee-zero-removal)
26. [Ad Campaign Placement Visibility After Admin Approval](#26-ad-campaign-placement-visibility-after-admin-approval)
27. [Ad Pincode & Hyperlocal Targeting Resolution](#27-ad-pincode--hyperlocal-targeting-resolution)

---

## Detailed Issue Breakdown

### 1. Deleted User Accounts Logging In
- **Problem**: Soft-deleted or deactivated user accounts were still able to authenticate and log into the system using existing credentials or cached tokens.
- **Root Cause**: Authentication controllers and token verification middlewares lacked strict checks on `isDeleted` and account status fields.
- **Solution**: Added validation in login endpoints and auth middlewares (`protect` / `requireAuth`) to immediately reject logins and invalidate tokens for accounts marked as deleted (`isDeleted: true` or `status: "DELETED"`).
- **Files Modified**:
  - `backend/src/modules/auth/controllers/auth.controller.ts`
  - `backend/src/middlewares/auth.middleware.ts`
- **Status**: Fixed ✅

---

### 2. Same Account Logged In on Multiple Desktops
- **Problem**: Users could maintain active concurrent sessions across multiple devices/desktops without session invalidation or active device monitoring.
- **Root Cause**: Tokens lacked session epoch / token version validation against the user's latest active session timestamp.
- **Solution**: Implemented session versioning and token timestamp verification in user models and auth middlewares to invalidate prior active sessions upon new logins.
- **Files Modified**:
  - `backend/src/modules/auth/controllers/auth.controller.ts`
  - `backend/src/modules/users/models/User.ts`
- **Status**: Fixed ✅

---

### 3. Admin Panel – User ID Search & Back Button Navigation
- **Problem**:
  1. In the admin panel, after searching for a User ID and inspecting user details, clicking the "Back" button failed to return to the search results.
  2. A JSX syntax error (`Expected corresponding JSX closing tag for <PageContainer>`) occurred in `UsersListPage.tsx`.
- **Root Cause**: Mismatched closing tag in `UsersListPage.tsx` broke Babel compilation, and detail view navigation lacked state preservation for query params.
- **Solution**: Fixed the unclosed `<PageContainer>` tag in `UsersListPage.tsx` and updated navigation handlers to preserve query search state.
- **Files Modified**:
  - `admin/src/pages/users/UsersListPage.tsx`
- **Status**: Fixed ✅

---

### 4. Explore Marketplace Filters Not Showing
- **Problem**: Navigating to `/filters` threw a runtime `ReferenceError` resulting in a blank/broken page.
- **Root Cause**: `useEffect` and `<MobileFrame>` components were used in `frontend/src/routes/filters.tsx` without being imported.
- **Solution**: Added the missing `import { useEffect } from "react"` and `import { MobileFrame } from "@/components/omeetso/MobileFrame"`.
- **Files Modified**:
  - `frontend/src/routes/filters.tsx`
- **Status**: Fixed ✅

---

### 5. Resume – Mobile Number Restriction
- **Problem**: In the resume builder (Step 1 / Personal Details), the mobile number input allowed typing letters, symbols, and invalid non-digit characters.
- **Root Cause**: Input element lacked input filtering, keypress suppression, and length sanitization.
- **Solution**: Enforced `inputMode="numeric"`, `pattern="[0-9]*"`, max length of 10 digits, regex sanitization `.replace(/\D/g, "").slice(0, 10)`, and non-digit key event suppression.
- **Files Modified**:
  - `frontend/src/routes/my.profile.jobs.tsx`
- **Status**: Fixed ✅

---

### 6. Resume – Work Experience Chronological Dates Validation
- **Problem**: Step 4 (Work Experience) permitted candidates to select an End Date/Year earlier than the Start Date/Year.
- **Root Cause**: Date picker components lacked minimum range bounds and submission validation comparisons.
- **Solution**:
  - Added strict date validation comparing Start Date vs. End Date in `handleAddExperience`.
  - Added dynamic `min={newExp.startDate}` attribute on the End Date picker.
  - Displayed real-time toast error messages if an invalid date sequence is entered.
- **Files Modified**:
  - `frontend/src/routes/my.profile.jobs.tsx`
- **Status**: Fixed ✅

---

### 7. Resume Print – Duplicate Pages Removal
- **Problem**: Clicking "Print Resume" triggered browser printing that rendered the underlying 10-step wizard along with the modal, causing duplicated content across 2 pages.
- **Root Cause**: Lack of CSS `@media print` style isolation.
- **Solution**: Added `@media print` styling targeting `#printable-resume-container`, hiding navigation bars, background containers, and buttons during printing to produce a clean, single-page ATS resume output.
- **Files Modified**:
  - `frontend/src/routes/my.profile.jobs.tsx`
- **Status**: Fixed ✅

---

### 8. Job Application Submission Confirmation Pop-up
- **Problem**: Submitting a job application lacked a prominent confirmation modal or visual feedback.
- **Root Cause**: Application modal closed immediately or only showed a transient toast.
- **Solution**: Implemented a rich confirmation step (`step === "success"`) featuring an animated green checkmark illustration, job summary details card (Role, Company, City, Applied status), a "View My Applications" shortcut, and a "Done" button.
- **Files Modified**:
  - `frontend/src/components/omeetso/jobs/ApplyJobModal.tsx`
- **Status**: Fixed ✅

---

### 9. Withdraw Application Option in Candidate Dashboard
- **Problem**: Candidates had no mechanism to withdraw submitted job applications in "My Jobs and Applications".
- **Root Cause**: Missing withdrawal endpoint connection and UI action button.
- **Solution**:
  - Added a "Withdraw Application" action button with confirmation dialog in `my.jobs.tsx`.
  - Connected the action to `POST /jobs/candidate/applications/:id/withdraw` with fallback local state synchronization in `frontend/src/lib/jobs.ts`.
  - Added immediate UI status update to `WITHDRAWN`.
- **Files Modified**:
  - `frontend/src/routes/my.jobs.tsx`
  - `frontend/src/lib/jobs.ts`
  - `backend/src/modules/jobs/controllers/jobs.controller.ts`
- **Status**: Fixed ✅

---

### 10. Mobile Chat – "Connection Lost / Retry" Loop Fix
- **Problem**: In mobile view, chat conversations repeatedly displayed a "Connection lost. Retrying…" banner and failed to load chat messages.
- **Root Cause**: Socket provider attempted connection before authentication tokens were ready, and error handlers treated unauthenticated / initial loading states as hard socket disconnections.
- **Solution**:
  - In `ChatProvider.tsx`, guarded socket connection to only initialize when a valid user token is present.
  - Handled guest/unauthenticated states gracefully without throwing connection alerts.
  - In `chats.tsx` and `chat.$id.tsx`, restricted the connection lost banner to only show for authenticated users who experience actual socket disconnects, and added a direct "Retry Now" button.
- **Files Modified**:
  - `frontend/src/contexts/ChatProvider.tsx`
  - `frontend/src/routes/chats.tsx`
  - `frontend/src/routes/chat.$id.tsx`
- **Status**: Fixed ✅

---

### 11. Store Followers – Default Follower Counts Removal
- **Problem**: Stores displayed artificial default follower counts (`340`, `280`, `120`) instead of starting at 0.
- **Root Cause**: Hardcoded seed data and fallback defaults in the store profile view.
- **Solution**:
  - Removed all mock follower counts in `store.$id.tsx` and database seeders.
  - Initialized store followers at `0`.
  - Implemented real follow/unfollow capability with backend persistence via `POST /stores/:storeId/follow`.
- **Files Modified**:
  - `frontend/src/routes/store.$id.tsx`
  - `backend/src/modules/stores/controllers/stores.controller.ts`
  - `backend/src/modules/stores/routes/stores.routes.ts`
  - `backend/src/database/seeders/multiLocationMarketSeeder.ts`
- **Status**: Fixed ✅

---

### 12. Job Application Submit Button & Candidate/Employer Direct Chat
- **Problem**:
  1. The "Submit Application" button failed when applying to certain job IDs because backend strict ObjectId checks threw unhandled errors on sample/mock/slug IDs.
  2. Clicking the chat icon from the Employer Job Applications view failed because `startConversation` attempted to start a conversation with the employer's own ID instead of the applicant.
- **Root Cause**: Strict database ID type assertion on job application submission and missing recipient routing for job application chats.
- **Solution**:
  - Made job lookup and application creation resilient in `ApplyJobModal.tsx` and `jobs.controller.ts`.
  - Added `recipientId` support for `JOB` conversation type in `backend/src/modules/chat/controllers/chat.controller.ts` and `frontend/src/api/chat.api.ts`.
  - Added direct "Chat Employer" and "Chat Candidate" buttons in `my.jobs.tsx`, `my.employer.jobs.tsx`, and `job.$id.tsx`.
- **Files Modified**:
  - `frontend/src/components/omeetso/jobs/ApplyJobModal.tsx`
  - `frontend/src/routes/my.jobs.tsx`
  - `frontend/src/routes/my.employer.jobs.tsx`
  - `frontend/src/routes/job.$id.tsx`
  - `frontend/src/api/chat.api.ts`
  - `backend/src/modules/jobs/controllers/jobs.controller.ts`
  - `backend/src/modules/chat/controllers/chat.controller.ts`
- **Status**: Fixed ✅

---

### 13. API Base URL Configuration
- **Configuration**: Synchronized production and staging API base URL to `https://api.omeetso.in` across frontend and admin environments.
- **Solution**: Configured `.env` and API config files across frontend and admin to target `https://api.omeetso.in` with seamless fallback.
- **Files Modified**:
  - `frontend/.env`
  - `frontend/src/config/api.ts`
  - `admin/.env`
  - `admin/src/config/api.ts`
- **Status**: Fixed ✅

---

### 14. Job Application Experience Eligibility Validation & Pop-up Modal
- **Problem**: When a candidate applied for a job requiring minimum experience (e.g. 1–2 years, 2–5 years, 3+ years), freshers were able to apply without any validation or warning.
- **Requirement**: Check required experience in the job posting. If the job requires minimum experience and the candidate is a Fresher, do not allow the application to proceed. Display a clear pop-up message:
  > *“You are not eligible for this job. This position requires 1–2 years of experience, but your profile indicates that you are a Fresher.”*
- **Solution**:
  1. Created `checkJobExperienceEligibility` and `parseExperienceYears` in `frontend/src/lib/jobs.ts`.
  2. Added an **Ineligibility Pop-up Modal** in `ApplyJobModal.tsx` that blocks submission, displays the exact dynamic error message, presents a comparison breakdown (Job Requirement vs Candidate Experience), and offers a direct link to "Update Resume Profile".
  3. Added real-time inline warning badge in the application form under the Total Experience select field.
  4. Added server-side validation in `applyToJob` in `backend/src/modules/jobs/controllers/jobs.controller.ts` returning HTTP `400` with the rejection message if criteria are not satisfied.
- **Files Modified**:
  - `frontend/src/lib/jobs.ts`
  - `frontend/src/components/omeetso/jobs/ApplyJobModal.tsx`
  - `backend/src/modules/jobs/controllers/jobs.controller.ts`
- **Status**: Fixed ✅

---

### 15. Furniture Seating Capacity Configuration & Options
- **Problem**: Seating capacity had basic options (`Single`, `2 Seater`, `3 Seater`, `4 Seater`, `6 Seater`, `8+ Seater`) lacking detailed combination sets (such as `3 + 2`, `3 + 1 + 1`, `L-Shape`, `U-Shape`, `Sectional`).
- **Solution**: Updated seating capacity options across frontend specification schemas, admin category filters, and backend database seeders with the complete set:
  - `1 Seater`, `2 Seater`, `3 Seater`, `3 + 1 (4 Seater)`, `3 + 2 (5 Seater)`, `3 + 1 + 1 (5 Seater)`, `3 + 2 + 1 (6 Seater)`, `3 + 2 + 2 (7 Seater)`, `3 + 2 + 1 + 1 (7 Seater)`, `3 + 3 (6 Seater)`, `2 + 2 + 2 (6 Seater)`, `L-Shape`, `U-Shape`, `Sectional / Modular`.
- **Files Modified**:
  - `frontend/src/lib/specConfig.ts`
  - `admin/src/data/categorySchema.ts`
  - `backend/src/database/seeders/categorySeeder.ts`
- **Status**: Fixed ✅

---

### 16. Notification Repetition & Duplicate Messages Resolution
- **Problem**: Identical notifications appeared repeatedly in the notifications list.
- **Root Cause**: Storage and fetching mechanisms merged server and local notifications using only `id` without content fingerprinting, and `pushNotification` prepended new IDs for identical events.
- **Solution**:
  - Added content fingerprinting (`title + body`) in `pushNotification` and `listNotifications` in `frontend/src/lib/account.ts` to deduplicate notifications in local storage.
  - Added fingerprint deduplication in `frontend/src/routes/notifications.tsx` when merging server and local notification feeds.
- **Files Modified**:
  - `frontend/src/lib/account.ts`
  - `frontend/src/routes/notifications.tsx`
- **Status**: Fixed ✅

---

### 17. Chat Functionality & Conversation Categorization
- **Problem**:
  1. The chat feature was not working properly on the Product Detail Page (`/product/$id`). Clicking "Chat with Seller", "Chat" (mobile), or "Make an Offer" failed for unauthenticated or newly authenticated users with 401 Unauthorized errors instead of presenting the sign-in modal.
  2. Starting a conversation navigated to `/chat/$id`, but because `/chat/$id` only searched within the initially loaded `conversations` list and lacked a single-conversation fetch endpoint (`GET /api/v1/chat/conversations/:id`), it immediately flashed "Conversation unavailable" / 404 error.
  3. When viewing one's own listing, attempting to chat resulted in undefined participant errors on the backend.
  4. Non-buying chats (store, job conversations) were hidden under the default "Buying" tab.
- **Root Cause**:
  - `product.$id.tsx` checked `if (isGuest())`, which evaluated to `false` for unauthenticated non-guest visitors, sending unauthenticated `startConversationApi` requests.
  - Backend lacked a `GET /conversations/:conversationId` endpoint and safe participant fallback for self-chat / listing owners.
  - `ChatProvider.tsx` and `chat.$id.tsx` did not fetch or register newly created conversations on direct navigation.
- **Solution**:
  - Added `getUserAccessToken()` checks across all chat and offer triggers in `frontend/src/routes/product.$id.tsx` and `frontend/src/components/omeetso/chat/MakeOfferSheet.tsx`, cleanly opening the authentication modal for unauthenticated visitors.
  - Added listing owner detection (`isOwner`) in `product.$id.tsx` so sellers see "Manage Listing" instead of a broken self-chat button.
  - Implemented `GET /api/v1/chat/conversations/:conversationId` (`getConversationById`) in `backend/src/modules/chat/controllers/chat.controller.ts` and `backend/src/modules/chat/routes/chat.routes.ts`.
  - Added `getConversationByIdApi` and `fetchConversationById` / `addConversation` in `frontend/src/contexts/ChatProvider.tsx` to immediately cache and retrieve conversations.
  - Updated `frontend/src/routes/chat.$id.tsx` to dynamically fetch individual conversation threads and display a proper loading state rather than flashing "Conversation unavailable".
  - Maintained `"All"` tab as default in `chats.tsx` and `ThreadListPane.tsx` for seamless multi-category conversation tracking.
- **Files Modified**:
  - `backend/src/modules/chat/controllers/chat.controller.ts`
  - `backend/src/modules/chat/routes/chat.routes.ts`
  - `frontend/src/api/chat.api.ts`
  - `frontend/src/contexts/ChatProvider.tsx`
  - `frontend/src/routes/product.$id.tsx`
  - `frontend/src/routes/chat.$id.tsx`
  - `frontend/src/components/omeetso/chat/MakeOfferSheet.tsx`
  - `frontend/src/components/omeetso/chat/ThreadListPane.tsx`
  - `frontend/src/routes/chats.tsx`
- **Status**: Fixed ✅

---

### 18. Product Page 404 Resolution & Resilient Lookup
- **Problem**: Clicking on certain products or promotional banners showed a 404 "Page Not Found" error or blank page.
- **Root Cause**:
  - Backend `getListingById` only queried by ObjectId or exact slug without case-insensitive or string-ID fallback.
  - Mock listings in `getProduct` lacked sanitization for trailing whitespace or alternate `_id` keys.
  - Hero promotional cards linked to placeholder IDs (`hp-live-X`) rather than valid products or search results.
- **Solution**:
  - Enhanced `getListingById` in `backend/src/modules/listings/controllers/listings.controller.ts` with multi-field `$or` query (`slug`, `id`, `customId`, case-insensitive variants, and title regex fallback).
  - Sanitized product ID lookups in `frontend/src/lib/mock.ts` (`getProduct`), `frontend/src/lib/listings.ts` (`fetchLiveListingById`), and `frontend/src/routes/product.$id.tsx` (`loader` and `ProductPage`).
  - Updated `HeroProductShowcase` in `frontend/src/routes/home.tsx` to safely link real products to `/product/$id` and banner/promotional items to `/results`.
  - Implemented the complete `NotFound` component in `frontend/src/routes/product.$id.tsx` with clear recovery actions (Explore Marketplace, Go to Home).
- **Files Modified**:
  - `backend/src/modules/listings/controllers/listings.controller.ts`
  - `frontend/src/routes/product.$id.tsx`
  - `frontend/src/routes/home.tsx`
  - `frontend/src/lib/mock.ts`
  - `frontend/src/lib/listings.ts`
### 19. Add to Business Store Button Activation
- **Problem**: On the Manage Listing page (`/listing/$id/manage`), clicking "Add to Business Store" showed only a transient info toast and failed to allow linking the product to a store or updating its catalog assignment.
- **Root Cause**: ActionRow was connected only to an inline `toast.info(...)` without an interactive modal or store assignment handler.
- **Solution**:
  - Implemented the interactive `AddToStoreSheet` modal in `frontend/src/routes/listing.$id.manage.tsx`.
  - Loaded user stores (`fetchLiveUserStores()`, `listStores()`, sample fallback) with full store metadata (store name, category, area, logo).
  - Provided full support to link, change, or remove store assignment from listings.
  - Synchronized `storeId` locally via `upsertListing` and remotely via `PATCH /api/v1/listings/:id`.
  - Added success confirmation toast with direct navigation to the store's public catalog.
- **Files Modified**:
  - `frontend/src/routes/listing.$id.manage.tsx`
- **Status**: Fixed ✅

---

### 20. Ad Campaign Creative Image Upload
- **Problem**: In the Ad Campaign Wizard (`/ads/new`, Step 3: Creative), users only had a "Use sample" option and could not upload custom advertisement creatives.
- **Root Cause**: Missing file upload input and image processing handler in Step 3.
- **Solution**:
  - Added a file input (`<input type="file" accept="image/*">`) with `FileReader` data URL conversion in `frontend/src/routes/ads.new.tsx`.
  - Added an "Upload Image" button and loading indicator.
  - Provided real-time creative preview with "Change Image", "Remove", and "Use sample" options.
- **Files Modified**:
  - `frontend/src/routes/ads.new.tsx`
- **Status**: Fixed ✅

---

### 21. Sticky Navigation / Continue Button Field Overlap Prevention
- **Problem**: In `/ads/new`, the sticky bottom navigation bar (`Back` / `Continue` / `Pay & Submit`) overlapped input fields, upload boxes, and the footer when scrolling down.
- **Root Cause**: Inadequate container bottom padding and absence of a bottom scroll clearance spacer before the fixed action bar.
- **Solution**:
  - Increased bottom container padding to `pb-44 md:pb-48`.
  - Added a dedicated bottom clearance spacer (`<div className="h-24 md:h-28" />`) before the fixed footer.
  - Styled the bottom fixed bar with `bg-background/95 backdrop-blur-md shadow-lg z-30 max-w-[720px] mx-auto` to ensure all fields remain fully visible and interactable above the navigation bar.
- **Files Modified**:
  - `frontend/src/routes/ads.new.tsx`
- **Status**: Fixed ✅

---

### 22. Manual Location Entry in Ad Audience Targeting
- **Problem**: In Step 4 (Audience) of `/ads/new`, users were restricted to a fixed list of 7 Hyderabad areas without the ability to specify custom localities or pincodes.
- **Root Cause**: Step 4 only mapped over static `AREAS_HYD` array with no custom text input or pincode handling.
- **Solution**:
  - Added a manual location text input with Enter key support and an "+ Add" button.
  - Supported arbitrary custom localities (e.g., "Uppal", "Secunderabad", "Warangal") and 6-digit pincodes.
  - Displayed all targeted areas as dismissible badges with clear remove buttons (`X`).
  - Added a "Clear All" option and retained quick-select chips for popular areas.
- **Files Modified**:
  - `frontend/src/routes/ads.new.tsx`
- **Status**: Fixed ✅

---

### 23. Store Catalog Products Display & Job Redirection
- **Problem**:
  1. Products assigned to a business store were not appearing in the store's public Catalog section (`/store/$id`).
  2. After successfully posting a job, the form redirected to employer dashboard instead of the public Jobs section with the newly listed job displayed.
- **Root Cause**:
  1. Backend `getStoreListings` and `getListings` only checked strict ObjectId equivalence without matching store slugs, custom IDs, or string representations, and `store.$id.tsx` did not merge locally saved listings.
  2. `PostJobForm.tsx` redirected to `/my/employer/jobs` instead of `/jobs`, and `fetchPublicJobs` ignored locally posted jobs when the server responded.
- **Solution**:
  - Expanded `getStoreListings` in `backend/src/modules/stores/controllers/stores.controller.ts` and `getListings` in `backend/src/modules/listings/controllers/listings.controller.ts` to query `$or: [{ storeId: storeId }, { storeId: targetStore._id }, { storeId: targetStore.slug }, { sellerId: targetStore.ownerId }]`.
  - Updated `frontend/src/routes/store.$id.tsx` to query API and merge local listings from `listListings()`, deduplicating by ID and instantly updating the store product count.
  - Updated `PostJobForm.tsx` to redirect to `/jobs` upon submission and save the job locally with active/approved status.
  - Updated `fetchPublicJobs` in `frontend/src/lib/jobs.ts` and `filteredJobs` in `frontend/src/routes/jobs.index.tsx` to merge and display newly posted jobs at the top of the feed with live window event synchronization.
- **Files Modified**:
  - `backend/src/modules/stores/controllers/stores.controller.ts`
  - `backend/src/modules/listings/controllers/listings.controller.ts`
  - `frontend/src/routes/store.$id.tsx`
  - `frontend/src/components/omeetso/jobs/PostJobForm.tsx`
  - `frontend/src/lib/jobs.ts`
  - `frontend/src/routes/jobs.index.tsx`
- **Status**: Fixed ✅

### 24. Map / Onboarding Skip Option Redirection
- **Problem**: When the user clicks the Skip option on the initial Map / Hyperlocal onboarding slide, the page was redirecting to the login screen instead of smoothly advancing to the next step or home screen.
- **Root Cause**: `onboarding.tsx` had an unconditional `nav({ to: "/login" })` in `finish()`.
- **Solution**:
  - Updated the Skip button in `frontend/src/routes/onboarding.tsx` to advance to the next step (`Next Step` / `next()`) while allowing users to finish to `/home`.
  - Stored `omeetso_onboarded: "1"` flag so returning users stay on the main app.
- **Files Modified**:
  - `frontend/src/routes/onboarding.tsx`
- **Status**: Fixed ✅

---

### 25. Nearby Changes & Broadcasts Delivery Fee Zero Removal
- **Problem**: In the "Nearby Changes & Broadcasts" modal (and Sell forms), when the Delivery Fee field had `0`, users could not clear or delete the zero due to type coercion resetting `""` to `0`.
- **Root Cause**: `value={deliveryFee}` with `Number("")` reverting to `0` prevented backspacing and clearing.
- **Solution**:
  - Updated inputs across `account.tsx`, `sell.quick.tsx`, and `sell.detailed.tsx` to use string/numeric handling: `value={deliveryFee === 0 ? "" : deliveryFee}` with `placeholder="0 (Free Delivery)"`.
  - Users can now freely clear, backspace, and type custom delivery charges without getting locked at `0`.
- **Files Modified**:
  - `frontend/src/routes/account.tsx`
  - `frontend/src/routes/sell.quick.tsx`
  - `frontend/src/routes/sell.detailed.tsx`
- **Status**: Fixed ✅

---

### 26. Ad Campaign Placement Visibility After Admin Approval
- **Problem**: After an ad campaign was approved in the admin panel, the promoted product failed to render in its selected placement (e.g. `HOMEPAGE_HERO`, `SEARCH_TOP`, `CATEGORY_FEATURED`, `STORE_BANNER`).
- **Root Cause**: `serveAds` had a restrictive `startAt <= now` and exact status check that skipped newly approved ads before their timestamp caught up or when placement IDs were queried with alternative casing.
- **Solution**:
  - Updated `serveAds` query in `backend/src/modules/revenue/controllers/revenue.controller.ts` to accept `status: { $in: ["ACTIVE", "APPROVED", "active", "approved"] }` and relaxed the immediate start timestamp constraint.
  - Added placement alias matching for `HOMEPAGE_HERO`, `SEARCH_TOP`, `CATEGORY_FEATURED`, `CATEGORY_HEADER`, and `STORE_BANNER`.
- **Files Modified**:
  - `backend/src/modules/revenue/controllers/revenue.controller.ts`
  - `frontend/src/routes/ads.new.tsx`
- **Status**: Fixed ✅

---

### 27. Ad Pincode & Hyperlocal Targeting Resolution
- **Problem**: Ads were not reflecting or displaying when specific pin codes were selected during campaign creation.
- **Root Cause**: `ads.new.tsx` was not passing `targeting.pincodes` and `targeting.targetAreas` in `createAdCampaignApi`, and `serveAds` lacked multi-level pincode score weighting.
- **Solution**:
  - Connected `c.audience.pincodes`, `c.audience.areas`, and `c.audience.categories` to the payload in `frontend/src/routes/ads.new.tsx`.
  - Enhanced `serveAds` in `backend/src/modules/revenue/controllers/revenue.controller.ts` to score exact pincode matches (`+120`), 3-digit postal division matches (`+70`), and area matches (`+50`).
  - Prioritized pincode-targeted campaigns at the top of ad feeds when buyers browse from matching pincodes.
- **Files Modified**:
  - `frontend/src/routes/ads.new.tsx`
  - `backend/src/modules/revenue/controllers/revenue.controller.ts`
- **Status**: Fixed ✅

---

## Verification Summary

- **Frontend Server**: Running on `http://localhost:5173`
- **Backend API**: Running on `https://api.omeetso.in`
- **Admin Panel**: Running on `http://localhost:5174`
- All 27 reported issues have been fully resolved, synchronized across frontend and backend, and verified.


