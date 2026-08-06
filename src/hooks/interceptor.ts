// interceptor.ts
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/services/auth.api";
import { getApiBaseUrlWithSlash } from "@/lib/config";

interface ApiOptions extends RequestInit {
  auth?: boolean;
  body?: any;
}

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

/** Error carrying an HTTP-like status so callers can branch on it. */
export class ApiError extends Error {
  status: number;
  endpoint?: string;
  constructor(message: string, status: number, endpoint?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.endpoint = endpoint;
  }
}

/** In-flight GET requests, keyed by URL — prevents duplicate parallel calls. */
const inFlight = new Map<string, Promise<any>>();

/** Short-lived GET response cache (ms). */
const GET_CACHE_TTL = 10_000;
const getCache = new Map<string, { time: number; data: any }>();


/** Only one refresh-token call at a time. */
let refreshPromise: Promise<boolean> | null = null;

const hasSession = () =>
  typeof window !== "undefined" &&
  (!!localStorage.getItem(ACCESS_TOKEN_KEY) ||
    !!localStorage.getItem(REFRESH_TOKEN_KEY));

const runRefresh = (baseUrl: string): Promise<boolean> => {
  if (!refreshPromise) {
    refreshPromise = fetch(`${baseUrl}auth/refresh-token`, {
      method: "GET",
      credentials: "include",
    })
      .then((r) => r.ok)
      .catch(() => false)
      .finally(() => {
        // allow a new refresh on the next 401 cycle
        setTimeout(() => {
          refreshPromise = null;
        }, 0);
      });
  }
  return refreshPromise;
};

const request = async <T>(
  endpoint: string,
  options: ApiOptions,
  retries: number,
): Promise<T> => {
  const BASE_URL = getApiBaseUrlWithSlash();
  const { auth = false, headers = {}, body, method = "GET", ...rest } = options;

  const finalHeaders: HeadersInit = {
    ...(typeof body === "object" && !(body instanceof FormData)
      ? { "Content-Type": "application/json" }
      : {}),
    ...headers,
  };

  if (auth && typeof window !== "undefined") {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token) {
      finalHeaders["Authorization"] = `Bearer ${token}`;
    }
  }

  const finalBody =
    typeof body === "object" && !(body instanceof FormData)
      ? JSON.stringify(body)
      : body;

  for (let attempt = 0; attempt <= retries; attempt++) {
    let res: Response;
    try {
      res = await fetch(`${BASE_URL}${endpoint.replace(/^\/+/, "")}`, {
        method,
        headers: finalHeaders,
        body: ["GET", "HEAD"].includes(method.toUpperCase())
          ? undefined
          : finalBody,
        ...rest,
        credentials: "include",
      });
    } catch {
      // Backend unreachable (server down, DNS, CORS preflight blocked).
      throw new ApiError(
        `500 Internal Server Error — API unreachable at ${BASE_URL}${endpoint.replace(/^\/+/, "")}. Is the backend running?`,
        500,
        endpoint,
      );
    }

    if (res.status === 401) {
      // Anonymous visitor — no point calling refresh-token on every page load.
      if (!hasSession()) {
        throw new ApiError("Unauthorized", 401, endpoint);
      }

      const refreshed = attempt < retries && (await runRefresh(BASE_URL));
      if (refreshed) continue;

      if (typeof window !== "undefined") localStorage.clear();
      throw new ApiError("Session expired/Please login again", 401, endpoint);
    }

    if (res.status === 429 && attempt < retries) {
      await delay(1000);
      continue;
    }

    if (!res.ok) {
      const errorText = await res.text();
      console.error("API Error:", res.status, endpoint, errorText);
      throw new ApiError(
        errorText || `Request to ${endpoint} failed`,
        res.status,
        endpoint,
      );
    }

    return res.json();
  }

  throw new Error("Too many requests. Please try again later.");
};

export const apiFetch = async <T>(
  endpoint: string,
  options: ApiOptions = {},
  retries = 2,
): Promise<T> => {
  // Never fire calls built from missing route params (…/undefined/undefined).
  if (/(^|\/)(undefined|null)(\/|$|\?)/.test(endpoint)) {
    return Promise.reject(
      new Error(`Skipped request with missing params: ${endpoint}`),
    );
  }

  const method = (options.method || "GET").toUpperCase();

  if (method !== "GET") {
    return request<T>(endpoint, options, retries);
  }

  const key = `${endpoint}|${options.auth ? "auth" : "anon"}`;

  const existing = inFlight.get(key);
  if (existing) return existing as Promise<T>;

  // Short-lived cache: squashes repeated identical GETs (StrictMode double
  // effects, several components asking for the same section, remounts).
  const cached = getCache.get(key);
  if (cached && Date.now() - cached.time < GET_CACHE_TTL) {
    return cached.data as T;
  }

  const promise = request<T>(endpoint, options, retries)
    .then((data) => {
      getCache.set(key, { time: Date.now(), data });
      return data;
    })
    .finally(() => {
      inFlight.delete(key);
    });

  inFlight.set(key, promise);
  return promise;
};

