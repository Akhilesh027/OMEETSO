import { MediaAsset } from "../modules/uploads/models/MediaAsset";
import { Listing } from "../modules/listings/models/Listing";
import { ListingStatus } from "../contracts";

export function startBackgroundWorkers(): void {
  console.log("[Worker] Background cleanup worker initialized (Interval: 1 hour)");

  // Delay initial cleanup by 45 seconds so server startup and initial requests are unhindered
  setTimeout(runBackgroundTasks, 45 * 1000);
  setInterval(runBackgroundTasks, 60 * 60 * 1000);
}

async function runBackgroundTasks(): Promise<void> {
  try {
    // 1. Cleanup unattached media assets older than 24 hours
    const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const mediaResult = await MediaAsset.updateMany(
      { status: "unattached", createdAt: { $lt: cutoffDate } },
      { $set: { status: "deleted" } }
    );
    if (mediaResult.modifiedCount > 0) {
      console.log(`[Worker] Cleaned up ${mediaResult.modifiedCount} unattached media assets.`);
    }

    // 2. Automatically mark expired listings
    const listingResult = await Listing.updateMany(
      { status: { $in: [ListingStatus.APPROVED, ListingStatus.ACTIVE] }, expiresAt: { $lt: new Date() } },
      { $set: { status: ListingStatus.EXPIRED } }
    );
    if (listingResult.modifiedCount > 0) {
      console.log(`[Worker] Expired ${listingResult.modifiedCount} listings.`);
    }
  } catch (error) {
    console.error("[Worker] Background task error:", error);
  }
}
