import { notFound } from "next/navigation";
import { getPageData } from "@/lib/cms";
import HeroSection from "@/components/HeroSection";
import WhyChooseUs from "@/components/WhyChooseUs";
import PopularStyles from "@/components/PopularStyles";
import Customize from "@/components/Customize";
import HowItWorks from "@/components/HowItWorks";
import Pricing from "@/components/Pricing";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";
import Breadcrumbs, { type Crumb } from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import { breadcrumbJsonLd, serviceJsonLd, titleCase } from "@/lib/seo";

export const dynamic = 'force-dynamic';

export default async function StitchingCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;

  const pageData = await getPageData({ category });

  if (!pageData) {
    notFound();
  }

  const categoryName = titleCase(category);
  const path = `/stitching/type/${category}`;

  const crumbs: Crumb[] = [
    { name: "Home", href: "/" },
    { name: "Stitching", href: "/tailoring" },
    { name: categoryName, href: path },
  ];

  return (
    <main className="flex flex-col">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <JsonLd data={serviceJsonLd({ pageData, path })} />

      {pageData.heroData && <HeroSection heroData={pageData.heroData} />}
      <WhyChooseUs />
      {pageData.popularStylesData && (
        <PopularStyles popularStylesData={pageData.popularStylesData} />
      )}
      {pageData.customizeData && (
        <Customize customizeData={pageData.customizeData} />
      )}
      <HowItWorks />
      <Pricing pricingData={pageData.pricingData} />
      <FAQ />
      <CTA />
    </main>
  );
}
