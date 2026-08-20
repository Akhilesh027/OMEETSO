import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ArrowLeft, Plus, Users, Eye, CheckCircle2, Clock, Calendar, Search, Filter,
  FileText, MessageCircle, MoreVertical, Copy, RefreshCw, XCircle, ShieldCheck, Lock
} from "lucide-react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { fetchPublicJobs, listCandidateApplicationsLocal, JobItem, JobApplicationItem } from "@/lib/jobs";

export const Route = createFileRoute("/my/employer-jobs")({
  head: () => ({ meta: [{ title: "Employer Jobs Management — Omeetso" }] }),
  component: EmployerJobsDashboardPage,
});

function EmployerJobsDashboardPage() {
  const nav = useNavigate();
  const [jobs, setJobs] = useState<JobItem[]>([]);
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
    venueOrLink: "ABC Technologies, 3rd Floor, Madhapur, Hyderabad",
    contactPerson: "HR Manager (+91 9876543210)",
    notes: "Please carry original education certificates."
  });

  const [privateNoteInput, setPrivateNoteInput] = useState("");

  const loadData = () => {
    fetchPublicJobs().then((data) => {
      setJobs(data);
      if (data.length > 0 && !selectedJobId) {
        setSelectedJobId(data[0].id);
      }
    });

    const localApps = listCandidateApplicationsLocal();
    setApplicants(localApps);
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeJob = jobs.find((j) => j.id === selectedJobId) || jobs[0];

  const handleStatusChange = (appId: string, newStatus: JobApplicationItem["status"]) => {
    const updated = applicants.map((a) => (a.id === appId ? { ...a, status: newStatus } : a));
    setApplicants(updated);
  };

  const handleSaveInterview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleModalApp) return;

    const updated = applicants.map((a) => {
      if (a.id === scheduleModalApp.id) {
        return {
          ...a,
          status: "INTERVIEW_SCHEDULED" as const,
          interviewDetails: {
            date: interviewForm.date || Date.now() + 86400000 * 2,
            time: interviewForm.time,
            type: interviewForm.type,
            venueOrLink: interviewForm.venueOrLink,
            contactPerson: interviewForm.contactPerson,
            notes: interviewForm.notes,
          }
        };
      }
      return a;
    });

    setApplicants(updated);
    setScheduleModalApp(null);
  };

  const handleSavePrivateNotes = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employerNotesApp) return;

    const updated = applicants.map((a) => {
      if (a.id === employerNotesApp.id) {
        return {
          ...a,
          employerNotes: privateNoteInput
        };
      }
      return a;
    });

    setApplicants(updated);
    setEmployerNotesApp(null);
  };

  const filteredApplicants = applicants.filter((a) => {
    if (selectedJobId && a.jobId !== selectedJobId && a.job?.id !== selectedJobId) {
      // If we have selected a specific job
    }
    if (applicantStatusFilter !== "ALL" && a.status !== applicantStatusFilter) return false;
    if (applicantSearch.trim()) {
      const q = applicantSearch.toLowerCase();
      return (
        a.applicantProfileSnapshot.name.toLowerCase().includes(q) ||
        a.applicantProfileSnapshot.headline.toLowerCase().includes(q) ||
        a.applicantProfileSnapshot.skills.some((s) => s.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-20 md:pb-16 font-sans">
        
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card/80 backdrop-blur-md px-4 py-3 safe-t">
          <div className="flex items-center gap-2">
            <button onClick={() => history.length > 1 ? history.back() : window.location.assign("/account")} className="grid h-9 w-9 place-items-center rounded-full hover:bg-secondary">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-sm font-extrabold text-foreground">Employer Job Management</h1>
          </div>
          <Link to="/jobs/new" className="text-xs font-extrabold text-primary hover:underline flex items-center gap-1">
            <Plus className="h-3.5 w-3.5" /> Post Job
          </Link>
        </header>

        <div className="max-w-[1000px] mx-auto p-4 space-y-5">
          
          {/* TOP JOBS OVERVIEW BAR */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
              <span className="text-[11px] font-bold text-muted-foreground uppercase">Posted Jobs</span>
              <p className="text-2xl font-black text-foreground mt-1">{jobs.length}</p>
            </div>
            <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
              <span className="text-[11px] font-bold text-muted-foreground uppercase">Total Applicants</span>
              <p className="text-2xl font-black text-primary mt-1">{applicants.length}</p>
            </div>
            <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
              <span className="text-[11px] font-bold text-muted-foreground uppercase">Shortlisted</span>
              <p className="text-2xl font-black text-emerald-600 mt-1">
                {applicants.filter((a) => a.status === "SHORTLISTED" || a.status === "INTERVIEW_SCHEDULED").length}
              </p>
            </div>
            <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
              <span className="text-[11px] font-bold text-muted-foreground uppercase">Interviews</span>
              <p className="text-2xl font-black text-purple-600 mt-1">
                {applicants.filter((a) => a.status === "INTERVIEW_SCHEDULED").length}
              </p>
            </div>
          </div>

          {/* JOB SELECTOR HORIZONTAL SCROLL */}
          {jobs.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider">Select Active Job:</span>
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {jobs.map((job) => (
                  <button
                    key={job.id}
                    onClick={() => setSelectedJobId(job.id)}
                    className={`shrink-0 px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all text-left ${
                      selectedJobId === job.id
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-card text-foreground border-border hover:bg-secondary"
                    }`}
                  >
                    <p className="font-extrabold">{job.title}</p>
                    <p className="text-[10px] opacity-80">{job.location?.city} • {job.jobType}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* APPLICANTS PIPELINE MANAGEMENT */}
          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
              <div>
                <h2 className="text-base font-black text-foreground">Candidate Applications Pipeline</h2>
                <p className="text-xs text-muted-foreground font-semibold">Review resumes, shortlist candidates, and schedule interviews.</p>
              </div>

              {/* Status Filter */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {["ALL", "SUBMITTED", "REVIEWED", "SHORTLISTED", "INTERVIEW_SCHEDULED", "REJECTED"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setApplicantStatusFilter(st)}
                    className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
                      applicantStatusFilter === st
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-secondary text-muted-foreground hover:bg-surface-2"
                    }`}
                  >
                    {st.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            {/* Applicant Cards List */}
            {filteredApplicants.length === 0 ? (
              <div className="p-12 text-center text-xs text-muted-foreground">
                No candidates found for this status filter.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredApplicants.map((app) => (
                  <div key={app.id} className="rounded-2xl border border-border bg-secondary/30 p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-extrabold text-foreground">{app.applicantProfileSnapshot.name}</h3>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                            app.status === "SHORTLISTED"
                              ? "bg-emerald-500/15 text-emerald-700"
                              : app.status === "INTERVIEW_SCHEDULED"
                              ? "bg-purple-500/15 text-purple-700"
                              : "bg-primary/10 text-primary"
                          }`}>
                            {app.status}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground font-semibold mt-0.5">
                          {app.applicantProfileSnapshot.headline} • {app.applicantProfileSnapshot.experienceYears} Years Exp • {app.applicantProfileSnapshot.city}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setScheduleModalApp(app);
                            setInterviewForm((prev) => ({
                              ...prev,
                              date: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0]
                            }));
                          }}
                          className="px-3 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-bold shadow-sm"
                        >
                          Schedule Interview
                        </button>

                        <button
                          onClick={() => {
                            setEmployerNotesApp(app);
                            setPrivateNoteInput(app.employerNotes || "");
                          }}
                          className="px-3 py-1.5 rounded-xl border border-border bg-card text-xs font-bold text-foreground"
                        >
                          Notes
                        </button>
                      </div>
                    </div>

                    {/* Skills pills */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {app.applicantProfileSnapshot.skills.map((skill) => (
                        <span key={skill} className="px-2 py-0.5 rounded-md bg-card border border-border text-[10px] font-bold text-foreground">
                          {skill}
                        </span>
                      ))}
                    </div>

                    {/* Quick actions row */}
                    <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs font-semibold">
                      <span className="text-muted-foreground">Applied {new Date(app.createdAt).toLocaleDateString()}</span>
                      <div className="flex items-center gap-2">
                        {app.status !== "SHORTLISTED" && (
                          <button
                            onClick={() => handleStatusChange(app.id, "SHORTLISTED")}
                            className="text-emerald-600 font-bold hover:underline"
                          >
                            Shortlist
                          </button>
                        )}
                        {app.status !== "REJECTED" && (
                          <button
                            onClick={() => handleStatusChange(app.id, "REJECTED")}
                            className="text-rose-600 font-bold hover:underline"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* SCHEDULE INTERVIEW MODAL */}
        {scheduleModalApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <form onSubmit={handleSaveInterview} className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4 font-sans text-xs font-semibold">
              <h3 className="text-base font-black text-foreground">Schedule Candidate Interview</h3>
              <p className="text-xs text-muted-foreground">Scheduling for <strong>{scheduleModalApp.applicantProfileSnapshot.name}</strong></p>

              <div>
                <label className="block text-muted-foreground font-bold mb-1">Interview Date *</label>
                <input
                  type="date"
                  required
                  value={interviewForm.date}
                  onChange={(e) => setInterviewForm({ ...interviewForm, date: e.target.value })}
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 font-bold text-foreground outline-none"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-bold mb-1">Interview Time *</label>
                <input
                  type="text"
                  required
                  value={interviewForm.time}
                  onChange={(e) => setInterviewForm({ ...interviewForm, time: e.target.value })}
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 font-bold text-foreground outline-none"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-bold mb-1">Venue / Online Meeting Link *</label>
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
