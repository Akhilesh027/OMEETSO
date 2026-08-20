# 12 — Deployment & Infrastructure Plan

## Overview
This document specifies containerization, environment variable configurations, deployment targets, and production monitoring setup for Omeetso.

---

## 1. Environment Configurations

### Backend `.env` Variable Matrix
```ini
# Application
NODE_ENV=production
PORT=3000
API_PREFIX=/api/v1
CLIENT_USER_URL=https://omeetso.com
CLIENT_ADMIN_URL=https://admin.omeetso.com

# Database
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/omeetso?retryWrites=true&w=majority
REDIS_URI=redis://default:<password>@redis-cluster.internal:6379

# JWT Secrets
JWT_ACCESS_SECRET=super_secret_access_key_min_32_chars
JWT_REFRESH_SECRET=super_secret_refresh_key_min_32_chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Media Uploads (Cloudinary or S3)
CLOUDINARY_CLOUD_NAME=omeetso-cloud
CLOUDINARY_API_KEY=1234567890
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz

# SMS Gateway (Twilio / MSG91)
SMS_PROVIDER=msg91
MSG91_AUTH_KEY=123456
MSG91_TEMPLATE_ID=otp_template_id
```

---

## 2. Docker Containerization (`backend/Dockerfile`)

```dockerfile
# Build Stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY packages/contracts ./packages/contracts
COPY backend ./backend
RUN cd packages/contracts && npm ci && npm run build
RUN cd backend && npm ci && npm run build

# Production Stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/packages/contracts/dist ./packages/contracts/dist
COPY --from=builder /app/packages/contracts/package.json ./packages/contracts/
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/package.json ./backend/
COPY --from=builder /app/backend/node_modules ./backend/node_modules

EXPOSE 3000
CMD ["node", "backend/dist/server.js"]
```

---

## 3. Infrastructure Deployment Architecture

- **Backend Node.js API**: Deployed to Render / Railway / AWS ECS with auto-scaling (minimum 2 instances for high availability).
- **MongoDB**: Managed MongoDB Atlas cluster with automated backups and replica sets.
- **User Portal (`frontend/`)**: Deployed to Vercel / Cloudflare Pages.
- **Admin Portal (`admin/`)**: Deployed to Vercel / Netlify with strict IP restriction or VPN requirement.
- **Media Assets**: Cloudinary or AWS S3 delivered through Cloudflare CDN.

---

## 4. Health Checks & Monitoring

- **Health Endpoint**: `GET /api/v1/health` checks MongoDB connection state (`mongoose.connection.readyState === 1`) and returns memory usage.
- **Logging**: Winston logger outputs structured JSON logs to standard output for ingestion by Datadog / Logtail.
