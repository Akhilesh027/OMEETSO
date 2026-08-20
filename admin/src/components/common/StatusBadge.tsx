import { cn } from "@/utils/cn";
export function StatusBadge({ tone = "neutral", children }: { tone?: "neutral" | "success" | "warning" | "error" | "info" | "primary"; children: React.ReactNode }) {
  const tones: Record<string, string> = {
    neutral: "bg-slate-100 text-slate-700",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    error: "bg-rose-100 text-rose-700",
    info: "bg-sky-100 text-sky-700",
    primary: "bg-indigo-100 text-indigo-700",
  };
  return <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide", tones[tone])}>{children}</span>;
}
