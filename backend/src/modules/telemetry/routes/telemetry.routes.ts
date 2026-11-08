import { Router } from "express";
import {
  recordActivityEvent,
  getLiveStats,
  getActivityFeed,
  getVisitorJourney,
  exportTelemetryReport
} from "../controllers/telemetry.controller";
import { authenticateAdmin } from "../../../middleware/authenticateAdmin";

export const telemetryRouter = Router();

// Public telemetry beacon endpoint (called by frontend web & mobile app)
telemetryRouter.post("/event", recordActivityEvent);

// Admin-only endpoints for live activity monitoring and lead analytics
telemetryRouter.get("/live-stats", authenticateAdmin, getLiveStats);
telemetryRouter.get("/feed", authenticateAdmin, getActivityFeed);
telemetryRouter.get("/export-report", authenticateAdmin, exportTelemetryReport);
telemetryRouter.get("/visitor/:visitorId", authenticateAdmin, getVisitorJourney);

