"use client";
import React, { useEffect, useState } from "react";
import { Partner } from "@/types/interface";
import ImagePreviewModal from "@/components/admin/ImagePreviewModal";
import { fetchPageSectionData } from "@/services";

interface PartnersBannerProps {
  onReady?: (partners: Partner[]) => void;
}

const PartnersBanner = ({ onReady }: PartnersBannerProps) => {
  const [partners, setPartners] = useState<Partner[]>([]);

  useEffect(() => {
    const loadPartners = async () => {
      try {
        const data = await fetchPageSectionData("partners");
        if (Array.isArray(data?.partners)) {
          setPartners(data.partners);
          if (onReady) {
            onReady(data.partners);
          }
        } else {
          console.error("Partners data is not an array");
        }
      } catch (error) {
        console.error("Error fetching partners data:", error);
      }
    };
    loadPartners();
  }, [onReady]);

  if (partners.length === 0) return null;

  return (
    <div className="py-6 bg-white">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold">
          Our Trusted Partner's
        </h2>
      </div>

      <div className="relative overflow-x-hidden">
        {/* Main Row */}
        <div className="animate-marquee-slow whitespace-nowrap py-4 sm:py-5 flex items-center gap-8 sm:gap-10 md:gap-12 px-4">
          {[...partners, ...partners].map((partner, index) =>
            partner ? (
              <div
                key={`${partner.name}-${index}`}
                className="flex-shrink-0 grayscale hover:grayscale-0 transition-all duration-300 relative"
              >
                <ImagePreviewModal
                  imageUrl={partner.logo}
                  altText={partner.name}
                  triggerClassName="opacity-0 hover:opacity-100 absolute top-1/2 right-1/2 transform translate-x-1/2 -translate-y-1/2"
                />
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="h-14 sm:h-16 md:h-20 lg:h-24 object-contain"
                  loading="lazy"
                />
              </div>
            ) : null,
          )}
        </div>

        {/* Duplicate Row for Loop Effect */}
        <div
          className="absolute top-0 animate-marquee-slow whitespace-nowrap py-4 sm:py-5 flex items-center gap-8 sm:gap-10 md:gap-12 px-4"
          style={{ animationDelay: "-15s" }}
        >
          {[...partners, ...partners].map((partner, index) =>
            partner ? (
              <div
                key={`${partner.name}-delay-${index}`}
                className="flex-shrink-0 grayscale hover:grayscale-0 transition-all duration-300 relative"
              >
                <ImagePreviewModal
                  imageUrl={partner.logo}
                  altText={partner.name}
                  triggerClassName="opacity-0 hover:opacity-100 absolute top-1/2 right-1/2 transform translate-x-1/2 -translate-y-1/2"
                />
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="h-14 sm:h-16 md:h-20 lg:h-24 object-contain"
                  loading="lazy"
                />
              </div>
            ) : null,
          )}
        </div>
      </div>
    </div>
  );
};

export default PartnersBanner;
