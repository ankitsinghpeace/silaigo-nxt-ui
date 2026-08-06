"use client";
import React, { useState, useEffect, useCallback } from "react";
import { fetchPageSectionData } from "@/services";
import Link from "next/link";
import { HeroSlide } from "@/types/interface";

interface HeroCarouselProps {
  onReady?: () => void;
}

const HeroCarousel: React.FC<HeroCarouselProps> = ({ onReady }) => {
  const [hero, setSlides] = useState<HeroSlide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [screenWidth, setScreenWidth] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    handleResize(); // set initial width

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Track loaded images count
  const [loadedCount, setLoadedCount] = useState(0);

  useEffect(() => {
    const loadSlides = async () => {
      try {
        const data = await fetchPageSectionData("hero");
        setSlides(data.hero || []);
      } catch (error) {
        console.error("Error fetching hero slides:", error);
      }
    };
    loadSlides();
  }, []);

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % hero.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [hero.length]);

  // When all images loaded, call onReady once
  useEffect(() => {
    if (hero.length > 0 && loadedCount === hero.length) {
      onReady?.();
    }
  }, [loadedCount, hero.length, onReady]);

  const getResponsiveImage = (slide: HeroSlide): string => {
    if (screenWidth < 768) return slide.smImage;
    if (screenWidth < 1024) return slide.mdImage;
    return slide.lgImage;
  };

  // Image load handler
  const handleImageLoad = useCallback(() => {
    setLoadedCount((count) => count + 1);
  }, []);

  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative w-full aspect-[16/8] md:aspect-[16/5] lg:aspect-[16/2.5]">
        {hero.map((slide, index) => {
          const imageUrl = getResponsiveImage(slide);

          return (
            <div
              key={slide.title || index}
              className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ${
                currentSlide === index ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              <Link
                href={slide.link || "/tailoring"}
                className="block w-full h-full"
              >
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={slide.title || `Slide ${index + 1}`}
                    className="w-full h-full object-cover"
                    onLoad={handleImageLoad}
                    onError={handleImageLoad} // count error as loaded to prevent blocking
                  />
                ) : (
                  <div className="w-full h-full bg-gray-300 flex items-center justify-center text-white font-semibold text-xl">
                    No Image Available
                  </div>
                )}
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default HeroCarousel;
