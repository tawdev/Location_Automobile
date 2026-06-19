import { apiRequest } from "./apiClient";
import type { Blog } from "./types";

type BlogResponse = {
  status: string;
  data: Blog[] | Blog;
};

export async function getPublishedBlogs(): Promise<Blog[]> {
  const res = await apiRequest<BlogResponse>({
    method: "GET",
    path: "/blogs",
    auth: false,
  });
  return Array.isArray(res.data) ? res.data : [];
}

export async function getPublishedBlog(slug: string): Promise<Blog> {
  const res = await apiRequest<BlogResponse>({
    method: "GET",
    path: `/blogs/${slug}`,
    auth: false,
  });
  return res.data as Blog;
}
