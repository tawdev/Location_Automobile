import { apiRequest } from "./apiClient";
import type { Country, City } from "./types";

type CountriesResponse = {
  status: string;
  data: Country[];
};

type CitiesResponse = {
  status: string;
  data: City[];
};

export async function fetchCountries(): Promise<Country[]> {
  const res = await apiRequest<CountriesResponse>({
    method: "GET",
    path: "/countries",
    auth: false,
  });
  return res.data ?? [];
}

export async function fetchCitiesByCountry(countryId: number): Promise<City[]> {
  const res = await apiRequest<CitiesResponse>({
    method: "GET",
    path: `/countries/${countryId}/cities`,
    auth: false,
  });
  return res.data ?? [];
}
