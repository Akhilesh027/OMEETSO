import { ServiceItem, ServiceInquiryItem, ServiceCategoryItem } from "@/lib/services";

const API_BASE = "http://localhost:5000/api/v1/services";

export async function getPublicServicesApi(params?: Record<string, any>): Promise<{ success: boolean; data?: ServiceItem[]; error?: string }> {
  try {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") {
          query.set(key, String(val));
        }
      });
    }
    const res = await fetch(`${API_BASE}?${query.toString()}`, { credentials: "include" });
    const data = await res.json();
    return data;
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getServiceByIdApi(id: string): Promise<{ success: boolean; data?: ServiceItem; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/${id}`, { credentials: "include" });
    const data = await res.json();
    return data;
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getServiceCategoriesApi(): Promise<{ success: boolean; data?: ServiceCategoryItem[]; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/categories`, { credentials: "include" });
    const data = await res.json();
    return data;
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function createServiceApi(serviceData: Partial<ServiceItem>): Promise<{ success: boolean; data?: ServiceItem; error?: string }> {
  try {
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(serviceData),
    });
    const data = await res.json();
    return data;
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function createServiceInquiryApi(inquiryData: Partial<ServiceInquiryItem>): Promise<{ success: boolean; data?: ServiceInquiryItem; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/inquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(inquiryData),
    });
    const data = await res.json();
    return data;
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getMyServicesApi(): Promise<{ success: boolean; data?: ServiceItem[]; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/provider/my-services`, { credentials: "include" });
    const data = await res.json();
    return data;
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getProviderInquiriesApi(): Promise<{ success: boolean; data?: ServiceInquiryItem[]; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/provider/inquiries`, { credentials: "include" });
    const data = await res.json();
    return data;
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getMyServiceInquiriesApi(): Promise<{ success: boolean; data?: ServiceInquiryItem[]; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/customer/inquiries`, { credentials: "include" });
    const data = await res.json();
    return data;
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateInquiryStatusApi(
  inquiryId: string,
  payload: { status?: string; quotationAmount?: number; providerNotes?: string }
): Promise<{ success: boolean; data?: ServiceInquiryItem; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/inquiries/${inquiryId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return data;
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
