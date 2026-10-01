import { AdminAuthService } from "@/services/adminAuthService";
import { CategoryData } from "@/pages/categories/CategoriesPage";
import { BACKEND_URL } from "@/config/api";

const API_BASE = `${BACKEND_URL}/api/v1/categories`;
const UPLOADS_API = `${BACKEND_URL}/api/v1/uploads/direct`;

function getHeaders(): Record<string, string> {
  const token = AdminAuthService.getAccessToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export interface FetchCategoriesResponse {
  success: boolean;
  data?: CategoryData[];
  error?: string;
}

export interface CategoryMutationResponse {
  success: boolean;
  message?: string;
  data?: CategoryData;
  error?: string;
}

export async function fetchCategoriesFromDbApi(): Promise<FetchCategoriesResponse> {
  try {
    const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    const timeoutId = controller ? setTimeout(() => controller.abort(), 4000) : null;

    const res = await fetch(`${API_BASE}?all=true`, {
      headers: getHeaders(),
      signal: controller?.signal
    }).finally(() => {
      if (timeoutId) clearTimeout(timeoutId);
    });

    if (!res.ok) {
      return {
        success: false,
        error: `Server responded with status ${res.status}`
      };
    }

    const json = await res.json();
    if (!json.success || !Array.isArray(json.data)) {
      return {
        success: false,
        error: json.error?.message || "Failed to fetch categories from database"
      };
    }

    return {
      success: true,
      data: json.data
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.name === "AbortError" ? "Request timed out" : error.message || "Network error"
    };
  }
}

export async function seedCategoriesApi(): Promise<{ success: boolean; message?: string; count?: number; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/seed`, {
      method: "POST",
      headers: getHeaders()
    });

    if (!res.ok) throw new Error("Could not reach backend API");
    const json = await res.json();
    return json;
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to trigger category seeding" };
  }
}

export async function createCategoryApi(categoryData: Partial<CategoryData>): Promise<CategoryMutationResponse> {
  try {
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(categoryData)
    });

    if (!res.ok) {
      return {
        success: false,
        error: "Network error: Unable to connect to backend API"
      };
    }

    const json = await res.json();
    if (!res.ok || !json.success) {
      return {
        success: false,
        error: json.error?.message || "Failed to create category"
      };
    }

    // Also sync to local storage if running in browser
    if (typeof window !== "undefined" && json.data) {
      try {
        const cat = json.data;
        const liveCat = {
          id: cat.categoryId || cat.id,
          name: cat.name,
          icon: cat.iconName || "Layers",
          count: 0,
          tint: "bg-indigo-500/10 text-indigo-600",
          subcategories: cat.subcategories || ["General", "Other"]
        };
        const raw = localStorage.getItem("omeetso_custom_categories");
        const current = raw ? JSON.parse(raw) : [];
        const filtered = current.filter((c: any) => (c.id || "").toLowerCase() !== liveCat.id.toLowerCase());
        filtered.unshift(liveCat);
        localStorage.setItem("omeetso_custom_categories", JSON.stringify(filtered));
        window.dispatchEvent(new CustomEvent("omeetso_categories_changed", { detail: liveCat }));
      } catch { }
    }

    return {
      success: true,
      message: json.message || "Category created successfully",
      data: json.data
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Network error: Unable to create category"
    };
  }
}

export async function updateCategoryApi(categoryId: string, categoryData: Partial<CategoryData>): Promise<CategoryMutationResponse> {
  try {
    const res = await fetch(`${API_BASE}/${categoryId}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(categoryData)
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      return {
        success: false,
        error: json.error?.message || "Failed to update category"
      };
    }

    return {
      success: true,
      message: json.message || "Category updated successfully",
      data: json.data
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Network error: Unable to update category"
    };
  }
}

export async function deleteCategoryApi(categoryId: string, permanent: boolean = false): Promise<CategoryMutationResponse> {
  try {
    const res = await fetch(`${API_BASE}/${categoryId}?permanent=${permanent}`, {
      method: "DELETE",
      headers: getHeaders()
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      return {
        success: false,
        error: json.error?.message || "Failed to delete category"
      };
    }

    return {
      success: true,
      message: json.message || "Category deleted successfully"
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Network error: Unable to delete category"
    };
  }
}

export async function uploadBlogImageApi(
  fileOrBase64: File | string,
  purpose: string = "blogs"
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    let base64 = "";
    if (typeof fileOrBase64 === "string") {
      base64 = fileOrBase64;
    } else {
      base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve((e.target?.result as string) || "");
        reader.onerror = () => reject(new Error("Failed to read image file"));
        reader.readAsDataURL(fileOrBase64);
      });
    }

    if (!base64) {
      return { success: false, error: "Empty image payload" };
    }

    // Already hosted on Cloudinary
    if (base64.includes("res.cloudinary.com") || base64.includes("cloudinary.com")) {
      return { success: true, url: base64 };
    }

    const token = AdminAuthService.getAccessToken();
    const endpoint = `${BACKEND_URL}/api/v1/admin/blogs/upload-image`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ image: base64, purpose })
    });

    if (res.ok) {
      const json = await res.json();
      const cloudinaryUrl = json.url || json.data?.url;
      if (cloudinaryUrl) {
        return { success: true, url: cloudinaryUrl };
      }
    }

    // Fallback attempt to general direct upload
    const fallbackRes = await fetch(`${BACKEND_URL}/api/v1/uploads/direct`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ image: base64, purpose })
    });

    if (fallbackRes.ok) {
      const json = await fallbackRes.json();
      const cloudinaryUrl = json.url || json.data?.url;
      if (cloudinaryUrl) {
        return { success: true, url: cloudinaryUrl };
      }
    }

    // If network fails, return base64 so user can continue; backend converts on save
    return { success: true, url: base64 };
  } catch (err: any) {
    console.warn("Cloudinary upload failed, falling back to base64:", err);
    return {
      success: typeof fileOrBase64 === "string",
      url: typeof fileOrBase64 === "string" ? fileOrBase64 : undefined,
      error: err.message || "Failed to upload image"
    };
  }
}

export async function uploadCategoryImageApi(file: File): Promise<{ success: boolean; url?: string; error?: string }> {
  return uploadBlogImageApi(file, "categories");
}

