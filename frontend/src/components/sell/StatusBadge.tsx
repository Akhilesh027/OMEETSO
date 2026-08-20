import { cn } from "@/lib/utils";
import type { ListingStatus } from "@/lib/listings";
import { STATUS_LABEL } from "@/lib/listings";
import {
  FileEdit, Clock, CheckCircle2, AlertTriangle, XCircle,
  PauseCircle, BadgeCheck, TimerOff, Trash2,
} from "lucide-react";

const map: Record<ListingStatus, { cls: string; Icon: typeof Clock }> = {
  draft:            { cls: "bg-muted text-muted-foreground border-border", Icon: FileEdit },
  under_review:     { cls: "bg-blue-100 text-blue-800 border-blue-200", Icon: Clock },
  active:           { cls: "bg-emerald-100 text-emerald-800 border-emerald-200", Icon: CheckCircle2 },
  requires_changes: { cls: "bg-orange-100 text-orange-800 border-orange-200", Icon: AlertTriangle },
  rejected:         { cls: "bg-red-100 text-red-800 border-red-200", Icon: XCircle },
  paused:           { cls: "bg-yellow-100 text-yellow-900 border-yellow-200", Icon: PauseCircle },
  sold:             { cls: "bg-navy text-white border-navy", Icon: BadgeCheck },
  expired:          { cls: "bg-slate-200 text-slate-700 border-slate-300", Icon: TimerOff },
  removed:          { cls: "bg-red-900 text-white border-red-900", Icon: Trash2 },
};

export function StatusBadge({ status, size = "sm" }: { status: ListingStatus | string; size?: "sm" | "md" }) {
  const raw = (status || "active").toLowerCase();
  let key: ListingStatus = "active";
  if (raw === "approved" || raw === "active") key = "active";
  else if (raw === "submitted" || raw === "pending_review" || raw === "under_review") key = "under_review";
  else if (raw === "sold") key = "sold";
  else if (raw === "expired") key = "expired";
  else if (raw === "rejected") key = "rejected";
  else if (raw === "paused") key = "paused";
  else if (raw === "draft") key = "draft";
  else if (raw === "requires_changes") key = "requires_changes";

  const config = map[key] || map.active;
  const label = STATUS_LABEL[key] || "Active";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-semibold",
        config.cls,
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-xs",
      )}
    >
      <config.Icon className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
      {label}
    </span>
  );
}
