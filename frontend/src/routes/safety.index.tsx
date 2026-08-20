import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import { AlertTriangle, ShoppingCart, PackageCheck, Store, CreditCard, ShieldAlert, MapPin, Flag, Phone, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/safety/")({
  head: () => ({ meta: [
    { title: "Safety Centre — Omeetso" },
    { name: "description", content: "Buy safely, sell safely, avoid fraud and report suspicious activity on Omeetso." },
  ]}),
  component: SafetyHome,
});

const TOPICS = [
  { id: "buying", label: "Buying safely", icon: ShoppingCart },
  { id: "selling", label: "Selling safely", icon: PackageCheck },
  { id: "store", label: "Store safety", icon: Store },
  { id: "payment", label: "Payment safety", icon: CreditCard },
  { id: "fraud", label: "Fraud prevention", icon: ShieldAlert },
  { id: "meeting", label: "Safe meeting guidance", icon: MapPin },
];

function SafetyHome() {
  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-16">
        <BackBar title="Safety Centre" />
        <div className="gradient-brand mx-4 mt-2 rounded-2xl p-4 text-white">
          <div className="flex items-center gap-2 text-yellow-brand">
            <AlertTriangle className="h-4 w-4" />
            <p className="text-[11px] font-bold uppercase tracking-wide">Important</p>
          </div>
          <p className="mt-1 text-sm font-bold">Omeetso never asks for your OTP, UPI PIN or banking password.</p>
          <p className="mt-1 text-[11px] text-white/80">For immediate danger, contact local emergency services. Omeetso support is not an emergency service.</p>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 px-4">
          {TOPICS.map((t) => (
            <Link key={t.id} to="/safety/$topic" params={{ topic: t.id }}
              className="rounded-2xl bg-card p-3 card-elev">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-primary"><t.icon className="h-5 w-5" /></div>
              <p className="mt-2 text-sm font-bold">{t.label}</p>
            </Link>
          ))}
        </div>

        <Link to="/safety/report"
          className="mx-4 mt-3 flex items-center justify-between rounded-2xl bg-rose-600 p-4 text-white">
          <div className="flex items-center gap-2">
            <Flag className="h-5 w-5" />
            <div>
              <p className="text-sm font-bold">Report suspicious activity</p>
              <p className="text-[11px] text-white/80">Scams, harassment, fake listings and more</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5" />
        </Link>

        <div className="mx-4 mt-3 rounded-2xl border border-border bg-card p-3 text-[11px]">
          <p className="flex items-center gap-1 font-bold"><Phone className="h-3.5 w-3.5" /> Emergency</p>
          <p className="mt-1 text-muted-foreground">If you feel unsafe, contact local emergency services. Do not rely on Omeetso for urgent responses.</p>
        </div>
      </div>
    </MobileFrame>
  );
}
