import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export function FilterChip({
  label, active, onClick, onClear,
}: { label: string; active?: boolean; onClick?: () => void; onClear?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground hover:bg-secondary"
      )}
    >
      <span>{label}</span>
      {active && onClear && (
        <span
          role="button"
          tabIndex={0}
          aria-label={`Clear ${label}`}
          onClick={(e) => { e.stopPropagation(); onClear(); }}
          className="grid h-4 w-4 place-items-center rounded-full bg-primary-foreground/20"
        >
          <X className="h-2.5 w-2.5" />
        </span>
      )}
    </button>
  );
}
