import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { Logo } from "@/components/omeetso/Logo";
import {
  Camera, User, Mail, Phone, MapPinned, Languages, ShoppingBag, Store as StoreIcon,
  ArrowRight, Check, Sparkles, Lock, ArrowLeft, Eye, EyeOff, ShieldCheck, CheckCircle2,
  Briefcase, KeyRound, RefreshCw, AlertCircle, Users, Star
} from "lucide-react";
import { registerUserApi, checkPhoneStatusApi, requestUserOtp, verifyUserOtp, RegisterPayload } from "@/api/auth.api";
import { toast } from "sonner";
import { DEFAULT_AVATARS } from "@/lib/account";
import { uploadImageToCloudinary } from "@/lib/upload";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
  head: () => ({
    meta: [
      { title: "Register · Create Omeetso Account" },
      { name: "description", content: "Join Omeetso — create your account to buy, sell, post jobs, and connect with verified local users." },
      { property: "og:title", content: "Register · Create Omeetso Account" },
      { property: "og:description", content: "Join Omeetso — buy, sell, post jobs, and connect with verified local users." },
      { property: "og:type", content: "website" },
    ],
  }),
});

type AccountType = "individual" | "business";
type RegisterStep = "details" | "otp" | "pin";

function RegisterPage() {
  const nav = useNavigate();
  const [step, setStep] = useState<RegisterStep>("details");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [pincode, setPincode] = useState("500081");
  const [city, setCity] = useState("Hyderabad");
  const [area, setArea] = useState("Madhapur");
  const [lang, setLang] = useState("en");
  const [accountType, setAccountType] = useState<AccountType>("individual");
  const [gender, setGender] = useState<"male" | "female" | "other">("male");

  // Step 2: OTP State
  const [otpCode, setOtpCode] = useState("");
  const [resendCooldown, setResendCooldown] = useState(30);

  // Step 3: PIN State
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showPin, setShowPin] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const otpInputRef = useRef<HTMLInputElement>(null);

  const GENDER_AVATARS = DEFAULT_AVATARS;

  const currentAvatar = avatar || GENDER_AVATARS[gender];

  const handleSelectGender = (g: "male" | "female" | "other") => {
    setGender(g);
    setAvatar(DEFAULT_AVATARS[g]);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const pendingPhone = localStorage.getItem("omeetso_pending_phone");
    if (pendingPhone) setPhone(pendingPhone.replace(/\D/g, "").slice(-10));

    const loc = (() => {
      try { return JSON.parse(localStorage.getItem("omeetso_location") || "{}"); } catch { return {}; }
    })();
    if (loc.pincode) setPincode(loc.pincode);
    if (loc.area) setCity(loc.area);
    const l = localStorage.getItem("omeetso_language");
    if (l) setLang(l);
  }, []);

  // Cooldown countdown
  useEffect(() => {
    if (step === "otp" && resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [step, resendCooldown]);

  const cleanPhone = phone.replace(/\D/g, "").slice(0, 10);
  const phoneValid = cleanPhone.length === 10;
  const emailTrimmed = email.trim();
  const emailValid = !emailTrimmed || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed);
  const nameValid = name.trim().length >= 2;
  const pincodeValid = pincode.length === 6;
  const cityValid = city.trim().length >= 2;

  const canSubmitDetails = nameValid && phoneValid && emailValid && pincodeValid && cityValid && !isSubmitting;

  const pickAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadImageToCloudinary(file, "profile");
      setAvatar(url);
      setGender("other");
      toast.success("Profile photo uploaded!");
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        setAvatar(String(reader.result));
        setGender("other");
      };
      reader.readAsDataURL(file);
    }
  };

  // STEP 1 -> SEND OTP
  const handleProceedToOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmitDetails) return;
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      // Check if phone already registered
      const checkRes = await checkPhoneStatusApi(cleanPhone);
      if (checkRes.success && checkRes.data?.exists) {
        setIsSubmitting(false);
        toast.info("An account already exists with this mobile number. Please sign in.");
        nav({ to: "/login" });
        return;
      }

      // Request OTP
      const otpRes = await requestUserOtp(cleanPhone);
      setIsSubmitting(false);

      if (otpRes.success) {
        toast.success(`OTP sent to +91 ${cleanPhone}.`);
        setResendCooldown(30);
        setStep("otp");
      } else {
        setErrorMessage(otpRes.error || "Failed to send OTP. Please try again.");
      }
    } catch {
      setIsSubmitting(false);
      setStep("otp"); // Fallback in dev
    }
  };

  // STEP 2 -> VERIFY OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOtp = otpCode.replace(/\D/g, "");
    if (cleanOtp.length !== 4) {
      setErrorMessage("Please enter the 4-digit verification code.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    const res = await verifyUserOtp(cleanPhone, cleanOtp);
    setIsSubmitting(false);

    if (res.success) {
      toast.success("Phone verified successfully! Now set your 4-digit PIN.");
      setStep("pin");
    } else {
      setErrorMessage(res.error || "Invalid verification code. Please check and try again.");
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setResendCooldown(30);
    const otpRes = await requestUserOtp(cleanPhone);
    if (otpRes.success) {
      toast.success(`New OTP sent to +91 ${cleanPhone}.`);
    } else {
      toast.error(otpRes.error || "Failed to resend OTP");
    }
  };

  // STEP 3 -> SAVE PIN & COMPLETE REGISTRATION
  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pin.replace(/\D/g, "");
    if (cleanPin.length !== 4) {
      setErrorMessage("Please enter a valid 4-digit numeric PIN.");
      return;
    }
    if (confirmPin && confirmPin !== cleanPin) {
      setErrorMessage("PIN confirmation does not match. Please re-enter.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    const payload: RegisterPayload = {
      name: name.trim(),
      phone: cleanPhone,
      email: emailTrimmed || undefined,
      pin: cleanPin,
      password: cleanPin,
      city: city.trim(),
      pincode: pincode.trim(),
      area: area.trim(),
      accountType,
      avatar: currentAvatar,
      language: lang,
      gender,
    };

    const res = await registerUserApi(payload);
    setIsSubmitting(false);

    if (res.success) {
      toast.success("Account created and PIN saved successfully! Welcome to Omeetso.");
      nav({ to: "/home" });
    } else {
      setErrorMessage(res.error || "Failed to register account. Please check details.");
      toast.error(res.error || "Registration failed");
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-background text-foreground flex flex-col md:flex-row overflow-x-hidden font-sans">

      {/* ── LEFT PANEL (LAPTOP & DESKTOP BRANDING / COMMUNITY HIGHLIGHTS) ── */}
      <div className="hidden md:flex md:w-1/2 lg:w-[48%] xl:w-[45%] relative flex-col justify-between p-8 lg:p-12 bg-slate-950 text-white border-r border-slate-800/80 overflow-hidden select-none">
        
        {/* Ambient Mesh Glows & Grid */}
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

        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between">
          <Link to="/home">
            <Logo />
          </Link>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/90 text-amber-400 text-xs font-bold border border-slate-700/60 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" /> Verified Local Community
          </span>
        </div>

        {/* Center Pitch & Steps Indicator */}
        <div className="relative z-10 my-auto py-6 space-y-7 max-w-lg">
          <div className="space-y-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-300 text-xs font-extrabold uppercase tracking-wider border border-indigo-500/30">
              ✨ Account Setup in 3 Easy Steps
            </span>
            <h1 className="text-3xl lg:text-4xl font-black leading-tight tracking-tight text-white drop-shadow-sm">
              Register, Verify & Secure with 4-Digit PIN.
            </h1>
            <p className="text-sm text-slate-300 font-normal leading-relaxed">
              Complete your profile, verify your mobile number via OTP, and set a fast 4-digit PIN for instant access anytime.
            </p>
          </div>

          {/* Interactive Progress Indicators */}
          <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800">
            <div className={`p-3 rounded-xl text-center transition-all ${step === "details" ? "bg-indigo-600 text-white font-bold" : "text-slate-400 font-semibold"}`}>
              <p className="text-[10px] uppercase tracking-wider opacity-75">Step 1</p>
              <p className="text-xs font-extrabold truncate">Your Details</p>
            </div>
            <div className={`p-3 rounded-xl text-center transition-all ${step === "otp" ? "bg-indigo-600 text-white font-bold" : "text-slate-400 font-semibold"}`}>
              <p className="text-[10px] uppercase tracking-wider opacity-75">Step 2</p>
              <p className="text-xs font-extrabold truncate">OTP Verify</p>
            </div>
            <div className={`p-3 rounded-xl text-center transition-all ${step === "pin" ? "bg-indigo-600 text-white font-bold" : "text-slate-400 font-semibold"}`}>
              <p className="text-[10px] uppercase tracking-wider opacity-75">Step 3</p>
              <p className="text-xs font-extrabold truncate">Set PIN</p>
            </div>
          </div>

          {/* 3 Feature Badges */}
          <div className="grid grid-cols-1 gap-2.5">
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800/60 backdrop-blur-md">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-indigo-500/20 text-indigo-400">
                <ShoppingBag className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">Direct Marketplace</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Discover products and electronics near you with 0% middleman fees.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800/60 backdrop-blur-md">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-amber-500/20 text-amber-400">
                <Briefcase className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">Jobs & Business Stores</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Post openings, apply for vacancies, or launch your digital storefront.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Platform Metrics */}
        <div className="relative z-10 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-indigo-400" />
            <span className="font-semibold text-slate-200">15,000+ Verified Members</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-400 font-bold">
            <Star className="h-3.5 w-3.5 fill-amber-400" />
            <span>4.9 Rating</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL (STEPPED REGISTRATION FLOW) ── */}
      <div className="relative w-full md:w-1/2 lg:w-[52%] xl:w-[55%] flex flex-col justify-between p-5 sm:p-8 lg:p-10 bg-background min-h-screen md:min-h-0 overflow-y-auto">
        <DecorShapes />

        {/* Top Navigation Bar */}
        <div className="relative z-10 flex items-center justify-between mb-4">
          <button
            type="button"
            aria-label="Go back"
            onClick={() => {
              if (step === "pin") setStep("otp");
              else if (step === "otp") setStep("details");
              else nav({ to: "/login" });
            }}
            className="grid h-10 w-10 place-items-center rounded-full bg-card ring-1 border border-border shadow-sm active:scale-95 transition-transform hover:bg-secondary cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          
          <div className="md:hidden flex items-center">
            <Logo size="sm" />
          </div>

          <div className="text-xs font-semibold text-muted-foreground">
            Have an account?{" "}
            <Link to="/login" className="font-extrabold text-indigo-brand hover:underline">
              Sign in
            </Link>
          </div>
        </div>

        {/* Main Step Container */}
        <div className="relative z-10 my-auto mx-auto w-full max-w-xl space-y-5">
          
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 1: USER DETAILS FORM                                                 */}
          {/* ========================================================================= */}
          {step === "details" && (
            <div className="space-y-4">
              <div className="space-y-1 text-center md:text-left">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-brand/10 text-indigo-brand text-[11px] font-bold">
                  Step 1 of 3 · Profile Information
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  Create Your Account
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Enter your details. We'll verify your mobile number in the next step.
                </p>
              </div>

              <form onSubmit={handleProceedToOtp} className="space-y-4" noValidate>
                {/* Avatar & Photo Picker */}
                <div className="flex flex-col sm:flex-row items-center gap-4 p-3.5 rounded-2xl bg-secondary/30 border border-border">
                  <label className="relative cursor-pointer group shrink-0" aria-label="Upload profile picture">
                    <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-full border-2 border-indigo-brand bg-muted shadow-sm transition-transform group-hover:scale-105">
                      <img src={currentAvatar} alt="Profile preview" className="h-full w-full object-cover" />
                    </div>
                    <span className="absolute bottom-0 right-0 grid h-6 w-6 place-items-center rounded-full bg-indigo-brand text-white shadow-md ring-2 ring-background">
                      <Camera className="h-3 w-3" />
                    </span>
                    <input type="file" accept="image/*" className="hidden" onChange={pickAvatar} />
                  </label>

                  <div className="flex-1 text-center sm:text-left space-y-1.5">
                    <p className="text-xs font-bold text-foreground">Profile Picture / Avatar</p>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                      {[
                        { key: "male", label: "Male Avatar" },
                        { key: "female", label: "Female Avatar" },
                        { key: "other", label: "Custom" }
                      ].map((g) => (
                        <button
                          key={g.key}
                          type="button"
                          onClick={() => handleSelectGender(g.key as any)}
                          className={`rounded-full px-3 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                            (gender === g.key || avatar === DEFAULT_AVATARS[g.key as keyof typeof DEFAULT_AVATARS])
                              ? "bg-indigo-brand text-white shadow-xs"
                              : "bg-card border border-border text-muted-foreground hover:bg-secondary"
                          }`}
                        >
                          {g.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2-Column Grid on Laptop */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1">Full Name *</label>
                    <div className="flex items-center gap-2.5 rounded-2xl border border-border bg-card px-3.5 py-3 focus-within:border-indigo-brand focus-within:ring-2 focus-within:ring-indigo-brand/20 transition-all">
                      <User className="h-4 w-4 text-muted-foreground shrink-0" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rahul Sharma"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-transparent text-sm font-bold text-foreground outline-none placeholder:font-normal placeholder:text-muted-foreground/60"
                      />
                    </div>
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1">Mobile Number (10 Digits) *</label>
                    <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-3.5 py-3 focus-within:border-indigo-brand focus-within:ring-2 focus-within:ring-indigo-brand/20 transition-all">
                      <span className="text-xs font-extrabold text-foreground font-mono">+91</span>
                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        required
                        placeholder="9876543210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        className="w-full bg-transparent text-sm font-bold text-foreground outline-none placeholder:font-normal placeholder:text-muted-foreground/60 font-mono"
                      />
                    </div>
                  </div>

                  {/* Email Address */}
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1">Email Address</label>
                    <div className="flex items-center gap-2.5 rounded-2xl border border-border bg-card px-3.5 py-3 focus-within:border-indigo-brand focus-within:ring-2 focus-within:ring-indigo-brand/20 transition-all">
                      <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-transparent text-sm font-bold text-foreground outline-none placeholder:font-normal placeholder:text-muted-foreground/60"
                      />
                    </div>
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1">City *</label>
                    <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-3.5 py-3 focus-within:border-indigo-brand transition-all">
                      <MapPinned className="h-4 w-4 text-muted-foreground shrink-0" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Hyderabad"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full bg-transparent text-sm font-bold text-foreground outline-none"
                      />
                    </div>
                  </div>

                  {/* PIN Code */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-muted-foreground mb-1">Postal PIN Code (6 Digits) *</label>
                    <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-3.5 py-3 focus-within:border-indigo-brand transition-all">
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        required
                        placeholder="500081"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        className="w-full bg-transparent text-sm font-bold text-foreground outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Account Type */}
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1.5">Account Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setAccountType("individual")}
                      className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                        accountType === "individual"
                          ? "border-indigo-brand bg-indigo-brand/10 text-indigo-brand font-extrabold ring-1 ring-indigo-brand/30"
                          : "border-border bg-card text-muted-foreground font-semibold hover:border-border/80"
                      }`}
                    >
                      <div className={`grid h-8 w-8 place-items-center rounded-xl shrink-0 ${accountType === "individual" ? "bg-indigo-brand text-white" : "bg-muted text-muted-foreground"}`}>
                        <ShoppingBag className="h-4 w-4" />
                      </div>
                      <div className="text-xs min-w-0">
                        <p className="font-extrabold text-foreground">Individual</p>
                        <p className="text-[10px] text-muted-foreground truncate">Personal Buy & Sell</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAccountType("business")}
                      className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                        accountType === "business"
                          ? "border-indigo-brand bg-indigo-brand/10 text-indigo-brand font-extrabold ring-1 ring-indigo-brand/30"
                          : "border-border bg-card text-muted-foreground font-semibold hover:border-border/80"
                      }`}
                    >
                      <div className={`grid h-8 w-8 place-items-center rounded-xl shrink-0 ${accountType === "business" ? "bg-indigo-brand text-white" : "bg-muted text-muted-foreground"}`}>
                        <StoreIcon className="h-4 w-4" />
                      </div>
                      <div className="text-xs min-w-0">
                        <p className="font-extrabold text-foreground">Business</p>
                        <p className="text-[10px] text-muted-foreground truncate">Local Store & Jobs</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Preferred Language */}
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1.5">Preferred Language</label>
                  <div className="flex items-center gap-2">
                    {[
                      { code: "en", label: "English" },
                      { code: "te", label: "తెలుగు" },
                      { code: "hi", label: "हिन्दी" },
                    ].map((l) => (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => setLang(l.code)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                          lang === l.code ? "border-indigo-brand bg-indigo-brand text-white shadow-xs" : "border-border bg-card text-muted-foreground hover:bg-secondary"
                        }`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit Step 1 */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={!canSubmitDetails}
                    className="w-full h-12 rounded-2xl bg-indigo-brand text-white font-extrabold text-sm flex items-center justify-center gap-2 hover:bg-indigo-brand/90 transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Sending OTP..." : "Continue & Send OTP"}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: OTP VERIFICATION                                                  */}
          {/* ========================================================================= */}
          {step === "otp" && (
            <div className="space-y-5">
              <div className="space-y-1 text-center md:text-left">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-[11px] font-bold">
                  Step 2 of 3 · Verify Mobile Number
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  Enter 4-Digit OTP
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  We have sent a verification code to <span className="font-bold text-foreground font-mono">+91 {cleanPhone}</span>.
                </p>
                <button
                  type="button"
                  onClick={() => setStep("details")}
                  className="text-xs font-extrabold text-indigo-brand hover:underline cursor-pointer"
                >
                  Edit Mobile Number or Details
                </button>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-2">
                    Enter Verification Code *
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      ref={otpInputRef}
                      type="tel"
                      inputMode="numeric"
                      maxLength={4}
                      autoFocus
                      required
                      placeholder="• • • •"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      className="w-full h-14 rounded-2xl border border-border bg-card text-center text-2xl font-black tracking-widest text-foreground outline-none focus:border-indigo-brand focus:ring-2 focus:ring-indigo-brand/20 font-mono"
                    />
                  </div>
                    <p className="mt-2 text-xs text-muted-foreground flex items-center justify-end">
                      {resendCooldown > 0 ? (
                        <span className="text-slate-400 font-mono">Resend OTP in {resendCooldown}s</span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          className="text-indigo-brand font-bold hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <RefreshCw className="h-3 w-3" /> Resend OTP
                        </button>
                      )}
                    </p>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={otpCode.length !== 4 || isSubmitting}
                    className="w-full h-12 rounded-2xl bg-indigo-brand text-white font-extrabold text-sm flex items-center justify-center gap-2 hover:bg-indigo-brand/90 transition-all shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? "Verifying OTP..." : "Verify OTP & Set PIN"}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: SET 4-DIGIT PIN                                                   */}
          {/* ========================================================================= */}
          {step === "pin" && (
            <div className="space-y-5">
              <div className="space-y-1 text-center md:text-left">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[11px] font-bold">
                  Step 3 of 3 · Fast Login Security
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  Set Your 4-Digit PIN
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Choose a 4-digit numeric PIN for quick sign-in without waiting for an OTP next time.
                </p>
              </div>

              <form onSubmit={handleCompleteRegistration} className="space-y-4">
                {/* PIN Input */}
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">Create 4-Digit PIN *</label>
                  <div className="flex items-center gap-2.5 rounded-2xl border border-border bg-card px-3.5 py-3 focus-within:border-indigo-brand focus-within:ring-2 focus-within:ring-indigo-brand/20 transition-all">
                    <KeyRound className="h-4 w-4 text-muted-foreground shrink-0" />
                    <input
                      type={showPin ? "text" : "password"}
                      inputMode="numeric"
                      maxLength={4}
                      autoFocus
                      required
                      placeholder="e.g. 1234"
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      className="w-full bg-transparent text-base font-bold text-foreground outline-none font-mono tracking-widest placeholder:tracking-normal placeholder:font-normal placeholder:text-muted-foreground/60"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm PIN Input */}
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">Confirm 4-Digit PIN *</label>
                  <div className="flex items-center gap-2.5 rounded-2xl border border-border bg-card px-3.5 py-3 focus-within:border-indigo-brand focus-within:ring-2 focus-within:ring-indigo-brand/20 transition-all">
                    <KeyRound className="h-4 w-4 text-muted-foreground shrink-0" />
                    <input
                      type={showPin ? "text" : "password"}
                      inputMode="numeric"
                      maxLength={4}
                      required
                      placeholder="Re-enter 4-digit PIN"
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      className="w-full bg-transparent text-base font-bold text-foreground outline-none font-mono tracking-widest placeholder:tracking-normal placeholder:font-normal placeholder:text-muted-foreground/60"
                    />
                  </div>
                  {pin && confirmPin && pin !== confirmPin && (
                    <p className="mt-1 text-xs text-rose-500 font-bold">
                      PIN numbers do not match yet.
                    </p>
                  )}
                  {pin && confirmPin && pin === confirmPin && (
                    <p className="mt-1 text-xs text-emerald-600 font-bold flex items-center gap-1">
                      <Check className="h-3.5 w-3.5" /> PIN matched!
                    </p>
                  )}
                </div>

                {/* Submit Step 3 */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={pin.length !== 4 || pin !== confirmPin || isSubmitting}
                    className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? "Completing Registration..." : "Save PIN & Complete Registration ✓"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Switch to Login */}
          <div className="text-center pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground font-semibold">
              Already registered?{" "}
              <Link to="/login" className="text-indigo-brand font-extrabold hover:underline">
                Sign in with your PIN
              </Link>
            </p>
          </div>
        </div>

        {/* Legal Footer */}
        <div className="relative z-10 pt-4 text-center">
          <p className="text-[11.5px] leading-relaxed text-muted-foreground">
            By registering, you agree to Omeetso's{" "}
            <Link to="/terms" className="font-bold text-foreground underline underline-offset-2">Terms</Link>{" "}
            and{" "}
            <Link to="/privacy" className="font-bold text-foreground underline underline-offset-2">Privacy Policy</Link>.
          </p>
        </div>

      </div>

    </div>
  );
}

function DecorShapes() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-24 -left-16 h-64 w-64 rounded-full bg-indigo-brand/12 blur-3xl" />
      <div className="absolute top-10 -right-16 h-56 w-56 rounded-full bg-yellow-brand/20 blur-3xl" />
      <div className="absolute -bottom-24 left-1/2 h-56 w-72 -translate-x-1/2 rounded-full bg-slate-500/10 blur-3xl" />
    </div>
  );
}
