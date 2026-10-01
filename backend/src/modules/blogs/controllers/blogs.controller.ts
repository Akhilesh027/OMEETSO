import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { Blog } from "../models/Blog";

export async function getPublicBlogs(req: Request, res: Response, next: NextFunction): Promise<void> {
  console.log("[Blogs] >>> getPublicBlogs request received:", req.query);
  const startTime = Date.now();
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 12));
    const skip = (page - 1) * limit;

    const { category, tag, q } = req.query;

    const query: Record<string, any> = {
      status: "PUBLISHED",
      isBlocked: { $ne: true }
    };

    if (category && category !== "ALL") {
      query.category = { $regex: new RegExp(`^${category}$`, "i") };
    }

    if (tag) {
      query.tags = { $in: [tag] };
    }

    if (q) {
      const regex = new RegExp(q as string, "i");
      query.$or = [{ title: regex }, { excerpt: regex }, { tags: regex }];
    }

    console.log("[Blogs] Executing Blog.find with query:", JSON.stringify(query));
    const findStart = Date.now();
    const blogs = await Blog.find(query)
      .select("-content -galleryImages")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .maxTimeMS(5000)
      .lean();
    console.log(`[Blogs] Blog.find completed in ${Date.now() - findStart}ms, found ${blogs.length} items`);

    const countStart = Date.now();
    const total = await Blog.countDocuments(query).maxTimeMS(5000);
    console.log(`[Blogs] countDocuments completed in ${Date.now() - countStart}ms, total: ${total}`);

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
    console.log(`[Blogs] <<< getPublicBlogs sent in ${Date.now() - startTime}ms`);
  } catch (err: any) {
    console.error(`[Blogs] ERROR in getPublicBlogs after ${Date.now() - startTime}ms:`, err?.message || err);
    next(err);
  }
}

export async function getFeaturedBlogs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const blogs = await Blog.find({
      status: "PUBLISHED",
      isBlocked: { $ne: true },
      isFeatured: true
    })
      .select("-content -galleryImages")
      .sort({ createdAt: -1 })
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
    const slug = String(req.params.slug);

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

    if (!blog || blog.status === "BLOCKED" || (blog as any).isBlocked) {
      res.status(404).json({ success: false, error: { message: "Article not found or currently unavailable" } });
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
    const id = String(req.params.id);

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
