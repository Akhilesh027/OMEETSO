import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { MapPin, LocateFixed, Search, X, Loader2, Check, ArrowRight, Navigation } from "lucide-react";
import { toast } from "sonner";
import {
  searchLocations,
  detectDeviceLocation,
  type LocationSuggestion,
} from "@/lib/location";
import { getUserAccessToken } from "@/api/auth.api";
import { API_BASE } from "@/config/api";

export function LocationModal({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect?: (loc: { area: string; pincode: string; city?: string; state?: string }) => void;
}) {
  const [query, setQuery] = useState("");
  const [fetchingGeo, setFetchingGeo] = useState(false);
  const [searching, setSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [mounted, setMounted] = useState(false);
  const [currentLoc, setCurrentLoc] = useState<{ area: string; pincode: string; city?: string; state?: string } | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync current saved location on open
  useEffect(() => {
    if (!open) return;
    try {
      const stored = localStorage.getItem("omeetso_selected_location") || localStorage.getItem("omeetso_location");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.area) {
          setCurrentLoc(parsed);
        }
      }
    } catch {
      /* ignore */
    }
    setQuery("");
    setSuggestions([]);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 150);
  }, [open]);

  // Handle debounced search across India Post API, Photon, Nominatim & local DB
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setSuggestions([]);
      setSearching(false);
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      return;
    }

    setSearching(true);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await searchLocations(trimmed);
        setSuggestions(res);
      } catch (err) {
        console.warn("[LocationModal] Search failed:", err);
      } finally {
        setSearching(false);
      }
    }, 250);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [query]);

  const saveLocation = (loc: { area: string; pincode: string; city?: string; state?: string }) => {
    const payload = JSON.stringify({ ...loc, savedAt: Date.now() });
    localStorage.setItem("omeetso_location", payload);
    localStorage.setItem("omeetso_selected_location", payload);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("omeetso_location_changed", { detail: loc }));
    }
    setCurrentLoc(loc);
    if (onSelect) onSelect(loc);

    // Sync to user profile in MongoDB if authenticated
    const token = getUserAccessToken();
    if (token) {
      fetch(`${API_BASE}/users/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          city: loc.city || loc.area,
          pincode: loc.pincode,
          area: loc.area,
        }),
      }).catch(() => {});
    }
  };

  const handleSelectSuggestion = (item: LocationSuggestion) => {
    const displayArea = item.displayName || item.area;
    const finalCity = item.city || displayArea;
    const finalPincode = item.pincode || "";

    const loc = {
      area: displayArea,
      city: finalCity,
      state: item.state,
      pincode: finalPincode,
    };

    saveLocation(loc);
    toast.success(`Location set: ${displayArea}${finalPincode ? ` (${finalPincode})` : ""}`);
    onClose();
  };

  const handleLiveGps = async () => {
    setFetchingGeo(true);
    try {
      const loc = await detectDeviceLocation();
      const displayArea =
        loc.area && loc.city && loc.area.toLowerCase() !== loc.city.toLowerCase()
          ? `${loc.area}, ${loc.city}`
          : loc.area || loc.city;

      const item = {
        area: displayArea,
        pincode: loc.pincode || "",
        city: loc.city || loc.area,
        state: loc.state,
      };

      saveLocation(item);
      toast.success(
        `Live location detected: ${displayArea}${loc.pincode ? ` (${loc.pincode})` : ""}`
      );
      onClose();
    } catch (err: any) {
      console.warn("[LocationModal] Geolocation error:", err);
      const msg = err?.message || "";
      if (msg.includes("PERMISSION_DENIED")) {
        toast.error(
          "Location permission denied. Please click the lock / settings icon in your browser address bar and choose 'Allow' for Location."
        );
      } else {
        toast.error(
          msg || "Could not automatically detect location. Please search your place or pincode."
        );
      }
    } finally {
      setFetchingGeo(false);
    }
  };

  const handleCustomConfirm = () => {
    const trimmed = query.trim();
    if (!trimmed) {
      toast.error("Please enter a valid area, place, or pincode");
      return;
    }

    if (suggestions.length > 0) {
      handleSelectSuggestion(suggestions[0]);
      return;
    }

    const digits = trimmed.replace(/\D/g, "");
    const item = {
      area: trimmed,
      pincode: digits.length === 6 ? digits : (currentLoc?.pincode || ""),
      city: trimmed,
    };

    saveLocation(item);
    toast.success(`Location set: ${trimmed}`);
    onClose();
  };

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md transition-all animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-card rounded-3xl border border-border shadow-2xl overflow-hidden flex flex-col my-auto animate-in zoom-in-95 duration-200 max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="location-modal-title"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between gradient-brand text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/20 shadow-xs">
              <MapPin className="h-5 w-5 text-amber-300" />
            </div>
            <div>
              <h2 id="location-modal-title" className="text-base sm:text-lg font-black tracking-tight">
                Select Your Location
              </h2>
              <p className="text-xs text-white/85 font-medium">
                Find local deals, nearby sellers & stores around you
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close location selector"
            className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-white/25 text-white transition-all active:scale-90"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* Live GPS / Auto-Detect Button */}
          <button
            type="button"
            onClick={handleLiveGps}
            disabled={fetchingGeo}
            className="w-full relative group overflow-hidden flex items-center justify-between p-3.5 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 border-2 border-blue-500/30 hover:border-blue-500/60 transition-all active:scale-[0.99] disabled:opacity-50 text-left shadow-xs"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-xl bg-blue-600 text-white shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                {fetchingGeo ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LocateFixed className="h-4 w-4" />
                )}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-black text-blue-900 dark:text-blue-200 block truncate">
                  {fetchingGeo ? "Requesting permission & GPS..." : "Use Current Live Location"}
                </span>
                <span className="text-[11px] font-medium text-blue-700/80 dark:text-blue-300/80 block truncate">
                  {fetchingGeo ? "Please allow browser location when prompted" : "Instant GPS & Network positioning"}
                </span>
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-1.5 text-xs font-extrabold text-blue-700 dark:text-blue-300">
              <span className="hidden sm:inline">Auto Detect</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border/80" />
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              Or Search Place / Pincode
            </span>
            <div className="h-px flex-1 bg-border/80" />
          </div>

          {/* Search Input Box */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleCustomConfirm();
                } else if (e.key === "Escape") {
                  onClose();
                }
              }}
              placeholder="Search area, city or 6-digit pincode (e.g. 500081, Madhapur)..."
              className="w-full h-12 rounded-2xl border-2 border-border/80 bg-background pl-10 pr-10 text-xs sm:text-sm font-semibold text-foreground outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/15 transition-all shadow-xs"
            />
            {searching ? (
              <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-blue-600" />
            ) : query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>

          {/* Active Search Results List */}
          {query.trim().length > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  {searching
                    ? "Searching across India..."
                    : `Suggestions (${suggestions.length})`}
                </span>
                {suggestions.length > 0 && (
                  <span className="text-[10px] font-medium text-muted-foreground">
                    Click to select
                  </span>
                )}
              </div>

              {suggestions.length > 0 ? (
                <div className="max-h-64 sm:max-h-72 overflow-y-auto space-y-1.5 pr-1 divide-y divide-border/20">
                  {suggestions.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectSuggestion(item)}
                      className="w-full text-left p-3 rounded-2xl border border-border/70 hover:border-blue-500/60 bg-surface-2/40 hover:bg-blue-500/10 transition-all flex items-center justify-between gap-3 group active:scale-[0.99]"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0 mt-0.5">
                          <MapPin className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-foreground truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {item.displayName || item.area}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {item.secondaryText}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {item.pincode && (
                          <span className="px-2 py-0.5 rounded-full bg-surface-3 text-[10px] font-extrabold text-foreground/80 border border-border/60">
                            {item.pincode}
                          </span>
                        )}
                        <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all hidden sm:inline-flex items-center gap-1">
                          Select <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : !searching ? (
                <div className="p-6 text-center space-y-3 rounded-2xl border border-dashed border-border bg-surface-2/30">
                  <div className="inline-grid h-10 w-10 place-items-center rounded-2xl bg-amber-500/10 text-amber-600">
                    <Navigation className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">
                      No exact match found for &ldquo;{query}&rdquo;
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      You can still select it as your custom area
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCustomConfirm}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
                  >
                    <MapPin className="h-3.5 w-3.5" /> Set &ldquo;{query}&rdquo; as Location
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            /* When Query is Empty: Show Current Location & Popular Quick Chips */
            <div className="space-y-4">
              {/* Current Location Preview */}
              {currentLoc && (
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 flex items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1.5 rounded-lg bg-emerald-600 text-white shrink-0">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">
                        Current Selected Location
                      </span>
                      <p className="text-xs font-black text-foreground truncate">
                        {currentLoc.area}
                      </p>
                    </div>
                  </div>
                  {currentLoc.pincode && (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-[10px] font-extrabold text-emerald-900 dark:text-emerald-200 border border-emerald-500/30 shrink-0">
                      PIN: {currentLoc.pincode}
                    </span>
                  )}
                </div>
              )}

              {/* Quick Guide / Help Note */}
              <div className="p-4 rounded-2xl bg-surface-2/40 border border-border/60 text-center space-y-1">
                <p className="text-xs font-semibold text-foreground">
                  Search any pincode, place or area
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Type your 6-digit pincode or locality name above, or tap auto-detect to find nearby stores and deals.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-border bg-surface-2/30 flex items-center justify-between gap-3 shrink-0">
          <p className="text-[11px] text-muted-foreground font-medium hidden sm:block">
            Powered by India Post & OpenStreetMap
          </p>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex-1 sm:flex-initial"
            >
              Cancel
            </button>
            {query.trim() && (
              <button
                type="button"
                onClick={handleCustomConfirm}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-sm transition-all flex items-center justify-center gap-1.5 flex-1 sm:flex-initial"
              >
                <MapPin className="h-3.5 w-3.5" />
                Select
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
