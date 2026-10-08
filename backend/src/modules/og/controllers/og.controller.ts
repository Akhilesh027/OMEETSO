import { Request, Response } from "express";
import mongoose from "mongoose";
import { Listing } from "../../listings/models/Listing";
import { Store } from "../../stores/models/Store";
import { env } from "../../../config/env";

import { Blog } from "../../blogs/models/Blog";

function escapeHtml(str?: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function resolveAbsoluteUrl(url?: string, defaultBase?: string): string {
  if (!url) {
    return "https://omeetso.in/iconpng.png";
  }
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  const cleanBase = defaultBase || (env.CLIENT_USER_URL || "").split(",")[0].trim().replace(/\/$/, "");
  return `${cleanBase}${url.startsWith("/") ? "" : "/"}${url}`;
}

export async function getProductOpenGraphPreview(req: Request, res: Response): Promise<void> {
  // Fresh OpenGraph renderer for WhatsApp & social bots
  try {
    const rawId = req.params.id || req.params.listingId;
    const listingId = Array.isArray(rawId) ? rawId[0] : rawId;

    let listing: any = null;

    if (listingId && mongoose.Types.ObjectId.isValid(listingId)) {
      listing = await Listing.findById(listingId).lean();
    }
    if (!listing && listingId) {
      try {
        listing = await Listing.findOne({
          $or: [
            ...(mongoose.Types.ObjectId.isValid(listingId) ? [{ _id: new mongoose.Types.ObjectId(listingId) }] : []),
            { customId: listingId },
            { id: listingId }
          ]
        }).lean();
      } catch {
        // Safe fallback
      }
    }

    // Determine host url for relative links
    const protocol = req.headers["x-forwarded-proto"] || req.protocol || "https";
    const host = req.headers["x-forwarded-host"] || req.headers.host || "omeetso.in";
    const requestBase = `${protocol}://${host}`;
    const clientBase = (requestBase.includes("localhost") || requestBase.includes("127.0.0.1"))
      ? "http://localhost:5173"
      : "https://omeetso.in";

    // Optional query overrides (for instant, reliable dynamic social shares)
    const qTitle = req.query.title ? String(req.query.title).trim() : "";
    const qDesc = req.query.desc ? String(req.query.desc).trim() : "";
    const qImg = req.query.img ? String(req.query.img).trim() : "";
    const qPrice = req.query.price ? String(req.query.price).trim() : "";

    let title = qTitle || "Discover Hyperlocal Products · Omeetso";
    let description = qDesc || "Buy nearby and sell quickly on Omeetso hyperlocal marketplace.";
    let imageUrl = qImg || "https://omeetso.in/iconpng.png";
    let priceFormatted = qPrice || "";
    let priceNumeric = 0;
    let canonicalUrl = `${clientBase}/product/${listingId || ""}`;

    if (listing) {
      const pricePaise = listing.priceInPaise || 0;
      const priceRupees = pricePaise > 0 ? pricePaise / 100 : listing.price || 0;
      priceNumeric = priceRupees;
      priceFormatted = priceRupees > 0 ? `₹${priceRupees.toLocaleString("en-IN")}` : "Free";

      const coverIdx = listing.coverIndex || 0;
      const rawImg = (Array.isArray(listing.images) && listing.images.length > 0)
        ? (listing.images[coverIdx] || listing.images[0])
        : listing.image || listing.coverUrl;

      if (!qImg) {
        imageUrl = resolveAbsoluteUrl(rawImg, requestBase);
      }
      if (!qTitle) {
        title = `${listing.title} · ${priceFormatted} | Omeetso`;
      }
      
      if (!qDesc) {
        const details = [
          `Price: ${priceFormatted}`,
          listing.condition ? `Condition: ${listing.condition}` : null,
          listing.area || listing.city ? `Location: ${[listing.area, listing.city].filter(Boolean).join(", ")}` : null,
          listing.description ? listing.description.replace(/\s+/g, " ").trim() : "Buy nearby on Omeetso"
        ].filter(Boolean).join(" · ");

        description = details.length > 250 ? `${details.slice(0, 247)}...` : details;
      }
    } else if (qTitle || qImg) {
      if (qPrice && !title.includes("₹")) {
        title = `${qTitle} · ₹${qPrice} | Omeetso`;
      }
    } else {
      title = `Listing Details · Omeetso`;
      description = `View verified listing details on Omeetso — Hyperlocal marketplace.`;
    }

    const safeTitle = escapeHtml(title);
    const safeDesc = escapeHtml(description);
    const safeImg = escapeHtml(imageUrl);
    const safeUrl = escapeHtml(canonicalUrl);

    const html = `<!DOCTYPE html>
<html lang="en" prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${safeTitle}</title>
  <meta name="description" content="${safeDesc}" />

  <!-- Critical WhatsApp & Social Media Preview Meta Tags -->
  <meta property="og:site_name" content="Omeetso" />
  <meta property="og:type" content="product" />
  <meta property="og:title" content="${safeTitle}" />
  <meta property="og:description" content="${safeDesc}" />
  <meta property="og:url" content="${safeUrl}" />
  <meta property="og:image" content="${safeImg}" />
  <meta property="og:image:secure_url" content="${safeImg}" />
  <meta property="og:image:alt" content="${safeTitle}" />
  <meta property="og:image:type" content="image/jpeg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  
  <!-- WhatsApp & Search Engine Fallbacks -->
  <link rel="image_src" href="${safeImg}" />
  <meta itemprop="image" content="${safeImg}" />
  <meta itemprop="name" content="${safeTitle}" />
  ${priceNumeric > 0 ? `<meta property="product:price:amount" content="${priceNumeric}" />
  <meta property="product:price:currency" content="INR" />` : ""}

  <!-- Twitter / X -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${safeTitle}" />
  <meta name="twitter:description" content="${safeDesc}" />
  <meta name="twitter:image" content="${safeImg}" />
  <meta name="twitter:image:alt" content="${safeTitle}" />

  <!-- Schema.org JSON-LD for Search Engines -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": "${safeTitle.replace(/"/g, '\\"')}",
    "image": [
      "${safeImg.replace(/"/g, '\\"')}"
    ],
    "description": "${safeDesc.replace(/"/g, '\\"')}",
    "offers": {
      "@type": "Offer",
      "url": "${safeUrl.replace(/"/g, '\\"')}",
      "priceCurrency": "INR",
      "price": "${priceNumeric}",
      "availability": "https://schema.org/InStock",
      "itemCondition": "https://schema.org/UsedCondition"
    }
  }
  </script>

  <!-- Instant Browser Redirect -->
  <meta http-equiv="refresh" content="0;url=${safeUrl}">
  <script>
    if (typeof window !== "undefined") {
      window.location.replace("${safeUrl}");
    }
  </script>

  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #F8FAFC;
      color: #0F172A;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
    }
    .preview-card {
      max-width: 480px;
      width: 100%;
      background: #FFFFFF;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
      border: 1px solid #E2E8F0;
      text-align: center;
    }
    .img-wrapper {
      position: relative;
      width: 100%;
      height: 280px;
      overflow: hidden;
      background: #F1F5F9;
    }
    .preview-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .watermark-badge {
      position: absolute;
      bottom: 12px;
      right: 12px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.25);
      border-radius: 99px;
      padding: 4px 10px;
      color: #FFFFFF;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }
    .content {
      padding: 24px;
    }
    .title {
      font-size: 20px;
      font-weight: 700;
      margin: 0 0 8px 0;
    }
    .price {
      font-size: 24px;
      font-weight: 800;
      color: #2563EB;
      margin: 0 0 12px 0;
    }
    .desc {
      font-size: 14px;
      color: #64748B;
      line-height: 1.5;
      margin: 0 0 20px 0;
    }
    .btn {
      display: inline-block;
      width: 100%;
      background: #2563EB;
      color: #FFFFFF;
      text-decoration: none;
      padding: 14px 20px;
      border-radius: 14px;
      font-weight: 700;
      font-size: 15px;
      box-sizing: border-box;
    }
  </style>
</head>
<body>
  <div class="preview-card">
    <div class="img-wrapper">
      <img src="${safeImg}" alt="${safeTitle}" class="preview-img" />
      <div class="watermark-badge">
        <svg width="18" height="10" viewBox="0 0 160 90" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 80,45 C 60,15 25,15 25,45 C 25,75 60,75 80,45 C 100,15 135,15 135,45 C 135,75 100,75 80,45 Z" stroke="#38BDF8" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M 80,45 C 60,15 25,15 25,45 C 25,75 60,75 80,45 C 100,15 135,15 135,45 C 135,75 100,75 80,45 Z" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <span>Omeetso</span>
      </div>
    </div>
    <div class="content">
      <div class="price">${escapeHtml(priceFormatted)}</div>
      <h1 class="title">${safeTitle}</h1>
      <p class="desc">${safeDesc}</p>
      <a href="${safeUrl}" class="btn">Open Listing in Omeetso</a>
    </div>
  </div>
</body>
</html>`;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=300, s-maxage=600");
    res.status(200).send(html);
  } catch (error: any) {
    console.error("[OG] Error generating product preview:", error);
    res.status(500).send("Error generating link preview");
  }
}

export async function getStoreOpenGraphPreview(req: Request, res: Response): Promise<void> {
  try {
    const rawId = req.params.id || req.params.storeId;
    const storeId = Array.isArray(rawId) ? rawId[0] : rawId;

    let store: any = null;

    if (storeId && mongoose.Types.ObjectId.isValid(storeId)) {
      store = await Store.findById(storeId).lean();
    }
    if (!store && storeId) {
      try {
        store = await Store.findOne({
          $or: [
            ...(mongoose.Types.ObjectId.isValid(storeId) ? [{ _id: new mongoose.Types.ObjectId(storeId) }] : []),
            { slug: storeId },
            { customId: storeId },
            { id: storeId }
          ]
        }).lean();
      } catch {
        // Safe fallback
      }
    }

    const protocol = req.headers["x-forwarded-proto"] || req.protocol || "https";
    const host = req.headers["x-forwarded-host"] || req.headers.host || "omeetso.in";
    const requestBase = `${protocol}://${host}`;
    const clientBase = (requestBase.includes("localhost") || requestBase.includes("127.0.0.1"))
      ? "http://localhost:5173"
      : "https://omeetso.in";

    // Support query overrides for instant reliable social shares (e.g. ?img=..., ?title=..., ?desc=...)
    const qTitle = req.query.title ? String(req.query.title).trim() : (req.query.name ? String(req.query.name).trim() : "");
    const qDesc = req.query.desc ? String(req.query.desc).trim() : (req.query.description ? String(req.query.description).trim() : "");
    const qImg = req.query.img ? String(req.query.img).trim() : (req.query.image ? String(req.query.image).trim() : (req.query.cover ? String(req.query.cover).trim() : ""));
    const qArea = req.query.area ? String(req.query.area).trim() : "";
    const qCity = req.query.city ? String(req.query.city).trim() : "";

    let title = qTitle || "Verified Store Profile · Omeetso";
    let description = qDesc || "Discover verified local businesses and stores near you on Omeetso.";
    let imageUrl = qImg || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=630&fit=crop&q=85";
    
    // Preserve query parameters in canonical redirect URL
    const queryString = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
    const canonicalUrl = `${clientBase}/store/${storeId || ""}${queryString}`;

    if (store) {
      if (!qTitle) {
        title = `${store.name} — Verified Store on Omeetso`;
      }
      if (!qImg) {
        const rawImg = store.cover || store.logo;
        if (rawImg) {
          imageUrl = resolveAbsoluteUrl(rawImg, requestBase);
        }
      }
      if (!qDesc) {
        description = store.description || `Visit ${store.name} in ${[store.area, store.city].filter(Boolean).join(", ") || "Hyderabad"}. Browse verified catalog and offers.`;
      }
    } else if (qTitle) {
      title = `${qTitle} — Verified Store on Omeetso`;
      if (!qDesc && (qArea || qCity)) {
        description = `Visit ${qTitle} in ${[qArea, qCity].filter(Boolean).join(", ")}. Browse verified catalog and offers on Omeetso.`;
      }
    }

    if (qImg) {
      imageUrl = resolveAbsoluteUrl(qImg, requestBase);
    }

    const safeTitle = escapeHtml(title);
    const safeDesc = escapeHtml(description);
    const safeImg = escapeHtml(imageUrl);
    const safeUrl = escapeHtml(canonicalUrl);

    const html = `<!DOCTYPE html>
<html lang="en" prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${safeTitle}</title>
  <meta name="description" content="${safeDesc}" />

  <!-- Critical WhatsApp & Social Media Preview Meta Tags -->
  <meta property="og:site_name" content="Omeetso" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${safeTitle}" />
  <meta property="og:description" content="${safeDesc}" />
  <meta property="og:url" content="${safeUrl}" />
  <meta property="og:image" content="${safeImg}" />
  <meta property="og:image:secure_url" content="${safeImg}" />
  <meta property="og:image:alt" content="${safeTitle}" />
  <meta property="og:image:type" content="image/jpeg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />

  <!-- WhatsApp & Search Engine Fallbacks -->
  <link rel="image_src" href="${safeImg}" />
  <meta itemprop="image" content="${safeImg}" />
  <meta itemprop="name" content="${safeTitle}" />

  <!-- Twitter / X -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${safeTitle}" />
  <meta name="twitter:description" content="${safeDesc}" />
  <meta name="twitter:image" content="${safeImg}" />
  <meta name="twitter:image:alt" content="${safeTitle}" />

  <!-- Schema.org JSON-LD for Search Engines -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org/",
    "@type": "LocalBusiness",
    "name": "${safeTitle.replace(/"/g, '\\"')}",
    "image": [
      "${safeImg.replace(/"/g, '\\"')}"
    ],
    "description": "${safeDesc.replace(/"/g, '\\"')}",
    "url": "${safeUrl.replace(/"/g, '\\"')}"
  }
  </script>

  <!-- Instant Browser Redirect -->
  <meta http-equiv="refresh" content="0;url=${safeUrl}">
  <script>
    if (typeof window !== "undefined") {
      window.location.replace("${safeUrl}");
    }
  </script>

  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #F8FAFC;
      color: #0F172A;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
    }
    .preview-card {
      max-width: 480px;
      width: 100%;
      background: #FFFFFF;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
      border: 1px solid #E2E8F0;
      text-align: center;
    }
    .img-wrapper {
      position: relative;
      width: 100%;
      height: 280px;
      overflow: hidden;
      background: #F1F5F9;
    }
    .preview-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .watermark-badge {
      position: absolute;
      bottom: 12px;
      right: 12px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.25);
      border-radius: 99px;
      padding: 4px 10px;
      color: #FFFFFF;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }
    .content {
      padding: 24px;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: #ECFDF5;
      color: #059669;
      font-size: 12px;
      font-weight: 700;
      padding: 4px 12px;
      border-radius: 99px;
      margin-bottom: 12px;
    }
    .title {
      font-size: 20px;
      font-weight: 700;
      margin: 0 0 8px 0;
    }
    .desc {
      font-size: 14px;
      color: #64748B;
      line-height: 1.5;
      margin: 0 0 20px 0;
    }
    .btn {
      display: inline-block;
      width: 100%;
      background: #2563EB;
      color: #FFFFFF;
      text-decoration: none;
      padding: 14px 20px;
      border-radius: 14px;
      font-weight: 700;
      font-size: 15px;
      box-sizing: border-box;
    }
  </style>
</head>
<body>
  <div class="preview-card">
    <div class="img-wrapper">
      <img src="${safeImg}" alt="${safeTitle}" class="preview-img" />
      <div class="watermark-badge">
        <svg width="18" height="10" viewBox="0 0 160 90" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 80,45 C 60,15 25,15 25,45 C 25,75 60,75 80,45 C 100,15 135,15 135,45 C 135,75 100,75 80,45 Z" stroke="#38BDF8" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M 80,45 C 60,15 25,15 25,45 C 25,75 60,75 80,45 C 100,15 135,15 135,45 C 135,75 100,75 80,45 Z" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <span>Omeetso</span>
      </div>
    </div>
    <div class="content">
      <div class="badge">✓ Verified Store</div>
      <h1 class="title">${safeTitle}</h1>
      <p class="desc">${safeDesc}</p>
      <a href="${safeUrl}" class="btn">Open Store in Omeetso</a>
    </div>
  </div>
</body>
</html>`;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=300, s-maxage=600");
    res.status(200).send(html);
  } catch (error: any) {
    console.error("[OG] Error generating store preview:", error);
    res.status(500).send("Error generating link preview");
  }
}

export async function getBlogOpenGraphPreview(req: Request, res: Response): Promise<void> {
  try {
    const rawSlug = req.params.slug || req.params.id;
    const blogSlug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;

    let blog: any = null;

    if (blogSlug) {
      const cleanSlug = String(blogSlug).trim().toLowerCase();
      blog = await Blog.findOne({
        $or: [
          { slug: cleanSlug },
          ...(mongoose.Types.ObjectId.isValid(blogSlug) ? [{ _id: new mongoose.Types.ObjectId(blogSlug) }] : [])
        ]
      }).lean();
    }

    const protocol = req.headers["x-forwarded-proto"] || req.protocol || "https";
    const host = req.headers["x-forwarded-host"] || req.headers.host || "omeetso.in";
    const requestBase = `${protocol}://${host}`;
    const clientBase = (requestBase.includes("localhost") || requestBase.includes("127.0.0.1"))
      ? "http://localhost:5173"
      : "https://omeetso.in";

    const qTitle = req.query.title ? String(req.query.title).trim() : "";
    const qDesc = req.query.desc ? String(req.query.desc).trim() : "";
    const qImg = req.query.img ? String(req.query.img).trim() : "";

    let title = qTitle || "Blogs & Marketplace Guides · Omeetso";
    let description = qDesc || "Actionable buyer checklists, selling tips, and verified neighborhood shopping insights.";
    let imageUrl = qImg || "https://omeetso.in/iconpng.png";
    let canonicalUrl = `${clientBase}/blog/${blogSlug || ""}`;

    if (blog) {
      if (!qTitle) {
        title = `${blog.title} · Omeetso Guides`;
      }
      if (!qDesc) {
        description = blog.excerpt || (blog.content ? blog.content.slice(0, 200).replace(/\s+/g, " ").trim() : "Read the full guide on Omeetso.");
      }
      if (!qImg) {
        if (blog.coverImage) {
          imageUrl = resolveAbsoluteUrl(blog.coverImage, requestBase);
        } else if (Array.isArray(blog.galleryImages) && blog.galleryImages.length > 0) {
          imageUrl = resolveAbsoluteUrl(blog.galleryImages[0], requestBase);
        }
      }
      canonicalUrl = `${clientBase}/blog/${blog.slug}`;
    }

    if (qImg) {
      imageUrl = resolveAbsoluteUrl(qImg, requestBase);
    }

    const safeTitle = escapeHtml(title);
    const safeDesc = escapeHtml(description);
    const safeImg = escapeHtml(imageUrl);
    const safeUrl = escapeHtml(canonicalUrl);

    const html = `<!DOCTYPE html>
<html lang="en" prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${safeTitle}</title>
  <meta name="description" content="${safeDesc}" />

  <!-- Critical WhatsApp & Social Media Preview Meta Tags -->
  <meta property="og:site_name" content="Omeetso" />
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${safeTitle}" />
  <meta property="og:description" content="${safeDesc}" />
  <meta property="og:url" content="${safeUrl}" />
  <meta property="og:image" content="${safeImg}" />
  <meta property="og:image:secure_url" content="${safeImg}" />
  <meta property="og:image:alt" content="${safeTitle}" />
  <meta property="og:image:type" content="image/jpeg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />

  <!-- WhatsApp & Search Engine Fallbacks -->
  <link rel="image_src" href="${safeImg}" />
  <meta itemprop="image" content="${safeImg}" />
  <meta itemprop="name" content="${safeTitle}" />

  <!-- Twitter / X -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${safeTitle}" />
  <meta name="twitter:description" content="${safeDesc}" />
  <meta name="twitter:image" content="${safeImg}" />
  <meta name="twitter:image:alt" content="${safeTitle}" />

  <!-- Instant Browser Redirect -->
  <meta http-equiv="refresh" content="0;url=${safeUrl}">
  <script>
    if (typeof window !== "undefined") {
      window.location.replace("${safeUrl}");
    }
  </script>

  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #F8FAFC;
      color: #0F172A;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
    }
    .preview-card {
      max-width: 480px;
      width: 100%;
      background: #FFFFFF;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
      border: 1px solid #E2E8F0;
      text-align: center;
    }
    .img-wrapper {
      position: relative;
      width: 100%;
      height: 260px;
      overflow: hidden;
      background: #0F172A;
    }
    .preview-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .content {
      padding: 24px;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: #EEF2FF;
      color: #4F46E5;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 4px 12px;
      border-radius: 99px;
      margin-bottom: 12px;
    }
    .title {
      font-size: 20px;
      font-weight: 700;
      margin: 0 0 8px 0;
      line-height: 1.3;
    }
    .desc {
      font-size: 14px;
      color: #64748B;
      line-height: 1.5;
      margin: 0 0 20px 0;
    }
    .btn {
      display: inline-block;
      width: 100%;
      background: #4F46E5;
      color: #FFFFFF;
      text-decoration: none;
      padding: 14px 20px;
      border-radius: 14px;
      font-weight: 700;
      font-size: 15px;
      box-sizing: border-box;
    }
  </style>
</head>
<body>
  <div class="preview-card">
    <div class="img-wrapper">
      <img src="${safeImg}" alt="${safeTitle}" class="preview-img" />
    </div>
    <div class="content">
      <div class="badge">📖 Omeetso Guide</div>
      <h1 class="title">${safeTitle}</h1>
      <p class="desc">${safeDesc}</p>
      <a href="${safeUrl}" class="btn">Read Guide on Omeetso</a>
    </div>
  </div>
</body>
</html>`;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=300, s-maxage=600");
    res.status(200).send(html);
  } catch (error: any) {
    console.error("[OG] Error generating blog preview:", error);
    res.status(500).send("Error generating link preview");
  }
}

export async function getBlogsIndexOpenGraphPreview(req: Request, res: Response): Promise<void> {
  try {
    const protocol = req.headers["x-forwarded-proto"] || req.protocol || "https";
    const host = req.headers["x-forwarded-host"] || req.headers.host || "omeetso.in";
    const requestBase = `${protocol}://${host}`;
    const clientBase = (requestBase.includes("localhost") || requestBase.includes("127.0.0.1"))
      ? "http://localhost:5173"
      : "https://omeetso.in";

    const title = "Blogs & Marketplace Guides · Omeetso";
    const description = "Actionable buyer checklists, selling tips, fraud prevention advisories, and local resale guides.";
    const imageUrl = "https://omeetso.in/iconpng.png";
    const canonicalUrl = `${clientBase}/blogs`;

    const safeTitle = escapeHtml(title);
    const safeDesc = escapeHtml(description);
    const safeImg = escapeHtml(imageUrl);
    const safeUrl = escapeHtml(canonicalUrl);

    const html = `<!DOCTYPE html>
<html lang="en" prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${safeTitle}</title>
  <meta name="description" content="${safeDesc}" />

  <!-- Critical WhatsApp & Social Media Preview Meta Tags -->
  <meta property="og:site_name" content="Omeetso" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${safeTitle}" />
  <meta property="og:description" content="${safeDesc}" />
  <meta property="og:url" content="${safeUrl}" />
  <meta property="og:image" content="${safeImg}" />
  <meta property="og:image:secure_url" content="${safeImg}" />
  <meta property="og:image:alt" content="${safeTitle}" />
  <meta property="og:image:type" content="image/png" />
  <meta property="og:image:width" content="512" />
  <meta property="og:image:height" content="512" />

  <!-- WhatsApp & Search Engine Fallbacks -->
  <link rel="image_src" href="${safeImg}" />
  <meta itemprop="image" content="${safeImg}" />
  <meta itemprop="name" content="${safeTitle}" />

  <!-- Twitter / X -->
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="${safeTitle}" />
  <meta name="twitter:description" content="${safeDesc}" />
  <meta name="twitter:image" content="${safeImg}" />
  <meta name="twitter:image:alt" content="${safeTitle}" />

  <!-- Instant Browser Redirect -->
  <meta http-equiv="refresh" content="0;url=${safeUrl}">
  <script>
    if (typeof window !== "undefined") {
      window.location.replace("${safeUrl}");
    }
  </script>
</head>
<body>
  <p>Redirecting to <a href="${safeUrl}">Omeetso Blogs & Guides</a>...</p>
</body>
</html>`;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=300, s-maxage=600");
    res.status(200).send(html);
  } catch (error: any) {
    console.error("[OG] Error generating blogs index preview:", error);
    res.status(500).send("Error generating link preview");
  }
}

