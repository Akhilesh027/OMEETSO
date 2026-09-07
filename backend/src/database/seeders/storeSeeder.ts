import { Store } from "../../modules/stores/models/Store";

export async function seedStores(): Promise<void> {
  try {
    const count = await Store.countDocuments();
    console.log(`[StoreSeeder] Verified ${count} stores in MongoDB (auto-seeding disabled).`);
  } catch (error) {
    console.error("[StoreSeeder] Error checking stores:", error);
  }
}

