import { API_URL } from "@/lib/config";

// ✅ Fetch page data
export async function getLandingData(location?: string, category?: string) {
  let url = `${API_URL}/landing-pages/`;

  if (location && category) {
    url += `data/${location}/${category}`;
  } else if (location) {
    url += `location/${location}`;
  } else if (category) {
    url += `category/${category}`;
  }

  const res = await fetch(url, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    console.error("API error:", res.status, res.statusText);
    return null;
  }

  const json = await res.json();

  return json?.data ?? null;
}

// ✅ Fetch ALL routes (for SEO)
export async function getRoutes() {
  const url = `${API_URL}/landing-pages/routes`;

  const res = await fetch(url, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    console.error("Routes API error:", res.status, res.statusText);
    return {
      locationsCategoryMappings: [],
      locationsMappings: [],
      categoriesMappings: [],
    };
  }

  const response = await res.json();
  return (
    response.data || {
      locationsCategoryMappings: [],
      locationsMappings: [],
      categoriesMappings: [],
    }
  );
}
