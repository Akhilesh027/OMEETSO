import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import { RatingRow, RatingStars, SectionTitle } from "@/components/omeetso/account";
import { addReview, type ReviewKind } from "@/lib/account";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const CATS_BY_KIND: Record<ReviewKind, { key: string; label: string }[]> = {
  buyer: [
    { key: "communication", label: "Communication" },
    { key: "punctuality", label: "Punctuality" },
    { key: "behaviour", label: "Behaviour" },
    { key: "transaction", label: "Transaction experience" },
  ],
  seller: [
    { key: "communication", label: "Communication" },
    { key: "product_accuracy", label: "Product accuracy" },
    { key: "behaviour", label: "Behaviour" },
    { key: "punctuality", label: "Punctuality" },
  ],
  store: [
    { key: "product_quality", label: "Product quality" },
    { key: "service", label: "Service" },
    { key: "communication", label: "Communication" },
    { key: "store_accuracy", label: "Store accuracy" },
    { key: "delivery", label: "Delivery or pickup experience" },
  ],
};

export const Route = createFileRoute("/reviews/new")({
  head: () => ({ meta: [{ title: "Write a review — Omeetso" }] }),
  validateSearch: (s: Record<string, unknown>) => ({
    kind: ((s.kind as string) as ReviewKind) ?? "seller",
    targetId: (s.targetId as string) ?? "u2",
    targetName: (s.targetName as string) ?? "Sanjay P.",
    productRef: (s.productRef as string) ?? "",
  }),
  component: NewReview,
});

function NewReview() {
  const s = useSearch({ from: "/reviews/new" });
  const nav = useNavigate();
  const cats = CATS_BY_KIND[s.kind as ReviewKind] ?? CATS_BY_KIND.seller;
  const [kind] = useState<ReviewKind>(s.kind as ReviewKind);
  const [categories, setCategories] = useState<Record<string, number>>(Object.fromEntries(cats.map((c) => [c.key, 0])));
  const [overall, setOverall] = useState(0);
  const [comment, setComment] = useState("");
  const [privateFeedback, setPrivateFeedback] = useState("");
  const [agree, setAgree] = useState(false);
  const [truthful, setTruthful] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [done, setDone] = useState<null | { id: string }>(null);

  const heading = ({ buyer: "Rate this buyer", seller: "Rate this seller", store: "Rate this store" } as Record<ReviewKind, string>)[kind];

  const submit = () => {
    if (!truthful || !agree) { toast.error("Please confirm the review is truthful and agree to guidelines"); return; }
    if (overall === 0) { toast.error("Add an overall rating"); return; }
    const rec = addReview({ kind, targetId: s.targetId, targetName: s.targetName, reviewerName: "You",
      overall, categories, comment, privateFeedback: privateFeedback || undefined, productRef: s.productRef || undefined });
    setDone({ id: rec.id });
  };

  if (done) {
    return (
      <MobileFrame>
        <div className="min-h-dvh bg-background p-6 pt-16 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl gradient-brand text-yellow-brand">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="mt-3 text-lg font-extrabold">Thank you for sharing your experience</h1>
          <p className="mt-1 text-xs text-muted-foreground">You can edit your review for a short period after posting.</p>
          <div className="mt-4 space-y-2">
            <button onClick={() => nav({ to: "/reviews" })} className="w-full rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground">View reviews</button>
            <button onClick={() => nav({ to: "/account" })} className="w-full rounded-full border border-border py-3 text-sm font-semibold">Back to account</button>
          </div>
        </div>
      </MobileFrame>
    );
  }

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-28">
        <BackBar title={heading} />
        <div className="px-4 pt-2 space-y-3">
          <div className="rounded-2xl bg-card p-3 card-elev">
            <p className="text-[11px] font-bold uppercase text-muted-foreground">About</p>
            <p className="mt-1 text-sm font-bold">{s.targetName}</p>
            {s.productRef && <p className="text-[11px] text-muted-foreground">Product: {s.productRef}</p>}
          </div>

          {step === 1 && (
            <>
              <div className="rounded-2xl bg-card p-3 card-elev text-center">
                <p className="text-[11px] font-bold uppercase text-muted-foreground">Overall rating</p>
                <div className="mt-2 flex justify-center"><RatingStars value={overall} onChange={setOverall} ariaLabel="Overall rating" /></div>
              </div>

              <SectionTitle>Rate the details</SectionTitle>
              <div className="rounded-2xl bg-card p-3 card-elev">
                {cats.map((c) => (
                  <RatingRow key={c.key} label={c.label} value={categories[c.key] ?? 0} onChange={(v) => setCategories((cur) => ({ ...cur, [c.key]: v }))} />
                ))}
              </div>

              <label className="block">
                <span className="text-[11px] font-semibold">Written review (optional)</span>
                <textarea rows={4} value={comment} onChange={(e) => setComment(e.target.value)}
                  placeholder="Share what went well and what could be better…" maxLength={500}
                  className="mt-1 w-full rounded-2xl border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary" />
              </label>

              <label className="block">
                <span className="text-[11px] font-semibold">Private feedback to Omeetso (optional)</span>
                <textarea rows={2} value={privateFeedback} onChange={(e) => setPrivateFeedback(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary" />
                <p className="mt-0.5 text-[10px] text-muted-foreground">This is not shown publicly.</p>
              </label>
            </>
          )}

          {step === 2 && (
            <>
              <SectionTitle>Preview</SectionTitle>
              <div className="rounded-2xl bg-card p-3 card-elev">
                <div className="flex items-center gap-2"><RatingStars value={overall} size={20} /><span className="text-sm font-bold">{overall}/5</span></div>
                <p className="mt-2 text-sm">{comment || <em className="text-muted-foreground">No written review</em>}</p>
              </div>
              <label className="flex items-start gap-2 rounded-2xl border border-border bg-card p-3 text-xs">
                <input type="checkbox" checked={truthful} onChange={(e) => setTruthful(e.target.checked)} />
                <span>I confirm this review is truthful and based on my actual experience.</span>
              </label>
              <label className="flex items-start gap-2 rounded-2xl border border-border bg-card p-3 text-xs">
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                <span>I agree to Omeetso's review guidelines. Reviews are moderated in this preview using simulated states.</span>
              </label>
            </>
          )}
        </div>

        <div className="fixed inset-x-0 bottom-0 z-10 mx-auto max-w-[430px] border-t border-border bg-card p-3 safe-b">
          <div className="flex gap-2">
            {step === 2 && <button onClick={() => setStep(1)} className="rounded-full border border-border px-4 py-3 text-sm font-semibold">Back</button>}
            {step === 1 ? (
              <button onClick={() => setStep(2)} className={cn("flex-1 rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground", overall === 0 && "opacity-60")}>Preview</button>
            ) : (
              <button onClick={submit} className="flex-1 rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground">Submit review</button>
            )}
          </div>
        </div>
      </div>
    </MobileFrame>
  );
}
