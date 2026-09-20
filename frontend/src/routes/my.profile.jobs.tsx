import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft, User, Briefcase, FileText, Upload, Save, CheckCircle2,
  Trash2, Plus, Sparkles, Eye, Download, ShieldCheck, Lock,
  Globe, Award, GraduationCap, MapPin, Phone, Mail, Calendar,
  Building, Settings, Bell, ChevronRight, ChevronLeft, X, ExternalLink,
  Check, AlertCircle, Share2, Printer, ArrowRight
} from "lucide-react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { uploadFile } from "@/lib/upload";
import { downloadDocument } from "@/lib/download";
import { API_BASE } from "@/config/api";
import { toast } from "sonner";
import type {
  CandidateProfileItem,
  SkillItem,
  WorkExperienceItem,
  EducationItem,
  CertificationItem,
  ProjectItem
} from "@/lib/jobs";

interface ProfileSearch {
  returnTo?: string;
}

export const Route = createFileRoute("/my/profile/jobs")({
  validateSearch: (search: Record<string, unknown>): ProfileSearch => ({
    returnTo: typeof search.returnTo === "string" ? search.returnTo : undefined,
  }),
  head: () => ({ meta: [{ title: "Resume & Professional Profile — Omeetso" }] }),
  component: CandidateProfilePage,
});

type TabKey =
  | "personal"
  | "summary"
  | "skills"
  | "experience"
  | "education"
  | "preferences"
  | "additional"
  | "resume"
  | "privacy"
  | "features";

const TAB_KEYS: TabKey[] = [
  "personal",
  "summary",
  "skills",
  "experience",
  "education",
  "preferences",
  "additional",
  "resume",
  "privacy",
  "features"
];

export function CandidateProfilePage() {
  const nav = useNavigate();
  const search = Route.useSearch();
  const returnTo = search.returnTo;
  const [activeTab, setActiveTab] = useState<TabKey>("personal");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  // Core Form State for all 10 sections (Clean state with placeholders)
  const [formData, setFormData] = useState<CandidateProfileItem>({
    userId: "me",
    // 1. Personal Information
    fullName: "",
    photoUrl: "",
    title: "",
    phone: "",
    email: "",
    city: "",
    area: "",
    preferredLocations: [],
    dob: "",
    gender: "",
    languages: [],

    // 2. Professional Summary
    summary: "",
    experienceYears: "Fresher",
    currentCompany: "",
    currentRole: "",
    currentSalary: undefined,
    expectedSalary: undefined,
    noticePeriod: "Immediate",
    employmentStatus: "Looking for Opportunities",
    openToWork: true,

    // 3. Skills
    skillsList: [],
    skills: [],

    // 4. Work Experience
    workExperiences: [],

    // 5. Education
    educations: [],
    education: "",

    // 6. Job Preferences
    desiredRole: "",
    preferredIndustry: "",
    preferredJobTypes: ["FULL_TIME"],
    preferredWorkplaceModes: ["IN_OFFICE"],
    willingToRelocate: false,
    preferredShift: "Day Shift",
    immediateJoining: false,

    // 7. Additional Details
    certifications: [],
    projects: [],
    internshipExperience: "",
    portfolioUrl: "",
    linkedinUrl: "",
    githubUrl: "",
    awards: "",
    drivingLicence: "None",
    ownVehicle: "None",
    disabilityAccommodations: "",

    // 8. Resume & Documents
    resumeUrl: "",
    resumeFileName: "",
    savedResumes: [],
    educationalDocs: [],
    experienceCerts: [],
    idVerificationStatus: "Pending",

    // 9. Profile Privacy
    visibilityMode: "ALL_VERIFIED",
    hideCurrentEmployer: false,
    hidePhone: false,
    hideEmail: false,
    blockedRecruiters: [],
    allowDirectContact: true,

    // 10. Useful Features
    profileViewsCount: 0,
    verifiedCandidate: false,
    updateReminderEnabled: true,
    oneTapApplyEnabled: true,
    jobAlertsEnabled: true,
    jobAlertPreferences: {
      roles: [],
      cities: [],
      minSalary: 25000,
      frequency: "DAILY"
    },
    savedJobs: []
  });

  // State for adding items
  const [newSkill, setNewSkill] = useState<SkillItem>({
    name: "",
    category: "Technical",
    proficiency: "Intermediate",
    yearsOfExperience: "2 Years"
  });

  const [newExp, setNewExp] = useState<WorkExperienceItem>({
    id: "",
    companyName: "",
    jobTitle: "",
    employmentType: "Full-time",
    startDate: "",
    endDate: "",
    isCurrentlyWorking: false,
    location: "Hyderabad",
    responsibilities: "",
    achievements: ""
  });

  const [newEdu, setNewEdu] = useState<EducationItem>({
    id: "",
    qualification: "Graduate (B.Tech / B.E.)",
    specialization: "",
    college: "",
    university: "",
    courseType: "Full-time",
    startYear: "",
    completionYear: "",
    percentageOrCgpa: ""
  });

  const [newCert, setNewCert] = useState<CertificationItem>({ name: "", issuer: "", issueDate: "", credentialUrl: "" });
  const [newProject, setNewProject] = useState<ProjectItem>({ title: "", description: "", link: "", role: "" });
  const [blockedInput, setBlockedInput] = useState("");
  const [newLangInput, setNewLangInput] = useState("");

  // Load profile from Backend & LocalStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("omeetso_user_token");
    const loadBackend = async () => {
      try {
        const res = await fetch(`${API_BASE}/jobs/candidate/profile`, {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setFormData((prev) => ({ ...prev, ...json.data }));
            return;
          }
        }
      } catch { }

      try {
        const local = localStorage.getItem("omeetso_candidate_profile");
        if (local) {
          const parsed = JSON.parse(local);
          if (parsed.email === "akhilesh@example.com" && parsed.fullName === "Akhilesh Reddy") {
            localStorage.removeItem("omeetso_candidate_profile");
          } else {
            setFormData((prev) => ({ ...prev, ...parsed }));
          }
        }
      } catch { }
    };
    loadBackend();
  }, []);

  // Compute profile completion score
  const calculateCompleteness = (): number => {
    let score = 0;
    if (formData.fullName && formData.phone && formData.city) score += 15;
    if (formData.photoUrl) score += 5;
    if (formData.summary && formData.summary.length > 20) score += 15;
    if (formData.skillsList && formData.skillsList.length >= 3) score += 15;
    if (formData.workExperiences && formData.workExperiences.length > 0) score += 15;
    if (formData.educations && formData.educations.length > 0) score += 15;
    if (formData.desiredRole && formData.expectedSalary) score += 10;
    if (formData.resumeUrl || formData.resumeFileName) score += 10;
    if (formData.certifications?.length > 0 || formData.projects?.length > 0) score += 5;
    return Math.min(100, score);
  };

  const completeness = calculateCompleteness();

  // Photo Upload Handler
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const url = await uploadFile(file, "profile");
      setFormData((prev) => ({ ...prev, photoUrl: url }));
      toast.success("Profile photo updated!");
    } catch {
      const localUrl = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, photoUrl: localUrl }));
      toast.success("Profile photo attached.");
    } finally {
      setUploadingPhoto(false);
      if (photoInputRef.current) photoInputRef.current.value = "";
    }
  };

  // Resume PDF/DOCX Upload Handler
  const handleResumeFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingResume(true);
    try {
      const url = await uploadFile(file, "resumes");
      const finalUrl = url || await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => resolve(URL.createObjectURL(file));
        reader.readAsDataURL(file);
      });

      const newResumeObj = {
        id: `res-${Date.now()}`,
        name: file.name,
        url: finalUrl,
        uploadedAt: new Date().toISOString()
      };
      setFormData((prev) => ({
        ...prev,
        resumeUrl: finalUrl,
        resumeFileName: file.name,
        savedResumes: [...(prev.savedResumes || []), newResumeObj]
      }));
      toast.success(`Resume "${file.name}" uploaded successfully!`);
    } catch {
      const localUrl = URL.createObjectURL(file);
      const newResumeObj = {
        id: `res-${Date.now()}`,
        name: file.name,
        url: localUrl,
        uploadedAt: new Date().toISOString()
      };
      setFormData((prev) => ({
        ...prev,
        resumeUrl: localUrl,
        resumeFileName: file.name,
        savedResumes: [...(prev.savedResumes || []), newResumeObj]
      }));
      toast.success(`Resume "${file.name}" attached.`);
    } finally {
      setUploadingResume(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Save All Changes to Server & LocalStorage
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);

    const token = typeof window !== "undefined" ? localStorage.getItem("omeetso_user_token") : null;
    try {
      localStorage.setItem("omeetso_candidate_profile", JSON.stringify(formData));
    } catch { }

    try {
      const res = await fetch(`${API_BASE}/jobs/candidate/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        toast.success("Resume Profile saved and synced with verified recruiters!");
      } else {
        toast.success("Profile saved locally.");
      }
    } catch {
      toast.success("Profile saved to offline storage.");
    } finally {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    }
  };

  // Navigation handlers
  const currentTabIndex = TAB_KEYS.indexOf(activeTab);

  const goToNextTab = () => {
    handleSave();
    if (currentTabIndex < TAB_KEYS.length - 1) {
      const nextKey = TAB_KEYS[currentTabIndex + 1];
      setActiveTab(nextKey);
      window.scrollTo({ top: 220, behavior: "smooth" });
    } else {
      if (returnTo) {
        window.location.assign(returnTo);
      } else {
        toast.success("All sections completed and saved!");
      }
    }
  };

  const goToPrevTab = () => {
    if (currentTabIndex > 0) {
      const prevKey = TAB_KEYS[currentTabIndex - 1];
      setActiveTab(prevKey);
      window.scrollTo({ top: 220, behavior: "smooth" });
    }
  };

  // Add Skill Item
  const handleAddSkill = () => {
    if (!newSkill.name.trim()) {
      toast.error("Please enter a skill name");
      return;
    }
    const updatedList = [...formData.skillsList, newSkill];
    const updatedNames = Array.from(new Set([...formData.skills, newSkill.name.trim()]));
    setFormData({ ...formData, skillsList: updatedList, skills: updatedNames });
    setNewSkill({ name: "", category: "Technical", proficiency: "Intermediate", yearsOfExperience: "2 Years" });
    toast.success(`Added skill: ${newSkill.name}`);
  };

  // Remove Skill Item
  const handleRemoveSkill = (index: number) => {
    const updatedList = formData.skillsList.filter((_, i) => i !== index);
    const updatedNames = updatedList.map((s) => s.name);
    setFormData({ ...formData, skillsList: updatedList, skills: updatedNames });
  };

  // Add Work Experience
  const handleAddExperience = () => {
    if (!newExp.companyName.trim() || !newExp.jobTitle.trim()) {
      toast.error("Company Name and Job Title are required.");
      return;
    }
    if (!newExp.isCurrentlyWorking && newExp.startDate && newExp.endDate) {
      if (newExp.endDate < newExp.startDate) {
        toast.error("End Date/Year cannot be earlier than Start Date/Year.");
        return;
      }
    }
    const item: WorkExperienceItem = {
      ...newExp,
      id: `exp-${Date.now()}`
    };
    setFormData({ ...formData, workExperiences: [item, ...formData.workExperiences] });
    setNewExp({
      id: "",
      companyName: "",
      jobTitle: "",
      employmentType: "Full-time",
      startDate: "",
      endDate: "",
      isCurrentlyWorking: false,
      location: "Hyderabad",
      responsibilities: "",
      achievements: ""
    });
    toast.success(`Added experience at ${item.companyName}`);
  };

  // Add Education
  const handleAddEducation = () => {
    if (!newEdu.qualification.trim() || !newEdu.college?.trim()) {
      toast.error("Qualification and College/Institute are required.");
      return;
    }
    if (newEdu.startYear && newEdu.completionYear) {
      if (Number(newEdu.completionYear) < Number(newEdu.startYear)) {
        toast.error("Completion year cannot be earlier than start year.");
        return;
      }
    }
    const item: EducationItem = {
      ...newEdu,
      id: `edu-${Date.now()}`
    };
    setFormData({ ...formData, educations: [item, ...formData.educations] });
    setNewEdu({
      id: "",
      qualification: "Graduate (B.Tech / B.E.)",
      specialization: "",
      college: "",
      university: "",
      courseType: "Full-time",
      startYear: "",
      completionYear: "",
      percentageOrCgpa: ""
    });
    toast.success("Added education record!");
  };

  const tabs: Array<{ id: TabKey; label: string; shortLabel: string; icon: any; count?: number }> = [
    { id: "personal", label: "1. Personal", shortLabel: "Personal", icon: User },
    { id: "summary", label: "2. Summary", shortLabel: "Summary", icon: Briefcase },
    { id: "skills", label: "3. Skills", shortLabel: "Skills", icon: Sparkles, count: formData.skillsList.length },
    { id: "experience", label: "4. Experience", shortLabel: "Experience", icon: Building, count: formData.workExperiences.length },
    { id: "education", label: "5. Education", shortLabel: "Education", icon: GraduationCap, count: formData.educations.length },
    { id: "preferences", label: "6. Preferences", shortLabel: "Preferences", icon: Settings },
    { id: "additional", label: "7. Additional", shortLabel: "Additional", icon: Award },
    { id: "resume", label: "8. Resume & Docs", shortLabel: "Resume", icon: FileText },
    { id: "privacy", label: "9. Privacy", shortLabel: "Privacy", icon: Lock },
    { id: "features", label: "10. Features", shortLabel: "Features", icon: Bell },
  ];

  // Reusable Step Navigation Footer Component for every tab
  const renderTabFooter = (customNextText?: string) => {
    const isFirst = currentTabIndex === 0;
    const isLast = currentTabIndex === TAB_KEYS.length - 1;
    const nextTab = !isLast ? tabs[currentTabIndex + 1] : null;

    return (
      <div className="pt-5 border-t border-border/70 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-4">
        <div>
          {!isFirst ? (
            <button
              type="button"
              onClick={goToPrevTab}
              className="w-full sm:w-auto h-11 px-4 rounded-2xl border border-border bg-card hover:bg-secondary text-foreground font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous Section</span>
            </button>
          ) : (
            <div className="hidden sm:block" />
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {returnTo && (
            <button
              type="button"
              onClick={() => {
                handleSave();
                setTimeout(() => window.location.assign(returnTo), 500);
              }}
              className="h-11 px-4 rounded-2xl border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs flex items-center justify-center gap-1.5 hover:bg-emerald-100 transition-colors shadow-xs active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Save & Return to Job</span>
            </button>
          )}

          <button
            type="button"
            onClick={goToNextTab}
            className="h-11 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
          >
            <span>{customNextText || (isLast ? (returnTo ? "Complete & Return to Job" : "Save All Details ✓") : `Next: ${nextTab?.shortLabel || "Next Section"}`)}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-32 md:pb-24 font-sans">
        
        {/* Sticky Header */}
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-card/90 backdrop-blur-md px-3 sm:px-4 py-3 safe-t shadow-sm">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => {
                if (returnTo) {
                  window.location.assign(returnTo);
                } else if (history.length > 1) {
                  history.back();
                } else {
                  nav({ to: "/account" });
                }
              }}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full hover:bg-secondary transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-sm font-black text-foreground truncate">Candidate Resume Profile</h1>
              <p className="text-[10px] text-muted-foreground font-bold truncate">Section {currentTabIndex + 1} of 10 • {tabs[currentTabIndex]?.shortLabel}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {returnTo && (
              <button
                onClick={() => window.location.assign(returnTo)}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-black rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
              >
                <span>Return to Job</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={() => setShowResumeModal(true)}
              className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-extrabold rounded-xl border border-indigo-500/30 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors shadow-sm"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Preview CV</span>
              <span className="sm:hidden">CV</span>
            </button>

            <button
              onClick={() => handleSave()}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 text-xs font-black rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? "Saving..." : saved ? "Saved!" : "Save"}</span>
            </button>
          </div>
        </header>

        {/* Return to Job Alert Banner */}
        {returnTo && (
          <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white px-4 py-3 shadow-md">
            <div className="max-w-[800px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
                <p className="font-semibold text-xs leading-snug">
                  <span className="font-black">Resume Builder for Job Application:</span> Enter your details below. Once done, tap Return to 1-tap apply!
                </p>
              </div>
              <button
                onClick={() => {
                  handleSave();
                  setTimeout(() => window.location.assign(returnTo), 600);
                }}
                className="shrink-0 px-3.5 py-1.5 bg-white text-indigo-700 hover:bg-white/95 rounded-xl font-black text-xs flex items-center justify-center gap-1 shadow-sm transition-all active:scale-95"
              >
                <span>Save & Return to Job</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* MAIN FORM CONTAINER */}
        <div className="max-w-[800px] mx-auto p-3 sm:p-4 space-y-4">
          
          {/* HERO PROFILE SUMMARY CARD */}
          <div className="rounded-3xl border border-border bg-card p-4 sm:p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="relative group shrink-0">
                  <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 border-2 border-indigo-500/30 flex items-center justify-center overflow-hidden shadow-sm">
                    {formData.photoUrl ? (
                      <img src={formData.photoUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-7 sm:w-8 h-7 sm:h-8 text-indigo-600" />
                    )}
                  </div>
                  <button
                    onClick={() => photoInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-indigo-600 text-white shadow-md hover:bg-indigo-700 transition-transform active:scale-90"
                    title="Upload Photo"
                  >
                    <Upload className="w-3 h-3" />
                  </button>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-black text-foreground truncate">{formData.fullName || "Your Full Name"}</h2>
                    {formData.verifiedCandidate && (
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black border border-emerald-500/20 shrink-0">
                        <ShieldCheck className="w-3 h-3" /> Verified
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 truncate">{formData.title || "Professional Title / Role"}</p>
                  <p className="text-[11px] text-muted-foreground font-semibold flex items-center gap-1 mt-0.5 truncate">
                    <MapPin className="w-3 h-3 shrink-0" /> {formData.city ? `${formData.city}${formData.area ? `, ${formData.area}` : ""}` : "Current City"} • {formData.experienceYears || "Fresher"}
                  </p>
                </div>
              </div>

              {/* Open to work toggle */}
              <div className="flex items-center sm:flex-col items-start sm:items-end justify-between w-full sm:w-auto gap-1.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/60">
                <button
                  onClick={() => setFormData({ ...formData, openToWork: !formData.openToWork })}
                  className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition-all border flex items-center gap-2 ${
                    formData.openToWork
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 shadow-sm"
                      : "bg-secondary text-muted-foreground border-border"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${formData.openToWork ? "bg-emerald-500 animate-pulse" : "bg-gray-400"}`} />
                  <span>{formData.openToWork ? "🟢 Open to Work" : "⚪ Closed to Recruiters"}</span>
                </button>
                <span className="text-[10px] text-muted-foreground font-semibold">
                  👁️ {formData.profileViewsCount} Recruiter Views
                </span>
              </div>
            </div>

            {/* Profile Completeness Bar */}
            <div className="pt-3 border-t border-border/60">
              <div className="flex items-center justify-between text-xs font-extrabold mb-1.5">
                <span className="text-foreground flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Profile Completeness Score
                </span>
                <span className="text-indigo-600 dark:text-indigo-400 font-black">{completeness}%</span>
              </div>
              <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-indigo-500 to-emerald-500"
                  style={{ width: `${completeness}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground font-semibold mt-1">
                {completeness >= 80 ? "🎉 Outstanding profile! You are 4x more likely to be contacted by verified recruiters." : "Tip: Fill out each section using the 'Next' buttons below to reach 100% visibility."}
              </p>
            </div>
          </div>

          {/* SECTION NAVIGATION TABS BAR (Horizontally scrollable with smooth touch) */}
          <div className="relative">
            <div
              ref={tabsContainerRef}
              className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 pt-1 -mx-1 px-1 scroll-smooth"
            >
              {tabs.map((tab, idx) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      window.scrollTo({ top: 220, behavior: "smooth" });
                    }}
                    className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-extrabold transition-all border ${
                      isActive
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                        : "bg-card text-foreground border-border hover:bg-secondary"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isActive ? "bg-white/20 text-white" : "bg-secondary text-muted-foreground"}`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* TAB 1: PERSONAL INFORMATION */}
          {activeTab === "personal" && (
            <div className="rounded-3xl border border-border bg-card p-4 sm:p-6 space-y-4 text-xs font-semibold shadow-sm">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h2 className="text-sm font-black uppercase tracking-wide text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                  <User className="h-4 w-4" /> 1. Personal Information
                </h2>
                <span className="text-[11px] text-muted-foreground font-bold">Step 1 of 10</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground mb-1 font-bold">Full Name *</label>
                  <input
                    type="text"
                    value={formData.fullName || ""}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full h-11 rounded-2xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-600"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground mb-1 font-bold">Professional Title *</label>
                  <input
                    type="text"
                    value={formData.title || ""}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full h-11 rounded-2xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-600"
                    placeholder="e.g. Software Engineer, Sales Exec"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground mb-1 font-bold">Mobile Number *</label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    value={formData.phone || ""}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                      setFormData({ ...formData, phone: val });
                    }}
                    onKeyDown={(e) => {
                      if (
                        !/[0-9]/.test(e.key) &&
                        !["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key) &&
                        !e.ctrlKey &&
                        !e.metaKey
                      ) {
                        e.preventDefault();
                      }
                    }}
                    className="w-full h-11 rounded-2xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-600"
                    placeholder="Enter 10-digit mobile number"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground mb-1 font-bold">Email Address *</label>
                  <input
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-11 rounded-2xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-600"
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground mb-1 font-bold">Current City *</label>
                  <input
                    type="text"
                    value={formData.city || ""}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full h-11 rounded-2xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-600"
                    placeholder="e.g. Hyderabad"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground mb-1 font-bold">Current Area / Locality</label>
                  <input
                    type="text"
                    value={formData.area || ""}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    className="w-full h-11 rounded-2xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-600"
                    placeholder="e.g. Madhapur, Hitec City"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground mb-1 font-bold">Date of Birth (Optional)</label>
                  <input
                    type="date"
                    value={formData.dob || ""}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full h-11 rounded-2xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground mb-1 font-bold">Gender (Optional)</label>
                  <select
                    value={formData.gender || "Prefer not to say"}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full h-11 rounded-2xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-600"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-Binary">Non-Binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              {/* Languages Known */}
              <div>
                <label className="block text-muted-foreground mb-1 font-bold">Languages Known</label>
                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                  {formData.languages.map((lang, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-secondary text-foreground text-xs font-bold border border-border">
                      {lang}
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, languages: formData.languages.filter((_, i) => i !== idx) })}
                        className="text-muted-foreground hover:text-rose-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newLangInput}
                    onChange={(e) => setNewLangInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newLangInput.trim()) {
                        e.preventDefault();
                        if (!formData.languages.includes(newLangInput.trim())) {
                          setFormData({ ...formData, languages: [...formData.languages, newLangInput.trim()] });
                        }
                        setNewLangInput("");
                      }
                    }}
                    placeholder="Type language and press enter (e.g. English, Telugu, Hindi)"
                    className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs font-bold text-foreground outline-none focus:border-indigo-600"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newLangInput.trim() && !formData.languages.includes(newLangInput.trim())) {
                        setFormData({ ...formData, languages: [...formData.languages, newLangInput.trim()] });
                        setNewLangInput("");
                      }
                    }}
                    className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-xl text-xs font-bold shrink-0"
                  >
                    Add
                  </button>
                </div>
              </div>

              {renderTabFooter()}
            </div>
          )}

          {/* TAB 2: PROFESSIONAL SUMMARY */}
          {activeTab === "summary" && (
            <div className="rounded-3xl border border-border bg-card p-4 sm:p-6 space-y-4 text-xs font-semibold shadow-sm">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h2 className="text-sm font-black uppercase tracking-wide text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                  <Briefcase className="h-4 w-4" /> 2. Professional Summary & Employment
                </h2>
                <span className="text-[11px] text-muted-foreground font-bold">Step 2 of 10</span>
              </div>

              <div>
                <label className="block text-muted-foreground mb-1 font-bold">Short Career Objective / Profile Summary</label>
                <textarea
                  rows={4}
                  value={formData.summary || ""}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="Summarize your professional background, core accomplishments, and key domains of expertise..."
                  className="w-full rounded-2xl border border-border bg-background p-3 font-semibold text-foreground outline-none focus:border-indigo-600 leading-relaxed"
                />
                <span className="text-[10px] text-muted-foreground font-bold">{(formData.summary || "").length} characters</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground mb-1 font-bold">Total Work Experience</label>
                  <select
                    value={formData.experienceYears}
                    onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                    className="w-full h-11 rounded-2xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-600"
                  >
                    <option value="Fresher">Fresher / No Experience</option>
                    <option value="1-2 Years">1-2 Years</option>
                    <option value="3-5 Years">3-5 Years</option>
                    <option value="5-8 Years">5-8 Years</option>
                    <option value="8+ Years">8+ Years</option>
                  </select>
                </div>

                <div>
                  <label className="block text-muted-foreground mb-1 font-bold">Employment Status</label>
                  <select
                    value={formData.employmentStatus || "Employed"}
                    onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value })}
                    className="w-full h-11 rounded-2xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-600"
                  >
                    <option value="Employed">Currently Employed</option>
                    <option value="Serving Notice">Serving Notice Period</option>
                    <option value="Looking for Opportunities">Actively Looking for Opportunities</option>
                    <option value="Student">Student / Recent Graduate</option>
                    <option value="Freelancer">Freelancer / Consultant</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground mb-1 font-bold">Current Company (Optional)</label>
                  <input
                    type="text"
                    value={formData.currentCompany || ""}
                    onChange={(e) => setFormData({ ...formData, currentCompany: e.target.value })}
                    className="w-full h-11 rounded-2xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-600"
                    placeholder="Enter current company name"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground mb-1 font-bold">Current Job Title</label>
                  <input
                    type="text"
                    value={formData.currentRole || ""}
                    onChange={(e) => setFormData({ ...formData, currentRole: e.target.value })}
                    className="w-full h-11 rounded-2xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-600"
                    placeholder="Enter current role / designation"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-muted-foreground mb-1 font-bold">Current Monthly Salary (₹ Private)</label>
                  <input
                    type="number"
                    value={formData.currentSalary !== undefined ? formData.currentSalary : ""}
                    onChange={(e) => setFormData({ ...formData, currentSalary: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full h-11 rounded-2xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-600"
                    placeholder="e.g. 50000"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground mb-1 font-bold">Expected Monthly Salary (₹) *</label>
                  <input
                    type="number"
                    value={formData.expectedSalary !== undefined ? formData.expectedSalary : ""}
                    onChange={(e) => setFormData({ ...formData, expectedSalary: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full h-11 rounded-2xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-600"
                    placeholder="e.g. 75000"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground mb-1 font-bold">Notice Period *</label>
                  <select
                    value={formData.noticePeriod}
                    onChange={(e) => setFormData({ ...formData, noticePeriod: e.target.value })}
                    className="w-full h-11 rounded-2xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-600"
                  >
                    <option value="Immediate">Immediate (0 Days)</option>
                    <option value="15 Days">15 Days</option>
                    <option value="30 Days">30 Days</option>
                    <option value="60 Days">60 Days</option>
                    <option value="90 Days">90 Days</option>
                  </select>
                </div>
              </div>

              {renderTabFooter()}
            </div>
          )}

          {/* TAB 3: SKILLS & PROFICIENCY */}
          {activeTab === "skills" && (
            <div className="rounded-3xl border border-border bg-card p-4 sm:p-6 space-y-4 text-xs font-semibold shadow-sm">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wide text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" /> 3. Skills & Proficiency Levels
                  </h2>
                  <p className="text-[11px] text-muted-foreground font-semibold mt-0.5">
                    Add key skills, tools, proficiency levels, and experience per skill.
                  </p>
                </div>
                <span className="text-[11px] text-muted-foreground font-bold shrink-0">Step 3 of 10</span>
              </div>

              {/* Add Skill Form */}
              <div className="p-4 rounded-2xl border border-dashed border-indigo-500/40 bg-indigo-50/50 dark:bg-indigo-950/20 space-y-3">
                <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">+ Add New Skill</span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Skill name (e.g. React.js, Digital Marketing)"
                      value={newSkill.name}
                      onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                      className="w-full h-10 rounded-xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-600"
                    />
                  </div>
                  <div>
                    <select
                      value={newSkill.proficiency}
                      onChange={(e) => setNewSkill({ ...newSkill, proficiency: e.target.value as any })}
                      className="w-full h-10 rounded-xl border border-border bg-background px-2 font-bold text-foreground outline-none focus:border-indigo-600"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Expert">Expert</option>
                    </select>
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="e.g. 3 Years"
                      value={newSkill.yearsOfExperience}
                      onChange={(e) => setNewSkill({ ...newSkill, yearsOfExperience: e.target.value })}
                      className="w-full h-10 rounded-xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-sm transition-all active:scale-95"
                >
                  Add Skill to Profile
                </button>
              </div>

              {/* Skills List Cards */}
              <div className="space-y-2 pt-2">
                {formData.skillsList.length === 0 ? (
                  <div className="p-6 text-center text-xs text-muted-foreground bg-secondary/20 rounded-2xl border border-dashed border-border">
                    No skills added yet. Use the form above to add your key technical & domain skills.
                  </div>
                ) : (
                  formData.skillsList.map((skill, idx) => (
                    <div key={idx} className="p-3 rounded-2xl border border-border bg-background flex items-center justify-between gap-3 shadow-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-xs shrink-0">
                          {skill.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-foreground text-sm">{skill.name}</h4>
                          <p className="text-[11px] text-muted-foreground font-semibold">
                            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black mr-1.5 ${
                              skill.proficiency === "Expert" ? "bg-emerald-500/15 text-emerald-600" :
                              skill.proficiency === "Advanced" ? "bg-indigo-500/15 text-indigo-600" : "bg-secondary text-muted-foreground"
                            }`}>
                              {skill.proficiency}
                            </span>
                            • {skill.yearsOfExperience || "1 Year"} Experience
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(idx)}
                        className="p-1.5 text-muted-foreground hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Remove Skill"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {renderTabFooter()}
            </div>
          )}

          {/* TAB 4: WORK EXPERIENCE */}
          {activeTab === "experience" && (
            <div className="rounded-3xl border border-border bg-card p-4 sm:p-6 space-y-4 text-xs font-semibold shadow-sm">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wide text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                    <Building className="h-4 w-4" /> 4. Work Experience (Optional for Freshers)
                  </h2>
                  <p className="text-[11px] text-muted-foreground font-semibold">Add previous and current company roles, responsibilities, and achievements.</p>
                </div>
                <span className="text-[11px] text-muted-foreground font-bold shrink-0">Step 4 of 10</span>
              </div>

              {/* Add Experience Form */}
              <div className="p-4 rounded-2xl border border-dashed border-border bg-secondary/20 space-y-3">
                <span className="text-xs font-black text-foreground">+ Add Employment Position</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-muted-foreground mb-1 font-bold">Company Name *</label>
                    <input
                      type="text"
                      placeholder="Enter company name (e.g. Acme Corp)"
                      value={newExp.companyName}
                      onChange={(e) => setNewExp({ ...newExp, companyName: e.target.value })}
                      className="w-full h-10 rounded-xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="block text-muted-foreground mb-1 font-bold">Job Title *</label>
                    <input
                      type="text"
                      placeholder="Enter job role (e.g. Frontend Developer)"
                      value={newExp.jobTitle}
                      onChange={(e) => setNewExp({ ...newExp, jobTitle: e.target.value })}
                      className="w-full h-10 rounded-xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-muted-foreground mb-1 font-bold">Employment Type</label>
                    <select
                      value={newExp.employmentType}
                      onChange={(e) => setNewExp({ ...newExp, employmentType: e.target.value })}
                      className="w-full h-10 rounded-xl border border-border bg-background px-2 font-bold text-foreground outline-none focus:border-indigo-600"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Freelance">Freelance</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-muted-foreground mb-1 font-bold">Start Date</label>
                    <input
                      type="month"
                      value={newExp.startDate}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (newExp.endDate && val && newExp.endDate < val) {
                          setNewExp({ ...newExp, startDate: val, endDate: "" });
                          toast.info("End date cleared as start date changed to a later date.");
                        } else {
                          setNewExp({ ...newExp, startDate: val });
                        }
                      }}
                      className="w-full h-10 rounded-xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="block text-muted-foreground mb-1 font-bold">End Date</label>
                    <input
                      type="month"
                      disabled={newExp.isCurrentlyWorking}
                      min={newExp.startDate || undefined}
                      value={newExp.endDate || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (newExp.startDate && val && val < newExp.startDate) {
                          toast.error("End date/year cannot be earlier than start date/year.");
                          return;
                        }
                        setNewExp({ ...newExp, endDate: val });
                      }}
                      className="w-full h-10 rounded-xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-600 disabled:opacity-40"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="currentWork"
                    checked={newExp.isCurrentlyWorking}
                    onChange={(e) => setNewExp({ ...newExp, isCurrentlyWorking: e.target.checked, endDate: e.target.checked ? "" : newExp.endDate })}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                  <label htmlFor="currentWork" className="text-xs font-bold text-foreground">I am currently working in this role</label>
                </div>

                <div>
                  <label className="block text-muted-foreground mb-1 font-bold">Roles & Key Responsibilities</label>
                  <textarea
                    rows={2}
                    value={newExp.responsibilities}
                    onChange={(e) => setNewExp({ ...newExp, responsibilities: e.target.value })}
                    placeholder="Describe main duties, tools used, and projects..."
                    className="w-full rounded-xl border border-border bg-background p-2.5 font-semibold text-foreground outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground mb-1 font-bold">Key Achievements</label>
                  <input
                    type="text"
                    value={newExp.achievements || ""}
                    onChange={(e) => setNewExp({ ...newExp, achievements: e.target.value })}
                    placeholder="Enter achievements (e.g. Increased app performance by 30%)"
                    className="w-full h-10 rounded-xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-600"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddExperience}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-sm transition-all active:scale-95"
                >
                  Save Experience Record
                </button>
              </div>

              {/* Experience Timeline */}
              <div className="space-y-3 pt-2">
                {formData.workExperiences.length === 0 ? (
                  <div className="p-6 text-center text-xs text-muted-foreground bg-secondary/20 rounded-2xl border border-dashed border-border">
                    No work experience added yet. Freshers can skip or add internships & academic experience.
                  </div>
                ) : (
                  formData.workExperiences.map((exp, idx) => (
                    <div key={idx} className="p-4 rounded-2xl border border-border bg-background space-y-2 shadow-xs">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="font-black text-foreground text-sm">{exp.jobTitle}</h4>
                          <p className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">{exp.companyName} • {exp.employmentType}</p>
                          <p className="text-[11px] text-muted-foreground font-semibold mt-0.5">
                            📅 {exp.startDate || "Start"} — {exp.isCurrentlyWorking ? "Present (Current)" : (exp.endDate || "End")} • {exp.location || "Location"}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, workExperiences: formData.workExperiences.filter((_, i) => i !== idx) })}
                          className="p-1.5 text-muted-foreground hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {exp.responsibilities && <p className="text-xs text-muted-foreground leading-relaxed">{exp.responsibilities}</p>}
                      {exp.achievements && (
                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold">
                          🏆 {exp.achievements}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {renderTabFooter()}
            </div>
          )}

          {/* TAB 5: EDUCATION */}
          {activeTab === "education" && (
            <div className="rounded-3xl border border-border bg-card p-4 sm:p-6 space-y-4 text-xs font-semibold shadow-sm">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h2 className="text-sm font-black uppercase tracking-wide text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" /> 5. Education & Academic Qualifications
                </h2>
                <span className="text-[11px] text-muted-foreground font-bold">Step 5 of 10</span>
              </div>

              {/* Add Education Box */}
              <div className="p-4 rounded-2xl border border-dashed border-border bg-secondary/20 space-y-3">
                <span className="text-xs font-black text-foreground">+ Add Education Qualification</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-muted-foreground mb-1 font-bold">Qualification Level *</label>
                    <select
                      value={newEdu.qualification}
                      onChange={(e) => setNewEdu({ ...newEdu, qualification: e.target.value })}
                      className="w-full h-10 rounded-xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-600"
                    >
                      <option value="10th / SSC Pass">10th / SSC Pass</option>
                      <option value="12th / Intermediate">12th / Intermediate</option>
                      <option value="Diploma / ITI">Diploma / ITI</option>
                      <option value="Graduate (B.Tech / B.E. / B.Sc / B.Com / BCA)">Bachelor's / Graduate</option>
                      <option value="Post Graduate (M.Tech / MBA / MCA / M.Sc)">Master's / Post Graduate</option>
                      <option value="Doctorate / PhD">Doctorate / PhD</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-muted-foreground mb-1 font-bold">Specialization / Branch</label>
                    <input
                      type="text"
                      placeholder="Enter branch (e.g. Computer Science, Mechanical)"
                      value={newEdu.specialization || ""}
                      onChange={(e) => setNewEdu({ ...newEdu, specialization: e.target.value })}
                      className="w-full h-10 rounded-xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-muted-foreground mb-1 font-bold">College / Institute *</label>
                    <input
                      type="text"
                      placeholder="Enter college or school name"
                      value={newEdu.college || ""}
                      onChange={(e) => setNewEdu({ ...newEdu, college: e.target.value })}
                      className="w-full h-10 rounded-xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="block text-muted-foreground mb-1 font-bold">University / Board</label>
                    <input
                      type="text"
                      placeholder="Enter board / university name"
                      value={newEdu.university || ""}
                      onChange={(e) => setNewEdu({ ...newEdu, university: e.target.value })}
                      className="w-full h-10 rounded-xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-muted-foreground mb-1 font-bold">Course Type</label>
                    <select
                      value={newEdu.courseType || "Full-time"}
                      onChange={(e) => setNewEdu({ ...newEdu, courseType: e.target.value })}
                      className="w-full h-10 rounded-xl border border-border bg-background px-2 font-bold text-foreground outline-none focus:border-indigo-600"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Correspondence / Distance">Correspondence / Distance</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-muted-foreground mb-1 font-bold">Passout Year</label>
                    <input
                      type="text"
                      placeholder="e.g. 2024"
                      value={newEdu.completionYear}
                      onChange={(e) => setNewEdu({ ...newEdu, completionYear: e.target.value })}
                      className="w-full h-10 rounded-xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="block text-muted-foreground mb-1 font-bold">Percentage / CGPA</label>
                    <input
                      type="text"
                      placeholder="e.g. 8.5 CGPA or 85%"
                      value={newEdu.percentageOrCgpa || ""}
                      onChange={(e) => setNewEdu({ ...newEdu, percentageOrCgpa: e.target.value })}
                      className="w-full h-10 rounded-xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddEducation}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-sm transition-all active:scale-95"
                >
                  Save Education Record
                </button>
              </div>

              {/* Education List */}
              <div className="space-y-3 pt-2">
                {formData.educations.length === 0 ? (
                  <div className="p-6 text-center text-xs text-muted-foreground bg-secondary/20 rounded-2xl border border-dashed border-border">
                    No education records added yet. Add your highest degree/qualification above.
                  </div>
                ) : (
                  formData.educations.map((edu, idx) => (
                    <div key={idx} className="p-4 rounded-2xl border border-border bg-background flex items-start justify-between gap-3 shadow-xs">
                      <div>
                        <h4 className="font-black text-foreground text-sm">{edu.qualification}</h4>
                        {edu.specialization && <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{edu.specialization}</p>}
                        <p className="text-xs text-muted-foreground font-semibold mt-0.5">{edu.college} {edu.university ? `• ${edu.university}` : ""}</p>
                        <p className="text-[11px] text-muted-foreground font-bold mt-1">
                          Graduated {edu.completionYear || ""} • {edu.courseType || "Full-time"} {edu.percentageOrCgpa ? `• ${edu.percentageOrCgpa}` : ""}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, educations: formData.educations.filter((_, i) => i !== idx) })}
                        className="p-1.5 text-muted-foreground hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {renderTabFooter()}
            </div>
          )}

          {/* TAB 6: JOB PREFERENCES */}
          {activeTab === "preferences" && (
            <div className="rounded-3xl border border-border bg-card p-4 sm:p-6 space-y-4 text-xs font-semibold shadow-sm">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h2 className="text-sm font-black uppercase tracking-wide text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                  <Settings className="h-4 w-4" /> 6. Job Preferences & Target Career
                </h2>
                <span className="text-[11px] text-muted-foreground font-bold">Step 6 of 10</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground mb-1 font-bold">Desired Job Role</label>
                  <input
                    type="text"
                    value={formData.desiredRole || ""}
                    onChange={(e) => setFormData({ ...formData, desiredRole: e.target.value })}
                    className="w-full h-11 rounded-2xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-600"
                    placeholder="e.g. Full Stack Engineer, React Developer"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground mb-1 font-bold">Preferred Industry</label>
                  <select
                    value={formData.preferredIndustry || "IT & Software"}
                    onChange={(e) => setFormData({ ...formData, preferredIndustry: e.target.value })}
                    className="w-full h-11 rounded-2xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-600"
                  >
                    <option value="IT & Software">IT, Software & Technology</option>
                    <option value="Banking & Finance">Banking, Finance & Fintech</option>
                    <option value="E-Commerce & Retail">E-Commerce & Retail</option>
                    <option value="Sales & Digital Marketing">Sales & Digital Marketing</option>
                    <option value="Logistics & Delivery">Logistics & Delivery</option>
                    <option value="Healthcare">Healthcare & Pharmaceuticals</option>
                    <option value="Education & Edtech">Education & Edtech</option>
                  </select>
                </div>
              </div>

              {/* Preferred Shift & Relocate */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground mb-1 font-bold">Preferred Shift</label>
                  <select
                    value={formData.preferredShift || "Day Shift"}
                    onChange={(e) => setFormData({ ...formData, preferredShift: e.target.value })}
                    className="w-full h-11 rounded-2xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-600"
                  >
                    <option value="Day Shift">Day Shift</option>
                    <option value="Night Shift">Night Shift</option>
                    <option value="Rotational">Rotational Shift</option>
                    <option value="Flexible">Flexible Hours</option>
                  </select>
                </div>

                <div className="flex flex-col justify-center gap-2 pt-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.willingToRelocate}
                      onChange={(e) => setFormData({ ...formData, willingToRelocate: e.target.checked })}
                      className="w-4 h-4 rounded text-indigo-600"
                    />
                    <span>Willing to relocate across India</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.immediateJoining}
                      onChange={(e) => setFormData({ ...formData, immediateJoining: e.target.checked })}
                      className="w-4 h-4 rounded text-indigo-600"
                    />
                    <span>Available for immediate joining (within 7 days)</span>
                  </label>
                </div>
              </div>

              {renderTabFooter()}
            </div>
          )}

          {/* TAB 7: ADDITIONAL DETAILS */}
          {activeTab === "additional" && (
            <div className="rounded-3xl border border-border bg-card p-4 sm:p-6 space-y-4 text-xs font-semibold shadow-sm">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h2 className="text-sm font-black uppercase tracking-wide text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                  <Award className="h-4 w-4" /> 7. Additional Details, Portfolio & Assets
                </h2>
                <span className="text-[11px] text-muted-foreground font-bold">Step 7 of 10</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-muted-foreground mb-1 font-bold">Portfolio / Personal Website</label>
                  <input
                    type="url"
                    value={formData.portfolioUrl || ""}
                    onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                    className="w-full h-11 rounded-2xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-600"
                    placeholder="https://yourname.dev"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground mb-1 font-bold">LinkedIn Profile URL</label>
                  <input
                    type="url"
                    value={formData.linkedinUrl || ""}
                    onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                    className="w-full h-11 rounded-2xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-600"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground mb-1 font-bold">GitHub / GitLab URL</label>
                  <input
                    type="url"
                    value={formData.githubUrl || ""}
                    onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                    className="w-full h-11 rounded-2xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-600"
                    placeholder="https://github.com/username"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground mb-1 font-bold">Driving Licence (Field/Sales)</label>
                  <select
                    value={formData.drivingLicence || "None"}
                    onChange={(e) => setFormData({ ...formData, drivingLicence: e.target.value })}
                    className="w-full h-11 rounded-2xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-600"
                  >
                    <option value="None">No Driving Licence</option>
                    <option value="2-Wheeler (Motorcycle)">2-Wheeler (Motorcycle)</option>
                    <option value="4-Wheeler (Car/LMV)">4-Wheeler (Car / LMV)</option>
                    <option value="2-Wheeler & 4-Wheeler">Both 2-Wheeler & 4-Wheeler</option>
                    <option value="Commercial Heavy Vehicle">Commercial Heavy Vehicle</option>
                  </select>
                </div>

                <div>
                  <label className="block text-muted-foreground mb-1 font-bold">Own Vehicle (Delivery/Field)</label>
                  <select
                    value={formData.ownVehicle || "None"}
                    onChange={(e) => setFormData({ ...formData, ownVehicle: e.target.value })}
                    className="w-full h-11 rounded-2xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-600"
                  >
                    <option value="None">No Vehicle</option>
                    <option value="Bike / Scooter">Bike / Scooter</option>
                    <option value="Car">Car</option>
                    <option value="Bike & Car">Both Bike & Car</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground mb-1 font-bold">Awards & Achievements</label>
                <input
                  type="text"
                  value={formData.awards || ""}
                  onChange={(e) => setFormData({ ...formData, awards: e.target.value })}
                  className="w-full h-11 rounded-2xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-600"
                  placeholder="e.g. Hackathon Winner, Employee of the Month"
                />
              </div>

              <div>
                <label className="block text-muted-foreground mb-1 font-bold">Disability Accommodation (Optional & Confidential)</label>
                <input
                  type="text"
                  value={formData.disabilityAccommodations || ""}
                  onChange={(e) => setFormData({ ...formData, disabilityAccommodations: e.target.value })}
                  className="w-full h-11 rounded-2xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-600"
                  placeholder="e.g. Wheelchair access, screen reader accessibility"
                />
              </div>

              {renderTabFooter()}
            </div>
          )}

          {/* TAB 8: RESUME & DOCUMENTS */}
          {activeTab === "resume" && (
            <div className="rounded-3xl border border-border bg-card p-4 sm:p-6 space-y-4 text-xs font-semibold shadow-sm">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wide text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                    <FileText className="h-4 w-4" /> 8. Resume & Verification Documents
                  </h2>
                  <p className="text-[11px] text-muted-foreground font-semibold">
                    Upload your PDF/DOCX resume or generate an ATS-compliant resume directly inside Omeetso.
                  </p>
                </div>
                <span className="text-[11px] text-muted-foreground font-bold shrink-0">Step 8 of 10</span>
              </div>

              {/* Upload & Generate Box */}
              <div className="p-6 rounded-3xl border-2 border-dashed border-indigo-500/30 bg-indigo-50/40 dark:bg-indigo-950/20 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white mx-auto flex items-center justify-center shadow-md">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-foreground">Upload Your Resume Document</h3>
                  <p className="text-xs text-muted-foreground font-semibold">Supports PDF, DOCX (Max 10MB)</p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingResume}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md transition-all flex items-center gap-1.5 active:scale-95"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{uploadingResume ? "Uploading..." : "Upload PDF/DOCX"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowResumeModal(true)}
                    className="px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-secondary text-foreground font-black text-xs shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
                  >
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Generate Omeetso Resume</span>
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeFileChange}
                  className="hidden"
                />
              </div>

              {/* Current Resume Attachment */}
              {formData.resumeUrl && (
                <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-black text-foreground text-sm truncate">{formData.resumeFileName || "Uploaded Resume Document.pdf"}</h4>
                      <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Attached & ready for 1-Tap Job Applications</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={formData.resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25 text-xs font-bold flex items-center gap-1 active:scale-95 transition-all"
                      title="View Resume in New Tab"
                    >
                      <Eye className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> View
                    </a>
                    <button
                      type="button"
                      onClick={() => downloadDocument(formData.resumeUrl, formData.resumeFileName)}
                      className="px-3 py-1.5 rounded-xl bg-card border border-border text-xs font-bold hover:bg-secondary flex items-center gap-1 active:scale-95 transition-all"
                    >
                      <Download className="w-3.5 h-3.5 text-indigo-600" /> Download
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, resumeUrl: "", resumeFileName: "" }))}
                      className="p-1.5 text-muted-foreground hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Remove Resume"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {renderTabFooter()}
            </div>
          )}

          {/* TAB 9: PROFILE PRIVACY */}
          {activeTab === "privacy" && (
            <div className="rounded-3xl border border-border bg-card p-4 sm:p-6 space-y-4 text-xs font-semibold shadow-sm">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h2 className="text-sm font-black uppercase tracking-wide text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                  <Lock className="h-4 w-4" /> 9. Profile Privacy & Recruiter Controls
                </h2>
                <span className="text-[11px] text-muted-foreground font-bold">Step 9 of 10</span>
              </div>

              <div className="space-y-3">
                <label className="block text-muted-foreground font-bold">Recruiter Visibility Mode</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: "ALL_VERIFIED", title: "Visible to all Verified Recruiters", desc: "Highest reach. Verified companies can discover you." },
                    { id: "ONLY_AFTER_APPLY", title: "Visible only after applying", desc: "Private. Only employers of jobs you apply to see your details." },
                    { id: "PAUSED", title: "Pause Visibility", desc: "Take a break. Profile hidden from all recruiter search results." }
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, visibilityMode: mode.id as any })}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        formData.visibilityMode === mode.id
                          ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-sm"
                          : "border-border bg-background hover:bg-secondary"
                      }`}
                    >
                      <h4 className="font-black text-foreground text-xs">{mode.title}</h4>
                      <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{mode.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-border/60 space-y-2">
                <label className="flex items-center justify-between p-3 rounded-2xl border border-border bg-background cursor-pointer">
                  <div>
                    <span className="font-black text-foreground">Hide Current Employer</span>
                    <p className="text-[11px] text-muted-foreground">Prevents your current company recruiters from seeing you are looking for jobs.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.hideCurrentEmployer}
                    onChange={(e) => setFormData({ ...formData, hideCurrentEmployer: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-2xl border border-border bg-background cursor-pointer">
                  <div>
                    <span className="font-black text-foreground">Hide Mobile Phone Number</span>
                    <p className="text-[11px] text-muted-foreground">Recruiters must send an official interview chat request to reveal phone.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.hidePhone}
                    onChange={(e) => setFormData({ ...formData, hidePhone: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-2xl border border-border bg-background cursor-pointer">
                  <div>
                    <span className="font-black text-foreground">Hide Email Address</span>
                    <p className="text-[11px] text-muted-foreground">Communication routed through verified Omeetso job messaging.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.hideEmail}
                    onChange={(e) => setFormData({ ...formData, hideEmail: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                </label>
              </div>

              {/* Blocked Recruiters */}
              <div>
                <label className="block text-muted-foreground mb-1 font-bold">Block Specific Recruiters / Companies</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {formData.blockedRecruiters.map((rec, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-500/10 text-rose-700 text-xs font-bold border border-rose-500/20">
                      {rec}
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, blockedRecruiters: formData.blockedRecruiters.filter((_, i) => i !== idx) })}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={blockedInput}
                    onChange={(e) => setBlockedInput(e.target.value)}
                    placeholder="Enter company name to block (e.g. Current Employer Co)"
                    className="w-full h-10 rounded-xl border border-border bg-background px-3 font-bold text-foreground outline-none focus:border-indigo-600"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (blockedInput.trim()) {
                        setFormData({ ...formData, blockedRecruiters: [...formData.blockedRecruiters, blockedInput.trim()] });
                        setBlockedInput("");
                      }
                    }}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shrink-0"
                  >
                    Block
                  </button>
                </div>
              </div>

              {renderTabFooter()}
            </div>
          )}

          {/* TAB 10: USEFUL OMEETSO FEATURES */}
          {activeTab === "features" && (
            <div className="rounded-3xl border border-border bg-card p-4 sm:p-6 space-y-4 text-xs font-semibold shadow-sm">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h2 className="text-sm font-black uppercase tracking-wide text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                  <Bell className="h-4 w-4" /> 10. Useful Omeetso Career Features
                </h2>
                <span className="text-[11px] text-muted-foreground font-bold">Step 10 of 10</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl border border-border bg-background space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-foreground">One-Tap Job Applications</span>
                    <input
                      type="checkbox"
                      checked={formData.oneTapApplyEnabled}
                      onChange={(e) => setFormData({ ...formData, oneTapApplyEnabled: e.target.checked })}
                      className="w-4 h-4 rounded text-indigo-600"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">Auto-fill verified profile snapshot on applying for any one-tap hiring openings.</p>
                </div>

                <div className="p-4 rounded-2xl border border-border bg-background space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-foreground">Profile Update Reminders</span>
                    <input
                      type="checkbox"
                      checked={formData.updateReminderEnabled}
                      onChange={(e) => setFormData({ ...formData, updateReminderEnabled: e.target.checked })}
                      className="w-4 h-4 rounded text-indigo-600"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">Receive prompt every 30–60 days to keep skills & salary expectations refreshed.</p>
                </div>
              </div>

              {/* Job Alerts Configuration */}
              <div className="p-4 rounded-2xl border border-indigo-500/30 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-black text-indigo-600 dark:text-indigo-400 text-sm">🎯 Job Alert Preferences</span>
                  <input
                    type="checkbox"
                    checked={formData.jobAlertsEnabled}
                    onChange={(e) => setFormData({ ...formData, jobAlertsEnabled: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">Receive instant notifications when new jobs matching your title & salary are published.</p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <div>
                    <label className="block text-muted-foreground font-bold mb-1">Alert Frequency</label>
                    <select
                      value={formData.jobAlertPreferences?.frequency || "DAILY"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          jobAlertPreferences: {
                            ...formData.jobAlertPreferences,
                            frequency: e.target.value as any
                          }
                        })
                      }
                      className="w-full h-10 rounded-xl border border-border bg-background px-2 font-bold text-foreground outline-none"
                    >
                      <option value="INSTANT">Instant Push Notification</option>
                      <option value="DAILY">Daily Digest</option>
                      <option value="WEEKLY">Weekly Summary</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-muted-foreground font-bold mb-1">Min Salary Threshold (₹)</label>
                    <input
                      type="number"
                      value={formData.jobAlertPreferences?.minSalary || 60000}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          jobAlertPreferences: {
                            ...formData.jobAlertPreferences,
                            minSalary: Number(e.target.value)
                          }
                        })
                      }
                      className="w-full h-10 rounded-xl border border-border bg-background px-3 font-bold text-foreground outline-none"
                    />
                  </div>

                  <div className="flex items-end">
                    <Link
                      to="/my/jobs"
                      className="w-full h-10 rounded-xl bg-card border border-border hover:bg-secondary text-foreground font-black text-xs flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Briefcase className="w-3.5 h-3.5" /> Track Applications
                    </Link>
                  </div>
                </div>
              </div>

              {renderTabFooter(returnTo ? "Complete & Return to Job" : "Save All Details ✓")}
            </div>
          )}

          {/* Bottom Save & Registry Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-4 rounded-3xl border border-border bg-card shadow-sm gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Auto-saved to Omeetso Verified Candidate Registry</span>
            </div>

            <div className="flex items-center gap-2">
              {returnTo && (
                <button
                  type="button"
                  onClick={() => {
                    handleSave();
                    setTimeout(() => window.location.assign(returnTo), 500);
                  }}
                  className="px-4 py-2.5 rounded-2xl border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Save & Return</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => handleSave()}
                disabled={saving}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? "Saving Changes..." : "Save All Changes"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE BOTTOM STEP BAR (Quick Navigation on small screens) */}
        <div className="fixed bottom-0 inset-x-0 z-30 border-t border-border bg-card/95 backdrop-blur-md p-2.5 sm:hidden safe-b shadow-lg">
          <div className="flex items-center justify-between gap-2 max-w-[800px] mx-auto">
            <button
              type="button"
              disabled={currentTabIndex === 0}
              onClick={goToPrevTab}
              className="h-10 px-3 rounded-xl border border-border bg-background text-foreground font-bold text-xs flex items-center gap-1 disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <span className="text-[11px] font-extrabold text-muted-foreground truncate text-center px-1">
              {currentTabIndex + 1}/10: <span className="text-foreground font-black">{tabs[currentTabIndex]?.shortLabel}</span>
            </span>

            <button
              type="button"
              onClick={goToNextTab}
              className="h-10 px-3.5 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center gap-1 shadow-sm active:scale-95"
            >
              <span>{currentTabIndex === TAB_KEYS.length - 1 ? (returnTo ? "Done" : "Save") : "Next"}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ATS LIVE RESUME PREVIEW & DOWNLOAD MODAL */}
        {showResumeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-sm safe-t print:p-0 print:m-0 print:bg-white print:fixed print:inset-0 print:z-[9999]">
            <style>{`
              @media print {
                body * {
                  visibility: hidden !important;
                }
                #printable-resume-container, #printable-resume-container * {
                  visibility: visible !important;
                }
                #printable-resume-container {
                  position: absolute !important;
                  left: 0 !important;
                  top: 0 !important;
                  width: 100% !important;
                  max-width: 100% !important;
                  height: auto !important;
                  margin: 0 !important;
                  padding: 12px 16px !important;
                  background: #ffffff !important;
                  color: #111827 !important;
                  box-shadow: none !important;
                  border: none !important;
                  overflow: visible !important;
                  page-break-after: avoid !important;
                  page-break-inside: avoid !important;
                }
                .no-print {
                  display: none !important;
                }
                @page {
                  margin: 10mm;
                  size: auto;
                }
              }
            `}</style>
            <div id="printable-resume-container" className="w-full max-w-2xl max-h-[90vh] bg-white text-gray-900 rounded-3xl shadow-2xl overflow-y-auto p-4 sm:p-6 space-y-6 font-sans border border-gray-200 print:shadow-none print:border-none print:p-0 print:max-h-none print:rounded-none">
              
              {/* Modal Header */}
              <div className="no-print flex items-center justify-between pb-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-base font-black text-gray-900">Omeetso Generated ATS Resume</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1.5 rounded-xl border border-gray-300 bg-gray-100 hover:bg-gray-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" /> Print / PDF
                  </button>
                  <button
                    onClick={() => setShowResumeModal(false)}
                    className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Printable CV Document Layout */}
              <div className="space-y-6 text-xs text-gray-800 leading-relaxed print:p-0 print:space-y-4">
                {/* Header */}
                <div className="text-center space-y-1 pb-4 border-b border-gray-300">
                  <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">{formData.fullName || "Candidate"}</h1>
                  <p className="text-sm font-bold text-indigo-600">{formData.title}</p>
                  <p className="text-xs text-gray-600 font-semibold">
                    {formData.phone} • {formData.email} • {formData.city}, {formData.area || "India"}
                    {formData.linkedinUrl ? ` • ${formData.linkedinUrl}` : ""}
                  </p>
                </div>

                {/* Summary */}
                {formData.summary && (
                  <div className="space-y-1">
                    <h2 className="text-xs font-black uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-0.5">Professional Summary</h2>
                    <p className="text-xs text-gray-700 font-medium">{formData.summary}</p>
                  </div>
                )}

                {/* Skills */}
                {formData.skillsList?.length > 0 && (
                  <div className="space-y-1">
                    <h2 className="text-xs font-black uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-0.5">Core Competencies & Skills</h2>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {formData.skillsList.map((s, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-gray-100 font-bold text-[11px] text-gray-800 border border-gray-200">
                          {s.name} ({s.proficiency})
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Work Experience */}
                {formData.workExperiences?.length > 0 && (
                  <div className="space-y-2">
                    <h2 className="text-xs font-black uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-0.5">Work Experience</h2>
                    {formData.workExperiences.map((exp, i) => (
                      <div key={i} className="space-y-0.5">
                        <div className="flex justify-between font-black text-gray-900">
                          <span>{exp.jobTitle} — {exp.companyName}</span>
                          <span className="text-gray-600 font-bold">{exp.startDate} – {exp.isCurrentlyWorking ? "Present" : exp.endDate}</span>
                        </div>
                        <p className="text-[11px] text-gray-600 font-medium">{exp.location} • {exp.employmentType}</p>
                        {exp.responsibilities && <p className="text-xs text-gray-700">{exp.responsibilities}</p>}
                        {exp.achievements && <p className="text-xs text-emerald-700 font-semibold">🏆 {exp.achievements}</p>}
                      </div>
                    ))}
                  </div>
                )}

                {/* Education */}
                {formData.educations?.length > 0 && (
                  <div className="space-y-2">
                    <h2 className="text-xs font-black uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-0.5">Education</h2>
                    {formData.educations.map((edu, i) => (
                      <div key={i} className="flex justify-between items-start">
                        <div>
                          <p className="font-black text-gray-900">{edu.qualification} {edu.specialization ? `in ${edu.specialization}` : ""}</p>
                          <p className="text-xs text-gray-700 font-semibold">{edu.college} {edu.university ? `• ${edu.university}` : ""}</p>
                        </div>
                        <span className="text-gray-600 font-bold">{edu.completionYear} {edu.percentageOrCgpa ? `(${edu.percentageOrCgpa})` : ""}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Additional / Projects */}
                {formData.projects?.length > 0 && (
                  <div className="space-y-1">
                    <h2 className="text-xs font-black uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-0.5">Key Projects</h2>
                    {formData.projects.map((p, i) => (
                      <div key={i} className="space-y-0.5">
                        <p className="font-black text-gray-900">{p.title} {p.role ? `(${p.role})` : ""}</p>
                        {p.description && <p className="text-xs text-gray-700">{p.description}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </MobileFrame>
  );
}
