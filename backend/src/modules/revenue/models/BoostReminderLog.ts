import mongoose, { Schema, Document } from "mongoose";

export interface IBoostReminderLog extends Document {
  _id: mongoose.Types.ObjectId;
  listingId: mongoose.Types.ObjectId;
  sellerId: mongoose.Types.ObjectId;
  sellerPhone?: string;
  sellerEmail?: string;
  listingTitle: string;
  listingCity: string;
  viewsCountAtDispatch: number;
  listingAgeDays: number;
  channel: "push_notification" | "sms" | "email";
  status: "SENT" | "CLICKED" | "CONVERTED_PAID" | "DISMISSED";
  campaignId?: mongoose.Types.ObjectId;
  revenueGeneratedInPaise?: number;
  sentAt: Date;
  convertedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BoostReminderLogSchema = new Schema<IBoostReminderLog>(
  {
    listingId: { type: Schema.Types.ObjectId, ref: "Listing", required: true, index: true },
    sellerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    sellerPhone: { type: String, index: true },
    sellerEmail: { type: String },
    listingTitle: { type: String, required: true },
    listingCity: { type: String, required: true, default: "Hyderabad" },
    viewsCountAtDispatch: { type: Number, default: 0 },
    listingAgeDays: { type: Number, default: 3 },
    channel: {
      type: String,
      enum: ["push_notification", "sms", "email"],
      default: "push_notification"
    },
    status: {
      type: String,
      enum: ["SENT", "CLICKED", "CONVERTED_PAID", "DISMISSED"],
      default: "SENT",
      index: true
    },
    campaignId: { type: Schema.Types.ObjectId, ref: "AdCampaign" },
    revenueGeneratedInPaise: { type: Number, default: 0 },
    sentAt: { type: Date, default: Date.now, index: true },
    convertedAt: { type: Date }
  },
  { timestamps: true }
);

BoostReminderLogSchema.index({ sellerId: 1, sentAt: -1 });
BoostReminderLogSchema.index({ status: 1, sentAt: -1 });

export const BoostReminderLog = mongoose.model<IBoostReminderLog>("BoostReminderLog", BoostReminderLogSchema);

