// Omeetso Jobs Vertical — Frontend persistence layer & API client

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
    resumeUrl?: string;
    experience: string;
    currentRole?: string;
    currentCompany?: string;
    currentSalary?: number;
    expectedSalary?: number;
    noticePeriod?: string;
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

export type CandidateProfileItem = {
  id?: string;
  userId: string;
  title: string;
  photoUrl?: string;
  city: string;
  experienceYears: string;
  currentCompany?: string;
  currentRole?: string;
  education: string;
  skills: string[];
  languages: string[];
  resumeUrl?: string;
  expectedSalary?: number;
  noticePeriod: string;
  preferredJobTypes: string[];
  preferredLocations: string[];
  allowDirectContact: boolean;
  savedJobs: string[];
};

const LS_JOBS = "omeetso_jobs_list";
const LS_APPLICATIONS = "omeetso_job_applications";
const LS_CANDIDATE = "omeetso_candidate_profile";

const isB = typeof window !== "undefined";

function getLocal<T>(key: string, fb: T): T {
  if (!isB) return fb;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fb;
  } catch {
    return fb;
  }
}

function setLocal(key: string, val: unknown) {
  if (!isB) return;
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch { /* ignore */ }
}

// Initial Clean Jobs (Empty - populated only by live employer postings)
export const SEED_JOBS: JobItem[] = [];

export async function fetchPublicJobs(params?: Record<string, string>): Promise<JobItem[]> {
  try {
    const qStr = params ? new URLSearchParams(params).toString() : "";
    const res = await fetch(`https://api.omeetso.in /api/v1/jobs?${qStr}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setLocal(LS_JOBS, json.data);
        return json.data;
      }
    }
  } catch { /* ignore offline */ }

  const cached = getLocal<JobItem[]>(LS_JOBS, []);
  let list = Array.isArray(cached) ? [...cached] : [];

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
  try {
    const res = await fetch(`https://api.omeetso.in /api/v1/jobs/${id}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return json.data;
      }
    }
  } catch { /* ignore offline */ }

  const all = getLocal<JobItem[]>(LS_JOBS, []);
  const found = all.find(j => j.id === id);
  if (found) {
    return {
      ...found,
      similarJobs: all.filter(j => j.id !== id && j.jobCategoryId === found.jobCategoryId).slice(0, 4),
      companyJobs: all.filter(j => j.id !== id && j.companyName === found.companyName).slice(0, 4)
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

export function listCandidateApplicationsLocal(): JobApplicationItem[] {
  return getLocal<JobApplicationItem[]>(LS_APPLICATIONS, []);
}

export function submitJobApplicationLocal(app: Partial<JobApplicationItem>): JobApplicationItem {
  const all = listCandidateApplicationsLocal();
  const newApp: JobApplicationItem = {
    id: `APP-${Date.now()}`,
    jobId: app.jobId || "",
    applicantId: "me",
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

  const existingIdx = all.findIndex(a => a.jobId === app.jobId && a.applicantId === "me");
  if (existingIdx !== -1) {
    all[existingIdx] = newApp;
  } else {
    all.unshift(newApp);
  }
  setLocal(LS_APPLICATIONS, all);
  return newApp;
}

export function withdrawJobApplicationLocal(appId: string, reason?: string) {
  const all = listCandidateApplicationsLocal();
  const idx = all.findIndex(a => a.id === appId);
  if (idx !== -1) {
    all[idx].status = "WITHDRAWN";
    all[idx].withdrawnAt = new Date().toISOString();
    all[idx].withdrawalReason = reason || "Withdrawn by candidate";
    setLocal(LS_APPLICATIONS, all);
  }
}
