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

    // Generate secure random 4-digit numeric OTP
    const rawCode = Math.floor(1000 + Math.random() * 9000).toString();
    const codeHash = crypto.createHash("sha256").update(rawCode).digest("hex");

    await OtpChallenge.create({
      phone: normalizedPhone,
      codeHash,
      attempts: 0,
      resendCount: 0,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 mins
    });

    console.log(`[Auth] OTP generated for ${normalizedPhone}: ${rawCode}`);

    // Dispatch SMS via Combirds SMS Gateway
    if (env.COMBIRDS_API_KEY) {
      const smsResult = await sendOtpSms(tenDigitPhone, rawCode);
      if (!smsResult.success) {
        console.error(`[Auth] Failed to deliver OTP SMS to ${tenDigitPhone}:`, smsResult.error);
      }
    }

    res.status(200).json({
      success: true,
      data: {
        message: "OTP sent successfully!",
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

    if (!challenge) {
      res.status(400).json({
        success: false,
        error: { code: "OTP_EXPIRED", message: "OTP has expired or is invalid. Please request a new code." }
      });
      return;
    }

    if (challenge.attempts >= 5) {
      res.status(429).json({
        success: false,
        error: { code: "TOO_MANY_ATTEMPTS", message: "Maximum OTP verification attempts reached. Request a new OTP." }
      });
      return;
    }

    if (challenge.codeHash !== codeHash) {
      challenge.attempts += 1;
      await challenge.save();
      res.status(400).json({
        success: false,
        error: { code: "INVALID_OTP", message: "Invalid 4-digit verification code. Please check and try again." }
      });
      return;
    }

    challenge.isVerified = true;
    await challenge.save();

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

export async function checkPhoneStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { phone } = req.body;
    if (!phone) {
      res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Mobile number is required" } });
      return;
    }

    const cleanDigits = phone.replace(/\D/g, "");
    const tenDigitPhone = cleanDigits.slice(-10);
    const normalizedPhone = `+91${tenDigitPhone}`;

    if (tenDigitPhone.length !== 10) {
      res.status(400).json({ success: false, error: { code: "INVALID_PHONE", message: "Please enter a valid 10-digit mobile number" } });
      return;
    }

    const user = await User.findOne({ phone: normalizedPhone });
    if (!user) {
      res.status(200).json({
        success: true,
        data: {
          exists: false,
          phone: normalizedPhone,
          cleanPhone: tenDigitPhone
        }
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        exists: true,
        phone: normalizedPhone,
        cleanPhone: tenDigitPhone,
        name: user.profile?.name || "User",
        hasPin: Boolean((user as any).passwordHash),
        avatar: user.profile?.avatar
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function registerUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, phone, email, pin, password, city, pincode, area, accountType, avatar, language, gender } = req.body;

    if (!name || name.trim().length < 2) {
      res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Full Name is required (min 2 characters)" } });
      return;
    }

    if (!phone) {
      res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Mobile phone number is required" } });
      return;
    }

    const cleanDigits = phone.replace(/\D/g, "");
    const tenDigitPhone = cleanDigits.slice(-10);
    const normalizedPhone = `+91${tenDigitPhone}`;

    if (tenDigitPhone.length !== 10) {
      res.status(400).json({ success: false, error: { code: "INVALID_PHONE", message: "Please enter a valid 10-digit mobile number" } });
      return;
    }

    let user = await User.findOne({ phone: normalizedPhone });

    const userPin = pin || password;
    let passwordHash = undefined;
    if (userPin && userPin.trim()) {
      passwordHash = crypto.createHash("sha256").update(userPin.trim()).digest("hex");
    }

    if (user) {
      user.profile.name = name.trim();
      if (city) user.profile.city = city.trim();
      if (pincode) user.profile.pincode = pincode.trim();
      if (area) user.profile.area = area.trim();
      if (avatar) user.profile.avatar = avatar;
      if (language) user.profile.language = language;
      if (accountType) user.accountType = accountType;
      if (email) user.email = email.trim();
      if (passwordHash) (user as any).passwordHash = passwordHash;
      await user.save();
    } else {
      user = await User.create({
        phone: normalizedPhone,
        email: email ? email.trim() : undefined,
        accountType: accountType === "business" ? "business" : "individual",
        passwordHash,
        profile: {
          name: name.trim(),
          city: city ? city.trim() : "Hyderabad",
          pincode: pincode ? pincode.trim() : "500081",
          area: area ? area.trim() : "Madhapur",
          avatar: avatar || undefined,
          language: language || "en",
          memberSince: new Date()
        },
        verificationSummary: {
          mobileVerified: true,
          emailVerified: Boolean(email),
          identityVerified: false,
          businessVerified: accountType === "business"
        }
      });
    }

    const accessToken = generateUserAccessToken(user._id.toString());
    const rawRefreshToken = generateOpaqueToken();
    const refreshTokenHash = hashToken(rawRefreshToken);
    const refreshExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

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
        isNewUser: true,
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

export async function loginUserDirect(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { phone, pin, password } = req.body;

    if (!phone) {
      res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Mobile number is required" } });
      return;
    }

    const cleanDigits = phone.replace(/\D/g, "");
    const tenDigitPhone = cleanDigits.slice(-10);
    const normalizedPhone = `+91${tenDigitPhone}`;

    if (tenDigitPhone.length !== 10) {
      res.status(400).json({ success: false, error: { code: "INVALID_PHONE", message: "Please enter a valid 10-digit mobile number" } });
      return;
    }

    let user = await User.findOne({ phone: normalizedPhone });

    if (!user) {
      res.status(404).json({
        success: false,
        error: { code: "USER_NOT_FOUND", message: "No account found with this phone number. Please register to continue." }
      });
      return;
    }

    const userPin = pin || password;
    if ((user as any).passwordHash) {
      if (!userPin) {
        res.status(400).json({ success: false, error: { code: "PIN_REQUIRED", message: "Please enter your 4-digit PIN" } });
        return;
      }
      const pHash = crypto.createHash("sha256").update(userPin.trim()).digest("hex");
      if ((user as any).passwordHash !== pHash) {
        res.status(400).json({ success: false, error: { code: "INVALID_PIN", message: "Incorrect 4-digit PIN. Please try again." } });
        return;
      }
    }

    const accessToken = generateUserAccessToken(user._id.toString());
    const rawRefreshToken = generateOpaqueToken();
    const refreshTokenHash = hashToken(rawRefreshToken);
    const refreshExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

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
