import { apiRequest } from "./apiClient";

export type DepartureCondition = {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
};

type ConditionsResponse = {
  status: string;
  data: DepartureCondition[] | string;
};

export async function getAdminDepartureConditions(): Promise<DepartureCondition[]> {
  const res = await apiRequest<ConditionsResponse>({
    method: "GET",
    path: "/admin/departure-conditions",
  });
  return Array.isArray(res.data) ? res.data : [];
}

export async function createAdminDepartureCondition(payload: { name: string }): Promise<DepartureCondition> {
  const res = await apiRequest<{ status: string; data: DepartureCondition }>({
    method: "POST",
    path: "/admin/departure-conditions",
    body: payload,
  });
  return res.data;
}

export async function updateAdminDepartureCondition(id: number, payload: { name: string }): Promise<DepartureCondition> {
  const res = await apiRequest<{ status: string; data: DepartureCondition }>({
    method: "PUT",
    path: `/admin/departure-conditions/${id}`,
    body: payload,
  });
  return res.data;
}

export async function deleteAdminDepartureCondition(id: number): Promise<void> {
  await apiRequest<{ status: string }>({
    method: "DELETE",
    path: `/admin/departure-conditions/${id}`,
  });
}

export async function syncVehicleConditions(vehicleId: number, conditionIds: number[]): Promise<void> {
  await apiRequest<{ status: string }>({
    method: "POST",
    path: `/admin/vehicles/${vehicleId}/conditions`,
    body: { condition_ids: conditionIds },
  });
}

export async function getVehicleConditions(vehicleId: number): Promise<DepartureCondition[]> {
  const res = await apiRequest<{ status: string; data: DepartureCondition[] }>({
    method: "GET",
    path: `/admin/vehicles/${vehicleId}/conditions`,
  });
  return res.data ?? [];
}
