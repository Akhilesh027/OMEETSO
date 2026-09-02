import { API_BASE, BACKEND_URL } from "@/config/api";
import { getUserAccessToken } from "./auth.api";

function getAuthHeaders(): Record<string, string> {
  const token = getUserAccessToken() || "";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export interface CreateOrderResponse {
  success: boolean;
  order_id?: string;
  id?: string;
  amount?: number;
  currency?: string;
  receipt?: string;
  key_id?: string;
  error?: string;
}

export interface VerifyPaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  amount?: number;
  paymentMethod?: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  message?: string;
  order_id?: string;
  payment_id?: string;
  wallet?: {
    id: string;
    balanceInPaise: number;
    addedInPaise?: number;
  };
  error?: string;
}

/**
 * STEP 1: Calls backend endpoint to create a Razorpay Order
 */
export async function createRazorpayOrderApi(
  amountInPaise: number,
  currency = "INR",
  receipt?: string
): Promise<CreateOrderResponse> {
  try {
    const endpoints = [
      `${API_BASE}/create-order`,
      `${BACKEND_URL}/api/create-order`,
      `${API_BASE}/revenue/create-order`
    ];

    let lastError = "Failed to connect to backend";

    for (const url of endpoints) {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            amount: amountInPaise,
            currency,
            receipt: receipt || `rcpt_${Date.now()}`
          }),
        });

        const data = await res.json();
        if (res.ok && (data.order_id || data.id)) {
          return {
            success: true,
            order_id: data.order_id || data.id,
            id: data.order_id || data.id,
            amount: data.amount,
            currency: data.currency,
            key_id: data.key_id,
          };
        } else {
          lastError = data.error?.message || data.error || data.message || `Server returned ${res.status}`;
          if (res.status === 400 || res.status === 401) {
            return { success: false, error: lastError };
          }
        }
      } catch (err: any) {
        lastError = err.message || "Network request failed";
      }
    }

    return { success: false, error: lastError };
  } catch (err: any) {
    return { success: false, error: err.message || "Unknown error creating Razorpay order" };
  }
}

/**
 * STEP 3: Calls backend endpoint to verify Razorpay Payment Signature
 */
export async function verifyRazorpayPaymentApi(
  payload: VerifyPaymentPayload
): Promise<VerifyPaymentResponse> {
  try {
    const endpoints = [
      `${API_BASE}/verify-payment`,
      `${BACKEND_URL}/api/verify-payment`,
      `${API_BASE}/revenue/verify-payment`
    ];

    let lastError = "Failed to connect to backend";

    for (const url of endpoints) {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          return {
            success: true,
            message: data.message || "Payment verified successfully",
            order_id: data.order_id,
            payment_id: data.payment_id,
            wallet: data.wallet,
          };
        } else {
          lastError = data.error?.message || data.error || data.message || "Payment verification failed";
          if (res.status === 400) {
            return { success: false, error: lastError };
          }
        }
      } catch (err: any) {
        lastError = err.message || "Network request failed";
      }
    }

    return { success: false, error: lastError };
  } catch (err: any) {
    return { success: false, error: err.message || "Unknown error verifying payment" };
  }
}
