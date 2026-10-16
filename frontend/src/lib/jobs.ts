// Omeetso Jobs Vertical — Frontend persistence layer & API client
import { API_BASE } from "@/config/api";

export type JobType = "FULL_TIME" | "PART_TIME" | "INTERNSHIP" | "CONTRACT" | "FREELANCE" | "TEMPORARY";
export type WorkplaceType = "OFFICE" | "WORK_FROM_HOME" | "HYBRID" | "FIELD_WORK";
export type ApplicationStatus = "APPLIED" | "VIEWED" | "SHORTLISTED" | "INTERVIEW_SCHEDULED" | "SELECTED" | "HIRED" | "REJECTED" | "WITHDRAWN";

export type JobItem = {
  id: string;
  employerId: string;
  storeId?: string;
  companyName: string;
  companyLogo?: string;
  companyIndustry?: string;
  companySize?: string;
  companyDescription?: string;
  isVerifiedEmployer?: boolean;
  title: string;
  jobCategoryId: string;
  subcategoryId: string;
  openingsCount: number;
  jobType: JobType;
  workplaceType: WorkplaceType;
  location: {
    remoteScope?: string;
    area: string;
    city: string;
    pincode: string;
    coordinates?: [number, number];
  };
  salary: {
    minSalary: number;
    maxSalary: number;
    salaryPeriod: "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "fixed_project" | "commission_based";
    salaryDisclosed: boolean;
    negotiable?: boolean;
    incentivesAvailable?: boolean;
  };
  candidateCriteria: {
    experience: string;
    fresherAllowed: boolean;
    minEducation: string;
    skills: string[];
    languages: string[];
  };
  jobDetails: {
    description: string;
    responsibilities?: string;
    requirements?: string;
    benefits?: string;
    workingDays?: string;
    shiftType?: string;
    workingHours?: string;
    workplacePhotos?: string[];
  };
  walkInDetails?: {
    isWalkIn: boolean;
    walkInDate?: string;
    startDate?: string;
    endDate?: string;
    startTime?: string;
    endTime?: string;
    venue?: string;
    contactPerson?: string;
    instructions?: string;
  };
  isUrgent?: boolean;
  isFeatured?: boolean;
  screeningQuestions?: string[];
  status: "DRAFT" | "SUBMITTED" | "APPROVED" | "ACTIVE" | "PAUSED" | "FILLED" | "EXPIRED" | "REJECTED";
  viewsCount?: number;
  applicationsCount?: number;
  shortlistedCount?: number;
  interviewsCount?: number;
  hiredCount?: number;
  createdAt: number;
  expiresAt?: number;
  similarJobs?: JobItem[];
  companyJobs?: JobItem[];
};

export type JobApplicationItem = {
  id: string;
  jobId: string;
  applicantId: string;
  employerId: string;
  job?: Partial<JobItem>;
  applicantProfileSnapshot: {
    name: string;
    phone: string;
    email: string;
    city: string;
    area?: string;
    title?: string;
    summary?: string;
    resumeUrl?: string;
    resumeFileName?: string;
    experience: string;
    currentRole?: string;
    currentCompany?: string;
    currentSalary?: number;
    expectedSalary?: number;
    noticePeriod?: string;
    education?: string;
    educations?: EducationItem[];
    skills?: string[];
    skillsList?: SkillItem[];
    workExperiences?: WorkExperienceItem[];
    certifications?: string[] | CertificationItem[];
    portfolioUrl?: string;
    linkedinUrl?: string;
    githubUrl?: string;
  };
  screeningAnswers: { question: string; answer: string }[];
  status: ApplicationStatus;
  interviewDetails?: {
    date?: string;
    time?: string;
    type?: "IN_PERSON" | "PHONE" | "VIDEO";
    venueOrLink?: string;
    contactPerson?: string;
    notes?: string;
  };
  employerNotes?: string;
  withdrawnAt?: string;
  withdrawalReason?: string;
  createdAt: number;
};

export type SkillProficiency = "Beginner" | "Intermediate" | "Advanced" | "Expert";

export type SkillItem = {
  name: string;
  category?: string;
  proficiency: SkillProficiency;
  yearsOfExperience: string;
};

export type WorkExperienceItem = {
  id: string;
  companyName: string;
  jobTitle: string;
  employmentType: string;
  startDate: string;
  endDate?: string;
  isCurrentlyWorking: boolean;
  location?: string;
  responsibilities: string;
  achievements?: string;
};

export type EducationItem = {
  id: string;
  qualification: string;
  specialization?: string;
  college?: string;
  university?: string;
  courseType?: string;
  startYear: string;
  completionYear: string;
  percentageOrCgpa?: string;
};

export type CertificationItem = {
  name: string;
  issuer?: string;
  issueDate?: string;
  credentialUrl?: string;
};

export type ProjectItem = {
  title: string;
  description?: string;
  link?: string;
  role?: string;
};

export type CandidateProfileItem = {
  id?: string;
  userId: string;
  // 1. Personal Information
  fullName?: string;
  photoUrl?: string;
  title: string;
  phone?: string;
  email?: string;
  city: string;
  area?: string;
  preferredLocations: string[];
  dob?: string;
  gender?: string;
  languages: string[];
  // 2. Professional Summary
  summary?: string;
  experienceYears: string;
  currentCompany?: string;
  currentRole?: string;
  currentSalary?: number;
  expectedSalary?: number;
  noticePeriod: string;
  employmentStatus?: string;
  openToWork: boolean;
  // 3. Skills
  skillsList: SkillItem[];
  skills: string[];
  // 4. Work Experience
  workExperiences: WorkExperienceItem[];
  // 5. Education
  educations: EducationItem[];
  education: string;
  // 6. Job Preferences
  desiredRole?: string;
  preferredIndustry?: string;
  preferredJobTypes: string[];
  preferredWorkplaceModes: string[];
  willingToRelocate: boolean;
  preferredShift?: string;
  immediateJoining: boolean;
  // 7. Additional Details
  certifications: CertificationItem[];
  projects: ProjectItem[];
  internshipExperience?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  awards?: string;
  drivingLicence?: string;
  ownVehicle?: string;
  disabilityAccommodations?: string;
  // 8. Resume & Documents
  resumeUrl?: string;
  resumeFileName?: string;
  savedResumes?: Array<{ id: string; name: string; url: string; uploadedAt?: string }>;
  educationalDocs?: Array<{ name: string; url: string }>;
  experienceCerts?: Array<{ name: string; url: string }>;
  idVerificationStatus?: string;
  // 9. Profile Privacy
  visibilityMode: "ALL_VERIFIED" | "ONLY_AFTER_APPLY" | "PAUSED";
  hideCurrentEmployer: boolean;
  hidePhone: boolean;
  hideEmail: boolean;
  blockedRecruiters: string[];
  allowDirectContact: boolean;
  // 10. Features
  profileViewsCount: number;
  verifiedCandidate: boolean;
  updateReminderEnabled: boolean;
  oneTapApplyEnabled: boolean;
  jobAlertsEnabled: boolean;
  jobAlertPreferences?: {
    roles?: string[];
    cities?: string[];
    minSalary?: number;
    frequency?: "DAILY" | "WEEKLY" | "INSTANT";
  };
  savedJobs: string[];
};

const LS_JOBS = "omeetso_jobs_list";
const LS_APPLICATIONS = "omeetso_job_applications";
const LS_CANDIDATE = "omeetso_candidate_profile";

const isB = typeof window !== "undefined";

export function getLocal<T>(key: string, fb: T): T {
  if (!isB) return fb;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fb;
  } catch {
    return fb;
  }
}

export function setLocal(key: string, val: unknown) {
  if (!isB) return;
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch { /* ignore */ }
}

export async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 6000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

// Initial Clean Jobs (Empty - populated only by live employer postings)
export const SEED_JOBS: JobItem[] = [];

export async function fetchPublicJobs(params?: Record<string, string>): Promise<JobItem[]> {
  let serverJobs: JobItem[] = [];
  let serverFetchSuccess = false;
  try {
    const qStr = params ? new URLSearchParams(params).toString() : "";
    const res = await fetchWithTimeout(`${API_BASE}/jobs?${qStr}`, {}, 5000);
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        serverJobs = json.data;
        serverFetchSuccess = true;
      }
    }
  } catch { /* ignore offline */ }

  // 1. If server jobs returned, update the local cache with the latest authoritative server status
  if (serverJobs.length > 0) {
    try {
      const currentCached = getLocal<JobItem[]>(LS_JOBS, []);
      let cacheChanged = false;
      const updatedCached = currentCached.map((c) => {
        const cId = String(c.id || (c as any)._id || "");
        const serverMatch = serverJobs.find(
          (s) => String(s.id || (s as any)._id || "") === cId
        );
        if (serverMatch && serverMatch.status !== c.status) {
          cacheChanged = true;
          return { ...c, ...serverMatch, id: cId, status: serverMatch.status };
        }
        return c;
      });
      if (cacheChanged) {
        setLocal(LS_JOBS, updatedCached);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("omeetso_jobs_changed"));
        }
      }
    } catch {}
  }

  const cached = getLocal<JobItem[]>(LS_JOBS, []);
  
  // Merge server and local jobs:
  // Server jobs are authoritative for status and public visibility!
  const mergedMap = new Map<string, JobItem>();
  
  // Add server jobs first
  for (const j of serverJobs) {
    const id = j.id || (j as any)._id;
    if (id) mergedMap.set(String(id), { ...j, id: String(id) });
  }

  // Merge local jobs: DO NOT resurrect deleted jobs!
  for (const j of cached) {
    const id = j.id || (j as any)._id;
    if (!id) continue;
    const strId = String(id);
    if (mergedMap.has(strId)) {
      const serverJob = mergedMap.get(strId)!;
      mergedMap.set(strId, { ...j, ...serverJob, id: strId, status: serverJob.status });
    } else {
      // If server responded successfully and this is a MongoDB ID not in server jobs, it was deleted!
      if (serverFetchSuccess && /^[0-9a-fA-F]{24}$/.test(strId)) {
        continue;
      }
      mergedMap.set(strId, { ...j, id: strId });
    }
  }

  let list = Array.from(mergedMap.values()).filter(j => {
    const st = (j.status || "").toUpperCase();
    return st === "APPROVED" || st === "ACTIVE" || st === "PUBLISHED";
  });

  // Sort newest first
  list.sort((a, b) => {
    const timeA = new Date(a.createdAt || 0).getTime();
    const timeB = new Date(b.createdAt || 0).getTime();
    return timeB - timeA;
  });

  if (params?.q) {
    const q = params.q.toLowerCase();
    list = list.filter(j => j.title?.toLowerCase().includes(q) || j.companyName?.toLowerCase().includes(q) || (j.candidateCriteria?.skills || []).some(s => s.toLowerCase().includes(q)));
  }
  if (params?.category) {
    list = list.filter(j => j.jobCategoryId === params.category);
  }
  if (params?.jobType) {
    list = list.filter(j => j.jobType === params.jobType);
  }
  if (params?.workplaceType) {
    list = list.filter(j => j.workplaceType === params.workplaceType);
  }
  if (params?.isWalkIn === "1") {
    list = list.filter(j => j.walkInDetails?.isWalkIn);
  }
  if (params?.isUrgent === "1") {
    list = list.filter(j => j.isUrgent);
  }

  return list;
}

export async function fetchJobById(id: string): Promise<JobItem | null> {
  const cleanId = (id || "").trim();
  if (!cleanId) return null;

  try {
    const res = await fetchWithTimeout(`${API_BASE}/jobs/${cleanId}?_t=${Date.now()}`, {}, 4000);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        const liveJob: JobItem = {
          ...json.data,
          id: String(json.data.id || json.data._id || cleanId)
        };
        // Immediately sync live status back into LS_JOBS!
        try {
          const currentCached = getLocal<JobItem[]>(LS_JOBS, []);
          const idx = currentCached.findIndex((j) => String(j.id || (j as any)._id) === liveJob.id);
          if (idx !== -1) {
            if (currentCached[idx].status !== liveJob.status) {
              currentCached[idx] = { ...currentCached[idx], ...liveJob, status: liveJob.status };
              setLocal(LS_JOBS, currentCached);
              if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("omeetso_jobs_changed"));
              }
            }
          } else {
            currentCached.unshift(liveJob);
            setLocal(LS_JOBS, currentCached);
          }
        } catch {}
        return liveJob;
      }
    }
  } catch { /* ignore offline or timeout */ }

  const all = getLocal<JobItem[]>(LS_JOBS, []);
  const found = all.find(j => String(j.id || (j as any)._id) === cleanId);
  if (found) {
    return {
      ...found,
      similarJobs: all.filter(j => String(j.id || (j as any)._id) !== cleanId && j.jobCategoryId === found.jobCategoryId).slice(0, 4),
      companyJobs: all.filter(j => String(j.id || (j as any)._id) !== cleanId && j.companyName === found.companyName).slice(0, 4)
    };
  }
  return null;
}

export function getSavedJobIds(): string[] {
  const profile = getLocal<CandidateProfileItem | null>(LS_CANDIDATE, null);
  return profile?.savedJobs || [];
}

export function toggleSaveJobLocal(jobId: string): boolean {
  const profile = getLocal<CandidateProfileItem>(LS_CANDIDATE, {
    userId: "me",
    title: "Job Seeker",
    city: "Hyderabad",
    experienceYears: "Fresher",
    education: "Graduate",
    skills: ["Communication"],
    languages: ["English", "Telugu"],
    noticePeriod: "15 Days",
    preferredJobTypes: ["FULL_TIME"],
    preferredLocations: ["Hyderabad"],
    allowDirectContact: true,
    savedJobs: []
  });

  const saved = new Set(profile.savedJobs || []);
  let isSaved = false;
  if (saved.has(jobId)) {
    saved.delete(jobId);
    isSaved = false;
  } else {
    saved.add(jobId);
    isSaved = true;
  }

  profile.savedJobs = Array.from(saved);
  setLocal(LS_CANDIDATE, profile);
  return isSaved;
}

export function getCandidateApplicationsStorageKey(): string {
  if (typeof window === "undefined") return "omeetso_candidate_applied_jobs";
  try {
    const u = JSON.parse(localStorage.getItem("omeetso_user") || "null");
    const uid = u?._id || u?.id;
    if (uid) return `omeetso_candidate_applications_${uid}`;
  } catch {}
  return "omeetso_candidate_applied_jobs";
}

export function listCandidateApplicationsLocal(): JobApplicationItem[] {
  const currentKey = getCandidateApplicationsStorageKey();
  const allSources: JobApplicationItem[] = [];

  // 1. Current user-scoped candidate applications
  allSources.push(...getLocal<JobApplicationItem[]>(currentKey, []));

  // 2. Global pre-login applications key
  allSources.push(...getLocal<JobApplicationItem[]>("omeetso_candidate_applied_jobs", []));

  // 3. Global job applications
  allSources.push(...getLocal<JobApplicationItem[]>(LS_APPLICATIONS, []));

  // 4. Scan all localStorage candidate and employer keys to never miss any application
  if (typeof window !== "undefined") {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.startsWith("omeetso_candidate_applications_") || k.startsWith("omeetso_employer_applicants_"))) {
          if (k !== currentKey && k !== "omeetso_candidate_applied_jobs") {
            const raw = localStorage.getItem(k);
            if (raw) {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed)) allSources.push(...parsed);
            }
          }
        }
      }
    } catch {}
  }

  // Deduplicate and enrich with job details from LS_JOBS if app.job is missing
  const cachedJobs = getLocal<JobItem[]>(LS_JOBS, []);
  const seen = new Map<string, JobApplicationItem>();

  for (const app of allSources) {
    if (!app) continue;
    const rawJobId = (typeof app.jobId === "object" && app.jobId !== null ? (app.jobId as any)._id || (app.jobId as any).id : app.jobId) || app.job?.id || (app.job as any)?._id || app.id;
    const jId = String(rawJobId || "");
    const appId = String(app.id || (app as any)._id || `APP-${jId}`);
    const dedupeKey = appId !== `APP-${jId}` ? appId : `${jId}_${app.applicantProfileSnapshot?.phone || app.applicantProfileSnapshot?.email || app.applicantProfileSnapshot?.name}`;

    if (!seen.has(dedupeKey)) {
      const matchedJob = cachedJobs.find(j => j.id === jId || (j as any)._id === jId);
      const safeJob = app.job?.title ? app.job : (matchedJob || { title: "Job Application", companyName: "Company" });

      seen.set(dedupeKey, {
        ...app,
        id: appId,
        jobId: jId,
        job: safeJob
      });
    }
  }

  const result = Array.from(seen.values());
  if (result.length > 0 && typeof window !== "undefined") {
    setLocal(currentKey, result);
  }

  return result;
}

export async function checkIsCandidateApplied(jobId: string, token?: string | null): Promise<boolean> {
  if (!jobId) return false;
  if (typeof window === "undefined") return false;

  const authToken = token || (typeof window !== "undefined" ? localStorage.getItem("omeetso_user_token") || localStorage.getItem("omeetso_auth_token") : null);

  // 1. Check server applications if token is present (Primary source of truth)
  if (authToken) {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/jobs/candidate/applications`, {
        headers: { Authorization: `Bearer ${authToken}` }
      }, 4000);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const serverMatch = json.data.some((a: any) => {
            const aJobId = String(a.jobId || a.job?.id || a.job?._id || "");
            const isMatch = aJobId === String(jobId);
            const isActive = a.status && String(a.status).toUpperCase() !== "WITHDRAWN";
            return isMatch && isActive;
          });
          if (serverMatch) return true;
        }
      }
    } catch {
      // Offline fallback
    }
  }

  // 2. Offline fallback: check user-scoped and global local candidate applications
  const localApps = listCandidateApplicationsLocal();
  return localApps.some((a) => {
    const aJobId = String(a.jobId || a.job?.id || (a.job as any)?._id || "");
    const isMatch = aJobId === String(jobId);
    const isActive = a.status && String(a.status).toUpperCase() !== "WITHDRAWN";
    return isMatch && isActive;
  });
}

export function submitJobApplicationLocal(app: Partial<JobApplicationItem>): JobApplicationItem {
  const key = getCandidateApplicationsStorageKey();
  const all = getLocal<JobApplicationItem[]>(key, []);
  const targetJobId = app.jobId || app.job?.id || (app.job as any)?._id || "";
  let currentUserId = "me";
  if (typeof window !== "undefined") {
    try {
      const u = JSON.parse(localStorage.getItem("omeetso_user") || "null");
      if (u?._id || u?.id) currentUserId = u._id || u.id;
    } catch {}
  }

  const newApp: JobApplicationItem = {
    id: app.id || `APP-${Date.now()}`,
    jobId: targetJobId,
    applicantId: app.applicantId || currentUserId,
    employerId: app.employerId || "emp",
    job: app.job,
    applicantProfileSnapshot: app.applicantProfileSnapshot || {
      name: "User",
      phone: "+91 9876543210",
      email: "user@example.com",
      city: "Hyderabad",
      experience: "2 Years",
      noticePeriod: "Immediate"
    },
    screeningAnswers: app.screeningAnswers || [],
    status: "APPLIED",
    createdAt: Date.now()
  };

  const existingIdx = all.findIndex(a => {
    const aJobId = a.jobId || a.job?.id || (a.job as any)?._id;
    return aJobId === targetJobId;
  });

  if (existingIdx !== -1) {
    all[existingIdx] = { ...all[existingIdx], ...newApp };
  } else {
    all.unshift(newApp);
  }
  setLocal(key, all);

  // Also sync to global LS_APPLICATIONS so employer can find it
  const globalApps = getLocal<JobApplicationItem[]>(LS_APPLICATIONS, []);
  const gIdx = globalApps.findIndex(a => {
    const aJobId = a.jobId || a.job?.id || (a.job as any)?._id;
    return a.id === newApp.id || (aJobId === targetJobId && (a.applicantId === newApp.applicantId || a.applicantProfileSnapshot?.phone === newApp.applicantProfileSnapshot?.phone));
  });
  if (gIdx !== -1) {
    globalApps[gIdx] = { ...globalApps[gIdx], ...newApp };
  } else {
    globalApps.unshift(newApp);
  }
  setLocal(LS_APPLICATIONS, globalApps);

  // Also sync to employer-specific cache for this job
  if (targetJobId) {
    const empKey = `omeetso_employer_applicants_${targetJobId}`;
    const empApps = getLocal<JobApplicationItem[]>(empKey, []);
    const eIdx = empApps.findIndex(a => a.id === newApp.id || (a.jobId === targetJobId && a.applicantProfileSnapshot?.phone === newApp.applicantProfileSnapshot?.phone));
    if (eIdx !== -1) {
      empApps[eIdx] = { ...empApps[eIdx], ...newApp };
    } else {
      empApps.unshift(newApp);
    }
    setLocal(empKey, empApps);
  }

  // Also increment applicationsCount on local job if present
  if (targetJobId) {
    const jobs = getLocal<JobItem[]>(LS_JOBS, []);
    const jIdx = jobs.findIndex(j => j.id === targetJobId || (j as any)._id === targetJobId);
    if (jIdx !== -1) {
      jobs[jIdx].applicationsCount = (jobs[jIdx].applicationsCount || 0) + 1;
      setLocal(LS_JOBS, jobs);
    }
  }

  // Trigger real-time sync event for listening employer screens
  if (typeof window !== "undefined") {
    try {
      window.dispatchEvent(new CustomEvent("omeetso_job_application_submitted", { detail: newApp }));
      window.dispatchEvent(new Event("storage"));
    } catch {}
  }

  return newApp;
}

export function withdrawJobApplicationLocal(appId: string, reason?: string) {
  const key = getCandidateApplicationsStorageKey();
  const all = getLocal<JobApplicationItem[]>(key, []);
  const idx = all.findIndex(a => a.id === appId || a.jobId === appId || (a as any)._id === appId);
  if (idx !== -1) {
    all[idx].status = "WITHDRAWN";
    all[idx].withdrawnAt = new Date().toISOString();
    all[idx].withdrawalReason = reason || "Withdrawn by candidate";
    setLocal(key, all);
  }
}

export function createJobLocal(job: JobItem): JobItem {
  const all = getLocal<JobItem[]>(LS_JOBS, []);
  const safeJob = {
    ...job,
    status: job.status || "SUBMITTED"
  };
  const idx = all.findIndex(j => j.id === safeJob.id);
  if (idx !== -1) {
    all[idx] = safeJob;
  } else {
    all.unshift(safeJob);
  }
  setLocal(LS_JOBS, all);
  return safeJob;
}

export async function fetchEmployerJobs(userId?: string, token?: string | null): Promise<JobItem[]> {
  let serverJobs: JobItem[] = [];
  let serverFetchSuccess = false;
  try {
    const authToken = token || (typeof window !== "undefined" ? localStorage.getItem("omeetso_user_token") : null);
    const authHeaders: Record<string, string> = authToken ? { Authorization: `Bearer ${authToken}` } : {};
    const res = await fetchWithTimeout(`${API_BASE}/jobs/employer/my-jobs?_t=${Date.now()}`, {
      headers: authHeaders
    }, 5000);
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        serverJobs = json.data;
        serverFetchSuccess = true;
      }
    }
  } catch { /* offline or timeout fallback */ }

  const cached = getLocal<JobItem[]>(LS_JOBS, []);
  const matchingCached = cached.filter(j => {
    if (!userId || userId === "me") return j.employerId === "me" || j.employerId === userId;
    return j.employerId === userId || j.employerId === "me";
  });

  const merged = new Map<string, JobItem>();
  const serverJobIds = new Set<string>();
  for (const j of serverJobs) {
    const id = String(j.id || (j as any)._id);
    if (id) {
      merged.set(id, { ...j, id });
      serverJobIds.add(id);
    }
  }

  const confirmedDeletedIds = new Set<string>();

  // Check live status for any cached jobs that are pending or missing from serverJobs
  const pendingOrMissingCached = matchingCached.filter((j) => {
    const id = String(j.id || (j as any)._id || "");
    const inServer = merged.get(id);
    const s = (inServer?.status || j.status || "").toUpperCase();
    return !inServer || s === "SUBMITTED" || s === "PENDING" || s === "PENDING APPROVAL";
  });

  if (pendingOrMissingCached.length > 0) {
    await Promise.allSettled(
      pendingOrMissingCached.slice(0, 15).map(async (j) => {
        const id = String(j.id || (j as any)._id || "");
        if (!id || id.startsWith("PREVIEW")) return;
        try {
          const res = await fetchWithTimeout(`${API_BASE}/jobs/${id}?_t=${Date.now()}`, {}, 3000);
          if (res.status === 404 || res.status === 410) {
            confirmedDeletedIds.add(id);
            merged.delete(id);
            return;
          }
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.data) {
              const liveJob: JobItem = {
                ...data.data,
                id: String(data.data.id || data.data._id || id)
              };
              merged.set(id, liveJob);
            } else if (data.success === false) {
              confirmedDeletedIds.add(id);
              merged.delete(id);
            }
          }
        } catch {}
      })
    );
  }

  for (const j of matchingCached) {
    const id = String(j.id || (j as any)._id || "");
    if (!id || confirmedDeletedIds.has(id)) continue;
    // If backend returned a valid serverJobs list and this job has a 24-character hexadecimal MongoDB ID,
    // and was NOT in serverJobs, it was deleted on the server!
    if (serverFetchSuccess && /^[0-9a-fA-F]{24}$/.test(id) && !serverJobIds.has(id)) {
      confirmedDeletedIds.add(id);
      merged.delete(id);
      continue;
    }
    if (!merged.has(id)) {
      merged.set(id, { ...j, id });
    }
  }

  // Purge confirmed deleted jobs from LS_JOBS and applicants storage!
  if (confirmedDeletedIds.size > 0) {
    try {
      const remainingCached = cached.filter((c) => {
        const cId = String(c.id || (c as any)._id || "");
        return !confirmedDeletedIds.has(cId);
      });
      setLocal(LS_JOBS, remainingCached);
      for (const dId of confirmedDeletedIds) {
        if (typeof localStorage !== "undefined") {
          localStorage.removeItem(`omeetso_employer_applicants_${dId}`);
        }
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("omeetso_jobs_changed"));
      }
    } catch {}
  }

  const finalJobs = Array.from(merged.values());

  // Sync latest authoritative status of user's jobs back to LS_JOBS!
  if (finalJobs.length > 0) {
    try {
      let cacheChanged = false;
      const updatedCached = cached.map((c) => {
        const cId = String(c.id || (c as any)._id || "");
        const match = merged.get(cId);
        if (match && match.status !== c.status) {
          cacheChanged = true;
          return { ...c, ...match, id: cId, status: match.status };
        }
        return c;
      });
      if (cacheChanged) {
        setLocal(LS_JOBS, updatedCached);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("omeetso_jobs_changed"));
        }
      }
    } catch {}
  }

  return finalJobs;
}

export async function deleteEmployerJob(jobId: string, token?: string | null): Promise<boolean> {
  const cleanId = String(jobId || "").trim();
  if (!cleanId) return false;

  // 1. Purge from local cache immediately
  try {
    const cached = getLocal<JobItem[]>(LS_JOBS, []);
    const filtered = cached.filter(j => {
      const id = String(j.id || (j as any)._id || "");
      return id !== cleanId;
    });
    setLocal(LS_JOBS, filtered);
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(`omeetso_employer_applicants_${cleanId}`);
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("omeetso_jobs_changed"));
    }
  } catch {}

  // 2. Call backend DELETE endpoint
  try {
    const authToken = token || (typeof window !== "undefined" ? localStorage.getItem("omeetso_user_token") : null);
    const authHeaders: Record<string, string> = authToken ? { Authorization: `Bearer ${authToken}` } : {};
    await fetchWithTimeout(`${API_BASE}/jobs/${cleanId}`, {
      method: "DELETE",
      headers: authHeaders
    }, 5000);
  } catch {}

  return true;
}

function safeExtractJobId(a: any): string {
  if (!a) return "";
  if (typeof a === "string") return a.trim();
  if (typeof a.jobId === "string") return a.jobId.trim();
  if (a.jobId && typeof a.jobId === "object") {
    const id = a.jobId._id || a.jobId.id;
    if (id) return String(id).trim();
  }
  if (a.job) {
    const id = a.job.id || (a.job as any)?._id;
    if (id) return String(id).trim();
  }
  if (a.jobSnapshot) {
    const id = (a.jobSnapshot as any)?._id || (a.jobSnapshot as any)?.id;
    if (id) return String(id).trim();
  }
  return "";
}

export async function fetchEmployerJobApplicants(jobId: string, token?: string | null, jobTitle?: string): Promise<JobApplicationItem[]> {
  const cleanTargetId = String(jobId || "").trim();
  let serverApps: JobApplicationItem[] = [];
  try {
    const authToken = token || (typeof window !== "undefined" ? localStorage.getItem("omeetso_user_token") : null);
    const authHeaders: Record<string, string> = authToken ? { Authorization: `Bearer ${authToken}` } : {};
    const res = await fetchWithTimeout(`${API_BASE}/jobs/${cleanTargetId}/applicants?_t=${Date.now()}`, {
      headers: authHeaders
    }, 5000);
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        serverApps = json.data.map((item: any) => ({
          ...item,
          id: String(item.id || item._id?.toString() || item._id || ""),
          jobId: safeExtractJobId(item) || cleanTargetId
        }));
      }
    }
  } catch { /* offline or timeout fallback */ }

  // 1. Gather all local sources
  const empJobApps = getLocal<JobApplicationItem[]>(`omeetso_employer_applicants_${cleanTargetId}`, []);
  const globalApps = getLocal<JobApplicationItem[]>(LS_APPLICATIONS, []);
  const candApps = listCandidateApplicationsLocal();

  // Scan extra localStorage candidate keys if available
  const extraLocalApps: JobApplicationItem[] = [];
  if (typeof window !== "undefined") {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.startsWith("omeetso_candidate_applications_") || k === "omeetso_candidate_applied_jobs" || k.startsWith("omeetso_employer_applicants_"))) {
          const raw = localStorage.getItem(k);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) extraLocalApps.push(...parsed);
          }
        }
      }
    } catch {}
  }

  const cleanTitle = (t?: string) => (t || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const targetTitleNorm = cleanTitle(jobTitle);

  const allLocal = [...empJobApps, ...globalApps, ...candApps, ...extraLocalApps];
  const matchingLocal = allLocal.filter(a => {
    if (!a) return false;
    const aId = safeExtractJobId(a);
    if (aId && cleanTargetId && (aId === cleanTargetId || aId.toLowerCase() === cleanTargetId.toLowerCase())) {
      return true;
    }
    const candTitleNorm = cleanTitle(a.job?.title || (a as any).jobSnapshot?.title);
    if (targetTitleNorm && candTitleNorm && targetTitleNorm === candTitleNorm) {
      return true;
    }
    return false;
  });

  const candidateProfile = getLocal<CandidateProfileItem | null>(LS_CANDIDATE, null);

  const seenMap = new Map<string, JobApplicationItem>();

  // 1. Process server apps first
  for (const app of serverApps) {
    const appId = String(app.id || (app as any)._id || "");
    const jId = safeExtractJobId(app) || cleanTargetId;
    const dedupeKey = appId || `${jId}_${app.applicantId || app.applicantProfileSnapshot?.phone || app.applicantProfileSnapshot?.name}`;
    
    // Look for matching local app to enrich missing resumeUrl or snapshot details
    const localMatch = matchingLocal.find(l => {
      const lId = String(l.id || (l as any)._id || "");
      if (lId && appId && lId === appId) return true;
      if (l.applicantProfileSnapshot?.phone && app.applicantProfileSnapshot?.phone && l.applicantProfileSnapshot.phone === app.applicantProfileSnapshot.phone) return true;
      if (l.applicantProfileSnapshot?.email && app.applicantProfileSnapshot?.email && l.applicantProfileSnapshot.email === app.applicantProfileSnapshot.email) return true;
      if (l.applicantProfileSnapshot?.name && app.applicantProfileSnapshot?.name && l.applicantProfileSnapshot.name.toLowerCase() === app.applicantProfileSnapshot.name.toLowerCase()) return true;
      return false;
    });

    const mergedSnapshot = {
      name: app.applicantProfileSnapshot?.name || localMatch?.applicantProfileSnapshot?.name || "Candidate",
      phone: app.applicantProfileSnapshot?.phone || localMatch?.applicantProfileSnapshot?.phone || "",
      email: app.applicantProfileSnapshot?.email || localMatch?.applicantProfileSnapshot?.email || "",
      city: app.applicantProfileSnapshot?.city || localMatch?.applicantProfileSnapshot?.city || "Hyderabad",
      currentRole: app.applicantProfileSnapshot?.currentRole || app.applicantProfileSnapshot?.title || localMatch?.applicantProfileSnapshot?.currentRole || "",
      experience: app.applicantProfileSnapshot?.experience || localMatch?.applicantProfileSnapshot?.experience || "Fresher",
      noticePeriod: app.applicantProfileSnapshot?.noticePeriod || localMatch?.applicantProfileSnapshot?.noticePeriod || "Immediate",
      ...(localMatch?.applicantProfileSnapshot || {}),
      ...(app.applicantProfileSnapshot || {}),
      resumeUrl: app.applicantProfileSnapshot?.resumeUrl || localMatch?.applicantProfileSnapshot?.resumeUrl || (candidateProfile?.resumeUrl ? candidateProfile.resumeUrl : undefined),
      resumeFileName: app.applicantProfileSnapshot?.resumeFileName || localMatch?.applicantProfileSnapshot?.resumeFileName || (candidateProfile?.resumeFileName ? candidateProfile.resumeFileName : undefined),
      skills: (app.applicantProfileSnapshot?.skills?.length ? app.applicantProfileSnapshot.skills : localMatch?.applicantProfileSnapshot?.skills) || [],
      skillsList: (app.applicantProfileSnapshot?.skillsList?.length ? app.applicantProfileSnapshot.skillsList : localMatch?.applicantProfileSnapshot?.skillsList) || [],
      workExperiences: (app.applicantProfileSnapshot?.workExperiences?.length ? app.applicantProfileSnapshot.workExperiences : localMatch?.applicantProfileSnapshot?.workExperiences) || [],
      educations: (app.applicantProfileSnapshot?.educations?.length ? app.applicantProfileSnapshot.educations : localMatch?.applicantProfileSnapshot?.educations) || [],
    };

    const enrichedApp: JobApplicationItem = {
      ...app,
      id: appId,
      jobId: jId,
      applicantProfileSnapshot: mergedSnapshot as any
    };

    seenMap.set(dedupeKey, enrichedApp);
  }

  // 2. Merge local apps that are not yet on server
  for (const localApp of matchingLocal) {
    const localId = String(localApp.id || (localApp as any)._id || "");
    const localJobId = safeExtractJobId(localApp) || cleanTargetId;
    const dedupeKey = localId || `${localJobId}_${localApp.applicantId || localApp.applicantProfileSnapshot?.phone || localApp.applicantProfileSnapshot?.name}`;
    if (!seenMap.has(dedupeKey)) {
      const mergedSnapshot = {
        name: localApp.applicantProfileSnapshot?.name || "Candidate",
        phone: localApp.applicantProfileSnapshot?.phone || "",
        email: localApp.applicantProfileSnapshot?.email || "",
        city: localApp.applicantProfileSnapshot?.city || "Hyderabad",
        currentRole: localApp.applicantProfileSnapshot?.currentRole || localApp.applicantProfileSnapshot?.title || "",
        experience: localApp.applicantProfileSnapshot?.experience || "Fresher",
        noticePeriod: localApp.applicantProfileSnapshot?.noticePeriod || "Immediate",
        ...(localApp.applicantProfileSnapshot || {}),
        resumeUrl: localApp.applicantProfileSnapshot?.resumeUrl || (candidateProfile?.resumeUrl ? candidateProfile.resumeUrl : undefined),
        resumeFileName: localApp.applicantProfileSnapshot?.resumeFileName || (candidateProfile?.resumeFileName ? candidateProfile.resumeFileName : undefined),
      };
      seenMap.set(dedupeKey, { ...localApp, id: localId || `APP-${Date.now()}`, jobId: localJobId, applicantProfileSnapshot: mergedSnapshot as any });
    }
  }

  const result = Array.from(seenMap.values());
  // Save combined to employer job applicants cache for instantaneous subsequent loads
  if (cleanTargetId) {
    setLocal(`omeetso_employer_applicants_${cleanTargetId}`, result);
  }

  // Update applicationsCount on the cached job in LS_JOBS so cards stay in sync
  try {
    const jobs = getLocal<JobItem[]>(LS_JOBS, []);
    const jIdx = jobs.findIndex(j => String(j.id || (j as any)._id) === cleanTargetId);
    if (jIdx !== -1 && jobs[jIdx].applicationsCount !== result.length) {
      jobs[jIdx].applicationsCount = result.length;
      setLocal(LS_JOBS, jobs);
    }
  } catch {}

  return result;
}

export interface EligibilityResult {
  isEligible: boolean;
  requiredExpDisplay: string;
  candidateExpDisplay: string;
  message: string;
}

export function parseExperienceYears(expStr?: string | null): { minYears: number; maxYears?: number; isFresher: boolean } {
  if (!expStr) return { minYears: 0, isFresher: true };
  const lower = expStr.trim().toLowerCase();

  if (
    lower.includes("fresher") ||
    lower.includes("no exp") ||
    lower.includes("entry level") ||
    lower === "0" ||
    lower === "0-1 years" ||
    lower === "0 - 1 years" ||
    lower === "0-1" ||
    lower === "none"
  ) {
    return { minYears: 0, maxYears: 1, isFresher: true };
  }

  // Check ranges e.g. "1-2 Years", "1 - 2 Years", "1–2 Years", "1 to 2 Years"
  const rangeMatch = lower.match(/(\d+)\s*(?:-|–|to|\+)\s*(\d+)?/);
  if (rangeMatch) {
    const min = parseInt(rangeMatch[1], 10);
    const max = rangeMatch[2] ? parseInt(rangeMatch[2], 10) : undefined;
    return { minYears: isNaN(min) ? 0 : min, maxYears: max, isFresher: min === 0 };
  }

  const singleMatch = lower.match(/(\d+)/);
  if (singleMatch) {
    const val = parseInt(singleMatch[1], 10);
    return { minYears: isNaN(val) ? 0 : val, isFresher: val === 0 };
  }

  return { minYears: 0, isFresher: true };
}

export function checkJobExperienceEligibility(
  jobCriteria?: { experience?: string; fresherAllowed?: boolean },
  candidateExpStr?: string
): EligibilityResult {
  const jobExpStr = (jobCriteria?.experience || "").trim();
  const fresherAllowed = jobCriteria?.fresherAllowed;

  const parsedJob = parseExperienceYears(jobExpStr);
  const parsedCandidate = parseExperienceYears(candidateExpStr);

  const rawJobExp = jobExpStr || (parsedJob.minYears > 0 ? `${parsedJob.minYears}+ years` : "Fresher");
  // Normalize display string e.g. "1-2 Years" -> "1–2 years" or "1–2 Years"
  const requiredExpDisplay = rawJobExp;
  const isCandFresher = parsedCandidate.isFresher;
  const candidateExpDisplay = isCandFresher ? "Fresher" : (candidateExpStr?.trim() || "Fresher");

  // Job requires experience if minYears > 0 OR fresherAllowed is explicitly false
  const requiresExperience = parsedJob.minYears > 0 || fresherAllowed === false;

  if (requiresExperience && isCandFresher) {
    return {
      isEligible: false,
      requiredExpDisplay,
      candidateExpDisplay: "Fresher",
      message: `You are not eligible for this job. This position requires ${requiredExpDisplay} of experience, but your profile indicates that you are a Fresher.`
    };
  }

  if (parsedJob.minYears > 0 && parsedCandidate.minYears < parsedJob.minYears) {
    return {
      isEligible: false,
      requiredExpDisplay,
      candidateExpDisplay,
      message: `You are not eligible for this job. This position requires ${requiredExpDisplay} of experience, but your profile indicates that you have ${candidateExpDisplay} of experience.`
    };
  }

  return {
    isEligible: true,
    requiredExpDisplay,
    candidateExpDisplay,
    message: ""
  };
}

