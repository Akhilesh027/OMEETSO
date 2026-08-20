import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import { BottomNav } from "@/components/omeetso/BottomNav";
import { getStore, seedStoresIfEmpty } from "@/lib/stores";
import { listListings, upsertListing, formatINR, type Listing } from "@/lib/listings";
import { Package, Check, Search, Filter } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/store/manage/$id/add-existing")({
  head: () => ({ meta: [{ title: "Add existing listing — Omeetso" }] }),
  component: AddExisting,
});

function AddExisting() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "review">("all");
  const [rows, setRows] = useState<Listing[]>([]);

  useEffect(() => {
    seedStoresIfEmpty();
    setRows(listListings());
  }, []);

  const store = getStore(id);
  const eligible = useMemo(() => {
    return rows.filter((l) => {
      if (l.storeId && l.storeId !== id) return false;
      if (l.storeId === id) return false; // already in this store
      if (!(l.status === "active" || l.status === "under_review")) return false;
      if (store && l.category !== store.primaryCategory) return false; // category match
      if (filter === "active" && l.status !== "active") return false;
      if (filter === "review" && l.status !== "under_review") return false;
      if (q && !l.title.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [rows, id, store, q, filter]);

  function attach(l: Listing) {
    upsertListing({ ...l, storeId: id, storeMeta: { ...(l.storeMeta ?? {}), stockStatus: "in_stock" } });
    toast.success(`Product added to ${store?.name ?? "store"}`);
    nav({ to: "/store/manage/$id/products", params: { id } });
  }

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-28">
        <BackBar title="Add existing listing" />
        <div className="p-4 space-y-3">
          {store && (
            <div className="rounded-2xl bg-primary/5 p-3 text-xs text-primary">
              Adding to <span className="font-bold">{store.name}</span>. Only listings matching category <span className="font-bold">{store.primaryCategory}</span> are shown.
            </div>
          )}

          <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search your listings"
              className="flex-1 bg-transparent text-sm outline-none" />
          </div>
          <div className="flex gap-2 text-xs">
            {(["all", "active", "review"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`rounded-full border px-3 py-1.5 font-semibold ${filter === f ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}>
                {f === "all" ? "All" : f === "active" ? "Active" : "Under Review"}
              </button>
            ))}
          </div>

          {eligible.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-6 text-center">
              <Package className="mx-auto h-8 w-8 text-primary" />
              <p className="mt-2 text-sm font-bold">No eligible listings</p>
              <p className="text-xs text-muted-foreground">Only active or under-review listings that match your store category can be added.</p>
            </div>
          )}

          {eligible.map((l) => (
            <button key={l.id} onClick={() => attach(l)} className="flex w-full gap-3 rounded-2xl border border-border bg-card p-3 text-left">
              {l.images[l.cover] ? (
                <img src={l.images[l.cover]} alt="" className="h-16 w-16 rounded-xl object-cover" />
              ) : (
                <div className="grid h-16 w-16 place-items-center rounded-xl bg-secondary"><Package className="h-5 w-5" /></div>
              )}
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm font-bold">{l.title}</p>
                <p className="text-sm font-extrabold text-primary">₹{formatINR(l.price)}</p>
                <p className="text-[11px] text-muted-foreground">{l.subcategory} · {l.area}</p>
              </div>
              <div className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-primary"><Check className="h-4 w-4" /></div>
            </button>
          ))}
        </div>
        <BottomNav />
      </div>
    </MobileFrame>
  );
}
