import { Response, NextFunction } from "express";
import { AuthenticatedAdminRequest } from "./authenticateAdmin";

export function requirePermission(...permissions: string[]) {
  return (req: AuthenticatedAdminRequest, res: Response, next: NextFunction): void => {
    if (!req.admin) {
      res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Admin authentication required" }
      });
      return;
    }

    const userPerms = req.admin.permissions || [];
    const hasPermission =
      req.admin.role === "Super Admin" ||
      userPerms.includes("*") ||
      permissions.some((p) => userPerms.includes(p)) ||
      (permissions.includes("listings.manage") && (userPerms.includes("listings.remove") || userPerms.includes("listings.manage")));

    if (!hasPermission) {
      res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: `Insufficient permissions. Required: "${permissions.join(" or ")}"`
        }
      });
      return;
    }

    next();
  };
}
