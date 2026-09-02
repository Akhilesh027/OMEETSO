import bcrypt from "bcryptjs";
import { AdminUser } from "../../modules/admin/models/AdminUser";

const INITIAL_ADMINS = [
  {
    name: "Digitalness Admin",
    email: "admin@digitalness.co.in",
    role: "Super Admin",
    passwordRaw: "DLNS@2021",
    permissions: ["*"]
  }
];

export async function seedAdminUsers(): Promise<void> {
  try {
    console.log("[Seeder] Verifying initial admin accounts in MongoDB...");

    // Remove all other admin logins from MongoDB so ONLY admin@digitalness.co.in is present
    const deleteResult = await AdminUser.deleteMany({
      email: { $ne: "admin@digitalness.co.in" }
    });
    if (deleteResult.deletedCount > 0) {
      console.log(`[Seeder] Purged ${deleteResult.deletedCount} unapproved admin accounts from MongoDB.`);
    }

    for (const item of INITIAL_ADMINS) {
      const email = item.email.toLowerCase();
      const passwordHash = await bcrypt.hash(item.passwordRaw, 10);
      
      const existing = await AdminUser.findOne({ email });
      if (!existing) {
        await AdminUser.create({
          name: item.name,
          email,
          passwordHash,
          role: item.role,
          permissions: item.permissions,
          status: "active",
          twoFAEnabled: false
        });
        console.log(`[Seeder] Seeded sole admin account: ${email}`);
      } else {
        await AdminUser.updateOne(
          { email },
          {
            $set: {
              name: item.name,
              passwordHash,
              role: item.role,
              permissions: item.permissions,
              status: "active"
            }
          }
        );
        console.log(`[Seeder] Verified active super admin: ${email}`);
      }
    }
  } catch (error) {
    console.error("[Seeder] Failed to seed admin users:", error);
  }
}
