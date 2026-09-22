import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ArrowLeft, Plus, Users, Eye, CheckCircle2, Clock, Calendar, Search, Filter,
  FileText, MessageCircle, MoreVertical, Copy, RefreshCw, XCircle, ShieldCheck, Lock,
  Briefcase, Phone, Mail, MapPin, GraduationCap, Award, Sparkles, ExternalLink,
  Globe, Linkedin, Github, X, Download, User, Maximize2
} from "lucide-react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import {
  fetchEmployerJobs,
  fetchEmployerJobApplicants,
  listCandidateApplicationsLocal,
  JobItem,
  JobApplicationItem
} from "@/lib/jobs";
import { downloadDocument } from "@/lib/download";
import { startConversationApi } from "@/api/chat.api";
import { API_BASE } from "@/config/api";
import { toast } from "sonner";
import { pushNotification } from "@/lib/account";

export const Route = createFileRoute("/my/employer/jobs")({
  head: () => ({ meta: [{ title: "Employer Jobs & Candidate Dashboard — Omeetso" }] }),
  component: EmployerJobsDashboardPage,
});

function normalizeFileUrl(url?: string): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("blob:") || url.startsWith("data:")) {
    return url;
  }
  return `${API_BASE.replace("/api", "")}${url.startsWith("/") ? "" : "/"}${url}`;
}

function getApplicantResumeUrl(app: JobApplicationItem): string {
  const snap = app.applicantProfileSnapshot as any;
  if (!snap) return normalizeFileUrl((app as any).resumeUrl || "");
  const rawUrl = snap.resumeUrl || (app as any).resumeUrl || (snap.savedResumes && snap.savedResumes[0]?.url) || "";
  return normalizeFileUrl(rawUrl);
}

function getApplicantResumeFileName(app: JobApplicationItem): string {
  const snap = app.applicantProfileSnapshot as any;
  if (!snap) return (app as any).resumeFileName || "Candidate_Resume.pdf";
  return snap.resumeFileName || (app as any).resumeFileName || (snap.savedResumes && snap.savedResumes[0]?.name) || "Candidate_Resume.pdf";
}

function EmployerJobsDashboardPage() {
  const nav = useNavigate();
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [applicants, setApplicants] = useState<JobApplicationItem[]>([]);
  const [applicantStatusFilter, setApplicantStatusFilter] = useState("ALL");
  const [applicantSearch, setApplicantSearch] = useState("");
  const [scheduleModalApp, setScheduleModalApp] = useState<JobApplicationItem | null>(null);
  const [employerNotesApp, setEmployerNotesApp] = useState<JobApplicationItem | null>(null);
  const [selectedApplicantDetail, setSelectedApplicantDetail] = useState<JobApplicationItem | null>(null);
  const [resumeViewerModal, setResumeViewerModal] = useState<{ url: string; title: string; fileName?: string } | null>(null);

  const [interviewForm, setInterviewForm] = useState({
    date: "",
    time: "11:00 AM",
    type: "IN_PERSON" as any,
    venueOrLink: "Office Premises / Google Meet",
    contactPerson: "HR Manager",
    notes: "Please carry original education certificates."
  });

  const [privateNoteInput, setPrivateNoteInput] = useState("");

  const loadData = async () => {
    setLoading(true);
    let currentUserId = "me";
    let token: string | null = null;
    try {
      token = localStorage.getItem("omeetso_user_token");
      const u = JSON.parse(localStorage.getItem("omeetso_user") || "{}");
      if (u._id || u.id) currentUserId = u._id || u.id;
    } catch { }

    try {
      const myJobs = await fetchEmployerJobs(currentUserId, token);
      setJobs(myJobs);
      if (myJobs.length > 0) {
        const firstId = myJobs[0].id;
        const firstJob = myJobs[0];
        setSelectedJobId(firstId);
        const firstJobApplicants = await fetchEmployerJobApplicants(firstId, token, firstJob.title);
        setApplicants(firstJobApplicants);
      } else {
        setApplicants([]);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectJob = async (jobId: string) => {
    setSelectedJobId(jobId);
    let token: string | null = null;
    try {
      token = localStorage.getItem("omeetso_user_token");
    } catch { }

    const clickedJob = jobs.find((j) => j.id === jobId);
    const jobApps = await fetchEmployerJobApplicants(jobId, token, clickedJob?.title);
    setApplicants(jobApps);
  };

  const activeJob = jobs.find((j) => j.id === selectedJobId) || jobs[0];

  const filteredApplicants = applicants.filter((a, index, self) => {
    // Deduplicate by id or composite applicant details
    const currentKey = a.id || `${a.jobId}_${a.applicantId || a.applicantProfileSnapshot?.phone || a.applicantProfileSnapshot?.name}`;
    const firstIndex = self.findIndex((x) => {
      const xKey = x.id || `${x.jobId}_${x.applicantId || x.applicantProfileSnapshot?.phone || x.applicantProfileSnapshot?.name}`;
      return xKey === currentKey;
    });
    if (firstIndex !== index) return false;

    if (applicantStatusFilter !== "ALL") {
      const aStatus = String(a.status || "").toUpperCase();
      const fStatus = String(applicantStatusFilter || "").toUpperCase();
      if (aStatus !== fStatus) return false;
    }

    if (applicantSearch.trim()) {
      const q = applicantSearch.toLowerCase();
      const snapshot = a.applicantProfileSnapshot || ({} as any);
      const matchName = snapshot.name?.toLowerCase().includes(q);
      const matchRole = snapshot.currentRole?.toLowerCase().includes(q) || snapshot.title?.toLowerCase().includes(q);
      const matchCity = snapshot.city?.toLowerCase().includes(q);
      const matchSkills = snapshot.skills?.some((s: string) => s.toLowerCase().includes(q));
      if (!matchName && !matchRole && !matchCity && !matchSkills) return false;
    }

    return true;
  });

  const handleUpdateStatus = async (appId: string, nextStatus: string) => {
    const target = applicants.find((a) => a.id === appId);
    const updated = applicants.map((a) => (a.id === appId ? { ...a, status: nextStatus as any } : a));
    setApplicants(updated);
    if (selectedApplicantDetail && selectedApplicantDetail.id === appId) {
      setSelectedApplicantDetail({ ...selectedApplicantDetail, status: nextStatus as any });
    }

    if (typeof localStorage !== "undefined" && selectedJobId) {
      localStorage.setItem(`omeetso_employer_applicants_${selectedJobId}`, JSON.stringify(updated));

      // Also sync candidate local storage if present on same device
      try {
        const u = JSON.parse(localStorage.getItem("omeetso_user") || "null");
        const uid = u?._id || u?.id;
        const keys = ["omeetso_candidate_applied_jobs", uid ? `omeetso_candidate_applications_${uid}` : ""].filter(Boolean);
        for (const k of keys) {
          const raw = localStorage.getItem(k);
          if (raw) {
            const arr = JSON.parse(raw);
            if (Array.isArray(arr)) {
              const updatedCand = arr.map((item: any) => {
                if (item.id === appId || item._id === appId || item.jobId === selectedJobId) {
                  return { ...item, status: nextStatus };
                }
                return item;
              });
              localStorage.setItem(k, JSON.stringify(updatedCand));
            }
          }
        }
      } catch {}
    }

    const token = typeof window !== "undefined" ? localStorage.getItem("omeetso_user_token") : null;
    try {
      if (token) {
        await fetch(`${API_BASE}/jobs/applicants/${appId}/status`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ status: nextStatus })
        });
      }
    } catch { }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("omeetso_job_applications_changed"));
      window.dispatchEvent(new Event("storage"));
    }

    toast.success(`Candidate status updated to "${nextStatus}"`);

    if (!token) {
      pushNotification({
        id: `job-app-status-${appId}-${Date.now()}`,
        category: "job_application",
        title: `Application Status Updated: ${target?.job?.title || "Job Application"}`,
        body: `Your application status for "${target?.job?.title || "Position"}" was updated to ${nextStatus}.`,
        destination: "/my/jobs",
        destinationLabel: "View Job Application",
        read: false,
        time: Date.now(),
      });
    }
  };

  const handleSaveInterviewSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (scheduleModalApp) {
      const interviewDetails = {
        date: interviewForm.date || new Date().toISOString(),
        time: interviewForm.time,
        type: interviewForm.type,
        venueOrLink: interviewForm.venueOrLink,
        contactPerson: interviewForm.contactPerson,
        notes: interviewForm.notes
      };

      const updated = applicants.map((a) =>
        a.id === scheduleModalApp.id
          ? {
              ...a,
              status: "INTERVIEW_SCHEDULED" as any,
              interviewDetails
            }
          : a
      );
      setApplicants(updated);
      if (typeof localStorage !== "undefined" && selectedJobId) {
        localStorage.setItem(`omeetso_employer_applicants_${selectedJobId}`, JSON.stringify(updated));

        try {
          const u = JSON.parse(localStorage.getItem("omeetso_user") || "null");
          const uid = u?._id || u?.id;
          const keys = ["omeetso_candidate_applied_jobs", uid ? `omeetso_candidate_applications_${uid}` : ""].filter(Boolean);
          for (const k of keys) {
            const raw = localStorage.getItem(k);
            if (raw) {
              const arr = JSON.parse(raw);
              if (Array.isArray(arr)) {
                const updatedCand = arr.map((item: any) => {
                  if (item.id === scheduleModalApp.id || item._id === scheduleModalApp.id || item.jobId === selectedJobId) {
                    return { ...item, status: "INTERVIEW_SCHEDULED", interviewDetails };
                  }
                  return item;
                });
                localStorage.setItem(k, JSON.stringify(updatedCand));
              }
            }
          }
        } catch {}
      }

      const token = typeof window !== "undefined" ? localStorage.getItem("omeetso_user_token") : null;
      try {
        if (token) {
          await fetch(`${API_BASE}/jobs/applicants/${scheduleModalApp.id}/status`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              status: "INTERVIEW_SCHEDULED",
              interviewDetails
            })
          });
        }
      } catch { }

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("omeetso_job_applications_changed"));
        window.dispatchEvent(new Event("storage"));
      }

      if (!token) {
        pushNotification({
          id: `job-interview-${scheduleModalApp.id}-${Date.now()}`,
          category: "job_application",
          title: `Interview Scheduled: ${scheduleModalApp.job?.title || "Job Application"}`,
          body: `Interview scheduled on ${interviewForm.date || "scheduled date"} at ${interviewForm.time || "scheduled time"}.`,
          destination: "/my/jobs",
          destinationLabel: "View Job Application",
          read: false,
          time: Date.now(),
        });
      }

      setScheduleModalApp(null);
      toast.success("Interview scheduled and notification sent to candidate!");
    }
  };

  const handleSavePrivateNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (employerNotesApp) {
      const updated = applicants.map((a) =>
        a.id === employerNotesApp.id ? { ...a, employerNotes: privateNoteInput } : a
      );
      setApplicants(updated);
      if (typeof localStorage !== "undefined" && selectedJobId) {
        localStorage.setItem(`omeetso_employer_applicants_${selectedJobId}`, JSON.stringify(updated));
      }

      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("omeetso_user_token") : null;
        if (token) {
          await fetch(`${API_BASE}/jobs/applicants/${employerNotesApp.id}/status`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ employerNotes: privateNoteInput })
          });
        }
      } catch { }

      setEmployerNotesApp(null);
      toast.success("Private note saved.");
    }
  };

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-20 md:pb-16 font-sans">
        
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card/80 backdrop-blur-md px-4 py-3 safe-t">
          <div className="flex items-center gap-2">
            <button onClick={() => history.length > 1 ? history.back() : nav({ to: "/account" })} className="grid h-9 w-9 place-items-center rounded-full hover:bg-secondary">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-sm font-extrabold text-foreground">Employer Job & Candidate Dashboard</h1>
          </div>
          <Link to="/jobs/new" className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground font-extrabold text-xs rounded-xl">
            <Plus className="h-4 w-4" /> Post Job
          </Link>
        </header>

        <div className="max-w-[1200px] mx-auto p-4 space-y-6">
          {jobs.length === 0 ? (
            <div className="max-w-md mx-auto my-12 p-8 rounded-3xl border border-border bg-card text-center space-y-4 shadow-sm">
              <div className="grid h-16 w-16 place-items-center rounded-3xl bg-indigo-brand/10 text-indigo-brand mx-auto">
                <Briefcase className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-base font-black text-foreground">No Jobs Posted Yet</h2>
                <p className="text-xs text-muted-foreground font-semibold mt-1">
                  Post your job openings on Omeetso to receive and manage applications from local candidates.
                </p>
              </div>
              <Link
                to="/jobs/new"
                className="inline-flex items-center justify-center gap-1.5 w-full h-11 rounded-2xl bg-indigo-brand text-white font-bold text-xs hover:bg-indigo-brand/90 transition-all shadow-md"
              >
                <Plus className="h-4 w-4" /> Post a Job Opening
              </Link>
            </div>
          ) : (
            <>
              {/* MY JOBS LIST CAROUSEL / SELECTOR */}
              <section className="space-y-3">
                <h2 className="text-sm font-extrabold uppercase tracking-wide text-muted-foreground">My Posted Job Listings ({jobs.length})</h2>
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                  {jobs.map((job) => {
                    const isSelected = job.id === selectedJobId;
                    return (
                      <div
                        key={job.id}
                        onClick={() => handleSelectJob(job.id)}
                        className={`shrink-0 w-[280px] p-4 rounded-3xl border cursor-pointer transition-all ${
                          isSelected ? "border-indigo-brand bg-indigo-brand/10 shadow-md" : "border-border bg-card hover:bg-secondary/40"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-indigo-brand">{job.jobType}</span>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            (job.status || "").toUpperCase() === "SUBMITTED" || (job.status || "").toUpperCase() === "PENDING"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                              : (job.status || "").toUpperCase() === "FILLED"
                              ? "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300"
                              : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                          }`}>
                            {job.status}
                          </span>
                        </div>
                        <h3 className="text-sm font-extrabold text-foreground truncate mt-1">{job.title}</h3>
                        <p className="text-xs text-muted-foreground font-semibold truncate">{job.location?.area || job.location?.city}</p>
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-border text-[11px] font-bold text-muted-foreground">
                          <span>👥 {job.id === selectedJobId ? applicants.length : (job.applicationsCount || 0)} Applicants</span>
                          <span>{new Date(job.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* APPLICANT REVIEW & PIPELINE TABLE */}
              {activeJob && (
                <section className="rounded-3xl border border-border bg-card p-5 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-black text-foreground">{activeJob.title}</h2>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/15 text-indigo-600">
                          {activeJob.openingsCount} Opening{activeJob.openingsCount > 1 ? "s" : ""}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground font-semibold mt-0.5">
                        {activeJob.location?.area}, {activeJob.location?.city} • {activeJob.jobType}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to="/job/$id"
                        params={{ id: activeJob.id }}
                        className="px-3.5 py-1.5 rounded-xl border border-border bg-card hover:bg-secondary text-foreground font-bold text-xs flex items-center gap-1.5 shadow-xs"
                      >
                        <Eye className="h-3.5 w-3.5 text-indigo-brand" /> View Public Post
                      </Link>
                    </div>
                  </div>

                  {/* Pipeline Status Filter Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                      {["ALL", "APPLIED", "SHORTLISTED", "INTERVIEW_SCHEDULED", "HIRED", "REJECTED"].map((st) => (
                        <button
                          key={st}
                          onClick={() => setApplicantStatusFilter(st)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                            applicantStatusFilter === st
                              ? "bg-indigo-brand text-white shadow-sm"
                              : "bg-secondary text-foreground hover:bg-secondary/80"
                          }`}
                        >
                          {st.replace("_", " ")}
                        </button>
                      ))}
                    </div>

                    {/* Search Bar */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-background w-full sm:w-64 text-xs">
                      <Search className="h-3.5 w-3.5 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search candidate name, skills..."
                        value={applicantSearch}
                        onChange={(e) => setApplicantSearch(e.target.value)}
                        className="w-full bg-transparent font-bold outline-none placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>

                  {/* Candidate List Grid */}
                  <div className="space-y-4 pt-2">
                    {filteredApplicants.length === 0 ? (
                      <div className="p-12 text-center text-xs text-muted-foreground font-semibold">
                        No candidates found matching the selected status or search query.
                      </div>
                    ) : (
                      filteredApplicants.map((app) => {
                        const snapshot = app.applicantProfileSnapshot || ({} as any);
                        const appResumeUrl = getApplicantResumeUrl(app);
                        const appResumeFileName = getApplicantResumeFileName(app);

                        return (
                          <div key={app.id} className="p-5 rounded-3xl border border-border bg-card shadow-xs space-y-3.5 font-sans hover:border-indigo-500/40 transition-all">
                            
                            {/* Candidate Header */}
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                              <div className="flex items-start gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg shrink-0 shadow-sm">
                                  {snapshot.name ? snapshot.name.charAt(0).toUpperCase() : "C"}
                                </div>
                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="text-base font-black text-foreground">
                                      {snapshot.name || "Candidate"}
                                    </h3>
                                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                                      {snapshot.title || "Job Seeker"}
                                    </span>
                                  </div>
                                  <p className="text-xs font-semibold text-muted-foreground flex items-center gap-2 mt-0.5">
                                    <span>📍 {snapshot.city || "Location not specified"}{snapshot.area ? `, ${snapshot.area}` : ""}</span>
                                    <span>•</span>
                                    <span>⏳ {snapshot.experience || snapshot.experienceYears || "Fresher"}</span>
                                  </p>
                                </div>
                              </div>

                              {/* Status Tag */}
                              <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-black border self-start ${
                                app.status === "SHORTLISTED"
                                  ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/30"
                                  : app.status === "INTERVIEW_SCHEDULED"
                                  ? "bg-purple-500/15 text-purple-700 border-purple-500/30"
                                  : app.status === "HIRED"
                                  ? "bg-emerald-600 text-white border-emerald-600"
                                  : app.status === "REJECTED"
                                  ? "bg-rose-500/15 text-rose-700 border-rose-500/30"
                                  : "bg-secondary text-foreground border-border"
                              }`}>
                                {app.status}
                              </span>
                            </div>

                            {/* Candidate 8-Field Overview Grid for Interviewer */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-semibold p-3.5 rounded-2xl bg-secondary/30 border border-border/80">
                              <div>
                                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Mobile Phone</span>
                                <a href={`tel:${snapshot.phone}`} className="font-extrabold text-foreground hover:text-indigo-600 truncate block mt-0.5">
                                  {snapshot.phone || "Not provided"}
                                </a>
                              </div>
                              <div>
                                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Email Address</span>
                                <a href={`mailto:${snapshot.email}`} className="font-extrabold text-foreground hover:text-indigo-600 truncate block mt-0.5">
                                  {snapshot.email || "Not provided"}
                                </a>
                              </div>
                              <div>
                                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Current / Prev Company</span>
                                <span className="font-extrabold text-foreground truncate block mt-0.5">
                                  {snapshot.currentCompany || "Fresher / None"}
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Current / Last Role</span>
                                <span className="font-extrabold text-foreground truncate block mt-0.5">
                                  {snapshot.currentRole || snapshot.title || "Fresher"}
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Current City</span>
                                <span className="font-extrabold text-foreground truncate block mt-0.5">
                                  {snapshot.city || "Nalgonda"}
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Total Experience</span>
                                <span className="font-extrabold text-foreground truncate block mt-0.5">
                                  {snapshot.experience || snapshot.experienceYears || "Fresher / No Exp"}
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Expected Monthly Salary</span>
                                <span className="font-black text-emerald-600 truncate block mt-0.5">
                                  ₹{snapshot.expectedSalary ? Number(snapshot.expectedSalary).toLocaleString("en-IN") : "25,000"} / Mo
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Notice Period</span>
                                <span className="font-extrabold text-foreground truncate block mt-0.5">
                                  {snapshot.noticePeriod || "Immediate"}
                                </span>
                              </div>
                            </div>

                            {/* Skills Chips */}
                            {snapshot.skills && snapshot.skills.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-[11px] text-muted-foreground font-bold">Skills:</span>
                                {snapshot.skills.slice(0, 6).map((skill: string, idx: number) => (
                                  <span key={idx} className="px-2 py-0.5 rounded-lg bg-card text-foreground border border-border text-[10px] font-extrabold shadow-xs">
                                    {skill}
                                  </span>
                                ))}
                                {snapshot.skills.length > 6 && (
                                  <span className="text-[10px] font-bold text-muted-foreground">+{snapshot.skills.length - 6} more</span>
                                )}
                              </div>
                            )}

                            {/* PROMINENT UPLOADED RESUME VIEWER BAR FOR INTERVIEWER */}
                            {appResumeUrl ? (
                              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                                    <FileText className="h-4 w-4 text-amber-300" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs font-black text-foreground truncate">
                                      {appResumeFileName || "Candidate Resume Document (PDF)"}
                                    </p>
                                    <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">
                                      ✓ Uploaded CV available for review
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <button
                                    onClick={() => setResumeViewerModal({
                                      url: appResumeUrl,
                                      title: `${snapshot.name || "Candidate"}'s Resume`,
                                      fileName: appResumeFileName
                                    })}
                                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>Preview Resume</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => downloadDocument(appResumeUrl, appResumeFileName)}
                                    className="px-3 py-1.5 rounded-xl bg-card border border-border hover:bg-secondary text-foreground font-bold text-xs flex items-center gap-1 transition-colors shadow-xs active:scale-95"
                                  >
                                    <Download className="w-3.5 h-3.5 text-indigo-600" />
                                    <span>Download</span>
                                  </button>
                                  <a
                                    href={appResumeUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-2.5 py-1.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-bold text-xs flex items-center gap-1 transition-colors"
                                    title="Open in Tab"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                </div>
                              </div>
                            ) : (
                              <div className="p-3 rounded-2xl bg-secondary/30 border border-border text-[11px] text-muted-foreground font-semibold flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                  <span>Candidate submitted 10-Section Manual ATS Profile.</span>
                                </div>
                                <button
                                  onClick={() => setSelectedApplicantDetail(app)}
                                  className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-extrabold text-[11px] hover:underline"
                                >
                                  View ATS Profile
                                </button>
                              </div>
                            )}

                            {/* Employer Private Notes */}
                            {app.employerNotes && (
                              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-900 flex items-start gap-2">
                                <span className="text-amber-700 shrink-0">🔒 Note:</span>
                                <span className="font-medium text-amber-950">{app.employerNotes}</span>
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60">
                              <div className="flex flex-wrap items-center gap-2">
                                <button
                                  onClick={() => setSelectedApplicantDetail(app)}
                                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>View Full Profile & CV</span>
                                </button>

                                <button
                                  onClick={() => handleUpdateStatus(app.id, "SHORTLISTED")}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-700 font-extrabold text-xs hover:bg-emerald-500/20"
                                >
                                  Shortlist
                                </button>
                                <button
                                  onClick={() => setScheduleModalApp(app)}
                                  className="px-3 py-1.5 rounded-xl bg-purple-500/10 text-purple-700 font-extrabold text-xs hover:bg-purple-500/20"
                                >
                                  Schedule Interview
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(app.id, "HIRED")}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700"
                                >
                                  Hire
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(app.id, "REJECTED")}
                                  className="px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-700 font-bold text-xs hover:bg-rose-500/20"
                                >
                                  Reject
                                </button>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    setEmployerNotesApp(app);
                                    setPrivateNoteInput(app.employerNotes || "");
                                  }}
                                  className="text-xs font-bold text-muted-foreground hover:underline"
                                >
                                  + Note
                                </button>

                                <button
                                  onClick={async () => {
                                    try {
                                      const candidateId = app.applicantId || (app as any).userId;
                                      const targetJobId = activeJob?.id || app.jobId;
                                      const res = await startConversationApi("JOB", targetJobId, candidateId);
                                      if (res.success && res.data?.id) {
                                        nav({ to: "/chat/$id", params: { id: res.data.id } });
                                      } else {
                                        toast.error(res.error?.message || "Could not start chat");
                                      }
                                    } catch {
                                      toast.error("Failed to start chat.");
                                    }
                                  }}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                                >
                                  <MessageCircle className="h-3.5 w-3.5" /> Chat
                                </button>
                              </div>
                            </div>

                          </div>
                        );
                      })
                    )}
                  </div>
                </section>
              )}
            </>
          )}

        </div>

        {/* FULL CANDIDATE PROFILE DOSSIER MODAL */}
        {selectedApplicantDetail && (() => {
          const snapshot = selectedApplicantDetail.applicantProfileSnapshot || ({} as any);
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm safe-t font-sans">
              <div className="w-full max-w-2xl rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
                
                {/* Dossier Header */}
                <div className="flex items-start justify-between border-b border-border pb-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xl font-black shadow-md">
                      {snapshot.name ? snapshot.name.charAt(0).toUpperCase() : "C"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-black text-foreground">{snapshot.name}</h2>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/15 text-indigo-600 border border-indigo-500/30">
                          {selectedApplicantDetail.status}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        {snapshot.title || snapshot.currentRole || "Candidate"} • {snapshot.experience || "Fresher"}
                      </p>
                      <p className="text-[11px] text-muted-foreground font-semibold flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" /> {snapshot.area ? `${snapshot.area}, ` : ""}{snapshot.city || "Hyderabad"}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedApplicantDetail(null)}
                    className="grid h-8 w-8 place-items-center rounded-full hover:bg-secondary transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Direct Contact Bar */}
                <div className="p-3.5 rounded-2xl bg-secondary/40 border border-border flex flex-wrap items-center justify-between gap-3 text-xs font-semibold">
                  <div className="flex items-center gap-4">
                    <a href={`tel:${snapshot.phone}`} className="flex items-center gap-1.5 text-foreground font-bold hover:text-indigo-600 transition-colors">
                      <Phone className="w-4 h-4 text-emerald-600" />
                      <span>{snapshot.phone}</span>
                    </a>
                    <a href={`mailto:${snapshot.email}`} className="flex items-center gap-1.5 text-foreground font-bold hover:text-indigo-600 transition-colors">
                      <Mail className="w-4 h-4 text-indigo-600" />
                      <span>{snapshot.email}</span>
                    </a>
                  </div>

                  <div className="flex items-center gap-2">
                    {snapshot.portfolioUrl && (
                      <a href={snapshot.portfolioUrl} target="_blank" rel="noreferrer" className="px-2.5 py-1 rounded-lg bg-card border border-border text-[11px] font-bold text-foreground hover:bg-secondary flex items-center gap-1" title="Portfolio">
                        <Globe className="w-3 h-3" /> Portfolio
                      </a>
                    )}
                    {snapshot.linkedinUrl && (
                      <a href={snapshot.linkedinUrl} target="_blank" rel="noreferrer" className="px-2.5 py-1 rounded-lg bg-card border border-border text-[11px] font-bold text-indigo-600 hover:bg-secondary flex items-center gap-1" title="LinkedIn">
                        <Linkedin className="w-3 h-3" /> LinkedIn
                      </a>
                    )}
                    {snapshot.githubUrl && (
                      <a href={snapshot.githubUrl} target="_blank" rel="noreferrer" className="px-2.5 py-1 rounded-lg bg-card border border-border text-[11px] font-bold text-foreground hover:bg-secondary flex items-center gap-1" title="GitHub">
                        <Github className="w-3 h-3" /> GitHub
                      </a>
                    )}
                  </div>
                </div>

                {/* UPLOADED RESUME SHOWCASE BOX FOR INTERVIEWER */}
                {(() => {
                  const modalResumeUrl = getApplicantResumeUrl(selectedApplicantDetail);
                  const modalResumeFileName = getApplicantResumeFileName(selectedApplicantDetail);

                  return modalResumeUrl ? (
                    <div className="p-4 rounded-3xl bg-gradient-to-br from-indigo-50/90 via-indigo-50/50 to-purple-50/60 dark:from-indigo-950/40 dark:via-indigo-950/20 dark:to-purple-950/30 border border-indigo-200/80 dark:border-indigo-800/50 shadow-sm space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
                            <FileText className="w-5 h-5 text-amber-300" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-black text-foreground">Candidate's Uploaded Resume</h3>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-700">
                                Verified Upload
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground font-semibold mt-0.5 truncate">
                              {modalResumeFileName || "Candidate_Resume_CV.pdf"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => setResumeViewerModal({
                              url: modalResumeUrl,
                              title: `${snapshot.name || "Candidate"}'s Resume`,
                              fileName: modalResumeFileName
                            })}
                            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Open Full Preview</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => downloadDocument(modalResumeUrl, modalResumeFileName)}
                            className="px-3 py-2 rounded-xl bg-card border border-border hover:bg-secondary text-foreground font-bold text-xs flex items-center gap-1 transition-colors active:scale-95"
                          >
                            <Download className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Download</span>
                          </button>
                          <a
                            href={modalResumeUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-2 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-bold text-xs flex items-center gap-1 transition-colors"
                            title="Open in Tab"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-2xl bg-secondary/30 border border-border text-xs text-muted-foreground font-semibold flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>Candidate generated their profile via Omeetso 10-Section ATS Resume Builder.</span>
                    </div>
                  );
                })()}

                {/* Summary / Bio */}
                {snapshot.summary && (
                  <div className="space-y-1">
                    <h3 className="text-xs font-black uppercase tracking-wide text-muted-foreground">Professional Summary</h3>
                    <p className="text-xs leading-relaxed text-foreground font-medium whitespace-pre-line p-3 rounded-2xl bg-secondary/20 border border-border/60">
                      {snapshot.summary}
                    </p>
                  </div>
                )}

                {/* Comprehensive 10-Field Candidate Details Grid for Interviewer */}
                <div className="space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-wide text-muted-foreground">
                    Candidate Profile Essentials
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3.5 rounded-2xl bg-secondary/30 border border-border/60">
                      <p className="text-[10px] text-muted-foreground font-bold uppercase">Full Name</p>
                      <p className="font-black text-foreground mt-0.5">{snapshot.name || "Candidate"}</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-secondary/30 border border-border/60">
                      <p className="text-[10px] text-muted-foreground font-bold uppercase">Professional Title</p>
                      <p className="font-black text-indigo-600 dark:text-indigo-400 mt-0.5">{snapshot.title || "Job Seeker"}</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-secondary/30 border border-border/60">
                      <p className="text-[10px] text-muted-foreground font-bold uppercase">Mobile Phone</p>
                      <a href={`tel:${snapshot.phone}`} className="font-black text-foreground hover:underline mt-0.5 block">
                        {snapshot.phone || "Not provided"}
                      </a>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-secondary/30 border border-border/60">
                      <p className="text-[10px] text-muted-foreground font-bold uppercase">Email Address</p>
                      <a href={`mailto:${snapshot.email}`} className="font-black text-foreground hover:underline mt-0.5 truncate block">
                        {snapshot.email || "Not provided"}
                      </a>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-secondary/30 border border-border/60">
                      <p className="text-[10px] text-muted-foreground font-bold uppercase">Current City</p>
                      <p className="font-black text-foreground mt-0.5">{snapshot.city || "Nalgonda"}{snapshot.area ? `, ${snapshot.area}` : ""}</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-secondary/30 border border-border/60">
                      <p className="text-[10px] text-muted-foreground font-bold uppercase">Total Experience</p>
                      <p className="font-black text-foreground mt-0.5">{snapshot.experience || snapshot.experienceYears || "Fresher / No Exp"}</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-secondary/30 border border-border/60">
                      <p className="text-[10px] text-muted-foreground font-bold uppercase">Current / Prev Company</p>
                      <p className="font-black text-foreground mt-0.5 truncate">{snapshot.currentCompany || "Fresher / None"}</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-secondary/30 border border-border/60">
                      <p className="text-[10px] text-muted-foreground font-bold uppercase">Current / Last Role</p>
                      <p className="font-black text-foreground mt-0.5 truncate">{snapshot.currentRole || snapshot.title || "Fresher"}</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-secondary/30 border border-border/60">
                      <p className="text-[10px] text-muted-foreground font-bold uppercase">Expected Monthly Pay</p>
                      <p className="font-black text-emerald-600 mt-0.5">
                        ₹{snapshot.expectedSalary ? Number(snapshot.expectedSalary).toLocaleString("en-IN") : "25,000"} / month
                      </p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-secondary/30 border border-border/60">
                      <p className="text-[10px] text-muted-foreground font-bold uppercase">Notice Period</p>
                      <p className="font-black text-foreground mt-0.5">{snapshot.noticePeriod || "Immediate"}</p>
                    </div>
                  </div>
                </div>

                {/* Key Skills */}
                {snapshot.skills && snapshot.skills.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-black uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Key Skills & Proficiencies
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {snapshot.skills.map((skill: string, idx: number) => (
                        <span key={idx} className="px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-extrabold text-xs border border-indigo-200 dark:border-indigo-800">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Work Experience Timeline */}
                {snapshot.workExperiences && snapshot.workExperiences.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-black uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-indigo-600" /> Work Experience History
                    </h3>
                    <div className="space-y-2">
                      {snapshot.workExperiences.map((exp: any, idx: number) => (
                        <div key={idx} className="p-3.5 rounded-2xl border border-border bg-card space-y-1 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-black text-foreground">{exp.jobTitle}</span>
                            <span className="text-[10px] font-bold text-muted-foreground">{exp.startDate} - {exp.isCurrentlyWorking ? "Present" : exp.endDate || ""}</span>
                          </div>
                          <p className="text-indigo-600 dark:text-indigo-400 font-bold">{exp.companyName} {exp.location ? `• ${exp.location}` : ""}</p>
                          {exp.responsibilities && (
                            <p className="text-muted-foreground font-medium pt-1 text-[11px] leading-relaxed whitespace-pre-line">
                              {exp.responsibilities}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education Credentials */}
                {snapshot.educations && snapshot.educations.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-black uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-indigo-600" /> Education Qualifications
                    </h3>
                    <div className="space-y-2">
                      {snapshot.educations.map((edu: any, idx: number) => (
                        <div key={idx} className="p-3.5 rounded-2xl border border-border bg-card space-y-1 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-black text-foreground">{edu.qualification}</span>
                            <span className="text-[10px] font-bold text-muted-foreground">{edu.completionYear || edu.startYear}</span>
                          </div>
                          <p className="text-muted-foreground font-semibold">{edu.college || edu.university} {edu.specialization ? `(${edu.specialization})` : ""}</p>
                          {edu.percentageOrCgpa && (
                            <p className="text-emerald-600 font-bold text-[11px]">Score: {edu.percentageOrCgpa}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Answers to Screening Questions */}
                {selectedApplicantDetail.screeningAnswers && selectedApplicantDetail.screeningAnswers.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-black uppercase tracking-wide text-muted-foreground">Answers to Screening Questions</h3>
                    <div className="p-3.5 rounded-2xl border border-border bg-card space-y-2 text-xs">
                      {selectedApplicantDetail.screeningAnswers.map((item, idx) => (
                        <div key={idx} className="space-y-0.5">
                          <p className="font-bold text-foreground">Q: {item.question}</p>
                          <p className="text-muted-foreground font-medium pl-3 border-l-2 border-indigo-600">A: {item.answer || "No response"}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status Controls Footer */}
                <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        handleUpdateStatus(selectedApplicantDetail.id, "SHORTLISTED");
                        setSelectedApplicantDetail(null);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-emerald-500/10 text-emerald-700 font-extrabold text-xs hover:bg-emerald-500/20"
                    >
                      Shortlist Candidate
                    </button>
                    <button
                      onClick={() => {
                        const app = selectedApplicantDetail;
                        setSelectedApplicantDetail(null);
                        setScheduleModalApp(app);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-purple-600 text-white font-extrabold text-xs hover:bg-purple-700"
                    >
                      Schedule Interview
                    </button>
                    <button
                      onClick={() => {
                        handleUpdateStatus(selectedApplicantDetail.id, "HIRED");
                        setSelectedApplicantDetail(null);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-extrabold text-xs hover:bg-emerald-700"
                    >
                      Hire
                    </button>
                    <button
                      onClick={() => {
                        handleUpdateStatus(selectedApplicantDetail.id, "REJECTED");
                        setSelectedApplicantDetail(null);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-rose-500/10 text-rose-700 font-extrabold text-xs hover:bg-rose-500/20"
                    >
                      Reject
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          const candidateId = selectedApplicantDetail.applicantId || (selectedApplicantDetail as any).userId;
                          const targetJobId = activeJob?.id || selectedApplicantDetail.jobId;
                          const res = await startConversationApi("JOB", targetJobId, candidateId);
                          if (res.success && res.data?.id) {
                            setSelectedApplicantDetail(null);
                            nav({ to: "/chat/$id", params: { id: res.data.id } });
                          } else {
                            toast.error(res.error?.message || "Could not start chat");
                          }
                        } catch {
                          toast.error("Failed to start chat.");
                        }
                      }}
                      className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" /> Chat Candidate
                    </button>
                  </div>

                  <button
                    onClick={() => setSelectedApplicantDetail(null)}
                    className="px-4 py-2 rounded-xl border border-border bg-card text-foreground font-bold text-xs hover:bg-secondary"
                  >
                    Close
                  </button>
                </div>

              </div>
            </div>
          );
        })()}

        {/* DEDICATED INTERACTIVE RESUME PREVIEW MODAL */}
        {resumeViewerModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-6 backdrop-blur-md safe-t font-sans">
            <div className="w-full max-w-4xl h-[90vh] flex flex-col rounded-3xl border border-border bg-card shadow-2xl overflow-hidden">
              
              {/* Modal Top Bar */}
              <div className="flex items-center justify-between border-b border-border bg-card px-5 py-3.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-amber-300" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-black text-foreground truncate">{resumeViewerModal.title}</h3>
                    <p className="text-[11px] text-muted-foreground font-semibold truncate">{resumeViewerModal.fileName || "Resume Document"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => downloadDocument(resumeViewerModal.url, resumeViewerModal.fileName)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                  <a
                    href={resumeViewerModal.url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-bold text-xs flex items-center gap-1 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open in Tab</span>
                  </a>
                  <button
                    onClick={() => setResumeViewerModal(null)}
                    className="grid h-8 w-8 place-items-center rounded-full hover:bg-secondary text-foreground transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Viewer Body (iFrame, Word Document Card, or Image) */}
              <div className="flex-1 bg-muted/40 p-2 sm:p-4 overflow-hidden relative">
                {(() => {
                  const isImage = resumeViewerModal.url.match(/\.(jpeg|jpg|gif|png|webp)/i) || resumeViewerModal.url.startsWith("data:image/");
                  const isDocx = (resumeViewerModal.fileName || "").match(/\.(docx|doc|rtf|txt)$/i) || resumeViewerModal.url.includes("wordprocessingml") || resumeViewerModal.url.includes("msword");

                  if (isImage) {
                    return (
                      <div className="w-full h-full flex items-center justify-center overflow-auto">
                        <img
                          src={resumeViewerModal.url}
                          alt="Candidate Resume"
                          className="max-h-full max-w-full object-contain rounded-xl shadow-lg border border-border"
                        />
                      </div>
                    );
                  }

                  if (isDocx) {
                    return (
                      <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 space-y-4 bg-card rounded-2xl border border-border">
                        <div className="w-16 h-16 rounded-3xl bg-blue-600 text-white flex items-center justify-center shadow-lg">
                          <FileText className="w-8 h-8" />
                        </div>
                        <div className="max-w-md space-y-1">
                          <h4 className="text-base font-black text-foreground">{resumeViewerModal.fileName || "Candidate_Resume.docx"}</h4>
                          <p className="text-xs text-muted-foreground font-semibold">
                            This resume was uploaded as a Microsoft Word (.docx) document. Click below to download and view in Word or Docs.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => downloadDocument(resumeViewerModal.url, resumeViewerModal.fileName)}
                          className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-lg transition-all flex items-center gap-2 active:scale-95"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download & Open Word Document</span>
                        </button>
                      </div>
                    );
                  }

                  // Default: Native PDF Embed / iFrame
                  return (
                    <iframe
                      src={resumeViewerModal.url}
                      title="Resume Document Viewer"
                      className="w-full h-full rounded-2xl border border-border bg-white shadow-inner"
                    />
                  );
                })()}
              </div>

            </div>
          </div>
        )}

        {/* INTERVIEW SCHEDULER MODAL */}
        {scheduleModalApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <form onSubmit={handleSaveInterviewSchedule} className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4 font-sans text-xs font-semibold">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <div className="min-w-0">
                  <h3 className="text-sm font-black text-foreground">Schedule Interview for {scheduleModalApp.applicantProfileSnapshot?.name || "Candidate"}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-muted-foreground font-semibold">
                    <span>📍 {scheduleModalApp.applicantProfileSnapshot?.city || "Nalgonda"}</span>
                    <span>•</span>
                    <span>⏳ {scheduleModalApp.applicantProfileSnapshot?.experience || "Fresher"}</span>
                    <span>•</span>
                    <span className="text-emerald-600 font-bold">₹{scheduleModalApp.applicantProfileSnapshot?.expectedSalary ? Number(scheduleModalApp.applicantProfileSnapshot.expectedSalary).toLocaleString("en-IN") : "25,000"}/Mo</span>
                    <span>•</span>
                    <span>⚡ {scheduleModalApp.applicantProfileSnapshot?.noticePeriod || "Immediate"}</span>
                  </div>
                  {(() => {
                    const schedResumeUrl = getApplicantResumeUrl(scheduleModalApp);
                    const schedResumeFileName = getApplicantResumeFileName(scheduleModalApp);
                    return schedResumeUrl ? (
                      <button
                        type="button"
                        onClick={() => setResumeViewerModal({
                          url: schedResumeUrl,
                          title: `${scheduleModalApp.applicantProfileSnapshot.name}'s Resume`,
                          fileName: schedResumeFileName
                        })}
                        className="text-[11px] font-bold text-indigo-600 hover:underline flex items-center gap-1 mt-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Attached Resume Document ({schedResumeFileName || "PDF"})</span>
                      </button>
                    ) : null;
                  })()}
                </div>
                <button type="button" onClick={() => setScheduleModalApp(null)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-secondary shrink-0">
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-muted-foreground text-xs font-bold">Interview Date *</label>
                    <select
                      aria-label="Select Year"
                      value={interviewForm.date ? interviewForm.date.split("-")[0] : "2026"}
                      onChange={(e) => {
                        const yr = e.target.value;
                        const cur = interviewForm.date || new Date().toISOString().split("T")[0];
                        const parts = cur.split("-");
                        setInterviewForm({ ...interviewForm, date: `${yr}-${parts[1] || "01"}-${parts[2] || "01"}` });
                      }}
                      className="text-[10px] font-bold text-indigo-700 bg-indigo-500/10 border border-indigo-500/30 rounded px-1 outline-none"
                    >
                      {[2026, 2027, 2028, 2029, 2030].map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                  <input
                    type="date"
                    required
                    min="2026-01-01"
                    max="2032-12-31"
                    onKeyDown={(e) => {
                      const allowed = ["Backspace", "Tab", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Delete", "Enter", "Home", "End"];
                      if (allowed.includes(e.key) || e.ctrlKey || e.metaKey) return;
                      if (!/^[0-9\-]$/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    value={interviewForm.date}
                    onChange={(e) => setInterviewForm({ ...interviewForm, date: e.target.value })}
                    className="w-full h-10 rounded-xl border border-border bg-background px-3 font-bold text-foreground outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground mb-1 text-xs font-bold">Time Window</label>
                  <input
                    type="text"
                    required
                    value={interviewForm.time}
                    onChange={(e) => setInterviewForm({ ...interviewForm, time: e.target.value })}
                    className="w-full h-10 rounded-xl border border-border bg-background px-3 font-bold text-foreground outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground mb-1">Interview Type</label>
                <select
                  value={interviewForm.type}
                  onChange={(e) => setInterviewForm({ ...interviewForm, type: e.target.value as any })}
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 font-bold text-foreground outline-none"
                >
                  <option value="IN_PERSON">In-Person (Walk-In / Office)</option>
                  <option value="PHONE">Phone Call Interview</option>
                  <option value="VIDEO">Online Video Interview (Google Meet / Zoom)</option>
                </select>
              </div>

              <div>
                <label className="block text-muted-foreground mb-1">Venue Address / Video Link</label>
                <input
                  type="text"
                  required
                  value={interviewForm.venueOrLink}
                  onChange={(e) => setInterviewForm({ ...interviewForm, venueOrLink: e.target.value })}
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 font-bold text-foreground outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button type="button" onClick={() => setScheduleModalApp(null)} className="w-1/2 h-10 rounded-xl border border-border text-xs font-bold">
                  Cancel
                </button>
                <button type="submit" className="w-1/2 h-10 rounded-xl bg-purple-600 text-white font-bold text-xs">
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        )}

        {/* PRIVATE EMPLOYER NOTES MODAL */}
        {employerNotesApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <form onSubmit={handleSavePrivateNotes} className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4 font-sans text-xs font-semibold">
              <h3 className="text-sm font-black text-foreground">Add Private Note for {employerNotesApp.applicantProfileSnapshot.name}</h3>
              <p className="text-[11px] text-muted-foreground font-semibold">This note is private to you and will never be shared with the candidate.</p>
              <textarea
                rows={3}
                placeholder="e.g. Good React experience, check availability..."
                value={privateNoteInput}
                onChange={(e) => setPrivateNoteInput(e.target.value)}
                className="w-full rounded-2xl border border-border bg-background p-3 font-bold text-foreground outline-none"
              />
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setEmployerNotesApp(null)} className="w-1/2 h-10 rounded-xl border border-border text-xs font-bold">
                  Cancel
                </button>
                <button type="submit" className="w-1/2 h-10 rounded-xl bg-indigo-brand text-white font-bold text-xs">
                  Save Private Note
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </MobileFrame>
  );
}
