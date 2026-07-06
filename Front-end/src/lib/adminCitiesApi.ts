import { apiRequest } from "./apiClient";
import type { City } from "./types";

type CitiesResponse = {
  status: string;
  data: City[];
};

type CityResponse = {
  status: string;
  data: City;
};

export async function getAdminCities(countryId?: number): Promise<City[]> {
  const query: Record<string, string> = {};
  if (countryId !== undefined) query.country_id = String(countryId);
  const res = await apiRequest<CitiesResponse>({
    method: "GET",
    path: "/admin/cities",
    query,
  });
  return Array.isArray(res.data) ? res.data : [];
}

export async function createAdminCity(countryId: number, name: string): Promise<City> {
  const res = await apiRequest<CityResponse>({
    method: "POST",
    path: "/admin/cities",
    body: { country_id: countryId, name },
  });
  return res.data;
}

export async function updateAdminCity(id: number, name: string): Promise<City> {
  const res = await apiRequest<CityResponse>({
    method: "PUT",
    path: `/admin/cities/${id}`,
    body: { name },
  });
  return res.data;
}

export async function deleteAdminCity(id: number): Promise<void> {
  await apiRequest({
    method: "DELETE",
    path: `/admin/cities/${id}`,
  });
}
