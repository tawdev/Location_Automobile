import { apiRequest } from "./apiClient";
import type { Vehicle, Category, TypeVehicule } from "./types";

type VehiclesResponse = {
  status: string;
  data: Vehicle[] | string;
};

function asVehicles(data: VehiclesResponse["data"]): Vehicle[] {
  return Array.isArray(data) ? data : [];
}

export async function listVehicles(): Promise<Vehicle[]> {
  const res = await apiRequest<VehiclesResponse>({
    method: "GET",
    path: "/Vehicles",
    query: undefined,
    auth: false,
  });

  if (Array.isArray(res.data)) return res.data;

  // backend sometimes returns a string message when no vehicles exist
  throw new Error(res.data);
}

// Optional: backend has /filterVehicles but Postman didn't include a full contract.
// This is here so the UI can call it later if you want.
type FilterParams = {
  marque?: string;
  Occupants?: string;
  model?: string;
  fuelType?: string;
  min_price?: number;
  max_price?: number;
  pickup_date?: string;
  return_date?: string;
  current_country_id?: number;
  current_city_id?: number;
  location_type?: string;
};

type CategoriesResponse = {
  status: string;
  data: Category[] | string;
};

type TypeVehiculesResponse = {
  status: string;
  data: TypeVehicule[] | string;
};

export async function fetchTypeVehicules(): Promise<TypeVehicule[]> {
  const res = await apiRequest<TypeVehiculesResponse>({
    method: "GET",
    path: "/type-vehicules/public",
    query: undefined,
    auth: false,
  });
  if (Array.isArray(res.data)) return res.data;
  return [];
}

export async function fetchCategories(): Promise<Category[]> {
  const res = await apiRequest<CategoriesResponse>({
    method: "GET",
    path: "/Categories/public",
    query: undefined,
    auth: false,
  });
  if (Array.isArray(res.data)) return res.data;
  return [];
}

export async function getVehicleById(id: number): Promise<Vehicle> {
  const res = await apiRequest<{ status: string; data: Vehicle }>({
    method: "GET",
    path: `/Vehicles/${id}`,
    auth: false,
  });
  return res.data;
}

export async function filterVehicles(params: FilterParams): Promise<Vehicle[]> {
  const res = await apiRequest<VehiclesResponse>({
    method: "GET",
    path: "/filterVehicles",
    query: params,
    auth: false,
  });

  if (Array.isArray(res.data)) return res.data;

  throw new Error(res.data);
}
