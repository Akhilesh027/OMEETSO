import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import { BottomNav } from "@/components/omeetso/BottomNav";
import { fetchLiveUserStores, subscribe, setSelectedStoreId, STORE_STATUS_LABEL, type Store } from "@/lib/stores";
import { listListings } from "@/lib/listings";
import { Plus, Store as StoreIcon, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/store/select")({
  head: () => ({ meta: [{ title: "Select store — Omeetso" }] }),
  component: SelectStore,
});

function SelectStore() {
  const nav = useNavigate();
  const [stores, setStores] = useState<Store[]>([]);
  useEffect(() => {
    fetchLiveUserStores().then((liveStores) => setStores(liveStores));
    const unsub = subscribe(async () => {
      const liveStores = await fetchLiveUserStores();
      setStores(liveStores);
    });
    return () => { unsub(); };
  }, []);

  function pick(s: Store) {
    setSelectedStoreId(s.id);
    nav({ to: "/store/manage/$id", params: { id: s.id } });
  }

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-28">
        <BackBar title="Your stores" right={
          <Link to="/store/create" className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground">
            <Plus className="h-3.5 w-3.5" /> New
          </Link>
        } />
        <div className="p-4 space-y-3">
          {stores.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-6 text-center">
              <StoreIcon className="mx-auto h-8 w-8 text-primary" />
              <p className="mt-2 text-sm font-bold">No stores yet</p>
              <p className="text-xs text-muted-foreground">Create your first Omeetso store to publish store products.</p>
              <Link to="/store/create" className="mt-3 inline-block rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground">Create Store</Link>
            </div>
          )}
          {stores.map((s) => {
            const products = listListings().filter((l) => l.storeId === s.id).length;
            return (
              <button key={s.id} onClick={() => pick(s)} className="block w-full rounded-2xl border border-border bg-card p-3 text-left">
                <div className="flex gap-3">
                  <div className="grid h-14 w-14 place-items-center overflow-hidden rounded-2xl bg-secondary">
                    {s.logo ? <img src={s.logo} alt={s.name} className="h-full w-full object-cover" /> : <StoreIcon className="h-6 w-6" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <p className="truncate text-sm font-bold">{s.name}</p>
                      {s.status === "active" && Object.values(s.verification).filter(Boolean).length >= 3 && (
                        <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                      )}
                    </div>
                    <p className="truncate text-[11px] text-muted-foreground">{s.primaryCategory} · {s.area}, {s.city}</p>
                    <div className="mt-1 flex items-center gap-2 text-[11px]">
                      <span className={`rounded-full px-2 py-0.5 font-semibold ${statusTone(s.status)}`}>{STORE_STATUS_LABEL[s.status]}</span>
                      <span className="text-muted-foreground">{products} product{products === 1 ? "" : "s"}</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        <BottomNav />
      </div>
    </MobileFrame>
  );
}

function statusTone(s: Store["status"]): string {
  switch (s) {
    case "active": return "bg-emerald-100 text-emerald-800";
    case "under_review": return "bg-blue-100 text-blue-800";
    case "requires_changes": return "bg-amber-100 text-amber-800";
    case "rejected": return "bg-red-100 text-red-800";
    case "paused": case "suspended": return "bg-secondary text-muted-foreground";
    default: return "bg-secondary text-muted-foreground";
  }
}
