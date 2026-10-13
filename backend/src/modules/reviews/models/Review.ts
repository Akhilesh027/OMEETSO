import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
  _id: mongoose.Types.ObjectId;
  buyerId: mongoose.Types.ObjectId;
  buyerName: string;
  buyerAvatar?: string;
  targetId: string;
  targetName?: string;
  targetType: "SELLER" | "STORE";
  listingId?: string;
  listingTitle?: string;
  rating: number;
  comment: string;
  tags: string[];
  status: "APPROVED" | "PENDING" | "REJECTED";
  isReported?: boolean;
  reportReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    buyerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    buyerName: { type: String, required: true },
    buyerAvatar: { type: String },
    targetId: { type: String, required: true, index: true },
    targetName: { type: String },
    targetType: { type: String, enum: ["SELLER", "STORE"], required: true, index: true },
    listingId: { type: String },
    listingTitle: { type: String },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    tags: [{ type: String }],
    status: { type: String, enum: ["APPROVED", "PENDING", "REJECTED"], default: "APPROVED", index: true },
    isReported: { type: Boolean, default: false },
    reportReason: { type: String }
  },
  { timestamps: true }
);

export const Review = mongoose.model<IReview>("Review", ReviewSchema);
