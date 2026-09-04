import type { Metadata } from "next";
import SareesPage from "@/page_components/SareesPage";

export const metadata: Metadata = {
  title: "Ready To Wear Pre-Pleated Sarees",
  description:
    "Convert your saree into a ready-to-wear pre-pleated saree with Silaigo doorstep tailoring.",
  alternates: {
    canonical: "/sarees",
  },
  openGraph: {
    title: "Ready To Wear Pre-Pleated Sarees | Silaigo",
    description:
      "Convert your saree into a ready-to-wear pre-pleated saree with Silaigo doorstep tailoring.",
    url: "https://www.silaigo.com/sarees",
  },
};

export default function Page() {
  return <SareesPage />;
}