import { apiRequest } from "./apiClient";
import type { Country } from "./types";

type CountriesResponse = {
  status: string;
  data: Country[];
};

type CountryResponse = {
  status: string;
  data: Country;
};

export async function getAdminCountries(): Promise<Country[]> {
  const res = await apiRequest<CountriesResponse>({
    method: "GET",
    path: "/admin/countries",
  });
  return Array.isArray(res.data) ? res.data : [];
}

export async function createAdminCountry(name: string): Promise<Country> {
  const res = await apiRequest<CountryResponse>({
    method: "POST",
    path: "/admin/countries",
    body: { name },
  });
  return res.data;
}

export async function updateAdminCountry(id: number, name: string): Promise<Country> {
  const res = await apiRequest<CountryResponse>({
    method: "PUT",
    path: `/admin/countries/${id}`,
    body: { name },
  });
  return res.data;
}

export async function deleteAdminCountry(id: number): Promise<void> {
  await apiRequest({
    method: "DELETE",
    path: `/admin/countries/${id}`,
  });
}
