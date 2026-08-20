import { createFileRoute, Link, useBlocker, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import { getProfile, setProfile, type AccountType } from "@/lib/account";
import { Camera, Trash2, User as UserIcon, MapPin, Briefcase, Shield, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { ConfirmModal, SectionTitle, Toggle } from "@/components/omeetso/account";

export const Route = createFileRoute("/account/edit")({
  head: () => ({
    meta: [
      { title: "Edit profile — Omeetso" },
      { name: "description", content: "Update your Omeetso profile, contact details, location and business preferences." },
    ],
  }),
  component: EditProfile,
});

const SECTIONS = [
  { id: "basics", label: "Basics", icon: UserIcon },
  { id: "contact", label: "Contact & location", icon: MapPin },
  { id: "account", label: "Account type", icon: Briefcase },
  { id: "safety", label: "Privacy & safety", icon: Shield },
];

function EditProfile() {
  const nav = useNavigate();
  const p = useMemo(() => getProfile(), []);
  const [name, setName] = useState(p.name);
  const [email, setEmail] = useState(p.email ?? "");
  const [mobile] = useState(p.mobile);
  const [city, setCity] = useState(p.city);
  const [pincode, setPincode] = useState(p.pincode);
  const [area, setArea] = useState(p.area ?? "");
  const [lang, setLang] = useState(p.language);
  const [bio, setBio] = useState(p.bio ?? "");
  const [avatar, setAvatar] = useState(p.avatar);
  const [account, setAccount] = useState<AccountType>(p.accountType);
  const [businessEnabled, setBusinessEnabled] = useState(!!p.businessEnabled);
  const [showMobile, setShowMobile] = useState(true);
  const [showEmail, setShowEmail] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);

  const dirty =
    name !== p.name || email !== (p.email ?? "") || city !== p.city ||
    pincode !== p.pincode || area !== (p.area ?? "") || lang !== p.language ||
    bio !== (p.bio ?? "") || avatar !== p.avatar || account !== p.accountType ||
    businessEnabled !== !!p.businessEnabled;

  useBlocker({ shouldBlockFn: () => dirty });

  const nameError = name.trim().length < 2 ? "Name must be at least 2 characters" : name.length > 60 ? "Max 60 characters" : "";
  const emailError = !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ? "Valid email address is mandatory" : "";
  const bioError = bio.length > 250 ? "Max 250 characters" : "";
  const pincodeError = pincode && !/^\d{6}$/.test(pincode) ? "6-digit pincode required" : "";
  const canSave = !nameError && !emailError && !bioError && !pincodeError && dirty;

  const save = async () => {
    if (nameError || emailError || bioError || pincodeError) {
      toast.error(nameError || emailError || bioError || pincodeError);
      return;
    }

    const token = typeof window !== "undefined" ? localStorage.getItem("omeetso_user_token") : null;
    if (token) {
      try {
        await fetch("http://localhost:3000/api/v1/users/me", {
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
            avatar,
            accountType: account
          })
        });
      } catch (err) {
        console.warn("Backend profile update warning:", err);
      }
    }

    setProfile({ name: name.trim(), email: email.trim(), city, pincode, area, language: lang, bio, avatar, accountType: account, businessEnabled });

    if (typeof window !== "undefined") {
      try {
        const u = JSON.parse(localStorage.getItem("omeetso_user") || "{}");
        const updated = {
          ...u,
          email: email.trim(),
          profile: {
            ...(u.profile || {}),
            name: name.trim(),
            city,
            pincode,
            area,
            bio,
            avatar
          }
        };
        localStorage.setItem("omeetso_user", JSON.stringify(updated));
      } catch { }
    }

    toast.success("Profile updated successfully");
    nav({ to: "/account" });
  };

  const pickAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader(); r.onload = () => setAvatar(String(r.result)); r.readAsDataURL(f);
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-28 md:pb-16">
        <div className="md:hidden"><BackBar title="Edit Profile" /></div>

        {/* Desktop breadcrumb */}
        <div className="hidden md:block border-b border-border bg-card">
          <div className="mx-auto max-w-[1200px] px-6 py-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Link to="/account" className="hover:text-foreground">Account</Link>
              <span>/</span>
              <span className="font-semibold text-foreground">Edit profile</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">Edit profile</h1>
            <p className="text-sm text-muted-foreground">Update how you appear to buyers, sellers and stores on Omeetso.</p>
          </div>
        </div>

        <div className="mx-auto max-w-[1200px] md:grid md:grid-cols-[240px_1fr] md:gap-8 md:px-6 md:pt-6">
          {/* Desktop side nav */}
          <aside className="hidden md:block">
            <div className="sticky top-24 space-y-1 rounded-2xl border border-border bg-card p-2">
              {SECTIONS.map((s) => (
                <button key={s.id} onClick={() => scrollTo(s.id)}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[13px] font-semibold text-foreground/80 hover:bg-secondary">
                  <s.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1">{s.label}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              ))}
              <div className="mt-2 border-t border-border pt-2">
                <Link to="/account" className="block rounded-xl px-3 py-2 text-[13px] font-semibold text-muted-foreground hover:bg-secondary">← Back to account</Link>
              </div>
            </div>
          </aside>

          {/* Main form */}
          <main className="space-y-6 px-4 pt-4 md:px-0 md:pt-0">
            {/* Avatar + Basics */}
            <section id="basics" className="rounded-2xl border-border bg-card md:border md:p-6">
              <div className="hidden md:block mb-4">
                <h2 className="text-base font-bold">Basics</h2>
                <p className="text-xs text-muted-foreground">Your public profile info.</p>
              </div>

              <div className="flex flex-col items-center md:flex-row md:items-center md:gap-6">
                <label className="relative cursor-pointer">
                  <img src={avatar || "https://api.dicebear.com/7.x/initials/svg?seed=" + encodeURIComponent(name || "U")}
                    alt="Profile" className="h-24 w-24 rounded-full border-4 border-card object-cover md:h-28 md:w-28" />
                  <span className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground">
                    <Camera className="h-4 w-4" />
                  </span>
                  <input type="file" accept="image/*" className="hidden" onChange={pickAvatar} aria-label="Change profile photo" />
                </label>
                <div className="mt-2 md:mt-0">
                  <p className="text-sm font-semibold">Profile photo</p>
                  <p className="text-xs text-muted-foreground">JPG or PNG, up to 5 MB. Square works best.</p>
                  {avatar && (
                    <button onClick={() => setAvatar("")} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-rose-700">
                      <Trash2 className="h-3 w-3" /> Remove photo
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-4 space-y-3 md:mt-6 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
                <Field label="Full name" value={name} onChange={setName} error={nameError} required maxLength={60} />
                <div>
                  <p className="mb-1 text-[11px] font-semibold text-muted-foreground">Preferred language</p>
                  <div className="flex gap-2">
                    {[["en", "English"], ["te", "తెలుగు"], ["hi", "हिन्दी"]].map(([code, label]) => (
                      <button key={code} onClick={() => setLang(code)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${lang === code ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-3 md:mt-4">
                <label className="block text-[11px] font-semibold text-muted-foreground">Short bio</label>
                <textarea rows={3} maxLength={250} value={bio} onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell buyers about you — what you sell, response times, area…"
                  className="mt-1 w-full rounded-2xl border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary" />
                <p className="mt-0.5 text-right text-[10px] text-muted-foreground">{bio.length}/250</p>
              </div>
            </section>

            {/* Contact & location */}
            <section id="contact" className="rounded-2xl border-border bg-card md:border md:p-6">
              <div className="hidden md:block mb-4">
                <h2 className="text-base font-bold">Contact & location</h2>
                <p className="text-xs text-muted-foreground">How buyers reach you and where you sell from.</p>
              </div>

              <div className="space-y-3">
                <Field label="Email" value={email} onChange={setEmail} error={emailError} type="email" placeholder="you@example.com" />

                <div className="rounded-2xl border border-border bg-background p-3">
                  <p className="text-[11px] font-semibold text-muted-foreground">Mobile number</p>
                  <div className="mt-1 flex items-center justify-between">
                    <p className="text-sm font-bold">{mobile}</p>
                    <Link to="/verification/$type" params={{ type: "mobile" }} className="text-xs font-bold text-primary">Change</Link>
                  </div>
                  <p className="mt-1 text-[10px] text-muted-foreground">Mobile changes require OTP verification.</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Pincode" value={pincode} onChange={(v) => setPincode(v.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" error={pincodeError} />
                  <Field label="City" value={city} onChange={setCity} />
                </div>
                <Field label="Area / locality" value={area} onChange={setArea} placeholder="e.g. Kondapur, Madhapur" />
              </div>
            </section>

            {/* Account type */}
            <section id="account" className="rounded-2xl border-border bg-card md:border md:p-6">
              <div className="hidden md:block mb-4">
                <h2 className="text-base font-bold">Account type</h2>
                <p className="text-xs text-muted-foreground">Switch between an individual seller or a business profile.</p>
              </div>

              <div className="md:hidden"><SectionTitle>Account type</SectionTitle></div>
              <div className="grid grid-cols-2 gap-3">
                {(["individual", "business"] as AccountType[]).map((a) => (
                  <button key={a} onClick={() => setAccount(a)} aria-pressed={account === a}
                    className={`rounded-2xl border p-3 text-left ${account === a ? "border-primary bg-primary/5" : "border-border bg-background"}`}>
                    <p className="text-sm font-bold capitalize">{a}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {a === "individual" ? "Sell used items, quick posts, buyer-friendly." : "Stores, invoices, GST, business verification."}
                    </p>
                  </button>
                ))}
              </div>

              <div className="mt-3 rounded-2xl border border-border bg-background p-3">
                <Toggle checked={businessEnabled} onChange={setBusinessEnabled}
                  label="Enable Business profile" description="Show store, business verification and revenue tools without losing personal listings or chats." />
              </div>
            </section>

            {/* Privacy */}
            <section id="safety" className="rounded-2xl border-border bg-card md:border md:p-6">
              <div className="hidden md:block mb-4">
                <h2 className="text-base font-bold">Privacy & safety</h2>
                <p className="text-xs text-muted-foreground">Control what appears on your public seller profile.</p>
              </div>

              <div className="space-y-2 rounded-2xl border border-border bg-background p-3 md:border-0 md:bg-transparent md:p-0">
                <Toggle checked={showMobile} onChange={setShowMobile}
                  label="Show mobile on public profile" description="Verified number appears masked (+91 ••••• ••210)." />
                <div className="h-px bg-border" />
                <Toggle checked={showEmail} onChange={setShowEmail}
                  label="Show email on public profile" description="Only shown after buyer starts a chat." />
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <Link to="/verification" className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold hover:bg-secondary">Verification centre</Link>
                <Link to="/account/public" className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold hover:bg-secondary">Preview public profile</Link>
              </div>
            </section>

            {/* Desktop action row */}
            <div className="hidden md:flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground">
                {dirty ? "You have unsaved changes." : "All changes saved."}
              </p>
              <div className="flex gap-2">
                <button onClick={() => dirty ? setConfirmLeave(true) : nav({ to: "/account" })}
                  className="rounded-full border border-border bg-background px-5 py-2.5 text-sm font-semibold hover:bg-secondary">Cancel</button>
                <button onClick={save} disabled={!canSave}
                  className="rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-60">Save changes</button>
              </div>
            </div>
          </main>
        </div>

        {/* Mobile sticky action bar */}
        <div className="fixed inset-x-0 bottom-0 z-10 mx-auto max-w-[430px] border-t border-border bg-card p-3 safe-b md:hidden">
          <div className="flex gap-2">
            <button onClick={() => dirty ? setConfirmLeave(true) : nav({ to: "/account" })}
              className="rounded-full border border-border px-4 py-3 text-sm font-semibold">Cancel</button>
            <button onClick={save} disabled={!canSave}
              className="flex-1 rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-60">Save Changes</button>
          </div>
        </div>

        <ConfirmModal open={confirmLeave} title="Discard changes?" body="Your unsaved changes will be lost."
          confirmLabel="Discard" cancelLabel="Keep editing" danger
          onCancel={() => setConfirmLeave(false)}
          onConfirm={() => { setConfirmLeave(false); nav({ to: "/account" }); }} />
      </div>
    </MobileFrame>
  );
}

function Field({ label, value, onChange, error, type = "text", inputMode, placeholder, required, maxLength }: {
  label: string; value: string; onChange: (v: string) => void; error?: string;
  type?: string; inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"]; placeholder?: string; required?: boolean; maxLength?: number;
}) {
  return (
    <label className="block">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[11px] font-semibold text-muted-foreground">{label}{required && " *"}</span>
        {error && <span className="text-[10px] font-semibold text-rose-700">{error}</span>}
      </div>
      <input type={type} inputMode={inputMode} value={value} maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className={`w-full rounded-2xl border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary ${error ? "border-rose-300" : "border-border"}`} />
    </label>
  );
}
