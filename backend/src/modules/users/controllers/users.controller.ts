import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { User } from "../models/User";
import { UserSession } from "../../auth/models/UserSession";
import { UserStatus } from "../../../contracts";
import { AuthenticatedUserRequest } from "../../../middleware/authenticateUser";
import { MALE_AVATAR_DATA_URI } from "../../../utils/avatarSvgs";

export async function getMyProfile(req: AuthenticatedUserRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "User required" } });
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
        verificationSummary: u.verificationSummary,
        savedLocations: u.savedLocations || [],
        createdAt: u.createdAt,
        updatedAt: u.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function updateMyProfile(req: AuthenticatedUserRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "User required" } });
      return;
    }

    const { name, bio, avatar, city, pincode, area, language, email } = req.body;
    const userId = req.user._id;

    const updateFields: Record<string, any> = {};
    if (email) updateFields.email = email;
    if (name) updateFields["profile.name"] = name;
    if (bio !== undefined) updateFields["profile.bio"] = bio;
    if (avatar !== undefined) updateFields["profile.avatar"] = avatar;
    if (city) updateFields["profile.city"] = city;
    if (pincode) updateFields["profile.pincode"] = pincode;
    if (area !== undefined) updateFields["profile.area"] = area;
    if (language) updateFields["profile.language"] = language;

    let updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true, runValidators: true, upsert: true }
    ).lean();

    if (!updatedUser) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "User not found" } });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        id: updatedUser._id.toString(),
        phone: updatedUser.phone,
        email: updatedUser.email,
        accountType: updatedUser.accountType,
        status: updatedUser.status,
        profile: updatedUser.profile,
        verificationSummary: updatedUser.verificationSummary
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getSavedLocations(req: AuthenticatedUserRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "User required" } });
      return;
    }
    res.status(200).json({
      success: true,
      data: req.user.savedLocations || []
    });
  } catch (error) {
    next(error);
  }
}

export async function addSavedLocation(req: AuthenticatedUserRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "User required" } });
      return;
    }

    const { label, address, area, pincode, isDefault } = req.body;
    if (!label || !address || !area || !pincode) {
      res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "label, address, area, and pincode are required" }
      });
      return;
    }

    const u = req.user;
    if (isDefault) {
      u.savedLocations.forEach((loc) => (loc.isDefault = false));
    }

    u.savedLocations.push({ label, address, area, pincode, isDefault: Boolean(isDefault) });
    await u.save();

    res.status(201).json({
      success: true,
      data: u.savedLocations
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteSavedLocation(req: AuthenticatedUserRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "User required" } });
      return;
    }

    const { locationId } = req.params;
    const u = req.user;

    u.savedLocations = u.savedLocations.filter((loc) => loc._id?.toString() !== locationId);
    await u.save();

    res.status(200).json({
      success: true,
      data: u.savedLocations
    });
  } catch (error) {
    next(error);
  }
}

export async function getPublicProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rawId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
    const userId = (rawId || "").trim();

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      res.status(200).json({
        success: true,
        data: {
          id: userId || "u_seller",
          name: "Omeetso Seller",
          avatar: MALE_AVATAR_DATA_URI,
          city: "Hyderabad",
          area: "Hyderabad",
          memberSince: "2024",
          accountType: "individual",
          verificationSummary: { identityVerified: true, phoneVerified: true, emailVerified: true }
        }
      });
      return;
    }

    const user = await User.findById(userId)
      .select("profile verificationSummary accountType createdAt")
      .lean();

    if (!user) {
      res.status(200).json({
        success: true,
        data: {
          id: userId,
          name: "Omeetso Seller",
          avatar: MALE_AVATAR_DATA_URI,
          city: "Hyderabad",
          area: "Hyderabad",
          memberSince: "2024",
          accountType: "individual",
          verificationSummary: { identityVerified: true, phoneVerified: true, emailVerified: true }
        }
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id.toString(),
        name: user.profile?.name || (user as any).name || "Omeetso Seller",
        businessName: user.profile?.businessName || (user as any).businessName,
        avatar: user.profile?.avatar || (user as any).avatar || MALE_AVATAR_DATA_URI,
        city: user.profile?.city || (user as any).city || "Hyderabad",
        area: user.profile?.area || (user as any).area || "Hyderabad",
        memberSince: user.profile?.memberSince || (user.createdAt ? new Date(user.createdAt).getFullYear().toString() : "2024"),
        bio: user.profile?.bio || "Trusted Omeetso verified seller.",
        accountType: user.accountType || "individual",
        verificationSummary: user.verificationSummary || { identityVerified: true, phoneVerified: true, emailVerified: true }
      }
    });
  } catch (error) {
    next(error);
  }
}

import { Listing } from "../../listings/models/Listing";
import { Store } from "../../stores/models/Store";

export async function getAdminUsersList(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const users = await User.find({}).sort({ createdAt: -1 }).lean();
    
    // Compute listings and stores counts per user
    const userIds = users.map((u) => u._id);
    const [listingCounts, storeCounts] = await Promise.all([
      Listing.aggregate([
        { $match: { sellerId: { $in: userIds } } },
        { $group: { _id: "$sellerId", count: { $sum: 1 } } }
      ]).catch(() => []),
      Store.aggregate([
        { $match: { ownerId: { $in: userIds } } },
        { $group: { _id: "$ownerId", count: { $sum: 1 } } }
      ]).catch(() => [])
    ]);

    const listingCountMap = new Map<string, number>(
      listingCounts.map((lc: any) => [lc._id.toString(), lc.count])
    );
    const storeCountMap = new Map<string, number>(
      storeCounts.map((sc: any) => [sc._id.toString(), sc.count])
    );

    const items = users.map((u: any) => {
      const uId = u._id.toString();
      const city = u.profile?.city || (u.savedLocations && u.savedLocations[0]?.city) || "Hyderabad";
      const pincode = u.profile?.pincode || (u.savedLocations && u.savedLocations[0]?.pincode) || u.pincode || "500081";
      const area = u.profile?.area || (u.savedLocations && u.savedLocations[0]?.area) || "";

      return {
        id: uId,
        name: u.profile?.name || (u.phone ? `User (${u.phone})` : "Omeetso User"),
        mobile: u.phone,
        email: u.email || "",
        accountType: u.accountType || "individual",
        status:
          u.status?.toLowerCase() === "active"
            ? "active"
            : u.status?.toLowerCase() === "suspended"
              ? "suspended"
              : u.status?.toLowerCase() === "deleted"
                ? "banned"
                : "active",
        role: u.accountType === "business" ? "business" : "seller",
        city,
        pincode,
        area,
        verifiedMobile: Boolean(u.verificationSummary?.mobileVerified),
        verifiedEmail: Boolean(u.verificationSummary?.emailVerified),
        verifiedIdentity: Boolean(u.verificationSummary?.identityVerified),
        verified: Boolean(u.verificationSummary?.mobileVerified),
        listingsCount: listingCountMap.get(uId) || 0,
        storesCount: storeCountMap.get(uId) || 0,
        reportsReceived: 0,
        riskScore: u.verificationSummary?.riskScore ?? 94,
        createdAt: u.createdAt,
        lastActiveAt: u.updatedAt || u.createdAt
      };
    });
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
}

export async function updateUserAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = req.params;
    const { name, email, mobile, city, pincode, area, accountType, status } = req.body;

    const updateFields: Record<string, any> = {};
    if (name) updateFields["profile.name"] = name;
    if (email !== undefined) updateFields.email = email;
    if (mobile) updateFields.phone = mobile;
    if (city) updateFields["profile.city"] = city;
    if (pincode) updateFields["profile.pincode"] = pincode;
    if (area !== undefined) updateFields["profile.area"] = area;
    if (accountType) updateFields.accountType = accountType;
    if (status) updateFields.status = status;

    const updated = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true, lean: true }
    );

    if (!updated) {
      res.status(404).json({ success: false, error: { message: "User not found" } });
      return;
    }

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
}

export async function deleteUserAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = req.params;
    await User.findByIdAndDelete(userId);
    res.status(200).json({ success: true, data: { message: "User deleted successfully" } });
  } catch (error) {
    next(error);
  }
}

export async function deleteMyAccount(req: AuthenticatedUserRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "User required" } });
      return;
    }

    const userId = req.user._id;

    // Mark user status as DELETED
    req.user.status = UserStatus.DELETED;
    await req.user.save();

    // Revoke all active sessions for this user
    await UserSession.updateMany(
      { userId, isRevoked: false },
      { $set: { isRevoked: true } }
    );

    // Clear refresh cookie
    res.clearCookie("omeetso_user_refresh", { path: "/api/v1/auth" });

    res.status(200).json({
      success: true,
      data: { message: "Your account has been deleted successfully and all sessions have been revoked." }
    });
  } catch (error) {
    next(error);
  }
}

