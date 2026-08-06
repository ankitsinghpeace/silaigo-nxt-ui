import { notFound } from "next/navigation";
import { getPageData } from "@/lib/cms";
import HeroSection from "@/components/HeroSection";
import WhyChooseUs from "@/components/WhyChooseUs";
import PopularStyles from "@/components/PopularStyles";
import Customize from "@/components/Customize";
import HowItWorks from "@/components/HowItWorks";
import AreasWeServe from "@/components/AreasWeServe";
import Pricing from "@/components/Pricing";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";
import Breadcrumbs, { type Crumb } from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import { breadcrumbJsonLd, serviceJsonLd, titleCase } from "@/lib/seo";

export default async function StitchingPage({
  params,
}: {
  params: Promise<{ location: string; category: string }>;
}) {
  const { location, category } = await params;

  const pageData = await getPageData({ location, category });

  if (!pageData) {
    notFound();
  }

  const locationName = titleCase(location);
  const categoryName = titleCase(category);
  const path = `/stitching/${location}/${category}`;

  const crumbs: Crumb[] = [
    { name: "Home", href: "/" },
    { name: "Stitching", href: "/tailoring" },
    { name: locationName, href: `/stitching/location/${location}` },
    { name: categoryName, href: path },
  ];

  return (
    <main className="flex flex-col">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <JsonLd
        data={serviceJsonLd({ pageData, path, areaServed: locationName })}
      />

      {pageData.heroData && <HeroSection heroData={pageData.heroData} />}
      <Breadcrumbs items={crumbs} />
      <WhyChooseUs />
      {pageData.popularStylesData && (
        <PopularStyles popularStylesData={pageData.popularStylesData} />
      )}
      {pageData.customizeData && (
        <Customize customizeData={pageData.customizeData} />
      )}
      <HowItWorks />
      <AreasWeServe location={locationName} areas={pageData.subLocations} />
      <Pricing pricingData={pageData.pricingData} />
      <FAQ />
      <CTA />
    </main>
  );
}
