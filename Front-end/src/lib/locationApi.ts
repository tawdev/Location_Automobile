import { apiRequest } from "./apiClient";
import type { Country, City, CityLocation } from "./types";

type CountriesResponse = {
  status: string;
  data: Country[];
};

type CitiesResponse = {
  status: string;
  data: City[];
};

type CityLocationsResponse = {
  status: string;
  data: CityLocation[];
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

export async function fetchCityLocations(cityId: number): Promise<CityLocation[]> {
  const res = await apiRequest<CityLocationsResponse>({
    method: "GET",
    path: `/cities/${cityId}/locations`,
    auth: false,
  });
  return res.data ?? [];
}
