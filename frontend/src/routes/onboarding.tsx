import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React, { useEffect, useRef, useState } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import {
  MapPin, Zap, ShieldCheck, Camera, MessageCircle, Tag, Store,
  Sparkles, IndianRupee, Star, BadgeCheck,
} from "lucide-react";

export const Route = createFileRoute("/onboarding")({ component: Onboarding });

type Slide = {
  key: string;
  eyebrow: string;
  title: string;
  highlight: string;
  body: string;
  bg: string;
  accent: string;
  Scene: () => React.ReactElement;
};

const NearbyScene = () => (
  <div className="relative h-full w-full">
    {/* map grid */}
    <div
      className="absolute inset-0 opacity-70"
      style={{
        backgroundImage:
          "linear-gradient(rgba(77,107,255,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(77,107,255,0.18) 1px, transparent 1px)",
        backgroundSize: "26px 26px",
        maskImage: "radial-gradient(circle at 50% 55%, black 55%, transparent 85%)",
      }}
    />
    {/* winding road */}
    <svg viewBox="0 0 300 300" className="absolute inset-0 h-full w-full">
      <path
        d="M20 240 C 80 200, 90 140, 150 130 S 250 90, 280 40"
        fill="none"
        stroke="url(#road)"
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray="2 12"
      />
      <defs>
        <linearGradient id="road" x1="0" x2="1">
          <stop offset="0" stopColor="#4D6BFF" />
          <stop offset="1" stopColor="#FFB800" />
        </linearGradient>
      </defs>
    </svg>

    {/* radar pings */}
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
      <span className="absolute -inset-16 rounded-full bg-electric/30" style={{ animation: "ob-ping 2.4s ease-out infinite" }} />
      <span className="absolute -inset-16 rounded-full bg-electric/20" style={{ animation: "ob-ping 2.4s ease-out infinite", animationDelay: "0.8s" }} />
      <span className="absolute -inset-16 rounded-full bg-electric/10" style={{ animation: "ob-ping 2.4s ease-out infinite", animationDelay: "1.6s" }} />

      <div
        className="relative grid h-16 w-16 place-items-center rounded-full bg-white shadow-[0_10px_30px_rgba(17,30,77,0.25)]"
        style={{ animation: "ob-pin-drop 900ms cubic-bezier(.2,.9,.3,1.4) both" }}
      >
        <MapPin className="h-8 w-8 text-navy" strokeWidth={2.2} fill="#FFB800" />
      </div>
    </div>

    {/* orbit pins */}
    {[
      { top: "18%", left: "18%", label: "Camera", price: "₹4,200", d: "0.1s" },
      { top: "24%", right: "10%", label: "Sofa", price: "₹8,900", d: "0.35s" },
      { bottom: "22%", left: "12%", label: "Bike", price: "₹42k", d: "0.55s" },
      { bottom: "16%", right: "16%", label: "iPhone", price: "₹28k", d: "0.75s" },
    ].map((p, i) => (
      <div
        key={i}
        className="absolute rounded-xl bg-white px-2.5 py-1.5 text-[11px] font-semibold text-navy shadow-md"
        style={{ ...p, animation: `ob-pin-drop 700ms both`, animationDelay: p.d }}
      >
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-orange-brand" />
          {p.label}
          <span className="text-muted-foreground">· {p.price}</span>
        </div>
      </div>
    ))}
  </div>
);

const SellScene = () => (
  <div className="relative h-full w-full">
    {/* blob backdrop */}
    <div
      className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 bg-yellow-brand/30"
      style={{ animation: "ob-blob 8s ease-in-out infinite" }}
    />
    {/* phone frame with listing preview */}
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
      <div
        className="relative w-56 rounded-[2rem] border-4 border-navy bg-white p-2 shadow-[0_20px_50px_-15px_rgba(17,30,77,0.35)]"
        style={{ animation: "ob-float-y 4s ease-in-out infinite" }}
      >
        <div className="rounded-2xl bg-gradient-to-br from-orange-brand/90 to-yellow-brand p-4 text-white">
          <div className="flex items-center justify-between text-[10px] opacity-90">
            <span>New Listing</span>
            <Sparkles className="h-3 w-3" />
          </div>
          <div className="mt-6 grid place-items-center">
            <Camera className="h-10 w-10" strokeWidth={1.6} />
          </div>
          <div className="mt-6 flex items-center justify-between">
            <div>
              <div className="text-[10px] opacity-80">Selling</div>
              <div className="text-sm font-bold">DSLR Camera</div>
            </div>
            <div className="rounded-lg bg-white/20 px-2 py-1 text-xs font-bold">₹4,200</div>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-1.5 px-1 pb-1">
          <span className="h-1.5 flex-1 rounded-full bg-navy" />
          <span className="h-1.5 flex-1 rounded-full bg-navy" />
          <span className="h-1.5 flex-1 rounded-full bg-navy/30" />
          <span className="h-1.5 flex-1 rounded-full bg-navy/30" />
        </div>
        {/* shine */}
        <span
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2rem]"
          aria-hidden
        >
          <span
            className="absolute inset-y-0 -left-1/2 w-1/3 bg-white/40 blur-md"
            style={{ animation: "ob-shine 3.4s ease-in-out infinite" }}
          />
        </span>
      </div>

      {/* Flying cash */}
      {[0, 0.6, 1.2].map((d, i) => (
        <div
          key={i}
          className="absolute right-4 top-1/2 grid h-8 w-12 place-items-center rounded-md bg-success text-white shadow"
          style={{ animation: "ob-cash-fly 2.4s ease-out infinite", animationDelay: `${d}s` }}
        >
          <IndianRupee className="h-4 w-4" />
        </div>
      ))}

      {/* Timer badge */}
      <div
        className="absolute -left-6 -top-4 rounded-full bg-navy px-3 py-1.5 text-[11px] font-bold text-white shadow-lg"
        style={{ animation: "ob-float-y 3.2s ease-in-out infinite" }}
      >
        <span className="flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5 text-yellow-brand" fill="#FFB800" />
          &lt; 60 sec
        </span>
      </div>

      {/* Ping */}
      <div
        className="absolute -right-3 top-8 rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-navy shadow"
        style={{ animation: "ob-float-y 3s ease-in-out infinite", animationDelay: "0.4s" }}
      >
        <span className="flex items-center gap-1">
          <MessageCircle className="h-3 w-3 text-electric" /> 3 enquiries
        </span>
      </div>
    </div>
  </div>
);

const StoresScene = () => (
  <div className="relative h-full w-full">
    {/* aura */}
    <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-brand/20 blur-2xl" />

    {/* Store cards stack */}
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 space-y-3">
      {[
        { name: "Kukatpally Electronics", tag: "Verified · 4.8", Icon: Store, tint: "bg-electric text-white", d: "0s" },
        { name: "Madhapur Furniture Co.", tag: "Trusted · 2.1km", Icon: Tag, tint: "bg-yellow-brand text-navy", d: "0.15s" },
        { name: "Hitech Mobile Hub", tag: "Top Seller", Icon: BadgeCheck, tint: "bg-success text-white", d: "0.3s" },
      ].map((s, i) => (
        <div
          key={i}
          className="flex w-64 items-center gap-3 rounded-2xl bg-white p-3 shadow-[0_10px_30px_-15px_rgba(17,30,77,0.35)]"
          style={{ animation: "ob-slide-in 700ms both", animationDelay: s.d }}
        >
          <div className={`grid h-11 w-11 place-items-center rounded-xl ${s.tint}`}>
            <s.Icon className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-navy">{s.name}</div>
            <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
              <Star className="h-3 w-3 fill-yellow-brand text-yellow-brand" />
              {s.tag}
            </div>
          </div>
          <ShieldCheck className="h-5 w-5 text-success" />
        </div>
      ))}
    </div>

    {/* Floating verified tick */}
    <div
      className="absolute right-8 top-8 grid h-14 w-14 place-items-center rounded-2xl bg-navy text-white shadow-xl"
      style={{ animation: "ob-float-y 3s ease-in-out infinite" }}
    >
      <ShieldCheck className="h-7 w-7 text-yellow-brand" />
    </div>
    <div
      className="absolute left-6 bottom-10 grid h-12 w-12 place-items-center rounded-2xl bg-white text-orange-brand shadow-xl"
      style={{ animation: "ob-float-y 3.6s ease-in-out infinite", animationDelay: "0.4s" }}
    >
      <Sparkles className="h-6 w-6" />
    </div>
  </div>
);

const slides: Slide[] = [
  {
    key: "nearby",
    eyebrow: "Hyperlocal Discovery",
    title: "Find deals",
    highlight: "right around you",
    body: "Search by pincode or distance. Real people, real stores — within a few kilometres of your doorstep.",
    bg: "from-electric/15 via-white to-white",
    accent: "text-electric",
    Scene: NearbyScene,
  },
  {
    key: "sell",
    eyebrow: "Lightning Sell",
    title: "List anything",
    highlight: "in under 60 seconds",
    body: "Snap a photo, set a price, publish. Get chat and call enquiries from nearby buyers instantly.",
    bg: "from-yellow-brand/25 via-white to-white",
    accent: "text-orange-brand",
    Scene: SellScene,
  },
  {
    key: "trust",
    eyebrow: "Verified Locals",
    title: "Shop from stores",
    highlight: "you can trust",
    body: "Verified sellers, rated by your neighbourhood. Chat direct, no middlemen, no surprises.",
    bg: "from-indigo-brand/15 via-white to-white",
    accent: "text-indigo-brand",
    Scene: StoresScene,
  },
];

function Onboarding() {
  const [i, setI] = useState(0);
  const nav = useNavigate();
  const startX = useRef<number | null>(null);

  const finish = () => {
    if (typeof window !== "undefined") localStorage.setItem("omeetso_onboarded", "1");
    nav({ to: "/login" });
  };
  const next = () => (i < slides.length - 1 ? setI(i + 1) : finish());

  // auto-advance
  useEffect(() => {
    const t = setTimeout(() => {
      if (i < slides.length - 1) setI(i + 1);
    }, 5200);
    return () => clearTimeout(t);
  }, [i]);

  const s = slides[i];
  const Scene = s.Scene;

  const onTouchStart = (e: React.TouchEvent) => (startX.current = e.touches[0].clientX);
  const onTouchEnd = (e: React.TouchEvent) => {
    if (startX.current == null) return;
    const dx = e.changedTouches[0].clientX - startX.current;
    if (dx < -40) next();
    else if (dx > 40 && i > 0) setI(i - 1);
    startX.current = null;
  };

  return (
    <MobileFrame>
      <div
        className={`relative flex min-h-dvh flex-col bg-gradient-to-b ${s.bg} safe-t transition-colors duration-500`}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Top bar: progress + skip */}
        <div className="flex items-center gap-2 px-4 pt-4">
          {slides.map((_, idx) => (
            <div key={idx} className="h-1 flex-1 overflow-hidden rounded-full bg-navy/10">
              <div
                className="h-full bg-navy"
                style={{
                  width: idx < i ? "100%" : idx === i ? undefined : "0%",
                  animation: idx === i ? "ob-progress 5.2s linear forwards" : undefined,
                }}
              />
            </div>
          ))}
          <button onClick={finish} className="ml-2 text-xs font-semibold text-muted-foreground">
            Skip
          </button>
        </div>

        {/* Scene */}
        <div key={s.key} className="relative mx-4 mt-4 h-[46vh] overflow-hidden rounded-[2rem] border border-white/60 bg-white/40 backdrop-blur-sm">
          <Scene />
        </div>

        {/* Copy */}
        <div key={`t-${s.key}`} className="px-6 pt-6" style={{ animation: "ob-slide-in 500ms both" }}>
          <div className={`text-[11px] font-bold uppercase tracking-[0.18em] ${s.accent}`}>{s.eyebrow}</div>
          <h1 className="mt-2 text-[28px] font-extrabold leading-tight text-navy">
            {s.title} <span className={s.accent}>{s.highlight}</span>
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
        </div>

        {/* Marquee trust strip */}
        <div className="mt-auto overflow-hidden py-3">
          <div
            className="flex w-max gap-6 whitespace-nowrap text-[11px] font-semibold text-navy/60"
            style={{ animation: "ob-marquee 22s linear infinite" }}
          >
            {Array.from({ length: 2 }).map((_, k) => (
              <div key={k} className="flex items-center gap-6">
                <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-success" /> Verified sellers</span>
                <span>·</span>
                <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-electric" /> Hyperlocal</span>
                <span>·</span>
                <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-orange-brand" /> 60-sec listing</span>
                <span>·</span>
                <span className="flex items-center gap-1.5"><MessageCircle className="h-3.5 w-3.5 text-indigo-brand" /> Chat direct</span>
                <span>·</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="px-5 pb-6 safe-b">
          <button
            onClick={next}
            className="group relative h-14 w-full overflow-hidden rounded-2xl bg-navy text-sm font-bold text-white shadow-[0_12px_30px_-10px_rgba(17,30,77,0.55)] active:scale-[0.99]"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {i < slides.length - 1 ? "Continue" : "Get Started"}
              <span aria-hidden>→</span>
            </span>
            <span
              className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 bg-white/25 blur-md"
              style={{ animation: "ob-shine 2.8s ease-in-out infinite" }}
            />
          </button>
          <p className="mt-3 text-center text-[11px] text-muted-foreground">Swipe to explore · {i + 1} of {slides.length}</p>
        </div>
      </div>
    </MobileFrame>
  );
}
