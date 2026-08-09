import { getLandingData, getRoutes as fetchRoutes } from "@/lib/api";

export interface ISlugMeta {
  title: string;
  description: string;
  /** Comma-separated keywords string from the CMS */
  keywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImageUrl: string;
  ogImageAlt: string;
}

export interface IListItem {
  value: string;
}

export interface IHeroData {
  title: string;
  imageUrl: string;
  description: string;
  trustBadges: IListItem[];
  ctaText: string;
  ctaLink: string;
}

export interface IProduct {
  name: string;
  price: number;
  image: string;
  productLink: string;
}

export interface IPopularStylesData {
  sectionHeading: string;
  sectionSubHeading: string;
  products: IProduct[];
}

export interface ICustomizeOption {
  title: string;
  items: IListItem[];
}

export interface ICustomizeData {
  sectionSubHeading: string;
  customizeOptions: ICustomizeOption[];
}

export interface IPricingData {
  plan_name: string;
  plan_descp: string;
  plan_price: string;
  plan_feature: string[];
  plan_recommended: boolean;
}

export interface IPageData extends ISlugMeta {
  slug: string;
  heroData?: IHeroData;
  popularStylesData?: IPopularStylesData;
  customizeData?: ICustomizeData;
  pricingData?: IPricingData[];
  sublocations?: string[];
}

type PageParams =
  | string
  | string[]
  | {
      location?: string;
      category?: string;
    };

/**
 * Convert different route formats into slug parts.
 *
 * Examples:
 *
 * "noida/kurti"              -> ["noida", "kurti"]
 * ["noida", "kurti"]         -> ["noida", "kurti"]
 * { location: "noida" }     -> ["location", "noida"]
 * { location: "noida",
 *   category: "kurti" }      -> ["noida", "kurti"]
 * { category: "kurti" }      -> ["type", "kurti"]
 */
function normalizeRoute(route: unknown): string[] | null {
  if (typeof route === "string") {
    return route.replace(/^\/+/, "").split("/").filter(Boolean);
  }

  if (Array.isArray(route) && route.every((item) => typeof item === "string")) {
    return route as string[];
  }

  if (route && typeof route === "object") {
    const anyRoute = route as Record<string, unknown>;

    if (
      Array.isArray(anyRoute.slug) &&
      anyRoute.slug.every((item) => typeof item === "string")
    ) {
      return anyRoute.slug as string[];
    }

    if (typeof anyRoute.slug === "string") {
      return anyRoute.slug.replace(/^\/+/, "").split("/").filter(Boolean);
    }

    const location =
      typeof anyRoute.location === "string" ? anyRoute.location : undefined;

    const category =
      typeof anyRoute.category === "string" ? anyRoute.category : undefined;

    if (location && category) {
      return [location, category];
    }

    if (location) {
      return ["location", location];
    }

    if (category) {
      return ["type", category];
    }
  }

  return null;
}

/**
 * Resolve params passed to getPageData().
 */
function resolveParams(params: PageParams): {
  location?: string;
  category?: string;
} {
  if (typeof params === "string") {
    const parts = params.replace(/^\/+/, "").split("/").filter(Boolean);

    // Handle:
    // stitching/location/noida
    if (parts[0] === "stitching" && parts[1] === "location") {
      return {
        location: parts[2],
      };
    }

    // Handle:
    // stitching/type/kurti
    if (parts[0] === "stitching" && parts[1] === "type") {
      return {
        category: parts[2],
      };
    }

    // Handle:
    // stitching/noida/kurti
    if (parts[0] === "stitching" && parts.length >= 3) {
      return {
        location: parts[1],
        category: parts[2],
      };
    }

    const [first, second] = parts;

    return second
      ? {
          location: first,
          category: second,
        }
      : {
          location: first,
        };
  }

  if (Array.isArray(params)) {
    const parts = params.filter(Boolean);

    // ["stitching", "location", "noida"]
    if (parts[0] === "stitching" && parts[1] === "location") {
      return {
        location: parts[2],
      };
    }

    // ["stitching", "type", "kurti"]
    if (parts[0] === "stitching" && parts[1] === "type") {
      return {
        category: parts[2],
      };
    }

    // ["stitching", "noida", "kurti"]
    if (parts[0] === "stitching" && parts.length >= 3) {
      return {
        location: parts[1],
        category: parts[2],
      };
    }

    if (parts.length === 2) {
      return {
        location: parts[0],
        category: parts[1],
      };
    }

    if (parts.length === 1) {
      return {
        location: parts[0],
      };
    }

    return {};
  }

  return {
    location: params.location,
    category: params.category,
  };
}

/**
 * Convert a CMS name into a URL-safe slug.
 */
function slugify(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "-").replace(/\//g, "-");
}

/**
 * Fetch and normalize landing-page data.
 */
export async function getPageData(
  params: PageParams,
): Promise<IPageData | null> {
  const { location, category } = resolveParams(params);

  if (!location && !category) {
    console.error("getPageData: no location/category", params);
    return null;
  }

  console.log("getPageData:", {
    location,
    category,
  });

  try {
    /**
     * IMPORTANT:
     *
     * getLandingData() already uses API_URL from lib/config.
     * Do NOT fetch /api/... here.
     */
    const data = await getLandingData(location, category);

    if (!data) {
      console.warn("No landing data found:", {
        location,
        category,
      });

      return null;
    }

    const locationName = data.locationName?.trim();
    const categoryName = data.categoryName?.trim();

    const slugParts: string[] = [];

    if (locationName) {
      slugParts.push(slugify(locationName));
    }

    if (categoryName) {
      slugParts.push(slugify(categoryName));
    }

    const slug = slugParts.join("/");

    const title =
      locationName && categoryName
        ? `Silaigo | ${categoryName} Stitching in ${locationName}`
        : categoryName
          ? `${categoryName} Stitching | Silaigo Premium Stitching`
          : locationName
            ? `Stitching Services in ${locationName} | Silaigo`
            : "Silaigo Premium Stitching";

    const heroTitle =
      locationName && categoryName
        ? `${categoryName} Stitching in ${locationName}`
        : categoryName
          ? `${categoryName} Stitching`
          : locationName
            ? `Stitching Services in ${locationName}`
            : "Premium Stitching Services";

    const keywords =
      locationName && categoryName
        ? `${categoryName} stitching, ${locationName} tailor, custom ${categoryName}, doorstep stitching`
        : categoryName
          ? `${categoryName} stitching, custom ${categoryName}, online ${categoryName} tailor, doorstep stitching`
          : locationName
            ? `stitching services in ${locationName}, tailor in ${locationName}, doorstep stitching ${locationName}`
            : "tailor stitching services, premium stitching";

    const ogTitle =
      locationName && categoryName
        ? `${categoryName} Stitching in ${locationName} — Silaigo`
        : categoryName
          ? `${categoryName} Stitching | Silaigo Premium Stitching`
          : locationName
            ? `Stitching Services in ${locationName} — Silaigo`
            : "Silaigo Premium Stitching";

    const longDescription =
      data.longDescription ||
      "Premium tailoring and stitching services delivered to your door.";

    const normalizedData: IPageData = {
      slug,

      title,

      description: longDescription,

      keywords,

      ogTitle,

      ogDescription:
        longDescription.length > 160
          ? `${longDescription.substring(0, 160)}...`
          : longDescription,

      ogImageUrl: data.category?.imageUrl || "",

      ogImageAlt: categoryName
        ? `${categoryName} Stitching`
        : locationName
          ? `${locationName} Stitching`
          : "Silaigo Stitching",

      heroData: {
        title: heroTitle,

        imageUrl: data.category?.imageUrl || "",

        description:
          data.longDescription ||
          "Premium stitching services designed for perfect fit and on-time delivery.",

        trustBadges: [
          {
            value: data.category?.label || "Premium Quality",
          },
          {
            value: "Free Home Pickup & Delivery",
          },
          {
            value: "48 Hour Turnaround",
          },
          {
            value: "Expert Tailors",
          },
        ],

        ctaText: "Book Your Free Measurement",

        ctaLink: "#pricing",
      },

      popularStylesData: data.mainSubcategories
        ? {
            sectionHeading: `Popular ${data.categoryName || "Stitching"} Styles`,

            sectionSubHeading: "Choose from our most loved designs",

            products: data.mainSubcategories.map((sub: any) => ({
              name: sub.name,

              price: sub.discountedPrice ?? sub.price ?? 0,

              image: sub.image,

              productLink:
                `/category/${data.category.categoryId}/style/${sub.id}/customize` +
                `?subCatId=6812ecb20458a0919d0cc551&page=1`,
            })),
          }
        : undefined,

      customizeData: data.customizeData || undefined,

      pricingData: data.pricingSubcategories
        ? data.pricingSubcategories.map((sub: any) => ({
            plan_name: sub.name,

            plan_descp: sub.description || "",

            plan_price: String(sub.discountedPrice ?? sub.price ?? 0),

            plan_feature: [
              "Custom Fit & Measurements",
              "Premium Quality Stitching",
              "Free Home Pickup & Delivery",
              "48 Hour Turnaround",
              "Expert Tailor Consultation",
            ],

            plan_recommended: false,
          }))
        : undefined,

      sublocations: data.sublocations || [],
    };

    console.log("getPageData success:", {
      location,
      category,
      slug: normalizedData.slug,
    });

    return normalizedData;
  } catch (error) {
    /**
     * DO NOT convert API/server errors into a 404.
     *
     * A real API failure is not the same thing as
     * "this page does not exist".
     */
    console.error("getPageData failed:", {
      params,
      location,
      category,
      error,
    });

    throw error;
  }
}

/**
 * Returns all slug paths from the remote API.
 *
 * Used by generateStaticParams / sitemap / directory pages.
 */
export async function getAllSlugs(): Promise<string[][]> {
  try {
    const routesData = await fetchRoutes();

    const slugs: string[][] = [];

    // /stitching/[location]/[category]
    if (routesData.locationsCategoryMappings) {
      routesData.locationsCategoryMappings.forEach((mapping: any) => {
        if (!mapping?.location || !mapping?.category) {
          return;
        }

        const location = slugify(mapping.location);
        const category = slugify(mapping.category);

        slugs.push(["stitching", location, category]);
      });
    }

    // /stitching/location/[location]
    if (routesData.locationsMappings) {
      routesData.locationsMappings.forEach((mapping: any) => {
        if (!mapping?.location) {
          return;
        }

        const location = slugify(mapping.location);

        slugs.push(["stitching", "location", location]);
      });
    }

    // /stitching/type/[category]
    if (routesData.categoriesMappings) {
      routesData.categoriesMappings.forEach((mapping: any) => {
        if (!mapping?.category) {
          return;
        }

        const category = slugify(mapping.category);

        slugs.push(["stitching", "type", category]);
      });
    }

    return slugs;
  } catch (error) {
    console.error("Error fetching routes:", error);
    return [];
  }
}

/**
 * Returns all pages with titles and slugs.
 *
 * Used for Explore / Directory pages.
 */
export async function getAllPagesData(): Promise<
  { slug: string[]; title: string }[]
> {
  try {
    const slugArrays = await getAllSlugs();

    const pages = await Promise.all(
      slugArrays.map(async (slug) => {
        const data = await getPageData(slug);

        return {
          slug,
          title: data?.title || slug[slug.length - 1],
        };
      }),
    );

    return pages;
  } catch (error) {
    console.error("getAllPagesData failed:", error);
    return [];
  }
}
