import mongoose, { Schema, Document } from "mongoose";

export interface IHomeBanner extends Document {
  _id: mongoose.Types.ObjectId;
  bannerId: string;
  type: "hero_showcase" | "hero_banner" | "category_strip" | "quick_deal";
  title: string;
  subtitle?: string;
  tag?: string; // e.g. "Hot Quick Deal", "Flagship Phone"
  price?: number;
  originalPrice?: number;
  image: string;
  sellerName?: string;
  initials?: string;
  location?: string;
  responseTime?: string;
  targetUrl?: string; // e.g. "/product/xyz" or "/results?q=iphone"
  listingId?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const HomeBannerSchema = new Schema<IHomeBanner>(
  {
    bannerId: { type: String, required: true, unique: true, index: true },
    type: {
      type: String,
      enum: ["hero_showcase", "hero_banner", "category_strip", "quick_deal"],
      default: "hero_showcase",
      index: true
    },
    title: { type: String, required: true },
    subtitle: { type: String },
    tag: { type: String, default: "Featured Deal" },
    price: { type: Number },
    originalPrice: { type: Number },
    image: { type: String, required: true },
    sellerName: { type: String, default: "Verified Seller" },
    initials: { type: String, default: "VS" },
    location: { type: String, default: "Madhapur, Hyderabad" },
    responseTime: { type: String, default: "Responds in < 5 mins" },
    targetUrl: { type: String },
    listingId: { type: String },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true }
  },
  { timestamps: true }
);

export const HomeBanner = mongoose.model<IHomeBanner>("HomeBanner", HomeBannerSchema);
