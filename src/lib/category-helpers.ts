/**
 * Category Slug <-> ID mapping helpers for SEO friendly URLs (e.g. /category/kurti or /kurti instead of /category/1)
 */

export const SLUG_TO_CATEGORY_ID: Record<string, number> = {
  "kurti": 1,
  "blouse": 2,
  "sleeveless-blouse": 3,
  "suits": 4,
  "suit": 4,
  "ready-to-wear-saree": 5,
  "ethnic-co-ord": 6,
  "sharara-sets": 7,
  "sharara": 7,
  "co-ords-sets": 8,
  "coords": 8,
  "co-ords": 8,
  "dresses": 9,
  "dress": 9,
  "ready-to-wear-sarees": 10,
  "lehengas": 11,
  "lehenga": 11,
  "add-ons": 12,
};

export const CATEGORY_ID_TO_SLUG: Record<number, string> = {
  1: "kurti",
  2: "blouse",
  3: "sleeveless-blouse",
  4: "suits",
  5: "ready-to-wear-saree",
  6: "ethnic-co-ord",
  7: "sharara-sets",
  8: "co-ords-sets",
  9: "dresses",
  10: "ready-to-wear-sarees",
  11: "lehengas",
  12: "add-ons",
};

/**
 * Resolves a category ID or slug string to a valid numeric category ID.
 */
export function resolveCategoryId(idOrSlug: string | number): number {
  if (typeof idOrSlug === "number") return idOrSlug;
  const num = Number(idOrSlug);
  if (!isNaN(num)) return num;

  const normalized = String(idOrSlug)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "");

  if (SLUG_TO_CATEGORY_ID[normalized]) {
    return SLUG_TO_CATEGORY_ID[normalized];
  }

  return 1; // Default fallback to Kurti
}

/**
 * Gets a clean, SEO-friendly slug for a category object or ID.
 */
export function getCategorySlug(category: any): string {
  if (!category) return "kurti";

  if (typeof category === "number" || typeof category === "string") {
    const num = Number(category);
    if (!isNaN(num) && CATEGORY_ID_TO_SLUG[num]) {
      return CATEGORY_ID_TO_SLUG[num];
    }
    const str = String(category).trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (SLUG_TO_CATEGORY_ID[str]) return str;
    return str;
  }

  if (category.id && CATEGORY_ID_TO_SLUG[Number(category.id)]) {
    return CATEGORY_ID_TO_SLUG[Number(category.id)];
  }

  if (category.name) {
    const name = category.name.trim().toLowerCase();
    if (name.includes("kurti")) return "kurti";
    if (name.includes("blouse")) return "blouse";
    if (name.includes("suit")) return "suits";
    if (name.includes("sharara")) return "sharara-sets";
    if (name.includes("co-ord") || name.includes("coord")) return "co-ords-sets";
    if (name.includes("dress")) return "dresses";
    if (name.includes("saree")) return "ready-to-wear-sarees";
    if (name.includes("lehenga")) return "lehengas";
    if (name.includes("add")) return "add-ons";
  }

  return String(category.id || "kurti");
}
