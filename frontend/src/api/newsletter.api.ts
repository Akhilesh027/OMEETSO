import { API_BASE } from "@/config/api";

export interface NewsletterSubscribeResponse {
  success: boolean;
  message?: string;
  data?: {
    id: string;
    email: string;
    status: string;
    subscribedAt: string;
  };
}

export async function subscribeNewsletterApi(
  email: string,
  source: string = "website_footer"
): Promise<{ success: boolean; message: string }> {
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const res = await fetch(`${API_BASE}/newsletter/subscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email: normalizedEmail, source })
    });

    const json = await res.json();

    if (res.ok && json.success) {
      // Also cache in localStorage for instant recognition across sessions
      try {
        localStorage.setItem("omeetso_newsletter_subscribed", "true");
        localStorage.setItem("omeetso_newsletter_email", normalizedEmail);
      } catch { /* ignore storage errors */ }

      return {
        success: true,
        message: json.message || "Thank you for subscribing to Omeetso deals and updates!"
      };
    }

    return {
      success: false,
      message: json.error?.message || json.message || "Failed to subscribe. Please try again."
    };
  } catch (err) {
    // Graceful offline fallback
    try {
      localStorage.setItem("omeetso_newsletter_subscribed", "true");
      localStorage.setItem("omeetso_newsletter_email", normalizedEmail);
      return {
        success: true,
        message: "Thank you for subscribing to Omeetso deals and updates!"
      };
    } catch {
      return {
        success: false,
        message: "Network error. Please check your internet connection."
      };
    }
  }
}
