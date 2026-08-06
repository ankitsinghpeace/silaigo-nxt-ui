import type { MetadataRoute } from "next";
import { getRoutes } from "@/lib/api";
import { SITE_URL } from "@/lib/config";


const STATIC_PATHS: { path: string; priority: number }[] = [
  { path: "/", priority: 1 },
  { path: "/tailoring", priority: 0.9 },
  { path: "/sarees", priority: 0.8 },
  { path: "/men", priority: 0.8 },
  { path: "/pricing", priority: 0.8 },
  { path: "/blog", priority: 0.7 },
  { path: "/contact", priority: 0.7 },
  { path: "/book-appointment", priority: 0.7 },
  { path: "/privacy-policy", priority: 0.3 },
  { path: "/return-refund-policy", priority: 0.3 },
  { path: "/terms-and-conditions", priority: 0.3 },
];

const slugify = (value: string) =>
  value.toLowerCase().trim().replace(/\s+/g, "-").replace(/\//g, "-");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const entries: MetadataRoute.Sitemap = STATIC_PATHS.map(
    ({ path, priority }) => ({
      url: `${SITE_URL}${path}`,
      lastModified,
      changeFrequency: "weekly",
      priority,
    }),
  );

  try {
    const routes = await getRoutes();

    (routes.locationsCategoryMappings || []).forEach((mapping: any) => {
      entries.push({
        url: `${SITE_URL}/stitching/${slugify(mapping.location)}/${slugify(mapping.category)}`,
        lastModified,
        changeFrequency: "weekly",
        priority: 0.9,
      });
    });

    (routes.locationsMappings || []).forEach((mapping: any) => {
      entries.push({
        url: `${SITE_URL}/stitching/location/${slugify(mapping.location)}`,
        lastModified,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    });

    (routes.categoriesMappings || []).forEach((mapping: any) => {
      entries.push({
        url: `${SITE_URL}/stitching/type/${slugify(mapping.category)}`,
        lastModified,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    });
  } catch (error) {
    console.error("sitemap: failed to load dynamic routes", error);
  }

  return entries;
}
