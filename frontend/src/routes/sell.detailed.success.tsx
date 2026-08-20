import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BottomNav } from "@/components/omeetso/BottomNav";
import { getListing, formatDate } from "@/lib/listings";
import { CheckCircle2, Share2, Plus, FileEdit, Sparkles, ArrowRight, Package } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/sell/detailed/success")({
  head: () => ({ meta: [{ title: "Listing submitted — Omeetso" }] }),
  validateSearch: (s: Record<string, unknown>) => ({ id: (s.id as string) ?? "" }),
  component: Success,
});

function Success() {
  const { id } = useSearch({ from: "/sell/detailed/success" });
  const l = getListing(id);
  const share = async () => {
    const url = `${location.origin}/listing/${id}/manage`;
    if ((navigator as any).share) {
      try { await (navigator as any).share({ title: l?.title, url }); } catch { /* ignore */ }
    } else {
      try { await navigator.clipboard.writeText(url); toast.success("Link copied"); } catch { toast.info(url); }
    }
  };
  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-28">
        <div className="gradient-brand px-6 pt-10 pb-8 text-center text-white">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-white/15">
            <CheckCircle2 className="h-9 w-9 text-yellow-brand" />
          </div>
          <h1 className="mt-3 text-xl font-extrabold">Listing published for review</h1>
          <p className="mt-1 text-sm text-white/80">We're reviewing your detailed listing to keep Omeetso safe.</p>
        </div>
        <div className="-mt-4 rounded-t-3xl bg-background p-4">
          {l ? (
            <div className="mb-4 flex gap-3 rounded-2xl border border-border bg-card p-3">
              {l.images[l.cover] ? (
                <img src={l.images[l.cover]} alt={l.title} className="h-16 w-16 rounded-xl object-cover" />
              ) : (
                <div className="grid h-16 w-16 place-items-center rounded-xl bg-secondary"><Package className="h-5 w-5" /></div>
              )}
              <div className="min-w-0 flex-1 text-sm">
                <p className="line-clamp-1 font-bold">{l.title}</p>
                <p className="text-xs text-muted-foreground">Listing ID: {l.id}</p>
                <p className="text-xs text-muted-foreground">Submitted: {formatDate(l.createdAt)}</p>
                <p className="mt-1 text-xs font-semibold text-blue-700">Under Review — usually within 12 hours</p>
              </div>
            </div>
          ) : null}

          <div className="space-y-2">
            <Link to="/listing/$id/manage" params={{ id }}
              className="flex items-center justify-between rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground">
              <span>View Listing</span> <ArrowRight className="h-4 w-4" />
            </Link>
            <div className="grid grid-cols-2 gap-2">
              <Link to="/listing/$id/edit" params={{ id }}
                className="flex items-center justify-center gap-1.5 rounded-2xl border border-border bg-card px-3 py-3 text-xs font-semibold">
                <FileEdit className="h-4 w-4" /> Add More Details
              </Link>
              <button onClick={share}
                className="flex items-center justify-center gap-1.5 rounded-2xl border border-border bg-card px-3 py-3 text-xs font-semibold">
                <Share2 className="h-4 w-4" /> Share Listing
              </button>
              <Link to="/sell"
                className="flex items-center justify-center gap-1.5 rounded-2xl border border-border bg-card px-3 py-3 text-xs font-semibold">
                <Plus className="h-4 w-4" /> Post Another
              </Link>
              <Link to="/listings"
                className="flex items-center justify-center gap-1.5 rounded-2xl border border-border bg-card px-3 py-3 text-xs font-semibold">
                My Listings
              </Link>
            </div>

            <Link to="/promote/placeholder"
              className="mt-3 flex items-center justify-between rounded-2xl border border-yellow-brand/40 bg-yellow-brand/10 px-4 py-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-brand" />
                <div>
                  <p className="text-sm font-bold">Boost Listing</p>
                  <p className="text-[11px] text-muted-foreground">Reach more nearby buyers</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <BottomNav />
      </div>
    </MobileFrame>
  );
}
