import { Router } from "express";
import { authenticateAdmin } from "../../../middleware/authenticateAdmin";
import {
  getAdminServices,
  updateAdminServiceStatus,
  getAdminServiceCategories,
  upsertAdminServiceCategory,
} from "../controllers/adminServices.controller";

export const adminServicesRouter = Router();

adminServicesRouter.use(authenticateAdmin);

adminServicesRouter.get("/", getAdminServices);
adminServicesRouter.patch("/:id/status", updateAdminServiceStatus);
adminServicesRouter.get("/categories", getAdminServiceCategories);
adminServicesRouter.post("/categories", upsertAdminServiceCategory);
