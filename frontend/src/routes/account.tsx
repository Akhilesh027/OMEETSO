import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { LocationTopBar } from "@/components/omeetso/TopBar";
import { BottomNav } from "@/components/omeetso/BottomNav";
import {
  Package, Heart, Bell, Wallet, Megaphone, Store, ShieldCheck, HelpCircle, Settings,
  LogOut, ChevronRight, User, FileText, Eye, CreditCard, Receipt, Gift, PieChart, BadgeCheck,
  Users, Flag, Lock, LifeBuoy, MessagesSquare, HandCoins, CheckCircle, Star, X, Camera,
  Wrench, Briefcase, Plus, Calendar, Building
} from "lucide-react";
import {
  getProfile, setProfile, completionPct, unreadCount, subscribeAccount,
  getBusinessProfile, getVerifications, getTrustScore, logoutMock
} from "@/lib/account";
import { SectionTitle, MenuGroup, MenuRow, Stat, VerifBadge, ConfirmModal } from "@/components/omeetso/account";
import { toast } from "sonner";

import { getUserAccessToken, refreshUserSession } from "@/api/auth.api";
import { listListings, fetchLiveUserListings, type Listing } from "@/lib/listings";
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

    const u = subscribeAccount(() => setTick((n) => n + 1));
    return () => { u(); };
  }, []);

  const p = getProfile();
  const biz = getBusinessProfile();
  const businessEnabled = p.businessEnabled || p.accountType === "business" || !!biz.legalName;
  const pct = completionPct(p);
  const verifs = getVerifications();
  const anyVerified = verifs.mobile.status === "verified" || verifs.identity.status === "verified";
  const unread = unreadCount();

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

  const sectionLinks = [
    { id: "overview", label: "Overview", icon: User },
    { id: "selling", label: "Selling", icon: Package },
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
                    <button onClick={() => setIsEditModalOpen(true)} className="font-bold text-primary">Complete now</button>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full gradient-brand" style={{ width: `${pct}%` }} aria-label={`Profile ${pct}% complete`} />
                  </div>
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
                      ) : verifs.mobile?.status === "verified" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-500/30">
                          📱 Phone Verified (+35 Pts)
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
                  className="shrink-0 text-xs font-bold text-white bg-indigo-brand px-3.5 py-2 rounded-xl hover:opacity-90 transition-opacity"
                >
                  {verifs.identity.status === "verified" ? "View Score" : "Verify ID →"}
                </Link>
              </div>
            </section>

            {/* Desktop Active Tab View / Mobile Full View */}
            <div className="mt-5 space-y-4 px-4 md:px-0">
              {/* SELLING SECTION */}
              {(activeTab === "overview" || activeTab === "selling") && (
                <section id="selling" className="space-y-3">
                  <SectionTitle>Selling</SectionTitle>
                  <MenuGroup>
                    <MenuRow icon={Package} label="My Listings" to="/listings" />
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
                    <MenuRow icon={Briefcase} label="My Job Applications" to="/my/jobs" />
                    <MenuRow icon={Building} label="Employer Job Management" to="/my/employer-jobs" />
                    <MenuRow icon={Plus} label="Post a Job Opening" to="/jobs/new" />
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
          onConfirm={() => { logoutMock(); toast.success("Logged out"); nav({ to: "/login" }); }} />

        <EditProfileModal
          open={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          profile={p}
          onSaved={() => setTick((n) => n + 1)}
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
  const [avatar, setAvatar] = useState(profile.avatar || "");
  const [gender, setGender] = useState<"male" | "female" | "other">("male");
  const [saving, setSaving] = useState(false);

  const GENDER_AVATARS = {
    male: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=80",
    female: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200&q=80",
    other: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80"
  };

  const currentAvatar = avatar || GENDER_AVATARS[gender];

  useEffect(() => {
    setName(profile.name || "");
    setEmail(profile.email || "");
    setCity(profile.city || "Hyderabad");
    setArea(profile.area || "Madhapur");
    setPincode(profile.pincode || "500081");
    setBio(profile.bio || "");
    setAvatar(profile.avatar || "");
  }, [profile, open]);

  if (!open) return null;

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const canSave = name.trim().length >= 2 && emailValid && pincode.length === 6;

  const pickAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    try {
      const url = await uploadImageToCloudinary(f, "profile");
      setAvatar(url);
    } catch {
      const r = new FileReader(); r.onload = () => setAvatar(String(r.result)); r.readAsDataURL(f);
    }
  };

  const save = async () => {
    if (!canSave) {
      if (!emailValid) toast.error("Valid mandatory email is required");
      else toast.error("Please fill in required profile details");
      return;
    }
    setSaving(true);
    const finalAvatar = currentAvatar;
    const token = typeof window !== "undefined" ? (getUserAccessToken() || localStorage.getItem("omeetso_user_token")) : null;

    if (token) {
      try {
        const res = await fetch("https://api.omeetso.in/api/v1/users/me", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
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

    setProfile({ name: name.trim(), email: email.trim(), city, pincode, area, bio, avatar: finalAvatar });

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
              <img src={currentAvatar} alt="Profile" className="h-20 w-20 rounded-full object-cover border-4 border-card shadow-md" />
              <span className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full bg-navy text-white shadow">
                <Camera className="h-3.5 w-3.5" />
              </span>
              <input type="file" accept="image/*" className="hidden" onChange={pickAvatar} />
            </label>
            <div className="mt-2 flex items-center gap-1.5">
              {(["male", "female", "other"] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize transition-all ${gender === g ? "bg-navy text-white shadow-sm" : "bg-secondary text-muted-foreground"
                    }`}
                >
                  {g}
                </button>
              ))}
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
            <label className="text-xs font-semibold text-muted-foreground">Email Address (Mandatory) *</label>
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
// Silence unused var warnings on some sections
void MessagesSquare;
