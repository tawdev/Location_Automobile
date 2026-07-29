import { API_BASE_URL } from "./config";

function normalizeBaseUrl(url: string): string {
  // - removes trailing slashes
  // - keeps protocol/host/port intact
  let normalized = url.trim();
  while (normalized.endsWith("/")) normalized = normalized.slice(0, -1);
  return normalized;
}

export function getApiOrigin(): string {
  // API_BASE_URL is expected like: http://localhost:8000/api
  let url = API_BASE_URL.trim();

  if (url.endsWith("/api/")) url = url.slice(0, -4);
  else if (url.endsWith("/api")) url = url.slice(0, -3);

  return normalizeBaseUrl(url);
}

export function vehicleImageUrl(path: string): string {
  const cleanedPath = path.replace(/^\/+/, "");
  return `/api/storage/${cleanedPath}`;
}

export function profileImageUrl(filename: string): string {
  // Laravel serves it as: {APP_URL}/image/<filename>
  const cleanedFilename = filename.replace(/^\/+/, "");
  return `${getApiOrigin()}/image/${cleanedFilename}`;
}
