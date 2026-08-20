import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { X, Share2, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { getProduct } from "@/lib/mock";

export const Route = createFileRoute("/gallery/$id")({
  validateSearch: (s: Record<string, unknown>) => ({ i: typeof s.i === "string" ? s.i : "0" }),
  loader: ({ params }) => {
    const p = getProduct(params.id);
    if (!p) throw notFound();
    return { product: p };
  },
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData ? `Gallery — ${loaderData.product.title} · Omeetso` : "Gallery · Omeetso" }],
  }),
  component: GalleryPage,
});

function GalleryPage() {
  const { product } = Route.useLoaderData();
  const search = Route.useSearch();
  const nav = useNavigate();
  const images = product.images ?? [product.image];
  const [idx, setIdx] = useState(() => Math.min(Math.max(Number(search.i) || 0, 0), images.length - 1));
  const [zoom, setZoom] = useState(false);

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
    <div className="fixed inset-0 z-50 flex flex-col bg-black text-white">
      <header className="flex items-center justify-between p-3 safe-t">
        <button
          onClick={() => history.length > 1 ? history.back() : nav({ to: "/product/$id", params: { id: product.id } })}
          className="grid h-10 w-10 place-items-center rounded-full bg-white/10"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        <span className="text-sm font-semibold">{idx + 1} / {images.length}</span>
        <button onClick={share} className="grid h-10 w-10 place-items-center rounded-full bg-white/10" aria-label="Share">
          <Share2 className="h-5 w-5" />
        </button>
      </header>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        <img
          src={images[idx]}
          alt={product.title}
          onClick={() => setZoom((z) => !z)}
          className={"max-h-full max-w-full object-contain transition-transform duration-300 " + (zoom ? "scale-150" : "scale-100")}
        />
        {images.length > 1 && (
          <>
            <button
              onClick={() => setIdx((i) => (i - 1 + images.length) % images.length)}
              className="absolute left-2 grid h-10 w-10 place-items-center rounded-full bg-white/10"
              aria-label="Previous"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => setIdx((i) => (i + 1) % images.length)}
              className="absolute right-2 grid h-10 w-10 place-items-center rounded-full bg-white/10"
              aria-label="Next"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar p-3 safe-b">
        {images.map((im: string, i: number) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            aria-label={`Image ${i + 1}`}
            className={"relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 " + (i === idx ? "border-yellow-brand" : "border-white/20")}
          >
            <img src={im} alt="" className="h-full w-full object-cover" />
            {i === 0 && images.length === 1 && (
              <span className="absolute inset-0 grid place-items-center bg-black/40">
                <Play className="h-4 w-4" />
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
