import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback, useMemo } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import { getMyWalletApi } from "@/api/adCampaigns.api";
import { ArrowDownLeft, ArrowUpRight, Search, Receipt, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatINR, formatDate } from "@/lib/revenue";

export const Route = createFileRoute("/transactions/wallet")({
  head: () => ({ meta: [{ title: "Wallet transactions — Omeetso" }] }),
  component: Txns,
});

const FILTERS = [
  { id: "all", label: "All" },
  { id: "credit", label: "Credits (+)" },
  { id: "debit", label: "Debits (-)" },
];

export default function Txns() {
  const [q, setQ] = useState("");
  const [f, setF] = useState("all");
  const [txns, setTxns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    const res = await getMyWalletApi();
    setLoading(false);
    if (res.success && res.data?.transactions) {
      setTxns(res.data.transactions);
    }
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const visible = useMemo(() => {
    return txns.filter((t) => {
      if (f === "credit" && t.type !== "credit") return false;
      if (f === "debit" && t.type !== "debit") return false;
      if (q && !t.description.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [txns, f, q]);

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-16 font-sans">
        <BackBar title="Wallet Transactions" />
        <div className="px-4">
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2 shadow-sm">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search wallet transactions..."
              className="w-full bg-transparent text-xs outline-none text-foreground font-sans"
            />
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {FILTERS.map((x) => (
              <button
                key={x.id}
                onClick={() => setF(x.id)}
                aria-pressed={f === x.id}
                className={cn(
                  "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-bold transition-colors",
                  f === x.id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground"
                )}
              >
                {x.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 space-y-2 px-4">
          {loading ? (
            <div className="p-8 text-center text-xs text-muted-foreground flex justify-center items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" /> Loading transaction ledger...
            </div>
          ) : visible.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-xs text-muted-foreground space-y-2">
              <Receipt className="mx-auto h-8 w-8 text-muted-foreground/40" />
              <p className="font-bold text-foreground">No transactions found</p>
              <p>Wallet transactions will appear here after boost activations or recharges.</p>
            </div>
          ) : (
            visible.map((t) => {
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
      </div>
    </MobileFrame>
  );
}
