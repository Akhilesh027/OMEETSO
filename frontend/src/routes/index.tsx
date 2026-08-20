import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { WifiOff, ServerCrash, DownloadCloud, RefreshCw, MapPin, Store, Home, Package, Tag, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Splash,
  validateSearch: (s: Record<string, unknown>) => ({
    state: (s.state as SplashState | undefined) ?? undefined,
  }),
});

type SplashState = "normal" | "slow" | "offline" | "error" | "update";

/* ------------------------------ Brand Logo ------------------------------ */
function OmeetsoMark({ size = 128 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 100 50"
      width={size * 2}
      height={size}
      className="drop-shadow-[0_10px_30px_rgba(25,109,249,0.4)]"
      aria-label="Omeetso logo mark"
    >
      <defs>
        <linearGradient id="splash-infinity-grad" x1="0" y1="25" x2="100" y2="25" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#80B3FF" />
          <stop offset="100%" stopColor="#196DF9" />
        </linearGradient>
      </defs>
      <path
        d="M 30,10 C 15,10 5,17 5,25 C 5,33 15,40 30,40 C 42,40 54,28 65,20 C 73,14 82,10 90,17 C 98,23 96,33 87,38 C 77,43 65,37 55,28 C 45,19 38,10 30,10 Z"
        fill="url(#splash-infinity-grad)"
        style={{ animation: "splash-fade-up 600ms ease-out 200ms both" }}
      />
      <path
        d="M 30,12 C 18,12 10,18 10,25 C 10,32 18,38 30,38 C 40,38 50,28 60,20 C 67,14 76,12 85,17 C 92,21 91,30 84,34 C 76,38 67,34 58,26 C 49,18 40,12 30,12 Z"
        fill="none"
        stroke="url(#splash-infinity-grad)"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ animation: "splash-fade-up 600ms ease-out 400ms both" }}
      />
    </svg>
  );
}

/* --------------------------- Subtle bg pattern --------------------------- */
function BackgroundMotif() {
  const pins = [
    { x: 12, y: 18, d: 0 },
    { x: 82, y: 14, d: 200 },
    { x: 68, y: 30, d: 500 },
    { x: 22, y: 74, d: 300 },
    { x: 84, y: 80, d: 700 },
    { x: 46, y: 88, d: 900 },
  ];
  const houses = [
    { x: 30, y: 26 },
    { x: 74, y: 62 },
    { x: 16, y: 58 },
  ];
  const bags = [
    { x: 58, y: 20 },
    { x: 34, y: 68 },
    { x: 78, y: 44 },
  ];

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.09]"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      {/* Connection paths */}
      <g stroke="white" strokeWidth="0.25" fill="none" strokeDasharray="1 1.4" opacity="0.9">
        <path d="M12 18 Q 40 40 68 30 T 84 80" />
        <path d="M22 74 Q 50 60 82 14" />
        <path d="M46 88 Q 60 60 78 44" />
      </g>

      {/* Pins */}
      {pins.map((p, i) => (
        <g
          key={`p${i}`}
          transform={`translate(${p.x} ${p.y})`}
          style={{
            transformOrigin: "center",
            animation: `splash-drift 6s ease-in-out ${p.d}ms infinite`,
          }}
        >
          <path
            d="M0 -3 C -2.4 -3, -4 -1.4, -4 0.6 C -4 2.8, -1.6 5, 0 6.4 C 1.6 5, 4 2.8, 4 0.6 C 4 -1.4, 2.4 -3, 0 -3 Z"
            fill="white"
          />
          <circle cx="0" cy="0.6" r="1" fill="#111E4D" />
        </g>
      ))}

      {/* Houses */}
      {houses.map((h, i) => (
        <g key={`h${i}`} transform={`translate(${h.x} ${h.y})`} fill="white">
          <path d="M-3 1 L0 -2 L3 1 L3 4 L-3 4 Z" />
        </g>
      ))}

      {/* Bags */}
      {bags.map((b, i) => (
        <g key={`b${i}`} transform={`translate(${b.x} ${b.y})`} stroke="white" strokeWidth="0.4" fill="none">
          <rect x="-2" y="-1.5" width="4" height="4" rx="0.6" />
          <path d="M-1.2 -1.5 v-1 a1.2 1.2 0 0 1 2.4 0 v1" />
        </g>
      ))}
    </svg>
  );
}

/* ------------------------------ States ---------------------------------- */
function StateCard({
  icon,
  title,
  message,
  action,
  onAction,
}: {
  icon: React.ReactNode;
  title: string;
  message: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div
      className="relative z-10 mx-6 max-w-sm rounded-3xl border border-white/15 bg-white/10 p-6 text-center backdrop-blur-xl"
      style={{ animation: "splash-fade-up 500ms ease-out both" }}
    >
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-yellow-brand text-navy">
        {icon}
      </div>
      <h2 className="mt-4 text-lg font-bold text-white">{title}</h2>
      <p className="mt-1 text-sm text-white/75">{message}</p>
      {action && onAction && (
        <button
          onClick={onAction}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-yellow-brand px-5 py-2.5 text-sm font-bold text-navy shadow-lg hover:brightness-105 active:scale-95 transition"
        >
          <RefreshCw className="h-4 w-4" /> {action}
        </button>
      )}
    </div>
  );
}

/* --------------------------------- Splash ------------------------------- */
function Splash() {
  const nav = useNavigate();
  const { state: forcedState } = Route.useSearch();
  const [state, setState] = useState<SplashState>("normal");

  useEffect(() => {
    if (forcedState) {
      setState(forcedState);
      return;
    }
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      setState("offline");
      return;
    }

    // Slow-loading indicator kicks in if we're still here past 2.5s
    const slow = setTimeout(() => setState((s) => (s === "normal" ? "slow" : s)), 2500);

    const t = setTimeout(() => {
      const language = localStorage.getItem("omeetso_language");
      if (!language) {
        localStorage.setItem("omeetso_language", "en");
      }
      const onboarded = localStorage.getItem("omeetso_onboarded");
      const user = localStorage.getItem("omeetso_user");
      const profile = localStorage.getItem("omeetso_profile");
      const location = localStorage.getItem("omeetso_location");

      if (!onboarded) return nav({ to: "/onboarding" });
      if (!user) return nav({ to: "/login" });
      if (!profile) return nav({ to: "/profile-setup" });
      if (!location) return nav({ to: "/location" });
      return nav({ to: "/home" });
    }, 2000);

    return () => {
      clearTimeout(t);
      clearTimeout(slow);
    };
  }, [nav, forcedState]);

  const retry = () => {
    if (typeof window !== "undefined") window.location.reload();
  };

  return (
    <MobileFrame>
      <div
        className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden text-white"
        style={{
          backgroundImage:
            "linear-gradient(160deg, #111E4D 0%, #1B2A79 45%, #3547D4 100%)",
          animation: "splash-bg-in 500ms ease-out both",
        }}
      >
        {/* Subtle ambient auras */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 20%, rgba(255,184,0,0.18) 0, transparent 40%), radial-gradient(circle at 85% 85%, rgba(77,107,255,0.35) 0, transparent 45%)",
          }}
        />

        <BackgroundMotif />

        {/* Non-normal states show a card and skip the sequence */}
        {state === "offline" && (
          <StateCard
            icon={<WifiOff className="h-6 w-6" />}
            title="You're offline"
            message="Check your internet connection to discover nearby stores and deals."
            action="Try Again"
            onAction={retry}
          />
        )}
        {state === "error" && (
          <StateCard
            icon={<ServerCrash className="h-6 w-6" />}
            title="Something went wrong"
            message="Our servers are taking a break. Please try again in a moment."
            action="Try Again"
            onAction={retry}
          />
        )}
        {state === "update" && (
          <StateCard
            icon={<DownloadCloud className="h-6 w-6" />}
            title="Update required"
            message="A new version of Omeetso is available. Please update to continue."
            action="Update Now"
            onAction={retry}
          />
        )}

        {(state === "normal" || state === "slow") && (
          <div className="relative z-10 flex flex-col items-center gap-5">
            {/* Ping rings behind logo */}
            <div className="relative grid place-items-center">
              <span
                className="pointer-events-none absolute h-40 w-40 rounded-full border border-white/15"
                style={{ animation: "splash-ping-ring 2.6s ease-out infinite" }}
              />
              <span
                className="pointer-events-none absolute h-40 w-40 rounded-full border border-yellow-brand/40"
                style={{ animation: "splash-ping-ring 2.6s ease-out 900ms infinite" }}
              />
              <div style={{ animation: "splash-logo-scale 900ms cubic-bezier(0.2,0.8,0.2,1) 100ms both" }}>
                <OmeetsoMark size={132} />
              </div>
            </div>

            {/* Wordmark */}
            <h1
              className="text-4xl font-semibold tracking-[-0.02em] text-white"
              style={{
                fontFamily: "'Poppins', sans-serif",
                animation: "splash-fade-up 600ms ease-out 1200ms both",
              }}
            >
              omeetso
            </h1>

            {/* Tagline */}
            <p
              className="-mt-3 text-sm font-medium text-white/80"
              style={{ animation: "splash-fade-up 600ms ease-out 1500ms both" }}
            >
              Buy Nearby. Sell Quickly.
            </p>

            {/* Dots */}
            <div
              className="mt-4 flex items-center gap-1.5"
              style={{ animation: "splash-fade-up 500ms ease-out 1800ms both" }}
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-2 w-2 rounded-full bg-yellow-brand"
                  style={{ animation: `splash-dot 1.2s ease-in-out ${i * 160}ms infinite` }}
                />
              ))}
            </div>

            {/* Loading message */}
            <p
              className="mt-1 text-xs text-white/70"
              style={{ animation: "splash-fade-up 500ms ease-out 2000ms both" }}
            >
              {state === "slow"
                ? "Still discovering… hang tight"
                : "Discovering what’s nearby…"}
            </p>
          </div>
        )}

        {/* Footer chip strip (subtle) */}
        <div
          className="absolute bottom-6 flex items-center gap-3 text-[10px] uppercase tracking-widest text-white/40"
          style={{ animation: "splash-fade-up 700ms ease-out 2100ms both" }}
        >
          <Home className="h-3 w-3" />
          <span className="h-1 w-1 rounded-full bg-white/30" />
          <Store className="h-3 w-3" />
          <span className="h-1 w-1 rounded-full bg-white/30" />
          <Package className="h-3 w-3" />
          <span className="h-1 w-1 rounded-full bg-white/30" />
          <Tag className="h-3 w-3" />
          <span className="h-1 w-1 rounded-full bg-white/30" />
          <MessageCircle className="h-3 w-3" />
          <span className="h-1 w-1 rounded-full bg-white/30" />
          <MapPin className="h-3 w-3" />
        </div>
      </div>
    </MobileFrame>
  );
}
