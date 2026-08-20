import { getUserAccessToken } from "@/api/auth.api";

export async function uploadImageToCloudinary(fileOrBase64: File | string, purpose = "listings"): Promise<string> {
  // If already a hosted HTTP/HTTPS URL, no upload needed
  if (typeof fileOrBase64 === "string" && (fileOrBase64.startsWith("http://") || fileOrBase64.startsWith("https://"))) {
    return fileOrBase64;
  }

  let base64String = "";
  if (typeof fileOrBase64 === "string") {
    base64String = fileOrBase64;
  } else {
    base64String = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(fileOrBase64);
    });
  }

  const token = typeof window !== "undefined" ? (getUserAccessToken() || localStorage.getItem("omeetso_user_token")) : null;
  try {
    const res = await fetch("https://api.omeetso.in/api/v1/uploads/direct", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ image: base64String, purpose })
    });
    const json = await res.json();
    if (json.success && json.data?.url) {
      return json.data.url;
    }
  } catch (err) {
    console.warn("Cloudinary upload fallback:", err);
  }

  return base64String;
}

export const uploadFile = uploadImageToCloudinary;
export default uploadImageToCloudinary;
