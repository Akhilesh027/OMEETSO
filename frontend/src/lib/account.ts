// Omeetso Phase 6 — Account, Trust, Safety, Reviews & Support
// Frontend-only state. No real verification / SMS / email / moderation.

export const AK = {
  profile: "omeetso_profile_data",
  legacyProfile: "omeetso_profile",
  user: "omeetso_user",
  business: "omeetso_business_profile",
  verification: "omeetso_verification_status",
  notifications: "omeetso_notifications",
  notifPrefs: "omeetso_notification_preferences",
  privacy: "omeetso_privacy_settings",
  adPrefs: "omeetso_ad_preferences",
  language: "omeetso_language",
  appearance: "omeetso_appearance",
  savedLocations: "omeetso_saved_locations",
  blocked: "omeetso_blocked_users",
  safetyReports: "omeetso_safety_reports",
  supportTickets: "omeetso_support_tickets",
  reviews: "omeetso_reviews",
  accountStatus: "omeetso_account_status",
  meetPlaces: "omeetso_saved_meet_places",
  helpRecent: "omeetso_help_recent",
} as const;

const subs = new Set<() => void>();
export const subscribeAccount = (cb: () => void) => { subs.add(cb); return () => subs.delete(cb); };
const emit = () => subs.forEach((s) => s());

function read<T>(key: string, def: T): T {
  if (typeof window === "undefined") return def;
  try { const v = localStorage.getItem(key); return v ? (JSON.parse(v) as T) : def; } catch { return def; }
}
function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(key, JSON.stringify(value)); emit(); } catch { /* ignore */ }
}
export const newId = (p = "ID") =>
  `${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`.toUpperCase();
export const formatDate = (t: number) =>
  new Date(t).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
export const timeAgo = (t: number) => {
  const s = Math.floor((Date.now() - t) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  if (s < 604800) return `${Math.floor(s / 86400)}d`;
  return formatDate(t);
};

// ============== Profile ==============
export type AccountType = "individual" | "business";
export type Profile = {
  name: string;
  email?: string;
  emailVerified?: boolean;
  mobile: string;
  mobileVerified?: boolean;
  city: string;
  pincode: string;
  area?: string;
  language: string;
  bio?: string;
  avatar?: string;
  accountType: AccountType;
  businessEnabled?: boolean;
  memberSince: number;
  responseTime?: string;
};

const DEFAULT_PROFILE: Profile = {
  name: "Omeetso User",
  email: "",
  emailVerified: false,
  mobile: "",
  mobileVerified: false,
  city: "Hyderabad",
  pincode: "500081",
  area: "Madhapur",
  language: "en",
  bio: "",
  avatar: "",
  accountType: "individual",
  businessEnabled: false,
  memberSince: Date.now(),
  responseTime: "Usually within 15 minutes",
};

export function getProfile(): Profile {
  let liveUser: any = null;
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("omeetso_user");
      if (raw) liveUser = JSON.parse(raw);
    } catch { /* ignore */ }
  }

  const stored = read<Partial<Profile> | null>(AK.profile, null);

  if (liveUser) {
    const normalizedPhone = liveUser.phone ? liveUser.phone.replace(/\D/g, "").slice(-10) : "";
    const isSameUser = !stored || !stored.mobile || stored.mobile.replace(/\D/g, "").slice(-10) === normalizedPhone;
    const validStored = isSameUser ? stored : null;
    const formattedMobile = liveUser.phone ? (liveUser.phone.startsWith("+91") ? liveUser.phone : `+91${liveUser.phone.replace(/\D/g, "").slice(-10)}`) : "";

    return {
      ...DEFAULT_PROFILE,
      name: liveUser.profile?.name || validStored?.name || (formattedMobile ? `User (${formattedMobile})` : "Omeetso User"),
      mobile: formattedMobile || validStored?.mobile || "",
      mobileVerified: Boolean(liveUser.verificationSummary?.mobileVerified ?? true),
      email: liveUser.email || validStored?.email || "",
      emailVerified: Boolean(liveUser.verificationSummary?.emailVerified),
      city: liveUser.profile?.city || validStored?.city || "Hyderabad",
      pincode: liveUser.profile?.pincode || validStored?.pincode || "500081",
      area: liveUser.profile?.area || validStored?.area || "Madhapur",
      avatar: liveUser.profile?.avatar || validStored?.avatar || "",
      bio: liveUser.profile?.bio || validStored?.bio || "",
      accountType: liveUser.accountType || validStored?.accountType || "individual",
      memberSince: liveUser.createdAt ? new Date(liveUser.createdAt).getTime() : Date.now(),
    };
  }

  if (stored) return { ...DEFAULT_PROFILE, ...stored };
  return DEFAULT_PROFILE;
}
export function setProfile(p: Partial<Profile>) {
  const cur = getProfile();
  const next = { ...cur, ...p };
  write(AK.profile, next);
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("omeetso_user");
      if (raw) {
        const u = JSON.parse(raw);
        u.profile = { ...(u.profile || {}), name: next.name, avatar: next.avatar, city: next.city, pincode: next.pincode, area: next.area, bio: next.bio };
        if (next.email) u.email = next.email;
        localStorage.setItem("omeetso_user", JSON.stringify(u));
      }
    } catch {}
  }
}
export function completionPct(p: Profile): number {
  const checks = [!!p.name, !!p.email, !!p.mobile, !!p.city, !!p.pincode, !!p.bio, !!p.avatar, !!p.emailVerified, !!p.mobileVerified];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

// ============== Business profile ==============
export type BusinessProfile = {
  legalName: string;
  businessType: string;
  address: string;
  gstNumber?: string;
  registrationNumber?: string;
  email: string;
  mobile: string;
  documentRef?: string;
};
export const getBusinessProfile = (): BusinessProfile =>
  read<BusinessProfile>(AK.business, {
    legalName: "", businessType: "Retail", address: "", email: "", mobile: "",
  });
export const setBusinessProfile = (b: Partial<BusinessProfile>) =>
  write(AK.business, { ...getBusinessProfile(), ...b });

// ============== Verification ==============
export type VerifStatus =
  | "not_started" | "in_progress" | "submitted" | "under_review"
  | "verified" | "requires_changes" | "rejected" | "expired";
export type VerifKind = "mobile" | "email" | "identity" | "address" | "business" | "store";
export type Verification = {
  status: VerifStatus;
  submittedAt?: number;
  updatedAt?: number;
  reference?: string;
  reasonForChange?: string;
  details?: Record<string, string>;
  documentUrl?: string;
};
export type VerificationMap = Record<VerifKind, Verification>;
const DEFAULT_VERIF: VerificationMap = {
  mobile: { status: "not_started" },
  email: { status: "not_started" },
  identity: { status: "not_started" },
  address: { status: "not_started" },
  business: { status: "not_started" },
  store: { status: "not_started" },
};

export const getVerifications = (): VerificationMap => {
  const localSaved = read<Partial<VerificationMap>>(AK.verification, {});
  const base: VerificationMap = { ...DEFAULT_VERIF, ...localSaved };

  // Sanity check: identity is only verified/under_review if actual doc details exist
  if (base.identity && base.identity.status !== "not_started" && !base.identity.documentUrl && !base.identity.details?.docNumber) {
    base.identity = { status: "not_started" };
  }

  // Check live logged-in user state from localStorage
  if (typeof window !== "undefined") {
    try {
      const rawUser = localStorage.getItem("omeetso_user");
      if (rawUser) {
        const u = JSON.parse(rawUser);
        if (u.phoneVerified || u.mobileVerified || u.isPhoneVerified || u.verificationSummary?.mobileVerified) {
          base.mobile = { status: "verified", updatedAt: Date.now() };
        }
        if (u.emailVerified || u.verificationSummary?.emailVerified) {
          base.email = { status: "verified", updatedAt: Date.now() };
        }
        if (u.verificationSummary?.identityVerified && (base.identity.documentUrl || base.identity.details?.docNumber)) {
          base.identity = { status: "verified", updatedAt: Date.now() };
        }
      }
    } catch { /* ignore */ }
  }

  return base;
};

export const getVerification = (k: VerifKind) => getVerifications()[k];
export const setVerification = (k: VerifKind, v: Partial<Verification>) => {
  const cur = getVerifications();
  write(AK.verification, { ...cur, [k]: { ...cur[k], ...v, updatedAt: Date.now() } });
};

export function getTrustScore(): number {
  const v = getVerifications();
  let score = 0;
  if (v.mobile?.status === "verified") score += 35;
  if (v.identity?.status === "verified") score += 35;
  else if (v.identity?.status === "under_review" || v.identity?.status === "submitted") score += 15;
  if (v.email?.status === "verified") score += 15;
  if (v.address?.status === "verified" || v.business?.status === "verified" || v.store?.status === "verified") score += 15;
  return Math.min(100, score);
}

export const verifStatusLabel: Record<VerifStatus, string> = {
  not_started: "Not started", in_progress: "In progress", submitted: "Submitted",
  under_review: "Under review", verified: "Verified", requires_changes: "Requires changes",
  rejected: "Rejected", expired: "Expired",
};

// ============== Notifications ==============
export type NotifCategory =
  | "messages" | "offers" | "listings" | "stores"
  | "promotions" | "payments" | "system";
export type Notification = {
  id: string;
  category: NotifCategory;
  title: string;
  body: string;
  time: number;
  read: boolean;
  destination?: string;
  destinationLabel?: string;
  advertiser?: string;
  promoted?: boolean;
  thumbnail?: string;
};

const DEFAULT_NOTIFS: Notification[] = [
  { id: "N1", category: "messages", title: "New message from Ramesh Kumar", body: "Yes, the phone is still available.", time: Date.now() - 20 * 60 * 1000, read: false, destination: "/chats", destinationLabel: "Open chat" },
  { id: "N2", category: "offers", title: "New offer received", body: "Sanjay offered ₹11,000 for your Wooden Sofa Set.", time: Date.now() - 2 * 3600 * 1000, read: false, destination: "/offers", destinationLabel: "View offer" },
  { id: "N3", category: "listings", title: "Your listing is now active", body: "Premium Wooden Sofa Set is visible to nearby buyers.", time: Date.now() - 5 * 3600 * 1000, read: false, destination: "/listings", destinationLabel: "View listing" },
  { id: "N4", category: "stores", title: "Your store has been approved", body: "Satish Electronics is now live on Omeetso.", time: Date.now() - 26 * 3600 * 1000, read: true, destination: "/stores", destinationLabel: "Open store" },
  { id: "N5", category: "promotions", title: "Your promotion has started", body: "The 7-day Popular Boost is now active.", time: Date.now() - 28 * 3600 * 1000, read: true, destination: "/promotions", destinationLabel: "View promotion" },
  { id: "N6", category: "payments", title: "Wallet recharge successful", body: "₹1,000 was added to your Omeetso Wallet.", time: Date.now() - 3 * 86400000, read: true, destination: "/wallet", destinationLabel: "Open wallet" },
  { id: "N7", category: "system", title: "New login on this device", body: "A sign-in was detected on your account.", time: Date.now() - 4 * 86400000, read: true },
  { id: "N8", category: "promotions", title: "Local deal near Madhapur", body: "Up to 30% off on select mobile accessories this weekend.", time: Date.now() - 12 * 3600 * 1000, read: false, promoted: true, advertiser: "Sample Advertiser", destination: "/home", destinationLabel: "Explore deals" },
];

export function listNotifications(): Notification[] {
  const stored = read<Notification[] | null>(AK.notifications, null);
  if (stored && stored.length) return stored;
  write(AK.notifications, DEFAULT_NOTIFS);
  return DEFAULT_NOTIFS;
}
export function getNotification(id: string) { return listNotifications().find((n) => n.id === id); }
export function markRead(id: string, read = true) {
  const cur = listNotifications().map((n) => n.id === id ? { ...n, read } : n);
  write(AK.notifications, cur);
}
export function markAllRead(category?: NotifCategory) {
  const cur = listNotifications().map((n) => (!category || n.category === category) ? { ...n, read: true } : n);
  write(AK.notifications, cur);
}
export function deleteNotification(id: string) {
  write(AK.notifications, listNotifications().filter((n) => n.id !== id));
}
export function clearCategory(category: NotifCategory) {
  write(AK.notifications, listNotifications().filter((n) => n.category !== category));
}
export function unreadCount(): number { return listNotifications().filter((n) => !n.read).length; }

// ============== Notification preferences ==============
export type NotifChannels = { inApp: boolean; push: boolean; email: boolean; sms: boolean };
export type NotifPrefs = {
  channels: Record<string, NotifChannels>;
  pauseNonEssential: boolean;
};
export const NOTIF_PREF_KEYS: { section: string; items: { key: string; label: string; essential?: boolean }[] }[] = [
  { section: "Messages", items: [
    { key: "new_message", label: "New messages" },
    { key: "missed_message", label: "Missed messages" },
    { key: "store_message", label: "Store messages" },
  ]},
  { section: "Offers", items: [
    { key: "new_offer", label: "New offers" },
    { key: "counteroffer", label: "Counteroffers" },
    { key: "accepted_offer", label: "Accepted offers" },
    { key: "offer_expiry", label: "Offer expiry" },
  ]},
  { section: "Listings", items: [
    { key: "listing_approval", label: "Approval" },
    { key: "listing_rejection", label: "Rejection" },
    { key: "listing_expiry", label: "Expiry" },
    { key: "views_milestone", label: "Views milestone" },
    { key: "price_suggestion", label: "Price suggestion" },
  ]},
  { section: "Stores", items: [
    { key: "store_approval", label: "Store approval" },
    { key: "new_followers", label: "New followers" },
    { key: "product_enquiries", label: "Product enquiries" },
    { key: "store_reviews", label: "Store reviews" },
  ]},
  { section: "Promotions", items: [
    { key: "promo_started", label: "Promotion started" },
    { key: "promo_ending", label: "Promotion ending" },
    { key: "campaign_performance", label: "Campaign performance" },
    { key: "promo_recommendations", label: "Promotional recommendations" },
  ]},
  { section: "Payments", items: [
    { key: "wallet_recharge", label: "Wallet recharge", essential: true },
    { key: "payment_success", label: "Payment success", essential: true },
    { key: "payment_failure", label: "Payment failure", essential: true },
    { key: "refund_status", label: "Refund status", essential: true },
  ]},
  { section: "Marketing", items: [
    { key: "recommendations", label: "Product recommendations" },
    { key: "local_deals", label: "Local deals" },
    { key: "promotional", label: "Promotional notifications" },
    { key: "announcements", label: "Omeetso announcements" },
  ]},
];

function defaultChannels(): NotifChannels { return { inApp: true, push: true, email: false, sms: false }; }
export function getNotifPrefs(): NotifPrefs {
  const stored = read<Partial<NotifPrefs>>(AK.notifPrefs, {});
  const channels: Record<string, NotifChannels> = { ...(stored.channels ?? {}) };
  NOTIF_PREF_KEYS.forEach((s) => s.items.forEach((it) => { if (!channels[it.key]) channels[it.key] = defaultChannels(); }));
  return { channels, pauseNonEssential: stored.pauseNonEssential ?? false };
}
export function setNotifPrefs(p: Partial<NotifPrefs>) { write(AK.notifPrefs, { ...getNotifPrefs(), ...p }); }
export function setNotifChannel(key: string, channel: keyof NotifChannels, value: boolean) {
  const cur = getNotifPrefs();
  cur.channels[key] = { ...cur.channels[key], [channel]: value };
  write(AK.notifPrefs, cur);
}

// ============== Privacy ==============
export type PrivacySettings = {
  profileVisibility: "public" | "omeetso_only" | "limited";
  mobileVisibility: "hidden" | "after_chat" | "after_offer" | "public_store";
  lastActive: "show" | "hide";
  locationVisibility: "area" | "area_distance" | "hidden";
  productRecs: boolean;
  searchRecs: boolean;
  storeSuggestions: boolean;
};
const DEFAULT_PRIVACY: PrivacySettings = {
  profileVisibility: "omeetso_only", mobileVisibility: "after_chat", lastActive: "show",
  locationVisibility: "area", productRecs: true, searchRecs: true, storeSuggestions: true,
};
export const getPrivacy = (): PrivacySettings => ({ ...DEFAULT_PRIVACY, ...read<Partial<PrivacySettings>>(AK.privacy, {}) });
export const setPrivacy = (p: Partial<PrivacySettings>) => write(AK.privacy, { ...getPrivacy(), ...p });

// ============== Advertisement preferences ==============
export type AdPrefs = {
  personalised: boolean;
  locationBased: boolean;
  categoryBased: boolean;
  storePromotions: boolean;
  promotionalNotifications: boolean;
  hiddenAds: string[];
};
const DEFAULT_ADS: AdPrefs = {
  personalised: true, locationBased: true, categoryBased: true,
  storePromotions: true, promotionalNotifications: true, hiddenAds: [],
};
export const getAdPrefs = (): AdPrefs => ({ ...DEFAULT_ADS, ...read<Partial<AdPrefs>>(AK.adPrefs, {}) });
export const setAdPrefs = (p: Partial<AdPrefs>) => write(AK.adPrefs, { ...getAdPrefs(), ...p });
export const hideAd = (id: string) => {
  const cur = getAdPrefs();
  if (!cur.hiddenAds.includes(id)) setAdPrefs({ hiddenAds: [...cur.hiddenAds, id] });
};
export const resetAdPrefs = () => write(AK.adPrefs, DEFAULT_ADS);

// ============== Language / appearance ==============
export type Appearance = "system" | "light" | "dark";
export const getLanguage = () => read<string>(AK.language, "en");
export const setLanguage = (v: string) => write(AK.language, v);
export const getAppearance = (): Appearance => read<Appearance>(AK.appearance, "system");
export const setAppearance = (v: Appearance) => {
  write(AK.appearance, v);
  if (typeof document !== "undefined") applyAppearance(v);
};
export function applyAppearance(v: Appearance) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const dark = v === "dark" || (v === "system" && window.matchMedia?.("(prefers-color-scheme: dark)").matches);
  root.classList.toggle("dark", !!dark);
}

// ============== Saved locations ==============
export type SavedLocation = {
  id: string; label: string; area: string; pincode: string; city: string; isDefault: boolean;
};
export const listSavedLocations = (): SavedLocation[] => read<SavedLocation[]>(AK.savedLocations, []);
export const addSavedLocation = (l: Omit<SavedLocation, "id">) => {
  const cur = listSavedLocations();
  const id = newId("LOC");
  const next: SavedLocation[] = l.isDefault
    ? [{ ...l, id }, ...cur.map((x) => ({ ...x, isDefault: false }))]
    : [...cur, { ...l, id }];
  write(AK.savedLocations, next);
  return id;
};
export const updateSavedLocation = (id: string, patch: Partial<SavedLocation>) => {
  let cur = listSavedLocations();
  if (patch.isDefault) cur = cur.map((x) => ({ ...x, isDefault: false }));
  write(AK.savedLocations, cur.map((x) => x.id === id ? { ...x, ...patch } : x));
};
export const deleteSavedLocation = (id: string) =>
  write(AK.savedLocations, listSavedLocations().filter((x) => x.id !== id));

// ============== Blocked users ==============
export type BlockedUser = { id: string; name: string; avatar?: string; reason?: string; blockedAt: number };
export const listBlocked = (): BlockedUser[] => read<BlockedUser[]>(AK.blocked, []);
export const blockUser = (u: Omit<BlockedUser, "blockedAt">) => {
  const cur = listBlocked();
  if (cur.find((x) => x.id === u.id)) return;
  write(AK.blocked, [{ ...u, blockedAt: Date.now() }, ...cur]);
};
export const unblockUser = (id: string) => write(AK.blocked, listBlocked().filter((x) => x.id !== id));

// ============== Safety reports ==============
export type SafetyCategory =
  | "scam" | "fake_listing" | "fake_store" | "harassment"
  | "suspicious_payment" | "impersonation" | "prohibited" | "other";
export const SAFETY_CATEGORIES: { id: SafetyCategory; label: string }[] = [
  { id: "scam", label: "Scam attempt" },
  { id: "fake_listing", label: "Fake listing" },
  { id: "fake_store", label: "Fake store" },
  { id: "harassment", label: "Harassment" },
  { id: "suspicious_payment", label: "Suspicious payment request" },
  { id: "impersonation", label: "Account impersonation" },
  { id: "prohibited", label: "Prohibited product" },
  { id: "other", label: "Other" },
];
export type SafetyReport = {
  id: string; category: SafetyCategory; description: string;
  relatedUser?: string; relatedListing?: string; relatedChat?: string;
  attachments: string[]; contactPref?: string; status: "submitted" | "in_review" | "resolved";
  createdAt: number;
};
export const listSafetyReports = () => read<SafetyReport[]>(AK.safetyReports, []);
export const addSafetyReport = (r: Omit<SafetyReport, "id" | "createdAt" | "status">) => {
  const rec: SafetyReport = { ...r, id: newId("SR"), createdAt: Date.now(), status: "submitted" };
  write(AK.safetyReports, [rec, ...listSafetyReports()]);
  return rec;
};

// ============== Support tickets ==============
export type TicketStatus =
  | "open" | "assigned" | "in_progress" | "waiting_user" | "resolved" | "closed";
export const TICKET_STATUS_LABEL: Record<TicketStatus, string> = {
  open: "Open", assigned: "Assigned", in_progress: "In progress",
  waiting_user: "Waiting for user", resolved: "Resolved", closed: "Closed",
};
export type TicketMessage = {
  id: string; author: "user" | "support"; body: string;
  attachments: string[]; time: number; sending?: boolean; failed?: boolean;
};
export type TicketTimelineEntry = { status: TicketStatus; time: number; note?: string };
export type SupportTicket = {
  id: string; number: string; category: string; subcategory?: string;
  subject: string; description: string; attachments: string[];
  contactMethod: "in_app" | "email" | "call";
  relatedListing?: string; relatedStore?: string; relatedCampaign?: string; relatedPayment?: string;
  status: TicketStatus; createdAt: number; updatedAt: number;
  messages: TicketMessage[]; timeline: TicketTimelineEntry[];
  resolution?: string;
};

const DEFAULT_TICKETS: SupportTicket[] = [
  {
    id: "T1", number: "OMS-240718-001", category: "Selling",
    subject: "Listing rejected after image update",
    description: "My listing was rejected after I updated the images with better lighting. Please review the images and clarify what is not allowed.",
    attachments: [], contactMethod: "in_app",
    status: "in_progress", createdAt: new Date("2026-07-18").getTime(), updatedAt: Date.now() - 6 * 3600000,
    messages: [
      { id: "m1", author: "user", body: "Please review my updated listing images.", attachments: [], time: new Date("2026-07-18T10:15:00").getTime() },
      { id: "m2", author: "support", body: "Thanks for reaching out. We are reviewing your listing images and will update within 24 hours.", attachments: [], time: new Date("2026-07-18T14:30:00").getTime() },
    ],
    timeline: [
      { status: "open", time: new Date("2026-07-18T10:15:00").getTime() },
      { status: "assigned", time: new Date("2026-07-18T12:00:00").getTime() },
      { status: "in_progress", time: new Date("2026-07-18T14:30:00").getTime(), note: "Under review by trust team" },
    ],
  },
  {
    id: "T2", number: "OMS-240719-002", category: "Payments",
    subject: "Promotion payment deducted twice",
    description: "My promotion was paid twice today. Please refund the duplicate amount to my Omeetso Wallet.",
    attachments: [], contactMethod: "in_app",
    status: "waiting_user", createdAt: new Date("2026-07-19").getTime(), updatedAt: Date.now() - 12 * 3600000,
    messages: [
      { id: "m1", author: "user", body: "Please refund the duplicate amount.", attachments: [], time: new Date("2026-07-19T09:00:00").getTime() },
      { id: "m2", author: "support", body: "Could you share the two transaction reference numbers so we can verify?", attachments: [], time: new Date("2026-07-19T11:00:00").getTime() },
    ],
    timeline: [
      { status: "open", time: new Date("2026-07-19T09:00:00").getTime() },
      { status: "waiting_user", time: new Date("2026-07-19T11:00:00").getTime(), note: "Waiting for user to share transaction references" },
    ],
  },
  {
    id: "T3", number: "OMS-240720-003", category: "Stores",
    subject: "Unable to update store working hours",
    description: "The working hours form does not save for Sunday.",
    attachments: [], contactMethod: "in_app",
    status: "resolved", createdAt: new Date("2026-07-20").getTime(), updatedAt: new Date("2026-07-21T15:00:00").getTime(),
    messages: [
      { id: "m1", author: "user", body: "Sunday hours won't save.", attachments: [], time: new Date("2026-07-20T10:00:00").getTime() },
      { id: "m2", author: "support", body: "We have applied a fix. Please try updating your Sunday hours now.", attachments: [], time: new Date("2026-07-21T15:00:00").getTime() },
    ],
    timeline: [
      { status: "open", time: new Date("2026-07-20T10:00:00").getTime() },
      { status: "in_progress", time: new Date("2026-07-20T14:00:00").getTime() },
      { status: "resolved", time: new Date("2026-07-21T15:00:00").getTime(), note: "Fix deployed" },
    ],
    resolution: "Applied fix to Sunday hour saving. If the issue recurs please reopen the ticket.",
  },
];

export function listTickets(): SupportTicket[] {
  const stored = read<SupportTicket[] | null>(AK.supportTickets, null);
  if (stored && stored.length) return stored;
  write(AK.supportTickets, DEFAULT_TICKETS);
  return DEFAULT_TICKETS;
}
export const getTicket = (id: string) => listTickets().find((t) => t.id === id);
export function createTicket(t: Omit<SupportTicket, "id" | "number" | "createdAt" | "updatedAt" | "messages" | "timeline" | "status">): SupportTicket {
  const id = newId("T");
  const now = Date.now();
  const num = `OMS-${new Date().toISOString().slice(2, 10).replace(/-/g, "")}-${String(listTickets().length + 1).padStart(3, "0")}`;
  const rec: SupportTicket = {
    ...t, id, number: num, status: "open",
    createdAt: now, updatedAt: now,
    messages: [{ id: "m0", author: "user", body: t.description, attachments: t.attachments, time: now }],
    timeline: [{ status: "open", time: now }],
  };
  write(AK.supportTickets, [rec, ...listTickets()]);
  return rec;
}
export function replyTicket(id: string, body: string, attachments: string[] = []) {
  const list = listTickets();
  const idx = list.findIndex((t) => t.id === id);
  if (idx < 0) return;
  const now = Date.now();
  const msg: TicketMessage = { id: newId("M"), author: "user", body, attachments, time: now };
  const updated: SupportTicket = { ...list[idx], messages: [...list[idx].messages, msg], updatedAt: now,
    status: list[idx].status === "waiting_user" ? "in_progress" : list[idx].status,
    timeline: list[idx].status === "waiting_user"
      ? [...list[idx].timeline, { status: "in_progress", time: now, note: "User replied" }]
      : list[idx].timeline };
  list[idx] = updated;
  write(AK.supportTickets, list);
  // Mock support autoreply after short delay handled by caller if needed
}
export function setTicketStatus(id: string, status: TicketStatus, note?: string) {
  const list = listTickets();
  const idx = list.findIndex((t) => t.id === id);
  if (idx < 0) return;
  list[idx] = { ...list[idx], status, updatedAt: Date.now(), timeline: [...list[idx].timeline, { status, time: Date.now(), note }] };
  write(AK.supportTickets, list);
}

// ============== Reviews & ratings ==============
export type ReviewKind = "buyer" | "seller" | "store";
export type ReviewModeration = "published" | "under_review" | "hidden" | "removed" | "edited";
export type Review = {
  id: string; kind: ReviewKind; targetId: string; targetName: string;
  reviewerName: string; overall: number; categories: Record<string, number>;
  comment: string; privateFeedback?: string; productRef?: string;
  createdAt: number; verified: boolean; helpful: number;
  moderation: ReviewModeration; moderationNote?: string;
  reports?: { reason: string; time: number }[];
};
const DEFAULT_REVIEWS: Review[] = [
  { id: "R1", kind: "seller", targetId: "u1", targetName: "Ramesh Kumar", reviewerName: "Sanjay P.",
    overall: 5, categories: { communication: 5, product_accuracy: 5, behaviour: 5, punctuality: 4 },
    comment: "Great seller, product exactly as described. Would buy again.", createdAt: Date.now() - 5 * 86400000,
    verified: true, helpful: 4, moderation: "published" },
  { id: "R2", kind: "store", targetId: "st1", targetName: "Satish Electronics", reviewerName: "Priya M.",
    overall: 4, categories: { product_quality: 4, service: 5, communication: 4, store_accuracy: 4, delivery: 4 },
    comment: "Good service, honest team. Store easy to find.", createdAt: Date.now() - 10 * 86400000,
    verified: true, helpful: 12, moderation: "published" },
  { id: "R3", kind: "buyer", targetId: "u2", targetName: "Sanjay P.", reviewerName: "Akhil Reddy",
    overall: 5, categories: { communication: 5, punctuality: 5, behaviour: 5, transaction: 5 },
    comment: "Prompt and polite. Meeting was quick and safe.", createdAt: Date.now() - 3 * 86400000,
    verified: true, helpful: 2, moderation: "published" },
];
export function listReviews(): Review[] {
  const stored = read<Review[] | null>(AK.reviews, null);
  if (stored && stored.length) return stored;
  write(AK.reviews, DEFAULT_REVIEWS);
  return DEFAULT_REVIEWS;
}
export const getReview = (id: string) => listReviews().find((r) => r.id === id);
export function addReview(r: Omit<Review, "id" | "createdAt" | "helpful" | "moderation" | "verified">): Review {
  const rec: Review = { ...r, id: newId("R"), createdAt: Date.now(), helpful: 0, moderation: "published", verified: true };
  write(AK.reviews, [rec, ...listReviews()]);
  return rec;
}
export function reportReview(id: string, reason: string) {
  const list = listReviews();
  const idx = list.findIndex((r) => r.id === id);
  if (idx < 0) return;
  const cur = list[idx];
  list[idx] = { ...cur, moderation: "under_review", reports: [...(cur.reports ?? []), { reason, time: Date.now() }] };
  write(AK.reviews, list);
}
export function markReviewHelpful(id: string) {
  const list = listReviews();
  const idx = list.findIndex((r) => r.id === id);
  if (idx < 0) return;
  list[idx] = { ...list[idx], helpful: list[idx].helpful + 1 };
  write(AK.reviews, list);
}
export function computeBreakdown(kind?: ReviewKind, targetId?: string) {
  const items = listReviews().filter((r) =>
    r.moderation === "published" && (!kind || r.kind === kind) && (!targetId || r.targetId === targetId));
  const total = items.length;
  const avg = total === 0 ? 0 : items.reduce((s, r) => s + r.overall, 0) / total;
  const dist = [5, 4, 3, 2, 1].map((star) => ({ star, pct: total === 0 ? 0 : Math.round(items.filter((r) => Math.round(r.overall) === star).length / total * 100) }));
  const catAvg: Record<string, number> = {};
  items.forEach((r) => Object.entries(r.categories).forEach(([k, v]) => { catAvg[k] = (catAvg[k] ?? 0) + v; }));
  Object.keys(catAvg).forEach((k) => catAvg[k] = +(catAvg[k] / total).toFixed(1));
  return { total, avg: +avg.toFixed(1), dist, catAvg };
}

// ============== Account status ==============
export type AccountStatus = "active" | "deactivated" | "pending_deletion";
export const getAccountStatus = (): AccountStatus => read<AccountStatus>(AK.accountStatus, "active");
export const setAccountStatus = (s: AccountStatus) => write(AK.accountStatus, s);

// ============== Meeting places ==============
export type MeetPlace = { id: string; name: string; area: string; note?: string };
export const listMeetPlaces = (): MeetPlace[] =>
  read<MeetPlace[]>(AK.meetPlaces, [
    { id: "MP1", name: "GVK One Mall", area: "Banjara Hills", note: "Well-lit, security available" },
    { id: "MP2", name: "Inorbit Mall", area: "Madhapur", note: "Weekend evenings safe" },
    { id: "MP3", name: "Nehru Zoological Park entrance", area: "Bahadurpura" },
  ]);
export const addMeetPlace = (m: Omit<MeetPlace, "id">) =>
  write(AK.meetPlaces, [{ ...m, id: newId("MP") }, ...listMeetPlaces()]);
export const deleteMeetPlace = (id: string) =>
  write(AK.meetPlaces, listMeetPlaces().filter((x) => x.id !== id));

// ============== Help recent ==============
export const listHelpRecent = (): string[] => read<string[]>(AK.helpRecent, []);
export const addHelpRecent = (q: string) => {
  const trimmed = q.trim();
  if (!trimmed) return;
  const cur = listHelpRecent().filter((x) => x !== trimmed);
  write(AK.helpRecent, [trimmed, ...cur].slice(0, 6));
};
export const clearHelpRecent = () => write(AK.helpRecent, []);

// ============== Logout ==============
export function logoutMock() {
  if (typeof window === "undefined") return;
  const preserve = ["omeetso_language", "omeetso_appearance"];
  const keep: Record<string, string> = {};
  preserve.forEach((k) => { const v = localStorage.getItem(k); if (v) keep[k] = v; });
  // Only clear auth-relevant keys
  ["omeetso_user", "omeetso_profile", "omeetso_profile_data", "omeetso_business_profile"].forEach((k) => localStorage.removeItem(k));
  preserve.forEach((k) => { if (keep[k]) localStorage.setItem(k, keep[k]); });
  emit();
}
