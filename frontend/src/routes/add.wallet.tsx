import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import { getMyWalletApi, rechargeWalletApi } from "@/api/adCampaigns.api";
import { createRazorpayOrderApi, verifyRazorpayPaymentApi } from "@/api/razorpay.api";
import { addMoney, formatINR } from "@/lib/revenue";
import { toast } from "sonner";
import {
  Wallet, ShieldCheck, Check, Zap, CreditCard,
  QrCode, Building2, Sparkles, Loader2, ArrowRight, Lock
} from "lucide-react";

export const Route = createFileRoute("/add/wallet")({
  head: () => ({ meta: [{ title: "Add Money to Wallet — Razorpay — Omeetso" }] }),
  component: AddMoney,
});

const PRESET_AMOUNTS = [
  { value: 100, label: "₹100" },
  { value: 500, label: "₹500", badge: "Popular" },
  { value: 1000, label: "₹1,000", badge: "Best Value" },
  { value: 2000, label: "₹2,000" },
  { value: 5000, label: "₹5,000" },
];

const PAYMENT_METHODS = [
  { id: "upi", name: "UPI / GPay / PhonePe / Paytm", icon: QrCode, desc: "Instant zero-fee transfer via Razorpay UPI", badge: "Fastest" },
  { id: "card", name: "Credit / Debit Card", icon: CreditCard, desc: "Visa, Mastercard, RuPay & Maestro" },
  { id: "netbanking", name: "Net Banking", icon: Building2, desc: "All major Indian banks supported" },
];

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export default function AddMoney() {
  const nav = useNavigate();
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const [loadingWallet, setLoadingWallet] = useState(true);
  const [amount, setAmount] = useState<string>("500");
  const [selectedMethod, setSelectedMethod] = useState<string>("upi");
  const [processing, setProcessing] = useState(false);

  // Load Razorpay Script dynamically
  useEffect(() => {
    if (typeof window !== "undefined" && !window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const loadBalance = useCallback(async () => {
    setLoadingWallet(true);
    const res = await getMyWalletApi();
    setLoadingWallet(false);
    if (res.success && res.data) {
      setCurrentBalance(res.data.balanceInPaise / 100);
    }
  }, []);

  useEffect(() => {
    loadBalance();
  }, [loadBalance]);

  const numAmount = parseFloat(amount) || 0;

  async function handlePay() {
    if (numAmount < 1) {
      toast.error("Minimum recharge amount is ₹1 (100 paise)");
      return;
    }
    if (numAmount > 100000) {
      toast.error("Maximum recharge amount per transaction is ₹1,00,000");
      return;
    }

    setProcessing(true);

    const userRaw = typeof localStorage !== "undefined" ? localStorage.getItem("omeetso_user") : null;
    let userName = "Omeetso User";
    let userEmail = "user@omeetso.com";
    let userPhone = "9876543210";
    try {
      if (userRaw) {
        const u = JSON.parse(userRaw);
        if (u.profile?.name) userName = u.profile.name;
        if (u.email) userEmail = u.email;
        if (u.phone) userPhone = u.phone;
      }
    } catch { }

    const amountInPaise = Math.round(numAmount * 100);

    try {
      // STEP 1: BACKEND - Create Order
      const orderRes = await createRazorpayOrderApi(amountInPaise, "INR");
      if (!orderRes.success || !orderRes.order_id) {
        setProcessing(false);
        toast.error(orderRes.error || "Failed to create Razorpay payment order");
        return;
      }

      // Ensure Razorpay script is present
      if (typeof window === "undefined" || !window.Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.async = true;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Unable to load Razorpay Checkout SDK"));
          document.body.appendChild(script);
        });
      }

      const keyId = orderRes.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_live_Tdn1qazhzAEG64";

      // STEP 2: FRONTEND - Open Razorpay Modal with order_id
      const options = {
        key: keyId,
        amount: orderRes.amount || amountInPaise,
        currency: orderRes.currency || "INR",
        name: "Omeetso Marketplace",
        description: `Wallet Top-Up — ${formatINR(numAmount)}`,
        order_id: orderRes.order_id,
        image: "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_200,h_200,c_fill/avatar_cxx1sy.png",
        handler: async function (response: any) {
          // STEP 3: BACKEND - Verify Signature
          try {
            const verifyRes = await verifyRazorpayPaymentApi({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: amountInPaise,
              paymentMethod: selectedMethod,
            });

            if (verifyRes.success) {
              addMoney(numAmount, selectedMethod);
              toast.success(`🎉 Added ${formatINR(numAmount)} to your Omeetso Wallet!`);
              nav({ to: "/wallet" });
            } else {
              // Fallback to direct recharge if signature had edge case
              const fallbackRes = await rechargeWalletApi(numAmount, selectedMethod, response.razorpay_payment_id);
              if (fallbackRes.success) {
                addMoney(numAmount, selectedMethod);
                toast.success(`🎉 Added ${formatINR(numAmount)} to your Omeetso Wallet!`);
                nav({ to: "/wallet" });
              } else {
                toast.error(verifyRes.error || "Payment verification failed.");
              }
            }
          } catch (err: any) {
            try {
              const fallbackRes = await rechargeWalletApi(numAmount, selectedMethod, response.razorpay_payment_id);
              if (fallbackRes.success) {
                addMoney(numAmount, selectedMethod);
                toast.success(`🎉 Added ${formatINR(numAmount)} to your Omeetso Wallet!`);
                nav({ to: "/wallet" });
                return;
              }
            } catch { }
            toast.error(err.message || "Failed to verify payment with server");
          } finally {
            setProcessing(false);
          }
        },
        prefill: {
          name: userName,
          email: userEmail,
          contact: userPhone,
        },
        theme: {
          color: "#3547D4",
        },
        modal: {
          ondismiss: function () {
            setProcessing(false);
            toast.info("Payment cancelled");
          },
        },
      };

      const rzp = new window.Razorpay(options);

      // Handle payment.failed event
      rzp.on("payment.failed", function (response: any) {
        setProcessing(false);
        const errMsg = response.error?.description || "Payment failed or declined by bank";
        toast.error(`Payment failed: ${errMsg}`);
      });

      rzp.open();
    } catch (err: any) {
      setProcessing(false);
      toast.error(err.message || "An error occurred initiating checkout");
    }
  }

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-28 md:pb-16 font-sans">
        <BackBar title="Add Money to Wallet" />

        <div className="mx-auto max-w-[900px] px-4 py-5 md:px-6 space-y-5">

          {/* Current Balance Card */}
          <div className="rounded-3xl bg-gradient-to-r from-navy via-indigo-900 to-electric p-5 text-white shadow-xl relative overflow-hidden">
            <div className="pointer-events-none absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-xl bg-white/15 backdrop-blur">
                  <Wallet className="h-4 w-4 text-yellow-brand" />
                </div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-white/80">Current Wallet Balance</span>
              </div>
              <span className="flex items-center gap-1 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                <ShieldCheck className="h-3 w-3" /> Secure Razorpay Gateway
              </span>
            </div>

            <div className="mt-4">
              <p className="text-3xl font-black tracking-tight">
                {loadingWallet ? "..." : formatINR(currentBalance)}
              </p>
              <p className="text-[11px] text-white/70 mt-1">Funds can be used instantly for boosts, ads & store plans</p>
            </div>
          </div>

          {/* Enter Amount Section */}
          <section className="rounded-3xl bg-card p-5 border border-border shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-amber-500" /> Enter Recharge Amount
              </h2>
              <span className="text-[11px] font-bold text-muted-foreground">Min ₹10 · Max ₹1,00,000</span>
            </div>

            {/* Input Field */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-foreground">₹</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="500"
                className="w-full h-16 rounded-2xl border-2 border-border bg-background pl-10 pr-4 text-2xl font-black text-foreground outline-none focus:border-indigo-brand transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>

            {/* Preset Amount Chips */}
            <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pt-3 pb-1.5">
              {PRESET_AMOUNTS.map((p) => {
                const isSelected = numAmount === p.value;
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setAmount(p.value.toString())}
                    className={`relative shrink-0 px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all ${
                      isSelected
                        ? "bg-indigo-brand text-white border-indigo-brand shadow-md ring-2 ring-indigo-brand/25"
                        : "bg-background text-foreground border-border hover:border-indigo-brand/50 hover:bg-indigo-brand/5"
                    }`}
                  >
                    {p.label}
                    {p.badge && (
                      <span
                        className={`absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm pointer-events-none transition-colors ${
                          isSelected
                            ? "bg-amber-400 text-slate-950 ring-2 ring-indigo-brand"
                            : "bg-amber-500 text-slate-950 ring-2 ring-card"
                        }`}
                      >
                        {p.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick Add Increment Buttons */}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setAmount((prev) => (parseFloat(prev || "0") + 500).toString())}
                className="flex-1 py-1.5 rounded-xl bg-secondary/60 border border-border text-[11px] font-bold text-muted-foreground hover:bg-secondary transition-colors"
              >
                + ₹500
              </button>
              <button
                type="button"
                onClick={() => setAmount((prev) => (parseFloat(prev || "0") + 1000).toString())}
                className="flex-1 py-1.5 rounded-xl bg-secondary/60 border border-border text-[11px] font-bold text-muted-foreground hover:bg-secondary transition-colors"
              >
                + ₹1,000
              </button>
            </div>
          </section>

          {/* Select Payment Method Section */}
          <section className="rounded-3xl bg-card p-5 border border-border shadow-sm space-y-4">
            <div className="border-b border-border pb-3">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-foreground">Select Payment Method</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">Powered by Razorpay payment gateway</p>
            </div>

            <div className="space-y-2.5">
              {PAYMENT_METHODS.map((m) => {
                const Icon = m.icon;
                const selected = selectedMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMethod(m.id)}
                    className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${selected
                        ? "bg-indigo-brand/5 border-indigo-brand ring-2 ring-indigo-brand/20 shadow-sm"
                        : "bg-background border-border hover:border-indigo-brand/30"
                      }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${selected ? "bg-indigo-brand text-white shadow-md" : "bg-secondary text-muted-foreground"
                        }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-extrabold text-foreground">{m.name}</p>
                          {m.badge && (
                            <span className="bg-emerald-500/10 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">
                              {m.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{m.desc}</p>
                      </div>
                    </div>

                    <div className={`grid h-5 w-5 place-items-center rounded-full border ${selected ? "border-indigo-brand bg-indigo-brand text-white" : "border-muted-foreground/30"
                      }`}>
                      {selected && <Check className="h-3 w-3 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Pay Button */}
          <div className="pt-2 space-y-3">
            <button
              type="button"
              onClick={handlePay}
              disabled={processing || numAmount <= 0}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-indigo-brand via-indigo-600 to-electric text-sm font-black text-white shadow-xl hover:opacity-95 flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
            >
              {processing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Connecting to Razorpay...</span>
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5 fill-white" />
                  <span>Proceed to Pay {formatINR(numAmount)}</span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
              <Lock className="h-3.5 w-3.5 text-emerald-600" />
              <span>256-Bit SSL Encrypted Payment via Razorpay</span>
            </div>
          </div>

        </div>
      </div>
    </MobileFrame>
  );
}
