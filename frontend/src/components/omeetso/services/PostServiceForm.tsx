import { useState, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft, Upload, Plus, Trash2, ShieldCheck, Sparkles, CheckCircle2,
  Wrench, Building, Home, MapPin, IndianRupee, Clock, Check, AlertCircle,
  Camera, Loader2, Image as ImageIcon, Star
} from "lucide-react";
import { SERVICE_CATEGORIES, ServiceItem, getLocalServices, saveLocalServices } from "@/lib/services";
import { createServiceApi } from "@/api/services.api";
import { uploadFile } from "@/lib/upload";
import { toast } from "sonner";

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
  const [workingHours, setWorkingHours] = useState("08:00 AM - 08:00 PM");
  const [isEmergency, setIsEmergency] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !businessName.trim() || !description.trim() || !amount) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const servesAreasList = servesAreasInput
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean);

      const newService: ServiceItem = {
        id: `srv-${Date.now()}`,
        providerId: "user-provider-current",
        businessName: businessName.trim(),
        providerName: providerName.trim() || businessName.trim(),
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
        phone: phone.trim(),
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
          images: images.length > 0 ? images : ["https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80"],
          experienceYears: Number(experienceYears),
          guaranteedResponseTime,
          warranty,
        },
        availability: {
          workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
          workingHours,
          emergencyServiceAvailable: isEmergency,
        },
        status: "ACTIVE",
        isFeatured: true,
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

      // Try API, fallback to local storage
      try {
        await createServiceApi(newService as any);
      } catch {
        // fallback
      }

      const current = getLocalServices();
      saveLocalServices([newService, ...current]);

      toast.success("Service listed successfully on Omeetso Marketplace!");
      navigate({ to: "/services" as any });
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
          className="grid h-10 w-10 place-items-center rounded-full bg-secondary hover:bg-surface-2 transition text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <div className="flex items-center gap-1.5 text-xs font-black uppercase text-primary tracking-wider">
            <Sparkles className="h-3.5 w-3.5 fill-primary" /> Omeetso Services Vertical
          </div>
          <h1 className="text-2xl font-black text-foreground">List a Professional Service</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Provider Profile & Business Details */}
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h2 className="text-base font-extrabold text-foreground flex items-center gap-2">
            <Building className="h-4 w-4 text-primary" /> 1. Provider & Business Profile
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Business / Agency Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Apex Home & Appliance Care"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full rounded-2xl border border-border bg-surface-1 px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Primary Technician / Contact Person</label>
              <input
                type="text"
                placeholder="e.g. Anand Kumar (Lead Tech)"
                value={providerName}
                onChange={(e) => setProviderName(e.target.value)}
                className="w-full rounded-2xl border border-border bg-surface-1 px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Contact Phone Number *</label>
              <input
                type="tel"
                required
                placeholder="e.g. +91 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-2xl border border-border bg-surface-1 px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Email Address</label>
              <input
                type="email"
                placeholder="e.g. contact@apexservices.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-border bg-surface-1 px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        </section>

        {/* Step 2: Service Details & Category */}
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h2 className="text-base font-extrabold text-foreground flex items-center gap-2">
            <Wrench className="h-4 w-4 text-primary" /> 2. Service Category & Offering Title
          </h2>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">Service Listing Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Master Jet AC Service & Anti-Bacterial Foam Wash"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-2xl border border-border bg-surface-1 px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Main Category</label>
              <select
                value={serviceCategoryId}
                onChange={(e) => {
                  setServiceCategoryId(e.target.value);
                  const selectedCat = SERVICE_CATEGORIES.find((c) => c.id === e.target.value);
                  if (selectedCat && selectedCat.subcategories.length > 0) {
                    setSubcategoryId(selectedCat.subcategories[0].name);
                  }
                }}
                className="w-full rounded-2xl border border-border bg-surface-1 px-4 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
              >
                {SERVICE_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Subcategory</label>
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
            <label className="block text-xs font-bold text-foreground mb-1.5">Delivery Mode</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: "DOORSTEP", label: "🏠 Doorstep", desc: "Visit client home" },
                { id: "AT_CENTER", label: "🏢 At Center", desc: "Client visits shop" },
                { id: "ONLINE", label: "🌐 Online / Remote", desc: "Video call / remote" },
                { id: "HYBRID", label: "⚡ Hybrid", desc: "Both home & shop" },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setServiceType(m.id as any)}
                  className={`rounded-2xl border p-3 text-left transition ${
                    serviceType === m.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-surface-1 text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  <p className="text-xs font-black">{m.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{m.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">Detailed Description *</label>
            <textarea
              rows={4}
              required
              placeholder="Describe your service methodology, tools used, safety precautions, and why customers should choose you."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-2xl border border-border bg-surface-1 p-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none resize-none"
            />
          </div>
        </section>

        {/* Step 3: Service Photos & Portfolio Upload */}
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-foreground flex items-center gap-2">
              <Camera className="h-4 w-4 text-primary" /> 3. Service Photos & Work Portfolio
            </h2>
            <span className="text-xs font-bold text-muted-foreground">
              {images.length} / 8 Photos Uploaded
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Upload high quality photos of your past work, equipment, certifications, or storefront to attract more local clients.
          </p>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageFilesUpload}
            multiple
            accept="image/*"
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border hover:border-primary rounded-3xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-surface-1/50 transition-colors"
          >
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
              {uploadingImages ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
            </div>
            <div className="text-center">
              <p className="text-sm font-extrabold text-foreground">
                {uploadingImages ? "Uploading service photos…" : "Click or drag photos to upload"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                PNG, JPG or WebP (Up to 8 photos, Max 10MB each)
              </p>
            </div>
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {images.map((imgUrl, index) => (
                <div
                  key={index}
                  className="relative group rounded-2xl overflow-hidden border border-border bg-surface-2 aspect-4/3"
                >
                  <img
                    src={imgUrl}
                    alt={`Service Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {index === 0 && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-black tracking-wide shadow-sm flex items-center gap-1">
                      <Star className="h-3 w-3 fill-current" /> Cover
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {index !== 0 && (
                      <button
                        type="button"
                        onClick={() => handleSetCoverImage(index)}
                        className="px-2.5 py-1 rounded-xl bg-white/90 text-slate-900 text-[10px] font-bold shadow hover:bg-white cursor-pointer"
                      >
                        Set Cover
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="p-1.5 rounded-xl bg-rose-600 text-white shadow hover:bg-rose-700 cursor-pointer"
                      aria-label="Delete photo"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Step 4: Pricing & Guarantees */}
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h2 className="text-base font-extrabold text-foreground flex items-center gap-2">
            <IndianRupee className="h-4 w-4 text-primary" /> 4. Transparent Pricing & Guarantees
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Price Model</label>
              <select
                value={priceType}
                onChange={(e) => setPriceType(e.target.value)}
                className="w-full rounded-2xl border border-border bg-surface-1 px-4 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
              >
                <option value="STARTING_AT">Starting At</option>
                <option value="FIXED">Fixed Price</option>
                <option value="VISITATION_FEE">Visitation / Inspection Fee</option>
                <option value="PER_HOUR">Hourly Rate</option>
                <option value="REQUEST_QUOTE">Quote on Inspection</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Amount (₹) *</label>
              <input
                type="number"
                required
                min={0}
                placeholder="499"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-2xl border border-border bg-surface-1 px-4 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Unit</label>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Response Time Guarantee</label>
              <input
                type="text"
                placeholder="e.g. Within 60 Mins, Same Day"
                value={guaranteedResponseTime}
                onChange={(e) => setGuaranteedResponseTime(e.target.value)}
                className="w-full rounded-2xl border border-border bg-surface-1 px-4 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Service Warranty / Guarantee</label>
              <input
                type="text"
                placeholder="e.g. 30 Days Free Service Warranty"
                value={warranty}
                onChange={(e) => setWarranty(e.target.value)}
                className="w-full rounded-2xl border border-border bg-surface-1 px-4 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="emergencyCheck"
              checked={isEmergency}
              onChange={(e) => setIsEmergency(e.target.checked)}
              className="h-4 w-4 rounded text-primary focus:ring-primary"
            />
            <label htmlFor="emergencyCheck" className="text-xs font-bold text-foreground cursor-pointer">
              🔥 24/7 Emergency Service Available (Show urgent assistance badge)
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
                  <span className="flex items-center gap-2 text-foreground font-medium">
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> {item}
                  </span>
                  <button type="button" onClick={() => handleRemoveInclusion(idx)} className="text-muted-foreground hover:text-rose-500">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add inclusion..."
                value={newInclusion}
                onChange={(e) => setNewInclusion(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddInclusion(); } }}
                className="flex-1 rounded-2xl border border-border bg-surface-1 px-3.5 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
              />
              <button type="button" onClick={handleAddInclusion} className="rounded-2xl bg-secondary px-4 py-2 text-xs font-bold hover:bg-surface-2">
                Add
              </button>
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-xs font-bold text-foreground mb-1">What is Excluded (Billed Extra)</label>
            <div className="space-y-2 mb-2">
              {exclusions.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between gap-2 rounded-xl bg-surface-2 px-3 py-2 text-xs">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" /> {item}
                  </span>
                  <button type="button" onClick={() => handleRemoveExclusion(idx)} className="text-muted-foreground hover:text-rose-500">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add exclusion..."
                value={newExclusion}
                onChange={(e) => setNewExclusion(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddExclusion(); } }}
                className="flex-1 rounded-2xl border border-border bg-surface-1 px-3.5 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
              />
              <button type="button" onClick={handleAddExclusion} className="rounded-2xl bg-secondary px-4 py-2 text-xs font-bold hover:bg-surface-2">
                Add
              </button>
            </div>
          </div>
        </section>

        {/* Step 6: Service Coverage Area */}
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h2 className="text-base font-extrabold text-foreground flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" /> 6. Service Area & Coverage
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Base Locality / Area *</label>
              <input
                type="text"
                required
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full rounded-2xl border border-border bg-surface-1 px-4 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">City *</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-2xl border border-border bg-surface-1 px-4 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Pincode *</label>
              <input
                type="text"
                required
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full rounded-2xl border border-border bg-surface-1 px-4 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
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

        {/* Submit Action */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-black text-primary-foreground shadow-xl hover:brightness-110 active:scale-[0.99] transition disabled:opacity-50"
          >
            <Sparkles className="h-5 w-5" />
            <span>{loading ? "Publishing Service..." : "Publish Service on Marketplace"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
