import React from "react";
import { cn } from "@/lib/utils";

export interface ProductWatermarkProps {
  size?: "xs" | "sm" | "md" | "lg";
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left" | "center";
  variant?: "badge" | "subtle" | "monogram";
  className?: string;
}

/**
 * High-definition vector Infinity SVG Path used for Omeetso branding and watermark protection
 */
export function InfinitySymbolSvg({
  className,
  width = 24,
  height = 14,
  glow = true,
}: {
  className?: string;
  width?: number | string;
  height?: number | string;
  glow?: boolean;
}) {
  const id = React.useId().replace(/:/g, "");
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 160 90"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("overflow-visible shrink-0", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`wm-grad-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="40%" stopColor="#60A5FA" />
          <stop offset="80%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
        {glow && (
          <filter id={`wm-glow-${id}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        )}
      </defs>

      {/* Shadow background trace */}
      <path
        d="M 80,45 C 60,15 25,15 25,45 C 25,75 60,75 80,45 C 100,15 135,15 135,45 C 135,75 100,75 80,45 Z"
        stroke="rgba(0, 0, 0, 0.35)"
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Outer Glow Stroke */}
      <path
        d="M 80,45 C 60,15 25,15 25,45 C 25,75 60,75 80,45 C 100,15 135,15 135,45 C 135,75 100,75 80,45 Z"
        stroke={`url(#wm-grad-${id})`}
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={glow ? `url(#wm-glow-${id})` : undefined}
      />

      {/* Inner Crisp White Accent Stroke */}
      <path
        d="M 80,45 C 60,15 25,15 25,45 C 25,75 60,75 80,45 C 100,15 135,15 135,45 C 135,75 100,75 80,45 Z"
        stroke="#FFFFFF"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity="0.9"
      />
    </svg>
  );
}

/**
 * ProductWatermark Component:
 * Overlays an elegant infinity watermark with "Omeetso" authentication branding
 */
export function ProductWatermark({
  size = "sm",
  position = "bottom-right",
  variant = "badge",
  className,
}: ProductWatermarkProps) {
  const positionClasses = {
    "bottom-right": "bottom-2.5 right-2.5",
    "bottom-left": "bottom-2.5 left-2.5",
    "top-right": "top-2.5 right-2.5",
    "top-left": "top-2.5 left-2.5",
    "center": "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
  };

  if (variant === "monogram") {
    const dim = size === "xs" ? 22 : size === "sm" ? 28 : size === "md" ? 38 : 56;
    return (
      <div
        className={cn(
          "absolute pointer-events-none select-none z-10 opacity-75 drop-shadow-md",
          positionClasses[position],
          className
        )}
      >
        <InfinitySymbolSvg width={dim} height={dim * 0.56} />
      </div>
    );
  }

  if (variant === "subtle") {
    return (
      <div
        className={cn(
          "absolute pointer-events-none select-none z-10 flex items-center gap-1.5 opacity-60 hover:opacity-80 transition-opacity",
          positionClasses[position],
          className
        )}
      >
        <InfinitySymbolSvg width={size === "lg" ? 36 : 24} height={size === "lg" ? 20 : 13} />
        <span className={cn("font-extrabold uppercase tracking-widest text-white/90 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]",
          size === "xs" ? "text-[8px]" : size === "sm" ? "text-[9px]" : size === "md" ? "text-[11px]" : "text-sm"
        )}>
          Omeetso
        </span>
      </div>
    );
  }

  // Default "badge" variant: Frosted Glass Watermark Badge
  const config = {
    xs: { iconW: 16, iconH: 9, text: "text-[8px]", px: "px-1.5 py-0.5", gap: "gap-1" },
    sm: { iconW: 19, iconH: 11, text: "text-[9.5px]", px: "px-2 py-0.5", gap: "gap-1.5" },
    md: { iconW: 26, iconH: 14, text: "text-[11px]", px: "px-2.5 py-1", gap: "gap-2" },
    lg: { iconW: 36, iconH: 20, text: "text-sm", px: "px-3.5 py-1.5", gap: "gap-2.5" },
  }[size];

  return (
    <div
      className={cn(
        "absolute pointer-events-none select-none z-10 inline-flex items-center",
        "rounded-full bg-slate-950/65 backdrop-blur-md border border-white/20 text-white shadow-lg",
        "transition-transform duration-300",
        config.px,
        config.gap,
        positionClasses[position],
        className
      )}
      style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.35)" }}
    >
      <InfinitySymbolSvg width={config.iconW} height={config.iconH} />
      <span className={cn("font-black tracking-wider uppercase text-white/95", config.text)}>
        Omeetso
      </span>
    </div>
  );
}

/**
 * Canvas utility function to permanently stamp the Infinity watermark onto uploaded images.
 * Can be used when uploading or creating product photos.
 */
export async function applyInfinityWatermarkToDataUrl(
  dataUrl: string,
  options?: {
    quality?: number;
    watermarkText?: string;
  }
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return resolve(dataUrl);
        }

        canvas.width = img.width;
        canvas.height = img.height;

        // Draw original photo
        ctx.drawImage(img, 0, 0);

        const w = canvas.width;
        const h = canvas.height;
        const scale = Math.max(w, h) / 1000;
        const fontSize = Math.max(16, Math.round(22 * scale));
        const padding = Math.max(16, Math.round(24 * scale));

        // Draw Watermark Badge at bottom-right
        const text = options?.watermarkText || "OMEETSO";
        ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        const textMetrics = ctx.measureText(text);

        const infWidth = Math.round(fontSize * 1.8);
        const infHeight = Math.round(fontSize * 0.9);
        const badgeWidth = infWidth + textMetrics.width + (fontSize * 1.4);
        const badgeHeight = Math.round(fontSize * 2.2);

        const badgeX = w - badgeWidth - padding;
        const badgeY = h - badgeHeight - padding;
        const radius = Math.round(badgeHeight / 2);

        // Draw Frosted Pill Background
        ctx.save();
        ctx.fillStyle = "rgba(15, 23, 42, 0.65)";
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, radius);
        ctx.fill();

        ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
        ctx.lineWidth = Math.max(1, Math.round(2 * scale));
        ctx.stroke();

        // Draw Infinity Path in canvas
        const infX = badgeX + Math.round(fontSize * 0.7);
        const infCenterY = badgeY + (badgeHeight / 2);
        
        ctx.strokeStyle = "#38BDF8";
        ctx.lineWidth = Math.max(2, Math.round(3.5 * scale));
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        const iw = infWidth;
        const ih = infHeight;
        const cx = infX + iw / 2;
        const cy = infCenterY;
        const rx = iw / 4;
        const ry = ih / 2;

        ctx.beginPath();
        // Left loop
        ctx.ellipse(cx - rx, cy, rx, ry, 0, 0, Math.PI * 2);
        // Right loop
        ctx.ellipse(cx + rx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Draw Text
        ctx.fillStyle = "#FFFFFF";
        ctx.textBaseline = "middle";
        ctx.fillText(text, infX + infWidth + Math.round(fontSize * 0.4), infCenterY);
        ctx.restore();

        resolve(canvas.toDataURL("image/jpeg", options?.quality || 0.9));
      } catch (err) {
        console.warn("Watermarking canvas error:", err);
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}
