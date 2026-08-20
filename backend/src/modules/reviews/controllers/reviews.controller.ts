import { Request, Response, NextFunction } from "express";
import { Review } from "../models/Review";
import { Store } from "../../stores/models/Store";
import { User } from "../../users/models/User";
import mongoose from "mongoose";

export async function createReview(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { targetId, targetType, rating, comment, tags, listingId, buyerName } = req.body;
    const buyerId = (req as any).user?._id || new mongoose.Types.ObjectId();
    const finalBuyerName = buyerName || (req as any).user?.profile?.name || "Verified Buyer";
    const buyerAvatar = (req as any).user?.profile?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150";

    if (!targetId || !targetType || !rating || !comment) {
      res.status(400).json({ success: false, error: { message: "targetId, targetType, rating and comment are required." } });
      return;
    }

    const review = await Review.create({
      buyerId,
      buyerName: finalBuyerName,
      buyerAvatar,
      targetId,
      targetType,
      listingId,
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
        : 4.9;

      await Store.findByIdAndUpdate(targetId, {
        rating: avgRating,
        reviewCount: totalCount
      });
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
    if (status) query.status = status.toUpperCase();

    const reviews = await Review.find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
}

export async function updateReviewStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await Review.findByIdAndUpdate(
      id,
      { status: (status || "APPROVED").toUpperCase() },
      { new: true }
    );

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
}

export async function deleteReview(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    await Review.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    next(error);
  }
}
