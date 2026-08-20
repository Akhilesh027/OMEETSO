// Mock advertisement tracking. Stores impression/click events in localStorage.
const KEY = "omeetso_ad_events";
type Event = { adId: string; kind: "impression" | "click" | "dismiss"; time: number };

function read(): Event[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
function write(events: Event[]) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(KEY, JSON.stringify(events.slice(-200))); } catch { /* ignore */ }
}

export function trackAdImpression(adId: string) {
  write([...read(), { adId, kind: "impression", time: Date.now() }]);
}
export function trackAdClick(adId: string) {
  write([...read(), { adId, kind: "click", time: Date.now() }]);
}
export function dismissAd(adId: string) {
  write([...read(), { adId, kind: "dismiss", time: Date.now() }]);
  try {
    const dismissed = JSON.parse(localStorage.getItem("omeetso_ads_dismissed") || "[]");
    if (!dismissed.includes(adId)) {
      dismissed.push(adId);
      localStorage.setItem("omeetso_ads_dismissed", JSON.stringify(dismissed));
    }
  } catch { /* ignore */ }
}
export function isAdDismissed(adId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const dismissed = JSON.parse(localStorage.getItem("omeetso_ads_dismissed") || "[]");
    return dismissed.includes(adId);
  } catch { return false; }
}
