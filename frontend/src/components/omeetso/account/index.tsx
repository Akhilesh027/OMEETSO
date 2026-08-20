import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight, Check, AlertTriangle, ShieldCheck, Info, X, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VerifStatus } from "@/lib/account";
import { verifStatusLabel } from "@/lib/account";

// ---------- Sections & rows ----------
export function SectionTitle({ children }: { children: ReactNode }) {
  return <p className="mb-1.5 mt-3 px-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{children}</p>;
}

export function MenuGroup({ children }: { children: ReactNode }) {
  return <div className="overflow-hidden rounded-2xl bg-card card-elev">{children}</div>;
}

export function MenuRow({
  icon: Icon, label, to, params, onClick, badge, chevron = true, sub,
}: {
  icon?: any; label: string; to?: string; params?: any; onClick?: () => void;
  badge?: string | number; chevron?: boolean; sub?: string;
}) {
  const inner = (
    <div className="flex min-h-11 items-center gap-3 border-b border-border px-4 py-3 last:border-b-0 active:bg-muted">
      {Icon && (
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
          <Icon className="h-4 w-4" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{label}</p>
        {sub && <p className="truncate text-[11px] text-muted-foreground">{sub}</p>}
      </div>
      {badge != null && badge !== "" && (
        <span className="rounded-full bg-orange-brand px-2 py-0.5 text-[10px] font-bold text-navy">{badge}</span>
      )}
      {chevron && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
    </div>
  );
  if (to) return <Link to={to} params={params}>{inner}</Link>;
  return <button type="button" onClick={onClick} className="w-full text-left">{inner}</button>;
}

// ---------- Toggle ----------
export function Toggle({
  checked, onChange, label, description, disabled, ariaLabel,
}: {
  checked: boolean; onChange: (v: boolean) => void; label?: string;
  description?: string; disabled?: boolean; ariaLabel?: string;
}) {
  return (
    <label className={cn("flex items-center gap-3 py-2", disabled && "opacity-60")}>
      <div className="min-w-0 flex-1">
        {label && <p className="text-sm font-semibold">{label}</p>}
        {description && <p className="text-[11px] text-muted-foreground">{description}</p>}
      </div>
      <button type="button" role="switch" aria-checked={checked} aria-label={ariaLabel ?? label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn("relative h-6 w-11 shrink-0 rounded-full transition",
          checked ? "bg-primary" : "bg-secondary border border-border")}>
        <span className={cn("absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition",
          checked ? "translate-x-5" : "translate-x-0")} />
      </button>
    </label>
  );
}

// ---------- Verification ----------
export function VerifBadge({ status }: { status: VerifStatus }) {
  const color = {
    verified: "bg-emerald-50 text-emerald-700 border-emerald-200",
    under_review: "bg-blue-50 text-blue-700 border-blue-200",
    submitted: "bg-blue-50 text-blue-700 border-blue-200",
    in_progress: "bg-amber-50 text-amber-800 border-amber-200",
    requires_changes: "bg-amber-50 text-amber-800 border-amber-200",
    rejected: "bg-rose-50 text-rose-700 border-rose-200",
    expired: "bg-rose-50 text-rose-700 border-rose-200",
    not_started: "bg-secondary text-muted-foreground border-border",
  }[status];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide", color)}>
      {status === "verified" && <ShieldCheck className="h-3 w-3" />}
      {status === "requires_changes" && <AlertTriangle className="h-3 w-3" />}
      {verifStatusLabel[status]}
    </span>
  );
}

export function VerifProgress({ done, total }: { done: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return (
    <div className="rounded-2xl bg-card p-3 card-elev">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold">Trust progress</p>
        <p className="text-xs font-bold">{done} of {total}</p>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
        <div className="h-full rounded-full gradient-brand" style={{ width: `${pct}%` }} aria-label={`${pct}% complete`} />
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground">Complete verification steps to boost buyer trust.</p>
    </div>
  );
}

// ---------- Timeline ----------
export function StatusTimeline({ items }: { items: { title: string; time: number; note?: string; done?: boolean }[] }) {
  return (
    <ol className="space-y-3">
      {items.map((it, i) => (
        <li key={i} className="relative flex gap-3 pl-1">
          <div className="mt-0.5 flex flex-col items-center">
            <span className={cn("grid h-5 w-5 place-items-center rounded-full text-[10px]",
              it.done ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground border border-border")}>
              {it.done ? <Check className="h-3 w-3" /> : i + 1}
            </span>
            {i < items.length - 1 && <span className="mt-1 h-6 w-px bg-border" />}
          </div>
          <div className="min-w-0 flex-1 pb-1">
            <p className="text-sm font-semibold">{it.title}</p>
            <p className="text-[11px] text-muted-foreground">{new Date(it.time).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
            {it.note && <p className="mt-0.5 text-xs text-muted-foreground">{it.note}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}

// ---------- Rating input ----------
export function RatingStars({
  value, onChange, size = 24, ariaLabel = "Rating",
}: { value: number; onChange?: (v: number) => void; size?: number; ariaLabel?: string }) {
  const [hover, setHover] = useState(0);
  const readOnly = !onChange;
  const shown = hover || value;
  return (
    <div role={readOnly ? undefined : "radiogroup"} aria-label={ariaLabel} className="inline-flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" disabled={readOnly}
          role={readOnly ? undefined : "radio"}
          aria-checked={readOnly ? undefined : value === n}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          onClick={() => onChange?.(n)}
          onMouseEnter={() => !readOnly && setHover(n)}
          onMouseLeave={() => !readOnly && setHover(0)}
          className={cn("focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded", readOnly && "cursor-default")}>
          <Star style={{ width: size, height: size }} className={cn(n <= shown ? "fill-yellow-brand text-yellow-brand" : "text-border")} />
        </button>
      ))}
      <span className="sr-only">{value} out of 5</span>
    </div>
  );
}

export function RatingRow({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between py-2">
      <p className="text-sm font-semibold">{label}</p>
      <RatingStars value={value} onChange={onChange} size={22} ariaLabel={label} />
    </div>
  );
}

// ---------- Empty & Error ----------
export function EmptyBlock({ icon: Icon = Info, title, body, cta, onCta, to }: {
  icon?: any; title: string; body?: string; cta?: string; onCta?: () => void; to?: string;
}) {
  const btn = cta ? (
    to ? <Link to={to} className="mt-3 inline-block rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">{cta}</Link>
      : <button onClick={onCta} className="mt-3 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">{cta}</button>
  ) : null;
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-secondary text-muted-foreground"><Icon className="h-5 w-5" /></div>
      <p className="mt-3 text-sm font-bold">{title}</p>
      {body && <p className="mt-1 text-xs text-muted-foreground">{body}</p>}
      {btn}
    </div>
  );
}

export function ErrorBlock({ title = "Something went wrong", body, onRetry }: { title?: string; body?: string; onRetry?: () => void }) {
  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-center">
      <div className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-white text-rose-700"><AlertTriangle className="h-5 w-5" /></div>
      <p className="mt-2 text-sm font-bold text-rose-800">{title}</p>
      {body && <p className="mt-1 text-xs text-rose-700">{body}</p>}
      {onRetry && <button onClick={onRetry} className="mt-2 rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground">Retry</button>}
    </div>
  );
}

// ---------- Confirm modal ----------
export function ConfirmModal({
  open, title, body, confirmLabel = "Confirm", cancelLabel = "Cancel", danger, onConfirm, onCancel,
}: {
  open: boolean; title: string; body?: string; confirmLabel?: string; cancelLabel?: string;
  danger?: boolean; onConfirm: () => void; onCancel: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onCancel]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-navy/40 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-sm rounded-2xl bg-card p-4 shadow-xl">
        <p className="text-sm font-bold">{title}</p>
        {body && <p className="mt-1 text-xs text-muted-foreground">{body}</p>}
        <div className="mt-3 flex gap-2">
          <button onClick={onCancel} className="flex-1 rounded-full border border-border py-2 text-sm font-semibold">{cancelLabel}</button>
          <button onClick={onConfirm} className={cn("flex-1 rounded-full py-2 text-sm font-bold text-white",
            danger ? "bg-rose-600" : "bg-primary text-primary-foreground")}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

// ---------- Small stat ----------
export function Stat({ label, value, icon: Icon, colorClass = "bg-primary/10 text-primary" }: { label: string; value: string | number; icon?: any; colorClass?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-border/60 bg-card p-3.5 text-center card-elev transition-all hover:scale-[1.02] hover:shadow-md">
      {Icon && (
        <div className={`mb-1.5 grid h-8 w-8 place-items-center rounded-full ${colorClass}`}>
          <Icon className="h-4 w-4" />
        </div>
      )}
      <p className="text-xl font-extrabold tracking-tight">{value}</p>
      <p className="mt-0.5 text-[11px] font-semibold text-muted-foreground">{label}</p>
    </div>
  );
}
