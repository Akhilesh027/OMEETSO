import React, { useState } from "react";
import { createRazorpayOrderApi, verifyRazorpayPaymentApi, VerifyPaymentResponse } from "@/api/razorpay.api";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export interface RazorpayCheckoutButtonProps {
  amountInRupees: number;
  onSuccess?: (response: VerifyPaymentResponse) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
  buttonText?: string;
  className?: string;
  disabled?: boolean;
  paymentMethod?: string;
  notes?: Record<string, string>;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
}

export const RazorpayCheckoutButton: React.FC<RazorpayCheckoutButtonProps> = ({
  amountInRupees,
  onSuccess,
  onError,
  onCancel,
  buttonText,
  className,
  disabled = false,
  paymentMethod = "upi",
  prefill,
}) => {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (disabled || loading) return;

    const amountInPaise = Math.round(amountInRupees * 100);

    if (amountInPaise < 100) {
      toast.error("Minimum checkout amount is ₹1 (100 paise)");
      return;
    }

    setLoading(true);

    try {
      // STEP 1: BACKEND - Create Order
      const orderRes = await createRazorpayOrderApi(amountInPaise, "INR");

      if (!orderRes.success || !orderRes.order_id) {
        throw new Error(orderRes.error || "Failed to initiate payment order");
      }

      const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID || orderRes.key_id || "rzp_test_TWMJ5ahCK6Kbdj";

      // User details fallback
      const userRaw = typeof localStorage !== "undefined" ? localStorage.getItem("omeetso_user") : null;
      let userName = prefill?.name || "Omeetso User";
      let userEmail = prefill?.email || "user@omeetso.com";
      let userPhone = prefill?.contact || "9876543210";

      if (userRaw) {
        try {
          const u = JSON.parse(userRaw);
          if (u.profile?.name) userName = u.profile.name;
          if (u.email) userEmail = u.email;
          if (u.phone) userPhone = u.phone;
        } catch {}
      }

      // Ensure Razorpay SDK is loaded
      if (typeof window === "undefined" || !window.Razorpay) {
        // Dynamically load if script tag was not yet finished
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.async = true;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Unable to load Razorpay Checkout SDK"));
          document.body.appendChild(script);
        });
      }

      // STEP 2: FRONTEND - Open Razorpay Modal
      const options = {
        key: keyId,
        amount: orderRes.amount || amountInPaise,
        currency: orderRes.currency || "INR",
        name: "Omeetso Marketplace",
        description: `Payment of ₹${amountInRupees.toLocaleString("en-IN")}`,
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
              paymentMethod,
            });

            if (verifyRes.success) {
              toast.success(`🎉 Payment of ₹${amountInRupees.toLocaleString("en-IN")} successful!`);
              if (onSuccess) onSuccess(verifyRes);
            } else {
              const err = verifyRes.error || "Payment verification failed";
              toast.error(err);
              if (onError) onError(err);
            }
          } catch (err: any) {
            const msg = err.message || "Error verifying payment signature";
            toast.error(msg);
            if (onError) onError(msg);
          } finally {
            setLoading(false);
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
            setLoading(false);
            toast.info("Payment cancelled");
            if (onCancel) onCancel();
          },
        },
      };

      const rzp = new window.Razorpay(options);

      // Handle payment.failed event
      rzp.on("payment.failed", function (response: any) {
        setLoading(false);
        const errMsg = response.error?.description || "Payment declined or failed";
        toast.error(`Payment failed: ${errMsg}`);
        if (onError) onError(errMsg);
      });

      rzp.open();
    } catch (err: any) {
      setLoading(false);
      const errMsg = err.message || "Failed to initialize checkout";
      toast.error(errMsg);
      if (onError) onError(errMsg);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCheckout}
      disabled={disabled || loading}
      className={
        className ||
        "w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all duration-200 active:scale-[0.99] disabled:opacity-50"
      }
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Processing Checkout...</span>
        </>
      ) : (
        <>
          <ShieldCheck className="h-4 w-4 text-white" />
          <span>{buttonText || `Pay ₹${amountInRupees.toLocaleString("en-IN")} with Razorpay`}</span>
        </>
      )}
    </button>
  );
};
