import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, UserTokenPayload } from "../modules/auth/utils/token";
import { User, IUser } from "../modules/users/models/User";
import { UserSession } from "../modules/auth/models/UserSession";
import { UserStatus } from "../contracts";

export interface AuthenticatedUserRequest extends Request {
  user?: IUser;
  sessionId?: string;
}

export async function authenticateUser(
  req: AuthenticatedUserRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Authentication required. Please sign in." }
    });
    return;
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = verifyAccessToken<UserTokenPayload>(token);

    if (payload.aud !== "omeetso-user") {
      res.status(403).json({
        success: false,
        error: { code: "FORBIDDEN", message: "Token audience invalid for user endpoints" }
      });
      return;
    }

    // Verify session validity in database if sessionId is present in token
    if (payload.sessionId) {
      const session = await UserSession.findById(payload.sessionId);
      if (!session || session.isRevoked || session.expiresAt < new Date()) {
        res.status(401).json({
          success: false,
          error: {
            code: "SESSION_REVOKED",
            message: "Your session has expired or was terminated because you signed in from another device."
          }
        });
        return;
      }
      req.sessionId = payload.sessionId;
    }

    const user = await User.findById(payload.userId);
    if (!user) {
      res.status(401).json({
        success: false,
        error: { code: "USER_NOT_FOUND", message: "User account not found" }
      });
      return;
    }

    if (user.status === UserStatus.PERMANENTLY_SUSPENDED || user.status === UserStatus.DELETED) {
      res.status(403).json({
        success: false,
        error: { code: "ACCOUNT_SUSPENDED", message: "This account has been deleted or suspended." }
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: { code: "TOKEN_EXPIRED", message: "Access token expired or invalid" }
    });
  }
}
