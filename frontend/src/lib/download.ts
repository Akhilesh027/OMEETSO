import { toast } from "sonner";

/**
 * Robust document/file downloader that handles Data URLs (Base64), Blob URLs,
 * and remote URLs (Cloudinary/S3/Backend) with proper MIME types, extensions, and headers.
 */
export async function downloadDocument(url: string, rawFileName?: string): Promise<void> {
  if (!url) {
    toast.error("Resume file URL is missing");
    return;
  }

  // 1. Sanitize filename and determine appropriate extension
  let fileName = (rawFileName || "Candidate_Resume.pdf").trim().replace(/[/\\?%*:|"<>]/g, "_");
  const extMatch = fileName.match(/\.(pdf|doc|docx|png|jpg|jpeg|webp|txt)$/i);

  if (!extMatch) {
    if (url.includes("application/pdf") || url.toLowerCase().includes(".pdf")) {
      fileName += ".pdf";
    } else if (url.includes("image/png") || url.toLowerCase().includes(".png")) {
      fileName += ".png";
    } else if (url.includes("image/jpeg") || url.toLowerCase().includes(".jpg") || url.toLowerCase().includes(".jpeg")) {
      fileName += ".jpg";
    } else if (url.includes("vnd.openxmlformats") || url.toLowerCase().includes(".docx")) {
      fileName += ".docx";
    } else if (url.includes("msword") || url.toLowerCase().includes(".doc")) {
      fileName += ".doc";
    } else {
      fileName += ".pdf";
    }
  }

  // Determine standard MIME type
  let expectedMime = "application/pdf";
  if (fileName.toLowerCase().endsWith(".pdf")) expectedMime = "application/pdf";
  else if (fileName.toLowerCase().endsWith(".docx")) expectedMime = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  else if (fileName.toLowerCase().endsWith(".doc")) expectedMime = "application/msword";
  else if (fileName.toLowerCase().endsWith(".png")) expectedMime = "image/png";
  else if (fileName.toLowerCase().endsWith(".jpg") || fileName.toLowerCase().endsWith(".jpeg")) expectedMime = "image/jpeg";

  const triggerDownloadFromBlob = (blob: Blob, name: string) => {
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = name;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
  };

  // 2. If Base64 Data URL -> Convert to Blob with exact MIME type
  if (url.startsWith("data:")) {
    try {
      const parts = url.split(";base64,");
      const mimeFromDataUrl = parts[0]?.replace("data:", "") || expectedMime;
      const finalMime = mimeFromDataUrl && mimeFromDataUrl !== "application/octet-stream" ? mimeFromDataUrl : expectedMime;
      
      const rawB64 = (parts[1] || "").replace(/[^A-Za-z0-9+/=]/g, "");
      const byteCharacters = window.atob(rawB64);
      const byteLength = byteCharacters.length;
      const byteArray = new Uint8Array(byteLength);
      for (let i = 0; i < byteLength; i++) {
        byteArray[i] = byteCharacters.charCodeAt(i);
      }
      const blob = new Blob([byteArray], { type: finalMime });
      triggerDownloadFromBlob(blob, fileName);
      toast.success(`Downloaded "${fileName}"`);
      return;
    } catch (e) {
      console.warn("Data URL binary conversion warning, falling back to direct anchor:", e);
    }
  }

  // 3. If Blob URL (blob:http...) -> Fetch blob and trigger download
  if (url.startsWith("blob:")) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const rawBlob = await res.blob();
        const typedBlob = new Blob([rawBlob], { type: rawBlob.type || expectedMime });
        triggerDownloadFromBlob(typedBlob, fileName);
        toast.success(`Downloaded "${fileName}"`);
        return;
      }
    } catch (e) {
      console.warn("Blob URL fetch error:", e);
    }
  }

  // 4. If Remote HTTP/HTTPS URL -> Fetch as blob to bypass cross-origin browser restrictions
  if (url.startsWith("http://") || url.startsWith("https://")) {
    try {
      const response = await fetch(url, { mode: "cors" });
      if (response.ok) {
        const rawBlob = await response.blob();
        const mimeType = rawBlob.type && rawBlob.type !== "application/octet-stream" ? rawBlob.type : expectedMime;
        const typedBlob = new Blob([rawBlob], { type: mimeType });
        triggerDownloadFromBlob(typedBlob, fileName);
        toast.success(`Downloaded "${fileName}"`);
        return;
      }
    } catch (err) {
      console.warn("Cross-origin fetch failed, attempting Cloudinary direct attachment fallback:", err);
    }

    // 4b. Cloudinary specific attachment flag handling (forces server attachment headers)
    if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
      const nameWithoutExt = fileName.replace(/\.[^.]+$/, "");
      const attachmentUrl = url.replace(
        /\/upload\/(?:fl_attachment[^/]*\/)?/,
        `/upload/fl_attachment:${encodeURIComponent(nameWithoutExt)}/`
      );
      const link = document.createElement("a");
      link.href = attachmentUrl;
      link.download = fileName;
      link.target = "_blank";
      link.rel = "noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Downloading "${fileName}"`);
      return;
    }
  }

  // 5. Final Direct Anchor Trigger Fallback
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.target = "_blank";
  link.rel = "noreferrer";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  toast.success(`Downloading "${fileName}"`);
}

