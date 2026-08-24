import mongoose, { Schema, Document } from "mongoose";

export interface IAdProduct extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  campaignType: "LISTING_BOOST" | "BANNER_AD";
  durationDays: number;
  priceInPaise: number;
  originalPriceInPaise?: number;
  badge?: string;
  features?: string[];
  estimatedReach?: string;
  priority?: number;
  permittedPlacements: string[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AdProductSchema = new Schema<IAdProduct>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    campaignType: { type: String, enum: ["LISTING_BOOST", "BANNER_AD"], required: true, index: true },
    durationDays: { type: Number, required: true },
    priceInPaise: { type: Number, required: true },
    originalPriceInPaise: { type: Number },
    badge: { type: String },
    features: [{ type: String }],
    estimatedReach: { type: String },
    priority: { type: Number, default: 0 },
    permittedPlacements: [{ type: String, required: true }],
    active: { type: Boolean, default: true, index: true }
  },
  { timestamps: true }
);

export const AdProduct = mongoose.model<IAdProduct>("AdProduct", AdProductSchema);
