import dns from "dns";
try { dns.setDefaultResultOrder("ipv4first"); } catch {}

import http from "http";
import { app } from "./app";
import { env } from "./config/env";
import { connectDatabase, disconnectDatabase } from "./database/connect";
import { initSocketServer } from "./sockets/socket-server";
import { startBackgroundWorkers } from "./jobs/cleanupWorker";
import { seedAdminUsers } from "./database/seeders/adminSeeder";
import { seedCategories } from "./database/seeders/categorySeeder";
import { seedBannersAndAds } from "./database/seeders/bannerAdSeeder";
import { seedBlogs } from "./database/seeders/blogSeeder";
import { User } from "./modules/users/models/User";
import { verifySmtpConnection } from "./modules/auth/services/email.service";

// Server initialization timestamp: 2026-10-13T13:22:30
const server = http.createServer(app);

// Initialize Socket.IO engine
export const io = initSocketServer(server);

async function startServer() {
  await connectDatabase();
  try { await User.deleteMany({ phone: "9900000000" }); } catch {}
  try { await seedAdminUsers(); } catch (e) { console.error("[Seed] Admin users failed:", e); }
  try { await seedCategories(); } catch (e) { console.error("[Seed] Categories failed:", e); }
  try { await seedBannersAndAds(); } catch (e) { console.error("[Seed] Banners and ads failed:", e); }
  try { await seedBlogs(); } catch (e) { console.error("[Seed] Blogs failed:", e); }
  try {
    const { Listing } = await import("./modules/listings/models/Listing");
    const count = await Listing.countDocuments();
    if (count === 0) {
      const { seedMultiLocationMarket } = await import("./database/seeders/multiLocationMarketSeeder");
      await seedMultiLocationMarket();
      console.log("[Seed] Multi-location market listings seeded successfully");
    }
  } catch (e) {
    console.error("[Seed] Market listings seed failed:", e);
  }

  startBackgroundWorkers();

  server.listen(env.PORT, () => {
    console.log(`[Server] Omeetso Modular Monolith Backend listening on port ${env.PORT} (${env.NODE_ENV})`);
    console.log(`[Server] Health check available at: http://localhost:${env.PORT}/health`);
    console.log(`[Socket.IO] Real-Time Gateway initialized`);
    console.log(`[OG] Dynamic OpenGraph Social Previews mounted`);

    // Asynchronously verify SMTP Email configuration & connection
    verifySmtpConnection().catch((err) => {
      console.warn("[Email/SMTP] Verification error:", err?.message || err);
    });
  });
}

// Graceful Shutdown
async function shutdown(signal: string) {
  console.log(`[Server] Received ${signal}. Starting graceful shutdown...`);
  server.close(async () => {
    console.log("[Server] HTTP server closed");
    await disconnectDatabase();
    process.exit(0);
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

startServer().catch((err) => {
  console.error("[Server] Fatal error during startup:", err);
  process.exit(1);
});

