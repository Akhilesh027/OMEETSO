import mongoose, { Schema, Document } from "mongoose";

export interface IEmailOtpChallenge extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  codeHash: string;
  attempts: number;
  resendCount: number;
  expiresAt: Date;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EmailOtpChallengeSchema = new Schema<IEmailOtpChallenge>(
  {
    email: { type: String, required: true, index: true, lowercase: true, trim: true },
    codeHash: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    resendCount: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
    isVerified: { type: Boolean, default: false }
  },
  { timestamps: true }
);

EmailOtpChallengeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
EmailOtpChallengeSchema.index({ email: 1, createdAt: -1 });

export const EmailOtpChallenge = mongoose.model<IEmailOtpChallenge>("EmailOtpChallenge", EmailOtpChallengeSchema);
