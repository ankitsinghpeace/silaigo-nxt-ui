import type { Metadata } from "next";
import BlogPage from "@/page_components/BlogPage";

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

export default function Page() {
  return <BlogPage />;
}