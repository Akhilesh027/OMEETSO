import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  mono?: boolean;
  showText?: boolean;
}

export function Logo({ className, size = "md", mono = false }: LogoProps) {
  const sizeMap = {
    sm: "text-xl sm:text-2xl",
    md: "text-2xl sm:text-3xl",
    lg: "text-3xl sm:text-4xl",
    xl: "text-4xl sm:text-5xl",
  };

  const sizeClass = sizeMap[size] || sizeMap.md;

  return (
    <div className={cn("inline-flex items-center select-none shrink-0", className)}>
      <span
        className={cn(
          "font-black lowercase tracking-tighter transition-all",
          sizeClass,
          mono
            ? "text-white"
            : "text-primary hover:text-electric"
        )}
        style={{ fontFamily: "'Poppins', 'Plus Jakarta Sans', sans-serif", letterSpacing: "-0.04em" }}
      >
        omeetso
      </span>
    </div>
  );
}


