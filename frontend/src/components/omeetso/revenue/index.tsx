import { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import {
  Sparkles, TrendingUp, Wallet as WalletIcon, Megaphone, Check, AlertCircle,
  Clock, PauseCircle, PlayCircle, XCircle, CheckCircle2, FileText, Info, ChevronRight,
} from "lucide-react";
import type { PromotionStatus, CampaignStatus, BoostPackage, PlacementId } from "@/lib/revenue";
import { formatINR, formatDate, getPlacement } from "@/lib/revenue";

// ---------- Section headings ----------
export function SectionTitle({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">{children}</h2>
      {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
    </div>
  );
}

// ---------- Status badges ----------
const promoStyle: Record<PromotionStatus, string> = {
  draft: "bg-slate-100 text-slate-700",
  payment_pending: "bg-amber-100 text-amber-800",
  under_review: "bg-blue-100 text-blue-800",
  scheduled: "bg-indigo-100 text-indigo-800",
  active: "bg-emerald-100 text-emerald-800",
  paused: "bg-orange-100 text-orange-800",
  completed: "bg-slate-100 text-slate-700",
  expired: "bg-slate-100 text-slate-700",
  rejected: "bg-rose-100 text-rose-800",
  cancelled: "bg-slate-100 text-slate-700",
};
const campStyle: Record<CampaignStatus, string> = {
  draft: "bg-slate-100 text-slate-700",
  payment_pending: "bg-amber-100 text-amber-800",
  under_review: "bg-blue-100 text-blue-800",
  approved: "bg-teal-100 text-teal-800",
  scheduled: "bg-indigo-100 text-indigo-800",
  active: "bg-emerald-100 text-emerald-800",
  paused: "bg-orange-100 text-orange-800",
  rejected: "bg-rose-100 text-rose-800",
  completed: "bg-slate-100 text-slate-700",
  cancelled: "bg-slate-100 text-slate-700",
};

const STATUS_ICON: Record<string, any> = {
  active: PlayCircle, paused: PauseCircle, completed: CheckCircle2,
  rejected: XCircle, under_review: Clock, payment_pending: Clock,
  draft: FileText, scheduled: Clock, expired: XCircle, cancelled: XCircle, approved: Check,
};

export function PromotionStatusBadge({ status }: { status: PromotionStatus }) {
  const Ico = STATUS_ICON[status] ?? Info;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase", promoStyle[status])}>
      <Ico className="h-3 w-3" /> {status.replace("_", " ")}
    </span>
  );
}
export function CampaignStatusBadge({ status }: { status: CampaignStatus }) {
  const Ico = STATUS_ICON[status] ?? Info;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase", campStyle[status])}>
      <Ico className="h-3 w-3" /> {status.replace("_", " ")}
    </span>
  );
}

// ---------- Wallet balance card ----------
export function WalletBalanceCard({ balance, credits, refunds, onAdd }: {
  balance: number; credits: number; refunds: number; onAdd?: () => void;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl gradient-brand p-4 text-white card-elev">
      <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10" />
      <div className="relative">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide opacity-80">
          <WalletIcon className="h-4 w-4" /> Omeetso Wallet
        </div>
        <p className="mt-1 text-3xl font-extrabold">{formatINR(balance)}</p>
        <p className="text-[11px] text-white/70">Available balance</p>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-xl bg-white/10 p-2">
            <p className="text-[10px] uppercase text-white/70">Promo Credits</p>
            <p className="font-bold">{formatINR(credits)}</p>
          </div>
          <div className="rounded-xl bg-white/10 p-2">
            <p className="text-[10px] uppercase text-white/70">Refund Balance</p>
            <p className="font-bold">{formatINR(refunds)}</p>
          </div>
        </div>
        {onAdd && (
          <button
            onClick={onAdd}
            className="mt-3 w-full rounded-full bg-yellow-brand py-2 text-sm font-bold text-navy"
          >
            + Add Money
          </button>
        )}
        <p className="mt-2 text-[10px] text-white/70">
          Wallet funds can only be used for Omeetso platform services.
        </p>
      </div>
    </div>
  );
}

// ---------- Boost package card ----------
export function BoostPackageCard({
  pkg, selected, onSelect,
}: {
  pkg: BoostPackage; selected: boolean; onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "relative w-full rounded-2xl border-2 p-4 text-left transition",
        selected ? "border-primary bg-primary/5" : "border-border bg-card",
      )}
    >
      {pkg.popularTag && (
        <span className="absolute -top-2 left-4 rounded-full bg-yellow-brand px-2 py-0.5 text-[10px] font-bold text-navy">
          {pkg.popularTag}
        </span>
      )}
      <div className="flex items-baseline justify-between gap-2">
        <div>
          <p className="text-base font-extrabold">{pkg.name}</p>
          <p className="text-[11px] text-muted-foreground">{pkg.duration} days • {pkg.visibilityMultiplier} visibility</p>
        </div>
        <p className="shrink-0 text-lg font-extrabold text-primary">{formatINR(pkg.price)}</p>
      </div>
      <ul className="mt-2 space-y-1">
        {pkg.benefits.map((b) => (
          <li key={b} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
            <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600" /> {b}
          </li>
        ))}
      </ul>
      {selected && (
        <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-primary">
          <Check className="h-3.5 w-3.5" /> Selected
        </div>
      )}
    </button>
  );
}

// ---------- Placement selector ----------
export function PlacementRow({
  id, selected, disabled, onToggle,
}: { id: PlacementId; selected: boolean; disabled?: boolean; onToggle: () => void }) {
  const p = getPlacement(id);
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onToggle}
      aria-pressed={selected}
      className={cn(
        "flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition",
        selected ? "border-primary bg-primary/5" : "border-border bg-card",
        disabled && "opacity-50",
      )}
    >
      <div className={cn(
        "mt-1 grid h-5 w-5 place-items-center rounded border",
        selected ? "border-primary bg-primary text-white" : "border-border",
      )}>
        {selected && <Check className="h-3 w-3" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-bold">{p.name}</p>
          <p className="text-[11px] font-semibold text-primary">{formatINR(p.price)}</p>
        </div>
        <p className="mt-0.5 text-[11px] text-muted-foreground">{p.description}</p>
        <p className="mt-1 text-[10px] text-muted-foreground">
          Format: {p.format} • Ratio {p.ratio} • Est. {p.estImpressions}
        </p>
      </div>
    </button>
  );
}

// ---------- Billing summary ----------
export function BillingSummary({
  base, tax, credits, total, extras,
}: { base: number; tax: number; credits: number; total: number; extras?: { label: string; value: string }[] }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3 text-sm">
      <Row label="Base amount" value={formatINR(base)} />
      <Row label="Tax (GST 18%)" value={formatINR(tax)} />
      {credits > 0 && <Row label="Wallet credits" value={`− ${formatINR(credits)}`} tone="ok" />}
      {extras?.map((r) => <Row key={r.label} label={r.label} value={r.value} />)}
      <div className="mt-2 flex items-baseline justify-between border-t border-border pt-2">
        <p className="text-sm font-bold">Total payable</p>
        <p className="text-lg font-extrabold text-primary">{formatINR(total)}</p>
      </div>
    </div>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: "ok" }) {
  return (
    <div className="flex items-baseline justify-between py-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("text-xs font-semibold", tone === "ok" && "text-emerald-700")}>{value}</p>
    </div>
  );
}

// ---------- Objective card ----------
export function ObjectiveCard({
  label, description, selected, onSelect, icon: Icon = Sparkles,
}: { label: string; description: string; selected: boolean; onSelect: () => void; icon?: any }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition",
        selected ? "border-primary bg-primary/5" : "border-border bg-card",
      )}
    >
      <div className={cn(
        "grid h-9 w-9 shrink-0 place-items-center rounded-xl",
        selected ? "bg-primary text-white" : "bg-primary/10 text-primary",
      )}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold">{label}</p>
        <p className="text-[11px] text-muted-foreground">{description}</p>
      </div>
      {selected && <Check className="mt-1 h-4 w-4 text-primary" />}
    </button>
  );
}

// ---------- Analytics stat ----------
export function StatCell({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-2xl bg-secondary/40 p-3">
      <p className="text-[10px] font-semibold uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-extrabold">{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

// ---------- Bar chart ----------
export function MiniBars({ data, ariaLabel }: { data: { d: string; v: number }[]; ariaLabel: string }) {
  const max = Math.max(1, ...data.map((x) => x.v));
  return (
    <div role="img" aria-label={ariaLabel} className="rounded-2xl border border-border bg-card p-3">
      <div className="flex items-end justify-between gap-1" style={{ height: 120 }}>
        {data.map((x) => (
          <div key={x.d} className="flex flex-1 flex-col items-center gap-1">
            <div
              className="w-full rounded-t bg-primary/70"
              style={{ height: `${(x.v / max) * 100}%`, minHeight: 2 }}
            />
            <span className="text-[10px] text-muted-foreground">{x.d}</span>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[10px] text-muted-foreground">
        Text summary: values from {Math.min(...data.map((x) => x.v))} to {max}.
      </p>
    </div>
  );
}

// ---------- Empty / error state ----------
export function RevenueEmpty({
  icon: Icon = Megaphone, title, body, cta, to, onClick,
}: {
  icon?: any; title: string; body: string;
  cta?: string; to?: string; onClick?: () => void;
}) {
  return (
    <div className="mx-2 my-4 rounded-2xl border border-dashed border-border bg-card p-6 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="h-6 w-6" />
      </div>
      <p className="mt-3 text-sm font-bold">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{body}</p>
      {cta && (to
        ? <Link to={to} className="mt-3 inline-flex rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">{cta}</Link>
        : onClick && <button onClick={onClick} className="mt-3 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">{cta}</button>
      )}
    </div>
  );
}

export function RevenueError({
  title, body, actionLabel, onAction,
}: { title: string; body: string; actionLabel: string; onAction: () => void }) {
  return (
    <div className="mx-2 my-3 rounded-2xl border border-rose-200 bg-rose-50 p-4">
      <div className="flex items-start gap-2">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
        <div className="flex-1">
          <p className="text-sm font-bold text-rose-800">{title}</p>
          <p className="mt-0.5 text-xs text-rose-700">{body}</p>
          <button onClick={onAction} className="mt-2 rounded-full bg-rose-600 px-3 py-1.5 text-xs font-bold text-white">
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- Step indicator ----------
export function StepIndicator({ step, total, labels }: { step: number; total: number; labels?: string[] }) {
  return (
    <div className="px-4 pt-2" aria-label={`Step ${step} of ${total}`}>
      <div className="flex items-center justify-between text-[10px] font-semibold text-muted-foreground">
        <span>Step {step} of {total}</span>
        {labels?.[step - 1] && <span className="text-primary">{labels[step - 1]}</span>}
      </div>
      <div className="mt-1 flex gap-1">
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className={cn("h-1.5 flex-1 rounded-full", i < step ? "bg-primary" : "bg-secondary")} />
        ))}
      </div>
    </div>
  );
}

// ---------- Confirmation modal ----------
export function ConfirmModal({
  open, title, body, confirmLabel = "Confirm", cancelLabel = "Cancel",
  danger, onConfirm, onCancel,
}: {
  open: boolean; title: string; body: string;
  confirmLabel?: string; cancelLabel?: string; danger?: boolean;
  onConfirm: () => void; onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-navy/50 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-sm rounded-2xl bg-card p-4 shadow-xl">
        <p className="text-base font-bold">{title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{body}</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button onClick={onCancel} className="rounded-full border border-border py-2 text-sm font-semibold">
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={cn(
              "rounded-full py-2 text-sm font-bold text-white",
              danger ? "bg-rose-600" : "bg-primary text-primary-foreground",
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- Promotion / Campaign list card ----------
export function PromotionCard({ p, onClick }: { p: import("@/lib/revenue").Promotion; onClick?: () => void }) {
  const rem = Math.max(0, Math.ceil((p.endAt - Date.now()) / 86400000));
  return (
    <div className="rounded-2xl border border-border bg-card p-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold">{p.packageName}</p>
        <PromotionStatusBadge status={p.status} />
      </div>
      <p className="mt-0.5 text-[11px] text-muted-foreground">
        {p.target.kind === "listing" ? "Listing" : p.target.kind === "store" ? "Store" : "Store product"} • {p.duration} days • {p.areas.slice(0, 2).join(", ")}
      </p>
      <div className="mt-2 grid grid-cols-3 gap-2 text-center">
        <Mini label="Impressions" value={p.analytics.impressions.toLocaleString()} />
        <Mini label="Views" value={p.analytics.views.toLocaleString()} />
        <Mini label="Chats" value={p.analytics.chats.toLocaleString()} />
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>{p.status === "active" ? `${rem} day${rem === 1 ? "" : "s"} left` : `Ends ${formatDate(p.endAt)}`}</span>
        {onClick && <button onClick={onClick} className="inline-flex items-center gap-0.5 font-bold text-primary">View <ChevronRight className="h-3 w-3" /></button>}
      </div>
    </div>
  );
}

export function CampaignCard({ c, onClick }: { c: any; onClick?: () => void }) {
  const imageUrl = c.creative?.imageUrl || c.bannerUrl || c.images?.[0];
  const headline = c.creative?.headline || c.description || c.objective || "";
  const name = c.name || c.title || "Advertisement Campaign";
  const impressions = c.analytics?.impressions ?? c.impressionsCount ?? 0;
  const clicks = c.analytics?.clicks ?? c.clicksCount ?? 0;
  const spent = c.amountSpent ?? (c.pricing?.totalInPaise ? c.pricing.totalInPaise / 100 : 0);
  const totalBudget = c.schedule?.totalBudget ?? (c.pricing?.totalInPaise ? c.pricing.totalInPaise / 100 : spent);

  return (
    <div className="flex gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm">
      {imageUrl ? (
        <img src={imageUrl} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover border border-border" />
      ) : (
        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-secondary text-muted-foreground"><Megaphone className="h-5 w-5" /></div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="line-clamp-1 text-sm font-bold text-foreground">{name}</p>
          <CampaignStatusBadge status={c.status} />
        </div>
        {headline && <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">{headline}</p>}
        <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
          <span><b className="text-foreground">{impressions.toLocaleString()}</b> imp</span>
          <span><b className="text-foreground">{clicks.toLocaleString()}</b> clicks</span>
          <span><b className="text-foreground">{formatINR(spent)}</b> / {formatINR(totalBudget)}</span>
        </div>
        {onClick && <button onClick={onClick} className="mt-1 inline-flex items-center gap-0.5 text-[11px] font-bold text-primary">Details <ChevronRight className="h-3 w-3" /></button>}
      </div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-secondary/40 p-1.5">
      <p className="text-sm font-bold">{value}</p>
      <p className="text-[9px] text-muted-foreground">{label}</p>
    </div>
  );
}

// ---------- Preview cards (sponsored variants) ----------
export function PreviewSponsoredCard({ title, subtitle, imageUrl, cta, advertiser, badge }: {
  title: string; subtitle?: string; imageUrl?: string; cta: string; advertiser: string; badge?: string;
}) {
  return (
    <div
      role="group"
      aria-label="Advertisement"
      className="relative overflow-hidden rounded-2xl border-2 border-yellow-brand/60 bg-yellow-brand/[0.06] card-elev"
    >
      {imageUrl && <img src={imageUrl} alt={title} className="aspect-[4/3] w-full object-cover" />}
      <span className="absolute left-2 top-2 rounded-full bg-navy px-2 py-0.5 text-[10px] font-bold text-white">Sponsored</span>
      {badge && <span className="absolute right-2 top-2 rounded-full bg-yellow-brand px-2 py-0.5 text-[10px] font-bold text-navy">{badge}</span>}
      <div className="p-2">
        <p className="line-clamp-2 text-sm font-bold">{title}</p>
        {subtitle && <p className="mt-0.5 text-[11px] text-muted-foreground">{subtitle}</p>}
        <div className="mt-2 flex items-center justify-between">
          <p className="text-[10px] text-muted-foreground">Ad by {advertiser}</p>
          <span className="rounded-full bg-primary px-2 py-1 text-[10px] font-bold text-primary-foreground">{cta}</span>
        </div>
      </div>
    </div>
  );
}
