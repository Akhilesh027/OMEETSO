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
  X
} from "lucide-react";
import { toast } from "sonner";

interface BoostAdWizardProps {
  listingId: string;
  listingTitle: string;
  listingImage?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export function BoostAdWizard({ listingId, listingTitle, listingImage, onClose, onSuccess }: BoostAdWizardProps) {
  const [step, setStep] = useState<"SELECT_TYPE" | "SELECT_PRODUCT" | "CREATIVE_UPLOAD" | "REVIEW_PAY" | "CONFIRMATION">("SELECT_TYPE");
  const [campaignType, setCampaignType] = useState<"LISTING_BOOST" | "BANNER_AD">("LISTING_BOOST");
  const [products, setProducts] = useState<AdProductItem[]>([]);
  const [placements, setPlacements] = useState<AdPlacementItem[]>([]);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<AdProductItem | null>(null);

  // Banner Upload State
  const [bannerUrl, setBannerUrl] = useState<string>("");
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
      setBannerUrl(listingImage);
    }
    setStep("CREATIVE_UPLOAD");
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
      toast.error(sRes.error || "Wallet hold settlement failed");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in-50 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-xl text-primary font-bold">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Boost & Ad Campaign Wizard</h3>
              <p className="text-xs text-muted-foreground truncate max-w-[240px]">{listingTitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-muted-foreground hover:bg-secondary">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* STEP 1: CAMPAIGN TYPE */}
        {step === "SELECT_TYPE" && (
          <div className="space-y-4">
            <p className="text-xs font-semibold text-muted-foreground">Select your promotional objective:</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setCampaignType("LISTING_BOOST");
                  setStep("SELECT_PRODUCT");
                }}
                className={`p-4 rounded-2xl border-2 text-left space-y-2 transition-all ${
                  campaignType === "LISTING_BOOST"
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="p-2 bg-blue-100 text-[#3547D4] w-fit rounded-xl">
                  <Rocket className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">Listing Boost</h4>
                  <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                    Promote your product card to top search spots with a SPONSORED badge.
                  </p>
                </div>
              </button>

              <button
                onClick={() => {
                  setCampaignType("BANNER_AD");
                  setStep("SELECT_PRODUCT");
                }}
                className={`p-4 rounded-2xl border-2 text-left space-y-2 transition-all ${
                  campaignType === "BANNER_AD"
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="p-2 bg-amber-100 text-amber-900 w-fit rounded-xl">
                  <ImageIcon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">Custom Banner Ad</h4>
                  <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                    Upload custom banner creative for Omeetso Homepage Hero & Category slots.
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: SELECT PRODUCT */}
        {step === "SELECT_PRODUCT" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                Available {campaignType === "LISTING_BOOST" ? "Boost Plans" : "Banner Packages"}
              </span>
              <button onClick={() => setStep("SELECT_TYPE")} className="text-xs font-bold text-primary underline">
                Change Type
              </button>
            </div>

            {loadingConfig ? (
              <div className="p-8 text-center text-xs text-muted-foreground flex justify-center items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" /> Loading pricing plans...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground bg-secondary/50 rounded-2xl">
                No active packages available for this category right now.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {filteredProducts.map((p) => {
                  const total = Math.round(p.priceInPaise * 1.18);
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleSelectProduct(p)}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                        selectedProduct?.id === p.id
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border hover:border-primary/40 bg-card"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h5 className="text-sm font-bold text-foreground">{p.name}</h5>
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full">
                            {p.durationDays} Days
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">{p.description}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-bold text-primary">₹{(total / 100).toLocaleString("en-IN")}</div>
                        <div className="text-[9px] text-muted-foreground font-mono">incl. 18% GST</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* STEP 3: CREATIVE UPLOAD (FOR BANNER_AD) */}
        {step === "CREATIVE_UPLOAD" && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-foreground">Upload Custom Banner Creative</h4>
              <p className="text-xs text-muted-foreground">
                Upload custom banner (Recommended: 16:9 ratio, min 1600×900px, max 3MB).
              </p>
            </div>

            <div className="border-2 border-dashed border-border rounded-2xl p-6 text-center space-y-3 bg-secondary/20">
              {bannerUrl ? (
                <div className="space-y-2">
                  <img src={bannerUrl} alt="Banner Preview" className="max-h-40 w-full object-cover rounded-xl border border-border shadow-sm" />
                  <button
                    onClick={() => setBannerUrl("")}
                    className="text-xs font-bold text-red-600 underline"
                  >
                    Remove & Upload Different Image
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer block space-y-2">
                  <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                    <Upload className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-primary hover:underline">Click to browse banner file</span>
                    <p className="text-[10px] text-muted-foreground">PNG, JPG or WEBP up to 3MB</p>
                  </div>
                  <input type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" />
                </label>
              )}
            </div>

            <div className="flex justify-between pt-2">
              <button onClick={() => setStep("SELECT_PRODUCT")} className="text-xs font-bold text-muted-foreground">
                Back
              </button>
              <button
                disabled={!bannerUrl}
                onClick={() => setStep("REVIEW_PAY")}
                className="px-5 py-2.5 text-xs font-bold bg-primary text-primary-foreground rounded-xl hover:opacity-90 disabled:opacity-40"
              >
                Continue to Review
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: REVIEW & WALLET HOLD SETTLEMENT */}
        {step === "REVIEW_PAY" && selectedProduct && (
          <div className="space-y-4">
            {/* Ad Image Preview Card */}
            <div className="p-3.5 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/5 via-yellow-500/5 to-amber-500/5 space-y-2">
              <span className="text-[10px] font-black uppercase text-amber-600 tracking-wider">
                Ad Creative Preview
              </span>
              <div className="flex gap-3 items-center">
                {(bannerUrl || listingImage) ? (
                  <img
                    src={bannerUrl || listingImage}
                    alt="Ad Creative Preview"
                    className="h-16 w-28 rounded-xl object-cover border border-border shadow-sm shrink-0"
                  />
                ) : (
                  <div className="h-16 w-28 rounded-xl bg-muted flex items-center justify-center text-xs text-muted-foreground shrink-0">
                    No Image
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h5 className="text-xs font-bold text-foreground line-clamp-1">{listingTitle}</h5>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Image selected for live placements ({selectedProduct.permittedPlacements.join(", ")})</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-secondary/50 border border-border space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span>Selected Plan:</span>
                <span className="text-primary">{selectedProduct.name}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Duration:</span>
                <span>{selectedProduct.durationDays} Days</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Placements:</span>
                <span className="font-mono">{selectedProduct.permittedPlacements.join(", ")}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between text-sm font-bold text-foreground">
                <span>Total Amount:</span>
                <span className="text-primary">
                  ₹{(Math.round(selectedProduct.priceInPaise * 1.18) / 100).toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 shrink-0 text-amber-700 mt-0.5" />
              <div>
                <p className="font-bold">Wallet Hold Guarantee</p>
                <p className="text-[11px] text-amber-800 leading-snug">
                  Funds will be reserved from your Omeetso Wallet. If admin rejects your campaign during review, your reserved funds are automatically restored.
                </p>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button onClick={() => setStep("SELECT_PRODUCT")} className="text-xs font-bold text-muted-foreground">
                Back
              </button>
              <button
                disabled={submitting}
                onClick={handleProceedToPayment}
                className="px-6 py-2.5 text-xs font-bold bg-primary text-primary-foreground rounded-xl hover:opacity-90 disabled:opacity-40 flex items-center gap-2"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Confirm & Reserve Wallet Hold
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: CONFIRMATION */}
        {step === "CONFIRMATION" && (
          <div className="text-center py-4 space-y-4">
            <div className="mx-auto w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-bold text-foreground">Campaign Submitted!</h4>
              <p className="text-xs text-muted-foreground">
                Your ad campaign has been submitted and entered the 24-Hour Admin Review Queue.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-secondary/50 border border-border text-xs space-y-1 text-left">
              <div className="flex items-center gap-1.5 font-bold text-foreground">
                <Clock className="h-4 w-4 text-primary" />
                <span>24-Hour Review SLA Deadline:</span>
              </div>
              <p className="text-muted-foreground font-mono text-[11px] pl-5">
                {reviewDeadline ? new Date(reviewDeadline).toLocaleString() : "Within 24 Hours"}
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 text-xs font-bold bg-primary text-primary-foreground rounded-xl hover:opacity-90"
            >
              Done & Return to Listing
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
