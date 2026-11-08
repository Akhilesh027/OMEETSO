import crypto from "crypto";
import { TestClient } from "./testHelper";
import { env } from "../config/env";
import { generateUserAccessToken } from "../modules/auth/utils/token";

describe("Payment & Revenue Security Test Suite", () => {
  const client = new TestClient();
  let validUserToken: string;
  const mockUserId = "65c2f829f0e1d23456789abc";
  const mockSessionId = "65c2f829f0e1d23456789def";

  beforeAll(async () => {
    await client.start();
    validUserToken = generateUserAccessToken(mockUserId, mockSessionId);
  });

  afterAll(async () => {
    await client.stop();
  });

  describe("POST /api/v1/create-order", () => {
    it("should reject requests without authentication", async () => {
      const res = await client.post("/api/v1/create-order", { amount: 5000 });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should reject invalid amount (< 100 paise / ₹1)", async () => {
      const res = await client.post(
        "/api/v1/create-order",
        { amount: 50 }, // 50 paise is below minimum ₹1
        { Authorization: `Bearer ${validUserToken}` }
      );

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("INVALID_AMOUNT");
    });

    it("should reject non-numeric amount", async () => {
      const res = await client.post(
        "/api/v1/create-order",
        { amount: "invalid_amount" },
        { Authorization: `Bearer ${validUserToken}` }
      );

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("INVALID_AMOUNT");
    });
  });

  describe("POST /api/v1/verify-payment", () => {
    it("should reject requests without authentication", async () => {
      const res = await client.post("/api/v1/verify-payment", {
        razorpay_order_id: "order_123",
        razorpay_payment_id: "pay_123",
        razorpay_signature: "sig_123"
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should reject missing required payment signature fields", async () => {
      const res = await client.post(
        "/api/v1/verify-payment",
        { razorpay_order_id: "order_123" }, // missing payment_id & signature
        { Authorization: `Bearer ${validUserToken}` }
      );

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("MISSING_FIELDS");
    });

    it("should reject tampered or forged HMAC-SHA256 signature", async () => {
      const orderId = "order_test_random_456";
      const paymentId = "pay_test_random_789";
      const forgedSignature = "0000000000000000000000000000000000000000000000000000000000000000";

      const res = await client.post(
        "/api/v1/verify-payment",
        {
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: forgedSignature,
          amount: 50000
        },
        { Authorization: `Bearer ${validUserToken}` }
      );

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("INVALID_SIGNATURE");
    });

    it("should verify mathematical HMAC-SHA256 generation logic", () => {
      const orderId = "order_ABC123";
      const paymentId = "pay_XYZ789";
      const payload = `${orderId}|${paymentId}`;

      const generatedSignature = crypto
        .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
        .update(payload)
        .digest("hex");

      // Verify that the generated signature is a valid 64-character hex string
      expect(generatedSignature).toHaveLength(64);
      expect(/^[0-9a-f]{64}$/.test(generatedSignature)).toBe(true);

      // Verify idempotency of the HMAC computation
      const secondRun = crypto
        .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
        .update(payload)
        .digest("hex");
      expect(generatedSignature).toBe(secondRun);
    });
  });
});

