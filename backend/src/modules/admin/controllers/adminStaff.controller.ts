import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { AdminUser } from "../models/AdminUser";
import { computePermissionsForRoles } from "../constants/rolePermissions";
import { AuthenticatedAdminRequest } from "../../../middleware/authenticateAdmin";
import { env } from "../../../config/env";

export async function getAdminStaffList(req: AuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const staff = await AdminUser.find({})
      .select("-passwordHash -twoFASecret")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: staff.map((s) => ({
        id: s._id.toString(),
        name: s.name,
        email: s.email,
        role: s.role,
        roles: (s as any).roles?.length ? (s as any).roles : [s.role],
        permissions: s.permissions || [],
        permissionsCount: s.permissions?.includes("*") ? "ALL (*)" : (s.permissions?.length || 0),
        status: s.status,
        twoFAEnabled: s.twoFAEnabled,
        lastLoginAt: s.lastLoginAt,
        createdAt: s.createdAt,
        isRootAdmin: s.email.toLowerCase() === (env.INITIAL_ADMIN_EMAIL || "admin@digitalness.co.in").trim().toLowerCase()
      }))
    });
  } catch (error) {
    next(error);
  }
}

export async function createAdminStaff(req: AuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, email, password, roles, role, customPermissions } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Name is required" } });
      return;
    }

    if (!email || !email.trim() || !email.includes("@")) {
      res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Valid email is required" } });
      return;
    }

    if (!password || password.length < 6) {
      res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Password must be at least 6 characters" } });
      return;
    }

    // Support single role or multiple roles array
    let rolesList: string[] = [];
    if (Array.isArray(roles) && roles.length > 0) {
      rolesList = Array.from(new Set(roles.map((r: any) => String(r).trim()).filter(Boolean)));
    } else if (role && typeof role === "string") {
      rolesList = [role.trim()];
    } else {
      rolesList = ["Listing Moderator"];
    }

    const primaryRole = rolesList[0] || "Listing Moderator";
    const sanitizedEmail = email.trim().toLowerCase();

    const existing = await AdminUser.findOne({ email: sanitizedEmail });
    if (existing) {
      res.status(409).json({ success: false, error: { code: "CONFLICT", message: "An admin with this email already exists" } });
      return;
    }

    const computedPermissions = computePermissionsForRoles(
      rolesList,
      Array.isArray(customPermissions) ? customPermissions : []
    );

    const passwordHash = await bcrypt.hash(password, 10);

    const newStaff = await AdminUser.create({
      name: name.trim(),
      email: sanitizedEmail,
      passwordHash,
      role: primaryRole,
      roles: rolesList,
      permissions: computedPermissions,
      status: "active",
      twoFAEnabled: false
    });

    res.status(201).json({
      success: true,
      message: `Admin staff member "${newStaff.name}" created successfully with ${rolesList.length} role(s).`,
      data: {
        id: newStaff._id.toString(),
        name: newStaff.name,
        email: newStaff.email,
        role: newStaff.role,
        roles: newStaff.roles,
        permissions: newStaff.permissions,
        status: newStaff.status,
        createdAt: newStaff.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function updateAdminStaff(req: AuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { name, roles, role, status, password, customPermissions } = req.body;

    const staff = await AdminUser.findById(id);
    if (!staff) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Admin staff member not found" } });
      return;
    }

    const isRootAdmin = staff.email.toLowerCase() === (env.INITIAL_ADMIN_EMAIL || "admin@digitalness.co.in").trim().toLowerCase();

    if (name && name.trim()) {
      staff.name = name.trim();
    }

    if (roles !== undefined || role !== undefined) {
      let rolesList: string[] = [];
      if (Array.isArray(roles) && roles.length > 0) {
        rolesList = Array.from(new Set(roles.map((r: any) => String(r).trim()).filter(Boolean)));
      } else if (role && typeof role === "string") {
        rolesList = [role.trim()];
      }

      if (rolesList.length > 0) {
        if (isRootAdmin && !rolesList.includes("Super Admin")) {
          res.status(403).json({
            success: false,
            error: { code: "FORBIDDEN", message: "Root initial Super Admin must retain the Super Admin role." }
          });
          return;
        }

        staff.roles = rolesList;
        staff.role = rolesList[0];
        staff.permissions = computePermissionsForRoles(
          rolesList,
          Array.isArray(customPermissions) ? customPermissions : staff.permissions.filter(p => !p.startsWith("*"))
        );
      }
    }

    if (status && ["active", "suspended"].includes(status)) {
      if (isRootAdmin && status === "suspended") {
        res.status(403).json({
          success: false,
          error: { code: "FORBIDDEN", message: "Root Super Admin account cannot be suspended." }
        });
        return;
      }
      staff.status = status;
    }

    if (password && password.length >= 6) {
      staff.passwordHash = await bcrypt.hash(password, 10);
    }

    await staff.save();

    res.status(200).json({
      success: true,
      message: `Staff member "${staff.name}" updated successfully.`,
      data: {
        id: staff._id.toString(),
        name: staff.name,
        email: staff.email,
        role: staff.role,
        roles: staff.roles,
        permissions: staff.permissions,
        status: staff.status
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteAdminStaff(req: AuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    const staff = await AdminUser.findById(id);
    if (!staff) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Admin staff member not found" } });
      return;
    }

    const rootEmail = (env.INITIAL_ADMIN_EMAIL || "admin@digitalness.co.in").trim().toLowerCase();
    if (staff.email.toLowerCase() === rootEmail) {
      res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Root Super Admin account cannot be deleted." } });
      return;
    }

    if (req.admin && req.admin._id.toString() === staff._id.toString()) {
      res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "You cannot delete your own admin account while logged in." } });
      return;
    }

    await AdminUser.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: `Staff member "${staff.name}" has been removed permanently.`
    });
  } catch (error) {
    next(error);
  }
}

