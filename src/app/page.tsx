import type { Metadata } from "next";
import Index from "@/page_components/Index";

export const metadata: Metadata = {
  title: "Doorstep Tailoring & Stitching in 48 Hours | Silaigo",
  description:
    "Get your suits, kurtis & blouses stitched and delivered in just 48 hours. Silaigo offers doorstep tailoring with free pickup and measurement in Noida, Ghaziabad & Delhi NCR.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Doorstep Tailoring & Stitching in 48 Hours | Silaigo",
    description:
      "Get your suits, kurtis & blouses stitched and delivered in just 48 hours.",
    url: "https://www.silaigo.com",
    siteName: "Silaigo",
    locale: "en_IN",
    type: "website",
  },
};

export default function Page() {
  return <Index />;
}