const fs = require("fs");
const path = require("path");
const ts = require("typescript");

function loadFrontend(file, imports, storage = new Map(), fetch = jest.fn()) {
  const source = fs.readFileSync(path.join(__dirname, "../../frontend/src", file), "utf8");
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const localStorage = { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) };
  const module = { exports: {} };
  new Function("require", "module", "exports", "window", "localStorage", "fetch", "AbortSignal", "atob", js)(
    name => { if (name in imports) return imports[name]; throw new Error(`Unexpected dependency ${name}`); },
    module, module.exports, { localStorage }, localStorage, fetch, AbortSignal, atob,
  );
  return module.exports;
}

describe("frontend authentication", () => {
  test.each([null, "mock_google_jwt_token", "guest_token", "admin_super_token", "broken", "a.bad.c", `a.${Buffer.from("{}").toString("base64")}.c`])("rejects invalid cached token %s", token => {
    const auth = loadFrontend("api/auth.api.ts", { "@/config/api": { API_BASE: "https://example.test/api/v1" } });
    expect(auth.isJwtTokenExpired(token)).toBe(true);
  });
  test("backend connection failure never authenticates a cached account", async () => {
    const token = `a.${Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 300 })).toString("base64")}.c`;
    const storage = new Map([["omeetso_user_token", token], ["omeetso_user", JSON.stringify({ id: "cached" })]]);
    const auth = loadFrontend("api/auth.api.ts", { "@/config/api": { API_BASE: "https://example.test/api/v1" } }, storage, jest.fn().mockRejectedValue(new Error("Offline")));
    expect((await auth.checkUserAuthStatus()).isAuthenticated).toBe(false);
  });
});

describe("Seller and Employer chat API", () => {
  test.each(["LISTING", "JOB"])("starts %s chat with the authenticated request and bounded wait", async contextType => {
    const fetch = jest.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ success: true, data: { id: "conversation" } }) });
    const chat = loadFrontend("api/chat.api.ts", { "./auth.api": { getUserAccessToken: () => "verified-token" }, "@/config/api": { API_BASE: "https://example.test/api/v1" } }, new Map(), fetch);
    expect(await chat.startConversationApi(contextType, "context-id", "recipient-id")).toEqual({ success: true, data: { id: "conversation" } });
    expect(fetch.mock.calls[0][1].headers.Authorization).toBe("Bearer verified-token");
    expect(fetch.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal);
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toMatchObject({ contextType, contextId: "context-id", recipientId: "recipient-id" });
  });
  test("expired session is refreshed once before opening a conversation", async () => {
    const fetch = jest.fn()
      .mockResolvedValueOnce({ status: 401, json: async () => ({ success: false, error: { code: "TOKEN_EXPIRED" } }) })
      .mockResolvedValueOnce({ status: 200, json: async () => ({ success: true, data: { id: "conversation" } }) });
    const refresh = jest.fn().mockResolvedValue({ success: true, data: { accessToken: "refreshed-token" } });
    const chat = loadFrontend("api/chat.api.ts", { "./auth.api": { getUserAccessToken: () => "expired-token", refreshUserSession: refresh }, "@/config/api": { API_BASE: "https://example.test/api/v1" } }, new Map(), fetch);
    expect((await chat.startConversationApi("JOB", "job")).success).toBe(true);
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(fetch.mock.calls[1][1].headers.Authorization).toBe("Bearer refreshed-token");
  });
});

test("frontend and backend agree on resume requirements", () => {
  const frontend = loadFrontend("lib/resumeValidation.ts", {});
  const backend = require("../dist/modules/jobs/utils/resumeValidation");
  for (const profile of [{}, { resumeUrl: "blob:test" }, { resumeUrl: "data:application/pdf;base64,JVBERg==" }, { education: "Graduate", skills: ["JS"], title: "Developer" }]) {
    expect(frontend.hasApplicationResume(profile)).toBe(backend.hasApplicationResume(profile));
  }
});

test("another candidate's cached applications do not mark jobs as Applied", () => {
  const storage = new Map([
    ["omeetso_user", JSON.stringify({ id: "candidate-a" })],
    ["omeetso_candidate_applications_candidate-a", JSON.stringify([{ id: "own", jobId: "job-a", applicantId: "candidate-a", status: "APPLIED" }])],
    ["omeetso_candidate_applications_candidate-b", JSON.stringify([{ id: "other", jobId: "job-b", applicantId: "candidate-b", status: "APPLIED" }])],
    ["omeetso_candidate_applied_jobs", JSON.stringify([{ id: "legacy-other", jobId: "job-c", applicantId: "candidate-b", status: "APPLIED" }])],
  ]);
  const jobs = loadFrontend("lib/jobs.ts", { "@/config/api": { API_BASE: "https://example.test/api/v1" } }, storage);
  expect(jobs.listCandidateApplicationsLocal().map(app => app.id)).toEqual(["own"]);
});
