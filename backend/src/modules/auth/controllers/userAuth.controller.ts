import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { User } from "../../users/models/User";
import { OtpChallenge } from "../models/OtpChallenge";
import { UserSession } from "../models/UserSession";
import {
  generateUserAccessToken,
  generateOpaqueToken,
  hashToken,
  verifyAccessToken,
  UserTokenPayload
} from "../utils/token";
import { env } from "../../../config/env";
import { AuthenticatedUserRequest } from "../../../middleware/authenticateUser";
import { sendOtpSms } from "../services/sms.service";

const USER_REFRESH_COOKIE = "omeetso_user_refresh";

export async function requestOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { phone } = req.body;
    if (!phone) {
      res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Mobile phone number is required" }
      });
      return;
    }

    const cleanDigits = phone.replace(/\D/g, "");
    const tenDigitPhone = cleanDigits.slice(-10);
    const normalizedPhone = `+91${tenDigitPhone}`;

    if (tenDigitPhone.length !== 10) {
      res.status(400).json({
        success: false,
        error: { code: "INVALID_PHONE", message: "Please enter a valid 10-digit mobile number" }
      });
      return;
    }

    // Default static OTP for testing / development
    const rawCode = "1234";
    const codeHash = crypto.createHash("sha256").update(rawCode).digest("hex");

    await OtpChallenge.create({
      phone: normalizedPhone,
      codeHash,
      attempts: 0,
      resendCount: 0,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 mins
    });

    console.log(`[Auth] Default testing OTP generated for ${normalizedPhone}: ${rawCode}`);

    res.status(200).json({
      success: true,
      data: {
        message: "OTP sent successfully! (Default OTP: 1234)",
        expiresInSeconds: 600
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { phone, code } = req.body;
    const normalizedPhone = phone.startsWith("+91") ? phone : `+91${phone.replace(/\D/g, "").slice(-10)}`;
    const codeHash = crypto.createHash("sha256").update(code).digest("hex");

    const challenge = await OtpChallenge.findOne({
      phone: normalizedPhone,
      expiresAt: { $gt: new Date() },
      isVerified: false
    }).sort({ createdAt: -1 });

    // Allow default 1234 fallback even if challenge expired during testing
    const isDefaultCode = code === "1234";

    if (!challenge && !isDefaultCode) {
      res.status(400).json({
        success: false,
        error: { code: "OTP_EXPIRED", message: "OTP has expired or is invalid. Please request a new code." }
      });
      return;
    }

    if (challenge && challenge.attempts >= 10 && !isDefaultCode) {
      res.status(429).json({
        success: false,
        error: { code: "TOO_MANY_ATTEMPTS", message: "Maximum OTP verification attempts reached. Request a new OTP." }
      });
      return;
    }

    if (challenge && challenge.codeHash !== codeHash && !isDefaultCode) {
      challenge.attempts += 1;
      await challenge.save();
      res.status(400).json({
        success: false,
        error: { code: "INVALID_OTP", message: "Invalid 4-digit OTP code. (Hint: Use 1234)" }
      });
      return;
    }

    if (challenge) {
      challenge.isVerified = true;
      await challenge.save();
    }

    // Find or create user on first login
    let user = await User.findOne({ phone: normalizedPhone });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      user = await User.create({
        phone: normalizedPhone,
        accountType: "individual",
        profile: {
          name: `User ${normalizedPhone.slice(-4)}`,
          city: "Hyderabad",
          pincode: "500081",
          area: "Madhapur",
          language: "en",
          memberSince: new Date()
        },
        verificationSummary: {
          mobileVerified: true,
          emailVerified: false,
          identityVerified: false,
          businessVerified: false
        }
      });
    }

    // Issue JWT Access Token & Refresh Session Cookie
    const accessToken = generateUserAccessToken(user._id.toString());
    const rawRefreshToken = generateOpaqueToken();
    const refreshTokenHash = hashToken(rawRefreshToken);

    const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await UserSession.create({
      userId: user._id,
      refreshTokenHash,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      expiresAt: refreshExpiresAt
    });

    res.cookie(USER_REFRESH_COOKIE, rawRefreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/v1/auth",
      expires: refreshExpiresAt
    });

    res.status(200).json({
      success: true,
      data: {
        accessToken,
        isNewUser,
        user: {
          id: user._id.toString(),
          phone: user.phone,
          email: user.email,
          accountType: user.accountType,
          status: user.status,
          profile: user.profile,
          verificationSummary: user.verificationSummary
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function refreshUserSession(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rawRefreshToken = req.cookies[USER_REFRESH_COOKIE];
    if (!rawRefreshToken) {
      res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "No refresh session cookie found" }
      });
      return;
    }

    const tokenHash = hashToken(rawRefreshToken);
    const session = await UserSession.findOne({
      refreshTokenHash: tokenHash,
      isRevoked: false,
      expiresAt: { $gt: new Date() }
    });

    if (!session) {
      res.clearCookie(USER_REFRESH_COOKIE, { path: "/api/v1/auth" });
      res.status(401).json({
        success: false,
        error: { code: "SESSION_EXPIRED", message: "Session expired or revoked. Please sign in again." }
      });
      return;
    }

    const user = await User.findById(session.userId);
    if (!user || user.status === "DELETED" || user.status === "PERMANENTLY_SUSPENDED") {
      res.clearCookie(USER_REFRESH_COOKIE, { path: "/api/v1/auth" });
      res.status(403).json({
        success: false,
        error: { code: "ACCOUNT_SUSPENDED", message: "Account unavailable" }
      });
      return;
    }

    // Token Rotation: revoke old session, create new
    session.isRevoked = true;
    await session.save();

    const newRawRefreshToken = generateOpaqueToken();
    const newRefreshTokenHash = hashToken(newRawRefreshToken);
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await UserSession.create({
      userId: user._id,
      refreshTokenHash: newRefreshTokenHash,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      expiresAt: newExpiresAt
    });

    const newAccessToken = generateUserAccessToken(user._id.toString());

    res.cookie(USER_REFRESH_COOKIE, newRawRefreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/v1/auth",
      expires: newExpiresAt
    });

    res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken,
        user: {
          id: user._id.toString(),
          phone: user.phone,
          email: user.email,
          accountType: user.accountType,
          status: user.status,
          profile: user.profile,
          verificationSummary: user.verificationSummary
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function logoutUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rawRefreshToken = req.cookies[USER_REFRESH_COOKIE];
    if (rawRefreshToken) {
      const tokenHash = hashToken(rawRefreshToken);
      await UserSession.updateOne({ refreshTokenHash: tokenHash }, { $set: { isRevoked: true } });
    }

    res.clearCookie(USER_REFRESH_COOKIE, { path: "/api/v1/auth" });
    res.status(200).json({
      success: true,
      data: { message: "Logged out successfully" }
    });
  } catch (error) {
    next(error);
  }
}

export async function getUserSession(req: AuthenticatedUserRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } });
      return;
    }
    const u = req.user;
    res.status(200).json({
      success: true,
      data: {
        id: u._id.toString(),
        phone: u.phone,
        email: u.email,
        accountType: u.accountType,
        status: u.status,
        profile: u.profile,
        verificationSummary: u.verificationSummary
      }
    });
  } catch (error) {
    next(error);
  }
}
