// interceptor.ts
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/services/auth.api";
import { getApiBaseUrlWithSlash } from "@/lib/config";

interface ApiOptions extends RequestInit {
  auth?: boolean;
  body?: any;
}

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

const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * --------------------------------------------------------------------------
 * GET DEDUPLICATION
 * --------------------------------------------------------------------------
 */

type CacheEntry = {
  time: number;
  data: unknown;
};

const inFlight = new Map<string, Promise<unknown>>();
const getCache = new Map<string, CacheEntry>();

// Keep this fairly short so data doesn't become stale.
const GET_CACHE_TTL = 10_000;

/**
 * --------------------------------------------------------------------------
 * REFRESH TOKEN
 * --------------------------------------------------------------------------
 *
 * IMPORTANT:
 * Only one refresh request can exist at a time.
 */
let refreshPromise: Promise<boolean> | null = null;

const hasSession = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }

  return Boolean(
    localStorage.getItem(ACCESS_TOKEN_KEY) ||
    localStorage.getItem(REFRESH_TOKEN_KEY),
  );
};

const clearSession = () => {
  if (typeof window === "undefined") {
    return;
  }

  // DON'T use localStorage.clear().
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

const runRefresh = async (baseUrl: string): Promise<boolean> => {
  // If another request is already refreshing, wait for it.
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = fetch(`${baseUrl}auth/refresh-token`, {
    method: "GET",
    credentials: "include",
  })
    .then((response) => response.ok)
    .catch(() => false)
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};

/**
 * --------------------------------------------------------------------------
 * CACHE
 * --------------------------------------------------------------------------
 */

const makeGetCacheKey = (endpoint: string, auth: boolean): string => {
  return `${auth ? "auth" : "anon"}:${endpoint}`;
};

const invalidateGetCache = () => {
  getCache.clear();
};

/**
 * --------------------------------------------------------------------------
 * REQUEST
 * --------------------------------------------------------------------------
 *
 * retries here are ONLY for 429 / temporary request failures.
 *
 * 401 is handled separately and refreshes the session AT MOST ONCE.
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
    ...(body !== undefined &&
    typeof body === "object" &&
    !(body instanceof FormData)
      ? {
          "Content-Type": "application/json",
        }
      : {}),
    ...headers,
  };

  /**
   * Always get the token immediately before making the request.
   *
   * This is important because the token may have changed after
   * a refresh request.
   */
  if (auth && typeof window !== "undefined") {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);

    if (token) {
      finalHeaders["Authorization"] = `Bearer ${token}`;
    }
  }

  const finalBody =
    body !== undefined &&
    typeof body === "object" &&
    !(body instanceof FormData)
      ? JSON.stringify(body)
      : body;

  /**
   * ---------------------------------------------------------------
   * Normal request attempts
   * ---------------------------------------------------------------
   *
   * Example with retries = 2:
   *
   * attempt 0
   * attempt 1
   * attempt 2
   *
   * BUT 401 does not use these retries.
   */
  for (let attempt = 0; attempt <= retries; attempt++) {
    let response: Response;

    try {
      response = await fetch(`${BASE_URL}${endpoint.replace(/^\/+/, "")}`, {
        method: normalizedMethod,
        headers: finalHeaders,
        body:
          normalizedMethod === "GET" || normalizedMethod === "HEAD"
            ? undefined
            : finalBody,
        ...rest,
        credentials: "include",
      });
    } catch (error) {
      console.error("[API NETWORK ERROR]", {
        endpoint,
        method: normalizedMethod,
        error,
      });

      throw new ApiError(
        `API unreachable at ${BASE_URL}${endpoint.replace(
          /^\/+/,
          "",
        )}. Is the backend running?`,
        500,
        endpoint,
      );
    }

    /**
     * -------------------------------------------------------------
     * 401
     * -------------------------------------------------------------
     *
     * NEVER use the normal retry counter for 401.
     *
     * One original request:
     *
     * GET /users -> 401
     *
     * becomes:
     *
     * GET /auth/refresh-token
     * GET /users
     *
     * at most once.
     */
    if (response.status === 401) {
      // Anonymous request: don't attempt refresh.
      if (!hasSession()) {
        throw new ApiError("Unauthorized", 401, endpoint);
      }

      /**
       * Only refresh once for this request.
       *
       * This prevents:
       *
       * request -> 401 -> refresh -> request -> 401 -> refresh...
       */
      const refreshed = await runRefresh(BASE_URL);

      if (!refreshed) {
        clearSession();

        throw new ApiError(
          "Session expired. Please login again.",
          401,
          endpoint,
        );
      }

      /**
       * Refresh succeeded.
       *
       * Retry the ORIGINAL request exactly once.
       *
       * We must update Authorization because the access token
       * may have changed.
       */
      if (auth && typeof window !== "undefined") {
        const newToken = localStorage.getItem(ACCESS_TOKEN_KEY);

        if (newToken) {
          finalHeaders["Authorization"] = `Bearer ${newToken}`;
        }
      }

      let retryResponse: Response;

      try {
        retryResponse = await fetch(
          `${BASE_URL}${endpoint.replace(/^\/+/, "")}`,
          {
            method: normalizedMethod,
            headers: finalHeaders,
            body:
              normalizedMethod === "GET" || normalizedMethod === "HEAD"
                ? undefined
                : finalBody,
            ...rest,
            credentials: "include",
          },
        );
      } catch {
        throw new ApiError(
          `API unreachable at ${BASE_URL}${endpoint.replace(
            /^\/+/,
            "",
          )}. Is the backend running?`,
          500,
          endpoint,
        );
      }

      /**
       * If the refreshed request is STILL 401,
       * do NOT refresh again.
       */
      if (retryResponse.status === 401) {
        clearSession();

        throw new ApiError(
          "Session expired. Please login again.",
          401,
          endpoint,
        );
      }

      response = retryResponse;
    }

    /**
     * -------------------------------------------------------------
     * 429
     * -------------------------------------------------------------
     *
     * Retry only 429.
     */
    if (response.status === 429) {
      if (attempt < retries) {
        await delay(1000 * (attempt + 1));
        continue;
      }

      throw new ApiError(
        "Too many requests. Please try again later.",
        429,
        endpoint,
      );
    }

    /**
     * -------------------------------------------------------------
     * Other errors
     * -------------------------------------------------------------
     */
    if (!response.ok) {
      const errorText = await response.text();

      console.error("[API ERROR]", {
        status: response.status,
        endpoint,
        method: normalizedMethod,
        error: errorText,
      });

      throw new ApiError(
        errorText || `Request to ${endpoint} failed`,
        response.status,
        endpoint,
      );
    }

    /**
     * -------------------------------------------------------------
     * Empty responses
     * -------------------------------------------------------------
     *
     * DELETE / PUT endpoints sometimes return 204.
     */
    if (response.status === 204) {
      return undefined as T;
    }

    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      return (await response.json()) as T;
    }

    /**
     * Some APIs return plain text.
     */
    const text = await response.text();

    return text as T;
  }

  throw new ApiError("Request failed after retries.", 500, endpoint);
};

/**
 * --------------------------------------------------------------------------
 * PUBLIC API
 * --------------------------------------------------------------------------
 */

export const apiFetch = async <T>(
  endpoint: string,
  options: ApiOptions = {},
  retries = 2,
): Promise<T> => {
  /**
   * Never make requests such as:
   *
   * /users/undefined
   * /users/null
   */
  if (/(^|\/)(undefined|null)(\/|$|\?)/.test(endpoint)) {
    throw new ApiError(
      `Skipped request with missing params: ${endpoint}`,
      400,
      endpoint,
    );
  }

  const method = (options.method || "GET").toUpperCase();

  /**
   * -------------------------------------------------------------
   * NON-GET
   * -------------------------------------------------------------
   *
   * POST / PUT / PATCH / DELETE aren't cached.
   */
  if (method !== "GET") {
    const result = await request<T>(endpoint, options, retries);

    /**
     * A mutation can make previously cached GET data stale.
     */
    invalidateGetCache();

    return result;
  }

  /**
   * -------------------------------------------------------------
   * GET
   * -------------------------------------------------------------
   */

  const auth = Boolean(options.auth);

  const key = makeGetCacheKey(endpoint, auth);

  /**
   * 1. Return existing in-flight request.
   *
   * This is what protects against:
   *
   * component A -> GET /users
   * component B -> GET /users
   *
   * Only ONE network request is made.
   */
  const existingRequest = inFlight.get(key);

  if (existingRequest) {
    return existingRequest as Promise<T>;
  }

  /**
   * 2. Return short-lived cache.
   */
  const cached = getCache.get(key);

  if (cached && Date.now() - cached.time < GET_CACHE_TTL) {
    return cached.data as T;
  }

  /**
   * 3. Create ONE request.
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

  /**
   * Store BEFORE returning.
   *
   * Another caller arriving while this request is running
   * receives the exact same promise.
   */
  inFlight.set(key, promise);

  return promise;
};

/**
 * Optional helper if you need to manually invalidate GET cache.
 */
export const clearApiCache = () => {
  getCache.clear();
};
