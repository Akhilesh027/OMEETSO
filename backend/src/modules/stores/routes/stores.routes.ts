import { Router } from "express";
import {
  createStore,
  getPublicStores,
  getStoreById,
  getMyStores,
  getStoreListings,
  updateStore,
  toggleFollowStore
} from "../controllers/stores.controller";
import { authenticateUser } from "../../../middleware/authenticateUser";

export const storesRouter = Router();

storesRouter.get("/", getPublicStores);
storesRouter.get("/public", getPublicStores);
storesRouter.get("/:storeId", getStoreById);
storesRouter.get("/:storeId/listings", getStoreListings);
storesRouter.post("/:storeId/follow", toggleFollowStore);

storesRouter.post("/", authenticateUser, createStore);
storesRouter.get("/user/me", authenticateUser, getMyStores);
storesRouter.patch("/:storeId", authenticateUser, updateStore);
