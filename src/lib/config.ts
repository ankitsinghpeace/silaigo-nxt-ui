/**
 * Central environment configuration.
 *
 * Values come from the .env files Next.js loads automatically:
 *   `next dev`   -> .env.development  (API http://localhost:3001/api)
 *   `next build` -> .env.production   (API https://www.silaigo.com/api)
 *
 * Nothing is hardcoded here: change the URLs in the .env files only.
 */

export const IS_DEV = process.env.NODE_ENV !== "production";
export const ENV = IS_DEV ? "development" : "production";

const stripTrailingSlash = (url: string) => url.replace(/\/+$/, "");

/**
 * Reads a required public env var. Missing values fail loudly in development
 * so misconfiguration is caught immediately instead of at request time.
 */
const readEnv = (name: string, value: string | undefined): string => {
  if (!value || !value.trim()) {
    const message = `[config] Missing ${name}. Add it to .env.${ENV}`;
    if (IS_DEV) console.error(message);
    throw new Error(message);
  }
  return stripTrailingSlash(value.trim());
};

/** Absolute API origin — used on both server and client. */
export const API_URL = readEnv(
  "NEXT_PUBLIC_API_URL",
  process.env.NEXT_PUBLIC_API_URL,
);

/** Public site origin (canonicals, sitemap, OG tags). */
export const SITE_URL = readEnv(
  "NEXT_PUBLIC_SITE_URL",
  process.env.NEXT_PUBLIC_SITE_URL,
);

export const getApiBaseUrl = (): string => API_URL;

/** API base guaranteed to end with a single trailing slash. */
export const getApiBaseUrlWithSlash = (): string => `${API_URL}/`;
