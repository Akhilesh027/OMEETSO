import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import {
  ConditionSelector, PriceInput, ContactPreferenceSelector,
  LocationSelector, ConfirmModal, LoadingOverlay,
} from "@/components/sell";
import { ImageUploader } from "@/components/sell/ImageUploader";
import { SpecForm } from "@/components/sell/SpecForm";
import { CATEGORIES, SUBCATEGORIES, getSubcategoriesForCategory } from "@/lib/mock";
import { specFieldsFor } from "@/lib/specConfig";
import {
  type Listing, type Condition, type ContactPref, type BestContactTime, type Fulfilment,
  newId, upsertListing, saveDraft as saveDraftFn, LS, formatINR,
  CONDITION_LABEL, getSellerPrefs,
} from "@/lib/listings";
import { getTrustScore } from "@/lib/account";
import { uploadImageToCloudinary } from "@/lib/upload";
import {
  validateBasic, validateMedia, validateCategory,
  validateLocation, validateContact, validateSpecs,
} from "@/lib/listingValidation";
import { BRANDS_BY_CATEGORY, generateTitleSuggestions, generateAiDescription } from "@/lib/aiAssistance";
import { toast } from "sonner";
import {
  Sparkles, ClipboardList, ShieldCheck, MapPin, Tag, Eye,
  Wand2, Image as ImageIcon, Layers, Phone, MessageSquare, CheckCircle2, X
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
    city: "Hyderabad", area: "Hitec City", pincode: "500081",
    category: "electronics", subcategory: "laptops", condition: "good",
    specs: {}
  });
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [summary, setSummary] = useState<string[]>([]);
  const [publishing, setPublishing] = useState(false);
  const [confirmed, setConfirmed] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [storeId, setStoreId] = useState<string | undefined>();
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);

  useEffect(() => {
    const d = loadDraft();
    const seller = getSellerPrefs();
    const selStore = typeof localStorage !== "undefined" ? localStorage.getItem("omeetso_selected_store") : null;
    let locArea = "Hitec City";
    let locCity = "Hyderabad";
    let locPin = "500081";

    try {
      const rawLoc = localStorage.getItem("omeetso_location") || localStorage.getItem("omeetso_selected_location");
      if (rawLoc) {
        const loc = JSON.parse(rawLoc);
        if (loc.area) {
          const parts = loc.area.split(",").map((p: string) => p.trim());
          locArea = parts[0] || locArea;
          if (parts[1]) locCity = parts[1];
        }
        if (loc.pincode) locPin = loc.pincode;
      }
    } catch { }

    setData((prev) => ({
      area: locArea,
      city: locCity,
      pincode: locPin,
      ...prev,
      sellerName: seller.name || "You",
      sellerPhone: seller.phone,
      sellerType: seller.type ?? "individual",
      ...d,
    }));
    if (selStore) setStoreId(selStore);
  }, []);

  const patch = (p: Partial<Listing>) => setData((d) => ({ ...d, ...p }));

  const categoryBrands = useMemo(() => {
    const cat = (data.category || "electronics").toLowerCase();
    return BRANDS_BY_CATEGORY[cat] || BRANDS_BY_CATEGORY["electronics"];
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
    if (sums.length > 0) { toast.error("Please complete required fields"); return; }
    if (!confirmed) { toast.error("Please confirm the listing declaration"); return; }

    const guest = typeof localStorage !== "undefined" && localStorage.getItem("omeetso_guest_session");
    const user = typeof localStorage !== "undefined" && localStorage.getItem("omeetso_user");
    if (guest && !user) {
      toast.info("Sign in to publish your listing", { action: { label: "Sign in", onClick: () => nav({ to: "/login" }) } });
      return;
    }
    if (getTrustScore() < 35) {
      toast.error("Please verify your mobile number or upload KYC documents before listing");
      nav({ to: "/verification" });
      return;
    }
    setPublishing(true);
    const uploadedImages = await Promise.all(
      (data.images || []).map((img) => uploadImageToCloudinary(img, "listings"))
    );
    const now = Date.now();
    const id = newId();
    const listing: Listing = {
      id, title: data.title!, price: data.price ?? 0, negotiable: !!data.negotiable, free: !!data.free,
      condition: (data.condition ?? "good") as Condition,
      description: data.description || "Detailed spec product listing",
      category: data.category!, subcategory: data.subcategory!,
      images: uploadedImages, cover: data.cover ?? 0,
      video: data.videoUrl || data.video,
      videoUrl: data.videoUrl || data.video,
      whatsappPhone: data.whatsappPhone,
      enableWhatsapp: data.enableWhatsapp ?? true,
      pincode: data.pincode || "500081", area: data.area || "Hitec City", city: data.city || "Hyderabad", state: data.state,
      fulfilment: (data.fulfilment ?? "pickup") as Fulfilment,
      specs: data.specs ?? {},
      contactPref: (data.contactPref ?? "call_and_chat") as ContactPref,
      bestContactTime: (data.bestContactTime ?? "anytime") as BestContactTime,
      sellerName: data.sellerName ?? "You", sellerPhone: data.sellerPhone,
      sellerType: data.sellerType ?? "individual",
      status: "under_review", createdAt: now, updatedAt: now, method: "detailed",
      storeId: storeId,
      storeMeta: storeId ? { stockStatus: "in_stock" } : undefined,
    };

    try {
      const token = typeof localStorage !== "undefined" ? localStorage.getItem("omeetso_user_token") : null;
      await fetch("http://localhost:3000/api/v1/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          title: data.title,
          description: data.description || "Detailed product listing via Omeetso User Portal",
          priceInPaise: Math.round((data.price || 0) * 100),
          pricingType: data.negotiable ? "NEGOTIABLE" : "FIXED",
          condition: (data.condition || "good").toLowerCase().replace(" ", "_"),
          categoryId: data.category || "electronics",
          subcategoryId: data.subcategory || data.category || "electronics",
          images: uploadedImages && uploadedImages.length > 0 ? uploadedImages : ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400"],
          coverIndex: data.cover || 0,
          videoUrl: data.videoUrl || data.video,
          whatsappPhone: data.whatsappPhone,
          enableWhatsapp: data.enableWhatsapp ?? true,
          city: data.city || "Hyderabad",
          area: data.area || "Hitec City",
          pincode: data.pincode || "500081",
          specs: data.specs || {}
        })
      });
    } catch (err) {
      console.warn("MongoDB listing save warning:", err);
    }

    upsertListing(listing);
    localStorage.removeItem(DRAFT_KEY);
    setPublishing(false);
    toast.success("Detailed listing submitted! Awaiting Admin approval.");
    nav({ to: "/listings" });
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
                      value={data.category ?? "electronics"}
                      onChange={(e) => {
                        const cat = e.target.value;
                        patch({ category: cat, subcategory: SUBCATEGORIES[cat]?.[0]?.id || cat, specs: {} });
                        setSelectedBrand("");
                      }}
                      className="w-full h-11 rounded-2xl border border-border bg-background px-3 text-xs font-bold text-foreground outline-none focus:border-indigo-brand"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1">Subcategory</label>
                    <select
                      value={data.subcategory ?? ""}
                      onChange={(e) => patch({ subcategory: e.target.value, specs: {} })}
                      className="w-full h-11 rounded-2xl border border-border bg-background px-3 text-xs font-bold text-foreground outline-none focus:border-indigo-brand"
                    >
                      {getSubcategoriesForCategory(data.category ?? "electronics").map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Brand Selection Dropdown & Popular Pills */}
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1.5">Brand / Manufacturer</label>
                  <select
                    value={selectedBrand}
                    onChange={(e) => {
                      const b = e.target.value;
                      setSelectedBrand(b);
                      patch({ specs: { ...(data.specs || {}), Brand: b } });
                    }}
                    className="w-full h-11 rounded-2xl border border-border bg-background px-3 text-xs font-bold text-foreground outline-none focus:border-indigo-brand mb-2"
                  >
                    <option value="">Select Brand…</option>
                    {categoryBrands.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                    <option value="Other">Other / Custom Brand</option>
                  </select>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {categoryBrands.map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => {
                          const nextB = b === selectedBrand ? "" : b;
                          setSelectedBrand(nextB);
                          patch({ specs: { ...(data.specs || {}), Brand: nextB } });
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${selectedBrand === b
                          ? "bg-indigo-brand text-white border-indigo-brand shadow-sm"
                          : "bg-secondary/70 text-foreground border-border hover:bg-secondary"
                          }`}
                      >
                        {b}
                      </button>
                    ))}
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
                    onChange={(specs) => patch({ specs })}
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
                        <span className="text-[10px] font-bold text-indigo-brand opacity-0 group-hover:opacity-100 transition-opacity">Apply →</span>
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
                  whatsappPhone={data.whatsappPhone}
                  enableWhatsapp={data.enableWhatsapp ?? true}
                  onPrefChange={(contactPref) => patch({ contactPref })}
                  onTimeChange={(bestContactTime) => patch({ bestContactTime })}
                  onWhatsappPhoneChange={(whatsappPhone) => patch({ whatsappPhone })}
                  onEnableWhatsappChange={(enableWhatsapp) => patch({ enableWhatsapp })}
                />
              </section>

              {/* 7. DESCRIPTION & AI GENERATOR */}
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
                  className="w-full h-14 rounded-2xl bg-indigo-brand text-sm font-extrabold text-white shadow-xl hover:opacity-95 flex items-center justify-center gap-2"
                >
                  <ClipboardList className="h-5 w-5" />
                  <span>Publish Detailed Listing</span>
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
      </div>
    </MobileFrame>
  );
}
