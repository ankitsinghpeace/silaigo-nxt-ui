/**
 * CategorySectionServer - Server Component that fetches category data.
 * 
 * This component fetches categories on the server with proper caching
 * and passes them to the client-side CategorySection for interactions.
 */

import { getAllCategories } from "@/lib/server-data";
import { Category } from "@/types/interface";
import CategorySectionClient from "./CategorySectionClient";

interface CategorySectionServerProps {
  onReady?: (categories: Category[]) => void;
}

export default async function CategorySectionServer({ 
  onReady 
}: CategorySectionServerProps) {
  let categories: Category[] | null = null;

  try {
    categories = await getAllCategories();
  } catch (error) {
    console.error("CategorySectionServer: Failed to fetch categories", error);
  }

  if (!categories) {
    return null;
  }

  return <CategorySectionClient categories={categories} onReady={onReady} />;
}