import type { Metadata } from "next";
import BlogPage from "@/page_components/BlogPage";
import { getServerBlogs } from "@/lib/api";

export const metadata: Metadata = {
  title: "Tailoring & Fashion Blog",
  description:
    "Latest fashion trends, blouse designs, kurti styling tips, and tailoring insights from Silaigo.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "Tailoring & Fashion Blog | Silaigo",
    description:
      "Latest fashion trends, blouse designs, kurti styling tips, and tailoring insights from Silaigo.",
    url: "https://www.silaigo.com/blog",
  },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const initialData = await getServerBlogs(params);

  return <BlogPage initialData={initialData} />;
}