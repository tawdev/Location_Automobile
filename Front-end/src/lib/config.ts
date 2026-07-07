const raw = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api").trim();

/** Strip trailing slash to avoid double-slash issues like `/api//Vehicles`. */
const normalized = raw.endsWith("/") ? raw.slice(0, -1) : raw;

export const API_BASE_URL = normalized;

/* Log for production debugging */
if (typeof window !== "undefined") {
  console.log("[config] API_BASE_URL:", API_BASE_URL, "| raw env:", process.env.NEXT_PUBLIC_API_BASE_URL);
}
