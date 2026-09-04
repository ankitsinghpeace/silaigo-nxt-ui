import { getApiBaseUrl, getServerApiBaseUrl } from "@/lib/config";

/**
 * Get the correct API base URL depending on where
 * this function is executing.
 *
 * Browser:
 *   /api
 *
 * Server:
 *   https://www.silaigo.com/api
 *
 * This allows both browser and server requests to use
 * the same Vercel rewrite.
 */
const getApiUrl = (): string => {
  if (typeof window !== "undefined") {
    return getApiBaseUrl();
  }

  return getServerApiBaseUrl();
};

/**
 * Fetch landing-page data.
 *
 * Supported:
 *
 *   getLandingData("noida", "kurti")
 *   -> /api/landing-pages/data/noida/kurti
 *
 *   getLandingData("noida")
 *   -> /api/landing-pages/location/noida
 *
 *   getLandingData(undefined, "kurti")
 *   -> /api/landing-pages/category/kurti
 */
export async function getLandingData(location?: string, category?: string) {
  let url = `${getApiUrl()}/landing-pages/`;

  if (location && category) {
    url += `data/${encodeURIComponent(location)}/${encodeURIComponent(category)}`;
  } else if (location) {
    url += `location/${encodeURIComponent(location)}`;
  } else if (category) {
    url += `category/${encodeURIComponent(category)}`;
  } else {
    console.error("getLandingData: location or category is required");

    return null;
  }

  try {
    const res = await fetch(url, {
      next: {
        revalidate: 60,
      },
    });

    if (!res.ok) {
      console.error("Landing API error:", res.status, res.statusText, url);

      return null;
    }

    const json = await res.json();

    return json?.data ?? null;
  } catch (error) {
    console.error("Landing API request failed:", {
      url,
      location,
      category,
      error,
    });

    throw error;
  }
}

/**
 * Fetch ALL landing-page routes.
 *
 * Used for:
 * - SEO
 * - sitemap
 * - generateStaticParams
 * - Explore / Directory pages
 */
export async function getRoutes() {
  const url = `${getApiUrl()}/landing-pages/routes`;

  try {
    const res = await fetch(url, {
      next: {
        revalidate: 3600,
      },
    });

    if (!res.ok) {
      console.error("Routes API error:", res.status, res.statusText, url);

      return {
        locationsCategoryMappings: [],
        locationsMappings: [],
        categoriesMappings: [],
      };
    }

    const response = await res.json();

    return (
      response?.data ?? {
        locationsCategoryMappings: [],
        locationsMappings: [],
        categoriesMappings: [],
      }
    );
  } catch (error) {
    console.error("Routes API request failed:", {
      url,
      error,
    });

    throw error;
  }
}

/**
 * Fetch all categories for server-side rendering.
 */
export async function getServerCategories() {
  const url = `${getApiUrl()}/category`;
  try {
    const res = await fetch(url, {
      next: {
        revalidate: 60,
      },
    });

    if (!res.ok) {
      console.error("Categories API error:", res.status, res.statusText, url);
      return [];
    }

    const json = await res.json();
    const data = json?.data;
    if (Array.isArray(data)) {
      return data.sort((a: any, b: any) => a.rank - b.rank);
    }
    return [];
  } catch (error) {
    console.error("Categories API request failed:", { url, error });
    return [];
  }
}

/**
 * Fetch subcategory and styles data for a category ID for server-side rendering.
 */
export async function getServerCategoryById(id: string | number) {
  const url = `${getApiUrl()}/category/id/${id}`;
  try {
    const res = await fetch(url, {
      next: {
        revalidate: 60,
      },
    });

    if (!res.ok) {
      console.error("Category details API error:", res.status, res.statusText, url);
      return null;
    }

    const json = await res.json();
    return json?.data ?? null;
  } catch (error) {
    console.error("Category details API request failed:", { url, id, error });
    return null;
  }
}
