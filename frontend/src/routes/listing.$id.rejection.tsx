import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import { getListing, formatDate, type Listing, subscribe } from "@/lib/listings";
import { AlertTriangle, ArrowRight, LifeBuoy } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/listing/$id/rejection")({
  head: () => ({ meta: [{ title: "Listing rejection details — Omeetso" }] }),
  component: Rejection,
});

function Rejection() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  const [l, setL] = useState<Listing | undefined>();
  useEffect(() => {
    setL(getListing(id));
    const unsub = subscribe(() => setL(getListing(id)));
    return () => { unsub; };
  }, [id]);

  if (!l || !l.rejection) return (
    <MobileFrame><div className="min-h-dvh bg-background"><BackBar title="Rejection details" />
      <p className="p-6 text-center text-sm text-muted-foreground">No rejection details available.</p></div></MobileFrame>
  );
  const r = l.rejection;

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-28">
        <BackBar title="Rejection details" />
        <div className="space-y-4 p-4">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              <p className="text-sm font-bold">Listing needs fixes before it can go live</p>
            </div>
            <p className="mt-1 text-xs text-red-800/80">Rejected on {formatDate(r.date)}</p>
          </div>

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
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Reason</p>
            <p className="mt-1">{r.reason}</p>
            <p className="mt-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">Affected section</p>
            <p className="mt-1">{r.section}</p>
            <p className="mt-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">Required correction</p>
            <p className="mt-1">{r.correction}</p>
            {r.policyRef && (
              <>
                <p className="mt-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">Policy reference</p>
                <p className="mt-1 text-xs text-muted-foreground">{r.policyRef}</p>
              </>
            )}
          </div>

          <button onClick={() => nav({ to: "/listing/$id/edit", params: { id } })}
            className="flex w-full items-center justify-between rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground">
            <span>Edit and Resubmit</span> <ArrowRight className="h-4 w-4" />
          </button>
          <button onClick={() => toast.info("Support chat is coming in a later phase")}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-semibold">
            <LifeBuoy className="h-4 w-4" /> Contact Support
          </button>
        </div>
      </div>
    </MobileFrame>
  );
}
