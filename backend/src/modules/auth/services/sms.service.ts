import { env } from "../../../config/env";

export interface SmsSendResult {
  success: boolean;
  messageId?: string;
  responseRaw?: string;
  error?: string;
}

/**
 * Dispatches an OTP SMS to a recipient phone number via the Renflair SMS Gateway.
 * Renflair Endpoint Format: https://sms.renflair.in/V1.php?API={API_KEY}&PHONE={10_DIGIT_PHONE}&OTP={OTP}
 */
export async function sendOtpSms(phone: string, otp: string): Promise<SmsSendResult> {
  try {
    const rawDigits = phone.replace(/\D/g, "");
    const tenDigitPhone = rawDigits.slice(-10);

    if (!tenDigitPhone || tenDigitPhone.length !== 10) {
      console.warn(`[Renflair SMS] Invalid recipient phone number format: "${phone}"`);
      return { success: false, error: "Invalid 10-digit mobile phone number" };
    }

    if (!env.RENFLAIR_SMS_API_KEY) {
      console.warn("[Renflair SMS] RENFLAIR_SMS_API_KEY is not configured");
      return { success: false, error: "SMS Gateway API key not configured" };
    }

    const gatewayUrl = `${env.SMS_GATEWAY_URL}?API=${encodeURIComponent(env.RENFLAIR_SMS_API_KEY)}&PHONE=${encodeURIComponent(tenDigitPhone)}&OTP=${encodeURIComponent(otp)}`;

    console.log(`[Renflair SMS] Dispatching OTP SMS to ${tenDigitPhone}...`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(gatewayUrl, {
      method: "GET",
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const responseText = await response.text();
    console.log(`[Renflair SMS] Response status: ${response.status}, payload: ${responseText}`);

    if (!response.ok) {
      console.error(`[Renflair SMS] Gateway returned HTTP ${response.status}: ${responseText}`);
      return {
        success: false,
        responseRaw: responseText,
        error: `Gateway returned status ${response.status}`
      };
    }

    let parsed: any = null;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      // Some SMS gateways return plain text like "SUCCESS" or "OK" or message IDs
    }

    return {
      success: true,
      responseRaw: responseText,
      data: parsed || responseText
    } as any;
  } catch (error: any) {
    if (error.name === "AbortError") {
      console.error("[Renflair SMS] Request timed out after 8s");
      return { success: false, error: "SMS gateway request timed out" };
    }
    console.error("[Renflair SMS] Failed to dispatch SMS:", error);
    return { success: false, error: error.message || "Failed to communicate with SMS gateway" };
  }
}
