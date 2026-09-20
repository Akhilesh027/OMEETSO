import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { X, Share2, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { getProduct } from "@/lib/mock";
import { fetchLiveListingById, listListings } from "@/lib/listings";
import { ProductWatermark } from "@/components/omeetso/Watermark";

function getEmbedUrl(url: string) {
  if (!url) return "";
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    const idMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return idMatch ? `https://www.youtube.com/embed/${idMatch[1]}?autoplay=1&rel=0` : url;
  }
  return url;
}

export const Route = createFileRoute("/gallery/$id")({
  validateSearch: (s: Record<string, unknown>) => ({ i: typeof s.i === "string" ? s.i : "0" }),
  loader: async ({ params }) => {
    const cleanId = (params.id || "").trim();
    let p = getProduct(cleanId);
    if (!p && cleanId) {
      try {
        const live = await fetchLiveListingById(cleanId);
        if (live) p = live as any;
      } catch (err) {
        console.warn("Live listing fetch error in gallery:", err);
      }
    }
    if (!p && cleanId) {
      try {
        const userListings = listListings();
        const found = userListings.find((l) => l.id === cleanId);
        if (found) p = found as any;
      } catch { /* ignore */ }
    }
    if (!p) throw notFound();
    return { product: p };
  },
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData ? `Gallery — ${loaderData.product.title} · Omeetso` : "Gallery · Omeetso" }],
  }),
  notFoundComponent: () => (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-white p-6 text-center space-y-4">
      <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-2xl font-bold">
        🖼️
      </div>
      <h2 className="text-xl font-black">Media Gallery Unavailable</h2>
      <p className="text-xs text-white/70 max-w-xs leading-relaxed">
        The image or product could not be loaded. Please return to the product page.
      </p>
      <button
        onClick={() => (window.history.length > 1 ? window.history.back() : window.location.assign("/home"))}
        className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg transition-all cursor-pointer"
      >
        Go Back
      </button>
    </div>
  ),
  component: GalleryPage,
});

function GalleryPage() {
  const { product } = Route.useLoaderData();
  const search = Route.useSearch();
  const nav = useNavigate();
  const targetId = product.id || (product as any)._id || "";
  const videoUrl = product.videoUrl || product.video;
  const rawImages = (Array.isArray(product.images) && product.images.length > 0)
    ? product.images.filter(Boolean)
    : (product.image ? [product.image] : []);
  const images = rawImages.length > 0 ? rawImages : ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800"];

  const mediaList = useMemo(() => {
    const list = images.map((img: string) => ({ type: "image" as const, url: img, thumbnail: img }));
    if (videoUrl) {
      const vid = { type: "video" as const, url: videoUrl, thumbnail: images[0] || "" };
      if (list.length > 1) list.splice(1, 0, vid);
      else list.push(vid);
    }
    return list;
  }, [images, videoUrl]);

  const [idx, setIdx] = useState(() => Math.min(Math.max(Number(search.i) || 0, 0), Math.max(0, mediaList.length - 1)));
  const [zoom, setZoom] = useState(false);
  const currentMedia = mediaList[idx] || mediaList[0];

  const share = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (typeof navigator !== "undefined" && navigator.share) {
      try { await navigator.share({ title: product.title, url }); return; } catch { /* ignore */ }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try { await navigator.clipboard.writeText(url); } catch { /* ignore */ }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black text-white select-none">
      <header className="flex items-center justify-between p-3 safe-t">
        <button
          onClick={() => (window.history.length > 1 ? window.history.back() : nav({ to: "/product/$id", params: { id: targetId } }))}
          className="grid h-10 w-10 place-items-center rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        <span className="text-sm font-semibold">{idx + 1} / {mediaList.length}</span>
        <button onClick={share} className="grid h-10 w-10 place-items-center rounded-full bg-white/10 hover:bg-white/20 transition-colors" aria-label="Share">
          <Share2 className="h-5 w-5" />
        </button>
      </header>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        {currentMedia?.type === "video" ? (
          <div className="relative h-full w-full max-w-4xl p-4 flex items-center justify-center">
            {currentMedia.url.includes("youtube.com") || currentMedia.url.includes("youtu.be") ? (
              <iframe
                src={getEmbedUrl(currentMedia.url)}
                className="w-full aspect-video max-h-[85vh] rounded-2xl"
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
                className="max-h-[85vh] max-w-full rounded-2xl object-contain"
              />
            )}
          </div>
        ) : (
          <>
            <img
              src={currentMedia.url}
              alt={product.title}
              onClick={() => setZoom((z) => !z)}
              className={"max-h-full max-w-full object-contain transition-transform duration-300 " + (zoom ? "scale-150" : "scale-100")}
            />
            <ProductWatermark size="lg" position="bottom-right" className="bottom-6 right-6 md:bottom-8 md:right-8" />
          </>
        )}

        {mediaList.length > 1 && (
          <>
            <button
              onClick={() => setIdx((i) => (i - 1 + mediaList.length) % mediaList.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-black/60 hover:bg-black/80 border border-white/20 text-white shadow-lg transition-all cursor-pointer"
              aria-label="Previous"
            >
              <ChevronLeft className="h-5 w-5 -ml-0.5" />
            </button>
            <button
              onClick={() => setIdx((i) => (i + 1) % mediaList.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-black/60 hover:bg-black/80 border border-white/20 text-white shadow-lg transition-all cursor-pointer"
              aria-label="Next"
            >
              <ChevronRight className="h-5 w-5 -mr-0.5" />
            </button>
          </>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar p-3 safe-b">
        {mediaList.map((item, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            aria-label={`Media ${i + 1}`}
            className={"relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 " + (i === idx ? "border-yellow-brand" : "border-white/20")}
          >
            {item.type === "video" ? (
              <div className="relative h-full w-full bg-slate-900">
                <img src={item.thumbnail} alt="" className="h-full w-full object-cover brightness-50" />
                <span className="absolute inset-0 grid place-items-center bg-black/40">
                  <Play className="h-4 w-4 fill-amber-400 text-amber-400 ml-0.5" />
                </span>
              </div>
            ) : (
              <img src={item.url} alt="" className="h-full w-full object-cover" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
