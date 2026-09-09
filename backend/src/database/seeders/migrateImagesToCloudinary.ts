import mongoose from "mongoose";
import cloudinary from "cloudinary";
import { env } from "../../config/env";
import dns from "dns";

try { dns.setDefaultResultOrder("ipv4first"); } catch {}

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME || env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY || env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET || env.CLOUDINARY_API_SECRET
});

async function migrateImages() {
  console.log("[Migration] Connecting to MongoDB...");
  await mongoose.connect(env.MONGODB_URI, {
    family: 4,
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 120000
  });
  console.log("[Migration] Connected to MongoDB.");

  const db = mongoose.connection.db;
  if (!db) {
    console.error("[Migration] No database connection");
    process.exit(1);
  }
  const collection = db.collection("listings");

  // Find listings that have base64 images (data: prefix)
  const cursor = collection.find(
    { "images.0": { $regex: "^data:" } },
    { projection: { _id: 1, images: 1, title: 1 } }
  ).batchSize(5);

  let migrated = 0;
  let failed = 0;
  let skipped = 0;

  console.log("[Migration] Scanning listings with base64 images...");

  for await (const listing of cursor) {
    const listingId = listing._id.toString();
    const title = listing.title || "Unknown";
    const images: string[] = listing.images || [];

    if (images.length === 0) {
      skipped++;
      continue;
    }

    const hasBase64 = images.some((img: string) => typeof img === "string" && img.startsWith("data:"));
    if (!hasBase64) {
      skipped++;
      continue;
    }

    console.log(`[Migration] Processing listing "${title}" (${listingId}) — ${images.length} images`);

    const newImages: string[] = [];
    let allSuccess = true;

    for (let i = 0; i < images.length; i++) {
      const img = images[i];

      // Skip if already a URL
      if (typeof img === "string" && (img.startsWith("http://") || img.startsWith("https://"))) {
        newImages.push(img);
        continue;
      }

      // Upload base64 to Cloudinary
      if (typeof img === "string" && img.startsWith("data:")) {
        try {
          const result = await cloudinary.v2.uploader.upload(img, {
            folder: "omeetso/listings",
            resource_type: "auto",
            timeout: 30000
          });
          newImages.push(result.secure_url);
          console.log(`  ✓ Image ${i + 1}/${images.length} uploaded → ${result.secure_url.slice(0, 80)}...`);
        } catch (err: any) {
          console.error(`  ✗ Image ${i + 1}/${images.length} FAILED:`, err?.message);
          newImages.push(img); // Keep original on failure
          allSuccess = false;
        }
      } else {
        newImages.push(img);
      }
    }

    // Update listing with new Cloudinary URLs
    try {
      await collection.updateOne(
        { _id: listing._id },
        { $set: { images: newImages } }
      );
      migrated++;
      console.log(`  ✓ Listing "${title}" updated (${allSuccess ? "all images migrated" : "partial migration"})`);
    } catch (err: any) {
      console.error(`  ✗ Failed to update listing "${title}":`, err?.message);
      failed++;
    }
  }

  console.log(`\n[Migration] Complete!`);
  console.log(`  Migrated: ${migrated}`);
  console.log(`  Failed: ${failed}`);
  console.log(`  Skipped (already URLs): ${skipped}`);

  await mongoose.disconnect();
  process.exit(0);
}

migrateImages().catch((err) => {
  console.error("[Migration] Fatal error:", err);
  process.exit(1);
});
