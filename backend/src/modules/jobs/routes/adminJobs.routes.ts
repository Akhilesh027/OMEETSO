import { Router } from "express";
import { authenticateAdmin } from "../../../middleware/authenticateAdmin";
import {
  getAdminJobs,
  updateAdminJobStatus,
  deleteAdminJob,
  getAdminJobCategories,
  upsertAdminJobCategory,
  getEmployerModerationHistory,
} from "../controllers/adminJobs.controller";

export const adminJobsRouter = Router();

adminJobsRouter.use(authenticateAdmin);

adminJobsRouter.get("/", getAdminJobs);
adminJobsRouter.patch("/:id/status", updateAdminJobStatus);
adminJobsRouter.delete("/:id", deleteAdminJob);
adminJobsRouter.get("/categories", getAdminJobCategories);
adminJobsRouter.post("/categories", upsertAdminJobCategory);
adminJobsRouter.get("/employer/:employerId/history", getEmployerModerationHistory);
