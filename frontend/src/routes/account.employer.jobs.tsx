import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ArrowLeft, Plus, Users, Eye, CheckCircle2, Clock, Calendar, Search, Filter,
  FileText, MessageCircle, MoreVertical, Copy, RefreshCw, XCircle, ShieldCheck, Lock
} from "lucide-react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { fetchPublicJobs, listCandidateApplicationsLocal, JobItem, JobApplicationItem } from "@/lib/jobs";

export const Route = createFileRoute("/account/employer/jobs")({
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

  const filteredApplicants = applicants.filter((a) => {
    if (selectedJobId && a.jobId !== selectedJobId) return false;
    if (applicantStatusFilter !== "ALL" && a.status !== applicantStatusFilter) return false;
    if (applicantSearch.trim()) {
      const q = applicantSearch.toLowerCase();
      const snapshot = a.applicantProfileSnapshot;
      return snapshot.name.toLowerCase().includes(q) || snapshot.experience.toLowerCase().includes(q) || (snapshot.currentRole || "").toLowerCase().includes(q);
    }
    return true;
  });

  const handleUpdateStatus = (appId: string, nextStatus: string) => {
    const updated = applicants.map((a) => (a.id === appId ? { ...a, status: nextStatus as any } : a));
    setApplicants(updated);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("omeetso_job_applications", JSON.stringify(updated));
    }
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
            <button onClick={() => history.back()} className="grid h-9 w-9 place-items-center rounded-full hover:bg-secondary">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-sm font-extrabold text-foreground">Employer Job & Candidate Dashboard</h1>
          </div>
          <button onClick={() => nav({ to: "/sell" })} className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground font-extrabold text-xs rounded-xl">
            <Plus className="h-4 w-4" /> Post Job
          </button>
        </header>

        <div className="max-w-[1200px] mx-auto p-4 space-y-6">
          
          {/* MY JOBS LIST CAROUSEL / SELECTOR */}
          <section className="space-y-3">
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-muted-foreground">My Posted Job Listings ({jobs.length})</h2>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
              {jobs.map((job) => {
                const isSelected = job.id === selectedJobId;
                return (
                  <div
                    key={job.id}
                    onClick={() => setSelectedJobId(job.id)}
                    className={`shrink-0 w-[280px] p-4 rounded-3xl border cursor-pointer transition-all ${
                      isSelected ? "border-indigo-brand bg-indigo-brand/10 shadow-md" : "border-border bg-card hover:bg-secondary/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-indigo-brand">{job.jobType}</span>
                      <span className="text-[10px] font-bold text-emerald-600">{job.status}</span>
                    </div>
                    <h3 className="text-sm font-extrabold text-foreground truncate mt-1">{job.title}</h3>
                    <p className="text-xs text-muted-foreground font-semibold">{job.companyName} • {job.location.city}</p>
                    
                    {/* Counters */}
                    <div className="mt-3 pt-2 border-t border-border/60 flex items-center justify-between text-[11px] font-bold text-muted-foreground">
                      <span>👥 {job.applicationsCount || applicants.length} Applicants</span>
                      <span>👁️ {job.viewsCount || 42} Views</span>
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
                      const snapshot = app.applicantProfileSnapshot;
                      return (
                        <div key={app.id} className="p-5 rounded-3xl border border-border bg-secondary/20 space-y-3 font-sans">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="text-base font-black text-foreground flex items-center gap-2">
                                {snapshot.name}
                                <span className="text-[10px] font-bold text-muted-foreground">({snapshot.city})</span>
                              </h3>
                              <p className="text-xs font-bold text-indigo-brand">{snapshot.currentRole || "Applicant"} • {snapshot.experience}</p>
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
                            <div>Expected: <span className="font-extrabold text-emerald-600">₹{snapshot.expectedSalary?.toLocaleString("en-IN") || "45,000"} / Mo</span></div>
                            <div>Notice: <span className="font-bold text-foreground">{snapshot.noticePeriod}</span></div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Lock className="h-3 w-3 text-amber-600" /> Phone: <span className="font-bold">Protected</span>
                            </div>
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
                                onClick={() => nav({ to: "/chat/$id", params: { id: `JOB-${activeJob.id}` } as never })}
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
                  <label className="block text-muted-foreground mb-1">Interview Date</label>
                  <input
                    type="date"
                    required
                    value={interviewForm.date}
                    onChange={(e) => setInterviewForm({ ...interviewForm, date: e.target.value })}
                    className="w-full h-10 rounded-xl border border-border bg-background px-3 font-bold text-foreground outline-none"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground mb-1">Time Window</label>
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
