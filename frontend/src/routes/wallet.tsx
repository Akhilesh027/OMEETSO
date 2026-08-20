import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import { WalletBalanceCard, SectionTitle } from "@/components/omeetso/revenue";
import { getMyWalletApi } from "@/api/adCampaigns.api";
import {
  Plus, Receipt, Gift, FileText,
  ArrowDownLeft, ArrowUpRight, Loader2
} from "lucide-react";
import { formatINR, formatDate } from "@/lib/revenue";

export const Route = createFileRoute("/wallet")({
  head: () => ({
    meta: [
      { title: "Omeetso Wallet — Boosts, credits and invoices" },
      { name: "description", content: "Manage your Omeetso Wallet balance, promotional credits and platform-service invoices." },
    ],
  }),
  component: WalletPage,
});

function WalletPage() {
  const [walletData, setWalletData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const loadWallet = useCallback(async () => {
    setLoading(true);
    const res = await getMyWalletApi();
    setLoading(false);
    if (res.success && res.data) {
      setWalletData(res.data);
    }
  }, []);

  useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  const balance = walletData ? walletData.balanceInPaise / 100 : 0;
  const availableBalance = walletData ? walletData.availableBalanceInPaise / 100 : 0;
  const heldBalance = walletData ? walletData.heldBalanceInPaise / 100 : 0;
  const refunds = walletData ? walletData.refundBalanceInPaise / 100 : 0;
  const txns = walletData?.transactions || [];

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-28 md:mx-auto md:max-w-[960px] md:px-6 md:pb-12">
        <BackBar title="Wallet" />

        <div className="px-4">
          <Link to="/add/wallet">
            <WalletBalanceCard balance={balance} credits={0} refunds={refunds} />
          </Link>
        </div>

        {heldBalance > 0 && (
          <div className="mx-4 mt-3 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium">
            🔒 <span className="font-bold">Reserved Wallet Hold:</span> ₹{heldBalance.toLocaleString("en-IN")} held for pending ad moderation. Available balance: ₹{availableBalance.toLocaleString("en-IN")}.
          </div>
        )}

        <div className="mx-4 mt-4 grid grid-cols-4 gap-2 text-center">
          <QuickAction to="/add/wallet" icon={Plus} label="Add Money" />
          <QuickAction to="/transactions/wallet" icon={Receipt} label="Transactions" />
          <QuickAction to="/credits/wallet" icon={Gift} label="Credits" />
          <QuickAction to="/invoices/wallet" icon={FileText} label="Invoices" />
        </div>

        <div className="mx-4 mt-5 space-y-2">
          <div className="flex items-center justify-between">
            <SectionTitle>Recent transactions</SectionTitle>
            <Link to="/transactions/wallet" className="text-[11px] font-bold text-primary">View all</Link>
          </div>
          {loading ? (
            <div className="p-8 text-center text-xs text-muted-foreground flex justify-center items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" /> Loading wallet history...
            </div>
          ) : txns.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border bg-card p-4 text-center text-xs text-muted-foreground">
              No wallet transactions yet.
            </p>
          ) : (
            txns.map((t: any) => {
              const isCredit = t.type === "credit";
              return (
                <div key={t.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm">
                  <div className={`grid h-9 w-9 place-items-center rounded-xl ${isCredit ? "bg-emerald-100 text-emerald-700" : "bg-primary/10 text-primary"}`}>
                    {isCredit ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-semibold text-foreground">{t.description}</p>
                    <p className="text-[11px] text-muted-foreground font-mono">{formatDate(t.createdAt)} • {t.status}</p>
                  </div>
                  <p className={`text-sm font-bold ${isCredit ? "text-emerald-700" : "text-foreground"}`}>
                    {isCredit ? "+" : "−"} {formatINR(t.amountInPaise / 100)}
                  </p>
                </div>
              );
            })
          )}
        </div>

        <div className="mx-4 mt-6 rounded-2xl border border-border bg-card p-4 text-xs text-muted-foreground leading-relaxed">
          <p className="font-bold text-foreground mb-1">About Omeetso Wallet:</p>
          Wallet funds are used to pay for listing boosts, custom banner ad campaigns, and store subscriptions. When you submit a campaign, funds are reserved until approved by admin.
        </div>
      </div>
    </MobileFrame>
  );
}

function QuickAction({ to, icon: Icon, label }: { to: string; icon: any; label: string }) {
  return (
    <Link to={to} className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-card p-3 shadow-sm transition-colors hover:bg-secondary/40">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <span className="text-[11px] font-bold text-foreground">{label}</span>
    </Link>
  );
}
