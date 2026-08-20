import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import { listListings, seedIfEmpty, formatINR, type Listing } from "@/lib/listings";
import { Package, Search, ChevronRight, AlertCircle } from "lucide-react";
import { EmptyState } from "@/components/omeetso/EmptyState";

export const Route = createFileRoute("/promotions/store-products")({
  head: () => ({ meta: [{ title: "Promote a store product — Omeetso" }] }),
  component: SelectStoreProduct,
});

function SelectStoreProduct() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Listing[]>([]);
  const nav = useNavigate();
  useEffect(() => { seedIfEmpty(); setItems(listListings()); }, []);
  const eligible = useMemo(() => items.filter((l) => !!l.storeId && l.status === "active" && (l.storeMeta?.stockStatus ?? "in_stock") !== "out_of_stock"), [items]);
  const ineligible = useMemo(() => items.filter((l) => !!l.storeId && (l.status !== "active" || l.storeMeta?.stockStatus === "out_of_stock")), [items]);
  const filt = eligible.filter((l) => l.title.toLowerCase().includes(q.toLowerCase()));

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-16">
        <BackBar title="Promote a store product" />
        <div className="px-4">
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search store products"
              className="w-full bg-transparent text-sm outline-none" aria-label="Search products" />
          </div>
          <div className="mt-3 space-y-2">
            {filt.length === 0 ? (
              <EmptyState icon={<Package className="h-6 w-6" />} title="No eligible store products"
                body="Products must be active, in stock and approved to run promotions." />
            ) : filt.map((l) => (
              <button key={l.id} onClick={() => nav({ to: "/promotions/new", search: { productId: l.id, storeId: l.storeId, kind: "store_product" } as any })}
                className="flex w-full gap-3 rounded-2xl border border-border bg-card p-3 text-left">
                {l.images[l.cover] ? <img src={l.images[l.cover]} alt={l.title} className="h-14 w-14 rounded-xl object-cover" /> :
                  <div className="grid h-14 w-14 place-items-center rounded-xl bg-secondary"><Package className="h-5 w-5" /></div>}
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-bold">{l.title}</p>
                  <p className="text-xs font-bold text-primary">{formatINR(l.price)}</p>
                  <p className="text-[11px] text-muted-foreground capitalize">{l.category} • {(l.storeMeta?.stockStatus ?? "in_stock").replaceAll("_", " ")}</p>
                </div>
                <ChevronRight className="mt-4 h-4 w-4 text-muted-foreground" />
              </button>
            ))}
            {ineligible.length > 0 && (
              <div className="mt-4 rounded-2xl border border-dashed border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                <p className="flex items-center gap-1 font-bold"><AlertCircle className="h-3.5 w-3.5" /> {ineligible.length} product(s) not eligible</p>
                <p className="mt-1">Out-of-stock or non-active store products cannot be promoted.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MobileFrame>
  );
}
