import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import { BottomNav } from "@/components/omeetso/BottomNav";
import { getStore, subscribe, fetchLiveUserStores } from "@/lib/stores";
import { listListings, upsertListing, formatINR, getAnalytics, type Listing } from "@/lib/listings";
import { Plus, Package, MoreVertical, Star, Eye, MessageCircle, Bookmark, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/store/manage/$id/products")({
  head: () => ({ meta: [{ title: "Store products — Omeetso" }] }),
  component: Products,
});

const TABS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "drafts", label: "Drafts" },
  { key: "review", label: "Under Review" },
  { key: "oos", label: "Out of Stock" },
  { key: "rejected", label: "Rejected" },
  { key: "archived", label: "Archived" },
] as const;

function match(l: Listing, tab: string): boolean {
  switch (tab) {
    case "all": return true;
    case "active": return l.status === "active" || l.status === "approved" || l.status === "APPROVED";
    case "drafts": return l.status === "draft";
    case "review": return l.status === "under_review" || l.status === "submitted" || l.status === "SUBMITTED";
    case "oos": return l.storeMeta?.stockStatus === "out_of_stock";
    case "rejected": return l.status === "rejected" || l.status === "REJECTED";
    case "archived": return l.status === "removed";
    default: return true;
  }
}

function Products() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  const [tab, setTab] = useState<string>("all");
  const [rows, setRows] = useState<Listing[]>([]);
  const [menu, setMenu] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  useEffect(() => {
    fetchLiveUserStores().then(() => setRows(listListings().filter((l) => l.storeId === id || (l as any).store === id)));
    const refresh = () => setRows(listListings().filter((l) => l.storeId === id || (l as any).store === id));
    refresh();
    const unsub = subscribe(refresh);
    return () => { unsub(); };
  }, [id]);

  const store = getStore(id);
  const visible = useMemo(() => rows.filter((l) => match(l, tab)), [rows, tab]);

  function setStock(l: Listing, stock: NonNullable<Listing["storeMeta"]>["stockStatus"]) {
    upsertListing({ ...l, storeMeta: { ...(l.storeMeta ?? {}), stockStatus: stock } });
    setMenu(null);
    toast.success("Stock updated");
  }
  function toggleFeatured(l: Listing) {
    const featured = !l.storeMeta?.featured;
    upsertListing({ ...l, storeMeta: { ...(l.storeMeta ?? {}), featured } });
    setMenu(null);
    toast.success(featured ? "Marked as featured" : "Removed from featured");
  }
  function removeFromStore(l: Listing, alsoDelete: boolean) {
    if (alsoDelete) {
      upsertListing({ ...l, status: "removed", storeId: undefined });
    } else {
      upsertListing({ ...l, storeId: undefined });
    }
    setConfirmRemove(null);
    toast.success(alsoDelete ? "Product removed from Omeetso" : "Removed from store — listing kept");
  }

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-28">
        <BackBar title={store?.name ?? "Store products"} right={
          <button
            onClick={() => nav({ to: "/sell/detailed", search: { storeId: id } as never })}
            className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground"
          >
            <Plus className="h-3.5 w-3.5" /> New
          </button>
        } />

        <div className="sticky top-0 z-10 flex gap-1 overflow-x-auto border-b border-border bg-card px-2 py-2">
          {TABS.map((t) => {
            const count = rows.filter((l) => match(l, t.key)).length;
            const on = tab === t.key;
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${on ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                {t.label} <span className="ml-1 text-[10px] opacity-75">{count}</span>
              </button>
            );
          })}
        </div>

        <div className="space-y-2 p-4">
          {visible.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-6 text-center">
              <Package className="mx-auto h-8 w-8 text-primary" />
              <p className="mt-2 text-sm font-bold">Your store is ready for its first product</p>
              <p className="text-xs text-muted-foreground">Add products so nearby customers can discover your business.</p>
              <div className="mt-3 flex flex-col gap-2">
                <button
                  onClick={() => nav({ to: "/sell/detailed", search: { storeId: id } as never })}
                  className="rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"
                >
                  Add First Product
                </button>
                <Link to="/store/manage/$id/add-existing" params={{ id }} className="rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold">
                  Add Existing Listing
                </Link>
              </div>
            </div>
          )}

          {visible.map((l) => {
            const a = getAnalytics(l.id);
            const stock = l.storeMeta?.stockStatus ?? "in_stock";
            return (
              <div key={l.id} className="relative rounded-2xl border border-border bg-card p-3">
                <div className="flex gap-3">
                  {l.images[l.cover] ? (
                    <img src={l.images[l.cover]} alt={l.title} className="h-16 w-16 rounded-xl object-cover" />
                  ) : (
                    <div className="grid h-16 w-16 place-items-center rounded-xl bg-secondary"><Package className="h-5 w-5" /></div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="line-clamp-1 flex-1 text-sm font-bold">{l.title}</p>
                      <button onClick={() => setMenu(menu === l.id ? null : l.id)} className="grid h-7 w-7 place-items-center rounded-full hover:bg-secondary">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-sm font-extrabold text-primary">₹{formatINR(l.price)}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-1 text-[10px]">
                      <span className={`rounded-full px-2 py-0.5 font-semibold ${stockTone(stock)}`}>{stockLabel(stock)}</span>
                      <span className="rounded-full bg-secondary px-2 py-0.5 font-semibold text-muted-foreground">{l.status}</span>
                      {l.storeMeta?.featured && <span className="rounded-full bg-yellow-brand/20 px-2 py-0.5 font-semibold text-yellow-brand"><Star className="mr-0.5 inline h-2.5 w-2.5" />Featured</span>}
                    </div>
                    <div className="mt-1 flex gap-3 text-[10px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3" />{a.views}</span>
                      <span className="inline-flex items-center gap-1"><MessageCircle className="h-3 w-3" />{a.chats}</span>
                      <span className="inline-flex items-center gap-1"><Bookmark className="h-3 w-3" />{a.saves}</span>
                    </div>
                  </div>
                </div>

                {menu === l.id && (
                  <div className="absolute right-3 top-12 z-10 w-52 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
                    {[
                      { label: "Edit", fn: () => nav({ to: "/listing/$id/edit", params: { id: l.id } }) },
                      { label: "Mark In Stock", fn: () => setStock(l, "in_stock") },
                      { label: "Mark Low Stock", fn: () => setStock(l, "low_stock") },
                      { label: "Mark Out of Stock", fn: () => setStock(l, "out_of_stock") },
                      { label: l.storeMeta?.featured ? "Unfeature" : "Feature product", fn: () => toggleFeatured(l) },
                      { label: "View analytics", fn: () => nav({ to: "/listing/$id/analytics", params: { id: l.id } }) },
                      { label: "Remove from store", fn: () => { setMenu(null); setConfirmRemove(l.id); }, danger: true },
                    ].map((it) => (
                      <button key={it.label} onClick={it.fn}
                        className={`block w-full px-3 py-2 text-left text-xs font-semibold hover:bg-secondary ${(it as any).danger ? "text-red-600" : ""}`}>
                        {it.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {confirmRemove && (() => {
          const l = rows.find((x) => x.id === confirmRemove);
          if (!l) return null;
          return (
            <div className="fixed inset-0 z-30 flex items-end bg-black/40" onClick={() => setConfirmRemove(null)}>
              <div className="w-full rounded-t-3xl bg-background p-4" onClick={(e) => e.stopPropagation()}>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-extrabold">Remove this product from the store?</p>
                  <button onClick={() => setConfirmRemove(null)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-secondary"><X className="h-4 w-4" /></button>
                </div>
                <p className="mb-3 text-xs text-muted-foreground">
                  The listing can remain active as an individual listing unless you choose to remove it completely.
                </p>
                <button onClick={() => removeFromStore(l, false)}
                  className="mb-2 w-full rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground">
                  Remove only from Store
                </button>
                <button onClick={() => removeFromStore(l, true)}
                  className="mb-2 w-full rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                  Remove Listing Completely
                </button>
                <button onClick={() => setConfirmRemove(null)}
                  className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm font-semibold">
                  Cancel
                </button>
              </div>
            </div>
          );
        })()}

        <BottomNav />
      </div>
    </MobileFrame>
  );
}

function stockLabel(s: string) {
  return {
    in_stock: "In stock",
    low_stock: "Low stock",
    out_of_stock: "Out of stock",
    made_to_order: "Made to order",
    on_enquiry: "On enquiry",
  }[s] ?? "In stock";
}
function stockTone(s: string) {
  switch (s) {
    case "in_stock": return "bg-emerald-100 text-emerald-800";
    case "low_stock": return "bg-amber-100 text-amber-800";
    case "out_of_stock": return "bg-red-100 text-red-800";
    case "made_to_order": return "bg-blue-100 text-blue-800";
    case "on_enquiry": return "bg-secondary text-muted-foreground";
    default: return "bg-secondary text-muted-foreground";
  }
}
