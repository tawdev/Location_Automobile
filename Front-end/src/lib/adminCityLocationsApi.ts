import { apiRequest } from "./apiClient";
import type { CityLocation } from "./types";

type CityLocationsResponse = {
  status: string;
  data: CityLocation[];
};

type CityLocationResponse = {
  status: string;
  data: CityLocation;
};

export async function getAdminCityLocations(cityId?: number): Promise<CityLocation[]> {
  const query: Record<string, string> = {};
  if (cityId !== undefined) query.city_id = String(cityId);
  const res = await apiRequest<CityLocationsResponse>({
    method: "GET",
    path: "/admin/city-locations",
    query,
  });
  return Array.isArray(res.data) ? res.data : [];
}

export async function createAdminCityLocation(cityId: number, name: string, type: "airport" | "citycenter", price?: number | null): Promise<CityLocation> {
  const res = await apiRequest<CityLocationResponse>({
    method: "POST",
    path: "/admin/city-locations",
    body: { city_id: cityId, name, type, price },
  });
  return res.data;
}

export async function updateAdminCityLocation(id: number, name: string, type: "airport" | "citycenter", price?: number | null): Promise<CityLocation> {
  const res = await apiRequest<CityLocationResponse>({
    method: "PUT",
    path: `/admin/city-locations/${id}`,
    body: { name, type, price },
  });
  return res.data;
}

export async function deleteAdminCityLocation(id: number): Promise<void> {
  await apiRequest({
    method: "DELETE",
    path: `/admin/city-locations/${id}`,
  });
}
