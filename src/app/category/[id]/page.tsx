import type { Metadata } from "next";
import CategoryPage from "@/page_components/CategoryPage";
import { getServerCategoryById } from "@/lib/api";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const categoryData = await getServerCategoryById(id);
  const titleName = categoryData?.name || "Custom Tailoring";
  const desc =
    categoryData?.description ||
    `Explore ${titleName} custom stitching styles, blouses, kurtis, and suits at Silaigo. Doorstep measurement & 48h delivery.`;

  return {
    title: `${titleName} Collection`,
    description: desc,
    alternates: {
      canonical: `/category/${id}`,
    },
    openGraph: {
      title: `${titleName} Collection | Silaigo`,
      description: desc,
      url: `https://www.silaigo.com/category/${id}`,
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const initialCategoryData = await getServerCategoryById(id);
  return <CategoryPage id={id} initialCategoryData={initialCategoryData} />;
}
