import React, { useState, useRef, useEffect } from "react";
import {
  X, CheckCircle2, ArrowRight, ArrowLeft, Upload, FileText,
  Loader2, Trash2, Sparkles, User, Briefcase,
  GraduationCap, Check, MapPin, Award, ShieldCheck,
  Zap, AlertCircle, ExternalLink, Globe, Linkedin, Github, Ban
} from "lucide-react";
import { JobItem, submitJobApplicationLocal, CandidateProfileItem, checkJobExperienceEligibility, EligibilityResult } from "@/lib/jobs";
import { uploadFile } from "@/lib/upload";
import { toast } from "sonner";
import { pushNotification } from "@/lib/account";
import { API_BASE } from "@/config/api";

interface ApplyJobModalProps {
  job: JobItem;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ApplyJobModal({ job, isOpen, onClose, onSuccess }: ApplyJobModalProps) {
  const [step, setStep] = useState<"form" | "screening" | "review" | "success">("form");
  const [loading, setLoading] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<CandidateProfileItem | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [ineligibleNotice, setIneligibleNotice] = useState<EligibilityResult | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    area: "",
    title: "",
    summary: "",
    experience: "Fresher",
    currentRole: "",
    currentCompany: "",
    currentSalary: undefined as number | undefined,
    expectedSalary: job.salary?.minSalary || undefined as number | undefined,
    noticePeriod: "Immediate",
    resumeUrl: "",
    resumeFileName: "",
    skills: [] as string[],
    skillsList: [] as any[],
    education: "",
    educations: [] as any[],
    college: "",
    portfolioUrl: "",
    linkedinUrl: "",
    githubUrl: "",
    certifications: [] as any[],
    workExperiences: [] as any[]
  });

  const [screeningAnswers, setScreeningAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen || typeof window === "undefined") return;

    setStep("form");
    setErrors({});
    setIneligibleNotice(null);

    // Load saved candidate profile
    const token = localStorage.getItem("omeetso_user_token");
    const loadProfile = async () => {
      try {
        const local = localStorage.getItem("omeetso_candidate_profile");
        if (local) {
          const parsed = JSON.parse(local);
          setProfile(parsed);
          setFormData((prev) => ({
            ...prev,
            name: parsed.fullName || prev.name,
            phone: parsed.phone || prev.phone,
            email: parsed.email || prev.email,
            city: parsed.city || prev.city,
            area: parsed.area || prev.area,
            title: parsed.title || prev.title,
            summary: parsed.summary || prev.summary,
            experience: parsed.experienceYears || prev.experience,
            currentRole: parsed.currentRole || prev.currentRole,
            currentCompany: parsed.currentCompany || prev.currentCompany,
            currentSalary: parsed.currentSalary || prev.currentSalary,
            expectedSalary: parsed.expectedSalary || prev.expectedSalary,
            noticePeriod: parsed.noticePeriod || prev.noticePeriod,
            resumeUrl: parsed.resumeUrl || prev.resumeUrl,
            resumeFileName: parsed.resumeFileName || prev.resumeFileName,
            skills: parsed.skills || prev.skills,
            skillsList: parsed.skillsList || prev.skillsList,
            education: parsed.education || (parsed.educations?.[0]?.qualification) || prev.education,
            educations: parsed.educations || prev.educations,
            college: parsed.educations?.[0]?.college || prev.college,
            portfolioUrl: parsed.portfolioUrl || prev.portfolioUrl,
            linkedinUrl: parsed.linkedinUrl || prev.linkedinUrl,
            githubUrl: parsed.githubUrl || prev.githubUrl,
            certifications: parsed.certifications || prev.certifications,
            workExperiences: parsed.workExperiences || prev.workExperiences
          }));
        }

        const res = await fetch(`${API_BASE}/jobs/candidate/profile`, {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            const data = json.data;
            setProfile(data);
            setFormData((prev) => ({
              ...prev,
              name: data.fullName || prev.name,
              phone: data.phone || prev.phone,
              email: data.email || prev.email,
              city: data.city || prev.city,
              area: data.area || prev.area,
              title: data.title || prev.title,
              summary: data.summary || prev.summary,
              experience: data.experienceYears || prev.experience,
              currentRole: data.currentRole || prev.currentRole,
              currentCompany: data.currentCompany || prev.currentCompany,
              currentSalary: data.currentSalary || prev.currentSalary,
              expectedSalary: data.expectedSalary || prev.expectedSalary,
              noticePeriod: data.noticePeriod || prev.noticePeriod,
              resumeUrl: data.resumeUrl || prev.resumeUrl,
              resumeFileName: data.resumeFileName || prev.resumeFileName,
              skills: data.skills || prev.skills,
              skillsList: data.skillsList || prev.skillsList,
              education: data.education || (data.educations?.[0]?.qualification) || prev.education,
              educations: data.educations || prev.educations,
              college: data.educations?.[0]?.college || prev.college,
              portfolioUrl: data.portfolioUrl || prev.portfolioUrl,
              linkedinUrl: data.linkedinUrl || prev.linkedinUrl,
              githubUrl: data.githubUrl || prev.githubUrl,
              certifications: data.certifications || prev.certifications,
              workExperiences: data.workExperiences || prev.workExperiences
            }));
          }
        }
      } catch { }
    };
    loadProfile();
  }, [isOpen]);

  if (!isOpen) return null;

  const validateDetails = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.name || !formData.name.trim()) {
      errs.name = "Full name is required.";
    }

    if (!formData.phone || !formData.phone.trim()) {
      errs.phone = "Mobile phone number is required.";
    } else {
      const cleanPhone = formData.phone.replace(/[^0-9]/g, "");
      if (cleanPhone.length < 10) {
        errs.phone = "Please enter a valid 10-digit mobile number.";
      }
    }

    if (!formData.email || !formData.email.trim()) {
      errs.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = "Please enter a valid email address.";
    }

    setErrors(errs);

    if (Object.keys(errs).length > 0) {
      toast.error("Please fill in all required details before continuing.");
      return false;
    }

    return true;
  };

  const handleResumeFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Resume file size must be less than 10MB.");
      return;
    }

    setUploadingResume(true);
    try {
      const url = await uploadFile(file, "resumes");
      const finalUrl = url || await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => resolve(URL.createObjectURL(file));
        reader.readAsDataURL(file);
      });

      setFormData((prev) => {
        const updated = {
          ...prev,
          resumeUrl: finalUrl,
          resumeFileName: file.name,
        };
        try {
          const local = localStorage.getItem("omeetso_candidate_profile");
          const parsed = local ? JSON.parse(local) : {};
          localStorage.setItem("omeetso_candidate_profile", JSON.stringify({
            ...parsed,
            resumeUrl: finalUrl,
            resumeFileName: file.name,
          }));
        } catch { }
        return updated;
      });
      toast.success(`Resume "${file.name}" attached successfully!`);
    } catch {
      const localUrl = URL.createObjectURL(file);
      setFormData((prev) => {
        const updated = {
          ...prev,
          resumeUrl: localUrl,
          resumeFileName: file.name,
        };
        try {
          const local = localStorage.getItem("omeetso_candidate_profile");
          const parsed = local ? JSON.parse(local) : {};
          localStorage.setItem("omeetso_candidate_profile", JSON.stringify({
            ...parsed,
            resumeUrl: localUrl,
            resumeFileName: file.name,
          }));
        } catch { }
        return updated;
      });
      toast.success(`Resume "${file.name}" attached.`);
    } finally {
      setUploadingResume(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleScreeningAnswerChange = (q: string, val: string) => {
    setScreeningAnswers((prev) => ({ ...prev, [q]: val }));
  };

  const handleNextStep = () => {
    if (step === "form") {
      if (!validateDetails()) return;
      const eligibility = checkJobExperienceEligibility(job.candidateCriteria, formData.experience);
      if (!eligibility.isEligible) {
        setIneligibleNotice(eligibility);
        return;
      }
      if (job.screeningQuestions && job.screeningQuestions.length > 0) {
        setStep("screening");
      } else {
        setStep("review");
      }
    } else if (step === "screening") {
      setStep("review");
    }
  };

  const handleSubmitFinal = async () => {
    if (!validateDetails()) {
      setStep("form");
      return;
    }

    const eligibility = checkJobExperienceEligibility(job.candidateCriteria, formData.experience);
    if (!eligibility.isEligible) {
      setIneligibleNotice(eligibility);
      return;
    }

    setLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("omeetso_user_token") : null;
      const formattedAnswers = Object.entries(screeningAnswers).map(([question, answer]) => ({ question, answer }));

      let serverApp: any = null;
      if (token) {
        try {
          const res = await fetch(`${API_BASE}/jobs/apply`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              jobId: job.id,
              customSnapshot: formData,
              screeningAnswers: formattedAnswers
            })
          });
          const json = await res.json();
          if (res.ok && json.success) {
            serverApp = json.data;
          } else if (json.error?.message && json.error.message.toLowerCase().includes("already applied")) {
            toast.info("You have already applied for this position.");
            setLoading(false);
            setStep("success");
            onSuccess();
            return;
          } else if (json.error?.message && (json.error.message.toLowerCase().includes("not eligible") || json.error.message.toLowerCase().includes("fresher"))) {
            setLoading(false);
            setIneligibleNotice({
              isEligible: false,
              requiredExpDisplay: job.candidateCriteria?.experience || "Required Experience",
              candidateExpDisplay: formData.experience || "Fresher",
              message: json.error.message
            });
            return;
          }
        } catch (serverErr) {
          console.warn("[Job Apply] Server fetch skipped:", serverErr);
        }
      }

      submitJobApplicationLocal({
        id: serverApp?.id || serverApp?._id || `APP-${Date.now()}`,
        jobId: job.id,
        employerId: job.employerId || "emp-default",
        job: { title: job.title, companyName: job.companyName, location: job.location, salary: job.salary },
        applicantProfileSnapshot: formData,
        screeningAnswers: formattedAnswers,
        status: "APPLIED"
      });

      pushNotification({
        id: `job-app-${job.id}-${Date.now()}`,
        category: "system",
        title: `Job Application Submitted: ${job.title}`,
        body: `Your application for "${job.title}" at ${job.companyName} was submitted successfully.`,
        destination: "/my/jobs",
        destinationLabel: "View Applications",
        read: false,
        time: Date.now(),
      });

      toast.success("Application submitted successfully!");
      setLoading(false);
      setStep("success");
      onSuccess();
    } catch (err: any) {
      setLoading(false);
      toast.error(err?.message || "Failed to submit application");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm safe-t font-sans">
      <div className="w-full max-w-xl rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="text-base font-black text-foreground">Apply for {job.title}</h2>
            <p className="text-xs text-muted-foreground font-semibold">{job.companyName} • {job.location?.city || "Hyderabad"}</p>
          </div>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full hover:bg-secondary transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Manual Resume Quick Link Banner */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 border border-indigo-500/20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <Sparkles className="h-4 w-4 text-amber-300" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-foreground truncate">
                {formData.name ? `${formData.name}'s ATS Profile` : "Manual Resume Profile"}
              </p>
              <p className="text-[10px] text-muted-foreground font-semibold truncate">
                {formData.skills && formData.skills.length > 0 ? `${formData.skills.length} skills listed • ` : ""}
                {formData.experience || "Fresher"}
              </p>
            </div>
          </div>
          <a
            href={`/my/profile/jobs?returnTo=/job/${job.id}`}
            className="px-3 py-1.5 rounded-xl bg-card border border-border hover:bg-secondary text-indigo-600 dark:text-indigo-400 font-extrabold text-[11px] shrink-0 flex items-center gap-1 shadow-xs transition-colors"
          >
            <span>Edit Full Resume</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* STEP 1: APPLICANT FORM */}
        {step === "form" && (
          <div className="space-y-4 text-xs font-semibold">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                1. Candidate Information
              </h3>
              <span className="text-[11px] text-muted-foreground">* Required fields</span>
            </div>

            {/* Name & Title */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-muted-foreground mb-1 font-bold">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name || ""}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: "" });
                  }}
                  placeholder="e.g. Rahul Sharma"
                  className={`w-full h-10 rounded-xl border ${errors.name ? "border-rose-500 bg-rose-50/10" : "border-border bg-background"} px-3 font-bold text-foreground outline-none focus:border-indigo-600`}
                />
                {errors.name && <p className="text-[11px] text-rose-500 font-bold mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-muted-foreground mb-1 font-bold">Professional Title</label>
                <input
                  type="text"
                  value={formData.title || ""}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Software Engineer, Sales Manager"
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-600"
                />
              </div>
            </div>

            {/* Phone & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-muted-foreground mb-1 font-bold">
                  Mobile Phone <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone || ""}
                  onChange={(e) => {
                    setFormData({ ...formData, phone: e.target.value });
                    if (errors.phone) setErrors({ ...errors, phone: "" });
                  }}
                  placeholder="e.g. 9876543210"
                  className={`w-full h-10 rounded-xl border ${errors.phone ? "border-rose-500 bg-rose-50/10" : "border-border bg-background"} px-3 font-bold text-foreground outline-none focus:border-indigo-600`}
                />
                {errors.phone && <p className="text-[11px] text-rose-500 font-bold mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-muted-foreground mb-1 font-bold">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errors.email) setErrors({ ...errors, email: "" });
                  }}
                  placeholder="e.g. rahul@example.com"
                  className={`w-full h-10 rounded-xl border ${errors.email ? "border-rose-500 bg-rose-50/10" : "border-border bg-background"} px-3 font-bold text-foreground outline-none focus:border-indigo-600`}
                />
                {errors.email && <p className="text-[11px] text-rose-500 font-bold mt-1">{errors.email}</p>}
              </div>
            </div>

            {/* City & Total Experience */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-muted-foreground mb-1 font-bold">Current City</label>
                <input
                  type="text"
                  value={formData.city || ""}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g. Hyderabad"
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-muted-foreground mb-1 font-bold">Total Experience</label>
                <select
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="w-full h-10 rounded-xl border border-border bg-background px-2 font-bold text-foreground outline-none focus:border-indigo-600"
                >
                  <option value="Fresher">Fresher / No Exp</option>
                  <option value="1-2 Years">1-2 Years</option>
                  <option value="3-5 Years">3-5 Years</option>
                  <option value="5-8 Years">5-8 Years</option>
                  <option value="8+ Years">8+ Years</option>
                </select>
                {!checkJobExperienceEligibility(job.candidateCriteria, formData.experience).isEligible && (
                  <p className="text-[11px] text-rose-500 font-bold mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Requires {job.candidateCriteria?.experience || "Experience"} (Freshers ineligible)</span>
                  </p>
                )}
              </div>
            </div>

            {/* Current Company & Role */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-muted-foreground mb-1 font-bold">Current / Previous Company</label>
                <input
                  type="text"
                  value={formData.currentCompany || ""}
                  onChange={(e) => setFormData({ ...formData, currentCompany: e.target.value })}
                  placeholder="e.g. Infosys, TCS, Freelance"
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-muted-foreground mb-1 font-bold">Current / Last Role</label>
                <input
                  type="text"
                  value={formData.currentRole || ""}
                  onChange={(e) => setFormData({ ...formData, currentRole: e.target.value })}
                  placeholder="e.g. Junior Developer"
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-600"
                />
              </div>
            </div>

            {/* Expected Salary & Notice Period */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-muted-foreground mb-1 font-bold">Expected Monthly Salary (₹)</label>
                <input
                  type="number"
                  value={formData.expectedSalary !== undefined ? formData.expectedSalary : ""}
                  onChange={(e) => setFormData({ ...formData, expectedSalary: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="e.g. 45000"
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-muted-foreground mb-1 font-bold">Notice Period</label>
                <select
                  value={formData.noticePeriod}
                  onChange={(e) => setFormData({ ...formData, noticePeriod: e.target.value })}
                  className="w-full h-10 rounded-xl border border-border bg-background px-2 font-bold text-foreground outline-none focus:border-indigo-600"
                >
                  <option value="Immediate">Immediate</option>
                  <option value="15 Days">15 Days</option>
                  <option value="30 Days">30 Days</option>
                  <option value="60 Days">60 Days</option>
                  <option value="90 Days">90 Days</option>
                </select>
              </div>
            </div>

            {/* RESUME SELECTION: UPLOADED RESUME (PDF/DOCX) OR MANUAL ATS RESUME */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                  Resume & Application Documents
                </label>
                <span className="text-[11px] text-muted-foreground font-semibold">Upload PDF/DOCX or use Manual Resume</span>
              </div>

              {/* METHOD 1: UPLOADED RESUME FILE */}
              <div className="rounded-2xl border border-border bg-card p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-foreground text-xs">Uploaded Resume File</h4>
                      <p className="text-[10px] text-muted-foreground font-semibold">Standard PDF or Word Document</p>
                    </div>
                  </div>

                  {formData.resumeUrl && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-black flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Attached
                    </span>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={handleResumeFileChange}
                />

                {formData.resumeFileName || formData.resumeUrl ? (
                  <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-extrabold text-foreground truncate text-xs block">
                          {formData.resumeFileName || "Uploaded Resume.pdf"}
                        </span>
                        <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
                          Attached to this job application
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {formData.resumeUrl && (
                        <a
                          href={formData.resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-card border border-border hover:bg-secondary text-[11px] font-bold text-foreground flex items-center gap-1 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3 text-indigo-600" />
                          <span>View</span>
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingResume}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-500/30 hover:bg-indigo-100 text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 transition-colors"
                      >
                        <Upload className="w-3 h-3" />
                        <span>{uploadingResume ? "Uploading..." : "Replace"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, resumeUrl: "", resumeFileName: "" }));
                          toast.success("Uploaded resume removed from application.");
                        }}
                        className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-500/20 hover:bg-rose-100 text-[11px] font-extrabold text-rose-600 dark:text-rose-400 flex items-center gap-1 transition-colors"
                        title="Remove uploaded resume"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl border-2 border-dashed border-border bg-secondary/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <p className="text-[11px] text-muted-foreground font-semibold">
                      Upload your PDF or DOCX file (Max 10MB)
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingResume}
                      className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95 shrink-0"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingResume ? "Uploading..." : "Upload PDF/DOCX Resume"}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* VISUAL "OR / AND" SEPARATOR */}
              <div className="flex items-center gap-3 py-1">
                <div className="flex-1 border-t border-border/80"></div>
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground bg-secondary/80 px-3 py-0.5 rounded-full border border-border shadow-2xs">
                  OR COMBINE WITH MANUAL ATS RESUME
                </span>
                <div className="flex-1 border-t border-border/80"></div>
              </div>

              {/* METHOD 2: MANUAL OMEETSO RESUME PROFILE */}
              <div className="rounded-2xl border border-indigo-500/30 bg-indigo-50/20 dark:bg-indigo-950/20 p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black">
                      <Sparkles className="w-4 h-4 text-amber-300" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-foreground text-xs">Manual Omeetso Resume Profile</h4>
                      <p className="text-[10px] text-muted-foreground font-semibold">10-Section ATS Verified Profile</p>
                    </div>
                  </div>

                  {(formData.skills?.length > 0 || formData.workExperiences?.length > 0 || formData.educations?.length > 0) && (
                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 text-[10px] font-black flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Active Profile
                    </span>
                  )}
                </div>

                {/* Profile Summary Snapshot Details */}
                {(formData.skills?.length > 0 || formData.workExperiences?.length > 0 || formData.educations?.length > 0 || formData.summary) ? (
                  <div className="p-3 rounded-xl border border-indigo-500/20 bg-card space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div>
                        <span className="font-black text-foreground">{formData.name || "Candidate"}</span>
                        {formData.title && <span className="text-muted-foreground font-semibold"> • {formData.title}</span>}
                      </div>
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded">
                        {formData.experience || "Fresher"}
                      </span>
                    </div>

                    {/* Key Skills Chips */}
                    {formData.skills && formData.skills.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-muted-foreground">Skills:</span>
                        <div className="flex flex-wrap gap-1">
                          {formData.skills.slice(0, 8).map((skill, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-md bg-secondary text-foreground font-bold text-[10px] border border-border">
                              {skill}
                            </span>
                          ))}
                          {formData.skills.length > 8 && (
                            <span className="px-1.5 py-0.5 rounded-md bg-secondary text-muted-foreground text-[10px] font-bold">
                              +{formData.skills.length - 8} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Experience & Education Count */}
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-semibold pt-1 border-t border-border/60">
                      {formData.workExperiences?.length > 0 && (
                        <span>💼 {formData.workExperiences.length} Experience(s) listed</span>
                      )}
                      {formData.educations?.length > 0 && (
                        <span>🎓 {formData.educations.length} Qualification(s)</span>
                      )}
                    </div>

                    {/* Action Controls for Manual Resume */}
                    <div className="flex items-center justify-between pt-2 border-t border-border/60">
                      <a
                        href={`/my/profile/jobs?returnTo=/job/${job.id}`}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Edit Manual Resume</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            skills: [],
                            skillsList: [],
                            educations: [],
                            education: "",
                            workExperiences: [],
                            summary: "",
                            certifications: [],
                            portfolioUrl: "",
                            linkedinUrl: "",
                            githubUrl: ""
                          }));
                          toast.success("Manual resume profile details cleared from application.");
                        }}
                        className="px-2.5 py-1.5 rounded-lg border border-border bg-card hover:bg-secondary text-muted-foreground hover:text-rose-500 font-bold text-xs flex items-center gap-1 transition-colors"
                        title="Clear manual profile data"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove Manual Data</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl border border-dashed border-border bg-card/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-foreground">No Manual ATS Resume configured</p>
                      <p className="text-[11px] text-muted-foreground">
                        Build your comprehensive 10-section resume with education, work history, and skills.
                      </p>
                    </div>
                    <a
                      href={`/my/profile/jobs?returnTo=/job/${job.id}`}
                      className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95 shrink-0"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Build Manual Resume</span>
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleNextStep}
                className="w-full h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
              >
                <span>{job.screeningQuestions && job.screeningQuestions.length > 0 ? "Continue to Screening" : "Review Application"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: SCREENING QUESTIONS */}
        {step === "screening" && (
          <div className="space-y-4 text-xs font-semibold">
            <h3 className="text-xs font-black uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
              2. Employer Screening Questions
            </h3>
            {job.screeningQuestions?.map((q, idx) => (
              <div key={idx} className="space-y-1">
                <label className="block text-foreground font-bold">{q}</label>
                <textarea
                  rows={2}
                  value={screeningAnswers[q] || ""}
                  onChange={(e) => setScreeningAnswers({ ...screeningAnswers, [q]: e.target.value })}
                  placeholder="Type your answer..."
                  className="w-full rounded-xl border border-border bg-background p-2.5 font-bold text-foreground outline-none focus:border-indigo-600"
                />
              </div>
            ))}

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep("form")}
                className="w-1/3 h-11 rounded-2xl border border-border text-xs font-bold text-muted-foreground hover:bg-secondary flex items-center justify-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="w-2/3 h-11 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md"
              >
                Review Application <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: REVIEW APPLICATION */}
        {step === "review" && (
          <div className="space-y-4 text-xs font-semibold">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                3. Final Application Review
              </h3>
              <span className="text-[11px] text-muted-foreground font-semibold">Verify submission details</span>
            </div>
            
            {/* Candidate Identity & Contact Card */}
            <div className="p-4 rounded-2xl border border-border bg-secondary/20 space-y-2.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Candidate Name:</span>
                <span className="font-black text-foreground">{formData.name}</span>
              </div>
              {formData.title && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Professional Title:</span>
                  <span className="font-bold text-foreground">{formData.title}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Contact Details:</span>
                <span className="font-bold text-foreground">{formData.phone} • {formData.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Location & Experience:</span>
                <span className="font-bold text-foreground">{formData.city || "Not specified"} • {formData.experience}</span>
              </div>
              {formData.currentCompany && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Company:</span>
                  <span className="font-bold text-foreground">{formData.currentRole ? `${formData.currentRole} at ${formData.currentCompany}` : formData.currentCompany}</span>
                </div>
              )}
              {formData.expectedSalary && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expected Salary:</span>
                  <span className="font-black text-emerald-600">₹{formData.expectedSalary.toLocaleString("en-IN")} / Mo</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Notice Period:</span>
                <span className="font-bold text-foreground">{formData.noticePeriod}</span>
              </div>
            </div>

            {/* Resume Methods Review Box */}
            <div className="space-y-2.5">
              {/* 1. Uploaded File Status */}
              <div className="p-3.5 rounded-2xl border border-border bg-card flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    formData.resumeUrl || formData.resumeFileName ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground"
                  }`}>
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-foreground truncate">
                      {formData.resumeFileName ? `Uploaded: ${formData.resumeFileName}` : "No Resume File Attached"}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-semibold">
                      {formData.resumeUrl ? "Will be sent to employer as attachment" : "Optional if manual profile is provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {formData.resumeUrl && (
                    <>
                      <a
                        href={formData.resumeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-1 rounded-lg bg-secondary text-[11px] font-bold text-foreground hover:bg-secondary/80 flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3 text-indigo-600" /> View
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, resumeUrl: "", resumeFileName: "" }));
                          toast.success("Uploaded resume removed.");
                        }}
                        className="p-1.5 text-muted-foreground hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Remove uploaded resume"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* 2. Manual ATS Profile Snapshot Status */}
              <div className="p-3.5 rounded-2xl border border-border bg-card space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4 text-amber-300" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-foreground truncate">Manual ATS Resume Profile</p>
                      <p className="text-[10px] text-muted-foreground font-semibold">
                        {(formData.skills?.length > 0 || formData.workExperiences?.length > 0 || formData.educations?.length > 0)
                          ? `${formData.skills?.length || 0} skills • ${formData.workExperiences?.length || 0} exp • ${formData.educations?.length || 0} edu`
                          : "Empty (No manual details attached)"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {(formData.skills?.length > 0 || formData.workExperiences?.length > 0 || formData.educations?.length > 0) && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            skills: [],
                            skillsList: [],
                            educations: [],
                            education: "",
                            workExperiences: [],
                            summary: "",
                            certifications: []
                          }));
                          toast.success("Manual profile details cleared.");
                        }}
                        className="px-2 py-1 rounded-lg text-muted-foreground hover:text-rose-500 text-[11px] font-bold border border-border hover:bg-rose-50 transition-colors flex items-center gap-1"
                        title="Clear manual profile"
                      >
                        <Trash2 className="w-3 h-3" /> Remove Manual Data
                      </button>
                    )}
                  </div>
                </div>

                {/* Skills Preview */}
                {formData.skills && formData.skills.length > 0 && (
                  <div className="pt-1.5 border-t border-border/50">
                    <div className="flex flex-wrap gap-1">
                      {formData.skills.map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-secondary text-foreground border border-border text-[10px] font-bold">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education Preview */}
                {formData.educations && formData.educations.length > 0 && (
                  <div className="pt-1.5 border-t border-border/50 space-y-1">
                    {formData.educations.map((edu: any, idx: number) => (
                      <p key={idx} className="text-[11px] font-bold text-foreground">
                        🎓 {edu.qualification} {edu.college ? `— ${edu.college}` : ""} {edu.completionYear ? `(${edu.completionYear})` : ""}
                      </p>
                    ))}
                  </div>
                )}

                {/* Work History Preview */}
                {formData.workExperiences && formData.workExperiences.length > 0 && (
                  <div className="pt-1.5 border-t border-border/50 space-y-1">
                    {formData.workExperiences.map((exp: any, idx: number) => (
                      <p key={idx} className="text-[11px] font-bold text-foreground">
                        💼 {exp.jobTitle} at {exp.companyName} {exp.startDate ? `(${exp.startDate} - ${exp.isCurrentlyWorking ? "Present" : exp.endDate || ""})` : ""}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {Object.keys(screeningAnswers).length > 0 && (
              <div className="p-3 rounded-2xl border border-border bg-card space-y-2">
                <p className="text-[11px] font-bold text-muted-foreground uppercase">Answers to Screening Questions</p>
                {Object.entries(screeningAnswers).map(([q, a]) => (
                  <div key={q} className="text-xs">
                    <span className="font-bold text-foreground">{q}: </span>
                    <span className="text-muted-foreground">{a || "No answer provided"}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(job.screeningQuestions && job.screeningQuestions.length > 0 ? "screening" : "form")}
                className="w-1/3 h-11 rounded-2xl border border-border text-xs font-bold text-muted-foreground hover:bg-secondary flex items-center justify-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" /> Edit Details
              </button>
              <button
                type="button"
                onClick={handleSubmitFinal}
                disabled={loading}
                className="w-2/3 h-11 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Submitting Application...</span>
                  </>
                ) : (
                  <span>Submit Application ✓</span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: SUCCESS CONFIRMATION MODAL VIEW */}
        {step === "success" && (
          <div className="py-4 text-center space-y-5">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-500/15 text-emerald-600 ring-8 ring-emerald-500/10 animate-in zoom-in-95 duration-300">
              <CheckCircle2 className="h-12 w-12 stroke-[2.5]" />
            </div>
            
            <div className="space-y-1.5">
              <h3 className="text-xl font-black text-foreground">Application Submitted Successfully!</h3>
              <p className="text-xs text-muted-foreground font-semibold max-w-sm mx-auto">
                Your full resume profile and screening responses have been delivered to <span className="font-extrabold text-foreground">{job.companyName}</span>.
              </p>
            </div>

            {/* Application Summary Card */}
            <div className="rounded-2xl border border-border bg-card p-4 text-left space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground font-bold">Applied Position</span>
                <span className="font-black text-foreground">{job.title}</span>
              </div>
              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground font-bold">Company</span>
                <span className="font-extrabold text-foreground">{job.companyName}</span>
              </div>
              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground font-bold">Location</span>
                <span className="font-semibold text-foreground">{job.location?.city || "Hyderabad"}</span>
              </div>
              <div className="flex items-center justify-between pt-0.5">
                <span className="text-muted-foreground font-bold">Status</span>
                <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-black bg-emerald-500/15 text-emerald-700 border border-emerald-500/30">
                  <Check className="w-3 h-3 stroke-[3]" /> Applied
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
              <a
                href="/my/jobs"
                className="w-full sm:w-1/2 h-11 rounded-2xl border border-indigo-600/30 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>View My Applications</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <button
                onClick={onClose}
                className="w-full sm:w-1/2 h-11 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}

      </div>

      {/* INELIGIBILITY POP-UP MODAL */}
      {ineligibleNotice && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-rose-500/30 bg-card p-6 shadow-2xl space-y-4 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 ring-8 ring-rose-500/10">
              <Ban className="h-8 w-8 stroke-[2.5]" />
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-black text-foreground">
                You Are Not Eligible For This Job
              </h3>
              <p className="text-xs text-muted-foreground font-semibold leading-relaxed">
                {ineligibleNotice.message}
              </p>
            </div>

            {/* Criteria Breakdown */}
            <div className="rounded-2xl border border-border bg-secondary/30 p-3.5 text-left text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-bold">Required Experience:</span>
                <span className="font-black text-indigo-600 dark:text-indigo-400">
                  {ineligibleNotice.requiredExpDisplay}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-border/50 pt-2">
                <span className="text-muted-foreground font-bold">Your Profile Experience:</span>
                <span className="font-extrabold text-rose-500">
                  {ineligibleNotice.candidateExpDisplay}
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <a
                href={`/my/profile/jobs?returnTo=/job/${job.id}`}
                className="w-full h-11 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md transition-colors"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Update Resume Profile</span>
              </a>
              <button
                type="button"
                onClick={() => setIneligibleNotice(null)}
                className="w-full h-10 rounded-2xl border border-border text-xs font-bold text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
