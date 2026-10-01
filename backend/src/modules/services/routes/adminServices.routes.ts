import { Router } from "express";
import { authenticateAdmin } from "../../../middleware/authenticateAdmin";
import {
  getAdminServices,
  updateAdminServiceStatus,
  getAdminServiceCategories,
  upsertAdminServiceCategory,
  deleteAdminService,
} from "../controllers/adminServices.controller";

export const adminServicesRouter = Router();

adminServicesRouter.use(authenticateAdmin);

adminServicesRouter.get("/", getAdminServices);
adminServicesRouter.patch("/:id/status", updateAdminServiceStatus);
adminServicesRouter.delete("/:id", deleteAdminService);
adminServicesRouter.get("/categories", getAdminServiceCategories);
adminServicesRouter.post("/categories", upsertAdminServiceCategory);

