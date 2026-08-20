import mongoose, { Schema, Document } from "mongoose";

export interface IServiceLocation {
  area: string;
  city: string;
  pincode: string;
  serviceRadiusKm?: number;
  servesAreas?: string[];
  coordinates?: [number, number]; // [lng, lat]
}

export interface IServicePricing {
  priceType: "FIXED" | "STARTING_AT" | "PER_HOUR" | "VISITATION_FEE" | "REQUEST_QUOTE";
  amount: number;
  discountPrice?: number;
  priceUnit: "per service" | "per hour" | "per visit" | "per sqft" | "per day" | "fixed";
  isNegotiable: boolean;
}

export interface IServiceListing extends Document {
  _id: mongoose.Types.ObjectId;
  providerId: mongoose.Types.ObjectId;
  storeId?: mongoose.Types.ObjectId;
  businessName: string;
  providerName: string;
  avatar?: string;
  phone?: string;
  email?: string;
  isVerifiedProvider: boolean;
  providerBadge?: string;
  title: string;
  serviceCategoryId: string;
  subcategoryId: string;
  serviceType: "DOORSTEP" | "AT_CENTER" | "ONLINE" | "HYBRID";
  pricing: IServicePricing;
  location: IServiceLocation;
  serviceDetails: {
    description: string;
    inclusions: string[];
    exclusions: string[];
    images: string[];
    experienceYears: number;
    guaranteedResponseTime: string; // e.g. "Within 1 Hour", "Same Day", "24 Hours"
    warranty: string; // e.g. "30 Days Service Guarantee", "90 Days Warranty"
  };
  availability: {
    workingDays: string[];
    workingHours: string;
    emergencyServiceAvailable: boolean;
  };
  status: "DRAFT" | "PENDING_APPROVAL" | "ACTIVE" | "PAUSED" | "REJECTED";
  rejectionReason?: string;
  isFeatured: boolean;
  isEmergency: boolean;
  stats: {
    viewsCount: number;
    inquiriesCount: number;
    bookingsCount: number;
    rating: number;
    reviewsCount: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema = new Schema<IServiceListing>(
  {
    providerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    storeId: { type: Schema.Types.ObjectId, ref: "Store", index: true },
    businessName: { type: String, required: true },
    providerName: { type: String, required: true },
    avatar: { type: String },
    phone: { type: String },
    email: { type: String },
    isVerifiedProvider: { type: Boolean, default: false },
    providerBadge: { type: String, default: "Verified Pro" },
    title: { type: String, required: true, index: true },
    serviceCategoryId: { type: String, required: true, index: true },
    subcategoryId: { type: String, required: true, index: true },
    serviceType: {
      type: String,
      enum: ["DOORSTEP", "AT_CENTER", "ONLINE", "HYBRID"],
      default: "DOORSTEP",
      index: true,
    },
    pricing: {
      priceType: {
        type: String,
        enum: ["FIXED", "STARTING_AT", "PER_HOUR", "VISITATION_FEE", "REQUEST_QUOTE"],
        default: "STARTING_AT",
      },
      amount: { type: Number, required: true, min: 0 },
      discountPrice: { type: Number, min: 0 },
      priceUnit: {
        type: String,
        enum: ["per service", "per hour", "per visit", "per sqft", "per day", "fixed"],
        default: "per service",
      },
      isNegotiable: { type: Boolean, default: false },
    },
    location: {
      area: { type: String, required: true },
      city: { type: String, required: true, index: true },
      pincode: { type: String, required: true },
      serviceRadiusKm: { type: Number, default: 15 },
      servesAreas: [{ type: String }],
      coordinates: { type: [Number], default: [78.4867, 17.385] },
    },
    serviceDetails: {
      description: { type: String, required: true },
      inclusions: [{ type: String }],
      exclusions: [{ type: String }],
      images: [{ type: String }],
      experienceYears: { type: Number, default: 3 },
      guaranteedResponseTime: { type: String, default: "Within 2 Hours" },
      warranty: { type: String, default: "30 Days Service Guarantee" },
    },
    availability: {
      workingDays: {
        type: [String],
        default: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      },
      workingHours: { type: String, default: "09:00 AM - 08:00 PM" },
      emergencyServiceAvailable: { type: Boolean, default: false },
    },
    status: {
      type: String,
      enum: ["DRAFT", "PENDING_APPROVAL", "ACTIVE", "PAUSED", "REJECTED"],
      default: "ACTIVE",
      index: true,
    },
    rejectionReason: { type: String },
    isFeatured: { type: Boolean, default: false, index: true },
    isEmergency: { type: Boolean, default: false, index: true },
    stats: {
      viewsCount: { type: Number, default: 0 },
      inquiriesCount: { type: Number, default: 0 },
      bookingsCount: { type: Number, default: 0 },
      rating: { type: Number, default: 4.8 },
      reviewsCount: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

ServiceSchema.index({ title: "text", "serviceDetails.description": "text", "location.area": "text", "location.city": "text" });

export const Service = mongoose.models.Service || mongoose.model<IServiceListing>("Service", ServiceSchema);
