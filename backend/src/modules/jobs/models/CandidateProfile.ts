import mongoose, { Schema, Document } from "mongoose";

export interface ICandidateProfile extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title?: string;
  photoUrl?: string;
  city?: string;
  experienceYears?: string;
  currentCompany?: string;
  currentRole?: string;
  education?: string;
  skills: string[];
  languages: string[];
  resumeUrl?: string;
  expectedSalary?: number;
  noticePeriod?: string;
  preferredJobTypes: string[];
  preferredLocations: string[];
  allowDirectContact: boolean;
  savedJobs: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const CandidateProfileSchema = new Schema<ICandidateProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    title: { type: String, default: "Job Seeker" },
    photoUrl: { type: String },
    city: { type: String, default: "Hyderabad" },
    experienceYears: { type: String, default: "Fresher" },
    currentCompany: { type: String },
    currentRole: { type: String },
    education: { type: String, default: "Graduate" },
    skills: [{ type: String }],
    languages: [{ type: String }],
    resumeUrl: { type: String },
    expectedSalary: { type: Number },
    noticePeriod: { type: String, default: "15 Days" },
    preferredJobTypes: [{ type: String }],
    preferredLocations: [{ type: String }],
    allowDirectContact: { type: Boolean, default: true },
    savedJobs: [{ type: Schema.Types.ObjectId, ref: "Job" }],
  },
  { timestamps: true }
);

export const CandidateProfile = mongoose.model<ICandidateProfile>("CandidateProfile", CandidateProfileSchema);
