import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/omeetso/Logo";
import {
  ArrowLeft, ArrowRight, ShieldCheck, X, Loader2, WifiOff,
  Compass, Store, MapPin, Tag, Building2, AlertCircle, Sparkles,
  MessageSquare, Zap, CheckCircle2, Star, Users
} from "lucide-react";

import { requestUserOtp } from "@/api/auth.api";

export const Route = createFileRoute("/login")({
  component: Auth,
  head: () => ({
    meta: [
      { title: "Sign in · Omeetso" },
      { name: "description", content: "Sign in to Omeetso — buy nearby, sell quickly, and connect with trusted local sellers." },
      { property: "og:title", content: "Sign in · Omeetso" },
      { property: "og:description", content: "Buy nearby, sell quickly, and connect with trusted local sellers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

type Status = "idle" | "sending" | "sent" | "network-error";

function formatIN(digits: string) {
  const d = digits.slice(0, 10);
  return d.length > 5 ? `${d.slice(0, 5)} ${d.slice(5)}` : d;
}

function Auth() {
  const nav = useNavigate();
  const [phone, setPhone] = useState("");
  const [touched, setTouched] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [guestSheet, setGuestSheet] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isValid = phone.length === 10;
  const showInvalid = touched && phone.length > 0 && !isValid;

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const handleContinue = async () => {
    if (!isValid || status === "sending") return;
    setStatus("sending");
    if (typeof window !== "undefined") {
      if (!navigator.onLine) {
        setStatus("network-error");
        return;
      }
      localStorage.setItem("omeetso_pending_phone", phone);
    }
    const result = await requestUserOtp(phone);
    if (result.success) {
      setStatus("sent");
      nav({ to: "/otp" });
    } else {
      setStatus("network-error");
    }
  };

  const confirmGuest = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("omeetso_guest_session", "1");
      localStorage.setItem("omeetso_guest", "1");
    }
    nav({ to: "/home" });
  };

  const handleGoogle = () => {
    if (googleLoading) return;
    setGoogleLoading(true);
    setTimeout(() => {
      if (typeof window !== "undefined") {
        localStorage.setItem("omeetso_user", JSON.stringify({ provider: "google" }));
        localStorage.removeItem("omeetso_guest");
      }
      const hasLocation = typeof window !== "undefined" && localStorage.getItem("omeetso_location");
      if (!hasLocation && typeof window !== "undefined") {
        localStorage.setItem("omeetso_location", JSON.stringify({ area: "Madhapur, Hyderabad", pincode: "500081", savedAt: Date.now() }));
      }
      if (!hasProfile) return nav({ to: "/profile-setup" });
      nav({ to: "/home" });
    }, 700);
  };

  return (
    <div className="relative min-h-screen w-full bg-background text-foreground flex flex-col md:flex-row overflow-x-hidden font-sans">
      {/* ── LEFT PANEL (DESKTOP FEATURE HIGHLIGHTS & BRANDING) ── */}
      <div className="hidden md:flex md:w-1/2 lg:w-[52%] relative flex-col justify-between p-8 lg:p-12 bg-slate-950 text-white border-r border-slate-800/80 overflow-hidden select-none">
        {/* Background Mesh Glow & Grid */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
          <div className="absolute -top-32 -left-20 h-96 w-96 rounded-full bg-indigo-600/25 blur-[100px]" />
          <div className="absolute top-1/2 -right-32 h-96 w-96 rounded-full bg-amber-500/20 blur-[110px]" />
          <div className="absolute -bottom-20 left-1/3 h-80 w-80 rounded-full bg-blue-600/20 blur-[90px]" />
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
              backgroundSize: "32px 32px"
            }}
          />
        </div>

        {/* Top Branding */}
        <div className="relative z-10 flex items-center justify-between">
          <Logo />
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/90 text-amber-400 text-xs font-bold border border-slate-700/60 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" /> Verified Local Marketplace
          </span>
        </div>

        {/* Center Content & Feature Cards */}
        <div className="relative z-10 my-auto py-8 space-y-8 max-w-lg">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-300 text-xs font-extrabold uppercase tracking-wider border border-indigo-500/30">
              ⚡ Fast & Secure Login
            </span>
            <h1 className="text-3xl lg:text-4xl font-black leading-tight tracking-tight text-white drop-shadow-sm">
              Buy Nearby, Sell Quickly & Connect with Trusted Sellers.
            </h1>
            <p className="text-sm lg:text-base text-slate-300 font-normal leading-relaxed">
              Discover verified deals right in your neighborhood. Negotiate directly in real-time without middleman commission fees.
            </p>
          </div>

          {/* 3 Value Proposition Cards */}
          <div className="space-y-3.5">
            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md transition-all hover:bg-slate-900 hover:border-slate-700">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-500/20 text-indigo-400">
                <Store className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Hyperlocal Marketplace</h3>
                <p className="text-xs text-slate-400 mt-0.5">Browse products and verified merchant stores within 1 to 5 km of your location.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md transition-all hover:bg-slate-900 hover:border-slate-700">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-500/20 text-amber-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Passwordless 100% Security</h3>
                <p className="text-xs text-slate-400 mt-0.5">Instant OTP verification with encrypted session token rotation.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md transition-all hover:bg-slate-900 hover:border-slate-700">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-500/20 text-emerald-400">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Direct Real-Time Offer Chat</h3>
                <p className="text-xs text-slate-400 mt-0.5">Chat directly with sellers, make instant price offers, and close deals fast.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Platform Metrics Pill */}
        <div className="relative z-10 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-indigo-400" />
            <span className="font-semibold text-slate-200">15,000+ Sellers</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-400 font-bold">
            <Star className="h-3.5 w-3.5 fill-amber-400" />
            <span>4.9 Rating</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>100% Verified</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL (LOGIN FORM FOR DESKTOP & MOBILE) ── */}
      <div className="relative w-full md:w-1/2 lg:w-[48%] flex flex-col justify-between p-5 sm:p-8 lg:p-12 bg-background min-h-screen md:min-h-0">
        <DecorShapes />

        {/* Top Bar Header */}
        <div className="relative z-10 flex items-center justify-between mb-4">
          <button
            type="button"
            aria-label="Go back"
            onClick={() => history.length > 1 ? history.back() : nav({ to: "/onboarding" })}
            className="grid h-10 w-10 place-items-center rounded-full bg-card ring-1 ring-border shadow-sm active:scale-95 transition-transform hover:bg-secondary"
          >
            <ArrowLeft className="h-5 w-5 text-navy" />
          </button>
          
          <div className="md:hidden">
            <Logo />
          </div>
        </div>

        {/* Form Container */}
        <div className="relative z-10 my-auto mx-auto w-full max-w-md space-y-6">
          <div className="space-y-1.5 text-center md:text-left">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Welcome to Omeetso
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Enter your 10-digit mobile number to sign in or get started.
            </p>
          </div>

          {/* Mobile number form */}
          <form
            onSubmit={(e) => { e.preventDefault(); setTouched(true); handleContinue(); }}
            className="space-y-3"
            noValidate
          >
            <label htmlFor="omeetso-phone" className="block text-xs font-bold text-foreground">
              Mobile number
            </label>

            <div
              className={`flex items-stretch overflow-hidden rounded-2xl border bg-card transition-colors ${
                showInvalid
                  ? "border-destructive ring-2 ring-destructive/15"
                  : "border-border focus-within:border-indigo-brand focus-within:ring-2 focus-within:ring-indigo-brand/20"
              }`}
            >
              <div className="flex items-center gap-2 border-r border-border bg-secondary/60 px-3.5">
                <span className="text-base leading-none" aria-hidden>🇮🇳</span>
                <span className="text-xs font-extrabold text-navy">+91</span>
              </div>
              <input
                id="omeetso-phone"
                ref={inputRef}
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                aria-invalid={showInvalid}
                aria-describedby="omeetso-phone-help"
                value={formatIN(phone)}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                onBlur={() => setTouched(true)}
                placeholder="Enter your mobile number"
                className="min-w-0 flex-1 bg-transparent px-3.5 py-3.5 text-base font-semibold tracking-wide outline-none placeholder:font-normal placeholder:text-muted-foreground"
              />
              {phone.length > 0 && (
                <button
                  type="button"
                  aria-label="Clear mobile number"
                  onClick={() => { setPhone(""); setTouched(false); inputRef.current?.focus(); }}
                  className="grid w-10 place-items-center text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              {isValid && phone.length > 0 && (
                <div className="grid w-10 place-items-center pr-1" aria-hidden>
                  <ShieldCheck className="h-5 w-5 text-[color:var(--success)]" />
                </div>
              )}
            </div>

            <div id="omeetso-phone-help" aria-live="polite" className="min-h-[20px] px-1 text-xs">
              {showInvalid && (
                <span className="inline-flex items-center gap-1 font-medium text-destructive">
                  <AlertCircle className="h-3.5 w-3.5" /> Enter a valid 10-digit mobile number.
                </span>
              )}
              {status === "network-error" && !showInvalid && (
                <span className="inline-flex items-center gap-1 font-medium text-destructive">
                  <WifiOff className="h-3.5 w-3.5" /> We couldn't send the OTP. Check your connection and try again.
                </span>
              )}
              {status === "sent" && !showInvalid && (
                <span className="inline-flex items-center gap-1 font-medium text-[color:var(--success)]">
                  <ShieldCheck className="h-3.5 w-3.5" /> OTP sent to +91 {formatIN(phone)}. Verification screen coming next.
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={!isValid || status === "sending"}
              aria-busy={status === "sending"}
              className="relative flex h-[54px] w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-indigo-brand text-sm font-bold text-white shadow-[0_14px_30px_-12px_color-mix(in_oklab,var(--indigo-brand)_55%,transparent)] transition-all active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none hover:opacity-95"
            >
              {status === "sending" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Sending OTP…</span>
                </>
              ) : status === "network-error" ? (
                <>
                  <span>Try Again</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              ) : status === "sent" ? (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  <span>OTP sent</span>
                </>
              ) : (
                <>
                  <span>Continue securely</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
              {isValid && status === "idle" && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 bg-white/25 blur-md motion-reduce:hidden"
                  style={{ animation: "ob-shine 2.8s ease-in-out infinite" }}
                />
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              or continue with
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading}
            aria-busy={googleLoading}
            className="flex h-[52px] w-full items-center justify-center gap-2.5 rounded-2xl border border-border bg-card text-sm font-bold text-navy shadow-sm transition-colors hover:bg-secondary/70 disabled:opacity-70"
          >
            {googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleG />}
            {googleLoading ? "Signing in…" : "Continue with Google"}
          </button>

          {/* Guest */}
          <button
            type="button"
            onClick={() => setGuestSheet(true)}
            className="mt-2.5 flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-electric/45 bg-electric/[0.06] text-sm font-bold text-navy transition-colors hover:bg-electric/[0.12]"
          >
            <Compass className="h-4 w-4 text-electric" />
            Browse as Guest
          </button>
        </div>

        {/* Legal Footer */}
        <div className="relative z-10 pt-6 mt-4 text-center">
          <p className="text-[11.5px] leading-relaxed text-muted-foreground">
            By continuing, you agree to Omeetso's{" "}
            <Link to="/login" className="font-bold text-navy underline underline-offset-2">Terms of Service</Link>{" "}
            and{" "}
            <Link to="/login" className="font-bold text-navy underline underline-offset-2">Privacy Policy</Link>.
          </p>
        </div>

        {/* Guest bottom sheet */}
        <GuestSheet
          open={guestSheet}
          onClose={() => setGuestSheet(false)}
          onConfirm={confirmGuest}
        />
      </div>
    </div>
  );
}

function DecorShapes() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-24 -left-16 h-64 w-64 rounded-full bg-indigo-brand/12 blur-3xl" />
      <div className="absolute top-10 -right-16 h-56 w-56 rounded-full bg-yellow-brand/20 blur-3xl" />
      <div className="absolute -bottom-24 left-1/2 h-56 w-72 -translate-x-1/2 rounded-full bg-navy/[0.06] blur-3xl" />
    </div>
  );
}

function GoogleG() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden>
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.7-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8z"/>
      <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1C3.4 21.4 7.4 24 12 24z"/>
      <path fill="#FBBC05" d="M5.4 14.4c-.2-.7-.3-1.4-.3-2.4s.1-1.7.3-2.4V6.5H1.4C.5 8.2 0 10 0 12s.5 3.8 1.4 5.5l4-3.1z"/>
      <path fill="#EA4335" d="M12 4.8c1.7 0 3.3.6 4.5 1.7l3.4-3.4C17.9 1.2 15.2 0 12 0 7.4 0 3.4 2.6 1.4 6.5l4 3.1C6.3 6.8 8.9 4.8 12 4.8z"/>
    </svg>
  );
}

function GuestSheet({
  open, onClose, onConfirm,
}: { open: boolean; onClose: () => void; onConfirm: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="omeetso-guest-title">
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        style={{ animation: "ob-fade-in 200ms both" }}
      />
      <div
        className="relative z-10 w-full max-w-md rounded-3xl bg-card p-6 shadow-2xl border border-border"
        style={{ animation: "ob-slide-up 260ms cubic-bezier(0.22,1,0.36,1) both" }}
      >
        <div className="flex items-start gap-3.5">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-electric/10 text-electric">
            <Compass className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h2 id="omeetso-guest-title" className="text-lg font-extrabold text-foreground">
              Continue as guest?
            </h2>
            <p className="mt-1 text-xs sm:text-sm leading-relaxed text-muted-foreground">
              You can browse local products and stores, but you'll need to sign in to chat, save items, make price offers or sell items.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3">
          <button
            type="button"
            onClick={onConfirm}
            className="h-[52px] w-full rounded-2xl bg-indigo-brand text-sm font-bold text-white shadow-lg active:scale-[0.99] hover:opacity-95"
          >
            Continue as Guest
          </button>
          <button
            type="button"
            onClick={onClose}
            className="h-[52px] w-full rounded-2xl border border-border bg-card text-sm font-bold text-navy hover:bg-secondary"
          >
            Sign In Instead
          </button>
        </div>
      </div>
    </div>
  );
}
