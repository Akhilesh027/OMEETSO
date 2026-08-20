import mongoose, { Schema, Document } from "mongoose";

export interface IJobLocation {
  remoteScope?: "ANYWHERE_IN_INDIA" | "STATE_WIDE" | "CITY_WIDE";
  area: string;
  city: string;
  pincode: string;
  coordinates: [number, number]; // [lng, lat]
}

export interface IJobSalary {
  minSalary: number;
  maxSalary: number;
  salaryPeriod: "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "fixed_project" | "commission_based";
  salaryDisclosed: boolean;
  negotiable: boolean;
  incentivesAvailable: boolean;
}

export interface IWalkInDetails {
  isWalkIn: boolean;
  walkInDate?: Date;
  startTime?: string;
  endTime?: string;
  venue?: string;
  contactPerson?: string;
  instructions?: string;
}

export interface IJobListing extends Document {
  _id: mongoose.Types.ObjectId;
  employerId: mongoose.Types.ObjectId;
  storeId?: mongoose.Types.ObjectId;
  companyName: string;
  companyLogo?: string;
  companyIndustry?: string;
  companySize?: string;
  companyDescription?: string;
  isVerifiedEmployer: boolean;
  title: string;
  jobCategoryId: string;
  subcategoryId: string;
  openingsCount: number;
  jobType: "FULL_TIME" | "PART_TIME" | "INTERNSHIP" | "CONTRACT" | "FREELANCE" | "TEMPORARY";
  workplaceType: "OFFICE" | "WORK_FROM_HOME" | "HYBRID" | "FIELD_WORK";
  location: IJobLocation;
  salary: IJobSalary;
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
  walkInDetails?: IWalkInDetails;
  isUrgent: boolean;
  isFeatured: boolean;
  screeningQuestions: string[];
  status: "DRAFT" | "SUBMITTED" | "APPROVED" | "ACTIVE" | "PAUSED" | "FILLED" | "EXPIRED" | "REJECTED";
  rejectionReason?: string;
  viewsCount: number;
  applicationsCount: number;
  shortlistedCount: number;
  interviewsCount: number;
  hiredCount: number;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<IJobListing>(
  {
    employerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    storeId: { type: Schema.Types.ObjectId, ref: "Store", index: true },
    companyName: { type: String, required: true },
    companyLogo: { type: String },
    companyIndustry: { type: String, default: "General" },
    companySize: { type: String, default: "1-10 employees" },
    companyDescription: { type: String },
    isVerifiedEmployer: { type: Boolean, default: false },
    title: { type: String, required: true, index: true },
    jobCategoryId: { type: String, required: true, index: true },
    subcategoryId: { type: String, required: true, index: true },
    openingsCount: { type: Number, default: 1 },
    jobType: {
      type: String,
      enum: ["FULL_TIME", "PART_TIME", "INTERNSHIP", "CONTRACT", "FREELANCE", "TEMPORARY"],
      default: "FULL_TIME",
      index: true,
    },
    workplaceType: {
      type: String,
      enum: ["OFFICE", "WORK_FROM_HOME", "HYBRID", "FIELD_WORK"],
      default: "OFFICE",
      index: true,
    },
    location: {
      remoteScope: { type: String },
      area: { type: String, default: "Madhapur" },
      city: { type: String, default: "Hyderabad", index: true },
      pincode: { type: String, default: "500081" },
      coordinates: { type: [Number], default: [78.3871, 17.4486] },
    },
    salary: {
      minSalary: { type: Number, default: 0 },
      maxSalary: { type: Number, default: 0 },
      salaryPeriod: { type: String, default: "monthly" },
      salaryDisclosed: { type: Boolean, default: true },
      negotiable: { type: Boolean, default: false },
      incentivesAvailable: { type: Boolean, default: false },
    },
    candidateCriteria: {
      experience: { type: String, default: "Freshers Allowed" },
      fresherAllowed: { type: Boolean, default: true },
      minEducation: { type: String, default: "Graduate" },
      skills: [{ type: String }],
      languages: [{ type: String }],
    },
    jobDetails: {
      description: { type: String, required: true },
      responsibilities: { type: String },
      requirements: { type: String },
      benefits: { type: String },
      workingDays: { type: String, default: "5 Days (Mon-Fri)" },
      shiftType: { type: String, default: "Day Shift" },
      workingHours: { type: String, default: "9 AM - 6 PM" },
      workplacePhotos: [{ type: String }],
    },
    walkInDetails: {
      isWalkIn: { type: Boolean, default: false },
      walkInDate: { type: Date },
      startTime: { type: String },
      endTime: { type: String },
      venue: { type: String },
      contactPerson: { type: String },
      instructions: { type: String },
    },
    isUrgent: { type: Boolean, default: false, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    screeningQuestions: [{ type: String }],
    status: {
      type: String,
      enum: ["DRAFT", "SUBMITTED", "APPROVED", "ACTIVE", "PAUSED", "FILLED", "EXPIRED", "REJECTED"],
      default: "ACTIVE",
      index: true,
    },
    rejectionReason: { type: String },
    viewsCount: { type: Number, default: 0 },
    applicationsCount: { type: Number, default: 0 },
    shortlistedCount: { type: Number, default: 0 },
    interviewsCount: { type: Number, default: 0 },
    hiredCount: { type: Number, default: 0 },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  },
  { timestamps: true }
);

JobSchema.index({ status: 1, createdAt: -1 });
JobSchema.index({ "location.city": 1, status: 1 });
JobSchema.index({ "location.area": 1, status: 1 });
JobSchema.index({ title: "text", "jobDetails.description": 1 });

export const Job = mongoose.model<IJobListing>("Job", JobSchema);
