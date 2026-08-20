import mongoose, { Schema, Document } from "mongoose";

export interface IServiceCategory extends Document {
  _id: mongoose.Types.ObjectId;
  categoryId: string; // e.g. "home_services", "appliance_repair", "beauty_wellness"
  name: string;
  icon: string;
  description?: string;
  subcategories: {
    id: string;
    name: string;
    icon?: string;
    description?: string;
    popularServices?: string[];
  }[];
  displayOrder: number;
  isActive: boolean;
}

const ServiceCategorySchema = new Schema<IServiceCategory>(
  {
    categoryId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    icon: { type: String, default: "Wrench" },
    description: { type: String },
    subcategories: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        icon: { type: String },
        description: { type: String },
        popularServices: [{ type: String }],
      },
    ],
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const ServiceCategory =
  mongoose.models.ServiceCategory || mongoose.model<IServiceCategory>("ServiceCategory", ServiceCategorySchema);
