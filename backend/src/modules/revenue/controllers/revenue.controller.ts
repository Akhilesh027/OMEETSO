import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { Wallet } from "../models/Wallet";
import { WalletTransaction } from "../models/WalletTransaction";
import { WalletHold } from "../models/WalletHold";
import { AdProduct } from "../models/AdProduct";
import { AdPlacement } from "../models/AdPlacement";
import { AdCampaign } from "../models/AdCampaign";
import { Listing } from "../../listings/models/Listing";
import { MediaAsset } from "../models/MediaAsset";
import { AdAnalytics } from "../models/AdAnalytics";
import { AuthenticatedUserRequest } from "../../../middleware/authenticateUser";
import { AuthenticatedAdminRequest } from "../../../middleware/authenticateAdmin";

export async function getMyWallet(req: AuthenticatedUserRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "User required" } });
      return;
    }

    let wallet = await Wallet.findOne({ userId: req.user._id });
    if (!wallet) {
      wallet = await Wallet.create({ userId: req.user._id, balanceInPaise: 500000, refundBalanceInPaise: 0 }); // Initial ₹5,000 promo credit
    }

    const [transactions, holds] = await Promise.all([
      WalletTransaction.find({ walletId: wallet._id }).sort({ createdAt: -1 }).limit(30).lean(),
      WalletHold.find({ userId: req.user._id, status: "HELD" }).lean()
    ]);

    const totalHeldInPaise = holds.reduce((sum, h) => sum + h.amountInPaise, 0);

    res.status(200).json({
      success: true,
      data: {
        id: wallet._id.toString(),
        balanceInPaise: wallet.balanceInPaise,
        availableBalanceInPaise: wallet.balanceInPaise - totalHeldInPaise,
        heldBalanceInPaise: totalHeldInPaise,
        refundBalanceInPaise: wallet.refundBalanceInPaise,
        transactions: transactions.map((t) => ({
          id: t._id.toString(),
          type: t.type,
          amountInPaise: t.amountInPaise,
          description: t.description,
          referenceType: t.referenceType,
          status: t.status,
          createdAt: t.createdAt
        }))
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function rechargeWallet(req: AuthenticatedUserRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "User required" } });
      return;
    }

    const { amountInRupees, paymentMethod, paymentId } = req.body;
    const amount = Number(amountInRupees);

    if (!amount || isNaN(amount) || amount <= 0) {
      res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Valid recharge amount required" } });
      return;
    }

    const amountInPaise = Math.round(amount * 100);

    let wallet = await Wallet.findOne({ userId: req.user._id });
    if (!wallet) {
      wallet = await Wallet.create({ userId: req.user._id, balanceInPaise: 0, refundBalanceInPaise: 0 });
    }

    wallet.balanceInPaise += amountInPaise;
    await wallet.save();

    const pId = paymentId || `pay_rzp_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const methodStr = paymentMethod ? ` (${paymentMethod.toUpperCase()})` : " (UPI)";

    const transaction = await WalletTransaction.create({
      walletId: wallet._id,
      type: "credit",
      amountInPaise,
      description: `Wallet top-up via Razorpay${methodStr} #${pId.slice(-8)}`,
      referenceType: "direct_deposit",
      status: "COMPLETED"
    });

    res.status(200).json({
      success: true,
      data: {
        id: wallet._id.toString(),
        balanceInPaise: wallet.balanceInPaise,
        addedInPaise: amountInPaise,
        transaction: {
          id: transaction._id.toString(),
          amountInPaise: transaction.amountInPaise,
          description: transaction.description,
          status: transaction.status,
          createdAt: transaction.createdAt
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getAdProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const count = await AdProduct.countDocuments({});
    const seedProducts = [
      // --- Listing Boost Plans ---
      {
        name: "⚡ Starter Quick Boost (3 Days)",
        description: "Promote your listing card with a FEATURED badge and category top placement for 3 days of quick exposure.",
        campaignType: "LISTING_BOOST",
        durationDays: 3,
        priceInPaise: 9900, // ₹99
        originalPriceInPaise: 14900, // ₹149
        badge: "⚡ Quick Sale",
        features: [
          "FEATURED Ribbon Badge on Card",
          "Higher Category Grid Ranking",
          "Direct WhatsApp & Offer Priority",
          "Priority Search Indexing"
        ],
        estimatedReach: "1,500 - 3,000 Local Buyers",
        priority: 1,
        permittedPlacements: ["CATEGORY_FEATURED", "HIGHLIGHTED_CARD"],
        active: true
      },
      {
        name: "🚀 Popular Growth Boost (7 Days)",
        description: "Top search ranking, SPONSORED badge, and category header placement for 7 days. Most popular seller choice!",
        campaignType: "LISTING_BOOST",
        durationDays: 7,
        priceInPaise: 24900, // ₹249
        originalPriceInPaise: 39900, // ₹399
        badge: "🔥 Most Popular",
        features: [
          "#1 Top Rank on Search Results",
          "SPONSORED Golden Badge",
          "Pinned Category Header Spot",
          "5× More Buyer Messages & Calls",
          "Daily Automatic Listing Bump"
        ],
        estimatedReach: "5,000 - 12,000 Local Buyers",
        priority: 2,
        permittedPlacements: ["SEARCH_TOP", "CATEGORY_FEATURED", "HIGHLIGHTED_CARD"],
        active: true
      },
      {
        name: "👑 Pro Mega Takeover Boost (15 Days)",
        description: "Homepage hero carousel, guaranteed top search spot, URGENT badge, and 10× visibility boost for 15 days.",
        campaignType: "LISTING_BOOST",
        durationDays: 15,
        priceInPaise: 49900, // ₹499
        originalPriceInPaise: 79900, // ₹799
        badge: "👑 Max Exposure",
        features: [
          "Homepage Hero Carousel Feature",
          "Guaranteed Top 3 Search Spot",
          "URGENT Red Sale Badge",
          "Hyperlocal GPS Push Notifications",
          "10× Exposure & Verified Priority"
        ],
        estimatedReach: "15,000 - 30,000 Local Buyers",
        priority: 3,
        permittedPlacements: ["HOMEPAGE_HERO", "SEARCH_TOP", "CATEGORY_FEATURED", "URGENT_BADGE"],
        active: true
      },
      // --- Banner Ad Packages ---
      {
        name: "🎨 Homepage Hero Showcase Banner (7 Days)",
        description: "Custom promotional banner image featured prominently on the main Omeetso Homepage Hero Carousel with direct link.",
        campaignType: "BANNER_AD",
        durationDays: 7,
        priceInPaise: 49900, // ₹499
        originalPriceInPaise: 79900, // ₹799
        badge: "Best for Stores",
        features: [
          "Full-Width Main Homepage Carousel",
          "Custom Creative Image & Direct Link",
          "Click-through to Store / WhatsApp",
          "Targeted by User City / Pincode"
        ],
        estimatedReach: "20,000+ Homepage Visitors",
        priority: 4,
        permittedPlacements: ["HOMEPAGE_HERO"],
        active: true
      },
      {
        name: "🏷️ Category Top Spotlight Banner (14 Days)",
        description: "Top header banner displayed across all category search pages targeting active local shoppers for 14 days.",
        campaignType: "BANNER_AD",
        durationDays: 14,
        priceInPaise: 89900, // ₹899
        originalPriceInPaise: 149900, // ₹1,499
        badge: "High Conversion",
        features: [
          "Pinned at Top of Specific Category",
          "Zero Direct Competition in Slot",
          "Targeted to Buyers Browsing Your Niche",
          "Live Click & View Analytics Dashboard"
        ],
        estimatedReach: "45,000+ Category Shoppers",
        priority: 5,
        permittedPlacements: ["CATEGORY_HEADER"],
        active: true
      },
      {
        name: "💎 30-Day Omnichannel Brand Takeover (30 Days)",
        description: "Complete brand takeover featuring your banner across Homepage Hero, Category Top Headers, and Store Spotlight sections.",
        campaignType: "BANNER_AD",
        durationDays: 30,
        priceInPaise: 199900, // ₹1,999
        originalPriceInPaise: 349900, // ₹3,499
        badge: "💎 Enterprise Plan",
        features: [
          "Rotating Banner on Homepage Hero",
          "Category Top Banner Across Related Pages",
          "Store Spotlight & Middle Feed Banners",
          "Dedicated Account Manager Support",
          "Weekly Performance Analytics Reports"
        ],
        estimatedReach: "100,000+ Verified Impressions",
        priority: 6,
        permittedPlacements: ["HOMEPAGE_HERO", "CATEGORY_HEADER", "STORE_BANNER"],
        active: true
      }
    ];

    if (count === 0 || req.query.reset === "true") {
      if (req.query.reset === "true") await AdProduct.deleteMany({});
      await AdProduct.insertMany(seedProducts);
    } else {
      // Auto-migrate any plans that don't have features yet
      for (const sp of seedProducts) {
        await AdProduct.updateOne(
          { campaignType: sp.campaignType, durationDays: sp.durationDays, features: { $size: 0 } },
          {
            $set: {
              name: sp.name,
              badge: sp.badge,
              features: sp.features,
              estimatedReach: sp.estimatedReach,
              originalPriceInPaise: sp.originalPriceInPaise,
              priority: sp.priority
            }
          }
        );
      }
    }

    const query: Record<string, any> = { active: true };
    if (req.query.campaignType) {
      query.campaignType = req.query.campaignType;
    }

    const products = await AdProduct.find(query).sort({ priority: 1, priceInPaise: 1 }).lean();

    res.status(200).json({
      success: true,
      data: products.map((p) => ({
        id: p._id.toString(),
        name: p.name,
        description: p.description,
        campaignType: p.campaignType,
        durationDays: p.durationDays,
        priceInPaise: p.priceInPaise,
        originalPriceInPaise: p.originalPriceInPaise,
        badge: p.badge,
        features: p.features || [],
        estimatedReach: p.estimatedReach,
        priority: p.priority || 0,
        permittedPlacements: p.permittedPlacements,
        active: p.active
      }))
    });
  } catch (error) {
    next(error);
  }
}

export async function getAdminAdProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const products = await AdProduct.find({}).sort({ priority: 1, createdAt: -1 }).lean();
    res.status(200).json({
      success: true,
      data: products.map((p) => ({
        id: p._id.toString(),
        name: p.name,
        description: p.description,
        campaignType: p.campaignType,
        durationDays: p.durationDays,
        priceInPaise: p.priceInPaise,
        originalPriceInPaise: p.originalPriceInPaise,
        badge: p.badge,
        features: p.features || [],
        estimatedReach: p.estimatedReach,
        priority: p.priority || 0,
        permittedPlacements: p.permittedPlacements,
        active: p.active,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt
      }))
    });
  } catch (error) {
    next(error);
  }
}

export async function createAdminAdProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      name,
      description,
      campaignType,
      durationDays,
      priceInPaise,
      originalPriceInPaise,
      badge,
      features,
      estimatedReach,
      priority,
      permittedPlacements,
      active
    } = req.body;

    if (!name || !description || !campaignType || !durationDays || priceInPaise === undefined) {
      res.status(400).json({
        success: false,
        error: { code: "BAD_REQUEST", message: "name, description, campaignType, durationDays, and priceInPaise are required" }
      });
      return;
    }

    const created = await AdProduct.create({
      name: name.trim(),
      description: description.trim(),
      campaignType,
      durationDays: Number(durationDays),
      priceInPaise: Number(priceInPaise),
      originalPriceInPaise: originalPriceInPaise ? Number(originalPriceInPaise) : undefined,
      badge: badge ? badge.trim() : undefined,
      features: Array.isArray(features) ? features.filter(Boolean) : (typeof features === "string" ? features.split("\n").filter(Boolean) : []),
      estimatedReach: estimatedReach ? estimatedReach.trim() : undefined,
      priority: priority !== undefined ? Number(priority) : 0,
      permittedPlacements: Array.isArray(permittedPlacements) && permittedPlacements.length > 0 ? permittedPlacements : ["SEARCH_TOP", "CATEGORY_FEATURED"],
      active: active !== undefined ? Boolean(active) : true
    });

    res.status(201).json({
      success: true,
      data: {
        id: created._id.toString(),
        name: created.name,
        description: created.description,
        campaignType: created.campaignType,
        durationDays: created.durationDays,
        priceInPaise: created.priceInPaise,
        originalPriceInPaise: created.originalPriceInPaise,
        badge: created.badge,
        features: created.features,
        estimatedReach: created.estimatedReach,
        priority: created.priority,
        permittedPlacements: created.permittedPlacements,
        active: created.active
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function updateAdminAdProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      campaignType,
      durationDays,
      priceInPaise,
      originalPriceInPaise,
      badge,
      features,
      estimatedReach,
      priority,
      permittedPlacements,
      active
    } = req.body;

    const existing = await AdProduct.findById(id);
    if (!existing) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Pricing plan not found" } });
      return;
    }

    if (name !== undefined) existing.name = name.trim();
    if (description !== undefined) existing.description = description.trim();
    if (campaignType !== undefined) existing.campaignType = campaignType;
    if (durationDays !== undefined) existing.durationDays = Number(durationDays);
    if (priceInPaise !== undefined) existing.priceInPaise = Number(priceInPaise);
    if (originalPriceInPaise !== undefined) existing.originalPriceInPaise = originalPriceInPaise ? Number(originalPriceInPaise) : undefined;
    if (badge !== undefined) existing.badge = badge ? badge.trim() : undefined;
    if (features !== undefined) {
      existing.features = Array.isArray(features) ? features.filter(Boolean) : (typeof features === "string" ? features.split("\n").filter(Boolean) : []);
    }
    if (estimatedReach !== undefined) existing.estimatedReach = estimatedReach ? estimatedReach.trim() : undefined;
    if (priority !== undefined) existing.priority = Number(priority);
    if (permittedPlacements !== undefined && Array.isArray(permittedPlacements)) {
      existing.permittedPlacements = permittedPlacements;
    }
    if (active !== undefined) existing.active = Boolean(active);

    await existing.save();

    res.status(200).json({
      success: true,
      data: {
        id: existing._id.toString(),
        name: existing.name,
        description: existing.description,
        campaignType: existing.campaignType,
        durationDays: existing.durationDays,
        priceInPaise: existing.priceInPaise,
        originalPriceInPaise: existing.originalPriceInPaise,
        badge: existing.badge,
        features: existing.features,
        estimatedReach: existing.estimatedReach,
        priority: existing.priority,
        permittedPlacements: existing.permittedPlacements,
        active: existing.active
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteAdminAdProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const deleted = await AdProduct.findByIdAndDelete(id);
    if (!deleted) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Pricing plan not found" } });
      return;
    }

    res.status(200).json({
      success: true,
      message: `Pricing plan '${deleted.name}' deleted successfully.`
    });
  } catch (error) {
    next(error);
  }
}

export async function toggleAdminAdProductStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const product = await AdProduct.findById(id);
    if (!product) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Pricing plan not found" } });
      return;
    }

    product.active = !product.active;
    await product.save();

    res.status(200).json({
      success: true,
      data: {
        id: product._id.toString(),
        active: product.active,
        name: product.name
      }
    });
  } catch (error) {
    next(error);
  }
}


export async function getAdPlacements(req: Request, res: Response, Next: NextFunction): Promise<void> {
  try {
    const count = await AdPlacement.countDocuments({});
    const defaultPlacements = [
      {
        placementId: "HOMEPAGE_HERO",
        name: "Homepage Hero Billboard Banner Carousel",
        campaignTypes: ["BANNER_AD"],
        aspectRatio: "16:9",
        minimumWidth: 1600,
        minimumHeight: 900,
        maximumFileSizeBytes: 3145728, // 3MB
        maximumActiveSlots: 5,
        active: true
      },
      {
        placementId: "SEARCH_TOP",
        name: "Search Results #1-3 Top Priority Spots",
        campaignTypes: ["LISTING_BOOST"],
        aspectRatio: "CARD",
        minimumWidth: 600,
        minimumHeight: 400,
        maximumFileSizeBytes: 2097152, // 2MB
        maximumActiveSlots: 5,
        active: true
      },
      {
        placementId: "CATEGORY_FEATURED",
        name: "Category Featured Spotlight Grid",
        campaignTypes: ["LISTING_BOOST"],
        aspectRatio: "CARD",
        minimumWidth: 600,
        minimumHeight: 400,
        maximumFileSizeBytes: 2097152,
        maximumActiveSlots: 8,
        active: true
      },
      {
        placementId: "CATEGORY_HEADER",
        name: "Category Top Header Billboard Banner",
        campaignTypes: ["BANNER_AD"],
        aspectRatio: "3:1",
        minimumWidth: 1200,
        minimumHeight: 400,
        maximumFileSizeBytes: 2097152,
        maximumActiveSlots: 3,
        active: true
      },
      {
        placementId: "HIGHLIGHTED_CARD",
        name: "Golden Highlighted Listing Card Border",
        campaignTypes: ["LISTING_BOOST"],
        aspectRatio: "CARD",
        minimumWidth: 600,
        minimumHeight: 400,
        maximumFileSizeBytes: 2097152,
        maximumActiveSlots: 15,
        active: true
      },
      {
        placementId: "URGENT_BADGE",
        name: "Urgent Sale Pulsing Red Badge",
        campaignTypes: ["LISTING_BOOST"],
        aspectRatio: "BADGE",
        minimumWidth: 200,
        minimumHeight: 60,
        maximumFileSizeBytes: 524288,
        maximumActiveSlots: 20,
        active: true
      },
      {
        placementId: "STORE_BANNER",
        name: "Store Spotlight & Merchant Showcase Banner",
        campaignTypes: ["BANNER_AD"],
        aspectRatio: "16:9",
        minimumWidth: 1200,
        minimumHeight: 675,
        maximumFileSizeBytes: 3145728,
        maximumActiveSlots: 5,
        active: true
      },
      {
        placementId: "HOMEPAGE_CAROUSEL",
        name: "Homepage Middle Promotional Carousel",
        campaignTypes: ["BANNER_AD"],
        aspectRatio: "16:9",
        minimumWidth: 1200,
        minimumHeight: 675,
        maximumFileSizeBytes: 3145728,
        maximumActiveSlots: 5,
        active: true
      },
      {
        placementId: "HOME_NATIVE_FEED",
        name: "Native In-Feed Sponsored Card",
        campaignTypes: ["LISTING_BOOST", "BANNER_AD"],
        aspectRatio: "CARD",
        minimumWidth: 600,
        minimumHeight: 400,
        maximumFileSizeBytes: 2097152,
        maximumActiveSlots: 6,
        active: true
      }
    ];

    if (count === 0 || req.query.reset === "true") {
      if (req.query.reset === "true") await AdPlacement.deleteMany({});
      await AdPlacement.insertMany(defaultPlacements);
    } else {
      // Upsert any missing default placements
      for (const dp of defaultPlacements) {
        await AdPlacement.updateOne(
          { placementId: dp.placementId },
          { $setOnInsert: dp },
          { upsert: true }
        );
      }
    }

    const query: Record<string, any> = {};
    if (req.query.activeOnly === "true") {
      query.active = true;
    }

    const placements = await AdPlacement.find(query).sort({ createdAt: 1 }).lean();
    const liveCampaigns = await AdCampaign.find({
      status: { $in: ["ACTIVE", "SCHEDULED", "PENDING_REVIEW"] }
    })
      .populate("advertiserUserId", "name email phone avatar")
      .populate("listingId", "title images priceInPaise area city")
      .populate("adProductId", "name durationDays priceInPaise badge")
      .lean();

    const data = placements.map((p) => {
      const bookedCampaigns = liveCampaigns.filter((c: any) =>
        c.placementIds?.includes(p.placementId)
      );

      return {
        id: p._id.toString(),
        placementId: p.placementId,
        name: p.name,
        campaignTypes: p.campaignTypes,
        aspectRatio: p.aspectRatio,
        minimumWidth: p.minimumWidth,
        minimumHeight: p.minimumHeight,
        maximumFileSizeBytes: p.maximumFileSizeBytes,
        maximumActiveSlots: p.maximumActiveSlots,
        active: p.active,
        bookedSlotsCount: bookedCampaigns.filter((c: any) => c.status === "ACTIVE").length,
        pendingReviewSlotsCount: bookedCampaigns.filter((c: any) => c.status === "PENDING_REVIEW").length,
        bookedCampaigns: bookedCampaigns.map((c: any) => ({
          campaignId: c._id.toString(),
          campaignType: c.campaignType,
          status: c.status,
          advertiserName: c.advertiserUserId?.name || c.advertiserUserId?.email || "Verified Seller",
          advertiserEmail: c.advertiserUserId?.email,
          advertiserPhone: c.advertiserUserId?.phone,
          listingTitle: c.listingId?.title || "Featured Product",
          listingImage: c.listingId?.images?.[0] || "",
          bannerUrl: c.bannerUrl || c.listingId?.images?.[0] || "",
          productName: c.adProductId?.name || c.campaignType,
          badge: c.adProductId?.badge,
          startAt: c.startAt || c.createdAt,
          endAt: c.endAt,
          impressionsCount: c.impressionsCount || 0,
          clicksCount: c.clicksCount || 0,
          city: c.targeting?.city || c.listingId?.city || "All India",
          totalInPaise: c.pricing?.totalInPaise || 0
        }))
      };
    });

    res.status(200).json({ success: true, data });
  } catch (error) {
    Next(error);
  }
}

export async function createAdPlacement(req: Request, res: Response, Next: NextFunction): Promise<void> {
  try {
    const { placementId, name, campaignTypes, aspectRatio, minimumWidth, minimumHeight, maximumFileSizeBytes, maximumActiveSlots } = req.body;

    if (!placementId || !name) {
      res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "placementId and name are required" } });
      return;
    }

    const newPlacement = await AdPlacement.create({
      placementId: placementId.toUpperCase(),
      name,
      campaignTypes: campaignTypes || ["BANNER_AD"],
      aspectRatio: aspectRatio || "16:9",
      minimumWidth: Number(minimumWidth) || 1200,
      minimumHeight: Number(minimumHeight) || 600,
      maximumFileSizeBytes: Number(maximumFileSizeBytes) || 2097152,
      maximumActiveSlots: Number(maximumActiveSlots) || 5,
      active: true
    });

    res.status(201).json({ success: true, data: newPlacement });
  } catch (error) {
    Next(error);
  }
}

export async function deleteAdPlacement(req: Request, res: Response, Next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    await AdPlacement.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Placement slot deleted successfully" });
  } catch (error) {
    Next(error);
  }
}

export async function updateAdPlacement(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const {
      placementId,
      name,
      campaignTypes,
      aspectRatio,
      minimumWidth,
      minimumHeight,
      maximumFileSizeBytes,
      maximumActiveSlots,
      active,
      description,
      cpmInPaise
    } = req.body;

    const updateFields: any = {};
    if (placementId) updateFields.placementId = placementId.toUpperCase();
    if (name !== undefined) updateFields.name = name;
    if (campaignTypes) updateFields.campaignTypes = campaignTypes;
    if (aspectRatio) updateFields.aspectRatio = aspectRatio;
    if (minimumWidth !== undefined) updateFields.minimumWidth = Number(minimumWidth);
    if (minimumHeight !== undefined) updateFields.minimumHeight = Number(minimumHeight);
    if (maximumFileSizeBytes !== undefined) updateFields.maximumFileSizeBytes = Number(maximumFileSizeBytes);
    if (maximumActiveSlots !== undefined) updateFields.maximumActiveSlots = Number(maximumActiveSlots);
    if (active !== undefined) updateFields.active = Boolean(active);
    if (description !== undefined) updateFields.description = description;
    if (cpmInPaise !== undefined) updateFields.cpmInPaise = Number(cpmInPaise);

    const updated = await AdPlacement.findByIdAndUpdate(id, { $set: updateFields }, { new: true });
    if (!updated) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Placement slot not found" } });
      return;
    }

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
}

export async function createAdCampaign(req: AuthenticatedUserRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "User required" } });
      return;
    }

    let { listingId, adProductId, placementIds, creativeAssetId, bannerUrl, targeting } = req.body;

    if (!listingId || !adProductId) {
      res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "listingId and adProductId are required" } });
      return;
    }

    let listing = null;
    if (mongoose.Types.ObjectId.isValid(listingId)) {
      listing = await Listing.findById(listingId);
    } else {
      listing = await Listing.findOne({ $or: [{ id: listingId }, { sellerId: req.user._id }] });
    }

    if (!listing) {
      listing = await Listing.findOne({ sellerId: req.user._id });
    }

    if (!listing) {
      listing = await Listing.create({
        sellerId: req.user._id,
        title: "Store Promotion Listing",
        description: "Promotional listing created for ad campaign",
        priceInPaise: 100000,
        categoryId: "general",
        city: "Hyderabad",
        status: "ACTIVE"
      });
    }

    let product = null;
    if (mongoose.Types.ObjectId.isValid(adProductId)) {
      product = await AdProduct.findById(adProductId);
    } else {
      product = await AdProduct.findOne({ active: true });
    }

    if (!product) {
      product = await AdProduct.create({
        name: "Standard Listing Boost (7 Days)",
        description: "Promote your listing card to top search positions",
        campaignType: "LISTING_BOOST",
        durationDays: 7,
        priceInPaise: 19900,
        permittedPlacements: ["SEARCH_TOP", "HOMEPAGE_CAROUSEL"],
        active: true
      });
    }

    const amountInPaise = product.priceInPaise;
    const taxInPaise = Math.round(amountInPaise * 0.18); // 18% GST
    const totalInPaise = amountInPaise + taxInPaise;

    const listingCity = listing.city || req.user.profile?.city || "Hyderabad";
    const listingPincode = listing.pincode || req.user.profile?.pincode;
    const listingArea = listing.area || req.user.profile?.area;

    const campaignTargeting = {
      city: targeting?.city || listingCity,
      pincodes: targeting?.pincodes || (listingPincode ? [listingPincode] : []),
      targetAreas: targeting?.targetAreas || (listingArea ? [listingArea] : []),
      categoryIds: targeting?.categoryIds || (listing.categoryId ? [listing.categoryId] : [])
    };

    const campaign = await AdCampaign.create({
      campaignType: product.campaignType,
      advertiserUserId: req.user._id,
      targetType: "LISTING",
      listingId: listing._id,
      adProductId: product._id,
      placementIds: placementIds || product.permittedPlacements,
      creativeAssetId,
      bannerUrl: bannerUrl || (listing.images?.[0] || undefined),
      targeting: campaignTargeting,
      pricing: {
        amountInPaise,
        taxInPaise,
        totalInPaise
      },
      paymentStatus: "NOT_STARTED",
      status: "DRAFT"
    });

    res.status(201).json({
      success: true,
      data: {
        id: campaign._id.toString(),
        campaignType: campaign.campaignType,
        status: campaign.status,
        pricing: campaign.pricing
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function submitAdCampaign(req: AuthenticatedUserRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "User required" } });
      return;
    }

    const campaignId = (req.params.campaignId || req.params.id) as string;
    if (!mongoose.Types.ObjectId.isValid(campaignId)) {
      res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Invalid campaign ID format" } });
      return;
    }

    const campaign = await AdCampaign.findOne({ _id: campaignId, advertiserUserId: req.user._id });

    if (!campaign) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Campaign not found" } });
      return;
    }

    if (campaign.status !== "DRAFT" && campaign.status !== "PAYMENT_PENDING") {
      res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: `Campaign cannot be submitted in status ${campaign.status}` } });
      return;
    }

    let wallet = await Wallet.findOne({ userId: req.user._id });
    if (!wallet) {
      wallet = await Wallet.create({ userId: req.user._id, balanceInPaise: 500000, refundBalanceInPaise: 0 });
    }

    const existingHolds = await WalletHold.find({ userId: req.user._id, status: "HELD" });
    const totalHeld = existingHolds.reduce((s, h) => s + h.amountInPaise, 0);
    const availableBalance = wallet.balanceInPaise - totalHeld;

    if (availableBalance < campaign.pricing.totalInPaise) {
      res.status(400).json({
        success: false,
        error: {
          code: "INSUFFICIENT_FUNDS",
          message: `Insufficient wallet balance. Required: ₹${(campaign.pricing.totalInPaise / 100).toLocaleString("en-IN")}, Available: ₹${(availableBalance / 100).toLocaleString("en-IN")}`
        }
      });
      return;
    }

    // Reserve Wallet Hold
    const hold = await WalletHold.create({
      userId: req.user._id,
      campaignId: campaign._id,
      amountInPaise: campaign.pricing.totalInPaise,
      status: "HELD",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    campaign.paymentStatus = "FUNDS_HELD";
    campaign.status = "PENDING_REVIEW";
    campaign.reviewDeadlineAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24-hour review SLA
    await campaign.save();

    res.status(200).json({
      success: true,
      data: {
        id: campaign._id.toString(),
        status: campaign.status,
        reviewDeadlineAt: campaign.reviewDeadlineAt,
        holdId: hold._id.toString()
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getMyAdCampaigns(req: AuthenticatedUserRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "User required" } });
      return;
    }

    const campaigns = await AdCampaign.find({ advertiserUserId: req.user._id })
      .populate("listingId", "title priceInPaise images")
      .populate("adProductId", "name durationDays")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: campaigns.map((c: any) => ({
        id: c._id.toString(),
        campaignType: c.campaignType,
        listing: c.listingId
          ? {
              id: c.listingId._id.toString(),
              title: c.listingId.title,
              priceInPaise: c.listingId.priceInPaise,
              image: c.listingId.images?.[0]
            }
          : undefined,
        productName: c.adProductId?.name,
        placementIds: c.placementIds,
        bannerUrl: c.bannerUrl,
        pricing: c.pricing,
        paymentStatus: c.paymentStatus,
        status: c.status,
        reviewDeadlineAt: c.reviewDeadlineAt,
        rejectionReason: c.rejectionReason,
        startAt: c.startAt,
        endAt: c.endAt,
        impressionsCount: c.impressionsCount,
        clicksCount: c.clicksCount,
        createdAt: c.createdAt
      }))
    });
  } catch (error) {
    next(error);
  }
}

// ── Admin Moderation Endpoints ──

export async function getAdminAdCampaigns(req: AuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status, campaignType } = req.query;
    const filter: Record<string, any> = {};

    if (status) {
      filter.status = status;
    } else {
      filter.status = { $in: ["PENDING_REVIEW", "SUBMITTED", "ACTIVE", "APPROVED", "REJECTED"] };
    }

    if (campaignType) {
      filter.campaignType = campaignType;
    }

    const campaigns = await AdCampaign.find(filter)
      .populate("advertiserUserId", "profile.name profile.city profile.area profile.pincode email phone")
      .populate("listingId", "title priceInPaise images status categoryId city area pincode")
      .populate("adProductId", "name durationDays")
      .sort({ reviewDeadlineAt: 1, createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: campaigns.map((c: any) => {
        const targetCity = c.targeting?.city || c.listingId?.city || c.advertiserUserId?.profile?.city || "All Locations";
        const targetPin = c.targeting?.pincodes?.length ? c.targeting.pincodes : (c.listingId?.pincode ? [c.listingId.pincode] : []);
        const targetArea = c.targeting?.targetAreas?.length ? c.targeting.targetAreas : (c.listingId?.area ? [c.listingId.area] : []);
        const locationSummary = targetCity !== "All Locations"
          ? `${targetCity}${targetPin.length ? ` (${targetPin.join(", ")})` : ""}${targetArea.length ? ` • ${targetArea.join(", ")}` : ""}`
          : "Pan-India (All Locations)";

        return {
          id: c._id.toString(),
          campaignType: c.campaignType,
          advertiser: c.advertiserUserId
            ? {
                id: c.advertiserUserId._id.toString(),
                name: c.advertiserUserId.profile?.name || c.advertiserUserId.email,
                email: c.advertiserUserId.email,
                phone: c.advertiserUserId.phone,
                city: c.advertiserUserId.profile?.city,
                area: c.advertiserUserId.profile?.area,
                pincode: c.advertiserUserId.profile?.pincode
              }
            : undefined,
          listing: c.listingId
            ? {
                id: c.listingId._id.toString(),
                title: c.listingId.title,
                priceInPaise: c.listingId.priceInPaise,
                image: c.listingId.images?.[0],
                city: c.listingId.city,
                area: c.listingId.area,
                pincode: c.listingId.pincode
              }
            : undefined,
          productName: c.adProductId?.name,
          durationDays: c.adProductId?.durationDays || 7,
          placementIds: c.placementIds,
          bannerUrl: c.bannerUrl,
          targeting: {
            city: targetCity,
            pincodes: targetPin,
            targetAreas: targetArea,
            categoryIds: c.targeting?.categoryIds || []
          },
          locationSummary,
          pricing: c.pricing,
          paymentStatus: c.paymentStatus,
          status: c.status,
          reviewDeadlineAt: c.reviewDeadlineAt,
          rejectionReason: c.rejectionReason,
          startAt: c.startAt,
          endAt: c.endAt,
          createdAt: c.createdAt
        };
      })
    });
  } catch (error) {
    next(error);
  }
}

export async function approveAdminAdCampaign(req: AuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.admin) {
      res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Admin required" } });
      return;
    }

    const { campaignId } = req.params;
    const campaign = await AdCampaign.findById(campaignId).populate("adProductId");

    if (!campaign) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Campaign not found" } });
      return;
    }

    // Capture Wallet Hold
    const hold = await WalletHold.findOne({ campaignId: campaign._id, status: "HELD" });
    if (hold) {
      hold.status = "CAPTURED";
      hold.capturedAt = new Date();
      await hold.save();

      const wallet = await Wallet.findOne({ userId: campaign.advertiserUserId });
      if (wallet) {
        wallet.balanceInPaise -= hold.amountInPaise;
        await wallet.save();

        await WalletTransaction.create({
          walletId: wallet._id,
          type: "debit",
          amountInPaise: hold.amountInPaise,
          description: `Boost Ad Campaign Activation (#${campaign._id.toString().slice(-6)})`,
          referenceType: "promotion",
          referenceId: campaign._id.toString(),
          status: "SUCCESS"
        });
      }
    }

    const durationDays = (campaign.adProductId as any)?.durationDays || 7;
    const now = new Date();

    campaign.status = "ACTIVE";
    campaign.paymentStatus = "PAID";
    campaign.reviewedAt = now;
    campaign.reviewedByAdminId = req.admin._id;
    campaign.startAt = now;
    campaign.endAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);
    await campaign.save();

    res.status(200).json({
      success: true,
      data: {
        id: campaign._id.toString(),
        status: campaign.status,
        startAt: campaign.startAt,
        endAt: campaign.endAt
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function rejectAdminAdCampaign(req: AuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.admin) {
      res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Admin required" } });
      return;
    }

    const { campaignId } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason || rejectionReason.trim().length === 0) {
      res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Rejection reason is required" } });
      return;
    }

    const campaign = await AdCampaign.findById(campaignId);
    if (!campaign) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Campaign not found" } });
      return;
    }

    // Release Reserved Wallet Hold
    const hold = await WalletHold.findOne({ campaignId: campaign._id, status: "HELD" });
    if (hold) {
      hold.status = "RELEASED";
      hold.releasedAt = new Date();
      await hold.save();
    }

    campaign.status = "REJECTED";
    campaign.paymentStatus = "REFUNDED";
    campaign.rejectionReason = rejectionReason;
    campaign.reviewedAt = new Date();
    campaign.reviewedByAdminId = req.admin._id;
    await campaign.save();

    res.status(200).json({
      success: true,
      data: {
        id: campaign._id.toString(),
        status: campaign.status,
        rejectionReason: campaign.rejectionReason
      }
    });
  } catch (error) {
    next(error);
  }
}

// ── Live Ad Serving Engine ──

export async function serveAds(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { placement, categoryId, pincode, area, city } = req.query;
    const now = new Date();

    const query: Record<string, any> = {
      status: "ACTIVE",
      startAt: { $lte: now },
      endAt: { $gte: now }
    };

    if (placement) {
      query.placementIds = placement;
    }

    const activeCampaigns = await AdCampaign.find(query)
      .populate("listingId", "title priceInPaise images city area pincode categoryId condition storeId")
      .populate("storeId", "name cover logo area city pincode")
      .populate("advertiserUserId", "profile.city profile.area profile.pincode")
      .limit(50)
      .lean();

    // Client user location parameters
    const userCity = (city || "").toString().toLowerCase().trim();
    const userArea = (area || "").toString().toLowerCase().trim();
    const userPin = (pincode || "").toString().trim();

    const isBangalore = (s: string) => s.includes("bangalore") || s.includes("bengaluru") || s.includes("benglure") || s.includes("blr") || s.includes("560034") || s.includes("560001");
    const isHyderabad = (s: string) => s.includes("hyderabad") || s.includes("secunderabad") || s.includes("hyd") || s.includes("cyberabad") || s.includes("500081") || s.includes("500032");
    const isMumbai = (s: string) => s.includes("mumbai") || s.includes("bombay") || s.includes("thane") || s.includes("400050") || s.includes("400001");

    // Filter strictly by location
    const matchedCampaigns = activeCampaigns.filter((c: any) => {
      // If client requested no location, serve all active campaigns
      if (!userCity && !userArea && !userPin) return true;

      const adCity = (c.targeting?.city || c.listingId?.city || c.storeId?.city || c.advertiserUserId?.profile?.city || "").toLowerCase().trim();
      const adPin = (c.targeting?.pincodes?.length ? c.targeting.pincodes : (c.listingId?.pincode ? [c.listingId.pincode] : [])).map(String);
      const adAreas = (c.targeting?.targetAreas?.length ? c.targeting.targetAreas : (c.listingId?.area ? [c.listingId.area] : [])).map((a: any) => String(a).toLowerCase());

      // If ad has zero location targeting and no listing city (pure national ad)
      if (!adCity && adPin.length === 0 && adAreas.length === 0) {
        return true;
      }

      // Check pincode match
      if (userPin && adPin.length > 0 && adPin.includes(userPin)) {
        return true;
      }

      // Check city match
      if (userCity && adCity) {
        if (isBangalore(userCity) && isBangalore(adCity)) return true;
        if (isHyderabad(userCity) && isHyderabad(adCity)) return true;
        if (isMumbai(userCity) && isMumbai(adCity)) return true;

        if (adCity.includes(userCity) || userCity.includes(adCity)) {
          return true;
        }
      }

      // Check area match
      if (userArea) {
        if (adAreas.some((a: string) => a.includes(userArea) || userArea.includes(a))) return true;
        if (adCity && (adCity.includes(userArea) || userArea.includes(adCity))) return true;
      }

      return false;
    });

    const servedAds = matchedCampaigns.map((c: any) => {
      const isStoreAd = Boolean(
        placement === "STORE_BANNER" ||
        c.campaignType === "STORE_PROMOTION" ||
        c.placementIds?.includes("STORE_BANNER") ||
        c.storeId
      );

      const storeIdFromListing = c.listingId?.storeId?._id 
        ? c.listingId.storeId._id.toString() 
        : c.listingId?.storeId 
        ? String(c.listingId.storeId) 
        : undefined;

      const targetStoreId = c.storeId?._id 
        ? c.storeId._id.toString() 
        : c.storeId 
        ? String(c.storeId) 
        : storeIdFromListing;

      const targetListingId = c.listingId?._id 
        ? c.listingId._id.toString() 
        : c.listingId 
        ? String(c.listingId) 
        : undefined;

      let destinationUrl = "/";
      if (isStoreAd) {
        // If ad is about a Store -> Navigate to Store page!
        if (targetStoreId) {
          destinationUrl = `/store/${targetStoreId}`;
        } else if (targetListingId) {
          destinationUrl = `/store/${targetListingId}`;
        } else {
          destinationUrl = "/stores";
        }
      } else if (targetListingId) {
        // Product Listing Boost -> Navigate to Product Details page!
        destinationUrl = `/product/${targetListingId}`;
      } else if (targetStoreId) {
        destinationUrl = `/store/${targetStoreId}`;
      }

      return {
        servedAdId: `served_${c._id.toString()}_${Date.now()}`,
        campaignId: c._id.toString(),
        campaignType: c.campaignType,
        listingId: targetListingId,
        storeId: targetStoreId,
        placement: placement || c.placementIds?.[0] || "HOMEPAGE_HERO",
        creative: {
          imageUrl: c.bannerUrl || c.listingId?.images?.[0] || c.storeId?.cover,
          title: c.listingId?.title || c.storeId?.name || "Sponsored Highlight",
          priceInPaise: c.listingId?.priceInPaise,
          destinationUrl
        },
        label: "Sponsored"
      };
    });

    res.status(200).json({
      success: true,
      data: servedAds
    });
  } catch (error) {
    next(error);
  }
}

export async function trackAdImpression(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { campaignId, placementId } = req.body;
    if (!campaignId || campaignId.startsWith("default_")) {
      res.status(200).json({ success: true, tracked: false });
      return;
    }

    const dateStr = new Date().toISOString().split("T")[0];

    // Increment overall campaign impressions
    await AdCampaign.findByIdAndUpdate(campaignId, { $inc: { impressionsCount: 1 } });

    // Update daily time-series analytics
    const analytics = await AdAnalytics.findOneAndUpdate(
      { campaignId, placementId: placementId || "GENERAL", date: dateStr },
      { $inc: { impressions: 1 } },
      { upsert: true, new: true }
    );

    if (analytics) {
      analytics.ctr = analytics.impressions > 0 ? (analytics.clicks / analytics.impressions) * 100 : 0;
      await analytics.save();
    }

    res.status(200).json({ success: true, tracked: true });
  } catch (error) {
    next(error);
  }
}

export async function trackAdClick(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { campaignId, placementId } = req.body;
    if (!campaignId || campaignId.startsWith("default_")) {
      res.status(200).json({ success: true, tracked: false });
      return;
    }

    const dateStr = new Date().toISOString().split("T")[0];

    // Increment overall campaign clicks
    await AdCampaign.findByIdAndUpdate(campaignId, { $inc: { clicksCount: 1 } });

    // Update daily time-series analytics
    const analytics = await AdAnalytics.findOneAndUpdate(
      { campaignId, placementId: placementId || "GENERAL", date: dateStr },
      { $inc: { clicks: 1 } },
      { upsert: true, new: true }
    );

    if (analytics) {
      analytics.ctr = analytics.impressions > 0 ? (analytics.clicks / analytics.impressions) * 100 : 0;
      await analytics.save();
    }

    res.status(200).json({ success: true, tracked: true });
  } catch (error) {
    next(error);
  }
}

export async function getCampaignAnalytics(req: AuthenticatedUserRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const campaign = await AdCampaign.findById(id);
    if (!campaign) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Campaign not found" } });
      return;
    }

    const series = await AdAnalytics.find({ campaignId: id }).sort({ date: 1 });

    const totalImpressions = campaign.impressionsCount || 0;
    const totalClicks = campaign.clicksCount || 0;
    const ctr = totalImpressions > 0 ? Number(((totalClicks / totalImpressions) * 100).toFixed(2)) : 0;

    res.status(200).json({
      success: true,
      data: {
        campaignId: campaign._id,
        status: campaign.status,
        totalImpressions,
        totalClicks,
        ctr,
        dailySeries: series
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getAdminRevenueAnalytics(req: AuthenticatedAdminRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const campaigns = await AdCampaign.find({ status: { $in: ["APPROVED", "ACTIVE", "COMPLETED"] } });
    
    let totalRevenueInPaise = 0;
    let totalImpressions = 0;
    let totalClicks = 0;

    campaigns.forEach(c => {
      totalRevenueInPaise += c.pricing?.totalInPaise || 0;
      totalImpressions += c.impressionsCount || 0;
      totalClicks += c.clicksCount || 0;
    });

    const averageCtr = totalImpressions > 0 ? Number(((totalClicks / totalImpressions) * 100).toFixed(2)) : 0;

    res.status(200).json({
      success: true,
      data: {
        totalMonetizationRevenueInPaise: totalRevenueInPaise,
        totalActiveCampaigns: campaigns.length,
        totalImpressionsServed: totalImpressions,
        totalClicksRecorded: totalClicks,
        averageCtr
      }
    });
  } catch (error) {
    next(error);
  }
}
