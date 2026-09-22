import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft, Briefcase, Calendar, Clock, MapPin, CheckCircle2,
  AlertCircle, Trash2, Heart, User, Ban, MessageCircle, ExternalLink,
  Video, Building2, X, FileText, DollarSign, Mail, Phone, Globe, ChevronRight
} from "lucide-react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import {
  listCandidateApplicationsLocal, withdrawJobApplicationLocal, getSavedJobIds,
  fetchPublicJobs, JobItem, JobApplicationItem, getCandidateApplicationsStorageKey, setLocal
} from "@/lib/jobs";
import { startConversationApi } from "@/api/chat.api";
import { JobCard } from "@/components/omeetso/jobs/JobCard";
import { API_BASE } from "@/config/api";
import { toast } from "sonner";

interface MyJobsSearch {
  id?: string;
  jobId?: string;
  tab?: "applied" | "saved" | "interviews";
}

export const Route = createFileRoute("/my/jobs")({
  validateSearch: (search: Record<string, unknown>): MyJobsSearch => ({
    id: typeof search.id === "string" ? search.id : undefined,
    jobId: typeof search.jobId === "string" ? search.jobId : undefined,
    tab: search.tab === "applied" || search.tab === "saved" || search.tab === "interviews" ? search.tab : undefined,
  }),
  head: () => ({ meta: [{ title: "My Jobs & Applications — Omeetso" }] }),
  component: MyJobsDashboardPage,
});

function getStatusBadge(status?: string) {
  const s = String(status || "APPLIED").toUpperCase();
  switch (s) {
    case "SHORTLISTED":
      return { label: "Shortlisted", className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30" };
    case "INTERVIEW_SCHEDULED":
      return { label: "Interview Scheduled", className: "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30" };
    case "HIRED":
    case "SELECTED":
      return { label: s === "HIRED" ? "Hired 🎉" : "Selected", className: "bg-emerald-600/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/40" };
    case "REJECTED":
      return { label: "Not Selected", className: "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30" };
    case "WITHDRAWN":
      return { label: "Withdrawn", className: "bg-muted text-muted-foreground border-border" };
    case "VIEWED":
      return { label: "Application Viewed", className: "bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/30" };
    case "APPLIED":
    default:
      return { label: "Applied", className: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-500/30" };
  }
}

function MyJobsDashboardPage() {
  const nav = useNavigate();
  const search = Route.useSearch();
  const [activeTab, setActiveTab] = useState<"applied" | "saved" | "interviews">(search.tab || "applied");
  const [applications, setApplications] = useState<JobApplicationItem[]>([]);
  const [savedJobs, setSavedJobs] = useState<JobItem[]>([]);
  const [withdrawAppId, setWithdrawAppId] = useState<string | null>(null);
  const [selectedAppModal, setSelectedAppModal] = useState<JobApplicationItem | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("omeetso_user_token") : null;
    let serverApps: JobApplicationItem[] = [];

    if (token) {
      try {
        const res = await fetch(`${API_BASE}/jobs/candidate/applications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            serverApps = json.data;
          }
        }
      } catch { }
    }

    const localApps = listCandidateApplicationsLocal();
    
    // Deduplicate by job ID / application ID to get only jobs applied by this candidate
    const appMap = new Map<string, JobApplicationItem>();
    
    // Server apps take primary precedence
    for (const app of serverApps) {
      const rawJobId = (typeof app.jobId === "object" && app.jobId !== null ? (app.jobId as any)._id || (app.jobId as any).id : app.jobId) || app.job?.id || (app.job as any)?._id || app.id;
      const jId = String(rawJobId);
      appMap.set(jId, {
        ...app,
        jobId: jId,
        id: app.id || (app as any)._id
      });
    }
    
    // Add local apps if not already present on server
    for (const app of localApps) {
      const rawJobId = (typeof app.jobId === "object" && app.jobId !== null ? (app.jobId as any)._id || (app.jobId as any).id : app.jobId) || app.job?.id || (app.job as any)?._id || app.id;
      const jId = String(rawJobId);
      if (!appMap.has(jId)) {
        appMap.set(jId, {
          ...app,
          jobId: jId
        });
      }
    }

    const merged = Array.from(appMap.values()).sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      return timeB - timeA;
    });

    // Update local cache so offline state mirrors latest server statuses
    if (serverApps.length > 0) {
      const storageKey = getCandidateApplicationsStorageKey();
      setLocal(storageKey, merged);
    }

    setApplications(merged);
    setLoading(false);

    // If search param has an id or jobId, open its application details modal automatically
    if (search.id || search.jobId) {
      const targetApp = merged.find(
        (a) => a.id === search.id || a.jobId === search.id || a.jobId === search.jobId || a.id === search.jobId
      );
      if (targetApp) {
        setSelectedAppModal(targetApp);
      }
    }

    const savedIds = getSavedJobIds();
    fetchPublicJobs().then((all) => {
      setSavedJobs(all.filter((j) => savedIds.includes(j.id)));
    });
  }, [search.id, search.jobId]);

  useEffect(() => {
    loadData();

    const handleSync = () => {
      loadData();
    };

    window.addEventListener("omeetso_job_applications_changed", handleSync);
    window.addEventListener("focus", handleSync);
    window.addEventListener("storage", handleSync);

    return () => {
      window.removeEventListener("omeetso_job_applications_changed", handleSync);
      window.removeEventListener("focus", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, [loadData]);

  const handleConfirmWithdraw = async () => {
    if (!withdrawAppId) return;

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("omeetso_user_token") : null;
      if (token) {
        await fetch(`${API_BASE}/jobs/candidate/applications/${withdrawAppId}/withdraw`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ reason: "Candidate withdrew application" })
        }).catch(() => {});
      }

      withdrawJobApplicationLocal(withdrawAppId, "Candidate withdrew application");
      toast.success("Application withdrawn successfully");
      if (selectedAppModal && (selectedAppModal.id === withdrawAppId || selectedAppModal.jobId === withdrawAppId)) {
        setSelectedAppModal((prev) => prev ? { ...prev, status: "WITHDRAWN" } : null);
      }
    } catch {
      toast.error("Failed to withdraw application");
    } finally {
      setWithdrawAppId(null);
      loadData();
    }
  };

  const handleChatEmployer = async (app: JobApplicationItem) => {
    try {
      const jId = (typeof app.jobId === "object" && app.jobId !== null ? (app.jobId as any)._id : app.jobId) || app.job?.id || (app.job as any)?._id || app.id;
      const res = await startConversationApi("JOB", String(jId), app.employerId);
      if (res.success && res.data?.id) {
        nav({ to: "/chat/$id", params: { id: res.data.id } });
      } else {
        toast.error(res.error?.message || "Could not start chat with employer");
      }
    } catch {
      toast.error("Failed to start chat.");
    }
  };

  const interviewApps = applications.filter((a) => a.status === "INTERVIEW_SCHEDULED" || Boolean(a.interviewDetails?.date));

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-20 md:pb-16 font-sans">
        
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card/80 backdrop-blur-md px-4 py-3 safe-t">
          <div className="flex items-center gap-2">
            <button onClick={() => history.length > 1 ? history.back() : window.location.assign("/account")} className="grid h-9 w-9 place-items-center rounded-full hover:bg-secondary">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-sm font-extrabold text-foreground">My Jobs & Applications</h1>
          </div>
          <Link to="/my/profile/jobs" className="text-xs font-extrabold text-indigo-brand hover:underline flex items-center gap-1">
            <User className="h-3.5 w-3.5" /> Job Profile
          </Link>
        </header>

        {/* Sub-Tabs */}
        <div className="border-b border-border bg-card px-4 pt-2">
          <div className="flex gap-4 max-w-[900px] mx-auto text-xs font-extrabold">
            <button
              onClick={() => setActiveTab("applied")}
              className={`pb-2.5 transition-all border-b-2 ${activeTab === "applied" ? "border-indigo-brand text-indigo-brand" : "border-transparent text-muted-foreground"}`}
            >
              Applied Jobs ({applications.length})
            </button>

            <button
              onClick={() => setActiveTab("saved")}
              className={`pb-2.5 transition-all border-b-2 ${activeTab === "saved" ? "border-indigo-brand text-indigo-brand" : "border-transparent text-muted-foreground"}`}
            >
              Saved Jobs ({savedJobs.length})
            </button>

            <button
              onClick={() => setActiveTab("interviews")}
              className={`pb-2.5 transition-all border-b-2 ${activeTab === "interviews" ? "border-indigo-brand text-indigo-brand" : "border-transparent text-muted-foreground"}`}
            >
              Interviews ({interviewApps.length})
            </button>
          </div>
        </div>

        <div className="max-w-[900px] mx-auto p-4 space-y-4">
          
          {/* APPLIED JOBS TAB */}
          {activeTab === "applied" && (
            <div className="space-y-3">
              {loading && applications.length === 0 ? (
                <div className="p-12 text-center text-xs text-muted-foreground">
                  Loading your applications...
                </div>
              ) : applications.length === 0 ? (
                <div className="p-12 text-center text-xs text-muted-foreground space-y-3">
                  <p className="font-bold">No applications submitted yet.</p>
                  <Link to="/jobs" className="inline-block px-4 py-2 bg-primary text-primary-foreground font-bold rounded-xl">
                    Explore Jobs
                  </Link>
                </div>
              ) : (
                applications.map((app) => {
                  const badge = getStatusBadge(app.status);
                  const isInterview = app.status === "INTERVIEW_SCHEDULED" && app.interviewDetails?.date;
                  const jId = (typeof app.jobId === "object" && app.jobId !== null ? (app.jobId as any)._id : app.jobId) || app.job?.id || (app.job as any)?._id || app.id;

                  return (
                    <div
                      key={app.id || app.jobId}
                      className="rounded-3xl border border-border bg-card p-5 shadow-sm space-y-3 hover:border-primary/40 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3 cursor-pointer" onClick={() => setSelectedAppModal(app)}>
                        <div>
                          <h3 className="text-base font-extrabold text-foreground hover:text-primary transition-colors flex items-center gap-1.5">
                            {app.job?.title || "Job Application"}
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </h3>
                          <p className="text-xs text-muted-foreground font-bold">
                            {app.job?.companyName || "Company"} {app.job?.location?.city ? `• ${app.job.location.city}` : ""}
                          </p>
                        </div>

                        {/* Status Badge */}
                        <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-black border ${badge.className}`}>
                          {badge.label}
                        </span>
                      </div>

                      {/* Inline Interview Notice if scheduled */}
                      {isInterview && (
                        <div className="rounded-2xl border border-purple-500/30 bg-purple-500/10 p-3.5 space-y-2">
                          <div className="flex items-center gap-2 text-xs font-extrabold text-purple-900 dark:text-purple-300">
                            <Calendar className="h-4 w-4 text-purple-600" />
                            <span>Interview on {new Date(app.interviewDetails!.date!).toLocaleDateString("en-IN", { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} at {app.interviewDetails!.time || "Scheduled Time"}</span>
                          </div>
                          <div className="text-xs text-purple-800 dark:text-purple-300 font-medium">
                            <span className="font-bold">Mode & Venue:</span> {app.interviewDetails!.type || "In-Person"} • {app.interviewDetails!.venueOrLink || "Office"}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold pt-2 border-t border-border/60">
                        <button
                          onClick={() => setSelectedAppModal(app)}
                          className="inline-flex items-center gap-1 text-xs font-extrabold text-indigo-brand hover:underline"
                        >
                          <span>View Application Details</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleChatEmployer(app)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-lg text-xs font-bold transition-colors shadow-xs"
                          >
                            <MessageCircle className="w-3.5 h-3.5" /> Chat Employer
                          </button>
                          {app.status !== "WITHDRAWN" && (
                            <button
                              onClick={() => setWithdrawAppId(app.id)}
                              className="text-rose-600 hover:underline font-bold px-1"
                            >
                              Withdraw
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* SAVED JOBS TAB */}
          {activeTab === "saved" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedJobs.length === 0 ? (
                <div className="col-span-full p-12 text-center text-xs text-muted-foreground">
                  No saved jobs yet. Tap ♡ on any job card to save it for later.
                </div>
              ) : (
                savedJobs.map((job) => <JobCard key={job.id} job={job} />)
              )}
            </div>
          )}

          {/* INTERVIEWS TAB */}
          {activeTab === "interviews" && (
            <div className="space-y-4">
              {interviewApps.length === 0 ? (
                <div className="p-12 text-center text-xs text-muted-foreground">
                  No interview schedules yet. Shortlisted candidate interviews will appear here.
                </div>
              ) : (
                interviewApps.map((app) => (
                  <div key={app.id || app.jobId} className="rounded-3xl border border-purple-500/30 bg-purple-500/10 p-5 space-y-3 font-sans">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-black text-purple-950 dark:text-purple-200 flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-purple-700 dark:text-purple-400" /> Interview Scheduled
                      </h3>
                      <span className="text-xs font-bold text-purple-800 dark:text-purple-300">{app.job?.companyName}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold text-purple-900 dark:text-purple-200">
                      <div><span className="font-bold">Role:</span> {app.job?.title}</div>
                      <div>
                        <span className="font-bold">Date & Time:</span> {app.interviewDetails?.date ? new Date(app.interviewDetails.date).toLocaleDateString("en-IN", { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : "This Week"} {app.interviewDetails?.time ? `at ${app.interviewDetails.time}` : ""}
                      </div>
                      <div><span className="font-bold">Interview Mode:</span> {app.interviewDetails?.type || "In-Person"}</div>
                      <div><span className="font-bold">Venue / Link:</span> {app.interviewDetails?.venueOrLink || "Office Venue"}</div>
                      {app.interviewDetails?.contactPerson && (
                        <div className="sm:col-span-2"><span className="font-bold">Contact Person:</span> {app.interviewDetails.contactPerson}</div>
                      )}
                      {app.interviewDetails?.notes && (
                        <div className="sm:col-span-2 text-muted-foreground bg-card/60 p-2.5 rounded-xl border border-purple-200 dark:border-purple-900">
                          <span className="font-bold text-foreground">Instructions:</span> {app.interviewDetails.notes}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <button
                        onClick={() => setSelectedAppModal(app)}
                        className="text-xs font-bold text-purple-700 dark:text-purple-300 hover:underline flex items-center gap-1"
                      >
                        <span>View Details</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => handleChatEmployer(app)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                      >
                        <MessageCircle className="w-3.5 h-3.5" /> Message Employer
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>

        {/* JOB APPLICATION DETAILS MODAL */}
        {selectedAppModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm safe-t font-sans">
            <div className="w-full max-w-xl rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-border pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black uppercase text-muted-foreground tracking-wider">Application Details</span>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black border ${getStatusBadge(selectedAppModal.status).className}`}>
                      {getStatusBadge(selectedAppModal.status).label}
                    </span>
                  </div>
                  <h2 className="text-lg font-black text-foreground mt-0.5">{selectedAppModal.job?.title || "Job Position"}</h2>
                  <p className="text-xs text-muted-foreground font-bold flex items-center gap-1.5 mt-0.5">
                    <Building2 className="h-3.5 w-3.5 text-primary" />
                    <span>{selectedAppModal.job?.companyName || "Company"}</span>
                    {selectedAppModal.job?.location?.city && <span>• {selectedAppModal.job.location.city}</span>}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedAppModal(null)}
                  className="grid h-8 w-8 place-items-center rounded-full hover:bg-secondary transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Status Banner */}
              <div className="rounded-2xl border border-border/80 bg-muted/40 p-3.5 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">Current Status</span>
                  <span className="font-bold text-muted-foreground">
                    Applied: {new Date(selectedAppModal.createdAt || Date.now()).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {selectedAppModal.status === "SHORTLISTED"
                    ? "Congratulations! Your profile was shortlisted by the employer. They will contact you shortly."
                    : selectedAppModal.status === "INTERVIEW_SCHEDULED"
                    ? "An interview has been scheduled for this position. Check the schedule details below."
                    : selectedAppModal.status === "HIRED" || selectedAppModal.status === "SELECTED"
                    ? "Congratulations! You have been selected for this position."
                    : selectedAppModal.status === "REJECTED"
                    ? "Thank you for applying. The employer has decided to move forward with other candidates."
                    : selectedAppModal.status === "WITHDRAWN"
                    ? "You have withdrawn this application."
                    : "Your application has been received and is being reviewed by the employer."}
                </p>
              </div>

              {/* Interview Schedule Box if available */}
              {selectedAppModal.interviewDetails?.date && (
                <div className="rounded-2xl border border-purple-500/30 bg-purple-500/10 p-4 space-y-2">
                  <h4 className="text-xs font-black text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-purple-600" /> Interview Schedule
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold text-purple-900 dark:text-purple-200">
                    <div><span className="font-bold">Date & Time:</span> {new Date(selectedAppModal.interviewDetails.date).toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric", year: "numeric" })} {selectedAppModal.interviewDetails.time ? `at ${selectedAppModal.interviewDetails.time}` : ""}</div>
                    <div><span className="font-bold">Mode:</span> {selectedAppModal.interviewDetails.type || "In-Person"}</div>
                    <div className="sm:col-span-2"><span className="font-bold">Venue / Link:</span> {selectedAppModal.interviewDetails.venueOrLink || "Office Venue"}</div>
                    {selectedAppModal.interviewDetails.contactPerson && (
                      <div className="sm:col-span-2"><span className="font-bold">Contact:</span> {selectedAppModal.interviewDetails.contactPerson}</div>
                    )}
                    {selectedAppModal.interviewDetails.notes && (
                      <div className="sm:col-span-2 bg-card/70 p-2 rounded-xl text-muted-foreground">
                        <span className="font-bold text-foreground">Notes:</span> {selectedAppModal.interviewDetails.notes}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Submitted Candidate Profile Snapshot */}
              {selectedAppModal.applicantProfileSnapshot && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-foreground uppercase tracking-wider">Submitted Profile Snapshot</h4>
                  <div className="rounded-2xl border border-border bg-card p-3.5 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    {selectedAppModal.applicantProfileSnapshot.name && (
                      <div><span className="text-muted-foreground font-bold">Name:</span> <span className="font-bold text-foreground">{selectedAppModal.applicantProfileSnapshot.name}</span></div>
                    )}
                    {selectedAppModal.applicantProfileSnapshot.email && (
                      <div><span className="text-muted-foreground font-bold">Email:</span> <span className="font-bold text-foreground">{selectedAppModal.applicantProfileSnapshot.email}</span></div>
                    )}
                    {selectedAppModal.applicantProfileSnapshot.phone && (
                      <div><span className="text-muted-foreground font-bold">Phone:</span> <span className="font-bold text-foreground">{selectedAppModal.applicantProfileSnapshot.phone}</span></div>
                    )}
                    {selectedAppModal.applicantProfileSnapshot.totalExperience !== undefined && (
                      <div><span className="text-muted-foreground font-bold">Experience:</span> <span className="font-bold text-foreground">{selectedAppModal.applicantProfileSnapshot.totalExperience} years</span></div>
                    )}
                    {selectedAppModal.applicantProfileSnapshot.expectedSalary && (
                      <div><span className="text-muted-foreground font-bold">Expected Salary:</span> <span className="font-bold text-foreground">{selectedAppModal.applicantProfileSnapshot.expectedSalary}</span></div>
                    )}
                    {selectedAppModal.applicantProfileSnapshot.noticePeriod && (
                      <div><span className="text-muted-foreground font-bold">Notice Period:</span> <span className="font-bold text-foreground">{selectedAppModal.applicantProfileSnapshot.noticePeriod}</span></div>
                    )}
                  </div>
                </div>
              )}

              {/* Submitted Screening Answers */}
              {Array.isArray(selectedAppModal.screeningAnswers) && selectedAppModal.screeningAnswers.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-foreground uppercase tracking-wider">Screening Answers</h4>
                  <div className="rounded-2xl border border-border bg-card p-3.5 space-y-2.5 text-xs">
                    {selectedAppModal.screeningAnswers.map((ans: any, idx: number) => (
                      <div key={idx} className="border-b border-border/50 pb-2 last:border-b-0 last:pb-0">
                        <p className="font-bold text-foreground">{ans.question || `Question ${idx + 1}`}</p>
                        <p className="text-muted-foreground font-semibold mt-0.5">{String(ans.answer || "N/A")}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border">
                <div className="flex items-center gap-2">
                  {selectedAppModal.jobId && (
                    <button
                      onClick={() => {
                        const jId = String((typeof selectedAppModal.jobId === "object" && selectedAppModal.jobId !== null ? (selectedAppModal.jobId as any)._id : selectedAppModal.jobId) || selectedAppModal.job?.id || selectedAppModal.id);
                        setSelectedAppModal(null);
                        nav({ to: "/job/$id", params: { id: jId } });
                      }}
                      className="inline-flex items-center gap-1 px-3 py-2 bg-secondary hover:bg-secondary/80 rounded-xl text-xs font-extrabold text-foreground transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> View Job Post
                    </button>
                  )}

                  <button
                    onClick={() => {
                      handleChatEmployer(selectedAppModal);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-xs font-extrabold transition-colors shadow-xs"
                  >
                    <MessageCircle className="h-3.5 w-3.5" /> Chat Employer
                  </button>
                </div>

                {selectedAppModal.status !== "WITHDRAWN" && (
                  <button
                    onClick={() => {
                      setWithdrawAppId(selectedAppModal.id);
                    }}
                    className="text-xs font-bold text-rose-600 hover:underline px-2"
                  >
                    Withdraw Application
                  </button>
                )}
              </div>

            </div>
          </div>
        )}

        {/* WITHDRAW MODAL CONFIRMATION */}
        {withdrawAppId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4 text-center font-sans">
              <h3 className="text-base font-black text-foreground">Withdraw Application?</h3>
              <p className="text-xs text-muted-foreground font-semibold">
                Are you sure you want to withdraw your application? The employer will be notified.
              </p>
              <div className="flex items-center gap-2 pt-2">
                <button onClick={() => setWithdrawAppId(null)} className="w-1/2 h-10 rounded-xl border border-border text-xs font-bold">
                  Cancel
                </button>
                <button onClick={handleConfirmWithdraw} className="w-1/2 h-10 rounded-xl bg-rose-600 text-white text-xs font-bold">
                  Yes, Withdraw
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </MobileFrame>
  );
}
