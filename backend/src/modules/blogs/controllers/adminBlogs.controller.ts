import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { Blog, BlogStatus } from "../models/Blog";
import { uploadToCloudinary, convertImagesToCloudinary } from "../../../utils/cloudinaryUpload";

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
  // Trigger background auto-sync of any legacy/un-migrated blog images to Cloudinary
  autoSyncLegacyBlogs().catch(() => {});
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
    const skip = (page - 1) * limit;

    const { status, category, q, startDate, endDate } = req.query;

    const query: Record<string, any> = {};

    if (status && status !== "ALL") {
      query.status = (status as string).toUpperCase();
    }

    if (category && category !== "ALL") {
      query.category = { $regex: new RegExp(`^${category}$`, "i") };
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate as string);
      }
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
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
      scheduled: 0,
      draft: 0,
      archived: 0,
      blocked: 0,
      totalViews: 0
    };

    counts.forEach((c) => {
      if (c._id === "PUBLISHED") stats.published = c.count;
      else if (c._id === "SCHEDULED") stats.scheduled = c.count;
      else if (c._id === "DRAFT") stats.draft = c.count;
      else if (c._id === "ARCHIVED") stats.archived = c.count;
      else if (c._id === "BLOCKED") stats.blocked = c.count;
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
      galleryImages,
      category,
      tags,
      author,
      status,
      isFeatured,
      seo,
      scheduledAt
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

    // Convert / upload blog images to Cloudinary (mirroring listing upload pipeline)
    const rawCover = coverImage || "https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?w=800";
    const rawGallery = Array.isArray(galleryImages) ? galleryImages : [];
    const rawAvatar = author?.avatar;

    const [processedCover, processedGallery, processedAvatar] = await Promise.all([
      uploadToCloudinary(rawCover, "omeetso/blogs", "image", true),
      convertImagesToCloudinary(rawGallery, "omeetso/blogs", true),
      rawAvatar ? uploadToCloudinary(rawAvatar, "omeetso/blogs", "image", true) : Promise.resolve("")
    ]);

    const blog = await Blog.create({
      title,
      slug,
      excerpt,
      content,
      coverImage: processedCover,
      galleryImages: processedGallery,
      category: category || "General",
      tags: Array.isArray(tags) ? tags : typeof tags === "string" ? tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [],
      author: {
        name: author?.name || "Omeetso Editorial Team",
        avatar: processedAvatar || author?.avatar || "",
        role: author?.role || "Marketplace Specialist",
        bio: author?.bio || ""
      },
      readTime,
      status: blogStatus,
      isFeatured: Boolean(isFeatured),
      isBlocked: blogStatus === "BLOCKED",
      blockedAt: blogStatus === "BLOCKED" ? new Date() : undefined,
      blockReason: blogStatus === "BLOCKED" ? (req.body.blockReason || "Blocked upon creation") : undefined,
      seo: seo || {
        metaTitle: title,
        metaDescription: excerpt,
        keywords: Array.isArray(tags) ? tags : []
      },
      scheduledAt: blogStatus === "SCHEDULED" && scheduledAt ? new Date(scheduledAt) : undefined,
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
      galleryImages,
      category,
      tags,
      author,
      status,
      isFeatured,
      seo,
      scheduledAt,
      blockReason
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
    if (coverImage !== undefined) {
      updates.coverImage = await uploadToCloudinary(coverImage, "omeetso/blogs", "image", true);
    }
    if (galleryImages !== undefined) {
      const rawGallery = Array.isArray(galleryImages) ? galleryImages : [];
      updates.galleryImages = await convertImagesToCloudinary(rawGallery, "omeetso/blogs", true);
    }
    if (category) updates.category = category;
    if (tags !== undefined) {
      updates.tags = Array.isArray(tags) ? tags : typeof tags === "string" ? tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [];
    }
    if (author) {
      let updatedAvatar = author.avatar;
      if (author.avatar && !author.avatar.includes("res.cloudinary.com") && !author.avatar.includes("cloudinary.com")) {
        updatedAvatar = await uploadToCloudinary(author.avatar, "omeetso/blogs", "image", true);
      }
      updates.author = {
        ...existing.author,
        ...author,
        avatar: updatedAvatar !== undefined ? updatedAvatar : existing.author?.avatar
      };
    }
    if (isFeatured !== undefined) updates.isFeatured = Boolean(isFeatured);
    if (seo) updates.seo = seo;
    if (scheduledAt !== undefined) {
      updates.scheduledAt = scheduledAt ? new Date(scheduledAt) : null;
    }

    if (status) {
      const nextStatus = status.toUpperCase() as BlogStatus;
      updates.status = nextStatus;
      if (nextStatus === "PUBLISHED" && !existing.publishedAt) {
        updates.publishedAt = new Date();
      }
      if (nextStatus === "BLOCKED") {
        updates.isBlocked = true;
        updates.blockedAt = new Date();
        updates.blockReason = blockReason || existing.blockReason || "Blocked by administrator";
      } else {
        updates.isBlocked = false;
        updates.blockReason = undefined;
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
    const { status, scheduledAt, reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, error: { message: "Invalid article ID" } });
      return;
    }

    const nextStatus = (status || "").toUpperCase() as BlogStatus;
    if (!["DRAFT", "PUBLISHED", "SCHEDULED", "ARCHIVED", "BLOCKED"].includes(nextStatus)) {
      res.status(400).json({ success: false, error: { message: "Invalid status value" } });
      return;
    }

    const updates: Record<string, any> = { status: nextStatus };
    if (nextStatus === "PUBLISHED") {
      updates.publishedAt = new Date();
      updates.isBlocked = false;
      updates.blockReason = undefined;
    } else if (nextStatus === "SCHEDULED") {
      if (scheduledAt) {
        updates.scheduledAt = new Date(scheduledAt);
      }
      updates.isBlocked = false;
      updates.blockReason = undefined;
    } else if (nextStatus === "BLOCKED") {
      updates.isBlocked = true;
      updates.blockedAt = new Date();
      updates.blockReason = reason || "Article blocked by administrator";
    } else {
      updates.isBlocked = false;
      updates.blockReason = undefined;
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

export async function bulkBlockBlogs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { blogIds, reason, action = "BLOCK" } = req.body;
    if (!Array.isArray(blogIds) || blogIds.length === 0) {
      res.status(400).json({ success: false, error: { message: "blogIds array required" } });
      return;
    }

    const isUnblocking = action === "UNBLOCK";
    const blockReason = reason || (isUnblocking ? "Unblocked by administrator" : "Bulk blocked by administrator");

    if (isUnblocking) {
      await Blog.updateMany(
        { _id: { $in: blogIds } },
        {
          $set: {
            status: "DRAFT",
            isBlocked: false,
            blockReason: undefined
          },
          $unset: { blockedAt: "" }
        }
      );
    } else {
      await Blog.updateMany(
        { _id: { $in: blogIds } },
        {
          $set: {
            status: "BLOCKED",
            isBlocked: true,
            blockedAt: new Date(),
            blockReason
          }
        }
      );
    }

    res.status(200).json({
      success: true,
      message: `Successfully ${isUnblocking ? "unblocked" : "blocked"} ${blogIds.length} article(s).`,
      data: { count: blogIds.length, blogIds }
    });
  } catch (err) {
    next(err);
  }
}

export async function dateWiseBlockBlogs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { startDate, endDate, reason, category, status } = req.body;
    if (!startDate) {
      res.status(400).json({ success: false, error: { message: "startDate is required" } });
      return;
    }

    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date(startDate);
    end.setHours(23, 59, 59, 999);

    const query: Record<string, any> = {
      createdAt: { $gte: start, $lte: end }
    };

    if (category && category !== "ALL" && category !== "all") {
      query.category = { $regex: new RegExp(`^${category}$`, "i") };
    }

    if (status && status !== "ALL" && status !== "all") {
      query.status = (status as string).toUpperCase();
    } else {
      query.status = { $ne: "BLOCKED" };
    }

    const blogsToBlock = await Blog.find(query).select("_id title").lean();
    const blogIds = blogsToBlock.map((b: any) => b._id.toString());

    if (blogIds.length === 0) {
      res.status(200).json({
        success: true,
        message: "No active blogs found in the specified date range to block.",
        data: { blockedCount: 0, blogIds: [] }
      });
      return;
    }

    const blockReason = reason || `Date-wise blocked for period ${startDate} to ${endDate || startDate}`;

    await Blog.updateMany(
      { _id: { $in: blogIds } },
      {
        $set: {
          status: "BLOCKED",
          isBlocked: true,
          blockedAt: new Date(),
          blockReason
        }
      }
    );

    res.status(200).json({
      success: true,
      message: `Successfully blocked ${blogIds.length} blog(s) between ${startDate} and ${endDate || startDate}.`,
      data: {
        blockedCount: blogIds.length,
        blogIds
      }
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

/**
 * Upload a single image directly to Cloudinary under omeetso/blogs.
 */
export async function uploadBlogImage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { image, media } = req.body;
    const mediaContent = image || media;
    if (!mediaContent) {
      res.status(400).json({ success: false, error: { message: "Image content is required" } });
      return;
    }
    const url = await uploadToCloudinary(mediaContent, "omeetso/blogs", "image", true);
    res.status(200).json({ success: true, url, data: { url } });
  } catch (err) {
    next(err);
  }
}

/**
 * Synchronize and convert all legacy non-Cloudinary images across all blogs to Cloudinary.
 */
export async function syncAllBlogsToCloudinary(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const blogs = await Blog.find({});
    let updatedCount = 0;
    const details: Array<{ id: string; title: string; coverImage: string; galleryCount: number }> = [];

    for (const blog of blogs) {
      let changed = false;
      let newCover = blog.coverImage;
      let newGallery = Array.isArray(blog.galleryImages) ? [...blog.galleryImages] : [];

      if (newCover && !newCover.includes("res.cloudinary.com") && !newCover.includes("cloudinary.com")) {
        const uploaded = await uploadToCloudinary(newCover, "omeetso/blogs", "image", true);
        if (uploaded && (uploaded.includes("res.cloudinary.com") || uploaded.includes("cloudinary.com"))) {
          newCover = uploaded;
          changed = true;
        }
      }

      if (newGallery.length > 0) {
        const convertedGallery = await convertImagesToCloudinary(newGallery, "omeetso/blogs", true);
        const hasConverted = convertedGallery.some((img, idx) => img !== newGallery[idx]);
        if (hasConverted) {
          newGallery = convertedGallery;
          changed = true;
        }
      }

      if (changed) {
        blog.coverImage = newCover;
        blog.galleryImages = newGallery;
        await blog.save();
        updatedCount++;
        details.push({
          id: blog._id.toString(),
          title: blog.title,
          coverImage: newCover || "",
          galleryCount: newGallery.length
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Successfully synchronized ${updatedCount} blog(s) to Cloudinary.`,
      updatedCount,
      details
    });
  } catch (err) {
    next(err);
  }
}

let hasAutoSynced = false;
async function autoSyncLegacyBlogs(): Promise<void> {
  if (hasAutoSynced) return;
  hasAutoSynced = true;
  try {
    const unmigrated = await Blog.find({
      $or: [
        { coverImage: { $not: /cloudinary/i } },
        { galleryImages: { $elemMatch: { $not: /cloudinary/i } } }
      ]
    }).limit(10);

    for (const b of unmigrated) {
      let changed = false;
      if (b.coverImage && !b.coverImage.includes("cloudinary.com")) {
        const up = await uploadToCloudinary(b.coverImage, "omeetso/blogs", "image", true);
        if (up && up.includes("cloudinary.com")) {
          b.coverImage = up;
          changed = true;
        }
      }
      if (Array.isArray(b.galleryImages) && b.galleryImages.length > 0) {
        const conv = await convertImagesToCloudinary(b.galleryImages, "omeetso/blogs", true);
        if (conv.some((img, idx) => img !== b.galleryImages[idx])) {
          b.galleryImages = conv;
          changed = true;
        }
      }
      if (changed) {
        await b.save();
        console.log(`[Cloudinary] Auto-migrated blog "${b.title}" images to Cloudinary`);
      }
    }
  } catch (err) {
    console.warn("[Cloudinary] Auto-sync blogs warning:", err);
  }
}
