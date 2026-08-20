import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import { getAppearance, setAppearance, applyAppearance, type Appearance } from "@/lib/account";
import { Sun, Moon, Monitor, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings/appearance")({
  head: () => ({ meta: [{ title: "Appearance — Omeetso" }] }),
  component: AppearancePage,
});

const OPTS: { id: Appearance; label: string; icon: any; desc: string }[] = [
  { id: "system", label: "System default", icon: Monitor, desc: "Match your device theme" },
  { id: "light", label: "Light", icon: Sun, desc: "Always bright" },
  { id: "dark", label: "Dark", icon: Moon, desc: "Easier on the eyes at night" },
];

function AppearancePage() {
  const [cur, setCur] = useState<Appearance>("system");
  useEffect(() => { setCur(getAppearance()); }, []);
  const choose = (v: Appearance) => { setCur(v); setAppearance(v); applyAppearance(v); toast.success(`Appearance: ${v}`); };
  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-16">
        <BackBar title="Appearance" />
        <div className="px-4 pt-2 space-y-2">
          {OPTS.map((o) => (
            <button key={o.id} onClick={() => choose(o.id)} aria-pressed={cur === o.id}
              className={cn("flex w-full items-center gap-3 rounded-2xl border p-3 text-left",
                cur === o.id ? "border-primary bg-primary/5" : "border-border bg-card")}>
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-primary"><o.icon className="h-5 w-5" /></div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold">{o.label}</p>
                <p className="text-[11px] text-muted-foreground">{o.desc}</p>
              </div>
              {cur === o.id && <Check className="h-4 w-4 text-primary" />}
            </button>
          ))}

          <div className="mt-4 rounded-2xl bg-card p-3 card-elev">
            <p className="text-[11px] font-bold uppercase text-muted-foreground">Preview</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-secondary p-3">
                <p className="text-xs font-bold">Product card</p>
                <p className="text-[11px] text-muted-foreground">₹11,000 · Madhapur</p>
              </div>
              <div className="rounded-xl gradient-brand p-3 text-white">
                <p className="text-xs font-bold">Sponsored</p>
                <p className="text-[11px] opacity-80">Local weekend deals</p>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">Advertisement, product cards and status colours stay readable in dark mode.</p>
        </div>
      </div>
    </MobileFrame>
  );
}
