import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { MapPin, LocateFixed, Search, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { fetchAreaFromPincode, resolveGpsLocation } from "@/lib/location";
import { AREA_PINCODES } from "@/lib/mock";

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
          setQuery(parsed.area || parsed.pincode || "");
        }
      }
    } catch { /* ignore */ }
  }, [open]);

  const saveLocation = (loc: { area: string; pincode: string }) => {
    const payload = JSON.stringify({ ...loc, savedAt: Date.now() });
    localStorage.setItem("omeetso_location", payload);
    localStorage.setItem("omeetso_selected_location", payload);
    if (onSelect) onSelect(loc);
  };

  const handleLiveGps = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setFetchingGeo(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const loc = await resolveGpsLocation(lat, lng);
          const displayArea = loc.area && loc.city && loc.area.toLowerCase() !== loc.city.toLowerCase()
            ? `${loc.area}, ${loc.city}`
            : loc.area || loc.city;
          const item = { area: displayArea, pincode: loc.pincode };
          saveLocation(item);
          toast.success(`Location set: ${displayArea} (${loc.pincode})`);
          onClose();
        } catch {
          toast.error("Could not resolve GPS address");
        } finally {
          setFetchingGeo(false);
        }
      },
      () => {
        setFetchingGeo(false);
        toast.error("Location permission denied");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
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

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/65 backdrop-blur-md transition-all animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-card rounded-3xl border border-border shadow-2xl overflow-hidden flex flex-col my-auto animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between gradient-brand text-white shrink-0">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-amber-400" />
            <h2 className="text-base font-extrabold">Select Your Location</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Live GPS Button */}
          <button
            type="button"
            onClick={handleLiveGps}
            disabled={fetchingGeo}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-3.5 text-xs font-extrabold text-emerald-700 hover:bg-emerald-500/20 transition-all disabled:opacity-50"
          >
            {fetchingGeo ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
            <span>{fetchingGeo ? "Detecting Live GPS..." : "📍 Use Current GPS Location"}</span>
          </button>

          {/* Custom Pincode & Search */}
          <div className="space-y-2 pb-1">
            <label className="block text-xs font-bold text-muted-foreground">Enter Pincode or Search Area</label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => handleAreaSearch(e.target.value)}
                placeholder="Search area or enter 6-digit pincode"
                className="w-full h-11 rounded-2xl border border-border bg-background pl-10 pr-4 text-xs font-semibold text-foreground outline-none focus:border-indigo-brand"
              />
            </div>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
}
