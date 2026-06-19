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

export function isAuthError(error: unknown): boolean {
  if (error && typeof error === "object" && "status" in error) {
    const status = (error as { status: number }).status;
    return status === 401 || status === 419 || status === 403;
  }
  return false;
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

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}${buildQuery(query)}`, {
      method,
      signal,
      headers: {
        Accept: "application/json",
        ...(hasJsonBody ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body:
        body instanceof FormData || typeof body === "string"
          ? body
          : body
            ? JSON.stringify(body)
            : undefined,
    });
  } catch (e) {
    throw {
      message: `Failed to fetch. Backend might be down or API_BASE_URL is wrong. Tried: ${API_BASE_URL}${path}`,
      data: e,
    } satisfies ApiError;
  }

  if (res.status === 401 || res.status === 419) {
    // Token expired/invalid; clear local token to avoid infinite 401 loops
    clearAuthToken();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("auth:token-expired"));
    }
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
