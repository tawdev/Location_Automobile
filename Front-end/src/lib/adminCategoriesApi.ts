import { apiRequest } from "./apiClient";
import type { Category } from "./types";

type CategoriesResponse = {
  status: string;
  data: Category[] | Category | string;
};

function ensureCategories(data: CategoriesResponse["data"]): Category[] {
  return Array.isArray(data) ? data : [];
}

export async function getAdminCategories(): Promise<Category[]> {
  const res = await apiRequest<CategoriesResponse>({
    method: "GET",
    path: "/Categories",
  });

  return ensureCategories(res.data);
}

export type AdminCategoryPayload = {
  name: string;
};

export async function createAdminCategory(payload: AdminCategoryPayload): Promise<Category> {
  const res = await apiRequest<CategoriesResponse>({
    method: "POST",
    path: "/Category",
    body: payload,
  });

  return res.data as Category;
}

export async function updateAdminCategory(categoryId: number, payload: AdminCategoryPayload): Promise<Category> {
  const res = await apiRequest<CategoriesResponse>({
    method: "PUT",
    path: `/Categories/${categoryId}`,
    body: payload,
  });

  return res.data as Category;
}

export async function deleteAdminCategory(categoryId: number): Promise<void> {
  await apiRequest({
    method: "DELETE",
    path: `/Categories/${categoryId}`,
  });
}
