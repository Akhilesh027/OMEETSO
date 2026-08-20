import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import { SectionTitle, Toggle } from "@/components/omeetso/account";
import { getAdPrefs, resetAdPrefs, setAdPrefs, subscribeAccount } from "@/lib/account";
import { RefreshCw, Info } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/settings/ad-preferences")({
  head: () => ({ meta: [{ title: "Advertisement preferences — Omeetso" }] }),
  component: AdPrefs,
});

function AdPrefs() {
  const [, setTick] = useState(0);
  useEffect(() => { const u = subscribeAccount(() => setTick((n) => n + 1)); return () => { u(); }; }, []);
  const p = getAdPrefs();

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-16">
        <BackBar title="Advertisement preferences" />
        <div className="px-4 pt-2">
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-3 text-[11px] text-blue-900">
            <Info className="mb-1 h-3.5 w-3.5" /> Ads may still appear when personalisation is turned off, but they will be less tailored to you.
          </div>

          <SectionTitle>Personalisation</SectionTitle>
          <div className="rounded-2xl bg-card p-3 card-elev space-y-1">
            <Toggle checked={p.personalised} onChange={(v) => setAdPrefs({ personalised: v })} label="Personalised advertisements" description="Use browsing signals to show relevant ads." />
            <Toggle checked={p.locationBased} onChange={(v) => setAdPrefs({ locationBased: v })} label="Location-based advertisements" description="Show ads based on your city and area." />
            <Toggle checked={p.categoryBased} onChange={(v) => setAdPrefs({ categoryBased: v })} label="Category-relevant advertisements" description="Match ads to categories you browse." />
            <Toggle checked={p.storePromotions} onChange={(v) => setAdPrefs({ storePromotions: v })} label="Store promotions" description="See boosted stores in your feed." />
            <Toggle checked={p.promotionalNotifications} onChange={(v) => setAdPrefs({ promotionalNotifications: v })} label="Promotional notifications" description="Get sponsored notifications in the Notifications screen." />
          </div>

          <SectionTitle>Hidden advertisements</SectionTitle>
          <div className="rounded-2xl bg-card p-3 card-elev text-xs">
            {p.hiddenAds.length === 0 ? (
              <p className="text-muted-foreground">You haven’t hidden any ads yet. Tap the close icon on an ad to hide it.</p>
            ) : (
              <ul className="space-y-1">
                {p.hiddenAds.map((id) => <li key={id} className="flex justify-between border-b border-border py-1 last:border-b-0"><span>{id}</span></li>)}
              </ul>
            )}
          </div>

          <button onClick={() => { resetAdPrefs(); toast.success("Advertisement preferences reset"); }}
            className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-full border border-border bg-card py-3 text-sm font-semibold">
            <RefreshCw className="h-4 w-4" /> Reset advertisement preferences
          </button>
        </div>
      </div>
    </MobileFrame>
  );
}
