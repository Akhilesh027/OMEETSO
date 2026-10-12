import { MediaAsset } from "../modules/uploads/models/MediaAsset";
import { Listing } from "../modules/listings/models/Listing";
import { ListingStatus } from "../contracts";
import { Blog } from "../modules/blogs/models/Blog";

export function startBackgroundWorkers(): void {
  console.log("[Worker] Background cleanup worker initialized (Interval: 1 hour, Blog Scheduler: 1 minute)");

  // Delay initial cleanup by 45 seconds so server startup and initial requests are unhindered
  setTimeout(runBackgroundTasks, 45 * 1000);
  setInterval(runBackgroundTasks, 60 * 60 * 1000);

  // Fast interval for scheduled blog releases (every 60 seconds)
  setTimeout(checkAndPublishScheduledBlogs, 5 * 1000);
  setInterval(checkAndPublishScheduledBlogs, 60 * 1000);
}

export async function checkAndPublishScheduledBlogs(): Promise<void> {
  try {
    const now = new Date();
    const result = await Blog.updateMany(
      { status: "SCHEDULED", scheduledAt: { $lte: now } },
      { $set: { status: "PUBLISHED", publishedAt: now } }
    );
    if (result.modifiedCount > 0) {
      console.log(`[Worker] Auto-published ${result.modifiedCount} scheduled blog(s) that reached release time.`);
    }
  } catch (error) {
    console.error("[Worker] Scheduled blog release worker error:", error);
  }
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

    // 3. Ensure scheduled blogs are published
    await checkAndPublishScheduledBlogs();
  } catch (error) {
    console.error("[Worker] Background task error:", error);
  }
}
