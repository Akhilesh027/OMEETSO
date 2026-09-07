import { Response, NextFunction } from "express";
import { Listing } from "../../listings/models/Listing";
import { ListingModeration } from "../../listings/models/ListingModeration";
import { AuditLog } from "../models/AuditLog";
import { AuthenticatedAdminRequest } from "../../../middleware/authenticateAdmin";
import { ListingStatus } from "../../../contracts";

let cachedListings: any[] | null = null;
let lastCacheTime = 0;
const CACHE_TTL = 60 * 1000; // 60 seconds

export function invalidateListingsCache() {
  cachedListings = null;
  lastCacheTime = 0;
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

    const isDefaultQuery = Object.keys(query).length === 0;

    if (isDefaultQuery && cachedListings && cachedListings.length > 0 && (Date.now() - lastCacheTime < CACHE_TTL)) {
      console.log("[getAdminListings] Serving from in-memory cache (Instant 1ms response)");
      const paged = cachedListings.slice(skip, skip + limit);
      res.status(200).json({
        success: true,
        data: paged,
        pagination: {
          page,
          limit,
          total: cachedListings.length,
          totalPages: Math.ceil(cachedListings.length / limit)
        }
      });
      return;
    }

    console.log("[getAdminListings] START - query:", JSON.stringify(query), "skip:", skip, "limit:", limit);

    console.log("[getAdminListings] Executing Listing.find()...");
    const listings = await Listing.find(query, {
      title: 1,
      priceInPaise: 1,
      condition: 1,
      categoryId: 1,
      subcategoryId: 1,
      pincode: 1,
      area: 1,
      city: 1,
      status: 1,
      createdAt: 1,
      sellerId: 1,
      sellerPhone: 1,
      whatsappPhone: 1,
      coverIndex: 1,
      images: { $slice: 1 }
    }).lean();
    console.log("[getAdminListings] Listing.find() SUCCESS! Items found:", listings.length);

    const items = listings.map((l: any) => ({
      id: l._id.toString(),
      title: l.title,
      description: l.description,
      priceInPaise: l.priceInPaise,
      condition: l.condition,
      categoryId: l.categoryId,
      subcategoryId: l.subcategoryId,
      images: l.images || [],
      coverIndex: l.coverIndex || 0,
      pincode: l.pincode,
      area: l.area,
      city: l.city,
      status: l.status,
      createdAt: l.createdAt,
      seller: {
        id: l.sellerId ? l.sellerId.toString() : "seller",
        name: "Omeetso Seller",
        phone: l.sellerPhone || l.whatsappPhone || "",
        verified: true
      }
    }));

    if (isDefaultQuery && items.length > 0) {
      cachedListings = items;
      lastCacheTime = Date.now();
    }

    const paged = items.slice(skip, skip + limit);

    res.status(200).json({
      success: true,
      data: paged,
      pagination: {
        page,
        limit,
        total: items.length,
        totalPages: Math.ceil(items.length / limit)
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

    const listing = await Listing.create({
      sellerId: req.admin._id,
      title: title || "New Product Listing",
      description: description || title || "Product listed by Administrator",
      priceInPaise: computedPriceInPaise,
      negotiable: true,
      condition: condition || "like_new",
      categoryId: categoryId || "mobiles",
      subcategoryId: subcategoryId || categoryId || "smartphones",
      images: Array.isArray(images) && images.length > 0 ? images : ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400"],
      coverIndex: coverIndex || 0,
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

    const listing = await Listing.findByIdAndUpdate(listingId, updateData, { new: true });
    if (!listing) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Listing not found" } });
      return;
    }

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

    const { listingId } = req.params;
    const listing = await Listing.findByIdAndUpdate(listingId, { status: ListingStatus.REMOVED }, { new: true });

    if (!listing) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Listing not found" } });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Listing marked as removed",
      data: { id: listing._id.toString(), status: listing.status }
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
