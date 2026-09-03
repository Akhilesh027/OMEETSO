import { Listing } from "../../modules/listings/models/Listing";

export async function seedApprovedListings(): Promise<void> {
  try {
    const count = await Listing.countDocuments();
    console.log(`[ListingSeeder] Verified ${count} listings in MongoDB.`);
  } catch (error) {
    console.error("[ListingSeeder] Error checking listings:", error);
  }
}

