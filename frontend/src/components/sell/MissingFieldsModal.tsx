import React from "react";
import {
  AlertCircle, X, CheckCircle2, Image as ImageIcon,
  Tag, IndianRupee, MapPin, Layers, Phone, Sliders, ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface MissingFieldItem {
  field?: string;
  label: string;
  message: string;
  category?: "media" | "basic" | "category" | "location" | "contact" | "specs";
}

function getItemIcon(text: string) {
  const lower = text.toLowerCase();
  if (lower.includes("photo") || lower.includes("image") || lower.includes("picture")) return ImageIcon;
  if (lower.includes("title") || lower.includes("brand") || lower.includes("model")) return Tag;
  if (lower.includes("price") || lower.includes("cost") || lower.includes("rate")) return IndianRupee;
  if (lower.includes("pincode") || lower.includes("area") || lower.includes("location") || lower.includes("city")) return MapPin;
  if (lower.includes("category") || lower.includes("subcategory")) return Layers;
  if (lower.includes("phone") || lower.includes("contact") || lower.includes("whatsapp")) return Phone;
  return Sliders;
}

export function MissingFieldsModal({
  open,
  onClose,
  missingItems,
  onScrollToField,
}: {
  open: boolean;
  onClose: () => void;
  missingItems: string[];
  onScrollToField?: (fieldKeyword: string) => void;
}) {
  if (!open || !missingItems || missingItems.length === 0) return null;

  const handleFixField = (item: string) => {
    onClose();
    if (onScrollToField) {
      onScrollToField(item);
    } else {
      // Default auto-scroll to field
      const lower = item.toLowerCase();
      let targetId = "";
      if (lower.includes("photo") || lower.includes("image")) targetId = "image-uploader-section";
      else if (lower.includes("title")) targetId = "listing-title-input";
      else if (lower.includes("price")) targetId = "listing-price-input";
      else if (lower.includes("category")) targetId = "listing-category-section";
      else if (lower.includes("pincode") || lower.includes("location")) targetId = "listing-location-section";
      else if (lower.includes("contact") || lower.includes("phone")) targetId = "listing-contact-section";

      if (targetId) {
        setTimeout(() => {
          document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 150);
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-card border border-rose-500/30 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col font-sans"
      >
        {/* Header with Crimson / Amber Alert Accent */}
        <div className="relative px-6 pt-6 pb-4 bg-gradient-to-r from-rose-950 via-slate-950 to-rose-950 text-white shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/20 border border-rose-500/40 px-3 py-1 text-xs font-black text-rose-300 shadow-xs">
              <AlertCircle className="h-4 w-4 text-rose-400 fill-rose-400/20" />
              <span>Required Information Missing</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3.5 space-y-1">
            <h3 className="text-xl font-black text-white">Complete Required Details</h3>
            <p className="text-xs text-rose-200/80 font-medium">
              We found <strong className="text-rose-300 font-black">{missingItems.length} required {missingItems.length === 1 ? "field" : "fields"}</strong> that must be completed before posting your ad.
            </p>
          </div>
        </div>

        {/* Missing Items Checklist */}
        <div className="p-5 max-h-[50vh] overflow-y-auto space-y-2.5 bg-muted/20">
          {missingItems.map((item, idx) => {
            const Icon = getItemIcon(item);
            return (
              <div
                key={idx}
                onClick={() => handleFixField(item)}
                className="group flex items-center justify-between gap-3 p-3 rounded-2xl bg-card border border-rose-500/20 hover:border-rose-500/60 shadow-xs hover:shadow-sm transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 group-hover:scale-105 transition-transform">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-foreground truncate group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                      {item}
                    </p>
                    <p className="text-[10.5px] font-semibold text-muted-foreground">
                      Tap to go to this field
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-1 text-[11px] font-black text-rose-600 dark:text-rose-400 group-hover:translate-x-0.5 transition-transform">
                  <span>Fix</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:px-6 border-t border-border bg-card shrink-0 space-y-2">
          <button
            type="button"
            onClick={() => handleFixField(missingItems[0] || "")}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs sm:text-sm tracking-wide shadow-md hover:shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Review & Fix Missing Fields</span>
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-center text-xs font-extrabold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            I'll fix them manually
          </button>
        </div>
      </div>
    </div>
  );
}
