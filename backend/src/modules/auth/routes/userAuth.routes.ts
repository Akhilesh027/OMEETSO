import { Router } from "express";
import {
  requestOtp,
  verifyOtp,
  checkPhoneStatus,
  registerUser,
  loginUserDirect,
  refreshUserSession,
  logoutUser,
  getUserSession
} from "../controllers/userAuth.controller";
import { validateBody } from "../../../middleware/validateRequest";
import { authenticateUser } from "../../../middleware/authenticateUser";
import { RequestOtpSchema, VerifyOtpSchema } from "../../../contracts";

export const userAuthRouter = Router();

userAuthRouter.post("/check-phone", checkPhoneStatus);
userAuthRouter.post("/register", registerUser);
userAuthRouter.post("/login", loginUserDirect);
userAuthRouter.post("/otp/request", validateBody(RequestOtpSchema), requestOtp);
userAuthRouter.post("/otp/verify", validateBody(VerifyOtpSchema), verifyOtp);
userAuthRouter.post("/refresh", refreshUserSession);
userAuthRouter.post("/logout", logoutUser);
userAuthRouter.get("/session", authenticateUser, getUserSession);


