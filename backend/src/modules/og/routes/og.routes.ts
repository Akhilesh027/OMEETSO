import { Router } from "express";
import { getProductOpenGraphPreview, getStoreOpenGraphPreview } from "../controllers/og.controller";

export const ogRouter = Router();

ogRouter.get("/product/:id", getProductOpenGraphPreview);
ogRouter.get("/listing/:id", getProductOpenGraphPreview);
ogRouter.get("/store/:id", getStoreOpenGraphPreview);
