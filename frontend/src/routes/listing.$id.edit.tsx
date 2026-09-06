import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import {
  ConditionSelector, PriceInput, ContactPreferenceSelector, LocationSelector,
  ValidationSummary, LoadingOverlay, MissingFieldsModal, AddCategoryModal,
} from "@/components/sell";
import { ImageUploader } from "@/components/sell/ImageUploader";
import { SpecForm } from "@/components/sell/SpecForm";
import { CATEGORIES, SUBCATEGORIES } from "@/lib/mock";
import {
  fetchLiveCategories, getCachedCategories, getLiveSubcategories,
  subscribeCategories, type LiveCategory
} from "@/lib/categories";
import {
  getListing, fetchLiveListingById, upsertListing, type Listing, type Condition, type ContactPref,
  type BestContactTime, type Fulfilment, subscribe,
} from "@/lib/listings";
import { validateAll } from "@/lib/listingValidation";
import { specFieldsFor } from "@/lib/specConfig";
import { toast } from "sonner";
import { Save, AlertCircle, Sparkles, MapPin, PhoneCall, Sliders, Layers } from "lucide-react";
import { API_BASE } from "@/config/api";
import { pushNotification } from "@/lib/account";
import { getUserAccessToken } from "@/api/auth.api";

export const Route = createFileRoute("/listing/$id/edit")({
  head: () => ({ meta: [{ title: "Edit Listing — Omeetso" }] }),
  component: EditListing,
});

function EditListing() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  const [l, setL] = useState<Listing | undefined>(() => getListing(id));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [summary, setSummary] = useState<string[]>([]);
  const [showMissingModal, setShowMissingModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<LiveCategory[]>(() => getCachedCategories());
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);

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
    fetchLiveListingById(id).then((live) => {
      if (live) setL(live);
    }).catch(() => {
      const cached = getListing(id);
      if (cached) setL(cached);
    });

    const unsub = subscribe(() => setL(getListing(id)));
    return () => { unsub(); };
  }, [id]);

  const patch = (p: Partial<Listing>) => setL((prev) => prev ? { ...prev, ...p } : prev);

  const fields = useMemo(() => (l ? specFieldsFor(l.category) : []), [l]);

  if (!l) {
    return (
      <MobileFrame>
        <div className="min-h-dvh bg-background">
          <BackBar title="Edit Listing" />
          <div className="p-12 text-center text-sm text-muted-foreground flex flex-col items-center justify-center gap-3">
            <AlertCircle className="h-10 w-10 text-muted-foreground" />
            <p className="font-extrabold text-foreground text-base">Listing Not Found</p>
            <p className="text-xs">The requested listing is unavailable or has been deleted.</p>
          </div>
        </div>
      </MobileFrame>
    );
  }

  async function save() {
    const v = validateAll(l as Listing, { specs: true });
    setErrors(v.errors);
    setSummary(v.summary);
    if (!v.ok) {
      setShowMissingModal(true);
      return;
    }
    setSaving(true);
    const nextStatus = l!.status === "rejected" ? "under_review" : l!.status === "active" ? "requires_changes" : l!.status;
    const hist = [...(l!.editHistory ?? []), { at: Date.now(), note: "Edited by seller" }];
    try {
      const token = getUserAccessToken() || (typeof localStorage !== "undefined" ? localStorage.getItem("omeetso_user_token") : null);
      await fetch(`${API_BASE}/listings/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          title: l!.title,
          description: l!.description,
          priceInPaise: Math.round((l!.price || 0) * 100),
          negotiable: Boolean(l!.negotiable),
          pricingType: l!.negotiable ? "NEGOTIABLE" : "FIXED",
          condition: (l!.condition || "GOOD").toUpperCase().replace(" ", "_"),
          images: l!.images || [],
          coverIndex: l!.cover || 0,
          city: l!.city || "",
          area: l!.area || "",
          pincode: l!.pincode || "",
          whatsappPhone: l!.whatsappPhone || l!.sellerPhone || "",
          sellerPhone: l!.sellerPhone || l!.whatsappPhone || "",
          contactPref: l!.contactPref || "call_and_chat",
          bestContactTime: l!.bestContactTime || "anytime"
        })
      });
    } catch (err) {
      console.warn("MongoDB listing update warning:", err);
    }

    upsertListing({ ...l!, status: nextStatus, editHistory: hist });

    pushNotification({
      id: `listing-updated-${id}-${Date.now()}`,
      category: "listings",
      title: `Listing Updated: ${l!.title}`,
      body: `Your changes to "${l!.title}" have been saved.`,
      destination: `/product/${id}`,
      destinationLabel: "View Listing",
      read: false,
      time: Date.now(),
      thumbnail: l!.images?.[0]
    });

    if (l!.nearbyChanges?.enabled) {
      pushNotification({
        id: `nearby-updated-${id}-${Date.now()}`,
        category: "nearby_changes",
        title: `Nearby Changes: ${l!.title}`,
        body: `Nearby changes broadcast updated for "${l!.title}".`,
        destination: `/product/${id}`,
        destinationLabel: "View Listing",
        read: false,
        time: Date.now(),
        thumbnail: l!.images?.[0]
      });
    }

    setSaving(false);
    toast.success(
      nextStatus === "requires_changes"
        ? "Changes submitted to MongoDB for review."
        : "Listing changes saved successfully",
    );
    nav({ to: "/listing/$id/manage", params: { id } });
  }

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-32 font-sans">
        <BackBar title="Edit Listing" />

        <div className="p-4 md:mx-auto md:max-w-[1200px] md:grid md:grid-cols-[1.1fr_0.9fr] md:gap-8 md:p-6 space-y-5 md:space-y-0">

          {/* LEFT COLUMN - Media & Core Listing Fields */}
          <div className="space-y-5">

            {/* Image Uploader Card */}
            <div className="rounded-3xl border border-border bg-card p-5 shadow-sm space-y-3">
              <h2 className="text-xs font-extrabold uppercase tracking-wide text-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-brand" /> Product Photos & Cover
              </h2>
              <ImageUploader
                images={l.images}
                cover={l.cover}
                onChange={(imgs) => patch({ images: imgs })}
                onCover={(i) => patch({ cover: i })}
              />
            </div>

            {/* Basic Listing Info Card */}
            <div className="rounded-3xl border border-border bg-card p-5 shadow-sm space-y-4">
              <h2 className="text-xs font-extrabold uppercase tracking-wide text-foreground border-b border-border pb-3">
                Listing Details
              </h2>

              <div>
                <label className="block text-xs font-extrabold text-foreground mb-1">Product Title</label>
                <input
                  value={l.title}
                  maxLength={80}
                  onChange={(e) => patch({ title: e.target.value })}
                  placeholder="e.g. LG 4K Smart TV / Laptop — High Performance"
                  className="w-full h-12 rounded-2xl border border-border bg-background px-3.5 text-sm font-bold outline-none focus:border-indigo-brand focus:ring-2 focus:ring-indigo-brand/20 transition-all"
                />
                {errors.title && <p className="mt-1 text-[11px] font-bold text-rose-600">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-xs font-extrabold text-foreground mb-1">Pricing & Negotiation</label>
                <PriceInput
                  value={l.price}
                  negotiable={l.negotiable}
                  free={l.free}
                  onValue={(n) => patch({ price: n })}
                  onNegotiable={(b) => patch({ negotiable: b })}
                  onFree={(b) => patch({ free: b, price: b ? 0 : l.price })}
                  error={errors.price}
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-foreground mb-1">Item Condition</label>
                <ConditionSelector
                  value={l.condition}
                  onChange={(c) => patch({ condition: c as Condition })}
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-foreground mb-1">Detailed Description</label>
                <textarea
                  value={l.description}
                  rows={5}
                  maxLength={2000}
                  onChange={(e) => patch({ description: e.target.value })}
                  placeholder="Include details about item condition, usage duration, reason for selling, and accessories..."
                  className="w-full resize-none rounded-2xl border border-border bg-background p-3.5 text-xs font-semibold outline-none focus:border-indigo-brand focus:ring-2 focus:ring-indigo-brand/20 transition-all"
                />
                {errors.description && <p className="mt-1 text-[11px] font-bold text-rose-600">{errors.description}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-extrabold text-foreground">Category</label>
                    <button
                      type="button"
                      onClick={() => setShowAddCategoryModal(true)}
                      className="text-[11px] font-extrabold text-indigo-brand hover:underline cursor-pointer flex items-center gap-0.5"
                    >
                      + Add
                    </button>
                  </div>
                  <select
                    value={l.category}
                    onChange={(e) => {
                      const cat = e.target.value;
                      if (cat === "__new__") {
                        setShowAddCategoryModal(true);
                        return;
                      }
                      const subs = getLiveSubcategories(cat);
                      patch({ category: cat, subcategory: subs[0]?.id || "" });
                    }}
                    className="w-full h-12 rounded-2xl border border-border bg-background px-3 text-xs font-extrabold outline-none focus:border-indigo-brand transition-all"
                  >
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    <option value="__new__">➕ + Add New Category...</option>
                  </select>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-extrabold text-foreground">Subcategory</label>
                    <button
                      type="button"
                      onClick={() => {
                        const custom = window.prompt("Enter custom subcategory name:");
                        if (custom && custom.trim()) {
                          patch({ subcategory: custom.trim() });
                        }
                      }}
                      className="text-[11px] font-extrabold text-indigo-brand hover:underline cursor-pointer flex items-center gap-0.5"
                    >
                      + Custom
                    </button>
                  </div>
                  <select
                    value={l.subcategory}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "__custom__") {
                        const custom = window.prompt("Enter custom subcategory name:");
                        if (custom && custom.trim()) {
                          patch({ subcategory: custom.trim() });
                        }
                        return;
                      }
                      patch({ subcategory: val });
                    }}
                    className="w-full h-12 rounded-2xl border border-border bg-background px-3 text-xs font-extrabold outline-none focus:border-indigo-brand transition-all"
                  >
                    <option value="">Select Subcategory</option>
                    {getLiveSubcategories(l.category).map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
                    {l.subcategory && !getLiveSubcategories(l.category).some(s => s.id === l.subcategory || s.name === l.subcategory) && (
                      <option value={l.subcategory}>{l.subcategory}</option>
                    )}
                    <option value="__custom__">➕ + Add Custom Subcategory...</option>
                  </select>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN - Specs, Location & Preferences */}
          <div className="space-y-5">

            {/* Specifications Card */}
            <div className="rounded-3xl border border-border bg-card p-5 shadow-sm space-y-3">
              <h2 className="text-xs font-extrabold uppercase tracking-wide text-foreground flex items-center gap-2 border-b border-border pb-3">
                <Sliders className="h-4 w-4 text-indigo-brand" /> Item Specifications
              </h2>
              <SpecForm
                fields={fields}
                values={l.specs ?? {}}
                onChange={(specs) => patch({ specs })}
                errors={errors}
              />
            </div>

            {/* Location Card */}
            <div className="rounded-3xl border border-border bg-card p-5 shadow-sm space-y-3">
              <h2 className="text-xs font-extrabold uppercase tracking-wide text-foreground flex items-center gap-2 border-b border-border pb-3">
                <MapPin className="h-4 w-4 text-indigo-brand" /> Item Location
              </h2>
              <LocationSelector
                pincode={l.pincode}
                area={l.area}
                city={l.city}
                fulfilment={l.fulfilment}
                onPincode={(v) => patch({ pincode: v })}
                onArea={(v) => patch({ area: v })}
                onCity={(v) => patch({ city: v })}
                onFulfilment={(v) => patch({ fulfilment: v as Fulfilment })}
                error={errors}
              />
            </div>

            {/* Contact Preferences */}
            <div className="rounded-3xl border border-border bg-card p-5 shadow-sm space-y-3">
              <h2 className="text-xs font-extrabold uppercase tracking-wide text-foreground flex items-center gap-2 border-b border-border pb-3">
                <PhoneCall className="h-4 w-4 text-indigo-brand" /> Contact & Communication
              </h2>
              <ContactPreferenceSelector
                pref={l.contactPref}
                time={l.bestContactTime}
                whatsappPhone={l.whatsappPhone}
                enableWhatsapp={l.enableWhatsapp ?? true}
                sellerPhone={l.sellerPhone}
                onPref={(p) => patch({ contactPref: p as ContactPref })}
                onPrefChange={(p) => patch({ contactPref: p as ContactPref })}
                onTime={(t) => patch({ bestContactTime: t as BestContactTime })}
                onTimeChange={(t) => patch({ bestContactTime: t as BestContactTime })}
                onWhatsappPhoneChange={(v) => patch({ whatsappPhone: v })}
                onEnableWhatsappChange={(b) => patch({ enableWhatsapp: b })}
                onSellerPhoneChange={(v) => patch({ sellerPhone: v })}
              />
            </div>

            {summary.length > 0 && (
              <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 shadow-sm">
                <ValidationSummary items={summary} />
              </div>
            )}

            {/* Desktop Action Box */}
            <div className="hidden md:block rounded-3xl border border-border bg-card p-5 shadow-sm space-y-3">
              <button
                onClick={save}
                disabled={saving}
                className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-indigo-brand hover:opacity-95 text-sm font-extrabold text-white shadow-md disabled:opacity-70 transition-all"
              >
                <Save className="h-4 w-4" /> Save & Update Listing
              </button>
              <p className="text-center text-[11px] font-semibold text-muted-foreground">
                Updates sync directly with your live MongoDB database listing feed.
              </p>
            </div>
          </div>

        </div>

        {/* Mobile Floating Save Action */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-card/95 p-3.5 backdrop-blur safe-b shadow-lg">
          <button
            onClick={save}
            disabled={saving}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-indigo-brand hover:opacity-95 text-sm font-extrabold text-white shadow-md disabled:opacity-70 transition-all"
          >
            <Save className="h-4 w-4" /> Save Listing Changes
          </button>
        </div>

        <LoadingOverlay open={saving} label="Saving changes to MongoDB..." />

        {/* Missing Fields Pop-up Modal */}
        <MissingFieldsModal
          open={showMissingModal}
          onClose={() => setShowMissingModal(false)}
          missingItems={summary}
        />

        {/* Add New Category Modal */}
        <AddCategoryModal
          isOpen={showAddCategoryModal}
          onClose={() => setShowAddCategoryModal(false)}
          onCategoryAdded={(cat) => {
            const subs = getLiveSubcategories(cat.id);
            patch({ category: cat.id, subcategory: subs[0]?.id || "" });
          }}
        />
      </div>
    </MobileFrame>
  );
}
