import { useState } from "react";
import { BottomSheet } from "@/components/omeetso/BottomSheet";
import { formatINR, type Product } from "@/lib/mock";
import { canMakeOffer, suggestedOffers } from "@/lib/chat";
import { createOfferApi, startConversationApi } from "@/api/chat.api";
import { useChatContext } from "@/contexts/ChatProvider";
import { AlertCircle, CheckCircle2, HandCoins, ShieldAlert, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

export function MakeOfferSheet({
  open, onClose, product, threadId,
}: {
  open: boolean;
  onClose: () => void;
  product: Product;
  threadId?: string;
}) {
  const nav = useNavigate();
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [confirmLow, setConfirmLow] = useState(false);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const { loadMessages } = useChatContext();
  const suggestions = suggestedOffers(product.price);

  const send = async () => {
    setError(null); setWarning(null);
    const guard = canMakeOffer(product);
    if (!guard.ok) return setError(guard.reason ?? "Cannot make offer right now.");
    const n = Number(amount);
    if (!n || n <= 0) return setError("Enter an offer greater than zero.");
    if (n > product.price * 1.5) return setError("Offer looks unrealistic. Please review.");
    if (n < product.price * 0.5 && !confirmLow) {
      setWarning("This offer is much lower than the listed price. The seller may be less likely to respond.");
      setConfirmLow(true);
      return;
    }

    setSending(true);
    try {
      let convId = threadId;
      if (!convId) {
        const startRes = await startConversationApi("LISTING", product.id);
        if (startRes.success && startRes.data?.id) {
          convId = startRes.data.id;
        } else {
          setSending(false);
          return setError(startRes.error?.message || "Could not start chat conversation.");
        }
      }

      const res = await createOfferApi(convId!, n * 100, message.trim() || undefined);
      setSending(false);

      if (res.success) {
        setDone(true);
        loadMessages(convId!);
        toast.success("Offer sent successfully", { description: "The seller can accept, reject or counter." });
        setTimeout(() => {
          setDone(false); setAmount(""); setMessage(""); setConfirmLow(false);
          onClose();
          nav({ to: "/chat/$id", params: { id: convId! } });
        }, 800);
      } else {
        setError(res.data?.message || "Failed to submit offer.");
      }
    } catch {
      setSending(false);
      setError("Network error. Please try again.");
    }
  };

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Make an Offer"
      footer={
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="hidden md:inline-flex h-12 px-5 items-center justify-center rounded-2xl border border-border bg-card text-xs font-bold hover:bg-secondary transition-all"
          >
            Cancel
          </button>
          <button
            onClick={send}
            disabled={sending || done}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-indigo-brand hover:opacity-95 text-sm font-extrabold text-white shadow-md disabled:opacity-70 transition-all"
          >
            {done ? (
              <><CheckCircle2 className="h-4 w-4 text-emerald-300" /> Offer Sent!</>
            ) : (
              <><HandCoins className="h-4 w-4" /> {confirmLow ? "Send Low Offer Anyway" : sending ? "Sending Offer..." : "Send Offer to Seller"}</>
            )}
          </button>
        </div>
      }
    >
      <div className="space-y-4 font-sans pt-1">
        {/* Product card summary */}
        {(() => {
          const fallbackImg = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400";
          const imgSrc = product?.image || (product as any)?.coverUrl || (Array.isArray(product?.images) && product.images[0]) || fallbackImg;
          return (
            <div className="flex items-center gap-3.5 rounded-2xl border border-border bg-card p-3.5 shadow-sm">
              <img
                src={imgSrc}
                alt={product?.title || "Product"}
                onError={(e) => { (e.target as HTMLImageElement).src = fallbackImg; }}
                className="h-16 w-16 rounded-xl object-cover border border-border shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-extrabold text-foreground leading-snug">{product?.title}</p>
                <div className="mt-1 flex items-center gap-2 text-xs">
                  <span className="font-extrabold text-indigo-brand">Listed at {formatINR(product?.price || 0)}</span>
                  {product?.negotiable && (
                    <span className="rounded-md bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                      Negotiable
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Offer Input Field & Discount Savings Pills */}
        <div>
          <label className="block text-xs font-extrabold text-foreground mb-1">Your Offer Amount (₹)</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-primary text-lg">₹</span>
            <input
              inputMode="numeric"
              value={amount}
              onChange={(e) => { setAmount(e.target.value.replace(/\D/g, "")); setError(null); setWarning(null); setConfirmLow(false); }}
              placeholder="Enter your offer amount"
              aria-label="Offer amount in rupees"
              className="w-full h-13 rounded-2xl border border-border bg-background pl-8 pr-4 text-lg font-black tracking-tight outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Savings Calculation Pill */}
          {(() => {
            const num = Number(amount);
            if (num > 0 && num < product.price) {
              const diff = product.price - num;
              const pct = Math.round((diff / product.price) * 100);
              return (
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-extrabold text-emerald-600">
                  <Sparkles className="h-3.5 w-3.5" /> You save {formatINR(diff)} ({pct}% off listed price)
                </div>
              );
            }
            return null;
          })()}

          {/* Quick percentage discount preset chips */}
          <div className="mt-3 space-y-1">
            <p className="text-[11px] font-bold text-muted-foreground">Quick Discount Presets</p>
            <div className="flex flex-wrap gap-2">
              {[0.95, 0.9, 0.85, 0.8].map((factor) => {
                const calculated = Math.round(product.price * factor);
                const pct = Math.round((1 - factor) * 100);
                const active = Number(amount) === calculated;
                return (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => { setAmount(String(calculated)); setError(null); setWarning(null); setConfirmLow(false); }}
                    className={`rounded-xl border px-3 py-1.5 text-xs font-black transition-all ${
                      active
                        ? "border-primary bg-primary text-white shadow-sm"
                        : "border-border/80 bg-card text-foreground hover:bg-surface-2"
                    }`}
                  >
                    {formatINR(calculated)} <span className={active ? "text-amber-300" : "text-primary"}>({pct}% off)</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Error / Warning states */}
        {error && (
          <div className="flex items-center gap-2 rounded-2xl bg-rose-50 border border-rose-200 p-3 text-xs font-bold text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {warning && !error && (
          <div className="flex items-start gap-2 rounded-2xl bg-amber-50 border border-amber-200 p-3 text-xs font-bold text-amber-800">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <div>
              <p>{warning}</p>
              <p className="mt-0.5 text-[11px] font-semibold text-amber-700">Tap "Send Low Offer Anyway" to proceed.</p>
            </div>
          </div>
        )}

        {/* Note for Seller */}
        <div>
          <label className="block text-xs font-extrabold text-foreground mb-1">Message for Seller (optional)</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, 200))}
            placeholder="Add a note for the seller (e.g. Can pick up today at Madhapur)"
            rows={3}
            aria-label="Optional message for the seller"
            className="w-full resize-none rounded-2xl border border-border bg-background p-3 text-xs font-semibold outline-none focus:border-indigo-brand focus:ring-2 focus:ring-indigo-brand/20 transition-all"
          />
        </div>

        <div className="rounded-2xl bg-secondary/50 border border-border p-3 text-[11px] font-medium text-muted-foreground flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-indigo-brand shrink-0" />
          <span>Offers expire automatically after 48 hours. Omeetso never holds or transfers money directly.</span>
        </div>
      </div>
    </BottomSheet>
  );
}
