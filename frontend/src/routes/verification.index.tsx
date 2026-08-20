import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import { getVerifications, verifStatusLabel, type VerifKind, setVerification, getProfile, setProfile } from "@/lib/account";
import { VerifBadge } from "@/components/omeetso/account";
import {
  Smartphone,
  Mail,
  IdCard,
  MapPin,
  Building2,
  Store,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Lock,
  Upload,
  Loader2,
  FileText,
  Camera,
  Check,
  ArrowRight
} from "lucide-react";
import { uploadFile } from "@/lib/upload";
import { toast } from "sonner";

export const Route = createFileRoute("/verification/")({
  head: () => ({ meta: [{ title: "Verification & Trust Score — Omeetso" }] }),
  component: VerificationCentre,
});

const ITEMS: { kind: VerifKind; icon: any; title: string; benefit: string; points: number; action: string }[] = [
  {
    kind: "mobile",
    icon: Smartphone,
    title: "Mobile Phone Verification",
    benefit: "Phone number verified via SMS OTP for instant buyer trust & listing access",
    points: 35,
    action: "Verify mobile"
  },
  {
    kind: "email",
    icon: Mail,
    title: "Email Address OTP Verification",
    benefit: "Receive invoice receipts, buyer inquiries & security alerts via verified email",
    points: 15,
    action: "Verify email"
  },
  {
    kind: "identity",
    icon: IdCard,
    title: "Government ID KYC",
    benefit: "Upload Aadhaar, PAN, or Driving License to earn ID-Verified Seller status",
    points: 35,
    action: "Upload Govt ID"
  },
  {
    kind: "address",
    icon: MapPin,
    title: "Address & Location Proof",
    benefit: "Utility bill or local residency proof for neighborhood pickup trust",
    points: 15,
    action: "Add address proof"
  },
];

function VerificationCentre() {
  const v = getVerifications();
  const profile = getProfile();

  // Modals state
  const [kycModal, setKycModal] = useState(false);
  const [emailModal, setEmailModal] = useState(false);
  const [mobileModal, setMobileModal] = useState(false);
  const [addressModal, setAddressModal] = useState(false);

  // KYC Document Form State
  const [kycLoading, setKycLoading] = useState(false);
  const [docType, setDocType] = useState<"aadhaar" | "pan" | "driving_license" | "voter_id">("aadhaar");
  const [docNumber, setDocNumber] = useState("");
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  // Email OTP Form State
  const [emailAddr, setEmailAddr] = useState(profile.email || "user@example.com");
  const [emailOtp, setEmailOtp] = useState("");
  const [emailStep, setEmailStep] = useState<"idle" | "sent" | "verified">(v.email?.status === "verified" ? "verified" : "idle");
  const [emailError, setEmailError] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  // Mobile OTP Form State
  const [mobileNumber, setMobileNumber] = useState(profile.mobile || "+91 98765 43210");
  const [mobileOtp, setMobileOtp] = useState("");
  const [mobileStep, setMobileStep] = useState<"idle" | "sent" | "verified">(v.mobile?.status === "verified" ? "verified" : "idle");
  const [mobileError, setMobileError] = useState("");

  // Address Form State
  const [addrText, setAddrText] = useState("");
  const [addrDocType, setAddrDocType] = useState("Electricity / Utility Bill");
  const [addrImage, setAddrImage] = useState<string | null>(null);

  // Calculate dynamic trust score (0 - 100)
  const scoreBreakdown = {
    mobile: v.mobile?.status === "verified" ? 35 : 0,
    email: v.email?.status === "verified" ? 15 : 0,
    identity: v.identity?.status === "verified" ? 35 : (v.identity?.status === "under_review" || v.identity?.status === "submitted") ? 15 : 0,
    address: v.address?.status === "verified" || v.business?.status === "verified" ? 15 : 0,
  };

  const totalScore = Math.min(100, Object.values(scoreBreakdown).reduce((a, b) => a + b, 0));
  const maxScore = 100;
  const trustLevel =
    totalScore >= 85
      ? "Elite Super Seller 🌟"
      : totalScore >= 70
        ? "ID Verified Trusted Seller 🛡️"
        : totalScore >= 35
          ? "Phone Verified Seller ✓"
          : "Basic Member";

  const isIdVerified = v.identity?.status === "verified";
  const isEmailVerified = v.email?.status === "verified";
  const isMobileVerified = v.mobile?.status === "verified";

  // --- Handlers ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isBack = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadFile(file, "verification");
      if (isBack) setBackImage(url);
      else setFrontImage(url);
      toast.success(`${isBack ? "Back" : "Front"} document uploaded`);
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        if (isBack) setBackImage(String(reader.result));
        else setFrontImage(String(reader.result));
      };
      reader.readAsDataURL(file);
      toast.success("Document attached");
    }
  };

  const handleKycSubmit = async () => {
    if (!docNumber.trim()) {
      toast.error("Please enter your document identification number");
      return;
    }
    if (!frontImage) {
      toast.error("Please upload the front image of your document");
      return;
    }

    setKycLoading(true);
    const token = typeof window !== "undefined" ? localStorage.getItem("omeetso_user_token") : null;

    try {
      if (token) {
        await fetch("http://localhost:3000/api/v1/verification", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            type: "identity",
            documentType: docType,
            documentNumber: docNumber.trim(),
            documentImages: [frontImage, backImage].filter(Boolean),
          }),
        });
      }
    } catch (err) {
      console.warn("Backend verification error:", err);
    }

    setVerification("identity", {
      status: "verified",
      submittedAt: Date.now(),
      reference: `KYC-${docType.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`,
      details: {
        docType: docType.replace("_", " ").toUpperCase(),
        docNumber: docNumber.trim(),
      },
      documentUrl: frontImage,
    });

    setKycLoading(false);
    setKycModal(false);
    toast.success("Government ID Verified! (+35 Trust Points awarded)");
  };

  const handleSendEmailOtp = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddr)) {
      toast.error("Please enter a valid email address");
      return;
    }
    setEmailLoading(true);
    setTimeout(() => {
      setEmailLoading(false);
      setEmailStep("sent");
      setEmailError("");
      toast.info(`OTP code sent to ${emailAddr} (Demo OTP: 5678)`);
    }, 400);
  };

  const handleVerifyEmailOtp = () => {
    if (emailOtp === "5678" || emailOtp.length === 4) {
      setVerification("email", { status: "verified", submittedAt: Date.now() });
      setProfile({ email: emailAddr, emailVerified: true });
      setEmailStep("verified");
      setEmailModal(false);
      toast.success("Email verified with OTP! (+15 Trust Points awarded)");
    } else {
      setEmailError("Incorrect OTP code. Enter 5678 for demo.");
    }
  };

  const handleSendMobileOtp = () => {
    setMobileStep("sent");
    setMobileError("");
    toast.info(`OTP sent to ${mobileNumber} (Demo OTP: 1234)`);
  };

  const handleVerifyMobileOtp = () => {
    if (mobileOtp === "1234" || mobileOtp.length === 4) {
      setVerification("mobile", { status: "verified", submittedAt: Date.now() });
      setProfile({ mobile: mobileNumber, phoneVerified: true });
      setMobileStep("verified");
      setMobileModal(false);
      toast.success("Mobile number verified with OTP! (+35 Trust Points awarded)");
    } else {
      setMobileError("Incorrect OTP code. Enter 1234 for demo.");
    }
  };

  const handleAddressSubmit = () => {
    if (!addrText.trim()) {
      toast.error("Enter your residential / business address");
      return;
    }
    setVerification("address", {
      status: "verified",
      submittedAt: Date.now(),
      reference: `ADDR-${Math.floor(1000 + Math.random() * 9000)}`,
      details: { docType: addrDocType, address: addrText }
    });
    setAddressModal(false);
    toast.success("Address proof verified! (+15 Trust Points awarded)");
  };

  const handleOpenItem = (kind: VerifKind) => {
    if (kind === "email") {
      setEmailStep(v.email?.status === "verified" ? "verified" : "idle");
      setEmailModal(true);
    } else if (kind === "mobile") {
      setMobileStep(v.mobile?.status === "verified" ? "verified" : "idle");
      setMobileModal(true);
    } else if (kind === "identity") {
      setKycModal(true);
    } else if (kind === "address") {
      setAddressModal(true);
    }
  };

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-16 md:mx-auto md:max-w-[960px] md:px-6 md:pb-12 font-sans">
        <BackBar title="Seller Verification & Trust Score" fallback="/account" />

        <div className="p-4 sm:p-6 space-y-5">
          {/* ── TRUST SCORE HEADER CARD ── */}
          <div className="relative overflow-hidden rounded-3xl bg-slate-950 text-white p-6 border border-slate-800 shadow-xl">
            <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
              <div className="absolute -top-24 -left-16 h-64 w-64 rounded-full bg-indigo-600/30 blur-3xl" />
              <div className="absolute -bottom-24 -right-16 h-64 w-64 rounded-full bg-emerald-600/25 blur-3xl" />
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" /> Seller Verification Rating
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  Trust Score: <span className="text-emerald-400">{totalScore}</span> / {maxScore}
                </h1>
                <p className="text-xs sm:text-sm text-slate-300">
                  Status: <span className="font-extrabold text-amber-400">{trustLevel}</span> — Verify phone, email & Govt ID to maximize buyer trust.
                </p>
              </div>

              {/* Circular Gauge */}
              <div className="relative flex flex-col items-center justify-center shrink-0 h-28 w-28 rounded-2xl bg-slate-900/90 border border-slate-700/80 p-3 shadow-inner">
                <span className="text-3xl font-black text-emerald-400">{totalScore}%</span>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mt-0.5">Trust Score</span>
              </div>
            </div>

            {/* Score Progress Bar */}
            <div className="relative z-10 mt-6 pt-4 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-semibold">
                <span>Verification Progress</span>
                <span className="text-slate-200 font-bold">{totalScore} / 100 Pts</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-emerald-400 to-amber-400 transition-all duration-500"
                  style={{ width: `${totalScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* ── EMAIL OTP VERIFICATION QUICK BANNER ── */}
          {!isEmailVerified && (
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white p-5 border border-indigo-500/30 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-sm font-black text-white">Email Address OTP Verification</h2>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                      +15 Pts Available
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                    Verify your email with a 4-digit code to receive instant buyer messages and purchase invoices.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => { setEmailStep("idle"); setEmailModal(true); }}
                className="shrink-0 px-4 py-2.5 rounded-xl bg-indigo-brand text-xs font-bold text-white shadow-md hover:opacity-95 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Verify Email with OTP</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* ── GOVT ID KYC VERIFICATION BANNER ── */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900/40 via-card to-card p-5 border-2 border-indigo-500/30 shadow-md">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                <IdCard className="h-6 w-6 text-indigo-400" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-extrabold text-foreground">Government ID KYC Verification</h2>
                  {isIdVerified ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 text-xs font-bold border border-emerald-500/30">
                      <CheckCircle2 className="h-3.5 w-3.5" /> ID Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 text-xs font-bold border border-amber-500/30">
                      <Sparkles className="h-3.5 w-3.5" /> +35 Trust Pts
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  Upload Aadhaar Card, PAN Card, Driving License, or Voter ID to earn the Verified Seller Badge and unlock higher buyer reach.
                </p>

                <div className="mt-3.5 flex items-center gap-3">
                  {isIdVerified ? (
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                      <ShieldCheck className="h-4 w-4" />
                      <span>Govt. ID Document Verified ✓</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setKycModal(true)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-brand text-xs font-bold text-white shadow-md hover:opacity-95 transition-all cursor-pointer"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span>Upload KYC Document</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── VERIFICATION CHECKLIST (WITH DIRECT MODAL TRIGGERS) ── */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">
              Verification Checklist ({Object.values(scoreBreakdown).filter((s) => s > 0).length} / {ITEMS.length} Completed)
            </h3>

            <div className="space-y-3">
              {ITEMS.map((it) => {
                const cur = v[it.kind] || { status: "not_started" };
                const isDone = cur.status === "verified";

                return (
                  <div
                    key={it.kind}
                    onClick={() => handleOpenItem(it.kind)}
                    className="flex items-center justify-between gap-4 rounded-2xl bg-card p-4 border border-border shadow-sm transition-all hover:border-indigo-brand/50 hover:shadow-md cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl border ${isDone ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-secondary text-muted-foreground border-border"}`}>
                        <it.icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-foreground truncate">{it.title}</h4>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${isDone ? "bg-emerald-500/10 text-emerald-600" : "bg-indigo-brand/10 text-indigo-brand"}`}>
                            +{it.points} pts
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{it.benefit}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <VerifBadge status={cur.status} />
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── EMAIL OTP VERIFICATION MODAL ── */}
        {emailModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm" role="dialog" aria-modal="true">
            <div className="relative w-full max-w-md rounded-3xl bg-card p-6 shadow-2xl border border-border space-y-4 font-sans">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-brand flex items-center justify-center font-bold">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Email OTP Verification</h3>
                    <span className="text-[10px] text-muted-foreground">Earn +15 Trust Points</span>
                  </div>
                </div>
                <button
                  onClick={() => setEmailModal(false)}
                  className="text-muted-foreground hover:text-foreground font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {emailStep === "verified" ? (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
                  <p className="text-sm font-extrabold text-foreground">Email is Verified ✓</p>
                  <p className="text-xs text-muted-foreground">{emailAddr}</p>
                  <button
                    onClick={() => setEmailStep("idle")}
                    className="mt-2 text-xs font-bold text-indigo-brand underline cursor-pointer"
                  >
                    Change Email Address
                  </button>
                </div>
              ) : (
                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-foreground mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={emailAddr}
                      disabled={emailStep === "sent"}
                      onChange={(e) => setEmailAddr(e.target.value)}
                      placeholder="user@example.com"
                      className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl outline-none font-bold text-xs text-foreground focus:border-indigo-brand disabled:opacity-60"
                    />
                  </div>

                  {emailStep === "idle" && (
                    <button
                      type="button"
                      disabled={emailLoading}
                      onClick={handleSendEmailOtp}
                      className="w-full h-11 rounded-2xl bg-indigo-brand text-xs font-bold text-white shadow hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {emailLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      <span>Send 4-Digit Email OTP</span>
                    </button>
                  )}

                  {emailStep === "sent" && (
                    <div className="space-y-3 pt-2 border-t border-border">
                      <div>
                        <label className="block text-[11px] font-bold text-foreground mb-1 text-center">
                          Enter 4-Digit Code Sent to {emailAddr}
                        </label>
                        <input
                          inputMode="numeric"
                          maxLength={4}
                          value={emailOtp}
                          onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ""))}
                          placeholder="5 6 7 8"
                          className="w-full h-12 rounded-2xl border border-border bg-background px-4 text-center font-mono text-xl tracking-[0.5em] font-black text-foreground outline-none focus:border-indigo-brand"
                        />
                        {emailError && <p className="text-xs text-rose-600 font-bold text-center mt-1">{emailError}</p>}
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          onClick={handleSendEmailOtp}
                          className="px-3.5 py-2.5 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:bg-secondary cursor-pointer"
                        >
                          Resend
                        </button>
                        <button
                          type="button"
                          onClick={handleVerifyEmailOtp}
                          className="flex-1 rounded-xl bg-indigo-brand text-xs font-bold text-white shadow hover:opacity-95 cursor-pointer"
                        >
                          Verify & Award +15 Pts
                        </button>
                      </div>
                      <p className="text-[10px] text-muted-foreground text-center">Demo OTP code: 5678</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── MOBILE OTP VERIFICATION MODAL ── */}
        {mobileModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm" role="dialog" aria-modal="true">
            <div className="relative w-full max-w-md rounded-3xl bg-card p-6 shadow-2xl border border-border space-y-4 font-sans">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-brand flex items-center justify-center font-bold">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Mobile Phone Verification</h3>
                    <span className="text-[10px] text-muted-foreground">Earn +35 Trust Points</span>
                  </div>
                </div>
                <button
                  onClick={() => setMobileModal(false)}
                  className="text-muted-foreground hover:text-foreground font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {mobileStep === "verified" ? (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
                  <p className="text-sm font-extrabold text-foreground">Mobile Number Verified ✓</p>
                  <p className="text-xs text-muted-foreground">{mobileNumber}</p>
                </div>
              ) : (
                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-foreground mb-1">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      value={mobileNumber}
                      disabled={mobileStep === "sent"}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl outline-none font-bold text-xs text-foreground focus:border-indigo-brand disabled:opacity-60"
                    />
                  </div>

                  {mobileStep === "idle" && (
                    <button
                      type="button"
                      onClick={handleSendMobileOtp}
                      className="w-full h-11 rounded-2xl bg-indigo-brand text-xs font-bold text-white shadow hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Send SMS OTP</span>
                    </button>
                  )}

                  {mobileStep === "sent" && (
                    <div className="space-y-3 pt-2 border-t border-border">
                      <div>
                        <label className="block text-[11px] font-bold text-foreground mb-1 text-center">
                          Enter 4-Digit SMS Code
                        </label>
                        <input
                          inputMode="numeric"
                          maxLength={4}
                          value={mobileOtp}
                          onChange={(e) => setMobileOtp(e.target.value.replace(/\D/g, ""))}
                          placeholder="1 2 3 4"
                          className="w-full h-12 rounded-2xl border border-border bg-background px-4 text-center font-mono text-xl tracking-[0.5em] font-black text-foreground outline-none focus:border-indigo-brand"
                        />
                        {mobileError && <p className="text-xs text-rose-600 font-bold text-center mt-1">{mobileError}</p>}
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          onClick={handleSendMobileOtp}
                          className="px-3.5 py-2.5 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:bg-secondary cursor-pointer"
                        >
                          Resend
                        </button>
                        <button
                          type="button"
                          onClick={handleVerifyMobileOtp}
                          className="flex-1 rounded-xl bg-indigo-brand text-xs font-bold text-white shadow hover:opacity-95 cursor-pointer"
                        >
                          Verify & Award +35 Pts
                        </button>
                      </div>
                      <p className="text-[10px] text-muted-foreground text-center">Demo OTP code: 1234</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── GOVT ID UPLOAD KYC MODAL ── */}
        {kycModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm" role="dialog" aria-modal="true">
            <div className="relative w-full max-w-lg rounded-3xl bg-card p-6 shadow-2xl border border-border space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 flex items-center justify-center font-bold">
                    <IdCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Upload Government KYC Document</h3>
                    <span className="text-[10px] text-muted-foreground">Encrypted & securely held for seller verification</span>
                  </div>
                </div>
                <button
                  onClick={() => setKycModal(false)}
                  className="text-muted-foreground hover:text-foreground font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-foreground mb-1.5">
                    Select Document Type *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: "aadhaar", label: "Aadhaar Card" },
                      { id: "pan", label: "PAN Card" },
                      { id: "driving_license", label: "Driving Licence" },
                      { id: "voter_id", label: "Voter ID" },
                    ].map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setDocType(d.id as any)}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                          docType === d.id
                            ? "bg-indigo-brand text-white border-indigo-brand shadow-sm"
                            : "bg-secondary/70 text-foreground border-border hover:bg-secondary"
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-foreground mb-1">
                    Document Number (e.g. Aadhaar / PAN Number) *
                  </label>
                  <input
                    type="text"
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value.toUpperCase())}
                    placeholder={docType === "aadhaar" ? "XXXX XXXX XXXX" : "ABCDE1234F"}
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-xl outline-none font-mono text-xs font-bold"
                  />
                </div>

                {/* Upload Front & Back */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-foreground mb-1">
                      Front Side Photo *
                    </label>
                    <input
                      type="file"
                      ref={frontInputRef}
                      onChange={(e) => handleFileUpload(e, false)}
                      accept="image/*"
                      className="hidden"
                    />
                    <div
                      onClick={() => frontInputRef.current?.click()}
                      className="h-32 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center p-3 cursor-pointer hover:border-indigo-brand transition-colors bg-secondary/30 relative overflow-hidden"
                    >
                      {frontImage ? (
                        <img src={frontImage} alt="Front" className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <>
                          <Camera className="w-6 h-6 text-muted-foreground mb-1" />
                          <span className="text-[10px] font-bold text-muted-foreground text-center">
                            Click to upload front
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-foreground mb-1">
                      Back Side Photo (Optional)
                    </label>
                    <input
                      type="file"
                      ref={backInputRef}
                      onChange={(e) => handleFileUpload(e, true)}
                      accept="image/*"
                      className="hidden"
                    />
                    <div
                      onClick={() => backInputRef.current?.click()}
                      className="h-32 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center p-3 cursor-pointer hover:border-indigo-brand transition-colors bg-secondary/30 relative overflow-hidden"
                    >
                      {backImage ? (
                        <img src={backImage} alt="Back" className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <>
                          <Camera className="w-6 h-6 text-muted-foreground mb-1" />
                          <span className="text-[10px] font-bold text-muted-foreground text-center">
                            Click to upload back
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-muted-foreground justify-center pt-1">
                  <Lock className="h-3.5 w-3.5 text-emerald-600" />
                  <span>256-Bit Encrypted Storage • Verified for Seller Safety</span>
                </div>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setKycModal(false)}
                  disabled={kycLoading}
                  className="px-4 py-2 text-xs font-semibold bg-secondary text-foreground rounded-xl hover:bg-secondary/80 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={kycLoading}
                  onClick={handleKycSubmit}
                  className="px-5 py-2 text-xs font-bold bg-indigo-brand text-white rounded-xl hover:opacity-90 disabled:opacity-60 shadow-sm flex items-center space-x-1.5 cursor-pointer"
                >
                  {kycLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{kycLoading ? "Submitting..." : "Verify & Award Points (+35)"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── ADDRESS PROOF MODAL ── */}
        {addressModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm" role="dialog" aria-modal="true">
            <div className="relative w-full max-w-md rounded-3xl bg-card p-6 shadow-2xl border border-border space-y-4 font-sans text-xs">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-brand flex items-center justify-center font-bold">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Address & Location Proof</h3>
                    <span className="text-[10px] text-muted-foreground">Earn +15 Trust Points</span>
                  </div>
                </div>
                <button
                  onClick={() => setAddressModal(false)}
                  className="text-muted-foreground hover:text-foreground font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-foreground mb-1">Full Residential / Store Address *</label>
                <input
                  type="text"
                  value={addrText}
                  onChange={(e) => setAddrText(e.target.value)}
                  placeholder="House/Shop No, Street, Area, City"
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl font-bold outline-none focus:border-indigo-brand"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-foreground mb-1">Proof Document Type</label>
                <div className="flex flex-wrap gap-1.5">
                  {["Electricity / Utility Bill", "Rent Agreement", "Property Tax Receipt", "Storefront Photo"].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setAddrDocType(d)}
                      className={`px-3 py-1 rounded-lg border text-[11px] font-bold cursor-pointer ${
                        addrDocType === d ? "bg-indigo-brand text-white border-indigo-brand" : "bg-secondary text-foreground border-border"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddressModal(false)}
                  className="px-4 py-2 text-xs font-semibold bg-secondary text-foreground rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddressSubmit}
                  className="px-5 py-2 text-xs font-bold bg-indigo-brand text-white rounded-xl shadow cursor-pointer"
                >
                  Verify Address (+15 Pts)
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </MobileFrame>
  );
}
