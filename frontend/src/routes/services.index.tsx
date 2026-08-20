import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import {
  ArrowLeft, Search, Loader2, RefreshCw, SlidersHorizontal,
  ArrowDownUp, LayoutGrid, List as ListIcon, MapPin, BookmarkPlus, X,
  Wrench, ShieldCheck, Zap, Home as HomeIcon, Sparkles, Phone, CheckCircle2,
  Calendar, Check, Building
} from "lucide-react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { ServiceCard } from "@/components/omeetso/services/ServiceCard";
import { BookServiceModal } from "@/components/omeetso/services/BookServiceModal";
import { SortSheet } from "@/components/omeetso/SortSheet";
import { FilterChip } from "@/components/omeetso/FilterChip";
import { EmptyState } from "@/components/omeetso/EmptyState";
import { fetchPublicServices, ServiceItem, SERVICE_CATEGORIES } from "@/lib/services";

type ServicesSearch = {
  q?: string;
  cat?: string;
  sub?: string;
  serviceType?: string;
  sort?: string;
  view?: "grid" | "list";
  verified?: string;
  emergency?: string;
  minPrice?: string;
  maxPrice?: string;
};

export const Route = createFileRoute("/services/")({
  validateSearch: (s: Record<string, unknown>): ServicesSearch => ({
    q: typeof s.q === "string" ? s.q : undefined,
    cat: typeof s.cat === "string" ? s.cat : undefined,
    sub: typeof s.sub === "string" ? s.sub : undefined,
    serviceType: typeof s.serviceType === "string" ? s.serviceType : undefined,
    sort: typeof s.sort === "string" ? s.sort : undefined,
    view: s.view === "list" ? "list" : "grid",
    verified: typeof s.verified === "string" ? s.verified : undefined,
    emergency: typeof s.emergency === "string" ? s.emergency : undefined,
    minPrice: typeof s.minPrice === "string" ? s.minPrice : undefined,
    maxPrice: typeof s.maxPrice === "string" ? s.maxPrice : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Home & Professional Services in Hyderabad · Omeetso" },
      { name: "description", content: "Book trusted doorstep AC repair, deep cleaning, electricians, plumbers, salon and tutors on Omeetso." },
      { property: "og:title", content: "Professional Services · Omeetso" },
      { property: "og:description", content: "Discover trusted local service providers near you on Omeetso." },
    ],
  }),
  component: ServicesPage,
});

const SERVICE_SORT_OPTIONS = [
  { id: "relevance", label: "Relevance" },
  { id: "rating", label: "Highest Rated" },
  { id: "price-low", label: "Price: Low to High" },
  { id: "price-high", label: "Price: High to Low" },
  { id: "newest", label: "Newest Listings" },
];

function ServicesPage() {
  const nav = useNavigate({ from: "/services/" });
  const search = Route.useSearch();
  const [sortOpen, setSortOpen] = useState(false);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingService, setBookingService] = useState<ServiceItem | null>(null);

  const [searchInput, setSearchInput] = useState(search.q ?? "");
  const [minPriceInput, setMinPriceInput] = useState(search.minPrice ?? "");
  const [maxPriceInput, setMaxPriceInput] = useState(search.maxPrice ?? "");

  useEffect(() => {
    setSearchInput(search.q ?? "");
    setMinPriceInput(search.minPrice ?? "");
    setMaxPriceInput(search.maxPrice ?? "");
  }, [search.q, search.minPrice, search.maxPrice]);

  const loadData = () => {
    setLoading(true);
    fetchPublicServices({
      q: search.q,
      cat: search.cat,
      sub: search.sub,
      serviceType: search.serviceType,
      minPrice: search.minPrice,
      maxPrice: search.maxPrice,
      emergency: search.emergency,
      verified: search.verified,
      sort: search.sort,
    })
      .then((data) => {
        setServices(data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [
    search.q,
    search.cat,
    search.sub,
    search.serviceType,
    search.minPrice,
    search.maxPrice,
    search.emergency,
    search.verified,
    search.sort,
  ]);

  const setParam = (key: keyof ServicesSearch, value: string | undefined) => {
    nav({
      search: (prev) => {
        const next = { ...prev, [key]: value || undefined };
        if (!value) delete (next as any)[key];
        return next;
      },
    });
  };

  const activeCategory = search.cat || "all";
  const activeMode = search.serviceType || "ALL";
  const isEmergencyOnly = search.emergency === "1" || search.emergency === "true";
  const isVerifiedOnly = search.verified === "1" || search.verified === "true";
  const viewMode = search.view || "grid";

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-28 md:pb-16 font-sans">
        {/* Sticky Header */}
        <header className="sticky top-0 z-30 border-b border-border bg-card/90 backdrop-blur-md px-4 py-3 safe-t">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Link to="/home" className="grid h-9 w-9 place-items-center rounded-full hover:bg-secondary">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-base font-black text-foreground">Services Marketplace</h1>
                <p className="text-[11px] text-muted-foreground font-semibold">
                  Verified pros in your neighbourhood
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/services/new"
                className="inline-flex items-center gap-1 rounded-full bg-primary px-3.5 py-1.5 text-xs font-black text-primary-foreground shadow-sm hover:brightness-110 active:scale-95 transition"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Offer Service</span>
              </Link>
            </div>
          </div>

          {/* Search Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setParam("q", searchInput.trim() || undefined);
            }}
            className="mt-3 relative flex items-center"
          >
            <Search className="absolute left-3.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search AC repair, deep cleaning, electrician, tutor..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-2xl border border-border bg-surface-1 py-2.5 pl-10 pr-10 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  setParam("q", undefined);
                }}
                className="absolute right-3 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </form>

          {/* Category Horizontal Strip */}
          <div className="mt-3 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setParam("cat", undefined)}
              className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-extrabold transition ${
                activeCategory === "all"
                  ? "bg-navy text-white shadow-xs"
                  : "bg-surface-2 text-muted-foreground hover:text-foreground"
              }`}
            >
              All Services
            </button>
            {SERVICE_CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setParam("cat", c.id)}
                className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-extrabold transition ${
                  activeCategory === c.id
                    ? "bg-navy text-white shadow-xs"
                    : "bg-surface-2 text-muted-foreground hover:text-foreground"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </header>

        {/* Quick Filter Toolbar */}
        <div className="border-b border-border bg-card/60 px-4 py-2.5 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2">
            {/* 24/7 Emergency Toggle */}
            <button
              onClick={() => setParam("emergency", isEmergencyOnly ? undefined : "1")}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold transition ${
                isEmergencyOnly
                  ? "bg-rose-500 text-white shadow-xs"
                  : "bg-surface-2 text-foreground hover:bg-rose-500/10 hover:text-rose-600"
              }`}
            >
              <Zap className="h-3.5 w-3.5 fill-current" />
              <span>24/7 Emergency</span>
            </button>

            {/* Doorstep Only */}
            <button
              onClick={() => setParam("serviceType", activeMode === "DOORSTEP" ? undefined : "DOORSTEP")}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold transition ${
                activeMode === "DOORSTEP"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-surface-2 text-foreground hover:bg-surface-1"
              }`}
            >
              <HomeIcon className="h-3.5 w-3.5" />
              <span>Doorstep</span>
            </button>

            {/* Verified Badge Only */}
            <button
              onClick={() => setParam("verified", isVerifiedOnly ? undefined : "1")}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold transition ${
                isVerifiedOnly
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-surface-2 text-foreground hover:bg-emerald-500/10 hover:text-emerald-600"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Verified Pros</span>
            </button>
          </div>

          {/* Right: Sort & Grid/List View */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setSortOpen(true)}
              className="flex items-center gap-1 rounded-xl bg-surface-2 px-2.5 py-1 text-xs font-bold text-foreground hover:bg-surface-1"
            >
              <ArrowDownUp className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="hidden sm:inline">Sort</span>
            </button>

            <button
              onClick={() => setParam("view", viewMode === "grid" ? "list" : "grid")}
              className="grid h-7 w-7 place-items-center rounded-xl bg-surface-2 text-foreground hover:bg-surface-1"
              title="Toggle View Mode"
            >
              {viewMode === "grid" ? <ListIcon className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="p-4 md:mx-auto md:max-w-6xl">
          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
              <p className="mt-3 text-xs text-muted-foreground font-semibold">Finding verified services nearby...</p>
            </div>
          ) : services.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-secondary text-muted-foreground mb-3">
                <Wrench className="h-8 w-8" />
              </div>
              <h3 className="text-base font-extrabold text-foreground">No services found</h3>
              <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
                No matching service providers found for the selected filters. Try clearing some filters or searching for another keyword.
              </p>
              <button
                onClick={() => {
                  nav({ search: {} });
                }}
                className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Reset All Filters</span>
              </button>
            </div>
          ) : (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-bold text-muted-foreground">
                  Showing <strong className="text-foreground">{services.length}</strong> available service providers
                </p>
              </div>

              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                    : "space-y-3"
                }
              >
                {services.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    view={viewMode}
                    onQuickBook={(s) => setBookingService(s)}
                  />
                ))}
              </div>
            </div>
          )}
        </main>

        {/* Quick Booking Modal */}
        {bookingService && (
          <BookServiceModal
            service={bookingService}
            isOpen={Boolean(bookingService)}
            onClose={() => setBookingService(null)}
          />
        )}

        {/* Sort Bottom Sheet */}
        <SortSheet
          open={sortOpen}
          onClose={() => setSortOpen(false)}
          value={search.sort ?? "relevance"}
          onChange={(val) => {
            setParam("sort", val);
            setSortOpen(false);
          }}
          options={SERVICE_SORT_OPTIONS}
        />
      </div>
    </MobileFrame>
  );
}
