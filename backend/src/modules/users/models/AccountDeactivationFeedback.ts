import mongoose, { Schema, Document } from "mongoose";

export interface IAccountDeactivationFeedback extends Document {
  userId: mongoose.Types.ObjectId;
  userName: string;
  phone: string;
  email?: string;
  reason: string;
  customFeedback?: string;
  actionType: "DEACTIVATE" | "DELETE";
  createdAt: Date;
  updatedAt: Date;
}

const AccountDeactivationFeedbackSchema = new Schema<IAccountDeactivationFeedback>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    userName: { type: String, default: "Omeetso User" },
    phone: { type: String, default: "" },
    email: { type: String },
    reason: { type: String, required: true },
    customFeedback: { type: String, default: "" },
    actionType: { type: String, enum: ["DEACTIVATE", "DELETE"], default: "DEACTIVATE", index: true }
  },
  { timestamps: true }
);

AccountDeactivationFeedbackSchema.index({ createdAt: -1 });

export const AccountDeactivationFeedback = mongoose.model<IAccountDeactivationFeedback>(
  "AccountDeactivationFeedback",
  AccountDeactivationFeedbackSchema
);
