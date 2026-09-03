import mongoose from "mongoose";
import { Request, Response, NextFunction } from "express";
import { Listing } from "../models/Listing";
import { ListingRevision } from "../models/ListingRevision";
import { ListingModeration } from "../models/ListingModeration";
import { AuthenticatedUserRequest } from "../../../middleware/authenticateUser";
import { ListingStatus } from "../../../contracts";

export async function createListing(req: AuthenticatedUserRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "User authentication required" } });
      return;
    }

    const {
      title,
      description,
      priceInPaise,
      negotiable,
      free,
      condition,
      categoryId,
      subcategoryId,
      images,
      coverIndex,
      videoUrl,
      pincode,
      area,
      city,
      fulfilment,
      specs,
      contactPref
    } = req.body;

    // Derived Seller Identity
    const sellerId = req.user._id;

    const listing = await Listing.create({
      sellerId,
      categoryId,
      subcategoryId,
      title,
      description,
      priceInPaise,
      negotiable: Boolean(negotiable),
      free: Boolean(free),
      condition,
      images: images || [],
      coverIndex: coverIndex || 0,
      videoUrl,
      pincode: pincode || req.user.profile.pincode,
      area: area || req.user.profile.area || "Madhapur",
      city: city || req.user.profile.city || "Hyderabad",
      fulfilment: fulfilment || "pickup",
      specs: specs || {},
      contactPref: contactPref || "call_and_chat",
      status: ListingStatus.APPROVED,
      publishedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });

    // Create moderation queue entry
    await ListingModeration.create({
      listingId: listing._id,
      status: "completed",
      version: 1
    });

    res.status(201).json({
      success: true,
      data: {
        id: listing._id.toString(),
        _id: listing._id.toString(),
        sellerId: listing.sellerId.toString(),
        title: listing.title,
        description: listing.description,
        priceInPaise: listing.priceInPaise,
        price: listing.priceInPaise ? Math.round(listing.priceInPaise / 100) : 0,
        negotiable: listing.negotiable,
        free: listing.free,
        condition: listing.condition,
        categoryId: listing.categoryId,
        category: listing.categoryId,
        subcategoryId: listing.subcategoryId,
        subcategory: listing.subcategoryId,
        images: listing.images,
        coverIndex: listing.coverIndex,
        videoUrl: listing.videoUrl,
        whatsappPhone: listing.whatsappPhone,
        enableWhatsapp: listing.enableWhatsapp,
        pincode: listing.pincode,
        area: listing.area,
        city: listing.city,
        fulfilment: listing.fulfilment,
        specs: listing.specs ? Object.fromEntries(listing.specs) : {},
        contactPref: listing.contactPref,
        rating: listing.rating || 0,
        reviewCount: listing.reviewCount || 0,
        status: listing.status,
        analytics: listing.analytics || { views: 0, saves: 0, chats: 0 },
        aiAudit: listing.aiAudit || { passed: true, resolution: "1920x1080 (HD)", noPhoneText: true, watermarkPassed: true },
        createdAt: listing.createdAt,
        updatedAt: listing.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getPublicListings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const statusQuery = req.query.status ? (req.query.status as string).toUpperCase() : null;
    const query: Record<string, any> = {
      status: statusQuery
        ? { $in: [statusQuery, statusQuery.toLowerCase(), statusQuery.toUpperCase()] }
        : { $nin: ["REJECTED", "rejected", "DELETED", "deleted", "EXPIRED", "expired", ListingStatus.REJECTED, ListingStatus.EXPIRED, ListingStatus.REMOVED] }
    };

    const andConditions: any[] = [];

    if (req.query.categoryId || req.query.category) {
      const cat = (req.query.categoryId || req.query.category) as string;
      andConditions.push({
        $or: [
          { categoryId: { $regex: cat, $options: "i" } },
          { subcategoryId: { $regex: cat, $options: "i" } }
        ]
      });
    }

    if (req.query.subcategoryId) query.subcategoryId = req.query.subcategoryId;
    if (req.query.condition) query.condition = req.query.condition;

    // Direct City-based Filtering
    const cityParam = (req.query.city as string)?.split(",")[0]?.trim();
    if (cityParam && cityParam.toLowerCase() !== "all") {
      andConditions.push({
        $or: [
          { city: { $regex: cityParam, $options: "i" } },
          { area: { $regex: cityParam, $options: "i" } }
        ]
      });
    }

    if (andConditions.length > 0) {
      query.$and = andConditions;
    }

    const sellerParam = (Array.isArray(req.query.sellerId) ? req.query.sellerId[0] : req.query.sellerId || req.query.seller) as string;
    if (sellerParam) {
      if (mongoose.Types.ObjectId.isValid(sellerParam)) {
        query.sellerId = new mongoose.Types.ObjectId(sellerParam);
      } else {
        query.sellerId = sellerParam;
      }
    }

    const storeParam = req.query.storeId as string;
    if (storeParam) {
      if (mongoose.Types.ObjectId.isValid(storeParam)) {
        query.storeId = new mongoose.Types.ObjectId(storeParam);
      } else {
        query.storeId = storeParam;
      }
    }

    if (req.query.minPrice || req.query.maxPrice) {
      query.priceInPaise = {};
      if (req.query.minPrice) query.priceInPaise.$gte = parseInt(req.query.minPrice as string);
      if (req.query.maxPrice) query.priceInPaise.$lte = parseInt(req.query.maxPrice as string);
    }

    if (req.query.q) {
      query.$text = { $search: req.query.q as string };
    }

    const sortOptions: Record<string, any> = { createdAt: -1 };
    if (req.query.sort === "price_asc") sortOptions.priceInPaise = 1;
    if (req.query.sort === "price_desc") sortOptions.priceInPaise = -1;

    const [listings, total] = await Promise.all([
      Listing.find(query)
        .select("title priceInPaise condition area city pincode coverIndex images sellerId storeId status publishedAt free negotiable categoryId subcategoryId description specs")
        .populate("sellerId", "profile.name profile.businessName profile.avatar accountType verificationSummary")
        .populate("storeId", "name slug logo cover rating reviewCount")
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Listing.countDocuments(query)
    ]);

    const items = listings.map((l: any) => {
      const isBusiness = Boolean(l.storeId || l.sellerId?.accountType === "business" || l.sellerId?.profile?.businessName);
      const businessName = l.storeId?.name || l.sellerId?.profile?.businessName || (l.sellerId?.accountType === "business" ? l.sellerId?.profile?.name : undefined);
      const sellerDisplayName = businessName || l.sellerId?.profile?.name || "Omeetso Seller";

      return {
        id: l._id.toString(),
        title: l.title,
        priceInPaise: l.priceInPaise,
        condition: l.condition,
        area: l.area,
        city: l.city,
        pincode: l.pincode,
        coverUrl: l.images[l.coverIndex || 0] || l.images[0],
        images: l.images,
        negotiable: l.negotiable,
        free: l.free,
        categoryId: l.categoryId,
        subcategoryId: l.subcategoryId,
        description: l.description,
        specs: l.specs || {},
        rating: l.rating || 0,
        reviewCount: l.reviewCount || 0,
        status: l.status,
        publishedAt: l.publishedAt || l.createdAt,
        sellerId: l.sellerId?._id ? l.sellerId._id.toString() : (l.sellerId ? l.sellerId.toString() : undefined),
        sellerName: sellerDisplayName,
        sellerOwnerName: l.sellerId?.profile?.name,
        businessName: businessName,
        sellerType: isBusiness ? "business" : "individual",
        storeId: l.storeId?._id ? l.storeId._id.toString() : (l.storeId ? l.storeId.toString() : undefined),
        storeName: l.storeId?.name,
        sellerAvatar: l.sellerId?.profile?.avatar || l.storeId?.logo,
        sellerVerified: Boolean(l.sellerId?.verificationSummary?.mobileVerified || l.sellerId?.verificationSummary?.businessVerified)
      };
    });

    res.status(200).json({
      success: true,
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getListingById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const listingId = (req.params.listingId || req.params.id) as string;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(listingId);
    const listing = isObjectId
      ? await Listing.findById(listingId)
          .populate("sellerId", "profile.name profile.businessName profile.avatar profile.city profile.area accountType verificationSummary createdAt")
          .populate("storeId", "name slug logo cover rating reviewCount")
          .lean()
      : await Listing.findOne({ slug: listingId } as any)
          .populate("sellerId", "profile.name profile.businessName profile.avatar profile.city profile.area accountType verificationSummary createdAt")
          .populate("storeId", "name slug logo cover rating reviewCount")
          .lean();

    if (!listing) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Listing not found" } });
      return;
    }

    const seller: any = listing.sellerId;
    const store: any = listing.storeId;
    const isBusiness = Boolean(store || seller?.accountType === "business" || seller?.profile?.businessName);
    const businessName = store?.name || seller?.profile?.businessName || (seller?.accountType === "business" ? seller?.profile?.name : undefined);
    const sellerDisplayName = businessName || seller?.profile?.name || "Omeetso Seller";

    res.status(200).json({
      success: true,
      data: {
        id: listing._id.toString(),
        title: listing.title,
        description: listing.description,
        priceInPaise: listing.priceInPaise,
        negotiable: listing.negotiable,
        free: listing.free,
        condition: listing.condition,
        categoryId: listing.categoryId,
        subcategoryId: listing.subcategoryId,
        images: listing.images,
        coverIndex: listing.coverIndex,
        videoUrl: listing.videoUrl,
        pincode: listing.pincode,
        area: listing.area,
        city: listing.city,
        fulfilment: listing.fulfilment,
        specs: listing.specs ? Object.fromEntries(Object.entries(listing.specs)) : {},
        contactPref: listing.contactPref,
        rating: listing.rating || 0,
        reviewCount: listing.reviewCount || 0,
        status: listing.status,
        publishedAt: listing.publishedAt || listing.createdAt,
        expiresAt: listing.expiresAt,
        analytics: listing.analytics || { views: 0, saves: 0, chats: 0 },
        aiAudit: listing.aiAudit || { passed: true, resolution: "1920x1080 (HD)", noPhoneText: true, watermarkPassed: true },
        businessName,
        sellerOwnerName: seller?.profile?.name,
        storeName: store?.name,
        sellerType: isBusiness ? "business" : "individual",
        seller: seller
          ? {
              id: seller._id.toString(),
              name: sellerDisplayName,
              ownerName: seller.profile?.name,
              businessName: businessName,
              type: isBusiness ? "business" : "individual",
              avatar: seller.profile?.avatar || store?.logo,
              city: seller.profile?.city || store?.city,
              area: seller.profile?.area || store?.area,
              memberSince: seller.profile?.memberSince || seller.createdAt,
              verificationSummary: seller.verificationSummary || { riskScore: 94 }
            }
          : undefined
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getMyListings(req: AuthenticatedUserRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "User authentication required" } });
      return;
    }

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const query: Record<string, any> = { sellerId: req.user._id };
    if (req.query.status) {
      query.status = req.query.status;
    }

    const [listings, total] = await Promise.all([
      Listing.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Listing.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: listings.map((l) => ({
        id: l._id.toString(),
        title: l.title,
        priceInPaise: l.priceInPaise,
        condition: l.condition,
        status: l.status,
        images: l.images,
        coverIndex: l.coverIndex,
        area: l.area,
        city: l.city,
        createdAt: l.createdAt,
        expiresAt: l.expiresAt,
        rejection: l.rejection
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function updateListing(req: AuthenticatedUserRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "User required" } });
      return;
    }

    const { listingId } = req.params;
    const listing = await Listing.findById(listingId);

    if (!listing) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Listing not found" } });
      return;
    }

    // Ownership Enforcement
    if (listing.sellerId.toString() !== req.user._id.toString()) {
      res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Cannot edit another user's listing" } });
      return;
    }

    const { title, description, priceInPaise, condition, images, specs } = req.body;

    // Listing Revision Logic: If listing is active/approved, create revision for review rather than overwriting live content
    if (listing.status === ListingStatus.APPROVED || listing.status === ListingStatus.ACTIVE) {
      const revision = await ListingRevision.create({
        listingId: listing._id,
        sellerId: req.user._id,
        title: title || listing.title,
        description: description || listing.description,
        priceInPaise: priceInPaise ?? listing.priceInPaise,
        condition: condition || listing.condition,
        images: images || listing.images,
        specs: specs || listing.specs,
        status: "pending_review"
      });

      res.status(200).json({
        success: true,
        data: {
          message: "Edit submitted for moderation. Existing listing remains public until revision is approved.",
          revisionId: revision._id.toString()
        }
      });
      return;
    }

    // Draft / Submitted edit: update directly
    if (title) listing.title = title;
    if (description) listing.description = description;
    if (priceInPaise !== undefined) listing.priceInPaise = priceInPaise;
    if (condition) listing.condition = condition;
    if (images) listing.images = images;
    if (specs) listing.specs = specs;

    await listing.save();

    res.status(200).json({
      success: true,
      data: {
        id: listing._id.toString(),
        title: listing.title,
        status: listing.status
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function markListingSold(req: AuthenticatedUserRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "User required" } });
      return;
    }

    const { listingId } = req.params;
    const listing = await Listing.findById(listingId);

    if (!listing) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Listing not found" } });
      return;
    }

    if (listing.sellerId.toString() !== req.user._id.toString()) {
      res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Cannot modify another user's listing" } });
      return;
    }

    listing.status = ListingStatus.SOLD;
    await listing.save();

    res.status(200).json({
      success: true,
      data: { id: listing._id.toString(), status: listing.status }
    });
  } catch (error) {
    next(error);
  }
}

export async function recordListingView(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const listingId = (Array.isArray(req.params.listingId) ? req.params.listingId[0] : req.params.listingId) as string;
    if (mongoose.Types.ObjectId.isValid(listingId)) {
      await Listing.findByIdAndUpdate(listingId, { $inc: { "analytics.views": 1 } });
    }
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
}

export async function recordListingSave(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const listingId = (Array.isArray(req.params.listingId) ? req.params.listingId[0] : req.params.listingId) as string;
    if (mongoose.Types.ObjectId.isValid(listingId)) {
      await Listing.findByIdAndUpdate(listingId, { $inc: { "analytics.saves": 1 } });
    }
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
}
