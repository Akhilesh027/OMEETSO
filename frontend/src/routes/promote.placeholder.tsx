import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import { Sparkles, Rocket, Target, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/promote/placeholder")({
  head: () => ({ meta: [{ title: "Promote your listing — Omeetso" }] }),
  component: Promote,
});

function Promote() {
  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-16">
        <BackBar title="Promote listing" />
        <div className="gradient-brand px-5 pt-8 pb-10 text-white">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15">
            <Sparkles className="h-7 w-7 text-yellow-brand" />
          </div>
          <h1 className="mt-3 text-xl font-extrabold">Reach more nearby buyers</h1>
          <p className="mt-1 text-sm text-white/80">
            Promotion options will be available in a later phase. Preview what's coming.
          </p>
        </div>
        <div className="space-y-3 p-4">
          {[
            { icon: Rocket, title: "Featured placement", body: "Surface at the top of home and category feeds for nearby buyers." },
            { icon: Target, title: "Boost in your area", body: "Prioritise your listing to buyers within 5–10 km." },
            { icon: TrendingUp, title: "Extended reach", body: "Expand visibility to buyers across the city." },
          ].map((c) => (
            <div key={c.title} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <c.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold">{c.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{c.body}</p>
                </div>
              </div>
            </div>
          ))}
          <p className="text-center text-[11px] text-muted-foreground">
            Payments and promotion campaigns are not enabled in this phase.
          </p>
          <Link to="/listings" className="mt-2 block rounded-full bg-primary px-4 py-3 text-center text-sm font-bold text-primary-foreground">
            Back to My Listings
          </Link>
        </div>
      </div>
    </MobileFrame>
  );
}
