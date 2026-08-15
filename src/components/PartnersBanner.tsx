import React from "react";
import { Partner } from "@/types/interface";
import Image from "next/image";
import { getPageSectionData } from "@/lib/server-data";

const PartnersBanner = async () => {
  let partners: Partner[] = [];

  try {
    const data = await getPageSectionData("partners");

    if (Array.isArray(data?.partners)) {
      partners = data.partners;
    }
  } catch (error) {
    console.error("Error fetching partners data:", error);
  }

  if (partners.length === 0) return null;

  const repeatedPartners = [...partners, ...partners];

  return (
    <section
      aria-labelledby="partners-heading"
      className="py-6 bg-white overflow-hidden"
    >
      <div className="text-center mb-6 sm:mb-8">
        <h2
          id="partners-heading"
          className="text-lg sm:text-xl md:text-2xl font-bold"
        >
          Our Trusted Partner&apos;s
        </h2>
      </div>

      <div className="relative overflow-hidden">
        <div className="animate-marquee-slow whitespace-nowrap py-4 sm:py-5 flex items-center gap-8 sm:gap-10 md:gap-12 px-4 w-max">
          {repeatedPartners.map((partner, index) => (
            <div
              key={`${partner.name}-${index}`}
              className="flex-shrink-0 grayscale hover:grayscale-0 transition-all duration-300"
            >
              <Image
                src={partner.logo}
                alt={partner.name}
                width={160}
                height={96}
                className="h-14 sm:h-16 md:h-20 lg:h-24 w-auto object-contain"
                loading={index < partners.length ? "eager" : "lazy"}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnersBanner;
