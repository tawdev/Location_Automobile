import { apiRequest } from "./apiClient";
import type { TypeVehicule } from "./types";

type TypeVehiculesResponse = {
  status: string;
  data: TypeVehicule[] | TypeVehicule | string;
};

function ensureTypeVehicules(data: TypeVehiculesResponse["data"]): TypeVehicule[] {
  return Array.isArray(data) ? data : [];
}

export async function getAdminTypeVehicules(): Promise<TypeVehicule[]> {
  const res = await apiRequest<TypeVehiculesResponse>({
    method: "GET",
    path: "/type-vehicules",
  });

  return ensureTypeVehicules(res.data);
}

export type AdminTypeVehiculePayload = {
  name: string;
};

export async function createAdminTypeVehicule(payload: AdminTypeVehiculePayload): Promise<TypeVehicule> {
  const res = await apiRequest<TypeVehiculesResponse>({
    method: "POST",
    path: "/type-vehicule",
    body: payload,
  });

  return res.data as TypeVehicule;
}

export async function updateAdminTypeVehicule(typeId: number, payload: AdminTypeVehiculePayload): Promise<TypeVehicule> {
  const res = await apiRequest<TypeVehiculesResponse>({
    method: "PUT",
    path: `/type-vehicules/${typeId}`,
    body: payload,
  });

  return res.data as TypeVehicule;
}

export async function deleteAdminTypeVehicule(typeId: number): Promise<void> {
  await apiRequest({
    method: "DELETE",
    path: `/type-vehicules/${typeId}`,
  });
}
