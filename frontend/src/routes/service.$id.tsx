import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ArrowLeft, Building, MapPin, ShieldCheck, Share2, Heart, MessageCircle, Phone,
  Clock, Calendar, CheckCircle2, AlertTriangle, ShieldAlert, Sparkles, Home,
  Wrench, Check, AlertCircle, Star, Users, Send, ExternalLink
} from "lucide-react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { ServiceCard } from "@/components/omeetso/services/ServiceCard";
import { BookServiceModal } from "@/components/omeetso/services/BookServiceModal";
import { fetchServiceById, ServiceItem, toggleSaveServiceLocal, getSavedServiceIds } from "@/lib/services";
import { toast } from "sonner";

export const Route = createFileRoute("/service/$id")({
  loader: async ({ params }) => {
    const s = await fetchServiceById(params.id);
    if (!s) throw notFound();
    return { service: s };
  },
  head: ({ loaderData }) => ({
    meta: loaderData?.service
      ? [
          { title: `${loaderData.service.title} by ${loaderData.service.businessName} · Omeetso Services` },
          { name: "description", content: loaderData.service.serviceDetails.description },
        ]
      : [{ title: "Service Details · Omeetso" }],
  }),
  component: ServiceDetailPage,
  notFoundComponent: NotFound,
});

function ServiceDetailPage() {
  const { id } = Route.useParams();
  const loaderData = Route.useLoaderData();
  const nav = useNavigate();

  const [service, setService] = useState<ServiceItem>(loaderData.service);
  const [saved, setSaved] = useState(() => getSavedServiceIds().includes(id));
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  useEffect(() => {
    fetchServiceById(id).then((data) => {
      if (data) setService(data);
    });
  }, [id]);

  const handleSaveToggle = () => {
    const next = toggleSaveServiceLocal(service.id);
    setSaved(next);
    toast.success(next ? "Added to Saved Services" : "Removed from Saved Services");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: service.title,
        text: `Book ${service.title} by ${service.businessName} on Omeetso`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Service link copied to clipboard!");
    }
  };

  const images = service.serviceDetails.images && service.serviceDetails.images.length > 0
    ? service.serviceDetails.images
    : ["https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80"];

  const formattedPrice = `₹${service.pricing.amount.toLocaleString("en-IN")}`;
  const priceUnitText = service.pricing.priceUnit ? ` / ${service.pricing.priceUnit.replace("per ", "")}` : "";

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-32 md:pb-20 font-sans">
        {/* Floating Top Navigation */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card/90 backdrop-blur-md px-4 py-3 safe-t">
          <div className="flex items-center gap-2">
            <button onClick={() => history.back()} className="grid h-9 w-9 place-items-center rounded-full hover:bg-secondary">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="text-xs font-black truncate max-w-[200px] text-foreground">{service.businessName}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleShare}
              className="grid h-9 w-9 place-items-center rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition"
              title="Share Service"
            >
              <Share2 className="h-4 w-4" />
            </button>
            <button
              onClick={handleSaveToggle}
              className="grid h-9 w-9 place-items-center rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition"
              title="Save Service"
            >
              <Heart className={`h-4 w-4 ${saved ? "fill-rose-500 text-rose-500" : ""}`} />
            </button>
          </div>
        </header>

        <main className="p-4 md:mx-auto md:max-w-4xl space-y-6">
          {/* Gallery Banner */}
          <div className="space-y-2">
            <div className="relative aspect-[16/10] sm:aspect-[21/9] w-full overflow-hidden rounded-[28px] bg-secondary border border-border">
              <img
                src={images[activeImageIdx]}
                alt={service.title}
                className="h-full w-full object-cover transition-all duration-300"
              />
              {service.isEmergency && (
                <span className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-rose-500 text-white px-3 py-1 text-xs font-black shadow-lg">
                  <Sparkles className="h-3.5 w-3.5 fill-white" /> 24/7 Emergency Service
                </span>
              )}
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`relative h-16 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                      activeImageIdx === idx ? "border-primary shadow-md" : "border-border opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title & Key Highlights Card */}
          <div className="rounded-[28px] border border-border bg-card p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-black text-primary">
                  {service.subcategoryId}
                </span>
                <h1 className="mt-1.5 text-xl sm:text-2xl font-black text-foreground leading-tight">
                  {service.title}
                </h1>
              </div>

              {/* Price Tag */}
              <div className="sm:text-right shrink-0">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  {service.pricing.priceType === "VISITATION_FEE" ? "Visit / Diagnosis Fee" : "Estimated Cost"}
                </span>
                <div className="flex items-baseline gap-1.5 sm:justify-end">
                  <span className="text-2xl font-black text-foreground">{formattedPrice}</span>
                  {service.pricing.discountPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      ₹{service.pricing.discountPrice.toLocaleString("en-IN")}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground font-semibold">{priceUnitText}</span>
                </div>
              </div>
            </div>

            {/* Badge Pill Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-border/60">
              <div className="rounded-2xl bg-surface-2 p-3 text-center">
                <ShieldCheck className="mx-auto h-4 w-4 text-emerald-600 mb-1" />
                <p className="text-[10px] font-bold text-muted-foreground">Warranty</p>
                <p className="text-xs font-black text-foreground truncate">{service.serviceDetails.warranty}</p>
              </div>
              <div className="rounded-2xl bg-surface-2 p-3 text-center">
                <Clock className="mx-auto h-4 w-4 text-primary mb-1" />
                <p className="text-[10px] font-bold text-muted-foreground">Response Time</p>
                <p className="text-xs font-black text-foreground truncate">{service.serviceDetails.guaranteedResponseTime}</p>
              </div>
              <div className="rounded-2xl bg-surface-2 p-3 text-center">
                <Star className="mx-auto h-4 w-4 text-amber-500 fill-amber-500 mb-1" />
                <p className="text-[10px] font-bold text-muted-foreground">Rating</p>
                <p className="text-xs font-black text-foreground">{service.stats.rating.toFixed(1)} ★ ({service.stats.reviewsCount} reviews)</p>
              </div>
              <div className="rounded-2xl bg-surface-2 p-3 text-center">
                <Home className="mx-auto h-4 w-4 text-indigo-600 mb-1" />
                <p className="text-[10px] font-bold text-muted-foreground">Delivery Mode</p>
                <p className="text-xs font-black text-foreground">{service.serviceType}</p>
              </div>
            </div>
          </div>

          {/* Provider Card */}
          <div className="rounded-[28px] border border-border bg-card p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <img
                src={service.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"}
                alt=""
                className="h-14 w-14 rounded-2xl object-cover border-2 border-border shrink-0"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-base font-extrabold text-foreground">{service.businessName}</h3>
                  {service.isVerifiedProvider && (
                    <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground font-semibold">{service.providerName}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> Base: {service.location.area}, {service.location.city} ({service.serviceDetails.experienceYears}+ years experience)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <a
                href={`tel:${service.phone || "9876543210"}`}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-2xl bg-secondary px-4 py-2.5 text-xs font-bold text-foreground hover:bg-surface-2 transition shadow-xs"
              >
                <Phone className="h-4 w-4 text-primary" />
                <span>Call Provider</span>
              </a>
              <button
                onClick={() => setBookingModalOpen(true)}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-2xl bg-primary px-5 py-2.5 text-xs font-black text-primary-foreground shadow-md hover:brightness-110 active:scale-95 transition"
              >
                <Calendar className="h-4 w-4" />
                <span>Book Visit</span>
              </button>
            </div>
          </div>

          {/* Description & Overview */}
          <div className="rounded-[28px] border border-border bg-card p-5 sm:p-6 shadow-sm space-y-4">
            <h2 className="text-base font-extrabold text-foreground">Service Description & Process</h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {service.serviceDetails.description}
            </p>
          </div>

          {/* Inclusions & Exclusions Checklist */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Inclusions */}
            <div className="rounded-[28px] border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-950/20 p-5 space-y-3">
              <h3 className="text-sm font-extrabold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> What's Included
              </h3>
              <ul className="space-y-2">
                {service.serviceDetails.inclusions.map((inc, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-foreground/90 font-medium">
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{inc}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Exclusions */}
            <div className="rounded-[28px] border border-amber-500/20 bg-amber-500/5 dark:bg-amber-950/20 p-5 space-y-3">
              <h3 className="text-sm font-extrabold text-amber-800 dark:text-amber-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600" /> Excluded / Billed Extra
              </h3>
              <ul className="space-y-2">
                {service.serviceDetails.exclusions.map((exc, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground font-medium">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>{exc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Service Area Coverage */}
          {service.location.servesAreas && service.location.servesAreas.length > 0 && (
            <div className="rounded-[28px] border border-border bg-card p-5 sm:p-6 shadow-sm space-y-3">
              <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" /> Covered Neighbourhoods & Localities
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {service.location.servesAreas.map((locality, idx) => (
                  <span
                    key={idx}
                    className="rounded-xl border border-border bg-surface-2 px-3 py-1 text-xs font-semibold text-foreground"
                  >
                    📍 {locality}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Similar Services in Category */}
          {service.similarServices && service.similarServices.length > 0 && (
            <div className="space-y-3 pt-4">
              <h3 className="text-base font-extrabold text-foreground">Similar Services in {service.subcategoryId}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {service.similarServices.map((sim) => (
                  <ServiceCard key={sim.id} service={sim} />
                ))}
              </div>
            </div>
          )}
        </main>

        {/* Sticky Mobile Bottom Booking Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-md p-3 safe-b flex items-center justify-between gap-3 shadow-2xl md:hidden">
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Estimated</span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-foreground">{formattedPrice}</span>
              <span className="text-[10px] text-muted-foreground font-semibold">{priceUnitText}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${service.phone || "9876543210"}`}
              className="grid h-11 w-11 place-items-center rounded-2xl bg-secondary text-primary font-bold shadow-xs active:scale-95"
            >
              <Phone className="h-5 w-5" />
            </a>
            <button
              onClick={() => setBookingModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-xs font-black text-primary-foreground shadow-lg hover:brightness-110 active:scale-95 transition"
            >
              <Calendar className="h-4 w-4" />
              <span>Book Doorstep Visit</span>
            </button>
          </div>
        </div>

        {/* Booking & Quote Modal */}
        <BookServiceModal
          service={service}
          isOpen={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
        />
      </div>
    </MobileFrame>
  );
}

function NotFound() {
  return (
    <MobileFrame>
      <div className="min-h-dvh flex flex-col items-center justify-center p-6 text-center">
        <Wrench className="h-12 w-12 text-muted-foreground mb-3" />
        <h2 className="text-lg font-black text-foreground">Service Not Found</h2>
        <p className="mt-1 text-xs text-muted-foreground">The requested service listing does not exist or has been deactivated.</p>
        <Link to="/services" className="mt-4 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground">
          Back to Services
        </Link>
      </div>
    </MobileFrame>
  );
}
