"use server";

import { revalidateTag } from "next/cache";

/**
 * Server action to revalidate navbar cache.
 * Call this after admin updates navbar data.
 */
export async function revalidateNavbarCache() {
  revalidateTag("navbar");
}

/**
 * Server action to revalidate page section cache.
 * Call this after admin updates page section data.
 */
export async function revalidatePageSectionCache(sectionKey: string) {
  revalidateTag(`page-section-${sectionKey}`);
}

/**
 * Server action to revalidate categories cache.
 * Call this after admin updates category data.
 */
export async function revalidateCategoriesCache() {
  revalidateTag("categories");
}

/**
 * Server action to revalidate specific category cache.
 */
export async function revalidateCategoryCache(categoryId: number) {
  revalidateTag(`category-${categoryId}`);
}