import { Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  MapPin, Star, ShieldCheck, Zap, Clock, Shield, CheckCircle2, Heart,
  Phone, MessageSquare, ArrowRight, Sparkles, Building, Home, Check
} from "lucide-react";
import { ServiceItem, toggleSaveServiceLocal, getSavedServiceIds } from "@/lib/services";
import { cn } from "@/lib/utils";

interface ServiceCardProps {
  service: ServiceItem;
  view?: "grid" | "list";
  onQuickBook?: (service: ServiceItem) => void;
}

export function ServiceCard({ service, view = "grid", onQuickBook }: ServiceCardProps) {
  const [isSaved, setIsSaved] = useState(() => getSavedServiceIds().includes(service.id));

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nextSaved = toggleSaveServiceLocal(service.id);
    setIsSaved(nextSaved);
  };

  const imageSrc =
    service.serviceDetails.images && service.serviceDetails.images.length > 0
      ? service.serviceDetails.images[0]
      : "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop&q=80";

  const isDoorstep = service.serviceType === "DOORSTEP";
  const isEmergency = service.isEmergency || service.availability.emergencyServiceAvailable;

  const formattedPrice = `₹${service.pricing.amount.toLocaleString("en-IN")}`;
  const priceUnitText = service.pricing.priceUnit ? ` / ${service.pricing.priceUnit.replace("per ", "")}` : "";

  if (view === "list") {
    return (
      <div className="group relative flex flex-col sm:flex-row gap-4 rounded-3xl border border-border/80 bg-card p-4 transition-all duration-200 hover:border-primary/40 hover:shadow-lg">
        {/* Thumbnail Image */}
        <Link to="/service/$id" params={{ id: service.id }} className="relative h-44 sm:h-auto sm:w-56 shrink-0 overflow-hidden rounded-2xl bg-secondary">
          <img
            src={imageSrc}
            alt={service.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {isEmergency && (
            <span className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-full bg-rose-500/90 text-white px-2.5 py-0.5 text-[10px] font-black backdrop-blur-xs shadow-xs">
              <Zap className="h-3 w-3 fill-white" /> 24/7 Emergency
            </span>
          )}
          <button
            type="button"
            onClick={handleSaveToggle}
            className="absolute top-2.5 right-2.5 grid h-8 w-8 place-items-center rounded-full bg-slate-950/40 text-white backdrop-blur-xs hover:bg-slate-950/70 transition"
          >
            <Heart className={cn("h-4 w-4", isSaved && "fill-rose-500 text-rose-500")} />
          </button>
        </Link>

        {/* Info Column */}
        <div className="flex flex-1 flex-col justify-between min-w-0">
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                <span className="truncate">{service.businessName}</span>
                {service.isVerifiedProvider && (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[9.5px] font-extrabold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <ShieldCheck className="h-2.5 w-2.5" /> Verified
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                <span>{service.stats.rating.toFixed(1)}</span>
                <span className="text-[10px] text-muted-foreground">({service.stats.reviewsCount})</span>
              </div>
            </div>

            <Link to="/service/$id" params={{ id: service.id }}>
              <h3 className="mt-1.5 text-base font-extrabold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                {service.title}
              </h3>
            </Link>

            <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {service.serviceDetails.description}
            </p>

            {/* Inclusions preview */}
            {service.serviceDetails.inclusions && service.serviceDetails.inclusions.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {service.serviceDetails.inclusions.slice(0, 2).map((inc, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 rounded-lg bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-foreground/80"
                  >
                    <Check className="h-2.5 w-2.5 text-emerald-600 shrink-0" />
                    <span className="truncate max-w-[180px]">{inc}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Row: Pricing & Actions */}
          <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between gap-3">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-black text-foreground">{formattedPrice}</span>
                {service.pricing.discountPrice && (
                  <span className="text-xs text-muted-foreground line-through">
                    ₹{service.pricing.discountPrice.toLocaleString("en-IN")}
                  </span>
                )}
                <span className="text-xs text-muted-foreground font-semibold">{priceUnitText}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
                <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                <span>{service.location.area}, {service.location.city}</span>
                <span>•</span>
                <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
                <span>{service.serviceDetails.guaranteedResponseTime}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/service/$id"
                params={{ id: service.id }}
                className="rounded-2xl bg-secondary px-3.5 py-2 text-xs font-bold text-foreground hover:bg-surface-2 transition shadow-2xs"
              >
                Details
              </Link>
              <button
                type="button"
                onClick={() => onQuickBook ? onQuickBook(service) : null}
                className="inline-flex items-center gap-1.5 rounded-2xl bg-primary px-4 py-2 text-xs font-black text-primary-foreground shadow-sm hover:brightness-110 active:scale-95 transition"
              >
                <span>Book Visit</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid Card Layout
  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-[26px] border border-border/80 bg-card p-3 transition-all duration-200 hover:border-primary/50 hover:shadow-xl hover:-translate-y-1">
      <div>
        {/* Top Image Banner */}
        <Link to="/service/$id" params={{ id: service.id }} className="relative block aspect-[16/10] w-full overflow-hidden rounded-[20px] bg-secondary">
          <img
            src={imageSrc}
            alt={service.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {isEmergency && (
            <span className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-full bg-rose-500/90 text-white px-2.5 py-0.5 text-[10px] font-black backdrop-blur-xs shadow-xs">
              <Zap className="h-3 w-3 fill-white" /> 24/7 Emergency
            </span>
          )}
          {isDoorstep && !isEmergency && (
            <span className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-full bg-slate-950/70 text-white px-2.5 py-0.5 text-[10px] font-black backdrop-blur-xs shadow-xs">
              <Home className="h-3 w-3" /> Doorstep Service
            </span>
          )}
          <button
            type="button"
            onClick={handleSaveToggle}
            className="absolute top-2.5 right-2.5 grid h-8 w-8 place-items-center rounded-full bg-slate-950/40 text-white backdrop-blur-xs hover:bg-slate-950/70 transition active:scale-90"
          >
            <Heart className={cn("h-4 w-4", isSaved && "fill-rose-500 text-rose-500")} />
          </button>
        </Link>

        {/* Provider & Rating */}
        <div className="mt-3 px-1">
          <div className="flex items-center justify-between gap-1">
            <p className="truncate text-xs font-semibold text-muted-foreground">
              {service.businessName}
            </p>
            <div className="flex items-center gap-1 rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[11px] font-black text-amber-600 dark:text-amber-400 shrink-0">
              <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
              <span>{service.stats.rating.toFixed(1)}</span>
            </div>
          </div>

          <Link to="/service/$id" params={{ id: service.id }}>
            <h4 className="mt-1 text-sm font-black text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
              {service.title}
            </h4>
          </Link>

          {/* Quick Specs / Guarantee Pill */}
          <div className="mt-2 flex flex-wrap items-center gap-1 text-[10.5px]">
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 font-bold text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="h-3 w-3" /> {service.serviceDetails.warranty}
            </span>
          </div>

          <div className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground truncate">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{service.location.area}, {service.location.city}</span>
          </div>
        </div>
      </div>

      {/* Footer Pricing & CTA */}
      <div className="mt-3.5 pt-2.5 border-t border-border/60 px-1 flex items-center justify-between gap-2">
        <div>
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
            {service.pricing.priceType === "VISITATION_FEE" ? "Visit Fee" : "Starts at"}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-base font-black text-foreground">{formattedPrice}</span>
            {service.pricing.discountPrice && (
              <span className="text-[10px] text-muted-foreground line-through">
                ₹{service.pricing.discountPrice}
              </span>
            )}
          </div>
        </div>

        <Link
          to="/service/$id"
          params={{ id: service.id }}
          className="inline-flex items-center gap-1 rounded-xl bg-primary px-3 py-1.5 text-xs font-black text-primary-foreground shadow-xs hover:brightness-110 active:scale-95 transition"
        >
          <span>Book</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
