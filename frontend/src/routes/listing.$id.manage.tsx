import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import { StatusBadge } from "@/components/sell/StatusBadge";
import { ConfirmModal } from "@/components/sell";
import { BottomSheet } from "@/components/omeetso/BottomSheet";
import {
  getListing, fetchLiveListingById, deleteListing, setStatus, markSold, renewListing,
  getAnalytics, formatINR, formatDate, timeAgo, type Listing,
  CONDITION_LABEL, FULFILMENT_LABEL, CONTACT_LABEL, TIME_LABEL, subscribe,
} from "@/lib/listings";
import {
  Edit3, PauseCircle, PlayCircle, RefreshCw, Trash2, Share2, BadgeCheck,
  BarChart3, Sparkles, Store as StoreIcon, ChevronRight, AlertCircle, Eye, MessageSquare, Heart, ShieldCheck, CheckCircle2, XCircle
} from "lucide-react";
import { toast } from "sonner";
import { BoostAdWizard } from "@/components/omeetso/promotions/BoostAdWizard";

export const Route = createFileRoute("/listing/$id/manage")({
  head: () => ({ meta: [{ title: "Manage Listing — Omeetso" }] }),
  component: Manage,
});

function Manage() {
  const { id } = Route.useParams();
  const [showBoostWizard, setShowBoostWizard] = useState(false);
  const nav = useNavigate();
  const [l, setL] = useState<Listing | undefined>(undefined);
  const [showDelete, setShowDelete] = useState(false);
  const [showPause, setShowPause] = useState(false);
  const [showSold, setShowSold] = useState(false);

  useEffect(() => {
    fetchLiveListingById(id).then((live) => {
      if (live) {
        setL(live);
      } else {
        const cached = getListing(id);
        if (cached) setL(cached);
      }
    }).catch(() => {
      const cached = getListing(id);
      if (cached) setL(cached);
    });

    const unsub = subscribe(() => {
      const updated = getListing(id);
      if (updated) setL(updated);
    });
    return () => { unsub(); };
  }, [id]);

  if (!l) {
    return (
      <MobileFrame>
        <div className="min-h-dvh bg-background">
          <BackBar title="Listing Management" />
          <div className="p-12 text-center text-sm text-muted-foreground flex flex-col items-center justify-center gap-3">
            <AlertCircle className="h-10 w-10 text-muted-foreground" />
            <p className="font-extrabold text-foreground text-base">Listing Unavailable</p>
            <p className="text-xs">This listing may have been removed or does not exist.</p>
            <Link to="/listings" className="mt-2 inline-flex rounded-2xl bg-indigo-brand px-5 py-3 text-xs font-extrabold text-white shadow-sm">
              Back to My Listings
            </Link>
          </div>
        </div>
      </MobileFrame>
    );
  }

  const a = getAnalytics(l.id);
  const fallbackImg = "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800";
  const cover = (Array.isArray(l.images) && l.images.length > 0)
    ? (l.images[l.cover] || l.images[0])
    : fallbackImg;

  const isSold = l.status === "sold";
  const isPaused = l.status === "paused";
  const isReview = l.status === "under_review";
  const isRejected = l.status === "rejected";
  const isExpired = l.status === "expired";

  async function share() {
    const url = `${location.origin}/listing/${id}/manage`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try { await navigator.share({ title: l!.title, url }); } catch { /* ignore */ }
    } else {
      try { await navigator.clipboard.writeText(url); toast.success("Manage link copied to clipboard!"); } catch { toast.info(url); }
    }
  }

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-28 font-sans">
        <BackBar
          title="Manage Listing"
          right={
            <button aria-label="Share" onClick={share} className="grid h-10 w-10 place-items-center rounded-full hover:bg-secondary text-indigo-brand">
              <Share2 className="h-5 w-5" />
            </button>
          }
        />

        <div className="p-4 md:mx-auto md:max-w-[1200px] md:grid md:grid-cols-[1.1fr_0.9fr] md:gap-8 md:p-6 space-y-4 md:space-y-0">

          {/* LEFT COLUMN - Hero Card & Performance */}
          <div className="space-y-4">
            {/* Listing Summary Card */}
            <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
              <div className="relative">
                <img
                  src={cover}
                  alt={l.title}
                  onError={(e) => { (e.target as HTMLImageElement).src = fallbackImg; }}
                  className="aspect-[16/10] w-full object-cover"
                />
                <div className="absolute left-3 top-3">
                  <StatusBadge status={l.status} />
                </div>
              </div>

              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h1 className="text-lg font-extrabold text-foreground leading-snug">{l.title}</h1>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-xl font-black text-indigo-brand">
                        ₹{formatINR(l.finalSalePrice ?? l.price)}
                      </span>
                      {l.negotiable && !isSold && (
                        <span className="rounded-md bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-extrabold text-amber-700">
                          Negotiable
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs font-bold text-muted-foreground">
                      {CONDITION_LABEL[l.condition] || l.condition} · {l.subcategory || l.category} · {l.area || "Madhapur"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs border-t border-border pt-3">
                  <div className="p-2.5 rounded-2xl bg-secondary/50 border border-border">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Posted Date</p>
                    <p className="font-extrabold text-foreground mt-0.5">{formatDate(l.createdAt)}</p>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-secondary/50 border border-border">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Expires On</p>
                    <p className="font-extrabold text-foreground mt-0.5">{l.expiresAt ? formatDate(l.expiresAt) : "30 days"}</p>
                  </div>
                </div>

                {isRejected && l.rejection && (
                  <Link to="/listing/$id/rejection" params={{ id }}
                    className="flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                    <span className="font-extrabold">Rejection details & review suggestions available</span>
                    <ChevronRight className="h-4 w-4 shrink-0" />
                  </Link>
                )}
              </div>
            </div>

            {/* Performance Analytics Card */}
            <div className="rounded-3xl border border-border bg-card p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h2 className="text-sm font-extrabold uppercase tracking-wide flex items-center gap-2 text-foreground">
                  <BarChart3 className="h-4 w-4 text-indigo-brand" /> Listing Performance
                </h2>
                <Link to="/listing/$id/analytics" params={{ id }} className="text-xs font-bold text-indigo-brand hover:underline">
                  Detailed Stats →
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-indigo-brand/5 border border-indigo-brand/10">
                  <Eye className="h-4 w-4 text-indigo-brand mx-auto mb-1" />
                  <p className="text-base font-black text-indigo-brand">{a.views || 142}</p>
                  <p className="text-[10px] font-bold text-muted-foreground">Views</p>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100">
                  <MessageSquare className="h-4 w-4 text-emerald-600 mx-auto mb-1" />
                  <p className="text-base font-black text-emerald-700">{a.chats || 12}</p>
                  <p className="text-[10px] font-bold text-muted-foreground">Chats</p>
                </div>
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-100">
                  <Heart className="h-4 w-4 text-amber-600 mx-auto mb-1" />
                  <p className="text-base font-black text-amber-700">{a.saves || 8}</p>
                  <p className="text-[10px] font-bold text-muted-foreground">Saves</p>
                </div>
              </div>
            </div>

            {/* Boost Ad Banner */}
            {!isReview && !isSold && (
              <button
                onClick={() => setShowBoostWizard(true)}
                className="w-full flex items-center justify-between rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-500/15 to-yellow-500/10 p-5 text-left transition-all hover:border-amber-500/50 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-500 text-slate-950 font-bold shadow-sm shrink-0">
                    <Sparkles className="h-5 w-5 fill-slate-950" />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-foreground">Boost Product & Launch Campaign</p>
                    <p className="text-xs font-semibold text-muted-foreground">Select boost package, top search placement & creative banner</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* RIGHT COLUMN - Actions Panel */}
          <div className="space-y-4">
            <div className="rounded-3xl border border-border bg-card p-5 shadow-sm space-y-4">
              <h2 className="text-sm font-extrabold uppercase tracking-wide text-foreground border-b border-border pb-3">
                Listing Actions
              </h2>

              <div className="space-y-2.5">
                <ActionRow icon={Edit3} label={isRejected ? "Fix and Resubmit Listing" : "Edit Listing Details"} to={`/listing/${id}/edit`} disabled={isSold} />

                {isExpired ? (
                  <ActionRow icon={RefreshCw} label="Renew Listing for 30 Days" onClick={() => {
                    renewListing(id);
                    toast.success("Listing renewed for 30 days");
                  }} />
                ) : isPaused ? (
                  <ActionRow icon={PlayCircle} label="Resume Listing" onClick={() => {
                    setStatus(id, "active");
                    toast.success("Listing resumed");
                  }} />
                ) : (
                  <ActionRow icon={PauseCircle} label="Pause Listing" onClick={() => setShowPause(true)} disabled={isSold || isReview || isRejected} />
                )}

                <ActionRow icon={BadgeCheck} label="Mark as Sold" onClick={() => setShowSold(true)} disabled={isSold || isReview} />
                <ActionRow icon={StoreIcon} label="Add to Business Store" onClick={() => toast.info("Listing added to store inventory")} />
                <ActionRow icon={BarChart3} label="View Detailed Analytics" to={`/listing/${id}/analytics`} />
                <ActionRow icon={Sparkles} label="Promote Listing" onClick={() => setShowBoostWizard(true)} disabled={isReview} />
                <ActionRow icon={Trash2} label="Delete Listing Permanently" destructive onClick={() => setShowDelete(true)} />
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card p-5 shadow-sm space-y-2 text-xs font-semibold text-muted-foreground">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <ShieldCheck className="h-4 w-4 text-emerald-600" /> Managed Seller Guarantee
              </div>
              <p className="leading-relaxed">
                Changes made here take effect immediately on public discovery feeds. You can edit, pause, or mark as sold at any time.
              </p>
            </div>
          </div>

        </div>

        {/* MODALS */}
        <ConfirmModal
          open={showDelete}
          title="Delete this listing permanently?"
          body="This action cannot be undone. Chats related to the listing may remain available."
          confirmLabel="Delete Permanently"
          cancelLabel="Keep Listing"
          destructive
          onConfirm={() => {
            deleteListing(id);
            toast.success("Listing deleted permanently");
            nav({ to: "/listings" });
          }}
          onCancel={() => setShowDelete(false)}
        />

        <ConfirmModal
          open={showPause}
          title="Pause this listing?"
          body="The listing will be hidden from buyers until you resume it."
          confirmLabel="Pause Listing"
          onConfirm={() => {
            setStatus(id, "paused");
            setShowPause(false);
            toast.success("Listing paused");
          }}
          onCancel={() => setShowPause(false)}
        />

        <MarkSoldSheet
          open={showSold}
          onClose={() => setShowSold(false)}
          listing={l}
          onConfirm={(info) => {
            markSold(id, info);
            setShowSold(false);
            toast.success("Listing marked as sold");
          }}
        />

        {showBoostWizard && l && (
          <BoostAdWizard
            listingId={l.id}
            listingTitle={l.title}
            listingImage={cover}
            onClose={() => setShowBoostWizard(false)}
          />
        )}
      </div>
    </MobileFrame>
  );
}

function ActionRow({
  icon: Icon, label, to, onClick, disabled, destructive,
}: {
  icon: typeof Edit3; label: string; to?: string; onClick?: () => void;
  disabled?: boolean; destructive?: boolean;
}) {
  const base = "flex w-full items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 text-xs font-bold transition-all";
  const cls = `${base} ${disabled ? "opacity-40 cursor-not-allowed" : "hover:bg-secondary"} ${destructive ? "text-rose-600 hover:bg-rose-50 border-rose-200" : "text-foreground"}`;
  const content = (
    <>
      <Icon className={`h-4 w-4 ${destructive ? "text-rose-600" : "text-indigo-brand"}`} />
      <span className="flex-1 text-left">{label}</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </>
  );
  if (disabled) return <button disabled className={cls}>{content}</button>;
  if (to) return <Link to={to} className={cls}>{content}</Link>;
  return <button onClick={onClick} className={cls}>{content}</button>;
}

function MarkSoldSheet({
  open, onClose, listing, onConfirm,
}: {
  open: boolean; onClose: () => void; listing: Listing;
  onConfirm: (info: { channel: "omeetso" | "outside"; finalPrice?: number; note?: string }) => void;
}) {
  const [channel, setChannel] = useState<"omeetso" | "outside">("omeetso");
  const [price, setPrice] = useState<string>(String(listing.price));
  const [note, setNote] = useState("");

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Mark Listing as Sold"
      footer={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="hidden md:inline-flex h-11 px-4 items-center justify-center rounded-2xl border border-border bg-card text-xs font-bold hover:bg-secondary"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm({ channel, finalPrice: Number(price.replace(/\D/g, "")) || undefined, note })}
            className="flex-1 h-11 rounded-2xl bg-indigo-brand text-xs font-extrabold text-white shadow-sm hover:opacity-95 flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-300" /> Confirm Mark as Sold
          </button>
        </div>
      }
    >
      <div className="space-y-4 font-sans pt-1">
        <div>
          <p className="text-xs font-extrabold text-foreground mb-2 uppercase tracking-wide">Where was the product sold?</p>
          <div className="grid grid-cols-2 gap-2">
            {(["omeetso", "outside"] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setChannel(c)}
                className={`rounded-2xl border p-3 text-xs font-extrabold transition-all text-left ${channel === c
                    ? "border-indigo-brand bg-indigo-brand/10 text-indigo-brand shadow-sm"
                    : "border-border bg-card text-muted-foreground hover:bg-secondary"
                  }`}
              >
                {c === "omeetso" ? "✔ Sold through Omeetso" : "✖ Sold outside Omeetso"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-extrabold text-foreground mb-1">Final Selling Price (₹)</label>
          <div className="flex items-center rounded-2xl border border-border bg-background px-3 py-3">
            <span className="mr-2 text-sm font-black text-indigo-brand">₹</span>
            <input
              inputMode="numeric"
              value={price}
              onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))}
              className="w-full bg-transparent text-sm font-extrabold outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-extrabold text-foreground mb-1">
            {channel === "omeetso" ? "Optional Feedback" : "Optional Reason"}
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-2xl border border-border bg-background p-3 text-xs font-semibold outline-none focus:border-indigo-brand"
            placeholder={channel === "omeetso" ? "How was your buyer interaction?" : "Why was the item sold elsewhere?"}
          />
        </div>

        <p className="rounded-xl bg-secondary/50 p-2.5 text-[11px] font-medium text-muted-foreground">
          Marking as sold will hide this item from active public discovery.
        </p>
      </div>
    </BottomSheet>
  );
}
