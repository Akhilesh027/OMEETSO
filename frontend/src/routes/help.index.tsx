import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import { HelpCircle, Search, LifeBuoy, ArrowRight, ShoppingCart, PackageCheck, Zap, ClipboardList, Store, MessagesSquare, HandCoins, Megaphone, Wallet, User, BadgeCheck, Shield } from "lucide-react";
import { FAQ_CATEGORIES } from "@/lib/faq";
import { listHelpRecent } from "@/lib/account";
import { POPULAR_FAQS } from "@/lib/faq";

export const Route = createFileRoute("/help/")({
  head: () => ({ meta: [
    { title: "Help Centre — Omeetso" },
    { name: "description", content: "Search Omeetso FAQs and get help with buying, selling, stores, promotions and payments." },
  ]}),
  component: HelpHome,
});

function HelpHome() {
  const recent = listHelpRecent();
  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-16">
        <BackBar title="Help Centre" right={<Link to="/support" className="text-xs font-semibold text-primary">My tickets</Link>} />
        <div className="px-4 pt-2 space-y-3">
          <Link to="/help/search"
            className="flex items-center gap-2 rounded-2xl border border-border bg-card px-3 py-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Search help articles…</span>
          </Link>

          {recent.length > 0 && (
            <div>
              <p className="mb-1.5 text-[11px] font-bold uppercase text-muted-foreground">Recent</p>
              <div className="flex flex-wrap gap-2">
                {recent.map((r) => (
                  <Link key={r} to="/help/search" search={{ q: r } as any}
                    className="rounded-full border border-border bg-card px-3 py-1 text-xs">{r}</Link>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="mb-1.5 text-[11px] font-bold uppercase text-muted-foreground">Popular</p>
            <div className="space-y-1 rounded-2xl bg-card card-elev">
              {POPULAR_FAQS.map((f) => (
                <Link key={f.id} to="/help/faq/$id" params={{ id: f.id }}
                  className="flex items-center justify-between border-b border-border px-4 py-3 last:border-b-0">
                  <p className="text-sm font-semibold">{f.title}</p>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-[11px] font-bold uppercase text-muted-foreground">Browse categories</p>
            <div className="grid grid-cols-2 gap-2">
              {FAQ_CATEGORIES.map((c) => (
                <Link key={c.id} to="/help/search" search={{ cat: c.id } as any}
                  className="rounded-2xl bg-card p-3 card-elev">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-primary">
                    <HelpCircle className="h-5 w-5" />
                  </div>
                  <p className="mt-2 text-sm font-bold">{c.label}</p>
                </Link>
              ))}
            </div>
          </div>

          <Link to="/support/new"
            className="mt-2 flex items-center justify-between rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground">
            <span className="inline-flex items-center gap-2"><LifeBuoy className="h-4 w-4" /> Contact support</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </MobileFrame>
  );
}
