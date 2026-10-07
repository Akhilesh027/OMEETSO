import mongoose, { Schema, Document } from "mongoose";

export interface IGlobalAdSetting extends Document {
  googleAdsEnabled: boolean;
  googleClientId: string;
  googleTestMode: boolean;
  updatedAt: Date;
}

const GlobalAdSettingSchema = new Schema<IGlobalAdSetting>(
  {
    googleAdsEnabled: { type: Boolean, default: true },
    googleClientId: { type: String, default: "ca-pub-9364802349808108" },
    googleTestMode: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const GlobalAdSetting = mongoose.model<IGlobalAdSetting>(
  "GlobalAdSetting",
  GlobalAdSettingSchema
);
