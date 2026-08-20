import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import { formatINR, PRODUCTS } from "@/lib/mock";
import { CheckCircle2, MapPin, MessageCircle, Share2, ShieldCheck, XCircle, Loader2, User } from "lucide-react";
import { BottomSheet } from "@/components/omeetso/BottomSheet";
import { toast } from "sonner";
import { AttachmentSheet } from "@/components/omeetso/chat/AttachmentSheet";
import { getOfferByIdApi } from "@/api/chat.api";

export const Route = createFileRoute("/transaction/$offerId")({
  loader: ({ params }) => {
    return { offerId: params.offerId };
  },
  head: () => ({ meta: [{ title: "Transaction Settlement — Omeetso" }] }),
  component: Transaction,
  notFoundComponent: () => <MobileFrame><div className="p-8 text-center text-sm font-bold">Transaction not found.</div></MobileFrame>,
});

function Transaction() {
  const { offerId } = Route.useParams();
  const nav = useNavigate();
  const [offerData, setOfferData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [confirm, setConfirm] = useState(false);
  const [attach, setAttach] = useState(false);

  useEffect(() => {
    async function fetchOffer() {
      setLoading(true);
      setError(null);
      try {
        const res = await getOfferByIdApi(offerId);
        if (res.success && res.data) {
          setOfferData(res.data);
        } else {
          // Demo fallback
          setOfferData({
            id: offerId,
            conversationId: "conv_demo",
            amountInPaise: 5170000,
            status: "ACCEPTED",
            listing: {
              title: "LG 4K Smart TV / Laptop — High Performance, Low Use",
              priceInPaise: 5745400,
              image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800",
              area: "Madhapur, Hyderabad"
            },
            buyer: { name: "You (Buyer)" },
            seller: { name: "Bannu (Seller)" }
          });
        }
      } catch {
        setOfferData({
          id: offerId,
          conversationId: "conv_demo",
          amountInPaise: 5170000,
          status: "ACCEPTED",
          listing: {
            title: "LG 4K Smart TV / Laptop — High Performance, Low Use",
            priceInPaise: 5745400,
            image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800",
            area: "Madhapur, Hyderabad"
          },
          buyer: { name: "You (Buyer)" },
          seller: { name: "Bannu (Seller)" }
        });
      } finally {
        setLoading(false);
      }
    }

    fetchOffer();
  }, [offerId]);

  if (loading) {
    return (
      <MobileFrame>
        <div className="flex min-h-dvh flex-col items-center justify-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-brand" />
          <span className="text-xs font-bold text-muted-foreground">Loading transaction details…</span>
        </div>
      </MobileFrame>
    );
  }

  const o = offerData || {
    id: offerId,
    conversationId: "conv_demo",
    amountInPaise: 5170000,
    status: "ACCEPTED",
    listing: {
      title: "LG 4K Smart TV / Laptop — High Performance, Low Use",
      priceInPaise: 5745400,
      image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800",
      area: "Madhapur, Hyderabad"
    },
    buyer: { name: "You (Buyer)" },
    seller: { name: "Bannu (Seller)" }
  };

  const listing = o.listing;
  const fallbackImg = "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800";
  const displayImage = listing?.image || (listing as any)?.images?.[0] || fallbackImg;
  const displayTitle = listing?.title || "LG 4K Smart TV / Laptop — High Performance, Low Use";
  const agreedPrice = (o.amountInPaise || 5170000) / 100;

  const markCompleted = () => {
    toast.success("Transaction marked completed");
    setConfirm(false);
    setOfferData((prev: any) => ({ ...prev, status: "COMPLETED" }));
  };

  const notCompleted = () => {
    toast("Marked as not completed", { description: "The offer remains accepted." });
    setConfirm(false);
  };

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-16 font-sans">
        <BackBar title="Transaction Settlement" />

        <div className="p-4 md:mx-auto md:max-w-[700px] space-y-4">
          
          {/* Status banner */}
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-sm">
                <CheckCircle2 className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-base font-extrabold text-emerald-950">
                  {o.status === "COMPLETED" ? "Transaction Completed" : "Offer Agreed & Accepted"}
                </p>
                <p className="text-xs font-semibold text-emerald-800">
                  Coordinate item inspection & payment directly between buyer and seller.
                </p>
              </div>
            </div>
          </div>

          {/* Product & Price card */}
          <div className="flex items-center gap-4 rounded-3xl border border-border bg-card p-4 shadow-sm">
            <img
              src={displayImage}
              alt={displayTitle}
              onError={(e) => { (e.target as HTMLImageElement).src = fallbackImg; }}
              className="h-20 w-20 rounded-2xl object-cover border border-border shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-extrabold text-foreground leading-snug">{displayTitle}</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-xs font-bold text-muted-foreground">Agreed Price:</span>
                <span className="text-xl font-black text-indigo-brand">{formatINR(agreedPrice)}</span>
              </div>
            </div>
          </div>

          {/* Buyer & Seller Info */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-2xl border border-border bg-card p-3.5 shadow-sm">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">Buyer</p>
              <div className="mt-1 flex items-center gap-2">
                <div className="grid h-7 w-7 place-items-center rounded-full bg-secondary text-indigo-brand font-bold text-xs">
                  <User className="h-4 w-4" />
                </div>
                <p className="font-extrabold text-foreground text-xs truncate">{o.buyer?.name || "Buyer"}</p>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-3.5 shadow-sm">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">Seller</p>
              <div className="mt-1 flex items-center gap-2">
                <div className="grid h-7 w-7 place-items-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs">
                  <User className="h-4 w-4" />
                </div>
                <p className="font-extrabold text-foreground text-xs truncate">{o.seller?.name || "Bannu"}</p>
              </div>
            </div>
          </div>

          {/* Meeting Location */}
          <div className="rounded-3xl border border-border bg-card p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Meeting Area & Inspection</p>
              <span className="text-[10px] font-bold bg-indigo-brand/10 text-indigo-brand px-2 py-0.5 rounded-full">Safe Zone</span>
            </div>
            <div className="grid h-28 place-items-center rounded-2xl bg-gradient-to-br from-indigo-50 to-emerald-50 text-xs font-bold text-slate-800 border border-indigo-100">
              <div className="text-center p-3">
                <MapPin className="mx-auto h-6 w-6 text-indigo-brand mb-1" />
                <p className="text-xs font-extrabold">{listing?.area || "Hitec City / Madhapur, Hyderabad"}</p>
                <p className="text-[11px] text-muted-foreground font-semibold mt-0.5">Meet in a well-lit public area for live product inspection</p>
              </div>
            </div>
            <button
              onClick={() => setAttach(true)}
              className="w-full h-11 rounded-2xl border border-border bg-card text-xs font-bold text-foreground hover:bg-secondary transition-all flex items-center justify-center gap-1.5"
            >
              <Share2 className="h-4 w-4 text-indigo-brand" /> Share Exact Meeting Location in Chat
            </button>
          </div>

          {/* Actions */}
          <div className="space-y-2.5 pt-2">
            <Link
              to="/chat/$id"
              params={{ id: o.conversationId || "conv_demo" }}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-indigo-brand hover:opacity-95 text-sm font-extrabold text-white shadow-sm transition-all"
            >
              <MessageCircle className="h-4 w-4" /> Open Chat & Message Seller
            </Link>
            {o.status !== "COMPLETED" ? (
              <button
                onClick={() => setConfirm(true)}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card hover:bg-secondary text-sm font-extrabold text-foreground transition-all"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Mark Transaction Completed
              </button>
            ) : (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 text-center text-xs font-extrabold text-emerald-900 shadow-sm">
                ✔ Transaction completed successfully. Thank you for trading on Omeetso!
              </div>
            )}
          </div>

          {/* Safety Tip */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900 shadow-sm">
            <div className="flex items-center gap-1.5 font-extrabold">
              <ShieldCheck className="h-4 w-4 text-amber-700" /> Safe Trading Checklist
            </div>
            <p className="mt-1 text-[11px] font-semibold leading-relaxed text-amber-800">
              Inspect product functionality and verify physical condition before releasing payment. Omeetso staff will never ask for your account password or OTP.
            </p>
          </div>

        </div>

        <BottomSheet
          open={confirm}
          onClose={() => setConfirm(false)}
          title="Confirm Transaction Settlement"
          footer={
            <div className="grid grid-cols-2 gap-2">
              <button onClick={notCompleted} className="h-12 rounded-2xl border border-border text-xs font-extrabold text-destructive hover:bg-rose-50">
                <XCircle className="mr-1 inline h-4 w-4" /> Not Completed
              </button>
              <button onClick={markCompleted} className="h-12 rounded-2xl bg-emerald-600 text-xs font-extrabold text-white hover:bg-emerald-700">
                <CheckCircle2 className="mr-1 inline h-4 w-4" /> Yes, Completed
              </button>
            </div>
          }
        >
          <ul className="space-y-2 text-xs font-semibold text-muted-foreground p-1">
            <li className="flex items-center gap-2">• <span>Was the item inspected and handed over?</span></li>
            <li className="flex items-center gap-2">• <span>Was the agreed amount (₹{formatINR(agreedPrice)}) paid?</span></li>
            <li className="flex items-center gap-2">• <span>Was the transaction safe and satisfactory?</span></li>
          </ul>
        </BottomSheet>

        <AttachmentSheet open={attach} onClose={() => setAttach(false)} threadId={o.conversationId || "conv_demo"} />
      </div>
    </MobileFrame>
  );
}
