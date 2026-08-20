import React from "react";
import { Link } from "@tanstack/react-router";
import { MapPin, Briefcase, Clock, ShieldCheck, Zap, Footprints, AlertTriangle, Sparkles, Building2 } from "lucide-react";
import { JobItem, toggleSaveJobLocal, getSavedJobIds } from "@/lib/jobs";
import { useState } from "react";

export function JobCard({ job, variant = "grid" }: { job: JobItem; variant?: "grid" | "list" }) {
  const [saved, setSaved] = useState(() => getSavedJobIds().includes(job.id));

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const isNowSaved = toggleSaveJobLocal(job.id);
    setSaved(isNowSaved);
  };

  const isClosed = job.status === "FILLED" || job.status === "EXPIRED";

  const salaryText = job.salary.salaryDisclosed
    ? `₹${job.salary.minSalary.toLocaleString("en-IN")} - ₹${job.salary.maxSalary.toLocaleString("en-IN")} / ${job.salary.salaryPeriod}`
    : "Salary Not Disclosed";

  if (variant === "list") {
    return (
      <div className={`group relative rounded-2xl border bg-card p-4 shadow-sm transition-all hover:shadow-md hover:border-indigo-brand/40 flex flex-col md:flex-row md:items-center justify-between gap-4 ${isClosed ? "opacity-75 bg-muted/20" : "border-border"}`}>
        <div className="flex items-start gap-3.5 flex-1 min-w-0">
          <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-2xl border border-border bg-muted/30">
            {job.companyLogo ? (
              <img src={job.companyLogo} alt={job.companyName} className="h-full w-full object-cover" />
            ) : (
              <Building2 className="h-6 w-6 text-muted-foreground" />
            )}
          </div>

          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-1.5">
              {job.walkInDetails?.isWalkIn && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-black text-amber-700 border border-amber-500/30">
                  <Footprints className="h-2.5 w-2.5" /> WALK-IN
                </span>
              )}
              {job.isUrgent && (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-black text-rose-700 border border-rose-500/30">
                  <Zap className="h-2.5 w-2.5" /> URGENT
                </span>
              )}
              {job.isFeatured && (
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/15 px-2 py-0.5 text-[10px] font-black text-indigo-700 border border-indigo-500/30">
                  <Sparkles className="h-2.5 w-2.5" /> FEATURED
                </span>
              )}
              <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                {job.workplaceType === "WORK_FROM_HOME" ? "🏠 WFH" : job.workplaceType === "HYBRID" ? "🏢 Hybrid" : "📍 On-Site"}
              </span>
            </div>

            <Link to="/job/$id" params={{ id: job.id }} className="group-hover:text-indigo-brand transition-colors block">
              <h3 className="text-base font-extrabold tracking-tight text-foreground truncate">
                {job.title}
              </h3>
            </Link>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground font-semibold">
              <span className="text-foreground font-bold">{job.companyName}</span>
              {job.isVerifiedEmployer && (
                <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 font-bold">
                  <ShieldCheck className="h-3 w-3" /> Verified
                </span>
              )}
              <span className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-3 w-3 text-indigo-brand shrink-0" />
                {job.location.area}, {job.location.city}
              </span>
              <span className="text-emerald-700 font-extrabold">💰 {salaryText}</span>
            </div>

            <div className="flex flex-wrap gap-1 text-[11px] font-semibold text-muted-foreground pt-0.5">
              <span className="rounded-md bg-muted px-2 py-0.5 text-[10px]">🎓 {job.candidateCriteria.minEducation}</span>
              <span className="rounded-md bg-muted px-2 py-0.5 text-[10px]">⏳ {job.candidateCriteria.experience}</span>
              {job.candidateCriteria.skills.slice(0, 3).map((skill) => (
                <span key={skill} className="rounded-md bg-indigo-brand/10 text-indigo-brand font-bold px-2 py-0.5 text-[10px]">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between md:flex-col md:items-end gap-2 shrink-0 border-t md:border-t-0 pt-2.5 md:pt-0 border-border/50">
          <button
            onClick={handleSaveToggle}
            className="grid h-8 w-8 place-items-center rounded-full bg-secondary hover:bg-secondary/80 text-muted-foreground transition-all"
            title={saved ? "Remove from Saved Jobs" : "Save Job"}
            aria-label="Save job"
          >
            <span className={saved ? "text-rose-500 font-bold" : ""}>{saved ? "♥" : "♡"}</span>
          </button>

          <div className="text-right">
            <Link
              to="/job/$id"
              params={{ id: job.id }}
              className="inline-flex items-center gap-1 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:opacity-95 transition-all"
            >
              {isClosed ? "Position Closed" : "View Job"}
            </Link>
            <div className="text-[10px] text-muted-foreground flex items-center justify-end gap-1 mt-1 font-semibold">
              <Clock className="h-3 w-3" />
              <span>Posted {new Date(job.createdAt).toLocaleDateString("en-IN")}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`group relative rounded-3xl border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-indigo-brand/40 ${isClosed ? "opacity-75 bg-muted/20" : "border-border"}`}>
      {/* Top Badges Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {job.walkInDetails?.isWalkIn && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-black text-amber-700 border border-amber-500/30">
              <Footprints className="h-3 w-3" /> WALK-IN
            </span>
          )}
          {job.isUrgent && (
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 px-2.5 py-0.5 text-[11px] font-black text-rose-700 border border-rose-500/30">
              <Zap className="h-3 w-3" /> URGENT HIRING
            </span>
          )}
          {job.isFeatured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/15 px-2.5 py-0.5 text-[11px] font-black text-indigo-700 border border-indigo-500/30">
              <Sparkles className="h-3 w-3" /> FEATURED
            </span>
          )}
          <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-bold text-muted-foreground">
            {job.workplaceType === "WORK_FROM_HOME" ? "🏠 Work From Home" : job.workplaceType === "HYBRID" ? "🏢 Hybrid" : "📍 On-Site"}
          </span>
        </div>

        {/* Save Toggle */}
        <button
          onClick={handleSaveToggle}
          className="grid h-8 w-8 place-items-center rounded-full bg-secondary hover:bg-secondary/80 text-muted-foreground transition-all"
          title={saved ? "Remove from Saved Jobs" : "Save Job"}
          aria-label="Save job"
        >
          <span className={saved ? "text-rose-500 font-bold" : ""}>{saved ? "♥" : "♡"}</span>
        </button>
      </div>

      {/* Main Job Overview */}
      <div className="flex items-start gap-4">
        {/* Company Logo */}
        <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-2xl border border-border bg-muted/30">
          {job.companyLogo ? (
            <img src={job.companyLogo} alt={job.companyName} className="h-full w-full object-cover" />
          ) : (
            <Building2 className="h-6 w-6 text-muted-foreground" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <Link to="/job/$id" params={{ id: job.id }} className="group-hover:text-indigo-brand transition-colors">
            <h3 className="text-base font-extrabold tracking-tight text-foreground truncate flex items-center gap-1.5">
              {job.title}
            </h3>
          </Link>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground font-semibold truncate">
            <span className="text-foreground font-bold">{job.companyName}</span>
            {job.isVerifiedEmployer && (
              <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 font-bold">
                <ShieldCheck className="h-3 w-3" /> Verified
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Key Details Pills */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-emerald-700 font-extrabold bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
          <span>💰</span>
          <span className="truncate">{salaryText}</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground font-bold bg-secondary/50 p-2 rounded-xl">
          <MapPin className="h-3.5 w-3.5 text-indigo-brand shrink-0" />
          <span className="truncate">{job.location.area}, {job.location.city}</span>
        </div>
      </div>

      {/* Criteria & Skills Tags */}
      <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] font-semibold text-muted-foreground">
        <span className="rounded-lg bg-muted px-2 py-0.5">🎓 {job.candidateCriteria.minEducation}</span>
        <span className="rounded-lg bg-muted px-2 py-0.5">⏳ {job.candidateCriteria.experience}</span>
        {job.candidateCriteria.skills.slice(0, 2).map((skill) => (
          <span key={skill} className="rounded-lg bg-indigo-brand/10 text-indigo-brand font-bold px-2 py-0.5">
            {skill}
          </span>
        ))}
      </div>

      {/* Footer / CTA Bar */}
      <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between gap-2">
        <div className="text-[10px] text-muted-foreground flex items-center gap-1 font-semibold">
          <Clock className="h-3 w-3" />
          <span>Posted {new Date(job.createdAt).toLocaleDateString("en-IN")}</span>
        </div>

        <Link
          to="/job/$id"
          params={{ id: job.id }}
          className="inline-flex items-center gap-1 rounded-xl bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground hover:opacity-95 transition-all"
        >
          {isClosed ? "Position Closed" : "View Job"}
        </Link>
      </div>
    </div>
  );
}
