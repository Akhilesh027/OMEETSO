import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import { BottomNav } from "@/components/omeetso/BottomNav";
import { getStore, storeOpenState, subscribe, fetchLiveUserStores, type Store, STORE_STATUS_LABEL } from "@/lib/stores";
import { listListings, formatINR } from "@/lib/listings";
import { ShieldCheck, Star, MapPin, Clock, Truck, Phone, MessageCircle, Navigation, Store as StoreIcon, Package, CheckCircle2, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/store/manage/$id/preview")({
  head: () => ({ meta: [{ title: "Store preview — Omeetso" }] }),
  component: StorePreview,
});

function StorePreview() {
  const { id } = Route.useParams();
  const [s, setS] = useState<Store | undefined>();

  useEffect(() => {
    fetchLiveUserStores().then(() => setS(getStore(id)));
    const unsub = subscribe(() => setS(getStore(id)));
    return () => { unsub(); };
  }, [id]);

  if (!s) return <MobileFrame><div className="min-h-dvh bg-background"><BackBar title="Preview" /><p className="p-6 text-center text-sm text-muted-foreground">Store not found.</p></div></MobileFrame>;

  const products = listListings().filter((l) => (l.storeId === id || (l as any).store === id) && (l.status === "active" || l.status === "approved" || l.status === "APPROVED"));
  const verified = Object.values(s.verification || {}).filter(Boolean).length >= 1;
  const openState = storeOpenState(s);

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-28 md:mx-auto md:max-w-[800px] md:px-6">
        <BackBar title="Store preview" right={
          <Link to="/store/manage/$id" params={{ id }} className="text-xs font-bold text-primary">Dashboard</Link>
        } />

        {/* Hero banner & branding */}
        <div className="relative h-40 w-full overflow-hidden rounded-b-3xl bg-slate-900 md:rounded-3xl shadow-sm">
          {s.cover ? (
            <img src={s.cover} alt={s.name} className="h-full w-full object-cover opacity-90" />
          ) : (
            <div className="h-full w-full bg-gradient-to-r from-navy via-slate-800 to-navy" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </div>

        <div className="-mt-12 px-4 md:px-6">
          <div className="flex items-end justify-between">
            <div className="grid h-24 w-24 place-items-center overflow-hidden rounded-3xl border-4 border-background bg-card shadow-lg">
              {s.logo ? <img src={s.logo} alt={s.name} className="h-full w-full object-cover" /> : <StoreIcon className="h-10 w-10 text-muted-foreground" />}
            </div>
            <span className="rounded-full bg-navy px-3 py-1 text-xs font-bold text-white shadow">
              {STORE_STATUS_LABEL[s.status]}
            </span>
          </div>

          <div className="mt-3">
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl font-black tracking-tight">{s.name}</h1>
              {verified && <ShieldCheck className="h-5 w-5 text-emerald-600 fill-emerald-100" aria-label="Verified store" />}
            </div>
            {s.tagline && <p className="mt-0.5 text-xs font-semibold text-muted-foreground">{s.tagline}</p>}

            <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[11px]">
              <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 font-bold">
                <StoreIcon className="h-3 w-3 text-muted-foreground" /> {s.businessType || "Retail Store"}
              </span>
              {s.rating ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 font-bold text-amber-800 border border-amber-200">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {s.rating.toFixed(1)} · {s.reviewCount ?? 0} reviews
                </span>
              ) : (
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-bold text-emerald-800 border border-emerald-200">New Store</span>
              )}
              <span className={`rounded-full px-2.5 py-1 font-bold border ${openState.open ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-slate-100 text-slate-700 border-slate-200"}`}>
                {openState.label}
              </span>
            </div>
          </div>
        </div>

        {/* Contact Quick Actions */}
        <div className="mt-4 grid grid-cols-4 gap-2.5 px-4 md:px-6">
          <QuickAction icon={MessageCircle} label="Chat" />
          <QuickAction icon={Phone} label="Call" />
          <QuickAction icon={MessageCircle} label="WhatsApp" />
          <QuickAction icon={Navigation} label="Directions" />
        </div>

        {/* Store Description */}
        <Section label="About Store">
          <p className="text-xs font-medium leading-relaxed text-foreground/90">{s.description || "Welcome to our store on Omeetso Marketplace."}</p>
        </Section>

        {/* Store Location */}
        <Section label="Location & Address">
          <div className="flex items-start gap-2 text-xs">
            <MapPin className="h-4 w-4 shrink-0 text-navy mt-0.5" />
            <div>
              <p className="font-bold text-foreground">{s.area}, {s.city} — {s.pincode}</p>
              {s.address && <p className="mt-0.5 text-muted-foreground">{s.address}{s.landmark ? ` (Near ${s.landmark})` : ""}</p>}
            </div>
          </div>
        </Section>

        {/* Operating Hours */}
        <Section label="Operating Hours">
          <div className="space-y-1 text-xs">
            {s.is24x7 ? (
              <p className="font-bold text-emerald-700">Open 24 Hours · 7 Days a week</p>
            ) : s.workingHours && s.workingHours.length > 0 ? (
              s.workingHours.map((w) => (
                <div key={w.day} className="flex items-center justify-between border-b border-border/40 py-1 last:border-0">
                  <span className="font-semibold text-muted-foreground">{w.day}</span>
                  <span className="font-bold">{w.closed ? <span className="text-rose-600">Closed</span> : `${w.open} – ${w.close}`}</span>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground font-medium">Monday to Saturday: 10:00 AM – 8:00 PM</p>
            )}
          </div>
        </Section>

        {/* Delivery & Fulfillment */}
        <Section label="Delivery & Pickup Services">
          <ul className="space-y-1.5 text-xs">
            <li className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> In-store pickup available
            </li>
            <li className="flex items-center gap-2 font-medium">
              <Truck className="h-3.5 w-3.5 text-navy" /> Local delivery within {s.delivery?.radiusKm || 10} km
            </li>
            {s.delivery?.freeAbove && s.delivery.freeAbove > 0 ? (
              <li className="flex items-center gap-2 font-medium text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Free delivery above ₹{formatINR(s.delivery.freeAbove)}
              </li>
            ) : null}
          </ul>
        </Section>

        {/* Active Store Products */}
        <Section label={`Store Catalog (${products.length})`}>
          {products.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
              <Package className="mx-auto mb-2 h-6 w-6 text-muted-foreground/60" />
              <p className="font-bold text-foreground">No active products listed</p>
              <p className="mt-1">Add items to your store from the dashboard to showcase here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {products.map((p) => (
                <Link key={p.id} to="/product/$id" params={{ id: p.id }} className="group overflow-hidden rounded-2xl border border-border bg-background shadow-sm transition-all hover:shadow-md">
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-secondary">
                    {p.images && p.images[p.cover || 0] ? (
                      <img src={p.images[p.cover || 0]} alt={p.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-muted-foreground"><Package className="h-6 w-6" /></div>
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="line-clamp-1 text-xs font-bold">{p.title}</p>
                    <p className="mt-1 text-xs font-black text-navy">₹{formatINR(p.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Section>

        <BottomNav />
      </div>
    </MobileFrame>
  );
}

function QuickAction({ icon: Icon, label }: { icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <button type="button" className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-border bg-card p-3 text-[11px] font-bold text-foreground shadow-sm transition-all hover:bg-secondary">
      <Icon className="h-4 w-4 text-navy" /> {label}
    </button>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-4 px-4 md:px-6">
      <p className="mb-1.5 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">{label}</p>
      <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">{children}</div>
    </div>
  );
}
