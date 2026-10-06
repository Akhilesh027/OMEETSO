import React, { useEffect, useRef, useState } from "react";
import { Sparkles, Info, ExternalLink } from "lucide-react";
import { getAdSettingsApi, getAdPlacementsApi } from "@/api/adCampaigns.api";

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

export interface GoogleAdSlotProps {
  slotId?: string;
  format?: "auto" | "rectangle" | "horizontal" | "vertical" | "in-feed";
  responsive?: boolean;
  className?: string;
  style?: React.CSSProperties;
  fallbackLabel?: string;
  title?: string;
}

const DEFAULT_CLIENT_ID = import.meta.env.VITE_GOOGLE_ADSENSE_CLIENT_ID || "ca-pub-0000000000000000";
const IS_TEST_MODE = import.meta.env.VITE_GOOGLE_ADSENSE_TEST_MODE === "true" || DEFAULT_CLIENT_ID.includes("00000000");

let isScriptLoaded = false;

// In-memory cache for fast, seamless checks without refetching on every single ad unit
let cachedConfig: {
  googleAdsEnabled: boolean;
  googleClientId: string;
  disabledSlots: Set<string>;
  lastFetched: number;
} | null = null;

let fetchPromise: Promise<any> | null = null;

async function getGoogleAdsConfig() {
  const now = Date.now();
  if (cachedConfig && now - cachedConfig.lastFetched < 30000) {
    return cachedConfig;
  }

  if (!fetchPromise) {
    fetchPromise = (async () => {
      try {
        const [settingsRes, placementsRes] = await Promise.all([
          getAdSettingsApi(),
          getAdPlacementsApi()
        ]);

        const disabledSlots = new Set<string>();
        if (placementsRes.success && Array.isArray(placementsRes.data)) {
          placementsRes.data.forEach((p: any) => {
            if (p.active === false && p.googleSlotId) {
              disabledSlots.add(String(p.googleSlotId).trim());
            }
          });
        }

        const localEnabled = typeof window !== "undefined"
          ? localStorage.getItem("admin_google_adsense_enabled") !== "false"
          : true;

        const serverEnabled = settingsRes.success && settingsRes.data
          ? settingsRes.data.googleAdsEnabled !== false
          : true;

        cachedConfig = {
          googleAdsEnabled: localEnabled && serverEnabled,
          googleClientId: settingsRes.data?.googleClientId || DEFAULT_CLIENT_ID,
          disabledSlots,
          lastFetched: Date.now()
        };
        return cachedConfig;
      } catch {
        cachedConfig = {
          googleAdsEnabled: typeof window !== "undefined" ? localStorage.getItem("admin_google_adsense_enabled") !== "false" : true,
          googleClientId: DEFAULT_CLIENT_ID,
          disabledSlots: new Set<string>(),
          lastFetched: Date.now()
        };
        return cachedConfig;
      } finally {
        fetchPromise = null;
      }
    })();
  }
  return fetchPromise;
}

function loadGoogleAdSenseScript(clientId: string) {
  if (typeof window === "undefined" || isScriptLoaded) return;
  if (document.querySelector(`script[src*="pagead2.googlesyndication.com"]`)) {
    isScriptLoaded = true;
    return;
  }

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
  script.crossOrigin = "anonymous";
  script.onload = () => {
    isScriptLoaded = true;
  };
  script.onerror = () => {
    console.warn("Failed to load Google AdSense script (may be blocked by ad-blocker)");
  };
  document.head.appendChild(script);
}

export function GoogleAdSlot({
  slotId = "1234567890",
  format = "auto",
  responsive = true,
  className = "",
  style,
  fallbackLabel = "Sponsored Advertisement",
  title = "Partner Offer"
}: GoogleAdSlotProps) {
  const adRef = useRef<HTMLModElement | null>(null);
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState(false);
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window !== "undefined") {
      if (localStorage.getItem("admin_google_adsense_enabled") === "false") return false;
    }
    return true;
  });
  const pushedRef = useRef(false);

  useEffect(() => {
    getGoogleAdsConfig().then((cfg) => {
      if (!cfg.googleAdsEnabled) {
        setIsVisible(false);
        return;
      }
      if (slotId && cfg.disabledSlots.has(String(slotId).trim())) {
        setIsVisible(false);
        return;
      }
      setIsVisible(true);
    });
  }, [slotId]);

  useEffect(() => {
    if (!isVisible) return;

    if (IS_TEST_MODE) {
      setAdLoaded(true);
      return;
    }

    loadGoogleAdSenseScript(DEFAULT_CLIENT_ID);

    // Guard against React 19 double-invocations in StrictMode
    if (pushedRef.current) return;

    try {
      if (adRef.current && adRef.current.innerHTML.trim() === "") {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushedRef.current = true;
        setAdLoaded(true);
      }
    } catch (err) {
      console.warn("AdSense push error:", err);
      setAdError(true);
    }
  }, [slotId, isVisible]);

  // Dimension presets by format
  const getFormatStyles = (): React.CSSProperties => {
    switch (format) {
      case "rectangle":
        return { minHeight: "250px", width: "100%", maxWidth: "336px" };
      case "horizontal":
        return { minHeight: "90px", width: "100%" };
      case "vertical":
        return { minHeight: "600px", width: "100%", maxWidth: "300px" };
      case "in-feed":
        return { minHeight: "280px", width: "100%" };
      default:
        return { minHeight: "100px", width: "100%" };
    }
  };

  // If set to "DON'T SHOW" (off globally or per-slot), gracefully render nothing
  if (!isVisible) {
    return null;
  }

  // If in Test Mode or placeholder publisher ID, show polished development mockup
  if (IS_TEST_MODE) {
    return (
      <div
        className={`relative overflow-hidden rounded-2xl border border-dashed border-primary/30 bg-gradient-to-br from-primary/5 via-background to-secondary/30 p-4 transition-all hover:border-primary/50 ${className}`}
        style={{ ...getFormatStyles(), ...style }}
      >
        <div className="flex items-center justify-between pb-2 border-b border-border/50 text-[11px] text-muted-foreground font-semibold">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 font-bold text-primary">
            <Sparkles className="h-3 w-3" /> Ad · Google AdSense
          </span>
          <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
            <Info className="h-3 w-3" /> Slot {slotId}
          </span>
        </div>

        <div className="flex flex-col items-center justify-center text-center py-6 px-2 space-y-2">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/10 text-primary shadow-xs">
            <ExternalLink className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-extrabold text-foreground">{title}</p>
            <p className="text-xs text-muted-foreground max-w-xs">{fallbackLabel}</p>
          </div>
          <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-card border border-border px-3 py-1 text-[11px] font-bold text-foreground shadow-xs">
            Google Ad Unit ({format.toUpperCase()})
          </span>
        </div>

        <div className="absolute bottom-2 right-2 text-[9px] font-medium text-muted-foreground/70">
          Preview Mode · Add real Publisher ID in .env
        </div>
      </div>
    );
  }

  if (adError) {
    return null; // Gracefully collapse if blocked or errored
  }

  return (
    <div
      className={`google-ad-container relative overflow-hidden text-center transition-all ${className}`}
      style={{ ...getFormatStyles(), ...style }}
    >
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block", ...getFormatStyles(), ...style }}
        data-ad-client={DEFAULT_CLIENT_ID}
        data-ad-slot={slotId}
        data-ad-format={responsive ? "auto" : undefined}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
}
