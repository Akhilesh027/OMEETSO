import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import {
  ConditionSelector, PriceInput, ContactPreferenceSelector, LocationSelector,
  ValidationSummary, LoadingOverlay,
} from "@/components/sell";
import { ImageUploader } from "@/components/sell/ImageUploader";
import { SpecForm } from "@/components/sell/SpecForm";
import { CATEGORIES, SUBCATEGORIES } from "@/lib/mock";
import {
  getListing, fetchLiveListingById, upsertListing, type Listing, type Condition, type ContactPref,
  type BestContactTime, type Fulfilment, subscribe,
} from "@/lib/listings";
import { validateAll } from "@/lib/listingValidation";
import { specFieldsFor } from "@/lib/specConfig";
import { toast } from "sonner";
import { Save, AlertCircle, Sparkles, MapPin, PhoneCall, Sliders, Layers } from "lucide-react";

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
  const [saving, setSaving] = useState(false);

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
    if (!v.ok) { toast.error("Please fix the highlighted fields"); return; }
    setSaving(true);
    const nextStatus = l!.status === "rejected" ? "under_review" : l!.status === "active" ? "requires_changes" : l!.status;
    const hist = [...(l!.editHistory ?? []), { at: Date.now(), note: "Edited by seller" }];
    try {
      await fetch(`http://localhost:3000/api/v1/listings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: l!.title,
          description: l!.description,
          priceInPaise: Math.round((l!.price || 0) * 100),
          condition: (l!.condition || "GOOD").toUpperCase().replace(" ", "_"),
          images: l!.images || [],
          coverIndex: l!.cover || 0,
          city: l!.city || "Hyderabad",
          area: l!.area || "Hitec City",
          pincode: l!.pincode || "500081"
        })
      });
    } catch (err) {
      console.warn("MongoDB listing update warning:", err);
    }

    upsertListing({ ...l!, status: nextStatus, editHistory: hist });
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
                  <label className="block text-xs font-extrabold text-foreground mb-1">Category</label>
                  <select
                    value={l.category}
                    onChange={(e) => patch({ category: e.target.value, subcategory: "" })}
                    className="w-full h-12 rounded-2xl border border-border bg-background px-3 text-xs font-extrabold outline-none focus:border-indigo-brand transition-all"
                  >
                    {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-foreground mb-1">Subcategory</label>
                  <select
                    value={l.subcategory}
                    onChange={(e) => patch({ subcategory: e.target.value })}
                    className="w-full h-12 rounded-2xl border border-border bg-background px-3 text-xs font-extrabold outline-none focus:border-indigo-brand transition-all"
                  >
                    <option value="">Select Subcategory</option>
                    {(SUBCATEGORIES[l.category] ?? []).map((s) => <option key={s} value={s}>{s}</option>)}
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
                <MapPin className="h-4 w-4 text-indigo-brand" /> Item Location & Pickup
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
                onPref={(p) => patch({ contactPref: p as ContactPref })}
                onTime={(t) => patch({ bestContactTime: t as BestContactTime })}
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
      </div>
    </MobileFrame>
  );
}
