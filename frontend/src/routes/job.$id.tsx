import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ArrowLeft, Building2, MapPin, ShieldCheck, Share2, Heart, MessageCircle, Phone,
  Clock, Calendar, CheckCircle2, AlertTriangle, ShieldAlert, Sparkles, Footprints, Flag
} from "lucide-react";
import { MobileFrame } from "@/components/omeetso/MobileFrame";
import { JobCard } from "@/components/omeetso/jobs/JobCard";
import { ApplyJobModal } from "@/components/omeetso/jobs/ApplyJobModal";
import { fetchJobById, JobItem, toggleSaveJobLocal, getSavedJobIds, listCandidateApplicationsLocal } from "@/lib/jobs";
import { ReportSheet } from "@/components/omeetso/ReportSheet";

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
  const [applied, setApplied] = useState(() => {
    return listCandidateApplicationsLocal().some((a) => a.jobId === id);
  });

  useEffect(() => {
    fetchJobById(id).then((data) => {
      if (data) setJob(data);
    });
  }, [id]);

  const handleSaveToggle = () => {
    const isSaved = toggleSaveJobLocal(job.id);
    setSaved(isSaved);
  };

  const isClosed = job.status === "FILLED" || job.status === "EXPIRED" || job.status === "PAUSED";

  const salaryText = job.salary.salaryDisclosed
    ? `₹${job.salary.minSalary.toLocaleString("en-IN")} - ₹${job.salary.maxSalary.toLocaleString("en-IN")} / ${job.salary.salaryPeriod}`
    : "Salary Not Disclosed";

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

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
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

              <button
                onClick={() => nav({ to: "/chat/$id", params: { id: `JOB-${job.id}` } as never })}
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
                <div><span className="text-amber-800 font-bold">Walk-in Date:</span> {job.walkInDetails.walkInDate || "This Week"}</div>
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
              <Link to="/store/$id" params={{ id: job.storeId }} className="inline-flex text-xs font-bold text-indigo-brand hover:underline pt-2">
                View Business Profile →
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
            <button
              onClick={() => {
                if (isClosed || applied) return;
                setApplyModalOpen(true);
              }}
              disabled={isClosed || applied}
              className={`px-8 h-11 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition-all ${
                applied
                  ? "bg-emerald-600 text-white"
                  : isClosed
                  ? "bg-muted text-muted-foreground"
                  : "bg-indigo-brand text-white hover:bg-indigo-brand/90"
              }`}
            >
              {applied ? "Applied ✓" : isClosed ? "Closed" : "Apply Now"}
            </button>
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
      <div className="p-12 text-center space-y-4">
        <h2 className="text-lg font-bold text-foreground">Job listing not found</h2>
        <p className="text-xs text-muted-foreground">This job post is no longer available.</p>
        <button onClick={() => nav({ to: "/jobs" })} className="px-4 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl">
          Browse Jobs Landing
        </button>
      </div>
    </MobileFrame>
  );
}
