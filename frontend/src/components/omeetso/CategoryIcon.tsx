import React from "react";
import * as Lucide from "lucide-react";
import type { Category } from "@/lib/mock";
import { cn } from "@/lib/utils";

export function CategoryIcon({
  c,
  size = "md",
  onClick,
}: {
  c: Category | { id: string; name: string; icon?: string; tint?: string };
  size?: "sm" | "md";
  onClick?: (c: any, e: React.MouseEvent) => void;
}) {
  const Icon = (Lucide as unknown as Record<string, Lucide.LucideIcon>)[c.icon || "Package"] ?? Lucide.Package;

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      e.stopPropagation();
      onClick(c, e);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="group flex flex-col items-center gap-2 text-center select-none cursor-pointer"
    >
      <div
        className={cn(
          "grid place-items-center rounded-2xl bg-card border border-border/80 shadow-sm transition-all duration-300 ease-out group-hover:-translate-y-1.5 group-hover:shadow-md group-hover:border-primary/40",
          size === "md" ? "h-15 w-15 p-2" : "h-12 w-12 p-1.5"
        )}
      >
        <div
          className={cn(
            "grid place-items-center rounded-xl transition-all duration-300 group-hover:scale-110",
            (c as any).tint || "bg-primary/10 text-primary",
            size === "md" ? "h-11 w-11" : "h-9 w-9"
          )}
        >
          <Icon className={cn("transition-transform duration-300", size === "md" ? "h-5.5 w-5.5" : "h-4.5 w-4.5")} />
        </div>
      </div>
      <span className="text-[11.5px] font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
        {c.name}
      </span>
    </div>
  );
}
