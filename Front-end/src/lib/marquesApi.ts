import { apiRequest } from "./apiClient";
import type { Marque } from "./types";

type MarquesResponse = {
  status: string;
  data: Marque[] | string;
};

export async function getPublicMarques(): Promise<Marque[]> {
  const res = await apiRequest<MarquesResponse>({
    method: "GET",
    path: "/Marques/public",
    auth: false,
  });
  return Array.isArray(res.data) ? res.data : [];
}
