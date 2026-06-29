import { apiRequest } from "./apiClient";

export type Permission = {
  id: number;
  slug: string;
  name_fr: string;
  name_en: string;
  name_ar: string;
  group: string;
};

export type AllUser = {
  id: number;
  name: string;
  email: string;
  role_id: number;
  role: { id: number; name: string } | null;
  permissions: { id: number; slug: string; name_fr: string }[];
  created_at: string;
  email_verified_at?: string | null;
  profile_pic?: string | null;
};

type PaginatedResponse<T> = {
  current_page: number;
  data: T[];
  last_page: number;
  per_page: number;
  total: number;
};

export async function getAllUsers(search?: string): Promise<AllUser[]> {
  const res = await apiRequest<{ status: string; data: PaginatedResponse<AllUser> }>({
    method: "GET",
    path: "/admin/users/all",
    query: search ? { search } : undefined,
  });
  return res.data.data;
}

export async function getPermissions(): Promise<Permission[]> {
  const res = await apiRequest<{ status: string; data: Permission[] }>({
    method: "GET",
    path: "/admin/permissions",
  });
  return res.data;
}

export async function getUserPermissionIds(userId: number): Promise<number[]> {
  const res = await apiRequest<{ status: string; data: number[] }>({
    method: "GET",
    path: `/admin/users/${userId}/permissions`,
  });
  return res.data;
}

export async function updateUserPermissions(userId: number, permissionIds: number[]): Promise<void> {
  await apiRequest({
    method: "PUT",
    path: `/admin/users/${userId}/permissions`,
    body: { permission_ids: permissionIds },
  });
}
