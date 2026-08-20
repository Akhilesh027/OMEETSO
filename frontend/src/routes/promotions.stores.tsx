import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import { listStores, seedStoresIfEmpty } from "@/lib/stores";
import { Store as StoreIcon, ShieldCheck, MapPin, ChevronRight, Search } from "lucide-react";
import { EmptyState } from "@/components/omeetso/EmptyState";

export const Route = createFileRoute("/promotions/stores")({
  head: () => ({ meta: [{ title: "Promote your store — Omeetso" }] }),
  component: SelectStore,
});

function SelectStore() {
  const [q, setQ] = useState("");
  const nav = useNavigate();
  useEffect(() => { seedStoresIfEmpty(); }, []);
  const stores = useMemo(() => listStores().filter((s) => s.status === "active"), []);
  const filt = stores.filter((s) => s.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-16">
        <BackBar title="Promote a store" />
        <div className="px-4">
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search your stores"
              className="w-full bg-transparent text-sm outline-none" aria-label="Search stores" />
          </div>
          <div className="mt-3 space-y-2">
            {filt.length === 0 ? (
              <EmptyState icon={<StoreIcon className="h-6 w-6" />} title="No eligible stores" body="Create or activate a store to run store promotions." ctaLabel="Create Store" onCta={() => nav({ to: "/store/create" })} />
            ) : filt.map((s) => (
              <button key={s.id} onClick={() => nav({ to: "/promotions/new", search: { storeId: s.id, kind: "store" } as any })}
                className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left">
                {s.logo ? <img src={s.logo} alt={s.name} className="h-12 w-12 rounded-xl object-cover" /> :
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-secondary"><StoreIcon className="h-5 w-5" /></div>}
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 flex items-center gap-1 text-sm font-bold">
                    {s.name}
                    {s.verification.mobile && <ShieldCheck className="h-3 w-3 text-emerald-600" />}
                  </p>
                  <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {s.area} • {s.primaryCategory}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </MobileFrame>
  );
}
