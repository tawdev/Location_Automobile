import { apiRequest } from "./apiClient";
import type { CityLocation } from "./types";

type CityLocationsResponse = {
  status: string;
  data: CityLocation[];
};

export async function fetchCityLocations(cityId: number): Promise<CityLocation[]> {
  const res = await apiRequest<CityLocationsResponse>({
    method: "GET",
    path: `/cities/${cityId}/locations`,
    auth: false,
  });
  return res.data ?? [];
}
