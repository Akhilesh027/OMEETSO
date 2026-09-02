import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { MapPin, LocateFixed, Search, X, Loader2, Check, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { fetchAreaFromPincode, detectDeviceLocation } from "@/lib/location";

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
  const [customCity, setCustomCity] = useState("");
  const [fetchingGeo, setFetchingGeo] = useState(false);
  const [resolvingPin, setResolvingPin] = useState(false);
  const [resolvedResult, setResolvedResult] = useState<{ area: string; pincode: string; city?: string; state?: string } | null>(null);
  const [mounted, setMounted] = useState(false);
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
          setQuery(parsed.pincode || parsed.area || "");
        }
      }
    } catch { /* ignore */ }
  }, [open]);

  const saveLocation = (loc: { area: string; pincode: string }) => {
    const payload = JSON.stringify({ ...loc, savedAt: Date.now() });
    localStorage.setItem("omeetso_location", payload);
    localStorage.setItem("omeetso_selected_location", payload);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("omeetso_location_changed", { detail: loc }));
    }
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
      const item = { area: displayArea, pincode: loc.pincode || "" };
      saveLocation(item);
      toast.success(`Location detected: ${displayArea}${loc.pincode ? ` (${loc.pincode})` : ""}`);
      onClose();
    } catch {
      toast.error("Could not automatically detect location. Please enter your area or pincode below.");
    } finally {
      setFetchingGeo(false);
    }
  };

  const handleInputChange = async (val: string) => {
    setQuery(val);
    const cleaned = val.trim();
    const digits = cleaned.replace(/\D/g, "");

    if (digits.length === 6) {
      setResolvingPin(true);
      try {
        const loc = await fetchAreaFromPincode(digits);
        setResolvedResult({
          area: loc.area,
          city: loc.city,
          state: loc.state,
          pincode: digits
        });
      } finally {
        setResolvingPin(false);
      }
    } else {
      setResolvedResult(null);
    }
  };

  const handleConfirmLocation = () => {
    if (resolvedResult) {
      const displayArea = resolvedResult.area && resolvedResult.city && resolvedResult.area.toLowerCase() !== resolvedResult.city.toLowerCase()
        ? `${resolvedResult.area}, ${resolvedResult.city}`
        : resolvedResult.area || resolvedResult.city || query;
      const item = { area: displayArea, pincode: resolvedResult.pincode };
      saveLocation(item);
      toast.success(`Location set: ${displayArea} (${resolvedResult.pincode})`);
      onClose();
      return;
    }

    const trimmed = query.trim();
    if (!trimmed) {
      toast.error("Please enter a valid area, city, or pincode");
      return;
    }

    const digits = trimmed.replace(/\D/g, "");
    const displayArea = customCity ? `${trimmed}, ${customCity}` : trimmed;
    const item = { area: displayArea, pincode: digits.length === 6 ? digits : (currentLoc?.pincode || "") };
    saveLocation(item);
    toast.success(`Location set: ${displayArea}`);
    onClose();
  };

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md transition-all animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-card rounded-3xl border border-border shadow-2xl overflow-hidden flex flex-col my-auto animate-in zoom-in-95 duration-200 max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between gradient-brand text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/15">
              <MapPin className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-extrabold">Set Your Location</h2>
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

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Live GPS / Auto Detect */}
          <button
            type="button"
            onClick={handleLiveGps}
            disabled={fetchingGeo}
            className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-blue-500/10 border-2 border-blue-500/30 p-3.5 text-xs font-black text-blue-700 dark:text-blue-400 hover:bg-blue-500/20 transition-all active:scale-[0.99] disabled:opacity-50"
          >
            {fetchingGeo ? <Loader2 className="h-4 w-4 animate-spin text-blue-600" /> : <LocateFixed className="h-4 w-4 text-blue-600" />}
            <span>{fetchingGeo ? "Detecting Live Location..." : "📍 Auto-Detect Live Location"}</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Or Enter Manually</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Search Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-foreground">Area Name or 6-digit Pincode</label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleConfirmLocation();
                  }
                }}
                placeholder="Enter area, locality or 6-digit pincode..."
                className="w-full h-12 rounded-2xl border border-border bg-background pl-10 pr-4 text-xs font-semibold text-foreground outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all"
                autoFocus
              />
              {resolvingPin && (
                <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-blue-600" />
              )}
            </div>
          </div>

          {/* Dynamic Resolved Result Card */}
          {resolvedResult && (
            <div
              onClick={handleConfirmLocation}
              className="rounded-2xl border border-blue-500/40 bg-blue-500/10 p-3.5 cursor-pointer hover:bg-blue-500/15 transition-all flex items-center justify-between gap-3 shadow-xs group"
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <MapPin className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-black text-blue-900 dark:text-blue-200 truncate">
                    {resolvedResult.area}{resolvedResult.city ? `, ${resolvedResult.city}` : ""}
                  </p>
                  <p className="text-[10px] font-bold text-blue-700/80 dark:text-blue-300/80">
                    PIN: {resolvedResult.pincode} {resolvedResult.state ? `· ${resolvedResult.state}` : ""}
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-extrabold text-blue-700 dark:text-blue-300 shrink-0 group-hover:translate-x-0.5 transition-transform">
                Select <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          )}

          {/* Optional City / Region Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-muted-foreground">City / State (Optional)</label>
            <input
              type="text"
              value={customCity}
              onChange={(e) => setCustomCity(e.target.value)}
              placeholder="e.g. Hyderabad, Telangana"
              className="w-full h-11 rounded-2xl border border-border bg-background px-4 text-xs font-semibold text-foreground outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          {/* Current Saved Location Preview */}
          {currentLoc && (
            <div className="rounded-2xl border border-border/80 bg-surface-2/60 p-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Check className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">Current Location</p>
                  <p className="text-xs font-black text-foreground truncate">{currentLoc.area}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-muted-foreground shrink-0">{currentLoc.pincode}</span>
            </div>
          )}

          {/* Action Button */}
          <button
            type="button"
            onClick={handleConfirmLocation}
            disabled={!query.trim()}
            className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md transition-all active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <MapPin className="h-4 w-4" /> Set Location
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}


