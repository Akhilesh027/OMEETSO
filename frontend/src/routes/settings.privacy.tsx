import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import { SectionTitle, Toggle } from "@/components/omeetso/account";
import { getPrivacy, setPrivacy, subscribeAccount, type PrivacySettings } from "@/lib/account";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings/privacy")({
  head: () => ({ meta: [{ title: "Privacy settings — Omeetso" }] }),
  component: PrivacyPage,
});

const PROFILE_VIS = [
  { id: "public", label: "Public", desc: "Anyone can view your profile" },
  { id: "omeetso_only", label: "Omeetso users only", desc: "Only signed-in users see your profile" },
  { id: "limited", label: "Limited", desc: "Only shown to people you chat with" },
] as const;

const MOBILE_VIS = [
  { id: "hidden", label: "Hidden", desc: "Never show your mobile number" },
  { id: "after_chat", label: "Visible after chat starts", desc: "Once a conversation begins" },
  { id: "after_offer", label: "Visible after an accepted offer", desc: "Only to accepted buyers" },
  { id: "public_store", label: "Public for business store only", desc: "Shown on verified store profile" },
] as const;

const LOC_VIS = [
  { id: "area", label: "Area only", desc: "Show your area name" },
  { id: "area_distance", label: "Area and distance", desc: "Show area with approximate distance" },
  { id: "hidden", label: "Hidden from public profile", desc: "Do not show any location" },
] as const;

function PrivacyPage() {
  const [, setTick] = useState(0);
  useEffect(() => { const u = subscribeAccount(() => setTick((n) => n + 1)); return () => { u(); }; }, []);
  const p = getPrivacy();

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-16">
        <BackBar title="Privacy" />
        <div className="px-4 pt-2">
          <SectionTitle>Profile visibility</SectionTitle>
          <div className="space-y-1">
            {PROFILE_VIS.map((o) => (
              <Choice key={o.id} active={p.profileVisibility === o.id} onClick={() => setPrivacy({ profileVisibility: o.id })}
                label={o.label} desc={o.desc} />
            ))}
          </div>

          <SectionTitle>Mobile number visibility</SectionTitle>
          <div className="space-y-1">
            {MOBILE_VIS.map((o) => (
              <Choice key={o.id} active={p.mobileVisibility === o.id} onClick={() => setPrivacy({ mobileVisibility: o.id })}
                label={o.label} desc={o.desc} />
            ))}
          </div>

          <SectionTitle>Last-active status</SectionTitle>
          <div className="rounded-2xl bg-card p-3 card-elev">
            <Toggle checked={p.lastActive === "show"} onChange={(v) => setPrivacy({ lastActive: v ? "show" : "hide" })}
              label="Show last-active status" description="Buyers and sellers can see when you were last online." />
          </div>

          <SectionTitle>Location visibility</SectionTitle>
          <div className="space-y-1">
            {LOC_VIS.map((o) => (
              <Choice key={o.id} active={p.locationVisibility === o.id} onClick={() => setPrivacy({ locationVisibility: o.id })}
                label={o.label} desc={o.desc} />
            ))}
          </div>

          <SectionTitle>Personalisation</SectionTitle>
          <div className="space-y-1 rounded-2xl bg-card p-3 card-elev">
            <Toggle checked={p.productRecs} onChange={(v) => setPrivacy({ productRecs: v })} label="Product recommendations" description="Use recent activity to suggest products." />
            <Toggle checked={p.searchRecs} onChange={(v) => setPrivacy({ searchRecs: v })} label="Search recommendations" description="Refine search suggestions using your history." />
            <Toggle checked={p.storeSuggestions} onChange={(v) => setPrivacy({ storeSuggestions: v })} label="Store suggestions" description="Recommend nearby verified stores." />
          </div>
        </div>
      </div>
    </MobileFrame>
  );
}

function Choice({ active, onClick, label, desc }: { active: boolean; onClick: () => void; label: string; desc: string }) {
  return (
    <button onClick={onClick} aria-pressed={active}
      className={cn("flex w-full items-start gap-2 rounded-2xl border p-3 text-left",
        active ? "border-primary bg-primary/5" : "border-border bg-card")}>
      <span className={cn("mt-0.5 grid h-4 w-4 place-items-center rounded-full border",
        active ? "border-primary bg-primary" : "border-border")}>
        {active && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
      </span>
      <span className="min-w-0 flex-1">
        <p className="text-sm font-bold">{label}</p>
        <p className="text-[11px] text-muted-foreground">{desc}</p>
      </span>
    </button>
  );
}
