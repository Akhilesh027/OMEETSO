import mongoose, { Schema, Document } from "mongoose";
import { SupportPriority, SupportStatus } from "../../../contracts";

export interface ISupportTicket extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  ticketNumber: string;
  subject: string;
  category: string;
  subcategory?: string;
  description: string;
  priority: SupportPriority;
  status: SupportStatus;
  contactMethod?: "in_app" | "email" | "call";
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  relatedListing?: string;
  relatedStore?: string;
  relatedCampaign?: string;
  relatedPayment?: string;
  resolutionNotes?: string;
  assignedAdminId?: mongoose.Types.ObjectId;
  assignedAdminName?: string;
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SupportTicketSchema = new Schema<ISupportTicket>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: false, index: true },
    contactName: { type: String },
    contactEmail: { type: String },
    contactPhone: { type: String },
    ticketNumber: { type: String, required: true, unique: true, index: true },
    subject: { type: String, required: true },
    category: { type: String, required: true, index: true },
    subcategory: { type: String },
    description: { type: String, default: "" },
    priority: {
      type: String,
      enum: [...Object.values(SupportPriority), "low", "medium", "high", "urgent", "critical"],
      default: SupportPriority.MEDIUM,
      index: true
    },
    status: {
      type: String,
      enum: [
        ...Object.values(SupportStatus),
        "open",
        "assigned",
        "in_progress",
        "waiting_user",
        "waiting_on_user",
        "escalated",
        "resolved",
        "closed",
        "reopened"
      ],
      default: SupportStatus.OPEN,
      index: true
    },
    contactMethod: { type: String, enum: ["in_app", "email", "call"], default: "in_app" },
    relatedListing: { type: String },
    relatedStore: { type: String },
    relatedCampaign: { type: String },
    relatedPayment: { type: String },
    resolutionNotes: { type: String },
    assignedAdminId: { type: Schema.Types.ObjectId, ref: "AdminUser", index: true },
    assignedAdminName: { type: String },
    lastMessageAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

SupportTicketSchema.index({ status: 1, updatedAt: -1 });
SupportTicketSchema.index({ userId: 1, createdAt: -1 });

export const SupportTicket = mongoose.model<ISupportTicket>("SupportTicket", SupportTicketSchema);
