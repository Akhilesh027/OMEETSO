import mongoose, { Schema, Document } from "mongoose";

export type ActivityType =
  | "VISIT_OPENED"
  | "PAGE_VIEW"
  | "LISTING_VIEW"
  | "STORE_VISIT"
  | "SEARCH_PERFORMED"
  | "CONTACT_CALL_CLICKED"
  | "CONTACT_WHATSAPP_CLICKED"
  | "DEAL_OFFER_MADE"
  | "SHARE_CLICKED"
  | "USER_REGISTERED"
  | "USER_LOGGED_IN";

export interface IVisitorActivity extends Document {
  _id: mongoose.Types.ObjectId;
  visitorId: string;
  sessionId: string;
  userId?: mongoose.Types.ObjectId;
  userContact?: {
    name?: string;
    phone?: string;
    email?: string;
    city?: string;
    accountType?: string;
  };
  activityType: ActivityType;
  title: string;
  description: string;
  pageUrl: string;
  pagePath: string;
  pageTitle?: string;
  referrer?: string;
  metadata?: {
    listingId?: string;
    listingTitle?: string;
    listingPrice?: number;
    categoryId?: string;
    sellerId?: string;
    sellerPhone?: string;
    storeId?: string;
    storeName?: string;
    searchQuery?: string;
    searchRadiusKm?: number;
    offerAmount?: number;
    [key: string]: any;
  };
  location: {
    ip: string;
    city: string;
    area?: string;
    pincode?: string;
    state?: string;
    country: string;
    coordinates?: [number, number]; // [lng, lat]
    source: "gps" | "user_selected" | "ip_header" | "fallback";
  };
  device: {
    platform: "android_app" | "ios_app" | "mobile_web" | "desktop_web";
    browser: string;
    os: string;
    screenResolution?: string;
    networkType?: string;
    userAgent: string;
  };
  isLead: boolean;
  timeSpentSeconds?: number;
  createdAt: Date;
  updatedAt: Date;
}

const VisitorActivitySchema = new Schema<IVisitorActivity>(
  {
    visitorId: { type: String, required: true, index: true },
    sessionId: { type: String, required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    userContact: {
      name: { type: String },
      phone: { type: String, index: true },
      email: { type: String },
      city: { type: String },
      accountType: { type: String }
    },
    activityType: {
      type: String,
      required: true,
      index: true
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    pageUrl: { type: String, required: true },
    pagePath: { type: String, required: true, index: true },
    pageTitle: { type: String },
    referrer: { type: String },
    metadata: { type: Schema.Types.Mixed, default: {} },
    location: {
      ip: { type: String, default: "127.0.0.1" },
      city: { type: String, default: "Hyderabad", index: true },
      area: { type: String },
      pincode: { type: String },
      state: { type: String, default: "Telangana" },
      country: { type: String, default: "India" },
      coordinates: { type: [Number], default: [78.3871, 17.4486] },
      source: { type: String, enum: ["gps", "user_selected", "ip_header", "fallback"], default: "fallback" }
    },
    device: {
      platform: {
        type: String,
        enum: ["android_app", "ios_app", "mobile_web", "desktop_web"],
        default: "mobile_web"
      },
      browser: { type: String, default: "Chrome" },
      os: { type: String, default: "Android" },
      screenResolution: { type: String },
      networkType: { type: String },
      userAgent: { type: String, default: "" }
    },
    isLead: { type: Boolean, default: false, index: true },
    timeSpentSeconds: { type: Number, default: 0 }
  },
  {
    timestamps: true
  }
);

// High-speed compound indexes for live activity streaming and regional filtering
VisitorActivitySchema.index({ createdAt: -1 });
VisitorActivitySchema.index({ isLead: 1, createdAt: -1 });
VisitorActivitySchema.index({ "location.city": 1, createdAt: -1 });
VisitorActivitySchema.index({ activityType: 1, createdAt: -1 });
VisitorActivitySchema.index({ visitorId: 1, createdAt: -1 });

export const VisitorActivity = mongoose.model<IVisitorActivity>("VisitorActivity", VisitorActivitySchema);

