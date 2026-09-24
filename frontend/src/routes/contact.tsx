import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Mail,
  MapPin,
  Building2,
  ShieldAlert,
  Send,
  Upload,
  CheckCircle2,
  HelpCircle,
  Briefcase,
  Megaphone,
  CreditCard,
  Flag,
  Lock,
  Scale,
  Sparkles,
  Phone,
  Copy,
  ExternalLink,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us – Omeetso Support, Business & Grievances" },
      {
        name: "description",
        content:
          "Get in touch with the Omeetso support team. Contact us for account support, listings, advertising, promotions, payments, safety reports, and business enquiries.",
      },
      { property: "og:title", content: "Contact Us – Omeetso" },
      {
        property: "og:description",
        content: "Contact Omeetso support, business enquiries, advertising, safety, and grievance redressal.",
      },
    ],
  }),
  component: ContactPage,
});

const ENQUIRY_TYPES = [
  "General Enquiry",
  "Account Support",
  "Listing Support",
  "Seller / Business Support",
  "Advertising & Promotions",
  "Payment Support",
  "Safety / Report an Issue",
  "Privacy Request",
  "Careers",
  "Other",
];

function ContactPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [enquiryType, setEnquiryType] = useState(ENQUIRY_TYPES[0]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Attachment must be under 5MB");
      return;
    }
    setAttachmentName(file.name);
    toast.success(`Attached ${file.name}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.error("Please enter your full name");
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (!mobile.trim() || mobile.trim().length < 10) {
      toast.error("Please enter a valid mobile number");
      return;
    }
    if (!subject.trim()) {
      toast.error("Please enter a subject for your enquiry");
      return;
    }
    if (!message.trim() || message.trim().length < 15) {
      toast.error("Please enter a detailed message (minimum 15 characters)");
      return;
    }

    setSubmitting(true);

    setTimeout(() => {
      const generatedRef = `OMT-${Date.now().toString().slice(-6)}`;
      setSubmittedId(generatedRef);
      setSubmitting(false);
      toast.success(`Enquiry submitted successfully! Reference: ${generatedRef}`);
    }, 800);
  };

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setMobile("");
    setEnquiryType(ENQUIRY_TYPES[0]);
    setSubject("");
    setMessage("");
    setAttachmentName(null);
    setSubmittedId(null);
  };

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} to clipboard!`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Top Breadcrumbs */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-7xl items-center space-x-2 px-4 py-3 text-xs font-semibold text-slate-500 sm:px-6 lg:px-8 dark:text-slate-400">
          <Link to="/home" className="hover:text-amber-500 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-amber-600 dark:text-amber-400 font-bold">Contact Us</span>
        </div>
      </nav>

      {/* Hero Header */}
      <header className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-blue-950 via-slate-900 to-slate-950 text-white dark:border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.15),transparent_50%)] pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3.5 py-1.5 text-xs font-bold text-amber-300 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" />
            <span>We’re Here to Help</span>
          </div>

          <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl md:text-6xl text-white">
            Contact <span className="text-amber-400">Omeetso</span>
          </h1>

          <p className="mt-5 max-w-3xl text-base sm:text-lg leading-relaxed text-slate-200 font-normal">
            Have a question about Omeetso, your account, listings, advertising, promotions, safety, payments, or any other
            platform-related matter? Our team is here to assist you.
          </p>

          {/* Quick Info Badges */}
          <div className="mt-8 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-300">
            <button
              type="button"
              onClick={() => copyText("info@omeetso.in", "Email")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-2 backdrop-blur-sm hover:bg-white/20 transition-colors"
            >
              <Mail className="h-3.5 w-3.5 text-amber-400" />
              <span>info@omeetso.in</span>
              <Copy className="h-3 w-3 text-slate-400 ml-1" />
            </button>
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-2 backdrop-blur-sm">
              <MapPin className="h-3.5 w-3.5 text-amber-400" />
              Uppal, Hyderabad, Telangana, India
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-2 backdrop-blur-sm">
              <Building2 className="h-3.5 w-3.5 text-amber-400" />
              Digitalness Industries LLP
            </span>
          </div>
        </div>
      </header>

      {/* Security Warning Callout Banner */}
      <div className="border-b border-amber-200 bg-amber-50 px-4 py-4 dark:border-amber-900/50 dark:bg-amber-950/40">
        <div className="mx-auto flex max-w-7xl items-start gap-3 sm:px-6 lg:px-8">
          <ShieldAlert className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
            <strong className="text-amber-800 dark:text-amber-300 uppercase tracking-wider block font-black">
              Important Security Notice:
            </strong>
            Omeetso will never ask users to share their OTP, UPI PIN, card PIN, CVV, internet banking password, or account password
            through email, phone calls, or support messages. Never disclose sensitive banking or security credentials to anyone.
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-16">
        
        {/* Contact Form & Quick Cards Grid */}
        <section className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-start">
          
          {/* Left Column: Interactive Contact Form */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">
                  Send Us a Message
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-8">
                Fill out the form below and our team will get back to you promptly.
              </p>

              {submittedId ? (
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center space-y-4">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-slate-950">
                    <CheckCircle2 className="h-6 w-6 stroke-[2.5]" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                    Thank you! Your enquiry has been received.
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                    Your reference number is <strong>{submittedId}</strong>. We have logged your enquiry and our support team will respond to <strong>{email}</strong>.
                  </p>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="mt-4 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200 transition-colors"
                  >
                    Submit Another Enquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Ramesh Kumar"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs outline-none focus:border-amber-500 focus:bg-white focus:ring-1 focus:ring-amber-500 dark:border-slate-800 dark:bg-slate-800 dark:focus:bg-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs outline-none focus:border-amber-500 focus:bg-white focus:ring-1 focus:ring-amber-500 dark:border-slate-800 dark:bg-slate-800 dark:focus:bg-slate-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Mobile Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs outline-none focus:border-amber-500 focus:bg-white focus:ring-1 focus:ring-amber-500 dark:border-slate-800 dark:bg-slate-800 dark:focus:bg-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Enquiry Type <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={enquiryType}
                        onChange={(e) => setEnquiryType(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs outline-none focus:border-amber-500 focus:bg-white focus:ring-1 focus:ring-amber-500 dark:border-slate-800 dark:bg-slate-800 dark:focus:bg-slate-900"
                      >
                        {ENQUIRY_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Subject <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Brief summary of your enquiry"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs outline-none focus:border-amber-500 focus:bg-white focus:ring-1 focus:ring-amber-500 dark:border-slate-800 dark:bg-slate-800 dark:focus:bg-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Message <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Please provide complete details so we can assist you effectively..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs outline-none focus:border-amber-500 focus:bg-white focus:ring-1 focus:ring-amber-500 dark:border-slate-800 dark:bg-slate-800 dark:focus:bg-slate-900"
                    />
                  </div>

                  {/* Optional File Attachment */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Attachment <span className="text-slate-400 font-normal">(Optional, max 5MB)</span>
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="inline-flex items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">
                        <Upload className="h-3.5 w-3.5" />
                        <span>{attachmentName ? "Change File" : "Upload File / Screenshot"}</span>
                        <input type="file" onChange={handleFilePick} className="hidden" />
                      </label>
                      {attachmentName && (
                        <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium dark:text-emerald-400">
                          <CheckCircle2 className="h-4 w-4 shrink-0" />
                          <span className="truncate max-w-[200px]">{attachmentName}</span>
                          <button
                            type="button"
                            onClick={() => setAttachmentName(null)}
                            className="text-rose-500 hover:underline text-[10px]"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-2xl bg-amber-500 py-3.5 text-xs font-black text-slate-950 hover:bg-amber-400 active:scale-[0.99] disabled:opacity-60 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="h-4 w-4" />
                    <span>{submitting ? "Sending Enquiry..." : "Submit Enquiry"}</span>
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right Column: Key Contacts & What You Can Contact Us For */}
          <div className="lg:col-span-5 space-y-6">
            {/* Primary Direct Contact Box */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
              <h3 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-amber-500" />
                Get in Touch
              </h3>

              <div className="space-y-3 text-xs">
                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1.5">
                  <span className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider">
                    Official Support Email
                  </span>
                  <div className="flex items-center justify-between">
                    <a
                      href="mailto:info@omeetso.in"
                      className="text-sm font-black text-amber-600 dark:text-amber-400 hover:underline"
                    >
                      info@omeetso.in
                    </a>
                    <button
                      type="button"
                      onClick={() => copyText("info@omeetso.in", "Email")}
                      className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                      title="Copy Email"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                  <span className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider">
                    Location
                  </span>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    Uppal, Hyderabad, Telangana, India
                  </p>
                  <p className="text-[11px] text-slate-500">Operated by Digitalness Industries LLP</p>
                </div>
              </div>

              {/* What You Can Contact Us For */}
              <div className="pt-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                  You can contact us for:
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    General enquiries
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    Account support
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    Listing support
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    Seller & business
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    Advertising & promos
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    Listing boosts
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    Payment queries
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    Technical issues
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    Safety concerns
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    Privacy requests
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                Quick Help Resources
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold">
                <Link
                  to="/help"
                  className="flex items-center justify-between rounded-xl border border-slate-200 p-3 hover:border-amber-500 hover:text-amber-600 dark:border-slate-800 dark:hover:border-amber-400 transition-colors"
                >
                  <span>Help Centre & FAQs</span>
                  <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                </Link>
                <Link
                  to="/safety"
                  className="flex items-center justify-between rounded-xl border border-slate-200 p-3 hover:border-amber-500 hover:text-amber-600 dark:border-slate-800 dark:hover:border-amber-400 transition-colors"
                >
                  <span>Safety Centre</span>
                  <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                </Link>
                <Link
                  to="/privacy"
                  className="flex items-center justify-between rounded-xl border border-slate-200 p-3 hover:border-amber-500 hover:text-amber-600 dark:border-slate-800 dark:hover:border-amber-400 transition-colors"
                >
                  <span>Privacy Policy</span>
                  <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                </Link>
                <Link
                  to="/careers"
                  className="flex items-center justify-between rounded-xl border border-slate-200 p-3 hover:border-amber-500 hover:text-amber-600 dark:border-slate-800 dark:hover:border-amber-400 transition-colors"
                >
                  <span>Careers at Omeetso</span>
                  <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                </Link>
              </div>
            </div>
          </div>

        </section>

        {/* Specialized Contact Channels / Department Breakdowns */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-slate-100">
              Specialized Support & Department Channels
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Reach the right team directly with the required details for faster resolution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Customer Support */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400">
                <HelpCircle className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Customer Support</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                If you are experiencing an issue while using Omeetso, contact us at <strong>info@omeetso.in</strong>. Include:
              </p>
              <ul className="text-xs space-y-1 text-slate-500 dark:text-slate-400 list-disc pl-4">
                <li>Your registered name</li>
                <li>Registered email or mobile number</li>
                <li>Listing ID (if applicable)</li>
                <li>Payment / transaction reference</li>
                <li>Short explanation & screenshots</li>
              </ul>
              <div className="pt-2 text-[11px] text-amber-700 dark:text-amber-400 font-semibold">
                ⚠️ Do not share OTPs, PINs, card CVVs, or passwords.
              </div>
            </div>

            {/* Seller & Business Enquiries */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400">
                <Briefcase className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Seller & Business Enquiries</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Omeetso supports individuals, local sellers, small businesses, and brands. Contact us for:
              </p>
              <ul className="text-xs space-y-1 text-slate-500 dark:text-slate-400 list-disc pl-4">
                <li>Business onboarding & seller support</li>
                <li>Listing visibility & store setups</li>
                <li>Sponsored promotions & featured listings</li>
                <li>Advertising campaigns & listing boosts</li>
                <li>Local marketing opportunities</li>
              </ul>
              <div className="pt-2 text-xs font-bold text-slate-900 dark:text-slate-100">
                Email: <span className="text-amber-600 dark:text-amber-400">info@omeetso.in</span>
              </div>
            </div>

            {/* Advertising & Promotional Services */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 dark:bg-purple-400/10 dark:text-purple-400">
                <Megaphone className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Advertising & Promotions</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Tailored promotional opportunities for sellers wanting additional hyperlocal reach:
              </p>
              <ul className="text-xs space-y-1 text-slate-500 dark:text-slate-400 list-disc pl-4">
                <li>Sponsored listings & listing boosts</li>
                <li>Featured placements & category banners</li>
                <li>Targeted neighborhood promotional campaigns</li>
                <li>Brand visibility services</li>
              </ul>
              <div className="pt-2 text-xs font-bold text-slate-900 dark:text-slate-100">
                Email: <span className="text-amber-600 dark:text-amber-400">info@omeetso.in</span>
              </div>
            </div>

            {/* Payment Support */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400">
                <CreditCard className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Payment Support</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                For eligible direct Omeetso platform services (advertising, promotions, boosts). Include:
              </p>
              <ul className="text-xs space-y-1 text-slate-500 dark:text-slate-400 list-disc pl-4">
                <li>Name & registered mobile/email</li>
                <li>Payment date & amount</li>
                <li>Transaction / payment ID</li>
                <li>Service purchased & issue description</li>
              </ul>
              <div className="pt-2 text-[11px] text-amber-700 dark:text-amber-400 font-semibold">
                🔒 Never share UPI PINs, card CVVs, or bank passwords.
              </div>
            </div>

            {/* Report a Listing or User */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 dark:bg-rose-400/10 dark:text-rose-400">
                <Flag className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Report a Listing or User</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Report suspicious, misleading, prohibited, or potentially fraudulent activity found on the platform:
              </p>
              <ul className="text-xs space-y-1 text-slate-500 dark:text-slate-400 list-disc pl-4">
                <li>Listing ID & seller details</li>
                <li>Description of the concern / violation</li>
                <li>Relevant screenshots & evidence</li>
              </ul>
              <div className="pt-2 text-xs font-bold text-slate-900 dark:text-slate-100">
                Email: <span className="text-amber-600 dark:text-amber-400">info@omeetso.in</span>
              </div>
            </div>

            {/* Privacy & Grievance Redressal */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-400">
                <Scale className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Grievance & Privacy Requests</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                For data privacy requests or grievance escalation under Indian IT Intermediary Rules:
              </p>
              <ul className="text-xs space-y-1 text-slate-500 dark:text-slate-400 list-disc pl-4">
                <li>Subject: <strong>Grievance – Omeetso</strong> or <strong>Privacy Request</strong></li>
                <li>Grievance Officer, Digitalness Industries LLP</li>
                <li>Location: Uppal, Hyderabad, Telangana, India</li>
              </ul>
              <div className="pt-2 text-xs font-bold text-slate-900 dark:text-slate-100">
                Email: <span className="text-amber-600 dark:text-amber-400">info@omeetso.in</span>
              </div>
            </div>

          </div>
        </section>

        {/* Stay Connected / Feedback Banner */}
        <section className="rounded-3xl bg-slate-900 p-8 sm:p-10 text-white dark:bg-slate-900 border border-slate-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-xl font-black text-white">Stay Connected & Share Feedback</h3>
              <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                We value feedback from our users and businesses. Suggestions regarding new categories, features, improvements,
                safety measures, or user experience are always welcome.
              </p>
            </div>
            <a
              href="mailto:info@omeetso.in?subject=Omeetso%20Feedback%20and%20Suggestions"
              className="rounded-2xl bg-amber-500 px-6 py-3 text-xs font-black text-slate-950 hover:bg-amber-400 transition-all shadow-md shrink-0"
            >
              Share Feedback
            </a>
          </div>
        </section>

      </main>
    </div>
  );
}
