import mongoose, { Schema, Document } from "mongoose";

export type ApplicationStatus =
  | "APPLIED"
  | "VIEWED"
  | "SHORTLISTED"
  | "INTERVIEW_SCHEDULED"
  | "SELECTED"
  | "HIRED"
  | "REJECTED"
  | "WITHDRAWN";

export interface IJobApplication extends Document {
  _id: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  applicantId: mongoose.Types.ObjectId;
  employerId: mongoose.Types.ObjectId;
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
    date?: Date;
    time?: string;
    type?: "IN_PERSON" | "PHONE" | "VIDEO";
    venueOrLink?: string;
    contactPerson?: string;
    notes?: string;
  };
  employerNotes?: string;
  withdrawnAt?: Date;
  withdrawalReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const JobApplicationSchema = new Schema<IJobApplication>(
  {
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true, index: true },
    applicantId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    employerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    applicantProfileSnapshot: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String },
      city: { type: String },
      resumeUrl: { type: String },
      experience: { type: String },
      currentRole: { type: String },
      currentCompany: { type: String },
      currentSalary: { type: Number },
      expectedSalary: { type: Number },
      noticePeriod: { type: String },
    },
    screeningAnswers: [
      {
        question: { type: String },
        answer: { type: String },
      },
    ],
    status: {
      type: String,
      enum: [
        "APPLIED",
        "VIEWED",
        "SHORTLISTED",
        "INTERVIEW_SCHEDULED",
        "SELECTED",
        "HIRED",
        "REJECTED",
        "WITHDRAWN",
      ],
      default: "APPLIED",
      index: true,
    },
    interviewDetails: {
      date: { type: Date },
      time: { type: String },
      type: { type: String, enum: ["IN_PERSON", "PHONE", "VIDEO"] },
      venueOrLink: { type: String },
      contactPerson: { type: String },
      notes: { type: String },
    },
    employerNotes: { type: String },
    withdrawnAt: { type: Date },
    withdrawalReason: { type: String },
  },
  { timestamps: true }
);

JobApplicationSchema.index({ jobId: 1, applicantId: 1 }, { unique: true });
JobApplicationSchema.index({ applicantId: 1, status: 1 });
JobApplicationSchema.index({ employerId: 1, status: 1 });

export const JobApplication = mongoose.model<IJobApplication>("JobApplication", JobApplicationSchema);
