import type { Metadata } from "next";
import { Suspense } from "react";
import { getPageData } from "@/lib/cms";
import { stitchingMetadata, titleCase } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ location: string }>;
}): Promise<Metadata> {
  const { location } = await params;
  const meta = await getPageData({ location });

  return stitchingMetadata(
    meta,
    `/stitching/location/${location}`,
    `Stitching Services in ${titleCase(location)} | Silaigo`,
    `Doorstep tailoring in ${titleCase(location)} — free pickup, expert measurement and 48-hour delivery on blouses, kurtis and suits.`,
  );
}

export default function StitchingLocationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Suspense fallback={null}>{children}</Suspense>;
}
