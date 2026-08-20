import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { PackageSearch } from "lucide-react";

export function EmptyState({
  title,
  body,
  ctaLabel,
  onCta,
  icon,
  className,
}: {
  title: string;
  body?: string;
  ctaLabel?: string;
  onCta?: () => void;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-10 text-center", className)}>
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
        {icon ?? <PackageSearch className="h-6 w-6" />}
      </div>
      <p className="mt-3 text-sm font-bold">{title}</p>
      {body && <p className="mt-1 max-w-xs text-xs text-muted-foreground">{body}</p>}
      {ctaLabel && onCta && (
        <button
          onClick={onCta}
          className="mt-4 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"
        >
          {ctaLabel}
        </button>
      )}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  body = "Please try again in a moment.",
  onRetry,
}: { title?: string; body?: string; onRetry?: () => void }) {
  return (
    <EmptyState
      title={title}
      body={body}
      ctaLabel={onRetry ? "Retry" : undefined}
      onCta={onRetry}
    />
  );
}

export function ProductSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[4/3] w-full rounded-2xl bg-secondary" />
      <div className="mt-2 h-4 w-16 rounded bg-secondary" />
      <div className="mt-1 h-3 w-full rounded bg-secondary" />
      <div className="mt-1 h-3 w-20 rounded bg-secondary" />
    </div>
  );
}
