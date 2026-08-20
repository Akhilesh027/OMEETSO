import { useState } from "react";
import { BottomSheet } from "@/components/omeetso/BottomSheet";
import { counterOffer, type Offer } from "@/lib/chat";
import { AlertCircle, HandCoins } from "lucide-react";
import { toast } from "sonner";

const inr = (n: number) => "₹" + n.toLocaleString("en-IN");

export function CounterOfferSheet({
  open, onClose, offer, by,
}: {
  open: boolean; onClose: () => void; offer: Offer; by: "buyer" | "seller";
}) {
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const send = () => {
    setErr(null);
    const n = Number(amount);
    if (!n || n <= 0) return setErr("Enter an amount greater than zero.");
    if (n === offer.amount) return setErr("Counter must differ from the previous offer.");
    if (n > offer.listedPrice * 1.5) return setErr("Counter looks unrealistic.");
    counterOffer(offer.id, n, message.trim() || undefined, by);
    toast.success("Counteroffer sent");
    setAmount(""); setMessage("");
    onClose();
  };

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Send Counteroffer"
      footer={
        <button
          onClick={send}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-sm font-bold text-primary-foreground"
        >
          <HandCoins className="h-4 w-4" /> Send Counteroffer
        </button>
      }
    >
      <div className="rounded-2xl bg-secondary/60 p-3 text-xs">
        <p>Listed price · <span className="font-semibold">{inr(offer.listedPrice)}</span></p>
        <p>Previous offer · <span className="font-semibold">{inr(offer.amount)}</span></p>
      </div>
      <label className="mt-4 block text-xs font-semibold">Counter amount (₹)</label>
      <input
        inputMode="numeric"
        value={amount}
        onChange={(e) => { setAmount(e.target.value.replace(/\D/g, "")); setErr(null); }}
        placeholder="Enter amount"
        className="mt-1 w-full rounded-2xl border border-border bg-card px-3 py-3 text-base font-bold outline-none focus:border-primary"
      />
      {err && <p className="mt-2 flex items-center gap-1 text-xs text-destructive"><AlertCircle className="h-3.5 w-3.5" /> {err}</p>}
      <label className="mt-4 block text-xs font-semibold">Message (optional)</label>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value.slice(0, 200))}
        rows={3}
        placeholder="Explain your counter"
        className="mt-1 w-full resize-none rounded-2xl border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
      />
    </BottomSheet>
  );
}
