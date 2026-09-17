import { useState, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft, Upload, Plus, Trash2, ShieldCheck, Sparkles, CheckCircle2,
  Wrench, Building, Home, MapPin, IndianRupee, Clock, Check, AlertCircle,
  Camera, Loader2, Image as ImageIcon, Star, X, Eye, Phone, Award, ShieldAlert
} from "lucide-react";
import { SERVICE_CATEGORIES, ServiceItem, getLocalServices, saveLocalServices } from "@/lib/services";
import { createServiceApi } from "@/api/services.api";
import { uploadFile } from "@/lib/upload";
import { pushNotification } from "@/lib/account";
import { toast } from "sonner";
import { preventNonNumericKeyDown, sanitizeNumericInput, formatPhoneDisplay, cleanPhoneInput } from "@/lib/utils";

export const SERVICE_GUARANTEE_OPTIONS = [
  "30 Days Service Guarantee",
  "60 Days Repair Warranty",
  "90 Days Comprehensive Guarantee",
  "180 Days Extended Warranty",
  "1 Year Service Guarantee",
  "100% Satisfaction or Free Re-service",
  "Damage-Free Workmanship Guarantee",
  "Money-Back Service Guarantee",
  "Genuine Spare Parts Guarantee",
  "Zero Hidden Charges Guarantee",
  "No Fix No Fee Guarantee",
  "7 Days Complete Refund Guarantee",
  "Custom Guarantee"
];

export const RESPONSE_TIME_OPTIONS = [
  "Within 30 Mins (Express)",
  "Within 60 Mins",
  "Within 2 Hours",
  "Same Day Service (Within 4-6 Hours)",
  "Next Day Service",
  "24/7 Emergency Assistance",
  "Appointment Only",
  "Custom Response Time"
];

export function PostServiceForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Form State
  const [businessName, setBusinessName] = useState("");
  const [providerName, setProviderName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [serviceCategoryId, setServiceCategoryId] = useState(SERVICE_CATEGORIES[0].id);
  const [subcategoryId, setSubcategoryId] = useState(SERVICE_CATEGORIES[0].subcategories[0]?.name || "General");
  const [serviceType, setServiceType] = useState<"DOORSTEP" | "AT_CENTER" | "ONLINE" | "HYBRID">("DOORSTEP");

  // Pricing
  const [priceType, setPriceType] = useState<any>("STARTING_AT");
  const [amount, setAmount] = useState<number | string>(499);
  const [discountPrice, setDiscountPrice] = useState<number | string>("");
  const [priceUnit, setPriceUnit] = useState<any>("per service");
  const [isNegotiable, setIsNegotiable] = useState(false);

  // Location
  const [area, setArea] = useState("Madhapur");
  const [city, setCity] = useState("Hyderabad");
  const [pincode, setPincode] = useState("500081");
  const [serviceRadiusKm, setServiceRadiusKm] = useState(25);
  const [servesAreasInput, setServesAreasInput] = useState("Madhapur, Hitec City, Gachibowli, Kondapur, Jubilee Hills");

  // Details
  const [description, setDescription] = useState("");
  const [experienceYears, setExperienceYears] = useState(5);
  const [guaranteedResponseTime, setGuaranteedResponseTime] = useState("Within 60 Mins");
  const [warranty, setWarranty] = useState("30 Days Service Guarantee");
  const [customWarranty, setCustomWarranty] = useState("");
  const [customResponseTime, setCustomResponseTime] = useState("");
  const [workingHours, setWorkingHours] = useState("08:00 AM - 08:00 PM");
  const [isEmergency, setIsEmergency] = useState(false);

  // Listing Flow & Validation State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showMissingModal, setShowMissingModal] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [termsAccepted, setTermsAccepted] = useState(true);

  // Inclusions & Exclusions
  const [inclusions, setInclusions] = useState<string[]>([
    "Thorough inspection and diagnosis",
    "Complete labor charges for the standard service",
    "Post-service cleanup & test run"
  ]);
  const [newInclusion, setNewInclusion] = useState("");

  const [exclusions, setExclusions] = useState<string[]>([
    "Cost of replacement spare parts",
    "Major electrical cabling replacement"
  ]);
  const [newExclusion, setNewExclusion] = useState("");

  // Images state & upload
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeCategory = SERVICE_CATEGORIES.find((c) => c.id === serviceCategoryId) || SERVICE_CATEGORIES[0];

  const handleAddInclusion = () => {
    if (newInclusion.trim()) {
      setInclusions([...inclusions, newInclusion.trim()]);
      setNewInclusion("");
    }
  };

  const handleRemoveInclusion = (index: number) => {
    setInclusions(inclusions.filter((_, i) => i !== index));
  };

  const handleAddExclusion = () => {
    if (newExclusion.trim()) {
      setExclusions([...exclusions, newExclusion.trim()]);
      setNewExclusion("");
    }
  };

  const handleRemoveExclusion = (index: number) => {
    setExclusions(exclusions.filter((_, i) => i !== index));
  };

  const handleImageFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (images.length + files.length > 8) {
      toast.error("You can upload a maximum of 8 photos for a service listing");
      return;
    }

    setUploadingImages(true);
    try {
      const uploadedUrls = await Promise.all(
        files.map(async (file) => {
          try {
            return await uploadFile(file, "services");
          } catch {
            return new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve(String(reader.result));
              reader.readAsDataURL(file);
            });
          }
        })
      );

      setImages((prev) => [...prev, ...uploadedUrls]);
      toast.success(`${files.length} photo(s) uploaded successfully!`);
    } catch {
      toast.error("Failed to upload some images");
    } finally {
      setUploadingImages(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSetCoverImage = (index: number) => {
    if (index === 0) return;
    const picked = images[index];
    const rest = images.filter((_, i) => i !== index);
    setImages([picked, ...rest]);
    toast.success("Main cover photo updated!");
  };

  const finalWarranty = warranty === "Custom Guarantee" && customWarranty.trim()
    ? customWarranty.trim()
    : warranty;

  const finalResponseTime = guaranteedResponseTime === "Custom Response Time" && customResponseTime.trim()
    ? customResponseTime.trim()
    : guaranteedResponseTime;

  // Validation function enforcing complete listing flow requirements
  const validateServiceDetails = (): { isValid: boolean; missing: string[] } => {
    const missing: string[] = [];
    if (!title.trim() || title.trim().length < 6) {
      missing.push("Service Title (minimum 6 characters)");
    }
    if (!businessName.trim()) {
      missing.push("Business / Organization Name");
    }
    if (!providerName.trim()) {
      missing.push("Primary Contact / Provider Name");
    }
    const cleanPhone = cleanPhoneInput(phone);
    if (!cleanPhone || cleanPhone.length < 10) {
      missing.push("Valid 10-digit Contact Phone Number");
    }
    if (!amount || Number(amount) <= 0) {
      missing.push("Valid Service Base Price (greater than ₹0)");
    }
    if (!city.trim()) {
      missing.push("City");
    }
    if (!area.trim()) {
      missing.push("Area / Locality");
    }
    const cleanPin = pincode.replace(/\D/g, "");
    if (!cleanPin || cleanPin.length < 6) {
      missing.push("Valid 6-digit Pincode");
    }
    if (!description.trim() || description.trim().length < 20) {
      missing.push("Detailed Service Description (minimum 20 characters)");
    }
    if (images.length === 0) {
      missing.push("At least 1 Service Work Photo or Cover Image");
    }

    return { isValid: missing.length === 0, missing };
  };

  // Step 1: Trigger validation before publishing
  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    const { isValid, missing } = validateServiceDetails();
    if (!isValid) {
      setMissingFields(missing);
      setShowMissingModal(true);
      return;
    }
    setShowReviewModal(true);
  };

  // Step 2: Final confirmation and publishing
  const handleConfirmPublish = async () => {
    if (!termsAccepted) {
      toast.error("Please accept the Omeetso Service Standards & Terms");
      return;
    }

    setLoading(true);
    try {
      const servesAreasList = servesAreasInput
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean);

      const coverImg = images.length > 0
        ? images[0]
        : "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80";

      const newService: ServiceItem = {
        id: `srv-${Date.now()}`,
        providerId: "user-provider-current",
        businessName: businessName.trim(),
        providerName: providerName.trim() || businessName.trim(),
        avatar: coverImg,
        phone: cleanPhoneInput(phone),
        email: email.trim(),
        isVerifiedProvider: true,
        providerBadge: "Verified Service Pro",
        title: title.trim(),
        serviceCategoryId,
        subcategoryId,
        serviceType,
        pricing: {
          priceType,
          amount: Number(amount),
          discountPrice: discountPrice ? Number(discountPrice) : undefined,
          priceUnit,
          isNegotiable,
        },
        location: {
          area: area.trim(),
          city: city.trim(),
          pincode: pincode.trim(),
          serviceRadiusKm: Number(serviceRadiusKm),
          servesAreas: servesAreasList,
        },
        serviceDetails: {
          description: description.trim(),
          inclusions,
          exclusions,
          images: images.length > 0 ? images : [coverImg],
          experienceYears: Number(experienceYears),
          guaranteedResponseTime: finalResponseTime,
          warranty: finalWarranty,
        },
        availability: {
          workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
          workingHours,
          emergencyServiceAvailable: isEmergency,
        },
        status: "PENDING_APPROVAL",
        isFeatured: false,
        isEmergency,
        stats: {
          viewsCount: 1,
          inquiriesCount: 0,
          bookingsCount: 0,
          rating: 5.0,
          reviewsCount: 0,
        },
        createdAt: Date.now(),
      };

      let finalServiceId = `srv-${Date.now()}`;

      // Try API with auth header, fallback to local storage
      try {
        const apiRes = await createServiceApi(newService as any);
        if (apiRes && apiRes.success && apiRes.data) {
          finalServiceId = (apiRes.data as any).id || (apiRes.data as any)._id || finalServiceId;
        }
      } catch (apiErr) {
        console.warn("Service create API warning:", apiErr);
      }

      const finalItem: ServiceItem = {
        ...newService,
        id: finalServiceId,
      };

      const current = getLocalServices();
      saveLocalServices([finalItem, ...current]);

      // Push notification for user activity
      pushNotification({
        title: "Service Submitted for Approval",
        body: `"${finalItem.title}" has been submitted and is pending admin approval.`,
        category: "moderation",
        destination: `/service/${finalServiceId}`,
        destinationLabel: "View Service",
        thumbnail: coverImg
      });

      setShowReviewModal(false);
      toast.success("Service submitted successfully for admin review & approval!");
      navigate({ to: "/service/$id", params: { id: finalServiceId } });
    } catch (err: any) {
      toast.error(err.message || "Failed to publish service");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      {/* Back Button & Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => history.back()}
          className="grid h-10 w-10 place-items-center rounded-full bg-secondary hover:bg-surface-2 transition text-foreground cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <div className="flex items-center gap-1.5 text-xs font-black uppercase text-primary tracking-wider">
            <Sparkles className="h-3.5 w-3.5 fill-primary" /> Omeetso Services Vertical
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-foreground">List a Professional Service</h1>
        </div>
      </div>

      <form onSubmit={handleProceedToReview} className="space-y-6">
        {/* Step 1: Category & Subcategory */}
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h2 className="text-base font-extrabold text-foreground flex items-center gap-2">
            <Wrench className="h-4 w-4 text-primary" /> 1. Service Category & Delivery Mode
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Primary Category *</label>
              <select
                value={serviceCategoryId}
                onChange={(e) => {
                  const catId = e.target.value;
                  setServiceCategoryId(catId);
                  const found = SERVICE_CATEGORIES.find((c) => c.id === catId);
                  if (found && found.subcategories.length > 0) {
                    setSubcategoryId(found.subcategories[0].name);
                  }
                }}
                className="w-full rounded-2xl border border-border bg-surface-1 px-4 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
              >
                {SERVICE_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Subcategory Specialization *</label>
              <select
                value={subcategoryId}
                onChange={(e) => setSubcategoryId(e.target.value)}
                className="w-full rounded-2xl border border-border bg-surface-1 px-4 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
              >
                {activeCategory.subcategories.map((sub) => (
                  <option key={sub.id} value={sub.name}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">Delivery Mode *</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: "DOORSTEP", label: "Doorstep", icon: Home, desc: "Visit client location" },
                { id: "AT_CENTER", label: "At Shop", icon: Building, desc: "Clients visit you" },
                { id: "ONLINE", label: "Online", icon: Sparkles, desc: "Remote / Video call" },
                { id: "HYBRID", label: "Hybrid", icon: CheckCircle2, desc: "Both Home & Shop" },
              ].map(({ id, label, icon: Icon, desc }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setServiceType(id as any)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition ${
                    serviceType === id
                      ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                      : "border-border bg-surface-1 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5 mb-1" />
                  <span className="text-xs font-extrabold">{label}</span>
                  <span className="text-[10px] opacity-75">{desc}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Step 2: Provider Details */}
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h2 className="text-base font-extrabold text-foreground flex items-center gap-2">
            <Building className="h-4 w-4 text-primary" /> 2. Business & Contact Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Business / Brand Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Apex Home Solutions & Repairs"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full rounded-2xl border border-border bg-surface-1 px-4 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Provider / Lead Contact Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Rajesh Kumar"
                value={providerName}
                onChange={(e) => setProviderName(e.target.value)}
                className="w-full rounded-2xl border border-border bg-surface-1 px-4 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Verified Contact Mobile (10 digits) *</label>
              <input
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={phone ? formatPhoneDisplay(phone) : ""}
                onKeyDown={(e) => preventNonNumericKeyDown(e)}
                onChange={(e) => setPhone(cleanPhoneInput(e.target.value))}
                className="w-full rounded-2xl border border-border bg-surface-1 px-4 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Official Business Email</label>
              <input
                type="email"
                placeholder="contact@apexrepairs.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-border bg-surface-1 px-4 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        </section>

        {/* Step 3: Service Details & Images */}
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h2 className="text-base font-extrabold text-foreground flex items-center gap-2">
            <Camera className="h-4 w-4 text-primary" /> 3. Service Details & Photos
          </h2>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">Service Listing Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Professional Split AC Deep Foam Jet Cleaning & Gas Refill"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-2xl border border-border bg-surface-1 px-4 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">Service Description *</label>
            <textarea
              required
              rows={4}
              placeholder="Describe your expertise, standard workflow, equipment used, and why clients should choose your service..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-2xl border border-border bg-surface-1 p-3.5 text-xs text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          {/* Photo Gallery Uploader */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-foreground">
                Work Photos & Certificates ({images.length}/8) *
              </label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImages || images.length >= 8}
                className="text-xs font-extrabold text-primary hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <Plus className="h-3.5 w-3.5" /> Add Photos
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageFilesUpload}
              className="hidden"
            />

            {images.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-border bg-surface-2 group">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    {idx === 0 && (
                      <span className="absolute top-1.5 left-1.5 bg-primary text-primary-foreground text-[10px] font-black px-2 py-0.5 rounded-md shadow-sm">
                        Cover
                      </span>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {idx !== 0 && (
                        <button
                          type="button"
                          onClick={() => handleSetCoverImage(idx)}
                          className="p-1.5 rounded-full bg-white/90 text-navy hover:scale-110 transition shadow-sm text-[10px] font-bold"
                          title="Set as Cover"
                        >
                          Cover
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="p-1.5 rounded-full bg-rose-600 text-white hover:scale-110 transition shadow-sm"
                        title="Remove Photo"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-3xl p-6 text-center hover:border-primary/50 transition cursor-pointer bg-surface-1"
              >
                <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-xs font-bold text-foreground">Click to upload real photos of your service & tools</p>
                <p className="text-[10px] text-muted-foreground mt-1">Upload up to 8 images (JPG, PNG, WebP)</p>
              </div>
            )}
          </div>
        </section>

        {/* Step 4: Transparent Pricing & Service Guarantees */}
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h2 className="text-base font-extrabold text-foreground flex items-center gap-2">
            <IndianRupee className="h-4 w-4 text-primary" /> 4. Transparent Pricing & Service Guarantees
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Pricing Model *</label>
              <select
                value={priceType}
                onChange={(e) => setPriceType(e.target.value)}
                className="w-full rounded-2xl border border-border bg-surface-1 px-3 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
              >
                <option value="STARTING_AT">Starting At</option>
                <option value="FIXED">Fixed Price</option>
                <option value="PER_HOUR">Hourly Rate</option>
                <option value="VISITATION_FEE">Visitation / Inspection Fee</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Standard Rate (₹) *</label>
              <input
                type="number"
                required
                min={0}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-2xl border border-border bg-surface-1 px-4 py-2.5 text-xs font-bold text-foreground focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Rate Unit *</label>
              <select
                value={priceUnit}
                onChange={(e) => setPriceUnit(e.target.value)}
                className="w-full rounded-2xl border border-border bg-surface-1 px-4 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
              >
                <option value="per service">per service</option>
                <option value="per visit">per visit</option>
                <option value="per hour">per hour</option>
                <option value="per sqft">per sqft</option>
                <option value="per day">per day</option>
              </select>
            </div>
          </div>

          {/* Service Guarantee Options with Expanded Applicable Choices */}
          <div className="pt-2 border-t border-border/60 space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-extrabold text-foreground flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" /> Service Warranty / Guarantee Options *
                </label>
                <span className="text-[11px] font-bold text-primary">Selected: {finalWarranty}</span>
              </div>

              {/* Selection Dropdown */}
              <select
                value={warranty}
                onChange={(e) => setWarranty(e.target.value)}
                className="w-full rounded-2xl border border-border bg-surface-1 px-4 py-2.5 text-xs font-bold text-foreground focus:border-primary focus:outline-none mb-2"
              >
                {SERVICE_GUARANTEE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    🛡️ {opt}
                  </option>
                ))}
              </select>

              {/* Quick Select Preset Pills */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {[
                  "30 Days Service Guarantee",
                  "60 Days Repair Warranty",
                  "90 Days Comprehensive Guarantee",
                  "100% Satisfaction or Free Re-service",
                  "Money-Back Service Guarantee",
                  "No Fix No Fee Guarantee",
                  "Damage-Free Workmanship Guarantee",
                  "Zero Hidden Charges Guarantee"
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setWarranty(preset);
                      setCustomWarranty("");
                    }}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer border ${
                      warranty === preset
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                        : "bg-surface-2 text-muted-foreground border-border hover:text-foreground"
                    }`}
                  >
                    ✓ {preset}
                  </button>
                ))}
              </div>

              {/* Custom Guarantee Input if "Custom Guarantee" is chosen */}
              {warranty === "Custom Guarantee" && (
                <div className="pt-1">
                  <input
                    type="text"
                    required
                    placeholder="Enter your custom applicable guarantee terms..."
                    value={customWarranty}
                    onChange={(e) => setCustomWarranty(e.target.value)}
                    className="w-full rounded-2xl border border-emerald-500/50 bg-surface-1 px-4 py-2 text-xs font-bold text-foreground focus:border-emerald-500 focus:outline-none"
                    autoFocus
                  />
                </div>
              )}
            </div>

            {/* Response Time Guarantee Options */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-extrabold text-foreground flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-primary" /> Response Time Guarantee *
                </label>
                <span className="text-[11px] font-bold text-primary">Selected: {finalResponseTime}</span>
              </div>

              <select
                value={guaranteedResponseTime}
                onChange={(e) => setGuaranteedResponseTime(e.target.value)}
                className="w-full rounded-2xl border border-border bg-surface-1 px-4 py-2.5 text-xs font-bold text-foreground focus:border-primary focus:outline-none mb-2"
              >
                {RESPONSE_TIME_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    ⚡ {opt}
                  </option>
                ))}
              </select>

              <div className="flex flex-wrap gap-1.5">
                {[
                  "Within 30 Mins (Express)",
                  "Within 60 Mins",
                  "Within 2 Hours",
                  "Same Day Service (Within 4-6 Hours)",
                  "24/7 Emergency Assistance"
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setGuaranteedResponseTime(preset);
                      setCustomResponseTime("");
                    }}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer border ${
                      guaranteedResponseTime === preset
                        ? "bg-primary text-primary-foreground border-primary shadow-xs"
                        : "bg-surface-2 text-muted-foreground border-border hover:text-foreground"
                    }`}
                  >
                    ⏱ {preset}
                  </button>
                ))}
              </div>

              {guaranteedResponseTime === "Custom Response Time" && (
                <div className="pt-2">
                  <input
                    type="text"
                    required
                    placeholder="Enter custom response time guarantee..."
                    value={customResponseTime}
                    onChange={(e) => setCustomResponseTime(e.target.value)}
                    className="w-full rounded-2xl border border-primary/50 bg-surface-1 px-4 py-2 text-xs font-bold text-foreground focus:border-primary focus:outline-none"
                    autoFocus
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="emergencyCheck"
              checked={isEmergency}
              onChange={(e) => setIsEmergency(e.target.checked)}
              className="h-4 w-4 rounded text-primary focus:ring-primary cursor-pointer"
            />
            <label htmlFor="emergencyCheck" className="text-xs font-bold text-foreground cursor-pointer">
              🔥 24/7 Emergency Service Available (Highlight urgent response badge)
            </label>
          </div>
        </section>

        {/* Step 5: Inclusions & Exclusions Checklist */}
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h2 className="text-base font-extrabold text-foreground flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" /> 5. Inclusions & Exclusions (Clear Expectations)
          </h2>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">What is Included in this Service</label>
            <div className="space-y-2 mb-2">
              {inclusions.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between gap-2 rounded-xl bg-surface-2 px-3 py-2 text-xs">
                  <span className="flex items-center gap-2 font-medium">
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> {item}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveInclusion(idx)}
                    className="text-muted-foreground hover:text-rose-600 transition"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Free filter cleaning, chemical jet wash"
                value={newInclusion}
                onChange={(e) => setNewInclusion(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddInclusion(); } }}
                className="flex-1 rounded-2xl border border-border bg-surface-1 px-4 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddInclusion}
                className="rounded-2xl bg-secondary px-4 py-2 text-xs font-bold text-foreground hover:bg-surface-2 transition"
              >
                Add
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">What is Excluded</label>
            <div className="space-y-2 mb-2">
              {exclusions.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between gap-2 rounded-xl bg-surface-2 px-3 py-2 text-xs">
                  <span className="flex items-center gap-2 font-medium text-muted-foreground">
                    <X className="h-3.5 w-3.5 text-rose-500 shrink-0" /> {item}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveExclusion(idx)}
                    className="text-muted-foreground hover:text-rose-600 transition"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Spare parts replacement cost, external civil work"
                value={newExclusion}
                onChange={(e) => setNewExclusion(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddExclusion(); } }}
                className="flex-1 rounded-2xl border border-border bg-surface-1 px-4 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddExclusion}
                className="rounded-2xl bg-secondary px-4 py-2 text-xs font-bold text-foreground hover:bg-surface-2 transition"
              >
                Add
              </button>
            </div>
          </div>
        </section>

        {/* Step 6: Location & Service Coverage */}
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h2 className="text-base font-extrabold text-foreground flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" /> 6. Service Coverage & Location
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Base Locality / Area *</label>
              <input
                type="text"
                required
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full rounded-2xl border border-border bg-surface-1 px-4 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">City *</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-2xl border border-border bg-surface-1 px-4 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Pincode (6 digits) *</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                required
                value={pincode}
                onKeyDown={(e) => preventNonNumericKeyDown(e)}
                onChange={(e) => setPincode(sanitizeNumericInput(e.target.value).slice(0, 6))}
                className="w-full rounded-2xl border border-border bg-surface-1 px-4 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">All Covered Localities (Comma separated)</label>
            <input
              type="text"
              placeholder="e.g. Madhapur, Hitec City, Kondapur, Jubilee Hills, Gachibowli"
              value={servesAreasInput}
              onChange={(e) => setServesAreasInput(e.target.value)}
              className="w-full rounded-2xl border border-border bg-surface-1 px-4 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
            />
          </div>
        </section>

        {/* Expected Listing Flow Action: Review Details Before Publishing */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-black text-primary-foreground shadow-xl hover:brightness-110 active:scale-[0.99] transition cursor-pointer"
          >
            <Eye className="h-5 w-5" />
            <span>Review & Proceed to Listing Flow</span>
          </button>
          <p className="text-center text-[11px] text-muted-foreground mt-2">
            Follows the verified Omeetso Service Listing Flow with pre-publish preview and quality check.
          </p>
        </div>
      </form>

      {/* Missing Fields / Validation Modal */}
      {showMissingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-card p-6 shadow-2xl border border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-rose-500/15 text-rose-600 border border-rose-500/25">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-foreground">Incomplete Listing Details</h3>
                <p className="text-xs text-muted-foreground">Please complete the required details before publishing</p>
              </div>
            </div>

            <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
              {missingFields.map((err, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-bold text-rose-700">
                  <X className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>{err}</span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowMissingModal(false)}
              className="w-full py-3 rounded-2xl bg-primary text-xs font-black text-primary-foreground shadow-md hover:brightness-110 active:scale-98 transition cursor-pointer"
            >
              Back & Complete Required Fields
            </button>
          </div>
        </div>
      )}

      {/* Service Listing Review & Verification Flow Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-card p-6 shadow-2xl border border-border max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setShowReviewModal(false)}
              className="absolute right-4 top-4 p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-4 border-b border-border pb-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-600 border border-emerald-500/25">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-foreground">Service Listing Preview</h3>
                <p className="text-xs text-muted-foreground">Review your live service card and applicable guarantees</p>
              </div>
            </div>

            {/* Service Card Visual Preview */}
            <div className="rounded-2xl border border-border bg-surface-1 p-4 mb-4 space-y-3">
              <div className="flex items-start gap-3">
                <img
                  src={images[0] || "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800"}
                  alt=""
                  className="h-16 w-16 rounded-xl object-cover border border-border shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                    <span className="text-[10px] font-black uppercase text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      {activeCategory.name}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      {serviceType}
                    </span>
                    {isEmergency && (
                      <span className="text-[10px] font-bold text-rose-600 bg-rose-500/10 px-2 py-0.5 rounded-full">
                        🔥 24/7 Emergency
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-extrabold text-foreground truncate">{title}</h4>
                  <p className="text-xs font-semibold text-muted-foreground truncate">{businessName} · {providerName}</p>
                  <p className="text-xs font-black text-primary mt-1">
                    ₹{amount} <span className="text-[10px] font-normal text-muted-foreground">({priceUnit})</span>
                  </p>
                </div>
              </div>

              {/* Guarantees Matrix in Preview */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60">
                <div className="rounded-xl bg-surface-2 p-2 text-center">
                  <p className="text-[10px] font-bold text-muted-foreground">Applicable Guarantee</p>
                  <p className="text-xs font-black text-emerald-600 truncate">{finalWarranty}</p>
                </div>
                <div className="rounded-xl bg-surface-2 p-2 text-center">
                  <p className="text-[10px] font-bold text-muted-foreground">Guaranteed Response</p>
                  <p className="text-xs font-black text-primary truncate">{finalResponseTime}</p>
                </div>
              </div>

              <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3 text-primary shrink-0" />
                <span>Coverage: {area}, {city} ({pincode})</span>
              </div>
            </div>

            {/* Terms and Quality Standards Checkbox */}
            <div className="mb-5 p-3 rounded-xl bg-primary/5 border border-primary/20">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded text-primary focus:ring-primary cursor-pointer"
                />
                <span className="font-semibold text-foreground">
                  I certify that my business credentials, applicable service guarantee, and pricing are accurate and comply with the Omeetso Verified Provider Marketplace Policy.
                </span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="flex-1 py-3 rounded-2xl border border-border text-xs font-extrabold text-foreground hover:bg-muted transition cursor-pointer"
              >
                Edit Details
              </button>
              <button
                type="button"
                disabled={loading || !termsAccepted}
                onClick={handleConfirmPublish}
                className="flex-1 py-3 rounded-2xl bg-primary text-xs font-black text-primary-foreground shadow-lg hover:brightness-110 active:scale-98 transition disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Publishing…</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Confirm & Publish Service</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
