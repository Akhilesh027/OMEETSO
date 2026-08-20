import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Mobile-first phone frame on small screens; unwraps to full responsive width on md+.
export function MobileFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className="min-h-dvh w-full bg-slate-100/60 flex justify-center md:bg-background">
      <div className={cn(
        "w-full max-w-[430px] min-h-dvh bg-background relative overflow-hidden",
        "shadow-[0_0_60px_-20px_rgba(17,30,77,0.25)]",
        "md:max-w-none md:shadow-none md:overflow-visible",
        className,
      )}>
        {children}
      </div>
    </div>
  );
}
