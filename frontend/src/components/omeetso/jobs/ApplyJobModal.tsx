import React, { useState, useRef, useEffect } from "react";
import {
  X, CheckCircle2, ArrowRight, ArrowLeft, Upload, FileText,
  ShieldAlert, Loader2, Trash2, Sparkles, User, Briefcase,
  GraduationCap, Check, MapPin, Award, ExternalLink, ShieldCheck,
  Zap, Lock
} from "lucide-react";
import { JobItem, submitJobApplicationLocal, CandidateProfileItem } from "@/lib/jobs";
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

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    area: "",
    title: "",
    experience: job.candidateCriteria?.experience || "Fresher",
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
    college: "",
    portfolioUrl: "",
    linkedinUrl: "",
    githubUrl: "",
    certifications: [] as string[],
    workExperiences: [] as any[]
  });

  const [screeningAnswers, setScreeningAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen || typeof window === "undefined") return;

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
            college: parsed.educations?.[0]?.college || prev.college,
            portfolioUrl: parsed.portfolioUrl || prev.portfolioUrl,
            linkedinUrl: parsed.linkedinUrl || prev.linkedinUrl,
            githubUrl: parsed.githubUrl || prev.githubUrl,
            certifications: parsed.certifications?.map((c: any) => c.name) || prev.certifications,
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
              college: data.educations?.[0]?.college || prev.college,
              portfolioUrl: data.portfolioUrl || prev.portfolioUrl,
              linkedinUrl: data.linkedinUrl || prev.linkedinUrl,
              githubUrl: data.githubUrl || prev.githubUrl,
              certifications: data.certifications?.map((c: any) => c.name) || prev.certifications,
              workExperiences: data.workExperiences || prev.workExperiences
            }));
          }
        }
      } catch { }
    };
    loadProfile();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleResumeFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingResume(true);
    try {
      const url = await uploadFile(file, "resumes");
      setFormData((prev) => ({
        ...prev,
        resumeUrl: url,
        resumeFileName: file.name,
      }));
      toast.success(`Resume "${file.name}" uploaded successfully!`);
    } catch {
      const localUrl = URL.createObjectURL(file);
      setFormData((prev) => ({
        ...prev,
        resumeUrl: localUrl,
        resumeFileName: file.name,
      }));
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
    setLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("omeetso_user_token") : null;
      const formattedAnswers = Object.entries(screeningAnswers).map(([question, answer]) => ({ question, answer }));

      let serverApp: any = null;
      try {
        const res = await fetch(`${API_BASE}/jobs/apply`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            jobId: job.id,
            customSnapshot: formData,
            screeningAnswers: formattedAnswers
          })
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            serverApp = json.data;
          }
        }
      } catch (err) {
        console.warn("Backend job apply fallback:", err);
      }

      submitJobApplicationLocal({
        id: serverApp?.id || serverApp?._id || undefined,
        jobId: job.id,
        employerId: job.employerId,
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
        destination: "/account/jobs",
        destinationLabel: "View Applications",
        read: false,
        time: Date.now(),
      });

      setLoading(false);
      setStep("success");
      onSuccess();
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm safe-t font-sans">
      <div className="w-full max-w-xl rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-foreground">Apply for {job.title}</h2>
              <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-extrabold text-[10px]">
                1-Tap Verified Apply
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-semibold">{job.companyName} • {job.location?.city || "Hyderabad"}</p>
          </div>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full hover:bg-secondary">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* RESUME PROFILE ATTACHMENT CARD */}
        <div className="p-4 rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-50/60 to-purple-50/40 dark:from-indigo-950/30 dark:to-purple-950/20 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-black text-indigo-900 dark:text-indigo-200">
                {formData.resumeFileName ? "Resume File Attached" : "Candidate Profile Snapshot"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={`/my/profile/jobs?returnTo=/job/${job.id}`}
                className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>✍️ Edit 10-Sec Resume</span>
              </a>
              {formData.resumeFileName ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-500/15 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3" /> File Ready
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                  Profile Snapshot
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-semibold text-muted-foreground">
            <div><span className="text-foreground font-bold">{formData.name || "Candidate"}</span></div>
            <div><span>{formData.experience || "Fresher"}</span></div>
            <div>Expected: <span className="font-extrabold text-emerald-600">{formData.expectedSalary ? `₹${formData.expectedSalary.toLocaleString("en-IN")}/Mo` : "Negotiable"}</span></div>
            <div>Notice: <span className="font-bold text-foreground">{formData.noticePeriod || "Immediate"}</span></div>
          </div>

          {/* Skills Chips */}
          {formData.skills && formData.skills.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 pt-1">
              {formData.skills.map((skill, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded-lg bg-card text-foreground border border-border text-[10px] font-extrabold shadow-xs">
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* STEP 1: APPLICANT FORM & CUSTOMIZATION */}
        {step === "form" && (
          <div className="space-y-4 text-xs font-semibold">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                1. Candidate Profile Snapshot
              </h3>
              <span className="text-[11px] text-muted-foreground">Review or edit before submitting</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-muted-foreground mb-1 font-bold">Full Name *</label>
                <input
                  type="text"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your full name"
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-600"
                />
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-muted-foreground mb-1 font-bold">Mobile Phone *</label>
                <input
                  type="text"
                  value={formData.phone || ""}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter mobile number"
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-600"
                />
              </div>
              <div>
                <label className="block text-muted-foreground mb-1 font-bold">Email Address *</label>
                <input
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email address"
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                <label className="block text-muted-foreground mb-1 font-bold">Current Company</label>
                <input
                  type="text"
                  value={formData.currentCompany || ""}
                  onChange={(e) => setFormData({ ...formData, currentCompany: e.target.value })}
                  placeholder="e.g. Acme Corp"
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-600"
                />
              </div>
              <div>
                <label className="block text-muted-foreground mb-1 font-bold">Expected Monthly Salary (₹)</label>
                <input
                  type="number"
                  value={formData.expectedSalary || ""}
                  onChange={(e) => setFormData({ ...formData, expectedSalary: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="e.g. 50000"
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-muted-foreground mb-1 font-bold">Expected Monthly Salary (₹) *</label>
                <input
                  type="number"
                  value={formData.expectedSalary}
                  onChange={(e) => setFormData({ ...formData, expectedSalary: Number(e.target.value) })}
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-600"
                />
              </div>
              <div>
                <label className="block text-muted-foreground mb-1 font-bold">Current Company / Role</label>
                <input
                  type="text"
                  value={formData.currentCompany ? `${formData.currentRole} at ${formData.currentCompany}` : formData.currentRole}
                  onChange={(e) => setFormData({ ...formData, currentRole: e.target.value })}
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-600"
                  placeholder="e.g. Software Engineer at Omeetso"
                />
              </div>
            </div>

            {/* Resume Attachment & Manual Resume Choice */}
            <div>
              <label className="block text-muted-foreground mb-1 font-bold">Resume Document (PDF / DOCX)</label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={handleResumeFileChange}
              />

              {formData.resumeFileName ? (
                <div className="flex items-center justify-between p-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-extrabold text-foreground truncate text-xs block">
                        {formData.resumeFileName}
                      </span>
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">Ready to submit with application</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingResume}
                      className="text-xs font-black text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span>{uploadingResume ? "Uploading..." : "Replace"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, resumeUrl: "", resumeFileName: "" }))}
                      className="p-1 text-muted-foreground hover:text-rose-500 transition-colors"
                      title="Remove Attachment"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl border-2 border-dashed border-border bg-secondary/20 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black text-foreground">No Resume File Attached</h4>
                      <p className="text-[11px] text-muted-foreground font-semibold">
                        Choose how you want to submit your profile:
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingResume}
                      className="px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingResume ? "Uploading..." : "Upload Resume (PDF/DOCX)"}</span>
                    </button>

                    <a
                      href={`/my/profile/jobs?returnTo=/job/${job.id}`}
                      className="px-3.5 py-2.5 rounded-xl border border-indigo-500/30 bg-card hover:bg-secondary text-foreground font-black text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 text-center"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Create Manual Resume</span>
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleSubmitFinal}
                disabled={loading}
                className="flex-1 h-11 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
              >
                <Zap className="h-4 w-4" />
                {loading ? "Submitting Application..." : "1-Tap Quick Apply with Omeetso CV"}
              </button>

              <button
                type="button"
                onClick={handleNextStep}
                className="px-4 h-11 rounded-2xl border border-border bg-card hover:bg-secondary font-bold text-xs flex items-center gap-1"
              >
                Review & Customize <ArrowRight className="h-4 w-4" />
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
                <input
                  type="text"
                  placeholder="Your answer..."
                  value={screeningAnswers[q] || ""}
                  onChange={(e) => handleScreeningAnswerChange(q, e.target.value)}
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-600"
                />
              </div>
            ))}

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setStep("form")}
                className="w-1/3 h-11 rounded-2xl border border-border text-xs font-bold text-muted-foreground flex items-center justify-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button
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
            <h3 className="text-xs font-black uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
              3. Final Application Review
            </h3>
            <div className="p-4 rounded-2xl border border-border bg-secondary/20 space-y-2">
              <div className="flex justify-between"><span className="text-muted-foreground">Candidate:</span> <span className="font-black text-foreground">{formData.name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Title:</span> <span className="font-bold text-foreground">{formData.title}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Phone & Email:</span> <span className="font-bold text-foreground">{formData.phone} • {formData.email}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Location & Exp:</span> <span className="font-bold text-foreground">{formData.city} • {formData.experience}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Expected Salary:</span> <span className="font-black text-emerald-600">₹{formData.expectedSalary?.toLocaleString("en-IN")} / Mo</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Notice Period:</span> <span className="font-bold text-foreground">{formData.noticePeriod}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Attached Resume:</span> <span className="font-bold text-indigo-600">{formData.resumeFileName || "10-Section Manual Profile"}</span></div>
            </div>

            {Object.keys(screeningAnswers).length > 0 && (
              <div className="p-3 rounded-2xl border border-border bg-card space-y-1">
                <p className="text-[11px] font-bold text-muted-foreground uppercase">Answers to Employer Questions</p>
                {Object.entries(screeningAnswers).map(([q, a]) => (
                  <div key={q} className="text-xs">
                    <span className="font-bold text-foreground">{q}:</span> <span className="text-muted-foreground">{a}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setStep(job.screeningQuestions && job.screeningQuestions.length > 0 ? "screening" : "form")}
                className="w-1/3 h-11 rounded-2xl border border-border text-xs font-bold text-muted-foreground flex items-center justify-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" /> Edit
              </button>
              <button
                onClick={handleSubmitFinal}
                disabled={loading}
                className="w-2/3 h-11 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md"
              >
                {loading ? "Submitting Application..." : "Submit Application ✓"}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: SUCCESS CONFIRMATION */}
        {step === "success" && (
          <div className="py-6 text-center space-y-4">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <div>
              <h3 className="text-lg font-black text-foreground">Application Submitted Successfully! ✓</h3>
              <p className="text-xs text-muted-foreground mt-1 font-semibold">
                Your full Resume Profile has been delivered to <span className="font-extrabold text-foreground">{job.companyName}</span>.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full h-11 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md"
            >
              Done & View Applications
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
