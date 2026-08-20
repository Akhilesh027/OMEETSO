import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { BoostAdWizard } from "@/components/omeetso/promotions/BoostAdWizard";

type SearchParams = { listingId?: string; storeId?: string; productId?: string; kind?: "listing" | "store" | "store_product" };

export const Route = createFileRoute("/promotions/new")({
  head: () => ({ meta: [{ title: "Create Promotion & Launch Campaign — Omeetso" }] }),
  validateSearch: (s: Record<string, unknown>): SearchParams => ({
    listingId: s.listingId as string | undefined,
    storeId: s.storeId as string | undefined,
    productId: s.productId as string | undefined,
    kind: (s.kind as any) ?? "listing",
  }),
  component: NewPromotionPage,
});

function NewPromotionPage() {
  const search = useSearch({ from: "/promotions/new" });
  const nav = useNavigate();

  return (
    <div className="min-h-dvh bg-background">
      <BoostAdWizard
        listingId={search.listingId || search.productId || "p1"}
        listingTitle="Selected Product / Store Listing"
        onClose={() => nav({ to: "/home" })}
        onSuccess={() => nav({ to: "/wallet" })}
      />
    </div>
  );
}
