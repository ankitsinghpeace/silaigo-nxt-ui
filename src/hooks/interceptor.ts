// interceptor.ts

import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/services/auth.api";
import { getApiBaseUrlWithSlash } from "@/lib/config";

interface ApiOptions extends RequestInit {
  auth?: boolean;
  body?: any;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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

/**
 * ---------------------------------------------------------------------------
 * GET REQUEST DEDUPLICATION
 * ---------------------------------------------------------------------------
 *
 * Important for SSR:
 *
 * Multiple Server Components can request the same endpoint during the same
 * render. We keep the promise alive so only ONE actual HTTP request is sent.
 *
 * This is especially important for endpoints protected by rate limiting.
 * 
 * NOTE: With the new SSR-first architecture, most public content is fetched
 * through server-side functions with Next.js caching. This interceptor is now
 * primarily a safety net for client-side requests and duplicate in-flight requests.
 */
const inFlight = new Map<string, Promise<any>>();

/**
 * ---------------------------------------------------------------------------
 * GET CACHE (Reduced TTL)
 * ---------------------------------------------------------------------------
 *
 * With SSR-first architecture, we rely on Next.js server caching for public content.
 * This in-memory cache is now primarily for client-side duplicate prevention.
 * 
 * Reduced to 10 seconds since server-side caching handles the heavy lifting.
 */
const GET_CACHE_TTL = 10_000;

const getCache = new Map<
  string,
  {
    time: number;
    data: any;
  }
>();

/**
 * ---------------------------------------------------------------------------
 * 429 BACKOFF (Improved)
 * ---------------------------------------------------------------------------
 *
 * Do NOT immediately retry a 429.
 *
 * With SSR-first architecture, 429s should be rare. If they occur, respect
 * Retry-After and use exponential backoff with jitter.
 */
const getRetryDelay = (response: Response, attempt: number) => {
  const retryAfter = response.headers.get("Retry-After");

  if (retryAfter) {
    const seconds = Number(retryAfter);

    if (Number.isFinite(seconds)) {
      return Math.min(seconds * 1000, 60_000); // Max 60 seconds
    }

    const retryDate = Date.parse(retryAfter);

    if (!Number.isNaN(retryDate)) {
      return Math.min(Math.max(retryDate - Date.now(), 0), 60_000);
    }
  }

  // 2s, 4s, 8s with max 30 seconds
  const exponential = 2000 * Math.pow(2, attempt);

  // Jitter prevents thundering herd
  const jitter = Math.floor(Math.random() * 500);

  return Math.min(exponential + jitter, 30_000);
};

/**
 * ---------------------------------------------------------------------------
 * SESSION
 * ---------------------------------------------------------------------------
 */
const hasSession = () =>
  typeof window !== "undefined" &&
  (!!localStorage.getItem(ACCESS_TOKEN_KEY) ||
    !!localStorage.getItem(REFRESH_TOKEN_KEY));

/**
 * ---------------------------------------------------------------------------
 * REFRESH TOKEN
 * ---------------------------------------------------------------------------
 *
 * Only one refresh request is allowed at a time.
 */
let refreshPromise: Promise<boolean> | null = null;

const runRefresh = (baseUrl: string): Promise<boolean> => {
  if (!refreshPromise) {
    refreshPromise = fetch(`${baseUrl}auth/refresh-token`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.ok)
      .catch(() => false)
      .finally(() => {
        setTimeout(() => {
          refreshPromise = null;
        }, 0);
      });
  }

  return refreshPromise;
};

/**
 * ---------------------------------------------------------------------------
 * REQUEST
 * ---------------------------------------------------------------------------
 */
const request = async <T>(
  endpoint: string,
  options: ApiOptions,
  retries: number,
): Promise<T> => {
  const BASE_URL = getApiBaseUrlWithSlash();

  const { auth = false, headers = {}, body, method = "GET", ...rest } = options;

  const normalizedMethod = method.toUpperCase();

  const finalHeaders: HeadersInit = {
    ...(typeof body === "object" && !(body instanceof FormData) && body !== null
      ? {
          "Content-Type": "application/json",
        }
      : {}),
    ...headers,
  };

  /**
   * Authorization is intentionally only read from localStorage on the
   * browser.
   *
   * Server-side requests generally rely on cookies/session handling.
   */
  if (auth && typeof window !== "undefined") {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);

    if (token) {
      finalHeaders["Authorization"] = `Bearer ${token}`;
    }
  }

  const finalBody =
    typeof body === "object" && !(body instanceof FormData) && body !== null
      ? JSON.stringify(body)
      : body;

  for (let attempt = 0; attempt <= retries; attempt++) {
    let response: Response;

    try {
      response = await fetch(`${BASE_URL}${endpoint.replace(/^\/+/, "")}`, {
        method: normalizedMethod,
        headers: finalHeaders,
        body: ["GET", "HEAD"].includes(normalizedMethod)
          ? undefined
          : finalBody,
        ...rest,
        credentials: "include",

        /**
         * cache: "no-store" ensures this interceptor's cache is used
         * rather than browser/Next.js HTTP cache for these specific requests.
         * 
         * Server-side public content uses Next.js fetch caching in server-data.ts
         */
        cache: "no-store",
      });
    } catch {
      throw new ApiError(
        `500 Internal Server Error — API unreachable at ${BASE_URL}${endpoint.replace(
          /^\/+/,
          "",
        )}. Is the backend running?`,
        500,
        endpoint,
      );
    }

    /**
     * -----------------------------------------------------------------------
     * 401
     * -----------------------------------------------------------------------
     */
    if (response.status === 401) {
      // Anonymous visitor — do not refresh on every SSR/page request.
      if (!hasSession()) {
        throw new ApiError("Unauthorized", 401, endpoint);
      }

      if (attempt < retries) {
        const refreshed = await runRefresh(BASE_URL);

        if (refreshed) {
          continue;
        }
      }

      if (typeof window !== "undefined") {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
      }

      throw new ApiError("Session expired/Please login again", 401, endpoint);
    }

    /**
     * -----------------------------------------------------------------------
     * 429 TOO MANY REQUESTS
     * -----------------------------------------------------------------------
     *
     * With SSR-first architecture, 429s should be rare. If they occur,
     * respect Retry-After and use exponential backoff.
     */
    if (response.status === 429) {
      if (attempt < retries) {
        const waitTime = getRetryDelay(response, attempt);

        console.warn(`[API 429] ${endpoint} — retrying in ${waitTime}ms (attempt ${attempt + 1}/${retries + 1})`);

        await delay(waitTime);
        continue;
      }

      const errorText = await response.text();

      console.error("API Rate Limit exceeded:", response.status, endpoint, errorText);

      throw new ApiError(
        errorText || "Too many requests. Please try again later.",
        429,
        endpoint,
      );
    }

    /**
     * -----------------------------------------------------------------------
     * OTHER ERRORS
     * -----------------------------------------------------------------------
     */
    if (!response.ok) {
      const errorText = await response.text();

      console.error("API Error:", response.status, endpoint, errorText);

      throw new ApiError(
        errorText || `Request to ${endpoint} failed`,
        response.status,
        endpoint,
      );
    }

    /**
     * Some APIs return 204 for successful requests.
     */
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  throw new ApiError(
    "Too many requests. Please try again later.",
    429,
    endpoint,
  );
};

/**
 * ---------------------------------------------------------------------------
 * PUBLIC API FETCH
 * ---------------------------------------------------------------------------
 */
export const apiFetch = async <T>(
  endpoint: string,
  options: ApiOptions = {},
  retries = 2,
): Promise<T> => {
  /**
   * Never fire requests with missing dynamic route params.
   *
   * Prevents:
   *
   * /category/undefined/style/undefined
   */
  if (/(^|\/)(undefined|null)(\/|$|\?)/.test(endpoint)) {
    return Promise.reject(
      new Error(`Skipped request with missing params: ${endpoint}`),
    );
  }

  const method = (options.method || "GET").toUpperCase();

  /**
   * POST / PUT / PATCH / DELETE
   *
   * These are not cached or deduplicated.
   */
  if (method !== "GET") {
    return request<T>(endpoint, options, retries);
  }

  /**
   * Include relevant request options in the cache key.
   */
  const key = [
    endpoint,
    options.auth ? "auth" : "anon",
    options.credentials || "default",
  ].join("|");

  /**
   * -------------------------------------------------------------------------
   * 1. RETURN IN-FLIGHT REQUEST (Primary deduplication mechanism)
   * -------------------------------------------------------------------------
   *
   * This prevents duplicate requests for the same endpoint within the same
   * render cycle. This is the main safety net for 429 prevention.
   */
  const existing = inFlight.get(key);

  if (existing) {
    return existing as Promise<T>;
  }

  /**
   * -------------------------------------------------------------------------
   * 2. RETURN CACHE (Short-term client-side cache)
   * -------------------------------------------------------------------------
   *
   * With SSR-first architecture, this is secondary to Next.js server caching.
   * Provides short-term deduplication for client-side navigation.
   */
  const cached = getCache.get(key);

  if (cached && Date.now() - cached.time < GET_CACHE_TTL) {
    return cached.data as T;
  }

  /**
   * -------------------------------------------------------------------------
   * 3. CREATE ONE SHARED REQUEST
   * -------------------------------------------------------------------------
   */
  const promise = request<T>(endpoint, options, retries)
    .then((data) => {
      getCache.set(key, {
        time: Date.now(),
        data,
      });

      return data;
    })
    .finally(() => {
      inFlight.delete(key);
    });

  inFlight.set(key, promise);

  return promise;
};

/**
 * ---------------------------------------------------------------------------
 * CACHE HELPERS
 * ---------------------------------------------------------------------------
 *
 * These can be used to manually clear the interceptor cache if needed.
 * 
 * Note: For server-side cache invalidation, use the revalidate functions
 * in server-data.ts instead.
 */
export const clearApiCache = (endpoint?: string) => {
  if (!endpoint) {
    getCache.clear();
    return;
  }

  for (const key of getCache.keys()) {
    if (key.startsWith(`${endpoint}|`)) {
      getCache.delete(key);
    }
  }
};

export const clearApiCacheEntry = (endpoint: string) => {
  clearApiCache(endpoint);
};
