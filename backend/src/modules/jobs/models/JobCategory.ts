import mongoose, { Schema, Document } from "mongoose";

export interface IJobCategory extends Document {
  id: string;
  name: string;
  icon: string;
  order: number;
  isActive: boolean;
  isFeatured: boolean;
  subcategories: string[];
}

const JobCategorySchema = new Schema<IJobCategory>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    icon: { type: String, default: "Briefcase" },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    subcategories: [{ type: String }],
  },
  { timestamps: true }
);

export const JobCategory = mongoose.model<IJobCategory>("JobCategory", JobCategorySchema);
