import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import { getMyWalletApi } from "@/api/adCampaigns.api";
import { listCredits, totalCredits, subscribe, formatINR, formatDate, PromoCredit } from "@/lib/revenue";
import {
  Gift, Sparkles, ShieldCheck, ArrowRight, Wallet,
  HelpCircle, CheckCircle2, Zap, Loader2, Tag
} from "lucide-react";

export const Route = createFileRoute("/credits/wallet")({
  head: () => ({
    meta: [
      { title: "Promotional Credits & Disounts — Omeetso Wallet" },
      { name: "description", content: "View your promotional credits and discounts applicable towards listing boosts and ad campaigns." }
    ]
  }),
  component: Credits,
});

export default function Credits() {
  const [, setTick] = useState(0);
  const [walletLoading, setWalletLoading] = useState(true);
  const [backendCredits, setBackendCredits] = useState<number>(0);

  const loadBackendData = useCallback(async () => {
    setWalletLoading(true);
    const res = await getMyWalletApi();
    setWalletLoading(false);
    if (res.success && res.data) {
      if (res.data.promoCreditsInPaise !== undefined) {
        setBackendCredits(res.data.promoCreditsInPaise / 100);
      }
    }
  }, []);

  useEffect(() => {
    // Clear legacy mock welcome credits if user only has seeded mock credit
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("omeetso_promotional_credits");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length === 1 && parsed[0]?.id === "CR_WELCOME") {
            localStorage.setItem("omeetso_promotional_credits", "[]");
          }
        }
      } catch {}
    }

    loadBackendData();
    const u = subscribe(() => setTick((n) => n + 1));
    return () => { u(); };
  }, [loadBackendData]);

  const rawList = listCredits();
  // Filter out expired credits
  const now = Date.now();
  const activeCredits = rawList.filter((c) => c.expiresAt > now);
  const localCreditTotal = totalCredits();
  const displayTotal = Math.max(backendCredits, localCreditTotal);

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-20 font-sans md:mx-auto md:max-w-[960px] md:px-6 md:pb-12">
        <BackBar title="Promotional Credits" />

        <div className="px-4 space-y-4">
          {/* Main Credits Hero Card */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-700 to-indigo-900 p-5 text-white shadow-xl shadow-emerald-900/10">
            <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/10 blur-xl pointer-events-none" />
            <div className="absolute right-4 bottom-4 opacity-15 pointer-events-none">
              <Gift className="h-28 w-28" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-[11px] font-extrabold tracking-wide uppercase">
                  <Sparkles className="h-3 w-3 text-amber-300" />
                  <span>Promo Balance</span>
                </div>
                <span className="text-[11px] font-semibold text-white/80">
                  {activeCredits.length} Active {activeCredits.length === 1 ? "Voucher" : "Vouchers"}
                </span>
              </div>

              <div className="mt-3">
                <p className="text-3xl font-black tracking-tight">{formatINR(displayTotal)}</p>
                <p className="text-xs text-white/80 mt-0.5 font-medium">
                  Applicable on Listing Boosts & Ads
                </p>
              </div>

              <div className="mt-5 flex items-center gap-2 pt-3 border-t border-white/15">
                <Link
                  to="/promotions"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-white text-emerald-900 font-bold text-xs py-2.5 shadow-md hover:bg-white/95 transition-all"
                >
                  <Zap className="h-3.5 w-3.5 fill-emerald-800 text-emerald-800" />
                  <span>Use on Boosts</span>
                </Link>
                <Link
                  to="/wallet"
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white/15 backdrop-blur-md text-white font-bold text-xs px-3.5 py-2.5 hover:bg-white/20 transition-all border border-white/20"
                >
                  <Wallet className="h-3.5 w-3.5" />
                  <span>Wallet</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Credits List Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between pt-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-primary" /> Active Credit Vouchers
              </h2>
              {walletLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
            </div>

            {activeCredits.length === 0 && displayTotal === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card p-7 text-center space-y-2.5">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30">
                  <Gift className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">No active promotional credits</p>
                  <p className="text-xs text-muted-foreground mt-0.5 max-w-xs mx-auto">
                    Promotional credits and cashback vouchers rewarded by Omeetso will appear here.
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    to="/promotions"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                  >
                    <span>Explore available boost plans</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              activeCredits.map((c: PromoCredit) => (
                <div
                  key={c.id}
                  className="relative overflow-hidden rounded-2xl border border-emerald-200/80 bg-card p-4 shadow-sm dark:border-emerald-900/40"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-black text-emerald-700 dark:text-emerald-400">
                          {formatINR(c.amount)}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                          Active
                        </span>
                      </div>
                      <p className="text-xs font-bold text-foreground mt-1">{c.source}</p>
                    </div>
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30">
                      <Gift className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-border/60 text-[11px] space-y-1 text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span>Valid for:</span>
                      <span className="font-semibold text-foreground capitalize">
                        {c.eligibleFor.join(", ").replaceAll("_", " ")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Expires on:</span>
                      <span className="font-semibold text-foreground">{formatDate(c.expiresAt)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Promotional Credits Information / Guide */}
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
              <HelpCircle className="h-4 w-4 text-primary" />
              <span>How Promotional Credits Work</span>
            </div>

            <div className="space-y-2 text-[11px] text-muted-foreground leading-relaxed">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-foreground">100% Usable on Checkout:</strong> Automatically deducted when activating Listing Boosts or Homepage Ads.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-foreground">Automatic Application:</strong> Highest discount is applied first to save your regular wallet cash.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-foreground">Platform Only:</strong> Credits are non-refundable and cannot be withdrawn to external bank accounts.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MobileFrame>
  );
}
