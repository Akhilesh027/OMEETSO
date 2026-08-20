import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomSheet({
  open, onClose, title, children, footer,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-4" role="dialog" aria-modal="true">
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-navy/60 backdrop-blur-sm"
        style={{ animation: "ob-fade-in 180ms both" }}
      />
      <div
        className={cn(
          "relative flex max-h-[92dvh] w-full max-w-md flex-col rounded-t-3xl bg-card shadow-2xl safe-b md:rounded-3xl md:max-w-lg md:border md:border-border"
        )}
        style={{ animation: "ob-slide-up 260ms ease-out both" }}
      >
        <div className="grid place-items-center pt-2 pb-1 md:hidden">
          <span className="h-1.5 w-12 rounded-full bg-border" />
        </div>
        {title && (
          <div className="flex items-center justify-between px-5 pb-2 pt-1">
            <h2 className="text-base font-bold">{title}</h2>
            <button
              onClick={onClose}
              aria-label="Close"
              className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-secondary"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-5 pb-4">{children}</div>
        {footer && <div className="border-t border-border p-4">{footer}</div>}
      </div>
    </div>
  );
}
