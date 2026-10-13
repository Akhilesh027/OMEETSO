import mongoose, { Schema, Document } from "mongoose";
import { SafetyPriority } from "../../../contracts";

export interface ISafetyReport extends Document {
  _id: mongoose.Types.ObjectId;
  reporterId?: mongoose.Types.ObjectId;
  targetType: "USER" | "LISTING" | "STORE" | "MESSAGE" | "REVIEW" | "ADVERTISEMENT" | "GENERAL" | "OTHER";
  targetId: string;
  category: string; // e.g. "scam", "harassment", "fake_listing", etc.
  description: string;
  evidenceImages?: string[];
  attachments?: string[];
  priority: SafetyPriority;
  assignedAdminId?: mongoose.Types.ObjectId;
  assignedAdminName?: string;
  status: "OPEN" | "INVESTIGATING" | "RESOLVED" | "DISMISSED";
  resolutionNotes?: string;

  // Reporter details & contact preferences
  reporterName?: string;
  reporterEmail?: string;
  reporterPhone?: string;
  contactPref?: string;
  contactTimeSlot?: string;
  isAnonymous?: boolean;

  // Specific referenced entities
  relatedUser?: string;
  relatedListing?: string;
  relatedChat?: string;

  createdAt: Date;
  updatedAt: Date;
}

const SafetyReportSchema = new Schema<ISafetyReport>(
  {
    reporterId: { type: Schema.Types.ObjectId, ref: "User", required: false, index: true },
    targetType: {
      type: String,
      enum: ["USER", "LISTING", "STORE", "MESSAGE", "REVIEW", "ADVERTISEMENT", "GENERAL", "OTHER"],
      default: "GENERAL",
      index: true
    },
    targetId: { type: String, default: "N/A", index: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    evidenceImages: [{ type: String }],
    attachments: [{ type: String }],
    priority: { type: String, enum: Object.values(SafetyPriority), default: SafetyPriority.MEDIUM, index: true },
    assignedAdminId: { type: Schema.Types.ObjectId, ref: "AdminUser", index: true },
    assignedAdminName: { type: String },
    status: { type: String, enum: ["OPEN", "INVESTIGATING", "RESOLVED", "DISMISSED"], default: "OPEN", index: true },
    resolutionNotes: { type: String },
    reporterName: { type: String },
    reporterEmail: { type: String, index: true },
    reporterPhone: { type: String, index: true },
    contactPref: { type: String, default: "in_app" },
    contactTimeSlot: { type: String, default: "anytime" },
    isAnonymous: { type: Boolean, default: false },
    relatedUser: { type: String },
    relatedListing: { type: String },
    relatedChat: { type: String }
  },
  { timestamps: true }
);

SafetyReportSchema.index({ status: 1, priority: -1, createdAt: -1 });
SafetyReportSchema.index({ reporterEmail: 1, createdAt: -1 });

export const SafetyReport = mongoose.model<ISafetyReport>("SafetyReport", SafetyReportSchema);
