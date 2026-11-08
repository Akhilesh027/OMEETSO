import jwt from "jsonwebtoken";
import { TestClient } from "./testHelper";
import { env } from "../config/env";
import {
  generateUserAccessToken,
  generateAdminAccessToken,
  verifyAccessToken,
  UserTokenPayload,
  AdminTokenPayload
} from "../modules/auth/utils/token";

describe("Authentication & RBAC Security Test Suite", () => {
  const client = new TestClient();
  const mockUserId = "65c2f829f0e1d23456789abc";
  const mockSessionId = "65c2f829f0e1d23456789def";
  const mockAdminId = "65c2f829f0e1d23456789111";

  beforeAll(async () => {
    await client.start();
  });

  afterAll(async () => {
    await client.stop();
  });

  describe("Phone Number Validation for OTP", () => {
    it("should reject OTP request with missing phone", async () => {
      const res = await client.post("/api/v1/auth/otp/request", {});
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should reject invalid length phone numbers", async () => {
      const res = await client.post("/api/v1/auth/otp/request", {
        phone: "12345" // only 5 digits
      });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("Token Generation, Verification & Audience Separation", () => {
    it("should correctly sign and verify user access token", () => {
      const token = generateUserAccessToken(mockUserId, mockSessionId);
      expect(token).toBeDefined();

      const decoded = verifyAccessToken<UserTokenPayload>(token);
      expect(decoded.userId).toBe(mockUserId);
      expect(decoded.sessionId).toBe(mockSessionId);
      expect(decoded.aud).toBe("omeetso-user");
    });

    it("should correctly sign and verify admin access token with admin audience", () => {
      const token = generateAdminAccessToken(mockAdminId, "Super Admin", mockSessionId);
      expect(token).toBeDefined();

      const decoded = verifyAccessToken<AdminTokenPayload>(token);
      expect(decoded.adminId).toBe(mockAdminId);
      expect(decoded.role).toBe("Super Admin");
      expect(decoded.aud).toBe("omeetso-admin");
    });

    it("should reject tampered token signatures", () => {
      const validToken = generateUserAccessToken(mockUserId, mockSessionId);
      const tamperedToken = validToken.substring(0, validToken.length - 5) + "abcde";

      expect(() => {
        verifyAccessToken<UserTokenPayload>(tamperedToken);
      }).toThrow();
    });

    it("should reject tokens signed with a different secret", () => {
      const rogueToken = jwt.sign(
        { userId: mockUserId, aud: "omeetso-user" },
        "different_unauthorized_secret_key_32_chars",
        { expiresIn: "1h" }
      );

      expect(() => {
        verifyAccessToken<UserTokenPayload>(rogueToken);
      }).toThrow();
    });
  });

  describe("Admin Route Protection & Audience Enforcement", () => {
    it("should reject unauthenticated access to admin routes with 401", async () => {
      const res = await client.get("/api/v1/admin/dashboard/summary");
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should reject user token accessing admin route with 403 Forbidden", async () => {
      const userToken = generateUserAccessToken(mockUserId, mockSessionId);

      const res = await client.get("/api/v1/admin/dashboard/summary", {
        Authorization: `Bearer ${userToken}`
      });

      // User token has aud="omeetso-user", but admin route requires aud="omeetso-admin"
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("FORBIDDEN");
    });
  });
});

