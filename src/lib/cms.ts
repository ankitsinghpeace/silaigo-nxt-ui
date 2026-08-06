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
  subLocations?: string[];
}

type PageParams = string | string[] | { location?: string; category?: string };

function normalizeRoute(route: unknown): string[] | null {
  if (typeof route === "string") {
    return route.replace(/^\/+/, "").split("/").filter(Boolean);
  }

  if (Array.isArray(route) && route.every((item) => typeof item === "string")) {
    return route;
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

function resolveParams(params: PageParams): {
  location?: string;
  category?: string;
} {
  if (typeof params === "string") {
    const [first, second] = params
      .replace(/^\/+/, "")
      .split("/")
      .filter(Boolean);
    return second ? { location: first, category: second } : { location: first };
  }

  if (Array.isArray(params)) {
    if (params.length === 2) {
      return { location: params[0], category: params[1] };
    }

    if (params.length === 1) {
      return { location: params[0] };
    }

    return {};
  }

  return {
    location: params.location,
    category: params.category,
  };
}

export async function getPageData(
  params: PageParams,
): Promise<IPageData | null> {
  try {
    const { location, category } = resolveParams(params);

    if (!location && !category) {
      return null;
    }

    const data = await getLandingData(location, category);
    if (!data) return null;

    const locationName = data.locationName?.trim();
    const categoryName = data.categoryName?.trim();

    const slugParts = [];
    console.log("Generating slug for:" + locationName);
    if (locationName) {
      slugParts.push(
        locationName.toLowerCase().replace(/\s+/g, "-").replace(/\//g, "-"),
      );
    }
    if (categoryName) {
      slugParts.push(
        categoryName.toLowerCase().replace(/\s+/g, "-").replace(/\//g, "-"),
      );
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

    const normalizedData: IPageData = {
      slug,
      title,
      description:
        data.longDescription ||
        "Premium tailoring and stitching services delivered to your door.",
      keywords,
      ogTitle,
      ogDescription:
        (data.longDescription || "").substring(0, 160) +
        ((data.longDescription || "").length > 160 ? "..." : ""),
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
          { value: data.category?.label || "Premium Quality" },
          { value: "Free Home Pickup & Delivery" },
          { value: "48 Hour Turnaround" },
          { value: "Expert Tailors" },
        ],
        ctaText: "Book Your Free Measurement",
        ctaLink: "#pricing",
      },
      popularStylesData: data.mainSubcategories
        ? {
            sectionHeading: `Popular ${data.categoryName} Styles`,
            sectionSubHeading: "Choose from our most loved designs",
            products: data.mainSubcategories.map((sub: any) => ({
              name: sub.name,
              price: sub.discountedPrice || sub.price,
              image: sub.image,
              productLink: `/category/${data.categoryId}/style/${sub._id}/customize?subCatId=${sub._id}&page=1`,
            })),
          }
        : undefined,
      customizeData: data.customizeData || undefined,
      pricingData: data.pricingSubcategories
        ? data.pricingSubcategories.map((sub: any) => ({
            plan_name: sub.name,
            plan_descp: sub.description,
            plan_price: sub.discountedPrice.toString(),
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
      subLocations: data.subLocations || [],
    };

    return normalizedData;
  } catch {
    return null;
  }
}

/**
 * Returns all slug paths from the remote API.
 * Used by `generateStaticParams` so Next.js can pre-render route variants.
 */
export async function getAllSlugs(): Promise<string[][]> {
  try {
    const routesData = await fetchRoutes();
    const slugs: string[][] = [];

    // locationsCategoryMappings: stitching/[location]/[category]
    if (routesData.locationsCategoryMappings) {
      routesData.locationsCategoryMappings.forEach((mapping: any) => {
        const location = mapping.location
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/\//g, "-");
        const category = mapping.category.toLowerCase().replace(/\s+/g, "-");
        slugs.push(["stitching", location, category]);
      });
    }

    // locationsMappings: stitching/location/[location]
    if (routesData.locationsMappings) {
      routesData.locationsMappings.forEach((mapping: any) => {
        const location = mapping.location
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/\//g, "-");
        slugs.push(["stitching", "location", location]);
      });
    }

    // categoriesMappings: stitching/type/[category]
    if (routesData.categoriesMappings) {
      routesData.categoriesMappings.forEach((mapping: any) => {
        const category = mapping.category.toLowerCase().replace(/\s+/g, "-");
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
 * Used for the Explore/Directory page.
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
  } catch {
    return [];
  }
}
