import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { Job } from "../models/Job";
import { JobCategory } from "../models/JobCategory";
import { User } from "../../users/models/User";
import { JobApplication } from "../models/JobApplication";
import { Notification } from "../../notifications/models/Notification";

let jobsQueryCache: Record<string, { data: any[]; total: number; expiresAt: number }> = {};
let jobCategoriesCache: { data: any[]; expiresAt: number } | null = null;

export function invalidateJobsCache(): void {
  jobsQueryCache = {};
  jobCategoriesCache = null;
}

export async function getAdminJobs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(200, Math.max(1, parseInt(req.query.limit as string) || 100));
    const skip = (page - 1) * limit;

    const query: Record<string, any> = {};
    if (req.query.status && req.query.status !== "ALL") {
      const st = (req.query.status as string).toUpperCase();
      if (st === "SUBMITTED" || st === "PENDING") {
        query.status = { $in: ["SUBMITTED", "submitted", "pending", "PENDING"] };
      } else if (st === "APPROVED" || st === "ACTIVE") {
        query.status = { $in: ["APPROVED", "approved", "ACTIVE", "active"] };
      } else if (st === "PAUSED") {
        query.status = { $in: ["PAUSED", "paused"] };
      } else if (st === "FILLED") {
        query.status = { $in: ["FILLED", "filled"] };
      } else if (st === "EXPIRED") {
        query.status = { $in: ["EXPIRED", "expired"] };
      } else if (st === "REJECTED") {
        query.status = { $in: ["REJECTED", "rejected"] };
      } else {
        query.status = st;
      }
    }

    if (req.query.q) {
      const regex = new RegExp(req.query.q as string, "i");
      query.$or = [
        { title: regex },
        { companyName: regex },
        { "jobDetails.description": regex },
        { "location.city": regex },
        { "location.area": regex },
      ];
    }

    const cacheKey = `${JSON.stringify(query)}_${page}_${limit}`;
    const now = Date.now();

    if (jobsQueryCache[cacheKey] && jobsQueryCache[cacheKey].expiresAt > now) {
      res.status(200).json({
        success: true,
        data: jobsQueryCache[cacheKey].data,
        pagination: {
          page,
          limit,
          total: jobsQueryCache[cacheKey].total,
          totalPages: Math.ceil(jobsQueryCache[cacheKey].total / limit)
        }
      });
      return;
    }

    const [jobs, total] = await Promise.all([
      Job.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .read("nearest")
        .maxTimeMS(5000)
        .exec(),
      Job.countDocuments(query).maxTimeMS(5000).exec()
    ]);

    const mappedJobs = jobs.map((j: any) => ({ ...j, id: j._id.toString() }));

    jobsQueryCache[cacheKey] = {
      data: mappedJobs,
      total,
      expiresAt: now + 15_000 // 15s TTL
    };

    res.status(200).json({
      success: true,
      data: mappedJobs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    next(err);
  }
}

export async function updateAdminJobStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = String(req.params.id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, error: { message: "Invalid job ID" } });
      return;
    }
    const { status, rejectionReason, isFeatured, isUrgent } = req.body;

    const updatePayload: Record<string, any> = {};
    if (status) updatePayload.status = status.toUpperCase();
    if (rejectionReason !== undefined) updatePayload.rejectionReason = rejectionReason;
    if (isFeatured !== undefined) updatePayload.isFeatured = Boolean(isFeatured);
    if (isUrgent !== undefined) updatePayload.isUrgent = Boolean(isUrgent);

    const job = await Job.findByIdAndUpdate(id, updatePayload, { new: true });
    if (!job) {
      res.status(404).json({ success: false, error: { message: "Job not found" } });
      return;
    }

    invalidateJobsCache();

    // Dispatch message / notification to the employer who posted
    if (job.employerId) {
      const notifTitle = (status === "APPROVED" || status === "ACTIVE")
        ? `Job Approved: "${job.title}"`
        : status === "REJECTED"
        ? `Job Notice: "${job.title}"`
        : `Job Status Update: "${job.title}"`;
      const notifBody = rejectionReason
        ? `Moderator notice: ${rejectionReason}`
        : `Your job posting "${job.title}" has been updated to ${status}.`;

      await Notification.create({
        userId: job.employerId,
        type: "listing_moderation",
        title: notifTitle,
        body: notifBody,
        link: `/my/employer/jobs`,
      }).catch(() => {});
    }

    res.status(200).json({ success: true, data: { ...job.toObject(), id: job._id.toString() } });
  } catch (err) {
    next(err);
  }
}

export async function deleteAdminJob(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = String(req.params.id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, error: { message: "Invalid job ID" } });
      return;
    }

    const job = await Job.findByIdAndDelete(id);
    if (!job) {
      res.status(404).json({ success: false, error: { message: "Job not found" } });
      return;
    }

    await JobApplication.deleteMany({ jobId: id }).catch(() => {});

    invalidateJobsCache();

    res.status(200).json({
      success: true,
      message: "Job permanently deleted from database",
      data: { id: job._id.toString(), title: job.title }
    });
  } catch (err) {
    next(err);
  }
}

export async function getAdminJobCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const now = Date.now();
    if (jobCategoriesCache && jobCategoriesCache.expiresAt > now) {
      res.status(200).json({ success: true, data: jobCategoriesCache.data });
      return;
    }

    const categories = await JobCategory.find({}).sort({ order: 1, name: 1 }).lean().maxTimeMS(5000).exec();
    jobCategoriesCache = {
      data: categories,
      expiresAt: now + 60_000 // 60s TTL
    };

    res.status(200).json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
}

export async function upsertAdminJobCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id, name, icon, order, isActive, isFeatured, subcategories } = req.body;
    const catId = id || name.toLowerCase().replace(/\s+/g, "_");

    const category = await JobCategory.findOneAndUpdate(
      { id: catId },
      {
        id: catId,
        name,
        icon: icon || "Briefcase",
        order: order || 0,
        isActive: isActive ?? true,
        isFeatured: isFeatured ?? false,
        subcategories: subcategories || []
      },
      { upsert: true, new: true }
    );

    invalidateJobsCache();

    res.status(200).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
}

export async function getEmployerModerationHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const employerId = String(req.params.employerId);
    if (!mongoose.Types.ObjectId.isValid(employerId)) {
      res.status(400).json({ success: false, error: { message: "Invalid employer ID" } });
      return;
    }
    const user = await User.findById(employerId).select("profile phone email createdAt verificationSummary").lean();

    const [postedJobs, applications] = await Promise.all([
      Job.find({ employerId }).lean().maxTimeMS(5000).exec(),
      JobApplication.find({ employerId }).lean().maxTimeMS(5000).exec()
    ]);

    const activeCount = postedJobs.filter(j => j.status === "ACTIVE" || j.status === "APPROVED").length;
    const rejectedCount = postedJobs.filter(j => j.status === "REJECTED").length;

    res.status(200).json({
      success: true,
      data: {
        employer: user,
        stats: {
          totalJobsPosted: postedJobs.length,
          activeJobs: activeCount,
          rejectedJobs: rejectedCount,
          totalApplicationsReceived: applications.length,
          reportsReceived: 0,
          accountAgeDays: Math.floor((Date.now() - new Date(user?.createdAt || Date.now()).getTime()) / (1000 * 60 * 60 * 24))
        }
      }
    });
  } catch (err) {
    next(err);
  }
}
