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
    let res = await fetch(`${API_BASE}?all=true`, {
      headers: getHeaders()
    }).catch(() => null);

    // Fallback to localhost if production domain is unreachable during local development
    if (!res || !res.ok) {
      const localRes = await fetch("https://api.omeetso.in/api/v1/categories?all=true", {
        headers: getHeaders()
      }).catch(() => null);
      if (localRes && localRes.ok) {
        res = localRes;
      }
    }

    if (!res) {
      return {
        success: false,
        error: "Network error: Unable to connect to backend on " + API_BASE
      };
    }

    const json = await res.json();
    if (!json.success || !Array.isArray(json.data)) {
      return {
        success: false,
        error: json.error?.message || "Failed to fetch categories from MongoDB"
      };
    }

    return {
      success: true,
      data: json.data
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Network error: Unable to connect to backend"
    };
  }
}

export async function seedCategoriesApi(): Promise<{ success: boolean; message?: string; count?: number; error?: string }> {
  try {
    let res = await fetch(`${API_BASE}/seed`, {
      method: "POST",
      headers: getHeaders()
    }).catch(() => null);

    if (!res || !res.ok) {
      res = await fetch("https://api.omeetso.in/api/v1/categories/seed", {
        method: "POST",
        headers: getHeaders()
      }).catch(() => null);
    }

    if (!res) throw new Error("Could not reach backend API");
    const json = await res.json();
    return json;
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to trigger category seeding" };
  }
}

export async function createCategoryApi(categoryData: Partial<CategoryData>): Promise<CategoryMutationResponse> {
  try {
    let res = await fetch(API_BASE, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(categoryData)
    }).catch(() => null);

    if (!res || !res.ok) {
      const localRes = await fetch("https://api.omeetso.in/api/v1/categories", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(categoryData)
      }).catch(() => null);
      if (localRes && localRes.ok) {
        res = localRes;
      }
    }

    if (!res) {
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

export async function uploadCategoryImageApi(file: File): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        if (!base64) {
          return resolve({ success: false, error: "Failed to read image file" });
        }
        resolve({ success: true, url: base64 });
      };
      reader.onerror = () => resolve({ success: false, error: "File reading error" });
      reader.readAsDataURL(file);
    });
  } catch (error: any) {
    return { success: false, error: error.message || "Image upload failed" };
  }
}
