import { Request, Response, NextFunction } from "express";
import { Job } from "../models/Job";
import { JobCategory } from "../models/JobCategory";
import { User } from "../../users/models/User";
import { JobApplication } from "../models/JobApplication";
import { Notification } from "../../notifications/models/Notification";

export async function getAdminJobs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const query: Record<string, any> = {};
    if (req.query.status && req.query.status !== "ALL") {
      query.status = (req.query.status as string).toUpperCase();
    }
    if (req.query.q) {
      const regex = new RegExp(req.query.q as string, "i");
      query.$or = [{ title: regex }, { companyName: regex }];
    }

    const [jobs, total] = await Promise.all([
      Job.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Job.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: jobs.map((j: any) => ({ ...j, id: j._id.toString() })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    next(err);
  }
}

export async function updateAdminJobStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
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
        link: `/account/employer/jobs`,
      }).catch(() => {});
    }

    res.status(200).json({ success: true, data: { ...job.toObject(), id: job._id.toString() } });
  } catch (err) {
    next(err);
  }
}

export async function getAdminJobCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const categories = await JobCategory.find({}).sort({ order: 1, name: 1 }).lean();
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

    res.status(200).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
}

export async function getEmployerModerationHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { employerId } = req.params;
    const user = await User.findById(employerId).select("profile phone email createdAt verificationSummary").lean();

    const [postedJobs, applications] = await Promise.all([
      Job.find({ employerId }).lean(),
      JobApplication.find({ employerId }).lean()
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
