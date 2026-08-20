import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import { getFaq, ALL_FAQS } from "@/lib/faq";
import { toast } from "sonner";
import { ThumbsUp, ThumbsDown, LifeBuoy } from "lucide-react";

export const Route = createFileRoute("/help/faq/$id")({
  head: () => ({ meta: [{ title: "Help article — Omeetso" }] }),
  component: FaqDetail,
});

function FaqDetail() {
  const { id } = useParams({ from: "/help/faq/$id" });
  const f = getFaq(id);
  const [rating, setRating] = useState<null | "yes" | "no">(null);

  if (!f) return (
    <MobileFrame><div className="p-6 pt-16 text-center"><p className="text-sm text-muted-foreground">Article not found.</p><Link to="/help" className="mt-3 inline-block rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">Back</Link></div></MobileFrame>
  );
  const related = ALL_FAQS.filter((x) => x.category === f.category && x.id !== f.id).slice(0, 3);

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-16">
        <BackBar title="Help article" />
        <div className="px-4 pt-2">
          <p className="text-[11px] font-bold uppercase text-muted-foreground">{f.category}</p>
          <h1 className="mt-1 text-lg font-extrabold">{f.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{f.summary}</p>

          <div className="mt-3 rounded-2xl bg-card p-3 card-elev text-sm">
            <ol className="list-decimal pl-5 space-y-1">
              {f.steps.map((s, i) => <li key={i}>{s}</li>)}
            </ol>
          </div>

          {f.relatedRoutes.length > 0 && (
            <div className="mt-3">
              <p className="text-[11px] font-bold uppercase text-muted-foreground">Related screens</p>
              <div className="mt-1 flex flex-wrap gap-2">
                {f.relatedRoutes.map((r) => (
                  <Link key={r.to} to={r.to as any} className="rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold">{r.label}</Link>
                ))}
              </div>
            </div>
          )}

          {related.length > 0 && (
            <div className="mt-3">
              <p className="text-[11px] font-bold uppercase text-muted-foreground">Related articles</p>
              <div className="mt-1 space-y-1">
                {related.map((r) => (
                  <Link key={r.id} to="/help/faq/$id" params={{ id: r.id }}
                    className="block rounded-2xl bg-card p-3 card-elev text-sm font-semibold">
                    {r.title}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 rounded-2xl bg-card p-3 card-elev text-center">
            <p className="text-xs">Was this helpful?</p>
            <div className="mt-2 flex justify-center gap-2">
              <button onClick={() => { setRating("yes"); toast.success("Thanks for your feedback"); }}
                className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold ${rating === "yes" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-border"}`}>
                <ThumbsUp className="h-3 w-3" /> Yes
              </button>
              <button onClick={() => { setRating("no"); toast.info("Thanks — we'll improve this article"); }}
                className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold ${rating === "no" ? "border-rose-500 bg-rose-50 text-rose-700" : "border-border"}`}>
                <ThumbsDown className="h-3 w-3" /> No
              </button>
            </div>
          </div>

          <Link to="/support/new" search={{ category: f.category } as any}
            className="mt-3 flex items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3 text-sm font-bold">
            <LifeBuoy className="h-4 w-4" /> Contact support
          </Link>
        </div>
      </div>
    </MobileFrame>
  );
}
