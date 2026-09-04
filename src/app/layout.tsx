import type { Metadata } from "next";
import { Playfair_Display, Montserrat } from "next/font/google";
import { GoogleTagManager, GoogleAnalytics } from "@next/third-parties/google";
import "./index.css";
import Providers from "./providers";

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair-display",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat-sans",
});

export { SITE_URL } from "@/lib/config";
import { SITE_URL } from "@/lib/config";


export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Tailoring At Your Doorstep in 48 Hours | Silaigo",
    template: "%s | Silaigo",
  },
  description:
    "Get your suits, kurtis & blouses stitched and delivered in just 48 hours. Silaigo offers doorstep tailoring with free pickup and measurement in Noida, Ghaziabad & Delhi NCR.",
  applicationName: "Silaigo",
  keywords: [
    "doorstep tailoring",
    "online stitching services",
    "blouse stitching",
    "kurti stitching",
    "tailor near me",
    "Silaigo",
  ],
  alternates: { canonical: "/" },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    siteName: "Silaigo",
    url: SITE_URL,
    title: "Tailoring At Your Doorstep in 48 Hours | Silaigo",
    description:
      "Get your suits, kurtis & blouses stitched and delivered in just 48 hours.",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tailoring At Your Doorstep in 48 Hours | Silaigo",
    description:
      "Doorstep tailoring with free pickup, expert measurement and 48-hour delivery.",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${SITE_URL}/#organization`,
  name: "Silaigo",
  description:
    "Doorstep tailoring and stitching services with free pickup, expert measurement and 48-hour delivery.",
  url: SITE_URL,
  telephone: "+91-8800633755",
  priceRange: "₹₹",
  areaServed: ["Noida", "Greater Noida", "Ghaziabad", "Delhi NCR"],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Noida",
    addressRegion: "Uttar Pradesh",
    addressCountry: "IN",
  },
  sameAs: ["https://wa.me/918800633755"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID || "GTM-K46KCS68";

  return (
    <html lang="en" className={`${playfair.variable} ${montserrat.variable}`}>
      {gtmId && <GoogleTagManager gtmId={gtmId} />}
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
