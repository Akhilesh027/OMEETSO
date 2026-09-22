import { getUserAccessToken } from "@/api/auth.api";
import { API_BASE } from "@/config/api";

// In-memory upload promise cache to prevent redundant uploads and allow seamless background uploading
const uploadPromiseCache = new Map<string, Promise<string>>();

/**
 * Fast client-side canvas compression to reduce multi-MB photos down to ~100-200KB before upload,
 * radically speeding up listing publishing and network transfer.
 */
export async function compressImageForUpload(dataUrlOrFile: string | File, maxDim = 1280, quality = 0.82): Promise<string> {
  return new Promise<string>((resolve) => {
    try {
      if (typeof window === "undefined") {
        return resolve(typeof dataUrlOrFile === "string" ? dataUrlOrFile : "");
      }

      // If already a remote URL, no compression needed
      if (typeof dataUrlOrFile === "string" && (dataUrlOrFile.startsWith("http://") || dataUrlOrFile.startsWith("https://"))) {
        return resolve(dataUrlOrFile);
      }

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) return resolve(typeof dataUrlOrFile === "string" ? dataUrlOrFile : "");
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL("image/jpeg", quality);
          resolve(compressed);
        } catch {
          resolve(typeof dataUrlOrFile === "string" ? dataUrlOrFile : "");
        }
      };
      img.onerror = () => resolve(typeof dataUrlOrFile === "string" ? dataUrlOrFile : "");

      if (typeof dataUrlOrFile === "string") {
        img.src = dataUrlOrFile;
      } else {
        const reader = new FileReader();
        reader.onload = () => { img.src = String(reader.result); };
        reader.onerror = () => resolve("");
        reader.readAsDataURL(dataUrlOrFile);
      }
    } catch {
      resolve(typeof dataUrlOrFile === "string" ? dataUrlOrFile : "");
    }
  });
}

export async function uploadImageToCloudinary(fileOrBase64: File | string, purpose = "listings"): Promise<string> {
  // If already a hosted HTTP/HTTPS URL, no upload needed
  if (typeof fileOrBase64 === "string" && (fileOrBase64.startsWith("http://") || fileOrBase64.startsWith("https://"))) {
    return fileOrBase64;
  }

  // Check upload cache if string identifier exists
  const cacheKey = typeof fileOrBase64 === "string" ? fileOrBase64.slice(0, 200) + fileOrBase64.length : null;
  if (cacheKey && uploadPromiseCache.has(cacheKey)) {
    return uploadPromiseCache.get(cacheKey)!;
  }

  const uploadTask = (async () => {
    // Fast client-side compression before network transmission
    const compressedBase64 = await compressImageForUpload(fileOrBase64, 1280, 0.82);
    const base64String = compressedBase64 || (typeof fileOrBase64 === "string" ? fileOrBase64 : "");

    if (!base64String) return "";
    if (base64String.startsWith("http://") || base64String.startsWith("https://")) {
      return base64String;
    }

    const token = typeof window !== "undefined" ? (getUserAccessToken() || localStorage.getItem("omeetso_user_token")) : null;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // 10s max timeout per image

      const res = await fetch(`${API_BASE}/uploads/direct`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        signal: controller.signal,
        body: JSON.stringify({ image: base64String, purpose })
      });
      clearTimeout(timeout);
      const json = await res.json();
      if (json.success && json.data?.url) {
        return json.data.url;
      }
    } catch (err) {
      console.warn("Cloudinary upload fallback:", err);
    }

    return base64String;
  })();

  if (cacheKey) {
    uploadPromiseCache.set(cacheKey, uploadTask);
  }

  return uploadTask;
}

export async function uploadVideoToCloudinary(fileOrBase64: File | string, purpose = "listing_videos"): Promise<string> {
  if (!fileOrBase64) return "";
  if (typeof fileOrBase64 === "string" && (fileOrBase64.startsWith("http://") || fileOrBase64.startsWith("https://"))) {
    return fileOrBase64;
  }

  let base64String = "";
  if (typeof fileOrBase64 === "string") {
    base64String = fileOrBase64;
  } else {
    base64String = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => resolve("");
      reader.readAsDataURL(fileOrBase64);
    });
  }

  if (!base64String) return "";

  const token = typeof window !== "undefined" ? (getUserAccessToken() || localStorage.getItem("omeetso_user_token")) : null;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000); // 20s timeout for video

    const res = await fetch(`${API_BASE}/uploads/direct`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      signal: controller.signal,
      body: JSON.stringify({ video: base64String, purpose })
    });
    clearTimeout(timeout);
    const json = await res.json();
    if (json.success && json.data?.url) {
      return json.data.url;
    }
  } catch (err) {
    console.warn("Cloudinary video upload fallback:", err);
  }

  return base64String;
}

/**
 * Uploads a document (PDF, DOCX, DOC) directly as a pristine Data URI
 * without routing through Cloudinary, ensuring 100% binary integrity and exact file formatting.
 */
export async function uploadDocumentFile(fileOrBase64: File | string, _purpose = "resumes"): Promise<string> {
  if (!fileOrBase64) return "";
  
  if (typeof fileOrBase64 === "string") {
    return fileOrBase64;
  }

  // Convert File to full Data URI with explicit MIME type
  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      let result = String(reader.result || "");
      // Ensure proper MIME prefix if file has type
      if (fileOrBase64.type && !result.startsWith(`data:${fileOrBase64.type}`)) {
        const parts = result.split(";base64,");
        if (parts.length === 2) {
          result = `data:${fileOrBase64.type};base64,${parts[1]}`;
        }
      }
      resolve(result);
    };
    reader.onerror = () => resolve("");
    reader.readAsDataURL(fileOrBase64);
  });
}

export const uploadMedia = async (mediaOrUrl: string | File, purpose = "listings"): Promise<string> => {
  if (!mediaOrUrl) return "";
  const isVideo = typeof mediaOrUrl === "string" 
    ? (mediaOrUrl.startsWith("data:video/") || mediaOrUrl.endsWith(".mp4") || mediaOrUrl.endsWith(".webm") || mediaOrUrl.endsWith(".mov"))
    : (mediaOrUrl.type?.startsWith("video/"));

  if (isVideo) {
    return uploadVideoToCloudinary(mediaOrUrl, `${purpose}_videos`);
  }

  const isDoc = typeof mediaOrUrl === "string"
    ? (mediaOrUrl.startsWith("data:application/") || mediaOrUrl.endsWith(".pdf") || mediaOrUrl.endsWith(".docx") || mediaOrUrl.endsWith(".doc"))
    : (mediaOrUrl.type?.includes("pdf") || mediaOrUrl.type?.includes("word") || mediaOrUrl.name?.match(/\.(pdf|doc|docx)$/i));

  if (isDoc || purpose?.includes("resume") || purpose?.includes("doc")) {
    return uploadDocumentFile(mediaOrUrl, purpose);
  }

  return uploadImageToCloudinary(mediaOrUrl, purpose);
};

export const uploadFile = async (fileOrUrl: string | File, purpose = "listings"): Promise<string> => {
  const isDoc = typeof fileOrUrl === "string"
    ? (fileOrUrl.startsWith("data:application/") || fileOrUrl.endsWith(".pdf") || fileOrUrl.endsWith(".docx") || fileOrUrl.endsWith(".doc"))
    : (fileOrUrl.type?.includes("pdf") || fileOrUrl.type?.includes("word") || fileOrUrl.name?.match(/\.(pdf|doc|docx)$/i));

  if (isDoc || purpose?.includes("resume") || purpose?.includes("doc")) {
    return uploadDocumentFile(fileOrUrl, purpose);
  }

  return uploadImageToCloudinary(fileOrUrl, purpose);
};

export default uploadFile;
