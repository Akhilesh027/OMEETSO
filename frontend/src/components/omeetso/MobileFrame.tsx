import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Mobile-first phone frame on small screens; unwraps to full responsive width on md+.
export function MobileFrame({
  children,
  className,
  fullHeight = false,
}: {
  children: ReactNode;
  className?: string;
  fullHeight?: boolean;
}) {
  return (
    <div
      className={cn(
        "w-full flex justify-center md:bg-background",
        fullHeight
          ? "h-[100dvh] max-h-[100dvh] overflow-hidden bg-background md:h-auto md:min-h-dvh"
          : "min-h-dvh bg-slate-100/60"
      )}
    >
      <div
        className={cn(
          "w-full max-w-[430px] bg-background relative overflow-hidden",
          "shadow-[0_0_60px_-20px_rgba(17,30,77,0.25)]",
          "md:max-w-none md:shadow-none md:overflow-visible",
          fullHeight
            ? "h-[100dvh] max-h-[100dvh] flex flex-col md:h-auto md:max-h-none"
            : "min-h-dvh",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}
