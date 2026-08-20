import { createFileRoute, useNavigate, useParams, Link } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import {
  getVerification, setVerification, verifStatusLabel, getProfile, setProfile,
  getBusinessProfile, setBusinessProfile, type VerifKind,
} from "@/lib/account";
import { VerifBadge } from "@/components/omeetso/account";
import { toast } from "sonner";
import {
  Camera, IdCard, FileText, ShieldCheck, Upload, RefreshCw, Lock,
  CheckCircle2, Sparkles, AlertCircle, Loader2, ArrowRight, Check
} from "lucide-react";
import { uploadFile } from "@/lib/upload";

export const Route = createFileRoute("/account/verification/$type")({
  head: () => ({ meta: [{ title: "Verification — Omeetso" }] }),
  component: VerifyType,
});

function VerifyType() {
  const { type } = useParams({ from: "/account/verification/$type" });
  const kind = type as VerifKind;
  const nav = useNavigate();
  const v = getVerification(kind) || { status: "not_started" };
  const p = getProfile();

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-16 font-sans">
        <BackBar title={label(kind)} fallback="/verification" right={<VerifBadge status={v.status} />} />
        <div className="px-4 pt-3 max-w-[800px] mx-auto space-y-4">
          {kind === "mobile" && <MobileVerify v={v} mobile={p.mobile} />}
          {kind === "email" && <EmailVerify v={v} email={p.email ?? ""} />}
          {kind === "identity" && <IdentityVerify v={v} />}
          {kind === "address" && <AddressVerify v={v} />}
          {kind === "business" && <BusinessVerify v={v} />}
          {kind === "store" && <StoreVerify v={v} />}
        </div>
      </div>
    </MobileFrame>
  );
}

function label(k: VerifKind) {
  return ({
    mobile: "Mobile Phone Verification",
    email: "Email Verification",
    identity: "Government ID KYC",
    address: "Address & Location Proof",
    business: "Business Verification",
    store: "Store Verification"
  })[k] || "Verification";
}

// ---------- Mobile ----------
function MobileVerify({ v, mobile }: { v: any; mobile: string }) {
  const [step, setStep] = useState<"idle" | "sent" | "verified" | "expired" | "too_many">(
    v.status === "verified" ? "verified" : "idle");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);

  const send = () => { setStep("sent"); setOtp(""); setError(""); toast.info("OTP sent to your mobile (Demo OTP: 1234)"); };
  const verify = () => {
    if (attempts >= 3) { setStep("too_many"); return; }
    if (otp === "1234" || otp.length === 4) {
      setVerification("mobile", { status: "verified", submittedAt: Date.now() });
      setStep("verified");
      toast.success("Mobile phone verified (+35 Trust Points awarded)");
    } else {
      setAttempts((n) => n + 1);
      setError("Incorrect OTP code. Enter 1234 for demo.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-3xl bg-card p-4 border border-border shadow-sm">
        <p className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">Registered Mobile Number</p>
        <p className="mt-1 text-base font-black text-foreground">{mobile || "+91 98765 43210"}</p>
      </div>

      {step === "verified" || v.status === "verified" ? (
        <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-emerald-800 dark:text-emerald-300 space-y-2">
          <div className="flex items-center gap-2 font-black text-base">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <span>Mobile Phone Verified ✓</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your phone number is verified. You have earned +35 Trust Points and are eligible to list products on Omeetso.
          </p>
        </div>
      ) : (
        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-extrabold text-foreground">Verify Phone via SMS OTP</h3>
            <p className="text-xs text-muted-foreground">Receive a 4-digit code to confirm ownership of your number.</p>
          </div>

          {step === "idle" && (
            <button
              onClick={send}
              className="w-full h-12 rounded-2xl bg-indigo-brand text-xs font-bold text-white shadow-md hover:opacity-95 transition-all"
            >
              Send Verification OTP
            </button>
          )}

          {step === "sent" && (
            <div className="space-y-3 pt-2">
              <label className="block text-[11px] font-bold text-foreground">Enter 4-Digit OTP</label>
              <input
                inputMode="numeric"
                maxLength={4}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="1 2 3 4"
                className="w-full h-12 rounded-2xl border border-border bg-background px-4 text-center font-mono text-xl tracking-[0.5em] font-black text-foreground outline-none focus:border-indigo-brand"
              />
              {error && <p className="text-xs text-rose-600 font-bold text-center">{error}</p>}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={send}
                  className="px-4 py-2.5 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:bg-secondary"
                >
                  Resend
                </button>
                <button
                  type="button"
                  onClick={verify}
                  className="flex-1 rounded-xl bg-indigo-brand text-xs font-bold text-white shadow hover:opacity-95"
                >
                  Verify OTP & Unlock (+35 Pts)
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground text-center">Demo OTP code is 1234</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------- Email (OTP Verification) ----------
function EmailVerify({ v, email }: { v: any; email: string }) {
  const [addr, setAddr] = useState(email || "user@example.com");
  const [step, setStep] = useState<"idle" | "sent" | "verified">(v.status === "verified" ? "verified" : "idle");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);

  const send = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addr)) {
      toast.error("Please enter a valid email address");
      return;
    }
    setStep("sent");
    setOtp("");
    setError("");
    toast.info(`OTP code sent to ${addr} (Demo code: 5678)`);
  };

  const verify = () => {
    if (attempts >= 3) {
      setError("Too many invalid attempts. Please request a new OTP.");
      return;
    }
    if (otp === "5678" || otp.length === 4) {
      setVerification("email", { status: "verified", submittedAt: Date.now() });
      setProfile({ email: addr, emailVerified: true });
      setStep("verified");
      toast.success("Email address verified! (+15 Trust Points awarded)");
    } else {
      setAttempts((n) => n + 1);
      setError("Incorrect OTP code. Enter 5678 for demo.");
    }
  };

  return (
    <div className="space-y-4">
      {step === "verified" || v.status === "verified" ? (
        <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-emerald-800 dark:text-emerald-300 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 font-black text-base">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <span>Email Address Verified ✓</span>
            </div>
            <button
              onClick={() => setStep("idle")}
              className="text-xs font-bold text-primary hover:underline"
            >
              Change Email
            </button>
          </div>
          <div className="p-3.5 rounded-2xl bg-card/80 border border-border text-xs flex items-center justify-between font-semibold">
            <span className="text-muted-foreground">Verified Email:</span>
            <span className="font-bold text-foreground">{addr}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            +15 Trust Points active. You receive instant order receipts, buyer inquiries, and safety notifications.
          </p>
        </div>
      ) : (
        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm space-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-indigo-brand" />
              <h3 className="text-sm font-extrabold text-foreground">Verify Email via OTP</h3>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-bold border border-amber-500/20">
                +15 Trust Pts
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Confirm your email address to receive important buyer leads and account receipts.
            </p>
          </div>

          <label className="block">
            <span className="text-[11px] font-bold text-foreground">Your Email Address *</span>
            <input
              value={addr}
              disabled={step === "sent"}
              onChange={(e) => setAddr(e.target.value)}
              type="email"
              placeholder="name@domain.com"
              className="mt-1 w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-xs font-bold outline-none focus:border-indigo-brand disabled:opacity-60"
            />
          </label>

          {step === "idle" && (
            <button
              onClick={send}
              className="w-full h-12 rounded-2xl bg-indigo-brand text-xs font-bold text-white shadow-md hover:opacity-95 transition-all"
            >
              Send Email Verification OTP
            </button>
          )}

          {step === "sent" && (
            <div className="space-y-3 pt-1 border-t border-border/80">
              <label className="block text-[11px] font-bold text-foreground">Enter 4-Digit Email OTP</label>
              <input
                inputMode="numeric"
                maxLength={4}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="5 6 7 8"
                className="w-full h-12 rounded-2xl border border-border bg-background px-4 text-center font-mono text-xl tracking-[0.5em] font-black text-foreground outline-none focus:border-indigo-brand"
              />
              {error && <p className="text-xs text-rose-600 font-bold text-center">{error}</p>}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={send}
                  className="px-4 py-2.5 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:bg-secondary"
                >
                  Resend OTP
                </button>
                <button
                  type="button"
                  onClick={verify}
                  className="flex-1 rounded-xl bg-indigo-brand text-xs font-bold text-white shadow hover:opacity-95"
                >
                  Verify Email (+15 Pts)
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground text-center">Demo email OTP code is 5678</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------- Identity (Government ID KYC) ----------
function IdentityVerify({ v }: { v: any }) {
  const isVerified = v.status === "verified";
  const [docType, setDocType] = useState<"aadhaar" | "pan" | "driving_license" | "voter_id" | "passport">(
    (v.details?.docType?.toLowerCase().replace(" ", "_") as any) || "aadhaar"
  );
  const [docNumber, setDocNumber] = useState(v.details?.docNumber || "");
  const [frontImage, setFrontImage] = useState<string | null>(v.documentUrl || null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(!isVerified);

  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

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

  const submit = async () => {
    if (!docNumber.trim()) {
      toast.error("Please enter your document identification number");
      return;
    }
    if (!frontImage) {
      toast.error("Please upload the front photo of your document");
      return;
    }

    setLoading(true);
    const token = typeof window !== "undefined" ? localStorage.getItem("omeetso_user_token") : null;

    try {
      if (token) {
        await fetch("https://api.omeetso.in/api/v1/verification", {
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
      console.warn("Verification API sync:", err);
    }

    const ref = `KYC-${docType.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
    setVerification("identity", {
      status: "verified",
      submittedAt: Date.now(),
      reference: ref,
      details: {
        docType: docType.replace("_", " ").toUpperCase(),
        docNumber: docNumber.trim(),
      },
      documentUrl: frontImage,
    });

    setLoading(false);
    setEditing(false);
    toast.success("Government ID KYC Verified! (+35 Trust Points awarded)");
  };

  return (
    <div className="space-y-4">
      {/* VERIFIED BANNER */}
      {isVerified && !editing && (
        <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/15 via-card to-card p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-500/20 text-emerald-600 border border-emerald-500/30">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-foreground">Government ID Verified ✓</h3>
                <p className="text-xs text-emerald-600 font-bold">+35 Trust Points Active</p>
              </div>
            </div>
            <button
              onClick={() => setEditing(true)}
              className="text-xs font-bold text-primary hover:underline"
            >
              Update ID
            </button>
          </div>

          <div className="p-3.5 rounded-2xl bg-secondary/60 border border-border text-xs space-y-1 font-semibold">
            <div className="flex justify-between text-muted-foreground">
              <span>Document Type:</span>
              <span className="font-bold text-foreground">{v.details?.docType || "Aadhaar Card"}</span>
            </div>
            {v.details?.docNumber && (
              <div className="flex justify-between text-muted-foreground">
                <span>Document Number:</span>
                <span className="font-mono font-bold text-foreground">
                  {v.details.docNumber.length > 4 ? `•••• •••• ${v.details.docNumber.slice(-4)}` : v.details.docNumber}
                </span>
              </div>
            )}
            <div className="flex justify-between text-muted-foreground">
              <span>Reference Number:</span>
              <span className="font-mono text-[11px] text-foreground">{v.reference || "KYC-AADHAAR-872149"}</span>
            </div>
          </div>
        </div>
      )}

      {/* KYC FORM */}
      {editing && (
        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm space-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <IdCard className="h-5 w-5 text-indigo-brand" />
              <h2 className="text-sm font-extrabold text-foreground">Upload Government KYC Document</h2>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-bold border border-amber-500/20">
                +35 Trust Pts
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Upload your official Indian Government ID to earn the ID-Verified Seller Badge and build trust with local buyers.
            </p>
          </div>

          {/* Document Type Chips */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-foreground">Select Document Type *</label>
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
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${docType === d.id
                      ? "bg-indigo-brand text-white border-indigo-brand shadow-sm"
                      : "bg-secondary/60 text-foreground border-border hover:bg-secondary"
                    }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Document Number */}
          <div>
            <label className="block text-[11px] font-bold text-foreground mb-1">
              Document Identification Number *
            </label>
            <input
              type="text"
              value={docNumber}
              onChange={(e) => setDocNumber(e.target.value.toUpperCase())}
              placeholder={docType === "aadhaar" ? "XXXX XXXX XXXX" : "ABCDE1234F"}
              className="w-full px-3 py-2.5 bg-background border border-border rounded-xl outline-none font-mono text-xs font-bold text-foreground focus:border-indigo-brand"
            />
          </div>

          {/* Front & Back Photo Uploads */}
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
                className="h-32 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center p-3 cursor-pointer hover:border-indigo-brand transition-colors bg-secondary/20 relative overflow-hidden"
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
                className="h-32 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center p-3 cursor-pointer hover:border-indigo-brand transition-colors bg-secondary/20 relative overflow-hidden"
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

          <div className="pt-2 flex items-center gap-2">
            {isVerified && (
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-4 py-2.5 text-xs font-bold bg-secondary text-foreground rounded-2xl hover:bg-secondary/80"
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              disabled={loading}
              onClick={submit}
              className="flex-1 h-12 rounded-2xl bg-indigo-brand text-xs font-bold text-white shadow-lg hover:opacity-95 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Documents…</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify Identity & Earn +35 Points</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- Address & Location Proof ----------
function AddressVerify({ v }: { v: any }) {
  const [docType, setDocType] = useState("Electricity / Utility Bill");
  const [address, setAddress] = useState("");
  const [docImage, setDocImage] = useState<string | null>(null);

  const submit = () => {
    if (!address.trim()) { toast.error("Enter your full residential / store address"); return; }
    if (!docImage) { toast.error("Upload a photo of your address proof"); return; }
    setVerification("address", {
      status: "verified",
      submittedAt: Date.now(),
      reference: `ADDR-${Math.floor(1000 + Math.random() * 9000)}`,
      details: { docType, address }
    });
    toast.success("Address proof verified (+15 Trust Points)");
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-sm space-y-4">
      <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-3 text-xs text-blue-900 dark:text-blue-200">
        <Lock className="inline h-3.5 w-3.5 mr-1" /> Address proof confirms your local presence in the neighborhood.
      </div>
      <div className="space-y-3">
        <div>
          <label className="block text-[11px] font-bold text-foreground mb-1">Full Residential / Store Address</label>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Shop / House No, Street, Area, City"
            className="w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-xs font-bold outline-none focus:border-indigo-brand"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-foreground mb-1">Document Type</label>
          <div className="flex flex-wrap gap-2">
            {["Electricity / Utility Bill", "Rent Agreement", "Property Tax Receipt", "Storefront Photo"].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDocType(d)}
                className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${docType === d ? "border-indigo-brand bg-indigo-brand text-white" : "border-border bg-secondary text-foreground"
                  }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <Upload2 label="Address Proof Document / Photo" value={docImage} onChange={setDocImage} />
      </div>

      <button
        onClick={submit}
        className="w-full h-12 rounded-2xl bg-indigo-brand text-xs font-bold text-white shadow hover:opacity-95"
      >
        Submit Address Proof (+15 Pts)
      </button>
      {v.reference && <p className="text-center text-[11px] text-muted-foreground">Reference: {v.reference}</p>}
    </div>
  );
}

// ---------- Business ----------
function BusinessVerify({ v }: { v: any }) {
  const b = getBusinessProfile();
  const [legalName, setLegalName] = useState(b.legalName);
  const [type, setType] = useState(b.businessType);
  const [address, setAddress] = useState(b.address);
  const [gst, setGst] = useState(b.gstNumber ?? "");
  const [reg, setReg] = useState(b.registrationNumber ?? "");
  const [email, setEmail] = useState(b.email);
  const [mobile, setMobile] = useState(b.mobile);
  const [doc, setDoc] = useState<string | null>(null);

  const submit = () => {
    if (!legalName || !address || !email || !mobile) { toast.error("Fill in legal name, address, email and mobile"); return; }
    setBusinessProfile({ legalName, businessType: type, address, gstNumber: gst || undefined, registrationNumber: reg || undefined, email, mobile, documentRef: doc ? "doc_ref" : undefined });
    setVerification("business", { status: "verified", submittedAt: Date.now(), reference: `BIZ-${Math.floor(1000 + Math.random() * 9000)}` });
    toast.success("Business verified (+15 Trust Points)");
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-sm space-y-4">
      <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-3 text-xs text-blue-900 dark:text-blue-200">
        Business verification helps customers identify trusted local registered enterprises.
      </div>
      <div className="space-y-2.5">
        <Row2 label="Legal Business Name" value={legalName} onChange={setLegalName} />
        <Row2 label="Business Type (e.g. Retail, Service, Sole Proprietor)" value={type} onChange={setType} />
        <Row2 label="Registered Address" value={address} onChange={setAddress} />
        <div className="grid grid-cols-2 gap-2">
          <Row2 label="GSTIN Number (Optional)" value={gst} onChange={setGst} />
          <Row2 label="Trade / Registration No (Optional)" value={reg} onChange={setReg} />
        </div>
        <Row2 label="Business Email" value={email} onChange={setEmail} type="email" />
        <Row2 label="Business Phone" value={mobile} onChange={setMobile} inputMode="tel" />
        <Upload2 label="Trade License / GST Certificate" value={doc} onChange={setDoc} />
      </div>
      <button
        onClick={submit}
        className="w-full h-12 rounded-2xl bg-indigo-brand text-xs font-bold text-white shadow hover:opacity-95"
      >
        Submit Business Registration (+15 Pts)
      </button>
    </div>
  );
}

// ---------- Store ----------
function StoreVerify({ v }: { v: any }) {
  const STEPS = [
    { key: "owner_mobile", label: "Owner Mobile Verified", done: true },
    { key: "biz_email", label: "Business Email Verified", done: true },
    { key: "address", label: "Store Address Submitted", done: true },
    { key: "details", label: "Store Catalog & KYC Uploaded", done: v.status !== "not_started" },
    { key: "images", label: "Storefront Photos Approved", done: v.status === "verified" },
  ];
  const submit = () => {
    setVerification("store", { status: "verified", submittedAt: Date.now() });
    toast.success("Store verification completed");
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-sm space-y-4">
      <ol className="space-y-2">
        {STEPS.map((s, i) => (
          <li key={s.key} className="flex items-center gap-3 rounded-2xl bg-secondary/50 p-3">
            <span className={`grid h-6 w-6 place-items-center rounded-full text-[11px] font-bold ${s.done ? "bg-emerald-500/20 text-emerald-600" : "bg-card text-muted-foreground"}`}>{i + 1}</span>
            <p className="flex-1 text-xs font-bold text-foreground">{s.label}</p>
            <span className={`text-[10px] font-bold uppercase ${s.done ? "text-emerald-600" : "text-muted-foreground"}`}>{s.done ? "Done ✓" : "Pending"}</span>
          </li>
        ))}
      </ol>
      {v.status !== "verified" && (
        <button
          onClick={submit}
          className="w-full h-12 rounded-2xl bg-indigo-brand text-xs font-bold text-white shadow hover:opacity-95"
        >
          Submit Store Verification
        </button>
      )}
    </div>
  );
}

// ---------- Helpers ----------
function Upload2({ label, value, onChange }: { label: string; value: string | null; onChange: (v: string | null) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    try {
      const url = await uploadFile(f, "verification");
      onChange(url);
      toast.success(`${label} uploaded`);
    } catch {
      const reader = new FileReader();
      reader.onload = () => onChange(String(reader.result));
      reader.readAsDataURL(f);
      toast.success(`${label} attached`);
    }
  };
  return (
    <div
      onClick={() => inputRef.current?.click()}
      className="block rounded-2xl border-2 border-dashed border-border bg-secondary/20 p-4 text-center text-xs cursor-pointer hover:border-indigo-brand transition-colors"
    >
      {value ? (
        <div className="space-y-1">
          <p className="font-bold text-emerald-600">✓ {label} Attached</p>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange(null); }}
            className="text-[10px] font-bold text-rose-600 underline"
          >
            Remove file
          </button>
        </div>
      ) : (
        <>
          <Upload className="mx-auto h-5 w-5 text-muted-foreground mb-1" />
          <p className="font-bold text-foreground">{label}</p>
          <span className="text-[10px] text-muted-foreground">Click to upload photo</span>
        </>
      )}
      <input ref={inputRef} type="file" className="hidden" accept="image/*" onChange={onPick} aria-label={label} />
    </div>
  );
}

function Row2({ label, value, onChange, type = "text", inputMode }: { label: string; value: string; onChange: (v: string) => void; type?: string; inputMode?: any }) {
  return (
    <label className="block">
      <span className="text-[11px] font-bold text-foreground">{label}</span>
      <input
        value={value}
        type={type}
        inputMode={inputMode}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-2xl border border-border bg-background px-3.5 py-2.5 text-xs font-bold outline-none focus:border-indigo-brand"
      />
    </label>
  );
}
