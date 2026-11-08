import { Router } from "express";
import {
  getAdminStaffList,
  createAdminStaff,
  updateAdminStaff,
  deleteAdminStaff
} from "../controllers/adminStaff.controller";
import { authenticateAdmin } from "../../../middleware/authenticateAdmin";
import { requirePermission } from "../../../middleware/requirePermission";

export const adminStaffRouter = Router();

adminStaffRouter.get(
  "/",
  authenticateAdmin,
  requirePermission("admins.view", "roles.view", "dashboard.view"),
  getAdminStaffList
);

adminStaffRouter.post(
  "/",
  authenticateAdmin,
  requirePermission("admins.create", "roles.edit"),
  createAdminStaff
);

adminStaffRouter.patch(
  "/:id",
  authenticateAdmin,
  requirePermission("admins.edit", "roles.edit"),
  updateAdminStaff
);

adminStaffRouter.delete(
  "/:id",
  authenticateAdmin,
  requirePermission("admins.disable", "roles.edit"),
  deleteAdminStaff
);

