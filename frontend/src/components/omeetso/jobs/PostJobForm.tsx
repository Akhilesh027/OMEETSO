import React, { useState, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Briefcase, Building2, MapPin, DollarSign, Footprints, Zap, ArrowRight, ArrowLeft, CheckCircle2, ShieldAlert, Eye, Upload, Trash2, Camera, Loader2 } from "lucide-react";
import { JobItem } from "@/lib/jobs";
import { JobCard } from "./JobCard";
import { uploadFile } from "@/lib/upload";
import { toast } from "sonner";

export function PostJobForm() {
  const nav = useNavigate();
  const [step, setStep] = useState<"form" | "preview">("form");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Company Selection mode
  const [companyMode, setCompanyMode] = useState<"manual" | "store">("manual");
  const [selectedStoreId, setSelectedStoreId] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    jobCategoryId: "it_software",
    subcategoryId: "Frontend Developer",
    openingsCount: 1,
    companyName: "",
    companyLogo: "",
    companyIndustry: "Technology",
    companySize: "10-50 employees",
    companyDescription: "",
    jobType: "FULL_TIME" as any,
    workplaceType: "OFFICE" as any,
    remoteScope: "Hyderabad",
    area: "Madhapur",
    city: "Hyderabad",
    pincode: "500081",
    minSalary: 25000,
    maxSalary: 40000,
    salaryPeriod: "monthly" as any,
    salaryDisclosed: true,
    negotiable: false,
    incentivesAvailable: false,
    experience: "1-2 Years",
    fresherAllowed: true,
    minEducation: "Graduate",
    skills: "React.js, TypeScript, TailwindCSS",
    languages: "English, Telugu",
    description: "",
    responsibilities: "",
    requirements: "",
    benefits: "",
    workingDays: "5 Days (Mon-Fri)",
    shiftType: "Day Shift",
    workingHours: "9 AM - 6 PM",
    isWalkIn: false,
    walkInDate: "",
    startTime: "10:00 AM",
    endTime: "4:00 PM",
    venue: "",
    contactPerson: "",
    instructions: "",
    isUrgent: false,
    isFeatured: false,
    screeningQuestions: "How many years of relevant experience do you have?\nWhat is your notice period?"
  });

  const previewJobItem: JobItem = {
    id: "PREVIEW-TEMP",
    employerId: "me",
    storeId: selectedStoreId || undefined,
    companyName: formData.companyName || "Your Company Name",
    companyLogo: formData.companyLogo || undefined,
    companyIndustry: formData.companyIndustry,
    companySize: formData.companySize,
    companyDescription: formData.companyDescription,
    isVerifiedEmployer: true,
    title: formData.title || "Job Title Preview",
    jobCategoryId: formData.jobCategoryId,
    subcategoryId: formData.subcategoryId,
    openingsCount: formData.openingsCount,
    jobType: formData.jobType,
    workplaceType: formData.workplaceType,
    location: {
      remoteScope: formData.remoteScope,
      area: formData.area,
      city: formData.city,
      pincode: formData.pincode
    },
    salary: {
      minSalary: Number(formData.minSalary),
      maxSalary: Number(formData.maxSalary),
      salaryPeriod: formData.salaryPeriod,
      salaryDisclosed: formData.salaryDisclosed,
      negotiable: formData.negotiable,
      incentivesAvailable: formData.incentivesAvailable
    },
    candidateCriteria: {
      experience: formData.experience,
      fresherAllowed: formData.fresherAllowed,
      minEducation: formData.minEducation,
      skills: formData.skills.split(",").map(s => s.trim()).filter(Boolean),
      languages: formData.languages.split(",").map(s => s.trim()).filter(Boolean)
    },
    jobDetails: {
      description: formData.description || "Job Description preview...",
      responsibilities: formData.responsibilities,
      requirements: formData.requirements,
      benefits: formData.benefits,
      workingDays: formData.workingDays,
      shiftType: formData.shiftType,
      workingHours: formData.workingHours
    },
    walkInDetails: {
      isWalkIn: formData.isWalkIn,
      walkInDate: formData.walkInDate,
      startTime: formData.startTime,
      endTime: formData.endTime,
      venue: formData.venue,
      contactPerson: formData.contactPerson,
      instructions: formData.instructions
    },
    isUrgent: formData.isUrgent,
    isFeatured: formData.isFeatured,
    screeningQuestions: formData.screeningQuestions.split("\n").map(q => q.trim()).filter(Boolean),
    status: "ACTIVE",
    createdAt: Date.now()
  };

  const handlePublishJob = async () => {
    setIsSubmitting(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("omeetso_user_token") : null;
      const res = await fetch("https://api.omeetso.in/api/v1/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(previewJobItem)
      });
      const json = await res.json();
      setIsSubmitting(false);
      if (json.success && json.data) {
        nav({ to: "/job/$id", params: { id: json.data.id } });
      } else {
        nav({ to: "/jobs" });
      }
    } catch {
      setIsSubmitting(false);
      nav({ to: "/jobs" });
    }
  };

  return (
    <div className="max-w-[900px] mx-auto p-4 sm:p-6 space-y-6 font-sans">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-foreground">Post a New Job</h1>
          <p className="text-xs text-muted-foreground font-semibold">Reach thousands of verified local candidates on Omeetso Jobs.</p>
        </div>
        {step === "form" && (
          <button
            onClick={() => setStep("preview")}
            disabled={!formData.title || !formData.companyName}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-secondary text-xs font-bold hover:bg-secondary/80 disabled:opacity-50"
          >
            <Eye className="h-4 w-4" /> Preview Job
          </button>
        )}
      </div>

      {step === "form" ? (
        <div className="space-y-6 text-xs font-semibold">

          {/* COMPANY SELECTION */}
          <div className="rounded-3xl border border-border bg-card p-5 space-y-4">
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-indigo-brand flex items-center gap-2">
              <Building2 className="h-4 w-4" /> 1. Company Identity
            </h2>

            <div className="flex items-center gap-3">
              <label className={`flex-1 p-3 rounded-2xl border cursor-pointer transition-all text-center ${companyMode === "manual" ? "border-indigo-brand bg-indigo-brand/10 text-indigo-brand font-bold" : "border-border bg-secondary/50"}`}>
                <input type="radio" name="compMode" checked={companyMode === "manual"} onChange={() => setCompanyMode("manual")} className="sr-only" />
                <span>Enter Company Details Manually</span>
              </label>
              <label className={`flex-1 p-3 rounded-2xl border cursor-pointer transition-all text-center ${companyMode === "store" ? "border-indigo-brand bg-indigo-brand/10 text-indigo-brand font-bold" : "border-border bg-secondary/50"}`}>
                <input type="radio" name="compMode" checked={companyMode === "store"} onChange={() => setCompanyMode("store")} className="sr-only" />
                <span>Post as Registered Omeetso Business</span>
              </label>
            </div>

            {companyMode === "store" ? (
              <div>
                <label className="block text-muted-foreground mb-1 font-bold">Select Your Omeetso Store / Business</label>
                <select
                  value={selectedStoreId}
                  onChange={(e) => {
                    setSelectedStoreId(e.target.value);
                    setFormData({ ...formData, companyName: "Venkata Retail Store", companyLogo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200" });
                  }}
                  className="w-full h-11 rounded-2xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-brand"
                >
                  <option value="">Select Business Profile...</option>
                  <option value="store_1">Venkata Retail Store (Verified)</option>
                  <option value="store_2">Hyderabad Digital Tech</option>
                </select>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-muted-foreground mb-1 font-bold">Company / Business Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. ABC Technologies"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full h-11 rounded-2xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-brand"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground mb-1 font-bold">Company Logo (Upload Photo)</label>
                  <input
                    type="file"
                    ref={logoInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setLogoUploading(true);
                      try {
                        const url = await uploadFile(file, "job_logos");
                        setFormData((prev) => ({ ...prev, companyLogo: url }));
                        toast.success("Company logo uploaded successfully!");
                      } catch {
                        const reader = new FileReader();
                        reader.onload = () => {
                          setFormData((prev) => ({ ...prev, companyLogo: String(reader.result) }));
                        };
                        reader.readAsDataURL(file);
                        toast.success("Logo attached");
                      } finally {
                        setLogoUploading(false);
                      }
                    }}
                  />

                  {formData.companyLogo ? (
                    <div className="flex items-center gap-3 p-3 rounded-2xl border border-border bg-secondary/30">
                      <img
                        src={formData.companyLogo}
                        alt="Company Logo Preview"
                        className="h-12 w-12 rounded-xl object-contain bg-white border border-border p-1 shadow-xs shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">Logo Uploaded ✓</p>
                        <p className="text-[11px] text-muted-foreground truncate">{formData.companyName || "Company Brand"}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => logoInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:bg-secondary cursor-pointer"
                        >
                          Change
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, companyLogo: "" }))}
                          className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                          aria-label="Remove Logo"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => logoInputRef.current?.click()}
                      className="border-2 border-dashed border-border hover:border-indigo-brand rounded-2xl p-4 flex items-center justify-center gap-3 cursor-pointer bg-secondary/20 transition-colors"
                    >
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-500/10 text-indigo-brand shrink-0">
                        {logoUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold text-foreground">
                          {logoUploading ? "Uploading Logo…" : "Click to upload Company Logo"}
                        </p>
                        <p className="text-[10px] text-muted-foreground">PNG, JPG or SVG (Max 5MB)</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* BASIC JOB INFO */}
          <div className="rounded-3xl border border-border bg-card p-5 space-y-4">
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-indigo-brand flex items-center gap-2">
              <Briefcase className="h-4 w-4" /> 2. Job Basics
            </h2>

            <div>
              <label className="block text-muted-foreground mb-1 font-bold">Job Title *</label>
              <input
                type="text"
                placeholder="e.g. Senior React Developer / Sales Executive"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full h-11 rounded-2xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-brand"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-muted-foreground mb-1 font-bold">Job Category</label>
                <select
                  value={formData.jobCategoryId}
                  onChange={(e) => setFormData({ ...formData, jobCategoryId: e.target.value })}
                  className="w-full h-11 rounded-2xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-brand"
                >
                  <option value="it_software">IT & Software</option>
                  <option value="sales_marketing">Sales & Marketing</option>
                  <option value="digital_marketing">Digital Marketing</option>
                  <option value="customer_support">Customer Support</option>
                  <option value="delivery_logistics">Delivery & Logistics</option>
                  <option value="retail_staff">Retail Staff</option>
                  <option value="work_from_home">Work From Home</option>
                </select>
              </div>

              <div>
                <label className="block text-muted-foreground mb-1 font-bold">Job Type</label>
                <select
                  value={formData.jobType}
                  onChange={(e) => setFormData({ ...formData, jobType: e.target.value as any })}
                  className="w-full h-11 rounded-2xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-brand"
                >
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="INTERNSHIP">Internship</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="FREELANCE">Freelance</option>
                </select>
              </div>

              <div>
                <label className="block text-muted-foreground mb-1 font-bold">Workplace Type</label>
                <select
                  value={formData.workplaceType}
                  onChange={(e) => setFormData({ ...formData, workplaceType: e.target.value as any })}
                  className="w-full h-11 rounded-2xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-brand"
                >
                  <option value="OFFICE">Work From Office</option>
                  <option value="WORK_FROM_HOME">Work From Home (Remote)</option>
                  <option value="HYBRID">Hybrid</option>
                  <option value="FIELD_WORK">Field Work</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-muted-foreground mb-1 font-bold">Number of Openings</label>
                <input
                  type="number"
                  value={formData.openingsCount}
                  onChange={(e) => setFormData({ ...formData, openingsCount: Number(e.target.value) })}
                  className="w-full h-11 rounded-2xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-brand"
                />
              </div>
              <div>
                <label className="block text-muted-foreground mb-1 font-bold">Area / Locality</label>
                <input
                  type="text"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  className="w-full h-11 rounded-2xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-brand"
                />
              </div>
              <div>
                <label className="block text-muted-foreground mb-1 font-bold">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full h-11 rounded-2xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-brand"
                />
              </div>
            </div>
          </div>

          {/* SALARY & COMPENSATION */}
          <div className="rounded-3xl border border-border bg-card p-5 space-y-4">
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-indigo-brand flex items-center gap-2">
              <DollarSign className="h-4 w-4" /> 3. Salary & Pay Structure
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-muted-foreground mb-1 font-bold">Pay Period</label>
                <select
                  value={formData.salaryPeriod}
                  onChange={(e) => setFormData({ ...formData, salaryPeriod: e.target.value as any })}
                  className="w-full h-11 rounded-2xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-brand"
                >
                  <option value="monthly">Per Month (Monthly)</option>
                  <option value="yearly">Per Year (LPA)</option>
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="fixed_project">Fixed Project</option>
                  <option value="commission_based">Commission Based</option>
                </select>
              </div>

              <div>
                <label className="block text-muted-foreground mb-1 font-bold">Min Salary (₹)</label>
                <input
                  type="number"
                  value={formData.minSalary}
                  onChange={(e) => setFormData({ ...formData, minSalary: Number(e.target.value) })}
                  className="w-full h-11 rounded-2xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-brand"
                />
              </div>

              <div>
                <label className="block text-muted-foreground mb-1 font-bold">Max Salary (₹)</label>
                <input
                  type="number"
                  value={formData.maxSalary}
                  onChange={(e) => setFormData({ ...formData, maxSalary: Number(e.target.value) })}
                  className="w-full h-11 rounded-2xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-brand"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.incentivesAvailable}
                  onChange={(e) => setFormData({ ...formData, incentivesAvailable: e.target.checked })}
                  className="h-4 w-4 accent-indigo-brand"
                />
                <span>Additional Incentives Available</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isUrgent}
                  onChange={(e) => setFormData({ ...formData, isUrgent: e.target.checked })}
                  className="h-4 w-4 accent-rose-500"
                />
                <span className="text-rose-600 font-extrabold">Mark as Urgent Hiring ⚡</span>
              </label>
            </div>
          </div>

          {/* WALK-IN DETAILS */}
          <div className="rounded-3xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold uppercase tracking-wide text-amber-700 flex items-center gap-2">
                <Footprints className="h-4 w-4" /> 4. Walk-In Interview Details
              </h2>
              <label className="flex items-center gap-2 cursor-pointer font-extrabold text-amber-700">
                <input
                  type="checkbox"
                  checked={formData.isWalkIn}
                  onChange={(e) => setFormData({ ...formData, isWalkIn: e.target.checked })}
                  className="h-4 w-4 accent-amber-600"
                />
                <span>Enable Walk-In Drive 🚶</span>
              </label>
            </div>

            {formData.isWalkIn && (
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-muted-foreground mb-1 font-bold">Walk-In Date</label>
                    <input
                      type="date"
                      value={formData.walkInDate}
                      onChange={(e) => setFormData({ ...formData, walkInDate: e.target.value })}
                      className="w-full h-11 rounded-2xl border border-border bg-background px-3 font-bold text-foreground outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-muted-foreground mb-1 font-bold">Start Time</label>
                    <input
                      type="text"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-full h-11 rounded-2xl border border-border bg-background px-3 font-bold text-foreground outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-muted-foreground mb-1 font-bold">End Time</label>
                    <input
                      type="text"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="w-full h-11 rounded-2xl border border-border bg-background px-3 font-bold text-foreground outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-muted-foreground mb-1 font-bold">Walk-In Venue Address</label>
                  <input
                    type="text"
                    placeholder="Full address of interview location..."
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    className="w-full h-11 rounded-2xl border border-border bg-background px-3 font-bold text-foreground outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* DESCRIPTION & REQUIREMENTS */}
          <div className="rounded-3xl border border-border bg-card p-5 space-y-4">
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-indigo-brand">5. Description & Criteria</h2>
            <div>
              <label className="block text-muted-foreground mb-1 font-bold">Job Description *</label>
              <textarea
                rows={4}
                placeholder="Explain the job role, day-to-day work, and expectations..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-2xl border border-border bg-background p-3 font-bold text-foreground outline-none focus:border-indigo-brand"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep("preview")}
              className="flex-1 h-12 rounded-2xl bg-indigo-brand text-white font-extrabold text-xs flex items-center justify-center gap-2 hover:bg-indigo-brand/90 transition-all shadow-md"
            >
              Preview Job Listing <ArrowRight className="h-4 w-4" />
            </button>
          </div>

        </div>
      ) : (
        /* STEP 2: PREVIEW JOB BEFORE PUBLISH */
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-indigo-brand/10 border border-indigo-brand/30 p-4 rounded-2xl">
            <div className="text-xs font-extrabold text-indigo-brand">
              <span>Job Listing Preview Mode</span>
              <p className="text-[11px] font-normal text-muted-foreground">Review how candidates will view your job card and detail page before publishing.</p>
            </div>
            <button
              onClick={() => setStep("form")}
              className="px-4 py-2 rounded-xl border border-border bg-card text-xs font-bold hover:bg-secondary flex items-center gap-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Edit Form
            </button>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wide text-muted-foreground">Card Preview</h3>
            <JobCard job={previewJobItem} />
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => setStep("form")}
              className="w-1/3 h-12 rounded-2xl border border-border text-xs font-bold text-muted-foreground flex items-center justify-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Edit
            </button>

            <button
              type="button"
              onClick={handlePublishJob}
              disabled={isSubmitting}
              className="w-2/3 h-12 rounded-2xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center gap-2 hover:bg-emerald-700 shadow-lg"
            >
              {isSubmitting ? "Publishing Job..." : "Publish Job Now ✓"}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
