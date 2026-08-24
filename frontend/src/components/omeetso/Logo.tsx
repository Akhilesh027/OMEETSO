import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  mono?: boolean;
  showText?: boolean;
  alt?: string;
}

export function Logo({ className, size = "md", mono = false, alt = "Omeetso" }: LogoProps) {
  const sizeMap = {
    xs: "h-7.5 sm:h-8.5",
    sm: "h-10 sm:h-11 md:h-12",
    md: "h-12 sm:h-14 lg:h-16",
    lg: "h-15 sm:h-18 lg:h-20",
    xl: "h-22 sm:h-26 lg:h-30",
  };

  const sizeClass = sizeMap[size] || sizeMap.md;

  return (
    <div className={cn("inline-flex items-center justify-center select-none shrink-0 overflow-visible", className)}>
      <img
        src="/logo.png"
        alt={alt}
        className={cn(
          "w-auto max-w-none object-contain transition-all duration-200 transform scale-[1.24] origin-left",
          sizeClass,
          mono ? "brightness-0 invert drop-shadow-sm" : ""
        )}
        loading="eager"
      />
    </div>
  );
}



