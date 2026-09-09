import mongoose, { Schema, Document } from "mongoose";

export interface ISkillItem {
  name: string;
  category?: string;
  proficiency?: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  yearsOfExperience?: string;
}

export interface IWorkExperienceItem {
  id?: string;
  companyName: string;
  jobTitle: string;
  employmentType?: string;
  startDate?: string;
  endDate?: string;
  isCurrentlyWorking?: boolean;
  location?: string;
  responsibilities?: string;
  achievements?: string;
}

export interface IEducationItem {
  id?: string;
  qualification: string;
  specialization?: string;
  college?: string;
  university?: string;
  courseType?: string;
  startYear?: string;
  completionYear?: string;
  percentageOrCgpa?: string;
}

export interface ICertificationItem {
  name: string;
  issuer?: string;
  issueDate?: string;
  credentialUrl?: string;
}

export interface IProjectItem {
  title: string;
  description?: string;
  link?: string;
  role?: string;
}

export interface ICandidateProfile extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  // Personal Info
  fullName?: string;
  title?: string;
  photoUrl?: string;
  phone?: string;
  email?: string;
  city?: string;
  area?: string;
  preferredLocations: string[];
  dob?: string;
  gender?: string;
  languages: string[];
  // Professional Summary
  summary?: string;
  experienceYears?: string;
  currentCompany?: string;
  currentRole?: string;
  currentSalary?: number;
  expectedSalary?: number;
  noticePeriod?: string;
  employmentStatus?: string;
  openToWork: boolean;
  // Structured arrays
  skillsList: ISkillItem[];
  skills: string[];
  workExperiences: IWorkExperienceItem[];
  educations: IEducationItem[];
  education?: string;
  // Job Preferences
  desiredRole?: string;
  preferredIndustry?: string;
  preferredJobTypes: string[];
  preferredWorkplaceModes: string[];
  willingToRelocate: boolean;
  preferredShift?: string;
  immediateJoining: boolean;
  // Additional Details
  certifications: ICertificationItem[];
  projects: IProjectItem[];
  internshipExperience?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  awards?: string;
  drivingLicence?: string;
  ownVehicle?: string;
  disabilityAccommodations?: string;
  // Resumes & Documents
  resumeUrl?: string;
  resumeFileName?: string;
  savedResumes: Array<{ id: string; name: string; url: string; uploadedAt?: Date }>;
  educationalDocs: Array<{ name: string; url: string }>;
  experienceCerts: Array<{ name: string; url: string }>;
  idVerificationStatus?: string;
  // Privacy
  visibilityMode: "ALL_VERIFIED" | "ONLY_AFTER_APPLY" | "PAUSED";
  hideCurrentEmployer: boolean;
  hidePhone: boolean;
  hideEmail: boolean;
  blockedRecruiters: string[];
  allowDirectContact: boolean;
  // Useful Features
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
  savedJobs: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const CandidateProfileSchema = new Schema<ICandidateProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    fullName: { type: String },
    title: { type: String, default: "Job Seeker" },
    photoUrl: { type: String },
    phone: { type: String },
    email: { type: String },
    city: { type: String, default: "Hyderabad" },
    area: { type: String },
    preferredLocations: [{ type: String }],
    dob: { type: String },
    gender: { type: String },
    languages: [{ type: String }],

    summary: { type: String },
    experienceYears: { type: String, default: "Fresher" },
    currentCompany: { type: String },
    currentRole: { type: String },
    currentSalary: { type: Number },
    expectedSalary: { type: Number },
    noticePeriod: { type: String, default: "Immediate" },
    employmentStatus: { type: String, default: "Employed" },
    openToWork: { type: Boolean, default: true, index: true },

    skillsList: [
      {
        name: { type: String },
        category: { type: String },
        proficiency: { type: String, enum: ["Beginner", "Intermediate", "Advanced", "Expert"], default: "Intermediate" },
        yearsOfExperience: { type: String }
      }
    ],
    skills: [{ type: String }],

    workExperiences: [
      {
        id: { type: String },
        companyName: { type: String },
        jobTitle: { type: String },
        employmentType: { type: String },
        startDate: { type: String },
        endDate: { type: String },
        isCurrentlyWorking: { type: Boolean, default: false },
        location: { type: String },
        responsibilities: { type: String },
        achievements: { type: String }
      }
    ],

    educations: [
      {
        id: { type: String },
        qualification: { type: String },
        specialization: { type: String },
        college: { type: String },
        university: { type: String },
        courseType: { type: String },
        startYear: { type: String },
        completionYear: { type: String },
        percentageOrCgpa: { type: String }
      }
    ],
    education: { type: String, default: "Graduate" },

    desiredRole: { type: String },
    preferredIndustry: { type: String },
    preferredJobTypes: [{ type: String }],
    preferredWorkplaceModes: [{ type: String }],
    willingToRelocate: { type: Boolean, default: false },
    preferredShift: { type: String, default: "Day Shift" },
    immediateJoining: { type: Boolean, default: true },

    certifications: [
      {
        name: { type: String },
        issuer: { type: String },
        issueDate: { type: String },
        credentialUrl: { type: String }
      }
    ],
    projects: [
      {
        title: { type: String },
        description: { type: String },
        link: { type: String },
        role: { type: String }
      }
    ],
    internshipExperience: { type: String },
    portfolioUrl: { type: String },
    linkedinUrl: { type: String },
    githubUrl: { type: String },
    awards: { type: String },
    drivingLicence: { type: String, default: "None" },
    ownVehicle: { type: String, default: "None" },
    disabilityAccommodations: { type: String },

    resumeUrl: { type: String },
    resumeFileName: { type: String },
    savedResumes: [
      {
        id: { type: String },
        name: { type: String },
        url: { type: String },
        uploadedAt: { type: Date, default: Date.now }
      }
    ],
    educationalDocs: [{ name: { type: String }, url: { type: String } }],
    experienceCerts: [{ name: { type: String }, url: { type: String } }],
    idVerificationStatus: { type: String, default: "Verified" },

    visibilityMode: {
      type: String,
      enum: ["ALL_VERIFIED", "ONLY_AFTER_APPLY", "PAUSED"],
      default: "ALL_VERIFIED"
    },
    hideCurrentEmployer: { type: Boolean, default: false },
    hidePhone: { type: Boolean, default: false },
    hideEmail: { type: Boolean, default: false },
    blockedRecruiters: [{ type: String }],
    allowDirectContact: { type: Boolean, default: true },

    profileViewsCount: { type: Number, default: 0 },
    verifiedCandidate: { type: Boolean, default: true },
    updateReminderEnabled: { type: Boolean, default: true },
    oneTapApplyEnabled: { type: Boolean, default: true },
    jobAlertsEnabled: { type: Boolean, default: true },
    jobAlertPreferences: {
      roles: [{ type: String }],
      cities: [{ type: String }],
      minSalary: { type: Number },
      frequency: { type: String, default: "DAILY" }
    },

    savedJobs: [{ type: Schema.Types.ObjectId, ref: "Job" }]
  },
  { timestamps: true }
);

export const CandidateProfile = mongoose.model<ICandidateProfile>("CandidateProfile", CandidateProfileSchema);

