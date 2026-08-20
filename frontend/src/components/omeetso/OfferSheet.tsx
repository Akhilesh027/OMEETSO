import { useState } from "react";
import { BottomSheet } from "./BottomSheet";
import { formatINR, type Product } from "@/lib/mock";
import { addOffer, hasActiveOffer } from "@/lib/saved";
import { AlertCircle, CheckCircle2, HandCoins } from "lucide-react";

export function OfferSheet({
  open, onClose, product,
}: { open: boolean; onClose: () => void; product: Product }) {
  const [amount, setAmount] = useState<string>("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const suggested = [
    Math.round(product.price * 0.9),
    Math.round(product.price * 0.94),
    Math.round(product.price * 0.96),
  ];

  const submit = () => {
    const n = Number(amount);
    setError(null); setWarning(null);
    if (!n || n <= 0) return setError("Offer must be above zero.");
    if (n > product.price * 1.2) return setError("Offer looks unrealistic. Please review.");
    if (hasActiveOffer(product.id)) return setError("You already have an active offer on this product.");
    if (n < product.price * 0.6) setWarning("Very low offer — the seller may decline.");
    addOffer({ productId: product.id, amount: n, message: message.trim() || undefined, time: Date.now() });
    setDone(true);
    setTimeout(() => { setDone(false); onClose(); setAmount(""); setMessage(""); }, 1300);
  };

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Make an Offer"
      footer={
        <button
          onClick={submit}
          disabled={done}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-sm font-bold text-primary-foreground disabled:opacity-70"
        >
          {done ? (<><CheckCircle2 className="h-4 w-4" /> Offer sent successfully</>) : (<><HandCoins className="h-4 w-4" /> Send Offer</>)}
        </button>
      }
    >
      <div className="flex items-center gap-3 rounded-2xl bg-secondary/60 p-3">
        <img src={product.image} alt="" className="h-14 w-14 rounded-xl object-cover" />
        <div className="min-w-0 flex-1">
          <p className="line-clamp-1 text-sm font-semibold">{product.title}</p>
          <p className="text-xs text-muted-foreground">Listed at {formatINR(product.price)}</p>
        </div>
      </div>
      <label className="mt-4 block text-xs font-semibold">Your offer (₹)</label>
      <input
        inputMode="numeric"
        value={amount}
        onChange={(e) => { setAmount(e.target.value.replace(/\D/g, "")); setError(null); setWarning(null); }}
        placeholder="Enter amount"
        className="mt-1 w-full rounded-2xl border border-border bg-card px-3 py-3 text-base font-bold outline-none focus:border-primary"
      />
      <div className="mt-2 flex flex-wrap gap-2">
        {suggested.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setAmount(String(v))}
            className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-secondary"
          >
            {formatINR(v)}
          </button>
        ))}
      </div>
      {error && (
        <p className="mt-2 flex items-center gap-1 text-xs font-medium text-destructive">
          <AlertCircle className="h-3.5 w-3.5" /> {error}
        </p>
      )}
      {warning && !error && (
        <p className="mt-2 flex items-center gap-1 text-xs font-medium text-orange-brand">
          <AlertCircle className="h-3.5 w-3.5" /> {warning}
        </p>
      )}
      <label className="mt-4 block text-xs font-semibold">Message (optional)</label>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value.slice(0, 200))}
        placeholder="Add a note for the seller"
        rows={3}
        className="mt-1 w-full resize-none rounded-2xl border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
      />
    </BottomSheet>
  );
}
