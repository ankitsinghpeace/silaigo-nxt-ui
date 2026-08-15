import { getSubCategoryData, getAllMetaMaster } from "@/lib/server-data";
import CategoryPage from "@/page_components/CategoryPage";

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const categoryId = Number(id);

  let subCategoriesData = null;
  let metadata = null;

  try {
    [subCategoriesData, metadata] = await Promise.all([
      getSubCategoryData(categoryId),
      getAllMetaMaster(),
    ]);
  } catch (error) {
    console.error("Failed to fetch category page data:", error);
  }

  return (
    <CategoryPage 
      categoryId={categoryId}
      subCategoriesData={subCategoriesData}
      metadata={metadata}
    />
  );
}