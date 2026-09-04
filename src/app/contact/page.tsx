import type { Metadata } from "next";
import ContactPage from "@/page_components/ContactPage";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Silaigo for doorstep tailoring, stitching inquiries, order updates, and measurement assistance in Delhi NCR.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact Us | Silaigo",
    description:
      "Get in touch with Silaigo for doorstep tailoring, stitching inquiries, and measurement assistance.",
    url: "https://www.silaigo.com/contact",
  },
};

export default function Page() {
  return <ContactPage />;
}