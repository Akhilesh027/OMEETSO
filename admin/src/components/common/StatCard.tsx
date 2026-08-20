import type { LucideIcon } from "lucide-react";
import { cn } from "@/utils/cn";

interface Props {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  tone?: "default" | "success" | "warning" | "error" | "info";
}
export function StatCard({ label, value, hint, icon: Icon, tone = "default" }: Props) {
  const tones: Record<string, string> = {
    default: "text-admin-indigo bg-indigo-50",
    success: "text-admin-success bg-emerald-50",
    warning: "text-admin-warning bg-amber-50",
    error: "text-admin-error bg-rose-50",
    info: "text-admin-info bg-sky-50",
  };
  return (
    <div className="rounded-xl border border-admin-border bg-white p-4 shadow-panel">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-admin-muted">{label}</p>
          <p className="mt-1 text-2xl font-extrabold text-admin-navy">{value}</p>
          {hint && <p className="mt-1 text-xs text-admin-muted">{hint}</p>}
        </div>
        {Icon && (
          <span className={cn("grid h-9 w-9 place-items-center rounded-lg", tones[tone])}>
            <Icon className="h-4 w-4" aria-hidden />
          </span>
        )}
      </div>
    </div>
  );
}
