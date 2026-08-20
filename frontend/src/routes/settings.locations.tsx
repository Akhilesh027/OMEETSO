import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import { EmptyBlock, SectionTitle } from "@/components/omeetso/account";
import {
  addSavedLocation, deleteSavedLocation, listSavedLocations, subscribeAccount,
  updateSavedLocation, type SavedLocation,
} from "@/lib/account";
import { MapPin, Plus, Trash2, Star, Radar } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/settings/locations")({
  head: () => ({ meta: [{ title: "Location settings — Omeetso" }] }),
  component: LocationsPage,
});

const RADII = [2, 5, 10, 20, 50];

function LocationsPage() {
  const [, setTick] = useState(0);
  useEffect(() => { const u = subscribeAccount(() => setTick((n) => n + 1)); return () => { u(); }; }, []);
  const list = listSavedLocations();

  const [label, setLabel] = useState("");
  const [area, setArea] = useState("");
  const [pincode, setPincode] = useState("");
  const [city, setCity] = useState("Hyderabad");
  const [isDefault, setIsDefault] = useState(false);
  const [radius, setRadius] = useState<number | "city">(() => {
    if (typeof window === "undefined") return 5;
    try { return JSON.parse(localStorage.getItem("omeetso_default_radius") || "5"); } catch { return 5; }
  });

  const save = () => {
    if (!label.trim() || !area.trim() || pincode.length !== 6) { toast.error("Fill label, area and pincode"); return; }
    addSavedLocation({ label, area, pincode, city, isDefault });
    setLabel(""); setArea(""); setPincode(""); setIsDefault(false);
    toast.success("Location saved");
  };

  const chooseRadius = (r: number | "city") => {
    setRadius(r);
    try { localStorage.setItem("omeetso_default_radius", JSON.stringify(r)); } catch {}
    toast.success(r === "city" ? "Radius: city-wide" : `Radius: ${r} km`);
  };

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-16">
        <BackBar title="Location settings" />
        <div className="px-4 pt-2 space-y-3">
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-3 text-[11px] text-blue-900">
            Omeetso uses your approximate location to show relevant nearby products and stores.
          </div>

          <SectionTitle>Default search radius</SectionTitle>
          <div className="flex flex-wrap gap-2 rounded-2xl bg-card p-3 card-elev">
            {RADII.map((r) => (
              <button key={r} onClick={() => chooseRadius(r)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${radius === r ? "border-primary bg-primary/10 text-primary" : "border-border"}`}>
                <Radar className="mr-1 inline h-3 w-3" /> {r} km
              </button>
            ))}
            <button onClick={() => chooseRadius("city")}
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${radius === "city" ? "border-primary bg-primary/10 text-primary" : "border-border"}`}>
              City-wide
            </button>
          </div>

          <SectionTitle>Saved locations</SectionTitle>
          {list.length === 0 ? (
            <EmptyBlock icon={MapPin} title="No saved locations" body="Save home, work or a custom area for quicker access." />
          ) : (
            <div className="space-y-2">
              {list.map((l) => <LocCard key={l.id} l={l} />)}
            </div>
          )}

          <SectionTitle>Add a new location</SectionTitle>
          <div className="rounded-2xl bg-card p-3 card-elev space-y-2 text-sm">
            <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Label (Home, Work…)" className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none" />
            <input value={area} onChange={(e) => setArea(e.target.value)} placeholder="Area (Madhapur, Ameerpet…)" className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none" />
            <div className="grid grid-cols-2 gap-2">
              <input value={pincode} onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" placeholder="Pincode" className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none" />
              <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none" />
            </div>
            <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} /> Set as default</label>
            <button onClick={save} className="w-full rounded-full bg-primary py-2 text-sm font-bold text-primary-foreground">
              <Plus className="mr-1 inline h-4 w-4" /> Save location
            </button>
            <p className="text-[10px] text-muted-foreground">Exact street addresses are not required.</p>
          </div>

          <button onClick={() => { try { localStorage.removeItem("omeetso_recent_locations"); } catch {} toast.success("Recent locations cleared"); }}
            className="w-full rounded-full border border-border bg-card py-3 text-sm font-semibold">Clear recent locations</button>
        </div>
      </div>
    </MobileFrame>
  );
}

function LocCard({ l }: { l: SavedLocation }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-card p-3 card-elev">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary"><MapPin className="h-5 w-5" /></div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <p className="text-sm font-bold">{l.label}</p>
          {l.isDefault && <Star className="h-3 w-3 fill-yellow-brand text-yellow-brand" />}
        </div>
        <p className="text-[11px] text-muted-foreground">{l.area}, {l.city} · {l.pincode}</p>
      </div>
      {!l.isDefault && (
        <button aria-label="Set default" onClick={() => { updateSavedLocation(l.id, { isDefault: true }); toast.success("Default location updated"); }}
          className="rounded-full border border-border px-2 py-1 text-[10px] font-bold">Default</button>
      )}
      <button aria-label="Delete location" onClick={() => { deleteSavedLocation(l.id); toast.success("Deleted"); }}
        className="grid h-8 w-8 place-items-center rounded-full text-rose-700 hover:bg-rose-50">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
