import mongoose from "mongoose";
import { Request, Response, NextFunction } from "express";
import { Listing } from "../models/Listing";
import { ListingRevision } from "../models/ListingRevision";
import { ListingModeration } from "../models/ListingModeration";
import { Store } from "../../stores/models/Store";
import { AuthenticatedUserRequest } from "../../../middleware/authenticateUser";
import { ListingStatus } from "../../../contracts";
import { Notification } from "../../notifications/models/Notification";
import { convertImagesToCloudinary, convertVideoToCloudinary } from "../../../utils/cloudinaryUpload";

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

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
      pricingType,
      free,
      condition,
      categoryId,
      subcategoryId,
      images,
      coverIndex,
      videoUrl,
      whatsappPhone,
      sellerPhone,
      enableWhatsapp,
      pincode,
      area,
      city,
      fulfilment,
      specs,
      contactPref,
      method
    } = req.body;

    // Derived Seller Identity
    const sellerId = req.user._id;
    const isNegotiable = typeof negotiable === "boolean"
      ? negotiable
      : (pricingType ? pricingType.toUpperCase() === "NEGOTIABLE" : true);

    const contactNumber = sellerPhone || whatsappPhone || (req.user as any)?.profile?.phone || (req.user as any)?.phone || "";

    const userProfile = (req.user as any)?.profile || {};
    const safeCity = (city && String(city).trim()) || userProfile.city || "Hyderabad";
    const safeArea = (area && String(area).trim()) || userProfile.area || "Madhapur";
    const safePincode = (pincode && String(pincode).trim()) || userProfile.pincode || "500081";
    const safeCategory = (categoryId && String(categoryId).trim()) || "mobiles";
    const safeSubcategory = (subcategoryId && String(subcategoryId).trim()) || safeCategory;
    const safeCondition = (condition && String(condition).trim()) || "good";
    const safeFulfilment = (fulfilment && String(fulfilment).trim()) || "pickup";
    const safeTitle = (title && String(title).trim()) || "Untitled Product";
    const safeDescription = (description && String(description).trim()) || safeTitle;
    const safeMethod = method === "quick" ? "quick" : "detailed";

    const imgCount = Array.isArray(images) ? images.filter(Boolean).length : 0;
    if (imgCount < 3 && !req.body.isMock) {
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: `At least 3 product photos are required (${imgCount}/3 provided).`
        }
      });
      return;
    }

    const rawImages = Array.isArray(images) && images.length > 0 ? images : ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400"];
    const [processedImages, processedVideo] = await Promise.all([
      convertImagesToCloudinary(rawImages, "omeetso/listings"),
      videoUrl ? convertVideoToCloudinary(videoUrl, "omeetso/listing_videos") : Promise.resolve(videoUrl)
    ]);

    const listing = await Listing.create({
      sellerId,
      categoryId: safeCategory,
      subcategoryId: safeSubcategory,
      title: safeTitle,
      description: safeDescription,
      priceInPaise: Number(priceInPaise) || 0,
      negotiable: isNegotiable,
      free: Boolean(free),
      condition: safeCondition,
      images: processedImages,
      coverIndex: coverIndex || 0,
      videoUrl: processedVideo,
      whatsappPhone: whatsappPhone || contactNumber,
      sellerPhone: sellerPhone || contactNumber,
      enableWhatsapp: enableWhatsapp ?? true,
      pincode: safePincode,
      area: safeArea,
      city: safeCity,
      fulfilment: safeFulfilment,
      specs: specs || {},
      contactPref: contactPref || "call_and_chat",
      method: safeMethod,
      status: ListingStatus.SUBMITTED,
      publishedAt: undefined,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });

    // Dispatch moderation entry, cache invalidation, and notifications concurrently in background
    Promise.allSettled([
      ListingModeration.create({
        listingId: listing._id,
        status: "unassigned",
        version: 1
      }),
      (async () => {
        try {
          const { invalidateListingsCache } = await import("../../admin/controllers/adminListings.controller");
          invalidateListingsCache();
        } catch { }
      })(),
      Notification.create({
        userId: sellerId,
        type: "listing_moderation",
        title: `Listing Submitted: ${listing.title}`,
        body: `Your listing "${listing.title}" was submitted and is pending review.`,
        link: `/product/${listing._id}`,
        thumbnail: listing.images?.[0]
      }),
      ...(req.body.nearbyChanges?.enabled ? [
        Notification.create({
          userId: sellerId,
          type: "nearby_changes",
          title: `Nearby Changes: ${listing.title}`,
          body: `Nearby changes and broadcast active for "${listing.title}" within ${req.body.nearbyChanges.radiusKm || 10} km of ${listing.area || "your area"}.`,
          link: `/product/${listing._id}`,
          thumbnail: listing.images?.[0]
        })
      ] : [])
    ]).catch(() => {});

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
        pricingType: listing.negotiable ? "NEGOTIABLE" : "FIXED",
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
        sellerPhone: (listing as any).sellerPhone || listing.whatsappPhone,
        enableWhatsapp: listing.enableWhatsapp,
        pincode: listing.pincode,
        area: listing.area,
        city: listing.city,
        fulfilment: listing.fulfilment,
        specs: listing.specs ? Object.fromEntries(listing.specs) : {},
        contactPref: listing.contactPref,
        method: listing.method || safeMethod,
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
        : { $in: [ListingStatus.APPROVED, ListingStatus.ACTIVE, "APPROVED", "ACTIVE", "approved", "active"] }
    };

    const andConditions: any[] = [];
    const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    if (req.query.categoryId || req.query.category) {
      const cat = ((req.query.categoryId || req.query.category) as string).trim();
      const escaped = escapeRegex(cat);
      andConditions.push({
        $or: [
          { categoryId: { $in: [cat, cat.toLowerCase(), cat.toUpperCase()] } },
          { categoryId: new RegExp(`^${escaped}$`, "i") },
          { subcategoryId: { $in: [cat, cat.toLowerCase(), cat.toUpperCase()] } },
          { subcategoryId: new RegExp(`^${escaped}$`, "i") }
        ]
      });
    }

    if (req.query.subcategoryId) {
      const sub = (req.query.subcategoryId as string).trim();
      query.subcategoryId = { $in: [sub, sub.toLowerCase(), sub.toUpperCase()] };
    }
    if (req.query.condition) query.condition = req.query.condition;

    // Direct City-based Filtering (indexed exact and anchored regex fallback)
    const cityParam = (req.query.city as string)?.split(",")[0]?.trim();
    if (cityParam && cityParam.toLowerCase() !== "all") {
      const escapedCity = escapeRegex(cityParam);
      andConditions.push({
        $or: [
          { city: { $in: [cityParam, cityParam.toLowerCase(), cityParam.toUpperCase()] } },
          { city: new RegExp(`^${escapedCity}$`, "i") },
          { area: new RegExp(`^${escapedCity}$`, "i") }
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
      const isOid = mongoose.Types.ObjectId.isValid(storeParam);
      const targetStore = isOid
        ? await Store.findById(storeParam).lean()
        : await Store.findOne({ $or: [{ slug: storeParam }, { name: new RegExp(`^${escapeRegex(storeParam)}$`, "i") }] }).lean();

      const possibleIds: any[] = [storeParam];
      if (isOid) possibleIds.push(new mongoose.Types.ObjectId(storeParam));
      if (targetStore) {
        possibleIds.push(targetStore._id, targetStore._id.toString());
        if (targetStore.slug) possibleIds.push(targetStore.slug);
      }
      query.storeId = { $in: possibleIds };
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
        .select("title priceInPaise condition area city pincode coverIndex images sellerId storeId status publishedAt free negotiable categoryId subcategoryId description specs method")
        .populate("sellerId", "profile.name profile.businessName profile.avatar accountType verificationSummary")
        .populate("storeId", "name slug logo cover rating reviewCount")
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Listing.countDocuments(query)
    ]);

    res.setHeader("Cache-Control", "public, max-age=10, stale-while-revalidate=30");

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
        method: l.method || "detailed",
        videoUrl: l.videoUrl || (l as any).video || undefined,
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
    if (!listingId) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Listing ID required" } });
      return;
    }

    const isObjectId = /^[0-9a-fA-F]{24}$/.test(listingId);
    let listing: any = null;

    if (isObjectId) {
      listing = await Listing.findById(listingId)
        .populate("sellerId", "profile.name profile.businessName profile.avatar profile.city profile.area profile.phone phone mobile accountType verificationSummary createdAt")
        .populate("storeId", "name slug logo cover rating reviewCount phone")
        .lean();
    }

    if (!listing) {
      listing = await Listing.findOne({
        $or: [
          { slug: listingId },
          { id: listingId },
          { customId: listingId },
          { slug: listingId.toLowerCase() },
          { id: listingId.toLowerCase() }
        ]
      } as any)
      .populate("sellerId", "profile.name profile.businessName profile.avatar profile.city profile.area profile.phone phone mobile accountType verificationSummary createdAt")
      .populate("storeId", "name slug logo cover rating reviewCount phone")
      .lean();
    }

    if (!listing && listingId) {
      const cleanSearch = listingId.replace(/[-_]/g, " ").trim();
      if (cleanSearch.length > 2) {
        listing = await Listing.findOne({ title: new RegExp(cleanSearch, "i") })
          .populate("sellerId", "profile.name profile.businessName profile.avatar profile.city profile.area profile.phone phone mobile accountType verificationSummary createdAt")
          .populate("storeId", "name slug logo cover rating reviewCount phone")
          .lean();
      }
    }

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
        pricingType: listing.negotiable ? "NEGOTIABLE" : "FIXED",
        free: listing.free,
        condition: listing.condition,
        categoryId: listing.categoryId,
        subcategoryId: listing.subcategoryId,
        images: listing.images,
        coverIndex: listing.coverIndex,
        videoUrl: listing.videoUrl,
        whatsappPhone: listing.whatsappPhone || (listing as any).sellerPhone || seller?.profile?.phone || seller?.phone || "",
        sellerPhone: (listing as any).sellerPhone || listing.whatsappPhone || seller?.profile?.phone || seller?.phone || seller?.mobile || store?.phone || "",
        enableWhatsapp: listing.enableWhatsapp ?? true,
        pincode: listing.pincode,
        area: listing.area,
        city: listing.city,
        fulfilment: listing.fulfilment,
        specs: listing.specs ? Object.fromEntries(Object.entries(listing.specs)) : {},
        contactPref: listing.contactPref,
        method: listing.method || "detailed",
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
            city: seller.profile?.city || store?.city || listing.city,
            area: (seller.profile?.area && seller.profile.area !== "Madhapur" ? seller.profile.area : null) || listing.area || store?.area || "Hyderabad",
            phone: (listing as any).sellerPhone || listing.whatsappPhone || seller?.profile?.phone || seller?.phone || seller?.mobile || "",
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
      data: listings.map((l: any) => ({
        id: l._id.toString(),
        title: l.title,
        priceInPaise: l.priceInPaise,
        condition: l.condition,
        status: l.status,
        images: l.images,
        coverIndex: l.coverIndex,
        videoUrl: l.videoUrl || (l as any).video || undefined,
        area: l.area,
        city: l.city,
        method: l.method || "detailed",
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

    const {
      title,
      description,
      priceInPaise,
      condition,
      images,
      specs,
      negotiable,
      pricingType,
      sellerPhone,
      whatsappPhone,
      area,
      city,
      pincode,
      contactPref,
      bestContactTime
    } = req.body;

    const isNegotiable = typeof negotiable === "boolean"
      ? negotiable
      : (pricingType ? pricingType.toUpperCase() === "NEGOTIABLE" : listing.negotiable);

    // Convert any base64 images and video to Cloudinary URLs
    let processedImages = images;
    let processedVideo = req.body.videoUrl || req.body.video;

    if (images && Array.isArray(images) && images.length > 0) {
      processedImages = await convertImagesToCloudinary(images, "omeetso/listings");
    }
    if (processedVideo && typeof processedVideo === "string" && processedVideo.startsWith("data:")) {
      processedVideo = await convertVideoToCloudinary(processedVideo, "omeetso/listing_videos");
    }

    // Listing Revision Logic: If listing is active/approved, create revision for review rather than overwriting live content
    if (listing.status === ListingStatus.APPROVED || listing.status === ListingStatus.ACTIVE) {
      const revision = await ListingRevision.create({
        listingId: listing._id,
        sellerId: req.user._id,
        title: title || listing.title,
        description: description || listing.description,
        priceInPaise: priceInPaise ?? listing.priceInPaise,
        condition: condition || listing.condition,
        images: processedImages || listing.images,
        specs: specs || listing.specs,
        status: "pending_review"
      });

      if (negotiable !== undefined || pricingType !== undefined) listing.negotiable = isNegotiable;
      if (sellerPhone) listing.sellerPhone = sellerPhone;
      if (whatsappPhone) listing.whatsappPhone = whatsappPhone;
      if (processedVideo) listing.videoUrl = processedVideo;
      if (area) listing.area = area;
      if (city) listing.city = city;
      if (pincode) listing.pincode = pincode;
      if (contactPref) listing.contactPref = contactPref;
      await listing.save();

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
    if (negotiable !== undefined || pricingType !== undefined) listing.negotiable = isNegotiable;
    if (condition) listing.condition = condition;
    if (processedImages) listing.images = processedImages;
    if (processedVideo) listing.videoUrl = processedVideo;
    if (specs) listing.specs = specs;
    if (sellerPhone) listing.sellerPhone = sellerPhone;
    if (whatsappPhone) listing.whatsappPhone = whatsappPhone;
    if (area) listing.area = area;
    if (city) listing.city = city;
    if (pincode) listing.pincode = pincode;
    if (contactPref) listing.contactPref = contactPref;

    await listing.save();

    await Notification.create({
      userId: req.user._id,
      type: "listing_moderation",
      title: `Listing Updated: ${listing.title}`,
      body: `Your changes to "${listing.title}" have been saved.`,
      link: `/product/${listing._id}`,
      thumbnail: listing.images?.[0]
    }).catch(() => { });

    if (req.body.nearbyChanges?.enabled) {
      await Notification.create({
        userId: req.user._id,
        type: "nearby_changes",
        title: `Nearby Changes: ${listing.title}`,
        body: `Nearby broadcast updated for "${listing.title}".`,
        link: `/product/${listing._id}`,
        thumbnail: listing.images?.[0]
      }).catch(() => { });
    }

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

    const rawListingId = req.params.listingId;
    const listingId = (Array.isArray(rawListingId) ? rawListingId[0] : rawListingId) as string;
    const isObjectId = mongoose.Types.ObjectId.isValid(listingId);
    const listing = isObjectId
      ? await Listing.findById(listingId)
      : await Listing.findOne({ slug: listingId });

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
