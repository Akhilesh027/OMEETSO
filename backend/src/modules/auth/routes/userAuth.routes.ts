import { Router } from "express";
import {
  requestOtp,
  verifyOtp,
  checkPhoneStatus,
  registerUser,
  loginUserDirect,
  refreshUserSession,
  logoutUser,
  getUserSession,
  resetUserPin,
  loginWithGoogle
} from "../controllers/userAuth.controller";
import {
  requestEmailOtp,
  verifyEmailOtp
} from "../controllers/emailAuth.controller";
import { validateBody } from "../../../middleware/validateRequest";
import { authenticateUser } from "../../../middleware/authenticateUser";
import { otpRateLimiter, loginRateLimiter } from "../../../middleware/rateLimiter";
import { RequestOtpSchema, VerifyOtpSchema } from "../../../contracts";

export const userAuthRouter = Router();

userAuthRouter.post("/check-phone", checkPhoneStatus);
userAuthRouter.post("/register", authenticateUser, registerUser);
userAuthRouter.post("/login", loginRateLimiter, loginUserDirect);
userAuthRouter.post("/google", loginWithGoogle);
userAuthRouter.post("/otp/request", otpRateLimiter, validateBody(RequestOtpSchema), requestOtp);
userAuthRouter.post("/otp/verify", validateBody(VerifyOtpSchema), verifyOtp);
userAuthRouter.post("/email-otp/request", otpRateLimiter, requestEmailOtp);
userAuthRouter.post("/email-otp/verify", verifyEmailOtp);
userAuthRouter.post("/reset-pin", otpRateLimiter, resetUserPin);
userAuthRouter.post("/forgot-pin", otpRateLimiter, resetUserPin);
userAuthRouter.post("/refresh", refreshUserSession);
userAuthRouter.post("/logout", logoutUser);
userAuthRouter.get("/session", authenticateUser, getUserSession);
