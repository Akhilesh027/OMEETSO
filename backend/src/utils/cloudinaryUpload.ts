import dotenv from "dotenv";
import cloudinary from "cloudinary";
import { env } from "../config/env";

const DEFAULT_CLOUD_NAME = "dguxtvyut";
const DEFAULT_API_KEY = "149877994129462";
const DEFAULT_API_SECRET = "02ZM8swD8dS1mXUKK7NyJrj-a_g";

let isConfigured = false;

function ensureCloudinaryConfig(): boolean {
  if (!isConfigured) {
    try { dotenv.config(); } catch {}
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUD_NAME || env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY || env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET || env.CLOUDINARY_API_SECRET;

    const finalCloudName = (cloudName && cloudName !== "mock_cloud_name") ? cloudName : DEFAULT_CLOUD_NAME;
    const finalApiKey = (apiKey && apiKey !== "mock_api_key") ? apiKey : DEFAULT_API_KEY;
    const finalApiSecret = (apiSecret && apiSecret !== "mock_api_secret") ? apiSecret : DEFAULT_API_SECRET;

    cloudinary.v2.config({
      cloud_name: finalCloudName,
      api_key: finalApiKey,
      api_secret: finalApiSecret
    });
    isConfigured = true;
    console.log(`[Cloudinary] Initialized with cloud: ${finalCloudName}`);
  }
  return isConfigured;
}

/**
 * Upload a single base64 image or video to Cloudinary.
 * Returns the Cloudinary secure_url, or the original string if upload fails or already a URL.
 */
export async function uploadToCloudinary(
  media: string,
  folder = "omeetso/listings",
  resourceType: "auto" | "image" | "video" = "auto"
): Promise<string> {
  if (!media || typeof media !== "string") {
    return media || "";
  }

  // Already a hosted URL — no upload needed
  if (media.startsWith("http://") || media.startsWith("https://")) {
    return media;
  }

  // Not a base64 data URI
  if (!media.startsWith("data:")) {
    return media;
  }

  // Auto-detect video from data URI mime type
  if (resourceType === "auto" && media.startsWith("data:video/")) {
    resourceType = "video";
  }

  // Cloudinary credentials check
  if (!ensureCloudinaryConfig()) {
    console.warn("[Cloudinary] Credentials not configured, storing original media");
    return media;
  }

  try {
    const result = await cloudinary.v2.uploader.upload(media, {
      folder,
      resource_type: resourceType,
      quality: "auto:eco",
      fetch_format: "auto",
      timeout: resourceType === "video" ? 30000 : 8000
    });
    return result.secure_url;
  } catch (err: any) {
    console.warn(`[Cloudinary] Upload failed: ${err?.message}`);
    return media; // Fallback to original
  }
}

/**
 * Upload a single base64 image to Cloudinary.
 */
export async function uploadBase64ToCloudinary(base64: string, folder = "omeetso/listings"): Promise<string> {
  return uploadToCloudinary(base64, folder, "image");
}

/**
 * Upload a single base64 video to Cloudinary.
 */
export async function uploadVideoToCloudinary(video: string, folder = "omeetso/listing_videos"): Promise<string> {
  return uploadToCloudinary(video, folder, "video");
}

/**
 * Convert an array of images (mix of base64 and URLs) to all Cloudinary URLs in parallel.
 * Fast-paths already hosted URLs instantly with zero network overhead.
 */
export async function convertImagesToCloudinary(images: string[], folder = "omeetso/listings"): Promise<string[]> {
  if (!Array.isArray(images) || images.length === 0) return images || [];

  const allUrls = images.every((img) => typeof img === "string" && (img.startsWith("http://") || img.startsWith("https://")));
  if (allUrls) {
    return images;
  }

  const results = await Promise.allSettled(
    images.map((img) => uploadToCloudinary(img, folder, "auto"))
  );

  return results.map((r, i) => (r.status === "fulfilled" ? r.value : images[i]));
}

/**
 * Convert a video (base64 or URL) to a Cloudinary URL.
 */
export async function convertVideoToCloudinary(video?: string, folder = "omeetso/listing_videos"): Promise<string> {
  if (!video) return "";
  if (video.startsWith("http://") || video.startsWith("https://")) return video;
  return uploadToCloudinary(video, folder, "video");
}
