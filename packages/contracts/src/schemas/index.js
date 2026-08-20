"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminTwoFactorSchema = exports.AdminLoginSchema = exports.VerifyOtpSchema = exports.RequestOtpSchema = exports.ListingSearchQuerySchema = exports.CreateListingRequestSchema = exports.ApiResponseMetaSchema = exports.PaginationMetaSchema = exports.PaginationQuerySchema = void 0;
const zod_1 = require("zod");
// Standard Pagination Request & Meta Schemas
exports.PaginationQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().default(1),
    limit: zod_1.z.coerce.number().int().positive().max(100).default(20)
});
exports.PaginationMetaSchema = zod_1.z.object({
    page: zod_1.z.number().int().positive(),
    limit: zod_1.z.number().int().positive(),
    total: zod_1.z.number().int().nonnegative(),
    totalPages: zod_1.z.number().int().nonnegative()
});
exports.ApiResponseMetaSchema = zod_1.z.object({
    requestId: zod_1.z.string().optional()
});
exports.CreateListingRequestSchema = zod_1.z.object({
    title: zod_1.z.string().min(2).max(120),
    description: zod_1.z.string().min(2).max(4000).default("Detailed product listing on Omeetso"),
    priceInPaise: zod_1.z.number().int().nonnegative(),
    negotiable: zod_1.z.boolean().default(true),
    free: zod_1.z.boolean().default(false),
    condition: zod_1.z.string().default("good"),
    categoryId: zod_1.z.string().min(1).default("mobiles"),
    subcategoryId: zod_1.z.string().optional().default("mobiles"),
    images: zod_1.z.array(zod_1.z.string()).default([]),
    coverIndex: zod_1.z.number().int().nonnegative().default(0),
    videoUrl: zod_1.z.string().optional(),
    pincode: zod_1.z.string().default("500081"),
    area: zod_1.z.string().default("Madhapur"),
    city: zod_1.z.string().default("Hyderabad"),
    fulfilment: zod_1.z.string().default("pickup"),
    specs: zod_1.z.record(zod_1.z.string(), zod_1.z.string()).default({}),
    contactPref: zod_1.z.string().default("call_and_chat")
});
exports.ListingSearchQuerySchema = exports.PaginationQuerySchema.extend({
    q: zod_1.z.string().optional(),
    categoryId: zod_1.z.string().optional(),
    subcategoryId: zod_1.z.string().optional(),
    minPrice: zod_1.z.coerce.number().int().nonnegative().optional(),
    maxPrice: zod_1.z.coerce.number().int().nonnegative().optional(),
    condition: zod_1.z.string().optional(),
    city: zod_1.z.string().optional().default("Hyderabad"),
    pincode: zod_1.z.string().optional(),
    sort: zod_1.z.enum(["newest", "price_asc", "price_desc", "relevance"]).default("newest")
});
// Auth Request Schemas
exports.RequestOtpSchema = zod_1.z.object({
    phone: zod_1.z.string().regex(/^\+91\d{10}$|^\d{10}$/, "Valid 10-digit Indian phone required")
});
exports.VerifyOtpSchema = zod_1.z.object({
    phone: zod_1.z.string().regex(/^\+91\d{10}$|^\d{10}$/),
    code: zod_1.z.string().length(4, "4-digit OTP code required")
});
exports.AdminLoginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6)
});
exports.AdminTwoFactorSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    code: zod_1.z.string().min(6)
});
