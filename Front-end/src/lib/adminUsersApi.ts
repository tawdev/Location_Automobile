import { apiRequest } from "./apiClient";

export type AdminUser = {
  id: number;
  name: string;
  email: string;
  role_id: number;
  profile_pic?: string | null;
  email_verified_at?: string | null;
  created_at?: string;
  reservations_count?: number;
  total_spent?: number;
  role?: { id: number; name: string } | null;
};

export type UserStats = {
  totalClients: number;
  activeClients: number;
  newThisMonth: number;
  withDocuments: number;
  verified: number;
  monthlyRegistrations: { month: string; count: number }[];
  topUsers: { id: number; name: string; email: string; reservations_count: number; total_spent: number }[];
};

type PaginatedResponse<T> = {
  current_page: number;
  data: T[];
  last_page: number;
  per_page: number;
  total: number;
};

export async function getUsers(search?: string): Promise<AdminUser[]> {
  const res = await apiRequest<{ status: string; data: PaginatedResponse<AdminUser> }>({
    method: "GET",
    path: "/admin/users",
    query: search ? { search } : undefined,
  });
  return res.data.data;
}

export async function getUserStats(): Promise<UserStats> {
  const res = await apiRequest<{ status: string; data: UserStats }>({
    method: "GET",
    path: "/admin/users/stats",
  });
  return res.data;
}

export async function deleteUser(id: number): Promise<void> {
  await apiRequest({
    method: "DELETE",
    path: `/admin/users/${id}`,
  });
}
