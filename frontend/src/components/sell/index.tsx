import type { ComponentType, ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  Bolt, ClipboardList, Store as StoreIcon, FileClock,
  Check, ChevronRight, AlertCircle, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Condition, ContactPref, BestContactTime, Fulfilment } from "@/lib/listings";
import { CONDITION_LABEL, CONTACT_LABEL, TIME_LABEL, FULFILMENT_LABEL } from "@/lib/listings";

// ---------------- Sell method card ----------------
export function SellMethodCard({
  icon: Icon,
  title,
  description,
  benefits,
  cta,
  to,
  tone = "primary",
  disabled,
  onClick,
  meta,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  benefits?: string[];
  cta: string;
  to?: string;
  tone?: "primary" | "accent" | "muted";
  disabled?: boolean;
  onClick?: () => void;
  meta?: ReactNode;
}) {
  const toneCls =
    tone === "accent"
      ? "bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 border border-amber-300 shadow-lg"
      : tone === "muted"
      ? "bg-card text-foreground border border-border/80 hover:border-primary/40 shadow-sm"
      : "bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 text-white border border-blue-400/30 shadow-xl";
  const Content = (
    <div className={cn("relative flex h-full min-h-[220px] flex-col justify-between overflow-hidden rounded-3xl p-5 sm:p-6 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1", toneCls, disabled && "opacity-70")}>
      <div>
        <div className="flex items-start gap-3.5">
          <div className={cn("grid h-12 w-12 shrink-0 place-items-center rounded-2xl shadow-sm", tone === "accent" ? "bg-slate-950 text-amber-400" : tone === "muted" ? "bg-primary/10 text-primary" : "bg-white/15 text-white")}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base sm:text-lg font-black leading-tight tracking-tight">{title}</h3>
            <p className={cn("mt-1 text-xs leading-relaxed font-medium", tone === "accent" ? "text-slate-900/90" : tone === "muted" ? "text-muted-foreground" : "text-blue-100/90")}>{description}</p>
          </div>
        </div>
        {benefits && benefits.length > 0 && (
          <ul className={cn("mt-4 space-y-1.5 text-xs font-semibold", tone === "accent" ? "text-slate-950" : tone === "muted" ? "text-foreground/80" : "text-white/90")}>
            {benefits.map((b) => (
              <li key={b} className="flex items-center gap-2">
                <Check className={cn("h-4 w-4 shrink-0 font-bold", tone === "accent" ? "text-slate-950" : tone === "muted" ? "text-primary" : "text-amber-400")} /> <span>{b}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="mt-5 flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5">
        <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-black">
          {cta} <ChevronRight className="h-4 w-4" />
        </span>
        {meta}
      </div>
    </div>
  );
  if (disabled || !to) {
    return (
      <button type="button" onClick={onClick} disabled={disabled} className="block w-full text-left active:scale-[0.99] transition">
        {Content}
      </button>
    );
  }
  return (
    <Link to={to} className="block active:scale-[0.99] transition">
      {Content}
    </Link>
  );
}

// The four brand icons used on the sell entry
export const SellIcons = { Bolt, ClipboardList, StoreIcon, FileClock };

// ---------------- Step indicator ----------------
export function StepIndicator({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="w-full">
      <p className="mb-1 text-[11px] font-semibold text-muted-foreground">
        Step {current + 1} of {steps.length} · <span className="text-foreground">{steps[current]}</span>
      </p>
      <div className="flex gap-1">
        {steps.map((s, i) => (
          <div key={s} className={cn("h-1.5 flex-1 rounded-full", i <= current ? "bg-primary" : "bg-border")} />
        ))}
      </div>
    </div>
  );
}

// ---------------- Condition selector ----------------
const CONDITIONS: Condition[] = ["new", "like_new", "excellent", "good", "fair", "needs_repair"];
export function ConditionSelector({ value, onChange }: { value?: Condition; onChange: (c: Condition) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {CONDITIONS.map((c) => (
        <button key={c} type="button" onClick={() => onChange(c)}
          className={cn("rounded-full border px-3 py-1.5 text-xs font-semibold",
            value === c ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card")}>
          {CONDITION_LABEL[c]}
        </button>
      ))}
    </div>
  );
}

// ---------------- Price input ----------------
export function PriceInput({
  value, negotiable, free, onValue, onChange, onNegotiable, onNegotiableChange, onFree, onFreeChange, error, allowFree = false,
}: {
  value?: number; negotiable?: boolean; free?: boolean;
  onValue?: (n: number) => void;
  onChange?: (n: number) => void;
  onNegotiable?: (b: boolean) => void;
  onNegotiableChange?: (b: boolean) => void;
  onFree?: (b: boolean) => void;
  onFreeChange?: (b: boolean) => void;
  error?: string;
  allowFree?: boolean;
}) {
  const handleVal = (n: number) => {
    if (onValue) onValue(n);
    if (onChange) onChange(n);
  };
  const handleNeg = (b: boolean) => {
    if (onNegotiable) onNegotiable(b);
    if (onNegotiableChange) onNegotiableChange(b);
  };
  const handleFr = (b: boolean) => {
    if (onFree) onFree(b);
    if (onFreeChange) onFreeChange(b);
  };

  const valNum = value ?? 0;
  const fmt = free ? "Free" : valNum ? new Intl.NumberFormat("en-IN").format(valNum) : "";

  return (
    <div className="space-y-2">
      <div className={cn("flex items-center rounded-2xl border bg-card px-3 py-3", error ? "border-red-400" : "border-border", free && "opacity-70")}>
        <span className="mr-2 text-base font-bold text-muted-foreground">₹</span>
        <input
          type="text" inputMode="numeric" disabled={free}
          value={fmt}
          onChange={(e) => {
            const n = Number(e.target.value.replace(/\D/g, ""));
            handleVal(Number.isFinite(n) ? n : 0);
          }}
          placeholder="Enter expected price (e.g. 15,000)"
          className="w-full bg-transparent text-base font-bold outline-none text-foreground"
          aria-label="Price in rupees"
        />
      </div>
      {error && <p className="text-[11px] text-red-600 font-bold" role="alert">{error}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => handleNeg(true)}
          className={cn("rounded-full border px-3 py-1.5 text-xs font-bold transition-all",
            negotiable && !free ? "border-indigo-brand bg-indigo-brand text-white shadow-sm" : "border-border bg-card text-foreground")}>
          Negotiable
        </button>
        <button type="button" onClick={() => handleNeg(false)}
          className={cn("rounded-full border px-3 py-1.5 text-xs font-bold transition-all",
            !negotiable && !free ? "border-indigo-brand bg-indigo-brand text-white shadow-sm" : "border-border bg-card text-foreground")}>
          Fixed price
        </button>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { LocateFixed, Navigation } from "lucide-react";
import { toast } from "sonner";
import { AREAS, AREA_PINCODES } from "@/lib/mock";
import { fetchAreaFromPincode, resolveGpsLocation } from "@/lib/location";

// ---------------- Location selector ----------------
export function LocationSelector({
  pincode, area, city, fulfilment,
  onPincode, onArea, onCity, onFulfilment, onChange, onDetect, error,
}: {
  pincode?: string; area?: string; city?: string; fulfilment?: Fulfilment;
  onPincode?: (v: string) => void;
  onArea?: (v: string) => void;
  onCity?: (v: string) => void;
  onFulfilment?: (v: Fulfilment) => void;
  onChange?: (p: { pincode?: string; area?: string; city?: string; fulfilment?: Fulfilment }) => void;
  onDetect?: () => void;
  error?: Record<string, string>;
}) {
  const FULS: Fulfilment[] = ["pickup", "delivery", "both", "buyer"];
  const [fetchingGeo, setFetchingGeo] = useState(false);

  // Pre-fill location from localStorage on mount if available
  useEffect(() => {
    try {
      const rawLoc = localStorage.getItem("omeetso_location") || localStorage.getItem("omeetso_selected_location");
      if (rawLoc) {
        const loc = JSON.parse(rawLoc);
        let locArea = area;
        let locCity = city;
        if (loc.area) {
          const parts = loc.area.split(",").map((p: string) => p.trim());
          locArea = parts[0] || locArea;
          if (parts[1]) locCity = parts[1];
        }
        const locPin = loc.pincode || pincode;
        if (locArea && locArea !== area) setArea(locArea);
        if (locPin && locPin !== pincode) setPin(locPin);
        if (locCity && locCity !== city) setCt(locCity);
      }
    } catch {}
  }, []);

  const setArea = (a: string) => {
    if (onArea) onArea(a);
    const p = AREA_PINCODES[a] || pincode || "500081";
    if (onPincode) onPincode(p);
    if (onChange) onChange({ area: a, pincode: p, city: city || "Hyderabad" });
  };

  const setPin = async (p: string) => {
    if (onPincode) onPincode(p);
    if (p.length === 6) {
      const loc = await fetchAreaFromPincode(p);
      if (loc.area && !loc.area.startsWith("Area ")) {
        if (onArea) onArea(loc.area);
        if (onCity) onCity(loc.city);
        if (onChange) onChange({ pincode: p, area: loc.area, city: loc.city || city || "Hyderabad" });
        return;
      }
    }
    if (onChange) onChange({ pincode: p, area: area || "Madhapur", city: city || "Hyderabad" });
  };

  const setCt = (c: string) => {
    if (onCity) onCity(c);
    if (onChange) onChange({ city: c, area: area || "Madhapur", pincode: pincode || "500081" });
  };

  const setFul = (f: Fulfilment) => {
    if (onFulfilment) onFulfilment(f);
    if (onChange) onChange({ fulfilment: f });
  };

  const handleLiveGpsDetect = () => {
    if (onDetect) {
      onDetect();
      return;
    }
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setFetchingGeo(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude: lat, longitude: lng } = pos.coords;
          const loc = await resolveGpsLocation(lat, lng);
          const finalArea = loc.area || "Madhapur";
          const detectedCity = loc.city || "Hyderabad";
          const detectedPin = loc.pincode || "500081";

          if (onArea) onArea(finalArea);
          if (onPincode) onPincode(detectedPin);
          if (onCity) onCity(detectedCity);
          if (onChange) onChange({ area: finalArea, pincode: detectedPin, city: detectedCity, fulfilment });

          const payload = JSON.stringify({ area: `${finalArea}, ${detectedCity}`, pincode: detectedPin, coords: { lat, lng }, savedAt: Date.now() });
          localStorage.setItem("omeetso_location", payload);
          localStorage.setItem("omeetso_selected_location", payload);

          toast.success(`Live GPS location set: ${finalArea}, ${detectedCity} (${detectedPin})`);
        } catch {
          toast.error("Could not resolve live location details");
        } finally {
          setFetchingGeo(false);
        }
      },
      () => {
        setFetchingGeo(false);
        toast.error("Location permission denied or unavailable");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-3">
      {/* Live GPS Auto-Detect Button */}
      <button
        type="button"
        onClick={handleLiveGpsDetect}
        disabled={fetchingGeo}
        className="w-full flex items-center justify-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 py-2.5 px-4 text-xs font-bold text-emerald-700 hover:bg-emerald-500/20 transition-all disabled:opacity-50 shadow-sm"
      >
        {fetchingGeo ? <Loader2 className="h-4 w-4 animate-spin text-emerald-600" /> : <LocateFixed className="h-4 w-4 text-emerald-600" />}
        <span>{fetchingGeo ? "Detecting Live Location..." : "📍 Get Current Live Location"}</span>
      </button>



      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-xs font-bold text-muted-foreground">Pincode *</label>
          <input type="text" inputMode="numeric" maxLength={6} value={pincode ?? "500081"}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className={cn("w-full h-11 rounded-2xl border bg-background px-3 text-xs font-bold text-foreground outline-none focus:border-indigo-brand", error?.pincode ? "border-red-400" : "border-border")}
            placeholder="500081" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold text-muted-foreground">Area Name *</label>
          <input type="text" value={area ?? "Madhapur"} onChange={(e) => setArea(e.target.value)}
            className={cn("w-full h-11 rounded-2xl border bg-background px-3 text-xs font-bold text-foreground outline-none focus:border-indigo-brand", error?.area ? "border-red-400" : "border-border")}
            placeholder="Madhapur" />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-bold text-muted-foreground">City *</label>
        <input type="text" value={city ?? "Hyderabad"} onChange={(e) => setCt(e.target.value)}
          className="w-full h-11 rounded-2xl border border-border bg-background px-3 text-xs font-bold text-foreground outline-none focus:border-indigo-brand" placeholder="Hyderabad" />
      </div>

      <div>
        <p className="mb-1.5 text-xs font-bold text-muted-foreground">Fulfilment & Delivery</p>
        <div className="flex flex-wrap gap-2">
          {FULS.map((f) => (
            <button key={f} type="button" onClick={() => setFul(f)}
              className={cn("rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all",
                fulfilment === f ? "border-indigo-brand bg-indigo-brand text-white shadow-sm" : "border-border bg-card text-foreground")}>
              {FULFILMENT_LABEL[f]}
            </button>
          ))}
        </div>
      </div>
      <p className="rounded-2xl bg-secondary/60 p-3 text-[11px] font-medium text-muted-foreground leading-relaxed">
        🔒 Your exact street address is never published. Only your area ({area || "Madhapur"}) will be shown to nearby buyers.
      </p>
    </div>
  );
}

// ---------------- Contact preference selector ----------------
const PREFS: ContactPref[] = ["chat_only", "call_and_chat", "hide_number"];
const TIMES: BestContactTime[] = ["anytime", "morning", "afternoon", "evening"];
export function ContactPreferenceSelector({
  pref, time, bestTime, whatsappPhone, enableWhatsapp, onPref, onPrefChange, onTime, onTimeChange, onWhatsappPhoneChange, onEnableWhatsappChange,
}: {
  pref?: ContactPref; time?: BestContactTime; bestTime?: BestContactTime;
  whatsappPhone?: string; enableWhatsapp?: boolean;
  onPref?: (p: ContactPref) => void;
  onPrefChange?: (p: ContactPref) => void;
  onTime?: (t: BestContactTime) => void;
  onTimeChange?: (t: BestContactTime) => void;
  onWhatsappPhoneChange?: (v: string) => void;
  onEnableWhatsappChange?: (b: boolean) => void;
}) {
  const currentPref = pref ?? "call_and_chat";
  const currentTime = time ?? bestTime ?? "anytime";
  const isWhatsappActive = enableWhatsapp ?? true;

  const setP = (p: ContactPref) => {
    if (onPref) onPref(p);
    if (onPrefChange) onPrefChange(p);
  };

  const setT = (t: BestContactTime) => {
    if (onTime) onTime(t);
    if (onTimeChange) onTimeChange(t);
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-1.5 text-xs font-bold text-muted-foreground">How can buyers reach you?</p>
        <div className="flex flex-wrap gap-2">
          {PREFS.map((p) => (
            <button key={p} type="button" onClick={() => setP(p)}
              className={cn("rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all",
                currentPref === p ? "border-indigo-brand bg-indigo-brand text-white shadow-sm" : "border-border bg-card text-foreground")}>
              {CONTACT_LABEL[p]}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 space-y-2.5">
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={isWhatsappActive}
            onChange={(e) => onEnableWhatsappChange?.(e.target.checked)}
            className="h-4 w-4 rounded border-border text-emerald-600 focus:ring-emerald-500"
          />
          <span className="text-xs font-extrabold text-foreground flex items-center gap-1.5">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-500 text-white font-bold text-[10px]">WA</span>
            Allow buyers to contact via WhatsApp
          </span>
        </label>

        {isWhatsappActive && (
          <div className="pt-1">
            <label className="block text-[11px] font-bold text-muted-foreground mb-1">WhatsApp Number (Optional if same as account phone)</label>
            <input
              type="tel"
              value={whatsappPhone ?? ""}
              onChange={(e) => onWhatsappPhoneChange?.(e.target.value)}
              placeholder="e.g. 9876543210"
              className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs font-bold text-foreground outline-none focus:border-emerald-500"
            />
          </div>
        )}
      </div>

      <div>
        <p className="mb-1.5 text-xs font-bold text-muted-foreground">Best contact time</p>
        <div className="flex flex-wrap gap-2">
          {TIMES.map((t) => (
            <button key={t} type="button" onClick={() => setT(t)}
              className={cn("rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all",
                currentTime === t ? "border-indigo-brand bg-indigo-brand text-white shadow-sm" : "border-border bg-card text-foreground")}>
              {TIME_LABEL[t]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------- Validation summary ----------------
export function ValidationSummary({ items }: { items: string[] }) {
  if (!items.length) return null;
  return (
    <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
      <p className="flex items-center gap-1.5 font-bold"><AlertCircle className="h-3.5 w-3.5" /> Please fix these before publishing</p>
      <ul className="ml-5 mt-1 list-disc space-y-0.5">
        {items.map((i) => <li key={i}>{i}</li>)}
      </ul>
    </div>
  );
}

// ---------------- Auto-save indicator ----------------
export function AutoSaveIndicator({ savedAt }: { savedAt?: number | null }) {
  if (!savedAt) return null;
  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground" aria-live="polite">
      <Check className="h-3 w-3" /> Draft saved
    </span>
  );
}

// ---------------- Confirm modal ----------------
export function ConfirmModal({
  open, title, body, confirmLabel = "Confirm", cancelLabel = "Cancel",
  destructive, onConfirm, onCancel,
}: {
  open: boolean; title: string; body?: string;
  confirmLabel?: string; cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void; onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[60] grid place-items-center p-4">
      <button aria-label="Close" onClick={onCancel} className="absolute inset-0 bg-navy/60"
        style={{ animation: "ob-fade-in 180ms both" }} />
      <div className="relative w-full max-w-sm rounded-2xl bg-card p-5 shadow-2xl"
        style={{ animation: "ob-slide-up 220ms ease-out both" }}>
        <h3 className="text-base font-extrabold">{title}</h3>
        {body && <p className="mt-1 text-sm text-muted-foreground">{body}</p>}
        <div className="mt-4 flex gap-2">
          <button onClick={onCancel} className="flex-1 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-semibold">
            {cancelLabel}
          </button>
          <button onClick={onConfirm}
            className={cn("flex-1 rounded-full px-4 py-2.5 text-sm font-bold",
              destructive ? "bg-red-600 text-white" : "bg-primary text-primary-foreground")}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------- Loading overlay ----------------
export function LoadingOverlay({ open, label }: { open: boolean; label?: string }) {
  if (!open) return null;
  return (
    <div role="status" aria-live="assertive" className="fixed inset-0 z-[70] grid place-items-center bg-navy/40 backdrop-blur-sm">
      <div className="rounded-2xl bg-card px-5 py-4 shadow-xl">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <Loader2 className="h-4 w-4 animate-spin text-primary" /> {label ?? "Working…"}
        </p>
      </div>
    </div>
  );
}
