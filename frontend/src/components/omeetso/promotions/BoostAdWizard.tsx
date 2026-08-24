import React, { useState, useEffect } from "react";
import {
  getAdProductsApi,
  getAdPlacementsApi,
  createAdCampaignApi,
  submitAdCampaignApi,
  type AdProductItem,
  type AdPlacementItem
} from "@/api/adCampaigns.api";
import {
  Zap,
  Rocket,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Loader2,
  Upload,
  AlertCircle,
  X,
  Sparkles,
  Eye,
  TrendingUp,
  MessageCircle,
  Phone,
  Check,
  ChevronRight,
  ArrowLeft,
  Star,
  Info
} from "lucide-react";
import { toast } from "sonner";
import { formatINR } from "@/lib/mock";

interface BoostAdWizardProps {
  listingId: string;
  listingTitle: string;
  listingImage?: string;
  listingPrice?: number;
  listingArea?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export function BoostAdWizard({
  listingId,
  listingTitle,
  listingImage,
  listingPrice,
  listingArea,
  onClose,
  onSuccess
}: BoostAdWizardProps) {
  const [step, setStep] = useState<"SELECT_TYPE" | "SELECT_PRODUCT" | "PREVIEW_CREATIVE" | "REVIEW_PAY" | "CONFIRMATION">("SELECT_TYPE");
  const [campaignType, setCampaignType] = useState<"LISTING_BOOST" | "BANNER_AD">("LISTING_BOOST");
  const [products, setProducts] = useState<AdProductItem[]>([]);
  const [placements, setPlacements] = useState<AdPlacementItem[]>([]);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<AdProductItem | null>(null);

  // Creative Image State
  const [bannerUrl, setBannerUrl] = useState<string>(listingImage || "");
  const [uploadingImage, setUploadingImage] = useState(false);

  // Submission State
  const [createdCampaignId, setCreatedCampaignId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [reviewDeadline, setReviewDeadline] = useState<string | null>(null);

  useEffect(() => {
    async function loadConfig() {
      setLoadingConfig(true);
      const [pRes, plRes] = await Promise.all([getAdProductsApi(), getAdPlacementsApi()]);
      setLoadingConfig(false);

      if (pRes.success && pRes.data) {
        setProducts(pRes.data);
      }
      if (plRes.success && plRes.data) {
        setPlacements(plRes.data);
      }
    }
    loadConfig();
  }, []);

  const filteredProducts = products.filter((p) => p.campaignType === campaignType);

  const handleSelectProduct = (product: AdProductItem) => {
    setSelectedProduct(product);
    if (!bannerUrl) {
      setBannerUrl(listingImage || "");
    }
    setStep("PREVIEW_CREATIVE");
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      toast.error("File size exceeds 3MB limit.");
      return;
    }

    setUploadingImage(true);
    const reader = new FileReader();
    reader.onload = () => {
      setBannerUrl(reader.result as string);
      setUploadingImage(false);
    };
    reader.readAsDataURL(file);
  };

  const handleProceedToPayment = async () => {
    if (!selectedProduct) return;
    setSubmitting(true);

    const finalImage = bannerUrl || listingImage;

    // 1. Create Draft Campaign
    const cRes = await createAdCampaignApi({
      listingId,
      adProductId: selectedProduct.id,
      placementIds: selectedProduct.permittedPlacements,
      bannerUrl: finalImage
    });

    if (!cRes.success || !cRes.data) {
      setSubmitting(false);
      toast.error(cRes.error || "Failed to create ad campaign");
      return;
    }

    const campaignId = cRes.data.id;
    setCreatedCampaignId(campaignId);

    // 2. Submit Campaign & Reserve Wallet Hold
    const sRes = await submitAdCampaignApi(campaignId);
    setSubmitting(false);

    if (sRes.success && sRes.data) {
      setReviewDeadline(sRes.data.reviewDeadlineAt);
      setStep("CONFIRMATION");
      if (onSuccess) onSuccess();
    } else {
      toast.error(sRes.error || "Wallet hold settlement failed. Please recharge wallet.");
    }
  };

  const stepOrder = ["SELECT_TYPE", "SELECT_PRODUCT", "PREVIEW_CREATIVE", "REVIEW_PAY", "CONFIRMATION"];
  const currentStepIdx = stepOrder.indexOf(step);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in-50">
      <div className="bg-card border border-border rounded-3xl max-w-xl w-full p-5 sm:p-6 space-y-4.5 shadow-2xl relative overflow-hidden max-h-[92vh] overflow-y-auto">
        
        {/* Background glow mesh */}
        <div className="absolute -top-20 -right-20 h-48 w-48 rounded-full bg-primary/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/80 pb-3 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-primary to-indigo-600 text-white font-bold shadow-xs">
              <Rocket className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-foreground">Boost Your Listing</h3>
              <p className="text-xs text-muted-foreground truncate max-w-[260px] font-medium">
                {listingTitle || "Product Promotion Wizard"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Visual 4-Step Indicator Bar */}
        {step !== "CONFIRMATION" && (
          <div className="space-y-1.5 pt-1">
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { label: "Goal", id: "SELECT_TYPE" },
                { label: "Plan", id: "SELECT_PRODUCT" },
                { label: "Preview", id: "PREVIEW_CREATIVE" },
                { label: "Activate", id: "REVIEW_PAY" }
              ].map((s, idx) => {
                const isPassed = currentStepIdx >= idx;
                const isCurrent = currentStepIdx === idx;
                return (
                  <div key={s.id} className="space-y-1 text-center">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        isPassed ? "bg-primary shadow-xs" : "bg-muted"
                      }`}
                    />
                    <span
                      className={`text-[10px] font-bold block ${
                        isCurrent ? "text-primary font-black" : isPassed ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {idx + 1}. {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 1: SELECT CAMPAIGN OBJECTIVE */}
        {/* ========================================================================= */}
        {step === "SELECT_TYPE" && (
          <div className="space-y-4 pt-1">
            <div className="space-y-1">
              <h4 className="text-sm font-extrabold text-foreground">How do you want to promote your item?</h4>
              <p className="text-xs text-muted-foreground">
                Choose the promotional format that best matches your sales goal.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Option A: Listing Boost */}
              <button
                type="button"
                onClick={() => {
                  setCampaignType("LISTING_BOOST");
                  setStep("SELECT_PRODUCT");
                }}
                className="p-4.5 rounded-2xl border-2 border-border/80 hover:border-primary bg-card hover:bg-primary/5 text-left space-y-3 transition-all hover:scale-101 active:scale-99 shadow-xs group"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2.5 bg-indigo-500/10 text-primary rounded-xl group-hover:bg-primary group-hover:text-white transition-colors">
                    <Zap className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    ⚡ Instant Setup
                  </span>
                </div>
                <div>
                  <h5 className="text-sm font-black text-foreground group-hover:text-primary transition-colors">
                    Listing Search Boost
                  </h5>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Pin your card to the <strong>#1 search rank</strong> with a shiny SPONSORED badge and reach 5× more buyers in your neighborhood.
                  </p>
                </div>
                <div className="pt-2 border-t border-border flex items-center justify-between text-xs font-bold text-primary">
                  <span>From ₹99 for 3 Days</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </button>

              {/* Option B: Custom Banner Ad */}
              <button
                type="button"
                onClick={() => {
                  setCampaignType("BANNER_AD");
                  setStep("SELECT_PRODUCT");
                }}
                className="p-4.5 rounded-2xl border-2 border-border/80 hover:border-amber-500 bg-card hover:bg-amber-500/5 text-left space-y-3 transition-all hover:scale-101 active:scale-99 shadow-xs group"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2.5 bg-amber-500/10 text-amber-600 rounded-xl group-hover:bg-amber-500 group-hover:text-white transition-colors">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                    👑 Brand Billboard
                  </span>
                </div>
                <div>
                  <h5 className="text-sm font-black text-foreground group-hover:text-amber-600 transition-colors">
                    Homepage Hero Banner
                  </h5>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Showcase a high-impact banner on the <strong>Main Homepage Carousel</strong> or category header to build authority and drive massive traffic.
                  </p>
                </div>
                <div className="pt-2 border-t border-border flex items-center justify-between text-xs font-bold text-amber-600">
                  <span>From ₹499 for 7 Days</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </button>
            </div>

            {/* Explanatory Info Box */}
            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 text-xs space-y-1 text-muted-foreground flex items-start gap-2.5">
              <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-foreground">100% Money-Back Guarantee:</span> If your campaign is rejected or canceled, your reserved wallet funds are instantly restored with zero deduction.
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: SELECT PRICING PLAN */}
        {/* ========================================================================= */}
        {step === "SELECT_PRODUCT" && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-extrabold text-foreground">
                  Select {campaignType === "LISTING_BOOST" ? "Search Boost Duration" : "Banner Package"}
                </h4>
                <p className="text-xs text-muted-foreground">Pick the duration and reach that fits your budget.</p>
              </div>
              <button
                type="button"
                onClick={() => setStep("SELECT_TYPE")}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
              >
                <ArrowLeft className="h-3 w-3" /> Change Goal
              </button>
            </div>

            {loadingConfig ? (
              <div className="p-12 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-2 bg-muted/20 rounded-2xl border border-border">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span>Loading latest plans & pricing...</span>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground bg-muted/20 rounded-2xl border border-border space-y-2">
                <AlertCircle className="h-6 w-6 text-amber-500 mx-auto" />
                <p className="font-bold text-foreground">No active plans available right now.</p>
                <p>Please check back shortly or try selecting a different promotion type.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {filteredProducts.map((p) => {
                  const total = Math.round(p.priceInPaise * 1.18);
                  const price = Math.round(p.priceInPaise / 100);
                  const originalPrice = p.originalPriceInPaise ? Math.round(p.originalPriceInPaise / 100) : 0;
                  const discount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
                  const isSelected = selectedProduct?.id === p.id;
                  const perDay = p.durationDays > 0 ? Math.round(price / p.durationDays) : price;

                  return (
                    <div
                      key={p.id}
                      onClick={() => handleSelectProduct(p)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all space-y-3 ${
                        isSelected
                          ? "border-primary bg-primary/5 ring-2 ring-primary/30 shadow-md scale-101"
                          : "border-border/90 hover:border-primary/50 bg-card hover:bg-muted/20"
                      }`}
                    >
                      {/* Top Row: Title, Badge, Price */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h5 className="text-sm font-black text-foreground">{p.name}</h5>
                            {p.badge && (
                              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 border border-rose-500/20">
                                {p.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{p.description}</p>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="flex items-baseline gap-1.5 justify-end">
                            <span className="text-lg font-black text-primary">₹{price.toLocaleString("en-IN")}</span>
                            {originalPrice > price && (
                              <span className="text-xs font-semibold text-muted-foreground line-through">
                                ₹{originalPrice.toLocaleString("en-IN")}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-muted-foreground font-medium">
                            ≈ ₹{perDay}/day · {p.durationDays} Days
                          </div>
                          {discount > 0 && (
                            <span className="inline-block mt-1 text-[9px] font-extrabold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                              SAVE {discount}%
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Reach Metric & Duration Highlight */}
                      <div className="flex items-center justify-between text-xs pt-2 border-t border-border/60">
                        <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span>Active for <strong>{p.durationDays} Days</strong></span>
                        </span>
                        {p.estimatedReach && (
                          <span className="text-[11px] font-bold text-foreground bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20 flex items-center gap-1">
                            <Eye className="h-3 w-3 text-primary" /> {p.estimatedReach}
                          </span>
                        )}
                      </div>

                      {/* Feature Checklist */}
                      {Array.isArray(p.features) && p.features.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                          {p.features.map((feat, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 text-[11px] text-foreground/85">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                              <span className="truncate">{feat}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: LIVE CREATIVE & CARD PREVIEW */}
        {/* ========================================================================= */}
        {step === "PREVIEW_CREATIVE" && selectedProduct && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-extrabold text-foreground">Live Ad Preview</h4>
                <p className="text-xs text-muted-foreground">
                  See exactly how your boosted card will appear to buyers across Omeetso.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep("SELECT_PRODUCT")}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
              >
                <ArrowLeft className="h-3 w-3" /> Change Plan
              </button>
            </div>

            {/* Interactive Live Card Preview */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/5 via-card to-amber-500/5 border-2 border-primary/30 space-y-3 shadow-md">
              <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground">
                <span className="flex items-center gap-1 text-primary">
                  <Sparkles className="h-3.5 w-3.5" /> Buyer Search Preview
                </span>
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full font-extrabold text-[10px]">
                  Rank #1 Priority
                </span>
              </div>

              {/* Mock Product Card with SPONSORED Badge */}
              <div className="bg-card border border-primary/40 rounded-2xl p-3 shadow-sm flex gap-3.5 items-center">
                <div className="relative h-20 w-24 rounded-xl overflow-hidden shrink-0 border border-border shadow-xs">
                  <img
                    src={bannerUrl || listingImage || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400"}
                    alt="Listing Preview"
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute top-1 left-1 bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-xs flex items-center gap-0.5">
                    <Zap className="h-2.5 w-2.5 fill-slate-950" /> SPONSORED
                  </span>
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-black text-primary">
                      {listingPrice ? formatINR(listingPrice) : "₹4,33,443"}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-semibold">Negotiable</span>
                  </div>
                  <h5 className="text-xs font-extrabold text-foreground line-clamp-1">{listingTitle}</h5>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <span>{listingArea || "Ward 78 Gunfoundry, Hyderabad"}</span> · <span>0.6 km</span>
                  </p>
                </div>
              </div>
            </div>

            {/* For Banner Ads: Allow custom image upload */}
            {campaignType === "BANNER_AD" && (
              <div className="space-y-2 pt-1">
                <label className="text-xs font-bold text-foreground block">
                  Customize Banner Image (Optional)
                </label>
                <div className="border-2 border-dashed border-border rounded-2xl p-4 text-center bg-muted/20 space-y-2">
                  {uploadingImage ? (
                    <div className="p-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" /> Uploading image...
                    </div>
                  ) : (
                    <label className="cursor-pointer block space-y-1">
                      <Upload className="h-5 w-5 text-primary mx-auto" />
                      <div className="text-xs font-bold text-primary hover:underline">
                        Upload custom 16:9 banner creative
                      </div>
                      <p className="text-[10px] text-muted-foreground">PNG, JPG, or WEBP up to 3MB</p>
                      <input type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" />
                    </label>
                  )}
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep("SELECT_PRODUCT")}
                className="px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep("REVIEW_PAY")}
                className="px-6 py-2.5 text-xs font-extrabold bg-primary hover:bg-primary/90 text-white rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                Continue to Review <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: REVIEW & WALLET HOLD SETTLEMENT */}
        {/* ========================================================================= */}
        {step === "REVIEW_PAY" && selectedProduct && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h4 className="text-sm font-extrabold text-foreground">Review & Confirm Activation</h4>
              <p className="text-xs text-muted-foreground">
                Review your order details before activating the campaign.
              </p>
            </div>

            {/* Order Summary Box */}
            <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-medium">Listing Item:</span>
                <span className="font-bold text-foreground truncate max-w-[200px]">{listingTitle}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-medium">Selected Plan:</span>
                <span className="font-extrabold text-primary">{selectedProduct.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-medium">Active Duration:</span>
                <span className="font-bold text-foreground">{selectedProduct.durationDays} Days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-medium">Estimated Buyer Reach:</span>
                <span className="font-bold text-emerald-600">{selectedProduct.estimatedReach || "5,000+ Buyers"}</span>
              </div>
              <div className="border-t border-border/80 pt-2.5 flex justify-between items-baseline">
                <div>
                  <span className="text-sm font-black text-foreground">Total Hold Amount:</span>
                  <div className="text-[10px] text-muted-foreground">Includes 18% GST</div>
                </div>
                <span className="text-xl font-black text-primary">
                  ₹{(Math.round(selectedProduct.priceInPaise * 1.18) / 100).toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Wallet Hold Explanation */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-300 text-xs flex items-start gap-2.5">
              <ShieldCheck className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold">Instant Activation & Wallet Guarantee</p>
                <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-400">
                  The amount will be held in your Omeetso Wallet. Once approved by moderation within 24 hours, your boost goes live immediately. If rejected, 100% of your money is refunded instantly.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep("PREVIEW_CREATIVE")}
                className="px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground"
              >
                Back
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleProceedToPayment}
                className="px-6 py-3 text-xs font-black bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Confirm & Activate Boost
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 5: CONFIRMATION SUCCESS */}
        {/* ========================================================================= */}
        {step === "CONFIRMATION" && (
          <div className="text-center py-4 space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center justify-center font-bold shadow-xs">
              <CheckCircle2 className="h-9 w-9" />
            </div>

            <div className="space-y-1">
              <h4 className="text-lg font-black text-foreground">Boost Activated Successfully!</h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                Your listing promotion has been submitted and queued for priority delivery across search results and category grids.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-muted/40 border border-border text-xs space-y-2 text-left">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <Clock className="h-4 w-4 text-primary" />
                <span>Review SLA Time:</span>
              </div>
              <p className="text-muted-foreground text-[11px] pl-6">
                Live moderation approval within: <strong className="text-foreground">{reviewDeadline ? new Date(reviewDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "24 Hours"}</strong>
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 text-xs font-black bg-primary text-white rounded-xl hover:bg-primary/90 shadow-md transition-all"
            >
              Done & View My Listing
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
