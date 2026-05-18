import { API_BASE_URL } from "./config";

export function getApiOrigin(): string {
  // API_BASE_URL is expected like: http://localhost:8000/api
  return API_BASE_URL.endsWith("/api") ? API_BASE_URL.slice(0, -3) : API_BASE_URL;
}

export function vehicleImageUrl(path: string): string {
  // Vehicle pictures are stored in the "public" disk under "Vehicles/<filename>"
  // Laravel serves it as: {APP_URL}/storage/{path}
  return `${getApiOrigin()}/storage/${path}`;
}

export function profileImageUrl(filename: string): string {
  // Profile pics are moved directly to Back-End/public/image/<filename>
  // Laravel serves it as: {APP_URL}/image/<filename>
  return `${getApiOrigin()}/image/${filename}`;
}
