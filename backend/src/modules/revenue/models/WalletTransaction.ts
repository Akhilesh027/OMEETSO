import mongoose, { Schema, Document } from "mongoose";

export interface IWalletTransaction extends Document {
  _id: mongoose.Types.ObjectId;
  walletId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  type: string;
  amountInPaise: number;
  description: string;
  referenceType?: string;
  referenceId?: string;
  idempotencyKey?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const WalletTransactionSchema = new Schema<IWalletTransaction>(
  {
    walletId: { type: Schema.Types.ObjectId, ref: "Wallet", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    type: { type: String, required: true },
    amountInPaise: { type: Number, required: true },
    description: { type: String, required: true },
    referenceType: { type: String, default: "TOPUP" },
    referenceId: { type: String },
    idempotencyKey: { type: String, sparse: true, index: true },
    status: { type: String, default: "SUCCESS", index: true }
  },
  { timestamps: true }
);

WalletTransactionSchema.index({ walletId: 1, createdAt: -1 });

export const WalletTransaction = mongoose.model<IWalletTransaction>("WalletTransaction", WalletTransactionSchema);
