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
    const res = await fetch(`${API_BASE}/jobs?${qStr}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const approvedOnly = json.data.filter((j: any) => {
          const st = (j.status || "").toUpperCase();
          return st === "APPROVED" || st === "ACTIVE";
        });
        return approvedOnly;
      }
    }
  } catch { /* ignore offline */ }

  const cached = getLocal<JobItem[]>(LS_JOBS, []);
  let list = Array.isArray(cached)
    ? cached.filter(j => {
      const st = (j.status || "").toUpperCase();
      return st === "APPROVED" || st === "ACTIVE";
    })
    : [];

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
    const res = await fetch(`${API_BASE}/jobs/${id}`);
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
  const targetJobId = app.jobId || app.job?.id || (app.job as any)?._id || "";
  const newApp: JobApplicationItem = {
    id: app.id || `APP-${Date.now()}`,
    jobId: targetJobId,
    applicantId: app.applicantId || "me",
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
  try {
    const authToken = token || (typeof window !== "undefined" ? localStorage.getItem("omeetso_user_token") : null);
    const authHeaders: Record<string, string> = authToken ? { Authorization: `Bearer ${authToken}` } : {};
    const res = await fetch(`${API_BASE}/jobs/employer/my-jobs`, {
      headers: authHeaders
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        return json.data;
      }
    }
  } catch { /* offline fallback */ }

  const cached = getLocal<JobItem[]>(LS_JOBS, []);
  if (!userId || userId === "me") {
    return cached.filter(j => j.employerId === "me" || j.employerId === userId);
  }
  return cached.filter(j => j.employerId === userId || j.employerId === "me");
}

export async function fetchEmployerJobApplicants(jobId: string, token?: string | null, jobTitle?: string): Promise<JobApplicationItem[]> {
  let serverApps: JobApplicationItem[] = [];
  try {
    const authToken = token || (typeof window !== "undefined" ? localStorage.getItem("omeetso_user_token") : null);
    const authHeaders: Record<string, string> = authToken ? { Authorization: `Bearer ${authToken}` } : {};
    const res = await fetch(`${API_BASE}/jobs/${jobId}/applicants`, {
      headers: authHeaders
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        serverApps = json.data.map((item: any) => ({
          ...item,
          id: item.id || item._id?.toString() || item._id
        }));
      }
    }
  } catch { /* offline fallback */ }

  const localApps = getLocal<JobApplicationItem[]>(LS_APPLICATIONS, []);
  const matchingLocal = localApps.filter(a => {
    const aId = String(a.jobId || a.job?.id || (a.job as any)?._id || "");
    const targetId = String(jobId || "");
    if (aId && targetId && aId === targetId) return true;
    if (jobTitle && a.job?.title && a.job.title.toLowerCase().trim() === jobTitle.toLowerCase().trim()) return true;
    return false;
  });

  const candidateProfile = getLocal<CandidateProfileItem | null>(LS_CANDIDATE, null);

  const seenMap = new Map<string, JobApplicationItem>();

  // 1. Process server apps first
  for (const app of serverApps) {
    const dedupeKey = app.id || `${app.jobId}_${app.applicantId || app.applicantProfileSnapshot?.phone || app.applicantProfileSnapshot?.name}`;
    
    // Look for matching local app to enrich missing resumeUrl or snapshot details
    const localMatch = matchingLocal.find(l => {
      if (l.id && app.id && l.id === app.id) return true;
      if (l.applicantProfileSnapshot?.phone && app.applicantProfileSnapshot?.phone && l.applicantProfileSnapshot.phone === app.applicantProfileSnapshot.phone) return true;
      if (l.applicantProfileSnapshot?.email && app.applicantProfileSnapshot?.email && l.applicantProfileSnapshot.email === app.applicantProfileSnapshot.email) return true;
      if (l.applicantProfileSnapshot?.name && app.applicantProfileSnapshot?.name && l.applicantProfileSnapshot.name.toLowerCase() === app.applicantProfileSnapshot.name.toLowerCase()) return true;
      return false;
    });

    const mergedSnapshot = {
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
      applicantProfileSnapshot: mergedSnapshot as any
    };

    seenMap.set(dedupeKey, enrichedApp);
  }

  // 2. Merge local apps that are not yet on server
  for (const localApp of matchingLocal) {
    const dedupeKey = localApp.id || `${localApp.jobId}_${localApp.applicantId || localApp.applicantProfileSnapshot?.phone || localApp.applicantProfileSnapshot?.name}`;
    if (!seenMap.has(dedupeKey)) {
      const mergedSnapshot = {
        ...(localApp.applicantProfileSnapshot || {}),
        resumeUrl: localApp.applicantProfileSnapshot?.resumeUrl || (candidateProfile?.resumeUrl ? candidateProfile.resumeUrl : undefined),
        resumeFileName: localApp.applicantProfileSnapshot?.resumeFileName || (candidateProfile?.resumeFileName ? candidateProfile.resumeFileName : undefined),
      };
      seenMap.set(dedupeKey, { ...localApp, applicantProfileSnapshot: mergedSnapshot as any });
    }
  }

  return Array.from(seenMap.values());
}

