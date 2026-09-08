import type { ComponentType, ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  Bolt, ClipboardList, Store as StoreIcon, FileClock,
  Check, ChevronRight, AlertCircle, Loader2,
} from "lucide-react";
import { cn, preventNonNumericKeyDown, sanitizeNumericInput, formatPhoneDisplay, cleanPhoneInput } from "@/lib/utils";
import type { Condition, ContactPref, BestContactTime, Fulfilment } from "@/lib/listings";
import { CONDITION_LABEL, CONTACT_LABEL, TIME_LABEL } from "@/lib/listings";

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
          onKeyDown={(e) => preventNonNumericKeyDown(e)}
          onChange={(e) => {
            const sanitized = sanitizeNumericInput(e.target.value);
            const n = Number(sanitized);
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
  onPincode, onArea, onCity, onFulfilment, onChange, error,
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
  // Pre-fill location from localStorage on mount if available & listen to global location changes
  useEffect(() => {
    const syncFromStorage = () => {
      try {
        const rawLoc = localStorage.getItem("omeetso_location") || localStorage.getItem("omeetso_selected_location");
        if (rawLoc) {
          const loc = JSON.parse(rawLoc);
          let locArea = "";
          let locCity = loc.city || "";
          if (loc.area) {
            const parts = loc.area.split(",").map((p: string) => p.trim());
            locArea = parts[0] || "";
            if (parts[1] && !locCity) locCity = parts[1];
          }
          if (!locCity && locArea) locCity = locArea;
          const locPin = loc.pincode || "";

          if (!area && locArea) onArea?.(locArea);
          if (!city && locCity) onCity?.(locCity);
          if (!pincode && locPin) onPincode?.(locPin);

          onChange?.({
            area: area || locArea || "",
            city: city || locCity || "",
            pincode: pincode || locPin || "",
            fulfilment
          });
        }
      } catch {}
    };

    if (!area || !city || !pincode) {
      syncFromStorage();
    }

    window.addEventListener("omeetso_location_changed", syncFromStorage);
    return () => window.removeEventListener("omeetso_location_changed", syncFromStorage);
  }, []);

  const setArea = (a: string) => {
    if (onArea) onArea(a);
    const p = AREA_PINCODES[a] || pincode || "";
    if (p && onPincode && !pincode) onPincode(p);
    if (onChange) onChange({ area: a, pincode: p || pincode || "", city: city || "", fulfilment });
  };

  const setPin = async (p: string) => {
    if (onPincode) onPincode(p);
    if (p.length === 6) {
      try {
        const loc = await fetchAreaFromPincode(p);
        if (loc && loc.area && !loc.area.startsWith("Area ")) {
          if (onArea) onArea(loc.area);
          if (loc.city && onCity) onCity(loc.city);
          if (onChange) onChange({ pincode: p, area: loc.area, city: loc.city || city || "", fulfilment });
          return;
        }
      } catch {}
    }
    if (onChange) onChange({ pincode: p, area: area || "", city: city || "", fulfilment });
  };

  const setCt = (c: string) => {
    if (onCity) onCity(c);
    if (onChange) onChange({ city: c, area: area || "", pincode: pincode || "", fulfilment });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-xs font-bold text-muted-foreground">Pincode *</label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={pincode || ""}
            onKeyDown={(e) => preventNonNumericKeyDown(e)}
            onChange={(e) => setPin(sanitizeNumericInput(e.target.value).slice(0, 6))}
            className={cn("w-full h-11 rounded-2xl border bg-background px-3 text-xs font-bold text-foreground outline-none focus:border-indigo-brand", error?.pincode ? "border-red-400" : "border-border")}
            placeholder="e.g. 504001"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold text-muted-foreground">Area Name *</label>
          <input
            type="text"
            value={area || ""}
            onChange={(e) => setArea(e.target.value)}
            className={cn("w-full h-11 rounded-2xl border bg-background px-3 text-xs font-bold text-foreground outline-none focus:border-indigo-brand", error?.area ? "border-red-400" : "border-border")}
            placeholder="e.g. Adilabad"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-bold text-muted-foreground">City *</label>
        <input
          type="text"
          value={city || ""}
          onChange={(e) => setCt(e.target.value)}
          className="w-full h-11 rounded-2xl border border-border bg-background px-3 text-xs font-bold text-foreground outline-none focus:border-indigo-brand"
          placeholder="e.g. Adilabad"
        />
      </div>

      <p className="rounded-2xl bg-secondary/60 p-3 text-[11px] font-medium text-muted-foreground leading-relaxed">
        🔒 Your exact street address is never published. Only your selected area ({area || city || "your area"}) will be shown to nearby buyers.
      </p>
    </div>
  );
}

// ---------------- Contact preference selector ----------------
const PREFS: ContactPref[] = ["chat_only", "call_and_chat", "hide_number"];
const TIMES: BestContactTime[] = ["anytime", "morning", "afternoon", "evening"];
export function ContactPreferenceSelector({
  pref, time, bestTime, whatsappPhone, enableWhatsapp, sellerPhone,
  onPref, onPrefChange, onTime, onTimeChange, onWhatsappPhoneChange, onEnableWhatsappChange, onSellerPhoneChange,
}: {
  pref?: ContactPref; time?: BestContactTime; bestTime?: BestContactTime;
  whatsappPhone?: string; enableWhatsapp?: boolean; sellerPhone?: string;
  onPref?: (p: ContactPref) => void;
  onPrefChange?: (p: ContactPref) => void;
  onTime?: (t: BestContactTime) => void;
  onTimeChange?: (t: BestContactTime) => void;
  onWhatsappPhoneChange?: (v: string) => void;
  onEnableWhatsappChange?: (b: boolean) => void;
  onSellerPhoneChange?: (v: string) => void;
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

      {/* Direct phone number if calling enabled */}
      {currentPref === "call_and_chat" && (
        <div className="rounded-2xl border border-indigo-brand/20 bg-indigo-brand/5 p-3.5 space-y-2">
          <div className="flex items-center justify-between mb-0.5">
            <label className="block text-[11px] font-bold text-muted-foreground">Direct Calling Phone Number</label>
            <span className="text-[10px] font-bold text-muted-foreground">10 digits</span>
          </div>
          <div className="flex items-center rounded-xl border border-border bg-background px-3 py-2 focus-within:border-indigo-brand focus-within:ring-2 focus-within:ring-indigo-brand/20 transition-all">
            <span className="flex items-center gap-1.5 text-xs font-bold text-foreground font-mono pr-2.5 border-r border-border mr-2.5 shrink-0 select-none">
              <span className="text-sm">🇮🇳</span> +91
            </span>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={16}
              value={formatPhoneDisplay(sellerPhone ?? "")}
              onKeyDown={(e) => preventNonNumericKeyDown(e)}
              onChange={(e) => {
                const cleaned = cleanPhoneInput(e.target.value);
                onSellerPhoneChange?.(cleaned);
              }}
              placeholder="98765 43210"
              className="w-full bg-transparent text-xs font-bold text-foreground outline-none font-mono tracking-wider placeholder:font-normal placeholder:text-muted-foreground/60"
            />
          </div>
          {sellerPhone && sellerPhone.length > 0 && sellerPhone.length < 10 && (
            <p className="mt-1 text-[10.5px] font-bold text-amber-600">Please enter a complete 10-digit mobile number ({sellerPhone.length}/10)</p>
          )}
        </div>
      )}

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
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-bold text-muted-foreground">WhatsApp Number (Optional if same as account phone)</label>
              <span className="text-[10px] font-bold text-muted-foreground">10 digits</span>
            </div>
            <div className="flex items-center rounded-xl border border-border bg-background px-3 py-2 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
              <span className="flex items-center gap-1.5 text-xs font-bold text-foreground font-mono pr-2.5 border-r border-border mr-2.5 shrink-0 select-none">
                <span className="text-sm">🇮🇳</span> +91
              </span>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={16}
                value={formatPhoneDisplay(whatsappPhone ?? "")}
                onKeyDown={(e) => preventNonNumericKeyDown(e)}
                onChange={(e) => {
                  const cleaned = cleanPhoneInput(e.target.value);
                  onWhatsappPhoneChange?.(cleaned);
                }}
                placeholder="98765 43210"
                className="w-full bg-transparent text-xs font-bold text-foreground outline-none font-mono tracking-wider placeholder:font-normal placeholder:text-muted-foreground/60"
              />
            </div>
            {whatsappPhone && whatsappPhone.length > 0 && whatsappPhone.length < 10 && (
              <p className="mt-1 text-[10.5px] font-bold text-amber-600">Please enter a complete 10-digit mobile number ({whatsappPhone.length}/10)</p>
            )}
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
// ---------------- Loading overlay ----------------
export function LoadingOverlay({ open, label }: { open: boolean; label?: string }) {
  if (!open) return null;
  return (
    <div role="status" aria-live="assertive" className="fixed inset-0 z-[100] grid place-items-center bg-background/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-3xl bg-card border border-border/80 p-6 shadow-2xl text-center space-y-4">
        <div className="relative mx-auto h-16 w-16 grid place-items-center">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-brand/20 animate-ping opacity-40" />
          <div className="h-14 w-14 rounded-full border-4 border-t-indigo-brand border-r-indigo-brand border-b-indigo-brand/20 border-l-indigo-brand/20 animate-spin" />
          <div className="absolute inset-0 grid place-items-center">
            <span className="text-xl">⚡</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <h3 className="text-base font-extrabold text-foreground tracking-tight">
            {label ?? "Publishing Listing…"}
          </h3>
          <p className="text-xs text-muted-foreground font-medium animate-pulse">
            Compressing photos, saving to MongoDB, and alerting nearby buyers…
          </p>
        </div>

        <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
          <div className="h-full rounded-full bg-indigo-brand animate-[pulse_1.2s_ease-in-out_infinite]" style={{ width: "85%" }} />
        </div>
      </div>
    </div>
  );
}

export { MissingFieldsModal } from "./MissingFieldsModal";
export { AddCategoryModal } from "./AddCategoryModal";
