import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
  _id: mongoose.Types.ObjectId;
  buyerId: mongoose.Types.ObjectId;
  buyerName: string;
  buyerAvatar?: string;
  targetId: string;
  targetType: "SELLER" | "STORE";
  listingId?: string;
  rating: number;
  comment: string;
  tags: string[];
  status: "APPROVED" | "PENDING" | "REJECTED";
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    buyerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    buyerName: { type: String, required: true },
    buyerAvatar: { type: String },
    targetId: { type: String, required: true, index: true },
    targetType: { type: String, enum: ["SELLER", "STORE"], required: true, index: true },
    listingId: { type: String },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    tags: [{ type: String }],
    status: { type: String, enum: ["APPROVED", "PENDING", "REJECTED"], default: "APPROVED", index: true }
  },
  { timestamps: true }
);

export const Review = mongoose.model<IReview>("Review", ReviewSchema);
