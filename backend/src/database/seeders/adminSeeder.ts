import bcrypt from "bcryptjs";
import { AdminUser } from "../../modules/admin/models/AdminUser";
import { env } from "../../config/env";

export async function seedAdminUsers(): Promise<void> {
  try {
    const adminEmail = (env.INITIAL_ADMIN_EMAIL || "admin@digitalness.co.in").trim().toLowerCase();
    const adminPassword = env.INITIAL_ADMIN_PASSWORD;
    const adminName = env.INITIAL_ADMIN_NAME || "Super Admin";

    console.log(`[Seeder] Checking initial admin account (${adminEmail}) in MongoDB...`);

    const existing = await AdminUser.findOne({ email: adminEmail });

    if (!existing) {
      if (!adminPassword) {
        console.warn(
          `[Seeder] Initial admin (${adminEmail}) does not exist, and INITIAL_ADMIN_PASSWORD is not set in .env. Skipping admin seed.`
        );
        return;
      }

      const passwordHash = await bcrypt.hash(adminPassword, 10);
      await AdminUser.create({
        name: adminName,
        email: adminEmail,
        passwordHash,
        role: "Super Admin",
        roles: ["Super Admin"],
        permissions: ["*"],
        status: "active",
        twoFAEnabled: false
      });
      console.log(`[Seeder] Seeded initial admin account: ${adminEmail}`);
    } else {
      // If admin exists and a new password was explicitly passed in env, update it safely
      if (adminPassword) {
        const passwordHash = await bcrypt.hash(adminPassword, 10);
        await AdminUser.updateOne(
          { email: adminEmail },
          {
            $set: {
              name: adminName,
              passwordHash,
              role: "Super Admin",
              roles: ["Super Admin"],
              permissions: ["*"],
              status: "active"
            }
          }
        );
        console.log(`[Seeder] Verified & synced active super admin: ${adminEmail}`);
      } else {
        console.log(`[Seeder] Verified active super admin exists: ${adminEmail}`);
      }
    }
  } catch (error) {
    console.error("[Seeder] Failed to seed admin users:", error);
  }
}
