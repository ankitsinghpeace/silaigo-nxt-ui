import type { Metadata } from "next";
import { Suspense } from "react";
import { getPageData } from "@/lib/cms";
import { stitchingMetadata, titleCase } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const meta = await getPageData({ category });

  return stitchingMetadata(
    meta,
    `/stitching/type/${category}`,
    `${titleCase(category)} Stitching | Silaigo`,
    `Custom ${titleCase(category).toLowerCase()} stitching with free doorstep pickup, expert measurement and 48-hour delivery.`,
  );
}

export default function StitchingCategoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Suspense fallback={null}>{children}</Suspense>;
}
