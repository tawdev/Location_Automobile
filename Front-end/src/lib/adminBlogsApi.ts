import { apiRequest } from "./apiClient";
import type { Blog } from "./types";

type BlogsResponse = {
  status: string;
  data: Blog[] | Blog | string;
  errors?: string[];
};

function ensureBlogs(data: BlogsResponse["data"]): Blog[] {
  return Array.isArray(data) ? data : [];
}

export async function getAdminBlogs(): Promise<Blog[]> {
  const res = await apiRequest<BlogsResponse>({
    method: "GET",
    path: "/admin/blogs",
  });
  return ensureBlogs(res.data);
}

export async function getAdminBlog(id: number): Promise<Blog> {
  const res = await apiRequest<BlogsResponse>({
    method: "GET",
    path: `/admin/blogs/${id}`,
  });
  return res.data as Blog;
}

export type AdminBlogPayload = {
  title: string;
  excerpt?: string | null;
  content?: string | null;
  featured_image?: File | null;
  author?: string | null;
  published_at?: string | null;
  status?: "draft" | "published";
};

export async function createAdminBlog(payload: AdminBlogPayload): Promise<Blog> {
  const fd = new FormData();
  fd.append("title", payload.title);
  if (payload.excerpt) fd.append("excerpt", payload.excerpt);
  if (payload.content) fd.append("content", payload.content);
  if (payload.featured_image) fd.append("featured_image", payload.featured_image);
  if (payload.author) fd.append("author", payload.author);
  if (payload.published_at) fd.append("published_at", payload.published_at);
  if (payload.status) fd.append("status", payload.status);

  const res = await apiRequest<BlogsResponse>({
    method: "POST",
    path: "/admin/blogs",
    body: fd,
  });
  return res.data as Blog;
}

export async function updateAdminBlog(id: number, payload: AdminBlogPayload): Promise<Blog> {
  const fd = new FormData();
  fd.append("title", payload.title);
  fd.append("_method", "PUT");
  if (payload.excerpt) fd.append("excerpt", payload.excerpt);
  if (payload.content) fd.append("content", payload.content);
  if (payload.featured_image) fd.append("featured_image", payload.featured_image);
  if (payload.author) fd.append("author", payload.author);
  if (payload.published_at) fd.append("published_at", payload.published_at);
  if (payload.status) fd.append("status", payload.status);

  const res = await apiRequest<BlogsResponse>({
    method: "POST",
    path: `/admin/blogs/${id}`,
    body: fd,
  });
  return res.data as Blog;
}

export async function deleteAdminBlog(id: number): Promise<void> {
  await apiRequest({
    method: "DELETE",
    path: `/admin/blogs/${id}`,
  });
}
