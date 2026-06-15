import { apiRequest } from "./apiClient";
import type { Marque } from "./types";

type MarquesResponse = {
  status: string;
  data: Marque[] | Marque | string;
};

function ensureMarques(data: MarquesResponse["data"]): Marque[] {
  return Array.isArray(data) ? data : [];
}

export async function getAdminMarques(): Promise<Marque[]> {
  const res = await apiRequest<MarquesResponse>({
    method: "GET",
    path: "/Marques",
  });
  return ensureMarques(res.data);
}

export async function getAdminMarque(id: number): Promise<Marque> {
  const res = await apiRequest<MarquesResponse>({
    method: "GET",
    path: `/Marques/${id}`,
  });
  return res.data as Marque;
}

export type AdminMarquePayload = {
  name: string;
  logo?: File | null;
};

export async function createAdminMarque(payload: AdminMarquePayload): Promise<Marque> {
  const fd = new FormData();
  fd.append("name", payload.name);
  if (payload.logo) fd.append("logo", payload.logo);

  const res = await apiRequest<MarquesResponse>({
    method: "POST",
    path: "/Marque",
    body: fd,
  });
  return res.data as Marque;
}

export async function updateAdminMarque(id: number, payload: AdminMarquePayload): Promise<Marque> {
  const fd = new FormData();
  fd.append("name", payload.name);
  fd.append("_method", "PUT");
  if (payload.logo) fd.append("logo", payload.logo);

  const res = await apiRequest<MarquesResponse>({
    method: "POST",
    path: `/Marques/${id}`,
    body: fd,
  });
  return res.data as Marque;
}

export async function createAdminMarques(names: string[]): Promise<MarquesResponse> {
  const res = await apiRequest<MarquesResponse>({
    method: "POST",
    path: "/Marques/bulk",
    body: { names },
  });
  return res;
}

export async function deleteAdminMarque(id: number): Promise<void> {
  await apiRequest({
    method: "DELETE",
    path: `/Marques/${id}`,
  });
}
