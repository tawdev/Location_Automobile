import { apiRequest } from "./apiClient";
import type { Extra } from "./types";

type ExtrasResponse = {
  status: string;
  data: Extra[] | string;
};

export async function getExtras(): Promise<Extra[]> {
  const res = await apiRequest<ExtrasResponse>({
    method: "GET",
    path: "/extras",
    auth: true,
  });
  return Array.isArray(res.data) ? res.data : [];
}
