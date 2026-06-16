import { apiRequest } from "./apiClient";
import type { PressRelease } from "./types";

type PressResponse = {
  status: string;
  data: PressRelease[] | PressRelease | string;
  errors?: string[];
};

function ensurePress(data: PressResponse["data"]): PressRelease[] {
  return Array.isArray(data) ? data : [];
}

export async function getAdminPress(): Promise<PressRelease[]> {
  const res = await apiRequest<PressResponse>({
    method: "GET",
    path: "/admin/press",
  });
  return ensurePress(res.data);
}

export async function getAdminPressRelease(id: number): Promise<PressRelease> {
  const res = await apiRequest<PressResponse>({
    method: "GET",
    path: `/admin/press/${id}`,
  });
  return res.data as PressRelease;
}

export type AdminPressPayload = {
  title: string;
  excerpt?: string | null;
  content?: string | null;
  featured_image?: File | null;
  category?: string | null;
  published_at?: string | null;
  status?: "draft" | "published";
};

export async function createAdminPressRelease(payload: AdminPressPayload): Promise<PressRelease> {
  const fd = new FormData();
  fd.append("title", payload.title);
  if (payload.excerpt) fd.append("excerpt", payload.excerpt);
  if (payload.content) fd.append("content", payload.content);
  if (payload.featured_image) fd.append("featured_image", payload.featured_image);
  if (payload.category) fd.append("category", payload.category);
  if (payload.published_at) fd.append("published_at", payload.published_at);
  if (payload.status) fd.append("status", payload.status);

  const res = await apiRequest<PressResponse>({
    method: "POST",
    path: "/admin/press",
    body: fd,
  });
  return res.data as PressRelease;
}

export async function updateAdminPressRelease(id: number, payload: AdminPressPayload): Promise<PressRelease> {
  const fd = new FormData();
  fd.append("title", payload.title);
  fd.append("_method", "PUT");
  if (payload.excerpt) fd.append("excerpt", payload.excerpt);
  if (payload.content) fd.append("content", payload.content);
  if (payload.featured_image) fd.append("featured_image", payload.featured_image);
  if (payload.category) fd.append("category", payload.category);
  if (payload.published_at) fd.append("published_at", payload.published_at);
  if (payload.status) fd.append("status", payload.status);

  const res = await apiRequest<PressResponse>({
    method: "POST",
    path: `/admin/press/${id}`,
    body: fd,
  });
  return res.data as PressRelease;
}

export async function deleteAdminPressRelease(id: number): Promise<void> {
  await apiRequest({
    method: "DELETE",
    path: `/admin/press/${id}`,
  });
}
