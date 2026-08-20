import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, Briefcase, Calendar, Clock, MapPin, CheckCircle2, AlertCircle, Trash2, Heart, User } from "lucide-react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { listCandidateApplicationsLocal, withdrawJobApplicationLocal, getSavedJobIds, fetchPublicJobs, JobItem, JobApplicationItem } from "@/lib/jobs";
import { JobCard } from "@/components/omeetso/jobs/JobCard";

export const Route = createFileRoute("/account/jobs")({
  component: CandidateJobsDashboardPage,
});

function CandidateJobsDashboardPage() {
  const [activeTab, setActiveTab] = useState<"applied" | "saved" | "interviews">("applied");
  const [applications, setApplications] = useState<JobApplicationItem[]>([]);
  const [savedJobs, setSavedJobs] = useState<JobItem[]>([]);
  const [withdrawAppId, setWithdrawAppId] = useState<string | null>(null);

  const loadData = () => {
    const apps = listCandidateApplicationsLocal();
    setApplications(apps);

    const savedIds = getSavedJobIds();
    fetchPublicJobs().then((all) => {
      setSavedJobs(all.filter((j) => savedIds.includes(j.id)));
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleConfirmWithdraw = () => {
    if (withdrawAppId) {
      withdrawJobApplicationLocal(withdrawAppId, "Candidate withdrew application");
      setWithdrawAppId(null);
      loadData();
    }
  };

  const interviewApps = applications.filter((a) => a.status === "INTERVIEW_SCHEDULED" || a.interviewDetails?.date);

  return (
    <MobileFrame>
      <div className="min-h-dvh bg-background pb-20 md:pb-16 font-sans">
        
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card/80 backdrop-blur-md px-4 py-3 safe-t">
          <div className="flex items-center gap-2">
            <button onClick={() => history.back()} className="grid h-9 w-9 place-items-center rounded-full hover:bg-secondary">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-sm font-extrabold text-foreground">My Jobs & Applications</h1>
          </div>
          <Link to="/account/profile/jobs" className="text-xs font-extrabold text-indigo-brand hover:underline flex items-center gap-1">
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
              {applications.length === 0 ? (
                <div className="p-12 text-center text-xs text-muted-foreground space-y-3">
                  <p className="font-bold">No applications submitted yet.</p>
                  <Link to="/jobs" className="inline-block px-4 py-2 bg-primary text-primary-foreground font-bold rounded-xl">
                    Explore Jobs
                  </Link>
                </div>
              ) : (
                applications.map((app) => (
                  <div key={app.id} className="rounded-3xl border border-border bg-card p-5 shadow-sm space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-extrabold text-foreground">{app.job?.title || "Job Application"}</h3>
                        <p className="text-xs text-muted-foreground font-bold">{app.job?.companyName} • {app.job?.location?.city}</p>
                      </div>

                      {/* Status Badge */}
                      <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-black border ${
                        app.status === "SHORTLISTED"
                          ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/30"
                          : app.status === "INTERVIEW_SCHEDULED"
                          ? "bg-purple-500/15 text-purple-700 border-purple-500/30"
                          : app.status === "WITHDRAWN"
                          ? "bg-muted text-muted-foreground border-border"
                          : "bg-indigo-500/15 text-indigo-700 border-indigo-500/30"
                      }`}>
                        {app.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold pt-2 border-t border-border/60">
                      <span>Applied on {new Date(app.createdAt).toLocaleDateString("en-IN")}</span>
                      {app.status !== "WITHDRAWN" && (
                        <button
                          onClick={() => setWithdrawAppId(app.id)}
                          className="text-rose-600 hover:underline font-bold"
                        >
                          Withdraw Application
                        </button>
                      )}
                    </div>
                  </div>
                ))
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
                  <div key={app.id} className="rounded-3xl border border-purple-500/30 bg-purple-500/10 p-5 space-y-3 font-sans">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-black text-purple-950 flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-purple-700" /> Interview Scheduled
                      </h3>
                      <span className="text-xs font-bold text-purple-800">{app.job?.companyName}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold text-purple-900">
                      <div><span className="font-bold">Role:</span> {app.job?.title}</div>
                      <div><span className="font-bold">Date & Time:</span> {app.interviewDetails?.date ? new Date(app.interviewDetails.date).toLocaleDateString("en-IN") : "This Week"} {app.interviewDetails?.time}</div>
                      <div><span className="font-bold">Interview Mode:</span> {app.interviewDetails?.type || "In-Person"}</div>
                      <div><span className="font-bold">Venue / Link:</span> {app.interviewDetails?.venueOrLink || "Office Venue"}</div>
                      {app.interviewDetails?.contactPerson && (
                        <div className="sm:col-span-2"><span className="font-bold">Contact Person:</span> {app.interviewDetails.contactPerson}</div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>

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
