import { apiRequest } from "./apiClient";

export type ContactMessage = {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  admin_reply: string | null;
  read_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PaginatedMessages = {
  current_page: number;
  data: ContactMessage[];
  last_page: number;
  per_page: number;
  total: number;
};

const BASE = "/support/messages";

export async function fetchMessages(params?: {
  status?: string;
  per_page?: number;
  page?: number;
  search?: string;
}): Promise<PaginatedMessages> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set("status", params.status);
  if (params?.per_page) searchParams.set("per_page", String(params.per_page));
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.search) searchParams.set("search", params.search);

  const qs = searchParams.toString();
  const path = qs ? `${BASE}?${qs}` : BASE;

  const res = await apiRequest<{ status: string; data: PaginatedMessages }>({
    method: "GET",
    path,
  });
  return res.data;
}

export async function fetchMessage(id: number): Promise<ContactMessage> {
  const res = await apiRequest<{ status: string; data: ContactMessage }>({
    method: "GET",
    path: `${BASE}/${id}`,
  });
  return res.data;
}

export async function replyToMessage(id: number, reply: string): Promise<ContactMessage> {
  const res = await apiRequest<{ status: string; data: ContactMessage }>({
    method: "POST",
    path: `${BASE}/${id}/reply`,
    body: { reply },
  });
  return res.data;
}

export async function deleteMessage(id: number): Promise<void> {
  await apiRequest({
    method: "DELETE",
    path: `${BASE}/${id}`,
  });
}

export async function fetchUnreadCount(): Promise<number> {
  const res = await apiRequest<{ status: string; data: { count: number } }>({
    method: "GET",
    path: `${BASE}/unread-count`,
  });
  return res.data.count;
}
