import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import { BottomNav } from "@/components/omeetso/BottomNav";
import {
  Bolt, ClipboardList, Briefcase, Wrench, Store as StoreIcon, FileClock,
  HelpCircle, ShieldAlert, Sparkles, ArrowRight, ShieldCheck, Check,
  Zap, Package, Flame, Clock, ChevronRight, Layers, Building2
} from "lucide-react";
import { listDrafts, seedIfEmpty } from "@/lib/listings";
import { fetchLiveUserStores, type Store } from "@/lib/stores";
import { getTrustScore, getVerifications } from "@/lib/account";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/sell/")({
  head: () => ({
    meta: [
      { title: "Sell & Publish on Omeetso — Choose What to List" },
      { name: "description", content: "Sell products, offer professional services, post jobs, or manage your business storefront on Omeetso." },
      { property: "og:title", content: "Publish & Sell on Omeetso" },
      { property: "og:description", content: "Choose Quick Sell, Detailed Products, Services, Jobs, or Store on Omeetso." },
    ],
  }),
  component: SellHome,
});

function SellHome() {
  const nav = useNavigate();
  const [drafts, setDrafts] = useState(0);
  const [userStores, setUserStores] = useState<Store[]>([]);
  const [trustModal, setTrustModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "products" | "services_jobs" | "business">("all");

  useEffect(() => {
    seedIfEmpty();
    setDrafts(listDrafts().length);
    fetchLiveUserStores().then((stores) => setUserStores(stores));
  }, []);

  const trustScore = getTrustScore();
  const MIN_SCORE = 35; // Phone Verification status unlocks listing
  const isEligible = trustScore >= MIN_SCORE;
  const verifs = getVerifications();

  const hasStore = userStores.length > 0;
  const primaryStore = userStores[0];

  const handleStartListing = (targetRoute: string) => {
    if (!isEligible) {
      setTrustModal(true);
      toast.error(`Minimum Trust Score of ${MIN_SCORE} required to list products`);
      return;
    }
    nav({ to: targetRoute as any });
  };

  const sellSections = [
    {
      category: "products",
      sectionLabel: "Physical Products & Items",
      sectionDesc: "Sell used or new cars, mobiles, electronics, furniture & fashion items.",
      items: [
        {
          id: "quick",
          title: "Quick Sell",
          subtitle: "Post in under 1 minute for rapid local buyers with clearance badge.",
          badge: "🔥 1-Min Clearance",
          badgeColor: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
          icon: Bolt,
          iconBg: "bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20",
          benefits: ["Instant urgent tag", "Minimal photos & details", "Fast buyer connect"],
          to: isEligible ? "/sell/quick" : "/sell",
          requiresEligibility: true,
          theme: "amber",
        },
        {
          id: "detailed",
          title: "Detailed Regular Listing",
          subtitle: "Complete category specifications, inspected flags & highest search rank.",
          badge: "0% Commission",
          badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
          icon: ClipboardList,
          iconBg: "bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md shadow-blue-500/20",
          benefits: ["Custom filters & specs", "Multi-angle photo gallery", "Maximum visibility"],
          to: isEligible ? "/sell/detailed" : "/sell",
          requiresEligibility: true,
          theme: "blue",
        },
      ],
    },
    {
      category: "services_jobs",
      sectionLabel: "Professional Services & Careers",
      sectionDesc: "Offer doorstep home services, repairs, tutoring, or hire local talent.",
      items: [
        {
          id: "services",
          title: "Offer a Service",
          subtitle: "List AC repair, home deep cleaning, electricians, salon, tutors & mechanics.",
          badge: "🛠️ Services Vertical",
          badgeColor: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
          icon: Wrench,
          iconBg: "bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-md shadow-rose-500/20",
          benefits: ["Doorstep booking slots", "Transparent rate cards", "Lead & quote manager"],
          to: "/services/new",
          requiresEligibility: false,
          theme: "rose",
        },
        {
          id: "jobs",
          title: "Post a Job Opening",
          subtitle: "Hire local & remote candidates with salary criteria and walk-in drives.",
          badge: "💼 Job Vertical",
          badgeColor: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
          icon: Briefcase,
          iconBg: "bg-gradient-to-br from-violet-600 to-purple-700 text-white shadow-md shadow-violet-500/20",
          benefits: ["Walk-In drive details", "Candidate applications", "Interview scheduling"],
          to: "/jobs/new",
          requiresEligibility: false,
          theme: "violet",
        },
      ],
    },
    {
      category: "business",
      sectionLabel: "Business & Catalog Management",
      sectionDesc: "Setup a branded merchant store or resume editing saved drafts.",
      items: [
        {
          id: "store",
          title: hasStore ? "Manage Your Store" : "Create Business Storefront",
          subtitle: hasStore
            ? `${primaryStore?.name || "Omeetso Store"} · Manage store catalog & deals`
            : "Setup branded shop profile, publish store inventory & get verified store badge.",
          badge: "🏪 Business Pro",
          badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
          icon: StoreIcon,
          iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20",
          benefits: ["Custom storefront URL", "Unlimited catalog items", "Store analytics & deals"],
          to: hasStore ? (userStores.length === 1 ? `/store/manage/${primaryStore.id}` : "/store/select") : "/store/create",
          requiresEligibility: false,
          theme: "emerald",
        },
        {
          id: "drafts",
          title: drafts > 0 ? `Unfinished Drafts (${drafts})` : "Unfinished Drafts",
          subtitle: drafts > 0
            ? `You have ${drafts} saved draft listing${drafts === 1 ? "" : "s"} ready to continue.`
            : "Auto-saved listings are preserved here to resume anytime.",
          badge: "Saved Progress",
          badgeColor: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
          icon: FileClock,
          iconBg: "bg-gradient-to-br from-slate-700 to-zinc-800 text-white shadow-md shadow-slate-500/20",
          benefits: ["Auto-saved edits", "1-click resume", "Easy bulk publishing"],
          to: "/sell/drafts",
          requiresEligibility: false,
          theme: "slate",
        },
      ],
    },
  ];

  const filteredSections = activeTab === "all"
    ? sellSections
    : sellSections.filter((s) => s.category === activeTab);

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-28 md:pb-16 font-sans">
        {/* Mobile top bar */}
        <div className="md:hidden">
          <BackBar
            title="What would you like to list?"
            right={
              <Link to="/sell/drafts" aria-label="Selling help" className="grid h-9 w-9 place-items-center rounded-full hover:bg-secondary">
                <HelpCircle className="h-5 w-5" />
              </Link>
            }
          />
        </div>

        {/* Desktop Hero Section */}
        <div className="hidden md:block border-b border-border bg-gradient-to-br from-navy/[0.04] via-background to-amber-500/[0.04]">
          <div className="mx-auto max-w-6xl px-6 py-10">
            <nav className="text-xs text-muted-foreground flex items-center gap-2">
              <Link to="/home" className="hover:text-foreground">Home</Link>
              <span>/</span>
              <span className="text-foreground font-semibold">Publish & Sell</span>
            </nav>
            <div className="mt-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-foreground">
                  Publish on Omeetso Marketplace
                </h1>
                <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground leading-relaxed">
                  Choose a tailored listing method to reach verified nearby buyers, hire local talent, or offer your professional services with 0% middleman fees.
                </p>
              </div>

              {/* Trust Score summary card in Hero */}
              <div className="flex items-center gap-3 rounded-2xl bg-card border border-border/80 p-3.5 shadow-sm shrink-0">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">Your Trust Score</span>
                    <span className={`text-xs font-black ${isEligible ? "text-emerald-600" : "text-amber-600"}`}>
                      {trustScore} / {MIN_SCORE} Pts
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground font-medium">
                    {isEligible ? "✓ Product Selling Unlocked" : "DigiLocker KYC Recommended"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 md:mx-auto md:max-w-6xl space-y-6">
          {/* Trust Score Status Banner if not eligible */}
          {!isEligible ? (
            <div className="rounded-3xl bg-slate-950 text-white p-5 border border-slate-800 shadow-xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <ShieldAlert className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-extrabold text-white">Phone Verification Required to Post Free Listings</h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                        Current: {trustScore} / {MIN_SCORE} Pts
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-2xl">
                      To prevent spam and protect local buyers, please verify your mobile number. Upload your Government ID (Aadhaar / PAN) to earn the <strong className="text-emerald-400">ID-Verified Seller Badge (+35 Pts)</strong>.
                    </p>
                  </div>
                </div>

                <Link
                  to="/verification"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-brand text-xs font-bold text-white shadow-lg shrink-0 hover:opacity-95 transition-all"
                >
                  <span>Verify Phone / Upload ID</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-3.5 sm:p-4 flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 shrink-0" />
                <span>Verified Seller Status Active — Trust Score: {trustScore} / 100 Pts (Listing Unlocked)</span>
              </div>
              <Link to="/verification" className="underline font-black hover:text-emerald-800">View Verification & Score</Link>
            </div>
          )}

          {/* Vertical Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {[
              { id: "all", label: "All Listing Types" },
              { id: "products", label: "📦 Products & Items" },
              { id: "services_jobs", label: "🛠️ Services & Jobs" },
              { id: "business", label: "🏪 Stores & Drafts" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "whitespace-nowrap rounded-full px-4 py-2 text-xs font-black transition-all cursor-pointer",
                  activeTab === tab.id
                    ? "bg-navy text-white shadow-sm"
                    : "bg-card border border-border/80 text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Organized Category Sections */}
          <div className="space-y-8">
            {filteredSections.map((sec) => (
              <div key={sec.category} className="space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 pb-1 border-b border-border/60">
                  <h2 className="text-base sm:text-lg font-black text-foreground">{sec.sectionLabel}</h2>
                  <p className="text-xs text-muted-foreground">{sec.sectionDesc}</p>
                </div>

                {/* 2-column structured grid per section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sec.items.map((item) => {
                    const Icon = item.icon;
                    const isCardDisabled = item.requiresEligibility && !isEligible;

                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          if (isCardDisabled) {
                            setTrustModal(true);
                          } else {
                            nav({ to: item.to as any });
                          }
                        }}
                        className={cn(
                          "group relative flex flex-col justify-between rounded-[28px] border border-border/80 bg-card p-5 sm:p-6 transition-all duration-200 cursor-pointer shadow-xs hover:border-primary/50 hover:shadow-xl hover:-translate-y-1 active:scale-[0.99]",
                          isCardDisabled && "opacity-85 border-dashed"
                        )}
                      >
                        <div>
                          {/* Top row: Icon + Title + Badge */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3.5 min-w-0">
                              <div className={cn("grid h-13 w-13 shrink-0 place-items-center rounded-2xl transition-transform group-hover:scale-105", item.iconBg)}>
                                <Icon className="h-6 w-6 stroke-[2.2]" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="text-base sm:text-lg font-black text-foreground group-hover:text-primary transition-colors">
                                    {item.title}
                                  </h3>
                                  <span className={cn("rounded-full border px-2.5 py-0.5 text-[10px] font-black", item.badgeColor)}>
                                    {item.badge}
                                  </span>
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                                  {item.subtitle}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Benefits Bullet List */}
                          <div className="mt-4 pt-3 border-t border-border/50">
                            <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-semibold text-foreground/80">
                              {item.benefits.map((b, idx) => (
                                <li key={idx} className="flex items-center gap-1.5 truncate">
                                  <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 font-bold" />
                                  <span className="truncate">{b}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* CTA Footer */}
                        <div className="mt-5 pt-3 border-t border-border/40 flex items-center justify-between">
                          <span className="text-xs font-black text-primary group-hover:translate-x-1 transition-transform flex items-center gap-1">
                            <span>
                              {isCardDisabled
                                ? `Unlock via DigiLocker (${trustScore} Pts)`
                                : `Get Started with ${item.title}`}
                            </span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </span>

                          <div className="grid h-8 w-8 place-items-center rounded-full bg-secondary group-hover:bg-primary group-hover:text-white transition-colors">
                            <ChevronRight className="h-4 w-4" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <BottomNav />

        {/* ── TRUST SCORE MODAL ── */}
        {trustModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm" role="dialog" aria-modal="true">
            <div className="relative w-full max-w-md rounded-3xl bg-card p-6 shadow-2xl border border-border text-center space-y-4">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-amber-500/15 text-amber-500 ring-1 ring-amber-500/30">
                <ShieldAlert className="h-8 w-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-foreground">
                  Verification Required to Sell Products
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed px-2">
                  Your current Trust Score is <strong className="text-foreground">{trustScore} Pts</strong>. A minimum score of <strong className="text-emerald-600">750 Pts</strong> is mandatory to list physical products on Omeetso. Services and Jobs are exempt.
                </p>
              </div>

              {/* Requirement Checklist */}
              <div className="p-4 rounded-2xl bg-secondary/70 border border-border text-left text-xs space-y-2">
                <div className="font-bold text-foreground mb-1">Seller Verification Checklist (100 Pts):</div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>📱 Mobile OTP Verification (Required to list):</span>
                  <span className={verifs.mobile.status === "verified" ? "font-bold text-emerald-600" : "text-amber-600 font-bold"}>
                    {verifs.mobile.status === "verified" ? "+35 Pts ✓" : "+35 Pts (Pending)"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>🪪 Govt ID KYC (Aadhaar / PAN / DL):</span>
                  <span className={verifs.identity.status === "verified" ? "font-bold text-emerald-600" : "text-indigo-600 font-bold"}>
                    {verifs.identity.status === "verified" ? "+35 Pts ✓" : "+35 Pts (Recommended)"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>📍 Address / Location Proof:</span>
                  <span className={verifs.address?.status === "verified" ? "font-bold text-emerald-600" : "text-muted-foreground"}>
                    {verifs.address?.status === "verified" ? "+15 Pts ✓" : "+15 Pts"}
                  </span>
                </div>
              </div>

              <div className="grid gap-2.5 pt-2">
                <Link
                  to="/verification"
                  className="flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-indigo-brand text-sm font-bold text-white shadow-lg hover:opacity-95"
                >
                  <span>Verify Mobile & Upload KYC Document</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <button
                  type="button"
                  onClick={() => setTrustModal(false)}
                  className="h-11 w-full rounded-2xl border border-border bg-card text-xs font-bold text-muted-foreground hover:bg-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MobileFrame>
  );
}
