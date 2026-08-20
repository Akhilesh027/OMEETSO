import { Request, Response } from "express";
import { Service } from "../models/Service";
import { ServiceCategory } from "../models/ServiceCategory";
import { Notification } from "../../notifications/models/Notification";

// Admin: Get all services with filtering & moderation
export const getAdminServices = async (req: Request, res: Response) => {
  try {
    const { status, category, search, page = "1", limit = "20" } = req.query;

    const filter: any = {};
    if (status && status !== "ALL") filter.status = status;
    if (category) filter.serviceCategoryId = category;
    if (search && typeof search === "string" && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
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
        .limit(limitNum),
      Service.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: services,
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
    const categories = await ServiceCategory.find().sort({ displayOrder: 1 });
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
