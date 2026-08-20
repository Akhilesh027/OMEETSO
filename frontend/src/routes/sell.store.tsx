import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import { BottomNav } from "@/components/omeetso/BottomNav";
import { listStores, seedStoresIfEmpty, getSelectedStoreId, setSelectedStoreId } from "@/lib/stores";
import { Store as StoreIcon, ArrowRight, Sparkles, ShieldCheck, Users } from "lucide-react";

export const Route = createFileRoute("/sell/store")({
  head: () => ({ meta: [{ title: "Sell through your store — Omeetso" }] }),
  component: SellStoreEntry,
});

function SellStoreEntry() {
  const nav = useNavigate();
  useEffect(() => {
    seedStoresIfEmpty();
    const stores = listStores();
    if (stores.length === 0) return;
    // If exactly one store, go straight to product add flow
    if (stores.length === 1) {
      setSelectedStoreId(stores[0].id);
      nav({ to: "/store/manage/$id", params: { id: stores[0].id } });
      return;
    }
    // Multiple stores → selection
    const preferred = getSelectedStoreId();
    if (preferred && stores.some((s) => s.id === preferred)) {
      nav({ to: "/store/manage/$id", params: { id: preferred } });
    } else {
      nav({ to: "/store/select" });
    }
  }, [nav]);

  const stores = listStores();
  if (stores.length > 0) {
    return (
      <MobileFrame>
        <div className="min-h-dvh bg-background pb-28">
          <BackBar title="Sell through Store" />
          <div className="p-6 text-center text-sm text-muted-foreground">Opening your store…</div>
          <BottomNav />
        </div>
      </MobileFrame>
    );
  }

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-28">
        <BackBar title="Sell through Store" />
        <div className="px-5 py-8 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary">
            <StoreIcon className="h-7 w-7" />
          </div>
          <h1 className="mt-3 text-xl font-extrabold">Create your Omeetso store</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Build your local business presence, showcase products and connect with nearby customers.
          </p>

          <div className="mt-6 grid grid-cols-3 gap-2 text-left text-[11px]">
            <div className="rounded-2xl border border-border bg-card p-3">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <p className="mt-1 font-semibold">Verified badge</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-3">
              <Users className="h-4 w-4 text-primary" />
              <p className="mt-1 font-semibold">Followers</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-3">
              <Sparkles className="h-4 w-4 text-primary" />
              <p className="mt-1 font-semibold">Multiple products</p>
            </div>
          </div>

          <button
            onClick={() => nav({ to: "/store/create" })}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground"
          >
            Create Store <ArrowRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => nav({ to: "/sell" })}
            className="mt-2 inline-flex w-full items-center justify-center rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold"
          >
            Learn About Omeetso Stores
          </button>
        </div>
        <BottomNav />
      </div>
    </MobileFrame>
  );
}
