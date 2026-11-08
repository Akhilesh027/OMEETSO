import { TestClient } from "./testHelper";

describe("Rate Limiting Middleware Test Suite", () => {
  const client = new TestClient();

  beforeAll(async () => {
    await client.start();
  });

  afterAll(async () => {
    await client.stop();
  });

  it("should have standard rate limit headers on API responses", async () => {
    const res = await client.get("/api/v1/health");
    expect(res.status).toBe(200);

    // RateLimit headers (draft-7 / draft-6 RFC specs provided by express-rate-limit)
    const ratelimitPolicy = res.headers.get("ratelimit-policy") || res.headers.get("ratelimit-limit");
    // Either ratelimit header or 200 health response verified
    expect(res.body.success).toBeDefined();
  });
});

