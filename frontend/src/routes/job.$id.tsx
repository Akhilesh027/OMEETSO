import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft, Building2, MapPin, ShieldCheck, Share2, Heart, MessageCircle, Phone,
  Clock, Calendar, CheckCircle2, AlertTriangle, ShieldAlert, Sparkles, Footprints, Flag, ArrowRight,
  FileText, Trash2, ExternalLink, Upload, RefreshCw
} from "lucide-react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { JobCard } from "@/components/omeetso/jobs/JobCard";
import { ApplyJobModal } from "@/components/omeetso/jobs/ApplyJobModal";
import { fetchJobById, JobItem, toggleSaveJobLocal, getSavedJobIds, listCandidateApplicationsLocal, checkIsCandidateApplied, CandidateProfileItem } from "@/lib/jobs";
import { uploadFile } from "@/lib/upload";
import { ReportSheet } from "@/components/omeetso/ReportSheet";
import { startConversationApi } from "@/api/chat.api";
import { API_BASE } from "@/config/api";
import { toast } from "sonner";

export const Route = createFileRoute("/job/$id")({
  loader: async ({ params }) => {
    const j = await fetchJobById(params.id);
    if (!j) throw notFound();
    return { job: j };
  },
  head: ({ loaderData }) => ({
    meta: loaderData?.job
      ? [
          { title: `${loaderData.job.title} at ${loaderData.job.companyName} · Omeetso Jobs` },
          { name: "description", content: loaderData.job.jobDetails.description },
        ]
      : [{ title: "Job Details · Omeetso" }],
  }),
  component: JobDetailPage,
  notFoundComponent: NotFound,
});

function JobDetailPage() {
  const { id } = Route.useParams();
  const loaderData = Route.useLoaderData();
  const nav = useNavigate();

  const [job, setJob] = useState<JobItem>(loaderData.job);
  const [saved, setSaved] = useState(() => getSavedJobIds().includes(id));
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [applied, setApplied] = useState(false);
  const [candidateProfile, setCandidateProfile] = useState<CandidateProfileItem | null>(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentUser = (() => {
    if (typeof window === "undefined") return null;
    try {
      return JSON.parse(localStorage.getItem("omeetso_user") || "null");
    } catch {
      return null;
    }
  })();

  const currentUserId = currentUser?._id || currentUser?.id;
  const isOwner = Boolean(
    currentUserId && (
      job.employerId === currentUserId ||
      (job.employerId === "me" && currentUser) ||
      (job as any).isOwner
    )
  );

  const verifyApplication = async (jobId: string, currentJob: JobItem) => {
    if (typeof window === "undefined") return;
    const uId = currentUserId;
    if (uId && (currentJob.employerId === uId || currentJob.employerId === "me")) {
      setApplied(false);
      return;
    }
    const isApp = await checkIsCandidateApplied(jobId);
    setApplied(isApp);
  };

  const loadCandidateProfile = async () => {
    if (typeof window === "undefined") return;
    try {
      const local = localStorage.getItem("omeetso_candidate_profile");
      if (local) {
        setCandidateProfile(JSON.parse(local));
      }
      const token = localStorage.getItem("omeetso_user_token");
      const res = await fetch(`${API_BASE}/jobs/candidate/profile`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setCandidateProfile(json.data);
        }
      }
    } catch { }
  };

  const handleDirectResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be under 10MB");
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

      const updated = {
        ...(candidateProfile || {}),
        resumeUrl: finalUrl,
        resumeFileName: file.name
      };
      setCandidateProfile(updated as any);
      try {
        localStorage.setItem("omeetso_candidate_profile", JSON.stringify(updated));
      } catch { }
      toast.success(`Resume "${file.name}" uploaded & attached!`);
    } catch {
      const localUrl = URL.createObjectURL(file);
      const updated = {
        ...(candidateProfile || {}),
        resumeUrl: localUrl,
        resumeFileName: file.name
      };
      setCandidateProfile(updated as any);
      try {
        localStorage.setItem("omeetso_candidate_profile", JSON.stringify(updated));
      } catch { }
      toast.success(`Resume "${file.name}" attached.`);
    } finally {
      setUploadingResume(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    fetchJobById(id).then((data) => {
      if (data) {
        setJob(data);
        verifyApplication(id, data);
      } else {
        verifyApplication(id, job);
      }
    });
    loadCandidateProfile();
  }, [id]);

  const handleSaveToggle = () => {
    const isSaved = toggleSaveJobLocal(job.id);
    setSaved(isSaved);
  };

  const isClosed = job.status === "FILLED" || job.status === "EXPIRED" || job.status === "PAUSED";

  const salaryText = job.salary.salaryDisclosed
    ? `₹${job.salary.minSalary.toLocaleString("en-IN")} - ₹${job.salary.maxSalary.toLocaleString("en-IN")} / ${job.salary.salaryPeriod}`
    : "Salary Not Disclosed";

  const isUnapproved = job.status === "SUBMITTED" || job.status === "pending" || job.status === "PENDING" || job.status === "REJECTED";
  if (isUnapproved && !isOwner) {
    return <NotFound />;
  }

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-28 md:pb-20 font-sans">
        
        {/* Top Sticky Header Bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card/80 backdrop-blur-md px-4 py-3 safe-t">
          <div className="flex items-center gap-2">
            <button onClick={() => history.back()} className="grid h-9 w-9 place-items-center rounded-full hover:bg-secondary">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-sm font-extrabold text-foreground truncate max-w-[200px] sm:max-w-md">{job.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleSaveToggle} className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-foreground">
              <span className={saved ? "text-rose-500 font-bold" : ""}>{saved ? "♥" : "♡"}</span>
            </button>
            <button onClick={() => setReportOpen(true)} className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-foreground">
              <Flag className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Closed Job Alert Banner */}
        {isClosed && (
          <div className="bg-rose-500/10 border-b border-rose-500/20 p-3 text-center text-xs font-black text-rose-700">
            ⚠️ This position is no longer accepting applications ({job.status}).
          </div>
        )}

        {/* Under Review Alert Banner */}
        {(job.status === "SUBMITTED" || job.status === "pending") && (
          <div className="bg-amber-500/15 border-b border-amber-500/30 p-3 text-center text-xs font-black text-amber-800 dark:text-amber-300">
            ⏳ This job posting is currently under moderation review by the admin team. It will be published publicly once approved.
          </div>
        )}

        <div className="max-w-[1000px] mx-auto px-4 py-6 space-y-6">
          
          {/* HERO JOB HEADER BOX */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl border border-border bg-muted/30">
                  {job.companyLogo ? (
                    <img src={job.companyLogo} alt={job.companyName} className="h-full w-full object-cover" />
                  ) : (
                    <Building2 className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">{job.title}</h1>
                  <p className="text-sm font-bold text-foreground flex items-center gap-1.5 mt-0.5">
                    {job.companyName}
                    {job.isVerifiedEmployer && (
                      <span className="inline-flex items-center gap-0.5 text-xs text-emerald-600 font-bold">
                        <ShieldCheck className="h-4 w-4" /> Verified Employer
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground font-semibold mt-1">
                    📍 {job.location.area}, {job.location.city} • Openings: <span className="font-extrabold text-foreground">{job.openingsCount}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/60">
              {job.walkInDetails?.isWalkIn && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-black text-amber-700 border border-amber-500/30">
                  <Footprints className="h-3.5 w-3.5" /> WALK-IN INTERVIEW
                </span>
              )}
              {job.isUrgent && (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 px-3 py-1 text-xs font-black text-rose-700 border border-rose-500/30">
                  ⚡ URGENT HIRING
                </span>
              )}
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-foreground">
                💼 {job.jobType.replace("_", " ")}
              </span>
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-foreground">
                🏢 {job.workplaceType.replace("_", " ")}
              </span>
            </div>

            {/* Highlighted Salary Box */}
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wide text-emerald-800">Compensation / Pay</p>
                <p className="text-lg font-black text-emerald-700">{salaryText}</p>
              </div>
              {job.salary.incentivesAvailable && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-500/20 px-3 py-1 rounded-xl w-fit">
                  ✨ Additional Incentives Available
                </span>
              )}
            </div>




            {/* Application Resume Status: Uploaded Resume OR Manual Resume */}
            <div className="rounded-2xl border border-border bg-secondary/15 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                  Your Application Resume Methods
                </span>
                <span className="text-[10px] text-muted-foreground font-semibold">
                  Upload PDF file <span className="font-bold text-foreground">OR</span> build 10-section profile
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Hidden File Input for Direct Upload */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={handleDirectResumeUpload}
                />

                {/* Method 1: Uploaded Resume Status */}
                <div className={`p-3 rounded-xl border transition-all ${
                  candidateProfile?.resumeFileName || candidateProfile?.resumeUrl
                    ? "border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20"
                    : "border-border bg-card"
                }`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        candidateProfile?.resumeFileName || candidateProfile?.resumeUrl
                          ? "bg-emerald-600 text-white"
                          : "bg-secondary text-muted-foreground"
                      }`}>
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-foreground truncate">
                          {candidateProfile?.resumeFileName || (candidateProfile?.resumeUrl ? "Uploaded Resume.pdf" : "Upload Resume (PDF/DOCX)")}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-semibold truncate">
                          {candidateProfile?.resumeUrl ? "✓ Attached document" : "Attach PDF file for employer"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {candidateProfile?.resumeUrl ? (
                        <>
                          <a
                            href={candidateProfile.resumeUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-card border border-border text-foreground hover:bg-secondary text-[10px] font-bold flex items-center gap-1"
                            title="View Resume"
                          >
                            <ExternalLink className="w-3 h-3 text-indigo-600" />
                          </a>

                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingResume}
                            className="px-2 py-1 rounded-lg border border-indigo-500/30 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 text-[10px] font-bold flex items-center gap-1"
                            title="Replace Resume"
                          >
                            <RefreshCw className={`w-3 h-3 ${uploadingResume ? "animate-spin" : ""}`} />
                            <span>Replace</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              const updated = { ...(candidateProfile || {}), resumeUrl: "", resumeFileName: "" };
                              setCandidateProfile(updated as any);
                              try {
                                localStorage.setItem("omeetso_candidate_profile", JSON.stringify(updated));
                              } catch { }
                              toast.success("Uploaded resume removed.");
                            }}
                            className="p-1.5 text-muted-foreground hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors"
                            title="Remove Uploaded Resume"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingResume}
                          className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] flex items-center gap-1 shadow-xs transition-all active:scale-95"
                        >
                          <Upload className="w-3 h-3" />
                          <span>{uploadingResume ? "Uploading..." : "Upload PDF"}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Method 2: Manual ATS Profile Status */}
                <div className={`p-3 rounded-xl border transition-all ${
                  (candidateProfile?.skills?.length || 0) > 0 || (candidateProfile?.workExperiences?.length || 0) > 0
                    ? "border-indigo-500/30 bg-indigo-50/40 dark:bg-indigo-950/20"
                    : "border-border bg-card"
                }`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        (candidateProfile?.skills?.length || 0) > 0
                          ? "bg-indigo-600 text-white"
                          : "bg-secondary text-muted-foreground"
                      }`}>
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-foreground truncate">
                          {candidateProfile?.title ? candidateProfile.title : "Manual ATS Resume"}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-semibold truncate">
                          {(candidateProfile?.skills?.length || 0) > 0
                            ? `✓ ${candidateProfile?.skills?.length} skills • ${candidateProfile?.experienceYears || "Fresher"}`
                            : "Click Manual Resume to build"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Link
                        to="/my/profile/jobs"
                        search={{ returnTo: `/job/${job.id}` }}
                        className="px-2 py-1 rounded-lg bg-card border border-border text-indigo-600 dark:text-indigo-400 hover:bg-secondary text-[10px] font-extrabold"
                      >
                        Edit
                      </Link>

                      {((candidateProfile?.skills?.length || 0) > 0 || (candidateProfile?.workExperiences?.length || 0) > 0) && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = {
                              ...(candidateProfile || {}),
                              skills: [],
                              skillsList: [],
                              workExperiences: [],
                              educations: [],
                              education: "",
                              summary: "",
                              certifications: []
                            };
                            setCandidateProfile(updated as any);
                            try {
                              localStorage.setItem("omeetso_candidate_profile", JSON.stringify(updated));
                            } catch { }
                            toast.success("Manual profile details cleared.");
                          }}
                          className="p-1.5 text-muted-foreground hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Remove Manual Profile Data"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {isOwner ? (
                <Link
                  to="/my/employer/jobs"
                  className="flex-1 min-w-[160px] h-12 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-md transition-all bg-indigo-brand text-white hover:bg-indigo-brand/90"
                >
                  <Building2 className="h-5 w-5" /> Manage Job & Applicants
                </Link>
              ) : (
                <button
                  onClick={() => {
                    if (isClosed) return;
                    if (applied) return;
                    setApplyModalOpen(true);
                  }}
                  disabled={isClosed || applied}
                  className={`flex-1 min-w-[160px] h-12 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-md transition-all ${
                    applied
                      ? "bg-emerald-600 text-white cursor-default"
                      : isClosed
                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                      : "bg-indigo-brand text-white hover:bg-indigo-brand/90"
                  }`}
                >
                  {applied ? (
                    <>
                      <CheckCircle2 className="h-5 w-5" /> Applied ✓
                    </>
                  ) : isClosed ? (
                    "Position Closed"
                  ) : (
                    "Apply Now"
                  )}
                </button>
              )}

              <Link
                to="/my/profile/jobs"
                search={{ returnTo: `/job/${job.id}` }}
                className="h-12 px-4 rounded-2xl border border-indigo-500/30 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 font-bold text-xs flex items-center gap-2 transition-colors shadow-xs"
                title="Build or update your Manual ATS Resume before applying"
              >
                <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span>Manual Resume</span>
              </Link>

              <button
                onClick={async () => {
                  try {
                    const res = await startConversationApi("JOB", job.id, job.employerId);
                    if (res.success && res.data?.id) {
                      nav({ to: "/chat/$id", params: { id: res.data.id } });
                    } else {
                      toast.error(res.error?.message || "Could not start chat with employer");
                    }
                  } catch {
                    toast.error("Failed to start chat. Please make sure you are logged in.");
                  }
                }}
                className="h-12 px-5 rounded-2xl border border-border bg-card hover:bg-secondary font-bold text-xs flex items-center gap-2"
              >
                <MessageCircle className="h-4 w-4 text-indigo-brand" /> Chat with Employer
              </button>

              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: job.title, url: window.location.href });
                  }
                }}
                className="h-12 px-4 rounded-2xl border border-border bg-card hover:bg-secondary grid place-items-center"
                title="Share Job"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* WALK-IN DETAILS BOX */}
          {job.walkInDetails?.isWalkIn && (
            <div className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-5 space-y-3 font-sans">
              <h3 className="text-base font-black text-amber-900 flex items-center gap-2">
                <Footprints className="h-5 w-5 text-amber-700" /> Direct Walk-In Interview Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold">
                {job.walkInDetails.startDate && job.walkInDetails.endDate && job.walkInDetails.startDate !== job.walkInDetails.endDate ? (
                  <>
                    <div><span className="text-amber-800 font-bold">Interview Start Date:</span> {new Date(job.walkInDetails.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
                    <div><span className="text-amber-800 font-bold">Interview End Date:</span> {new Date(job.walkInDetails.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
                  </>
                ) : (
                  <div>
                    <span className="text-amber-800 font-bold">Interview Date:</span>{" "}
                    {job.walkInDetails.startDate || job.walkInDetails.walkInDate
                      ? new Date(job.walkInDetails.startDate || job.walkInDetails.walkInDate!).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                      : "This Week"}
                  </div>
                )}
                <div><span className="text-amber-800 font-bold">Timings:</span> {job.walkInDetails.startTime} - {job.walkInDetails.endTime}</div>
                <div className="sm:col-span-2"><span className="text-amber-800 font-bold">Venue Address:</span> {job.walkInDetails.venue}</div>
                <div><span className="text-amber-800 font-bold">Contact Person:</span> {job.walkInDetails.contactPerson}</div>
                {job.walkInDetails.instructions && (
                  <div className="sm:col-span-2"><span className="text-amber-800 font-bold">Instructions:</span> {job.walkInDetails.instructions}</div>
                )}
              </div>
            </div>
          )}

          {/* JOB HIGHLIGHTS */}
          <div className="rounded-3xl border border-border bg-card p-6 space-y-4">
            <h2 className="text-base font-extrabold text-foreground uppercase tracking-wide">Job Specifications</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-2xl bg-secondary/50">
                <p className="text-muted-foreground font-bold">Experience Required</p>
                <p className="font-black text-foreground mt-0.5">{job.candidateCriteria.experience}</p>
              </div>
              <div className="p-3 rounded-2xl bg-secondary/50">
                <p className="text-muted-foreground font-bold">Minimum Education</p>
                <p className="font-black text-foreground mt-0.5">{job.candidateCriteria.minEducation}</p>
              </div>
              <div className="p-3 rounded-2xl bg-secondary/50">
                <p className="text-muted-foreground font-bold">Working Days</p>
                <p className="font-black text-foreground mt-0.5">{job.jobDetails.workingDays || "Mon-Fri"}</p>
              </div>
              <div className="p-3 rounded-2xl bg-secondary/50">
                <p className="text-muted-foreground font-bold">Shift & Hours</p>
                <p className="font-black text-foreground mt-0.5">{job.jobDetails.shiftType || "Day Shift"}</p>
              </div>
              <div className="p-3 rounded-2xl bg-secondary/50">
                <p className="text-muted-foreground font-bold">Freshers Allowed</p>
                <p className="font-black text-foreground mt-0.5">{job.candidateCriteria.fresherAllowed ? "Yes ✓" : "No"}</p>
              </div>
              <div className="p-3 rounded-2xl bg-secondary/50">
                <p className="text-muted-foreground font-bold">Languages Required</p>
                <p className="font-black text-foreground mt-0.5">{job.candidateCriteria.languages?.join(", ") || "English, Telugu"}</p>
              </div>
            </div>
          </div>

          {/* JOB DESCRIPTION & REQUIREMENTS */}
          <div className="rounded-3xl border border-border bg-card p-6 space-y-4">
            <h2 className="text-base font-extrabold text-foreground uppercase tracking-wide">Job Description</h2>
            <p className="text-xs sm:text-sm leading-relaxed text-foreground/90 font-medium whitespace-pre-line">
              {job.jobDetails.description}
            </p>

            {job.jobDetails.responsibilities && (
              <div className="pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">Responsibilities</h3>
                <p className="text-xs leading-relaxed text-foreground/90 whitespace-pre-line">{job.jobDetails.responsibilities}</p>
              </div>
            )}

            {job.jobDetails.requirements && (
              <div className="pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">Requirements & Skills</h3>
                <p className="text-xs leading-relaxed text-foreground/90 whitespace-pre-line">{job.jobDetails.requirements}</p>
              </div>
            )}

            {job.candidateCriteria.skills.length > 0 && (
              <div className="pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">Required Key Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.candidateCriteria.skills.map((skill) => (
                    <span key={skill} className="rounded-xl bg-indigo-brand/10 text-indigo-brand font-bold text-xs px-3 py-1">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ABOUT THE COMPANY */}
          <div className="rounded-3xl border border-border bg-card p-6 space-y-3">
            <h2 className="text-base font-extrabold text-foreground uppercase tracking-wide">About {job.companyName}</h2>
            <div className="flex items-start gap-4">
              <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl border border-border bg-muted/30">
                {job.companyLogo ? (
                  <img src={job.companyLogo} alt={job.companyName} className="h-full w-full object-cover" />
                ) : (
                  <Building2 className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <div className="space-y-1 text-xs">
                <h3 className="font-extrabold text-foreground text-sm flex items-center gap-1.5">
                  {job.companyName}
                  {job.isVerifiedEmployer && <ShieldCheck className="h-4 w-4 text-emerald-600" />}
                </h3>
                <p className="text-muted-foreground font-semibold">Industry: {job.companyIndustry} • Size: {job.companySize}</p>
                <p className="text-foreground/80 leading-relaxed">{job.companyDescription || "Verified local employer operating in Hyderabad."}</p>
              </div>
            </div>
            {job.storeId && (
              <Link to="/store/$id" params={{ id: job.storeId }} className="group inline-flex items-center gap-1 text-xs font-bold text-indigo-brand hover:underline pt-2">
                <span>View Business Profile</span>
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </Link>
            )}
          </div>

          {/* SAFETY ADVISORY */}
          <div className="flex items-start gap-3 rounded-3xl border border-amber-500/30 bg-amber-500/10 p-5 text-xs text-amber-900 font-semibold">
            <ShieldAlert className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-black text-amber-950 text-sm">Omeetso Recruitment Safety Guarantee</p>
              <p>Never pay any cash, online deposit, interview fee, or training charge to apply for any job on Omeetso. Genuine employers never request upfront payment.</p>
            </div>
          </div>

          {/* MORE JOBS FROM COMPANY & SIMILAR JOBS */}
          {job.companyJobs && job.companyJobs.length > 0 && (
            <section className="space-y-3 pt-4">
              <h2 className="text-base font-extrabold text-foreground">More Openings From {job.companyName}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {job.companyJobs.map((j) => (
                  <JobCard key={j.id} job={j} />
                ))}
              </div>
            </section>
          )}

          {job.similarJobs && job.similarJobs.length > 0 && (
            <section className="space-y-3 pt-4">
              <h2 className="text-base font-extrabold text-foreground">Similar Jobs You May Like</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {job.similarJobs.map((j) => (
                  <JobCard key={j.id} job={j} />
                ))}
              </div>
            </section>
          )}

        </div>

        {/* STICKY BOTTOM APPLY BAR (Mobile / Desktop) */}
        <div className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-card/90 backdrop-blur-md p-3 safe-b">
          <div className="max-w-[1000px] mx-auto flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-foreground truncate">{job.title}</p>
              <p className="text-[11px] font-extrabold text-emerald-600">{salaryText}</p>
            </div>
            {isOwner ? (
              <Link
                to="/my/employer/jobs"
                className="px-6 h-11 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg bg-indigo-brand text-white hover:bg-indigo-brand/90 transition-all"
              >
                <Building2 className="h-4 w-4" /> Manage Job
              </Link>
            ) : (
              <button
                onClick={() => {
                  if (isClosed || applied) return;
                  setApplyModalOpen(true);
                }}
                disabled={isClosed || applied}
                className={`px-8 h-11 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition-all ${
                  applied
                    ? "bg-emerald-600 text-white cursor-default"
                    : isClosed
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "bg-indigo-brand text-white hover:bg-indigo-brand/90"
                }`}
              >
                {applied ? "Applied ✓" : isClosed ? "Closed" : "Apply Now"}
              </button>
            )}
          </div>
        </div>

        <ApplyJobModal
          job={job}
          isOpen={applyModalOpen}
          onClose={() => setApplyModalOpen(false)}
          onSuccess={() => setApplied(true)}
        />

        <ReportSheet
          open={reportOpen}
          onClose={() => setReportOpen(false)}
          listingId={job.id}
        />

      </div>
    </MobileFrame>
  );
}

function NotFound() {
  const nav = useNavigate();
  return (
    <MobileFrame>
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center text-2xl font-black shadow-inner">
          💼
        </div>
        <h2 className="text-xl font-black text-foreground">Job Listing Not Found</h2>
        <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
          This job post is either a temporary preview that has been published or is no longer available.
        </p>
        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={() => nav({ to: "/jobs" })}
            className="px-5 py-2.5 bg-indigo-brand text-white font-extrabold text-xs rounded-xl shadow-md hover:bg-indigo-brand/90 transition-all"
          >
            Explore Active Jobs
          </button>
          <button
            onClick={() => nav({ to: "/jobs/post" })}
            className="px-4 py-2.5 bg-secondary text-foreground font-bold text-xs rounded-xl hover:bg-secondary/80 transition-all"
          >
            Post a Job
          </button>
        </div>
      </div>
    </MobileFrame>
  );
}
