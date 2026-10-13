import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import { getMySafetyReportsApi, type SafetyReportItem } from "@/api/safety.api";
import { listSafetyReports, type SafetyReport } from "@/lib/account";
import {
  AlertTriangle,
  ShoppingCart,
  PackageCheck,
  Store,
  CreditCard,
  ShieldAlert,
  MapPin,
  Flag,
  Phone,
  ChevronRight,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Shield,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/safety/")({
  head: () => ({
    meta: [
      { title: "Safety Centre & Incident Reports — Omeetso" },
      { name: "description", content: "Buy safely, sell safely, avoid fraud, and track reported suspicious activity on Omeetso." },
    ]
  }),
  component: SafetyHome,
});

const TOPICS = [
  { id: "buying", label: "Buying safely", subtitle: "Inspect in person & avoid prepayments", icon: ShoppingCart },
  { id: "selling", label: "Selling safely", subtitle: "Confirm funds in bank before handover", icon: PackageCheck },
  { id: "store", label: "Store safety", subtitle: "Verify seller badge & business address", icon: Store },
  { id: "payment", label: "Payment safety", subtitle: "Never scan QR codes to receive money", icon: CreditCard },
  { id: "fraud", label: "Fraud prevention", subtitle: "Identify phishing, fake receipts & bots", icon: ShieldAlert },
  { id: "meeting", label: "Safe meeting places", subtitle: "Meet in daytime, public & crowded spots", icon: MapPin },
];

function getStatusBadge(status?: string) {
  const s = (status || "open").toLowerCase();
  if (s === "resolved") {
    return {
      label: "Resolved",
      badgeClass: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
      icon: CheckCircle2
    };
  }
  if (s === "investigating" || s === "in_review") {
    return {
      label: "Investigating",
      badgeClass: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30",
      icon: Clock
    };
  }
  if (s === "dismissed") {
    return {
      label: "Closed",
      badgeClass: "bg-slate-500/15 text-slate-700 dark:text-slate-400 border-slate-500/30",
      icon: CheckCircle2
    };
  }
  return {
    label: "Under Review",
    badgeClass: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
    icon: AlertCircle
  };
}

function SafetyHome() {
  const [reports, setReports] = useState<any[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);

  const fetchReports = useCallback(async () => {
    setLoadingReports(true);
    let serverList: SafetyReportItem[] = [];
    try {
      const res = await getMySafetyReportsApi();
      if (res.success && Array.isArray(res.data)) {
        serverList = res.data;
      }
    } catch {
      // offline fallback
    }

    // Local account reports fallback & merge
    const local = listSafetyReports();
    const map = new Map<string, any>();

    // Put server reports first
    serverList.forEach((r) => map.set(r.id, r));

    // Merge local reports if not already in server
    local.forEach((l) => {
      if (!map.has(l.id)) {
        map.set(l.id, {
          id: l.id,
          category: l.category,
          description: l.description,
          status: l.status === "submitted" ? "OPEN" : l.status === "in_review" ? "INVESTIGATING" : "RESOLVED",
          priority: "medium",
          relatedUser: l.relatedUser,
          relatedListing: l.relatedListing,
          createdAt: new Date(l.createdAt).toISOString()
        });
      }
    });

    const combined = Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    setReports(combined);
    setLoadingReports(false);
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-24 font-sans">
        <BackBar title="Safety Centre" />

        <div className="px-4 pt-2 space-y-4">
          {/* Important Safety Banner */}
          <div className="rounded-3xl gradient-brand p-5 text-white shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center gap-2 text-amber-300">
              <AlertTriangle className="h-4 w-4" />
              <p className="text-[11px] font-black uppercase tracking-wider">Golden Safety Rule</p>
            </div>
            <p className="mt-1.5 text-base font-black tracking-tight leading-snug">
              Omeetso will never ask for your OTP, UPI PIN, or bank passwords.
            </p>
            <p className="mt-1 text-xs text-white/80 leading-relaxed">
              Always inspect items in person before transferring money. If someone asks you to scan a QR code to "receive money", it is a scam.
            </p>
          </div>

          {/* High-Impact Report Suspicious Activity CTA Button */}
          <Link
            to="/safety/report"
            className="group relative flex items-center justify-between rounded-3xl bg-gradient-to-r from-rose-600 via-rose-500 to-red-600 p-4 text-white shadow-lg shadow-rose-500/25 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md shadow-inner">
                <Flag className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-black tracking-tight">Report Suspicious Activity</p>
                  <span className="rounded-full bg-white/25 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider">
                    24/7 Action
                  </span>
                </div>
                <p className="text-xs text-white/85 font-medium mt-0.5">
                  Report scams, fake listings, harassment, or fraudulent accounts
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-white/80 group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Section: Your Safety & Incident Reports */}
          <div className="rounded-3xl border border-border/80 bg-card p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ShieldCheck className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-xs font-black text-foreground">Your Reported Incidents</h3>
                  <p className="text-[10px] text-muted-foreground font-medium">Real-time status of safety investigations</p>
                </div>
              </div>

              <button
                type="button"
                onClick={fetchReports}
                title="Refresh incident reports"
                className="flex items-center gap-1 rounded-xl bg-secondary/80 hover:bg-secondary px-2.5 py-1 text-[11px] font-bold text-muted-foreground hover:text-foreground transition active:scale-95"
              >
                <RefreshCw className={cn("h-3 w-3", loadingReports && "animate-spin text-primary")} />
                <span>Refresh</span>
              </button>
            </div>

            {loadingReports ? (
              <div className="p-6 text-center text-xs text-muted-foreground space-y-2">
                <RefreshCw className="mx-auto h-5 w-5 animate-spin text-primary" />
                <p>Loading incident reports...</p>
              </div>
            ) : reports.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground space-y-2.5 rounded-2xl bg-secondary/30 border border-dashed border-border/70">
                <Shield className="mx-auto h-8 w-8 text-muted-foreground/40" />
                <div>
                  <p className="font-bold text-foreground">No Incidents Reported</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    You haven't submitted any suspicious activity reports yet.
                  </p>
                </div>
                <Link
                  to="/safety/report"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-bold text-primary-foreground shadow-2xs hover:bg-primary/90 transition active:scale-95"
                >
                  <Flag className="h-3.5 w-3.5" />
                  <span>Report an Incident</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {reports.map((r) => {
                  const badge = getStatusBadge(r.status);
                  const Icon = badge.icon;
                  const dateStr = new Date(r.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                  });

                  return (
                    <div
                      key={r.id}
                      className="rounded-2xl border border-border/80 bg-background/80 p-3.5 space-y-2 transition hover:border-primary/40 hover:shadow-2xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-mono text-[11px] font-bold text-primary shrink-0">
                            #{r.id.slice(-8).toUpperCase()}
                          </span>
                          <span className="truncate text-xs font-extrabold text-foreground capitalize">
                            {(r.category || "General").replace(/_/g, " ")}
                          </span>
                        </div>

                        <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-black shrink-0", badge.badgeClass)}>
                          <Icon className="h-2.5 w-2.5" />
                          <span>{badge.label}</span>
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {r.description}
                      </p>

                      <div className="flex items-center justify-between pt-1 text-[10px] font-semibold text-muted-foreground border-t border-border/50">
                        <span>Submitted on {dateStr}</span>
                        {r.relatedListing || r.relatedUser ? (
                          <span className="truncate max-w-[150px] font-bold text-primary">
                            Target: {r.relatedListing || r.relatedUser}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/75">Investigated by Trust & Safety</span>
                        )}
                      </div>

                      {r.resolutionNotes && (
                        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-2 text-[11px] text-emerald-800 dark:text-emerald-300">
                          <strong>Resolution:</strong> {r.resolutionNotes}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Safety Guidelines Topics Grid */}
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground px-1">
              Safety Guides & Best Practices
            </h3>
            
            <div className="grid grid-cols-2 gap-2.5">
              {TOPICS.map((t) => (
                <Link
                  key={t.id}
                  to="/safety/$topic"
                  params={{ topic: t.id }}
                  className="group flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-3.5 shadow-xs transition-all hover:border-primary/40 hover:shadow-md active:scale-[0.98]"
                >
                  <div>
                    <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shadow-2xs">
                      <t.icon className="h-5 w-5" />
                    </div>
                    <p className="mt-2.5 text-xs font-black text-foreground group-hover:text-primary transition-colors">
                      {t.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2 leading-snug">
                      {t.subtitle}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center gap-1 text-[10px] font-extrabold text-primary group-hover:translate-x-0.5 transition-transform">
                    <span>Read guide</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Emergency Contact Assistance Card */}
          <div className="rounded-3xl border border-rose-500/20 bg-rose-500/5 p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-1.5 font-black text-rose-600 dark:text-rose-400">
                <Phone className="h-4 w-4" /> Emergency Police & Helpline
              </p>
              <a
                href="tel:112"
                className="rounded-full bg-rose-600 text-white text-[11px] font-black px-3 py-1 shadow-xs hover:bg-rose-700 transition active:scale-95"
              >
                Dial 112
              </a>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              If you are in immediate physical danger or have suffered financial cyber fraud, please call the National Cyber Crime Helpline at <strong>1930</strong> or local emergency services at <strong>112</strong>.
            </p>
          </div>
        </div>
      </div>
    </MobileFrame>
  );
}
export default SafetyHome;
