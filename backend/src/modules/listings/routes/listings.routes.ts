import { Router } from "express";
import {
  createListing,
  getPublicListings,
  getListingById,
  getMyListings,
  updateListing,
  markListingSold,
  recordListingView,
  recordListingSave,
  deleteListing
} from "../controllers/listings.controller";
import { authenticateUser } from "../../../middleware/authenticateUser";
import { validateBody } from "../../../middleware/validateRequest";
import { CreateListingRequestSchema } from "../../../contracts";

export const listingsRouter = Router();

listingsRouter.get("/", getPublicListings);
listingsRouter.get("/feed", getPublicListings);
listingsRouter.get("/user/me", authenticateUser, getMyListings);
listingsRouter.get("/:listingId", getListingById);

listingsRouter.post("/", authenticateUser, validateBody(CreateListingRequestSchema), createListing);
listingsRouter.patch("/:listingId", authenticateUser, updateListing);
listingsRouter.delete("/:listingId", authenticateUser, deleteListing);
listingsRouter.post("/:listingId/delete", authenticateUser, deleteListing);
listingsRouter.post("/:listingId/mark-sold", authenticateUser, markListingSold);
listingsRouter.post("/:listingId/view", recordListingView);
listingsRouter.post("/:listingId/save", recordListingSave);
