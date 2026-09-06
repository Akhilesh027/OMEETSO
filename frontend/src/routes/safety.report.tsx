import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import { addSafetyReport, blockUser, SAFETY_CATEGORIES, type SafetyCategory } from "@/lib/account";
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
  Lock
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

  const submit = async () => {
    if (description.trim().length < 20) {
      toast.error("Description must be at least 20 characters");
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
        toast.error("Please enter your contact phone number");
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
      const rec = addSafetyReport({
        category,
        description,
        relatedUser,
        relatedListing,
        relatedChat,
        attachments,
        contactPref,
        reporterName: isAnonymous ? "Anonymous" : reporterName.trim(),
        reporterEmail: isAnonymous ? undefined : reporterEmail.trim(),
        reporterPhone: isAnonymous ? undefined : reporterPhone.trim(),
        contactTimeSlot,
        isAnonymous,
      });

      setSubmitted({
        id: rec.id,
        isAnonymous,
        contactPref,
      });
      toast.success("Suspicious activity report submitted successfully");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <MobileFrame>
        <div className="min-h-dvh bg-background pb-16">
          <BackBar title="Report submitted" />
          <div className="mx-4 mt-2 rounded-2xl gradient-brand p-5 text-white shadow-lg">
            <CheckCircle2 className="h-9 w-9 text-yellow-brand" />
            <p className="mt-2 text-lg font-extrabold">Thanks for keeping Omeetso safe</p>
            <div className="mt-2 rounded-xl bg-white/10 p-3 text-xs space-y-1 backdrop-blur-xs">
              <p className="font-bold">Incident Reference: {submitted.id}</p>
              <p className="text-white/80">
                Mode: {submitted.isAnonymous ? "🔒 Anonymous Confidential Report" : "👤 Verified Contact Details Provided"}
              </p>
              <p className="text-white/80">
                Contact Channel: {submitted.contactPref === "in_app" ? "In-app Message" : submitted.contactPref === "email" ? "Email" : "Phone / WhatsApp"}
              </p>
            </div>
            <p className="mt-2 text-[11px] text-white/70">
              Our Trust & Safety moderators investigate all flagged accounts, listings, and suspicious activities within 24 hours.
            </p>
          </div>
          <div className="mx-4 mt-3 space-y-2">
            {relatedUser && (
              <button
                onClick={() => {
                  blockUser({ id: relatedUser, name: relatedUser });
                  toast.success("Reported user blocked");
                }}
                className="w-full rounded-2xl border border-border bg-card py-3 text-sm font-semibold shadow-xs hover:bg-secondary/40 transition"
              >
                Block the reported user
              </button>
            )}
            <Link
              to="/support/new"
              className="flex items-center justify-between rounded-2xl bg-primary px-4 py-3.5 text-sm font-bold text-primary-foreground shadow-xs hover:bg-primary/90 transition"
            >
              <span>Open urgent support ticket</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/safety"
              className="block w-full rounded-2xl border border-border bg-card py-3 text-center text-sm font-semibold hover:bg-secondary/40 transition"
            >
              Back to Safety Centre
            </Link>
          </div>
        </div>
      </MobileFrame>
    );
  }

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-28">
        <BackBar title="Report suspicious activity" />
        <div className="px-4 pt-2 space-y-3">
          {/* Incident Category */}
          <div className="rounded-2xl bg-card p-3.5 card-elev space-y-2">
            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <Flag className="h-3.5 w-3.5 text-primary" /> Incident Category
            </p>
            <div className="flex flex-wrap gap-1.5">
              {SAFETY_CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    category === c.id
                      ? "border-primary bg-primary text-primary-foreground shadow-xs"
                      : "border-border bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Incident Details */}
          <div className="rounded-2xl bg-card p-3.5 card-elev space-y-2.5 text-sm">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Incident Context & Evidence
            </p>
            <input
              value={relatedUser}
              onChange={(e) => setRelatedUser(e.target.value)}
              placeholder="Reported user name, phone or profile ID (optional)"
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 outline-none text-xs font-medium focus:border-primary transition"
            />
            <input
              value={relatedListing}
              onChange={(e) => setRelatedListing(e.target.value)}
              placeholder="Related listing URL, item title or Store ID (optional)"
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 outline-none text-xs font-medium focus:border-primary transition"
            />
            <input
              value={relatedChat}
              onChange={(e) => setRelatedChat(e.target.value)}
              placeholder="Related chat conversation ID (optional)"
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 outline-none text-xs font-medium focus:border-primary transition"
            />
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what happened in detail (minimum 20 characters)…"
              className="w-full rounded-xl border border-border bg-background p-3 outline-none text-xs font-medium focus:border-primary transition leading-relaxed"
            />
            <label className="flex items-center gap-2.5 rounded-xl border-2 border-dashed border-border p-3 text-xs text-muted-foreground hover:bg-secondary/40 transition cursor-pointer">
              <Upload className="h-4 w-4 text-primary" />
              <span>Attach screenshots, receipts, or chat logs</span>
              <input
                type="file"
                multiple
                className="hidden"
                onChange={pick}
                aria-label="Attach screenshots"
              />
            </label>
            {attachments.length > 0 && (
              <p className="text-[11px] font-semibold text-primary">
                📎 {attachments.length} attachment(s) selected
              </p>
            )}
          </div>

          {/* Contact & Credential Preferences */}
          <div className="rounded-2xl bg-card p-4 card-elev space-y-4">
            <div>
              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Contact Preferences & Credentials
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Specify how our investigation team can reach you regarding this case.
              </p>
            </div>

            {/* Contact Method Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-foreground">Preferred Contact Method</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "in_app", label: "In-app", icon: MessageSquare },
                  { id: "email", label: "Email", icon: Mail },
                  { id: "call", label: "Call / Phone", icon: Phone },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setContactPref(id)}
                    className={`flex items-center justify-center gap-1.5 rounded-xl border py-2 px-2 text-xs font-bold transition ${
                      contactPref === id
                        ? "border-primary bg-primary text-primary-foreground shadow-xs"
                        : "border-border bg-background text-muted-foreground hover:bg-secondary/50"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Confidentiality / Anonymous Toggle */}
            <div className="rounded-xl border border-border bg-background/50 p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isAnonymous ? (
                    <EyeOff className="h-4 w-4 text-amber-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-primary" />
                  )}
                  <span className="text-xs font-bold text-foreground">Submit Anonymously</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAnonymous(!isAnonymous)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isAnonymous ? "bg-amber-500" : "bg-muted"
                  }`}
                  aria-label="Toggle anonymous report"
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      isAnonymous ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {isAnonymous
                  ? "Your identity and contact credentials will be completely hidden from the reported party. Moderators will follow up strictly inside the app."
                  : "Your credentials will only be visible to verified Omeetso Trust & Safety officers handling this case."}
              </p>
            </div>

            {/* Credential Details Fields (Required details under Contact Preferences) */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-foreground mb-1">
                  Full Name {isAnonymous ? "(Optional for Anonymous)" : "*"}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    placeholder={isAnonymous ? "Anonymous Reporter" : "Enter your full name"}
                    className="w-full rounded-xl border border-border bg-background pl-9 pr-3 py-2 text-xs font-medium outline-none focus:border-primary transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-foreground mb-1">
                  Contact Email {contactPref === "email" && !isAnonymous ? "*" : "(For case updates)"}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={reporterEmail}
                    onChange={(e) => setReporterEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full rounded-xl border border-border bg-background pl-9 pr-3 py-2 text-xs font-medium outline-none focus:border-primary transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-foreground mb-1">
                  Mobile / WhatsApp Number {contactPref === "call" && !isAnonymous ? "*" : "(Optional)"}
                </label>
                <div className="flex items-center rounded-xl border border-border bg-background px-3 py-2 focus-within:border-primary transition-all">
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

              {/* Preferred Time Window */}
              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-foreground mb-1.5">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span>Preferred Callback / Follow-up Window</span>
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setContactTimeSlot(slot.id)}
                      className={`rounded-xl border px-2.5 py-1.5 text-[11px] font-semibold text-left transition ${
                        contactTimeSlot === slot.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background text-muted-foreground hover:bg-secondary/40"
                      }`}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Declaration confirmation */}
              <label className="flex items-start gap-2 pt-1 cursor-pointer select-none">
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
            </div>

            {/* Prominent Submit Button directly under Contact & Credential Preferences */}
            <div className="pt-2">
              <button
                type="button"
                onClick={submit}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3.5 px-5 shadow-md transition-all active:scale-[0.99] disabled:opacity-50"
              >
                <ShieldAlert className="h-4 w-4" />
                <span>{isSubmitting ? "Submitting Report..." : "Submit Suspicious Activity Report"}</span>
              </button>
              <p className="text-[10px] text-center text-muted-foreground mt-2">
                🔒 All reports are encrypted and reviewed by the Omeetso Trust & Safety team.
              </p>
            </div>
          </div>
        </div>

        {/* Fixed Bottom Bar on Mobile */}
        <div className="fixed inset-x-0 bottom-0 z-10 mx-auto max-w-[430px] border-t border-border bg-card/95 backdrop-blur-md p-3 safe-b">
          <button
            type="button"
            onClick={submit}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground shadow-md hover:bg-primary/90 transition-all active:scale-[0.99] disabled:opacity-50"
          >
            <ShieldAlert className="h-4 w-4" />
            <span>{isSubmitting ? "Submitting..." : "Submit report"}</span>
          </button>
        </div>
      </div>
    </MobileFrame>
  );
}

export default ReportPage;

