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

// Initial Mock Jobs
export const SEED_JOBS: JobItem[] = [
  {
    id: "JOB-REACT-SR1",
    employerId: "emp_abc",
    companyName: "ABC Technologies",
    companyLogo: "https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=200",
    companyIndustry: "Software & IT",
    companySize: "50-200 employees",
    companyDescription: "Leading web & mobile development company in Madhapur.",
    isVerifiedEmployer: true,
    title: "Senior React & Frontend Developer",
    jobCategoryId: "it_software",
    subcategoryId: "Frontend Developer",
    openingsCount: 3,
    jobType: "FULL_TIME",
    workplaceType: "HYBRID",
    location: { area: "Madhapur", city: "Hyderabad", pincode: "500081" },
    salary: { minSalary: 45000, maxSalary: 75000, salaryPeriod: "monthly", salaryDisclosed: true, negotiable: true, incentivesAvailable: true },
    candidateCriteria: {
      experience: "3-5 Years",
      fresherAllowed: false,
      minEducation: "Graduate (B.Tech / MCA)",
      skills: ["React.js", "TypeScript", "TailwindCSS", "REST APIs"],
      languages: ["English", "Telugu", "Hindi"]
    },
    jobDetails: {
      description: "We are hiring a skilled Senior Frontend Developer to build high-performance web applications.",
      responsibilities: "• Build reusable UI components\n• Optimize web performance\n• Collaborate with backend engineers",
      requirements: "• 3+ years experience with React & TypeScript\n• Strong grasp of state management & web performance",
      benefits: "• Health Insurance\n• Flexible Hours\n• Performance Bonus",
      workingDays: "5 Days (Mon-Fri)",
      shiftType: "Day Shift",
      workingHours: "9:30 AM - 6:30 PM"
    },
    isUrgent: true,
    isFeatured: true,
    screeningQuestions: ["How many years of commercial React experience do you have?", "What is your notice period?"],
    status: "ACTIVE",
    viewsCount: 142,
    applicationsCount: 18,
    createdAt: Date.now() - 3600000 * 24 * 2
  },
  {
    id: "JOB-WALKIN-SALES1",
    employerId: "emp_store_miyapur",
    storeId: "store_123",
    companyName: "Venkata Retail Mart",
    companyLogo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
    companyIndustry: "Retail & Supermarkets",
    companySize: "10-50 employees",
    companyDescription: "Chain of retail stores across Hyderabad.",
    isVerifiedEmployer: true,
    title: "Retail Sales Executive (Walk-In Drive)",
    jobCategoryId: "sales_marketing",
    subcategoryId: "Retail Sales",
    openingsCount: 5,
    jobType: "FULL_TIME",
    workplaceType: "OFFICE",
    location: { area: "Kukatpally", city: "Hyderabad", pincode: "500072" },
    salary: { minSalary: 18000, maxSalary: 25000, salaryPeriod: "monthly", salaryDisclosed: true, incentivesAvailable: true },
    candidateCriteria: {
      experience: "Freshers Allowed",
      fresherAllowed: true,
      minEducation: "10th / 12th Pass",
      skills: ["Customer Assistance", "Billing", "Communication"],
      languages: ["Telugu", "Hindi"]
    },
    jobDetails: {
      description: "Direct walk-in recruitment for retail sales executives. Freshers welcome!",
      benefits: "• Sales Incentives\n• Staff Discount\n• ESIC & PF",
      workingDays: "6 Days (Rotational Off)",
      shiftType: "Day Shift"
    },
    walkInDetails: {
      isWalkIn: true,
      walkInDate: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
      startTime: "10:00 AM",
      endTime: "4:00 PM",
      venue: "Venkata Retail Mart, Opposite Metro Pillar 712, Kukatpally, Hyderabad",
      contactPerson: "Ramesh (HR Manager)",
      instructions: "Carry 2 copies of resume and Aadhaar card."
    },
    isUrgent: true,
    isFeatured: false,
    status: "ACTIVE",
    viewsCount: 210,
    applicationsCount: 32,
    createdAt: Date.now() - 3600000 * 12
  },
  {
    id: "JOB-REMOTE-SEO1",
    employerId: "emp_digital_hub",
    companyName: "Digital Growth Hub",
    companyLogo: "https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=200",
    companyIndustry: "Digital Agency",
    companySize: "10-20 employees",
    companyDescription: "Full-service digital growth and SEO marketing agency.",
    isVerifiedEmployer: true,
    title: "SEO & Content Marketing Specialist",
    jobCategoryId: "digital_marketing",
    subcategoryId: "SEO Specialist",
    openingsCount: 2,
    jobType: "FULL_TIME",
    workplaceType: "WORK_FROM_HOME",
    location: { remoteScope: "Anywhere in India", area: "Remote", city: "Hyderabad", pincode: "500081" },
    salary: { minSalary: 30000, maxSalary: 50000, salaryPeriod: "monthly", salaryDisclosed: true },
    candidateCriteria: {
      experience: "2-3 Years",
      fresherAllowed: false,
      minEducation: "Graduate",
      skills: ["SEO", "Google Analytics", "Ahrefs", "Keyword Research"],
      languages: ["English"]
    },
    jobDetails: {
      description: "100% Remote position for an experienced SEO specialist to manage client organic search rankings.",
      benefits: "• 100% Work from Home\n• Internet Allowance\n• Quarterly Bonus"
    },
    isUrgent: false,
    isFeatured: true,
    status: "ACTIVE",
    viewsCount: 310,
    applicationsCount: 45,
    createdAt: Date.now() - 3600000 * 24 * 5
  }
];

export async function fetchPublicJobs(params?: Record<string, string>): Promise<JobItem[]> {
  try {
    const qStr = new URLSearchParams(params).toString();
    const res = await fetch(`http://localhost:3000/api/v1/jobs?${qStr}`);
    const json = await res.json();
    if (json.success && Array.isArray(json.data) && json.data.length > 0) {
      setLocal(LS_JOBS, json.data);
      return json.data;
    }
  } catch { /* ignore offline */ }

  const cached = getLocal<JobItem[]>(LS_JOBS, SEED_JOBS);
  let list = cached.length > 0 ? cached : SEED_JOBS;

  if (params?.q) {
    const q = params.q.toLowerCase();
    list = list.filter(j => j.title.toLowerCase().includes(q) || j.companyName.toLowerCase().includes(q) || j.candidateCriteria.skills.some(s => s.toLowerCase().includes(q)));
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
    const res = await fetch(`http://localhost:3000/api/v1/jobs/${id}`);
    const json = await res.json();
    if (json.success && json.data) {
      return json.data;
    }
  } catch { /* ignore offline */ }

  const all = getLocal<JobItem[]>(LS_JOBS, SEED_JOBS);
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
