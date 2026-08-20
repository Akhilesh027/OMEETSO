import { AdminAuthService } from "@/services/adminAuthService";
import { CategoryData } from "@/pages/categories/CategoriesPage";

const API_BASE = "http://localhost:3000/api/v1/categories";
const UPLOADS_API = "http://localhost:3000/api/v1/uploads/direct";

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
    const res = await fetch(`${API_BASE}?all=true`, {
      headers: getHeaders()
    });

    const json = await res.json();
    if (!res.ok || !json.success || !Array.isArray(json.data)) {
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

export async function createCategoryApi(categoryData: Partial<CategoryData>): Promise<CategoryMutationResponse> {
  try {
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(categoryData)
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      return {
        success: false,
        error: json.error?.message || "Failed to create category"
      };
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
