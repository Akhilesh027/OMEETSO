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
  "http://localhost:3000",
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

app.get("/api/v1/seed-listings", async (req: Request, res: Response) => {
  try {
    const { seedApprovedListings } = await import("./database/seeders/listingSeeder");
    await seedApprovedListings();
    res.json({ success: true, message: "Approved DB listings seeded successfully" });
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
