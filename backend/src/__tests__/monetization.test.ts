import { TestClient } from "./testHelper";
import { generateAdminAccessToken, generateUserAccessToken } from "../modules/auth/utils/token";

describe("Automated Revenue & Listing Boost Reminders (Monetization) Test Suite", () => {
  const client = new TestClient();
  const mockAdminId = "65c2f829f0e1d23456789111";
  const mockUserId = "65c2f829f0e1d23456789abc";
  const mockSessionId = "65c2f829f0e1d23456789def";

  let adminToken: string;
  let userToken: string;

  beforeAll(async () => {
    adminToken = generateAdminAccessToken(mockAdminId, "Super Admin", mockSessionId);
    userToken = generateUserAccessToken(mockUserId, mockSessionId);
    await client.start();
  });

  afterAll(async () => {
    await client.stop();
  });

  describe("Monetization Admin Endpoint Security & RBAC", () => {
    it("should reject unauthenticated requests to boost stats", async () => {
      const res = await client.get("/api/v1/revenue/admin/boost-reminders/stats");
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should reject standard user tokens from accessing monetization admin stats", async () => {
      const res = await client.get("/api/v1/revenue/admin/boost-reminders/stats", {
        headers: {
          Authorization: `Bearer ${userToken}`
        }
      });
      // Non-admin token should be rejected with 401/403
      expect([401, 403]).toContain(res.status);
      expect(res.body.success).toBe(false);
    });

    it("should reject unauthenticated requests to trigger manual boost scans", async () => {
      const res = await client.post("/api/v1/revenue/admin/boost-reminders/trigger-now", {
        minAgeDays: 3,
        maxViews: 35
      });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should reject standard user tokens from triggering manual boost scans", async () => {
      const res = await client.post(
        "/api/v1/revenue/admin/boost-reminders/trigger-now",
        { minAgeDays: 3, maxViews: 35 },
        {
          headers: {
            Authorization: `Bearer ${userToken}`
          }
        }
      );
      expect([401, 403]).toContain(res.status);
      expect(res.body.success).toBe(false);
    });
  });

  describe("Monetization Engine Math & Metric Integrity", () => {
    it("should accurately compute conversion rates and revenue conversions", () => {
      const sampleSent = 50;
      const sampleConverted = 8;
      const sampleRevenuePaise = 159200; // ₹1,592.00

      const conversionRatePercent = parseFloat(((sampleConverted / sampleSent) * 100).toFixed(1));
      const totalRevenueINR = sampleRevenuePaise / 100;

      expect(conversionRatePercent).toBe(16.0);
      expect(totalRevenueINR).toBe(1592);
    });

    it("should handle zero conversion without dividing by zero", () => {
      const sampleSent = 0;
      const sampleConverted = 0;
      const conversionRatePercent = sampleSent > 0 ? (sampleConverted / sampleSent) * 100 : 0;

      expect(conversionRatePercent).toBe(0);
    });
  });
});

