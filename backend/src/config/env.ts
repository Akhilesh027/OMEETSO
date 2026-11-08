import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const EnvSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_PREFIX: z.string().default("/api/v1"),
  CLIENT_USER_URL: z.string().default("http://localhost:5173"),
  CLIENT_ADMIN_URL: z.string().default("http://localhost:5174"),
  ALLOWED_ORIGINS: z.string().optional().default(""),

  // Database Connection
  MONGODB_URI: z.string({
    required_error: "MONGODB_URI must be provided in the environment / .env file"
  }).min(1, "MONGODB_URI cannot be empty"),

  // JWT Security
  JWT_ACCESS_SECRET: z.string({
    required_error: "JWT_ACCESS_SECRET must be provided in the environment / .env file"
  }).min(16, "JWT_ACCESS_SECRET must be at least 16 characters"),
  JWT_REFRESH_SECRET: z.string({
    required_error: "JWT_REFRESH_SECRET must be provided in the environment / .env file"
  }).min(16, "JWT_REFRESH_SECRET must be at least 16 characters"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("30d"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("90d"),

  // Cloud Asset Management
  CLOUDINARY_CLOUD_NAME: z.string().optional().default(""),
  CLOUDINARY_API_KEY: z.string().optional().default(""),
  CLOUDINARY_API_SECRET: z.string().optional().default(""),

  // SMS Gateways
  SMS_PROVIDER: z.string().default("combirds"),
  COMBIRDS_API_KEY: z.string().optional().default(""),
  COMBIRDS_GATEWAY_URL: z.string().default("https://api.combirds.com/api/v1/sms/send"),
  COMBIRDS_SENDER_ID: z.string().optional().default("OMEETS"),
  COMBIRDS_DLT_TE_ID: z.string().optional().default(""),
  COMBIRDS_SMS_TYPE: z.string().optional().default("otp"),
  COMBIRDS_MESSAGE_TEMPLATE: z.string().optional().default(""),
  COMBIRDS_ROUTE: z.string().optional().default("otp"),
  RENFLAIR_SMS_API_KEY: z.string().optional().default(""),
  SMS_GATEWAY_URL: z.string().optional().default("https://sms.renflair.in/V1.php"),

  // Payment Gateway (Razorpay)
  RAZORPAY_KEY_ID: z.string({
    required_error: "RAZORPAY_KEY_ID must be provided in the environment / .env file"
  }).min(1, "RAZORPAY_KEY_ID cannot be empty"),
  RAZORPAY_KEY_SECRET: z.string({
    required_error: "RAZORPAY_KEY_SECRET must be provided in the environment / .env file"
  }).min(1, "RAZORPAY_KEY_SECRET cannot be empty"),

  // SMTP Email Services
  SMTP_HOST: z.string().optional().default("smtp.hostinger.com"),
  SMTP_PORT: z.coerce.number().optional().default(465),
  SMTP_USER: z.string().optional().default(""),
  SMTP_PASS: z.string().optional().default(""),
  SMTP_FROM: z.string().optional().default("info@omeetso.in"),
  SMTP_FROM_NAME: z.string().optional().default("Omeetso"),
  ADMIN_NOTIFICATION_EMAIL: z.string().optional().default("info@omeetso.in"),

  // Optional Admin Seeder Configuration
  INITIAL_ADMIN_EMAIL: z.string().optional().default("admin@digitalness.co.in"),
  INITIAL_ADMIN_PASSWORD: z.string().optional().default(""),
  INITIAL_ADMIN_NAME: z.string().optional().default("Super Admin")
});

export const env = EnvSchema.parse(process.env);
