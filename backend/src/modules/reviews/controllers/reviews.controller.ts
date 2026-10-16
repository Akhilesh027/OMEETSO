import { Request, Response, NextFunction } from "express";
import { Review } from "../models/Review";
import { Store } from "../../stores/models/Store";
import { User } from "../../users/models/User";
import { Listing } from "../../listings/models/Listing";
import { getCleanAvatar } from "../../../utils/avatarSvgs";
import mongoose from "mongoose";
import { getIO } from "../../../sockets/socket-server";

export async function createReview(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { targetId, targetType, rating, comment, tags, listingId, buyerName, targetName, listingTitle } = req.body;
    const buyerId = (req as any).user?._id || new mongoose.Types.ObjectId();
    const finalBuyerName = buyerName || (req as any).user?.profile?.name || (req as any).user?.email || "Verified Buyer";
    const buyerAvatar = getCleanAvatar((req as any).user?.profile?.avatar, finalBuyerName);

    if (!targetId || !targetType || !rating || !comment) {
      res.status(400).json({ success: false, error: { message: "targetId, targetType, rating and comment are required." } });
      return;
    }

    let finalTargetName = targetName;
    if (!finalTargetName) {
      if (targetType === "STORE" && mongoose.Types.ObjectId.isValid(targetId)) {
        const store = await Store.findById(targetId).select("name");
        if (store) finalTargetName = store.name;
      } else if (mongoose.Types.ObjectId.isValid(targetId)) {
        const user = await User.findById(targetId).select("profile.name email");
        if (user) finalTargetName = user.profile?.name || user.email || "Seller";
      }
    }
    if (!finalTargetName) finalTargetName = targetType === "STORE" ? "Store Partner" : "Marketplace Seller";

    let finalListingTitle = listingTitle;
    if (!finalListingTitle && listingId && mongoose.Types.ObjectId.isValid(listingId)) {
      const listing = await Listing.findById(listingId).select("title");
      if (listing) finalListingTitle = listing.title;
    }

    const review = await Review.create({
      buyerId,
      buyerName: finalBuyerName,
      buyerAvatar,
      targetId,
      targetName: finalTargetName,
      targetType: targetType.toUpperCase(),
      listingId,
      listingTitle: finalListingTitle,
      rating: Math.min(5, Math.max(1, Number(rating))),
      comment,
      tags: Array.isArray(tags) ? tags : [],
      status: "APPROVED"
    });

    // Recalculate target store rating if targetType is STORE
    if (targetType === "STORE" && mongoose.Types.ObjectId.isValid(targetId)) {
      const allStoreReviews = await Review.find({ targetId, status: "APPROVED" });
      const totalCount = allStoreReviews.length;
      const avgRating = totalCount > 0
        ? Number((allStoreReviews.reduce((acc, r) => acc + r.rating, 0) / totalCount).toFixed(1))
        : 0;

      await Store.findByIdAndUpdate(targetId, {
        rating: avgRating,
        reviewCount: totalCount
      });
    }

    // Broadcast Real-Time Review Event to Admin & Clients
    try {
      const io = getIO();
      if (io) {
        const reviewPayload = {
          id: review._id.toString(),
          reviewerName: review.buyerName,
          reviewerId: review.buyerId?.toString(),
          targetName: review.targetName,
          targetType: review.targetType.toLowerCase(),
          rating: review.rating,
          comment: review.comment,
          tags: review.tags,
          isReported: Boolean(review.isReported),
          status: "published",
          createdAt: review.createdAt.toISOString()
        };
        io.emit("admin:review:new", reviewPayload);
        io.to("admin:monitoring").emit("admin:review:new", reviewPayload);
        io.emit("review:created", reviewPayload);
      }
    } catch (socketErr) {
      console.warn("[Reviews] Socket emit warning:", socketErr);
    }

    res.status(201).json({
      success: true,
      message: "Review submitted successfully!",
      data: review
    });
  } catch (error) {
    next(error);
  }
}

export async function getPublicReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const targetId = req.params.targetId;
    const reviews = await Review.find({ targetId, status: "APPROVED" })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
}

export async function getAdminReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const status = req.query.status as string;
    const query: Record<string, any> = {};
    if (status && status !== "ALL") {
      if (status.toLowerCase() === "published" || status.toUpperCase() === "APPROVED") {
        query.status = "APPROVED";
      } else if (status.toLowerCase() === "hidden" || status.toUpperCase() === "REJECTED") {
        query.status = "REJECTED";
      } else if (status.toLowerCase() === "reported" || status.toLowerCase() === "under_review" || status.toUpperCase() === "PENDING") {
        query.$or = [{ status: "PENDING" }, { isReported: true }];
      } else {
        query.status = status.toUpperCase();
      }
    }

    const reviews = await Review.find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    const formatted = reviews.map((r: any) => ({
      id: r._id.toString(),
      reviewerName: r.buyerName || "Verified Buyer",
      reviewerId: r.buyerId?.toString(),
      targetName: r.targetName || (r.targetType === "STORE" ? "Store Partner" : "Marketplace Seller"),
      targetType: (r.targetType || "seller").toLowerCase(),
      rating: r.rating || 5,
      comment: r.comment || "",
      tags: r.tags || [],
      isReported: Boolean(r.isReported) || r.status === "PENDING",
      status: r.status === "APPROVED" ? "published" : r.status === "REJECTED" ? "hidden" : "under_review",
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString()
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    next(error);
  }
}

export async function updateReviewStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    let { status, isReported } = req.body;
    let mappedStatus = "APPROVED";
    if (status === "published" || status === "APPROVED") mappedStatus = "APPROVED";
    else if (status === "hidden" || status === "REJECTED") mappedStatus = "REJECTED";
    else mappedStatus = "PENDING";

    const updateFields: Record<string, any> = { status: mappedStatus };
    if (typeof isReported === "boolean") {
      updateFields.isReported = isReported;
    } else if (mappedStatus === "APPROVED") {
      updateFields.isReported = false;
    }

    const updated = await Review.findByIdAndUpdate(
      id,
      updateFields,
      { new: true }
    );

    if (updated) {
      try {
        const io = getIO();
        if (io) {
          const payload = {
            id: updated._id.toString(),
            status: mappedStatus === "APPROVED" ? "published" : mappedStatus === "REJECTED" ? "hidden" : "under_review",
            isReported: Boolean(updated.isReported)
          };
          io.emit("admin:review:status_updated", payload);
          io.to("admin:monitoring").emit("admin:review:status_updated", payload);
        }
      } catch (err) {}
    }

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
}

export async function deleteReview(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    await Review.findByIdAndDelete(id);

    try {
      const io = getIO();
      if (io) {
        io.emit("admin:review:deleted", { id });
        io.to("admin:monitoring").emit("admin:review:deleted", { id });
      }
    } catch (err) {}

    res.status(200).json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    next(error);
  }
}
