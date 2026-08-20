import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { BackBar } from "@/components/omeetso/TopBar";
import {
  SectionTitle, ObjectiveCard, PlacementRow, BillingSummary,
  PreviewSponsoredCard, StepIndicator, ConfirmModal,
} from "@/components/omeetso/revenue";
import {
  CAMPAIGN_OBJECTIVES, PLACEMENTS, computeTotals, totalCredits, getWallet,
  upsertCampaign, saveCampaignDraft, deleteCampaignDraft, getCampaignDraft, getCampaign,
  newId, formatINR, seedRevenueIfEmpty, debitWallet, consumeCredits, addInvoice, getBilling,
  type Campaign, type PlacementId, type CampaignObjective, type CampaignCreative,
  type CampaignAudience, type CampaignSchedule, type CampaignSource,
} from "@/lib/revenue";
import { listListings } from "@/lib/listings";
import { listStores } from "@/lib/stores";
import { toast } from "sonner";
import { ChevronRight, Save, X, Bell, Package, Store as StoreIcon, Upload, Image as ImageIcon, MapPin, Users, Layers, Calendar } from "lucide-react";
import { createAdCampaignApi, submitAdCampaignApi } from "@/api/adCampaigns.api";
import { cn } from "@/lib/utils";

const STEPS = ["Objective", "Source", "Creative", "Audience", "Placement", "Budget", "Preview", "Pay & Submit"];

const AREAS_HYD = [
  { pin: "500081", area: "Madhapur" },
  { pin: "500084", area: "Kondapur" },
  { pin: "500032", area: "Gachibowli" },
  { pin: "500072", area: "Kukatpally" },
  { pin: "500016", area: "Ameerpet" },
  { pin: "500049", area: "Miyapur" },
  { pin: "500034", area: "Banjara Hills" },
];

const CATEGORIES = ["cars", "bikes", "mobiles", "electronics", "furniture", "properties", "fashion", "home_appliances", "services", "other"];
const INTENTS = [
  { id: "recent_views", label: "Recently viewed similar products" },
  { id: "searched", label: "Searched relevant category" },
  { id: "saved", label: "Saved related products" },
  { id: "followed_stores", label: "Followed related stores" },
] as const;

type S = { id?: string; step?: number };

export const Route = createFileRoute("/ads/new")({
  head: () => ({ meta: [{ title: "Create advertisement — Omeetso" }] }),
  validateSearch: (s: Record<string, unknown>): S => ({
    id: s.id as string | undefined,
    step: s.step ? Number(s.step) : undefined,
  }),
  component: NewCampaign,
});

function emptyCampaign(): Campaign {
  return {
    id: newId("CMP"), name: "", objective: "promote_product",
    source: { kind: "custom", advertiserBusiness: { name: "", contact: "" } },
    creative: { name: "", headline: "", description: "", cta: "View Product", advertiserDisplayName: "", destination: "product" },
    audience: { pincodes: [], areas: [], radiusKm: 5, categories: [], intents: [], languages: ["English"] },
    placements: [], schedule: { dailyBudget: 200, totalBudget: 1500, startAt: Date.now(), endAt: Date.now() + 7 * 86400000, startNow: true },
    frequency: { maxImpressionsPerUser: 3, maxClicksPerUser: 2, dailyFrequency: 1 },
    status: "draft", createdAt: Date.now(), updatedAt: Date.now(), amountSpent: 0,
    analytics: { impressions: 0, reach: 0, clicks: 0, ctr: 0, productViews: 0, storeVisits: 0, chats: 0, calls: 0, saves: 0, followers: 0, cpc: 0, cpChat: 0, cpCall: 0, budgetSpent: 0, remaining: 0, daily: [], byArea: [], byPlacement: [] },
    step: 1,
  };
}

function NewCampaign() {
  const search = useSearch({ from: "/ads/new" });
  const nav = useNavigate();
  const [c, setC] = useState<Campaign>(emptyCampaign());
  const [step, setStep] = useState(search.step ?? 1);
  const [confirmExit, setConfirmExit] = useState(false);
  const [busy, setBusy] = useState(false);
  const [agree, setAgree] = useState(false);
  const [payMethod, setPayMethod] = useState<"wallet" | "upi" | "card">("wallet");

  useEffect(() => {
    seedRevenueIfEmpty();
    if (search.id) {
      const draft = getCampaignDraft(search.id) ?? getCampaign(search.id);
      if (draft) { setC(draft); if (draft.step) setStep(draft.step); }
    }
  }, [search.id]);

  const set = <K extends keyof Campaign>(k: K, v: Campaign[K]) => setC((cur) => ({ ...cur, [k]: v, step }));
  const setCreative = (v: Partial<CampaignCreative>) => setC((cur) => ({ ...cur, creative: { ...cur.creative, ...v } }));
  const setAudience = (v: Partial<CampaignAudience>) => setC((cur) => ({ ...cur, audience: { ...cur.audience, ...v } }));
  const setSchedule = (v: Partial<CampaignSchedule>) => setC((cur) => ({ ...cur, schedule: { ...cur.schedule, ...v } }));

  useEffect(() => {
    if (step > 1) saveCampaignDraft({ ...c, step });
  }, [c, step]);

  const wallet = getWallet();
  const credits = totalCredits();
  const totals = useMemo(() => computeTotals(c.schedule.totalBudget, credits), [c.schedule.totalBudget, credits]);

  const listings = useMemo(() => listListings().filter((l) => l.status === "active"), []);
  const stores = useMemo(() => listStores().filter((s) => s.status === "active"), []);

  const validateStep = (): string | null => {
    if (step === 1 && !c.objective) return "Choose an objective";
    if (step === 3) {
      if (!c.creative.name.trim()) return "Campaign name is required";
      if (!c.creative.headline.trim() || c.creative.headline.length > 60) return "Headline required, max 60 characters";
      if (!c.creative.description.trim() || c.creative.description.length > 150) return "Description required, max 150 characters";
      if (!c.creative.advertiserDisplayName.trim()) return "Advertiser name required";
    }
    if (step === 4 && c.audience.areas.length === 0 && c.audience.pincodes.length === 0) return "Add at least one target area";
    if (step === 5 && c.placements.length === 0) return "Choose at least one placement";
    if (step === 6) {
      if (c.schedule.dailyBudget < 100) return "Minimum daily budget is ₹100";
      if (c.schedule.totalBudget < c.schedule.dailyBudget) return "Total budget must be at least the daily budget";
    }
    return null;
  };

  const next = () => {
    const e = validateStep();
    if (e) { toast.error(e); return; }
    setStep(step + 1);
  };

  const submit = async () => {
    if (busy) return;
    if (!agree) { toast.error("Please confirm the advertisement rules"); return; }
    setBusy(true);

    const paidVia = payMethod === "wallet" ? "Omeetso Wallet" : payMethod === "upi" ? "UPI" : "Card";
    const totalPay = totals.total;

    if (payMethod === "wallet") {
      const ok = debitWallet(totalPay, { title: `Advertisement — ${c.creative.name}`, type: "advertisement", campaignId: c.id, paymentMethod: paidVia });
      if (!ok) {
        setBusy(false);
        toast.error("Insufficient wallet balance. Please add funds using Razorpay.", {
          action: { label: "Recharge", onClick: () => nav({ to: "/add/wallet" }) }
        });
        return;
      }
    } else {
      await new Promise((r) => setTimeout(r, 700));
    }
    if (totals.credits > 0) consumeCredits(totals.credits);

    // Call Backend API to create & submit Ad Campaign in MongoDB
    try {
      const listingId = c.source.listingId || (listings[0]?.id) || "6a6af2695f035911ef30f094";
      const createRes = await createAdCampaignApi({
        listingId,
        adProductId: "6a6b0c6aabad5897fe847fad", // Popular Growth Boost Plan
        placementIds: c.placements && c.placements.length > 0 ? c.placements : ["SEARCH_TOP", "CATEGORY_FEATURED"],
        bannerUrl: c.creative.imageUrl
      });

      if (createRes.success && createRes.data?.id) {
        await submitAdCampaignApi(createRes.data.id);
      }
    } catch (err) {
      console.warn("Backend campaign save warning:", err);
    }

    const finalCampaign: Campaign = {
      ...c, status: "under_review", paymentId: newId("PAY"),
      updatedAt: Date.now(), step: undefined,
    };
    upsertCampaign(finalCampaign);
    deleteCampaignDraft(c.id);

    addInvoice({
      id: newId("INV"), number: `OMS/2026/${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: Date.now(), service: "Advertisement Campaign", campaignId: c.id,
      baseAmount: totals.baseAmount, tax: totals.gst, discount: 0, creditsUsed: totals.credits, total: totals.total,
      paymentMethod: paidVia, status: "paid", billing: getBilling(),
    });

    toast.success("🎉 Campaign submitted for admin review!");
    nav({ to: "/promotions" });
  };

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-32 md:mx-auto md:max-w-[720px] md:px-6">
        <div className="flex items-center justify-between px-4 pt-3">
          <button onClick={() => setConfirmExit(true)} className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-secondary" aria-label="Exit">
            <X className="h-5 w-5" />
          </button>
          <p className="text-sm font-bold">Create advertisement</p>
          <button onClick={() => { saveCampaignDraft({ ...c, step }); toast.success("Draft saved"); }}
            className="grid h-9 w-9 place-items-center rounded-full text-primary" aria-label="Save draft">
            <Save className="h-4 w-4" />
          </button>
        </div>
        <StepIndicator step={step} total={STEPS.length} labels={STEPS} />

        <div className="mt-4 px-4 space-y-3">
          {step === 1 && (
            <>
              <SectionTitle>Choose an objective</SectionTitle>
              {CAMPAIGN_OBJECTIVES.map((o) => (
                <ObjectiveCard key={o.id} label={o.label} description={o.description}
                  selected={c.objective === o.id} onSelect={() => set("objective", o.id as CampaignObjective)} />
              ))}
            </>
          )}

          {step === 2 && (
            <>
              <SectionTitle>Choose what to promote</SectionTitle>
              <SourceRow icon={Package} label="Personal listing" active={c.source.kind === "listing"}
                onSelect={() => set("source", { kind: "listing", refId: listings[0]?.id ?? "" } as CampaignSource)} />
              <SourceRow icon={StoreIcon} label="Store product" active={c.source.kind === "store_product"}
                onSelect={() => set("source", { kind: "store_product", refId: "", storeId: stores[0]?.id ?? "" } as CampaignSource)} />
              <SourceRow icon={StoreIcon} label="Store" active={c.source.kind === "store"}
                onSelect={() => set("source", { kind: "store", refId: stores[0]?.id ?? "" } as CampaignSource)} />
              <SourceRow icon={Upload} label="Custom advertisement" active={c.source.kind === "custom"}
                onSelect={() => set("source", { kind: "custom", advertiserBusiness: { name: "", contact: "" } } as CampaignSource)} />

              {c.source.kind === "listing" && (
                <div className="mt-2 space-y-1">
                  {listings.map((l) => (
                    <button key={l.id} onClick={() => set("source", { kind: "listing", refId: l.id })}
                      className={cn("flex w-full items-center gap-2 rounded-xl border p-2 text-left",
                        c.source.kind === "listing" && c.source.refId === l.id ? "border-primary bg-primary/5" : "border-border")}>
                      {l.images[0] && <img src={l.images[0]} alt={l.title} className="h-9 w-9 rounded object-cover" />}
                      <span className="text-xs font-semibold">{l.title}</span>
                    </button>
                  ))}
                </div>
              )}
              {c.source.kind === "store" && (
                <div className="mt-2 space-y-1">
                  {stores.map((s) => (
                    <button key={s.id} onClick={() => set("source", { kind: "store", refId: s.id })}
                      className={cn("flex w-full items-center gap-2 rounded-xl border p-2 text-left",
                        c.source.kind === "store" && c.source.refId === s.id ? "border-primary bg-primary/5" : "border-border")}>
                      {s.logo && <img src={s.logo} alt={s.name} className="h-9 w-9 rounded object-cover" />}
                      <span className="text-xs font-semibold">{s.name}</span>
                    </button>
                  ))}
                </div>
              )}
              {c.source.kind === "custom" && (
                <div className="space-y-2 rounded-2xl border border-border bg-card p-3">
                  <p className="text-[11px] font-bold uppercase text-muted-foreground">Advertiser business</p>
                  <Field label="Business name" value={c.source.advertiserBusiness.name}
                    onChange={(v) => set("source", { kind: "custom", advertiserBusiness: { ...(c.source as any).advertiserBusiness, name: v } })} />
                  <Field label="Contact number" value={c.source.advertiserBusiness.contact}
                    onChange={(v) => set("source", { kind: "custom", advertiserBusiness: { ...(c.source as any).advertiserBusiness, contact: v } })} />
                </div>
              )}
            </>
          )}

          {step === 3 && (
            <>
              <SectionTitle>Creative</SectionTitle>
              <Field label="Campaign name (internal)" value={c.creative.name}
                onChange={(v) => setCreative({ name: v })} />
              <Field label="Headline (max 60)" value={c.creative.headline} maxLength={60}
                onChange={(v) => setCreative({ headline: v })} />
              <Field label="Description (max 150)" value={c.creative.description} maxLength={150} multiline
                onChange={(v) => setCreative({ description: v })} />
              <Field label="Advertiser display name" value={c.creative.advertiserDisplayName}
                onChange={(v) => setCreative({ advertiserDisplayName: v })} />

              <p className="mt-1 text-[11px] font-semibold">CTA</p>
              <div className="flex flex-wrap gap-2">
                {(["View Product", "Visit Store", "Chat Now", "Call Now", "View Offer", "Learn More", "Get Directions"] as const).map((v) => (
                  <button key={v} onClick={() => setCreative({ cta: v })}
                    className={cn("rounded-full border px-3 py-1 text-xs font-semibold",
                      c.creative.cta === v ? "border-primary bg-primary/10 text-primary" : "border-border")}>
                    {v}
                  </button>
                ))}
              </div>

              <p className="mt-1 text-[11px] font-semibold">Destination</p>
              <div className="flex flex-wrap gap-2">
                {(["product", "store", "offer", "chat", "external"] as const).map((v) => (
                  <button key={v} onClick={() => setCreative({ destination: v })}
                    className={cn("rounded-full border px-3 py-1 text-xs font-semibold capitalize",
                      c.creative.destination === v ? "border-primary bg-primary/10 text-primary" : "border-border")}>
                    {v}
                  </button>
                ))}
              </div>
              {c.creative.destination === "external" && (
                <Field label="External URL (mock)" value={c.creative.externalUrl ?? ""}
                  onChange={(v) => setCreative({ externalUrl: v })} />
              )}

              <div className="mt-2 rounded-2xl border-2 border-dashed border-border bg-card p-3 text-center">
                {c.creative.imageUrl ? (
                  <img src={c.creative.imageUrl} alt={c.creative.headline || "Ad creative"} className="mx-auto aspect-square w-40 rounded-xl object-cover" />
                ) : (
                  <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground" />
                )}
                <p className="mt-1 text-[11px] text-muted-foreground">Recommended: 1:1 square, 16:9 landscape, 4:5 portrait</p>
                <div className="mt-2 flex justify-center gap-2">
                  <button onClick={() => setCreative({ imageUrl: `https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&h=800&q=80` })}
                    className="rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground">Use sample</button>
                  {c.creative.imageUrl && (
                    <button onClick={() => setCreative({ imageUrl: undefined })}
                      className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold">Remove</button>
                  )}
                </div>
                <p className="mt-2 text-[10px] text-muted-foreground">Large binaries are not stored locally. Real uploads will use hosted URLs.</p>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <SectionTitle>Audience</SectionTitle>

              <div className="rounded-2xl border border-border bg-card p-3">
                <p className="flex items-center gap-1 text-[11px] font-bold uppercase text-muted-foreground"><MapPin className="h-3 w-3" /> Location</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {AREAS_HYD.map((a) => {
                    const on = c.audience.areas.includes(a.area);
                    return (
                      <button key={a.pin} onClick={() =>
                        setAudience({
                          areas: on ? c.audience.areas.filter((x) => x !== a.area) : [...c.audience.areas, a.area],
                          pincodes: on ? c.audience.pincodes.filter((x) => x !== a.pin) : [...c.audience.pincodes, a.pin],
                        })}
                        className={cn("rounded-xl border p-2 text-left text-xs",
                          on ? "border-primary bg-primary/5" : "border-border")}>
                        <p className="font-bold">{a.area}</p>
                        <p className="text-[10px] text-muted-foreground">{a.pin}</p>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-[11px] font-semibold">Radius</p>
                <div className="mt-1 flex gap-2">
                  {[2, 5, 10, 20].map((r) => (
                    <button key={r} onClick={() => setAudience({ radiusKm: r })}
                      className={cn("rounded-full border px-3 py-1 text-xs font-semibold",
                        c.audience.radiusKm === r ? "border-primary bg-primary/10 text-primary" : "border-border")}>
                      {r} km
                    </button>
                  ))}
                  <button onClick={() => setAudience({ radiusKm: 999 })}
                    className={cn("rounded-full border px-3 py-1 text-xs font-semibold",
                      c.audience.radiusKm === 999 ? "border-primary bg-primary/10 text-primary" : "border-border")}>
                    City-wide
                  </button>
                </div>
                <div className="mt-2 rounded-xl bg-secondary/40 p-2 text-[11px] text-muted-foreground">
                  Estimated local audience: <b className="text-foreground">{Math.max(1, c.audience.areas.length) * 5000}–{Math.max(1, c.audience.areas.length) * 8000}</b> users (sample data)
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-3">
                <p className="flex items-center gap-1 text-[11px] font-bold uppercase text-muted-foreground"><Layers className="h-3 w-3" /> Categories</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => {
                    const on = c.audience.categories.includes(cat);
                    return (
                      <button key={cat} onClick={() => setAudience({
                        categories: on ? c.audience.categories.filter((x) => x !== cat) : [...c.audience.categories, cat],
                      })}
                        className={cn("rounded-full border px-3 py-1 text-xs font-semibold capitalize",
                          on ? "border-primary bg-primary/10 text-primary" : "border-border")}>
                        {cat.replace("_", " ")}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-3">
                <p className="flex items-center gap-1 text-[11px] font-bold uppercase text-muted-foreground"><Users className="h-3 w-3" /> Intent</p>
                <div className="mt-2 space-y-1">
                  {INTENTS.map((i) => {
                    const on = (c.audience.intents as string[]).includes(i.id);
                    return (
                      <label key={i.id} className="flex items-center gap-2 text-xs">
                        <input type="checkbox" checked={on} onChange={() => setAudience({
                          intents: on ? c.audience.intents.filter((x) => x !== i.id) : [...c.audience.intents, i.id as any],
                        })} />
                        {i.label}
                      </label>
                    );
                  })}
                </div>
                <p className="mt-2 text-[10px] text-muted-foreground">
                  Sample targeting options. Real behavioural data is not processed at this stage.
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-3">
                <p className="text-[11px] font-bold uppercase text-muted-foreground">Language</p>
                <div className="mt-2 flex gap-2">
                  {(["English", "Telugu", "Hindi"] as const).map((l) => {
                    const on = c.audience.languages.includes(l);
                    return (
                      <button key={l} onClick={() => setAudience({
                        languages: on ? c.audience.languages.filter((x) => x !== l) : [...c.audience.languages, l],
                      })}
                        className={cn("rounded-full border px-3 py-1 text-xs font-semibold",
                          on ? "border-primary bg-primary/10 text-primary" : "border-border")}>
                        {l}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {step === 5 && (
            <>
              <SectionTitle>Placement</SectionTitle>
              {PLACEMENTS.filter((p) => p.kind !== "promotion").map((p) => (
                <PlacementRow key={p.id} id={p.id}
                  selected={c.placements.includes(p.id)}
                  onToggle={() => set("placements", c.placements.includes(p.id) ? c.placements.filter((x) => x !== p.id) : [...c.placements, p.id])} />
              ))}
              <div className="rounded-2xl border border-border bg-card p-3 text-xs">
                <p className="font-bold flex items-center gap-1"><Bell className="h-3.5 w-3.5" /> Frequency capping</p>
                <p className="mt-1 text-[10px] text-muted-foreground">Max 3 impressions per user per day • No more than one large ad in the first Home viewport • Native ads after every 6–8 organic items.</p>
              </div>
            </>
          )}

          {step === 6 && (
            <>
              <SectionTitle>Budget & schedule</SectionTitle>
              <div className="rounded-2xl border border-border bg-card p-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Daily budget (₹)" type="number" value={String(c.schedule.dailyBudget)}
                    onChange={(v) => setSchedule({ dailyBudget: Number(v || 0) })} />
                  <Field label="Total budget (₹)" type="number" value={String(c.schedule.totalBudget)}
                    onChange={(v) => setSchedule({ totalBudget: Number(v || 0) })} />
                </div>
                <p className="text-[11px] font-semibold">Duration presets</p>
                <div className="flex flex-wrap gap-2">
                  {[3, 7, 15, 30].map((d) => (
                    <button key={d} onClick={() => setSchedule({ endAt: c.schedule.startAt + d * 86400000, totalBudget: c.schedule.dailyBudget * d })}
                      className="rounded-full border border-border px-3 py-1 text-xs font-semibold">{d} days</button>
                  ))}
                </div>
                <label className="flex items-center gap-2 text-xs">
                  <input type="checkbox" checked={c.schedule.startNow} onChange={(e) => setSchedule({ startNow: e.target.checked, startAt: Date.now() })} />
                  Start immediately
                </label>
              </div>
              <div className="rounded-2xl bg-secondary/40 p-3 text-xs">
                <p className="text-[10px] font-bold uppercase text-muted-foreground">Estimated performance</p>
                <p>Est. impressions: <b>{(c.schedule.totalBudget * 25).toLocaleString()}</b></p>
                <p>Est. clicks: <b>{Math.round(c.schedule.totalBudget * 1.4).toLocaleString()}</b></p>
                <p>Est. chats/calls: <b>{Math.round(c.schedule.totalBudget * 0.08)}</b></p>
                <p className="mt-1 text-[10px] text-muted-foreground">Frontend sample estimates only.</p>
              </div>
              <BillingSummary base={totals.baseAmount} tax={totals.gst} credits={totals.credits} total={totals.total} />
            </>
          )}

          {step === 7 && (
            <>
              <SectionTitle>Preview</SectionTitle>
              <p className="text-[11px] text-muted-foreground">Sample rendering across placements.</p>
              <PreviewSponsoredCard title={c.creative.headline || "Headline"} subtitle={c.creative.description}
                imageUrl={c.creative.imageUrl} cta={c.creative.cta} advertiser={c.creative.advertiserDisplayName || "Advertiser"} />
              <div className="rounded-2xl border border-border bg-card p-3 text-xs">
                <Row label="Objective" value={c.objective.replaceAll("_", " ")} />
                <Row label="Placements" value={c.placements.join(", ") || "—"} />
                <Row label="Areas" value={c.audience.areas.join(", ") || "—"} />
                <Row label="Categories" value={c.audience.categories.join(", ") || "—"} />
                <Row label="Budget" value={formatINR(c.schedule.totalBudget)} />
                <Row label="Schedule" value={`${new Date(c.schedule.startAt).toLocaleDateString("en-IN")} → ${new Date(c.schedule.endAt).toLocaleDateString("en-IN")}`} />
              </div>
              <ValidationSummary c={c} />
            </>
          )}

          {step === 8 && (
            <>
              <SectionTitle>Review & submit</SectionTitle>
              <div className="rounded-2xl border border-border bg-card p-3 text-xs space-y-1">
                <Row label="Campaign" value={c.creative.name || "Untitled"} />
                <Row label="Objective" value={c.objective.replaceAll("_", " ")} />
                <Row label="Destination" value={c.creative.destination} />
                <Row label="Placements" value={c.placements.length + " selected"} />
                <Row label="Areas" value={c.audience.areas.join(", ") || "—"} />
                <Row label="Categories" value={c.audience.categories.join(", ") || "—"} />
                <Row label="Total budget" value={formatINR(c.schedule.totalBudget)} />
              </div>

              <BillingSummary base={totals.baseAmount} tax={totals.gst} credits={totals.credits} total={totals.total} />

              <SectionTitle>Payment method</SectionTitle>
              <div className="space-y-2">
                {(["wallet", "upi", "card"] as const).map((m) => (
                  <button key={m} onClick={() => setPayMethod(m)}
                    className={cn("flex w-full items-center gap-2 rounded-2xl border p-3 text-left",
                      payMethod === m ? "border-primary bg-primary/5" : "border-border bg-card")}>
                    <span className="text-sm font-bold">
                      {m === "wallet" ? `Omeetso Wallet (${formatINR(wallet.balance)})` : m === "upi" ? "UPI" : "Card"}
                    </span>
                  </button>
                ))}
              </div>

              <label className="flex items-start gap-2 rounded-2xl border border-border bg-card p-3 text-xs">
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                <span>I confirm this advertisement follows Omeetso advertising rules.</span>
              </label>
            </>
          )}
        </div>

        <div className="fixed inset-x-0 bottom-0 z-10 mx-auto max-w-[430px] md:max-w-[720px] border-t border-border bg-card p-3 safe-b">
          <div className="flex items-center gap-2">
            {step > 1 && (
              <button onClick={() => setStep(step - 1)} className="rounded-full border border-border px-4 py-3 text-sm font-semibold">Back</button>
            )}
            {step < STEPS.length ? (
              <button onClick={next} className="flex-1 rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground">
                Continue <ChevronRight className="ml-1 inline h-4 w-4" />
              </button>
            ) : (
              <button onClick={submit} disabled={busy}
                className="flex-1 rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-70">
                {busy ? "Processing…" : `Pay & Submit ${formatINR(totals.total)}`}
              </button>
            )}
          </div>
        </div>

        <ConfirmModal open={confirmExit} title="Exit campaign creation?"
          body="Your progress is saved as a draft."
          confirmLabel="Save and exit" cancelLabel="Continue editing"
          onConfirm={() => { saveCampaignDraft({ ...c, step }); nav({ to: "/ads" }); }}
          onCancel={() => setConfirmExit(false)} />
      </div>
    </MobileFrame>
  );
}

function SourceRow({ icon: Ico, label, active, onSelect }: { icon: any; label: string; active: boolean; onSelect: () => void }) {
  return (
    <button onClick={onSelect} className={cn("flex w-full items-center gap-3 rounded-2xl border p-3 text-left",
      active ? "border-primary bg-primary/5" : "border-border bg-card")}>
      <div className={cn("grid h-9 w-9 place-items-center rounded-xl",
        active ? "bg-primary text-white" : "bg-primary/10 text-primary")}>
        <Ico className="h-4 w-4" />
      </div>
      <span className="text-sm font-bold">{label}</span>
    </button>
  );
}

function Field({ label, value, onChange, multiline, maxLength, type }: {
  label: string; value: string; onChange: (v: string) => void; multiline?: boolean; maxLength?: number; type?: string;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold">{label}</span>
      {multiline ? (
        <textarea rows={3} maxLength={maxLength} value={value} onChange={(e) => onChange(e.target.value)}
          className="mt-1 w-full rounded-2xl border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary" />
      ) : (
        <input type={type ?? "text"} maxLength={maxLength} value={value} onChange={(e) => onChange(e.target.value)}
          className="mt-1 w-full rounded-2xl border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary" />
      )}
      {maxLength && <span className="mt-0.5 block text-right text-[10px] text-muted-foreground">{value.length}/{maxLength}</span>}
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-0.5"><p className="text-[11px] text-muted-foreground">{label}</p><p className="text-xs font-semibold text-right">{value}</p></div>
  );
}

function ValidationSummary({ c }: { c: Campaign }) {
  const issues: string[] = [];
  if (!c.creative.headline) issues.push("Headline missing");
  if (!c.creative.description) issues.push("Description missing");
  if (c.placements.length === 0) issues.push("No placement selected");
  if (c.audience.areas.length === 0) issues.push("No audience area");
  if (issues.length === 0) return null;
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
      <p className="font-bold">Please fix before submitting:</p>
      <ul className="mt-1 list-disc pl-4">{issues.map((i) => <li key={i}>{i}</li>)}</ul>
    </div>
  );
}
