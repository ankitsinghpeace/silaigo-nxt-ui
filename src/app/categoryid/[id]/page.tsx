import type { Metadata } from "next";
import CategoryById from "@/page_components/CategoryById";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: "Custom Tailoring Category",
    description:
      "Explore tailoring details and subcategories at Silaigo.",
    alternates: {
      canonical: `/categoryid/${id}`,
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CategoryById />;
}
