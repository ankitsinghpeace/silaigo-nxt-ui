"use client";
import React, { useEffect, useState, useCallback } from "react";
import { Journey } from "@/types/interface";
import { fetchPageSectionData } from "@/services";

interface JourneySectionProps {
  onReady?: () => void;
}

const JourneySection: React.FC<JourneySectionProps> = ({ onReady }) => {
  const [journeyData, setJourneyData] = useState<Journey | null>(null);
  const [loadedCount, setLoadedCount] = useState(0);

  useEffect(() => {
    const loadJourneyData = async () => {
      try {
        const data = await fetchPageSectionData("journey", {
          isActiveKey: "steps",
        });
        setJourneyData(data);
      } catch (error) {
        console.error("Error fetching journey data:", error);
      }
    };
    loadJourneyData();
  }, []);

  // Called when each image is loaded or errored
  const handleImageLoad = useCallback(() => {
    setLoadedCount((count) => count + 1);
  }, []);

  // When all images have loaded, call onReady once
  useEffect(() => {
    if (
      journeyData &&
      journeyData.steps.length > 0 &&
      loadedCount === journeyData.steps.length
    ) {
      onReady?.();
    }
  }, [loadedCount, journeyData, onReady]);

  if (!journeyData) return null;

  return (
    <section
      id="journey"
      className="bg-secondary pt-4 pb-6 sm:pt-6 sm:pb-8 md:py-10"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold">
            {journeyData.title}
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1 sm:mt-2">
            {journeyData.subtitle}
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
          {journeyData.steps.map((step, index) => {
            const isRedirection = step.linkType === "redirection";
            const isAction = step.linkType === "action";

            const handleClick = (e: React.MouseEvent) => {
              if (isAction && step.link) {
                e.preventDefault(); // Prevent default anchor behavior
                window.open(step.link, "_blank");
              }
            };

            const Wrapper = isRedirection ? "a" : "div";
            const wrapperProps = isRedirection
              ? { href: step.link, target: "_self", rel: "noopener noreferrer" }
              : { onClick: handleClick, role: "button", tabIndex: 0 };

            return (
              <Wrapper
                key={step.title}
                {...wrapperProps}
                className="relative aspect-square rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                {/* Image */}
                <img
                  src={step.imageUrl}
                  alt={step.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  onLoad={handleImageLoad}
                  onError={handleImageLoad}
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />

                {/* Text Content */}
                <div className="absolute bottom-0 left-0 right-0 px-2 py-1 sm:px-3 sm:py-2 md:p-4 text-white">
                  <h3 className="text-[11px] sm:text-sm md:text-lg font-semibold font-playfair leading-tight truncate">
                    {step.title}
                  </h3>
                  <p className="line-clamp-2 text-sm text-white/80">
                    {step.description}
                  </p>
                </div>
              </Wrapper>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default JourneySection;
