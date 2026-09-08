import mongoose from "mongoose";
import { env } from "../config/env";

import dns from "dns";

// Prevent Windows IPv6 TCP timeout hangs with MongoDB Atlas replica sets
try {
  dns.setDefaultResultOrder("ipv4first");
} catch {
  // Ignore in older Node versions
}

export async function connectDatabase(): Promise<typeof mongoose> {
  try {
    mongoose.set("strictQuery", true);
    mongoose.set("autoIndex", false); // Prevent createIndexes background writes on every restart
    const conn = await mongoose.connect(env.MONGODB_URI, {
      family: 4, // Force IPv4 to prevent 120s IPv6 socket timeouts on Windows
      readPreference: "primary", // Force reads to primary shard to prevent timing out on unreachable secondary shards
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      maxPoolSize: 15,
      minPoolSize: 2
    });
    console.log(`[MongoDB] Successfully connected to database: ${conn.connection.host}/${conn.connection.name}`);
    
    // Sync schema indexes asynchronously in the background so queries use compound B-Tree indexes
    mongoose.syncIndexes().then(() => {
      console.log("[MongoDB] Schema indexes successfully verified and synchronized");
    }).catch((err) => {
      console.warn("[MongoDB] Background index sync notice:", err?.message || err);
    });

    return conn;
  } catch (error) {
    console.error("[MongoDB] Connection failure:", error);
    process.exit(1);
  }
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  console.log("[MongoDB] Disconnected");
}
