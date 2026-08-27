import React, { useState, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Briefcase, Building2, MapPin, IndianRupee, Footprints, Zap, ArrowRight,
  ArrowLeft, CheckCircle2, ShieldAlert, Eye, Upload, Trash2, Camera, Loader2,
  GraduationCap, Award, AlertCircle,
} from "lucide-react";
import { JobItem, createJobLocal } from "@/lib/jobs";
import { JobCard } from "./JobCard";
import { uploadFile } from "@/lib/upload";
import { toast } from "sonner";
import { MissingFieldsModal } from "@/components/sell/MissingFieldsModal";

const EXPERIENCE_OPTIONS = [
  "Fresher / Entry Level",
  "0-1 Year",
  "1-2 Years",
  "2-3 Years",
  "3-5 Years",
  "5-8 Years",
  "8-10 Years",
  "10+ Years",
  "Any Experience",
];

export function PostJobForm() {
  const nav = useNavigate();
  const [step, setStep] = useState<"form" | "preview">("form");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Missing fields & validation state
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [missingModalOpen, setMissingModalOpen] = useState(false);
  const [missingFieldsList, setMissingFieldsList] = useState<string[]>([]);

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
    experience: "",
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

  const validateJobForm = (): boolean => {
    const errors: Record<string, string> = {};
    const missing: string[] = [];

    // 1. Company
    if (companyMode === "manual") {
      if (!formData.companyName || formData.companyName.trim().length < 2) {
        errors.companyName = "Company / Employer name is required (min 2 chars)";
        missing.push("Company / Business Name");
      }
    } else {
      if (!selectedStoreId) {
        errors.selectedStoreId = "Please select your registered store or business";
        missing.push("Registered Omeetso Store / Business Profile");
      }
    }

    // 2. Job Title
    if (!formData.title || formData.title.trim().length < 3) {
      errors.title = "Job Title is required (min 3 characters)";
      missing.push("Job Title / Role (min 3 characters)");
    }

    // 3. Category
    if (!formData.jobCategoryId) {
      errors.jobCategoryId = "Job category is required";
      missing.push("Job Category");
    }

    // 4. Location
    if (!formData.city || formData.city.trim().length < 2) {
      errors.city = "City is required";
      missing.push("Job Location City");
    }
    if (!formData.area || formData.area.trim().length < 2) {
      errors.area = "Area / Locality is required";
      missing.push("Job Location Area");
    }
    if (!formData.pincode || !/^\d{6}$/.test(formData.pincode.trim())) {
      errors.pincode = "Valid 6-digit postal PIN code required";
      missing.push("Valid 6-Digit PIN Code");
    }

    // 5. Salary
    if (Number(formData.minSalary) < 0) {
      errors.minSalary = "Minimum salary cannot be negative";
      missing.push("Valid Minimum Salary");
    }
    if (Number(formData.maxSalary) < 0) {
      errors.maxSalary = "Maximum salary cannot be negative";
      missing.push("Valid Maximum Salary");
    }
    if (Number(formData.maxSalary) > 0 && Number(formData.maxSalary) < Number(formData.minSalary)) {
      errors.maxSalary = "Maximum salary must be greater than or equal to Minimum salary";
      missing.push("Max Salary (must be ≥ Min Salary)");
    }

    // 6. Experience
    if (!formData.experience || formData.experience.trim() === "") {
      errors.experience = "Please select the required experience level";
      missing.push("Experience Level Required (e.g. Fresher, 1-2 Years, etc.)");
    }

    // 7. Minimum Education
    if (!formData.minEducation || formData.minEducation.trim() === "") {
      errors.minEducation = "Minimum qualification is required";
      missing.push("Minimum Qualification / Education");
    }

    // 8. Description
    if (!formData.description || formData.description.trim().length < 15) {
      errors.description = "Job Description is required (min 15 characters)";
      missing.push("Job Description (at least 15 characters)");
    }

    // 9. Walk-in
    if (formData.isWalkIn) {
      if (!formData.walkInDate) {
        errors.walkInDate = "Walk-in interview date is required";
        missing.push("Walk-In Interview Date");
      }
      if (!formData.venue || formData.venue.trim().length < 5) {
        errors.venue = "Interview venue address is required";
        missing.push("Walk-In Interview Venue Address");
      }
    }

    setFormErrors(errors);
    setMissingFieldsList(missing);

    if (missing.length > 0) {
      setMissingModalOpen(true);
      toast.error(`Please fill in ${missing.length} required field${missing.length > 1 ? "s" : ""} to proceed`);
      return false;
    }

    return true;
  };

  const handleScrollToField = (fieldKeyword: string) => {
    const lower = fieldKeyword.toLowerCase();
    let targetId = "";
    if (lower.includes("company") || lower.includes("store") || lower.includes("business")) {
      targetId = companyMode === "store" ? "job-store-select" : "job-company-input";
    } else if (lower.includes("title")) {
      targetId = "job-title-input";
    } else if (lower.includes("category")) {
      targetId = "job-category-select";
    } else if (lower.includes("pincode")) {
      targetId = "job-pincode-input";
    } else if (lower.includes("city")) {
      targetId = "job-city-input";
    } else if (lower.includes("area") || lower.includes("locality")) {
      targetId = "job-area-input";
    } else if (lower.includes("salary") || lower.includes("pay")) {
      targetId = "job-minsalary-input";
    } else if (lower.includes("experience")) {
      targetId = "job-experience-select";
    } else if (lower.includes("qualification") || lower.includes("education")) {
      targetId = "job-education-select";
    } else if (lower.includes("description")) {
      targetId = "job-description-textarea";
    } else if (lower.includes("walk-in") || lower.includes("venue") || lower.includes("date")) {
      targetId = "job-walkin-section";
    }

    if (targetId) {
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.focus();
        }
      }, 150);
    }
  };

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
      const payload = {
        title: formData.title,
        jobCategoryId: formData.jobCategoryId || "it_software",
        subcategoryId: formData.subcategoryId || "General",
        openingsCount: Number(formData.openingsCount) || 1,
        companyName: formData.companyName,
        companyLogo: formData.companyLogo || undefined,
        companyIndustry: formData.companyIndustry,
        companySize: formData.companySize,
        companyDescription: formData.companyDescription,
        jobType: formData.jobType,
        workplaceType: formData.workplaceType,
        storeId: selectedStoreId || undefined,
        location: {
          remoteScope: formData.remoteScope,
          area: formData.area || "Madhapur",
          city: formData.city || "Hyderabad",
          pincode: formData.pincode || "500081",
          coordinates: [78.3871, 17.4486]
        },
        salary: {
          minSalary: Number(formData.minSalary) || 0,
          maxSalary: Number(formData.maxSalary) || 0,
          salaryPeriod: formData.salaryPeriod || "monthly",
          salaryDisclosed: formData.salaryDisclosed ?? true,
          negotiable: formData.negotiable ?? false,
          incentivesAvailable: formData.incentivesAvailable ?? false
        },
        candidateCriteria: {
          experience: formData.experience || "Fresher / Entry Level",
          fresherAllowed: formData.fresherAllowed ?? true,
          minEducation: formData.minEducation || "Graduate",
          skills: typeof formData.skills === "string" ? formData.skills.split(",").map(s => s.trim()).filter(Boolean) : [],
          languages: typeof formData.languages === "string" ? formData.languages.split(",").map(s => s.trim()).filter(Boolean) : []
        },
        jobDetails: {
          description: formData.description || formData.title,
          responsibilities: formData.responsibilities,
          requirements: formData.requirements,
          benefits: formData.benefits,
          workingDays: formData.workingDays || "5 Days (Mon-Fri)",
          shiftType: formData.shiftType || "Day Shift",
          workingHours: formData.workingHours || "9 AM - 6 PM"
        },
        walkInDetails: {
          isWalkIn: Boolean(formData.isWalkIn),
          walkInDate: formData.walkInDate || undefined,
          startTime: formData.startTime,
          endTime: formData.endTime,
          venue: formData.venue,
          contactPerson: formData.contactPerson,
          instructions: formData.instructions
        },
        isUrgent: Boolean(formData.isUrgent),
        isFeatured: Boolean(formData.isFeatured),
        screeningQuestions: typeof formData.screeningQuestions === "string" ? formData.screeningQuestions.split("\n").map(q => q.trim()).filter(Boolean) : [],
        status: "ACTIVE"
      };

      const res = await fetch("https://api.omeetso.in/api/v1/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      setIsSubmitting(false);

      if (json.success && json.data) {
        const createdId = json.data.id || json.data._id;
        createJobLocal({
          ...previewJobItem,
          id: createdId,
          candidateCriteria: {
            ...previewJobItem.candidateCriteria,
            experience: formData.experience || "Fresher / Entry Level"
          }
        });
        toast.success("Job posted successfully to backend!");
        nav({ to: "/job/$id", params: { id: createdId } });
      } else {
        const errorMsg = json.error?.message || "Failed to create job on server";
        toast.error(errorMsg);
      }
    } catch (err: any) {
      setIsSubmitting(false);
      console.error("Job publishing error:", err);
      const fallbackCreated = createJobLocal(previewJobItem);
      toast.info("Job saved locally (offline mode)");
      nav({ to: "/job/$id", params: { id: fallbackCreated.id } });
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
            type="button"
            onClick={() => {
              if (validateJobForm()) setStep("preview");
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-brand/10 hover:bg-indigo-brand/20 text-indigo-brand text-xs font-bold transition-all shadow-xs"
          >
            <Eye className="h-4 w-4" /> Preview Job
          </button>
        )}
      </div>

      {step === "form" ? (
        <div className="space-y-6 text-xs font-semibold">

          {/* COMPANY SELECTION */}
          <div id="job-company-section" className={`rounded-3xl border ${formErrors.companyName || formErrors.selectedStoreId ? "border-rose-500 bg-rose-500/5" : "border-border bg-card"} p-5 space-y-4 transition-colors`}>
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
                <label className="block text-muted-foreground mb-1 font-bold">Select Your Omeetso Store / Business *</label>
                <select
                  id="job-store-select"
                  value={selectedStoreId}
                  onChange={(e) => {
                    setSelectedStoreId(e.target.value);
                    setFormData({ ...formData, companyName: "Venkata Retail Store", companyLogo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200" });
                    if (formErrors.selectedStoreId) setFormErrors({ ...formErrors, selectedStoreId: "" });
                  }}
                  className={`w-full h-11 rounded-2xl border ${formErrors.selectedStoreId ? "border-rose-500 bg-rose-500/5" : "border-border bg-background"} px-3 font-bold text-foreground outline-none focus:border-indigo-brand`}
                >
                  <option value="">Select Business Profile...</option>
                  <option value="store_1">Venkata Retail Store (Verified)</option>
                  <option value="store_2">Hyderabad Digital Tech</option>
                </select>
                {formErrors.selectedStoreId && (
                  <p className="mt-1 text-[11px] font-bold text-rose-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {formErrors.selectedStoreId}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-muted-foreground mb-1 font-bold">Company / Business Name *</label>
                  <input
                    id="job-company-input"
                    type="text"
                    placeholder="e.g. ABC Technologies"
                    value={formData.companyName}
                    onChange={(e) => {
                      setFormData({ ...formData, companyName: e.target.value });
                      if (formErrors.companyName) setFormErrors({ ...formErrors, companyName: "" });
                    }}
                    className={`w-full h-11 rounded-2xl border ${formErrors.companyName ? "border-rose-500 bg-rose-500/5" : "border-border bg-background"} px-3 font-bold text-foreground outline-none focus:border-indigo-brand`}
                  />
                  {formErrors.companyName && (
                    <p className="mt-1 text-[11px] font-bold text-rose-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {formErrors.companyName}
                    </p>
                  )}
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
                id="job-title-input"
                type="text"
                placeholder="e.g. Senior React Developer / Sales Executive"
                value={formData.title}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value });
                  if (formErrors.title) setFormErrors({ ...formErrors, title: "" });
                }}
                className={`w-full h-11 rounded-2xl border ${formErrors.title ? "border-rose-500 bg-rose-500/5" : "border-border bg-background"} px-3 font-bold text-foreground outline-none focus:border-indigo-brand`}
              />
              {formErrors.title && (
                <p className="mt-1 text-[11px] font-bold text-rose-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {formErrors.title}
                </p>
              )}
            </div>

            <div id="job-category-section" className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-muted-foreground mb-1 font-bold">Job Category *</label>
                <select
                  id="job-category-select"
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
                  min="1"
                  value={formData.openingsCount}
                  onChange={(e) => setFormData({ ...formData, openingsCount: Math.max(1, Number(e.target.value)) })}
                  className="w-full h-11 rounded-2xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-brand"
                />
              </div>
              <div>
                <label className="block text-muted-foreground mb-1 font-bold">Area / Locality *</label>
                <input
                  id="job-area-input"
                  type="text"
                  placeholder="e.g. Madhapur / Hitec City"
                  value={formData.area}
                  onChange={(e) => {
                    setFormData({ ...formData, area: e.target.value });
                    if (formErrors.area) setFormErrors({ ...formErrors, area: "" });
                  }}
                  className={`w-full h-11 rounded-2xl border ${formErrors.area ? "border-rose-500 bg-rose-500/5" : "border-border bg-background"} px-3 font-bold text-foreground outline-none focus:border-indigo-brand`}
                />
                {formErrors.area && (
                  <p className="mt-1 text-[11px] font-bold text-rose-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {formErrors.area}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-muted-foreground mb-1 font-bold">City *</label>
                <input
                  id="job-city-input"
                  type="text"
                  placeholder="e.g. Hyderabad"
                  value={formData.city}
                  onChange={(e) => {
                    setFormData({ ...formData, city: e.target.value });
                    if (formErrors.city) setFormErrors({ ...formErrors, city: "" });
                  }}
                  className={`w-full h-11 rounded-2xl border ${formErrors.city ? "border-rose-500 bg-rose-500/5" : "border-border bg-background"} px-3 font-bold text-foreground outline-none focus:border-indigo-brand`}
                />
                {formErrors.city && (
                  <p className="mt-1 text-[11px] font-bold text-rose-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {formErrors.city}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-muted-foreground mb-1 font-bold">Postal PIN Code (6 Digits) *</label>
              <input
                id="job-pincode-input"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="e.g. 500081"
                value={formData.pincode}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setFormData({ ...formData, pincode: val });
                  if (formErrors.pincode) setFormErrors({ ...formErrors, pincode: "" });
                }}
                className={`w-full sm:w-1/3 h-11 rounded-2xl border ${formErrors.pincode ? "border-rose-500 bg-rose-500/5" : "border-border bg-background"} px-3 font-bold text-foreground outline-none focus:border-indigo-brand`}
              />
              {formErrors.pincode && (
                <p className="mt-1 text-[11px] font-bold text-rose-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {formErrors.pincode}
                </p>
              )}
            </div>
          </div>

          {/* SALARY & COMPENSATION */}
          <div id="job-salary-section" className="rounded-3xl border border-border bg-card p-5 space-y-4">
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-indigo-brand flex items-center gap-2">
              <IndianRupee className="h-4 w-4" /> 3. Salary & Pay Structure
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
                  id="job-minsalary-input"
                  type="number"
                  min="0"
                  value={formData.minSalary}
                  onChange={(e) => {
                    setFormData({ ...formData, minSalary: Number(e.target.value) });
                    if (formErrors.minSalary || formErrors.maxSalary) setFormErrors({ ...formErrors, minSalary: "", maxSalary: "" });
                  }}
                  className={`w-full h-11 rounded-2xl border ${formErrors.minSalary ? "border-rose-500 bg-rose-500/5" : "border-border bg-background"} px-3 font-bold text-foreground outline-none focus:border-indigo-brand`}
                />
                {formErrors.minSalary && (
                  <p className="mt-1 text-[11px] font-bold text-rose-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {formErrors.minSalary}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-muted-foreground mb-1 font-bold">Max Salary (₹)</label>
                <input
                  id="job-maxsalary-input"
                  type="number"
                  min="0"
                  value={formData.maxSalary}
                  onChange={(e) => {
                    setFormData({ ...formData, maxSalary: Number(e.target.value) });
                    if (formErrors.maxSalary) setFormErrors({ ...formErrors, maxSalary: "" });
                  }}
                  className={`w-full h-11 rounded-2xl border ${formErrors.maxSalary ? "border-rose-500 bg-rose-500/5" : "border-border bg-background"} px-3 font-bold text-foreground outline-none focus:border-indigo-brand`}
                />
                {formErrors.maxSalary && (
                  <p className="mt-1 text-[11px] font-bold text-rose-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {formErrors.maxSalary}
                  </p>
                )}
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
          <div id="job-walkin-section" className="rounded-3xl border border-border bg-card p-5 space-y-4">
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
                    <label className="block text-muted-foreground mb-1 font-bold">Walk-In Date *</label>
                    <input
                      type="date"
                      value={formData.walkInDate}
                      onChange={(e) => {
                        setFormData({ ...formData, walkInDate: e.target.value });
                        if (formErrors.walkInDate) setFormErrors({ ...formErrors, walkInDate: "" });
                      }}
                      className={`w-full h-11 rounded-2xl border ${formErrors.walkInDate ? "border-rose-500 bg-rose-500/5" : "border-border bg-background"} px-3 font-bold text-foreground outline-none`}
                    />
                    {formErrors.walkInDate && (
                      <p className="mt-1 text-[11px] font-bold text-rose-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {formErrors.walkInDate}
                      </p>
                    )}
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
                  <label className="block text-muted-foreground mb-1 font-bold">Walk-In Venue Address *</label>
                  <input
                    id="job-venue-input"
                    type="text"
                    placeholder="Full address of interview location..."
                    value={formData.venue}
                    onChange={(e) => {
                      setFormData({ ...formData, venue: e.target.value });
                      if (formErrors.venue) setFormErrors({ ...formErrors, venue: "" });
                    }}
                    className={`w-full h-11 rounded-2xl border ${formErrors.venue ? "border-rose-500 bg-rose-500/5" : "border-border bg-background"} px-3 font-bold text-foreground outline-none`}
                  />
                  {formErrors.venue && (
                    <p className="mt-1 text-[11px] font-bold text-rose-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {formErrors.venue}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* CANDIDATE CRITERIA & EXPERIENCE */}
          <div className="rounded-3xl border border-border bg-card p-5 space-y-4">
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-indigo-brand flex items-center gap-2">
              <GraduationCap className="h-4 w-4" /> 5. Candidate Criteria & Experience
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-muted-foreground mb-1 font-bold">
                  Experience Required *
                </label>
                <select
                  id="job-experience-select"
                  value={formData.experience}
                  onChange={(e) => {
                    setFormData({ ...formData, experience: e.target.value });
                    if (formErrors.experience) setFormErrors({ ...formErrors, experience: "" });
                  }}
                  className={`w-full h-11 rounded-2xl border ${formErrors.experience ? "border-rose-500 bg-rose-500/5" : "border-border bg-background"} px-3 font-bold text-foreground outline-none focus:border-indigo-brand`}
                >
                  <option value="">Select Required Experience…</option>
                  {EXPERIENCE_OPTIONS.map((exp) => (
                    <option key={exp} value={exp}>{exp}</option>
                  ))}
                </select>
                {formErrors.experience && (
                  <p className="mt-1 text-[11px] font-bold text-rose-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {formErrors.experience}
                  </p>
                )}

                {/* Popular Experience Quick Pills */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {["Fresher", "1-2 Years", "3-5 Years", "5+ Years"].map((pill) => (
                    <button
                      key={pill}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, experience: pill });
                        if (formErrors.experience) setFormErrors({ ...formErrors, experience: "" });
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${formData.experience.includes(pill)
                          ? "bg-indigo-brand text-white shadow-xs"
                          : "bg-secondary text-muted-foreground hover:bg-indigo-brand/10 hover:text-indigo-brand"
                        }`}
                    >
                      {pill}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground mb-1 font-bold">
                  Minimum Qualification *
                </label>
                <select
                  id="job-education-select"
                  value={formData.minEducation}
                  onChange={(e) => {
                    setFormData({ ...formData, minEducation: e.target.value });
                    if (formErrors.minEducation) setFormErrors({ ...formErrors, minEducation: "" });
                  }}
                  className={`w-full h-11 rounded-2xl border ${formErrors.minEducation ? "border-rose-500 bg-rose-500/5" : "border-border bg-background"} px-3 font-bold text-foreground outline-none focus:border-indigo-brand`}
                >
                  <option value="10th / Below">10th / Below</option>
                  <option value="12th Pass">12th Pass (Intermediate)</option>
                  <option value="Diploma / ITI">Diploma / ITI / Vocational</option>
                  <option value="Graduate">Graduate (Bachelor's Degree)</option>
                  <option value="Post Graduate">Post Graduate (Master's Degree)</option>
                  <option value="Doctorate">Doctorate / Ph.D.</option>
                  <option value="Any Qualification">Any Qualification</option>
                </select>
                {formErrors.minEducation && (
                  <p className="mt-1 text-[11px] font-bold text-rose-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {formErrors.minEducation}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-muted-foreground mb-1 font-bold">Key Skills (Comma Separated)</label>
                <input
                  type="text"
                  placeholder="e.g. React.js, Sales, Communication, Accounting"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  className="w-full h-11 rounded-2xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-brand text-xs"
                />
              </div>

              <div>
                <label className="block text-muted-foreground mb-1 font-bold">Languages Required</label>
                <input
                  type="text"
                  placeholder="e.g. English, Hindi, Telugu"
                  value={formData.languages}
                  onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                  className="w-full h-11 rounded-2xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-brand text-xs"
                />
              </div>
            </div>

            <div className="pt-1">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-foreground text-xs">
                <input
                  type="checkbox"
                  checked={formData.fresherAllowed}
                  onChange={(e) => setFormData({ ...formData, fresherAllowed: e.target.checked })}
                  className="h-4 w-4 accent-indigo-brand"
                />
                <span>Entry-Level / Fresher Candidates Welcome to Apply 🎓</span>
              </label>
            </div>
          </div>

          {/* DESCRIPTION & WORKING DETAILS */}
          <div className="rounded-3xl border border-border bg-card p-5 space-y-4">
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-indigo-brand flex items-center gap-2">
              <Briefcase className="h-4 w-4" /> 6. Job Description & Working Hours
            </h2>

            <div>
              <label className="block text-muted-foreground mb-1 font-bold">Job Description *</label>
              <textarea
                id="job-description-textarea"
                rows={4}
                placeholder="Explain the job role, day-to-day work, responsibilities, and perks (min 15 characters)..."
                value={formData.description}
                onChange={(e) => {
                  setFormData({ ...formData, description: e.target.value });
                  if (formErrors.description) setFormErrors({ ...formErrors, description: "" });
                }}
                className={`w-full rounded-2xl border ${formErrors.description ? "border-rose-500 bg-rose-500/5" : "border-border bg-background"} p-3 font-bold text-foreground outline-none focus:border-indigo-brand text-xs leading-relaxed`}
              />
              {formErrors.description && (
                <p className="mt-1 text-[11px] font-bold text-rose-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {formErrors.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-muted-foreground mb-1 font-bold text-xs">Working Days</label>
                <input
                  type="text"
                  placeholder="e.g. 5 Days (Mon-Fri)"
                  value={formData.workingDays}
                  onChange={(e) => setFormData({ ...formData, workingDays: e.target.value })}
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs font-bold outline-none"
                />
              </div>
              <div>
                <label className="block text-muted-foreground mb-1 font-bold text-xs">Shift Type</label>
                <input
                  type="text"
                  placeholder="e.g. Day Shift / Rotational"
                  value={formData.shiftType}
                  onChange={(e) => setFormData({ ...formData, shiftType: e.target.value })}
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs font-bold outline-none"
                />
              </div>
              <div>
                <label className="block text-muted-foreground mb-1 font-bold text-xs">Working Hours</label>
                <input
                  type="text"
                  placeholder="e.g. 9:30 AM - 6:30 PM"
                  value={formData.workingHours}
                  onChange={(e) => setFormData({ ...formData, workingHours: e.target.value })}
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs font-bold outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                if (validateJobForm()) setStep("preview");
              }}
              className="flex-1 h-12 rounded-2xl bg-indigo-brand text-white font-extrabold text-xs flex items-center justify-center gap-2 hover:bg-indigo-brand/90 transition-all shadow-md cursor-pointer"
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
              className="px-4 py-2 rounded-xl border border-border bg-card text-xs font-bold hover:bg-secondary flex items-center gap-1 cursor-pointer"
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
              className="w-1/3 h-12 rounded-2xl border border-border text-xs font-bold text-muted-foreground flex items-center justify-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Edit
            </button>

            <button
              type="button"
              onClick={() => {
                if (validateJobForm()) handlePublishJob();
              }}
              disabled={isSubmitting}
              className="w-2/3 h-12 rounded-2xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center gap-2 hover:bg-emerald-700 shadow-lg cursor-pointer"
            >
              {isSubmitting ? "Publishing Job..." : "Publish Job Now ✓"}
            </button>
          </div>
        </div>
      )}

      {/* Missing Fields Interactive Modal */}
      <MissingFieldsModal
        open={missingModalOpen}
        onClose={() => setMissingModalOpen(false)}
        missingItems={missingFieldsList}
        onScrollToField={handleScrollToField}
      />

    </div>
  );
}
