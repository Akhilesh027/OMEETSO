import React from "react";
import { cn } from "@/lib/utils";

export interface InfinityLoaderProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  text?: string;
  subtext?: string;
  variant?: "page" | "fullscreen" | "section" | "inline";
  className?: string;
  whiteCard?: boolean;
}

const sizeConfig = {
  xs: { width: 28, height: 16, strokeWidth: 4.5, textSize: "text-[11px]" },
  sm: { width: 42, height: 24, strokeWidth: 5, textSize: "text-xs" },
  md: { width: 64, height: 36, strokeWidth: 5.5, textSize: "text-sm" },
  lg: { width: 90, height: 50, strokeWidth: 6, textSize: "text-base" },
  xl: { width: 130, height: 72, strokeWidth: 6.5, textSize: "text-lg" },
};

/**
 * Animated Infinity SVG Graphic with White and Light Blue mix gradient
 */
export function InfinitySpinner({
  size = "md",
  className,
}: {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const config = sizeConfig[size] || sizeConfig.md;
  const uniqueId = React.useId().replace(/:/g, "");

  return (
    <div className={cn("relative inline-flex items-center justify-center shrink-0", className)}>
      <svg
        width={config.width}
        height={config.height}
        viewBox="0 0 160 90"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        <defs>
          <linearGradient id={`inf-grad-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="35%" stopColor="#60A5FA" />
            <stop offset="70%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>
          <linearGradient id={`inf-shimmer-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#BAE6FD" stopOpacity="0.2" />
          </linearGradient>
          <filter id={`inf-glow-${uniqueId}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Static soft track */}
        <path
          d="M 80,45 C 60,15 25,15 25,45 C 25,75 60,75 80,45 C 100,15 135,15 135,45 C 135,75 100,75 80,45 Z"
          stroke="#E0F2FE"
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-70 dark:opacity-20"
        />

        {/* Animated glowing active path */}
        <path
          d="M 80,45 C 60,15 25,15 25,45 C 25,75 60,75 80,45 C 100,15 135,15 135,45 C 135,75 100,75 80,45 Z"
          stroke={`url(#inf-grad-${uniqueId})`}
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#inf-glow-${uniqueId})`}
          style={{
            strokeDasharray: "290",
            animation: "drawInfinitySpin 1.3s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite",
          }}
        />

        {/* Lead Shimmer highlight */}
        <path
          d="M 80,45 C 60,15 25,15 25,45 C 25,75 60,75 80,45 C 100,15 135,15 135,45 C 135,75 100,75 80,45 Z"
          stroke={`url(#inf-shimmer-${uniqueId})`}
          strokeWidth={Math.max(2, config.strokeWidth - 2)}
          strokeLinecap="round"
          style={{
            strokeDasharray: "60 230",
            animation: "shimmerInfinitySpin 1.3s linear infinite",
          }}
        />
      </svg>
    </div>
  );
}

/**
 * Reusable Infinity Loader for Product loading, Page loading, and Async sections
 */
export function InfinityLoader({
  size = "md",
  text,
  subtext,
  variant = "section",
  className,
  whiteCard = false,
}: InfinityLoaderProps) {
  const config = sizeConfig[size] || sizeConfig.md;

  // Inline variant
  if (variant === "inline") {
    return (
      <span className={cn("inline-flex items-center gap-2", className)}>
        <InfinitySpinner size={size} />
        {text && <span className={cn("font-medium text-muted-foreground", config.textSize)}>{text}</span>}
      </span>
    );
  }

  // Fullscreen overlay variant
  if (variant === "fullscreen") {
    return (
      <div className={cn("fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md", className)}>
        <div className="flex flex-col items-center justify-center p-6 text-center max-w-xs">
          <div className="relative mb-4 flex items-center justify-center">
            <div className="absolute -inset-4 rounded-full bg-sky-200/40 dark:bg-sky-900/20 blur-xl animate-pulse" />
            <InfinitySpinner size={size === "xs" || size === "sm" ? "lg" : size} />
          </div>
          {text && (
            <p className={cn("font-bold text-foreground tracking-tight", config.textSize)}>
              {text}
            </p>
          )}
          {subtext && (
            <p className="mt-1 text-xs text-muted-foreground">
              {subtext}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Page / Section Loader
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center select-none py-10 px-4",
        variant === "page" ? "min-h-[60vh] w-full" : "w-full",
        whiteCard ? "bg-white/80 dark:bg-card/80 backdrop-blur-sm rounded-3xl border border-sky-100 dark:border-border shadow-sm" : "",
        className
      )}
    >
      <div className="relative mb-3 flex items-center justify-center">
        {/* Soft light blue glow orb */}
        <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-sky-200/50 via-blue-200/40 to-sky-100/50 dark:from-sky-900/30 dark:to-blue-900/20 blur-lg animate-pulse" />
        <InfinitySpinner size={size} />
      </div>

      {text && (
        <p className={cn("font-bold text-foreground/90 tracking-tight", config.textSize)}>
          {text}
        </p>
      )}
      
      {subtext && (
        <p className="mt-1 text-xs text-muted-foreground max-w-sm">
          {subtext}
        </p>
      )}
    </div>
  );
}

export default InfinityLoader;
