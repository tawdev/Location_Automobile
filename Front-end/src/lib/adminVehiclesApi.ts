import { apiRequest } from "./apiClient";
import type { Vehicle } from "./types";

type VehiclesResponse = {
  status: string;
  data: Vehicle[] | string;
};

function ensureVehicles(data: VehiclesResponse["data"]): Vehicle[] {
  return Array.isArray(data) ? data : [];
}

export async function getAdminVehicles(): Promise<Vehicle[]> {
  const res = await apiRequest<VehiclesResponse>({
    method: "GET",
    path: "/Vehicles",
  });

  return ensureVehicles(res.data);
}

export type AdminVehiclePayload = {
  marque: string;
  model: string;
  year: number;
  registration: string;
  km: number;
  pricePerDay: number;
  fuelType: string;
  category_id: number;
  type_vehicule_id?: number | null;
  Occupants: string;
  device_id?: string;
  air_conditioner?: boolean;
  gps?: boolean;
  order?: number;
  country_id?: number | null;
  city_id?: number | null;
  pickup_country_id?: number | null;
  pickup_city_id?: number | null;
  current_country_id?: number | null;
  current_city_id?: number | null;
  images?: File[];
  deletedImages?: number[];
};

function toVehicleFormData(payload: AdminVehiclePayload): FormData {
  const fd = new FormData();

  fd.set("marque", payload.marque);
  fd.set("model", payload.model);
  fd.set("year", String(payload.year));
  fd.set("registration", payload.registration);
  fd.set("km", String(payload.km));
  fd.set("pricePerDay", String(payload.pricePerDay));
  fd.set("fuelType", payload.fuelType);
  fd.set("category_id", String(payload.category_id));
  if (payload.type_vehicule_id !== undefined && payload.type_vehicule_id !== null) fd.set("type_vehicule_id", String(payload.type_vehicule_id));
  fd.set("Occupants", payload.Occupants);
  if (payload.device_id) fd.set("device_id", payload.device_id);
  fd.set("air_conditioner", payload.air_conditioner ? "1" : "0");
  fd.set("gps", payload.gps ? "1" : "0");
  if (payload.order !== undefined) fd.set("order", String(payload.order));
  if (payload.country_id !== undefined && payload.country_id !== null) fd.set("country_id", String(payload.country_id));
  if (payload.city_id !== undefined && payload.city_id !== null) fd.set("city_id", String(payload.city_id));
  if (payload.pickup_country_id !== undefined && payload.pickup_country_id !== null) fd.set("pickup_country_id", String(payload.pickup_country_id));
  if (payload.pickup_city_id !== undefined && payload.pickup_city_id !== null) fd.set("pickup_city_id", String(payload.pickup_city_id));
  if (payload.current_country_id !== undefined && payload.current_country_id !== null) fd.set("current_country_id", String(payload.current_country_id));
  if (payload.current_city_id !== undefined && payload.current_city_id !== null) fd.set("current_city_id", String(payload.current_city_id));

  if (payload.images && payload.images.length > 0) {
    for (const file of payload.images) {
      fd.append("images[]", file);
    }
  }

  if (payload.deletedImages && payload.deletedImages.length > 0) {
    fd.set("deleted_images", JSON.stringify(payload.deletedImages));
  }

  return fd;
}

export async function createAdminVehicle(payload: AdminVehiclePayload): Promise<Vehicle> {
  const fd = toVehicleFormData(payload);

  const res = await apiRequest<{ status: string; data: Vehicle }>({
    method: "POST",
    path: "/vehicle",
    body: fd,
  });

  return res.data;
}

export async function updateAdminVehicle(vehicleId: number, payload: AdminVehiclePayload): Promise<Vehicle> {
  const fd = toVehicleFormData(payload);
  
  // Use Laravel method spoofing: send a POST request with '_method' set to 'PUT'
  fd.set("_method", "PUT");

  const res = await apiRequest<{ status: string; data: Vehicle }>({
    method: "POST",
    path: `/Vehicle/${vehicleId}`,
    body: fd,
  });

  return res.data;
}

export async function deleteAdminVehicle(vehicleId: number): Promise<void> {
  await apiRequest<{ status: string; message?: string }>({
    method: "DELETE",
    path: `/Vehicle/${vehicleId}`,
  });
}
