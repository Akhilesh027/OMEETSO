import { Request, Response } from "express";
import { Service } from "../models/Service";
import { ServiceCategory } from "../models/ServiceCategory";
import { Notification } from "../../notifications/models/Notification";
import { seedInitialServices } from "../../../database/seeders/serviceSeeder";

// Admin: Get all services with filtering & moderation
export const getAdminServices = async (req: Request, res: Response) => {
  try {
    const { status, category, search, q, page = "1", limit = "50" } = req.query;
    const querySearch = (search || q) as string | undefined;

    const filter: any = {};
    if (status && status !== "ALL") {
      const s = String(status).toUpperCase();
      if (s === "PENDING_APPROVAL") {
        filter.status = { $in: ["PENDING_APPROVAL", "pending_approval", "submitted", "PENDING"] };
      } else if (s === "ACTIVE") {
        filter.status = { $in: ["ACTIVE", "active", "APPROVED", "approved"] };
      } else if (s === "REJECTED") {
        filter.status = { $in: ["REJECTED", "rejected"] };
      } else if (s === "PAUSED") {
        filter.status = { $in: ["PAUSED", "paused"] };
      } else {
        filter.status = new RegExp(`^${status}$`, "i");
      }
    }
    if (category) filter.serviceCategoryId = category;
    if (querySearch && typeof querySearch === "string" && querySearch.trim()) {
      const regex = new RegExp(querySearch.trim(), "i");
      filter.$or = [{ title: regex }, { businessName: regex }, { "location.city": regex }];
    }

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.max(1, parseInt(limit as string, 10));
    const skip = (pageNum - 1) * limitNum;

    const [services, total] = await Promise.all([
      Service.find(filter)
        .populate("providerId", "name phone email isVerified")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Service.countDocuments(filter),
    ]);

    const formattedServices = services.map((s: any) => ({
      ...s,
      id: s._id.toString(),
    }));

    res.json({
      success: true,
      data: formattedServices,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Admin: Update service status (Approve, Reject, Toggle Feature)
export const updateAdminServiceStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason, isFeatured } = req.body;

    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({ success: false, error: "Service not found" });
    }

    if (status) service.status = status;
    if (rejectionReason !== undefined) service.rejectionReason = rejectionReason;
    if (isFeatured !== undefined) service.isFeatured = isFeatured;

    await service.save();

    // Dispatch message / notification to the provider who posted
    if (service.providerId) {
      const notifTitle = (status === "ACTIVE" || status === "APPROVED")
        ? `Service Verified & Live: "${service.title}"`
        : status === "REJECTED"
        ? `Service Notice: "${service.title}"`
        : `Service Status Update: "${service.title}"`;
      const notifBody = rejectionReason
        ? `Moderator notice: ${rejectionReason}`
        : `Your service offering "${service.title}" has been updated to ${status}.`;

      await Notification.create({
        userId: service.providerId,
        type: "listing_moderation",
        title: notifTitle,
        body: notifBody,
        link: `/account/provider/services`,
      }).catch(() => {});
    }

    res.json({ success: true, data: service });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Admin: Get Service Categories
export const getAdminServiceCategories = async (req: Request, res: Response) => {
  try {
    let categories = await ServiceCategory.find().sort({ displayOrder: 1 });
    if (categories.length === 0) {
      await seedInitialServices();
      categories = await ServiceCategory.find().sort({ displayOrder: 1 });
    }
    res.json({ success: true, data: categories });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Admin: Upsert Service Category
export const upsertAdminServiceCategory = async (req: Request, res: Response) => {
  try {
    const { categoryId, name, icon, description, subcategories, displayOrder, isActive } = req.body;

    const category = await ServiceCategory.findOneAndUpdate(
      { categoryId },
      { categoryId, name, icon, description, subcategories, displayOrder, isActive },
      { new: true, upsert: true }
    );

    res.json({ success: true, data: category });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};
