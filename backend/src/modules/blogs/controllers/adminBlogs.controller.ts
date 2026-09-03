import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { Blog, BlogStatus } from "../models/Blog";

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function calculateReadTime(content: string): string {
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

export async function getAdminBlogs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
    const skip = (page - 1) * limit;

    const { status, category, q } = req.query;

    const query: Record<string, any> = {};

    if (status && status !== "ALL") {
      query.status = (status as string).toUpperCase();
    }

    if (category && category !== "ALL") {
      query.category = { $regex: new RegExp(`^${category}$`, "i") };
    }

    if (q) {
      const regex = new RegExp(q as string, "i");
      query.$or = [{ title: regex }, { excerpt: regex }, { tags: regex }];
    }

    const [blogs, total, counts] = await Promise.all([
      Blog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Blog.countDocuments(query),
      Blog.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            totalViews: { $sum: "$viewsCount" }
          }
        }
      ])
    ]);

    const stats = {
      total: 0,
      published: 0,
      draft: 0,
      archived: 0,
      totalViews: 0
    };

    counts.forEach((c) => {
      if (c._id === "PUBLISHED") stats.published = c.count;
      else if (c._id === "DRAFT") stats.draft = c.count;
      else if (c._id === "ARCHIVED") stats.archived = c.count;
      stats.total += c.count;
      stats.totalViews += c.totalViews || 0;
    });

    res.status(200).json({
      success: true,
      data: blogs.map((b: any) => ({ ...b, id: b._id.toString() })),
      stats,
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

export async function createAdminBlog(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      title,
      slug: customSlug,
      excerpt,
      content,
      coverImage,
      category,
      tags,
      author,
      status,
      isFeatured,
      seo
    } = req.body;

    if (!title || !content || !excerpt) {
      res.status(400).json({
        success: false,
        error: { message: "Title, excerpt, and content are required." }
      });
      return;
    }

    let slug = slugify(customSlug || title);

    // Ensure unique slug
    let counter = 1;
    while (await Blog.exists({ slug })) {
      slug = `${slugify(customSlug || title)}-${counter++}`;
    }

    const readTime = calculateReadTime(content);
    const blogStatus: BlogStatus = (status || "DRAFT").toUpperCase() as BlogStatus;

    const blog = await Blog.create({
      title,
      slug,
      excerpt,
      content,
      coverImage: coverImage || "https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?w=800",
      category: category || "General",
      tags: Array.isArray(tags) ? tags : typeof tags === "string" ? tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [],
      author: {
        name: author?.name || "Omeetso Editorial Team",
        avatar: author?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
        role: author?.role || "Marketplace Specialist",
        bio: author?.bio || ""
      },
      readTime,
      status: blogStatus,
      isFeatured: Boolean(isFeatured),
      seo: seo || {
        metaTitle: title,
        metaDescription: excerpt,
        keywords: Array.isArray(tags) ? tags : []
      },
      publishedAt: blogStatus === "PUBLISHED" ? new Date() : undefined
    });

    res.status(201).json({
      success: true,
      data: { ...blog.toObject(), id: blog._id.toString() }
    });
  } catch (err) {
    next(err);
  }
}

export async function updateAdminBlog(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = String(req.params.id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, error: { message: "Invalid article ID" } });
      return;
    }

    const {
      title,
      slug: customSlug,
      excerpt,
      content,
      coverImage,
      category,
      tags,
      author,
      status,
      isFeatured,
      seo
    } = req.body;

    const existing = await Blog.findById(id);
    if (!existing) {
      res.status(404).json({ success: false, error: { message: "Article not found" } });
      return;
    }

    const updates: Record<string, any> = {};

    if (title) updates.title = title;
    if (excerpt) updates.excerpt = excerpt;
    if (content) {
      updates.content = content;
      updates.readTime = calculateReadTime(content);
    }
    if (coverImage !== undefined) updates.coverImage = coverImage;
    if (category) updates.category = category;
    if (tags !== undefined) {
      updates.tags = Array.isArray(tags) ? tags : typeof tags === "string" ? tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [];
    }
    if (author) {
      updates.author = {
        ...existing.author,
        ...author
      };
    }
    if (isFeatured !== undefined) updates.isFeatured = Boolean(isFeatured);
    if (seo) updates.seo = seo;

    if (status) {
      const nextStatus = status.toUpperCase() as BlogStatus;
      updates.status = nextStatus;
      if (nextStatus === "PUBLISHED" && !existing.publishedAt) {
        updates.publishedAt = new Date();
      }
    }

    if (customSlug && customSlug !== existing.slug) {
      let slug = slugify(customSlug);
      let counter = 1;
      while (await Blog.exists({ slug, _id: { $ne: id } })) {
        slug = `${slugify(customSlug)}-${counter++}`;
      }
      updates.slug = slug;
    }

    const updated = await Blog.findByIdAndUpdate(id, updates, { new: true });

    res.status(200).json({
      success: true,
      data: updated ? { ...updated.toObject(), id: updated._id.toString() } : null
    });
  } catch (err) {
    next(err);
  }
}

export async function updateAdminBlogStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = String(req.params.id);
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, error: { message: "Invalid article ID" } });
      return;
    }

    const nextStatus = (status || "").toUpperCase() as BlogStatus;
    if (!["DRAFT", "PUBLISHED", "ARCHIVED"].includes(nextStatus)) {
      res.status(400).json({ success: false, error: { message: "Invalid status value" } });
      return;
    }

    const updates: Record<string, any> = { status: nextStatus };
    if (nextStatus === "PUBLISHED") {
      updates.publishedAt = new Date();
    }

    const updated = await Blog.findByIdAndUpdate(id, updates, { new: true });

    if (!updated) {
      res.status(404).json({ success: false, error: { message: "Article not found" } });
      return;
    }

    res.status(200).json({
      success: true,
      data: { ...updated.toObject(), id: updated._id.toString() }
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteAdminBlog(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = String(req.params.id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, error: { message: "Invalid article ID" } });
      return;
    }

    const deleted = await Blog.findByIdAndDelete(id);
    if (!deleted) {
      res.status(404).json({ success: false, error: { message: "Article not found" } });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Article deleted successfully"
    });
  } catch (err) {
    next(err);
  }
}
