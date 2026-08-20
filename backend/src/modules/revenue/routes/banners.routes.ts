import { Router } from "express";
import {
  getHomeBanners,
  createHomeBanner,
  updateHomeBanner,
  deleteHomeBanner
} from "../controllers/homeBanners.controller";

export const bannersRouter = Router();

bannersRouter.get("/", getHomeBanners);
bannersRouter.post("/", createHomeBanner);
bannersRouter.put("/:id", updateHomeBanner);
bannersRouter.patch("/:id", updateHomeBanner);
bannersRouter.delete("/:id", deleteHomeBanner);
