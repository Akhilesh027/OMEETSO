import { env } from "../../../config/env";

export interface SmsSendResult {
  success: boolean;
  messageId?: string;
  responseRaw?: string;
  error?: string;
}

/**
 * Dispatches an OTP SMS to a recipient phone number via Combirds SMS Gateway.
 * Endpoint: POST https://api.combirds.com/api/v1/sms/send
 * Header: x-api-key: {API_KEY}
 */
export async function sendOtpSms(phone: string, otp: string): Promise<SmsSendResult> {
  try {
    const rawDigits = phone.replace(/\D/g, "");
    const tenDigitPhone = rawDigits.slice(-10);

    if (!tenDigitPhone || tenDigitPhone.length !== 10) {
      console.warn(`[SMS Service] Invalid recipient phone number format: "${phone}"`);
      return { success: false, error: "Invalid 10-digit mobile phone number" };
    }

    const apiKey = env.COMBIRDS_API_KEY;

    if (!apiKey) {
      console.warn("[SMS Service] Combirds API Key (COMBIRDS_API_KEY) is not configured in .env");
      return { success: false, error: "SMS Gateway API key not configured" };
    }

    const gatewayUrl = env.COMBIRDS_GATEWAY_URL || "https://api.combirds.com/api/v1/sms/send";
    const senderId = env.COMBIRDS_SENDER_ID || "OMEETS";
    const formattedNumber = tenDigitPhone;

    // Build message text matching the approved DLT template
    let message = `your OTP for login is ${otp} - OMEETSO`;
    if (env.COMBIRDS_MESSAGE_TEMPLATE && !env.COMBIRDS_MESSAGE_TEMPLATE.endsWith("{")) {
      if (
        env.COMBIRDS_MESSAGE_TEMPLATE.includes("{#var#}") ||
        env.COMBIRDS_MESSAGE_TEMPLATE.includes("{#num#}") ||
        env.COMBIRDS_MESSAGE_TEMPLATE.includes("{#otp#}") ||
        env.COMBIRDS_MESSAGE_TEMPLATE.includes("{#val#}") ||
        env.COMBIRDS_MESSAGE_TEMPLATE.includes("{otp}") ||
        /xxxx/i.test(env.COMBIRDS_MESSAGE_TEMPLATE)
      ) {
        message = env.COMBIRDS_MESSAGE_TEMPLATE
          .replace(/{#var#}/gi, otp)
          .replace(/{#num#}/gi, otp)
          .replace(/{#otp#}/gi, otp)
          .replace(/{#val#}/gi, otp)
          .replace(/{otp}/gi, otp)
          .replace(/xxxx/gi, otp);
      } else if (env.COMBIRDS_MESSAGE_TEMPLATE.includes("is  -")) {
        message = env.COMBIRDS_MESSAGE_TEMPLATE.replace("is  -", `is ${otp} -`);
      } else if (env.COMBIRDS_MESSAGE_TEMPLATE.includes("is -")) {
        message = env.COMBIRDS_MESSAGE_TEMPLATE.replace("is -", `is ${otp} -`);
      } else {
        message = `your OTP for login is ${otp} - OMEETSO`;
      }
    }

    const payload: Record<string, any> = {
      number: [formattedNumber],
      message,
      senderId,
      templateId: env.COMBIRDS_DLT_TE_ID || "",
      smsType: env.COMBIRDS_SMS_TYPE || "otp"
    };

    console.log(`[Combirds SMS] Dispatching SMS to: ${formattedNumber}`);
    console.log(`[Combirds SMS] Exact Message Text: "${message}"`);
    console.log(`[Combirds SMS] Sender ID: "${senderId}", Template ID: "${payload.templateId}"`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(gatewayUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "x-api-key": apiKey
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const responseText = await response.text();
    console.log(`[Combirds SMS] Response status: ${response.status}, payload: ${responseText}`);

    if (!response.ok) {
      console.error(`[Combirds SMS] Gateway returned HTTP ${response.status}: ${responseText}`);
      return {
        success: false,
        responseRaw: responseText,
        error: `Gateway returned status ${response.status}: ${responseText}`
      };
    }

    let parsed: any = null;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      // Some SMS gateways return plain text strings
    }

    if (parsed?.data?.transactionId) {
      // Async poll delivery status after 2.5s for diagnostic logging
      setTimeout(async () => {
        try {
          const statusRes = await fetch(`https://api.combirds.com/api/v1/org/transaction/${parsed.data.transactionId}/messages`, {
            headers: {
              "x-api-key": apiKey,
              "content-type": "application/json"
            }
          });
          const statusJson = await statusRes.text();
          console.log(`[Combirds Delivery Status] Transaction ${parsed.data.transactionId}:`, statusJson);
        } catch {
          // ignore background diagnostic error
        }
      }, 2500);
    }

    return {
      success: true,
      responseRaw: responseText,
      data: parsed || responseText
    } as any;
  } catch (error: any) {
    if (error.name === "AbortError") {
      console.error("[Combirds SMS] Request timed out after 10s");
      return { success: false, error: "SMS gateway request timed out" };
    }
    console.error("[Combirds SMS] Failed to dispatch SMS:", error);
    return { success: false, error: error.message || "Failed to communicate with SMS gateway" };
  }
}
