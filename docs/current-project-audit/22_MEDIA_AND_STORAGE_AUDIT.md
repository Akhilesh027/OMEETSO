# 22 — Media, File Uploads and Storage Audit

## Summary
This document audits media handling, image uploads, file storage, asset organization, and CDN readiness across the Omeetso codebase.

---

## 1. File Upload Implementations

### User Portal Image Upload (`frontend/src/components/sell/ImageUploader.tsx`)
- **Mechanism**: HTML `<input type="file" accept="image/*">`.
- **Handling**: Selected files are converted to temporary browser object URLs using `URL.createObjectURL(file)`.
- **Persistence**: These `blob:http://...` strings are passed to the form state and written directly to `localStorage` under `omeetso_user_listings` or `omeetso_quick_sell_draft`.

### Verification Document Upload (`frontend/src/routes/account.verification.$type.tsx`)
- **Mechanism**: File input / camera capture UI for Aadhaar, PAN, Driving License, or Business Registration.
- **Handling**: Stores file name or mock object URL locally.
- **Backend Transfer**: ZERO file bytes are transmitted to any server or cloud storage.

### Admin Media Controls
- Stores display logo/cover image URLs.
- Ad campaigns store creative banner URLs.
- Admin forms allow selecting/entering image URLs as text inputs, but have no binary file uploader component connected to cloud storage.

---

## 2. Critical Flaws in Current Media Pipeline

1. **Blob URL Expiry (Broken Images)**:
   - `URL.createObjectURL()` references are revoked when the browser tab/session closes or reloads.
   - Any listing or store created with uploaded photos will exhibit **broken image icons** upon page refresh or when opened in another browser tab.

2. **LocalStorage Storage Quota**:
   - Storing Base64-encoded image strings or large arrays of image metadata in `localStorage` quickly hits the browser's 5MB–10MB storage limit, causing uncaught `DOMException: QuotaExceededError`.

3. **External Mock Image Dependencies**:
   - Over 90% of mock product, user avatar, and banner images rely on hardcoded external URLs from `images.unsplash.com`.
   - If Unsplash changes image paths or rate-limits requests, product cards across both portals will fail to render media.

---

## 3. Public Assets & Static Media Inventory

### User Portal (`frontend/public/`)
- Contains standard favicon assets, site manifests, and basic branding icons.
- No dynamic user upload directories exist.

### Admin Portal (`admin/public/`)
- Contains branding icons and default placeholder graphics.

---

## 4. Required Media Architecture for Full-Stack Implementation

When building the Node.js/Express backend, the media pipeline must be completely re-architected:

| Pipeline Stage | Recommended Technology / Pattern |
|---|---|
| **Client Upload UI** | Drag-and-drop uploader with client-side image compression (e.g., `browser-image-compression` or `canvas`) |
| **Storage Destination** | AWS S3 Bucket, Cloudinary, or Google Cloud Storage |
| **Upload Flow** | Direct-to-S3 Presigned URLs (client uploads directly to bucket to prevent backend Node.js thread blocking) |
| **Media Processing** | Sharp / AWS Lambda for generating thumbnails (small, medium, large, webp formats) |
| **CDN Integration** | Amazon CloudFront or Cloudflare CDN delivering optimized webp images |
| **Database References** | Store absolute CDN HTTPS URLs in MongoDB/PostgreSQL documents |
