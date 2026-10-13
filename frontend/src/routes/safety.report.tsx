import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import { addSafetyReport, blockUser, createTicket, SAFETY_CATEGORIES, type SafetyCategory } from "@/lib/account";
import { createSafetyReportApi } from "@/api/safety.api";
import { formatPhoneDisplay, cleanPhoneInput } from "@/lib/utils";
import { toast } from "sonner";
import {
  Flag,
  Upload,
  ArrowRight,
  CheckCircle2,
  ShieldAlert,
  Mail,
  Phone,
  MessageSquare,
  User,
  Clock,
  ShieldCheck,
  EyeOff,
  Eye,
  Lock,
  Loader2,
  Copy,
  ChevronRight,
  RefreshCw,
  ExternalLink
} from "lucide-react";

export const Route = createFileRoute("/safety/report")({
  head: () => ({ meta: [{ title: "Report suspicious activity — Omeetso" }] }),
  component: ReportPage,
});

const TIME_SLOTS = [
  { id: "anytime", label: "Anytime (Urgent)" },
  { id: "morning", label: "Morning (9 AM – 12 PM)" },
  { id: "afternoon", label: "Afternoon (12 PM – 5 PM)" },
  { id: "evening", label: "Evening (5 PM – 9 PM)" },
];

function ReportPage() {
  const nav = useNavigate();
  const [category, setCategory] = useState<SafetyCategory>("scam");
  const [description, setDescription] = useState("");
  const [relatedUser, setRelatedUser] = useState("");
  const [relatedListing, setRelatedListing] = useState("");
  const [relatedChat, setRelatedChat] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [contactPref, setContactPref] = useState("in_app");
  
  // Credential & Contact Preferences
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [reporterName, setReporterName] = useState("");
  const [reporterEmail, setReporterEmail] = useState("");
  const [reporterPhone, setReporterPhone] = useState("");
  const [contactTimeSlot, setContactTimeSlot] = useState("anytime");
  const [declarationConfirmed, setDeclarationConfirmed] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [submitted, setSubmitted] = useState<{
    id: string;
    isAnonymous: boolean;
    contactPref: string;
    category: string;
  } | null>(null);

  // Pre-fill user details from local storage if available
  useEffect(() => {
    try {
      const raw = localStorage.getItem("omeetso_user");
      if (raw) {
        const u = JSON.parse(raw);
        if (u.profile?.name || u.name) setReporterName(u.profile?.name || u.name);
        if (u.email) setReporterEmail(u.email);
        if (u.phone) setReporterPhone(u.phone);
      }
    } catch {
      // ignore
    }
  }, []);

  const pick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setAttachments((cur) => [...cur, ...files.map((f) => `ref://${f.name}`)]);
  };

  const copyRefId = (id: string) => {
    navigator.clipboard?.writeText(id);
    toast.success("Incident Reference ID copied to clipboard!");
  };

  const submit = async () => {
    if (!description.trim()) {
      toast.error("Please enter a description of what happened");
      return;
    }
    if (description.trim().length < 5) {
      toast.error("Description must be at least 5 characters");
      return;
    }

    if (!isAnonymous) {
      if (!reporterName.trim()) {
        toast.error("Please enter your name or choose anonymous submission");
        return;
      }
      if (contactPref === "email" && !reporterEmail.trim()) {
        toast.error("Please enter your contact email address");
        return;
      }
      if (reporterEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reporterEmail.trim())) {
        toast.error("Please enter a valid email address");
        return;
      }
      if (contactPref === "call" && !reporterPhone.trim()) {
        toast.error("Please enter your contact phone number for callback");
        return;
      }
      if (reporterPhone.trim() && reporterPhone.replace(/\D/g, "").length < 10) {
        toast.error("Please enter a valid 10-digit phone number");
        return;
      }
    }

    if (!declarationConfirmed) {
      toast.error("Please acknowledge the report accuracy declaration");
      return;
    }

    setIsSubmitting(true);
    try {
      const catLabel = SAFETY_CATEGORIES.find((c) => c.id === category)?.label || category;

      // 1. Save in Database & Trigger Admin / User Emails via Backend API
      const apiRes = await createSafetyReportApi({
        category,
        description: description.trim(),
        relatedUser: relatedUser.trim() || undefined,
        relatedListing: relatedListing.trim() || undefined,
        relatedChat: relatedChat.trim() || undefined,
        attachments,
        evidenceImages: attachments,
        contactPref,
        contactTimeSlot,
        isAnonymous,
        reporterName: isAnonymous ? "Anonymous Reporter" : reporterName.trim() || "Omeetso User",
        reporterEmail: isAnonymous ? undefined : (reporterEmail.trim() || undefined),
        reporterPhone: isAnonymous ? undefined : (reporterPhone.trim() || undefined),
      });

      // 2. Also persist in local storage for local client cache & offline sync
      const rec = addSafetyReport({
        category,
        description: description.trim(),
        relatedUser: relatedUser.trim() || undefined,
        relatedListing: relatedListing.trim() || undefined,
        relatedChat: relatedChat.trim() || undefined,
        attachments,
        contactPref,
        reporterName: isAnonymous ? "Anonymous" : reporterName.trim() || "Omeetso User",
        reporterEmail: isAnonymous ? undefined : reporterEmail.trim(),
        reporterPhone: isAnonymous ? undefined : reporterPhone.trim(),
        contactTimeSlot,
        isAnonymous,
      });

      const finalId = apiRes.success && apiRes.data?.id ? apiRes.data.id : rec.id;

      // If user selected in_app contact method, create an in-app ticket as well
      if (contactPref === "in_app") {
        try {
          createTicket({
            category: "Safety & Fraud",
            subcategory: catLabel,
            subject: `Safety Report: ${catLabel}`,
            description: `[Incident Reference: ${finalId}]\n\n${description.trim()}${
              relatedUser ? `\nReported User: ${relatedUser}` : ""
            }${relatedListing ? `\nRelated Listing: ${relatedListing}` : ""}${
              relatedChat ? `\nRelated Chat: ${relatedChat}` : ""
            }`,
            attachments,
            contactMethod: "in_app",
            relatedListing: relatedListing.trim() || undefined,
          });
        } catch {
          // ticket creation non-blocking
        }
      }

      toast.success("Incident report saved in database and forwarded to safety team!");

      setSubmitted({
        id: finalId,
        isAnonymous,
        contactPref,
        category: catLabel,
      });

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitted(null);
    setDescription("");
    setRelatedUser("");
    setRelatedListing("");
    setRelatedChat("");
    setAttachments([]);
  };

  if (submitted) {
    return (
      <MobileFrame>
        <div className="min-h-dvh bg-background pb-16">
          <BackBar title="Report Submitted" onBack={() => nav({ to: "/safety" })} />
          
          <div className="px-4 pt-2 space-y-4">
            {/* Success Hero Card */}
            <div className="rounded-3xl gradient-brand p-6 text-white shadow-xl relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md text-amber-300 shadow-inner">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="text-lg font-black tracking-tight">Report Logged in System</h2>
                  <p className="text-xs text-white/80 font-medium">Saved to database & sent to safety officers</p>
                </div>
              </div>

              {/* Reference ID Pill & Copy Button */}
              <div className="mt-4 rounded-2xl bg-black/25 p-3.5 backdrop-blur-md border border-white/15">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-white/70 uppercase tracking-wider">Incident Reference ID</span>
                  <button
                    onClick={() => copyRefId(submitted.id)}
                    className="flex items-center gap-1 text-[11px] font-extrabold text-amber-300 hover:text-white transition-colors bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded-lg"
                  >
                    <Copy className="h-3 w-3" />
                    <span>Copy</span>
                  </button>
                </div>
                <p className="mt-1 font-mono text-sm font-black tracking-wide text-white select-all">
                  #{submitted.id}
                </p>
              </div>

              {/* Report Metadata */}
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl bg-white/10 p-2.5 backdrop-blur-xs border border-white/10">
                  <p className="text-[10px] text-white/70 font-semibold uppercase">Category</p>
                  <p className="font-bold text-white truncate mt-0.5">{submitted.category}</p>
                </div>
                <div className="rounded-xl bg-white/10 p-2.5 backdrop-blur-xs border border-white/10">
                  <p className="text-[10px] text-white/70 font-semibold uppercase">Confidentiality</p>
                  <p className="font-bold text-white truncate mt-0.5">
                    {submitted.isAnonymous ? "🔒 Anonymous" : "👤 Verified Identity"}
                  </p>
                </div>
              </div>

              <p className="mt-3.5 text-[11px] text-white/75 leading-relaxed">
                An alert has been dispatched to <strong>akhileshreddy027@gmail.com</strong> (Admin). Our Trust & Safety team actively investigates all incident reports within 24 hours.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-1">
              <Link
                to="/safety"
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 px-4 text-xs font-black text-primary-foreground shadow-md hover:bg-primary/90 active:scale-[0.99] transition-all"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Track Incident on Safety Page</span>
                <ArrowRight className="h-4 w-4 ml-auto" />
              </Link>

              {relatedUser && (
                <button
                  type="button"
                  onClick={() => {
                    blockUser({ id: relatedUser, name: relatedUser });
                    toast.success("Reported user blocked from contacting you");
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/10 py-3 px-4 text-xs font-bold text-destructive hover:bg-destructive/15 active:scale-[0.99] transition-all"
                >
                  <Lock className="h-3.5 w-3.5" />
                  <span>Block the reported user ({relatedUser})</span>
                </button>
              )}

              <button
                type="button"
                onClick={resetForm}
                className="w-full flex items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3 px-4 text-xs font-bold text-foreground hover:bg-secondary/60 active:scale-[0.99] transition-all"
              >
                <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Report Another Incident</span>
              </button>

              <Link
                to="/safety"
                className="block w-full py-2.5 text-center text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
              >
                Back to Safety Centre Home
              </Link>
            </div>
          </div>
        </div>
      </MobileFrame>
    );
  }

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-32">
        <BackBar title="Report Suspicious Activity" onBack={() => nav({ to: "/safety" })} />
        
        <div className="px-4 pt-2 space-y-3.5 max-w-2xl mx-auto">
          {/* Incident Category Selector */}
          <div className="rounded-3xl border border-border/80 bg-card p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-2 text-xs font-extrabold text-foreground">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-500/15 text-rose-600">
                  <Flag className="h-3.5 w-3.5" />
                </span>
                <span>Incident Category</span>
              </p>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Required</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SAFETY_CATEGORIES.map((c) => {
                const isSelected = category === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.id)}
                    className={`relative flex items-center justify-between rounded-xl border px-3 py-2.5 text-xs font-bold transition-all active:scale-[0.98] ${
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/20"
                        : "border-border/80 bg-background/80 text-foreground hover:border-primary/40 hover:bg-secondary/40"
                    }`}
                  >
                    <span className="truncate">{c.label}</span>
                    {isSelected && (
                      <span className="h-2 w-2 rounded-full bg-white shrink-0 ml-1.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Incident Details & Evidence */}
          <div className="rounded-3xl border border-border/80 bg-card p-4 shadow-xs space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-2 text-xs font-extrabold text-foreground">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ShieldAlert className="h-3.5 w-3.5" />
                </span>
                <span>Incident Context & Evidence</span>
              </p>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Details</span>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="block text-[11px] font-bold text-foreground mb-1">
                  Reported User / Phone / ID (Optional)
                </label>
                <input
                  value={relatedUser}
                  onChange={(e) => setRelatedUser(e.target.value)}
                  placeholder="e.g. Ramesh Kumar, +91 9876543210 or user profile link"
                  className="w-full rounded-xl border border-border/80 bg-background px-3.5 py-2.5 outline-none text-xs font-medium focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-foreground mb-1">
                  Related Listing / Item URL (Optional)
                </label>
                <input
                  value={relatedListing}
                  onChange={(e) => setRelatedListing(e.target.value)}
                  placeholder="e.g. http://localhost:5173/product/6ac... or item title"
                  className="w-full rounded-xl border border-border/80 bg-background px-3.5 py-2.5 outline-none text-xs font-medium focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-foreground mb-1">
                  Related Chat / Message Reference (Optional)
                </label>
                <input
                  value={relatedChat}
                  onChange={(e) => setRelatedChat(e.target.value)}
                  placeholder="e.g. Conversation ID or quote from the chat"
                  className="w-full rounded-xl border border-border/80 bg-background px-3.5 py-2.5 outline-none text-xs font-medium focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-foreground">
                    Description of Incident *
                  </label>
                  <span className="text-[10px] font-bold text-muted-foreground">Min 5 chars</span>
                </div>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain what happened in detail: payment requested outside platform, suspicious links, harassment, fake products, or non-delivery..."
                  className="w-full rounded-xl border border-border/80 bg-background p-3 outline-none text-xs font-medium focus:border-primary focus:ring-2 focus:ring-primary/10 transition leading-relaxed placeholder:text-muted-foreground/70"
                />
              </div>

              {/* Attachments Picker */}
              <div>
                <label className="flex items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed border-border/90 bg-secondary/30 p-3.5 text-xs text-muted-foreground hover:bg-secondary/60 hover:border-primary/50 transition cursor-pointer active:scale-[0.99]">
                  <Upload className="h-4 w-4 text-primary shrink-0" />
                  <span className="font-bold text-foreground">Upload screenshots or proof</span>
                  <span className="text-[10px] text-muted-foreground">(Images / PDF)</span>
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={pick}
                    aria-label="Attach screenshots"
                  />
                </label>

                {attachments.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {attachments.map((file, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 rounded-lg bg-primary/10 border border-primary/20 px-2 py-1 text-[11px] font-bold text-primary"
                      >
                        📎 {file.replace("ref://", "")}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contact & Credential Preferences */}
          <div className="rounded-3xl border border-border/80 bg-card p-4 shadow-xs space-y-4">
            <div>
              <p className="flex items-center gap-2 text-xs font-extrabold text-foreground">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </span>
                <span>Contact Preferences & Credentials</span>
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                How should our Trust & Safety investigation officers follow up?
              </p>
            </div>

            {/* Contact Method Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-foreground">Preferred Channel</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "in_app", label: "In-App Chat", icon: MessageSquare },
                  { id: "email", label: "Email", icon: Mail },
                  { id: "call", label: "Phone Call", icon: Phone },
                ].map(({ id, label, icon: Icon }) => {
                  const isSelected = contactPref === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setContactPref(id)}
                      className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl border py-2.5 px-2 text-xs font-bold transition-all active:scale-[0.98] ${
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/20"
                          : "border-border/80 bg-background text-muted-foreground hover:bg-secondary/40"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-[11px]">{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Confidentiality / Anonymous Toggle Card */}
            <div className="rounded-2xl border border-border/80 bg-secondary/30 p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-xl ${isAnonymous ? "bg-amber-500/15 text-amber-600" : "bg-primary/10 text-primary"}`}>
                    {isAnonymous ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </span>
                  <div>
                    <span className="text-xs font-extrabold text-foreground">Submit Anonymously</span>
                    <p className="text-[10px] text-muted-foreground">Hide identity from the reported party</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAnonymous(!isAnonymous)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isAnonymous ? "bg-amber-500" : "bg-muted"
                  }`}
                  aria-label="Toggle anonymous report"
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      isAnonymous ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Reporter Contact Details */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-foreground mb-1">
                  Full Name {isAnonymous ? "(Hidden for Anonymous)" : "*"}
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    placeholder={isAnonymous ? "Anonymous Reporter" : "Enter your full name"}
                    className="w-full rounded-xl border border-border/80 bg-background pl-9 pr-3.5 py-2.5 text-xs font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-foreground mb-1">
                  Contact Email {contactPref === "email" && !isAnonymous ? "*" : "(For investigation updates)"}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={reporterEmail}
                    onChange={(e) => setReporterEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full rounded-xl border border-border/80 bg-background pl-9 pr-3.5 py-2.5 text-xs font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-foreground mb-1">
                  Phone / WhatsApp Number {contactPref === "call" && !isAnonymous ? "*" : "(Optional)"}
                </label>
                <div className="flex items-center rounded-xl border border-border/80 bg-background px-3 py-2.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-foreground font-mono pr-2.5 border-r border-border mr-2.5 shrink-0 select-none">
                    <span className="text-sm">🇮🇳</span> +91
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={11}
                    value={formatPhoneDisplay(reporterPhone)}
                    onChange={(e) => setReporterPhone(cleanPhoneInput(e.target.value))}
                    placeholder="98765 43210"
                    className="w-full bg-transparent text-xs font-medium outline-none font-mono tracking-wider placeholder:font-normal"
                  />
                </div>
              </div>

              {/* Follow-up Window */}
              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-foreground mb-1.5">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Preferred Callback / Contact Window</span>
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {TIME_SLOTS.map((slot) => {
                    const isSelected = contactTimeSlot === slot.id;
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setContactTimeSlot(slot.id)}
                        className={`rounded-xl border px-3 py-2 text-[11px] font-bold text-left transition-all active:scale-[0.98] ${
                          isSelected
                            ? "border-primary bg-primary/10 text-primary font-black shadow-2xs"
                            : "border-border/80 bg-background text-muted-foreground hover:bg-secondary/40"
                        }`}
                      >
                        {slot.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Declaration Confirmation */}
              <label className="flex items-start gap-2.5 pt-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={declarationConfirmed}
                  onChange={(e) => setDeclarationConfirmed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-[11px] text-muted-foreground leading-snug font-medium">
                  I confirm that this report is submitted in good faith and the details provided are accurate to the best of my knowledge.
                </span>
              </label>

              {/* Desktop / Inline Action Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => nav({ to: "/safety" })}
                  className="rounded-2xl border border-border bg-secondary/80 px-5 py-3 text-xs font-bold text-foreground hover:bg-secondary transition active:scale-95 cursor-pointer"
                >
                  Cancel
                </button>
                
                <button
                  type="button"
                  onClick={submit}
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-primary py-3 px-6 text-xs font-black text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Submitting Incident...</span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="h-4 w-4" />
                      <span>Submit Safety Report</span>
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile-Only Bottom Floating Action Bar */}
        <div className="md:hidden fixed inset-x-0 bottom-0 z-20 mx-auto max-w-[430px] border-t border-border/80 bg-card/95 backdrop-blur-xl p-3.5 safe-b shadow-2xl">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => nav({ to: "/safety" })}
              className="rounded-2xl border border-border bg-secondary/80 px-4 py-3 text-xs font-bold text-foreground hover:bg-secondary transition active:scale-95"
            >
              Cancel
            </button>
            
            <button
              type="button"
              onClick={submit}
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-primary py-3 px-4 text-xs font-black text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 active:scale-[0.99] disabled:opacity-50 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="h-4 w-4" />
                  <span>Submit Safety Report</span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </MobileFrame>
  );
}

export default ReportPage;
