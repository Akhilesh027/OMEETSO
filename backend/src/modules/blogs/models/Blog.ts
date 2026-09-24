import mongoose, { Schema, Document } from "mongoose";

export type BlogStatus = "DRAFT" | "PUBLISHED" | "SCHEDULED" | "ARCHIVED";

export interface IBlog extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  category: string;
  tags: string[];
  author: {
    name: string;
    avatar?: string;
    role?: string;
    bio?: string;
    userId?: mongoose.Types.ObjectId;
  };
  readTime: string;
  status: BlogStatus;
  isFeatured: boolean;
  viewsCount: number;
  likesCount: number;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
  scheduledAt?: Date;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    excerpt: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    coverImage: { type: String },
    category: { type: String, required: true, index: true, default: "General" },
    tags: [{ type: String, trim: true }],
    author: {
      name: { type: String, required: true, default: "Omeetso Editorial Team" },
      avatar: { type: String },
      role: { type: String, default: "Marketplace Specialist" },
      bio: { type: String },
      userId: { type: Schema.Types.ObjectId, ref: "User" }
    },
    readTime: { type: String, default: "3 min read" },
    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED", "SCHEDULED", "ARCHIVED"],
      default: "DRAFT",
      index: true
    },
    isFeatured: { type: Boolean, default: false, index: true },
    viewsCount: { type: Number, default: 0 },
    likesCount: { type: Number, default: 0 },
    seo: {
      metaTitle: { type: String },
      metaDescription: { type: String },
      keywords: [{ type: String }]
    },
    scheduledAt: { type: Date, index: true },
    publishedAt: { type: Date }
  },
  {
    timestamps: true
  }
);

BlogSchema.index({ status: 1, createdAt: -1 });
BlogSchema.index({ status: 1, category: 1 });
BlogSchema.index({ title: "text", excerpt: "text", tags: "text" });

export const Blog = mongoose.model<IBlog>("Blog", BlogSchema);
