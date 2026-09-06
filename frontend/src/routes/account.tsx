import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { LocationTopBar } from "@/components/omeetso/TopBar";
import { BottomNav } from "@/components/omeetso/BottomNav";
import {
  Package, Heart, Bell, Wallet, Megaphone, Store, ShieldCheck, HelpCircle, Settings,
  LogOut, ChevronRight, User, FileText, Eye, CreditCard, Receipt, Gift, PieChart, BadgeCheck,
  Users, Flag, Lock, LifeBuoy, MessagesSquare, HandCoins, CheckCircle, Star, X, Camera,
  Wrench, Briefcase, Plus, Calendar, Building, ArrowRight, Mail, IdCard, MapPin, Smartphone, Sparkles,
  Radio, BellRing
} from "lucide-react";
import {
  getProfile, setProfile, completionPct, unreadCount, subscribeAccount,
  getBusinessProfile, getVerifications, getTrustScore, logout, logoutMock, DEFAULT_AVATARS,
  listNearbyChangesNotifications, pushNotification
} from "@/lib/account";
import { SectionTitle, MenuGroup, MenuRow, Stat, VerifBadge, ConfirmModal } from "@/components/omeetso/account";
import { toast } from "sonner";

import { getUserAccessToken, refreshUserSession } from "@/api/auth.api";
import { listListings, fetchLiveUserListings, type Listing, toggleListingNearbyChanges } from "@/lib/listings";
import { uploadImageToCloudinary } from "@/lib/upload";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Account — Omeetso" },
      { name: "description", content: "Manage your Omeetso profile, verification, notifications, privacy, safety and support." },
    ]
  }),
  component: Account,
});

function Account() {
  const nav = useNavigate();
  const [, setTick] = useState(0);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(true);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showNearbyModal, setShowNearbyModal] = useState(false);
  const [myListings, setMyListings] = useState<Listing[]>([]);

  useEffect(() => {
    const token = typeof window !== "undefined" ? (getUserAccessToken() || localStorage.getItem("omeetso_user_token")) : null;
    if (!token) {
      setAuthenticated(false);
      setLoading(false);
      return;
    }
    fetch("https://api.omeetso.in/api/v1/users/me", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async (res) => {
        if (!res.ok) {
          const refRes = await refreshUserSession();
          if (refRes.success && refRes.data) {
            setAuthenticated(true);
            setLoading(false);
            return null;
          }
          const localU = localStorage.getItem("omeetso_user");
          if (localU) {
            setAuthenticated(true);
            setLoading(false);
            return null;
          }
          localStorage.removeItem("omeetso_user_token");
          localStorage.removeItem("omeetso_user");
          setAuthenticated(false);
          setLoading(false);
          return null;
        }
        return res.json();
      })
      .then((json) => {
        if (json && json.success && json.data) {
          setAuthenticated(true);
          localStorage.setItem("omeetso_user", JSON.stringify(json.data));
          fetchLiveUserListings().then((userItems) => setMyListings(userItems));
        }
        setLoading(false);
      })
      .catch(() => {
        const localU = typeof localStorage !== "undefined" ? localStorage.getItem("omeetso_user") : null;
        setAuthenticated(!!localU);
        setLoading(false);
      });

    const syncVerifs = () => setTick((n) => n + 1);
    const syncAuth = () => {
      const token = typeof window !== "undefined" ? (getUserAccessToken() || localStorage.getItem("omeetso_user_token")) : null;
      if (!token) setAuthenticated(false);
      setTick((n) => n + 1);
    };
    const u = subscribeAccount(syncVerifs);
    window.addEventListener("storage", syncAuth);
    window.addEventListener("focus", syncVerifs);
    window.addEventListener("visibilitychange", syncVerifs);
    window.addEventListener("omeetso_verification_updated", syncVerifs);
    window.addEventListener("omeetso_auth_changed", syncAuth);
    window.addEventListener("omeetso_notifications_changed", syncVerifs);
    return () => {
      u();
      window.removeEventListener("storage", syncAuth);
      window.removeEventListener("focus", syncVerifs);
      window.removeEventListener("visibilitychange", syncVerifs);
      window.removeEventListener("omeetso_verification_updated", syncVerifs);
      window.removeEventListener("omeetso_auth_changed", syncAuth);
      window.removeEventListener("omeetso_notifications_changed", syncVerifs);
    };
  }, []);

  const p = getProfile();
  const biz = getBusinessProfile();
  const businessEnabled = p.businessEnabled || p.accountType === "business" || !!biz.legalName;
  const pct = completionPct(p);
  const verifs = getVerifications();
  const anyVerified = verifs.mobile.status === "verified" || verifs.identity.status === "verified";
  const unread = unreadCount();

  const isEmailVerified = Boolean(p.emailVerified || (verifs.email?.status === "verified" && verifs.email?.verifiedViaOtp));
  const isIdentityVerified = verifs.identity?.status === "verified";
  const isAddressVerified = verifs.address?.status === "verified";
  const isMobileVerified = Boolean(p.mobileVerified || verifs.mobile?.status === "verified");

  const pendingVerificationSteps: { type: string; label: string; icon: any; points: number }[] = [];
  if (!isEmailVerified) {
    pendingVerificationSteps.push({ type: "email", label: "Gmail OTP Verification", icon: Mail, points: 15 });
  }
  if (!isIdentityVerified) {
    pendingVerificationSteps.push({ type: "identity", label: "Government ID eKYC", icon: IdCard, points: 35 });
  }
  if (!isAddressVerified) {
    pendingVerificationSteps.push({ type: "address", label: "Address Proof", icon: MapPin, points: 15 });
  }
  if (!isMobileVerified) {
    pendingVerificationSteps.push({ type: "mobile", label: "Mobile Verification", icon: Smartphone, points: 35 });
  }

  const handleCompleteNow = () => {
    if (pendingVerificationSteps.length > 0) {
      // Redirect directly to the primary pending verification step (e.g. Gmail OTP, eKYC)
      nav({
        to: "/verification/$type",
        params: { type: pendingVerificationSteps[0].type },
      });
    } else if (!p.bio) {
      setIsEditModalOpen(true);
    } else {
      nav({ to: "/verification" });
    }
  };

  if (!loading && !authenticated) {
    return (
      <MobileFrame>
        <div className="min-h-dvh bg-background pb-28 md:pb-12">
          <LocationTopBar />
          <div className="px-6 py-16 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary">
              <User className="h-8 w-8" />
            </div>
            <h1 className="mt-4 text-xl font-bold">Sign in to your account</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your session has expired or you are not signed in. Please sign in to view your profile, manage listings, and update your account details.
            </p>
            <button
              onClick={() => nav({ to: "/login" })}
              className="mt-6 inline-flex w-full max-w-xs items-center justify-center rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow"
            >
              Sign in to Omeetso
            </button>
          </div>
          <BottomNav />
        </div>
      </MobileFrame>
    );
  }

  const activeCount = myListings.filter((l) => l.status === "active" || l.status === "approved" || l.status === "APPROVED").length;
  const soldCount = myListings.filter((l) => l.status === "sold" || l.status === "SOLD").length;
  const savedCount = typeof window !== "undefined" ? (() => { try { return JSON.parse(localStorage.getItem("omeetso_saved_items") || "[]").length; } catch { return 0; } })() : 0;
  const reviewsCount = 0;

  const nearbyChangesListings = myListings.filter((l) => l.nearbyChanges?.enabled);
  const nearbyNotifs = listNearbyChangesNotifications();

  const sectionLinks = [
    { id: "overview", label: "Overview", icon: User },
    { id: "selling", label: "Selling", icon: Package },
    { id: "nearby", label: "Nearby Changes", icon: Radio },
    { id: "services-vertical", label: "Services & Pros", icon: Wrench },
    { id: "jobs-vertical", label: "Jobs & Careers", icon: Briefcase },
    { id: "promotions", label: "Promotions & Ads", icon: Megaphone, to: "/promotions" },
    { id: "buying", label: "Buying", icon: Heart },
    ...(businessEnabled ? [{ id: "business", label: "Business", icon: Store }] : []),
    { id: "payments", label: "Payments", icon: Wallet },
    { id: "account-settings", label: "Account", icon: Settings },
    { id: "help-safety", label: "Help & Safety", icon: ShieldCheck },
  ];

  const scrollTo = (id: string) => {
    setActiveTab(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-28 md:pb-12">
        <LocationTopBar />

        <div className="md:mx-auto md:max-w-[1100px] md:grid md:grid-cols-[250px_1fr] md:gap-8 md:px-6 md:pt-6">
          {/* Desktop left nav */}
          <aside className="hidden md:block">
            <div className="sticky top-20 rounded-2xl border border-border bg-card p-3 shadow-sm">
              <div className="mb-3 flex items-center gap-3 px-1">
                {p.avatar ? (
                  <img src={p.avatar} alt="" className="h-10 w-10 rounded-full object-cover border border-border" />
                ) : (
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-secondary text-foreground font-bold">
                    {p.name ? p.name[0].toUpperCase() : "U"}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{p.name}</p>
                  <p className="truncate text-[11px] text-muted-foreground capitalize">{p.accountType} {p.accountType === "individual" ? "Seller" : "Owner"}</p>
                </div>
              </div>
              <nav className="flex flex-col gap-1">
                {sectionLinks.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      if (s.to) {
                        nav({ to: s.to as any });
                      } else {
                        setActiveTab(s.id);
                      }
                    }}
                    className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[13px] font-semibold transition-all ${activeTab === s.id
                      ? "bg-navy text-white shadow-sm"
                      : "text-foreground/80 hover:bg-secondary hover:text-foreground"
                      }`}
                  >
                    <s.icon className={`h-4 w-4 ${activeTab === s.id ? "text-white" : "text-muted-foreground"}`} /> {s.label}
                  </button>
                ))}
                <div className="my-2 h-px bg-border" />
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[13px] font-semibold text-foreground/80 hover:bg-secondary"
                >
                  <User className="h-4 w-4 text-muted-foreground" /> Edit profile
                </button>
                <button
                  onClick={() => setConfirmLogout(true)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[13px] font-semibold text-rose-700 hover:bg-rose-50"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </nav>
            </div>
          </aside>

          {/* Right content - Desktop Dynamic Active Tab View / Mobile Full View */}
          <div>
            {/* Top Profile Summary (Always Visible at Top of Desktop) */}
            <section id="overview">
              <div className="-mt-6 mx-4 rounded-2xl bg-card p-4 card-elev md:mx-0 md:mt-0">
                <div className="flex items-start gap-3">
                  {p.avatar ? (
                    <img src={p.avatar} alt={`${p.name} profile picture`} className="h-14 w-14 rounded-full object-cover md:h-16 md:w-16 border border-border" />
                  ) : (
                    <div className="grid h-14 w-14 place-items-center rounded-full bg-navy text-white text-xl font-bold md:h-16 md:w-16">
                      {p.name ? p.name[0].toUpperCase() : "U"}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-bold md:text-lg">{p.name}</p>
                    {p.email && <p className="truncate text-xs text-muted-foreground">{p.email}</p>}
                    {p.mobile && <p className="truncate text-xs text-muted-foreground">{p.mobile}</p>}
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      {anyVerified && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700"><BadgeCheck className="h-3 w-3" /> Verified</span>}
                      <span className="text-[11px] text-muted-foreground">Member since {new Date(p.memberSince).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</span>
                    </div>
                  </div>
                  <button onClick={() => setIsEditModalOpen(true)} aria-label="Edit profile" className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-secondary md:hidden">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <button onClick={() => setIsEditModalOpen(true)} className="hidden md:inline-flex rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold hover:bg-secondary">Edit profile</button>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold">Profile {pct}% complete</span>
                    {pct < 100 && (
                      <button
                        type="button"
                        onClick={handleCompleteNow}
                        className="font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                        title="Proceed directly to pending verification steps"
                      >
                        <span>Complete now</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full gradient-brand" style={{ width: `${pct}%` }} aria-label={`Profile ${pct}% complete`} />
                  </div>

                  {pendingVerificationSteps.length > 0 ? (
                    <div className="mt-2.5 pt-2 border-t border-border/50">
                      <div className="flex items-center justify-between text-[11px] mb-1.5">
                        <span className="text-muted-foreground font-semibold flex items-center gap-1">
                          <Sparkles className="h-3 w-3 text-amber-500" /> Required verification steps:
                        </span>
                        <span className="text-[10px] text-indigo-brand font-bold">
                          +{pendingVerificationSteps.reduce((sum, it) => sum + it.points, 0)} trust pts
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {pendingVerificationSteps.map((step) => {
                          const IconComponent = step.icon;
                          return (
                            <Link
                              key={step.type}
                              to="/verification/$type"
                              params={{ type: step.type }}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-secondary/80 hover:bg-secondary border border-border/80 text-foreground transition-all hover:border-indigo-brand/40 shadow-xs"
                            >
                              <IconComponent className="h-3 w-3 text-indigo-brand shrink-0" />
                              <span>{step.label}</span>
                              <span className="text-[9px] font-extrabold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1 rounded">+{step.points}pts</span>
                              <ChevronRight className="h-2.5 w-2.5 text-muted-foreground opacity-60" />
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <BadgeCheck className="h-3.5 w-3.5" /> All required profile verifications completed!
                    </div>
                  )}
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">{p.area}, {p.city}</p>
              </div>

              <div className="mx-4 mt-4 grid grid-cols-4 gap-2.5 md:mx-0">
                <Stat label="Active" value={activeCount} icon={Package} colorClass="bg-indigo-50 text-indigo-600" />
                <Stat label="Sold" value={soldCount} icon={CheckCircle} colorClass="bg-emerald-50 text-emerald-600" />
                <Stat label="Saved" value={savedCount} icon={Heart} colorClass="bg-rose-50 text-rose-600" />
                <Stat label="Reviews" value={reviewsCount} icon={Star} colorClass="bg-amber-50 text-amber-600" />
              </div>

              {/* Trust Score & KYC Verification Banner */}
              <div className="mx-4 mt-4 md:mx-0 p-4 rounded-2xl bg-slate-950 text-white border border-slate-800 shadow-md flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-indigo-500/20 text-emerald-400 border border-indigo-500/30">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black uppercase text-amber-400 tracking-wider">
                        Trust Score: {getTrustScore()} / 100
                      </span>
                      {verifs.identity?.status === "verified" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                          🛡️ ID Verified Seller
                        </span>
                      ) : getTrustScore() > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-500/30">
                          ✓ {getTrustScore()} Pts Earned
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                          ⚠️ Unverified (0 Pts)
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5 truncate">
                      {verifs.identity?.status === "verified"
                        ? "Government ID & Phone Verified Seller"
                        : "Verify phone and upload Govt ID (Aadhaar / PAN) to earn trust score"}
                    </p>
                  </div>
                </div>

                <Link
                  to="/verification"
                  className="group shrink-0 inline-flex items-center gap-1.5 text-xs font-bold text-white bg-indigo-brand px-3.5 py-2 rounded-xl hover:opacity-90 transition-opacity"
                >
                  <span>{verifs.identity?.status === "verified" ? "View Score" : "Verify ID"}</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </section>

            {/* Desktop Active Tab View / Mobile Full View */}
            <div className="mt-5 space-y-4 px-4 md:px-0">
              {/* NEARBY CHANGES & NOTIFICATIONS SECTION */}
              {(activeTab === "overview" || activeTab === "nearby" || activeTab === "selling") && (
                <section id="nearby" className="space-y-3">
                  <div className="flex items-center justify-between">
                    <SectionTitle>Nearby Changes & Local Broadcasts</SectionTitle>
                    <button
                      type="button"
                      onClick={() => setShowNearbyModal(true)}
                      className="text-xs font-bold text-indigo-brand hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <span>Configure Changes</span>
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="rounded-3xl border border-indigo-500/25 bg-card p-4.5 shadow-sm space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-indigo-500/10 text-indigo-brand border border-indigo-500/20">
                          <Radio className="h-5 w-5 animate-pulse text-indigo-brand" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-extrabold text-foreground">Nearby Changes</h4>
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${nearbyChangesListings.length > 0
                              ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                              : "bg-muted text-muted-foreground"
                              }`}>
                              {nearbyChangesListings.length > 0 ? `Active on ${nearbyChangesListings.length} items` : "Inactive"}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Broadcast product updates, delivery radius, and neighborhood price changes to nearby buyers.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowNearbyModal(true)}
                        className="shrink-0 px-3 py-1.5 rounded-xl bg-indigo-brand text-xs font-bold text-white hover:opacity-95 transition-all shadow-xs cursor-pointer"
                      >
                        {nearbyChangesListings.length > 0 ? "Manage" : "+ Enable"}
                      </button>
                    </div>

                    {/* Active products with Nearby Changes */}
                    {nearbyChangesListings.length > 0 && (
                      <div className="space-y-2 pt-1 border-t border-border/60">
                        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                          Active Nearby Broadcasts
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {nearbyChangesListings.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-secondary/40 border border-border"
                            >
                              {item.images?.[0] ? (
                                <img src={item.images[0]} alt="" className="h-10 w-10 rounded-xl object-cover border border-border shrink-0" />
                              ) : (
                                <div className="h-10 w-10 rounded-xl bg-secondary grid place-items-center text-xs font-bold shrink-0">📦</div>
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold truncate">{item.title}</p>
                                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-0.5 flex-wrap">
                                  <span className="font-semibold text-indigo-brand">
                                    📍 {item.nearbyChanges?.radiusKm || 10} km
                                  </span>
                                  <span>•</span>
                                  <span>
                                    {item.nearbyChanges?.deliveryFee ? `₹${item.nearbyChanges.deliveryFee} delivery` : "Free local delivery"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recent Nearby Changes Notifications feed */}
                    <div className="pt-2 border-t border-border/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                          <BellRing className="h-3 w-3 text-indigo-brand" /> Nearby Changes Notifications
                        </span>
                        <Link
                          to="/notifications"
                          className="text-[11px] font-bold text-indigo-brand hover:underline"
                        >
                          View all ({nearbyNotifs.length}) →
                        </Link>
                      </div>

                      {nearbyNotifs.length > 0 ? (
                        <div className="space-y-1.5">
                          {nearbyNotifs.slice(0, 3).map((notif) => (
                            <Link
                              key={notif.id}
                              to={notif.destination || "/notifications"}
                              className="p-2.5 rounded-xl bg-secondary/30 hover:bg-secondary/60 transition-colors border border-border text-xs flex items-center justify-between gap-3"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                {notif.thumbnail && (
                                  <img src={notif.thumbnail} alt="" className="h-9 w-9 rounded-lg object-cover shrink-0 border border-border" />
                                )}
                                <div className="min-w-0">
                                  <p className="font-bold text-foreground text-xs truncate">{notif.title}</p>
                                  <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{notif.body}</p>
                                  <span className="text-[10px] text-muted-foreground/70 mt-0.5 block">
                                    {new Date(notif.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                  </span>
                                </div>
                              </div>
                              {!notif.read && (
                                <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0" />
                              )}
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <div className="p-3 rounded-2xl bg-secondary/20 border border-dashed border-border text-center">
                          <p className="text-xs text-muted-foreground">
                            No recent nearby change alerts. Notifications will appear here when you enable or update nearby terms on your products.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              )}

              {/* SELLING SECTION */}
              {(activeTab === "overview" || activeTab === "selling") && (
                <section id="selling" className="space-y-3">
                  <SectionTitle>Selling</SectionTitle>
                  <MenuGroup>
                    <MenuRow icon={Package} label="My Listings" to="/listings" />
                    <MenuRow
                      icon={Radio}
                      label="Nearby Changes & Broadcasts"
                      right={
                        nearbyChangesListings.length > 0 ? (
                          <span className="rounded-full bg-indigo-500/15 px-2 py-0.5 text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
                            {nearbyChangesListings.length} Active
                          </span>
                        ) : (
                          <span className="text-[11px] text-muted-foreground font-semibold">Enable</span>
                        )
                      }
                      onClick={() => setShowNearbyModal(true)}
                    />
                    <MenuRow icon={Megaphone} label="Promotions & Ads" to="/promotions" />
                    <MenuRow icon={FileText} label="Drafts" to="/sell/drafts" />
                    <MenuRow icon={HandCoins} label="Offers Received" to="/offers" />
                    <MenuRow icon={PieChart} label="Listing Analytics" to="/listings" />
                  </MenuGroup>
                </section>
              )}

              {/* SERVICES VERTICAL SECTION */}
              {(activeTab === "overview" || activeTab === "services-vertical") && (
                <section id="services-vertical" className="space-y-3">
                  <SectionTitle>Services & Home Pros</SectionTitle>
                  <MenuGroup>
                    <MenuRow icon={Calendar} label="My Service Bookings & Inquiries" to="/my/services" />
                    <MenuRow icon={Wrench} label="Service Provider Dashboard" to="/my/provider-services" />
                    <MenuRow icon={Plus} label="List a New Service" to="/services/new" />
                    <MenuRow icon={BadgeCheck} label="Provider KYC & Verification" to="/verification" />
                  </MenuGroup>
                </section>
              )}

              {/* JOBS VERTICAL SECTION */}
              {(activeTab === "overview" || activeTab === "jobs-vertical") && (
                <section id="jobs-vertical" className="space-y-3">
                  <SectionTitle>Jobs & Careers</SectionTitle>
                  <MenuGroup>
                    <MenuRow icon={Briefcase} label="My Applied Jobs" to="/my/jobs" />
                    <MenuRow icon={Building} label="Employer Dashboard (Review Applications)" to="/my/employer/jobs" />
                    <MenuRow icon={Plus} label="Post a Job Opening" to="/jobs/new" />
                    <MenuRow icon={User} label="Candidate Profile & Resume" to="/account/profile/jobs" />
                  </MenuGroup>
                </section>
              )}

              {/* BUYING SECTION */}
              {(activeTab === "overview" || activeTab === "buying") && (
                <section id="buying" className="space-y-3">
                  <SectionTitle>Buying</SectionTitle>
                  <MenuGroup>
                    <MenuRow icon={Heart} label="Saved Products" to="/saved" />
                    <MenuRow icon={Users} label="Following Sellers" to="/following" />
                    <MenuRow icon={Store} label="Saved Stores" to="/stores" />
                    <MenuRow icon={HandCoins} label="Offers Sent" to="/offers" />
                    <MenuRow icon={Eye} label="Recently Viewed" to="/results" />
                  </MenuGroup>
                </section>
              )}

              {/* BUSINESS SECTION */}
              {businessEnabled && (activeTab === "overview" || activeTab === "business") && (
                <section id="business" className="space-y-3">
                  <SectionTitle>Business</SectionTitle>
                  <MenuGroup>
                    <MenuRow icon={Store} label="My Store" to="/stores" />
                    <MenuRow icon={PieChart} label="Store Dashboard" to="/stores" />
                    <MenuRow icon={Package} label="Store Products" to="/stores" />
                    <MenuRow icon={Megaphone} label="Promotions & Ads" to="/promotions" />
                    <MenuRow icon={BadgeCheck} label="Business Verification" to="/verification/$type" params={{ type: "business" }} />
                  </MenuGroup>
                </section>
              )}

              {/* PAYMENTS SECTION */}
              {(activeTab === "overview" || activeTab === "payments") && (
                <section id="payments" className="space-y-3">
                  <SectionTitle>Payments</SectionTitle>
                  <MenuGroup>
                    <MenuRow icon={Wallet} label="Omeetso Wallet" to="/wallet" />
                    <MenuRow icon={CreditCard} label="Transactions" to="/wallet/transactions" />
                    <MenuRow icon={Receipt} label="Invoices" to="/invoices" />
                    <MenuRow icon={Gift} label="Promotional Credits" to="/wallet/credits" />
                  </MenuGroup>
                </section>
              )}

              {/* ACCOUNT SETTINGS SECTION */}
              {(activeTab === "overview" || activeTab === "account-settings") && (
                <section id="account-settings" className="space-y-3">
                  <SectionTitle>Account</SectionTitle>
                  <MenuGroup>
                    <MenuRow icon={User} label="Edit Profile" to="/account/edit" />
                    <MenuRow icon={Eye} label="Public Profile Preview" to="/account/public" />
                    <MenuRow icon={BadgeCheck} label="Verification" to="/verification" />
                    <MenuRow icon={Bell} label="Notifications" to="/notifications" badge={unread > 0 ? unread : undefined} />
                    <MenuRow icon={Settings} label="Settings" to="/settings" />
                    <MenuRow icon={Lock} label="Privacy" to="/settings/privacy" />
                    <MenuRow icon={Users} label="Blocked Users" to="/settings/blocked" />
                  </MenuGroup>
                </section>
              )}

              {/* HELP & SAFETY SECTION */}
              {(activeTab === "overview" || activeTab === "help-safety") && (
                <section id="help-safety" className="space-y-3">
                  <SectionTitle>Help & Safety</SectionTitle>
                  <MenuGroup>
                    <MenuRow icon={ShieldCheck} label="Safety Centre" to="/safety" />
                    <MenuRow icon={HelpCircle} label="Help Centre" to="/help" />
                    <MenuRow icon={LifeBuoy} label="Support Tickets" to="/support" />
                    <MenuRow icon={Flag} label="Report a Problem" to="/safety/report" />
                  </MenuGroup>
                </section>
              )}

              <div className="md:hidden">
                <SectionTitle>Session</SectionTitle>
                <button onClick={() => setConfirmLogout(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3 text-sm font-semibold text-rose-700">
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </div>
              <p className="pb-2 pt-1 text-center text-[11px] text-muted-foreground">Omeetso v1.0 • Buy Nearby. Sell Quickly.</p>
            </div>
          </div>
        </div>

        <BottomNav />

        <ConfirmModal open={confirmLogout} title="Log out of Omeetso?" body="You can sign in again anytime."
          confirmLabel="Log Out" cancelLabel="Stay Logged In" danger
          onCancel={() => setConfirmLogout(false)}
          onConfirm={async () => {
            setConfirmLogout(false);
            await logout();
            setAuthenticated(false);
            toast.success("Logged out successfully");
            nav({ to: "/login" });
          }} />

        <EditProfileModal
          open={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          profile={p}
          onSaved={() => setTick((n) => n + 1)}
        />

        <NearbyChangesModal
          open={showNearbyModal}
          onClose={() => setShowNearbyModal(false)}
          listings={myListings}
          onUpdated={() => {
            setMyListings(listListings());
            setTick((n) => n + 1);
          }}
        />
      </div>
    </MobileFrame>
  );
}

function EditProfileModal({ open, onClose, profile, onSaved }: { open: boolean; onClose: () => void; profile: any; onSaved: () => void }) {
  const [name, setName] = useState(profile.name || "");
  const [email, setEmail] = useState(profile.email || "");
  const [city, setCity] = useState(profile.city || "Hyderabad");
  const [area, setArea] = useState(profile.area || "Madhapur");
  const [pincode, setPincode] = useState(profile.pincode || "500081");
  const [bio, setBio] = useState(profile.bio || "");
  const [avatar, setAvatar] = useState(profile.avatar || DEFAULT_AVATARS.male);
  const [gender, setGender] = useState<"male" | "female" | "other">(
    profile.avatar?.includes("494790108377") ? "female" : "male"
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(profile.name || "");
    setEmail(profile.email || "");
    setCity(profile.city || "Hyderabad");
    setArea(profile.area || "Madhapur");
    setPincode(profile.pincode || "500081");
    setBio(profile.bio || "");
    const initialAvatar = profile.avatar || DEFAULT_AVATARS.male;
    setAvatar(initialAvatar);
    if (initialAvatar.includes("494790108377")) {
      setGender("female");
    } else if (initialAvatar.includes("1535713875002")) {
      setGender("male");
    } else {
      setGender("other");
    }
  }, [profile, open]);

  if (!open) return null;

  const emailTrimmed = email.trim();
  const emailValid = !emailTrimmed || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed);
  const canSave = name.trim().length >= 2 && emailValid && pincode.length === 6;

  const handleSelectGender = (g: "male" | "female" | "other") => {
    setGender(g);
    setAvatar(DEFAULT_AVATARS[g]);
  };

  const pickAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    try {
      const url = await uploadImageToCloudinary(f, "profile");
      setAvatar(url);
      setGender("other");
      toast.success("Profile photo uploaded!");
    } catch {
      const r = new FileReader();
      r.onload = () => {
        setAvatar(String(r.result));
        setGender("other");
      };
      r.readAsDataURL(f);
    }
  };

  const save = async () => {
    if (!canSave) {
      if (!emailValid) toast.error("Please enter a valid email address");
      else toast.error("Please fill in required profile details");
      return;
    }
    setSaving(true);
    const finalAvatar = avatar || DEFAULT_AVATARS[gender];
    const token = typeof window !== "undefined" ? (getUserAccessToken() || localStorage.getItem("omeetso_user_token")) : null;

    if (token) {
      try {
        const res = await fetch(`${API_BASE}/users/me`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            name: name.trim(),
            email: emailTrimmed || undefined,
            city,
            pincode,
            area,
            bio,
            avatar: finalAvatar
          })
        });
        const resJson = await res.json();
        if (resJson.success && resJson.data) {
          localStorage.setItem("omeetso_user", JSON.stringify(resJson.data));
        }
      } catch (err) {
        console.warn("Backend profile update error:", err);
      }
    }

    setProfile({ name: name.trim(), email: emailTrimmed, city, pincode, area, bio, avatar: finalAvatar });

    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("omeetso_user");
        if (raw) {
          const u = JSON.parse(raw);
          if (!u.profile) u.profile = {};
          u.profile.avatar = finalAvatar;
          u.avatar = finalAvatar;
          localStorage.setItem("omeetso_user", JSON.stringify(u));
        }
      } catch { }
    }

    setSaving(false);
    toast.success("Profile updated successfully");
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-card p-6 shadow-2xl border border-border max-h-[90vh] overflow-y-auto no-scrollbar">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <h2 className="text-lg font-bold">Edit Profile</h2>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full bg-secondary text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div className="flex flex-col items-center">
            <label className="relative cursor-pointer">
              <img src={avatar || DEFAULT_AVATARS[gender]} alt="Profile" className="h-20 w-20 rounded-full object-cover border-4 border-card shadow-md" />
              <span className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full bg-navy text-white shadow">
                <Camera className="h-3.5 w-3.5" />
              </span>
              <input type="file" accept="image/*" className="hidden" onChange={pickAvatar} />
            </label>
            <p className="mt-1 text-[11px] text-muted-foreground">Click camera to upload custom photo</p>
            <div className="mt-2.5 flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSelectGender("male")}
                className={`rounded-full px-3 py-1 text-xs font-bold transition-all cursor-pointer ${(gender === "male" || avatar === DEFAULT_AVATARS.male)
                  ? "bg-navy text-white shadow-sm ring-2 ring-primary/30"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                  }`}
              >
                Male Avatar
              </button>
              <button
                type="button"
                onClick={() => handleSelectGender("female")}
                className={`rounded-full px-3 py-1 text-xs font-bold transition-all cursor-pointer ${(gender === "female" || avatar === DEFAULT_AVATARS.female)
                  ? "bg-navy text-white shadow-sm ring-2 ring-primary/30"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                  }`}
              >
                Female Avatar
              </button>
              <button
                type="button"
                onClick={() => handleSelectGender("other")}
                className={`rounded-full px-3 py-1 text-xs font-bold transition-all cursor-pointer ${(gender === "other" && avatar !== DEFAULT_AVATARS.male && avatar !== DEFAULT_AVATARS.female)
                  ? "bg-navy text-white shadow-sm ring-2 ring-primary/30"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                  }`}
              >
                Neutral
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground">Full Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium outline-none focus:border-primary"
              placeholder="e.g. Ravi Kumar"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground">Email Address</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium outline-none focus:border-primary"
              placeholder="you@example.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">City</label>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Area</label>
              <input
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground">Pincode *</label>
            <input
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground">Bio</label>
            <textarea
              value={bio}
              rows={2}
              onChange={(e) => setBio(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium outline-none focus:border-primary"
              placeholder="Tell buyers and sellers a bit about yourself..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 rounded-2xl border border-border py-2.5 text-xs font-bold text-muted-foreground hover:bg-secondary"
            >
              Cancel
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="flex-1 rounded-2xl bg-navy py-2.5 text-xs font-bold text-white shadow hover:bg-navy/90"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function NearbyChangesModal({
  open,
  onClose,
  listings,
  onUpdated,
}: {
  open: boolean;
  onClose: () => void;
  listings: Listing[];
  onUpdated: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-card p-5 border border-border shadow-2xl max-h-[85vh] flex flex-col space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-indigo-brand animate-pulse" />
            <div>
              <h3 className="text-base font-extrabold text-foreground">Nearby Changes & Broadcasts</h3>
              <p className="text-xs text-muted-foreground">Manage dynamic neighborhood terms & buyer alerts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-secondary cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto space-y-3 pr-1 max-h-[55vh]">
          {listings.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Package className="h-10 w-10 mx-auto mb-2 opacity-40" />
              <p className="font-bold text-sm text-foreground">No Listings Yet</p>
              <p className="text-xs mt-1">Post a listing via Quick Sell or Detailed Sell to enable Nearby Changes.</p>
            </div>
          ) : (
            listings.map((item) => {
              const isEnabled = item.nearbyChanges?.enabled ?? false;
              const radius = item.nearbyChanges?.radiusKm ?? 10;
              const deliveryFee = item.nearbyChanges?.deliveryFee ?? 0;

              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border transition-all ${isEnabled ? "border-indigo-500/30 bg-indigo-500/5" : "border-border bg-card"
                    }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {item.images?.[0] ? (
                        <img src={item.images[0]} alt="" className="h-11 w-11 rounded-xl object-cover border border-border shrink-0" />
                      ) : (
                        <div className="h-11 w-11 rounded-xl bg-secondary grid place-items-center text-xs shrink-0">📦</div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate text-foreground">{item.title}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {item.area}, {item.city} • ₹{item.price?.toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={(e) => {
                          toggleListingNearbyChanges(item.id, e.target.checked, {
                            radiusKm: radius,
                            deliveryFee: deliveryFee,
                            customNote: `Nearby pickup & delivery in ${item.area}`,
                          });
                          if (e.target.checked) {
                            pushNotification({
                              id: `nearby-${item.id}-${Date.now()}`,
                              category: "nearby_changes",
                              title: `Nearby Changes Enabled: ${item.title}`,
                              body: `Nearby changes now broadcasting within ${radius} km of ${item.area}.`,
                              destination: `/product/${item.id}`,
                              destinationLabel: "View Listing",
                              read: false,
                              thumbnail: item.images?.[0],
                            });
                            toast.success(`Nearby Changes enabled for "${item.title}"`);
                          } else {
                            toast.info(`Nearby Changes disabled for "${item.title}"`);
                          }
                          onUpdated();
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-brand"></div>
                    </label>
                  </div>

                  {isEnabled && (
                    <div className="mt-3 pt-3 border-t border-border/60 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="block text-[10px] font-bold text-muted-foreground mb-1">Broadcast Radius</label>
                        <select
                          value={radius}
                          onChange={(e) => {
                            toggleListingNearbyChanges(item.id, true, {
                              radiusKm: Number(e.target.value),
                              deliveryFee: deliveryFee,
                            });
                            onUpdated();
                            toast.success(`Radius updated to ${e.target.value} km`);
                          }}
                          className="w-full h-8 rounded-xl border border-border bg-background px-2 text-[11px] font-bold outline-none focus:border-indigo-brand cursor-pointer"
                        >
                          <option value={3}>3 km (Local)</option>
                          <option value={5}>5 km</option>
                          <option value={10}>10 km</option>
                          <option value={20}>20 km</option>
                          <option value={35}>35 km</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-muted-foreground mb-1">Delivery Fee (₹)</label>
                        <input
                          type="number"
                          min={0}
                          value={deliveryFee}
                          onChange={(e) => {
                            toggleListingNearbyChanges(item.id, true, {
                              radiusKm: radius,
                              deliveryFee: Math.max(0, Number(e.target.value)),
                            });
                            onUpdated();
                          }}
                          placeholder="0 (Free)"
                          className="w-full h-8 rounded-xl border border-border bg-background px-2 text-[11px] font-bold outline-none focus:border-indigo-brand"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="pt-2 border-t border-border flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-indigo-brand text-xs font-bold text-white shadow hover:opacity-95 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// Silence unused var warnings on some sections
void MessagesSquare;
