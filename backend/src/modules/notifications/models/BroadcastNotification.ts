import mongoose, { Schema, Document } from "mongoose";

export interface IBroadcastNotification extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  message: string;
  targetAudience: string;
  sentAt: Date;
  recipientsCount: number;
  status: "sent" | "scheduled" | "draft";
  createdAt: Date;
  updatedAt: Date;
}

const BroadcastNotificationSchema = new Schema<IBroadcastNotification>(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    targetAudience: { type: String, default: "All Registered Users" },
    sentAt: { type: Date, default: Date.now },
    recipientsCount: { type: Number, default: 0 },
    status: { type: String, enum: ["sent", "scheduled", "draft"], default: "sent" }
  },
  { timestamps: true }
);

BroadcastNotificationSchema.index({ sentAt: -1 });

export const BroadcastNotification = mongoose.model<IBroadcastNotification>(
  "BroadcastNotification",
  BroadcastNotificationSchema
);
