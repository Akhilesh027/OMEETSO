import { Router } from "express";
import {
  createReview,
  getPublicReviews,
  getAdminReviews,
  updateReviewStatus,
  deleteReview
} from "../controllers/reviews.controller";

export const reviewsRouter = Router();
export const adminReviewsRouter = Router();

// Public & Buyer Routes
reviewsRouter.post("/", createReview);
reviewsRouter.get("/target/:targetId", getPublicReviews);

// Admin Routes
adminReviewsRouter.get("/", getAdminReviews);
adminReviewsRouter.patch("/:id/status", updateReviewStatus);
adminReviewsRouter.delete("/:id", deleteReview);
