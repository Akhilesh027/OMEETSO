import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import {
  ConditionSelector, PriceInput, ContactPreferenceSelector,
  LocationSelector, ValidationSummary, ConfirmModal, LoadingOverlay,
  MissingFieldsModal,
} from "@/components/sell";
import { ImageUploader } from "@/components/sell/ImageUploader";
import { SpecForm } from "@/components/sell/SpecForm";
import { CATEGORIES, SUBCATEGORIES, getSubcategoriesForCategory } from "@/lib/mock";
import {
  fetchLiveCategories, getCachedCategories, getLiveSubcategories,
  subscribeCategories, type LiveCategory
} from "@/lib/categories";
import { specFieldsFor } from "@/lib/specConfig";
import {
  type Listing, type Condition, type ContactPref, type BestContactTime, type Fulfilment,
  newId, upsertListing, saveDraft as saveDraftFn, deleteDraft, LS, formatINR,
  CONDITION_LABEL, getSellerPrefs,
} from "@/lib/listings";
import { getTrustScore, pushNotification } from "@/lib/account";
import { uploadImageToCloudinary, uploadVideoToCloudinary } from "@/lib/upload";
import {
  validateBasic, validateMedia, validateCategory,
  validateLocation, validateContact, validateSpecs,
} from "@/lib/listingValidation";
import { BRANDS_BY_CATEGORY, getBrandsForCategory, generateTitleSuggestions, generateAiDescription } from "@/lib/aiAssistance";
import { createListingApi } from "@/api/listings.api";
import { toast } from "sonner";
import { useRef } from "react";
import {
  Sparkles, ClipboardList, ShieldCheck, MapPin, Tag, Eye,
  Wand2, Image as ImageIcon, Layers, Phone, MessageSquare, CheckCircle2, X,
  Radio, ArrowRight, RefreshCw, Clock, Trash2, Loader2, Edit3, Plus,
} from "lucide-react";

export const Route = createFileRoute("/sell/detailed")({
  head: () => ({
    meta: [
      { title: "Detailed Listing — Specifications & Category Fields" },
      { name: "description", content: "Post with complete specifications on Omeetso." },
    ],
  }),
  component: DetailedSellPage,
});

const DRAFT_KEY = "omeetso_detailed_draft";

function loadDraft(): Partial<Listing> {
  if (typeof localStorage === "undefined") return {};
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function DetailedSellPage() {
  const nav = useNavigate();
  const [data, setData] = useState<Partial<Listing>>({
    images: [], cover: 0, negotiable: true, fulfilment: "pickup",
    contactPref: "call_and_chat", bestContactTime: "anytime",
    sellerName: "You", sellerType: "individual",
    city: "", area: "", pincode: "",
    category: "commercial-vehicles", subcategory: "", condition: "good",
    specs: {}
  });
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [isManualSubcategory, setIsManualSubcategory] = useState(false);
  const [isManualBrand, setIsManualBrand] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [summary, setSummary] = useState<string[]>([]);
  const [showMissingModal, setShowMissingModal] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [confirmed, setConfirmed] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [storeId, setStoreId] = useState<string | undefined>();
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);
  const [categories, setCategories] = useState<LiveCategory[]>(() => getCachedCategories());

  // Auto-Save Management State
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSavedTime, setLastSavedTime] = useState<number | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);
  const isInitialLoad = useRef(true);

  // Load live categories & listen for updates
  useEffect(() => {
    fetchLiveCategories().then((cats) => {
      if (cats && cats.length > 0) setCategories(cats);
    });
    const unsub = subscribeCategories(() => {
      setCategories(getCachedCategories());
    });
    const onCatsChanged = () => {
      setCategories(getCachedCategories());
    };
    window.addEventListener("omeetso_categories_changed", onCatsChanged);
    window.addEventListener("storage", onCatsChanged);
    return () => {
      unsub();
      window.removeEventListener("omeetso_categories_changed", onCatsChanged);
      window.removeEventListener("storage", onCatsChanged);
    };
  }, []);

  useEffect(() => {
    const d = loadDraft();
    const seller = getSellerPrefs();
    const selStore = typeof localStorage !== "undefined" ? localStorage.getItem("omeetso_selected_store") : null;
    let locArea = "";
    let locCity = "";
    let locPin = "";

    try {
      const rawLoc = localStorage.getItem("omeetso_location") || localStorage.getItem("omeetso_selected_location");
      if (rawLoc) {
        const loc = JSON.parse(rawLoc);
        if (loc.city) locCity = loc.city;
        if (loc.area) {
          const parts = loc.area.split(",").map((p: string) => p.trim());
          locArea = parts[0] || locArea;
          if (parts[1] && !loc.city) locCity = parts[1];
        }
        if (!locCity && locArea) locCity = locArea;
        if (loc.pincode) locPin = loc.pincode;
      }
    } catch { }

    const restoredCat = d?.category || "commercial-vehicles";
    const validBrands = getBrandsForCategory(restoredCat);
    const restoredBrand = d?.specs?.Brand || (d as any)?.brand || d?.specs?.["Brand / Manufacturer"] || "";
    if (restoredBrand) {
      setSelectedBrand(restoredBrand);
      if (!validBrands.includes(restoredBrand)) {
        setIsManualBrand(true);
      }
    }
    const cleanSpecs = restoredBrand ? (d?.specs || {}) : { ...(d?.specs || {}), Brand: "" };

    const liveSubs = getLiveSubcategories(restoredCat);
    if (d?.subcategory && !liveSubs.some(s => s.id === d.subcategory || s.name === d.subcategory)) {
      setIsManualSubcategory(true);
    }

    if (d && (d.title || d.price || (d.images && d.images.length > 0) || d.description || (cleanSpecs && Object.keys(cleanSpecs).length > 0))) {
      setDraftRestored(true);
      if ((d as any).lastAutoSavedAt) {
        setLastSavedTime((d as any).lastAutoSavedAt);
      }
    }

    setData((prev) => ({
      ...prev,
      ...d,
      specs: cleanSpecs,
      area: d?.area || locArea || prev.area || "",
      city: d?.city || locCity || prev.city || "",
      pincode: d?.pincode || locPin || prev.pincode || "",
      sellerName: seller.name || "You",
      sellerPhone: seller.phone,
      sellerType: seller.type ?? "individual",
    }));
    if (selStore) setStoreId(selStore);

    const syncLoc = (e: any) => {
      const detail = e.detail;
      if (detail) {
        const a = detail.area ? detail.area.split(",")[0].trim() : detail.area;
        const c = detail.city || (detail.area && detail.area.includes(",") ? detail.area.split(",")[1].trim() : a);
        setData((prev) => ({
          ...prev,
          area: a || prev.area,
          city: c || prev.city,
          pincode: detail.pincode || prev.pincode
        }));
      }
    };
    window.addEventListener("omeetso_location_changed", syncLoc);

    setTimeout(() => {
      isInitialLoad.current = false;
    }, 400);

    return () => window.removeEventListener("omeetso_location_changed", syncLoc);
  }, []);

  // Automatic real-time background draft saving (debounced 800ms)
  useEffect(() => {
    if (isInitialLoad.current || !autoSaveEnabled) return;

    const hasData = Boolean(
      (data.title && data.title.trim().length > 0) ||
      (data.price && data.price > 0) ||
      (data.images && data.images.length > 0) ||
      (data.description && data.description.trim().length > 0) ||
      (data.specs && Object.keys(data.specs).length > 0)
    );

    if (!hasData) return;

    setIsAutoSaving(true);
    const timer = setTimeout(() => {
      const now = Date.now();
      const safeImages = (data.images || []).filter((img) => typeof img === "string" && (img.startsWith("http://") || img.startsWith("https://")));
      const safeVideo = data.videoUrl && data.videoUrl.startsWith("data:video/") ? "" : (data.videoUrl || data.video);
      const payload = { ...data, images: safeImages, videoUrl: safeVideo, video: safeVideo, lastAutoSavedAt: now };
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
        saveDraftFn({
          id: (data as any).draftId || "detailed-draft-1",
          title: data.title || "Untitled Detailed Listing",
          category: data.category || "electronics",
          subcategory: data.subcategory || "laptops",
          price: data.price,
          images: safeImages.slice(0, 4),
          cover: data.cover,
          specs: data.specs,
          method: "detailed",
          createdAt: now,
          updatedAt: now,
        });
        setLastSavedTime(now);
      } catch (err) {
        // Fallback for quota limit
        try {
          localStorage.removeItem("omeetso_listings");
          localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...data, images: [], videoUrl: "", video: "", lastAutoSavedAt: now }));
          setLastSavedTime(now);
        } catch { /* ignore */ }
      } finally {
        setIsAutoSaving(false);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [data, autoSaveEnabled]);

  // Flush auto-save on page exit / beforeunload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (autoSaveEnabled && data.title) {
        try {
          const safeImages = (data.images || []).filter((img) => typeof img === "string" && (img.startsWith("http://") || img.startsWith("https://")));
          const safeVideo = data.videoUrl && data.videoUrl.startsWith("data:video/") ? "" : (data.videoUrl || data.video);
          localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...data, images: safeImages, videoUrl: safeVideo, video: safeVideo, lastAutoSavedAt: Date.now() }));
        } catch {}
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [data, autoSaveEnabled]);

  const handleDiscardDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    deleteDraft("detailed-draft-1");
    if ((data as any).draftId) deleteDraft((data as any).draftId);
    setDraftRestored(false);
    setDraftRestored(false);
    setData({
      images: [], cover: 0, negotiable: true, fulfilment: "pickup",
      contactPref: "call_and_chat", bestContactTime: "anytime",
      sellerName: "You", sellerType: "individual",
      city: "Hyderabad", area: "Hitec City", pincode: "500081",
      category: "electronics", subcategory: "", condition: "good",
      specs: {}
    });
    setSelectedBrand("");
    setLastSavedTime(null);
    toast.info("Draft cleared. Starting fresh.");
  };

  const patch = (p: Partial<Listing>) => setData((d) => ({ ...d, ...p }));

  const categoryBrands = useMemo(() => {
    return getBrandsForCategory(data.category);
  }, [data.category]);

  const titleSuggestions = useMemo(() => {
    return generateTitleSuggestions(data.category, selectedBrand, CONDITION_LABEL[(data.condition as Condition) || "good"]);
  }, [data.category, selectedBrand, data.condition]);

  const handleGenerateAiDescription = () => {
    setAiLoading(true);
    setTimeout(() => {
      const desc = generateAiDescription({
        title: data.title,
        category: data.category,
        brand: selectedBrand,
        condition: CONDITION_LABEL[(data.condition as Condition) || "good"],
        price: data.price,
        specs: data.specs,
        area: `${data.area || "Hitec City"}, ${data.city || "Hyderabad"}`
      });
      patch({ description: desc });
      setAiLoading(false);
      toast.success("✨ Detailed AI Description generated!");
    }, 400);
  };

  async function publish() {
    const checks = [validateCategory, validateBasic, validateMedia, validateLocation, validateContact].map((fn) => fn(data as Listing));
    checks.push(validateSpecs(data as Listing));
    const errs = Object.assign({}, ...checks.map((r) => r.errors));
    const sums = checks.flatMap((r) => r.summary);
    setErrors(errs); setSummary(sums);
    if (sums.length > 0) {
      setShowMissingModal(true);
      return;
    }
    if (!confirmed) { toast.error("Please confirm the listing declaration"); return; }

    const user = typeof localStorage !== "undefined" && (localStorage.getItem("omeetso_user") || localStorage.getItem("omeetso_user_token"));
    if (!user) {
      toast.info("Sign in to publish your listing", { action: { label: "Sign in", onClick: () => nav({ to: "/login" }) } });
      return;
    }
    setPublishing(true);
    const [uploadedImages, uploadedVideo] = await Promise.all([
      Promise.all((data.images || []).map((img) => uploadImageToCloudinary(img, "listings"))),
      data.videoUrl || data.video
        ? uploadVideoToCloudinary(data.videoUrl || data.video, "listing_videos")
        : Promise.resolve("")
    ]);

    const finalVideo = uploadedVideo || data.videoUrl || data.video || "";
    const now = Date.now();
    let id = newId();

    let finalImages = uploadedImages;
    let finalSavedVideo = finalVideo;

    try {
      const res = await createListingApi({
        title: data.title,
        description: data.description || "Detailed product listing via Omeetso User Portal",
        priceInPaise: Math.round((data.price || 0) * 100),
        negotiable: Boolean(data.negotiable),
        pricingType: data.negotiable ? "NEGOTIABLE" : "FIXED",
        condition: (data.condition || "good").toLowerCase().replace(" ", "_"),
        categoryId: data.category || "electronics",
        subcategoryId: data.subcategory || data.category || "electronics",
        images: uploadedImages || [],
        coverIndex: data.cover || 0,
        videoUrl: finalVideo,
        whatsappPhone: data.whatsappPhone || data.sellerPhone || "",
        sellerPhone: data.sellerPhone || data.whatsappPhone || "",
        enableWhatsapp: data.enableWhatsapp ?? true,
        city: data.city || "",
        area: data.area || "",
        pincode: data.pincode || "",
        specs: data.specs || {},
        method: "detailed"
      });

      if (res.success && res.data?.id) {
        id = res.data.id;
        if (res.data.images && Array.isArray(res.data.images) && res.data.images.length > 0) {
          finalImages = res.data.images;
        }
        if (res.data.videoUrl) {
          finalSavedVideo = res.data.videoUrl;
        }
      }
    } catch (err) {
      console.warn("MongoDB listing save warning:", err);
    }

    const listing: Listing = {
      id, title: data.title!, price: data.price ?? 0, negotiable: Boolean(data.negotiable), free: !!data.free,
      condition: (data.condition ?? "good") as Condition,
      description: data.description || "Detailed spec product listing",
      category: data.category!, subcategory: data.subcategory!,
      images: finalImages, cover: data.cover ?? 0,
      video: finalSavedVideo,
      videoUrl: finalSavedVideo,
      whatsappPhone: data.whatsappPhone || data.sellerPhone,
      sellerPhone: data.sellerPhone || data.whatsappPhone,
      enableWhatsapp: data.enableWhatsapp ?? true,
      pincode: data.pincode || "", area: data.area || "", city: data.city || "", state: data.state,
      fulfilment: (data.fulfilment ?? "pickup") as Fulfilment,
      specs: data.specs ?? {},
      contactPref: (data.contactPref ?? "call_and_chat") as ContactPref,
      bestContactTime: (data.bestContactTime ?? "anytime") as BestContactTime,
      sellerName: data.sellerName ?? "You", sellerPhone: data.sellerPhone || data.whatsappPhone,
      sellerType: data.sellerType ?? "individual",
      status: "under_review", createdAt: now, updatedAt: now, method: "detailed",
      storeId: storeId,
      storeMeta: storeId ? { stockStatus: "in_stock" } : undefined,
      nearbyChanges: data.nearbyChanges,
    };

    upsertListing(listing);

    // Clean up draft so it doesn't revert to draft
    try {
      localStorage.removeItem(DRAFT_KEY);
      deleteDraft("detailed-draft-1");
      if ((data as any).draftId) deleteDraft((data as any).draftId);
    } catch {}

    // 1. Listing Created Notification
    pushNotification({
      id: `listing-created-${listing.id}-${Date.now()}`,
      category: "listings",
      title: `Listing Created: ${listing.title}`,
      body: `Your detailed listing "${listing.title}" was submitted and is pending review.`,
      destination: `/product/${listing.id}`,
      destinationLabel: "View Listing",
      read: false,
      time: now,
      thumbnail: uploadedImages[0] || coverImg
    });

    // 2. Nearby Changes Notification
    pushNotification({
      id: `nearby-notif-${listing.id}-${Date.now()}`,
      category: "nearby_changes",
      title: `Nearby Changes: ${listing.title}`,
      body: `Nearby changes and local broadcast enabled for "${listing.title}" within ${data.nearbyChanges?.radiusKm || 10} km of ${data.area || "your area"}.`,
      destination: `/product/${listing.id}`,
      destinationLabel: "View Listing",
      read: false,
      time: now,
      thumbnail: uploadedImages[0] || coverImg
    });

    localStorage.removeItem(DRAFT_KEY);
    setPublishing(false);
    toast.success("Detailed listing submitted for review! It will go live once approved by admin.");
    nav({ to: "/listings", search: { tab: "review" } as any });
  }

  const fields = useMemo(() => {
    return specFieldsFor(data.category, data.subcategory).filter(
      (f) => f.key.toLowerCase() !== "brand"
    );
  }, [data.category, data.subcategory]);

  const coverImg = data.images?.[data.cover ?? 0] || data.images?.[0];

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-28 md:pb-16 font-sans">
        <BackBar title="Create Detailed Listing" />

        {/* Auto-Save Status & Control Bar */}
        <div className="bg-secondary/40 border-b border-border/80 px-4 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {isAutoSaving ? (
              <span className="inline-flex items-center gap-1.5 text-indigo-brand font-bold animate-pulse">
                <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Saving draft...
              </span>
            ) : lastSavedTime ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-600 font-bold">
                <CheckCircle2 className="h-3.5 w-3.5" /> Draft auto-saved ({new Date(lastSavedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
              </span>
            ) : (
              <span className="text-muted-foreground font-semibold flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> Auto-save active
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 text-[11px] font-extrabold text-muted-foreground hover:text-foreground cursor-pointer select-none">
              <span>Auto-save:</span>
              <input
                type="checkbox"
                checked={autoSaveEnabled}
                onChange={(e) => {
                  setAutoSaveEnabled(e.target.checked);
                  if (e.target.checked) toast.success("Auto-save enabled");
                  else toast.info("Auto-save paused");
                }}
                className="h-3.5 w-3.5 accent-emerald-600 rounded cursor-pointer"
              />
              <span className={autoSaveEnabled ? "text-emerald-600 font-bold" : "text-muted-foreground"}>
                {autoSaveEnabled ? "ON" : "OFF"}
              </span>
            </label>
          </div>
        </div>

        {/* Draft Restored Banner */}
        {draftRestored && (
          <div className="mx-auto max-w-[1400px] px-4 pt-3 md:px-8">
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-foreground">
              <div className="flex items-center gap-2 min-w-0">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span className="font-bold truncate">
                  Draft restored from your previous session
                  {lastSavedTime && ` (${new Date(lastSavedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`}.
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setDraftRestored(false)}
                  className="px-3 py-1 rounded-full bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-all text-[11px] cursor-pointer"
                >
                  Continue Editing
                </button>
                <button
                  type="button"
                  onClick={handleDiscardDraft}
                  className="px-3 py-1 rounded-full bg-card border border-border text-muted-foreground font-bold hover:text-rose-600 hover:border-rose-300 transition-all text-[11px] cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="h-3 w-3" /> Discard
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mx-auto max-w-[1400px] px-4 py-6 md:px-8">
          <div className="flex flex-col lg:flex-row gap-8 items-start">

            {/* ── LEFT COLUMN: FORM INPUTS ── */}
            <div className="w-full lg:w-[58%] xl:w-[60%] space-y-6">

              <div className="rounded-2xl bg-gradient-to-r from-indigo-500/15 via-purple-500/10 to-transparent p-4 border border-indigo-500/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-brand text-white shadow-md">
                    <ClipboardList className="h-5 w-5" />
                  </div>
                  <div>
                    <h1 className="text-base font-extrabold text-foreground">Detailed Listing Creator</h1>
                    <p className="text-xs text-muted-foreground">Add complete specs for higher buyer confidence.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobilePreviewOpen(true)}
                  className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-brand text-xs font-bold text-white shadow-sm"
                >
                  <Eye className="h-3.5 w-3.5" /> Preview
                </button>
              </div>

              {/* 1. CATEGORY & BRAND */}
              <section className="rounded-3xl bg-card p-5 border border-border shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-border pb-3">
                  <Layers className="h-5 w-5 text-indigo-brand" />
                  <h2 className="text-sm font-extrabold uppercase text-foreground">1. Category & Brand</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1">Category</label>
                    <select
                      value={data.category ?? categories[0]?.id ?? "electronics"}
                      onChange={(e) => {
                        const cat = e.target.value;
                        patch({ category: cat, subcategory: "", specs: {} });
                        setSelectedBrand("");
                        setIsManualSubcategory(false);
                        setIsManualBrand(false);
                      }}
                      className="w-full h-11 rounded-2xl border border-border bg-background px-3 text-xs font-bold text-foreground outline-none focus:border-indigo-brand"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-muted-foreground">Subcategory</label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsManualSubcategory(!isManualSubcategory);
                        }}
                        className="text-[11px] font-bold text-indigo-brand hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="h-3 w-3" />
                        {isManualSubcategory ? "Choose from list" : "Type manually"}
                      </button>
                    </div>

                    {isManualSubcategory ? (
                      <div className="relative">
                        <input
                          type="text"
                          value={data.subcategory ?? ""}
                          onChange={(e) => patch({ subcategory: e.target.value, specs: {} })}
                          placeholder="Type custom subcategory..."
                          className="w-full h-11 rounded-2xl border border-border bg-background px-3.5 text-xs font-bold text-foreground outline-none focus:border-indigo-brand focus:ring-2 focus:ring-indigo-brand/20 transition-all"
                        />
                        {data.subcategory && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-extrabold bg-indigo-500/10 text-indigo-brand px-2 py-0.5 rounded-md pointer-events-none">
                            Manual
                          </span>
                        )}
                      </div>
                    ) : (
                      <select
                        value={data.subcategory ?? ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "__custom__") {
                            setIsManualSubcategory(true);
                            patch({ subcategory: "", specs: {} });
                          } else {
                            patch({ subcategory: val, specs: {} });
                          }
                        }}
                        className="w-full h-11 rounded-2xl border border-border bg-background px-3 text-xs font-bold text-foreground outline-none focus:border-indigo-brand"
                      >
                        <option value="">Select Subcategory…</option>
                        {getLiveSubcategories(data.category ?? categories[0]?.id ?? "electronics").map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                        <option value="__custom__">➕ Type Custom Subcategory...</option>
                        {data.subcategory && !getLiveSubcategories(data.category ?? categories[0]?.id ?? "electronics").some(s => s.id === data.subcategory || s.name === data.subcategory) && (
                          <option value={data.subcategory}>{data.subcategory} (Custom)</option>
                        )}
                      </select>
                    )}
                    {errors.subcategory && <p className="text-xs font-bold text-rose-600 mt-1">{errors.subcategory}</p>}
                  </div>
                </div>

                {/* Brand Selection Dropdown & Popular Pills */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-muted-foreground">Brand / Manufacturer</label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsManualBrand(!isManualBrand);
                      }}
                      className="text-[11px] font-bold text-indigo-brand hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="h-3 w-3" />
                      {isManualBrand ? "Choose from list" : "Type manually"}
                    </button>
                  </div>

                  {isManualBrand ? (
                    <div className="relative">
                      <input
                        type="text"
                        value={selectedBrand === "Other" ? "" : selectedBrand}
                        onChange={(e) => {
                          const b = e.target.value;
                          setSelectedBrand(b);
                          patch({
                            specs: {
                              ...(data.specs || {}),
                              Brand: b,
                              "Brand / Manufacturer": b,
                            },
                          });
                        }}
                        placeholder="Type custom brand or manufacturer name..."
                        className="w-full h-11 rounded-2xl border border-border bg-background px-3.5 text-xs font-bold text-foreground outline-none focus:border-indigo-brand focus:ring-2 focus:ring-indigo-brand/20 transition-all"
                      />
                      {selectedBrand && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-extrabold bg-indigo-500/10 text-indigo-brand px-2 py-0.5 rounded-md pointer-events-none">
                          Manual
                        </span>
                      )}
                    </div>
                  ) : (
                    <>
                      <select
                        value={selectedBrand}
                        onChange={(e) => {
                          const b = e.target.value;
                          if (b === "Other") {
                            setIsManualBrand(true);
                            setSelectedBrand("");
                            patch({
                              specs: {
                                ...(data.specs || {}),
                                Brand: "",
                                "Brand / Manufacturer": "",
                                Model: "",
                              },
                            });
                          } else {
                            setSelectedBrand(b);
                            patch({
                              specs: {
                                ...(data.specs || {}),
                                Brand: b,
                                "Brand / Manufacturer": b,
                                Model: "",
                              },
                            });
                          }
                        }}
                        className="w-full h-11 rounded-2xl border border-border bg-background px-3 text-xs font-bold text-foreground outline-none focus:border-indigo-brand"
                      >
                        <option value="">Select Brand / Manufacturer…</option>
                        {categoryBrands.map((b) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                        <option value="Other">➕ Type Custom Brand / Manufacturer...</option>
                        {selectedBrand && !categoryBrands.includes(selectedBrand) && selectedBrand !== "Other" && (
                          <option value={selectedBrand}>{selectedBrand} (Custom)</option>
                        )}
                      </select>

                      {/* If custom brand entered while in select mode */}
                      {selectedBrand && !categoryBrands.includes(selectedBrand) && selectedBrand !== "Other" && (
                        <div className="pt-1">
                          <input
                            type="text"
                            value={selectedBrand}
                            onChange={(e) => {
                              const b = e.target.value;
                              setSelectedBrand(b);
                              patch({
                                specs: {
                                  ...(data.specs || {}),
                                  Brand: b,
                                  "Brand / Manufacturer": b,
                                },
                              });
                            }}
                            placeholder="Type custom brand name..."
                            className="w-full h-10 rounded-2xl border border-indigo-brand/50 bg-background px-3 text-xs font-bold text-foreground outline-none focus:border-indigo-brand"
                          />
                        </div>
                      )}
                    </>
                  )}

                  {/* Popular Brand Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {categoryBrands.map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => {
                          const nextB = b === selectedBrand ? "" : b;
                          setIsManualBrand(false);
                          setSelectedBrand(nextB);
                          patch({
                            specs: {
                              ...(data.specs || {}),
                              Brand: nextB,
                              "Brand / Manufacturer": nextB,
                              Model: nextB === selectedBrand ? (data.specs?.Model || "") : "",
                            },
                          });
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${selectedBrand === b && !isManualBrand
                          ? "bg-indigo-brand text-white border-indigo-brand shadow-sm"
                          : "bg-secondary/70 text-foreground border-border hover:bg-secondary cursor-pointer"
                          }`}
                      >
                        {b}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setIsManualBrand(true);
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all border cursor-pointer ${isManualBrand
                        ? "bg-indigo-brand text-white border-indigo-brand shadow-sm"
                        : "bg-secondary/70 text-indigo-brand border-dashed border-indigo-brand/40 hover:bg-secondary"
                        }`}
                    >
                      + Custom Brand
                    </button>
                  </div>
                </div>
              </section>

              {/* 2. CATEGORY SPECIFICATIONS */}
              {fields.length > 0 && (
                <section className="rounded-3xl bg-card p-5 border border-border shadow-sm space-y-3">
                  <div className="flex items-center gap-2 border-b border-border pb-3">
                    <Tag className="h-5 w-5 text-indigo-brand" />
                    <h2 className="text-sm font-extrabold uppercase text-foreground">2. Specifications ({data.category})</h2>
                  </div>
                  <SpecForm
                    fields={fields}
                    values={data.specs ?? {}}
                    category={data.category}
                    onChange={(specs) => {
                      patch({ specs });
                      if (specs.Brand && specs.Brand !== selectedBrand) {
                        setSelectedBrand(specs.Brand);
                      }
                    }}
                  />
                </section>
              )}

              {/* 3. PHOTOS & COVER SELECTION */}
              <section className="rounded-3xl bg-card p-5 border border-border shadow-sm space-y-3">
                <div className="flex items-center gap-2 border-b border-border pb-3">
                  <ImageIcon className="h-5 w-5 text-indigo-brand" />
                  <h2 className="text-sm font-extrabold uppercase text-foreground">3. Photos & Video</h2>
                </div>
                <ImageUploader
                  images={data.images ?? []}
                  cover={data.cover ?? 0}
                  videoUrl={data.videoUrl || data.video}
                  onChange={(imgs) => patch({ images: imgs })}
                  onCover={(c) => patch({ cover: c })}
                  onVideoUrlChange={(v) => patch({ videoUrl: v, video: v })}
                />
                {errors.images && <p className="text-xs font-bold text-rose-600">{errors.images}</p>}
              </section>

              {/* 4. TITLE & AI SUGGESTIONS */}
              <section className="rounded-3xl bg-card p-5 border border-border shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <Wand2 className="h-5 w-5 text-indigo-brand" />
                    <h2 className="text-sm font-extrabold uppercase text-foreground">4. Title & AI Templates</h2>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-brand bg-indigo-brand/10 px-2.5 py-0.5 rounded-full">
                    ✨ AI Suggestions
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">Title</label>
                  <input
                    value={data.title ?? ""}
                    onChange={(e) => patch({ title: e.target.value })}
                    placeholder="e.g. MacBook Pro M2 16GB RAM 512GB SSD Space Grey"
                    className="w-full h-11 rounded-2xl border border-border bg-background px-4 text-sm font-semibold text-foreground outline-none focus:border-indigo-brand"
                  />
                  {errors.title && <p className="mt-1 text-xs font-bold text-rose-600">{errors.title}</p>}
                </div>

                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Click a suggested title to apply:
                  </span>
                  <div className="space-y-1.5">
                    {titleSuggestions.map((st, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => patch({ title: st })}
                        className="w-full text-left p-2.5 rounded-xl bg-secondary/50 border border-border text-xs font-medium text-foreground hover:bg-indigo-brand/10 hover:border-indigo-brand/30 transition-all flex items-center justify-between group"
                      >
                        <span className="truncate pr-2">{st}</span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-brand opacity-0 group-hover:opacity-100 transition-opacity">
                          <span>Apply</span>
                          <ArrowRight className="h-2.5 w-2.5" />
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              {/* 5. PRICE & CONDITION */}
              <section className="rounded-3xl bg-card p-5 border border-border shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-border pb-3">
                  <Tag className="h-5 w-5 text-indigo-brand" />
                  <h2 className="text-sm font-extrabold uppercase text-foreground">5. Price & Condition</h2>
                </div>

                <PriceInput
                  value={data.price}
                  negotiable={data.negotiable ?? true}
                  free={data.free ?? false}
                  onChange={(price) => patch({ price })}
                  onNegotiableChange={(negotiable) => patch({ negotiable })}
                  onFreeChange={(free) => patch({ free, price: free ? 0 : data.price })}
                />
                {errors.price && <p className="text-xs font-bold text-rose-600">{errors.price}</p>}

                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-2">Condition</label>
                  <ConditionSelector
                    value={(data.condition as Condition) ?? "good"}
                    onChange={(condition) => patch({ condition })}
                  />
                </div>
              </section>

              {/* 6. LOCATION & CONTACT (Location first so AI generator has exact area) */}
              <section className="rounded-3xl bg-card p-5 border border-border shadow-sm space-y-4">
                <h2 className="text-sm font-extrabold uppercase text-foreground border-b border-border pb-3">6. Location & Contact</h2>
                <LocationSelector
                  area={data.area ?? "Hitec City"}
                  pincode={data.pincode ?? "500081"}
                  city={data.city ?? "Hyderabad"}
                  onChange={(loc) => patch(loc)}
                />

                <ContactPreferenceSelector
                  pref={(data.contactPref as ContactPref) ?? "call_and_chat"}
                  bestTime={(data.bestContactTime as BestContactTime) ?? "anytime"}
                  sellerPhone={data.sellerPhone}
                  whatsappPhone={data.whatsappPhone}
                  enableWhatsapp={data.enableWhatsapp ?? true}
                  onPrefChange={(contactPref) => patch({ contactPref })}
                  onTimeChange={(bestContactTime) => patch({ bestContactTime })}
                  onSellerPhoneChange={(sellerPhone) => patch({ sellerPhone })}
                  onWhatsappPhoneChange={(whatsappPhone) => patch({ whatsappPhone })}
                  onEnableWhatsappChange={(enableWhatsapp) => patch({ enableWhatsapp })}
                />
              </section>

              {/* 7. NEARBY CHANGES & LOCAL BROADCAST */}
              <section className="rounded-3xl bg-card p-5 border border-border shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <Radio className="h-5 w-5 text-indigo-brand animate-pulse" />
                    <div>
                      <h2 className="text-sm font-extrabold uppercase text-foreground">7. Nearby Changes & Local Broadcast</h2>
                      <p className="text-[11px] text-muted-foreground">Alert nearby buyers and offer customized local delivery & radius terms</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={data.nearbyChanges?.enabled ?? false}
                      onChange={(e) => patch({
                        nearbyChanges: {
                          enabled: e.target.checked,
                          radiusKm: data.nearbyChanges?.radiusKm ?? 10,
                          deliveryFee: data.nearbyChanges?.deliveryFee ?? 0,
                          freeDeliveryAbove: data.nearbyChanges?.freeDeliveryAbove ?? 0,
                          customNote: data.nearbyChanges?.customNote ?? `Local pickup & delivery available in ${data.area || "nearby area"}`,
                          updatedAt: Date.now()
                        }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-brand"></div>
                  </label>
                </div>

                {data.nearbyChanges?.enabled && (
                  <div className="space-y-3 pt-2">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-muted-foreground mb-1">Nearby Broadcast Radius</label>
                        <select
                          value={data.nearbyChanges?.radiusKm ?? 10}
                          onChange={(e) => patch({
                            nearbyChanges: {
                              ...data.nearbyChanges!,
                              radiusKm: Number(e.target.value)
                            }
                          })}
                          className="w-full h-11 rounded-2xl border border-border bg-background px-3 text-xs font-bold text-foreground outline-none focus:border-indigo-brand cursor-pointer"
                        >
                          <option value={3}>Within 3 km (Immediate Neighborhood)</option>
                          <option value={5}>Within 5 km (Local Suburb)</option>
                          <option value={10}>Within 10 km (Standard City Radius)</option>
                          <option value={20}>Within 20 km (Greater Area)</option>
                          <option value={35}>Within 35 km (Entire Metro)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-muted-foreground mb-1">Nearby Delivery Fee (₹)</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={(data.nearbyChanges?.deliveryFee ?? 0) === 0 ? "" : data.nearbyChanges?.deliveryFee}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            const num = val === "" ? 0 : Math.max(0, parseInt(val, 10));
                            patch({
                              nearbyChanges: {
                                ...data.nearbyChanges!,
                                deliveryFee: num
                              }
                            });
                          }}
                          placeholder="0 (Free Delivery)"
                          className="w-full h-11 rounded-2xl border border-border bg-background px-3 text-xs font-bold text-foreground outline-none focus:border-indigo-brand"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-muted-foreground mb-1">Nearby Custom Note / Terms</label>
                      <input
                        type="text"
                        value={data.nearbyChanges?.customNote ?? ""}
                        onChange={(e) => patch({
                          nearbyChanges: {
                            ...data.nearbyChanges!,
                            customNote: e.target.value
                          }
                        })}
                        placeholder="e.g. Free doorstep inspection and handover in Madhapur/Kondapur"
                        className="w-full h-11 rounded-2xl border border-border bg-background px-4 text-xs font-medium text-foreground outline-none focus:border-indigo-brand"
                      />
                    </div>

                    <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-indigo-brand shrink-0" />
                      <span>Enabling Nearby Changes will alert nearby buyers in your area and display real-time updates on your user profile.</span>
                    </div>
                  </div>
                )}
              </section>

              {/* 8. DESCRIPTION & AI GENERATOR */}
              <section className="rounded-3xl bg-card p-5 border border-border shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h2 className="text-sm font-extrabold uppercase text-foreground">7. Description</h2>
                  <button
                    type="button"
                    onClick={handleGenerateAiDescription}
                    disabled={aiLoading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-brand to-purple-600 text-xs font-bold text-white shadow-sm hover:opacity-95 disabled:opacity-50"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>{aiLoading ? "Generating..." : "✨ Generate AI Description"}</span>
                  </button>
                </div>

                <textarea
                  rows={6}
                  value={data.description ?? ""}
                  onChange={(e) => patch({ description: e.target.value })}
                  placeholder="Provide complete item specs, usage history, warranty details..."
                  className="w-full rounded-2xl border border-border bg-background p-3.5 text-xs font-medium text-foreground outline-none focus:border-indigo-brand leading-relaxed"
                />
              </section>

              {/* SUBMIT BUTTON */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={publish}
                  disabled={publishing}
                  className={`w-full h-14 rounded-2xl bg-indigo-brand text-sm font-extrabold text-white shadow-xl flex items-center justify-center gap-2.5 transition-all ${
                    publishing ? "opacity-80 cursor-not-allowed" : "hover:opacity-95 hover:shadow-2xl active:scale-[0.99] cursor-pointer"
                  }`}
                >
                  {publishing ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Publishing Detailed Listing…</span>
                    </>
                  ) : (
                    <>
                      <ClipboardList className="h-5 w-5" />
                      <span>Publish Detailed Listing</span>
                    </>
                  )}
                </button>
              </div>

            </div>

            {/* ── RIGHT COLUMN: LIVE PREVIEW (STICKY DESKTOP) ── */}
            <div className="hidden lg:block lg:w-[42%] xl:w-[40%] sticky top-20 h-fit space-y-4">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-indigo-brand" />
                  <span className="text-xs font-extrabold uppercase tracking-wide text-foreground">Live Detailed Preview</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  Real-time Update
                </span>
              </div>

              {/* Product Detailed Card Preview */}
              <div className="rounded-3xl bg-card border border-border p-4 shadow-xl overflow-hidden space-y-3">
                <div className="relative aspect-video w-full rounded-2xl bg-secondary overflow-hidden border border-border">
                  {coverImg ? (
                    <img src={coverImg} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex flex-col items-center justify-center text-muted-foreground">
                      <ImageIcon className="h-8 w-8 mb-1 opacity-40" />
                      <span className="text-xs font-bold">No Cover Image</span>
                    </div>
                  )}
                  <span className="absolute top-3 left-3 bg-slate-950/80 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur">
                    {CONDITION_LABEL[(data.condition as Condition) || "good"]}
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-brand">{data.category || "Electronics"}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {data.area || "Hitec City"}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-foreground mt-0.5 line-clamp-2">
                    {data.title || "Your Detailed Listing Title Will Appear Here"}
                  </h3>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-xl font-black text-foreground">
                      {data.free ? "FREE" : data.price ? formatINR(data.price) : "₹ Price"}
                    </span>
                    {data.negotiable && !data.free && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded">Negotiable</span>
                    )}
                  </div>
                </div>

                {/* Specs Pill List */}
                {data.specs && Object.keys(data.specs).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {Object.entries(data.specs).map(([k, v]) => (
                      <span key={k} className="text-[10px] font-bold bg-secondary text-foreground px-2.5 py-1 rounded-lg border border-border">
                        {k}: {String(v)}
                      </span>
                    ))}
                  </div>
                )}

                <div className="p-3 rounded-2xl bg-secondary/50 text-xs text-muted-foreground space-y-1">
                  <div className="font-bold text-foreground">Seller: {data.sellerName || "You"}</div>
                  <div className="line-clamp-3 text-[11px] leading-relaxed">
                    {data.description || "Add specifications & details to display key highlights."}
                  </div>
                </div>

                <div className="pt-1 flex gap-2">
                  <button type="button" className="flex-1 h-10 rounded-xl bg-indigo-brand text-xs font-bold text-white flex items-center justify-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5" /> Chat Seller
                  </button>
                  <button type="button" className="h-10 px-3.5 rounded-xl border border-border text-xs font-bold text-foreground flex items-center justify-center">
                    <Phone className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Mobile Preview Modal */}
        {mobilePreviewOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="relative w-full max-w-md rounded-3xl bg-card p-5 border border-border space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-extrabold">Live Card Preview</span>
                <button type="button" onClick={() => setMobilePreviewOpen(false)} className="p-1 rounded-full hover:bg-secondary">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="relative aspect-video w-full rounded-2xl bg-secondary overflow-hidden border border-border">
                {coverImg ? (
                  <img src={coverImg} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex flex-col items-center justify-center text-muted-foreground">
                    <ImageIcon className="h-8 w-8 mb-1 opacity-40" />
                    <span className="text-xs font-bold">No Cover Image</span>
                  </div>
                )}
                <span className="absolute top-3 left-3 bg-slate-950/80 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                  {CONDITION_LABEL[(data.condition as Condition) || "good"]}
                </span>
              </div>

              <div>
                <h3 className="text-base font-extrabold text-foreground">{data.title || "Untitled Product"}</h3>
                <div className="mt-1 text-lg font-black text-foreground">
                  {data.free ? "FREE" : data.price ? formatINR(data.price) : "₹ Price"}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMobilePreviewOpen(false)}
                className="w-full h-11 rounded-2xl bg-indigo-brand text-xs font-bold text-white"
              >
                Close Preview
              </button>
            </div>
          </div>
        )}

        {/* Publishing Loading Overlay */}
        <LoadingOverlay open={publishing} label="Publishing Detailed Listing…" />

        {/* Missing Fields Pop-up Modal */}
        <MissingFieldsModal
          open={showMissingModal}
          onClose={() => setShowMissingModal(false)}
          missingItems={summary}
        />
      </div>
    </MobileFrame>
  );
}
