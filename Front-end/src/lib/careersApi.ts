import { apiRequest } from "./apiClient";
import type { Career } from "./types";

type CareersResponse = {
  status: string;
  data: Career[] | Career;
};

function ensureCareers(data: CareersResponse["data"]): Career[] {
  return Array.isArray(data) ? data : [];
}

export async function getCareers(): Promise<Career[]> {
  const res = await apiRequest<CareersResponse>({
    method: "GET",
    path: "/careers",
    auth: false,
  });
  return ensureCareers(res.data);
}

export async function getCareerBySlug(slug: string): Promise<Career> {
  const res = await apiRequest<CareersResponse>({
    method: "GET",
    path: `/careers/${slug}`,
    auth: false,
  });
  return res.data as Career;
}
