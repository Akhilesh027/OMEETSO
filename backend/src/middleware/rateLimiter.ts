import rateLimit from "express-rate-limit";
import { env } from "../config/env";

const isTest = env.NODE_ENV === "test";

/**
 * Strict rate limiter for sending mobile & email OTPs.
 * Prevents SMS gateway exhaustion and draining of SMS API credits.
 * Limit: 5 OTP requests per 10 minutes per IP.
 */
export const otpRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: isTest ? 1000 : 5,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  message: {
    success: false,
    error: {
      code: "TOO_MANY_REQUESTS",
      message: "Too many OTP requests. Please wait 10 minutes before requesting another OTP."
    }
  }
});

/**
 * Rate limiter for PIN login attempts.
 * Protects 4-digit PINs (10,000 combinations) from automated brute-force attacks.
 * Limit: 10 attempts per 15 minutes per IP.
 */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isTest ? 1000 : 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "TOO_MANY_ATTEMPTS",
      message: "Too many failed sign-in attempts. Please wait 15 minutes before trying again."
    }
  }
});

/**
 * General public API rate limiter to protect the application server.
 * Limit: 300 requests per minute per IP.
 */
export const generalApiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: isTest ? 10000 : 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many requests. Please slow down."
    }
  }
});

