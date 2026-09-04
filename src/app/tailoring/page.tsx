import type { Metadata } from "next";
import TailoringPage from "@/page_components/TailoringPage";

export const metadata: Metadata = {
  title: "Doorstep Tailoring Services",
  description:
    "Professional doorstep tailor near you in Noida, Ghaziabad & Delhi NCR. Free measurement at home and 48-hour delivery.",
  alternates: {
    canonical: "/tailoring",
  },
  openGraph: {
    title: "Doorstep Tailoring Services | Silaigo",
    description:
      "Professional doorstep tailor near you in Noida, Ghaziabad & Delhi NCR. Free measurement at home and 48-hour delivery.",
    url: "https://www.silaigo.com/tailoring",
  },
};

export default function Page() {
  return <TailoringPage />;
}