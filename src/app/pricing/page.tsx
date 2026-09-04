import type { Metadata } from "next";
import PricingPage from "@/page_components/PricingPage";

export const metadata: Metadata = {
  title: "Stitching & Tailoring Pricing",
  description:
    "Transparent pricing for doorstep tailoring and stitching services. Kurti stitching from ₹700, blouse stitching from ₹850, suits from ₹900.",
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    title: "Stitching & Tailoring Pricing | Silaigo",
    description:
      "Transparent pricing for doorstep tailoring and stitching services. Kurti stitching from ₹700, blouse stitching from ₹850, suits from ₹900.",
    url: "https://www.silaigo.com/pricing",
  },
};

export default function Page() {
  return <PricingPage />;
}