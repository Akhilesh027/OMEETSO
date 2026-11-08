import { TestClient } from "./testHelper";
import { generateAdminAccessToken } from "../modules/auth/utils/token";

describe("Visitor Intelligence & Live Activity Telemetry Test Suite", () => {
  const client = new TestClient();
  let adminToken: string;
  const mockAdminId = "65c2f829f0e1d23456789111";
  const mockSessionId = "65c2f829f0e1d23456789222";

  beforeAll(async () => {
    await client.start();
    adminToken = generateAdminAccessToken(mockAdminId, "Super Admin", mockSessionId);
  });

  afterAll(async () => {
    await client.stop();
  });

  describe("POST /api/v1/telemetry/event", () => {
    it("should reject events without visitorId or sessionId", async () => {
      const res = await client.post("/api/v1/telemetry/event", {
        activityType: "PAGE_VIEW"
      });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("MISSING_IDENTIFIERS");
    });

    it("should successfully record a general page view event", async () => {
      const res = await client.post("/api/v1/telemetry/event", {
        visitorId: "v_test_visitor_123",
        sessionId: "s_test_session_123",
        activityType: "VISIT_OPENED",
        pagePath: "/home",
        pageUrl: "https://omeetso.in/home",
        location: {
          city: "Hyderabad",
          state: "Telangana"
        },
        device: {
          platform: "android_app"
        }
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.activityId).toBeDefined();
    });

    it("should automatically tag WhatsApp / Call actions as commercial leads", async () => {
      const res = await client.post("/api/v1/telemetry/event", {
        visitorId: "v_buyer_lead_999",
        sessionId: "s_buyer_session_999",
        activityType: "CONTACT_WHATSAPP_CLICKED",
        pagePath: "/product/prod_123",
        pageUrl: "https://omeetso.in/product/prod_123",
        metadata: {
          listingTitle: "Apple iPhone 14 Pro",
          listingPrice: 55000,
          sellerPhone: "9849012345"
        },
        location: {
          city: "Bangalore"
        }
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  describe("Protected Admin Live Stats & Feed", () => {
    it("should reject unauthenticated access to /api/v1/telemetry/live-stats", async () => {
      const res = await client.get("/api/v1/telemetry/live-stats");
      expect(res.status).toBe(401);
    });

    it("should return live telemetry analytics for authenticated admins", async () => {
      const res = await client.get("/api/v1/telemetry/live-stats", {
        Authorization: `Bearer ${adminToken}`
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.activeOnlineNow).toBeGreaterThanOrEqual(1);
      expect(res.body.data.uniqueVisitorsToday).toBeGreaterThanOrEqual(1);
      expect(typeof res.body.data.registeredUsersToday).toBe("number");
      expect(typeof res.body.data.guestVisitorsToday).toBe("number");
      expect(Array.isArray(res.body.data.availableCities)).toBe(true);
      expect(Array.isArray(res.body.data.topCities)).toBe(true);
    });

    it("should return paginated activity feed for admin dashboard", async () => {
      const res = await client.get("/api/v1/telemetry/feed?page=1&limit=10", {
        Authorization: `Bearer ${adminToken}`
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.activities)).toBe(true);
      expect(res.body.data.pagination).toBeDefined();
    });

    it("should download clear formatted CSV telemetry report", async () => {
      const res = await client.get("/api/v1/telemetry/export-report?timeRange=all", {
        Authorization: `Bearer ${adminToken}`
      });

      expect(res.status).toBe(200);
      expect(res.headers.get("content-type")).toContain("text/csv");
      expect(res.headers.get("content-disposition")).toContain("attachment; filename=");
      expect(typeof res.body).toBe("string");
      expect(res.body).toContain("Lead Priority");
      expect(res.body).toContain("Visitor Name");
    });
  });
});

