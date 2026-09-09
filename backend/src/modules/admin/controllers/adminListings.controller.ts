import mongoose from "mongoose";
import { Response, NextFunction } from "express";
import { Listing } from "../../listings/models/Listing";
import { ListingModeration } from "../../listings/models/ListingModeration";
import { ListingRevision } from "../../listings/models/ListingRevision";
import { Notification } from "../../notifications/models/Notification";
import { AuditLog } from "../models/AuditLog";
import { AuthenticatedAdminRequest } from "../../../middleware/authenticateAdmin";
import { ListingStatus } from "../../../contracts";
import { convertImagesToCloudinary, convertVideoToCloudinary } from "../../../utils/cloudinaryUpload";

let listingsQueryCache: Record<string, { data: any[]; total: number; expiresAt: number }> = {};

export function invalidateListingsCache(): void {
  listingsQueryCache = {};
}

export async function getAdminListings(req: AuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 25));
    const skip = (page - 1) * limit;

    const query: Record<string, any> = {};
    if (req.query.status && req.query.status !== "ALL" && req.query.status !== "all") {
      const st = req.query.status as string;
      query.status = { $in: [st, st.toUpperCase(), st.toLowerCase()] };
    }

    if (req.query.categoryId) query.categoryId = req.query.categoryId;

    const cacheKey = `${JSON.stringify(query)}_${page}_${limit}`;
    const now = Date.now();

    if (listingsQueryCache[cacheKey] && listingsQueryCache[cacheKey].expiresAt > now) {
      res.status(200).json({
        success: true,
        data: listingsQueryCache[cacheKey].data,
        pagination: {
          page,
          limit,
          total: listingsQueryCache[cacheKey].total,
          totalPages: Math.ceil(listingsQueryCache[cacheKey].total / limit)
        }
      });
      return;
    }

    const [listings, total] = await Promise.all([
      Listing.find(query)
        .select("title description priceInPaise condition categoryId subcategoryId pincode area city status createdAt updatedAt sellerId sellerPhone images coverIndex")
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .read("nearest")
        .maxTimeMS(5000)
        .exec(),
      Listing.countDocuments(query).maxTimeMS(5000).exec()
    ]);

    const items = listings.map((l: any) => {
      const seller = l.sellerId;
      const sellerName = seller?.profile?.businessName || seller?.profile?.name || "Omeetso Seller";
      const sellerPhone = l.sellerPhone || l.whatsappPhone || seller?.profile?.phone || seller?.phone || seller?.mobile || "";

      return {
        id: l._id.toString(),
        _id: l._id.toString(),
        title: l.title,
        description: l.description || l.title,
        price: l.priceInPaise ? l.priceInPaise / 100 : 0,
        priceInPaise: l.priceInPaise,
        condition: l.condition || "Like New",
        categoryId: l.categoryId || "General",
        category: l.categoryId || "General",
        subcategoryId: l.subcategoryId || l.categoryId || "General",
        subcategory: l.subcategoryId || l.categoryId || "General",
        images: Array.isArray(l.images) && l.images.length > 0 ? l.images : ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400"],
        coverIndex: l.coverIndex || 0,
        pincode: l.pincode || "500081",
        area: l.area || "Madhapur",
        city: l.city || "Hyderabad",
        status: l.status,
        createdAt: l.createdAt,
        updatedAt: l.updatedAt || l.createdAt,
        seller: {
          id: seller?._id ? seller._id.toString() : (l.sellerId ? l.sellerId.toString() : "seller"),
          name: sellerName,
          phone: sellerPhone,
          verified: Boolean(seller?.verificationSummary?.mobileVerified || true)
        }
      };
    });

    listingsQueryCache[cacheKey] = {
      data: items,
      total,
      expiresAt: now + 15_000 // 15s TTL
    };

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

export async function approveListing(req: AuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.admin) {
      res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Admin required" } });
      return;
    }

    const { listingId } = req.params;
    const listing = await Listing.findById(listingId);

    if (!listing) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Listing not found" } });
      return;
    }

    const beforeState = { status: listing.status };

    listing.status = ListingStatus.APPROVED;
    listing.publishedAt = new Date();
    listing.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    await listing.save();

    // Update Moderation record
    await ListingModeration.findOneAndUpdate(
      { listingId: listing._id },
      {
        assignedAdminId: req.admin._id,
        assignedAdminName: req.admin.name,
        status: "completed",
        reviewNotes: "Listing approved by moderator"
      },
      { upsert: true }
    );

    // Create Server Audit Log (Server-derived actorAdminId)
    await AuditLog.create({
      actorAdminId: req.admin._id,
      actorName: req.admin.name,
      actorRole: req.admin.role,
      action: "LISTING_APPROVE",
      targetType: "Listing",
      targetId: listing._id.toString(),
      reason: req.body.reason || "Listing meets platform guidelines",
      before: beforeState,
      after: { status: listing.status },
      ipAddress: req.ip,
      userAgent: req.get("user-agent")
    });

    // Notify the listing owner
    if (listing.sellerId) {
      await Notification.create({
        userId: listing.sellerId,
        type: "listing_moderation",
        title: `Listing Approved: ${listing.title}`,
        body: `Your listing "${listing.title}" has been approved and is now live on Omeetso!`,
        link: `/product/${listing._id}`,
        thumbnail: listing.images?.[0]
      }).catch(() => { });
    }

    invalidateListingsCache();

    res.status(200).json({
      success: true,
      data: {
        id: listing._id.toString(),
        title: listing.title,
        status: listing.status,
        publishedAt: listing.publishedAt
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function rejectListing(req: AuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.admin) {
      res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Admin required" } });
      return;
    }

    const { listingId } = req.params;
    const { reason, section, correction } = req.body;

    const listing = await Listing.findById(listingId);
    if (!listing) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Listing not found" } });
      return;
    }

    const beforeState = { status: listing.status };

    listing.status = ListingStatus.REJECTED;
    listing.rejection = {
      reason: reason || "Listing violates platform content policies",
      section,
      correction,
      date: new Date()
    };
    await listing.save();

    await ListingModeration.findOneAndUpdate(
      { listingId: listing._id },
      {
        assignedAdminId: req.admin._id,
        assignedAdminName: req.admin.name,
        status: "completed",
        reviewNotes: reason
      },
      { upsert: true }
    );

    await AuditLog.create({
      actorAdminId: req.admin._id,
      actorName: req.admin.name,
      actorRole: req.admin.role,
      action: "LISTING_REJECT",
      targetType: "Listing",
      targetId: listing._id.toString(),
      reason: reason || "Content policy violation",
      before: beforeState,
      after: { status: listing.status },
      ipAddress: req.ip,
      userAgent: req.get("user-agent")
    });

    // Notify the listing owner with specific action/reason
    if (listing.sellerId) {
      await Notification.create({
        userId: listing.sellerId,
        type: "listing_moderation",
        title: `Action Required on Listing: ${listing.title}`,
        body: reason || "Your listing requires clearer images or additional details. Please edit your listing to update photos.",
        link: `/listing/${listing._id}/edit`,
        thumbnail: listing.images?.[0]
      }).catch(() => { });
    }

    invalidateListingsCache();

    res.status(200).json({
      success: true,
      data: {
        id: listing._id.toString(),
        status: listing.status,
        rejection: listing.rejection
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function createAdminListing(req: AuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.admin) {
      res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Admin required" } });
      return;
    }

    const {
      title,
      description,
      priceInPaise,
      price,
      categoryId,
      subcategoryId,
      condition,
      images,
      coverIndex,
      city,
      area,
      pincode,
      specs,
      status = ListingStatus.APPROVED
    } = req.body;

    const computedPriceInPaise = priceInPaise ? Number(priceInPaise) : price ? Math.round(Number(price) * 100) : 0;

    const rawImages = Array.isArray(images) && images.length > 0 ? images : ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400"];
    const [processedImages, processedVideo] = await Promise.all([
      convertImagesToCloudinary(rawImages, "omeetso/listings"),
      req.body.videoUrl ? convertVideoToCloudinary(req.body.videoUrl, "omeetso/listing_videos") : Promise.resolve(req.body.videoUrl)
    ]);

    const listing = await Listing.create({
      sellerId: req.admin._id,
      title: title || "New Product Listing",
      description: description || title || "Product listed by Administrator",
      priceInPaise: computedPriceInPaise,
      negotiable: true,
      condition: condition || "like_new",
      categoryId: categoryId || "mobiles",
      subcategoryId: subcategoryId || categoryId || "smartphones",
      images: processedImages,
      coverIndex: coverIndex || 0,
      videoUrl: processedVideo,
      city: city || "Hyderabad",
      area: area || "Madhapur",
      pincode: pincode || "500081",
      specs: specs || {},
      status: status.toUpperCase() === "PENDING_REVIEW" ? ListingStatus.SUBMITTED : (status.toUpperCase() as any) || ListingStatus.APPROVED,
      publishedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });

    await ListingModeration.create({
      listingId: listing._id,
      assignedAdminId: req.admin._id,
      assignedAdminName: req.admin.name,
      status: "completed",
      version: 1
    });

    invalidateListingsCache();

    res.status(201).json({
      success: true,
      data: {
        id: listing._id.toString(),
        title: listing.title,
        priceInPaise: listing.priceInPaise,
        price: listing.priceInPaise / 100,
        status: listing.status,
        createdAt: listing.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function updateAdminListing(req: AuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.admin) {
      res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Admin required" } });
      return;
    }

    const { listingId } = req.params;
    const updateData = { ...req.body };

    if (updateData.price && !updateData.priceInPaise) {
      updateData.priceInPaise = Math.round(Number(updateData.price) * 100);
    }
    if (updateData.status) {
      updateData.status = updateData.status.toUpperCase();
    }
    if (updateData.images && Array.isArray(updateData.images) && updateData.images.length > 0) {
      updateData.images = await convertImagesToCloudinary(updateData.images, "omeetso/listings");
    }
    if (updateData.videoUrl && typeof updateData.videoUrl === "string" && updateData.videoUrl.startsWith("data:")) {
      updateData.videoUrl = await convertVideoToCloudinary(updateData.videoUrl, "omeetso/listing_videos");
    }

    const listing = await Listing.findByIdAndUpdate(listingId, updateData, { new: true });
    if (!listing) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Listing not found" } });
      return;
    }

    invalidateListingsCache();

    res.status(200).json({
      success: true,
      data: {
        id: listing._id.toString(),
        title: listing.title,
        status: listing.status,
        priceInPaise: listing.priceInPaise,
        price: listing.priceInPaise / 100
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteAdminListing(req: AuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.admin) {
      res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Admin required" } });
      return;
    }

    const listingId = String(req.params.listingId || "");
    const isObjectId = mongoose.Types.ObjectId.isValid(listingId);
    const listing = isObjectId
      ? await Listing.findById(listingId)
      : await Listing.findOne({ slug: listingId });

    if (!listing) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Listing not found" } });
      return;
    }

    const targetId = listing._id;
    const targetTitle = listing.title;

    // Permanently remove product listing from MongoDB
    await Listing.findByIdAndDelete(targetId);

    // Clean up associated moderation entries and revisions
    await Promise.allSettled([
      ListingModeration.deleteMany({ listingId: targetId }),
      ListingRevision.deleteMany({ listingId: targetId })
    ]);

    // Create Audit Log
    await AuditLog.create({
      actorAdminId: req.admin._id,
      actorName: req.admin.name,
      actorRole: req.admin.role,
      action: "LISTING_DELETE",
      targetType: "Listing",
      targetId: targetId.toString(),
      reason: req.body?.reason || "Admin permanently deleted product listing from database",
      before: { title: targetTitle, status: listing.status, priceInPaise: listing.priceInPaise },
      after: null,
      ipAddress: req.ip,
      userAgent: req.get("user-agent")
    }).catch(() => { });

    invalidateListingsCache();

    res.status(200).json({
      success: true,
      message: "Listing permanently deleted from database",
      data: { id: targetId.toString(), title: targetTitle }
    });
  } catch (error) {
    next(error);
  }
}

export async function updateAdminListingStatus(req: AuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.admin) {
      res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Admin required" } });
      return;
    }

    const { listingId } = req.params;
    const { status, reason } = req.body;

    let targetStatus = ListingStatus.APPROVED;
    const upper = (status || "").toUpperCase();

    if (upper === "REJECTED") targetStatus = ListingStatus.REJECTED;
    else if (upper === "REMOVED") targetStatus = ListingStatus.REMOVED;
    else if (upper === "EXPIRED") targetStatus = ListingStatus.EXPIRED;
    else if (upper === "PENDING_REVIEW" || upper === "SUBMITTED") targetStatus = ListingStatus.SUBMITTED;
    else if (upper === "CHANGES_REQUIRED" || upper === "REQUIRES_CHANGES") targetStatus = ListingStatus.CHANGES_REQUIRED;
    else targetStatus = ListingStatus.APPROVED;

    const listing = await Listing.findByIdAndUpdate(
      listingId,
      {
        status: targetStatus,
        publishedAt: targetStatus === ListingStatus.APPROVED ? new Date() : undefined,
        rejection: targetStatus === ListingStatus.REJECTED ? { reason: reason || "Policy violation", date: new Date() } : undefined
      },
      { new: true }
    );

    if (!listing) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Listing not found" } });
      return;
    }

    await ListingModeration.findOneAndUpdate(
      { listingId: listing._id },
      {
        assignedAdminId: req.admin._id,
        assignedAdminName: req.admin.name,
        status: "completed",
        reviewNotes: reason || `Status updated to ${targetStatus}`
      },
      { upsert: true }
    );

    if (listing.sellerId) {
      let notifTitle = `Listing Status: ${listing.title}`;
      let notifBody = reason || `Your listing status has been updated to ${targetStatus.toLowerCase().replace("_", " ")}.`;
      let notifLink = `/product/${listing._id}`;

      if (targetStatus === ListingStatus.CHANGES_REQUIRED) {
        notifTitle = `Action Required: Photos/Details for "${listing.title}"`;
        notifBody = reason || "Your product photos appear blurry, unclear, or require additional angle details. Please tap here to upload clearer images.";
        notifLink = `/listing/${listing._id}/edit`;
      } else if (targetStatus === ListingStatus.REJECTED) {
        notifTitle = `Listing Moderation Update: ${listing.title}`;
        notifBody = reason || "Your listing was not approved. Please review our product image and quality guidelines.";
        notifLink = `/listing/${listing._id}/edit`;
      } else if (targetStatus === ListingStatus.APPROVED) {
        notifTitle = `Listing Approved: ${listing.title}`;
        notifBody = `Your listing "${listing.title}" has been approved and is now active on Omeetso!`;
        notifLink = `/product/${listing._id}`;
      }

      await Notification.create({
        userId: listing.sellerId,
        type: "listing_moderation",
        title: notifTitle,
        body: notifBody,
        link: notifLink,
        thumbnail: listing.images?.[0]
      }).catch(() => { });
    }

    invalidateListingsCache();

    res.status(200).json({
      success: true,
      data: {
        id: listing._id.toString(),
        status: listing.status
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getAdminListingById(req: AuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const listingId = (req.params.listingId || req.params.id) as string;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(listingId);

    const listing = isObjectId
      ? await Listing.findById(listingId)
        .populate("sellerId", "profile.name profile.businessName profile.avatar profile.city profile.area profile.phone phone mobile accountType verificationSummary createdAt")
        .populate("storeId", "name slug logo cover rating reviewCount phone")
        .lean()
      : await Listing.findOne({ slug: listingId } as any)
        .populate("sellerId", "profile.name profile.businessName profile.avatar profile.city profile.area profile.phone phone mobile accountType verificationSummary createdAt")
        .populate("storeId", "name slug logo cover rating reviewCount phone")
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

    const moderation = await ListingModeration.findOne({ listingId: listing._id }).lean();

    res.status(200).json({
      success: true,
      data: {
        id: listing._id.toString(),
        title: listing.title,
        description: listing.description,
        price: listing.priceInPaise ? listing.priceInPaise / 100 : 0,
        priceInPaise: listing.priceInPaise,
        negotiable: listing.negotiable,
        pricingType: listing.negotiable ? "NEGOTIABLE" : "FIXED",
        free: listing.free,
        condition: listing.condition || "Like New",
        categoryId: listing.categoryId,
        category: listing.categoryId,
        subcategoryId: listing.subcategoryId,
        subcategory: listing.subcategoryId,
        images: listing.images || [],
        coverIndex: listing.coverIndex || 0,
        videoUrl: listing.videoUrl,
        whatsappPhone: listing.whatsappPhone || seller?.profile?.phone || seller?.phone || "",
        sellerPhone: (listing as any).sellerPhone || listing.whatsappPhone || seller?.profile?.phone || seller?.phone || seller?.mobile || "",
        enableWhatsapp: listing.enableWhatsapp ?? true,
        pincode: listing.pincode || "500081",
        area: listing.area || "Madhapur",
        city: listing.city || "Hyderabad",
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
        storeId: store?._id?.toString() || (typeof listing.storeId === "string" ? listing.storeId : undefined),
        storeName: store?.name,
        sellerName: sellerDisplayName,
        sellerOwnerName: seller?.profile?.name,
        sellerId: seller?._id?.toString() || (typeof listing.sellerId === "string" ? listing.sellerId : "u_seller"),
        sellerRiskScore: seller?.verificationSummary?.riskScore || 94,
        seller: seller
          ? {
            id: seller._id.toString(),
            name: sellerDisplayName,
            ownerName: seller.profile?.name,
            businessName: businessName,
            type: isBusiness ? "business" : "individual",
            avatar: seller.profile?.avatar || store?.logo,
            city: seller.profile?.city || store?.city || listing.city,
            area: seller.profile?.area || listing.area || store?.area || "Hyderabad",
            phone: seller.profile?.phone || seller.phone || seller.mobile || "",
            memberSince: seller.profile?.memberSince || seller.createdAt,
            verificationSummary: seller.verificationSummary || { riskScore: 94 }
          }
          : undefined,
        moderation: moderation || undefined,
        createdAt: listing.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
}
