import { apiRequest } from "./apiClient";
import type { PressRelease } from "./types";

type PressResponse = {
  status: string;
  data: PressRelease[] | PressRelease;
};

function ensurePress(data: PressResponse["data"]): PressRelease[] {
  return Array.isArray(data) ? data : [];
}

export async function getPress(): Promise<PressRelease[]> {
  const res = await apiRequest<PressResponse>({
    method: "GET",
    path: "/press",
    auth: false,
  });
  return ensurePress(res.data);
}

export async function getPressBySlug(slug: string): Promise<PressRelease> {
  const res = await apiRequest<PressResponse>({
    method: "GET",
    path: `/press/${slug}`,
    auth: false,
  });
  return res.data as PressRelease;
}
