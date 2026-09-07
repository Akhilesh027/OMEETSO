import { Router } from "express";
import {
  getAdminListings,
  getAdminListingById,
  approveListing,
  rejectListing,
  createAdminListing,
  updateAdminListing,
  deleteAdminListing,
  updateAdminListingStatus
} from "../controllers/adminListings.controller";
import { authenticateAdmin } from "../../../middleware/authenticateAdmin";
import { requirePermission } from "../../../middleware/requirePermission";

export const adminListingsRouter = Router();

adminListingsRouter.get("/", authenticateAdmin, requirePermission("listings.view"), getAdminListings);
adminListingsRouter.get("/:listingId", authenticateAdmin, requirePermission("listings.view"), getAdminListingById);
adminListingsRouter.post("/", authenticateAdmin, requirePermission("listings.manage"), createAdminListing);
adminListingsRouter.patch("/:listingId/approve", authenticateAdmin, requirePermission("listings.approve"), approveListing);
adminListingsRouter.patch("/:listingId/reject", authenticateAdmin, requirePermission("listings.reject"), rejectListing);
adminListingsRouter.patch("/:listingId/status", authenticateAdmin, requirePermission("listings.approve"), updateAdminListingStatus);
adminListingsRouter.patch("/:listingId", authenticateAdmin, requirePermission("listings.manage"), updateAdminListing);
adminListingsRouter.delete("/:listingId", authenticateAdmin, requirePermission("listings.manage"), deleteAdminListing);

