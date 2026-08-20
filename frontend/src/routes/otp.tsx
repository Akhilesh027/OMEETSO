import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Logo } from "@/components/omeetso/Logo";
import {
  ArrowLeft, ShieldCheck, Loader2, AlertCircle, RotateCw, MessageSquare,
  Sparkles, Lock, Zap, Shield, CheckCircle2
} from "lucide-react";
import { verifyUserOtp } from "@/api/auth.api";

export const Route = createFileRoute("/otp")({
  component: OtpPage,
  head: () => ({
    meta: [
      { title: "Verify OTP · Omeetso" },
      { name: "description", content: "Verify the 4-digit code sent to your mobile to sign in to Omeetso." },
      { property: "og:title", content: "Verify OTP · Omeetso" },
      { property: "og:description", content: "Enter the 4-digit code sent to your mobile number." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

const OTP_LENGTH = 4;
const RESEND_SECONDS = 28;

type Status = "idle" | "verifying" | "error" | "success";

function formatIN(digits: string) {
  const d = digits.slice(0, 10);
  return d.length > 5 ? `${d.slice(0, 5)} ${d.slice(5)}` : d;
}

function OtpPage() {
  const nav = useNavigate();
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [status, setStatus] = useState<Status>("idle");
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const [phone, setPhone] = useState("");
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPhone(localStorage.getItem("omeetso_pending_phone") || "");
    }
    inputsRef.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const code = useMemo(() => digits.join(""), [digits]);
  const isComplete = code.length === OTP_LENGTH && digits.every((d) => d !== "");

  const setAt = (i: number, val: string) => {
    setDigits((prev) => {
      const next = [...prev];
      next[i] = val;
      return next;
    });
  };

  const verify = async (value: string) => {
    if (value.length !== OTP_LENGTH) return;
    setStatus("verifying");
    const result = await verifyUserOtp(phone, value);
    if (result.success) {
      setStatus("success");
      if (typeof window !== "undefined") {
        localStorage.removeItem("omeetso_guest");
        localStorage.removeItem("omeetso_pending_phone");
      }
      setTimeout(() => {
        const hasProfile = result.data?.user?.profile?.name;
        if (result.data?.isNewUser || !hasProfile) return nav({ to: "/profile-setup" });
        nav({ to: "/home" });
      }, 400);
    } else {
      setStatus("error");
      setDigits(Array(OTP_LENGTH).fill(""));
      setTimeout(() => inputsRef.current[0]?.focus(), 0);
    }
  };

  const handleChange = (i: number, raw: string) => {
    const v = raw.replace(/\D/g, "");
    if (!v) {
      setAt(i, "");
      return;
    }
    if (v.length > 1) {
      // paste-like input
      const chars = v.slice(0, OTP_LENGTH - i).split("");
      const next = [...digits];
      chars.forEach((c, idx) => (next[i + idx] = c));
      setDigits(next);
      const nextIdx = Math.min(i + chars.length, OTP_LENGTH - 1);
      inputsRef.current[nextIdx]?.focus();
      const full = next.join("");
      if (full.length === OTP_LENGTH && next.every((d) => d !== "")) verify(full);
      return;
    }
    setAt(i, v);
    if (status === "error") setStatus("idle");
    if (i < OTP_LENGTH - 1) inputsRef.current[i + 1]?.focus();
    // auto-submit when last digit filled
    if (i === OTP_LENGTH - 1) {
      const full = [...digits.slice(0, i), v].join("");
      if (full.length === OTP_LENGTH) verify(full);
    }
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (digits[i]) {
        setAt(i, "");
      } else if (i > 0) {
        inputsRef.current[i - 1]?.focus();
        setAt(i - 1, "");
      }
    } else if (e.key === "ArrowLeft" && i > 0) {
      inputsRef.current[i - 1]?.focus();
    } else if (e.key === "ArrowRight" && i < OTP_LENGTH - 1) {
      inputsRef.current[i + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!text) return;
    e.preventDefault();
    const next = Array(OTP_LENGTH).fill("");
    text.split("").forEach((c, idx) => (next[idx] = c));
    setDigits(next);
    inputsRef.current[Math.min(text.length, OTP_LENGTH - 1)]?.focus();
    if (text.length === OTP_LENGTH) verify(text);
  };

  const resend = () => {
    if (seconds > 0) return;
    setSeconds(RESEND_SECONDS);
    setDigits(Array(OTP_LENGTH).fill(""));
    setStatus("idle");
    inputsRef.current[0]?.focus();
  };

  return (
    <div className="relative min-h-screen w-full bg-background text-foreground flex flex-col md:flex-row overflow-x-hidden font-sans">
      {/* ── DESKTOP ONLY LEFT PANEL ── */}
      <div className="hidden md:flex md:w-1/2 lg:w-[52%] relative flex-col justify-between p-8 lg:p-12 bg-slate-950 text-white border-r border-slate-800/80 overflow-hidden select-none">
        {/* Background Mesh & Lighting */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
          <div className="absolute -top-32 -left-20 h-96 w-96 rounded-full bg-indigo-600/25 blur-[100px]" />
          <div className="absolute top-1/2 -right-32 h-96 w-96 rounded-full bg-amber-500/20 blur-[110px]" />
          <div className="absolute -bottom-20 left-1/3 h-80 w-80 rounded-full bg-emerald-600/20 blur-[90px]" />
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
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/90 text-indigo-300 text-xs font-bold border border-slate-700/60 backdrop-blur-sm">
            <Lock className="h-3.5 w-3.5" /> Secure Session Verification
          </span>
        </div>

        {/* Middle Content */}
        <div className="relative z-10 my-auto py-8 space-y-8 max-w-lg">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 text-xs font-extrabold uppercase tracking-wider border border-amber-500/30">
              <Sparkles className="h-3.5 w-3.5" /> Two-Factor Protection
            </span>
            <h1 className="text-3xl lg:text-4xl font-black leading-tight tracking-tight text-white drop-shadow-sm">
              Verify Your Phone Number & Access Omeetso Safely.
            </h1>
            <p className="text-sm lg:text-base text-slate-300 font-normal leading-relaxed">
              We've dispatched a secure 4-digit code to your mobile device to protect your account session and marketplace deals.
            </p>
          </div>

          {/* 3 Security Highlights */}
          <div className="space-y-3.5">
            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md transition-all hover:bg-slate-900 hover:border-slate-700">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-500/20 text-indigo-400">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Encrypted Token Rotation</h3>
                <p className="text-xs text-slate-400 mt-0.5">HttpOnly refresh token rotation safeguards your user identity.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md transition-all hover:bg-slate-900 hover:border-slate-700">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-500/20 text-amber-400">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Instant SMS Delivery</h3>
                <p className="text-xs text-slate-400 mt-0.5">High-priority cellular delivery with automatic 1-click verify.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md transition-all hover:bg-slate-900 hover:border-slate-700">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-500/20 text-emerald-400">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Zero Third-Party Leaks</h3>
                <p className="text-xs text-slate-400 mt-0.5">Your phone number is strictly encrypted and never sold or shared.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Trust Badge */}
        <div className="relative z-10 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <CheckCircle2 className="h-4 w-4" />
            <span>Encrypted Authentication</span>
          </div>
          <span className="text-slate-500">Omeetso Security v2.4</span>
        </div>
      </div>

      {/* ── RIGHT PANEL (OTP VERIFICATION FORM FOR DESKTOP & MOBILE) ── */}
      <div className="relative w-full md:w-1/2 lg:w-[48%] flex flex-col justify-between p-5 sm:p-8 lg:p-12 bg-background min-h-screen md:min-h-0">
        {/* Decor */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -left-16 h-64 w-64 rounded-full bg-indigo-brand/12 blur-3xl" />
          <div className="absolute top-10 -right-16 h-56 w-56 rounded-full bg-yellow-brand/20 blur-3xl" />
        </div>

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between mb-4">
          <button
            type="button"
            aria-label="Go back"
            onClick={() => history.length > 1 ? history.back() : nav({ to: "/login" })}
            className="grid h-10 w-10 place-items-center rounded-full bg-card ring-1 ring-border shadow-sm active:scale-95 transition-transform hover:bg-secondary"
          >
            <ArrowLeft className="h-5 w-5 text-navy" />
          </button>

          <div className="md:hidden">
            <Logo />
          </div>

          <span className="rounded-full bg-card px-3.5 py-1.5 text-xs font-bold text-navy ring-1 ring-border">
            Step 2 of 2
          </span>
        </div>

        {/* Center Verification Form */}
        <div className="relative z-10 my-auto mx-auto w-full max-w-md space-y-6">
          {/* Icon badge */}
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-indigo-brand/10 ring-1 ring-indigo-brand/20 shadow-sm">
            <MessageSquare className="h-7 w-7 text-indigo-brand" />
          </div>

          <div className="space-y-1.5 text-center">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Verify your number
            </h1>
            <p className="mx-auto max-w-[320px] text-xs sm:text-sm leading-relaxed text-muted-foreground">
              Enter the 4-digit code sent to{" "}
              <span className="font-bold text-foreground">
                +91 {phone ? formatIN(phone) : "your mobile"}
              </span>
              .
            </p>
            <div className="pt-1">
              <button
                type="button"
                onClick={() => nav({ to: "/login" })}
                className="text-xs font-bold text-indigo-brand underline-offset-2 hover:underline"
              >
                Change mobile number
              </button>
            </div>
          </div>

          {/* Demo OTP Hint Pill */}
          <div className="mx-auto flex w-fit items-center gap-1.5 rounded-full bg-yellow-brand/15 px-3.5 py-1 text-xs font-bold text-navy ring-1 ring-yellow-brand/40 shadow-sm">
            <ShieldCheck className="h-4 w-4 text-orange-brand" />
            Demo Code: <span className="font-black">1234</span>
          </div>

          {/* 4-Digit Inputs */}
          <div
            role="group"
            aria-label="One time passcode"
            className="flex items-center justify-center gap-3 sm:gap-4 pt-2"
          >
            {digits.map((d, i) => {
              const filled = d !== "";
              const errored = status === "error";
              return (
                <input
                  key={i}
                  ref={(el) => { inputsRef.current[i] = el; }}
                  type="tel"
                  inputMode="numeric"
                  autoComplete={i === 0 ? "one-time-code" : "off"}
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onPaste={handlePaste}
                  disabled={status === "verifying" || status === "success"}
                  aria-label={`Digit ${i + 1}`}
                  className={`h-16 w-14 sm:h-18 sm:w-16 rounded-2xl border bg-card text-center text-2xl sm:text-3xl font-black text-navy outline-none transition-all shadow-sm
                    ${errored
                      ? "border-destructive ring-2 ring-destructive/20 animate-[ob-shake_400ms_ease-in-out]"
                      : filled
                        ? "border-indigo-brand ring-2 ring-indigo-brand/20"
                        : "border-border focus:border-indigo-brand focus:ring-2 focus:ring-indigo-brand/20"
                    }`}
                />
              );
            })}
          </div>

          {/* Status Message */}
          <div aria-live="polite" className="min-h-[22px] text-center text-xs sm:text-sm">
            {status === "verifying" && (
              <span className="inline-flex items-center gap-1.5 font-bold text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-indigo-brand" /> Verifying OTP code…
              </span>
            )}
            {status === "error" && (
              <span className="inline-flex items-center gap-1.5 font-bold text-destructive">
                <AlertCircle className="h-4 w-4" /> Incorrect code. Please check and try again.
              </span>
            )}
            {status === "success" && (
              <span className="inline-flex items-center gap-1.5 font-bold text-[color:var(--success)]">
                <ShieldCheck className="h-4 w-4" /> Verified! Signing you in…
              </span>
            )}
          </div>

          {/* Verify Button */}
          <button
            type="button"
            onClick={() => verify(code)}
            disabled={!isComplete || status === "verifying" || status === "success"}
            aria-busy={status === "verifying"}
            className="flex h-[54px] w-full items-center justify-center gap-2 rounded-2xl bg-indigo-brand text-sm font-bold text-white shadow-[0_14px_30px_-12px_color-mix(in_oklab,var(--indigo-brand)_55%,transparent)] transition-all active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none hover:opacity-95"
          >
            {status === "verifying" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Verifying…
              </>
            ) : status === "success" ? (
              <>
                <ShieldCheck className="h-4 w-4" /> Verified
              </>
            ) : (
              <>Verify & Continue</>
            )}
          </button>

          {/* Resend Controls */}
          <div className="flex flex-col items-center gap-1.5 pt-1">
            <span className="text-xs text-muted-foreground">Didn't receive the code?</span>
            <button
              type="button"
              onClick={resend}
              disabled={seconds > 0}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-brand disabled:text-muted-foreground disabled:cursor-not-allowed hover:underline"
            >
              <RotateCw className={`h-3.5 w-3.5 ${seconds > 0 ? "" : "animate-none"}`} />
              {seconds > 0 ? `Resend in 0:${seconds.toString().padStart(2, "0")}` : "Resend OTP"}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 pt-6 mt-4 text-center">
          <p className="text-[11.5px] leading-relaxed text-muted-foreground">
            Protected by Omeetso's encrypted verification. Never share your OTP with anyone.
          </p>
        </div>
      </div>
    </div>
  );
}
