import { Listing } from "../../modules/listings/models/Listing";

export async function seedApprovedListings(): Promise<void> {
  try {
    const deleted = await Listing.deleteMany({});
    if (deleted.deletedCount > 0) {
      console.log(`[ListingSeeder] Purged ${deleted.deletedCount} products/listings from MongoDB.`);
    } else {
      console.log("[ListingSeeder] Verified 0 products in MongoDB. No mock products seeded.");
    }
  } catch (error) {
    console.error("[ListingSeeder] Error purging listings:", error);
  }
}
