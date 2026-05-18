import { apiRequest } from "./apiClient";
import type { Vehicle } from "./types";

type VehiclesResponse = {
  status: string;
  data: Vehicle[];
};

export async function listVehicles(): Promise<Vehicle[]> {
  const res = await apiRequest<VehiclesResponse>({
    method: "GET",
    path: "/Vehicles",
    query: undefined,
  });
  return res.data;
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
};

export async function filterVehicles(params: FilterParams): Promise<Vehicle[]> {
  const res = await apiRequest<VehiclesResponse>({
    method: "GET",
    path: "/filterVehicles",
    query: params,
  });
  return res.data;
}
