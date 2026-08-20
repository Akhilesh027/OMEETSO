import mongoose, { Schema, Document } from "mongoose";

export interface IServiceProviderProfile extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  businessName: string;
  tagline?: string;
  about?: string;
  categories: string[];
  experienceYears: number;
  serviceAreas: string[];
  city: string;
  primaryPincode: string;
  phone: string;
  whatsappPhone?: string;
  email?: string;
  idProofType?: "AADHAAR" | "PAN" | "DRIVING_LICENSE" | "GST_CERTIFICATE";
  idProofNumber?: string;
  isKycVerified: boolean;
  certifications?: string[];
  portfolioImages?: string[];
  emergencyAvailable: boolean;
  workingDays: string[];
  workingHours: string;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceProviderProfileSchema = new Schema<IServiceProviderProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    businessName: { type: String, required: true },
    tagline: { type: String },
    about: { type: String },
    categories: [{ type: String }],
    experienceYears: { type: Number, default: 2 },
    serviceAreas: [{ type: String }],
    city: { type: String, default: "Hyderabad" },
    primaryPincode: { type: String, default: "500081" },
    phone: { type: String, required: true },
    whatsappPhone: { type: String },
    email: { type: String },
    idProofType: {
      type: String,
      enum: ["AADHAAR", "PAN", "DRIVING_LICENSE", "GST_CERTIFICATE"],
    },
    idProofNumber: { type: String },
    isKycVerified: { type: Boolean, default: false },
    certifications: [{ type: String }],
    portfolioImages: [{ type: String }],
    emergencyAvailable: { type: Boolean, default: false },
    workingDays: {
      type: [String],
      default: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    },
    workingHours: { type: String, default: "09:00 AM - 08:00 PM" },
  },
  { timestamps: true }
);

export const ServiceProviderProfile =
  mongoose.models.ServiceProviderProfile ||
  mongoose.model<IServiceProviderProfile>("ServiceProviderProfile", ServiceProviderProfileSchema);
