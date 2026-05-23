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
  Occupants: string;
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
  fd.set("Occupants", payload.Occupants);

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
