import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BackBar } from "@/components/omeetso/TopBar";
import {
  Camera, User, Mail, MapPinned, Languages, ShoppingBag, Store as StoreIcon, ArrowRight, Check, Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/profile-setup")({
  head: () => ({
    meta: [
      { title: "Set up your profile — Omeetso" },
      { name: "description", content: "Complete your Omeetso profile to buy and sell nearby." },
    ],
  }),
  component: ProfileSetup,
});

type Account = "individual" | "business";

function ProfileSetup() {
  const nav = useNavigate();
  const [avatar, setAvatar] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pincode, setPincode] = useState("");
  const [city, setCity] = useState("");
  const [lang, setLang] = useState("en");
  const [account, setAccount] = useState<Account>("individual");
  const [gender, setGender] = useState<"male" | "female" | "other">("male");

  const GENDER_AVATARS = {
    male: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=80",
    female: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200&q=80",
    other: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80"
  };

  const currentAvatar = avatar || GENDER_AVATARS[gender];

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const u = JSON.parse(localStorage.getItem("omeetso_user") || "{}");
      if (u.profile?.name || u.name) setName(u.profile?.name || u.name);
      if (u.email) setEmail(u.email);
    } catch { }
    const loc = (() => {
      try { return JSON.parse(localStorage.getItem("omeetso_location") || "{}"); } catch { return {}; }
    })();
    if (loc.pincode) setPincode(loc.pincode);
    if (loc.area) setCity(loc.area);
    const l = localStorage.getItem("omeetso_language");
    if (l) setLang(l);
  }, []);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const canSubmit = name.trim().length >= 2 && emailValid && pincode.length === 6 && city.trim().length >= 2;

  const pickAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(String(reader.result));
    reader.readAsDataURL(file);
  };

  const submit = async () => {
    if (!canSubmit) return;
    const finalAvatar = avatar || GENDER_AVATARS[gender];
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
            name,
            email,
            city,
            pincode,
            avatar: finalAvatar
          })
        });
      } catch (err) {
        console.warn("Failed to update profile on backend:", err);
      }
    }

    if (typeof window !== "undefined") {
      const existing = (() => {
        try { return JSON.parse(localStorage.getItem("omeetso_user") || "{}"); } catch { return {}; }
      })();
      const updatedUser = {
        ...existing,
        email,
        profile: {
          ...(existing.profile || {}),
          name,
          city,
          pincode,
          avatar: finalAvatar,
          gender
        }
      };
      localStorage.setItem("omeetso_user", JSON.stringify(updatedUser));
      localStorage.setItem("omeetso_profile", "1");
      localStorage.setItem("omeetso_language", lang);
    }
    nav({ to: "/home" });
  };

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col items-center justify-center p-4 sm:p-6 lg:p-10 font-sans">
      {/* Centered Profile Card Container */}
      <div className="w-full max-w-2xl bg-card rounded-3xl border border-border shadow-xl overflow-hidden relative transition-all my-auto">
        <BackBar title="Set up your profile" />

        <div className="p-6 sm:p-8 space-y-6">
          {/* Progress hint banner */}
          <div className="flex items-center gap-2.5 rounded-2xl bg-indigo-brand/10 border border-indigo-brand/20 px-4 py-3 text-xs sm:text-sm font-semibold text-indigo-brand">
            <Sparkles className="h-4 w-4 shrink-0 text-orange-brand" />
            <span>Almost there — one last step to personalize your Omeetso experience.</span>
          </div>

          {/* Avatar & Photo Picker */}
          <div className="flex flex-col items-center justify-center pt-2">
            <label className="relative cursor-pointer group" aria-label="Upload profile picture">
              <div className="grid h-28 w-28 place-items-center overflow-hidden rounded-full border-4 border-background bg-muted shadow-lg transition-transform group-hover:scale-105">
                <img src={currentAvatar} alt="Profile preview" className="h-full w-full object-cover" />
              </div>
              <span className="absolute bottom-0 right-0 grid h-9 w-9 place-items-center rounded-full bg-navy text-white shadow-md ring-2 ring-background transition-transform group-hover:scale-110">
                <Camera className="h-4.5 w-4.5" />
              </span>
              <input type="file" accept="image/*" className="hidden" onChange={pickAvatar} />
            </label>
            <p className="mt-2.5 text-xs text-muted-foreground font-medium">Click to upload photo or select an avatar below</p>

            {/* Gender selector */}
            <div className="mt-3 flex items-center gap-2">
              {[
                { key: "male", label: "Male" },
                { key: "female", label: "Female" },
                { key: "other", label: "Other" }
              ].map((g) => (
                <button
                  key={g.key}
                  type="button"
                  onClick={() => setGender(g.key as any)}
                  className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${gender === g.key ? "bg-navy text-white shadow-sm" : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                    }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input Fields Form Grid */}
          <div className="space-y-4 pt-2">
            <Field label="Full name *" icon={<User className="h-4 w-4" />}>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ravi Kumar"
                className="w-full bg-transparent text-sm font-semibold outline-none placeholder:font-normal placeholder:text-muted-foreground"
              />
            </Field>

            <Field label="Email address (Mandatory) *" icon={<Mail className="h-4 w-4" />} error={!emailValid && email.length > 0 ? "Enter a valid email address" : undefined}>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                inputMode="email"
                placeholder="you@example.com"
                className="w-full bg-transparent text-sm font-semibold outline-none placeholder:font-normal placeholder:text-muted-foreground"
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Pincode *" icon={<MapPinned className="h-4 w-4" />}>
                <input
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  inputMode="numeric"
                  placeholder="500072"
                  className="w-full bg-transparent text-sm font-semibold outline-none placeholder:font-normal placeholder:text-muted-foreground"
                />
              </Field>
              <Field label="City *" icon={<MapPinned className="h-4 w-4" />}>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Hyderabad"
                  className="w-full bg-transparent text-sm font-semibold outline-none placeholder:font-normal placeholder:text-muted-foreground"
                />
              </Field>
            </div>

            <div>
              <div className="mb-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">Preferred language</div>
              <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar">
                {[
                  { code: "en", label: "English" },
                  { code: "te", label: "తెలుగు" },
                  { code: "hi", label: "हिन्दी" },
                ].map((l) => {
                  const active = lang === l.code;
                  return (
                    <button
                      key={l.code}
                      onClick={() => setLang(l.code)}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-bold transition-all ${active ? "border-navy bg-navy text-white shadow-sm" : "border-border bg-card text-foreground hover:bg-secondary"
                        }`}
                    >
                      <Languages className="h-3.5 w-3.5" />
                      {l.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="mb-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">Account type</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <AccountCard
                  active={account === "individual"}
                  onClick={() => setAccount("individual")}
                  icon={<ShoppingBag className="h-5 w-5" />}
                  title="Individual Account"
                  body="Buy & sell products casually with buyers near you"
                />
                <AccountCard
                  active={account === "business"}
                  onClick={() => setAccount("business")}
                  icon={<StoreIcon className="h-5 w-5" />}
                  title="Business Account"
                  body="Run a verified local store & showcase products"
                />
              </div>
            </div>
          </div>

          {/* Action Submit Button */}
          <div className="pt-4">
            <button
              onClick={submit}
              disabled={!canSubmit}
              className="flex h-[54px] w-full items-center justify-center gap-2 rounded-2xl bg-indigo-brand text-sm font-bold text-white shadow-[0_14px_30px_-12px_color-mix(in_oklab,var(--indigo-brand)_55%,transparent)] transition-all active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-45 hover:opacity-95"
            >
              <span>Finish Profile & Explore</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label, icon, error, children,
}: { label: string; icon: React.ReactNode; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-bold text-muted-foreground">{label}</span>
        {error && <span className="text-xs font-bold text-destructive">{error}</span>}
      </div>
      <div className={`flex items-center gap-3 rounded-2xl border bg-card px-4 py-3.5 transition-colors ${error ? "border-destructive ring-2 ring-destructive/15" : "border-border focus-within:border-indigo-brand focus-within:ring-2 focus-within:ring-indigo-brand/20"}`}>
        <span className="text-muted-foreground">{icon}</span>
        {children}
      </div>
    </label>
  );
}

function AccountCard({
  active, onClick, icon, title, body,
}: { active: boolean; onClick: () => void; icon: React.ReactNode; title: string; body: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`relative rounded-2xl border-2 bg-card p-4 text-left transition-all ${active ? "border-indigo-brand ring-2 ring-indigo-brand/15 bg-indigo-brand/[0.02]" : "border-border hover:border-slate-300"
        }`}
    >
      <div className={`grid h-10 w-10 place-items-center rounded-xl ${active ? "bg-indigo-brand text-white" : "bg-muted text-muted-foreground"}`}>
        {icon}
      </div>
      <div className="mt-2.5 text-sm font-bold text-foreground">{title}</div>
      <div className="mt-0.5 text-xs text-muted-foreground leading-snug">{body}</div>
      {active && (
        <span className="absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full bg-indigo-brand text-white shadow-sm">
          <Check className="h-3 w-3" strokeWidth={3} />
        </span>
      )}
    </button>
  );
}
