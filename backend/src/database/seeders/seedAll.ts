import { connectDatabase, disconnectDatabase } from "../connect";
import { seedAdminUsers } from "./adminSeeder";
import { seedCategories } from "./categorySeeder";
import { seedAdConfiguration } from "./adSeeder";

export async function runAllSeeders(): Promise<void> {
  console.log("[Seeder Runner] Connecting to MongoDB...");
  await connectDatabase();

  console.log("\n--- Seeding Admins ---");
  await seedAdminUsers();

  console.log("\n--- Seeding Categories ---");
  await seedCategories();

  console.log("\n--- Seeding Ad Configurations & Pricing ---");
  await seedAdConfiguration();

  console.log("\n[Seeder Runner] All essential infrastructure seeders completed successfully.");
  await disconnectDatabase();
}

if (require.main === module) {
  runAllSeeders()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("[Seeder Runner] Fatal error during seeding:", err);
      process.exit(1);
    });
}
