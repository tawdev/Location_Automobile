import { apiRequest } from "./apiClient";
import type { DashboardStats } from "./types";

export async function getDashboardStats(): Promise<DashboardStats> {
  const res = await apiRequest<{ status: string; data: DashboardStats }>({
    method: "GET",
    path: "/admin/dashboard/stats",
  });
  return res.data;
}
