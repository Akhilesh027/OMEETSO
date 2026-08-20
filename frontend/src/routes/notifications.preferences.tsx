import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import { getNotifPrefs, setNotifChannel, setNotifPrefs, NOTIF_PREF_KEYS, subscribeAccount } from "@/lib/account";
import { SectionTitle, Toggle } from "@/components/omeetso/account";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/notifications/preferences")({
  head: () => ({ meta: [{ title: "Notification preferences — Omeetso" }] }),
  component: NotifPrefs,
});

const CHANNELS = [
  { key: "inApp", label: "In-app" },
  { key: "push", label: "Push" },
  { key: "email", label: "Email" },
  { key: "sms", label: "SMS" },
] as const;

function NotifPrefs() {
  const [, setTick] = useState(0);
  useEffect(() => { const u = subscribeAccount(() => setTick((n) => n + 1)); return () => { u(); }; }, []);
  const prefs = getNotifPrefs();

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-16">
        <BackBar title="Notification preferences" />

        <div className="px-4 pt-2">
          <div className="rounded-2xl bg-card p-3 card-elev">
            <Toggle checked={prefs.pauseNonEssential} onChange={(v) => setNotifPrefs({ pauseNonEssential: v })}
              label="Pause all non-essential notifications" description="Essential security and payment alerts still deliver." />
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">Push, email and SMS deliveries in this preview are placeholders and are not sent.</p>

          {NOTIF_PREF_KEYS.map((section) => (
            <div key={section.section}>
              <SectionTitle>{section.section}</SectionTitle>
              <div className="rounded-2xl bg-card p-2 card-elev">
                {section.items.map((it) => {
                  const ch = prefs.channels[it.key];
                  return (
                    <div key={it.key} className="border-b border-border py-2 last:border-b-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">{it.label}</p>
                        {it.essential && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">Essential</span>}
                      </div>
                      <div className="mt-2 grid grid-cols-4 gap-1">
                        {CHANNELS.map((c) => {
                          const disabled = !!it.essential && c.key === "inApp";
                          return (
                            <button key={c.key} disabled={disabled}
                              aria-pressed={ch[c.key]}
                              onClick={() => setNotifChannel(it.key, c.key, !ch[c.key])}
                              className={cn("rounded-full border px-2 py-1 text-[10px] font-bold uppercase",
                                ch[c.key] ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground",
                                disabled && "opacity-60")}>
                              {c.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </MobileFrame>
  );
}
