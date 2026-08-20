import mongoose, { Schema, Document } from "mongoose";

export interface IServiceInquiry extends Document {
  _id: mongoose.Types.ObjectId;
  serviceId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  providerId: mongoose.Types.ObjectId;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress?: {
    street?: string;
    area: string;
    city: string;
    pincode: string;
  };
  preferredDate: Date;
  preferredTimeSlot: string; // e.g. "Morning (09:00 AM - 12:00 PM)", "Afternoon", "Evening"
  serviceMode: "DOORSTEP" | "AT_CENTER" | "ONLINE";
  problemDescription: string;
  problemPhotos?: string[];
  status: "PENDING" | "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "REJECTED";
  quotationAmount?: number;
  providerNotes?: string;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceInquirySchema = new Schema<IServiceInquiry>(
  {
    serviceId: { type: Schema.Types.ObjectId, ref: "Service", required: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    providerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    customerEmail: { type: String },
    customerAddress: {
      street: { type: String },
      area: { type: String, default: "Hyderabad" },
      city: { type: String, default: "Hyderabad" },
      pincode: { type: String, default: "500081" },
    },
    preferredDate: { type: Date, default: Date.now },
    preferredTimeSlot: { type: String, default: "Morning (09:00 AM - 12:00 PM)" },
    serviceMode: {
      type: String,
      enum: ["DOORSTEP", "AT_CENTER", "ONLINE"],
      default: "DOORSTEP",
    },
    problemDescription: { type: String, required: true },
    problemPhotos: [{ type: String }],
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "REJECTED"],
      default: "PENDING",
      index: true,
    },
    quotationAmount: { type: Number },
    providerNotes: { type: String },
    cancellationReason: { type: String },
  },
  { timestamps: true }
);

export const ServiceInquiry =
  mongoose.models.ServiceInquiry || mongoose.model<IServiceInquiry>("ServiceInquiry", ServiceInquirySchema);
