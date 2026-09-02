import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/omeetso/Logo";
import {
  ArrowLeft, ArrowRight, ShieldCheck, X, Loader2,
  Compass, Store, Lock, Eye, EyeOff, AlertCircle, Sparkles,
  MessageSquare, Zap, CheckCircle2, Star, Users, UserPlus, KeyRound, Phone, UserX
} from "lucide-react";
import { loginUserApi, checkPhoneStatusApi, requestUserOtp, verifyUserOtp, resetUserPinApi } from "@/api/auth.api";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Sign in · Omeetso" },
      { name: "description", content: "Sign in to Omeetso — buy nearby, sell quickly, post jobs, and connect with trusted local sellers." },
      { property: "og:title", content: "Sign in · Omeetso" },
      { property: "og:description", content: "Buy nearby, sell quickly, post jobs, and connect with trusted local sellers." },
      { property: "og:type", content: "website" },
    ],
  }),
});

type LoginStep = "phone" | "pin" | "not_registered" | "otp_fallback" | "forgot_pin";

function LoginPage() {
  const nav = useNavigate();
  const [step, setStep] = useState<LoginStep>("phone");
  const [phone, setPhone] = useState("");
  const [registeredName, setRegisteredName] = useState("");
  const [registeredAvatar, setRegisteredAvatar] = useState<string | null>(null);

  // PIN step
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(true);

  // Forgot PIN step
  const [forgotOtp, setForgotOtp] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  // OTP Fallback
  const [otpCode, setOtpCode] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [guestSheet, setGuestSheet] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const phoneInputRef = useRef<HTMLInputElement | null>(null);

  const cleanPhone = phone.replace(/\D/g, "").slice(0, 10);
  const isValidPhone = cleanPhone.length === 10;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const pendingPhone = localStorage.getItem("omeetso_pending_phone");
    if (pendingPhone) setPhone(pendingPhone.replace(/\D/g, "").slice(-10));
  }, []);

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setInterval(() => {
      setResendCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCountdown]);

  // STEP 1: CHECK PHONE NUMBER
  const handleCheckPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidPhone || isLoading) return;

    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await checkPhoneStatusApi(cleanPhone);
      setIsLoading(false);

      if (res.success && res.data) {
        if (res.data.exists) {
          // User is registered! Ask for PIN
          setRegisteredName(res.data.name || "User");
          setRegisteredAvatar(res.data.avatar || null);
          setStep("pin");
        } else {
          // User is NOT registered! Show registration prompt
          if (typeof window !== "undefined") {
            localStorage.setItem("omeetso_pending_phone", cleanPhone);
          }
          setStep("not_registered");
        }
      } else {
        setErrorMessage(res.error || "Failed to check phone number. Please try again.");
      }
    } catch {
      setIsLoading(false);
      // Dev fallback: if user exists in login, ask pin
      setStep("pin");
    }
  };

  // STEP 2: VERIFY PIN & SIGN IN
  const handlePinLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pin.replace(/\D/g, "");
    if (cleanPin.length !== 4 || isLoading) {
      setErrorMessage("Please enter your 4-digit PIN.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    const res = await loginUserApi(cleanPhone, cleanPin);
    setIsLoading(false);

    if (res.success) {
      toast.success(`Welcome back${registeredName ? `, ${registeredName}` : ""}! Signed in successfully.`);
      nav({ to: "/home" });
    } else {
      setErrorMessage(res.error || "Incorrect 4-digit PIN. Please try again.");
      toast.error(res.error || "Sign in failed");
    }
  };

  // OTP Fallback Login
  const handleSendOtpFallback = async () => {
    setIsLoading(true);
    setErrorMessage("");
    const res = await requestUserOtp(cleanPhone);
    setIsLoading(false);
    if (res.success) {
      toast.success(`OTP sent to +91 ${cleanPhone}.`);
      setStep("otp_fallback");
    } else {
      toast.error(res.error || "Failed to send OTP");
    }
  };

  const handleVerifyOtpFallback = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOtp = otpCode.replace(/\D/g, "");
    if (cleanOtp.length !== 4) {
      setErrorMessage("Please enter the 4-digit OTP.");
      return;
    }
    setIsLoading(true);
    setErrorMessage("");

    const res = await verifyUserOtp(cleanPhone, cleanOtp);
    setIsLoading(false);

    if (res.success) {
      toast.success("Signed in successfully via OTP!");
      nav({ to: "/home" });
    } else {
      setErrorMessage(res.error || "Invalid OTP code");
    }
  };

  // STEP 3: FORGOT PIN & RESET FLOW
  const handleStartForgotPin = async () => {
    setIsLoading(true);
    setErrorMessage("");
    setForgotOtp("");
    setNewPin("");
    setConfirmPin("");
    const res = await requestUserOtp(cleanPhone);
    setIsLoading(false);
    if (res.success) {
      toast.success(`Verification OTP sent to +91 ${cleanPhone}.`);
      setStep("forgot_pin");
      setResendCountdown(30);
    } else {
      toast.error(res.error || "Failed to send OTP to mobile");
      setErrorMessage(res.error || "Failed to send OTP");
    }
  };

  const handleResendForgotOtp = async () => {
    if (resendCountdown > 0 || isLoading) return;
    setIsLoading(true);
    const res = await requestUserOtp(cleanPhone);
    setIsLoading(false);
    if (res.success) {
      toast.success(`New verification OTP sent to +91 ${cleanPhone}.`);
      setResendCountdown(30);
    } else {
      toast.error(res.error || "Failed to resend OTP");
    }
  };

  const handleResetAndSavePin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOtp = forgotOtp.replace(/\D/g, "");
    const cleanNewPin = newPin.replace(/\D/g, "");
    const cleanConfirm = confirmPin.replace(/\D/g, "");

    if (cleanOtp.length !== 4) {
      setErrorMessage("Please enter the 4-digit verification code sent to your mobile.");
      return;
    }
    if (cleanNewPin.length !== 4) {
      setErrorMessage("New PIN must be exactly 4 digits.");
      return;
    }
    if (cleanNewPin !== cleanConfirm) {
      setErrorMessage("New PIN and Confirm PIN do not match. Please re-enter.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    const res = await resetUserPinApi(cleanPhone, cleanOtp, cleanNewPin);
    setIsLoading(false);

    if (res.success) {
      toast.success("🎉 PIN updated successfully! Welcome to Omeetso.");
      nav({ to: "/home" });
    } else {
      setErrorMessage(res.error || "Failed to update PIN. Please check your OTP and try again.");
      toast.error(res.error || "Failed to reset PIN");
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
        localStorage.setItem("omeetso_user", JSON.stringify({
          id: "usr_google_demo",
          phone: "+919876543210",
          accountType: "individual",
          status: "ACTIVE",
          profile: { name: "Google User", city: "Hyderabad", pincode: "500081", area: "Madhapur" }
        }));
        localStorage.setItem("omeetso_profile", "1");
        localStorage.removeItem("omeetso_guest");
        localStorage.removeItem("omeetso_guest_session");
      }
      toast.success("Signed in with Google");
      nav({ to: "/home" });
    }, 600);
  };

  return (
    <div className="relative min-h-screen w-full bg-background text-foreground flex flex-col md:flex-row overflow-x-hidden font-sans">
      
      {/* ── LEFT PANEL (DESKTOP BRANDING & FEATURES) ── */}
      <div className="hidden md:flex md:w-1/2 lg:w-[52%] relative flex-col justify-between p-8 lg:p-12 bg-slate-950 text-white border-r border-slate-800/80 overflow-hidden select-none">
        {/* Background Glows */}
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
          <Link to="/home">
            <Logo />
          </Link>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/90 text-amber-400 text-xs font-bold border border-slate-700/60 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" /> Verified Local Marketplace
          </span>
        </div>

        {/* Center Features */}
        <div className="relative z-10 my-auto py-8 space-y-8 max-w-lg">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-300 text-xs font-extrabold uppercase tracking-wider border border-indigo-500/30">
              ⚡ Fast & Secure PIN Access
            </span>
            <h1 className="text-3xl lg:text-4xl font-black leading-tight tracking-tight text-white drop-shadow-sm">
              Buy Nearby, Sell Quickly & Post Jobs with Ease.
            </h1>
            <p className="text-sm lg:text-base text-slate-300 font-normal leading-relaxed">
              Sign in with your registered phone number and 4-digit PIN for instant access without waiting for OTPs.
            </p>
          </div>

          <div className="space-y-3.5">
            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md transition-all hover:bg-slate-900 hover:border-slate-700">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-500/20 text-indigo-400">
                <Store className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Local Sellers & Verified Shops</h3>
                <p className="text-xs text-slate-400 mt-0.5">Explore authentic listings with direct contact with owners.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md transition-all hover:bg-slate-900 hover:border-slate-700">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-500/20 text-amber-400">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Instant Real-Time Chat</h3>
                <p className="text-xs text-slate-400 mt-0.5">Negotiate directly, exchange details, and close deals safely.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Social Proof */}
        <div className="relative z-10 pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-indigo-400" />
            <span className="font-semibold text-slate-200">15,000+ Active Users</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-400 font-bold">
            <Star className="h-3.5 w-3.5 fill-amber-400" />
            <span>4.9 / 5 Rating</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>100% Free</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL (LOGIN STEP FLOW) ── */}
      <div className="relative w-full md:w-1/2 lg:w-[48%] flex flex-col justify-between p-6 sm:p-10 lg:p-14 bg-background min-h-screen md:min-h-0 overflow-y-auto">
        <DecorShapes />

        {/* Top bar */}
        <div className="relative z-10 flex items-center justify-between mb-4">
          <button
            type="button"
            aria-label="Go back"
            onClick={() => {
              if (step === "pin" || step === "not_registered" || step === "otp_fallback") {
                setStep("phone");
              } else {
                history.length > 1 ? history.back() : nav({ to: "/home" });
              }
            }}
            className="grid h-10 w-10 place-items-center rounded-full bg-card ring-1 border border-border shadow-sm active:scale-95 transition-transform hover:bg-secondary cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div className="md:hidden flex items-center">
            <Logo size="sm" />
          </div>
          <div className="text-xs font-semibold text-muted-foreground">
            {step === "not_registered" ? (
              <span className="text-indigo-brand font-bold">New to Omeetso</span>
            ) : (
              <>
                New user?{" "}
                <Link to="/register" className="font-extrabold text-indigo-brand hover:underline">
                  Create account
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Center Container */}
        <div className="relative z-10 my-auto mx-auto w-full max-w-md space-y-6">
          
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 1: PHONE NUMBER INPUT                                                */}
          {/* ========================================================================= */}
          {step === "phone" && (
            <div className="space-y-6">
              <div className="space-y-1.5 text-center md:text-left">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                  Sign in to Omeetso
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Enter your registered mobile number to continue.
                </p>
              </div>

              <form onSubmit={handleCheckPhone} className="space-y-4" noValidate>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    Mobile Number (10 Digits) *
                  </label>
                  <div className="relative flex items-center rounded-2xl border border-border bg-card px-3.5 py-3 focus-within:border-indigo-brand focus-within:ring-2 focus-within:ring-indigo-brand/20 transition-all">
                    <span className="text-sm font-black text-foreground font-mono mr-2">+91</span>
                    <input
                      ref={phoneInputRef}
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      autoFocus
                      required
                      placeholder="98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      className="w-full bg-transparent text-base font-bold text-foreground outline-none placeholder:font-normal placeholder:text-muted-foreground font-mono tracking-wider"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!isValidPhone || isLoading}
                  className="relative flex h-[52px] w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-indigo-brand text-sm font-bold text-white shadow-md transition-all active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 hover:bg-indigo-brand/90 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Checking number…</span>
                    </>
                  ) : (
                    <>
                      <span>Continue</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Direct Register Link Card */}
              <div className="p-4 rounded-2xl bg-secondary/40 border border-border flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-foreground">Don't have an account?</p>
                  <p className="text-[11px] text-muted-foreground">Register once with OTP & PIN</p>
                </div>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-brand text-white text-xs font-bold hover:bg-indigo-brand/90 shadow-sm transition-all"
                >
                  Register
                </Link>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: USER IS NOT REGISTERED -> SHOW REGISTER PROMPT                    */}
          {/* ========================================================================= */}
          {step === "not_registered" && (
            <div className="space-y-6 text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-amber-500/10 text-amber-600 ring-4 ring-amber-500/10">
                <UserX className="h-8 w-8" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-black text-foreground">
                  No Account Found
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We couldn't find an account for <span className="font-bold text-foreground font-mono">+91 {cleanPhone}</span>.
                  <br />Please register to start buying, selling, and posting jobs.
                </p>
              </div>

              <div className="space-y-3">
                <Link
                  to="/register"
                  className="w-full h-12 rounded-2xl bg-indigo-brand text-white font-extrabold text-sm flex items-center justify-center gap-2 hover:bg-indigo-brand/90 transition-all shadow-md cursor-pointer"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Register Account with +91 {cleanPhone}</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setStep("phone")}
                  className="w-full py-2.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Try a different mobile number
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: USER IS REGISTERED -> ENTER 4-DIGIT PIN                           */}
          {/* ========================================================================= */}
          {step === "pin" && (
            <div className="space-y-6">
              <div className="space-y-2 text-center md:text-left">
                {registeredAvatar && (
                  <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-indigo-brand mx-auto md:mx-0 shadow-sm">
                    <img src={registeredAvatar} alt="Profile" className="h-full w-full object-cover" />
                  </div>
                )}
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                  Welcome back{registeredName ? `, ${registeredName}` : ""}!
                </h1>
                <div className="flex items-center justify-center md:justify-start gap-2 text-xs text-muted-foreground">
                  <span className="font-mono font-bold text-foreground">+91 {cleanPhone}</span>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => setStep("phone")}
                    className="font-bold text-indigo-brand hover:underline cursor-pointer"
                  >
                    Change
                  </button>
                </div>
              </div>

              <form onSubmit={handlePinLogin} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-foreground">
                      Enter 4-Digit PIN *
                    </label>
                    <button
                      type="button"
                      onClick={handleStartForgotPin}
                      className="text-[11px] font-bold text-indigo-brand hover:underline cursor-pointer"
                    >
                      Forgot PIN?
                    </button>
                  </div>

                  <div className="flex items-center gap-2.5 rounded-2xl border border-border bg-card px-3.5 py-3 focus-within:border-indigo-brand focus-within:ring-2 focus-within:ring-indigo-brand/20 transition-all">
                    <KeyRound className="h-4 w-4 text-muted-foreground shrink-0" />
                    <input
                      type={showPin ? "text" : "password"}
                      inputMode="numeric"
                      maxLength={4}
                      autoFocus
                      required
                      placeholder="Enter 4-digit PIN"
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      className="w-full bg-transparent text-base font-bold text-foreground outline-none font-mono tracking-widest placeholder:tracking-normal placeholder:font-normal placeholder:text-muted-foreground"
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

                <button
                  type="submit"
                  disabled={pin.length !== 4 || isLoading}
                  className="relative flex h-[52px] w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-indigo-brand text-sm font-bold text-white shadow-md transition-all active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 hover:bg-indigo-brand/90 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Signing in…</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3B: FORGOT PIN & RESET NEW PIN                                       */}
          {/* ========================================================================= */}
          {step === "forgot_pin" && (
            <div className="space-y-6 animate-in fade-in-50 duration-200">
              <div className="space-y-1.5 text-center md:text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-brand/10 text-indigo-brand text-xs font-bold mb-1">
                  <KeyRound className="h-3.5 w-3.5" />
                  <span>Reset Security PIN</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                  Create New 4-Digit PIN
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Enter the 4-digit code sent to <span className="font-bold text-foreground font-mono">+91 {cleanPhone}</span> and set your new PIN.
                </p>
              </div>

              <form onSubmit={handleResetAndSavePin} className="space-y-4">
                {/* OTP Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-foreground">
                      Enter 4-Digit OTP *
                    </label>
                    <button
                      type="button"
                      disabled={resendCountdown > 0 || isLoading}
                      onClick={handleResendForgotOtp}
                      className="text-[11px] font-bold text-indigo-brand hover:underline disabled:text-muted-foreground cursor-pointer disabled:cursor-not-allowed"
                    >
                      {resendCountdown > 0 ? `Resend code in ${resendCountdown}s` : "Resend OTP"}
                    </button>
                  </div>
                  <div className="flex items-center gap-2.5 rounded-2xl border border-border bg-card px-3.5 py-3 focus-within:border-indigo-brand focus-within:ring-2 focus-within:ring-indigo-brand/20 transition-all">
                    <ShieldCheck className="h-4 w-4 text-muted-foreground shrink-0" />
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={4}
                      autoFocus
                      required
                      placeholder="Enter 4-digit OTP"
                      value={forgotOtp}
                      onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      className="w-full bg-transparent text-base font-bold text-foreground outline-none font-mono tracking-widest placeholder:tracking-normal placeholder:font-normal placeholder:text-muted-foreground"
                    />
                  </div>
                </div>

                {/* New PIN Input */}
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    Set New 4-Digit PIN *
                  </label>
                  <div className="flex items-center gap-2.5 rounded-2xl border border-border bg-card px-3.5 py-3 focus-within:border-indigo-brand focus-within:ring-2 focus-within:ring-indigo-brand/20 transition-all">
                    <KeyRound className="h-4 w-4 text-muted-foreground shrink-0" />
                    <input
                      type={showNewPin ? "text" : "password"}
                      inputMode="numeric"
                      maxLength={4}
                      required
                      placeholder="Enter new 4-digit PIN"
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      className="w-full bg-transparent text-base font-bold text-foreground outline-none font-mono tracking-widest placeholder:tracking-normal placeholder:font-normal placeholder:text-muted-foreground"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPin(!showNewPin)}
                      className="text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {showNewPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm PIN Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-foreground">
                      Confirm New 4-Digit PIN *
                    </label>
                    {newPin && confirmPin && newPin === confirmPin && (
                      <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> PINs match
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2.5 rounded-2xl border border-border bg-card px-3.5 py-3 focus-within:border-indigo-brand focus-within:ring-2 focus-within:ring-indigo-brand/20 transition-all">
                    <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                    <input
                      type={showConfirmPin ? "text" : "password"}
                      inputMode="numeric"
                      maxLength={4}
                      required
                      placeholder="Confirm new 4-digit PIN"
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      className="w-full bg-transparent text-base font-bold text-foreground outline-none font-mono tracking-widest placeholder:tracking-normal placeholder:font-normal placeholder:text-muted-foreground"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPin(!showConfirmPin)}
                      className="text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {showConfirmPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={forgotOtp.length !== 4 || newPin.length !== 4 || confirmPin.length !== 4 || isLoading}
                  className="relative flex h-[52px] w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-indigo-brand text-sm font-bold text-white shadow-md transition-all active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 hover:bg-indigo-brand/90 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving PIN & Signing In…</span>
                    </>
                  ) : (
                    <>
                      <span>Save New PIN & Sign In</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>

                {/* Switchers */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => { setErrorMessage(""); setStep("pin"); }}
                    className="group inline-flex items-center gap-1.5 text-xs font-bold text-indigo-brand hover:underline cursor-pointer"
                  >
                    <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
                    <span>Back to PIN Sign In</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setErrorMessage(""); setStep("otp_fallback"); }}
                    className="text-xs font-bold text-muted-foreground hover:text-foreground hover:underline cursor-pointer"
                  >
                    Sign in with OTP only
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 4: OTP FALLBACK (FORGOT PIN)                                         */}
          {/* ========================================================================= */}
          {step === "otp_fallback" && (
            <div className="space-y-6">
              <div className="space-y-1.5 text-center md:text-left">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                  Sign In with OTP
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Enter the 4-digit OTP sent to <span className="font-bold text-foreground font-mono">+91 {cleanPhone}</span>.
                </p>
              </div>

              <form onSubmit={handleVerifyOtpFallback} className="space-y-4">
                <div>
                  <input
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

                <button
                  type="submit"
                  disabled={otpCode.length !== 4 || isLoading}
                  className="w-full h-12 rounded-2xl bg-indigo-brand text-white font-extrabold text-sm flex items-center justify-center gap-2 hover:bg-indigo-brand/90 transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? "Signing in..." : "Verify OTP & Sign In"}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setStep("pin")}
                    className="text-xs font-bold text-indigo-brand hover:underline cursor-pointer"
                  >
                    Back to PIN sign in
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Social Sign-In & Guest Browsing */}
          <div className="pt-2 space-y-3 border-t border-border">
            <button
              type="button"
              onClick={handleGoogle}
              disabled={googleLoading}
              className="flex h-[46px] w-full items-center justify-center gap-3 rounded-2xl border border-border bg-card text-xs font-bold transition-all hover:bg-secondary active:scale-[0.99] cursor-pointer disabled:opacity-60"
            >
              {googleLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              )}
              <span>Continue with Google</span>
            </button>

            <button
              type="button"
              onClick={() => setGuestSheet(true)}
              className="flex h-[44px] w-full items-center justify-center gap-2 rounded-2xl bg-secondary/50 text-xs font-bold text-muted-foreground transition-all hover:bg-secondary hover:text-foreground active:scale-[0.99] cursor-pointer"
            >
              <Compass className="h-4 w-4" />
              <span>Browse as Guest</span>
            </button>
          </div>
        </div>

        {/* Legal footer */}
        <div className="relative z-10 pt-4 text-center">
          <p className="text-[11.5px] leading-relaxed text-muted-foreground">
            By signing in, you agree to Omeetso's{" "}
            <Link to="/terms" className="font-bold text-foreground underline underline-offset-2">Terms</Link>{" "}
            and{" "}
            <Link to="/privacy" className="font-bold text-foreground underline underline-offset-2">Privacy Policy</Link>.
          </p>
        </div>
      </div>

      {/* Guest Mode Confirmation Modal */}
      {guestSheet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-card p-6 border border-border shadow-2xl space-y-4 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-indigo-brand/10 text-indigo-brand">
              <Compass className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Explore Omeetso as Guest</h3>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                You can browse listings, view stores, and search local jobs. You will only need to sign in when you want to chat or post.
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setGuestSheet(false)}
                className="flex-1 h-11 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:bg-secondary cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmGuest}
                className="flex-1 h-11 rounded-xl bg-indigo-brand text-xs font-bold text-white hover:bg-indigo-brand/90 cursor-pointer shadow-sm"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

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
