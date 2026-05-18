import { API_BASE_URL } from "./config";
import { getAuthToken, clearAuthToken } from "./tokenStorage";

type JsonValue = string | number | boolean | null;

export type ApiError = {
  message: string;
  status?: number;
  data?: unknown;
};

type RequestOptions = {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  query?: Record<string, JsonValue | undefined>;
  body?:
    | Record<string, unknown>
    | FormData
    | string
    | null;
  auth?: boolean; // defaults to true
  signal?: AbortSignal;
};

function buildQuery(query: RequestOptions["query"]): string {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined) continue;
    params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export async function apiRequest<T = unknown>({
  method,
  path,
  query,
  body,
  auth = true,
  signal,
}: RequestOptions): Promise<T> {
  const token = auth ? getAuthToken() : null;

  const hasJsonBody =
    body !== null && body !== undefined && !(body instanceof FormData) && typeof body !== "string";

  const res = await fetch(`${API_BASE_URL}${path}${buildQuery(query)}`, {
    method,
    signal,
    headers: {
      ...(hasJsonBody
        ? { Accept: "application/json", "Content-Type": "application/json" }
        : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body instanceof FormData || typeof body === "string" ? body : body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 || res.status === 419) {
    // Token expired/invalid; clear local token to avoid infinite 401 loops
    clearAuthToken();
    throw { message: "Unauthorized", status: res.status } satisfies ApiError;
  }

  const contentType = res.headers.get("content-type") ?? "";
  const parsed = contentType.includes("application/json") ? await res.json().catch(() => undefined) : await res.text().catch(() => undefined);

  if (!res.ok) {
    const apiError: ApiError = {
      message:
        (parsed && typeof parsed === "object" && "message" in parsed ? String((parsed as any).message) : undefined) ||
        `Request failed with status ${res.status}`,
      status: res.status,
      data: parsed,
    };
    throw apiError;
  }

  return parsed as T;
}
