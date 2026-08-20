# 12 — Chat System Audit

## Summary
The chat system is one of the most thoroughly built features in the user portal. It has full UI for conversations, offers, attachments, read receipts, and typing indicators. All data is stored in localStorage and isolated to a single browser — no real-time communication exists.

---

## Chat Architecture

### Data Layer
**File:** `frontend/src/lib/chat.ts` (681 lines, 27.3KB)

| Concept | Implementation |
|---|---|
| Storage | localStorage (3 keys) |
| State sync | Custom pub/sub pattern (`subs` Set) |
| Seeding | `seedIfEmpty()` — creates 5 mock threads on first visit |
| Real-time | NOT PRESENT — only polling via React `useState` re-renders |

### localStorage Keys

| Key | Content | Type |
|---|---|---|
| `omeetso_chat_threads` | All conversation threads | `Thread[]` |
| `omeetso_chat_messages` | All messages per thread | `Record<string, Message[]>` |
| `omeetso_offers` | All offers | `Offer[]` |
| `omeetso_archived_chats` | Archived thread IDs | `string[]` |
| `omeetso_muted_chats` | Mute settings | `Record<id, {until?}>` |
| `omeetso_chat_safety_dismissed` | Dismissed safety banners | `Record<id, boolean>` |
| `omeetso_chat_drafts` | Unsent message drafts | `Record<threadId, string>` |
| `omeetso_report_tickets` | Reported message logs | `ReportTicket[]` |
| `omeetso_transaction_confirmations` | Transaction records | `TransactionConfirmation[]` |
| `omeetso_chat_seeded_v2` | Seeded flag | `"1"` |

---

## Routes

| Route | File | Purpose |
|---|---|---|
| `/chats` | `routes/chats.tsx` | List all threads with preview |
| `/chat/$id` | `routes/chat.$id.tsx` | Individual chat thread |
| `/chat/safety` | `routes/chat.safety.tsx` | Safety tips for meetups |
| `/offer/$id` | `routes/offer.$id.tsx` | Offer negotiation screen |
| `/transaction/$offerId` | `routes/transaction.$offerId.tsx` | Transaction complete/confirm |

---

## Chat Features Inventory

| Feature | UI Exists | Functionality | Notes |
|---|---|---|---|
| Thread list with preview | YES | YES | Renders threads from localStorage |
| Thread unread count badge | YES | YES | `unreadCount` in Thread object |
| Sent/delivered/read receipts | YES | SIMULATED | `readAt` set by `markThreadRead()` on open |
| Message bubbles (text) | YES | YES | Renders from localStorage |
| Message images | YES | PARTIAL | UI exists; uses object URLs (not persistent) |
| Typing indicator | YES (UI) | NO | `isOtherTyping` state, never set to `true` from other side |
| Online status indicator | YES | MOCK | Hardcoded in seeded thread data |
| Message timestamps | YES | YES | Renders `sentAt` timestamp |
| Emoji picker | NO | NO | Not implemented |
| Message reactions | NO | NO | Not implemented |
| Forward message | NO | NO | Not implemented |
| Delete message | NO | NO | Not implemented |
| Reply to message | NO | NO | Not implemented |
| Voice messages | NO | NO | Not implemented |
| Video call | NO | NO | Not implemented |
| Search messages | NO | NO | Not implemented |
| Pin thread | YES | YES (local) | Sets `isPinned` in localStorage |
| Archive thread | YES | YES (local) | Moves ID to archived list |
| Mute thread | YES | YES (local) | Sets mute record in localStorage |
| Block seller/buyer | YES | YES (local) | Adds to `omeetso_blocked_users` |
| Report message | YES | YES (local) | Creates `ReportTicket` in localStorage |
| Safety banner | YES | YES | Shows on first open per thread |
| Make offer | YES | YES (local) | Creates Offer object in localStorage |
| Counter offer | YES | YES (local) | Updates Offer status |
| Accept offer | YES | YES (local) | Sets status to "accepted" |
| Decline offer | YES | YES (local) | Sets status to "declined" |
| Offer expiry | YES | PARTIAL | `expiresAt` calculated but no auto-expiry |
| Transaction confirm | YES | YES (local) | Creates TransactionConfirmation |
| Mark as sold | YES | YES (local) | Updates listing status locally |
| Meet place suggestion | YES | YES (local) | Hardcoded safe places list |
| Share listing in chat | YES | YES (local) | Sends product card message |

---

## Seeded Mock Data (5 threads)

From `lib/chat.ts` `seedIfEmpty()`:

| Thread | Product | Seller | Buyer Role | Messages | Offer |
|---|---|---|---|---|---|
| Thread 1 | iPhone 14 Pro (₹72,000) | Priya Kumar | User is Buyer | 4 messages | Pending ₹67,000 |
| Thread 2 | Samsung 4K TV (₹35,000) | Rohit Mehta | User is Buyer | 4 messages | None |
| Thread 3 | Teak Dining Table (₹18,500) | Ananya Singh | User is Seller | 3 messages | None |
| Thread 4 | VW Polo (₹7,80,000) | Vikram Sharma | User is Buyer | 2 messages | None |
| Thread 5 | Bajaj Pulsar (₹78,000) | Store: Tech Hub | User is Buyer | 3 messages | None |

---

## Critical Limitations

| Limitation | Impact |
|---|---|
| No WebSocket / Socket.IO | Two users in different browsers cannot communicate |
| localStorage is browser-isolated | Messages exist only on the sender's device |
| No push notifications | Users are not notified of new messages |
| Object URL for images | Image URLs become invalid after page refresh |
| No message delivery to other party | When user "sends" a message, the seller never sees it |
| No "bot" response simulation | After a message is sent, no automated response appears |
| Thread IDs created locally | Cannot be shared across devices or users |
| Offer "acceptance" is client-only | The other party doesn't receive the acceptance |
| Transaction confirmation is local | No actual money transfer or confirmation to seller |

---

## Chat Components (`components/omeetso/chat/`)

| Component | Purpose |
|---|---|
| `MessageBubble.tsx` | Renders a single message |
| `OfferCard.tsx` | Offer/counter-offer UI |
| `TransactionCard.tsx` | Transaction confirmation card |
| `SafetyBanner.tsx` | Safety tips banner |
| `MeetPlaceSheet.tsx` | Meet place suggestion sheet |
| `ReportSheet.tsx` (reused) | Report message sheet |
| `AttachmentSheet.tsx` | Image/attachment picker |

---

## Functions Exported from `lib/chat.ts`

| Function | Purpose |
|---|---|
| `getThreads()` | Get all threads, sorted by last message |
| `getThread(id)` | Get single thread |
| `ensureThreadForProduct(product, seller)` | Create or return existing thread |
| `getMessagesFor(threadId)` | Get messages for a thread |
| `sendMessage(threadId, kind, payload)` | Add a message to a thread |
| `markThreadRead(threadId)` | Mark all messages as read |
| `archiveThread(id)` | Move to archived |
| `muteThread(id, until?)` | Mute a thread |
| `blockUser(userId)` | Add to blocked list |
| `isBlocked(userId)` | Check if blocked |
| `createOffer(data)` | Create new offer |
| `respondToOffer(offerId, response, counterAmount?)` | Accept/decline/counter |
| `confirmTransaction(data)` | Create transaction confirmation |
| `getReportTickets()` | Get all report tickets |
| `addReportTicket(data)` | Create a report ticket |
| `getDraftMessage(threadId)` | Get unsent draft |
| `saveDraftMessage(threadId, text)` | Save draft |
| `clearDraftMessage(threadId)` | Clear draft |

---

## What Is Needed for Real Chat

| Component | Technology Options |
|---|---|
| Real-time messaging | Socket.IO, WebSockets, Firebase Realtime DB, Ably, Pusher |
| Message storage | MongoDB (messages collection), PostgreSQL |
| File uploads | AWS S3, Cloudinary, Firebase Storage |
| Push notifications | Firebase Cloud Messaging (FCM), APNs |
| Typing indicators | Socket.IO events |
| Read receipts | Socket.IO + DB update |
| Message history pagination | Cursor-based API pagination |
| Offer state machine | Backend-controlled offer status |
