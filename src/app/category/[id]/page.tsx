import type { Metadata } from "next";
import CategoryPage from "@/page_components/CategoryPage";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: "Custom Tailoring & Stitching Collection",
    description:
      "Explore custom tailoring styles, blouses, kurtis, and suits for this collection at Silaigo. Doorstep measurement & 48h delivery.",
    alternates: {
      canonical: `/category/${id}`,
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CategoryPage id={id} />;
}
