import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, ShieldCheck, X, MapPin, Zap, Video } from "lucide-react";
import { CATEGORIES as STATIC_CATEGORIES, SUBCATEGORIES, AREAS, PRODUCTS } from "@/lib/mock";
import { fetchLiveCategories, getCachedCategories, type LiveCategory } from "@/lib/categories";

type S = {
  q?: string; cat?: string; sub?: string;
  minP?: string; maxP?: string;
  dist?: string; pincode?: string;
  cond?: string; brand?: string; sellerType?: string;
  posted?: string; verified?: string; delivery?: string; pickup?: string;
  hasVideo?: string; quickSale?: string;
  sort?: string; view?: string;
};

export const Route = createFileRoute("/filters")({
  validateSearch: (s: Record<string, unknown>): S => {
    const out: S = {};
    (Object.keys(s) as Array<keyof S>).forEach((k) => {
      const v = s[k];
      if (typeof v === "string") (out as Record<string, string>)[k] = v;
    });
    return out;
  },
  head: () => ({ meta: [{ title: "Filters · Omeetso" }, { name: "description", content: "Refine your product search on Omeetso." }] }),
  component: FiltersPage,
});

function FiltersPage() {
  const nav = useNavigate({ from: "/filters" });
  const search = Route.useSearch();
  const [state, setState] = useState<S>(search);

  const [categories, setCategories] = useState<LiveCategory[]>(() => getCachedCategories());

  useEffect(() => {
    fetchLiveCategories().then((cats) => {
      if (cats && cats.length > 0) setCategories(cats);
    }).catch(() => {});
  }, []);

  const set = <K extends keyof S>(k: K, v: S[K]) => setState((prev) => ({ ...prev, [k]: v }));
  const toggle = (k: keyof S) => setState((p) => ({ ...p, [k]: p[k] ? undefined : "1" }));

  const activeCategoryObj = categories.find((c) => c.id.toLowerCase() === (state.cat || "").toLowerCase());
  const subs = activeCategoryObj?.subcategories || (state.cat ? SUBCATEGORIES[state.cat] ?? [] : []);

  const preview = useMemo(() => {
    let list = PRODUCTS.filter((p) => !p.sponsored);
    if (state.cat) list = list.filter((p) => p.category === state.cat);
    if (state.sub) list = list.filter((p) => p.subcategory === state.sub);
    const min = state.minP ? Number(state.minP) : undefined;
    const max = state.maxP ? Number(state.maxP) : undefined;
    if (min !== undefined) list = list.filter((p) => p.price >= min);
    if (max !== undefined) list = list.filter((p) => p.price <= max);
    if (state.verified === "1") list = list.filter((p) => p.verified);
    if (state.dist) list = list.filter((p) => p.distanceKm <= Number(state.dist));
    if (state.cond) list = list.filter((p) => p.condition.toLowerCase().includes(state.cond!.toLowerCase()));
    return list.length;
  }, [state]);

  const catObj = activeCategoryObj;
  const catAware: Record<string, string[]> = {
    cars: ["Petrol", "Diesel", "Electric", "CNG"],
    mobiles: ["Apple", "Samsung", "OnePlus", "Xiaomi", "Realme"],
    furniture: ["Wood", "Metal", "Plastic", "Fabric"],
  };

  const conditions = ["New", "Like new", "Used – Excellent", "Used – Good", "Used – Fair"];
  const distances = ["2", "5", "10", "25"];
  const posted = ["24h", "3d", "7d", "30d"];
  const sellerTypes = ["Individual", "Business", "Verified only"];

  const reset = () => setState({});
  const apply = () => nav({ to: "/results", search: state as never });

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-28">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-border bg-card px-3 py-3 safe-t">
          <button onClick={() => history.back()} className="grid h-10 w-10 place-items-center rounded-full hover:bg-secondary" aria-label="Back">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="flex-1 text-center text-base font-bold">Filters</h1>
          <button onClick={reset} className="text-xs font-semibold text-destructive">Reset</button>
        </header>

        <div className="space-y-5 p-4">
          <Section title="Category">
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <Chip key={c.id} label={c.name} active={state.cat === c.id} onClick={() => set("cat", state.cat === c.id ? undefined : c.id)} />
              ))}
            </div>
          </Section>

          {subs.length > 0 && (
            <Section title={`Subcategory · ${catObj?.name}`}>
              <div className="flex flex-wrap gap-2">
                {subs.map((s) => (
                  <Chip key={s} label={s} active={state.sub === s} onClick={() => set("sub", state.sub === s ? undefined : s)} />
                ))}
              </div>
            </Section>
          )}

          <Section title="Price range">
            <div className="flex items-center gap-2">
              <NumInput placeholder="Min ₹" value={state.minP} onChange={(v) => set("minP", v)} />
              <span className="text-xs text-muted-foreground">to</span>
              <NumInput placeholder="Max ₹" value={state.maxP} onChange={(v) => set("maxP", v)} />
            </div>
          </Section>

          <Section title="Distance">
            <div className="flex flex-wrap gap-2">
              {distances.map((d) => (
                <Chip key={d} label={`Within ${d} km`} active={state.dist === d} onClick={() => set("dist", state.dist === d ? undefined : d)} />
              ))}
            </div>
          </Section>

          <Section title="Pincode">
            <input
              inputMode="numeric"
              value={state.pincode ?? ""}
              onChange={(e) => set("pincode", e.target.value.replace(/\D/g, "").slice(0, 6) || undefined)}
              placeholder="Enter pincode"
              className="w-full rounded-2xl border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </Section>

          <Section title="Condition">
            <div className="flex flex-wrap gap-2">
              {conditions.map((c) => (
                <Chip key={c} label={c} active={state.cond === c} onClick={() => set("cond", state.cond === c ? undefined : c)} />
              ))}
            </div>
          </Section>

          {state.cat && catAware[state.cat] && (
            <Section title="Brand / Fuel">
              <div className="flex flex-wrap gap-2">
                {catAware[state.cat].map((b) => (
                  <Chip key={b} label={b} active={state.brand === b} onClick={() => set("brand", state.brand === b ? undefined : b)} />
                ))}
              </div>
            </Section>
          )}

          <Section title="Seller type">
            <div className="flex flex-wrap gap-2">
              {sellerTypes.map((s) => (
                <Chip key={s} label={s} active={state.sellerType === s} onClick={() => set("sellerType", state.sellerType === s ? undefined : s)} />
              ))}
            </div>
          </Section>

          <Section title="Posted">
            <div className="flex flex-wrap gap-2">
              {posted.map((p) => (
                <Chip key={p} label={`Last ${p}`} active={state.posted === p} onClick={() => set("posted", state.posted === p ? undefined : p)} />
              ))}
            </div>
          </Section>

          <Section title="Options">
            <div className="space-y-2">
              <Toggle label={<><Zap className="h-3.5 w-3.5 fill-amber-500 text-amber-500" /> ⚡ Quick Sale Items Only</>} active={state.quickSale === "1"} onClick={() => toggle("quickSale")} />
              <Toggle label={<><Video className="h-3.5 w-3.5 text-purple-600" /> 🎬 Listings with Video Only</>} active={state.hasVideo === "1"} onClick={() => toggle("hasVideo")} />
              <Toggle label={<><ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Verified sellers only</>} active={state.verified === "1"} onClick={() => toggle("verified")} />
              <Toggle label="Delivery available" active={state.delivery === "1"} onClick={() => toggle("delivery")} />
              <Toggle label="Pickup available" active={state.pickup === "1"} onClick={() => toggle("pickup")} />
            </div>
          </Section>

          <Section title="Popular areas">
            <div className="flex flex-wrap gap-2">
              {AREAS.slice(0, 6).map((a) => (
                <span key={a} className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1 text-xs">
                  <MapPin className="h-3 w-3" /> {a}
                </span>
              ))}
            </div>
          </Section>
        </div>

        <div className="fixed bottom-0 left-1/2 z-40 flex w-full max-w-[430px] -translate-x-1/2 items-center gap-2 border-t border-border bg-card p-3 safe-b">
          <button onClick={reset} className="rounded-2xl border border-border px-4 py-3 text-sm font-semibold">Reset</button>
          <button onClick={apply} className="flex-1 rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground">
            Show {preview} results
          </button>
        </div>
      </div>
    </MobileFrame>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-sm font-bold">{title}</h2>
      {children}
    </section>
  );
}

function Chip({ label, active, onClick }: { label: string; active?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={
        "rounded-full border px-3 py-1.5 text-xs font-semibold " +
        (active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-secondary")
      }
    >
      {label}
    </button>
  );
}

function NumInput({ placeholder, value, onChange }: { placeholder: string; value?: string; onChange: (v?: string) => void }) {
  return (
    <input
      inputMode="numeric"
      placeholder={placeholder}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, "") || undefined)}
      className="min-w-0 flex-1 rounded-2xl border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
    />
  );
}

function Toggle({ label, active, onClick }: { label: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-2xl border border-border bg-card px-3 py-2.5 text-sm"
    >
      <span className="inline-flex items-center gap-1.5">{label}</span>
      <span className={"grid h-6 w-10 items-center rounded-full p-0.5 transition " + (active ? "bg-primary" : "bg-secondary")}>
        <span className={"h-5 w-5 rounded-full bg-white transition " + (active ? "ml-4" : "ml-0")}>
          {active && <X className="hidden" />}
        </span>
      </span>
    </button>
  );
}
