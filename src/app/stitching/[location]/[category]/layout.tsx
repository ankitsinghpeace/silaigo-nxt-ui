import type { Metadata } from "next";
import { Suspense } from "react";
import { getPageData } from "@/lib/cms";
import { stitchingMetadata, titleCase } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ location: string; category: string }>;
}): Promise<Metadata> {
  const { location, category } = await params;
  const meta = await getPageData({ location, category });

  return stitchingMetadata(
    meta,
    `/stitching/${location}/${category}`,
    `${titleCase(category)} Stitching in ${titleCase(location)} | Silaigo`,
    `Custom ${titleCase(category).toLowerCase()} stitching in ${titleCase(location)} with free doorstep pickup, expert measurement and 48-hour delivery.`,
  );
}

export default function StitchingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Suspense fallback={null}>{children}</Suspense>;
}
