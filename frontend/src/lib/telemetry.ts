import { API_BASE } from "@/config/api";
import { getUserAccessToken } from "@/api/auth.api";
import { isNativePlatform, getPlatform } from "./capacitor";

const VISITOR_ID_KEY = "omeetso_visitor_id";
const SESSION_ID_KEY = "omeetso_session_id";
const SESSION_TIMESTAMP_KEY = "omeetso_session_ts";
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

function generateId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
}

export function getOrCreateVisitorId(): string {
  if (typeof window === "undefined") return "server";
  let vid = localStorage.getItem(VISITOR_ID_KEY);
  if (!vid) {
    vid = generateId("v");
    localStorage.setItem(VISITOR_ID_KEY, vid);
  }
  return vid;
}

export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "server";
  const now = Date.now();
  const lastTs = parseInt(localStorage.getItem(SESSION_TIMESTAMP_KEY) || "0", 10);
  let sid = localStorage.getItem(SESSION_ID_KEY);

  if (!sid || now - lastTs > SESSION_TIMEOUT_MS) {
    sid = generateId("s");
    localStorage.setItem(SESSION_ID_KEY, sid);
  }

  localStorage.setItem(SESSION_TIMESTAMP_KEY, now.toString());
  return sid;
}

export function getDevicePlatform(): "android_app" | "ios_app" | "mobile_web" | "desktop_web" {
  if (typeof window === "undefined") return "desktop_web";
  if (isNativePlatform()) {
    return getPlatform() === "ios" ? "ios_app" : "android_app";
  }
  const isMobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent);
  return isMobile ? "mobile_web" : "desktop_web";
}

export function getUserLocationPreference(): { city: string; area?: string; coordinates?: [number, number] } {
  if (typeof window === "undefined") return { city: "Hyderabad" };
  try {
    const storedLoc = localStorage.getItem("omeetso_selected_location") || localStorage.getItem("omeetso_city");
    if (storedLoc) {
      if (storedLoc.startsWith("{")) {
        const parsed = JSON.parse(storedLoc);
        return {
          city: parsed.city || parsed.name || "Hyderabad",
          area: parsed.area || "",
          coordinates: parsed.coordinates || undefined
        };
      }
      return { city: storedLoc };
    }
  } catch {}
  return { city: "Hyderabad" };
}

export interface TelemetryEventOptions {
  activityType:
    | "VISIT_OPENED"
    | "PAGE_VIEW"
    | "LISTING_VIEW"
    | "STORE_VISIT"
    | "SEARCH_PERFORMED"
    | "CONTACT_CALL_CLICKED"
    | "CONTACT_WHATSAPP_CLICKED"
    | "DEAL_OFFER_MADE"
    | "SHARE_CLICKED"
    | "USER_REGISTERED"
    | "USER_LOGGED_IN";
  pageUrl?: string;
  pagePath?: string;
  pageTitle?: string;
  metadata?: Record<string, any>;
}

export async function sendTelemetryEvent(options: TelemetryEventOptions): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    const visitorId = getOrCreateVisitorId();
    const sessionId = getOrCreateSessionId();
    const platform = getDevicePlatform();
    const locationPref = getUserLocationPreference();
    const token = getUserAccessToken();

    const payload = {
      visitorId,
      sessionId,
      activityType: options.activityType,
      pageUrl: options.pageUrl || window.location.href,
      pagePath: options.pagePath || window.location.pathname,
      pageTitle: options.pageTitle || document.title,
      referrer: document.referrer || "",
      metadata: options.metadata || {},
      location: {
        city: locationPref.city,
        area: locationPref.area,
        coordinates: locationPref.coordinates
      },
      device: {
        platform,
        browser: navigator.userAgent.includes("Chrome") ? "Chrome" : navigator.userAgent.includes("Safari") ? "Safari" : "Browser",
        os: navigator.userAgent.includes("Android") ? "Android" : navigator.userAgent.includes("iPhone") ? "iOS" : "Desktop",
        screenResolution: `${window.screen.width}x${window.screen.height}`
      }
    };

    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Use fetch with keepalive so page unloads never drop events
    fetch(`${API_BASE}/telemetry/event`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      keepalive: true
    }).catch(() => {
      // Non-blocking background telemetry
    });
  } catch {
    // Fail silently in client
  }
}

// Specialized helpers for high-value user actions
export const trackPageView = (path?: string, title?: string) => {
  sendTelemetryEvent({
    activityType: "PAGE_VIEW",
    pagePath: path,
    pageTitle: title
  });
};

export const trackListingView = (listing: { id: string; title: string; price?: number; sellerPhone?: string; categoryId?: string }) => {
  sendTelemetryEvent({
    activityType: "LISTING_VIEW",
    metadata: {
      listingId: listing.id,
      listingTitle: listing.title,
      listingPrice: listing.price,
      sellerPhone: listing.sellerPhone,
      categoryId: listing.categoryId
    }
  });
};

export const trackStoreVisit = (store: { id: string; name: string; businessMobile?: string }) => {
  sendTelemetryEvent({
    activityType: "STORE_VISIT",
    metadata: {
      storeId: store.id,
      storeName: store.name,
      businessMobile: store.businessMobile
    }
  });
};

export const trackSearch = (query: string, categoryId?: string) => {
  if (!query || query.trim().length < 2) return;
  sendTelemetryEvent({
    activityType: "SEARCH_PERFORMED",
    metadata: {
      searchQuery: query.trim(),
      categoryId
    }
  });
};

export const trackContactLead = (type: "call" | "whatsapp", details: { listingTitle?: string; sellerPhone?: string; storeName?: string }) => {
  sendTelemetryEvent({
    activityType: type === "call" ? "CONTACT_CALL_CLICKED" : "CONTACT_WHATSAPP_CLICKED",
    metadata: {
      action: type,
      listingTitle: details.listingTitle,
      sellerPhone: details.sellerPhone,
      storeName: details.storeName
    }
  });
};

