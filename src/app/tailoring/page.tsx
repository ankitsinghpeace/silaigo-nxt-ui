// src/app/tailoring/page.tsx
import { getAllCategories } from "@/lib/server-data";
import TailoringPage from "@/page_components/TailoringPage";

export const dynamic = 'force-dynamic';

export default async function Page() {
  let categories = null;
  
  try {
    categories = await getAllCategories();
  } catch (error) {
    console.error("Failed to fetch categories for tailoring page:", error);
  }

  return <TailoringPage categories={categories} />;
}