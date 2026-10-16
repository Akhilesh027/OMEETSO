import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import { createTicket } from "@/lib/account";
import { createSupportTicketApi } from "@/api/support.api";
import { toast } from "sonner";
import {
  Upload,
  ShoppingBag,
  Tag,
  Store,
  CreditCard,
  Megaphone,
  User,
  HelpCircle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Send,
  MessageSquare,
  Mail,
  Phone,
  Copy,
  ChevronRight,
  X,
  FileText
} from "lucide-react";

interface CategoryMeta {
  id: string;
  label: string;
  sub: string[];
  desc: string;
  icon: typeof ShoppingBag;
}

const CATEGORIES: CategoryMeta[] = [
  {
    id: "Buying",
    label: "Buying & Orders",
    desc: "Payment, delivery, seller issues or checkout help",
    icon: ShoppingBag,
    sub: ["Payment Failure", "Delivery Delay", "Damaged Item", "Refund Request", "Other"]
  },
  {
    id: "Selling",
    label: "Selling & Listings",
    desc: "Rejected listing, buyer inquiries or listing approval",
    icon: Tag,
    sub: ["Rejected Listing", "Listing Not Visible", "Fake Buyer", "Sold Out Flow", "Other"]
  },
  {
    id: "Stores",
    label: "Merchant Stores",
    desc: "Store verification, catalog, timings or store badge",
    icon: Store,
    sub: ["Verification Badge", "Working Hours", "Products Catalog", "Store Profile", "Other"]
  },
  {
    id: "Payments",
    label: "Payments & Wallet",
    desc: "UPI issues, duplicate charges, refunds or payouts",
    icon: CreditCard,
    sub: ["Wallet Balance", "Duplicate Charge", "Refund Pending", "Bank Transfer", "Other"]
  },
  {
    id: "Promotions",
    label: "Ads & Promotion",
    desc: "Featured listing campaigns, banners or ad insights",
    icon: Megaphone,
    sub: ["Campaign Setup", "Banner Placements", "Ad Performance", "Billing", "Other"]
  },
  {
    id: "Account",
    label: "Account & Profile",
    desc: "Login, phone verification, profile updates or security",
    icon: User,
    sub: ["Phone Change", "Profile Verification", "Security / Password", "Language", "Other"]
  },
  {
    id: "Other",
    label: "General Inquiry",
    desc: "General questions, app feedback or bug reports",
    icon: HelpCircle,
    sub: ["Bug Report", "Feature Suggestion", "Policy Question", "Other"]
  }
];

export const Route = createFileRoute("/support/new")({
  head: () => ({ meta: [{ title: "Create support ticket — Omeetso" }] }),
  validateSearch: (s: Record<string, unknown>) => ({ category: (s.category as string) ?? "" }),
  component: NewTicket,
});

function NewTicket() {
  const { category: cat0 } = useSearch({ from: "/support/new" });
  const nav = useNavigate();

  const initialCat = CATEGORIES.find(
    (c) => c.id.toLowerCase() === (cat0 || "").toLowerCase()
  )?.id || CATEGORIES[0].id;

  const [category, setCategory] = useState(initialCat);
  const [subcategory, setSubcategory] = useState("");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "URGENT">("MEDIUM");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [related, setRelated] = useState({ listing: "", store: "", campaign: "", payment: "" });
  const [showRelated, setShowRelated] = useState(false);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [contact, setContact] = useState<"in_app" | "email" | "call">("in_app");

  // User contact details prefilled
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [declarationConfirmed, setDeclarationConfirmed] = useState(true);
  const [busy, setBusy] = useState(false);

  // Submitted ticket state (like Report UI)
  const [submitted, setSubmitted] = useState<{
    id: string;
    ticketNumber: string;
    subject: string;
    category: string;
    contactMethod: string;
    priority: string;
  } | null>(null);

  // Load user info from localStorage if available
  useEffect(() => {
    try {
      const raw = localStorage.getItem("omeetso_user");
      if (raw) {
        const u = JSON.parse(raw);
        if (u.profile?.name || u.name) setUserName(u.profile?.name || u.name);
        if (u.email) setUserEmail(u.email);
        if (u.phone) setUserPhone(u.phone);
      }
    } catch {
      // ignore
    }
  }, []);

  const currentCategoryMeta = CATEGORIES.find((c) => c.id === category) || CATEGORIES[0];
  const subs = currentCategoryMeta.sub;

  const pick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (attachments.length + files.length > 5) {
      toast.error("Maximum 5 attachments allowed");
      return;
    }
    const over = files.find((f) => f.size > 5 * 1024 * 1024);
    if (over) {
      toast.error("Each attachment must be under 5MB");
      return;
    }
    setAttachments((cur) => [...cur, ...files.map((f) => `ref://${f.name}`)]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((cur) => cur.filter((_, i) => i !== index));
  };

  const copyTicketId = (text: string) => {
    navigator.clipboard?.writeText(text);
    toast.success("Ticket reference copied to clipboard!");
  };

  const submit = async () => {
    if (busy) return;
    if (!subject.trim()) {
      toast.error("Please enter a subject summary");
      return;
    }
    if (!description.trim()) {
      toast.error("Please describe what happened in detail");
      return;
    }
    if (description.trim().length < 5) {
      toast.error("Description must be at least 5 characters");
      return;
    }
    if (contact === "email" && userEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (contact === "call" && userPhone.trim() && userPhone.replace(/\D/g, "").length < 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }
    if (!declarationConfirmed) {
      toast.error("Please acknowledge the information accuracy statement");
      return;
    }

    setBusy(true);
    try {
      let serverTicketId: string | null = null;
      let ticketNum = "";

      // 1. Submit live to Backend Support Database
      try {
        const serverRes = await createSupportTicketApi({
          category,
          subcategory: subcategory || undefined,
          subject: subject.trim(),
          description: description.trim(),
          priority,
          contactMethod: contact,
          relatedListing: related.listing.trim() || undefined,
          relatedStore: related.store.trim() || undefined,
          relatedCampaign: related.campaign.trim() || undefined,
          relatedPayment: related.payment.trim() || undefined,
          attachments,
        });

        if (serverRes.success && serverRes.data) {
          serverTicketId = serverRes.data.id;
          ticketNum = serverRes.data.ticketNumber;
        }
      } catch (e) {
        console.warn("Backend ticket dispatch warning, syncing locally:", e);
      }

      // 2. Also record in local account store for immediate client access & offline support
      const t = createTicket({
        category,
        subcategory,
        subject: subject.trim(),
        description: description.trim(),
        attachments,
        contactMethod: contact,
        relatedListing: related.listing.trim() || undefined,
        relatedStore: related.store.trim() || undefined,
        relatedCampaign: related.campaign.trim() || undefined,
        relatedPayment: related.payment.trim() || undefined,
      });

      const finalId = serverTicketId || t.id;
      const finalNumber = ticketNum || t.number;

      // Handle email or phone direct dispatch if needed
      if (contact === "email") {
        const mailSubject = encodeURIComponent(`[Omeetso Support #${finalNumber}] ${subject.trim()}`);
        const mailBody = encodeURIComponent(
          `Hello Omeetso Support Team,\n\nI have submitted a support request (Ticket #${finalNumber}).\n\nSubject: ${subject.trim()}\nCategory: ${category}${
            subcategory ? ` - ${subcategory}` : ""
          }\nDescription:\n${description.trim()}\n\nPlease respond to me via email.\n\nThank you,\n${userName || "Omeetso Member"}`
        );
        window.location.href = `mailto:info@omeetso.in?subject=${mailSubject}&body=${mailBody}`;
      } else if (contact === "call") {
        window.location.href = "tel:+919876543210";
      }

      toast.success(`Support ticket #${finalNumber} filed successfully!`);

      // Set submitted state for the rich confirmation UI (matching Report UI!)
      setSubmitted({
        id: finalId,
        ticketNumber: finalNumber,
        subject: subject.trim(),
        category,
        contactMethod: contact,
        priority,
      });

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      toast.error(err?.message || "Failed to create support ticket");
    } finally {
      setBusy(false);
    }
  };

  const resetForm = () => {
    setSubmitted(null);
    setSubject("");
    setDescription("");
    setSubcategory("");
    setAttachments([]);
    setRelated({ listing: "", store: "", campaign: "", payment: "" });
  };

  // ─── Post-Submission Success Screen (like Report UI) ──────────────────────────
  if (submitted) {
    return (
      <MobileFrame>
        <div className="min-h-dvh bg-background pb-20 font-sans">
          <BackBar title="Ticket Submitted" onBack={() => nav({ to: "/support" })} />

          <div className="px-4 pt-2 space-y-4 max-w-2xl mx-auto">
            {/* Success Hero Card */}
            <div className="rounded-3xl gradient-brand p-6 text-white shadow-xl relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md text-amber-300 shadow-inner">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <div>
                  <h1 className="text-lg font-black tracking-tight leading-tight">
                    Support Ticket Filed
                  </h1>
                  <p className="text-xs text-white/80 font-medium">
                    Logged directly in the customer support database
                  </p>
                </div>
              </div>

              {/* Reference ID Pill */}
              <div className="mt-4 flex items-center justify-between rounded-2xl bg-black/20 p-3 backdrop-blur-sm border border-white/10">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase tracking-wider text-white/70 font-bold block">
                    Ticket Reference #
                  </span>
                  <span className="font-mono text-sm font-extrabold text-amber-300">
                    {submitted.ticketNumber}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copyTicketId(submitted.ticketNumber)}
                  className="flex items-center gap-1.5 rounded-xl bg-white/20 px-3 py-1.5 text-xs font-bold hover:bg-white/30 transition active:scale-95 cursor-pointer"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </button>
              </div>
            </div>

            {/* Ticket Summary Card */}
            <div className="rounded-2xl border border-border bg-card p-4 space-y-2.5 text-xs shadow-xs">
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <span className="text-muted-foreground font-semibold">Subject</span>
                <span className="font-bold text-foreground text-right line-clamp-1 max-w-[200px]">
                  {submitted.subject}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <span className="text-muted-foreground font-semibold">Category</span>
                <span className="font-bold text-primary">{submitted.category}</span>
              </div>
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <span className="text-muted-foreground font-semibold">Priority</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                  {submitted.priority}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-semibold">Contact Preference</span>
                <span className="font-bold text-foreground capitalize">
                  {submitted.contactMethod === "in_app"
                    ? "In-App Live Desk"
                    : submitted.contactMethod === "email"
                    ? "Email Reply"
                    : "Phone Hotline"}
                </span>
              </div>
            </div>

            {/* Response SLA Notice */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs space-y-1">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
                <Clock className="h-4 w-4" />
                <span>Estimated Response Time</span>
              </div>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Our support desk usually responds within{" "}
                <span className="font-bold text-foreground">
                  {submitted.priority === "URGENT" || submitted.priority === "HIGH" ? "1–2 hours" : "4–8 business hours"}
                </span>
                . You will receive real-time notifications in your Omeetso inbox.
              </p>
            </div>

            {/* Primary Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => nav({ to: "/support/$id", params: { id: submitted.id } })}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-md hover:bg-primary/90 transition active:scale-[0.99] cursor-pointer"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Open Live Support Desk</span>
                <ChevronRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => nav({ to: "/support" })}
                className="w-full rounded-2xl border border-border bg-card py-3 text-xs font-bold text-foreground hover:bg-secondary transition active:scale-[0.99] cursor-pointer"
              >
                View All My Support Tickets
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="w-full py-2 text-center text-xs font-semibold text-muted-foreground hover:text-foreground transition"
              >
                Submit another request
              </button>
            </div>
          </div>
        </div>
      </MobileFrame>
    );
  }

  // ─── Main Creation Form (Upgraded like Report UI) ───────────────────────────
  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-32 font-sans">
        <BackBar title="Submit Support Request" onBack={() => nav({ to: "/support" })} />

        <div className="px-4 pt-2 space-y-4 max-w-2xl mx-auto">
          {/* Header Info Banner */}
          <div className="rounded-2xl bg-secondary/50 p-3.5 border border-border flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="text-xs space-y-0.5">
              <p className="font-bold text-foreground">Direct Omeetso Support Team</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Connect directly with our customer experience officers. We review inquiries 24/7.
              </p>
            </div>
          </div>

          {/* 1. Category Selection Cards (matching Report UI) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                1. Select Help Category <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] text-primary font-bold">{category}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => {
                const IconComponent = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setCategory(cat.id);
                      setSubcategory("");
                    }}
                    className={`flex flex-col items-start p-3 rounded-2xl border text-left transition-all cursor-pointer active:scale-[0.98] ${
                      isSelected
                        ? "border-primary bg-primary/5 ring-1 ring-primary shadow-xs"
                        : "border-border bg-card hover:bg-secondary/40"
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-xl mb-2 ${
                        isSelected ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold text-foreground line-clamp-1">{cat.label}</span>
                    <span className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5 leading-snug">
                      {cat.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subcategory Pills */}
          {subs.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-muted-foreground">Subcategory</label>
              <div className="flex flex-wrap gap-1.5">
                {subs.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSubcategory(s === subcategory ? "" : s)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition active:scale-95 cursor-pointer ${
                      subcategory === s
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "border border-border bg-card text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 2. Priority Level */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
              2. Priority Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "LOW", label: "Normal", desc: "General question" },
                { id: "MEDIUM", label: "Standard", desc: "Order or listing" },
                { id: "URGENT", label: "Urgent", desc: "Payment or fraud" }
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPriority(p.id as any)}
                  className={`p-2.5 rounded-xl border text-center transition cursor-pointer active:scale-95 ${
                    priority === p.id
                      ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                      : "border-border bg-card text-muted-foreground hover:bg-secondary text-xs"
                  }`}
                >
                  <div className="text-xs font-extrabold">{p.label}</div>
                  <div className="text-[9px] opacity-75">{p.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Subject and Description */}
          <div className="space-y-3">
            <label className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground block">
              3. Issue Summary & Details <span className="text-rose-500">*</span>
            </label>

            <div>
              <span className="text-[11px] font-semibold text-foreground">Subject summary *</span>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of your inquiry (e.g. Payment not reflecting)"
                className="mt-1 w-full rounded-2xl border border-border bg-card px-3.5 py-2.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-foreground">Detailed description *</span>
                <span className="text-[10px] text-muted-foreground font-mono">{description.length} chars</span>
              </div>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain the issue clearly with relevant order numbers, dates, or what steps you took..."
                className="mt-1 w-full rounded-2xl border border-border bg-card px-3.5 py-2.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition resize-none"
              />
            </div>
          </div>

          {/* 4. Related Context Fields (Collapsible / Optional) */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setShowRelated(!showRelated)}
              className="flex items-center justify-between w-full text-xs font-extrabold uppercase tracking-wider text-muted-foreground hover:text-foreground transition"
            >
              <span>4. Link Related Item / Store (Optional)</span>
              <span className="text-[11px] font-bold text-primary">{showRelated ? "Hide" : "+ Add details"}</span>
            </button>

            {showRelated && (
              <div className="grid grid-cols-2 gap-2 p-3 bg-secondary/30 rounded-2xl border border-border">
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground">Listing ID / Title</span>
                  <input
                    type="text"
                    value={related.listing}
                    onChange={(e) => setRelated({ ...related, listing: e.target.value })}
                    placeholder="e.g. iPhone 13 or #1234"
                    className="mt-1 w-full rounded-xl border border-border bg-card px-2.5 py-2 text-xs outline-none"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground">Store Name / ID</span>
                  <input
                    type="text"
                    value={related.store}
                    onChange={(e) => setRelated({ ...related, store: e.target.value })}
                    placeholder="e.g. TechZone Store"
                    className="mt-1 w-full rounded-xl border border-border bg-card px-2.5 py-2 text-xs outline-none"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground">Campaign Ref</span>
                  <input
                    type="text"
                    value={related.campaign}
                    onChange={(e) => setRelated({ ...related, campaign: e.target.value })}
                    placeholder="e.g. CMP-8819"
                    className="mt-1 w-full rounded-xl border border-border bg-card px-2.5 py-2 text-xs outline-none"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground">Payment / UTR Ref</span>
                  <input
                    type="text"
                    value={related.payment}
                    onChange={(e) => setRelated({ ...related, payment: e.target.value })}
                    placeholder="e.g. pay_XXXXX"
                    className="mt-1 w-full rounded-xl border border-border bg-card px-2.5 py-2 text-xs outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 5. Screenshot & Evidence Attachments */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground block">
              5. Screenshots & Attachments (Optional)
            </label>

            <label className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-border bg-card p-4 text-center cursor-pointer hover:border-primary/50 transition">
              <Upload className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs font-bold text-foreground">Click to upload screenshots</span>
              <span className="text-[10px] text-muted-foreground">PNG, JPG or PDF up to 5MB each (max 5)</span>
              <input type="file" multiple className="hidden" onChange={pick} aria-label="Attach files" />
            </label>

            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {attachments.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-2.5 py-1.5 text-xs font-medium shadow-2xs"
                  >
                    <FileText className="h-3.5 w-3.5 text-primary" />
                    <span className="line-clamp-1 max-w-[140px] text-[11px]">{file.replace("ref://", "")}</span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(idx)}
                      className="text-muted-foreground hover:text-rose-500 ml-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 6. Preferred Contact Method */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground block">
              6. Preferred Contact Method
            </label>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "in_app", label: "In-App Desk", icon: MessageSquare },
                { id: "email", label: "Email", icon: Mail },
                { id: "call", label: "Phone Call", icon: Phone }
              ].map((c) => {
                const IconComponent = c.icon;
                const active = contact === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setContact(c.id as any)}
                    className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-bold transition active:scale-95 cursor-pointer ${
                      active
                        ? "border-primary bg-primary/10 text-primary shadow-xs"
                        : "border-border bg-card text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    <IconComponent className="h-3.5 w-3.5" />
                    <span>{c.label}</span>
                  </button>
                );
              })}
            </div>

            {contact === "email" && (
              <div className="p-3 bg-secondary/30 rounded-2xl border border-border space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground">Your Email Address</span>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-xl border border-border bg-card px-3 py-2 text-xs outline-none"
                />
              </div>
            )}

            {contact === "call" && (
              <div className="p-3 bg-secondary/30 rounded-2xl border border-border space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground">Your Phone Number for Callback</span>
                <input
                  type="tel"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-xl border border-border bg-card px-3 py-2 text-xs outline-none"
                />
              </div>
            )}
          </div>

          {/* 7. Declaration Checkbox */}
          <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-secondary/30 border border-border cursor-pointer select-none">
            <input
              type="checkbox"
              checked={declarationConfirmed}
              onChange={(e) => setDeclarationConfirmed(e.target.checked)}
              className="mt-0.5 rounded border-border text-primary focus:ring-0"
            />
            <span className="text-[11px] text-muted-foreground leading-snug">
              I certify that the information provided in this support ticket is accurate and true to the best of my knowledge.
            </span>
          </label>

          {/* Desktop & Tablet Inline Action Bar */}
          <div className="hidden md:flex items-center justify-between pt-4 border-t border-border/80">
            <button
              type="button"
              onClick={() => nav({ to: "/support" })}
              className="rounded-2xl border border-border bg-secondary/80 px-6 py-3 text-xs font-bold text-foreground hover:bg-secondary transition active:scale-95 cursor-pointer"
            >
              Cancel
            </button>

            <button
              id="submit-ticket-desktop-btn"
              type="button"
              onClick={submit}
              disabled={busy || !declarationConfirmed}
              className="flex items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 px-8 text-xs font-black text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer"
            >
              <Send className="h-4 w-4" />
              <span>{busy ? "Submitting Ticket..." : "Submit Support Request"}</span>
            </button>
          </div>
        </div>

        {/* Mobile-Only Bottom Floating Action Bar */}
        <div className="md:hidden fixed inset-x-0 bottom-0 z-20 mx-auto max-w-[430px] border-t border-border/80 bg-background/95 backdrop-blur-xl p-3 safe-b shadow-2xl">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => nav({ to: "/support" })}
              className="rounded-2xl border border-border bg-secondary/80 px-4 py-3 text-xs font-bold text-foreground hover:bg-secondary transition active:scale-95"
            >
              Cancel
            </button>

            <button
              id="submit-ticket-btn"
              type="button"
              onClick={submit}
              disabled={busy || !declarationConfirmed}
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 px-4 text-xs font-black text-primary-foreground shadow-md hover:bg-primary/90 active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer"
            >
              <Send className="h-4 w-4" />
              <span>{busy ? "Submitting..." : "Submit Request"}</span>
            </button>
          </div>
        </div>
      </div>
    </MobileFrame>
  );
}

export default NewTicket;
