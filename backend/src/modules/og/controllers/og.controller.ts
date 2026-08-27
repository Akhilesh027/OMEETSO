import { Request, Response } from "express";
import mongoose from "mongoose";
import { Listing } from "../../listings/models/Listing";
import { Store } from "../../stores/models/Store";
import { env } from "../../../config/env";

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
    return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&h=630&fit=crop&q=85";
  }
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  const base = defaultBase || env.CLIENT_USER_URL.replace(/\/$/, "");
  return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
}

export async function getProductOpenGraphPreview(req: Request, res: Response): Promise<void> {
  try {
    const rawId = req.params.id || req.params.listingId;
    const listingId = Array.isArray(rawId) ? rawId[0] : rawId;

    let listing: any = null;

    if (listingId && mongoose.Types.ObjectId.isValid(listingId)) {
      listing = await Listing.findById(listingId).lean();
    }
    if (!listing && listingId) {
      listing = await Listing.findOne({ _id: listingId as any }).lean();
    }

    // Determine host url for relative links
    const protocol = req.headers["x-forwarded-proto"] || req.protocol || "https";
    const host = req.headers["x-forwarded-host"] || req.headers.host || "omeetso.in";
    const requestBase = `${protocol}://${host}`;
    const clientBase = (env.CLIENT_USER_URL && !env.CLIENT_USER_URL.includes("localhost"))
      ? env.CLIENT_USER_URL.replace(/\/$/, "")
      : (requestBase.includes("localhost") ? env.CLIENT_USER_URL : "https://omeetso.in");

    let title = "Discover Hyperlocal Products · Omeetso";
    let description = "Buy nearby and sell quickly on Omeetso hyperlocal marketplace.";
    let imageUrl = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&h=630&fit=crop&q=85";
    let priceFormatted = "";
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

      imageUrl = resolveAbsoluteUrl(rawImg, requestBase);
      title = `${listing.title} · ${priceFormatted} | Omeetso`;
      
      const details = [
        `Price: ${priceFormatted}`,
        listing.condition ? `Condition: ${listing.condition}` : null,
        listing.area || listing.city ? `Location: ${[listing.area, listing.city].filter(Boolean).join(", ")}` : null,
        listing.description ? listing.description.replace(/\s+/g, " ").trim() : "Buy nearby on Omeetso"
      ].filter(Boolean).join(" · ");

      description = details.length > 250 ? `${details.slice(0, 247)}...` : details;
    } else {
      title = `Listing Details · Omeetso`;
      description = `View verified listing details on Omeetso — Hyperlocal marketplace.`;
    }

    const safeTitle = escapeHtml(title);
    const safeDesc = escapeHtml(description);
    const safeImg = escapeHtml(imageUrl);
    const safeUrl = escapeHtml(canonicalUrl);

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${safeTitle}</title>
  <meta name="description" content="${safeDesc}" />

  <!-- Open Graph / Facebook / WhatsApp / Telegram / Discord -->
  <meta property="og:type" content="product" />
  <meta property="og:site_name" content="Omeetso" />
  <meta property="og:title" content="${safeTitle}" />
  <meta property="og:description" content="${safeDesc}" />
  <meta property="og:url" content="${safeUrl}" />
  <meta property="og:image" content="${safeImg}" />
  <meta property="og:image:secure_url" content="${safeImg}" />
  <meta property="og:image:alt" content="${safeTitle}" />
  <meta property="og:image:type" content="image/jpeg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
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
      store = await Store.findOne({ _id: storeId as any }).lean();
    }

    const protocol = req.headers["x-forwarded-proto"] || req.protocol || "https";
    const host = req.headers["x-forwarded-host"] || req.headers.host || "omeetso.in";
    const requestBase = `${protocol}://${host}`;
    const clientBase = (env.CLIENT_USER_URL && !env.CLIENT_USER_URL.includes("localhost"))
      ? env.CLIENT_USER_URL.replace(/\/$/, "")
      : (requestBase.includes("localhost") ? env.CLIENT_USER_URL : "https://omeetso.in");

    let title = "Verified Store Profile · Omeetso";
    let description = "Discover verified local businesses and stores near you on Omeetso.";
    let imageUrl = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=630&fit=crop&q=85";
    let canonicalUrl = `${clientBase}/store/${storeId || ""}`;

    if (store) {
      title = `${store.name} — Verified Store on Omeetso`;
      const rawImg = store.cover || store.logo;
      imageUrl = resolveAbsoluteUrl(rawImg, requestBase);
      description = store.description || `Visit ${store.name} in ${store.area || store.city || "Hyderabad"}. Browse verified catalog and offers.`;
    }

    const safeTitle = escapeHtml(title);
    const safeDesc = escapeHtml(description);
    const safeImg = escapeHtml(imageUrl);
    const safeUrl = escapeHtml(canonicalUrl);

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${safeTitle}</title>
  <meta name="description" content="${safeDesc}" />

  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Omeetso" />
  <meta property="og:title" content="${safeTitle}" />
  <meta property="og:description" content="${safeDesc}" />
  <meta property="og:url" content="${safeUrl}" />
  <meta property="og:image" content="${safeImg}" />
  <meta property="og:image:secure_url" content="${safeImg}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${safeTitle}" />
  <meta name="twitter:description" content="${safeDesc}" />
  <meta name="twitter:image" content="${safeImg}" />

  <meta http-equiv="refresh" content="0;url=${safeUrl}">
  <script>
    if (typeof window !== "undefined") {
      window.location.replace("${safeUrl}");
    }
  </script>
</head>
<body>
  <p>Redirecting to <a href="${safeUrl}">${safeTitle}</a>...</p>
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
