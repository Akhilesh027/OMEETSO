import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { Logo } from "@/components/omeetso/Logo";
import { Check, ArrowRight, Globe } from "lucide-react";

export const Route = createFileRoute("/language")({
  head: () => ({
    meta: [
      { title: "Choose your language — Omeetso" },
      { name: "description", content: "Pick your preferred language for Omeetso." },
    ],
  }),
  component: LanguageSelect,
});

type Lang = {
  code: string;
  name: string;
  native: string;
  hello: string;
};

const LANGS: Lang[] = [
  { code: "en", name: "English", native: "English", hello: "Hello" },
  { code: "te", name: "Telugu", native: "తెలుగు", hello: "నమస్కారం" },
  { code: "hi", name: "Hindi", native: "हिन्दी", hello: "नमस्ते" },
];

function LanguageSelect() {
  const nav = useNavigate();

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("omeetso_language", "en");
    }
    const onboarded = typeof window !== "undefined" && localStorage.getItem("omeetso_onboarded");
    nav({ to: onboarded ? "/home" : "/onboarding" });
  }, [nav]);

  return (
    <MobileFrame>
      <div className="relative flex min-h-dvh flex-col bg-background safe-t">
        {/* Hero */}
        <div
          className="relative overflow-hidden px-6 pb-10 pt-8 text-white"
          style={{ backgroundImage: "linear-gradient(160deg,#111E4D 0%,#1B2A79 55%,#3547D4 100%)" }}
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, rgba(255,184,0,0.18) 0, transparent 40%), radial-gradient(circle at 85% 90%, rgba(77,107,255,0.35) 0, transparent 45%)",
            }}
          />
          <div className="relative">
            <Logo mono />
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-yellow-brand backdrop-blur">
              <Globe className="h-3.5 w-3.5" /> Choose your language
            </div>
            <h1 className="mt-3 text-[26px] font-extrabold leading-tight">
              Welcome to Omeetso
            </h1>
            <p className="mt-1 text-sm text-white/80">
              Select a language you're comfortable with. You can change this later in Settings.
            </p>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 space-y-3 px-4 pt-5 pb-28">
          {LANGS.map((l) => {
            const active = selected === l.code;
            return (
              <button
                key={l.code}
                onClick={() => setSelected(l.code)}
                aria-pressed={active}
                aria-label={`Select ${l.name}`}
                className={`flex w-full items-center gap-4 rounded-2xl border-2 bg-card p-4 text-left transition ${
                  active
                    ? "border-navy shadow-[0_10px_30px_-15px_rgba(17,30,77,0.45)]"
                    : "border-border hover:border-navy/30"
                }`}
              >
                <div
                  className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl text-lg font-extrabold ${
                    active ? "bg-navy text-white" : "bg-muted text-navy"
                  }`}
                >
                  {l.code.toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-base font-bold text-foreground">
                    {l.native}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {l.name} · {l.hello}
                  </div>
                </div>
                <span
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 ${
                    active ? "border-navy bg-navy text-white" : "border-border bg-card"
                  }`}
                  aria-hidden
                >
                  {active && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                </span>
              </button>
            );
          })}

          <p className="pt-3 text-center text-xs text-muted-foreground">
            More languages coming soon.
          </p>
        </div>

        {/* Sticky CTA */}
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-card/95 px-4 pb-6 pt-3 backdrop-blur safe-b">
          <button
            onClick={cont}
            className="flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-navy text-sm font-bold text-white active:scale-[0.99]"
          >
            Continue <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </MobileFrame>
  );
}
