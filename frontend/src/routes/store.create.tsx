import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, useRef } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import {
  type Store, emptyStore, newStoreId, upsertStore, saveStoreDraft,
  BUSINESS_TYPES, EXPERIENCE_OPTIONS, PRIMARY_CATEGORIES,
  setSelectedStoreId,
} from "@/lib/stores";
import { generateAiStoreDescription } from "@/lib/aiAssistance";
import { toast } from "sonner";
import { getUserAccessToken } from "@/api/auth.api";
import { uploadImageToCloudinary } from "@/lib/upload";
import { fetchAreaFromPincode, resolveGpsLocation } from "@/lib/location";
import {
  ChevronRight, ImagePlus, Check, Sparkles,
  Store as StoreIcon, MapPin, Clock, Truck, ShieldCheck, Eye, Wand2,
  Phone, MessageSquare, Building2, Upload, X, LocateFixed, Loader2,
  Camera, Navigation, Mail, User, Globe, ChevronDown
} from "lucide-react";

export const Route = createFileRoute("/store/create")({
  head: () => ({ meta: [{ title: "Create your store — Omeetso" }] }),
  component: CreateStore,
});

const STEPS = [
  { key: "info", label: "Store & Branding", icon: StoreIcon, num: 1 },
  { key: "location", label: "Location & Contact", icon: MapPin, num: 2 },
  { key: "review", label: "Review & Create", icon: ShieldCheck, num: 3 },
] as const;

function CreateStore() {
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [s, setS] = useState<Store>(() => {
    const store = { ...emptyStore(), id: newStoreId() };
    // Auto-fill from user profile
    try {
      const raw = localStorage.getItem("omeetso_user");
      if (raw) {
        const user = JSON.parse(raw);
        store.businessMobile = user.phone || "";
        store.email = user.email || user.profile?.email || "";
      }
    } catch { }
    // Auto-fill from saved location
    try {
      const locRaw = localStorage.getItem("omeetso_location") || localStorage.getItem("omeetso_selected_location");
      if (locRaw) {
        const loc = JSON.parse(locRaw);
        if (loc.area) {
          const parts = loc.area.split(",").map((p: string) => p.trim());
          store.area = parts[0] || "";
          store.city = parts[1] || store.city;
        }
        if (loc.pincode) store.pincode = loc.pincode;
      }
    } catch { }
    return store;
  });
  const [submitting, setSubmitting] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [fetchingGeo, setFetchingGeo] = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  // Auto-save draft
  useEffect(() => {
    if (!s.name && !s.description) return;
    saveStoreDraft({ ...s, step });
  }, [s, step]);

  const patch = (p: Partial<Store>) => setS((prev) => ({ ...prev, ...p }));

  // Image upload handlers
  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setLogoPreview(url);
    const reader = new FileReader();
    reader.onload = () => patch({ logo: reader.result as string });
    reader.readAsDataURL(file);
  }
  function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCoverPreview(url);
    const reader = new FileReader();
    reader.onload = () => patch({ cover: reader.result as string });
    reader.readAsDataURL(file);
  }

  // Auto-detect GPS location
  async function detectLocation() {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setFetchingGeo(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude: lat, longitude: lng } = pos.coords;
          const loc = await resolveGpsLocation(lat, lng);
          patch({
            area: loc.area || loc.city,
            city: loc.city || "Hyderabad",
            state: loc.state || "Telangana",
            pincode: loc.pincode,
          });
          toast.success(`Location detected: ${loc.area || loc.city}, ${loc.city}`);
        } catch {
          toast.error("Failed to detect location");
        } finally {
          setFetchingGeo(false);
        }
      },
      () => {
        setFetchingGeo(false);
        toast.error("Location permission denied");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  const handleGenerateAiDescription = () => {
    setAiLoading(true);
    setTimeout(() => {
      const desc = generateAiStoreDescription(s.name, s.primaryCategory, s.city);
      patch({ description: desc });
      setAiLoading(false);
      toast.success("✨ AI Description generated!");
    }, 400);
  };

  const taglines = useMemo(() => [
    `Trusted neighbourhood destination for ${s.primaryCategory || "products"} in ${s.city || "your city"}.`,
    `Quality products, honest local prices & fast doorstep delivery.`,
    `Verified local business — 100% authentic products & warranty.`,
  ], [s.primaryCategory, s.city]);

  const canNext = useMemo(() => {
    switch (step) {
      case 0: return s.name.trim().length >= 3 && s.description.trim().length >= 10 && !!s.primaryCategory;
      case 1: return s.area.trim().length > 0;
      case 2: return true;
      default: return true;
    }
  }, [step, s]);

  function next() {
    if (!canNext) { toast.error("Please complete the required fields"); return; }
    if (step < STEPS.length - 1) setStep(step + 1);
  }
  function prev() { if (step > 0) setStep(step - 1); }

  async function submit() {
    setSubmitting(true);

    let logoUrl = s.logo;
    let coverUrl = s.cover;
    try {
      if (s.logo) logoUrl = await uploadImageToCloudinary(s.logo, "stores");
      if (s.cover) coverUrl = await uploadImageToCloudinary(s.cover, "stores");
    } catch { }

    const storePayload = {
      ...s,
      logo: logoUrl,
      cover: coverUrl,
      status: "under_review" as const,
      verification: { ...s.verification, mobile: true },
      publishedAt: Date.now(),
    };

    const token = typeof window !== "undefined" ? (getUserAccessToken() || localStorage.getItem("omeetso_user_token")) : null;
    let createdStoreId = s.id;

    if (token) {
      try {
        const res = await fetch("https://api.omeetso.in/api/v1/stores", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: s.name,
            tagline: s.tagline,
            description: s.description,
            businessType: s.businessType,
            primaryCategory: s.primaryCategory,
            supportingCategories: s.supportingCategories,
            pincode: s.pincode,
            area: s.area,
            city: s.city,
            address: s.address,
            businessMobile: s.businessMobile,
            email: s.email,
            logo: logoUrl,
            cover: coverUrl,
          }),
        });
        const json = await res.json();
        if (json.success && json.data?.id) {
          createdStoreId = json.data.id;
          storePayload.id = createdStoreId;
        }
      } catch (err) {
        console.warn("Backend store creation failed, using local store:", err);
      }
    }

    upsertStore(storePayload);
    setSelectedStoreId(createdStoreId);
    setSubmitting(false);
    toast.success("Store created successfully!");
    nav({ to: "/store/success", search: { id: createdStoreId } });
  }

  const logoSrc = logoPreview || (s.logo && !s.logo.startsWith("data:") ? s.logo : null);
  const coverSrc = coverPreview || (s.cover && !s.cover.startsWith("data:") ? s.cover : null);

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-28 md:pb-16 font-sans">
        <BackBar title="Create Your Store" />

        <div className="mx-auto max-w-[1400px] px-4 py-5 md:px-8">

          {/* ── STEP INDICATOR ── */}
          <div className="mb-6 flex items-center justify-center gap-1">
            {STEPS.map((st, i) => {
              const active = i === step;
              const done = i < step;
              return (
                <div key={st.key} className="flex items-center">
                  <button
                    onClick={() => i <= step && setStep(i)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${active
                      ? "bg-indigo-brand text-white shadow-lg shadow-indigo-brand/30 scale-105"
                      : done
                        ? "bg-emerald-500/15 text-emerald-600"
                        : "bg-muted/50 text-muted-foreground"
                      }`}
                  >
                    {done ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <span className={`grid h-5 w-5 place-items-center rounded-full text-[10px] font-black ${active ? "bg-white/25 text-white" : "bg-muted text-muted-foreground"
                        }`}>{st.num}</span>
                    )}
                    <span className="hidden sm:inline">{st.label}</span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <ChevronRight className={`h-4 w-4 mx-1 ${i < step ? "text-emerald-500" : "text-muted-foreground/30"}`} />
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-col lg:flex-row gap-8 items-start">

            {/* ── LEFT COLUMN: FORM ── */}
            <div className="w-full lg:w-[58%] xl:w-[60%] space-y-5">

              {/* ═══════════ STEP 1: Store Info + Branding + Category ═══════════ */}
              {step === 0 && (
                <>
                  {/* Cover & Logo Upload */}
                  <section className="rounded-3xl bg-card border border-border shadow-sm overflow-hidden">
                    {/* Cover Upload */}
                    <div
                      className="relative h-36 w-full bg-gradient-to-r from-navy via-slate-800 to-indigo-900 cursor-pointer group"
                      onClick={() => coverRef.current?.click()}
                    >
                      {coverSrc ? (
                        <>
                          <img src={coverSrc} alt="" className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setCoverPreview(null); patch({ cover: "" }); }}
                            className="absolute top-2 right-2 grid h-7 w-7 place-items-center rounded-full bg-black/60 text-white hover:bg-red-500 z-10"
                          ><X className="h-3.5 w-3.5" /></button>
                        </>
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white/70 group-hover:text-white transition-colors">
                          <Camera className="h-7 w-7 mb-1" />
                          <span className="text-xs font-bold">Upload Cover Banner</span>
                          <span className="text-[10px] text-white/50 mt-0.5">1200 × 400 recommended</span>
                        </div>
                      )}
                      <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
                    </div>

                    {/* Logo Upload */}
                    <div className="px-5 pb-5 -mt-10 relative z-10">
                      <div
                        className="h-20 w-20 rounded-2xl bg-card border-[3px] border-card shadow-xl overflow-hidden cursor-pointer group"
                        onClick={() => logoRef.current?.click()}
                      >
                        {logoSrc || (s.logo && s.logo.startsWith("data:")) ? (
                          <img src={logoSrc || s.logo} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full bg-indigo-brand/10 grid place-items-center group-hover:bg-indigo-brand/20 transition-colors">
                            <Upload className="h-6 w-6 text-indigo-brand" />
                          </div>
                        )}
                        <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                      </div>
                      <p className="text-[10px] font-medium text-muted-foreground mt-1.5">Tap to upload logo</p>
                    </div>
                  </section>

                  {/* Store Details */}
                  <section className="rounded-3xl bg-card p-5 border border-border shadow-sm space-y-4">
                    <div className="flex items-center gap-2 border-b border-border pb-3">
                      <Building2 className="h-5 w-5 text-indigo-brand" />
                      <h2 className="text-sm font-extrabold uppercase text-foreground">Store Details</h2>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-muted-foreground mb-1">Store Name *</label>
                      <input
                        value={s.name}
                        onChange={(e) => patch({ name: e.target.value })}
                        placeholder="e.g. Satish Electronics & Mobile Care"
                        className="w-full h-12 rounded-2xl border border-border bg-background px-4 text-sm font-semibold text-foreground outline-none focus:border-indigo-brand focus:ring-2 focus:ring-indigo-brand/20 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-muted-foreground mb-1">Tagline</label>
                      <input
                        value={s.tagline ?? ""}
                        onChange={(e) => patch({ tagline: e.target.value })}
                        placeholder="e.g. Trusted electronics since 2021"
                        className="w-full h-11 rounded-2xl border border-border bg-background px-4 text-xs font-medium text-foreground outline-none focus:border-indigo-brand transition-all mb-2"
                      />
                      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                        {taglines.map((t, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => patch({ tagline: t })}
                            className="shrink-0 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-amber-700 hover:bg-amber-500/20 transition-all flex items-center gap-1"
                          >
                            <Sparkles className="h-3 w-3" /> {t.slice(0, 40)}…
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-muted-foreground mb-1">Business Type</label>
                        <select
                          value={s.businessType}
                          onChange={(e) => patch({ businessType: e.target.value })}
                          className="w-full h-11 rounded-2xl border border-border bg-background px-3 text-xs font-bold text-foreground outline-none focus:border-indigo-brand"
                        >
                          <option value="">Select type</option>
                          {BUSINESS_TYPES.map((bt) => <option key={bt} value={bt}>{bt}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-muted-foreground mb-1">Experience</label>
                        <select
                          value={s.experience}
                          onChange={(e) => patch({ experience: e.target.value })}
                          className="w-full h-11 rounded-2xl border border-border bg-background px-3 text-xs font-bold text-foreground outline-none focus:border-indigo-brand"
                        >
                          <option value="">Select</option>
                          {EXPERIENCE_OPTIONS.map((exp) => <option key={exp} value={exp}>{exp}</option>)}
                        </select>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-muted-foreground">Description *</label>
                        <button
                          type="button"
                          onClick={handleGenerateAiDescription}
                          disabled={aiLoading}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-brand to-purple-600 text-[10px] font-bold text-white shadow-sm hover:opacity-95 disabled:opacity-50"
                        >
                          <Wand2 className="h-3 w-3" />
                          {aiLoading ? "Generating..." : "✨ AI Description"}
                        </button>
                      </div>
                      <textarea
                        rows={4}
                        value={s.description}
                        onChange={(e) => patch({ description: e.target.value })}
                        placeholder="Describe your business, products, delivery terms..."
                        className="w-full rounded-2xl border border-border bg-background p-3.5 text-xs font-medium text-foreground outline-none focus:border-indigo-brand leading-relaxed"
                      />
                    </div>
                  </section>

                  {/* Category Selection */}
                  <section className="rounded-3xl bg-card p-5 border border-border shadow-sm space-y-4">
                    <div className="flex items-center gap-2 border-b border-border pb-3">
                      <StoreIcon className="h-5 w-5 text-indigo-brand" />
                      <h2 className="text-sm font-extrabold uppercase text-foreground">Store Category *</h2>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {PRIMARY_CATEGORIES.map((cat) => {
                        const selected = s.primaryCategory === cat.id;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => patch({ primaryCategory: cat.id })}
                            className={`px-3 py-3 rounded-2xl border text-xs font-bold transition-all ${selected
                              ? "bg-indigo-brand text-white border-indigo-brand shadow-md"
                              : "bg-background text-foreground border-border hover:border-indigo-brand/50 hover:bg-indigo-brand/5"
                              }`}
                          >
                            {selected && <Check className="h-3 w-3 inline mr-1" />}
                            {cat.label}
                          </button>
                        );
                      })}
                    </div>
                  </section>
                </>
              )}

              {/* ═══════════ STEP 2: Location + Contact ═══════════ */}
              {step === 1 && (
                <>
                  {/* Location */}
                  <section className="rounded-3xl bg-card p-5 border border-border shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-indigo-brand" />
                        <h2 className="text-sm font-extrabold uppercase text-foreground">Store Location</h2>
                      </div>
                      <button
                        type="button"
                        onClick={detectLocation}
                        disabled={fetchingGeo}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 text-emerald-600 text-[10px] font-bold hover:bg-emerald-500/25 transition-all disabled:opacity-50"
                      >
                        {fetchingGeo ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LocateFixed className="h-3.5 w-3.5" />}
                        {fetchingGeo ? "Detecting..." : "Auto-detect GPS"}
                      </button>
                    </div>

                    {s.area && s.pincode && (
                      <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                        <Navigation className="h-4 w-4 text-emerald-600" />
                        <span className="text-xs font-bold text-emerald-700">
                          Detected: {s.area}, {s.city} — {s.pincode}
                        </span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-muted-foreground mb-1">Pincode *</label>
                        <input
                          value={s.pincode}
                          onChange={async (e) => {
                            const pin = e.target.value.replace(/\D/g, "").slice(0, 6);
                            patch({ pincode: pin });
                            if (pin.length === 6) {
                              const loc = await fetchAreaFromPincode(pin);
                              if (loc.area && !loc.area.startsWith("Area ")) {
                                patch({ pincode: pin, area: loc.area, city: loc.city || s.city });
                              }
                            }
                          }}
                          placeholder="500081"
                          className="w-full h-11 rounded-2xl border border-border bg-background px-4 text-xs font-bold text-foreground outline-none focus:border-indigo-brand"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-muted-foreground mb-1">Area *</label>
                        <input
                          value={s.area}
                          onChange={(e) => patch({ area: e.target.value })}
                          placeholder="Adilabad"
                          className="w-full h-11 rounded-2xl border border-border bg-background px-4 text-xs font-bold text-foreground outline-none focus:border-indigo-brand"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-muted-foreground mb-1">City</label>
                        <input
                          value={s.city}
                          onChange={(e) => patch({ city: e.target.value })}
                          placeholder="Hyderabad"
                          className="w-full h-11 rounded-2xl border border-border bg-background px-4 text-xs font-bold text-foreground outline-none focus:border-indigo-brand"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-muted-foreground mb-1">State</label>
                        <input
                          value={s.state}
                          onChange={(e) => patch({ state: e.target.value })}
                          placeholder="Telangana"
                          className="w-full h-11 rounded-2xl border border-border bg-background px-4 text-xs font-bold text-foreground outline-none focus:border-indigo-brand"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-muted-foreground mb-1">Full Shop Address</label>
                      <textarea
                        rows={2}
                        value={s.address}
                        onChange={(e) => patch({ address: e.target.value })}
                        placeholder="Shop No. 12, Main Road, Near Metro Station..."
                        className="w-full rounded-2xl border border-border bg-background p-3 text-xs font-medium text-foreground outline-none focus:border-indigo-brand"
                      />
                    </div>
                  </section>

                  {/* Contact */}
                  <section className="rounded-3xl bg-card p-5 border border-border shadow-sm space-y-4">
                    <div className="flex items-center gap-2 border-b border-border pb-3">
                      <Phone className="h-5 w-5 text-indigo-brand" />
                      <h2 className="text-sm font-extrabold uppercase text-foreground">Contact Details</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-muted-foreground mb-1">Business Mobile *</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <input
                            value={s.businessMobile}
                            onChange={(e) => patch({ businessMobile: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                            placeholder="9876543210"
                            className="w-full h-11 rounded-2xl border border-border bg-background pl-10 pr-4 text-xs font-bold text-foreground outline-none focus:border-indigo-brand"
                          />
                        </div>
                        {s.businessMobile && /^\d{10}$/.test(s.businessMobile) && (
                          <span className="text-[10px] font-bold text-emerald-600 mt-1 flex items-center gap-1">
                            <Check className="h-3 w-3" /> Valid number
                          </span>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-muted-foreground mb-1">Business Email</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <input
                            value={s.email}
                            onChange={(e) => patch({ email: e.target.value })}
                            placeholder="store@domain.com"
                            className="w-full h-11 rounded-2xl border border-border bg-background pl-10 pr-4 text-xs font-bold text-foreground outline-none focus:border-indigo-brand"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Delivery Options */}
                    <div className="pt-2 border-t border-border mt-2">
                      <div className="flex items-center gap-2 mb-3">
                        <Truck className="h-4 w-4 text-indigo-brand" />
                        <span className="text-xs font-extrabold uppercase text-foreground">Delivery & Pickup</span>
                      </div>
                      <div className="flex gap-3">
                        <label className="flex-1 flex items-center gap-3 p-3 rounded-2xl border border-border cursor-pointer hover:border-indigo-brand/50 transition-all">
                          <input
                            type="checkbox"
                            checked={s.delivery.pickup}
                            onChange={(e) => patch({ delivery: { ...s.delivery, pickup: e.target.checked } })}
                            className="accent-indigo-brand h-4 w-4"
                          />
                          <span className="text-xs font-bold text-foreground">In-Store Pickup</span>
                        </label>
                        <label className="flex-1 flex items-center gap-3 p-3 rounded-2xl border border-border cursor-pointer hover:border-indigo-brand/50 transition-all">
                          <input
                            type="checkbox"
                            checked={s.delivery.localDelivery}
                            onChange={(e) => patch({ delivery: { ...s.delivery, localDelivery: e.target.checked } })}
                            className="accent-indigo-brand h-4 w-4"
                          />
                          <span className="text-xs font-bold text-foreground">Local Delivery</span>
                        </label>
                      </div>
                    </div>
                  </section>
                </>
              )}

              {/* ═══════════ STEP 3: Review & Submit ═══════════ */}
              {step === 2 && (
                <section className="rounded-3xl bg-card p-5 border border-border shadow-sm space-y-5">
                  <div className="flex items-center gap-2 border-b border-border pb-3">
                    <ShieldCheck className="h-5 w-5 text-indigo-brand" />
                    <h2 className="text-sm font-extrabold uppercase text-foreground">Review & Create Store</h2>
                  </div>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-4 rounded-2xl bg-indigo-brand/5 border border-indigo-brand/15 space-y-2">
                      <span className="text-[10px] font-bold uppercase text-indigo-brand tracking-wider">Store Info</span>
                      <p className="text-sm font-extrabold text-foreground">{s.name || "—"}</p>
                      <p className="text-[10px] text-muted-foreground line-clamp-2">{s.tagline || "No tagline"}</p>
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-indigo-brand/10 text-[10px] font-bold text-indigo-brand">
                        {PRIMARY_CATEGORIES.find(c => c.id === s.primaryCategory)?.label || s.primaryCategory || "No category"}
                      </span>
                    </div>
                    <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 space-y-2">
                      <span className="text-[10px] font-bold uppercase text-emerald-600 tracking-wider">Location & Contact</span>
                      <p className="text-sm font-bold text-foreground flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-emerald-600" /> {s.area || "—"}, {s.city}
                      </p>
                      <p className="text-[10px] text-muted-foreground">PIN: {s.pincode || "—"}</p>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {s.businessMobile || "—"} · {s.email || "—"}
                      </p>
                    </div>
                  </div>

                  {/* Preview Description */}
                  <div className="p-3 rounded-2xl bg-muted/50 text-xs text-muted-foreground line-clamp-4 leading-relaxed">
                    {s.description || "No description provided."}
                  </div>

                  {/* Branding Preview */}
                  {(logoSrc || coverSrc || s.logo) && (
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/30 border border-border">
                      {(logoSrc || s.logo) && (
                        <img src={logoSrc || s.logo} alt="" className="h-12 w-12 rounded-xl object-cover border border-border" />
                      )}
                      <div className="text-xs">
                        <p className="font-bold text-foreground">Branding uploaded</p>
                        <p className="text-muted-foreground text-[10px]">
                          {logoSrc || s.logo ? "✓ Logo" : "✗ No logo"} · {coverSrc || s.cover ? "✓ Cover" : "✗ No cover"}
                        </p>
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={submit}
                    disabled={submitting}
                    className="w-full h-14 rounded-2xl bg-gradient-to-r from-indigo-brand to-indigo-600 text-sm font-extrabold text-white shadow-xl hover:opacity-95 flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                  >
                    <Building2 className="h-5 w-5" />
                    <span>{submitting ? "Creating Store..." : "🚀 Create Business Store"}</span>
                  </button>

                  <p className="text-center text-[10px] text-muted-foreground">
                    Your store will be reviewed and approved within 24 hours
                  </p>
                </section>
              )}

              {/* Step Navigation */}
              {step < 2 && (
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={prev}
                    disabled={step === 0}
                    className="px-5 py-2.5 rounded-2xl border border-border bg-card text-xs font-bold text-muted-foreground hover:bg-secondary disabled:opacity-30 transition-all"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    className="px-7 py-2.5 rounded-2xl bg-indigo-brand text-xs font-bold text-white shadow-md hover:opacity-95 transition-all flex items-center gap-1.5"
                  >
                    Next Step <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* ── RIGHT COLUMN: LIVE PREVIEW (DESKTOP) ── */}
            <div className="hidden lg:block lg:w-[42%] xl:w-[40%] sticky top-20 h-fit space-y-4 font-sans">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-indigo-brand" />
                  <span className="text-xs font-extrabold uppercase tracking-wide text-foreground">Live Preview</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  Real-time
                </span>
              </div>

              {/* Storefront Preview Card */}
              <div className="rounded-3xl bg-card border border-border shadow-xl overflow-hidden">
                <div className="relative h-32 w-full bg-gradient-to-r from-navy via-slate-900 to-navy overflow-hidden">
                  {coverSrc || s.cover ? (
                    <img src={coverSrc || s.cover} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 via-slate-900 to-navy opacity-80" />
                  )}
                  <div className="absolute top-3 left-3 bg-slate-950/80 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3 text-emerald-400" /> Verified Store
                  </div>
                </div>

                <div className="p-4 pt-0 relative space-y-3">
                  <div className="flex items-end justify-between -mt-8">
                    <div className="h-16 w-16 rounded-2xl bg-card p-1 border border-border shadow-lg overflow-hidden shrink-0">
                      {logoSrc || s.logo ? (
                        <img src={logoSrc || s.logo} alt="" className="h-full w-full object-cover rounded-xl" />
                      ) : (
                        <div className="h-full w-full bg-indigo-brand/10 text-indigo-brand font-black grid place-items-center rounded-xl text-lg">
                          {s.name ? s.name.charAt(0) : "S"}
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider bg-secondary px-2.5 py-1 rounded-full">
                      {s.businessType || "Retail Store"}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-foreground">{s.name || "Your Store Name"}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.tagline || "Your tagline here"}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-indigo-brand" /> {s.area || "Your area"}, {s.city || "City"}
                    </span>
                    <span className="font-bold text-foreground uppercase text-[10px]">
                      {PRIMARY_CATEGORIES.find(c => c.id === s.primaryCategory)?.label || "Category"}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-secondary/50 text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                    {s.description || "Write a description to see it here..."}
                  </div>

                  <div className="pt-1 flex gap-2">
                    <button type="button" className="flex-1 h-10 rounded-xl bg-indigo-brand text-xs font-bold text-white flex items-center justify-center gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5" /> Message Store
                    </button>
                    <button type="button" className="h-10 px-3.5 rounded-xl border border-border text-xs font-bold text-foreground flex items-center justify-center">
                      <Phone className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </MobileFrame>
  );
}
