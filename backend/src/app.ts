import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import mongoose from "mongoose";
import { env } from "./config/env";
import { userAuthRouter } from "./modules/auth/routes/userAuth.routes";
import { adminAuthRouter } from "./modules/auth/routes/adminAuth.routes";
import { categoriesRouter } from "./modules/categories/routes/categories.routes";
import { uploadsRouter } from "./modules/uploads/routes/uploads.routes";
import { usersRouter } from "./modules/users/routes/users.routes";
import { listingsRouter } from "./modules/listings/routes/listings.routes";
import { adminListingsRouter } from "./modules/admin/routes/adminListings.routes";
import { storesRouter } from "./modules/stores/routes/stores.routes";
import { adminStoresRouter } from "./modules/admin/routes/adminStores.routes";
import { chatRouter } from "./modules/chat/routes/chat.routes";
import { notificationsRouter } from "./modules/notifications/routes/notifications.routes";
import { safetyRouter } from "./modules/safety/routes/safety.routes";
import { supportRouter } from "./modules/support/routes/support.routes";
import { verificationRouter } from "./modules/verification/routes/verification.routes";
import { revenueRouter } from "./modules/revenue/routes/revenue.routes";
import { adminDashboardRouter } from "./modules/admin/routes/adminDashboard.routes";
import { adminChatsRouter } from "./modules/admin/routes/adminChats.routes";
import { reviewsRouter, adminReviewsRouter } from "./modules/reviews/routes/reviews.routes";
import { jobsRouter } from "./modules/jobs/routes/jobs.routes";
import { adminJobsRouter } from "./modules/jobs/routes/adminJobs.routes";
import { servicesRouter } from "./modules/services/routes/services.routes";
import { adminServicesRouter } from "./modules/services/routes/adminServices.routes";
import { bannersRouter } from "./modules/revenue/routes/banners.routes";
import { ogRouter } from "./modules/og/routes/og.routes";
import { getProductOpenGraphPreview, getStoreOpenGraphPreview } from "./modules/og/controllers/og.controller";

export const app: Express = express();

// Security & Core Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }
  })
);
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

if (env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

const parseOrigins = (urlEnv?: string): string[] => {
  if (!urlEnv) return [];
  return urlEnv
    .split(",")
    .map((s) => s.trim().replace(/\/$/, ""))
    .filter(Boolean);
};

const allowedOrigins = new Set([
  ...parseOrigins(env.CLIENT_USER_URL),
  ...parseOrigins(env.CLIENT_ADMIN_URL),
  ...parseOrigins(env.ALLOWED_ORIGINS),
  "https://omeetso.in",
  "https://www.omeetso.in",
  "https://adminomeetso.omeetso.in",
  "https://admin.omeetso.in",
  "https://api.omeetso.in",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "https://api.omeetso.in",
  "http://localhost:8080",
  "http://localhost",
  "https://localhost",
  "capacitor://localhost",
  "ionic://localhost"
]);

const isAllowedOrigin = (origin?: string): boolean => {
  // Allow requests with no origin (e.g. mobile apps, curl, server-to-server, Postman)
  if (!origin) return true;

  const cleanOrigin = origin.trim().replace(/\/$/, "");

  // In development mode, allow all origins
  if (env.NODE_ENV === "development") {
    return true;
  }

  // Check explicit allowlist
  if (allowedOrigins.has(cleanOrigin)) {
    return true;
  }

  // Match localhost / 127.0.0.1 on any port
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(cleanOrigin)) {
    return true;
  }

  // Match local LAN IPs (e.g. 192.168.x.x, 10.x.x.x, 172.16-31.x.x) for mobile debugging
  if (/^https?:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?$/.test(cleanOrigin)) {
    return true;
  }

  // Match Capacitor / Ionic mobile webview schemes
  if (
    cleanOrigin.startsWith("capacitor://") ||
    cleanOrigin.startsWith("ionic://") ||
    cleanOrigin.startsWith("http://localhost") ||
    cleanOrigin.startsWith("https://localhost")
  ) {
    return true;
  }

  // Match any omeetso.in or omeetso.com subdomain
  if (/^https?:\/\/([a-zA-Z0-9-]+\.)*omeetso\.(in|com)(:\d+)?$/.test(cleanOrigin)) {
    return true;
  }

  // Match preview hosting domains (e.g. Vercel, Render, Netlify)
  if (
    cleanOrigin.endsWith(".vercel.app") ||
    cleanOrigin.endsWith(".onrender.com") ||
    cleanOrigin.endsWith(".netlify.app")
  ) {
    return true;
  }

  return false;
};

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }
    console.warn(`[CORS] Request blocked from origin: ${origin}`);
    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
    "X-CSRF-Token",
    "Access-Control-Request-Headers",
    "Access-Control-Request-Method"
  ],
  exposedHeaders: ["Set-Cookie", "Authorization"],
  maxAge: 86400
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));


// Health Check Endpoints
app.get("/health", (req: Request, res: Response) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  res.status(isDbConnected ? 200 : 503).json({
    status: isDbConnected ? "ok" : "degraded",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: {
      connected: isDbConnected,
      host: mongoose.connection.host
    }
  });
});

app.get("/api/v1/seed-banners-ads", async (req: Request, res: Response) => {
  try {
    const { seedBannersAndAds } = await import("./database/seeders/bannerAdSeeder");
    const result = await seedBannersAndAds();
    res.json({
      success: true,
      message: "Banners and Ads seeded successfully!",
      data: result
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/v1/seed-admins", async (req: Request, res: Response) => {
  try {
    const { seedAdminUsers } = await import("./database/seeders/adminSeeder");
    await seedAdminUsers();
    res.json({
      success: true,
      message: "Admin accounts seeded successfully into MongoDB!"
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/v1/seed-market", async (req: Request, res: Response) => {
  try {
    const { seedMultiLocationMarket } = await import("./database/seeders/multiLocationMarketSeeder");
    const result = await seedMultiLocationMarket();
    res.json({
      success: true,
      message: "Multi-location listings, stores & sellers seeded successfully!",
      data: result
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/v1/seed-banners-clean", async (req: Request, res: Response) => {
  try {
    const { seedBannersAndAds } = await import("./database/seeders/bannerAdSeeder");
    const result = await seedBannersAndAds();
    res.json({
      success: true,
      message: "Clean single fallback banners & ad placements initialized successfully!",
      data: result
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/v1/wipe-marketplace-data", async (req: Request, res: Response) => {
  try {
    const { Listing } = await import("./modules/listings/models/Listing");
    const { ListingRevision } = await import("./modules/listings/models/ListingRevision");
    const { ListingModeration } = await import("./modules/listings/models/ListingModeration");
    const { User } = await import("./modules/users/models/User");
    const { UserSession } = await import("./modules/auth/models/UserSession");
    const { Store } = await import("./modules/stores/models/Store");
    const { StoreMember } = await import("./modules/stores/models/StoreMember");
    const { AdCampaign } = await import("./modules/revenue/models/AdCampaign");
    const { WalletHold } = await import("./modules/revenue/models/WalletHold");
    const { WalletTransaction } = await import("./modules/revenue/models/WalletTransaction");
    const { Wallet } = await import("./modules/revenue/models/Wallet");

    const [
      listingsRes,
      revisionsRes,
      listingModRes,
      usersRes,
      sessionsRes,
      storesRes,
      storeMembersRes,
      campaignsRes,
      holdsRes,
      txRes,
      walletRes
    ] = await Promise.all([
      Listing.deleteMany({}),
      ListingRevision.deleteMany({}),
      ListingModeration.deleteMany({}),
      User.deleteMany({}),
      UserSession.deleteMany({}),
      Store.deleteMany({}),
      StoreMember.deleteMany({}),
      AdCampaign.deleteMany({}),
      WalletHold.deleteMany({}),
      WalletTransaction.deleteMany({}),
      Wallet.deleteMany({})
    ]);

    res.json({
      success: true,
      message: "Successfully removed all listings, users, stores, and live ad campaigns from MongoDB!",
      deleted: {
        listings: listingsRes.deletedCount,
        listingRevisions: revisionsRes.deletedCount,
        listingModeration: listingModRes.deletedCount,
        users: usersRes.deletedCount,
        userSessions: sessionsRes.deletedCount,
        stores: storesRes.deletedCount,
        storeMembers: storeMembersRes.deletedCount,
        adCampaigns: campaignsRes.deletedCount,
        walletHolds: holdsRes.deletedCount,
        walletTransactions: txRes.deletedCount,
        wallets: walletRes.deletedCount
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/v1/clear-ad-campaigns", async (req: Request, res: Response) => {
  try {
    const { AdCampaign } = await import("./modules/revenue/models/AdCampaign");
    const deleteResult = await AdCampaign.deleteMany({});
    res.json({
      success: true,
      message: `Successfully removed ${deleteResult.deletedCount} seeded ad campaigns. Placements and ad products are preserved and ready for live campaigns!`,
      deletedCount: deleteResult.deletedCount
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/v1/inspect-campaigns", async (req: Request, res: Response) => {
  try {
    const { AdCampaign } = await import("./modules/revenue/models/AdCampaign");
    const campaigns = await AdCampaign.find({}).populate("listingId", "title priceInPaise categoryId").populate("advertiserUserId", "phone email profile.name profile.city");
    const formatted = campaigns.map((c: any) => ({
      id: c._id.toString(),
      status: c.status,
      paymentStatus: c.paymentStatus,
      campaignType: c.campaignType,
      placementIds: c.placementIds,
      startAt: c.startAt,
      endAt: c.endAt,
      pricing: c.pricing,
      bannerUrl: c.bannerUrl ? (c.bannerUrl.startsWith("data:") ? "[BASE64_IMAGE]" : c.bannerUrl) : null,
      listingTitle: c.listingId?.title,
      advertiserName: c.advertiserUserId?.profile?.name,
      advertiserPhone: c.advertiserUserId?.phone
    }));
    res.json({
      success: true,
      count: formatted.length,
      data: formatted
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/v1/inspect-listing/:id", async (req: Request, res: Response) => {
  try {
    const rawId = req.params.id;
    const searchId = Array.isArray(rawId) ? String(rawId[0]) : String(rawId);
    const db = mongoose.connection.db;
    if (!db) return res.status(500).json({ error: "No DB connection" });

    let objId: any = null;
    if (mongoose.Types.ObjectId.isValid(searchId)) {
      try {
        objId = new mongoose.Types.ObjectId(searchId);
      } catch (e) { }
    }

    const listing = await db.collection("listings").findOne({
      $or: [{ _id: searchId as any }, ...(objId ? [{ _id: objId }] : [])]
    });

    if (!listing) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }

    let sellerObjId: any = null;
    if (listing.sellerId && mongoose.Types.ObjectId.isValid(String(listing.sellerId))) {
      try {
        sellerObjId = new mongoose.Types.ObjectId(String(listing.sellerId));
      } catch (e) { }
    }

    const seller = await db.collection("users").findOne({
      $or: [{ _id: listing.sellerId }, ...(sellerObjId ? [{ _id: sellerObjId }] : [])]
    });

    const { images, ...rest } = listing;

    res.json({
      success: true,
      listing: rest,
      seller: seller ? {
        id: seller._id,
        phone: seller.phone,
        email: seller.email,
        profile: seller.profile,
        location: seller.location
      } : null
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get(`${env.API_PREFIX}/health`, (req: Request, res: Response) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  res.status(isDbConnected ? 200 : 503).json({
    success: isDbConnected,
    data: {
      status: isDbConnected ? "ok" : "degraded",
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    }
  });
});

// API Routes
app.use(`${env.API_PREFIX}/auth`, userAuthRouter);
app.use(`${env.API_PREFIX}/admin/auth`, adminAuthRouter);
app.use(`${env.API_PREFIX}/categories`, categoriesRouter);
app.use(`${env.API_PREFIX}/uploads`, uploadsRouter);
app.use(`${env.API_PREFIX}/users`, usersRouter);
app.use(`${env.API_PREFIX}/listings`, listingsRouter);
app.use(`${env.API_PREFIX}/admin/listings`, adminListingsRouter);
app.use(`${env.API_PREFIX}/jobs`, jobsRouter);
app.use(`${env.API_PREFIX}/admin/jobs`, adminJobsRouter);
app.use(`${env.API_PREFIX}/services`, servicesRouter);
app.use(`${env.API_PREFIX}/admin/services`, adminServicesRouter);
app.use(`${env.API_PREFIX}/stores`, storesRouter);
app.use(`${env.API_PREFIX}/admin/stores`, adminStoresRouter);
app.use(`${env.API_PREFIX}/chat`, chatRouter);
app.use(`${env.API_PREFIX}/notifications`, notificationsRouter);
app.use(`${env.API_PREFIX}/safety`, safetyRouter);
app.use(`${env.API_PREFIX}/support`, supportRouter);
app.use(`${env.API_PREFIX}/verification`, verificationRouter);
app.use(`${env.API_PREFIX}/revenue`, revenueRouter);
app.use(env.API_PREFIX, revenueRouter);
app.use(`${env.API_PREFIX}/banners`, bannersRouter);
app.use(`${env.API_PREFIX}/admin/dashboard`, adminDashboardRouter);
app.use(`${env.API_PREFIX}/admin/chats`, adminChatsRouter);
app.use(`${env.API_PREFIX}/reviews`, reviewsRouter);
app.use(`${env.API_PREFIX}/admin/reviews`, adminReviewsRouter);
app.use(`${env.API_PREFIX}/og`, ogRouter);

// Direct crawler & link preview friendly routes
app.get("/product/:id", getProductOpenGraphPreview);
app.get("/p/:id", getProductOpenGraphPreview);
app.get("/store/:id", getStoreOpenGraphPreview);

// Centralized 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: `Route ${req.method} ${req.path} not found`
    }
  });
});

// Centralized Error Handler
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error(`[UnhandledError] ${req.method} ${req.path}:`, err);
  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: env.NODE_ENV === "production" ? "An unexpected error occurred" : err.message
    }
  });
});
