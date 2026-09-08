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
      wallet = await Wallet.create({ userId: req.user._id, balanceInPaise: 0, refundBalanceInPaise: 0 });
    }

    // Retrieve all valid transactions for this wallet
    const allCompletedTxns = await WalletTransaction.find({
      walletId: wallet._id,
      status: { $in: ["COMPLETED", "SUCCESS", "completed", "success"] }
    }).sort({ createdAt: -1 });

    if (allCompletedTxns.length > 0) {
      // Deduplicate any repeated transactions caused by duplicate network calls or double submission
      const seenPaymentKeys = new Set<string>();
      const duplicateIds: mongoose.Types.ObjectId[] = [];
      const validTxns: any[] = [];

      for (const t of allCompletedTxns) {
        const match = t.description?.match(/#([a-zA-Z0-9_-]+)/);
        const payRef = match ? match[1] : (t.referenceId || null);
        const dedupKey = payRef
          ? `pay_${payRef}`
          : `amt_${t.type}_${t.amountInPaise}_${Math.floor(new Date(t.createdAt).getTime() / 5000)}`;

        if (seenPaymentKeys.has(dedupKey)) {
          duplicateIds.push(t._id as mongoose.Types.ObjectId);
        } else {
          seenPaymentKeys.add(dedupKey);
          validTxns.push(t);
        }
      }

      if (duplicateIds.length > 0) {
        await WalletTransaction.deleteMany({ _id: { $in: duplicateIds } });
      }

      // Always compute accurate balance strictly from genuine completed transactions
      // (This automatically strips away any ghost/default 5,000 that was in the balance without a transaction)
      const computedTxnBalance = validTxns.reduce((sum, t) => {
        const isCredit = (t.type || "").toUpperCase() === "CREDIT" || t.type === "credit";
        const isDebit = (t.type || "").toUpperCase() === "DEBIT" || t.type === "debit";
        if (isCredit) return sum + t.amountInPaise;
        if (isDebit) return sum - t.amountInPaise;
        return sum;
      }, 0);

      if (wallet.balanceInPaise !== computedTxnBalance) {
        wallet.balanceInPaise = Math.max(0, computedTxnBalance);
        await wallet.save();
      }
    } else {
      // 0 transactions: clear legacy ₹5,000 default promo credit if still sitting on document
      if (wallet.balanceInPaise === 500000) {
        wallet.balanceInPaise = 0;
        await wallet.save();
      }
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
        availableBalanceInPaise: Math.max(0, wallet.balanceInPaise - totalHeldInPaise),
        heldBalanceInPaise: totalHeldInPaise,
        refundBalanceInPaise: wallet.refundBalanceInPaise,
        promoCreditsInPaise: (wallet as any).promoCreditsInPaise || 0,
        transactions: transactions.map((t) => ({
          id: t._id.toString(),
          type: (t.type || "credit").toLowerCase(),
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
      userId: req.user._id,
      type: "credit",
      amountInPaise,
      description: `Wallet top-up via Razorpay${methodStr} #${pId.slice(-8)}`,
      referenceType: "TOPUP",
      referenceId: pId,
      idempotencyKey: `recharge_${pId}_${Date.now()}`,
      status: "SUCCESS"
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
    const seedProducts = [
      // --- Listing Boost Plans (Clean & Direct) ---
      {
        name: "⚡ Quick Boost (3 Days)",
        description: "Promote your listing card with a FEATURED badge and higher category ranking for 3 days.",
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
        description: "Top search ranking, SPONSORED badge, and category spotlight for 7 days. Most popular seller choice!",
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
        name: "👑 Pro Mega Boost (15 Days)",
        description: "Homepage hero feature, guaranteed top search spot, URGENT badge, and 10× visibility boost for 15 days.",
        campaignType: "LISTING_BOOST",
        durationDays: 15,
        priceInPaise: 49900, // ₹499
        originalPriceInPaise: 79900, // ₹799
        badge: "👑 Max Exposure",
        features: [
          "Homepage Banner Feature",
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
      {
        name: "🔴 Urgent Sale Fast Clearance (3 Days)",
        description: "Pulsing red URGENT sale badge overlay on your listing card for emergency sales and fast clearance.",
        campaignType: "LISTING_BOOST",
        durationDays: 3,
        priceInPaise: 4900, // ₹49
        originalPriceInPaise: 9900, // ₹99
        badge: "🔴 Urgent Sale",
        features: [
          "Eye-catching Pulsing Red 'URGENT' Ribbon",
          "Filtered directly into 'Urgent Deals' local browse tab",
          "Instant buyer WhatsApp trigger & direct calling button",
          "Clearance liquidation tag for price-conscious buyers"
        ],
        estimatedReach: "2,000 - 4,500 Bargain Hunters",
        priority: 4,
        permittedPlacements: ["URGENT_BADGE"],
        active: true
      },
      {
        name: "✨ Golden Glow Card Highlight (7 Days)",
        description: "Illuminated golden card border and warm badge glow that makes your product pop in all search grids.",
        campaignType: "LISTING_BOOST",
        durationDays: 7,
        priceInPaise: 8900, // ₹89
        originalPriceInPaise: 14900, // ₹149
        badge: "✨ Golden Border",
        features: [
          "Illuminated Golden Glowing Border on Product Card",
          "Stands out from ordinary listings in category & search feeds",
          "Verified seller trust emblem overlay",
          "3× Higher click-through rate from visual prominence"
        ],
        estimatedReach: "4,000 - 8,000 Category Shoppers",
        priority: 5,
        permittedPlacements: ["HIGHLIGHTED_CARD"],
        active: true
      },
      {
        name: "🔍 Search Results Priority Spotlight (3 Days)",
        description: "Guaranteed top 1-3 ranking spots on keyword search results with SPONSORED badge for 3 days of targeted intent.",
        campaignType: "LISTING_BOOST",
        durationDays: 3,
        priceInPaise: 14900, // ₹149
        originalPriceInPaise: 24900, // ₹249
        badge: "⚡ Search Rank",
        features: [
          "Guaranteed Top 1-3 ranking for relevant keyword searches",
          "SPONSORED golden badge label",
          "Target active buyers ready to purchase right now",
          "Instant direct call and chat connectivity"
        ],
        estimatedReach: "3,000 - 6,000 Active Searchers",
        priority: 6,
        permittedPlacements: ["SEARCH_TOP"],
        active: true
      },

      // --- Plain Banners (Home Page Banners, Category, Stores, Jobs) ---
      {
        name: "🎨 Home Page Banner (7 Days)",
        description: "High-impact banner featured prominently across the main Omeetso homepage with direct store or listing link.",
        campaignType: "BANNER_AD",
        durationDays: 7,
        priceInPaise: 49900, // ₹499
        originalPriceInPaise: 79900, // ₹799
        badge: "Best for Stores",
        features: [
          "Main Homepage Billboard Banner Placement",
          "Custom Creative Image & Direct Link",
          "Click-through to Store / WhatsApp",
          "Targeted by User City / Pincode"
        ],
        estimatedReach: "20,000+ Homepage Visitors",
        priority: 7,
        permittedPlacements: ["HOMEPAGE_HERO"],
        active: true
      },
      {
        name: "🌟 Home Page Banner (14 Days)",
        description: "Extended 2-week premium banner showcase across the Omeetso marketplace homepage.",
        campaignType: "BANNER_AD",
        durationDays: 14,
        priceInPaise: 89900, // ₹899
        originalPriceInPaise: 149900, // ₹1,499
        badge: "🔥 Premium Spot",
        features: [
          "14 Days Prime Banner Rotation on Homepage",
          "High CTR direct store showroom & WhatsApp link",
          "Hyperlocal city & district targeted delivery",
          "Live real-time impression & click telemetry"
        ],
        estimatedReach: "45,000+ Verified Visitors",
        priority: 8,
        permittedPlacements: ["HOMEPAGE_HERO"],
        active: true
      },
      {
        name: "👑 Home Page Banner (30 Days)",
        description: "Full monthly presence on the main Omeetso homepage for sustained authority and maximum local reach.",
        campaignType: "BANNER_AD",
        durationDays: 30,
        priceInPaise: 149900, // ₹1,499
        originalPriceInPaise: 249900, // ₹2,499
        badge: "👑 Max Branding",
        features: [
          "30 Days Continuous Rotation on Homepage",
          "Direct Store / Profile / WhatsApp Inquiry Link",
          "Zero Banner Fatigue with Multi-Creative Rotation",
          "Comprehensive Monthly Analytics & CTR Insights"
        ],
        estimatedReach: "100,000+ Homepage Impressions",
        priority: 9,
        permittedPlacements: ["HOMEPAGE_HERO"],
        active: true
      },
      {
        name: "🏷️ Category Page Banner (7 Days)",
        description: "Top billboard header banner displayed across category search pages for 7 days.",
        campaignType: "BANNER_AD",
        durationDays: 7,
        priceInPaise: 39900, // ₹399
        originalPriceInPaise: 69900, // ₹699
        badge: "Niche Target",
        features: [
          "Pinned at Top of Specific Category Pages",
          "Targets users actively browsing your specific industry",
          "Direct store showroom or external website link",
          "Zero competing banner in viewport"
        ],
        estimatedReach: "25,000+ Category Shoppers",
        priority: 10,
        permittedPlacements: ["CATEGORY_HEADER"],
        active: true
      },
      {
        name: "🏷️ Category Page Banner (14 Days)",
        description: "Top header banner displayed across all category search pages targeting active local shoppers for 14 days.",
        campaignType: "BANNER_AD",
        durationDays: 14,
        priceInPaise: 69900, // ₹699
        originalPriceInPaise: 119900, // ₹1,199
        badge: "High Conversion",
        features: [
          "Pinned at Top of Specific Category",
          "Zero Direct Competition in Slot",
          "Targeted to Buyers Browsing Your Niche",
          "Live Click & View Analytics Dashboard"
        ],
        estimatedReach: "50,000+ Category Shoppers",
        priority: 11,
        permittedPlacements: ["CATEGORY_HEADER"],
        active: true
      },
      {
        name: "🏬 Store Directory Banner (14 Days)",
        description: "Featured brand and showroom billboard on the /stores directory and merchant profile pages.",
        campaignType: "BANNER_AD",
        durationDays: 14,
        priceInPaise: 49900, // ₹499
        originalPriceInPaise: 89900, // ₹899
        badge: "Best for Showrooms",
        features: [
          "Top billboard spot on /stores directory",
          "Pinned spotlight on merchant category pages",
          "Direct store showroom visit link",
          "Verified Merchant Trust Shield"
        ],
        estimatedReach: "25,000+ Verified Buyers",
        priority: 12,
        permittedPlacements: ["STORE_BANNER"],
        active: true
      },
      {
        name: "🏬 Store Directory Banner (30 Days)",
        description: "Full monthly presence at the top of the Omeetso Store Directory to cement merchant authority in your locality.",
        campaignType: "BANNER_AD",
        durationDays: 30,
        priceInPaise: 89900, // ₹899
        originalPriceInPaise: 149900, // ₹1,499
        badge: "👑 Store Branding",
        features: [
          "30 Days permanent billboard on /stores directory",
          "Promoted Merchant profile with direct WhatsApp inquiries",
          "Google Maps store navigation link integration",
          "Priority Merchant Verification Badge"
        ],
        estimatedReach: "60,000+ Store Shoppers",
        priority: 13,
        permittedPlacements: ["STORE_BANNER"],
        active: true
      },
      {
        name: "💼 Jobs Portal Banner (7 Days)",
        description: "One week recruitment billboard header on Omeetso Local Jobs portal targeting urgent candidate hiring.",
        campaignType: "BANNER_AD",
        durationDays: 7,
        priceInPaise: 39900, // ₹399
        originalPriceInPaise: 69900, // ₹699
        badge: "Urgent Hiring",
        features: [
          "Top billboard spot on Omeetso Local Jobs Portal",
          "Direct WhatsApp & phone call application buttons",
          "Target drivers, sales executive, retail & technical staff",
          "Urgent employer badge with fast candidate leads"
        ],
        estimatedReach: "10,000+ Local Candidates",
        priority: 14,
        permittedPlacements: ["JOBS_HEADER"],
        active: true
      },
      {
        name: "💼 Jobs Portal Banner (14 Days)",
        description: "Top billboard spot on the Omeetso Local Jobs and careers portal targeting local candidates for 14 days.",
        campaignType: "BANNER_AD",
        durationDays: 14,
        priceInPaise: 69900, // ₹699
        originalPriceInPaise: 119900, // ₹1,199
        badge: "Fast Hiring",
        features: [
          "Top billboard spot on Omeetso Local Jobs Portal",
          "Direct call & WhatsApp application buttons",
          "Target nearby drivers, technicians, retail & office staff",
          "Verified employer badge & urgent hiring tag"
        ],
        estimatedReach: "25,000+ Local Job Seekers",
        priority: 15,
        permittedPlacements: ["JOBS_HEADER"],
        active: true
      }
    ];

    // Clean up obsolete cluttered products
    await AdProduct.deleteMany({
      $or: [
        { name: { $regex: /Section Divider|Middle Promotional Carousel|Native Spotlight|Omnichannel|Showroom & Store Mega Spotlight|Contextual Partner/i } },
        { permittedPlacements: { $in: ["HOMEPAGE_SECTION_BANNER", "HOMEPAGE_CAROUSEL", "HOME_NATIVE_FEED", "PRODUCT_CONTEXTUAL"] } }
      ]
    });

    if (req.query.reset === "true") {
      await AdProduct.deleteMany({});
      await AdProduct.insertMany(seedProducts);
    } else {
      // Upsert all plans to ensure newly added plans are always present with features and placements
      for (const sp of seedProducts) {
        await AdProduct.updateOne(
          { name: sp.name },
          {
            $set: {
              name: sp.name,
              description: sp.description,
              campaignType: sp.campaignType,
              durationDays: sp.durationDays,
              priceInPaise: sp.priceInPaise,
              originalPriceInPaise: sp.originalPriceInPaise,
              badge: sp.badge,
              features: sp.features,
              estimatedReach: sp.estimatedReach,
              priority: sp.priority,
              permittedPlacements: sp.permittedPlacements,
              active: sp.active
            }
          },
          { upsert: true }
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
    const defaultPlacements = [
      {
        placementId: "HOMEPAGE_HERO",
        name: "Home Page Banners",
        campaignTypes: ["BANNER_AD"],
        aspectRatio: "16:9",
        minimumWidth: 1600,
        minimumHeight: 900,
        maximumFileSizeBytes: 3145728, // 3MB
        maximumActiveSlots: 10,
        active: true,
        page: "Homepage",
        route: "/",
        position: "Main Homepage Banner",
        description: "Prominent billboard banner across the main Omeetso homepage with auto-rotation, advertiser CTA link, and verified local reach.",
        device: "Web & Mobile App"
      },
      {
        placementId: "CATEGORY_HEADER",
        name: "Category Page Banners",
        campaignTypes: ["BANNER_AD"],
        aspectRatio: "3:1",
        minimumWidth: 1500,
        minimumHeight: 500,
        maximumFileSizeBytes: 2097152,
        maximumActiveSlots: 5,
        active: true,
        page: "Category Browse",
        route: "/category/all",
        position: "Category Top Billboard",
        description: "Top billboard banner across category pages (Mobiles, Cars, Electronics, Furniture, etc.) targeting active category shoppers.",
        device: "Web & Mobile App"
      },
      {
        placementId: "STORE_BANNER",
        name: "Store Directory Banners",
        campaignTypes: ["BANNER_AD"],
        aspectRatio: "3:1",
        minimumWidth: 1200,
        minimumHeight: 400,
        maximumFileSizeBytes: 2097152,
        maximumActiveSlots: 5,
        active: true,
        page: "Stores Directory & Showrooms",
        route: "/stores",
        position: "Store Directory Billboard",
        description: "Spotlight brand and showroom billboard banner on the stores directory and merchant profile pages.",
        device: "Web & Mobile App"
      },
      {
        placementId: "JOBS_HEADER",
        name: "Jobs Portal Banners",
        campaignTypes: ["BANNER_AD"],
        aspectRatio: "3:1",
        minimumWidth: 1200,
        minimumHeight: 400,
        maximumFileSizeBytes: 2097152,
        maximumActiveSlots: 5,
        active: true,
        page: "Jobs Portal",
        route: "/jobs",
        position: "Jobs Portal Top Header Banner",
        description: "Recruitment and hiring billboard banner at the top of the Omeetso Local Jobs and careers portal.",
        device: "Web & Mobile App"
      },
      {
        placementId: "SEARCH_TOP",
        name: "Search Results Priority Spots",
        campaignTypes: ["LISTING_BOOST"],
        aspectRatio: "CARD",
        minimumWidth: 600,
        minimumHeight: 400,
        maximumFileSizeBytes: 2097152, // 2MB
        maximumActiveSlots: 5,
        active: true,
        page: "Search Results",
        route: "/results",
        position: "Top of Search Results Grid (#1 Priority)",
        description: "Guaranteed top 1-3 ranking spots on keyword search results with SPONSORED golden badge and maximum buyer visibility.",
        device: "Web & Mobile App"
      },
      {
        placementId: "CATEGORY_FEATURED",
        name: "Category Featured Listing",
        campaignTypes: ["LISTING_BOOST"],
        aspectRatio: "CARD",
        minimumWidth: 600,
        minimumHeight: 400,
        maximumFileSizeBytes: 2097152,
        maximumActiveSlots: 10,
        active: true,
        page: "Category Browse",
        route: "/category/all",
        position: "Category Listing Grid",
        description: "Featured sponsored listing cards in category product grids with highlighted border and priority buyer inquiries.",
        device: "Web & Mobile App"
      },
      {
        placementId: "URGENT_BADGE",
        name: "Urgent Sale Badge",
        campaignTypes: ["LISTING_BOOST"],
        aspectRatio: "BADGE",
        minimumWidth: 200,
        minimumHeight: 60,
        maximumFileSizeBytes: 524288,
        maximumActiveSlots: 25,
        active: true,
        page: "All Feeds & Search Results",
        route: "/results",
        position: "Listing Card Top-Left Ribbon",
        description: "Pulsing red 'URGENT SALE' ribbon badge overlaid on listing cards to trigger rapid buyer inquiries.",
        device: "Web & Mobile App"
      },
      {
        placementId: "HIGHLIGHTED_CARD",
        name: "Golden Highlighted Card",
        campaignTypes: ["LISTING_BOOST"],
        aspectRatio: "CARD",
        minimumWidth: 600,
        minimumHeight: 400,
        maximumFileSizeBytes: 2097152,
        maximumActiveSlots: 20,
        active: true,
        page: "All Feeds & Search Results",
        route: "/results",
        position: "Listing Card Glow Border",
        description: "Golden illuminated card border with subtle gradient glow effect making listings stand out in browsing feeds.",
        device: "Web & Mobile App"
      }
    ];

    // Delete obsolete legacy placements so they don't clutter the UI
    await AdPlacement.deleteMany({
      placementId: { $in: ["HOMEPAGE_SECTION_BANNER", "HOMEPAGE_CAROUSEL", "HOME_NATIVE_FEED", "PRODUCT_CONTEXTUAL"] }
    });

    if (req.query.reset === "true") {
      await AdPlacement.deleteMany({});
      await AdPlacement.insertMany(defaultPlacements);
    } else {
      // Upsert default placements to ensure newly introduced slots are synced with full metadata
      for (const dp of defaultPlacements) {
        await AdPlacement.updateOne(
          { placementId: dp.placementId },
          {
            $set: {
              name: dp.name,
              campaignTypes: dp.campaignTypes,
              aspectRatio: dp.aspectRatio,
              minimumWidth: dp.minimumWidth,
              minimumHeight: dp.minimumHeight,
              maximumFileSizeBytes: dp.maximumFileSizeBytes,
              maximumActiveSlots: dp.maximumActiveSlots,
              page: dp.page,
              route: dp.route,
              position: dp.position,
              description: dp.description,
              device: dp.device
            },
            $setOnInsert: {
              active: dp.active
            }
          },
          { upsert: true }
        );
      }
    }

    const query: Record<string, any> = {};
    if (req.query.activeOnly === "true") {
      query.active = true;
    }

    const [placements, liveCampaigns, allProducts] = await Promise.all([
      AdPlacement.find(query).sort({ createdAt: 1 }).lean(),
      AdCampaign.find({
        status: { $in: ["ACTIVE", "SCHEDULED", "PENDING_REVIEW"] }
      })
        .populate("advertiserUserId", "name email phone avatar")
        .populate("listingId", "title images priceInPaise area city")
        .populate("adProductId", "name durationDays priceInPaise badge")
        .lean(),
      AdProduct.find({ active: true }).sort({ priority: 1, priceInPaise: 1 }).lean()
    ]);

    const data = placements.map((p) => {
      const bookedCampaigns = liveCampaigns.filter((c: any) =>
        c.placementIds?.includes(p.placementId)
      );

      const matchingPlans = allProducts.filter((prod) =>
        prod.permittedPlacements?.includes(p.placementId)
      );

      const startingPrice = matchingPlans.length > 0
        ? Math.min(...matchingPlans.map((m) => Math.round(m.priceInPaise / 100)))
        : (p as any).baseDailyRate || 199;

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
        page: (p as any).page || "Homepage",
        route: (p as any).route || "/",
        position: (p as any).position || "Standard Placement",
        description: (p as any).description || "",
        device: (p as any).device || "Web & Mobile App",
        baseCPM: (p as any).baseCPM || 100,
        baseDailyRate: (p as any).baseDailyRate || 299,
        startingPrice,
        pricingPlans: matchingPlans.map((mp) => ({
          id: mp._id.toString(),
          name: mp.name,
          durationDays: mp.durationDays,
          priceInRupees: Math.round(mp.priceInPaise / 100),
          originalPriceInRupees: mp.originalPriceInPaise ? Math.round(mp.originalPriceInPaise / 100) : undefined,
          badge: mp.badge,
          estimatedReach: mp.estimatedReach
        })),
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
    const {
      placementId,
      name,
      campaignTypes,
      aspectRatio,
      minimumWidth,
      minimumHeight,
      maximumFileSizeBytes,
      maximumActiveSlots,
      page,
      route,
      position,
      description,
      device
    } = req.body;

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
      active: true,
      page: page || "Homepage",
      route: route || "/",
      position: position || "Section Placement",
      description: description || "",
      device: device || "Web & Mobile App"
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
      page,
      route,
      position,
      device,
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
    if (page !== undefined) updateFields.page = page;
    if (route !== undefined) updateFields.route = route;
    if (position !== undefined) updateFields.position = position;
    if (device !== undefined) updateFields.device = device;
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
        permittedPlacements: ["SEARCH_TOP", "HOMEPAGE_HERO"],
        active: true
      });
    }

    const amountInPaise = product.priceInPaise;
    const taxInPaise = Math.round(amountInPaise * 0.18); // 18% GST
    const totalInPaise = amountInPaise + taxInPaise;

    const listingCity = listing.city || req.user.profile?.city || "Hyderabad";
    const listingPincode = listing.pincode || req.user.profile?.pincode;
    const listingArea = listing.area || req.user.profile?.area;

    const rawPincodes = Array.isArray(targeting?.pincodes) && targeting.pincodes.length > 0
      ? targeting.pincodes
      : (listingPincode ? [listingPincode] : []);
    const sanitizedPincodes = Array.from(new Set(rawPincodes.map((p: any) => String(p).replace(/\D/g, "").trim()).filter((p: string) => p.length >= 5)));

    const rawCategoryIds = Array.isArray(targeting?.categoryIds) && targeting.categoryIds.length > 0
      ? targeting.categoryIds
      : (listing.categoryId ? [listing.categoryId] : []);
    const sanitizedCategoryIds = Array.from(new Set(rawCategoryIds.map((c: any) => String(c).toLowerCase().trim()).filter(Boolean)));

    const campaignTargeting = {
      city: (targeting?.city || listingCity || "Hyderabad").trim(),
      pincodes: sanitizedPincodes,
      targetAreas: Array.isArray(targeting?.targetAreas) && targeting.targetAreas.length > 0
        ? targeting.targetAreas
        : (listingArea ? [listingArea] : []),
      categoryIds: sanitizedCategoryIds
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
      wallet = await Wallet.create({ userId: req.user._id, balanceInPaise: 0, refundBalanceInPaise: 0 });
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
      if (placement === "SEARCH_TOP" || placement === "CATEGORY_FEATURED") {
        query.placementIds = { $in: ["SEARCH_TOP", "CATEGORY_FEATURED", "CATEGORY_HEADER"] };
      } else {
        query.placementIds = placement;
      }
    }

    const activeCampaigns = await AdCampaign.find(query)
      .populate("listingId", "title priceInPaise images city area pincode categoryId condition storeId")
      .populate("storeId", "name cover logo area city pincode primaryCategory")
      .populate("advertiserUserId", "profile.city profile.area profile.pincode")
      .limit(50)
      .lean();

    // Client user category and location parameters
    const userCategory = (categoryId || "").toString().toLowerCase().trim();
    const userCity = (city || "").toString().toLowerCase().trim();
    const userArea = (area || "").toString().toLowerCase().trim();
    const userPin = (pincode || "").toString().trim();

    const isBangalore = (s: string) => s.includes("bangalore") || s.includes("bengaluru") || s.includes("benglure") || s.includes("blr") || s.includes("560034") || s.includes("560001");
    const isHyderabad = (s: string) => s.includes("hyderabad") || s.includes("secunderabad") || s.includes("hyd") || s.includes("cyberabad") || s.includes("500081") || s.includes("500032") || s.includes("500039") || s.includes("500072") || s.includes("500034");
    const isMumbai = (s: string) => s.includes("mumbai") || s.includes("bombay") || s.includes("thane") || s.includes("400050") || s.includes("400001");

    // 1. Strict Category Match: If userCategory is provided, ad MUST strictly belong to this category
    const categoryMatchedCampaigns = activeCampaigns.filter((c: any) => {
      if (userCategory) {
        const campaignCatIds = (c.targeting?.categoryIds || []).map((cat: any) => String(cat).toLowerCase().trim());
        const listingCat = (c.listingId?.categoryId || "").toString().toLowerCase().trim();
        const storeCat = (c.storeId?.primaryCategory || "").toString().toLowerCase().trim();

        const matchesTargeting = campaignCatIds.length > 0 && campaignCatIds.some((cat: string) => cat === userCategory || userCategory.includes(cat) || cat.includes(userCategory));
        const matchesListing = Boolean(listingCat && (listingCat === userCategory || userCategory.includes(listingCat) || listingCat.includes(userCategory)));
        const matchesStore = Boolean(storeCat && (storeCat === userCategory || userCategory.includes(storeCat) || storeCat.includes(userCategory)));

        // If category is provided, ad MUST match either targeting, listing, or store category
        if (!matchesTargeting && !matchesListing && !matchesStore) {
          return false;
        }
      }
      return true;
    });

    // 2. Score campaigns by hyperlocal relevance
    const scoredCampaigns = categoryMatchedCampaigns.map((c: any) => {
      let score = 1; // Base category match score

      const allAdCities = [
        c.targeting?.city,
        c.listingId?.city,
        c.storeId?.city,
        c.advertiserUserId?.profile?.city
      ].filter(Boolean).map((s: string) => s.toLowerCase().trim());

      const adPin = (c.targeting?.pincodes?.length ? c.targeting.pincodes : (c.listingId?.pincode ? [c.listingId.pincode] : [])).map(String).map((s: string) => s.trim());
      const adAreas = (c.targeting?.targetAreas?.length ? c.targeting.targetAreas : (c.listingId?.area ? [c.listingId.area] : [])).map((a: any) => String(a).toLowerCase().trim());

      const hasExactPinMatch = Boolean(userPin && adPin.length > 0 && adPin.includes(userPin));
      const hasAreaMatch = Boolean(userArea && adAreas.length > 0 && adAreas.some((a: string) => a.includes(userArea) || userArea.includes(a)));
      const isSameCity = Boolean(userCity && allAdCities.some((adC: string) => {
        if (isBangalore(userCity) && isBangalore(adC)) return true;
        if (isHyderabad(userCity) && isHyderabad(adC)) return true;
        if (isMumbai(userCity) && isMumbai(adC)) return true;
        return adC.includes(userCity) || userCity.includes(adC);
      }));
      const isSameMetro = Boolean(
        (userPin && adPin.some((p: string) => p.slice(0, 3) === userPin.slice(0, 3))) ||
        (userPin && isHyderabad(userPin) && adPin.some(isHyderabad)) ||
        (userCity && isHyderabad(userCity) && allAdCities.some(isHyderabad))
      );

      if (hasExactPinMatch) score += 100;
      if (hasAreaMatch) score += 50;
      if (isSameCity) score += 30;
      if (isSameMetro) score += 20;

      return { c, score, hasExactPinMatch, hasAreaMatch, isSameCity, isSameMetro };
    });

    // 3. Selection & Fallback
    let matchedCampaigns: any[] = [];
    if (!userCity && !userArea && !userPin) {
      matchedCampaigns = categoryMatchedCampaigns;
    } else {
      const geoMatched = scoredCampaigns.filter(item => item.score > 1);
      if (geoMatched.length > 0) {
        geoMatched.sort((a, b) => b.score - a.score);
        matchedCampaigns = geoMatched.map(item => item.c);
      } else {
        // Fallback: If no exact geo match, still serve the active category ad on its category page!
        matchedCampaigns = scoredCampaigns.map(item => item.c);
      }
    }

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
        targeting: c.targeting,
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

    // Immediately respond to unblock the client & event loop
    res.status(200).json({ success: true, tracked: true });

    const dateStr = new Date().toISOString().split("T")[0];

    // Asynchronously update analytics in background
    Promise.all([
      AdCampaign.findByIdAndUpdate(campaignId, { $inc: { impressionsCount: 1 } }).catch(() => {}),
      AdAnalytics.findOneAndUpdate(
        { campaignId, placementId: placementId || "GENERAL", date: dateStr },
        { $inc: { impressions: 1 } },
        { upsert: true }
      ).catch(() => {})
    ]).catch(() => {});
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

    // Immediately respond to unblock the client & event loop
    res.status(200).json({ success: true, tracked: true });

    const dateStr = new Date().toISOString().split("T")[0];

    // Asynchronously update analytics in background
    Promise.all([
      AdCampaign.findByIdAndUpdate(campaignId, { $inc: { clicksCount: 1 } }).catch(() => {}),
      AdAnalytics.findOneAndUpdate(
        { campaignId, placementId: placementId || "GENERAL", date: dateStr },
        { $inc: { clicks: 1 } },
        { upsert: true }
      ).catch(() => {})
    ]).catch(() => {});
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
