import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import {
  ArrowLeft, Heart, Share2, Phone, MessageCircle, HandCoins, ShieldCheck,
  MapPin, Flag, ChevronLeft, ChevronRight, Truck, Package, PackageCheck, Play, Star,
  Video, Camera, Maximize2, ArrowRight, Zap,
} from "lucide-react";

function getEmbedUrl(url: string) {
  if (!url) return "";
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    const idMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return idMatch ? `https://www.youtube.com/embed/${idMatch[1]}?autoplay=1&rel=0` : url;
  }
  return url;
}
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { ProductCard } from "@/components/omeetso/ProductCard";
import { SellerSummary } from "@/components/omeetso/SellerSummary";
import { ContextualAd } from "@/components/omeetso/AdBanner";
import { SafetyCard } from "@/components/omeetso/SafetyCard";
import { MakeOfferSheet } from "@/components/omeetso/chat/MakeOfferSheet";
import { isGuest } from "@/lib/chat";
import { startConversationApi } from "@/api/chat.api";
import { BottomSheet } from "@/components/omeetso/BottomSheet";
import { toast } from "sonner";
import { ReportSheet } from "@/components/omeetso/ReportSheet";
import { EmptyState } from "@/components/omeetso/EmptyState";
import { InfinityLoader } from "@/components/omeetso/InfinityLoader";
import {
  PRODUCTS, SELLERS, formatINR, getProduct, getSeller, getAd, productsBySeller, productsByCategory,
} from "@/lib/mock";
import { fetchLiveListingById, recordListingView } from "@/lib/listings";
import { addRecentlyViewed } from "@/lib/saved";
import { useSaved } from "@/hooks/useSaved";
import { ProductWatermark } from "@/components/omeetso/Watermark";

export const Route = createFileRoute("/product/$id")({
  loader: async ({ params }) => {
    let p = getProduct(params.id);
    if (!p) {
      try {
        const live = await fetchLiveListingById(params.id);
        if (live) p = live as any;
      } catch (err) {
        console.warn("Live listing fetch error:", err);
      }
    }
    return { product: p || null };
  },
  head: ({ loaderData }) => {
    const product = loaderData?.product;
    if (!product) return { meta: [{ title: "Product · Omeetso" }] };

    const coverIdx = product.cover || product.coverIndex || 0;
    const rawImg = (Array.isArray(product.images) && product.images.length > 0)
      ? (product.images[coverIdx] || product.images[0])
      : (product.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&h=630&fit=crop&q=85");

    const imgUrl = rawImg.startsWith("http://") || rawImg.startsWith("https://")
      ? rawImg
      : `https://omeetso.in${rawImg.startsWith("/") ? "" : "/"}${rawImg}`;

    const priceText = product.price ? `₹${Number(product.price).toLocaleString("en-IN")}` : "";
    const title = `${product.title}${priceText ? ` · ${priceText}` : ""} | Omeetso`;
    const description = product.description
      ? (product.description.length > 200 ? `${product.description.slice(0, 197)}...` : product.description)
      : `Buy ${product.title} on Omeetso hyperlocal marketplace.`;

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:type", content: "product" },
        { property: "og:site_name", content: "Omeetso" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:image", content: imgUrl },
        { property: "og:image:secure_url", content: imgUrl },
        { property: "og:image:alt", content: product.title },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: imgUrl },
        { name: "twitter:image:alt", content: product.title },
      ],
    };
  },
  pendingComponent: () => (
    <MobileFrame>
      <InfinityLoader
        variant="page"
        size="lg"
        text="Loading product details..."
        subtext="Fetching live verified listing information"
      />
    </MobileFrame>
  ),
  component: ProductPage,
  notFoundComponent: NotFound,
});

function FormattedDescription({ text }: { text?: string }) {
  if (!text) return null;
  const lines = text.split("\n");

  return (
    <div className="mt-2 space-y-1.5 text-xs md:text-sm text-foreground/90 leading-relaxed font-sans bg-card border border-border p-4 rounded-2xl shadow-xs">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;

        const parts = trimmed.split(/(\*\*.*?\*\*)/g);
        const parsedContent = parts.map((part, i) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return (
              <strong key={i} className="font-extrabold text-foreground">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return part;
        });

        if (trimmed.startsWith("•") || trimmed.startsWith("-") || trimmed.startsWith("✔")) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span className="text-blue-600 dark:text-blue-400 font-black text-xs leading-tight shrink-0">{trimmed.charAt(0)}</span>
              <div className="flex-1">{parsedContent}</div>
            </div>
          );
        }

        return (
          <p key={idx} className="leading-snug">
            {parsedContent}
          </p>
        );
      })}
    </div>
  );
}

function ProductPage() {
  const { id } = Route.useParams();
  const loaderData = Route.useLoaderData();
  const [product, setProduct] = useState<any>(() => getProduct(id) || loaderData?.product || null);

  useEffect(() => {
    if (id) recordListingView(id);
    const local = getProduct(id);
    if (local) {
      setProduct(local);
    }

    fetchLiveListingById(id).then((live) => {
      if (live) {
        setProduct(live);
      }
    }).catch((err) => {
      console.warn("Live fetch error on client nav:", err);
    });
  }, [id]);

  if (!product) {
    return (
      <MobileFrame>
        <div className="min-h-dvh bg-background p-12 text-center flex flex-col items-center justify-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto" />
          <p className="text-xs font-bold text-muted-foreground">Loading product details…</p>
        </div>
      </MobileFrame>
    );
  }

  const liveSeller = (product as any).seller;
  const realSellerId = liveSeller?._id || liveSeller?.id || (typeof product.sellerId === "object" ? (product.sellerId as any)?._id || (product.sellerId as any)?.id : product.sellerId) || (product as any).seller || "u_seller";
  const mockSeller = typeof realSellerId === "string" ? getSeller(realSellerId) : null;

  // Accurate listing & seller location:
  // For the product page, the inspection / item location prioritizes the listing's actual area (e.g. Trimulgherry)
  // rather than a stale or default user area.
  const actualSellerArea = 
    product.area ||
    (liveSeller?.area && liveSeller.area !== "Madhapur" ? liveSeller.area : null) ||
    (liveSeller?.profile?.area && liveSeller.profile.area !== "Madhapur" ? liveSeller.profile.area : null) ||
    product.city ||
    liveSeller?.city ||
    liveSeller?.profile?.city ||
    "Hyderabad";

  // Extract accurate live seller rating; default to 0 if unrated (avoiding fabricated 4.8 / 12 reviews)
  const rawRating = 
    (typeof liveSeller?.ratings?.average === "number" && liveSeller.ratings.average > 0 ? liveSeller.ratings.average : null) ??
    (typeof (product as any).sellerRating === "number" && (product as any).sellerRating > 0 ? (product as any).sellerRating : null) ??
    (typeof (product as any).rating === "number" && (product as any).rating > 0 ? (product as any).rating : null) ??
    0;

  const rawReviews = 
    (typeof liveSeller?.ratings?.count === "number" && liveSeller.ratings.count > 0 ? liveSeller.ratings.count : null) ??
    (typeof (product as any).sellerReviews === "number" && (product as any).sellerReviews > 0 ? (product as any).sellerReviews : null) ??
    (typeof (product as any).reviewCount === "number" && (product as any).reviewCount > 0 ? (product as any).reviewCount : null) ??
    0;

  const defaultSeller = {
    id: String(realSellerId),
    name: (product as any).businessName || liveSeller?.businessName || liveSeller?.name || liveSeller?.profile?.name || product.sellerName || "Omeetso Seller",
    businessName: (product as any).businessName || liveSeller?.businessName || (product as any).storeName || liveSeller?.profile?.businessName,
    ownerName: (product as any).sellerOwnerName || liveSeller?.ownerName || liveSeller?.profile?.name,
    avatar: liveSeller?.avatar || liveSeller?.profile?.avatar || (product as any).sellerAvatar || (product as any).sellerPhoto,
    memberSince: liveSeller?.createdAt || liveSeller?.memberSince || (product as any).createdAt || 0,
    rating: rawRating,
    reviews: rawReviews,
    responseTime: liveSeller?.responseTime || (product as any).sellerResponseTime || "Within 15 min",
    verified: Boolean(liveSeller?.verificationSummary?.mobileVerified || liveSeller?.verificationSummary?.identityVerified || (product as any).verified),
    phoneVerified: Boolean(liveSeller?.verificationSummary?.mobileVerified || (product as any).phoneVerified),
    kycVerified: Boolean(liveSeller?.verificationSummary?.govtIdVerified || liveSeller?.verificationSummary?.identityVerified || (product as any).kycVerified),
    type: ((product as any).sellerType || liveSeller?.type || liveSeller?.accountType || ((product as any).businessName ? "business" : undefined) || "individual") as "individual" | "business",
    area: actualSellerArea,
    city: product.city || liveSeller?.city || liveSeller?.profile?.city || "Hyderabad",
    activeListings: typeof liveSeller?.activeListingsCount === "number" ? liveSeller.activeListingsCount : 1,
  };
  const seller = defaultSeller;
  const contextualAd = getAd("PRODUCT_CONTEXTUAL", product.category) ?? getAd("PRODUCT_CONTEXTUAL");
  const similar = productsByCategory(product.category).filter((p) => p.id !== product.id).slice(0, 4);
  const otherListings = productsBySeller(seller.id).filter((p) => p.id !== product.id).length;
  const { saved, toggle } = useSaved(product.id);
  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images.filter((im: string) => im && !im.startsWith("blob:"))
    : [product.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400"];
  const displayImages = images.length > 0 ? images : ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400"];
  const [idx, setIdx] = useState(0);
  const [offerOpen, setOfferOpen] = useState(false);
  const [offerAmount, setOfferAmount] = useState<string>("");
  const [reportOpen, setReportOpen] = useState(false);
  const [guestOpen, setGuestOpen] = useState(false);
  const nav = useNavigate();

  const isNegotiable = Boolean(
    !product?.free &&
    (product?.negotiable === true || product?.negotiable === "true" || product?.pricingType === "NEGOTIABLE" || product?.pricingType === "negotiable") &&
    product?.negotiable !== false &&
    product?.negotiable !== "false" &&
    product?.pricingType !== "FIXED" &&
    product?.pricingType !== "fixed"
  );

  useEffect(() => { if (product?.id) addRecentlyViewed(product.id); }, [product?.id]);

  if (product.sold || product.unavailable) {
    return (
      <MobileFrame>
        <div className="min-h-dvh bg-background pb-8">
          <TopHeader saved={saved} onSave={toggle} onShare={() => share(product.title)} />
          <div className="p-8 text-center">
            <img src={product.image} alt={product.title} className="mx-auto h-48 w-full max-w-xs rounded-2xl object-cover opacity-60" />
            <h1 className="mt-4 text-lg font-bold">This product is no longer available</h1>
            <p className="mt-1 text-sm text-muted-foreground">The listing has been sold or removed by the seller.</p>
            <Link
              to="/results"
              search={{ cat: product.category } as never}
              className="mt-6 inline-flex rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-700"
            >
              View Similar Products
            </Link>
          </div>
        </div>
      </MobileFrame>
    );
  }

  const getShareDetails = () => {
    const rawCover = (displayImages && displayImages[0]) || product.image || "";
    const coverUrl = rawCover
      ? (rawCover.startsWith("http") ? rawCover : `${typeof window !== "undefined" ? window.location.origin : ""}${rawCover.startsWith("/") ? "" : "/"}${rawCover}`)
      : "";

    let shareUrl = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (typeof window !== "undefined") {
        const u = new URL(window.location.href);
        if (coverUrl && !u.searchParams.has("img")) {
          u.searchParams.set("img", coverUrl);
        }
        if (product.price && !u.searchParams.has("price")) {
          u.searchParams.set("price", String(product.price));
        }
        shareUrl = u.toString();
      }
    } catch {
      // fallback
    }

    const priceText = product.price ? ` · ₹${Number(product.price).toLocaleString("en-IN")}` : "";
    const shareTitle = `${product.title}${priceText}`;
    const shareText = `Check out "${product.title}"${priceText} on Omeetso Hyperlocal Marketplace:\n${shareUrl}`;

    return { coverUrl, shareUrl, shareTitle, shareText };
  };

  const share = async (title: string) => {
    const { coverUrl, shareUrl, shareTitle, shareText } = getShareDetails();

    // 1. Try Native Web Share with photo file attachment (WhatsApp displays actual product photo!)
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        if (coverUrl && typeof navigator.canShare === "function") {
          try {
            const imgRes = await fetch(coverUrl, { mode: "cors" });
            if (imgRes.ok) {
              const blob = await imgRes.blob();
              const safeName = `${title.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 20) || "product"}.jpg`;
              const file = new File([blob], safeName, { type: blob.type || "image/jpeg" });
              if (navigator.canShare({ files: [file] })) {
                await navigator.share({
                  title: shareTitle,
                  text: shareText,
                  files: [file]
                });
                return;
              }
            }
          } catch {
            // fallback to standard share
          }
        }
        await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
        return;
      } catch {
        /* user dismissed or fallback */
      }
    }

    // 2. Fallback: Copy to clipboard
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toastCopy();
      } catch { /* ignore */ }
    }
  };

  const shareToWhatsApp = () => {
    const { shareUrl, shareTitle } = getShareDetails();
    const msg = encodeURIComponent(`Check out *${shareTitle}* on Omeetso:\n${shareUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${msg}`, "_blank");
  };

  const videoUrl = product.videoUrl || product.video;
  const rawCandidatePhone = 
    product.sellerPhone || 
    product.whatsappPhone || 
    liveSeller?.phone || 
    liveSeller?.mobile || 
    liveSeller?.profile?.phone || 
    (product.seller as any)?.phone || 
    mockSeller?.phone || 
    "";
  const cleanPhoneDigits = rawCandidatePhone.replace(/\D/g, "");
  const callablePhone = cleanPhoneDigits.length === 10
    ? `+91${cleanPhoneDigits}`
    : (cleanPhoneDigits.length === 12 && cleanPhoneDigits.startsWith("91"))
      ? `+${cleanPhoneDigits}`
      : cleanPhoneDigits.length >= 10
        ? `+${cleanPhoneDigits}`
        : "";

  const cleanWa = cleanPhoneDigits;
  const waPhone = cleanWa.length === 10 ? `91${cleanWa}` : (cleanWa.length === 12 && cleanWa.startsWith("91") ? cleanWa : cleanWa);
  const waText = encodeURIComponent(`Hi, I'm interested in your Omeetso listing: ${product.title}`);
  const waLink = waPhone && waPhone.length >= 10 ? `https://wa.me/${waPhone}?text=${waText}` : null;

  const handleCallClick = (e: React.MouseEvent) => {
    if (!callablePhone) {
      e.preventDefault();
      toast.info("Seller has not provided a direct calling number. Please use Chat or WhatsApp.", {
        action: {
          label: "Chat Now",
          onClick: async () => {
            if (isGuest()) { setGuestOpen(true); return; }
            try {
              const res = await startConversationApi("LISTING", product.id);
              if (res.success && res.data?.id) {
                nav({ to: "/chat/$id", params: { id: res.data.id } });
              }
            } catch {}
          }
        }
      });
      return;
    }
    window.location.href = `tel:${callablePhone}`;
  };

  type MediaItem = {
    type: "image" | "video";
    url: string;
    thumbnail: string;
    label: string;
  };

  const mediaItems: MediaItem[] = useMemo(() => {
    const list: MediaItem[] = displayImages.map((img: string, i: number) => ({
      type: "image" as const,
      url: img,
      thumbnail: img,
      label: `Photo ${i + 1}`,
    }));

    if (videoUrl) {
      const videoItem: MediaItem = {
        type: "video" as const,
        url: videoUrl,
        thumbnail: displayImages[0] || "",
        label: "Product Video",
      };
      if (list.length > 1) {
        list.splice(1, 0, videoItem);
      } else {
        list.push(videoItem);
      }
    }
    return list;
  }, [displayImages, videoUrl]);

  const activeMediaIndex = Math.min(Math.max(idx, 0), Math.max(mediaItems.length - 1, 0));
  const currentMedia = mediaItems[activeMediaIndex] || mediaItems[0];

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-24 md:pb-16 font-sans">
        <div className="md:hidden">
          <TopHeader saved={saved} onSave={toggle} onShare={() => share(product.title)} />
        </div>
        <div className="hidden md:block border-b border-border bg-card">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-4 text-xs text-muted-foreground">
            <Link to="/home" className="hover:text-blue-600 transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/results" search={{ cat: product.category } as never} className="hover:text-blue-600 transition-colors">{product.category}</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground font-semibold truncate">{product.title}</span>
          </div>
        </div>

        <div className="px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 md:mx-auto md:max-w-[1440px] md:grid md:grid-cols-[1.2fr_1fr] md:gap-8 md:py-6">
        <div>

        {/* Gallery */}
        <div className="relative">
          {currentMedia?.type === "video" ? (
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-black border border-border/80 shadow-xs md:rounded-3xl flex items-center justify-center">
              {currentMedia.url.includes("youtube.com") || currentMedia.url.includes("youtu.be") ? (
                <iframe
                  src={getEmbedUrl(currentMedia.url)}
                  className="h-full w-full object-cover"
                  title="Product Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={currentMedia.url}
                  controls
                  autoPlay
                  playsInline
                  poster={displayImages[0]}
                  className="h-full w-full object-contain"
                />
              )}
              <div className="pointer-events-none absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-slate-950/80 border border-white/20 px-3 py-1 text-[11px] font-bold text-amber-300 backdrop-blur-md shadow-xs">
                <Play className="h-3 w-3 fill-amber-300" /> Playing Video
              </div>
            </div>
          ) : (
            <Link
              to="/gallery/$id"
              params={{ id: product.id }}
              search={{ i: String(displayImages.indexOf(currentMedia.url) >= 0 ? displayImages.indexOf(currentMedia.url) : 0) } as never}
              aria-label="Open full-screen gallery"
              className="block group relative"
            >
              <img
                src={currentMedia.url}
                alt={product.title}
                onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800"; }}
                className="aspect-[4/3] w-full rounded-2xl object-cover border border-border/80 shadow-xs md:rounded-3xl"
              />
              <span className="absolute top-3 right-3 grid h-8 w-8 place-items-center rounded-full bg-slate-950/60 border border-white/20 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                <Maximize2 className="h-4 w-4" />
              </span>
            </Link>
          )}

          {mediaItems.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIdx((i) => (i - 1 + mediaItems.length) % mediaItems.length);
                }}
                aria-label="Previous media"
                className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-card/90 border border-border text-foreground shadow-md transition-all hover:bg-card hover:scale-105 cursor-pointer"
              >
                <ChevronLeft className="h-5 w-5 -ml-0.5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIdx((i) => (i + 1) % mediaItems.length);
                }}
                aria-label="Next media"
                className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-card/90 border border-border text-foreground shadow-md transition-all hover:bg-card hover:scale-105 cursor-pointer"
              >
                <ChevronRight className="h-5 w-5 -mr-0.5" />
              </button>
            </>
          )}

          {currentMedia?.type !== "video" && (
            <ProductWatermark size="md" position="bottom-right" className="bottom-12 right-3 md:bottom-14 md:right-4" />
          )}

          <span className="absolute bottom-3 right-3 rounded-full bg-slate-950/80 border border-white/20 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-sm shadow-xs">
            {activeMediaIndex + 1}/{mediaItems.length}
          </span>
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-slate-950/80 border border-white/20 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm shadow-xs">
            {currentMedia?.type === "video" ? (
              <>
                <Video className="h-3 w-3 text-amber-400" /> Product Video
              </>
            ) : (
              <>
                <Camera className="h-3 w-3 text-blue-400" /> {displayImages.length} Photos {videoUrl ? "+ 1 Video" : ""}
              </>
            )}
          </span>
        </div>

        {mediaItems.length > 1 && (
          <div className="mt-3 flex gap-2.5 overflow-x-auto no-scrollbar px-1 py-1">
            {mediaItems.map((item, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                aria-label={item.label}
                className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                  i === activeMediaIndex
                    ? "border-blue-600 ring-2 ring-blue-500/30 scale-105 shadow-sm"
                    : "border-border/80 opacity-70 hover:opacity-100"
                }`}
              >
                {item.type === "video" ? (
                  <div className="relative h-full w-full bg-slate-950">
                    <img
                      src={item.thumbnail || displayImages[0]}
                      alt="Product Video Thumbnail"
                      className="h-full w-full object-cover brightness-50"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
                      <div className="grid h-6 w-6 place-items-center rounded-full bg-amber-500 text-slate-950 shadow-md">
                        <Play className="h-3 w-3 fill-slate-950 ml-0.5" />
                      </div>
                      <span className="mt-0.5 text-[8px] font-black uppercase tracking-wider text-white">
                        VIDEO
                      </span>
                    </div>
                  </div>
                ) : (
                  <img src={item.url} alt={`Product photo ${i + 1}`} className="h-full w-full object-cover" />
                )}
              </button>
            ))}
          </div>
        )}

        <div className="space-y-5 p-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-3xl sm:text-4xl font-black text-slate-950 dark:text-white leading-none">{formatINR(product.price)}</p>
              {isNegotiable ? (
                <span className="rounded-full bg-blue-500/10 border border-blue-500/30 px-3 py-0.5 text-xs font-extrabold text-blue-700 dark:text-blue-300">
                  Negotiable Price
                </span>
              ) : (
                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-0.5 text-xs font-extrabold text-emerald-700 dark:text-emerald-300">
                  Fixed Price
                </span>
              )}
              {product.verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 border border-blue-500/30 px-3 py-0.5 text-xs font-extrabold text-blue-700 dark:text-blue-300">
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-600" /> Verified Seller
                </span>
              )}
            </div>
            <h1 className="mt-2.5 text-lg sm:text-xl font-extrabold text-foreground leading-snug">{product.title}</h1>
            <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground font-medium">
              <MapPin className="h-3.5 w-3.5 text-blue-600 shrink-0" /> {product.area || "Nearby"}{product.city ? `, ${product.city}` : ""}{product.distanceKm ? ` · ${product.distanceKm} km away` : ""}{product.postedAgo ? ` · ${product.postedAgo}` : ""}
            </p>
            <p className="mt-1 flex items-center gap-3 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              <span>Condition · {(product.condition || "good").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</span>
              {Boolean(Number((product as any).rating) > 0 && Number((product as any).reviewCount) > 0) && (
                <span className="inline-flex items-center gap-1 text-blue-700 dark:text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/30 font-extrabold">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  {(product as any).rating} ({(product as any).reviewCount} reviews)
                </span>
              )}
            </p>

            {/* Smart Bargain Assist Widget */}
            {isNegotiable && (
              <div className="mt-3.5 rounded-2xl bg-blue-500/5 border border-blue-500/25 p-4 space-y-2.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-blue-700 dark:text-blue-300 flex items-center gap-1.5 tracking-wider">
                    <HandCoins className="h-4 w-4 text-blue-600" /> Smart Bargain Offers ⚡
                  </span>
                  <span className="text-[10px] font-black text-blue-700 dark:text-blue-300 bg-blue-500/15 border border-blue-500/30 px-2.5 py-0.5 rounded-full">
                    Instant AI Offer
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {[0.9, 0.85, 0.8].map((mult) => {
                    const offerVal = Math.round(product.price * mult);
                    const pct = Math.round((1 - mult) * 100);
                    return (
                      <button
                        key={mult}
                        onClick={() => {
                          setOfferAmount(String(offerVal));
                          setOfferOpen(true);
                        }}
                        className="flex-1 min-w-[105px] py-2 px-3.5 rounded-xl bg-card border border-blue-500/20 text-left hover:border-blue-600 hover:bg-blue-600 hover:text-white transition-all active:scale-95 shadow-xs group"
                      >
                        <p className="text-xs font-black text-slate-950 dark:text-white group-hover:text-white transition-colors">{formatINR(offerVal)}</p>
                        <p className="text-[10px] font-bold text-blue-700 dark:text-blue-400 group-hover:text-white transition-colors flex items-center justify-between">
                          <span>-{pct}% Offer</span>
                          <ArrowRight className="h-3 w-3 shrink-0 transition-transform group-hover:translate-x-0.5" />
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Availability Chips */}
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 px-3 py-1 text-xs font-extrabold text-blue-700 dark:text-blue-300">
              <PackageCheck className="h-3.5 w-3.5 text-blue-600" /> Available Now
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 px-3 py-1 text-xs font-extrabold text-blue-700 dark:text-blue-300">
              <Package className="h-3.5 w-3.5 text-blue-600" /> Pickup Available
            </span>
          </div>

          {/* Seller Verification Metrics Matrix */}
          <div>
            <h3 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Seller Verification & Metrics</h3>
            <SellerTrustBadgeMatrix seller={seller} product={product} />
          </div>

          {/* Specifications */}
          <div>
            <h3 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Specifications & Details</h3>
            <div className="grid grid-cols-2 gap-3.5 rounded-2xl bg-card p-4 border border-border shadow-xs">
              {Object.entries({
                Category: (product.category || "General").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
                Subcategory: (product.subcategory || product.category || "General").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
                Condition: (product.condition || "good").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
                ...(product.specs || {})
              }).map(([k, v]) => (
                <div key={k}>
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">{k}</p>
                  <p className="text-xs font-bold text-foreground capitalize mt-0.5">{String(v)}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Description</h3>
            <FormattedDescription text={product.description} />
          </div>

          {/* Seller */}
          <div>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Seller Overview</h3>
            <SellerSummary seller={seller} otherListings={otherListings} />
          </div>

          {/* Contextual ad */}
          <ContextualAd ad={contextualAd} />

          <SafetyCard />

          {/* Report */}
          <button
            onClick={() => setReportOpen(true)}
            className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-border bg-card py-3 text-xs font-bold text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <Flag className="h-3.5 w-3.5" /> Report this listing
          </button>

          {/* Similar */}
          {similar.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-bold text-foreground">Similar Products</h3>
              <div className="grid grid-cols-2 gap-3">
                {similar.map((p) => <ProductCard key={p.id} p={p} />)}
              </div>
            </div>
          )}
        </div>
        </div>{/* end left column */}

        {/* Desktop sticky sidebar */}
        <aside className="hidden md:block">
          <div className="sticky top-24 space-y-4">
            <SellerSummary seller={seller} otherListings={otherListings} />

            {/* Quick Action Card */}
            <div className="space-y-3.5 rounded-3xl border border-border bg-card p-5 shadow-xs">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-3xl font-black text-slate-950 dark:text-white leading-none">{formatINR(product.price)}</p>
                {isNegotiable ? (
                  <span className="rounded-full bg-blue-500/10 border border-blue-500/30 px-2.5 py-0.5 text-xs font-extrabold text-blue-700 dark:text-blue-300">
                    Negotiable
                  </span>
                ) : (
                  <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-extrabold text-emerald-700 dark:text-emerald-300">
                    Fixed Price
                  </span>
                )}
              </div>
              <p className="text-sm font-bold text-foreground line-clamp-1">{product.title}</p>

              <div className="pt-2 grid grid-cols-1 gap-2.5">
                <button
                  onClick={async () => {
                    if (isGuest()) { setGuestOpen(true); return; }
                    try {
                      const res = await startConversationApi("LISTING", product.id);
                      if (res.success && res.data?.id) {
                        nav({ to: "/chat/$id", params: { id: res.data.id } });
                      } else {
                        toast.error(res.error?.message || "Could not start chat");
                      }
                    } catch { toast.error("Connection error. Please try again."); }
                  }}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white py-3.5 text-sm font-extrabold shadow-md active:scale-98 transition-all"
                >
                  <MessageCircle className="h-4 w-4" /> Chat with Seller
                </button>

                {isNegotiable && (
                  <button
                    onClick={() => setOfferOpen(true)}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-700 dark:text-blue-300 py-3.5 text-sm font-extrabold shadow-xs active:scale-98 transition-all"
                  >
                    <HandCoins className="h-4 w-4 text-blue-600" /> Make an Offer
                  </button>
                )}

                {waLink && (
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white py-3 text-sm font-bold shadow-sm transition-all"
                  >
                    WhatsApp Seller
                  </a>
                )}

                <a
                  href={callablePhone ? `tel:${callablePhone}` : "#"}
                  onClick={handleCallClick}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-secondary/50 hover:bg-secondary py-3 text-sm font-bold text-foreground transition-colors cursor-pointer"
                  title={callablePhone ? `Call Seller at ${callablePhone}` : "Call Seller"}
                >
                  <Phone className="h-4 w-4 text-blue-600" /> Call Seller
                </a>

                <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground font-semibold">
                  <button onClick={toggle} className="inline-flex items-center gap-1.5 hover:text-foreground cursor-pointer">
                    <Heart className={"h-4 w-4 " + (saved ? "fill-blue-600 text-blue-600" : "")} /> {saved ? "Saved" : "Save Listing"}
                  </button>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={shareToWhatsApp}
                      className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-bold cursor-pointer"
                      title="Share to WhatsApp"
                    >
                      <MessageCircle className="h-4 w-4 text-emerald-600" /> WhatsApp
                    </button>
                    <button onClick={() => share(product.title)} className="inline-flex items-center gap-1 hover:text-foreground cursor-pointer">
                      <Share2 className="h-4 w-4 text-blue-600" /> Share
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-3 rounded-2xl bg-blue-500/5 border border-blue-500/20 p-3 text-[11px] font-medium text-blue-800 dark:text-blue-300">
                🛡️ Safety Shield: Meet in a public place, inspect the item thoroughly, and verify before making payment.
              </div>
            </div>
          </div>
        </aside>
        </div>{/* end desktop grid */}

        {/* Mobile sticky actions */}
        <div className={`fixed bottom-0 left-1/2 z-40 grid w-full max-w-[430px] -translate-x-1/2 ${
          waLink
            ? (isNegotiable ? "grid-cols-4" : "grid-cols-3")
            : (isNegotiable ? "grid-cols-3" : "grid-cols-2")
        } gap-1.5 border-t border-border bg-card/95 backdrop-blur-md p-2.5 safe-b md:hidden shadow-lg`}>
          <a
            href={callablePhone ? `tel:${callablePhone}` : "#"}
            onClick={handleCallClick}
            className="flex flex-col items-center justify-center gap-0.5 rounded-2xl border border-border bg-secondary py-2 text-xs font-bold text-foreground cursor-pointer"
          >
            <Phone className="h-4 w-4 text-blue-600" /> Call
          </a>
          {waLink && (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-0.5 rounded-2xl bg-blue-600 text-white py-2 text-xs font-bold shadow-xs"
            >
              WhatsApp
            </a>
          )}
          {isNegotiable && (
            <button
              onClick={() => setOfferOpen(true)}
              className="flex flex-col items-center justify-center gap-0.5 rounded-2xl border border-blue-500/30 bg-blue-500/15 text-blue-700 dark:text-blue-300 py-2 text-xs font-extrabold"
            >
              <HandCoins className="h-4 w-4 text-blue-600" /> Offer
            </button>
          )}
          <button
            onClick={async () => {
              if (isGuest()) { setGuestOpen(true); return; }
              try {
                const res = await startConversationApi("LISTING", product.id);
                if (res.success && res.data?.id) {
                  nav({ to: "/chat/$id", params: { id: res.data.id } });
                } else {
                  toast.error(res.error?.message || "Could not start chat");
                }
              } catch { toast.error("Connection error. Please try again."); }
            }}
            className="flex flex-col items-center justify-center gap-0.5 rounded-2xl bg-blue-600 text-white py-2 text-xs font-bold shadow-xs"
          >
            <MessageCircle className="h-4 w-4" /> Chat
          </button>
        </div>

        <MakeOfferSheet open={offerOpen} onClose={() => setOfferOpen(false)} product={product} initialAmount={offerAmount} />
        <ReportSheet open={reportOpen} onClose={() => setReportOpen(false)} productId={product.id} />
        <BottomSheet
          open={guestOpen}
          onClose={() => setGuestOpen(false)}
          title="Sign in to contact this seller"
          footer={
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setGuestOpen(false)} className="h-11 rounded-2xl border border-border text-sm font-bold">Continue browsing</button>
              <button
                onClick={() => {
                  try { localStorage.setItem("omeetso_return_product", product.id); } catch { /* ignore */ }
                  nav({ to: "/login" });
                }}
                className="h-11 rounded-2xl bg-blue-600 text-sm font-bold text-white shadow-sm hover:bg-blue-700"
              >Sign in</button>
            </div>
          }
        >
          <p className="text-xs text-muted-foreground">
            Create an Omeetso account to chat, make offers and receive replies.
          </p>
        </BottomSheet>
      </div>
    </MobileFrame>
  );
}

function TopHeader({ saved, onSave, onShare }: { saved: boolean; onSave: () => void; onShare: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-border bg-card/95 px-3 py-3 backdrop-blur safe-t">
      <button onClick={() => history.back()} className="grid h-10 w-10 place-items-center rounded-full hover:bg-secondary" aria-label="Back">
        <ArrowLeft className="h-5 w-5" />
      </button>
      <div className="flex items-center gap-1">
        <button onClick={onShare} className="grid h-10 w-10 place-items-center rounded-full hover:bg-secondary" aria-label="Share">
          <Share2 className="h-5 w-5 text-blue-600" />
        </button>
        <button
          onClick={onSave}
          aria-label={saved ? "Remove from saved" : "Save"}
          aria-pressed={saved}
          className="grid h-10 w-10 place-items-center rounded-full hover:bg-secondary"
        >
          <Heart className={"h-5 w-5 " + (saved ? "fill-blue-600 text-blue-600" : "text-muted-foreground")} />
        </button>
      </div>
    </header>
  );
}

function toastCopy() {
  if (typeof document === "undefined") return;
  const el = document.createElement("div");
  el.textContent = "Link copied";
  el.className = "fixed bottom-24 left-1/2 -translate-x-1/2 z-[999] rounded-full bg-slate-950 text-white px-4 py-2 text-xs font-bold shadow-lg border border-white/20";
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1500);
}

function NotFound() {
  const nav = useNavigate();
  return (
    <MobileFrame>
      <EmptyState
        title="Listing removed"
        body="This listing is no longer available on Omeetso."
        ctaLabel="Browse similar products"
        onCta={() => nav({ to: "/home" })}
      />
    </MobileFrame>
  );
}

function SellerTrustBadgeMatrix({ seller, product }: { seller: any; product?: any }) {
  const ratingNum = typeof seller?.rating === "number" && seller.rating > 0 ? seller.rating : 0;
  const reviewsCount = typeof seller?.reviews === "number" ? seller.reviews : 0;
  const isVerified = Boolean(seller?.verified || seller?.phoneVerified || seller?.kycVerified);
  const verificationDetail = seller?.kycVerified
    ? "Govt ID & KYC"
    : seller?.phoneVerified
    ? "Phone Verified"
    : isVerified
    ? "Phone Verified"
    : "Active Member";

  const locArea = product?.area || (seller?.area && seller.area !== "Madhapur" ? seller.area : null);
  const locCity = product?.city || seller?.city || "Hyderabad";
  const locationDisplay = locArea || locCity;
  const distanceSubtitle = product?.distanceKm
    ? `${product.distanceKm} km away`
    : locArea && product?.city && locArea !== product.city
    ? product.city
    : "Local Distance";

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
      {/* 1. Avg Response */}
      <div className="flex flex-col items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/5 dark:bg-blue-500/10 p-3 text-center transition-all hover:border-blue-500/40 shadow-xs">
        <div className="flex items-center justify-center gap-1.5 text-blue-700 dark:text-blue-300 text-xs sm:text-sm font-extrabold">
          <Zap className="h-3.5 w-3.5 text-amber-500 fill-amber-500 shrink-0" />
          <span>{seller?.responseTime || "Within 15 min"}</span>
        </div>
        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">Avg Response</div>
      </div>

      {/* 2. Verification */}
      <div className="flex flex-col items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/10 p-3 text-center transition-all hover:border-emerald-500/40 shadow-xs">
        <div className="flex items-center justify-center gap-1.5 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm font-extrabold">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{isVerified ? "Verified" : "Active Member"}</span>
        </div>
        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">{verificationDetail}</div>
      </div>

      {/* 3. Rating */}
      <div className="flex flex-col items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/5 dark:bg-amber-500/10 p-3 text-center transition-all hover:border-amber-500/40 shadow-xs">
        <div className="flex items-center justify-center gap-1.5 text-amber-700 dark:text-amber-300 text-xs sm:text-sm font-extrabold">
          <Star className={`h-3.5 w-3.5 shrink-0 ${ratingNum > 0 ? "fill-amber-400 text-amber-400" : "text-slate-400 dark:text-slate-500"}`} />
          <span>{ratingNum > 0 ? `${ratingNum.toFixed(1)} / 5` : "New Seller"}</span>
        </div>
        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">
          {reviewsCount > 0 ? `Rating (${reviewsCount})` : "Seller Rating"}
        </div>
      </div>

      {/* 4. Location */}
      <div className="flex flex-col items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/5 dark:bg-indigo-500/10 p-3 text-center transition-all hover:border-indigo-500/40 shadow-xs">
        <div className="flex items-center justify-center gap-1 text-indigo-700 dark:text-indigo-300 text-xs sm:text-sm font-extrabold max-w-full px-1">
          <MapPin className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span className="truncate">{locationDisplay}</span>
        </div>
        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">{distanceSubtitle}</div>
      </div>
    </div>
  );
}
