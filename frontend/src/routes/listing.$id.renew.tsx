import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import { getListing, renewListing, formatDate, type Listing, subscribe } from "@/lib/listings";
import { RefreshCw, Edit3 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/listing/$id/renew")({
  head: () => ({ meta: [{ title: "Renew listing — Omeetso" }] }),
  component: Renew,
});

function Renew() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  const [l, setL] = useState<Listing | undefined>();
  useEffect(() => {
    setL(getListing(id));
    const unsub = subscribe(() => setL(getListing(id)));
    return () => { unsub; };
  }, [id]);

  if (!l) return (
    <MobileFrame><div className="min-h-dvh bg-background"><BackBar title="Renew listing" />
      <p className="p-6 text-center text-sm text-muted-foreground">Listing not found.</p></div></MobileFrame>
  );

  const newExpiry = new Date(Date.now() + 30 * 24 * 3600 * 1000).getTime();

  function renew() {
    renewListing(id);
    toast.success("Listing renewed for 30 days");
    nav({ to: "/listing/$id/manage", params: { id } });
  }

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-28">
        <BackBar title="Renew listing" />
        <div className="space-y-4 p-4">
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex gap-3">
              {l.images[l.cover] && <img src={l.images[l.cover]} alt={l.title} className="h-16 w-16 rounded-xl object-cover" />}
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm font-bold">{l.title}</p>
                <p className="text-xs text-muted-foreground">{l.subcategory} · {l.area}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Previous expiry</span>
              <span className="font-semibold">{l.expiresAt ? formatDate(l.expiresAt) : "—"}</span>
            </div>
            <div className="mt-2 flex justify-between">
              <span className="text-muted-foreground">New expiry</span>
              <span className="font-semibold text-primary">{formatDate(newExpiry)}</span>
            </div>
          </div>

          <button onClick={renew} className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-bold text-primary-foreground">
            <RefreshCw className="h-4 w-4" /> Renew without changes
          </button>
          <Link to="/listing/$id/edit" params={{ id }} className="flex w-full items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-3 text-sm font-semibold">
            <Edit3 className="h-4 w-4" /> Edit before renewing
          </Link>
          <p className="text-center text-[11px] text-muted-foreground">Renewal is free during this phase.</p>
        </div>
      </div>
    </MobileFrame>
  );
}
