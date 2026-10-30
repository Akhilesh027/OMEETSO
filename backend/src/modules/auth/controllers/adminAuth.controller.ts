import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { verifyTotp } from "../utils/totp";
import { AdminUser } from "../../admin/models/AdminUser";
import { AdminSession } from "../models/AdminSession";
import {
  generateAdminAccessToken,
  generateOpaqueToken,
  hashToken,
} from "../utils/token";
import { env } from "../../../config/env";
import { AuthenticatedAdminRequest } from "../../../middleware/authenticateAdmin";

const ADMIN_REFRESH_COOKIE = "omeetso_admin_refresh";
const ADMIN_2FA_COOKIE = "omeetso_admin_2fa";
const challengeCookieOptions = { httpOnly: true, secure: env.NODE_ENV === "production", sameSite: "strict" as const, path: `${env.API_PREFIX}/admin/auth` };

export async function adminLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;
    res.clearCookie(ADMIN_2FA_COOKIE, challengeCookieOptions);
    const admin = await AdminUser.findOne({ email: email.toLowerCase() });

    if (!admin) {
      res.status(401).json({
        success: false,
        error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password" }
      });
      return;
    }

    // Check account lock status
    if (admin.status === "locked" && admin.lockedUntil && admin.lockedUntil > new Date()) {
      const remainingMinutes = Math.ceil((admin.lockedUntil.getTime() - Date.now()) / 60000);
      res.status(429).json({
        success: false,
        error: {
          code: "ACCOUNT_LOCKED",
          message: `Account locked due to 5 consecutive failed login attempts. Try again in ${remainingMinutes} minutes.`
        }
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      admin.failedLoginAttempts += 1;
      if (admin.failedLoginAttempts >= 5) {
        admin.status = "locked";
        admin.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
      }
      await admin.save();
      res.status(401).json({
        success: false,
        error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password" }
      });
      return;
    }

    // Reset failed attempts on success
    admin.failedLoginAttempts = 0;
    admin.status = admin.status === "locked" ? "active" : admin.status;
    admin.lockedUntil = undefined;
    await admin.save();

    if (admin.status !== "active") {
      res.status(403).json({
        success: false,
        error: { code: "ACCOUNT_DISABLED", message: `Admin account is ${admin.status}` }
      });
      return;
    }

    // Check if 2FA is required
    if (admin.twoFAEnabled) {
      const challenge = jwt.sign({ adminId: admin._id.toString(), aud: "omeetso-admin-2fa" }, env.JWT_ACCESS_SECRET, { expiresIn: "5m" });
      res.cookie(ADMIN_2FA_COOKIE, challenge, { ...challengeCookieOptions, maxAge: 5 * 60 * 1000 });
      res.status(200).json({
        success: true,
        data: {
          requiresTwoFactor: true,
          email: admin.email
        }
      });
      return;
    }

    // Direct issue if 2FA disabled
    await completeAdminLogin(admin, req, res);
  } catch (error) {
    next(error);
  }
}

export async function verifyAdmin2FA(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, code } = req.body;
    let challenge: { adminId: string };
    try {
      challenge = jwt.verify(req.cookies?.[ADMIN_2FA_COOKIE], env.JWT_ACCESS_SECRET, { audience: "omeetso-admin-2fa" }) as { adminId: string };
    } catch {
      res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Please verify your password first." } });
      return;
    }
    const admin = await AdminUser.findOne({ email: email.toLowerCase() });

    if (!admin || admin._id.toString() !== challenge.adminId || admin.status !== "active" || !admin.twoFAEnabled) {
      res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Admin account not found or disabled" }
      });
      return;
    }

    const step = admin.twoFASecret ? verifyTotp(admin.twoFASecret, code) : null;
    const consumed = step === null ? null : await AdminUser.findOneAndUpdate(
      { _id: admin._id, $or: [{ lastTwoFAStep: { $exists: false } }, { lastTwoFAStep: { $lt: step } }] },
      { $set: { lastTwoFAStep: step } }
    );
    if (!consumed) {
      res.status(400).json({
        success: false,
        error: { code: "INVALID_2FA_CODE", message: "Invalid 2FA authentication code" }
      });
      return;
    }

    res.clearCookie(ADMIN_2FA_COOKIE, challengeCookieOptions);
    await completeAdminLogin(admin, req, res);
  } catch (error) {
    next(error);
  }
}

async function completeAdminLogin(admin: any, req: Request, res: Response) {
  admin.lastLoginAt = new Date();
  await admin.save();

  const rawRefreshToken = generateOpaqueToken();
  const refreshTokenHash = hashToken(rawRefreshToken);
  const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const session = await AdminSession.create({
    adminId: admin._id,
    refreshTokenHash,
    ipAddress: req.ip,
    userAgent: req.get("user-agent"),
    expiresAt: refreshExpiresAt
  });

  const accessToken = generateAdminAccessToken(admin._id.toString(), admin.role, admin.permissions, session._id.toString());

  res.cookie(ADMIN_REFRESH_COOKIE, rawRefreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api/v1/admin/auth",
    expires: refreshExpiresAt
  });

  res.status(200).json({
    success: true,
    data: {
      accessToken,
      admin: {
        id: admin._id.toString(),
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        avatar: admin.avatar,
        status: admin.status,
        lastLoginAt: admin.lastLoginAt
      }
    }
  });
}

export async function refreshAdminSession(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rawRefreshToken = req.cookies[ADMIN_REFRESH_COOKIE];
    if (!rawRefreshToken) {
      res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "No admin refresh cookie found" }
      });
      return;
    }

    const tokenHash = hashToken(rawRefreshToken);
    const session = await AdminSession.findOne({
      refreshTokenHash: tokenHash,
      isRevoked: false,
      expiresAt: { $gt: new Date() }
    });

    if (!session) {
      res.clearCookie(ADMIN_REFRESH_COOKIE, { path: "/api/v1/admin/auth" });
      res.status(401).json({
        success: false,
        error: { code: "SESSION_EXPIRED", message: "Admin session expired or revoked." }
      });
      return;
    }

    const admin = await AdminUser.findById(session.adminId);
    if (!admin || admin.status !== "active") {
      res.clearCookie(ADMIN_REFRESH_COOKIE, { path: "/api/v1/admin/auth" });
      res.status(403).json({
        success: false,
        error: { code: "ACCOUNT_DISABLED", message: "Admin account unavailable" }
      });
      return;
    }

    // Token Rotation
    session.isRevoked = true;
    await session.save();

    const newRawRefreshToken = generateOpaqueToken();
    const newRefreshTokenHash = hashToken(newRawRefreshToken);
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const newSession = await AdminSession.create({
      adminId: admin._id,
      refreshTokenHash: newRefreshTokenHash,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      expiresAt: newExpiresAt
    });

    const newAccessToken = generateAdminAccessToken(admin._id.toString(), admin.role, admin.permissions, newSession._id.toString());

    res.cookie(ADMIN_REFRESH_COOKIE, newRawRefreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/v1/admin/auth",
      expires: newExpiresAt
    });

    res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken,
        admin: {
          id: admin._id.toString(),
          name: admin.name,
          email: admin.email,
          role: admin.role,
          permissions: admin.permissions,
          avatar: admin.avatar,
          status: admin.status
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function logoutAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rawRefreshToken = req.cookies[ADMIN_REFRESH_COOKIE];
    if (rawRefreshToken) {
      const tokenHash = hashToken(rawRefreshToken);
      await AdminSession.updateOne({ refreshTokenHash: tokenHash }, { $set: { isRevoked: true } });
    }

    res.clearCookie(ADMIN_REFRESH_COOKIE, { path: "/api/v1/admin/auth" });
    res.status(200).json({
      success: true,
      data: { message: "Admin logged out successfully" }
    });
  } catch (error) {
    next(error);
  }
}

export async function getAdminSession(req: AuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.admin) {
      res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated as admin" } });
      return;
    }
    const a = req.admin;
    res.status(200).json({
      success: true,
      data: {
        id: a._id.toString(),
        name: a.name,
        email: a.email,
        role: a.role,
        permissions: a.permissions,
        avatar: a.avatar,
        status: a.status
      }
    });
  } catch (error) {
    next(error);
  }
}
