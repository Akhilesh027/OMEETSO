import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ArrowLeft, Plus, Users, Eye, CheckCircle2, Clock, Calendar, Search, Filter,
  FileText, MessageCircle, MoreVertical, Copy, RefreshCw, XCircle, ShieldCheck, Lock,
  Briefcase
} from "lucide-react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import {
  fetchEmployerJobs,
  fetchEmployerJobApplicants,
  listCandidateApplicationsLocal,
  JobItem,
  JobApplicationItem
} from "@/lib/jobs";
import { startConversationApi } from "@/api/chat.api";
import { toast } from "sonner";
import { pushNotification } from "@/lib/account";

export const Route = createFileRoute("/my/employer/jobs")({
  head: () => ({ meta: [{ title: "Employer Jobs & Candidate Dashboard — Omeetso" }] }),
  component: EmployerJobsDashboardPage,
});

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
        const firstJob = myJobs[0];
        const firstId = firstJob.id || (firstJob as any)._id;
        setSelectedJobId(firstId);
        const firstJobApplicants = await fetchEmployerJobApplicants(firstId, token, firstJob.title);
        setApplicants(firstJobApplicants);
      } else {
        setApplicants([]);
      }
    } catch (err) {
      console.error("Failed to load employer jobs:", err);
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
    const clickedJob = jobs.find(j => j.id === jobId || (j as any)._id === jobId);
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
      const nameMatch = (snapshot.name || "").toLowerCase().includes(q);
      const roleMatch = (snapshot.currentRole || snapshot.headline || "").toLowerCase().includes(q);
      const expMatch = (snapshot.experience || snapshot.experienceYears || "").toLowerCase().includes(q);
      const phoneMatch = (snapshot.phone || "").toLowerCase().includes(q);
      const emailMatch = (snapshot.email || "").toLowerCase().includes(q);
      return nameMatch || roleMatch || expMatch || phoneMatch || emailMatch;
    }
    return true;
  });

  const handleUpdateStatus = (appId: string, nextStatus: string) => {
    const target = applicants.find((a) => a.id === appId);
    const updated = applicants.map((a) => (a.id === appId ? { ...a, status: nextStatus as any } : a));
    setApplicants(updated);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("omeetso_job_applications", JSON.stringify(updated));
    }

    pushNotification({
      id: `job-status-${appId}-${Date.now()}`,
      category: "system",
      title: `Job Application Status: ${nextStatus.replace(/_/g, " ")}`,
      body: `Status updated to ${nextStatus.replace(/_/g, " ")} for "${target?.job?.title || "Position"}".`,
      destination: "/account/jobs",
      destinationLabel: "View Application",
      read: false,
      time: Date.now(),
    });
  };

  const handleSaveInterviewSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (scheduleModalApp) {
      const updated = applicants.map((a) =>
        a.id === scheduleModalApp.id
          ? {
              ...a,
              status: "INTERVIEW_SCHEDULED" as any,
              interviewDetails: {
                date: interviewForm.date || new Date().toISOString(),
                time: interviewForm.time,
                type: interviewForm.type,
                venueOrLink: interviewForm.venueOrLink,
                contactPerson: interviewForm.contactPerson,
                notes: interviewForm.notes
              }
            }
          : a
      );
      setApplicants(updated);
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("omeetso_job_applications", JSON.stringify(updated));
      }

      pushNotification({
        id: `job-interview-${scheduleModalApp.id}-${Date.now()}`,
        category: "system",
        title: `Interview Scheduled: ${scheduleModalApp.job?.title || "Job Application"}`,
        body: `Interview scheduled on ${interviewForm.date || "scheduled date"} at ${interviewForm.time || "scheduled time"}.`,
        destination: "/account/jobs",
        destinationLabel: "View Details",
        read: false,
        time: Date.now(),
      });

      setScheduleModalApp(null);
    }
  };

  const handleSavePrivateNotes = (e: React.FormEvent) => {
    e.preventDefault();
    if (employerNotesApp) {
      const updated = applicants.map((a) =>
        a.id === employerNotesApp.id ? { ...a, employerNotes: privateNoteInput } : a
      );
      setApplicants(updated);
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("omeetso_job_applications", JSON.stringify(updated));
      }
      setEmployerNotesApp(null);
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
                              : (job.status || "").toUpperCase() === "APPROVED" || (job.status || "").toUpperCase() === "ACTIVE"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                              : (job.status || "").toUpperCase() === "REJECTED"
                              ? "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                          }`}>
                            {(job.status || "").toUpperCase() === "SUBMITTED" || (job.status || "").toUpperCase() === "PENDING" ? "Under Review" : job.status}
                          </span>
                        </div>
                        <h3 className="text-sm font-extrabold text-foreground truncate mt-1">{job.title}</h3>
                        <p className="text-xs text-muted-foreground font-semibold">{job.companyName} • {job.location?.city || "Hyderabad"}</p>
                        
                        {/* Counters */}
                        <div className="mt-3 pt-2 border-t border-border/60 flex items-center justify-between text-[11px] font-bold text-muted-foreground">
                          <span>👥 {job.id === selectedJobId ? applicants.length : (job.applicationsCount || 0)} Applicants</span>
                          <span>👁️ {job.viewsCount || 0} Views</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

          {/* ACTIVE JOB CANDIDATE MANAGEMENT BOARD */}
          {activeJob && (
            <section className="space-y-4">
              <div className="p-5 rounded-3xl border border-border bg-card space-y-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-brand">Selected Job Pipeline</span>
                    <h2 className="text-lg font-black text-foreground">{activeJob.title}</h2>
                    <p className="text-xs text-muted-foreground font-semibold">{activeJob.companyName} • {activeJob.location.area}, {activeJob.location.city}</p>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button className="px-3 py-1.5 rounded-xl border border-border bg-secondary text-xs font-bold hover:bg-secondary/80 flex items-center gap-1">
                      <Copy className="h-3.5 w-3.5" /> Duplicate
                    </button>
                    <button className="px-3 py-1.5 rounded-xl border border-border bg-secondary text-xs font-bold hover:bg-secondary/80 flex items-center gap-1">
                      <RefreshCw className="h-3.5 w-3.5" /> Renew (30 Days)
                    </button>
                    <button className="px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-700 text-xs font-bold hover:bg-rose-500/20">
                      Mark Position Filled
                    </button>
                  </div>
                </div>

                {((activeJob.status || "").toUpperCase() === "SUBMITTED" || (activeJob.status || "").toUpperCase() === "PENDING") && (
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2.5 text-xs text-amber-800 dark:text-amber-300 font-semibold">
                    <Clock className="h-4 w-4 shrink-0 text-amber-600" />
                    <span>
                      <strong>Pending Moderation Review:</strong> This job posting has been submitted and is waiting for admin verification. It will be published live to all candidates once approved by the admin.
                    </span>
                  </div>
                )}

                {/* Candidate Filters & Search */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
                    {["ALL", "APPLIED", "SHORTLISTED", "INTERVIEW_SCHEDULED", "HIRED", "REJECTED"].map((st) => (
                      <button
                        key={st}
                        onClick={() => setApplicantStatusFilter(st)}
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-extrabold transition-all border ${
                          applicantStatusFilter === st
                            ? "bg-indigo-brand text-white border-indigo-brand shadow-sm"
                            : "bg-background text-foreground border-border hover:bg-secondary"
                        }`}
                      >
                        {st.replace("_", " ")}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 rounded-2xl border border-border bg-background px-3 py-1.5 text-xs w-full sm:w-64">
                    <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                    <input
                      type="text"
                      placeholder="Search applicant name, skills..."
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
                      return (
                        <div key={app.id} className="p-5 rounded-3xl border border-border bg-secondary/20 space-y-3 font-sans">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="text-base font-black text-foreground flex items-center gap-2">
                                {snapshot.name || "Candidate"}
                                <span className="text-[10px] font-bold text-muted-foreground">({snapshot.city || "Hyderabad"})</span>
                              </h3>
                              <p className="text-xs font-bold text-indigo-brand">{snapshot.currentRole || "Applicant"} • {snapshot.experience || "1 Year"}</p>
                            </div>

                            {/* Status Tag */}
                            <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-black border ${
                              app.status === "SHORTLISTED"
                                ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/30"
                                : app.status === "INTERVIEW_SCHEDULED"
                                ? "bg-purple-500/15 text-purple-700 border-purple-500/30"
                                : app.status === "HIRED"
                                ? "bg-emerald-600 text-white border-emerald-600"
                                : "bg-card text-foreground border-border"
                            }`}>
                              {app.status}
                            </span>
                          </div>

                          {/* Candidate Specs Grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-semibold text-muted-foreground">
                            <div>Expected: <span className="font-extrabold text-emerald-600">₹{snapshot.expectedSalary ? Number(snapshot.expectedSalary).toLocaleString("en-IN") : "45,000"} / Mo</span></div>
                            <div>Notice: <span className="font-bold text-foreground">{snapshot.noticePeriod || "Immediate"}</span></div>
                            {snapshot.resumeUrl ? (
                              <div>Resume: <a href={snapshot.resumeUrl} target="_blank" rel="noreferrer" className="text-indigo-brand font-bold hover:underline">📄 View Resume</a></div>
                            ) : (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Lock className="h-3 w-3 text-amber-600" /> Phone: <span className="font-bold">Protected</span>
                              </div>
                            )}
                            <div>Applied: <span className="font-bold text-foreground">{new Date(app.createdAt).toLocaleDateString("en-IN")}</span></div>
                          </div>

                          {/* Employer Private Notes */}
                          {app.employerNotes && (
                            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-900 flex items-start gap-2">
                              <span className="text-amber-700 shrink-0">🔒 Employer Note:</span>
                              <span className="font-medium text-amber-950">{app.employerNotes}</span>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60">
                            <div className="flex items-center gap-2">
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
                                + Add Private Note
                              </button>

                              <button
                                onClick={async () => {
                                  try {
                                    const res = await startConversationApi("JOB", activeJob.id);
                                    if (res.success && res.data?.id) {
                                      nav({ to: "/chat/$id", params: { id: res.data.id } });
                                    } else {
                                      toast.error(res.error?.message || "Could not start chat");
                                    }
                                  } catch {
                                    toast.error("Failed to start chat.");
                                  }
                                }}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-brand text-white font-bold text-xs rounded-xl"
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
              </div>
            </section>
          )}
          </>
          )}

        </div>

        {/* INTERVIEW SCHEDULER MODAL */}
        {scheduleModalApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <form onSubmit={handleSaveInterviewSchedule} className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4 font-sans text-xs font-semibold">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <h3 className="text-sm font-black text-foreground">Schedule Interview for {scheduleModalApp.applicantProfileSnapshot.name}</h3>
                <button type="button" onClick={() => setScheduleModalApp(null)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-secondary">
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
