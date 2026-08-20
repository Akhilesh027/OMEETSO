import { Link, useNavigate } from "@tanstack/react-router";
import { X, ShieldCheck, MapPin, Heart, MessageCircle, ArrowRight, Tag } from "lucide-react";
import { formatINR, type Product } from "@/lib/mock";
import { useSaved } from "@/hooks/useSaved";

interface ProductQuickPreviewModalProps {
  product: Product | null;
  onClose: () => void;
}

export function ProductQuickPreviewModal({ product, onClose }: ProductQuickPreviewModalProps) {
  const nav = useNavigate();
  const { saved, toggle } = useSaved(product?.id || "");

  if (!product) return null;

  const fallbackImg = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800";
  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : [product.image || fallbackImg];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 p-0 sm:p-4 backdrop-blur-sm transition-opacity animate-in fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-card p-5 shadow-2xl border border-border/80 overflow-hidden max-h-[90vh] overflow-y-auto no-scrollbar animate-in slide-in-from-bottom-6 sm:zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Controls */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            <Tag className="h-3.5 w-3.5" /> Quick View
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggle}
              aria-label="Save product"
              className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-foreground hover:bg-accent transition"
            >
              <Heart className={`h-4 w-4 ${saved ? "fill-orange-brand text-orange-brand" : ""}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close preview"
              className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-muted-foreground hover:text-foreground transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Main Product Image Carousel / Cover */}
        <div className="relative mt-4 overflow-hidden rounded-2xl bg-secondary aspect-[4/3]">
          <img
            src={images[0]}
            alt={product.title}
            onError={(e) => { (e.target as HTMLImageElement).src = fallbackImg; }}
            className="h-full w-full object-cover"
          />
          {product.verified && (
            <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-emerald-500 text-white px-3 py-1 text-xs font-bold shadow-md">
              <ShieldCheck className="h-3.5 w-3.5" /> Verified Listing
            </span>
          )}
        </div>

        {/* Info Content */}
        <div className="mt-4 space-y-3">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="text-2xl font-bold text-navy leading-none">
              {formatINR(product.price)}
            </h3>
            {product.negotiable && (
              <span className="rounded-full bg-amber-500/10 text-amber-700 border border-amber-500/20 px-2.5 py-0.5 text-xs font-semibold">
                Price Negotiable
              </span>
            )}
          </div>

          <h4 className="text-base font-semibold text-foreground leading-snug">
            {product.title}
          </h4>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 font-medium text-indigo-brand">
              <MapPin className="h-3.5 w-3.5" /> {product.area || "Nearby"} · {product.distanceKm || 1.2} km away
            </span>
            <span>•</span>
            <span>{product.condition || "Used - Good"}</span>
          </div>

          {/* Seller Preview */}
          <div className="flex items-center justify-between rounded-2xl bg-surface-2 p-3 border border-border">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
                {(product.sellerName || "S")[0].toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">{product.sellerName || "Verified Seller"}</p>
                <p className="text-[11px] text-muted-foreground">Member since 2024 • Quick Responder</p>
              </div>
            </div>
            <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              onClose();
              nav({ to: "/chat/$id", params: { id: product.id } as any });
            }}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-secondary py-3 text-sm font-bold text-navy hover:bg-accent transition"
          >
            <MessageCircle className="h-4 w-4" /> Chat Seller
          </button>

          <Link
            to="/product/$id"
            params={{ id: product.id }}
            onClick={onClose}
            className="inline-flex items-center justify-center gap-2 rounded-2xl gradient-brand py-3 text-sm font-bold text-white shadow-md hover:brightness-110 transition"
          >
            View Details <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
