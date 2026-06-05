import { apiRequest } from "./apiClient";
import type { Vehicle } from "./types";

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
};

export async function filterVehicles(params: FilterParams): Promise<Vehicle[]> {
  const res = await apiRequest<VehiclesResponse>({
    method: "GET",
    path: "/filterVehicles",
    query: params,
  });

  if (Array.isArray(res.data)) return res.data;

  throw new Error(res.data);
}
