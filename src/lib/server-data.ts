/**
 * Server-side data fetching functions with proper Next.js caching.
 * 
 * These functions are designed to be called from Server Components
 * and use Next.js fetch caching with revalidation and tags.
 */

import { getServerApiBaseUrl } from "@/lib/config";

/**
 * Fetch navbar data with server-side caching.
 * 
 * Cached for 5 minutes with a 'navbar' tag for invalidation.
 * This should be called from RootLayout or a server component.
 */
export async function getNavbarData() {
  const baseUrl = getServerApiBaseUrl();
  
  try {
    const res = await fetch(`${baseUrl}/page-sections/navbar`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: {
        revalidate: 300, // 5 minutes
        tags: ["navbar"],
      },
    });

    if (!res.ok) {
      console.error("Navbar fetch failed:", res.status, res.statusText);
      return null;
    }

    const data = await res.json();
    return data?.data?.data || null;
  } catch (error) {
    console.error("Error fetching navbar data:", error);
    return null;
  }
}

/**
 * Fetch page section data with server-side caching.
 * 
 * Used for hero, journey, fnq, partners, achievements, testimonials, videos.
 * Cached for 5 minutes with section-specific tags.
 */
export async function getPageSectionData(sectionKey: string, options: {
  isActiveKey?: string;
  isEditPage?: boolean;
} = {}) {
  const { isActiveKey = sectionKey, isEditPage = false } = options;
  const baseUrl = getServerApiBaseUrl();
  
  const params = new URLSearchParams();
  if (isActiveKey) {
    params.append("key", isActiveKey);
  }

  const url = `${baseUrl}/page-sections/${sectionKey}${
    params.toString() ? `?${params.toString()}` : ""
  }`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: {
        revalidate: 300, // 5 minutes
        tags: [`page-section-${sectionKey}`],
      },
    });

    if (!res.ok) {
      console.error(`Page section ${sectionKey} fetch failed:`, res.status);
      return null;
    }

    const componentData = await res.json();
    let section = componentData.data?.[isActiveKey];
    const rest = Object.fromEntries(
      Object.entries(componentData.data || {}).filter(([k]) => k !== isActiveKey)
    );

    if (Array.isArray(section) && !isEditPage) {
      section = section.filter((item: any) => item?.isActive === true);
    }

    return { [isActiveKey]: section, ...rest };
  } catch (error) {
    console.error(`Error fetching page section ${sectionKey}:`, error);
    return null;
  }
}

/**
 * Fetch all categories with server-side caching.
 * 
 * Cached for 10 minutes since categories change less frequently.
 */
export async function getAllCategories() {
  const baseUrl = getServerApiBaseUrl();
  
  try {
    const res = await fetch(`${baseUrl}/category`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: {
        revalidate: 600, // 10 minutes
        tags: ["categories"],
      },
    });

    if (!res.ok) {
      console.error("Categories fetch failed:", res.status);
      return null;
    }

    const data = await res.json();
    return data?.data || null;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return null;
  }
}

/**
 * Fetch subcategory data with server-side caching.
 * 
 * Cached for 5 minutes with category-specific tags.
 */
export async function getSubCategoryData(categoryId: number) {
  const baseUrl = getServerApiBaseUrl();
  
  try {
    const res = await fetch(`${baseUrl}/category/id/${categoryId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: {
        revalidate: 300, // 5 minutes
        tags: [`category-${categoryId}`],
      },
    });

    if (!res.ok) {
      console.error(`Subcategory ${categoryId} fetch failed:`, res.status);
      return null;
    }

    const data = await res.json();
    return data?.data || null;
  } catch (error) {
    console.error(`Error fetching subcategory ${categoryId}:`, error);
    return null;
  }
}

/**
 * Fetch meta master data with server-side caching.
 * 
 * Cached for 10 minutes since meta data changes infrequently.
 */
export async function getAllMetaMaster() {
  const baseUrl = getServerApiBaseUrl();
  
  try {
    const res = await fetch(`${baseUrl}/meta-master`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: {
        revalidate: 600, // 10 minutes
        tags: ["meta-master"],
      },
    });

    if (!res.ok) {
      console.error("Meta master fetch failed:", res.status);
      return null;
    }

    const data = await res.json();
    return data?.data || null;
  } catch (error) {
    console.error("Error fetching meta master:", error);
    return null;
  }
}

/**
 * NOTE: Cache revalidation functions should be implemented as Server Actions
 * in separate files, as revalidateTag can only be used in Server Actions or Route Handlers.
 * 
 * Example implementation (create a file like src/actions/revalidate.ts):
 * 
 * 'use server';
 * import { revalidateTag } from 'next/cache';
 * 
 * export async function revalidateNavbarCache() {
 *   revalidateTag('navbar');
 * }
 * 
 * Then import and use from Server Actions or admin mutation handlers.
 */