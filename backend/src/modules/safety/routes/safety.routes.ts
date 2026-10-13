import { Router, Request, Response, NextFunction } from "express";
import { createSafetyReport, getMySafetyReports, getAdminSafetyReports, resolveSafetyReport } from "../controllers/safety.controller";
import { authenticateUser } from "../../../middleware/authenticateUser";
import { authenticateAdmin } from "../../../middleware/authenticateAdmin";
import { requirePermission } from "../../../middleware/requirePermission";

export const safetyRouter = Router();

const optionalAuthUser = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }
  return authenticateUser(req as any, res, () => {
    next();
  });
};

safetyRouter.post("/", optionalAuthUser, createSafetyReport);
safetyRouter.get("/my", optionalAuthUser, getMySafetyReports);
safetyRouter.get("/admin", authenticateAdmin, requirePermission("safety.view"), getAdminSafetyReports);
safetyRouter.patch("/admin/:reportId/resolve", authenticateAdmin, requirePermission("safety.investigate"), resolveSafetyReport);
