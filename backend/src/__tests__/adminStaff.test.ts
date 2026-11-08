import { TestClient } from "./testHelper";
import { generateAdminAccessToken, generateUserAccessToken } from "../modules/auth/utils/token";
import { computePermissionsForRoles, ROLE_PERMISSIONS_MAP } from "../modules/admin/constants/rolePermissions";

describe("Admin Staff & Multi-Role Governance Test Suite", () => {
  const client = new TestClient();
  const mockSuperAdminId = "65c2f829f0e1d23456789111";
  const mockUserId = "65c2f829f0e1d23456789abc";
  const mockSessionId = "65c2f829f0e1d23456789def";

  let superAdminToken: string;
  let userToken: string;

  beforeAll(async () => {
    superAdminToken = generateAdminAccessToken(mockSuperAdminId, "Super Admin", mockSessionId);
    userToken = generateUserAccessToken(mockUserId, mockSessionId);
    await client.start();
  });

  afterAll(async () => {
    await client.stop();
  });

  describe("Multi-Role Permission Union Calculation", () => {
    it("should compute wildcard [*] if Super Admin is in roles list", () => {
      const perms = computePermissionsForRoles(["Listing Moderator", "Super Admin"]);
      expect(perms).toEqual(["*"]);
    });

    it("should compute exact unique union when assigning multiple non-super roles", () => {
      const listingPerms = ROLE_PERMISSIONS_MAP["Listing Moderator"];
      const storePerms = ROLE_PERMISSIONS_MAP["Store Moderator"];

      const combinedPerms = computePermissionsForRoles(["Listing Moderator", "Store Moderator"]);

      // Verify that every listing permission is present
      for (const p of listingPerms) {
        expect(combinedPerms).toContain(p);
      }
      // Verify that every store permission is present
      for (const p of storePerms) {
        expect(combinedPerms).toContain(p);
      }

      // Verify duplicates are pruned (set size matches length)
      expect(new Set(combinedPerms).size).toBe(combinedPerms.length);

      // Verify a permission that neither has (e.g. "wallet.adjust") is NOT present
      expect(combinedPerms).not.toContain("wallet.adjust");
    });
  });

  describe("API Endpoint Security & Protection", () => {
    it("should reject unauthenticated requests to staff list", async () => {
      const res = await client.get("/api/v1/admin/staff");
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should reject standard user tokens from accessing admin staff routes", async () => {
      const res = await client.get("/api/v1/admin/staff", {
        headers: {
          Authorization: `Bearer ${userToken}`
        }
      });
      expect([401, 403]).toContain(res.status);
      expect(res.body.success).toBe(false);
    });

    it("should reject staff creation with missing fields or short password", async () => {
      const res = await client.post(
        "/api/v1/admin/staff",
        {
          name: "Test Operator",
          email: "invalid-email",
          password: "123" // too short
        },
        {
          headers: {
            Authorization: `Bearer ${superAdminToken}`
          }
        }
      );
      expect([400, 422]).toContain(res.status);
      expect(res.body.success).toBe(false);
    });
  });
});

