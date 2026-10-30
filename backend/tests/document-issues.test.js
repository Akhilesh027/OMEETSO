// These regressions use mocked persistence and mail delivery; no live data is changed.
jest.mock("../dist/config/env", () => ({ env: { JWT_ACCESS_SECRET: "test-only-secret-32-characters-long", JWT_ACCESS_EXPIRES_IN: "15m", API_PREFIX: "/api/v1", CLIENT_USER_URL: "https://example.test", NODE_ENV: "test" } }));
jest.mock("../dist/modules/users/models/User", () => ({ User: { findById: jest.fn(), findOne: jest.fn(), create: jest.fn() } }));
jest.mock("../dist/modules/admin/models/AdminUser", () => ({ AdminUser: { findById: jest.fn(), findOne: jest.fn(), findOneAndUpdate: jest.fn(), create: jest.fn() } }));
jest.mock("../dist/modules/auth/models/UserSession", () => ({ UserSession: { findById: jest.fn() } }));
jest.mock("../dist/modules/auth/models/AdminSession", () => ({ AdminSession: { findById: jest.fn() } }));
jest.mock("../dist/modules/jobs/models/Job", () => ({ Job: { findById: jest.fn(), findByIdAndUpdate: jest.fn() } }));
jest.mock("../dist/modules/jobs/models/JobApplication", () => ({ JobApplication: { findById: jest.fn(), findOne: jest.fn(), create: jest.fn() } }));
jest.mock("../dist/modules/jobs/models/CandidateProfile", () => ({ CandidateProfile: { findOne: jest.fn() } }));
jest.mock("../dist/modules/notifications/models/Notification", () => ({ Notification: { create: jest.fn() } }));
jest.mock("../dist/modules/support/models/SupportTicket", () => ({ SupportTicket: { create: jest.fn(), findById: jest.fn() } }));
jest.mock("../dist/modules/support/models/SupportMessage", () => ({ SupportMessage: { create: jest.fn(), find: jest.fn() } }));
jest.mock("../dist/modules/auth/services/email.service", () => ({ sendJobApplicationStatusEmail: jest.fn().mockResolvedValue({ success: true }) }));

const { User } = require("../dist/modules/users/models/User");
const { AdminUser } = require("../dist/modules/admin/models/AdminUser");
const { UserSession } = require("../dist/modules/auth/models/UserSession");
const { AdminSession } = require("../dist/modules/auth/models/AdminSession");
const { Job } = require("../dist/modules/jobs/models/Job");
const { JobApplication } = require("../dist/modules/jobs/models/JobApplication");
const { CandidateProfile } = require("../dist/modules/jobs/models/CandidateProfile");
const { Notification } = require("../dist/modules/notifications/models/Notification");
const { SupportTicket } = require("../dist/modules/support/models/SupportTicket");
const { SupportMessage } = require("../dist/modules/support/models/SupportMessage");
const { authenticateUser } = require("../dist/middleware/authenticateUser");
const { authenticateAdmin } = require("../dist/middleware/authenticateAdmin");
const { loginUserDirect, loginWithGoogle, registerUser } = require("../dist/modules/auth/controllers/userAuth.controller");
const { verifyAdmin2FA } = require("../dist/modules/auth/controllers/adminAuth.controller");
const { applyToJob, updateApplicantStatus } = require("../dist/modules/jobs/controllers/jobs.controller");
const { createTicket, adminGetTicketMessages } = require("../dist/modules/support/controllers/support.controller");
const { sendJobApplicationStatusEmail } = require("../dist/modules/auth/services/email.service");
const { generateUserAccessToken, generateAdminAccessToken } = require("../dist/modules/auth/utils/token");
const { verifyTotp } = require("../dist/modules/auth/utils/totp");
const { hasApplicationResume } = require("../dist/modules/jobs/utils/resumeValidation");
const id = "507f1f77bcf86cd799439011";
const employerId = "507f191e810c19729de860ea";
const response = () => { const res = { status: jest.fn(), json: jest.fn(), clearCookie: jest.fn() }; res.status.mockReturnValue(res); return res; };
beforeEach(() => { jest.clearAllMocks(); Notification.create.mockResolvedValue({}); });

describe("authentication rejects unauthorized access", () => {
  test.each([undefined, "Bearer guest_token", "Bearer mock_google_jwt_token", "Bearer admin_super_token", "Bearer invalid.jwt.token"])("rejects user token %s", async header => {
    const res = response(), next = jest.fn();
    await authenticateUser({ headers: { authorization: header } }, res, next);
    expect(res.status).toHaveBeenCalledWith(401); expect(next).not.toHaveBeenCalled(); expect(User.findOne).not.toHaveBeenCalled();
  });
  test.each([undefined, "Bearer guest_token", "Bearer mock_admin_jwt_token", "Bearer admin_super_token"])("rejects admin token %s", async header => {
    const res = response(), next = jest.fn();
    await authenticateAdmin({ headers: { authorization: header } }, res, next);
    expect(res.status).toHaveBeenCalledWith(401); expect(next).not.toHaveBeenCalled(); expect(AdminUser.create).not.toHaveBeenCalled();
  });
  test("user tokens cannot access admin endpoints", async () => {
    const res = response(); await authenticateAdmin({ headers: { authorization: `Bearer ${generateUserAccessToken(id, id)}` } }, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(403);
  });
  test("admin tokens cannot impersonate users", async () => {
    const res = response(); await authenticateUser({ headers: { authorization: `Bearer ${generateAdminAccessToken(id, "Super Admin", ["*"], id)}` } }, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(403);
  });
  test.each([false, true])("admin session revoked=%s", async revoked => {
    AdminSession.findById.mockResolvedValue({ adminId: id, isRevoked: revoked, expiresAt: new Date(Date.now() + 60000) });
    AdminUser.findById.mockResolvedValue({ _id: id, status: "active" });
    const res = response(), next = jest.fn();
    await authenticateAdmin({ headers: { authorization: `Bearer ${generateAdminAccessToken(id, "Super Admin", ["*"], id)}` } }, res, next);
    if (revoked) expect(res.status).toHaveBeenCalledWith(401); else expect(next).toHaveBeenCalledWith();
  });
  test("revoked user session is rejected", async () => {
    UserSession.findById.mockResolvedValue({ userId: id, isRevoked: true, expiresAt: new Date(Date.now() + 60000) });
    const res = response(); await authenticateUser({ headers: { authorization: `Bearer ${generateUserAccessToken(id, id)}` } }, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(401);
  });
  test("an account with no PIN cannot log in without OTP", async () => {
    User.findOne.mockResolvedValue({ _id: id, status: "ACTIVE" }); const res = response();
    await loginUserDirect({ body: { phone: "9000000000" } }, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(401); expect(res.json.mock.calls[0][0].error.code).toBe("PIN_NOT_SET");
  });
  test("registration cannot overwrite another phone's account", async () => {
    const res = response(); await registerUser({ body: { name: "Candidate", phone: "9000000000" }, user: { phone: "+919111111111" } }, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(403); expect(User.findOne).not.toHaveBeenCalled();
  });
  test("unverified Google profile cannot log in", async () => {
    const res = response(); await loginWithGoogle({ body: { email: "someone@example.test" } }, res);
    expect(res.status).toHaveBeenCalledWith(503); expect(User.findOne).not.toHaveBeenCalled();
  });
  test("2FA cannot bypass the password step", async () => {
    const res = response(); await verifyAdmin2FA({ body: { email: "admin@example.test", code: "123456" }, cookies: {} }, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(401); expect(AdminUser.findOne).not.toHaveBeenCalled();
  });
  test("TOTP follows RFC 6238 vectors and rejects fabricated codes", () => {
    const secret = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ";
    expect(verifyTotp(secret, "287082", 59000)).toBe(1);
    expect(verifyTotp(secret, "081804", 1111111109000)).not.toBeNull();
    expect(verifyTotp(secret, "123456", 59000)).toBeNull();
    expect(verifyTotp("invalid_secret", "123456", 59000)).toBeNull();
  });
});

describe("resume requirements", () => {
  test.each([{}, { resumeFileName: "resume.pdf" }, { resumeUrl: "blob:local-only" }, { skills: ["JS"] }, { education: "", summary: "", skills: [""] }])("rejects incomplete profile %j", value => expect(hasApplicationResume(value)).toBe(false));
  test.each([{ resumeUrl: "https://example.test/resume.pdf" }, { resumeUrl: "data:application/pdf;base64,JVBERi0=" }, { education: "Graduate", skills: ["JS"], summary: "Frontend developer" }, { educations: [{ qualification: "Graduate" }], skillsList: [{ name: "JS" }], title: "Fresher" }])("accepts attached resume or manual profile %j", value => expect(hasApplicationResume(value)).toBe(true));
  test("server rejects application with no attached resume before saving", async () => {
    Job.findById.mockResolvedValue({ _id: id, status: "ACTIVE" }); JobApplication.findOne.mockResolvedValue(null); CandidateProfile.findOne.mockResolvedValue(null);
    const res = response(), next = jest.fn();
    await applyToJob({ user: { _id: id, phone: "+919000000000", profile: { name: "Candidate" } }, body: { jobId: id, customSnapshot: {} } }, res, next);
    expect(next).not.toHaveBeenCalled(); expect(res.status).toHaveBeenCalledWith(400); expect(res.json.mock.calls[0][0].error.code).toBe("RESUME_REQUIRED"); expect(JobApplication.create).not.toHaveBeenCalled();
  });
});

describe("candidate status notifications", () => {
  test.each(["SHORTLISTED", "INTERVIEW_SCHEDULED", "SELECTED", "REJECTED"])("emails registered candidate for %s", async status => {
    const app = { _id: id, jobId: id, employerId, applicantId: id, status: "APPLIED", save: jest.fn(), toObject: () => ({}) };
    JobApplication.findById.mockResolvedValue(app); Job.findById.mockResolvedValue({ employerId, title: "Developer", companyName: "Example" });
    User.findById.mockReturnValue({ select: () => ({ lean: async () => ({ email: "registered@example.test", profile: { name: "Candidate" } }) }) });
    const res = response(), next = jest.fn();
    await updateApplicantStatus({ user: { _id: employerId }, params: { applicationId: id }, body: { status } }, res, next);
    expect(next).not.toHaveBeenCalled(); expect(sendJobApplicationStatusEmail).toHaveBeenCalledWith(expect.objectContaining({ candidateEmail: "registered@example.test", status })); expect(Notification.create).toHaveBeenCalledTimes(1);
  });
  test("private notes do not send status notifications", async () => {
    JobApplication.findById.mockResolvedValue({ _id: id, jobId: id, employerId, applicantId: id, status: "SHORTLISTED", save: jest.fn(), toObject: () => ({}) });
    Job.findById.mockResolvedValue({ employerId });
    await updateApplicantStatus({ user: { _id: employerId }, params: { applicationId: id }, body: { employerNotes: "Private" } }, response(), jest.fn());
    expect(sendJobApplicationStatusEmail).not.toHaveBeenCalled(); expect(Notification.create).not.toHaveBeenCalled();
  });
});

describe("support attachment persistence", () => {
  test("stores real image content on the initial support message", async () => {
    const image = "data:image/png;base64,aGVsbG8=";
    SupportTicket.create.mockImplementation(async payload => ({ ...payload, _id: id })); SupportMessage.create.mockResolvedValue({});
    const res = response(), next = jest.fn();
    await createTicket({ user: { _id: id, profile: { name: "Candidate" } }, body: { subject: "Help", description: "Screenshot attached", attachments: [image] } }, res, next);
    expect(next).not.toHaveBeenCalled(); expect(res.status).toHaveBeenCalledWith(201); expect(SupportMessage.create).toHaveBeenCalledWith(expect.objectContaining({ attachments: [image] }));
  });
  test("admin receives uploaded attachments", async () => {
    const image = "data:image/png;base64,aGVsbG8=";
    SupportTicket.findById.mockResolvedValue({ _id: id }); SupportMessage.find.mockReturnValue({ sort: () => ({ lean: async () => [{ _id: id, attachments: [image] }] }) });
    const res = response(); await adminGetTicketMessages({ params: { ticketId: id } }, res, jest.fn());
    expect(res.json.mock.calls[0][0].data[0].attachments).toEqual([image]);
  });
  test.each(["ref://screenshot.png", "blob:local", "javascript:alert(1)"])("rejects inaccessible attachment %s", async url => {
    const res = response(); await createTicket({ user: { _id: id }, body: { attachments: [url] } }, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(400); expect(SupportTicket.create).not.toHaveBeenCalled();
  });
  test("phone callback is no longer accepted", async () => {
    const res = response(); await createTicket({ body: { contactMethod: "call" } }, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(400);
  });
});
