import mongoose from "mongoose";
import { connectDatabase, disconnectDatabase } from "../connect";

/**
 * Drops all collections across the MongoDB database, leaving the database 100% empty.
 * Zero data, zero seeds.
 */
export async function purgeEntireDatabase(): Promise<{ droppedCollections: string[]; count: number }> {
  console.log("[MongoDB Reset] Connecting to MongoDB...");
  if (mongoose.connection.readyState !== 1) {
    await connectDatabase();
  }

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("[MongoDB Reset] Database connection unavailable");
  }

  console.log("[MongoDB Reset] Inspecting all collections in MongoDB...");
  const collections = await db.listCollections().toArray();
  const droppedCollections: string[] = [];

  for (const col of collections) {
    console.log(`[MongoDB Reset] Dropping collection: "${col.name}"...`);
    try {
      await db.collection(col.name).drop();
      droppedCollections.push(col.name);
    } catch (err: any) {
      if (err.codeName !== "NamespaceNotFound") {
        console.warn(`[MongoDB Reset] Warning while dropping ${col.name}:`, err.message);
      }
    }
  }

  console.log(`[MongoDB Reset] Complete. Dropped ${droppedCollections.length} collections. Database is now 100% empty.`);
  return {
    droppedCollections,
    count: droppedCollections.length
  };
}

// Run directly if invoked from command line
if (require.main === module) {
  purgeEntireDatabase()
    .then(async (res) => {
      console.log(`[MongoDB Reset] Finished successfully. Total collections purged: ${res.count}`);
      await disconnectDatabase();
      process.exit(0);
    })
    .catch((err) => {
      console.error("[MongoDB Reset] Fatal error during database reset:", err);
      process.exit(1);
    });
}
