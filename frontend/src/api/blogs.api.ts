import { API_BASE } from "@/config/api";

export interface BlogArticle {
  id: string;
  _id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  category: string;
  tags: string[];
  author: {
    name: string;
    avatar?: string;
    role?: string;
    bio?: string;
  };
  readTime: string;
  status: "DRAFT" | "PUBLISHED" | "SCHEDULED" | "ARCHIVED";
  isFeatured: boolean;
  viewsCount: number;
  likesCount: number;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
  scheduledAt?: string;
  publishedAt?: string;
  createdAt: string;
  related?: BlogArticle[];
}

export interface FetchBlogsParams {
  category?: string;
  tag?: string;
  q?: string;
  page?: number;
  limit?: number;
}

export async function fetchBlogs(params?: FetchBlogsParams): Promise<{ data: BlogArticle[]; meta?: any }> {
  try {
    const sp = new URLSearchParams();
    if (params?.category && params.category !== "ALL") sp.append("category", params.category);
    if (params?.tag) sp.append("tag", params.tag);
    if (params?.q) sp.append("q", params.q);
    if (params?.page) sp.append("page", String(params.page));
    if (params?.limit) sp.append("limit", String(params.limit));

    const res = await fetch(`${API_BASE}/blogs?${sp.toString()}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        return { data: json.data, meta: json.meta };
      }
    }
  } catch (err) {
    console.warn("Failed to fetch blogs from API:", err);
  }
  return { data: [] };
}

export async function fetchFeaturedBlogs(): Promise<BlogArticle[]> {
  try {
    const res = await fetch(`${API_BASE}/blogs/featured`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        return json.data;
      }
    }
  } catch (err) {
    console.warn("Failed to fetch featured blogs:", err);
  }
  return [];
}

export async function fetchBlogBySlug(slug: string): Promise<BlogArticle | null> {
  try {
    const res = await fetch(`${API_BASE}/blogs/${slug}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return json.data;
      }
    }
  } catch (err) {
    console.warn(`Failed to fetch blog with slug "${slug}":`, err);
  }
  return null;
}

export async function likeBlog(slugOrId: string): Promise<number | null> {
  try {
    const res = await fetch(`${API_BASE}/blogs/${slugOrId}/like`, { method: "POST" });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data?.likesCount !== undefined) {
        return json.data.likesCount;
      }
    }
  } catch (err) {
    console.warn("Failed to like blog:", err);
  }
  return null;
}
