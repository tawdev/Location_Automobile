import { apiRequest } from "./apiClient";

export type SiteSettings = {
  address: string;
  phone: string;
  email: string;
  [key: string]: string;
};

type SettingsResponse = {
  status: string;
  data: SiteSettings;
};

export async function getSettings(): Promise<SiteSettings> {
  const res = await apiRequest<SettingsResponse>({
    method: "GET",
    path: "/settings",
    auth: false,
  });
  return res.data;
}

export async function updateSettings(settings: Record<string, string>): Promise<SiteSettings> {
  const res = await apiRequest<{ status: string; data: SiteSettings }>({
    method: "PUT",
    path: "/admin/settings",
    body: { settings },
  });
  return res.data;
}
