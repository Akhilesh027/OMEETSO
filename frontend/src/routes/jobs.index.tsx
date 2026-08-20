import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useEffect, useCallback } from "react";
import {
  ArrowLeft, Search, Loader2, RefreshCw, SlidersHorizontal,
  ArrowDownUp, LayoutGrid, List as ListIcon, MapPin, BookmarkPlus, X,
  Briefcase, Footprints, Zap, Home as HomeIcon, GraduationCap, ShieldAlert, Building2
} from "lucide-react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { JobCard } from "@/components/omeetso/jobs/JobCard";
import { SortSheet } from "@/components/omeetso/SortSheet";
import { FilterChip } from "@/components/omeetso/FilterChip";
import { HeroAd } from "@/components/omeetso/AdBanner";
import { SafetyCard } from "@/components/omeetso/SafetyCard";
import { EmptyState } from "@/components/omeetso/EmptyState";
import { StoreCard } from "@/components/omeetso/StoreCard";
import { fetchPublicJobs, JobItem } from "@/lib/jobs";
import { serveAdsApi } from "@/api/adCampaigns.api";
import { getPublicStoresApi } from "@/api/stores.api";

type JobsSearch = {
  q?: string;
  sub?: string;
  workplace?: string;
  jobType?: string;
  sort?: string;
  view?: "grid" | "list";
  verified?: string;
  urgent?: string;
  walkIn?: string;
  fresher?: string;
  minSalary?: string;
  maxSalary?: string;
};

export const Route = createFileRoute("/jobs/")({
  validateSearch: (s: Record<string, unknown>): JobsSearch => ({
    q: typeof s.q === "string" ? s.q : undefined,
    sub: typeof s.sub === "string" ? s.sub : undefined,
    workplace: typeof s.workplace === "string" ? s.workplace : undefined,
    jobType: typeof s.jobType === "string" ? s.jobType : undefined,
    sort: typeof s.sort === "string" ? s.sort : undefined,
    view: s.view === "list" ? "list" : "grid",
    verified: typeof s.verified === "string" ? s.verified : undefined,
    urgent: typeof s.urgent === "string" ? s.urgent : undefined,
    walkIn: typeof s.walkIn === "string" ? s.walkIn : undefined,
    fresher: typeof s.fresher === "string" ? s.fresher : undefined,
    minSalary: typeof s.minSalary === "string" ? s.minSalary : undefined,
    maxSalary: typeof s.maxSalary === "string" ? s.maxSalary : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Jobs & Careers in Hyderabad · Omeetso" },
      { name: "description", content: "Browse local jobs, walk-in drives, work from home openings, and freshers jobs on Omeetso." },
      { property: "og:title", content: "Jobs & Careers · Omeetso" },
      { property: "og:description", content: "Discover local jobs near you on Omeetso." },
    ],
  }),
  component: JobsPage,
});

const JOB_CATEGORIES = [
  { id: "it_software", name: "IT & Software", icon: "💻" },
  { id: "sales_marketing", name: "Sales & Marketing", icon: "📈" },
  { id: "digital_marketing", name: "Digital Marketing", icon: "📢" },
  { id: "customer_support", name: "Customer Support", icon: "🎧" },
  { id: "delivery_logistics", name: "Delivery & Logistics", icon: "🚚" },
  { id: "drivers", name: "Drivers", icon: "🚗" },
  { id: "retail_staff", name: "Retail Staff", icon: "🛍️" },
  { id: "hotel_restaurant", name: "Hotel & Restaurant", icon: "☕" },
  { id: "cook_chef", name: "Cook / Chef", icon: "🍳" },
  { id: "work_from_home", name: "Work From Home", icon: "🏠" },
  { id: "internships", name: "Internships", icon: "🎓" },
];

const JOB_SORT_OPTIONS = [
  { id: "relevance", label: "Relevance" },
  { id: "salary-high", label: "Highest Salary" },
  { id: "salary-low", label: "Lowest Salary" },
  { id: "newest", label: "Newest Jobs" },
];

function JobsPage() {
  const nav = useNavigate({ from: "/jobs/" });
  const search = Route.useSearch();
  const [sortOpen, setSortOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [liveHeaderAd, setLiveHeaderAd] = useState<any | null>(null);
  const [allJobs, setAllJobs] = useState<JobItem[]>([]);
  const [liveStores, setLiveStores] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState(search.q ?? "");
  const [minSalaryInput, setMinSalaryInput] = useState(search.minSalary ?? "");
  const [maxSalaryInput, setMaxSalaryInput] = useState(search.maxSalary ?? "");

  useEffect(() => {
    setSearchInput(search.q ?? "");
    setMinSalaryInput(search.minSalary ?? "");
    setMaxSalaryInput(search.maxSalary ?? "");
  }, [search.q, search.minSalary, search.maxSalary]);

  const activeLoc = useMemo(() => {
    try {
      const raw = typeof window !== "undefined" ? (localStorage.getItem("omeetso_location") || localStorage.getItem("omeetso_selected_location")) : null;
      if (raw) return JSON.parse(raw);
    } catch { /* ignore */ }
    return null;
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    serveAdsApi("CATEGORY_HEADER").then((res) => {
      if (res.success && res.data && res.data.length > 0) {
        const topAd = res.data[0];
        setLiveHeaderAd({
          id: topAd.servedAdId,
          campaignId: topAd.campaignId,
          placement: topAd.placement,
          headline: topAd.creative?.title || "Featured Hiring Partner",
          title: topAd.creative?.title || "Featured Hiring Partner",
          body: topAd.label || "Verified Employer Spotlights",
          subtitle: topAd.label || "Verified Employer Spotlights",
          cta: "Apply Now",
          ctaText: "Apply Now",
          destinationUrl: topAd.creative?.destinationUrl || "/jobs",
          ctaLink: topAd.creative?.destinationUrl || "/jobs",
          image: topAd.creative?.imageUrl || "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800",
          imageUrl: topAd.creative?.imageUrl || "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800",
          advertiser: "Omeetso Jobs Partner"
        });
      }
    });

    const [jobsData, sRes] = await Promise.all([
      fetchPublicJobs(),
      getPublicStoresApi()
    ]);

    setLoading(false);
    setAllJobs(jobsData);

    if (sRes.success && Array.isArray(sRes.data)) {
      const mappedS = sRes.data.map((item: any) => ({
        id: item.id || item._id,
        name: item.name,
        cover: item.cover || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800",
        logo: item.logo || "https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=200",
        category: "Verified Employer",
        area: item.area || "Madhapur",
        pincode: item.pincode || "500081",
        distanceKm: 1.2,
        rating: item.rating || 4.8,
        reviews: item.reviewCount || 12,
        open: true,
        verified: true,
        sponsored: false
      }));
      setLiveStores(mappedS);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredJobs = useMemo(() => {
    let list = [...allJobs];

    const q = search.q?.toLowerCase() ?? "";
    if (q) {
      const qTokens = q.split(/\s+/).filter(Boolean);
      list = list.filter((j) => {
        const titleLower = j.title.toLowerCase();
        const compLower = j.companyName.toLowerCase();
        const catLower = (j.jobCategoryId || "").toLowerCase();
        const subLower = (j.subcategoryId || "").toLowerCase();
        const descLower = (j.jobDetails?.description || "").toLowerCase();
        const areaLower = (j.location?.area || "").toLowerCase();
        const skillsLower = (j.candidateCriteria?.skills || []).join(" ").toLowerCase();
        const text = `${titleLower} ${compLower} ${catLower} ${subLower} ${descLower} ${areaLower} ${skillsLower}`;

        if (text.includes(q)) return true;
        if (qTokens.length > 0 && qTokens.every((t) => text.includes(t))) return true;
        return false;
      });
    }

    if (search.sub) {
      const subTarget = search.sub.toLowerCase();
      list = list.filter((j) =>
        (j.jobCategoryId || "").toLowerCase() === subTarget ||
        (j.subcategoryId || "").toLowerCase().includes(subTarget)
      );
    }

    if (search.workplace) {
      list = list.filter((j) => j.workplaceType === search.workplace);
    }

    if (search.jobType) {
      list = list.filter((j) => j.jobType === search.jobType);
    }

    if (search.walkIn === "1") {
      list = list.filter((j) => Boolean(j.walkInDetails?.isWalkIn));
    }

    if (search.urgent === "1") {
      list = list.filter((j) => Boolean(j.isUrgent));
    }

    if (search.fresher === "1") {
      list = list.filter((j) => Boolean(j.candidateCriteria?.fresherAllowed));
    }

    if (search.verified === "1") {
      list = list.filter((j) => Boolean(j.isVerifiedEmployer));
    }

    const minS = search.minSalary ? Number(search.minSalary) : undefined;
    const maxS = search.maxSalary ? Number(search.maxSalary) : undefined;
    if (minS !== undefined) {
      list = list.filter((j) => (j.salary?.maxSalary || j.salary?.minSalary || 0) >= minS);
    }
    if (maxS !== undefined) {
      list = list.filter((j) => (j.salary?.minSalary || 0) <= maxS);
    }

    switch (search.sort) {
      case "salary-high":
        list = [...list].sort((a, b) => (b.salary?.maxSalary || 0) - (a.salary?.maxSalary || 0));
        break;
      case "salary-low":
        list = [...list].sort((a, b) => (a.salary?.minSalary || 0) - (b.salary?.minSalary || 0));
        break;
      case "newest":
        list = [...list].sort((a, b) => b.createdAt - a.createdAt);
        break;
    }

    return list;
  }, [allJobs, search]);

  const view = search.view ?? "grid";
  const sortLabel = JOB_SORT_OPTIONS.find((o) => o.id === (search.sort ?? "relevance"))?.label ?? "Relevance";

  const chips: Array<{ key: keyof JobsSearch; label: string }> = [];
  if (search.sub) {
    const catObj = JOB_CATEGORIES.find((c) => c.id === search.sub);
    chips.push({ key: "sub", label: `Category: ${catObj ? catObj.name : search.sub}` });
  }
  if (search.walkIn === "1") chips.push({ key: "walkIn", label: "🚶 Walk-In Interviews" });
  if (search.urgent === "1") chips.push({ key: "urgent", label: "⚡ Urgent Hiring" });
  if (search.fresher === "1") chips.push({ key: "fresher", label: "🎓 Freshers Allowed" });
  if (search.verified === "1") chips.push({ key: "verified", label: "🛡 Verified Employers" });
  if (search.workplace) chips.push({ key: "workplace", label: `Workplace: ${search.workplace}` });
  if (search.jobType) chips.push({ key: "jobType", label: `Type: ${search.jobType}` });
  if (search.minSalary || search.maxSalary) chips.push({ key: "minSalary", label: `₹${search.minSalary ?? 0}–₹${search.maxSalary ?? "∞"}/mo` });

  const resetAllFilters = () => {
    setSearchInput("");
    setMinSalaryInput("");
    setMaxSalaryInput("");
    nav({ search: { view: search.view } });
  };

  const clearChip = (key: keyof JobsSearch) => {
    if (key === "minSalary") {
      setMinSalaryInput("");
      setMaxSalaryInput("");
      nav({ search: (p: JobsSearch) => ({ ...p, minSalary: undefined, maxSalary: undefined }) });
    } else {
      nav({ search: (p: JobsSearch) => ({ ...p, [key]: undefined }) });
    }
  };

  const applySalaryPreset = (min?: number, max?: number) => {
    setMinSalaryInput(min ? String(min) : "");
    setMaxSalaryInput(max ? String(max) : "");
    nav({ search: (p: JobsSearch) => ({ ...p, minSalary: min ? String(min) : undefined, maxSalary: max ? String(max) : undefined }) });
  };

  const handleSearchSubmit = () => {
    nav({ search: (p: JobsSearch) => ({ ...p, q: searchInput || undefined }) });
  };

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-20 md:pb-16 font-sans">
        {/* Mobile Header */}
        <header className="sticky top-0 z-30 border-b border-border bg-card safe-t md:hidden">
          <div className="flex items-center gap-2 px-3 pt-2 pb-2">
            <button onClick={() => history.back()} className="grid h-10 w-10 place-items-center rounded-full hover:bg-secondary" aria-label="Back">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex-1 flex items-center rounded-2xl bg-secondary px-3 py-1.5 text-sm gap-2">
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSearchSubmit(); }}
                placeholder="Search job title, skills, or company..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              {searchInput && (
                <button onClick={() => { setSearchInput(""); nav({ search: (p: JobsSearch) => ({ ...p, q: undefined }) }); }}>
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>
            <button
              onClick={() => setSaved((v) => !v)}
              className="grid h-10 w-10 place-items-center rounded-full hover:bg-secondary"
              aria-label={saved ? "Search saved" : "Save search"}
            >
              <BookmarkPlus className={"h-5 w-5 " + (saved ? "fill-yellow-brand text-yellow-brand" : "")} />
            </button>
          </div>

          <div className="flex items-center justify-between px-3 pb-2 text-xs text-muted-foreground">
            <span>
              <span className="font-bold text-foreground">{filteredJobs.length}</span> positions in <span className="font-extrabold text-foreground">Jobs & Careers</span>
            </span>
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-indigo-brand" /> {activeLoc?.area || "Madhapur"}</span>
          </div>

          {chips.length > 0 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar px-3 pb-2">
              {chips.map((c) => (
                <FilterChip key={String(c.key)} label={c.label} active onClear={() => clearChip(c.key)} />
              ))}
            </div>
          )}

          {/* Controls Bar */}
          <div className="flex items-center justify-between border-t border-border px-3 py-2">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              <button
                onClick={() => nav({ search: (p: JobsSearch) => ({ ...p, walkIn: p.walkIn === "1" ? undefined : "1" }) })}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-extrabold transition-all border shrink-0 ${
                  search.walkIn === "1"
                    ? "bg-amber-500 text-slate-950 border-amber-500 shadow-sm"
                    : "bg-card text-foreground border-border"
                }`}
              >
                🚶 Walk-In
              </button>
              <button
                onClick={() => nav({ search: (p: JobsSearch) => ({ ...p, urgent: p.urgent === "1" ? undefined : "1" }) })}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-extrabold transition-all border shrink-0 ${
                  search.urgent === "1"
                    ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                    : "bg-card text-foreground border-border"
                }`}
              >
                ⚡ Urgent
              </button>
              <button
                onClick={() => nav({ search: (p: JobsSearch) => ({ ...p, fresher: p.fresher === "1" ? undefined : "1" }) })}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-extrabold transition-all border shrink-0 ${
                  search.fresher === "1"
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                    : "bg-card text-foreground border-border"
                }`}
              >
                🎓 Freshers
              </button>
              <button
                onClick={() => setSortOpen(true)}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-bold shrink-0"
              >
                <ArrowDownUp className="h-3.5 w-3.5" /> {sortLabel}
              </button>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => nav({ search: (p: JobsSearch) => ({ ...p, view: "grid" }) })}
                aria-label="Grid view"
                className={"grid h-8 w-8 place-items-center rounded-full transition-all " + (view === "grid" ? "bg-indigo-brand text-white shadow-sm" : "hover:bg-secondary")}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => nav({ search: (p: JobsSearch) => ({ ...p, view: "list" }) })}
                aria-label="List view"
                className={"grid h-8 w-8 place-items-center rounded-full transition-all " + (view === "list" ? "bg-indigo-brand text-white shadow-sm" : "hover:bg-secondary")}
              >
                <ListIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Desktop Breadcrumb + Summary Header */}
        <div className="hidden md:block border-b border-border/80 bg-card/60 backdrop-blur-md">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-4">
            <nav className="text-xs text-muted-foreground flex items-center gap-2">
              <Link to="/home" className="hover:text-foreground font-bold transition-colors">Home</Link>
              <span className="text-muted-foreground/60">/</span>
              <Link to="/categories" className="hover:text-foreground font-bold transition-colors">Categories</Link>
              <span className="text-muted-foreground/60">/</span>
              <span className="text-foreground font-black">Jobs & Careers</span>
            </nav>
            <div className="mt-2 flex items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
                  Jobs & Careers
                  {search.sub && (
                    <span className="text-indigo-brand font-extrabold">
                      • {JOB_CATEGORIES.find((c) => c.id === search.sub)?.name || search.sub}
                    </span>
                  )}
                </h1>
                <p className="text-xs sm:text-sm font-bold text-muted-foreground mt-0.5">
                  Showing <span className="text-primary font-black">{filteredJobs.length}</span> active job openings near {activeLoc?.area || "Madhapur"}
                </p>
              </div>

              {/* Desktop Active Chips Row */}
              {chips.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  {chips.map((c) => (
                    <FilterChip key={String(c.key)} label={c.label} active onClear={() => clearChip(c.key)} />
                  ))}
                  <button
                    onClick={resetAllFilters}
                    className="text-xs font-bold text-rose-600 hover:underline pl-1"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 md:mx-auto md:max-w-[1440px] md:grid md:grid-cols-[300px_1fr] md:gap-6 md:py-6">

          {/* DESKTOP FILTER SIDEBAR */}
          <aside className="hidden md:block sticky top-24 self-start rounded-3xl border border-border bg-card p-5 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-sm font-extrabold uppercase tracking-wide text-foreground flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-indigo-brand" /> Filter Jobs
              </h2>
              <button
                onClick={resetAllFilters}
                className="text-[11px] font-bold text-rose-600 hover:underline"
              >
                Reset All
              </button>
            </div>

            <div className="space-y-4 text-xs font-semibold">
              {/* Walk-In Toggle */}
              <label className="flex items-center gap-2 cursor-pointer p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 font-extrabold transition-all hover:bg-amber-500/15">
                <input
                  type="checkbox"
                  checked={search.walkIn === "1"}
                  onChange={(e) => nav({ search: (p: JobsSearch) => ({ ...p, walkIn: e.target.checked ? "1" : undefined }) })}
                  className="h-4 w-4 rounded border-border accent-amber-500"
                />
                <span>🚶 Walk-In Drives Only</span>
              </label>

              {/* Urgent Hiring Toggle */}
              <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 font-extrabold transition-all hover:bg-rose-500/15">
                <input
                  type="checkbox"
                  checked={search.urgent === "1"}
                  onChange={(e) => nav({ search: (p: JobsSearch) => ({ ...p, urgent: e.target.checked ? "1" : undefined }) })}
                  className="h-4 w-4 rounded border-border accent-rose-500"
                />
                <span>⚡ Urgent Hiring Only</span>
              </label>

              {/* Verified Employers Toggle */}
              <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-2xl bg-secondary/50 border border-border text-foreground">
                <input
                  type="checkbox"
                  checked={search.verified === "1"}
                  onChange={(e) => nav({ search: (p: JobsSearch) => ({ ...p, verified: e.target.checked ? "1" : undefined }) })}
                  className="h-4 w-4 rounded border-border accent-indigo-brand"
                />
                <span>🛡 Verified Employers Only</span>
              </label>

              {/* Freshers Allowed Toggle */}
              <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 font-extrabold transition-all hover:bg-emerald-500/15">
                <input
                  type="checkbox"
                  checked={search.fresher === "1"}
                  onChange={(e) => nav({ search: (p: JobsSearch) => ({ ...p, fresher: e.target.checked ? "1" : undefined }) })}
                  className="h-4 w-4 rounded border-border accent-emerald-600"
                />
                <span>🎓 Freshers Allowed Only</span>
              </label>

              {/* Job Category Dropdown */}
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wide">Job Category</label>
                <select
                  value={search.sub ?? ""}
                  onChange={(e) => nav({ search: (p: JobsSearch) => ({ ...p, sub: e.target.value || undefined }) })}
                  className="w-full h-11 rounded-2xl border border-border bg-background px-3 text-xs font-bold text-foreground outline-none focus:border-indigo-brand"
                >
                  <option value="">All Job Categories</option>
                  {JOB_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                  ))}
                </select>
              </div>

              {/* Workplace Type */}
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wide">Workplace Type</label>
                <select
                  value={search.workplace ?? ""}
                  onChange={(e) => nav({ search: (p: JobsSearch) => ({ ...p, workplace: e.target.value || undefined }) })}
                  className="w-full h-11 rounded-2xl border border-border bg-background px-3 text-xs font-bold text-foreground outline-none focus:border-indigo-brand"
                >
                  <option value="">All Workplace Types</option>
                  <option value="OFFICE">🏢 Office / On-Site</option>
                  <option value="WORK_FROM_HOME">🏠 Work From Home</option>
                  <option value="HYBRID">🏬 Hybrid</option>
                </select>
              </div>

              {/* Employment / Job Type */}
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wide">Job Type</label>
                <select
                  value={search.jobType ?? ""}
                  onChange={(e) => nav({ search: (p: JobsSearch) => ({ ...p, jobType: e.target.value || undefined }) })}
                  className="w-full h-11 rounded-2xl border border-border bg-background px-3 text-xs font-bold text-foreground outline-none focus:border-indigo-brand"
                >
                  <option value="">All Job Types</option>
                  <option value="FULL_TIME">Full-Time</option>
                  <option value="PART_TIME">Part-Time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="INTERNSHIP">Internship</option>
                </select>
              </div>

              {/* Salary Range */}
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wide">Monthly Salary (₹)</label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="number"
                    placeholder="Min ₹"
                    value={minSalaryInput}
                    onChange={(e) => setMinSalaryInput(e.target.value)}
                    onBlur={(e) => nav({ search: (p: JobsSearch) => ({ ...p, minSalary: e.target.value || undefined }) })}
                    className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs font-bold outline-none focus:border-indigo-brand"
                  />
                  <span className="text-xs text-muted-foreground font-bold">to</span>
                  <input
                    type="number"
                    placeholder="Max ₹"
                    value={maxSalaryInput}
                    onChange={(e) => setMaxSalaryInput(e.target.value)}
                    onBlur={(e) => nav({ search: (p: JobsSearch) => ({ ...p, maxSalary: e.target.value || undefined }) })}
                    className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs font-bold outline-none focus:border-indigo-brand"
                  />
                </div>
                {/* Salary Presets */}
                <div className="flex flex-wrap gap-1">
                  <button type="button" onClick={() => applySalaryPreset(undefined, 20000)} className="px-2 py-1 rounded-lg bg-secondary text-[10px] font-bold text-muted-foreground hover:bg-indigo-brand/10">Under ₹20k</button>
                  <button type="button" onClick={() => applySalaryPreset(20000, 50000)} className="px-2 py-1 rounded-lg bg-secondary text-[10px] font-bold text-muted-foreground hover:bg-indigo-brand/10">₹20k–₹50k</button>
                  <button type="button" onClick={() => applySalaryPreset(50000, undefined)} className="px-2 py-1 rounded-lg bg-secondary text-[10px] font-bold text-muted-foreground hover:bg-indigo-brand/10">₹50k+</button>
                </div>
              </div>

              {/* Sort By Dropdown */}
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wide">Sort Results By</label>
                <select
                  value={search.sort ?? "relevance"}
                  onChange={(e) => nav({ search: (p: JobsSearch) => ({ ...p, sort: e.target.value }) })}
                  className="w-full h-11 rounded-2xl border border-border bg-background px-3 text-xs font-bold text-foreground outline-none focus:border-indigo-brand"
                >
                  {JOB_SORT_OPTIONS.map((o) => (
                    <option key={o.id} value={o.id}>{o.label}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={resetAllFilters}
                className="w-full h-11 rounded-2xl border border-border text-xs font-bold text-muted-foreground hover:bg-secondary transition-all flex items-center justify-center gap-1.5"
              >
                <X className="h-4 w-4" /> Clear All Filters
              </button>
            </div>
          </aside>

          {/* MAIN LISTINGS AREA */}
          <div className="space-y-6 mt-4 md:mt-0">
            {/* Category Pills Horizontal Scroll */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              <button
                onClick={() => nav({ search: (p: JobsSearch) => ({ ...p, sub: undefined }) })}
                className={"shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all " + (!search.sub ? "border-primary bg-primary text-primary-foreground shadow-sm" : "border-border bg-card text-foreground hover:bg-secondary")}
              >
                All Jobs
              </button>
              {JOB_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => nav({ search: (p: JobsSearch) => ({ ...p, sub: search.sub === cat.id ? undefined : cat.id }) })}
                  className={"shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 " + (search.sub === cat.id ? "border-primary bg-primary text-primary-foreground shadow-sm" : "border-border bg-card text-foreground hover:bg-secondary")}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>

            {/* Header Ad */}
            {liveHeaderAd && <HeroAd ad={liveHeaderAd} />}

            {loading ? (
              <div className="p-12 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-brand" />
                <span>Loading active job openings...</span>
              </div>
            ) : error ? (
              <div className="p-6 text-center bg-destructive/10 border border-destructive/20 rounded-2xl space-y-3">
                <p className="text-xs font-bold text-destructive">{error}</p>
                <button
                  onClick={loadData}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Retry
                </button>
              </div>
            ) : (
              <>
                {/* Results Grid / List */}
                {filteredJobs.length === 0 ? (
                  <EmptyState
                    title="No job openings found"
                    body="Try adjusting filters, keyword search, or clearing your selected parameters."
                    ctaLabel="Clear all filters"
                    onCta={resetAllFilters}
                  />
                ) : view === "list" ? (
                  <div className="space-y-3">
                    {filteredJobs.map((job) => (
                      <JobCard key={job.id} job={job} variant="list" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                    {filteredJobs.map((job) => (
                      <JobCard key={job.id} job={job} variant="grid" />
                    ))}
                  </div>
                )}

                {/* Nearby Employers & Companies */}
                {liveStores.length > 0 && (
                  <section className="pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h2 className="text-base font-extrabold text-foreground">Verified Employers & Hiring Partners Near You</h2>
                      <Link to="/stores" className="text-xs font-bold text-indigo-brand hover:underline">View All Employers</Link>
                    </div>
                    <div className="grid grid-rows-2 grid-flow-col gap-3.5 overflow-x-auto no-scrollbar pb-2 sm:grid-rows-none sm:grid-flow-row sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:overflow-visible sm:pb-0">
                      {liveStores.slice(0, 6).map((s: any) => (
                        <div key={s.id} className="w-[280px] sm:w-full shrink-0 sm:shrink">
                          <StoreCard s={s} className="w-full h-full" />
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}

            <SafetyCard />
          </div>

        </div>

        <SortSheet
          open={sortOpen}
          onClose={() => setSortOpen(false)}
          value={search.sort ?? "relevance"}
          onChange={(id) => nav({ search: (p: JobsSearch) => ({ ...p, sort: id }) })}
        />
      </div>
    </MobileFrame>
  );
}
