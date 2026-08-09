/**
 * Central environment configuration.
 *
 * Values come from the .env files Next.js loads automatically:
 *
 * next dev   -> .env.development
 * next build -> .env.production
 *
 * Production architecture:
 *
 *   www.silaigo.com/api/*
 *          ↓
 *       Vercel
 *          ↓
 *   api.silaigo.com/*
 *
 * IMPORTANT:
 * - API_URL is intentionally "/api" for browser requests.
 * - Server-side code must use getServerApiBaseUrl(), because
 *   Node.js fetch() cannot fetch a relative URL such as "/api/...".
 */

export const IS_DEV = process.env.NODE_ENV !== "production";

export const ENV = IS_DEV ? "development" : "production";

/**
 * Remove trailing slashes from URLs.
 */
const stripTrailingSlash = (url: string): string => url.replace(/\/+$/, "");

/**
 * Read a required environment variable.
 */
const readEnv = (name: string, value: string | undefined): string => {
  if (!value || !value.trim()) {
    const message = `[config] Missing ${name}. ` + `Add it to .env.${ENV}`;

    if (IS_DEV) {
      console.error(message);
    }

    throw new Error(message);
  }

  return stripTrailingSlash(value.trim());
};

/**
 * Public API base URL.
 *
 * Production:
 *
 *   /api
 *
 * Browser requests therefore go to:
 *
 *   https://www.silaigo.com/api/...
 *
 * Vercel rewrites those requests to:
 *
 *   https://api.silaigo.com/...
 */
export const API_URL = readEnv(
  "NEXT_PUBLIC_API_URL",
  process.env.NEXT_PUBLIC_API_URL,
);

/**
 * Public website origin.
 *
 * Production:
 *
 *   https://www.silaigo.com
 */
export const SITE_URL = readEnv(
  "NEXT_PUBLIC_SITE_URL",
  process.env.NEXT_PUBLIC_SITE_URL,
);

/**
 * Returns the API base URL for browser/client-side code.
 *
 * Example:
 *
 *   /api
 */
export const getApiBaseUrl = (): string => API_URL;

/**
 * Returns the API base URL for server-side code.
 *
 * Node.js fetch() requires an absolute URL.
 *
 * If API_URL is:
 *
 *   /api
 *
 * this returns:
 *
 *   https://www.silaigo.com/api
 *
 * Therefore server-side requests still go through
 * the exact same Vercel rewrite.
 */
export const getServerApiBaseUrl = (): string => {
  if (/^https?:\/\//i.test(API_URL)) {
    return API_URL;
  }

  return `${SITE_URL}${API_URL}`;
};

/**
 * API base URL with a trailing slash.
 */
export const getApiBaseUrlWithSlash = (): string => `${API_URL}/`;

/**
 * Server API base URL with a trailing slash.
 */
export const getServerApiBaseUrlWithSlash = (): string =>
  `${getServerApiBaseUrl()}/`;
