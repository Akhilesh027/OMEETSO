# 21 — Real-Time Systems Audit

## Summary
This document audits the real-time interaction models currently present, simulated, or missing across the Omeetso platform (Chat, Notifications, Bidding/Offers, Presence, Live Moderation).

---

## 1. Chat System Real-Time Audit

### Current Mechanism
- **Engine**: LocalStorage + Custom Pub/Sub (`Set<() => void>`).
- **WebSockets / Socket.IO**: **NOT PRESENT**.
- **Server-Sent Events (SSE)**: **NOT PRESENT**.
- **Short / Long Polling**: **NOT PRESENT**.

### Simulated Real-Time Behavior
- **Sending Messages**: Calling `sendMessage()` in `frontend/src/lib/chat.ts` appends the message to the local `omeetso_chat_messages` array in `localStorage` and triggers local pub/sub subscribers.
- **Read Receipts**: Opening a chat thread calls `markThreadRead()`, updating `readAt` on local records.
- **Typing Indicators**: UI element exists in `routes/chat.$id.tsx` but is hardcoded to `false` or controlled by local timers.
- **Cross-User Reality**: Messages sent by User A are stored *only* in User A's browser local storage. User B on another device will never receive the message.

---

## 2. Notifications System Audit

### User Portal Notifications
- **Trigger**: Actions like posting a listing, making an offer, or placing an ad call `addNotification()` in `frontend/src/lib/account.ts`.
- **Storage**: `omeetso_notifications` key in `localStorage`.
- **Delivery**: Unread badge count updates locally via subscriber functions. No Web Push API, FCM (Firebase Cloud Messaging), or Email/SMS triggers exist.

### Admin Portal Alerts
- **Live Activity Feed**: `pages/dashboard/LiveActivityPage.tsx` renders static activity streams from `data/liveActivity.ts`.
- **Critical Alerts**: Renders hardcoded entries from `data/criticalAlerts.ts`.
- **Real-Time Push**: Admin receives no live notifications when a user submits a listing, reports a violation, or opens a support ticket.

---

## 3. Offers & Price Negotiations

### Offer Flow
- **Creation**: Buyers submit offers via `createOffer()` in `lib/chat.ts`.
- **Status Updates**: Status (`pending`, `accepted`, `declined`, `countered`) is mutated in `localStorage`.
- **Synchronization**: Because state is client-bound, accepting an offer on the buyer screen does not update the seller's state.

---

## 4. User Presence & Activity Indicators

- **Online / Offline Status**: Green dot indicators on seller profiles and chat headers are driven by static properties (`seller.isOnline`) in `lib/mock.ts`.
- **"Last Active" Timestamps**: Static string values (e.g., "Active 5m ago") hardcoded in mock datasets.

---

## 5. Requirements for Production Real-Time Architecture

To transition Omeetso into a fully functional real-time platform, the following infrastructure will be required:

| Feature Area | Recommended Production Technology | Architecture Component |
|---|---|---|
| **Chat & Offers** | Socket.IO / WebSockets | Stateful Real-Time Server / Cluster with Redis Pub/Sub Adapter |
| **Push Notifications** | Firebase Cloud Messaging (FCM) / Web Push API | Background Worker Service + Device Token Store |
| **System Alerts (Admin)** | Server-Sent Events (SSE) or WebSockets | Admin Notification Gateway |
| **User Presence** | Redis Heartbeats / In-Memory Store | Presence Service |
| **SMS & OTP** | Twilio / MSG91 / Fast2SMS | Communications Gateway Service |
