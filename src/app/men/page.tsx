import type { Metadata } from "next";
import MenPage from "@/page_components/MenPage";

export const metadata: Metadata = {
  title: "Men's Custom Tailoring & Stitching",
  description:
    "Custom stitching and tailoring for men's ethnic wear, kurtas, and suits at your doorstep.",
  alternates: {
    canonical: "/men",
  },
  openGraph: {
    title: "Men's Custom Tailoring & Stitching | Silaigo",
    description:
      "Custom stitching and tailoring for men's ethnic wear, kurtas, and suits at your doorstep.",
    url: "https://www.silaigo.com/men",
  },
};

export default function Page() {
  return <MenPage />;
}