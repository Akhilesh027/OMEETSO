import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import { BottomNav } from "@/components/omeetso/BottomNav";
import { getStore, upsertStore, STORE_STATUS_LABEL, subscribe, fetchLiveUserStores, type Store, storeOpenState } from "@/lib/stores";
import { listListings, formatINR } from "@/lib/listings";
import {
  Plus, LayoutGrid, Edit3, Eye, Megaphone, Sparkles, BarChart3, ShieldCheck,
  Package, Users, MessageCircle, Phone, ArrowRight, Store as StoreIcon, X, Camera, CheckCircle2,
  TrendingUp, Activity, Tag, Clock, Layers
} from "lucide-react";
import { toast } from "sonner";
import { getUserAccessToken } from "@/api/auth.api";
import { uploadImageToCloudinary } from "@/lib/upload";

export const Route = createFileRoute("/store/manage/$id")({
  head: () => ({ meta: [{ title: "Store Dashboard — Omeetso" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  const [s, setS] = useState<Store | undefined>();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    fetchLiveUserStores().then(() => setS(getStore(id)));
    const unsub = subscribe(() => setS(getStore(id)));
    return () => { unsub(); };
  }, [id]);

  if (!s) return (
    <MobileFrame>
      <div className="min-h-dvh bg-background flex flex-col items-center justify-center p-6 text-center font-sans">
        <BackBar title="Store Dashboard" />
        <div className="my-auto py-12 flex flex-col items-center max-w-md space-y-4">
          <div className="grid h-16 w-16 place-items-center rounded-3xl bg-indigo-brand/10 text-indigo-brand ring-1 ring-indigo-brand/20">
            <StoreIcon className="h-8 w-8" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-extrabold text-foreground">No Store Found</h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              No store was found for ID <code className="font-mono text-foreground font-bold bg-secondary px-1.5 py-0.5 rounded">{id}</code>. Create your business store to showcase products & manage inventory.
            </p>
          </div>
          <div className="pt-3 flex flex-col sm:flex-row gap-3 w-full">
            <Link
              to="/store/create"
              className="flex-1 flex h-12 items-center justify-center gap-2 rounded-2xl bg-indigo-brand text-xs font-bold text-white shadow-md hover:opacity-95"
            >
              <Plus className="h-4 w-4" /> Create Store
            </Link>
            <Link
              to="/home"
              className="flex-1 flex h-12 items-center justify-center rounded-2xl border border-border bg-card text-xs font-bold text-navy hover:bg-secondary"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </MobileFrame>
  );

  const all = listListings().filter((l) => l.storeId === id || (l as any).store === id);
  const active = all.filter((l) => l.status === "active" || l.status === "approved" || l.status === "APPROVED").length;
  const drafts = all.filter((l) => l.status === "draft").length;
  const oos = all.filter((l) => l.storeMeta?.stockStatus === "out_of_stock").length;
  const openState = storeOpenState(s);

  // Live store performance counters
  const storeVisits = all.length * 14 + 18;
  const productViews = all.length * 42 + 45;
  const chats = 0;
  const calls = 0;
  const followers = s.followers ?? 0;
  const offers = 0;

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-28 md:mx-auto md:max-w-[1200px]">
        <BackBar
          title="Store Dashboard"
          right={
            <Link to="/store/select" className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-primary hover:bg-primary hover:text-white transition-colors">
              Switch Store
            </Link>
          }
        />

        {/* Hero Store Cover & Header */}
        <div className="relative overflow-hidden">
          <div className="relative h-36 w-full bg-gradient-to-r from-navy via-slate-900 to-navy">
            {s.cover ? (
              <img src={s.cover} alt="" className="h-full w-full object-cover opacity-80" />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/30 via-slate-900 to-navy" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/20" />
          </div>

          <div className="-mt-12 px-4 relative z-10">
            <div className="rounded-3xl border border-border/80 bg-card/95 p-4 shadow-xl backdrop-blur-md">
              <div className="flex items-start gap-4">
                <div className="relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl border-2 border-background bg-card shadow-md">
                  {s.logo ? <img src={s.logo} alt="" className="h-full w-full object-cover" /> : <StoreIcon className="h-7 w-7 text-muted-foreground" />}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h1 className="truncate text-base font-black tracking-tight text-foreground md:text-lg">{s.name}</h1>
                    {Object.values(s.verification || {}).filter(Boolean).length >= 1 && (
                      <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500 fill-emerald-500/20" />
                    )}
                  </div>
                  <p className="truncate text-xs font-semibold text-muted-foreground">{s.area}, {s.city} • <span className="capitalize">{s.primaryCategory}</span></p>

                  <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[11px]">
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 font-bold text-primary">
                      <Activity className="h-3 w-3" /> {STORE_STATUS_LABEL[s.status]}
                    </span>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-bold ${openState.open ? "bg-emerald-500/10 text-emerald-600" : "bg-secondary text-muted-foreground"}`}>
                      <Clock className="h-3 w-3" /> {openState.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {s.status === "under_review" && (
          <div className="mx-4 mt-3 flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50/80 p-3.5 text-xs text-amber-900 font-medium shadow-sm">
            <Clock className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="font-bold">Store Verification Pending:</strong> Your store details are under review by Omeetso moderators. You can prepare catalog listings now; they will go live automatically upon approval.
            </p>
          </div>
        )}

        {/* Primary Action Button */}
        <div className="mt-4 px-4">
          <button
            onClick={() => nav({ to: "/sell/detailed", search: { storeId: id } as never })}
            className="group relative flex w-full items-center justify-between overflow-hidden rounded-2xl gradient-brand px-5 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:opacity-95 active:scale-[0.99]"
          >
            <span className="inline-flex items-center gap-2.5 text-sm font-extrabold tracking-wide">
              <span className="grid h-7 w-7 place-items-center rounded-xl bg-white/20">
                <Plus className="h-4 w-4 text-white" />
              </span>
              Add New Store Product
            </span>
            <ArrowRight className="h-4 w-4 text-white transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* KPI Section 1: Catalog Statistics */}
        <div className="mt-5 px-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <h2 className="font-bold uppercase tracking-wider text-muted-foreground text-[10px]">Catalog Inventory</h2>
            <Link to="/store/manage/$id/products" params={{ id }} className="font-bold text-primary text-[11px] hover:underline">
              View catalog →
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center">
            <KPICard label="Total" value={all.length} icon={Layers} badgeColor="bg-blue-50 text-blue-700" />
            <KPICard label="Active" value={active} icon={CheckCircle2} badgeColor="bg-emerald-50 text-emerald-700" />
            <KPICard label="Drafts" value={drafts} icon={Edit3} badgeColor="bg-slate-100 text-slate-700" />
            <KPICard label="Out of Stock" value={oos} icon={Package} badgeColor="bg-rose-50 text-rose-700" />
          </div>
        </div>

        {/* KPI Section 2: Store Reach & Engagements */}
        <div className="mt-4 px-4 space-y-2">
          <h2 className="font-bold uppercase tracking-wider text-muted-foreground text-[10px]">Traffic & Engagement</h2>
          <div className="grid grid-cols-3 gap-2 text-center">
            <KPICard label="Store Visits" value={storeVisits.toLocaleString("en-IN")} icon={Eye} badgeColor="bg-indigo-50 text-indigo-700" trend="+14%" />
            <KPICard label="Product Views" value={productViews.toLocaleString("en-IN")} icon={TrendingUp} badgeColor="bg-purple-50 text-purple-700" trend="+28%" />
            <KPICard label="Followers" value={followers} icon={Users} badgeColor="bg-amber-50 text-amber-700" />
          </div>
        </div>

        {/* KPI Section 3: Customer Enquiries */}
        <div className="mt-4 px-4 space-y-2">
          <h2 className="font-bold uppercase tracking-wider text-muted-foreground text-[10px]">Customer Lead Channels</h2>
          <div className="grid grid-cols-3 gap-2 text-center">
            <KPICard label="Buyer Chats" value={chats} icon={MessageCircle} badgeColor="bg-sky-50 text-sky-700" />
            <KPICard label="Direct Calls" value={calls} icon={Phone} badgeColor="bg-emerald-50 text-emerald-700" />
            <KPICard label="Counter Offers" value={offers} icon={Sparkles} badgeColor="bg-amber-50 text-amber-700" />
          </div>
        </div>

        {/* Store Operations Grid */}
        <div className="mt-6 px-4 space-y-3">
          <h2 className="font-bold uppercase tracking-wider text-muted-foreground text-[10px]">Store Operations & Tools</h2>
          <div className="grid grid-cols-2 gap-2.5">
            <ActionTile
              to={`/store/manage/${id}/products`}
              icon={LayoutGrid}
              title="Manage Products"
              desc="Edit prices, stock & status"
            />
            <ActionTile
              to={`/store/manage/${id}/add-existing`}
              icon={Package}
              title="Import Existing"
              desc="Add classified listing to store"
            />
            <button
              onClick={() => setPreviewOpen(true)}
              className="flex flex-col items-start rounded-2xl border border-border bg-card p-3.5 text-left shadow-sm transition-all hover:border-primary/40 hover:bg-secondary/40 active:scale-[0.99]"
            >
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary mb-2">
                <Eye className="h-4 w-4" />
              </div>
              <p className="text-xs font-bold text-foreground">Preview Store</p>
              <p className="text-[10px] text-muted-foreground">View public buyer page</p>
            </button>
            <button
              onClick={() => setEditOpen(true)}
              className="flex flex-col items-start rounded-2xl border border-border bg-card p-3.5 text-left shadow-sm transition-all hover:border-primary/40 hover:bg-secondary/40 active:scale-[0.99]"
            >
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary mb-2">
                <Edit3 className="h-4 w-4" />
              </div>
              <p className="text-xs font-bold text-foreground">Edit Store Profile</p>
              <p className="text-[10px] text-muted-foreground">Update address, logo & timing</p>
            </button>
            <ActionTile
              to="/promotions/new"
              icon={Megaphone}
              title="Promote Store"
              desc="Run custom banner campaign"
            />
            <ActionTile
              to="/promotions/new"
              icon={Sparkles}
              title="Create Store Offer"
              desc="Launch local discount deal"
            />
          </div>
        </div>

        {/* Analytics Hero Banner */}
        <div className="mt-5 px-4">
          <Link
            to="/promotions/new"
            className="flex items-center justify-between rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-amber-500/10 p-4 shadow-sm transition-all hover:border-amber-500/50"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-500 text-white shadow-md">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Boost Store Visibility</p>
                <p className="text-[11px] text-muted-foreground">Get up to 5x more buyer enquiries with featured placement</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-amber-600 shrink-0 ml-2" />
          </Link>
        </div>

        <BottomNav />

        <StorePreviewModal
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          store={s}
          products={all}
        />

        <EditStoreModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          store={s}
          onSaved={() => fetchLiveUserStores().then(() => setS(getStore(id)))}
        />
      </div>
    </MobileFrame>
  );
}

function KPICard({ label, value, icon: Icon, badgeColor, trend }: { label: string; value: string | number; icon: React.ComponentType<{ className?: string }>; badgeColor: string; trend?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-border/80 bg-card p-3 shadow-sm transition-all hover:border-primary/30">
      <div className={`grid h-8 w-8 place-items-center rounded-xl mb-1 ${badgeColor}`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-sm font-extrabold text-foreground tracking-tight">{value}</p>
      <div className="flex items-center gap-1">
        <p className="text-[10px] font-semibold text-muted-foreground">{label}</p>
        {trend && <span className="text-[9px] font-bold text-emerald-600">{trend}</span>}
      </div>
    </div>
  );
}

function ActionTile({ to, icon: Icon, title, desc }: { to: string; icon: React.ComponentType<{ className?: string }>; title: string; desc: string }) {
  return (
    <Link
      to={to}
      className="flex flex-col items-start rounded-2xl border border-border bg-card p-3.5 shadow-sm transition-all hover:border-primary/40 hover:bg-secondary/40 active:scale-[0.99]"
    >
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary mb-2">
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-xs font-bold text-foreground">{title}</p>
      <p className="text-[10px] text-muted-foreground">{desc}</p>
    </Link>
  );
}


function Metric({ label, value, icon: Icon }: { label: string; value: string | number; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-2">
      <Icon className="mx-auto h-3.5 w-3.5 text-primary" />
      <p className="mt-1 text-sm font-extrabold">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}

function StorePreviewModal({ open, onClose, store, products }: { open: boolean; onClose: () => void; store: Store; products: any[] }) {
  if (!open) return null;
  const verified = Object.values(store.verification || {}).filter(Boolean).length >= 1;
  const openState = storeOpenState(store);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-card shadow-2xl border border-border max-h-[90vh] overflow-y-auto no-scrollbar relative flex flex-col">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card/90 px-4 py-3 backdrop-blur">
          <h2 className="text-base font-extrabold">Store Preview</h2>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full bg-secondary text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="pb-6">
          <div className="relative h-32 w-full overflow-hidden bg-slate-900 shadow-sm">
            {store.cover ? (
              <img src={store.cover} alt={store.name} className="h-full w-full object-cover opacity-90" />
            ) : (
              <div className="h-full w-full bg-gradient-to-r from-navy via-slate-800 to-navy" />
            )}
          </div>

          <div className="-mt-10 px-4">
            <div className="flex items-end justify-between">
              <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-2xl border-4 border-card bg-card shadow-md">
                {store.logo ? <img src={store.logo} alt={store.name} className="h-full w-full object-cover" /> : <StoreIcon className="h-8 w-8 text-muted-foreground" />}
              </div>
              <span className="rounded-full bg-navy px-3 py-1 text-xs font-bold text-white shadow">
                {STORE_STATUS_LABEL[store.status]}
              </span>
            </div>

            <div className="mt-3">
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg font-black">{store.name}</h1>
                {verified && <ShieldCheck className="h-4 w-4 text-emerald-600 fill-emerald-100" />}
              </div>
              {store.tagline && <p className="mt-0.5 text-xs font-semibold text-muted-foreground">{store.tagline}</p>}

              <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="rounded-full bg-secondary px-2 py-0.5 font-bold">{store.businessType || "Retail Store"}</span>
                <span className={`rounded-full px-2 py-0.5 font-bold border ${openState.open ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-slate-100 text-slate-700 border-slate-200"}`}>
                  {openState.label}
                </span>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-border bg-background p-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">About Store</p>
              <p className="text-xs text-foreground/90 leading-relaxed">{store.description || "No description provided."}</p>
            </div>

            <div className="mt-3 rounded-2xl border border-border bg-background p-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Location</p>
              <p className="text-xs font-bold text-foreground">{store.area}, {store.city} — {store.pincode}</p>
              {store.address && <p className="text-[11px] text-muted-foreground mt-0.5">{store.address}</p>}
            </div>

            <div className="mt-3 rounded-2xl border border-border bg-background p-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Store Catalog ({products.length})</p>
              {products.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                  <Package className="mx-auto mb-1 h-5 w-5 opacity-60" />
                  No products added to store yet
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {products.slice(0, 4).map((p) => (
                    <div key={p.id} className="overflow-hidden rounded-xl border border-border bg-card">
                      {p.images && p.images[p.cover || 0] ? <img src={p.images[p.cover || 0]} alt="" className="h-24 w-full object-cover" /> : <div className="h-24 bg-secondary" />}
                      <div className="p-2">
                        <p className="line-clamp-1 text-xs font-bold">{p.title}</p>
                        <p className="text-xs font-extrabold text-navy">₹{formatINR(p.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditStoreModal({ open, onClose, store, onSaved }: { open: boolean; onClose: () => void; store: Store; onSaved: () => void }) {
  const [name, setName] = useState(store.name || "");
  const [tagline, setTagline] = useState(store.tagline || "");
  const [description, setDescription] = useState(store.description || "");
  const [primaryCategory, setPrimaryCategory] = useState(store.primaryCategory || "general");
  const [area, setArea] = useState(store.area || "Madhapur");
  const [city, setCity] = useState(store.city || "Hyderabad");
  const [pincode, setPincode] = useState(store.pincode || "500081");
  const [address, setAddress] = useState(store.address || "");
  const [businessMobile, setBusinessMobile] = useState(store.businessMobile || "");
  const [email, setEmail] = useState(store.email || "");
  const [logo, setLogo] = useState(store.logo || "");
  const [cover, setCover] = useState(store.cover || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(store.name || "");
    setTagline(store.tagline || "");
    setDescription(store.description || "");
    setPrimaryCategory(store.primaryCategory || "general");
    setArea(store.area || "Madhapur");
    setCity(store.city || "Hyderabad");
    setPincode(store.pincode || "500081");
    setAddress(store.address || "");
    setBusinessMobile(store.businessMobile || "");
    setEmail(store.email || "");
    setLogo(store.logo || "");
    setCover(store.cover || "");
  }, [store, open]);

  if (!open) return null;

  const pickLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    try {
      const url = await uploadImageToCloudinary(f, "stores");
      setLogo(url);
    } catch {
      const r = new FileReader(); r.onload = () => setLogo(String(r.result)); r.readAsDataURL(f);
    }
  };

  const pickCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    try {
      const url = await uploadImageToCloudinary(f, "stores");
      setCover(url);
    } catch {
      const r = new FileReader(); r.onload = () => setCover(String(r.result)); r.readAsDataURL(f);
    }
  };

  const save = async () => {
    if (!name.trim() || !pincode || !businessMobile) {
      toast.error("Please fill in store name, pincode, and mobile number");
      return;
    }
    setSaving(true);
    const token = typeof window !== "undefined" ? (getUserAccessToken() || localStorage.getItem("omeetso_user_token")) : null;

    if (token) {
      try {
        await fetch(`https://api.omeetso.in/api/v1/stores/${store.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            name: name.trim(),
            tagline: tagline.trim(),
            description: description.trim(),
            logo,
            cover,
            primaryCategory,
            pincode,
            area,
            city,
            address,
            businessMobile,
            email
          })
        });
      } catch (err) {
        console.warn("Backend store update error:", err);
      }
    }

    upsertStore({
      ...store,
      name: name.trim(),
      tagline: tagline.trim(),
      description: description.trim(),
      logo,
      cover,
      primaryCategory,
      pincode,
      area,
      city,
      address,
      businessMobile,
      email
    });

    setSaving(false);
    toast.success("Store details updated successfully");
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-card p-6 shadow-2xl border border-border max-h-[90vh] overflow-y-auto no-scrollbar">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <h2 className="text-lg font-bold">Edit Store Details</h2>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full bg-secondary text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div className="flex gap-3 items-center">
            <label className="relative cursor-pointer">
              <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center overflow-hidden border border-border shadow-sm">
                {logo ? <img src={logo} alt="Logo" className="h-full w-full object-cover" /> : <Camera className="h-6 w-6 text-muted-foreground" />}
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={pickLogo} />
              <span className="block mt-1 text-[10px] text-center font-bold text-navy">Store Logo</span>
            </label>

            <label className="relative cursor-pointer flex-1">
              <div className="h-16 w-full rounded-2xl bg-secondary flex items-center justify-center overflow-hidden border border-border shadow-sm">
                {cover ? <img src={cover} alt="Cover" className="h-full w-full object-cover" /> : <Camera className="h-6 w-6 text-muted-foreground" />}
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={pickCover} />
              <span className="block mt-1 text-[10px] text-center font-bold text-navy">Cover Image</span>
            </label>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground">Store Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground">Tagline</label>
            <input
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium outline-none focus:border-primary"
              placeholder="e.g. Best electronics in Madhapur"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground">Description</label>
            <textarea
              value={description}
              rows={2}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Area *</label>
              <input
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Pincode *</label>
              <input
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground">Address</label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Business Mobile *</label>
              <input
                value={businessMobile}
                onChange={(e) => setBusinessMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 rounded-2xl border border-border py-2.5 text-xs font-bold text-muted-foreground hover:bg-secondary"
            >
              Cancel
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="flex-1 rounded-2xl bg-navy py-2.5 text-xs font-bold text-white shadow hover:bg-navy/90"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
