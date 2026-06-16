import { apiRequest } from "./apiClient";
import type { Career } from "./types";

type CareersResponse = {
  status: string;
  data: Career[] | Career | string;
  errors?: string[];
};

function ensureCareers(data: CareersResponse["data"]): Career[] {
  return Array.isArray(data) ? data : [];
}

export async function getAdminCareers(): Promise<Career[]> {
  const res = await apiRequest<CareersResponse>({
    method: "GET",
    path: "/admin/careers",
  });
  return ensureCareers(res.data);
}

export async function getAdminCareer(id: number): Promise<Career> {
  const res = await apiRequest<CareersResponse>({
    method: "GET",
    path: `/admin/careers/${id}`,
  });
  return res.data as Career;
}

export type AdminCareerPayload = {
  title: string;
  location?: string | null;
  type?: string | null;
  department?: string | null;
  description?: string | null;
  requirements?: string | null;
  salary_range?: string | null;
  is_active?: boolean;
};

export async function createAdminCareer(payload: AdminCareerPayload): Promise<Career> {
  const res = await apiRequest<CareersResponse>({
    method: "POST",
    path: "/admin/careers",
    body: payload,
  });
  return res.data as Career;
}

export async function updateAdminCareer(id: number, payload: AdminCareerPayload): Promise<Career> {
  const res = await apiRequest<CareersResponse>({
    method: "PUT",
    path: `/admin/careers/${id}`,
    body: payload,
  });
  return res.data as Career;
}

export async function deleteAdminCareer(id: number): Promise<void> {
  await apiRequest({
    method: "DELETE",
    path: `/admin/careers/${id}`,
  });
}
