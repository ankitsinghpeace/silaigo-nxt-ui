import type { Crumb } from "@/components/Breadcrumbs";
import type { IPageData } from "@/lib/cms";
import { SITE_URL as CONFIG_SITE_URL } from "@/lib/config";

export const SITE_URL = CONFIG_SITE_URL;


export const titleCase = (value: string) =>
  decodeURIComponent(value || "")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());

export function absoluteUrl(path: string) {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function breadcrumbJsonLd(items: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.href),
    })),
  };
}

export function serviceJsonLd({
  pageData,
  path,
  areaServed,
}: {
  pageData: IPageData;
  path: string;
  areaServed?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${absoluteUrl(path)}#service`,
    name: pageData.heroData?.title || pageData.title,
    serviceType: "Tailoring and stitching",
    description: pageData.description,
    url: absoluteUrl(path),
    image: pageData.ogImageUrl || undefined,
    provider: { "@id": `${SITE_URL}/#organization` },
    areaServed: areaServed ? [areaServed] : undefined,
    offers: (pageData.pricingData || []).map((plan) => ({
      "@type": "Offer",
      name: plan.plan_name,
      price: plan.plan_price,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      url: absoluteUrl(path),
    })),
  };
}

export function stitchingMetadata(
  meta: IPageData | null,
  path: string,
  fallbackTitle: string,
  fallbackDescription: string,
) {
  const title = meta?.title || fallbackTitle;
  const description = meta?.description || fallbackDescription;

  return {
    title: { absolute: title },
    description: description.slice(0, 300),
    keywords: meta?.keywords,
    alternates: { canonical: path },
    openGraph: {
      title: meta?.ogTitle || title,
      description: meta?.ogDescription || description,
      url: absoluteUrl(path),
      type: "website" as const,
      images: meta?.ogImageUrl
        ? [
            {
              url: meta.ogImageUrl,
              width: 1200,
              height: 630,
              alt: meta.ogImageAlt,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image" as const,
      title: meta?.ogTitle || title,
      description: meta?.ogDescription || description,
    },
  };
}
