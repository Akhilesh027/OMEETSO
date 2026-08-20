import { Request, Response } from "express";
import { Service } from "../models/Service";
import { ServiceInquiry } from "../models/ServiceInquiry";
import { ServiceCategory } from "../models/ServiceCategory";
import { ServiceProviderProfile } from "../models/ServiceProviderProfile";
import mongoose from "mongoose";

// 1. Get Service Categories
export const getServiceCategories = async (req: Request, res: Response) => {
  try {
    const categories = await ServiceCategory.find({ isActive: true }).sort({ displayOrder: 1 });
    res.json({ success: true, data: categories });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 2. Get Public Services Marketplace Listings
export const getPublicServices = async (req: Request, res: Response) => {
  try {
    const {
      q,
      cat,
      sub,
      serviceType,
      minPrice,
      maxPrice,
      emergency,
      verified,
      city,
      area,
      sort,
      page = "1",
      limit = "20",
    } = req.query;

    const filter: any = {
      status: "ACTIVE",
    };

    if (cat && typeof cat === "string") {
      filter.serviceCategoryId = cat;
    }

    if (sub && typeof sub === "string") {
      filter.subcategoryId = { $regex: new RegExp(sub, "i") };
    }

    if (serviceType && typeof serviceType === "string" && serviceType !== "ALL") {
      filter.serviceType = serviceType.toUpperCase();
    }

    if (emergency === "true" || emergency === "1") {
      filter.isEmergency = true;
    }

    if (verified === "true" || verified === "1") {
      filter.isVerifiedProvider = true;
    }

    if (city && typeof city === "string") {
      filter["location.city"] = { $regex: new RegExp(city, "i") };
    }

    if (area && typeof area === "string") {
      filter["location.area"] = { $regex: new RegExp(area, "i") };
    }

    if (minPrice || maxPrice) {
      filter["pricing.amount"] = {};
      if (minPrice) filter["pricing.amount"].$gte = Number(minPrice);
      if (maxPrice) filter["pricing.amount"].$lte = Number(maxPrice);
    }

    if (q && typeof q === "string" && q.trim()) {
      const searchRegex = new RegExp(q.trim(), "i");
      filter.$or = [
        { title: searchRegex },
        { "serviceDetails.description": searchRegex },
        { businessName: searchRegex },
        { subcategoryId: searchRegex },
        { "location.area": searchRegex },
      ];
    }

    let sortOptions: any = { isFeatured: -1, createdAt: -1 };
    if (sort === "price-low") sortOptions = { "pricing.amount": 1 };
    else if (sort === "price-high") sortOptions = { "pricing.amount": -1 };
    else if (sort === "rating") sortOptions = { "stats.rating": -1, "stats.reviewsCount": -1 };
    else if (sort === "newest") sortOptions = { createdAt: -1 };

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.max(1, parseInt(limit as string, 10));
    const skip = (pageNum - 1) * limitNum;

    const [services, total] = await Promise.all([
      Service.find(filter).sort(sortOptions).skip(skip).limit(limitNum),
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

// 3. Get Single Service by ID
export const getServiceById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      // Try search by string ID or return 404
      const found = await Service.findOne({ _id: id });
      if (!found) return res.status(404).json({ success: false, error: "Service not found" });
      return res.json({ success: true, data: found });
    }

    const service = await Service.findByIdAndUpdate(
      id,
      { $inc: { "stats.viewsCount": 1 } },
      { new: true }
    );

    if (!service) {
      return res.status(404).json({ success: false, error: "Service not found" });
    }

    // Related similar services in same category
    const similar = await Service.find({
      _id: { $ne: service._id },
      serviceCategoryId: service.serviceCategoryId,
      status: "ACTIVE",
    })
      .limit(4)
      .sort({ "stats.rating": -1 });

    res.json({
      success: true,
      data: {
        ...service.toObject(),
        similarServices: similar,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 4. Create Service Listing (Provider)
export const createService = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?._id || (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Authentication required" });
    }

    const serviceData = {
      ...req.body,
      providerId: userId,
      status: req.body.status || "ACTIVE",
    };

    const newService = await Service.create(serviceData);
    res.status(201).json({ success: true, data: newService });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// 5. Update Service
export const updateService = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?._id || (req as any).user?.id;
    const id = req.params.id as string;

    const service = await Service.findOne({ _id: id, providerId: userId });
    if (!service) {
      return res.status(404).json({ success: false, error: "Service not found or unauthorized" });
    }

    Object.assign(service, req.body);
    await service.save();

    res.json({ success: true, data: service });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// 6. Delete / Pause Service
export const deleteService = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?._id || (req as any).user?.id;
    const id = req.params.id as string;

    const service = await Service.findOneAndDelete({ _id: id, providerId: userId });
    if (!service) {
      return res.status(404).json({ success: false, error: "Service not found or unauthorized" });
    }

    res.json({ success: true, message: "Service deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 7. Get My Services (Provider)
export const getMyServices = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?._id || (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Authentication required" });
    }

    const services = await Service.find({ providerId: userId }).sort({ createdAt: -1 });
    res.json({ success: true, data: services });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 8. Create Service Inquiry / Booking Request (Customer)
export const createServiceInquiry = async (req: Request, res: Response) => {
  try {
    const customerId = (req as any).user?._id || (req as any).user?.id;
    const { serviceId, problemDescription, preferredDate, preferredTimeSlot, serviceMode, customerAddress, customerName, customerPhone } = req.body;

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ success: false, error: "Service not found" });
    }

    const inquiry = await ServiceInquiry.create({
      serviceId,
      customerId: customerId || new mongoose.Types.ObjectId(),
      providerId: service.providerId,
      customerName: customerName || "Customer",
      customerPhone: customerPhone || "",
      customerAddress,
      preferredDate: preferredDate ? new Date(preferredDate) : new Date(),
      preferredTimeSlot: preferredTimeSlot || "Morning (09:00 AM - 12:00 PM)",
      serviceMode: serviceMode || service.serviceType || "DOORSTEP",
      problemDescription,
      status: "PENDING",
    });

    // Increment service inquiries count
    await Service.findByIdAndUpdate(serviceId, { $inc: { "stats.inquiriesCount": 1 } });

    res.status(201).json({ success: true, data: inquiry });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// 9. Get Customer Inquiries (Customer)
export const getMyServiceInquiries = async (req: Request, res: Response) => {
  try {
    const customerId = (req as any).user?._id || (req as any).user?.id;
    if (!customerId) {
      return res.status(401).json({ success: false, error: "Authentication required" });
    }

    const inquiries = await ServiceInquiry.find({ customerId })
      .populate("serviceId")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: inquiries });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 10. Get Provider Inquiries (Provider Dashboard)
export const getProviderInquiries = async (req: Request, res: Response) => {
  try {
    const providerId = (req as any).user?._id || (req as any).user?.id;
    if (!providerId) {
      return res.status(401).json({ success: false, error: "Authentication required" });
    }

    const inquiries = await ServiceInquiry.find({ providerId })
      .populate("serviceId")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: inquiries });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 11. Update Inquiry Status (Accept, Quote, Complete, Reject)
export const updateInquiryStatus = async (req: Request, res: Response) => {
  try {
    const providerId = (req as any).user?._id || (req as any).user?.id;
    const inquiryId = req.params.inquiryId as string;
    const { status, quotationAmount, providerNotes, cancellationReason } = req.body;

    const inquiry = await ServiceInquiry.findOne({ _id: inquiryId, providerId });
    if (!inquiry) {
      return res.status(404).json({ success: false, error: "Inquiry not found or unauthorized" });
    }

    if (status) inquiry.status = status;
    if (quotationAmount !== undefined) inquiry.quotationAmount = quotationAmount;
    if (providerNotes) inquiry.providerNotes = providerNotes;
    if (cancellationReason) inquiry.cancellationReason = cancellationReason;

    await inquiry.save();

    res.json({ success: true, data: inquiry });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// 12. Get / Update Provider Profile
export const getProviderProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?._id || (req as any).user?.id;
    const profile = await ServiceProviderProfile.findOne({ userId });
    res.json({ success: true, data: profile });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateProviderProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?._id || (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Authentication required" });
    }

    const updated = await ServiceProviderProfile.findOneAndUpdate(
      { userId },
      { ...req.body, userId },
      { new: true, upsert: true }
    );

    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};
