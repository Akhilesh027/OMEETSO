# 02 — Shared Contracts Specification

## Overview
To guarantee strict type safety and prevent drift between `frontend/`, `admin/`, and `backend/`, all shared enums, Zod validation schemas, and TypeScript interfaces are centralized in the `@omeetso/contracts` package located at `packages/contracts/`.

---

## 1. Canonical Status Enums (`src/enums/`)

### User Status
```typescript
export enum UserStatus {
  ACTIVE = "ACTIVE",
  PENDING_VERIFICATION = "PENDING_VERIFICATION",
  LIMITED = "LIMITED",
  UNDER_INVESTIGATION = "UNDER_INVESTIGATION",
  TEMPORARILY_SUSPENDED = "TEMPORARILY_SUSPENDED",
  PERMANENTLY_SUSPENDED = "PERMANENTLY_SUSPENDED",
  DEACTIVATED = "DEACTIVATED",
  DELETED = "DELETED"
}
```

### Listing Moderation Status
```typescript
export enum ListingStatus {
  DRAFT = "DRAFT",
  SUBMITTED = "SUBMITTED",
  PENDING_REVIEW = "PENDING_REVIEW",
  UNDER_REVIEW = "UNDER_REVIEW",
  CHANGES_REQUIRED = "CHANGES_REQUIRED",
  APPROVED = "APPROVED",
  ACTIVE = "ACTIVE",
  PAUSED = "PAUSED",
  REJECTED = "REJECTED",
  REPORTED = "REPORTED",
  UNDER_INVESTIGATION = "UNDER_INVESTIGATION",
  REMOVED = "REMOVED",
  EXPIRED = "EXPIRED",
  SOLD = "SOLD",
  ARCHIVED = "ARCHIVED"
}
```

### Store Status
```typescript
export enum StoreStatus {
  DRAFT = "DRAFT",
  SUBMITTED = "SUBMITTED",
  UNDER_REVIEW = "UNDER_REVIEW",
  CHANGES_REQUIRED = "CHANGES_REQUIRED",
  APPROVED = "APPROVED",
  ACTIVE = "ACTIVE",
  PAUSED = "PAUSED",
  REJECTED = "REJECTED",
  SUSPENDED = "SUSPENDED",
  ARCHIVED = "ARCHIVED"
}
```

### Ad Campaign Status
```typescript
export enum CampaignStatus {
  DRAFT = "DRAFT",
  PAYMENT_PENDING = "PAYMENT_PENDING",
  SUBMITTED = "SUBMITTED",
  UNDER_REVIEW = "UNDER_REVIEW",
  CHANGES_REQUIRED = "CHANGES_REQUIRED",
  APPROVED = "APPROVED",
  SCHEDULED = "SCHEDULED",
  ACTIVE = "ACTIVE",
  PAUSED = "PAUSED",
  REJECTED = "REJECTED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED"
}
```

### Offer Status
```typescript
export enum OfferStatus {
  PENDING = "PENDING",
  COUNTERED = "COUNTERED",
  ACCEPTED = "ACCEPTED",
  DECLINED = "DECLINED",
  EXPIRED = "EXPIRED",
  CANCELLED = "CANCELLED"
}
```

---

## 2. Shared Request / Response Schemas (`src/schemas/`)

### Standard Pagination Response Schema
```typescript
import { z } from "zod";

export const PaginationMetaSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative()
});

export const createPaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    success: z.literal(true),
    data: z.array(itemSchema),
    pagination: PaginationMetaSchema
  });
```

### Create Listing Schema Example
```typescript
export const CreateListingRequestSchema = z.object({
  title: z.string().min(5).max(80),
  description: z.string().min(20).max(2000),
  priceInPaise: z.number().int().nonnegative(),
  negotiable: z.boolean().default(true),
  condition: z.enum(["new", "like_new", "excellent", "good", "fair", "needs_repair"]),
  categoryId: z.string().min(1),
  subcategoryId: z.string().min(1),
  images: z.array(z.string().url()).min(1),
  pincode: z.string().regex(/^\d{6}$/, "Must be a 6-digit Indian pincode"),
  area: z.string().min(2),
  city: z.string().min(2).default("Hyderabad"),
  fulfilment: z.enum(["pickup", "delivery", "both", "buyer"]),
  specs: z.record(z.string(), z.string()).default({}),
  contactPref: z.enum(["chat_only", "call_and_chat", "hide_number"])
});
```

---

## 3. Package Integration

- **Import in Backend**: `import { ListingStatus, CreateListingRequestSchema } from "@omeetso/contracts";`
- **Import in Frontend**: `import type { ListingDto } from "@omeetso/contracts";`
- **Build Output**: Compiles TypeScript declaration files (`.d.ts`) and CommonJS/ESM modules via `tsup` or `tsc`.
