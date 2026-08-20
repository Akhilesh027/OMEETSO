// Omeetso — Phase 4 chat & offer data layer (frontend + localStorage)
import { PRODUCTS, SELLERS, STORES } from "./mock";

// -------- keys --------
const K_THREADS = "omeetso_chat_threads";
const K_MESSAGES = "omeetso_chat_messages";
const K_OFFERS = "omeetso_offers";
const K_ARCHIVED = "omeetso_archived_chats";
const K_MUTED = "omeetso_muted_chats";
const K_BLOCKED = "omeetso_blocked_users";
const K_SAFETY_DISMISSED = "omeetso_chat_safety_dismissed";
const K_DRAFTS = "omeetso_chat_drafts";
const K_REPORTS = "omeetso_report_tickets";
const K_TRANSACTIONS = "omeetso_transaction_confirmations";
const K_SEEDED = "omeetso_chat_seeded_v2";
const K_ME = "omeetso_user";

// -------- types --------
export type PeerType = "user" | "store";
export type Role = "buying" | "selling" | "store";
export type ThreadStatus =
  | "active" | "listing_sold" | "listing_paused" | "listing_removed" | "product_unavailable";

export type Thread = {
  id: string;
  productId: string;
  role: Role;
  peerType: PeerType;
  peerId: string;
  peerName: string;
  peerAvatar?: string;
  peerVerified?: boolean;
  online?: boolean;
  lastActive?: string;
  createdAt: number;
  updatedAt: number;
  unread: number;
  lastMessagePreview?: string;
  status: ThreadStatus;
};

export type MessageType =
  | "text" | "image" | "location" | "voice"
  | "offer" | "system";

export type MsgStatus = "sending" | "sent" | "delivered" | "read" | "failed";

export type Message = {
  id: string;
  threadId: string;
  from: "me" | "them" | "system";
  type: MessageType;
  text?: string;
  imageUrl?: string;
  caption?: string;
  location?: { name: string; area: string };
  voice?: { durationSec: number };
  offerId?: string;
  systemKind?:
    | "offer_sent" | "offer_accepted" | "offer_rejected" | "offer_countered"
    | "offer_withdrawn" | "offer_expired"
    | "listing_sold" | "listing_removed" | "safety" | "call_attempt"
    | "transaction_completed" | "block" | "unblock";
  rawOffer?: {
    id: string;
    amountInPaise: number;
    originalPriceInPaise: number;
    status: string;
    createdByUserId?: string;
    expiresAt?: string;
  };
  createdAt: number;
  status: MsgStatus;
};

export type OfferStatus =
  | "pending" | "countered" | "accepted" | "rejected"
  | "withdrawn" | "expired" | "completed";

export type OfferHistoryEntry = {
  by: "buyer" | "seller";
  amount: number;
  action: "offer" | "counter" | "accept" | "reject" | "withdraw" | "expire" | "complete";
  message?: string;
  at: number;
};

export type Offer = {
  id: string;
  threadId: string;
  productId: string;
  buyerId: string;
  sellerId: string;
  storeId?: string;
  listedPrice: number;
  amount: number;
  previousAmount?: number;
  message?: string;
  createdAt: number;
  expiresAt: number;
  updatedAt: number;
  status: OfferStatus;
  history: OfferHistoryEntry[];
  // role at creation: whether current user was buyer or seller (from ME)
};

export type ReportTicket = {
  id: string;
  kind: "user" | "message";
  targetId: string;
  threadId?: string;
  messageIds?: string[];
  reason: string;
  description?: string;
  at: number;
};

export type TransactionConfirmation = {
  offerId: string;
  by: "buyer" | "seller";
  completed: boolean;
  at: number;
};

// -------- current user --------
export type Me = { id: string; name: string; avatar?: string };
export function getMe(): Me {
  if (typeof window === "undefined") return { id: "u_me", name: "You" };
  try {
    const raw = localStorage.getItem(K_ME);
    if (raw) {
      const u = JSON.parse(raw);
      return { id: u.id || "u_me", name: u.name || "You", avatar: u.avatar };
    }
  } catch { /* ignore */ }
  return { id: "u_me", name: "You" };
}
export function isGuest(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("omeetso_guest") === "1";
}

// -------- pub/sub --------
type Listener = () => void;
const listeners = new Set<Listener>();
export function subscribe(fn: Listener) { listeners.add(fn); return () => { listeners.delete(fn); }; }
function emit() { listeners.forEach((l) => l()); }

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { const raw = localStorage.getItem(key); return raw ? (JSON.parse(raw) as T) : fallback; }
  catch { return fallback; }
}
function write<T>(key: string, val: T) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* ignore */ }
  emit();
}

// -------- ids --------
const rid = (p = "id") => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

// -------- getters --------
export function getThreads(): Thread[] { return read<Thread[]>(K_THREADS, []); }
export function saveThreads(t: Thread[]) { write(K_THREADS, t); }
export function getMessagesFor(threadId: string): Message[] {
  const all = read<Record<string, Message[]>>(K_MESSAGES, {});
  return all[threadId] ?? [];
}
function saveMessagesFor(threadId: string, msgs: Message[]) {
  const all = read<Record<string, Message[]>>(K_MESSAGES, {});
  all[threadId] = msgs;
  write(K_MESSAGES, all);
}
export function getOffers(): Offer[] { return read<Offer[]>(K_OFFERS, []); }
export function saveOffers(o: Offer[]) { write(K_OFFERS, o); }
export function getOffer(id: string) { return getOffers().find((o) => o.id === id); }
export function getOfferByThread(threadId: string) {
  const list = getOffers().filter((o) => o.threadId === threadId);
  return list.sort((a, b) => b.updatedAt - a.updatedAt)[0];
}
export function getOffersForThread(threadId: string) {
  return getOffers().filter((o) => o.threadId === threadId).sort((a, b) => a.createdAt - b.createdAt);
}
export function getActiveOffer(productId: string, buyerId: string) {
  return getOffers().find(
    (o) => o.productId === productId && o.buyerId === buyerId &&
      (o.status === "pending" || o.status === "countered")
  );
}

// -------- archive / mute / block --------
export function getArchived(): string[] { return read<string[]>(K_ARCHIVED, []); }
export function isArchived(id: string) { return getArchived().includes(id); }
export function archiveThread(id: string, on = true) {
  const cur = new Set(getArchived());
  if (on) cur.add(id); else cur.delete(id);
  write(K_ARCHIVED, [...cur]);
}

export type Mute = { until: number | "always" };
export function getMuted(): Record<string, Mute> { return read(K_MUTED, {} as Record<string, Mute>); }
export function isMuted(id: string) {
  const m = getMuted()[id]; if (!m) return false;
  return m.until === "always" || m.until > Date.now();
}
export function muteThread(id: string, hours: number | "always") {
  const cur = getMuted();
  if (hours === 0) delete cur[id];
  else cur[id] = { until: hours === "always" ? "always" : Date.now() + hours * 3600_000 };
  write(K_MUTED, cur);
}
export function unmuteThread(id: string) {
  const cur = getMuted(); delete cur[id]; write(K_MUTED, cur);
}

export function getBlocked(): string[] { return read<string[]>(K_BLOCKED, []); }
export function isBlocked(peerId: string) { return getBlocked().includes(peerId); }
export function blockUser(peerId: string) {
  const s = new Set(getBlocked()); s.add(peerId); write(K_BLOCKED, [...s]);
}
export function unblockUser(peerId: string) {
  write(K_BLOCKED, getBlocked().filter((x) => x !== peerId));
}

// -------- drafts --------
export function getDraft(id: string): string {
  const all = read<Record<string, string>>(K_DRAFTS, {}); return all[id] ?? "";
}
export function setDraft(id: string, val: string) {
  const all = read<Record<string, string>>(K_DRAFTS, {});
  if (val) all[id] = val; else delete all[id];
  write(K_DRAFTS, all);
}

// -------- safety --------
export function isSafetyDismissed(threadId: string) {
  const map = read<Record<string, boolean>>(K_SAFETY_DISMISSED, {});
  return !!map[threadId] || !!map["*"];
}
export function dismissSafety(threadId: string, all = false) {
  const map = read<Record<string, boolean>>(K_SAFETY_DISMISSED, {});
  if (all) map["*"] = true; else map[threadId] = true;
  write(K_SAFETY_DISMISSED, map);
}

// -------- reports --------
export function getReports(): ReportTicket[] { return read<ReportTicket[]>(K_REPORTS, []); }
export function addReport(r: Omit<ReportTicket, "id" | "at">) {
  const rec: ReportTicket = { ...r, id: "OMT-" + Math.random().toString(36).slice(2, 8).toUpperCase(), at: Date.now() };
  write(K_REPORTS, [rec, ...getReports()]);
  return rec;
}

// -------- transactions --------
export function getTransactions(): TransactionConfirmation[] { return read<TransactionConfirmation[]>(K_TRANSACTIONS, []); }
export function confirmTransaction(t: TransactionConfirmation) {
  const list = getTransactions().filter((x) => !(x.offerId === t.offerId && x.by === t.by));
  write(K_TRANSACTIONS, [t, ...list]);
}

// -------- seeding --------
export function seedIfEmpty() {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(K_SEEDED) === "1") return;
  const me = getMe();
  const now = Date.now();

  // pick some products by role
  const buyingProducts = PRODUCTS.filter((p) => !p.sponsored && p.sellerId !== me.id).slice(0, 3);
  const sellingProducts = PRODUCTS.filter((p) => !p.sponsored).slice(3, 5); // pretend I own these
  const storeProduct = PRODUCTS.find((p) => p.storeId);

  const threads: Thread[] = [];
  const messagesMap: Record<string, Message[]> = {};
  const offers: Offer[] = [];

  // Buying #1 — Ramesh Kumar / iPhone-like
  if (buyingProducts[0]) {
    const p = buyingProducts[0];
    const seller = SELLERS.find((s) => s.id === p.sellerId) ?? SELLERS[0];
    const tid = "th_b1";
    threads.push({
      id: tid, productId: p.id, role: "buying", peerType: "user",
      peerId: seller.id, peerName: seller.name, peerAvatar: seller.avatar,
      peerVerified: seller.verified, online: true, lastActive: "Usually replies within 15 minutes",
      createdAt: now - 3600_000, updatedAt: now - 60_000, unread: 0, status: "active",
      lastMessagePreview: "Yes, around 6:30 PM works for me.",
    });
    messagesMap[tid] = [
      m(tid, "me", "text", { text: "Hi, is this still available?", ago: 90 }),
      m(tid, "them", "text", { text: "Yes, it is available.", ago: 88 }),
      m(tid, "me", "text", { text: "Does it include the original box and charger?", ago: 60 }),
      m(tid, "them", "text", { text: "The box is available. I will include a compatible charger.", ago: 58 }),
      m(tid, "me", "text", { text: "Can I inspect it near Madhapur Metro this evening?", ago: 12 }),
      m(tid, "them", "text", { text: "Yes, around 6:30 PM works for me.", ago: 1 }),
    ];
  }

  // Buying #2 — with an active offer
  if (buyingProducts[1]) {
    const p = buyingProducts[1];
    const seller = SELLERS.find((s) => s.id === p.sellerId) ?? SELLERS[1];
    const tid = "th_b2";
    const oid = "of_b2";
    threads.push({
      id: tid, productId: p.id, role: "buying", peerType: "user",
      peerId: seller.id, peerName: seller.name, peerAvatar: seller.avatar,
      peerVerified: seller.verified, online: false, lastActive: "Last active 2h ago",
      createdAt: now - 86400_000, updatedAt: now - 3600_000, unread: 1, status: "active",
      lastMessagePreview: "Offer sent · " + inr(Math.round(p.price * 0.9)),
    });
    const off: Offer = {
      id: oid, threadId: tid, productId: p.id, buyerId: me.id,
      sellerId: seller.id, listedPrice: p.price,
      amount: Math.round(p.price * 0.9),
      createdAt: now - 4 * 3600_000, expiresAt: now + 44 * 3600_000, updatedAt: now - 4 * 3600_000,
      status: "pending", message: "Would you consider this price?",
      history: [{ by: "buyer", amount: Math.round(p.price * 0.9), action: "offer", at: now - 4 * 3600_000 }],
    };
    offers.push(off);
    messagesMap[tid] = [
      m(tid, "me", "text", { text: "Hi, is the price negotiable?", ago: 1440 }),
      m(tid, "them", "text", { text: "It is negotiable. Please share your offer.", ago: 1400 }),
      m(tid, "me", "offer", { offerId: oid, ago: 240 }),
      m(tid, "system", "system", { systemKind: "offer_sent", text: `You sent an offer of ${inr(off.amount)}`, ago: 240 }),
    ];
  }

  // Selling #1 — Sanjay Reddy offers on my sofa
  if (sellingProducts[0]) {
    const p = sellingProducts[0];
    const tid = "th_s1";
    const oid = "of_s1";
    threads.push({
      id: tid, productId: p.id, role: "selling", peerType: "user",
      peerId: "buyer_sanjay", peerName: "Sanjay Reddy", peerAvatar: undefined,
      peerVerified: false, online: false, lastActive: "Last active 30m ago",
      createdAt: now - 2 * 86400_000, updatedAt: now - 30 * 60_000, unread: 2, status: "active",
      lastMessagePreview: `Would you accept ${inr(Math.round(p.price * 0.88))}?`,
    });
    const buyerOffer = Math.round(p.price * 0.88);
    const off: Offer = {
      id: oid, threadId: tid, productId: p.id, buyerId: "buyer_sanjay",
      sellerId: me.id, listedPrice: p.price, amount: buyerOffer,
      createdAt: now - 45 * 60_000, expiresAt: now + 47 * 3600_000, updatedAt: now - 30 * 60_000,
      status: "pending",
      history: [{ by: "buyer", amount: buyerOffer, action: "offer", at: now - 45 * 60_000 }],
    };
    offers.push(off);
    messagesMap[tid] = [
      m(tid, "them", "text", { text: "Is delivery available to Kondapur?", ago: 200 }),
      m(tid, "me", "text", { text: "Yes, delivery can be arranged at an additional cost.", ago: 195 }),
      m(tid, "them", "offer", { offerId: oid, ago: 45 }),
      m(tid, "them", "text", { text: `Would you accept ${inr(buyerOffer)}?`, ago: 30 }),
    ];
  }

  // Selling #2 — completed transaction thread
  if (sellingProducts[1]) {
    const p = sellingProducts[1];
    const tid = "th_s2";
    threads.push({
      id: tid, productId: p.id, role: "selling", peerType: "user",
      peerId: "buyer_neha", peerName: "Neha Iyer", peerAvatar: undefined,
      peerVerified: true, online: false, lastActive: "Last active yesterday",
      createdAt: now - 5 * 86400_000, updatedAt: now - 3 * 86400_000, unread: 0, status: "active",
      lastMessagePreview: "Thanks, will pick up tomorrow.",
    });
    messagesMap[tid] = [
      m(tid, "them", "text", { text: "Hi, is this available?", ago: 5 * 1440 }),
      m(tid, "me", "text", { text: "Yes it is.", ago: 5 * 1440 - 10 }),
      m(tid, "them", "text", { text: "Thanks, will pick up tomorrow.", ago: 3 * 1440 }),
    ];
  }

  // Store chat — Satish Electronics
  if (storeProduct) {
    const store = STORES.find((s) => s.id === storeProduct.storeId) ?? STORES[0];
    const tid = "th_st1";
    threads.push({
      id: tid, productId: storeProduct.id, role: "store", peerType: "store",
      peerId: store.id, peerName: store.name, peerAvatar: store.logo,
      peerVerified: store.verified, online: store.open, lastActive: store.open ? "Open now · Verified Store" : "Closed · Verified Store",
      createdAt: now - 86400_000, updatedAt: now - 2 * 3600_000, unread: 0, status: "active",
      lastMessagePreview: "Delivery is available within 10 km.",
    });
    messagesMap[tid] = [
      m(tid, "me", "text", { text: "Is this television available in stock?", ago: 200 }),
      m(tid, "them", "text", { text: "Yes, it is currently in stock.", ago: 195 }),
      m(tid, "me", "text", { text: "Do you provide installation?", ago: 150 }),
      m(tid, "them", "text", { text: "Yes, installation can be arranged after delivery.", ago: 145 }),
      m(tid, "them", "text", { text: "Delivery is available within 10 km.", ago: 120 }),
    ];
  }

  saveThreads(threads);
  Object.entries(messagesMap).forEach(([tid, msgs]) => saveMessagesFor(tid, msgs));
  saveOffers(offers);
  try { localStorage.setItem(K_SEEDED, "1"); } catch { /* ignore */ }
}

function inr(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}
function m(
  threadId: string,
  from: "me" | "them" | "system",
  type: MessageType,
  o: { text?: string; caption?: string; imageUrl?: string; location?: { name: string; area: string };
       voice?: { durationSec: number }; offerId?: string; systemKind?: Message["systemKind"]; ago: number; }
): Message {
  return {
    id: rid("m"), threadId, from, type,
    text: o.text, caption: o.caption, imageUrl: o.imageUrl, location: o.location, voice: o.voice,
    offerId: o.offerId, systemKind: o.systemKind,
    createdAt: Date.now() - o.ago * 60_000,
    status: from === "me" ? "read" : "delivered",
  };
}

// -------- ops: threads --------
export function findThreadForProduct(productId: string, peerId: string): Thread | undefined {
  return getThreads().find((t) => t.productId === productId && t.peerId === peerId);
}
export function ensureThreadForProduct(productId: string): Thread {
  const p = PRODUCTS.find((x) => x.id === productId);
  if (!p) throw new Error("Product not found");
  const me = getMe();
  const isMine = p.sellerId === me.id;
  // buyer -> chats with seller/store; if I own, treat as selling with a mock buyer
  let peerId: string;
  let peerName: string;
  let peerAvatar: string | undefined;
  let peerVerified = false;
  let peerType: PeerType = "user";
  let role: Role = "buying";
  if (p.storeId) {
    const store = STORES.find((s) => s.id === p.storeId);
    if (store) {
      peerType = "store"; peerId = store.id; peerName = store.name;
      peerAvatar = store.logo; peerVerified = store.verified; role = "store";
    } else {
      peerId = p.sellerId; peerName = SELLERS.find((s) => s.id === peerId)?.name ?? "Seller";
    }
  } else if (isMine) {
    peerId = "buyer_guest_" + productId; peerName = "Prospective Buyer"; role = "selling";
  } else {
    const s = SELLERS.find((x) => x.id === p.sellerId);
    peerId = p.sellerId; peerName = s?.name ?? "Seller";
    peerAvatar = s?.avatar; peerVerified = !!s?.verified;
    role = "buying";
  }
  const existing = findThreadForProduct(productId, peerId);
  if (existing) return existing;
  const t: Thread = {
    id: rid("th"), productId, role, peerType, peerId, peerName, peerAvatar, peerVerified,
    online: false, lastActive: peerType === "store" ? "Verified Store" : "Usually replies within a few hours",
    createdAt: Date.now(), updatedAt: Date.now(), unread: 0, status: "active",
    lastMessagePreview: undefined,
  };
  saveThreads([t, ...getThreads()]);
  return t;
}

export function markThreadRead(id: string) {
  const list = getThreads().map((t) => t.id === id ? { ...t, unread: 0 } : t);
  saveThreads(list);
}

export function touchThread(id: string, preview?: string) {
  const list = getThreads().map((t) =>
    t.id === id ? { ...t, updatedAt: Date.now(), lastMessagePreview: preview ?? t.lastMessagePreview } : t
  );
  saveThreads(list);
}

export function setThreadStatus(id: string, status: ThreadStatus) {
  saveThreads(getThreads().map((t) => t.id === id ? { ...t, status } : t));
}

// -------- ops: messages --------
export function sendMessage(threadId: string, partial: Partial<Message> & { type: MessageType }): Message {
  const msg: Message = {
    id: rid("m"), threadId, from: partial.from ?? "me",
    type: partial.type, text: partial.text, caption: partial.caption,
    imageUrl: partial.imageUrl, location: partial.location, voice: partial.voice,
    offerId: partial.offerId, systemKind: partial.systemKind,
    createdAt: Date.now(), status: partial.from === "system" ? "delivered" : "sending",
  };
  const list = [...getMessagesFor(threadId), msg];
  saveMessagesFor(threadId, list);
  const preview =
    msg.type === "text" ? (msg.text ?? "").slice(0, 80) :
    msg.type === "image" ? "📷 Photo" :
    msg.type === "location" ? "📍 Location shared" :
    msg.type === "voice" ? "🎙 Voice note" :
    msg.type === "offer" ? "Offer" :
    msg.text ?? "System";
  touchThread(threadId, preview);
  // Simulate delivery
  if (msg.from === "me") {
    setTimeout(() => updateMessage(threadId, msg.id, { status: "sent" }), 300);
    setTimeout(() => updateMessage(threadId, msg.id, { status: "delivered" }), 900);
    setTimeout(() => updateMessage(threadId, msg.id, { status: "read" }), 2200);
  }
  return msg;
}

export function updateMessage(threadId: string, id: string, patch: Partial<Message>) {
  const list = getMessagesFor(threadId).map((x) => x.id === id ? { ...x, ...patch } : x);
  saveMessagesFor(threadId, list);
}

export function retryMessage(threadId: string, id: string) {
  updateMessage(threadId, id, { status: "sending" });
  setTimeout(() => updateMessage(threadId, id, { status: "sent" }), 400);
  setTimeout(() => updateMessage(threadId, id, { status: "delivered" }), 1000);
}

export function deleteMessage(threadId: string, id: string) {
  saveMessagesFor(threadId, getMessagesFor(threadId).filter((m) => m.id !== id));
}

export function clearChat(threadId: string) {
  saveMessagesFor(threadId, []);
  touchThread(threadId, undefined);
}

export function deleteThread(threadId: string) {
  saveThreads(getThreads().filter((t) => t.id !== threadId));
  const all = read<Record<string, Message[]>>(K_MESSAGES, {});
  delete all[threadId];
  write(K_MESSAGES, all);
}

// -------- ops: offers --------
const OFFER_EXPIRY_MS = 48 * 3600_000;

export function createOffer(input: {
  threadId: string; productId: string; amount: number; message?: string; buyerId: string; sellerId: string; listedPrice: number; storeId?: string;
}): Offer {
  const now = Date.now();
  const off: Offer = {
    id: rid("of"),
    threadId: input.threadId, productId: input.productId,
    buyerId: input.buyerId, sellerId: input.sellerId, storeId: input.storeId,
    listedPrice: input.listedPrice, amount: input.amount, message: input.message,
    createdAt: now, expiresAt: now + OFFER_EXPIRY_MS, updatedAt: now,
    status: "pending",
    history: [{ by: "buyer", amount: input.amount, action: "offer", message: input.message, at: now }],
  };
  saveOffers([off, ...getOffers()]);
  sendMessage(input.threadId, { type: "offer", from: "me", offerId: off.id });
  sendMessage(input.threadId, { type: "system", from: "system", systemKind: "offer_sent", text: `Offer of ${inr(off.amount)} sent` });
  return off;
}

function patchOffer(id: string, patch: Partial<Offer>) {
  saveOffers(getOffers().map((o) => o.id === id ? { ...o, ...patch, updatedAt: Date.now() } : o));
}

export function acceptOffer(id: string) {
  const o = getOffer(id); if (!o) return;
  patchOffer(id, {
    status: "accepted",
    history: [...o.history, { by: "seller", amount: o.amount, action: "accept", at: Date.now() }],
  });
  sendMessage(o.threadId, { type: "system", from: "system", systemKind: "offer_accepted", text: `Offer of ${inr(o.amount)} accepted` });
}

export function rejectOffer(id: string, reason?: string) {
  const o = getOffer(id); if (!o) return;
  patchOffer(id, {
    status: "rejected",
    history: [...o.history, { by: "seller", amount: o.amount, action: "reject", message: reason, at: Date.now() }],
  });
  sendMessage(o.threadId, { type: "system", from: "system", systemKind: "offer_rejected", text: reason ? `Offer rejected — ${reason}` : "Offer rejected" });
}

export function counterOffer(id: string, amount: number, message?: string, by: "buyer" | "seller" = "seller") {
  const o = getOffer(id); if (!o) return;
  patchOffer(id, {
    status: "countered",
    previousAmount: o.amount, amount,
    message,
    expiresAt: Date.now() + OFFER_EXPIRY_MS,
    history: [...o.history, { by, amount, action: "counter", message, at: Date.now() }],
  });
  sendMessage(o.threadId, { type: "offer", from: by === "seller" ? "them" : "me", offerId: o.id });
  sendMessage(o.threadId, { type: "system", from: "system", systemKind: "offer_countered", text: `Counteroffer: ${inr(amount)}` });
}

export function withdrawOffer(id: string) {
  const o = getOffer(id); if (!o) return;
  patchOffer(id, {
    status: "withdrawn",
    history: [...o.history, { by: "buyer", amount: o.amount, action: "withdraw", at: Date.now() }],
  });
  sendMessage(o.threadId, { type: "system", from: "system", systemKind: "offer_withdrawn", text: "Offer withdrawn" });
}

export function completeOffer(id: string) {
  const o = getOffer(id); if (!o) return;
  patchOffer(id, {
    status: "completed",
    history: [...o.history, { by: "seller", amount: o.amount, action: "complete", at: Date.now() }],
  });
  sendMessage(o.threadId, { type: "system", from: "system", systemKind: "transaction_completed", text: `Transaction completed at ${inr(o.amount)}` });
  setThreadStatus(o.threadId, "listing_sold");
}

export function refreshExpiries() {
  const now = Date.now();
  let changed = false;
  const next = getOffers().map((o) => {
    if ((o.status === "pending" || o.status === "countered") && o.expiresAt <= now) {
      changed = true;
      return { ...o, status: "expired" as OfferStatus, updatedAt: now, history: [...o.history, { by: "seller" as const, amount: o.amount, action: "expire" as const, at: now }] };
    }
    return o;
  });
  if (changed) saveOffers(next);
}

export function humanExpiry(o: Offer): string {
  const ms = o.expiresAt - Date.now();
  if (o.status === "expired") return "Offer expired";
  if (ms <= 0) return "Offer expired";
  const h = Math.floor(ms / 3600_000);
  if (h < 1) return `Expires in ${Math.max(1, Math.floor(ms / 60_000))} min`;
  if (h < 48) return `Expires in ${h}h`;
  return `Expires in ${Math.ceil(h / 24)}d`;
}

// -------- product/thread status guards --------
export function canMakeOffer(product: { id: string; sold?: boolean; unavailable?: boolean; sellerId?: string } | string): { ok: boolean; reason?: string } {
  if (typeof product === "object") {
    if (product.sold) return { ok: false, reason: "Listing already sold" };
    if (product.unavailable) return { ok: false, reason: "Listing removed" };
    const me = getMe();
    if (product.sellerId && product.sellerId === me.id) return { ok: false, reason: "You cannot make an offer on your own listing" };
    return { ok: true };
  }
  const p = PRODUCTS.find((x) => x.id === product);
  if (!p) return { ok: true };
  if (p.sold) return { ok: false, reason: "Listing already sold" };
  if (p.unavailable) return { ok: false, reason: "Listing removed" };
  const me = getMe();
  if (p.sellerId === me.id) return { ok: false, reason: "You cannot make an offer on your own listing" };
  return { ok: true };
}

// suggested amounts
export function suggestedOffers(listedPrice: number) {
  return [
    Math.round(listedPrice * 0.85 / 100) * 100,
    Math.round(listedPrice * 0.90 / 100) * 100,
    Math.round(listedPrice * 0.95 / 100) * 100,
  ];
}

// -------- misc formatting --------
export function formatChatTime(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  const y = new Date(now); y.setDate(now.getDate() - 1);
  if (d.toDateString() === y.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function dayLabel(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return "Today";
  const y = new Date(now); y.setDate(now.getDate() - 1);
  if (d.toDateString() === y.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

// Compose group messages by day
export function groupByDay(msgs: Message[]) {
  const groups: { label: string; items: Message[] }[] = [];
  for (const m of msgs) {
    const label = dayLabel(m.createdAt);
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.items.push(m);
    else groups.push({ label, items: [m] });
  }
  return groups;
}
