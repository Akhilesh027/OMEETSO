import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { Blog } from "../models/Blog";

export async function getPublicBlogs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 12));
    const skip = (page - 1) * limit;

    const { category, tag, q } = req.query;

    const query: Record<string, any> = { status: "PUBLISHED" };

    if (category && category !== "ALL") {
      query.category = { $regex: new RegExp(`^${category}$`, "i") };
    }

    if (tag) {
      query.tags = { $in: [tag] };
    }

    if (q) {
      const regex = new RegExp(q as string, "i");
      query.$or = [
        { title: regex },
        { excerpt: regex },
        { tags: regex }
      ];
    }

    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .sort({ isFeatured: -1, publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Blog.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: blogs.map((b: any) => ({ ...b, id: b._id.toString() })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function getFeaturedBlogs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const blogs = await Blog.find({ status: "PUBLISHED", isFeatured: true })
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(6)
      .lean();

    res.status(200).json({
      success: true,
      data: blogs.map((b: any) => ({ ...b, id: b._id.toString() }))
    });
  } catch (err) {
    next(err);
  }
}

export async function getBlogBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { slug } = req.params;

    const query: Record<string, any> = {
      $or: [{ slug: slug.toLowerCase() }]
    };

    if (mongoose.Types.ObjectId.isValid(slug)) {
      query.$or.push({ _id: new mongoose.Types.ObjectId(slug) });
    }

    // Atomically increment views count
    const blog = await Blog.findOneAndUpdate(
      query,
      { $inc: { viewsCount: 1 } },
      { new: true }
    ).lean();

    if (!blog) {
      res.status(404).json({ success: false, error: { message: "Article not found" } });
      return;
    }

    // Also fetch related articles in the same category
    const related = await Blog.find({
      status: "PUBLISHED",
      category: blog.category,
      _id: { $ne: blog._id }
    })
      .sort({ publishedAt: -1 })
      .limit(3)
      .lean();

    res.status(200).json({
      success: true,
      data: {
        ...blog,
        id: blog._id.toString(),
        related: related.map((r: any) => ({ ...r, id: r._id.toString() }))
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function likeBlog(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    const query: Record<string, any> = {
      $or: [{ slug: id.toLowerCase() }]
    };

    if (mongoose.Types.ObjectId.isValid(id)) {
      query.$or.push({ _id: new mongoose.Types.ObjectId(id) });
    }

    const updated = await Blog.findOneAndUpdate(
      query,
      { $inc: { likesCount: 1 } },
      { new: true }
    ).lean();

    if (!updated) {
      res.status(404).json({ success: false, error: { message: "Article not found" } });
      return;
    }

    res.status(200).json({
      success: true,
      data: { likesCount: updated.likesCount }
    });
  } catch (err) {
    next(err);
  }
}
