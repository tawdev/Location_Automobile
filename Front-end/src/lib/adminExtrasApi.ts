import { apiRequest } from "./apiClient";
import type { Extra } from "./types";

type ExtraResponse = {
  status: string;
  message?: string;
  data: Extra[] | Extra | string;
};

function ensureExtras(data: ExtraResponse["data"]): Extra[] {
  return Array.isArray(data) ? data : [];
}

export async function getAdminExtras(): Promise<Extra[]> {
  const res = await apiRequest<ExtraResponse>({
    method: "GET",
    path: "/admin/extras",
  });
  return ensureExtras(res.data);
}

export type AdminExtraPayload = {
  name: string;
  price_per_day: number;
  image?: File | null;
};

export async function createAdminExtra(payload: AdminExtraPayload): Promise<Extra> {
  const fd = new FormData();
  fd.set("name", payload.name);
  fd.set("price_per_day", String(payload.price_per_day));
  if (payload.image) {
    fd.append("image", payload.image);
  }

  const res = await apiRequest<ExtraResponse>({
    method: "POST",
    path: "/admin/extras",
    body: fd,
  });
  return res.data as Extra;
}

export async function updateAdminExtra(extraId: number, payload: AdminExtraPayload): Promise<Extra> {
  const fd = new FormData();
  fd.set("name", payload.name);
  fd.set("price_per_day", String(payload.price_per_day));
  fd.set("_method", "PUT");
  if (payload.image) {
    fd.append("image", payload.image);
  }

  const res = await apiRequest<ExtraResponse>({
    method: "POST",
    path: `/admin/extras/${extraId}`,
    body: fd,
  });
  return res.data as Extra;
}

export async function deleteAdminExtra(extraId: number): Promise<void> {
  await apiRequest({
    method: "DELETE",
    path: `/admin/extras/${extraId}`,
  });
}
