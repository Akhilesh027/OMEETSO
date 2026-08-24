import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { MapPin, LocateFixed, Search, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { fetchAreaFromPincode, detectDeviceLocation } from "@/lib/location";
import { AREA_PINCODES } from "@/lib/mock";

const POPULAR_CITIES = [
  {
    city: "Hyderabad",
    state: "Telangana",
    defaultPin: "500081",
    areas: [
      { name: "Madhapur", pincode: "500081" },
      { name: "Gachibowli", pincode: "500032" },
      { name: "Kukatpally", pincode: "500072" },
      { name: "Banjara Hills", pincode: "500034" },
      { name: "Kondapur", pincode: "500084" },
      { name: "Hitec City", pincode: "500081" },
      { name: "Jubilee Hills", pincode: "500033" }
    ]
  },
  {
    city: "Bangalore",
    state: "Karnataka",
    defaultPin: "560034",
    areas: [
      { name: "Koramangala", pincode: "560034" },
      { name: "Indiranagar", pincode: "560038" },
      { name: "Whitefield", pincode: "560066" },
      { name: "HSR Layout", pincode: "560102" },
      { name: "Electronic City", pincode: "560100" },
      { name: "MG Road", pincode: "560001" }
    ]
  },
  {
    city: "Mumbai",
    state: "Maharashtra",
    defaultPin: "400050",
    areas: [
      { name: "Bandra West", pincode: "400050" },
      { name: "Andheri West", pincode: "400053" },
      { name: "Powai", pincode: "400076" },
      { name: "Fort", pincode: "400001" },
      { name: "Juhu", pincode: "400049" }
    ]
  }
];

export function LocationModal({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect?: (loc: { area: string; pincode: string }) => void;
}) {
  const [query, setQuery] = useState("");
  const [fetchingGeo, setFetchingGeo] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string>("Hyderabad");
  const [currentLoc, setCurrentLoc] = useState<{ area: string; pincode: string } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    try {
      const stored = localStorage.getItem("omeetso_selected_location") || localStorage.getItem("omeetso_location");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.area) {
          setCurrentLoc(parsed);
          setQuery(parsed.area || parsed.pincode || "");
          if (parsed.area?.toLowerCase().includes("mumbai") || parsed.city?.toLowerCase().includes("mumbai")) {
            setSelectedCity("Mumbai");
          } else if (parsed.area?.toLowerCase().includes("bangalore") || parsed.city?.toLowerCase().includes("bangalore") || parsed.pincode?.startsWith("560")) {
            setSelectedCity("Bangalore");
          } else {
            setSelectedCity("Hyderabad");
          }
        }
      }
    } catch { /* ignore */ }
  }, [open]);

  const saveLocation = (loc: { area: string; pincode: string }) => {
    const payload = JSON.stringify({ ...loc, savedAt: Date.now() });
    localStorage.setItem("omeetso_location", payload);
    localStorage.setItem("omeetso_selected_location", payload);
    setCurrentLoc(loc);
    if (onSelect) onSelect(loc);
  };

  const handleLiveGps = async () => {
    setFetchingGeo(true);
    try {
      const loc = await detectDeviceLocation();
      const displayArea = loc.area && loc.city && loc.area.toLowerCase() !== loc.city.toLowerCase()
        ? `${loc.area}, ${loc.city}`
        : loc.area || loc.city;
      const item = { area: displayArea, pincode: loc.pincode };
      saveLocation(item);
      toast.success(`Location detected: ${displayArea} (${loc.pincode})`);
      onClose();
    } catch {
      toast.error("Could not automatically detect location. Please select your city or enter your pincode.");
    } finally {
      setFetchingGeo(false);
    }
  };

  const handleAreaSearch = async (val: string) => {
    setQuery(val);
    const cleaned = val.trim();
    const digits = cleaned.replace(/\D/g, "");

    if (digits.length === 6) {
      const loc = await fetchAreaFromPincode(digits);
      const displayArea = loc.area && !loc.area.startsWith("Area ")
        ? `${loc.area}, ${loc.city}`
        : loc.area;
      const item = { area: displayArea, pincode: digits };
      saveLocation(item);
      toast.success(`Location set: ${displayArea} (${digits})`);
      onClose();
    } else if (cleaned.length >= 3 && !digits) {
      const matchedPin = AREA_PINCODES[cleaned] || "500081";
      const item = { area: cleaned, pincode: matchedPin };
      saveLocation(item);
    }
  };

  const handleSelectPredefined = (area: string, pincode: string, city: string) => {
    const displayArea = `${area}, ${city}`;
    const item = { area: displayArea, pincode };
    saveLocation(item);
    toast.success(`Location set to ${displayArea} (${pincode})`);
    onClose();
  };

  if (!open || !mounted) return null;

  const currentCityObj = POPULAR_CITIES.find((c) => c.city === selectedCity) || POPULAR_CITIES[0];

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md transition-all animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-card rounded-3xl border border-border shadow-2xl overflow-hidden flex flex-col my-auto animate-in zoom-in-95 duration-200 max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between gradient-brand text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/15">
              <MapPin className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-extrabold">Select Your Location</h2>
              <p className="text-[11px] text-white/80 font-medium">Discover local deals, verified stores & nearby sellers</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 space-y-5 overflow-y-auto">
          {/* Live GPS Button */}
          <button
            type="button"
            onClick={handleLiveGps}
            disabled={fetchingGeo}
            className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/30 p-3.5 text-xs font-black text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all active:scale-[0.99] disabled:opacity-50"
          >
            {fetchingGeo ? <Loader2 className="h-4 w-4 animate-spin text-emerald-600" /> : <LocateFixed className="h-4 w-4 text-emerald-600" />}
            <span>{fetchingGeo ? "Detecting Live Device Location..." : "📍 Auto-Detect Location (GPS & IP)"}</span>
          </button>

          {/* Search Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-muted-foreground">Search by Area or 6-digit Pincode</label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => handleAreaSearch(e.target.value)}
                placeholder="e.g. Madhapur, Koramangala, Bandra or 500081..."
                className="w-full h-11 rounded-2xl border border-border bg-background pl-10 pr-4 text-xs font-semibold text-foreground outline-none focus:border-indigo-brand focus:ring-2 focus:ring-indigo-brand/20 transition-all"
              />
            </div>
          </div>

          {/* City Selection Tabs */}
          <div className="space-y-2.5">
            <label className="block text-xs font-black text-foreground">Select City / Region</label>
            <div className="grid grid-cols-3 gap-2">
              {POPULAR_CITIES.map((c) => {
                const isActive = selectedCity === c.city;
                return (
                  <button
                    key={c.city}
                    type="button"
                    onClick={() => setSelectedCity(c.city)}
                    className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 border ${
                      isActive
                        ? "bg-indigo-brand text-white border-indigo-brand shadow-md shadow-indigo-brand/20 scale-[1.02]"
                        : "bg-muted/40 text-foreground/80 border-border hover:bg-muted/80"
                    }`}
                  >
                    <span className="font-extrabold">{c.city}</span>
                    <span className={`text-[10px] ${isActive ? "text-indigo-100" : "text-muted-foreground"}`}>{c.state}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Popular Areas / Neighborhoods in Selected City */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-foreground">
                Popular Areas in {currentCityObj.city}
              </label>
              <span className="text-[10px] text-muted-foreground font-semibold">1-Click Select</span>
            </div>
            
            <div className="flex flex-wrap gap-1.5">
              {currentCityObj.areas.map((area) => {
                const isSelected = currentLoc?.pincode === area.pincode || currentLoc?.area?.includes(area.name);
                return (
                  <button
                    key={area.pincode + area.name}
                    type="button"
                    onClick={() => handleSelectPredefined(area.name, area.pincode, currentCityObj.city)}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 border ${
                      isSelected
                        ? "bg-amber-400/20 text-amber-900 dark:text-amber-300 border-amber-400 font-extrabold"
                        : "bg-card hover:bg-muted/60 text-foreground border-border hover:border-indigo-brand/50"
                    }`}
                  >
                    <MapPin className={`h-3 w-3 ${isSelected ? "text-amber-500" : "text-muted-foreground"}`} />
                    <span>{area.name}</span>
                    <span className="text-[10px] opacity-70 font-normal">({area.pincode})</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>,
    document.body
  );
}

